<template>
	<view class="my-opportunities-app">
		<!-- 1. 顶部一级筛选：商机类型切换 -->
		<view class="segmented-wrapper">
			<uni-segmented-control :current="currentTab" :values="tabs" @clickItem="switchTab" style-type="button"
				active-color="#FF6B00" />
		</view>

		<!-- 2. 二级筛选：发布身份切换 (个人/企业) -->
		<view class="identity-filter-bar">
			<view class="filter-chip" :class="{ active: isEnterpriseFilter === 0 }" @click="switchIdentity(0)">个人发布
			</view>
			<view class="filter-chip" :class="{ active: isEnterpriseFilter === 1 }" @click="switchIdentity(1)">企业/品牌
			</view>
		</view>

		<!-- 3. 帖子列表区 -->
		<view class="post-list">
			<view v-for="post in postList" :key="post.id" class="post-card" @click="skipCommercialDetail(post.id)">
				<!-- 卡片头部：用户信息与状态 -->
				<view class="post-header">
					<view class="user-info">
						<!-- 头像分流：企业Logo 或 个人头像 -->
						<view class="avatar-wrap">
							<image
								:src="post.isEnterprise === 1 ? (post.enterpriseInfo?.logoUrl || defaultAvatar) : post.memberUser.avatar"
								mode="aspectFill" class="avatar" />
							<!-- 企业蓝V标识 -->
							<image v-if="post.isEnterprise === 1" src="/static/icon/企业认证.png" class="blue-v-tag" />
						</view>

						<view class="user-details-wrapper">
							<view class="name-row">
								<text
									class="user-name">{{ post.isEnterprise === 1 ? post.enterpriseInfo?.enterpriseName : post.memberUser.nickname }}</text>
							</view>
							<view class="post-time">
								<uni-icons type="calendar" size="12" color="#BBB"></uni-icons>
								<text>{{ formatTimestamp(post.createTime) }}</text>
							</view>
						</view>
					</view>

					<!-- 动态状态标签 -->
					<view class="status-tag" :class="getStatusInfo(post).class">
						{{ getStatusInfo(post).text }}
					</view>
				</view>

				<!-- 帖子标题与文字内容 -->
				<view class="post-title" v-if="post.postTitle">{{ post.postTitle }}</view>
				<view class="post-content">{{ post.postContent }}</view>

				<!-- 媒体展示区：视频优先，图片次之 -->
				<view v-if="post.video" class="post-video-container">
					<video :id="'video-' + post.id" :src="post.video" class="post-video" :show-center-play-btn="true"
						@click.stop object-fit="cover"></video>
				</view>

				<view v-else-if="post.images && post.images.length > 0"
					:class="['post-images', 'images-count-' + post.images.length]">
					<view v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-wrapper">
						<image :src="image" class="post-image" mode="aspectFill"
							@click.stop="previewImage(post.images, imgIndex)" />
					</view>
				</view>

				<!-- 底部操作按钮区域 -->
				<view class="card-actions">
					<!-- 编辑功能：跳转回发布页 -->
					<button class="action-btn edit-btn" @click.stop="handleEdit(post.id)">
						<uni-icons type="compose" size="16" color="#FF6B00"></uni-icons>
						编辑
					</button>
					<!-- 申诉功能：仅在 hidden 状态开启 -->
					<button class="action-btn appeal-btn" :class="{ 'disabled': post.status !== 'hidden' }"
						:disabled="post.status !== 'hidden'" @click.stop="openAppealModal(post)">
						<uni-icons type="chat-filled" size="16"
							:color="post.status === 'hidden' ? '#3498db' : '#ccc'"></uni-icons>
						申诉
					</button>
					<!-- 删除功能：带二次确认 -->
					<button class="action-btn delete-btn" @click.stop="deleteOpportunity(post.id)">
						<uni-icons type="trash" size="16" color="#e74c3c"></uni-icons>
						删除
					</button>
				</view>
			</view>

			<!-- 加载状态提示 -->
			<uni-load-more v-if="postList.length > 0" :status="loadStatus"></uni-load-more>

			<!-- 列表为空时的空状态引导 -->
			<view v-if="postList.length === 0 && loadStatus === 'noMore'" class="empty-state-container">
				<uni-icons type="paperplane-filled" size="60" color="#e0e0e0"></uni-icons>
				<text class="empty-text">暂时没有符合条件的记录</text>
				<text class="empty-subtext">您可以尝试切换筛选条件或发布新商机</text>
				<button class="publish-button" @click="goToPublishPage">立即发布</button>
			</view>
		</view>

		<!-- 申诉内容输入弹窗 -->
		<uni-popup ref="appealPopup" type="dialog">
			<uni-popup-dialog mode="input" title="提交申诉" placeholder="请输入申诉详细理由..."
				@confirm="confirmAppeal"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onShow,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// ==========================================
	// 1. 响应式变量定义
	// ==========================================
	const postList = ref([]); // 帖子列表数据
	const pageNo = ref(1); // 当前页码
	const pageSize = ref(10); // 每页条数
	const total = ref(0); // 总数
	const loadStatus = ref('more'); // 加载状态: more | loading | noMore

	const currentTab = ref(0); // 0: 普通商机, 1: 创业猎伙
	const tabs = ref(['普通商机', '创业猎伙']);
	const isEnterpriseFilter = ref(0); // 0: 个人发布, 1: 企业发布筛选

	const appealPopup = ref(null); // 申诉弹窗引用
	const currentAppealPost = ref(null); // 正在处理的申诉对象
	const defaultAvatar = '/static/icon/default-avatar.png';

	// ==========================================
	// 2. 页面生命周期
	// ==========================================
	onShow(() => {
		// 每次回到页面时执行刷新，保证编辑/发布后的数据同步
		fetchMyOpportunities(true);
	});

	onPullDownRefresh(() => {
		fetchMyOpportunities(true);
	});

	onReachBottom(() => {
		if (loadStatus.value === 'more') fetchMyOpportunities(false);
	});

	// ==========================================
	// 3. 核心业务方法
	// ==========================================

	/**
	 * [方法] 获取我的商机分页列表
	 * @param {Boolean} isRefresh - 是否为下拉刷新操作
	 */
	const fetchMyOpportunities = async (isRefresh = false) => {
		if (loadStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			pageNo.value = 1;
			loadStatus.value = 'more';
		}

		loadStatus.value = 'loading';

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize.value,
			postType: currentTab.value, // 一级筛选：0-普通, 1-猎伙
			isEnterprise: isEnterpriseFilter.value // 二级筛选：0-个人, 1-企业
		};

		try {
			const {
				data,
				error
			} = await request('/app-api/member/business-opportunities/my-list', {
				method: 'GET',
				data: params
			});

			if (isRefresh) uni.stopPullDownRefresh();

			if (error) {
				loadStatus.value = 'more';
				return;
			}

			if (data && data.list) {
				// 数据加工：处理图片和视频字段
				const mappedList = data.list.map(item => ({
					...item,
					video: item.postVideo || '',
					images: item.postImg ? String(item.postImg).split(',').filter(s => s && s.trim()) :
						[]
				}));

				postList.value = isRefresh ? mappedList : [...postList.value, ...mappedList];
				total.value = data.total || 0;

				// 更新分页状态
				if (postList.value.length >= total.value) {
					loadStatus.value = 'noMore';
				} else {
					loadStatus.value = 'more';
					pageNo.value++;
				}
			} else {
				if (isRefresh) postList.value = [];
				loadStatus.value = 'noMore';
			}
		} catch (e) {
			loadStatus.value = 'more';
			console.error('数据加载异常:', e);
		}
	};

	/**
	 * [方法] 切换一级 Tab (商机分类)
	 */
	const switchTab = (e) => {
		currentTab.value = e.currentIndex;
		fetchMyOpportunities(true);
	};

	/**
	 * [方法] 切换二级筛选 (身份类型)
	 */
	const switchIdentity = (val) => {
		isEnterpriseFilter.value = val;
		fetchMyOpportunities(true);
	};

	/**
	 * [方法] 跳转编辑：携带商机 ID 跳转到发布页面
	 */
	const handleEdit = (id) => {
		uni.navigateTo({
			url: `/packages/home-opportunitiesPublish/home-opportunitiesPublish?id=${id}`
		});
	};

	/**
	 * [方法] 删除商机：包含二次确认逻辑
	 */
	const deleteOpportunity = (id) => {
		uni.showModal({
			title: '确认删除',
			content: '删除后该商机将从所有商圈中移除，确定吗？',
			confirmColor: '#e74c3c',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '正在删除...'
					});
					const {
						error
					} = await request('/app-api/member/business-opportunities/delete', {
						method: 'POST',
						data: {
							id
						}
					});
					uni.hideLoading();
					if (!error) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						fetchMyOpportunities(true);
					}
				}
			}
		});
	};

	/**
	 * [方法] 申诉操作：打开弹窗
	 */
	const openAppealModal = (post) => {
		currentAppealPost.value = post;
		appealPopup.value.open();
	};

	/**
	 * [方法] 提交申诉：调用申诉接口
	 */
	const confirmAppeal = async (content) => {
		if (!content || !content.trim()) return uni.showToast({
			title: '请输入申诉内容',
			icon: 'none'
		});

		uni.showLoading({
			title: '正在提交...'
		});
		const {
			error
		} = await request('/app-api/member/business-opportunities/appeal', {
			method: 'POST',
			data: {
				id: currentAppealPost.value.id,
				appealContent: content
			}
		});
		uni.hideLoading();

		if (!error) {
			uni.showToast({
				title: '申诉已提交'
			});
			appealPopup.value.close();
			fetchMyOpportunities(true);
		}
	};

	// ==========================================
	// 4. 辅助工具函数
	// ==========================================

	/**
	 * [工具] 状态码转换：返回对应的文字和 CSS 类名
	 */
	const getStatusInfo = (post) => {
		const statusMap = {
			'active': {
				text: '展示中',
				class: 'status-active'
			},
			'reactive': {
				text: '已恢复',
				class: 'status-active'
			},
			'hidden': {
				text: '待申诉',
				class: 'status-hidden'
			},
			'reject': {
				text: '申诉失败',
				class: 'status-rejected'
			},
			'completed': {
				text: '已完成',
				class: 'status-completed'
			},
			'closed': {
				text: '已关闭',
				class: 'status-closed'
			}
		};
		return statusMap[post.status] || {
			text: '处理中',
			class: 'status-unknown'
		};
	};

	/**
	 * [工具] 时间戳格式化
	 */
	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const date = new Date(ts);
		return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	};

	/**
	 * [工具] 图片预览
	 */
	const previewImage = (urls, current) => {
		uni.previewImage({
			urls,
			current: urls[current]
		});
	};

	/**
	 * [跳转] 前往详情
	 */
	const skipCommercialDetail = (id) => {
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
		});
	};

	/**
	 * [跳转] 前往发布页
	 */
	const goToPublishPage = () => {
		uni.navigateTo({
			url: '/packages/home-opportunitiesPublish/home-opportunitiesPublish'
		});
	};
</script>

<style scoped lang="scss">
	$theme-color: #FF6B00;

	.my-opportunities-app {
		background-color: #F8F9FA;
		min-height: 100vh;
	}

	/* 1. 筛选栏样式 */
	.segmented-wrapper {
		background-color: #fff;
		padding: 20rpx 40rpx;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.identity-filter-bar {
		display: flex;
		gap: 20rpx;
		padding: 20rpx 40rpx;
		background: #fff;
		border-bottom: 1rpx solid #F0F0F0;

		.filter-chip {
			font-size: 24rpx;
			color: #666;
			background: #F2F2F2;
			padding: 10rpx 32rpx;
			border-radius: 30rpx;

			&.active {
				background: #FFF5EE;
				color: $theme-color;
				border: 1rpx solid $theme-color;
				font-weight: bold;
			}
		}
	}

	/* 2. 帖子卡片布局 */
	.post-list {
		padding-top: 20rpx;
	}

	.post-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 32rpx;
		margin: 0 24rpx 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.post-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;

		.user-info {
			display: flex;
			align-items: center;
			gap: 20rpx;
		}

		.avatar-wrap {
			position: relative;
			width: 90rpx;
			height: 90rpx;

			.avatar {
				width: 100%;
				height: 100%;
				border-radius: 12rpx;
				background: #f0f0f0;
			}

			.blue-v-tag {
				position: absolute;
				bottom: -4rpx;
				right: -4rpx;
				width: 32rpx;
				height: 32rpx;
				border: 3rpx solid #fff;
				border-radius: 50%;
			}
		}

		.user-name {
			font-weight: bold;
			font-size: 28rpx;
			color: #333;
		}

		.post-time {
			font-size: 22rpx;
			color: #BBB;
			margin-top: 4rpx;
		}
	}

	/* 状态标签样式 */
	.status-tag {
		font-size: 20rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		font-weight: bold;
	}

	.status-active {
		background: #EFFFF4;
		color: #52c41a;
	}

	.status-hidden {
		background: #FFF9E6;
		color: #faad14;
	}

	.status-rejected {
		background: #FFF1F0;
		color: #f5222d;
	}

	.status-closed {
		background: #f5f5f5;
		color: #999;
	}

	.post-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
		color: #333;
	}

	.post-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 20rpx;
	}

	/* 3. 媒体展示样式 */
	.post-images {
		display: grid;
		gap: 8rpx;
		margin-bottom: 20rpx;
	}

	.images-count-1 {
		grid-template-columns: 1fr;

		.image-wrapper {
			aspect-ratio: 16/9;
		}
	}

	.images-count-2,
	.images-count-4 {
		grid-template-columns: repeat(2, 1fr);
	}

	.post-images:not(.images-count-1):not(.images-count-2):not(.images-count-4) {
		grid-template-columns: repeat(3, 1fr);
	}

	.image-wrapper {
		width: 100%;
		aspect-ratio: 1/1;
		border-radius: 12rpx;
		overflow: hidden;

		.post-image {
			width: 100%;
			height: 100%;
		}
	}

	.post-video-container {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: 12rpx;
		overflow: hidden;
		background: #000;
		margin-bottom: 20rpx;

		.post-video {
			width: 100%;
			height: 100%;
		}
	}

	/* 4. 操作按钮区 */
	.card-actions {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		border-top: 1rpx solid #F8F8F8;
		padding-top: 24rpx;

		.action-btn {
			display: flex;
			align-items: center;
			padding: 12rpx 28rpx;
			font-size: 24rpx;
			border-radius: 40rpx;
			background: #F5F5F5;
			color: #444;
			margin: 0;
			line-height: 1;

			&::after {
				border: none;
			}
		}

		.edit-btn {
			background: #FFF5EE;
			color: $theme-color;
		}

		.delete-btn {
			color: #e74c3c;
		}

		.appeal-btn.disabled {
			opacity: 0.4;
		}
	}

	/* 5. 空状态 */
	.empty-state-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 120rpx 60rpx;

		.empty-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-top: 30rpx;
		}

		.empty-subtext {
			font-size: 26rpx;
			color: #999;
			margin: 16rpx 0 60rpx;
			text-align: center;
		}

		.publish-button {
			background: linear-gradient(135deg, #FF9546, $theme-color);
			color: #fff;
			padding: 24rpx 100rpx;
			border-radius: 50rpx;
			font-weight: bold;
			box-shadow: 0 8rpx 20rpx rgba(255, 107, 0, 0.2);

			&::after {
				border: none;
			}
		}
	}
</style>