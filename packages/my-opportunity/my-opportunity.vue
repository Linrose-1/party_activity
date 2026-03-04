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
						<view class="avatar-wrap">
							<image
								:src="post.isEnterprise === 1 ? (post.enterpriseInfo?.logoUrl || defaultAvatar) : post.memberUser.avatar"
								mode="aspectFill" class="avatar" />
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

				<!-- 猎伙类型 + 紧急程度标签行（仅猎伙商机展示） -->
				<view v-if="post.postType == 1 || post.postType === '1'" class="liehuo-meta-row">
					<view v-if="post.urgentLevel" class="urgency-mini" :class="{
							'urgency-normal': post.urgentLevel == 1,
							'urgency-urgent': post.urgentLevel == 2,
							'urgency-super':  post.urgentLevel == 3
						}">{{ urgentText(post.urgentLevel) }}</view>

					<template v-if="post.partnerTypes">
						<view v-for="(typeVal, idx) in post.partnerTypes.split(',').filter(v => v).slice(0, 2)"
							:key="idx" class="partner-mini">{{ partnerTypeMap[typeVal] || typeVal }}</view>
					</template>

					<!-- 感兴趣人数气泡 -->
					<view v-if="post.interestCount > 0" class="interest-bubble">
						🤝 {{ post.interestCount }} 人感兴趣
					</view>
				</view>

				<!-- 帖子标题与文字内容 -->
				<view class="post-title" v-if="post.postTitle">{{ post.postTitle }}</view>
				<view class="post-content">{{ post.postContent }}</view>

				<!-- 媒体展示区 -->
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
					<!-- 【猎伙专属】感兴趣商友入口 -->
					<button v-if="post.postType == 1 || post.postType === '1'" class="action-btn interest-btn"
						@click.stop="goToInterests(post.id)">
						<uni-icons type="person-filled" size="16" color="#1890FF"></uni-icons>
						感兴趣商友
						<text v-if="post.interestCount > 0" class="interest-count-badge">{{ post.interestCount }}</text>
					</button>

					<!-- 编辑 -->
					<button class="action-btn edit-btn" @click.stop="handleEdit(post.id)">
						<uni-icons type="compose" size="16" color="#FF6B00"></uni-icons>
						编辑
					</button>
					<!-- 申诉 -->
					<button class="action-btn appeal-btn" :class="{ 'disabled': post.status !== 'hidden' }"
						:disabled="post.status !== 'hidden'" @click.stop="openAppealModal(post)">
						<uni-icons type="chat-filled" size="16"
							:color="post.status === 'hidden' ? '#3498db' : '#ccc'"></uni-icons>
						申诉
					</button>
					<!-- 删除 -->
					<button class="action-btn delete-btn" @click.stop="deleteOpportunity(post.id)">
						<uni-icons type="trash" size="16" color="#e74c3c"></uni-icons>
						删除
					</button>
				</view>
			</view>

			<uni-load-more v-if="postList.length > 0" :status="loadStatus"></uni-load-more>

			<view v-if="postList.length === 0 && loadStatus === 'noMore'" class="empty-state-container">
				<uni-icons type="paperplane-filled" size="60" color="#e0e0e0"></uni-icons>
				<text class="empty-text">暂时没有符合条件的记录</text>
				<text class="empty-subtext">您可以尝试切换筛选条件或发布新商机</text>
				<button class="publish-button" @click="goToPublishPage">立即发布</button>
			</view>
		</view>

		<!-- 申诉弹窗 -->
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
	// 1. 响应式变量
	// ==========================================
	const postList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more');

	const currentTab = ref(0);
	const tabs = ref(['普通商机', '创业猎伙']);
	const isEnterpriseFilter = ref(0);

	const appealPopup = ref(null);
	const currentAppealPost = ref(null);
	const defaultAvatar = '/static/icon/default-avatar.png';

	// 猎伙类型映射
	const partnerTypeMap = {
		'1': '求贤',
		'2': '找合伙人',
		'3': '寻资源',
		'4': '其他',
	};

	// 紧急程度文字
	const urgentText = (level) => {
		const map = {
			1: '普通',
			2: '紧急',
			3: '特急'
		};
		return map[level] || '';
	};

	// ==========================================
	// 2. 生命周期
	// ==========================================
	onShow(() => {
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
			postType: currentTab.value,
			isEnterprise: isEnterpriseFilter.value
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
				const mappedList = data.list.map(item => ({
					...item,
					video: item.postVideo || '',
					images: item.postImg ? String(item.postImg).split(',').filter(s => s && s.trim()) :
						[]
				}));

				postList.value = isRefresh ? mappedList : [...postList.value, ...mappedList];
				total.value = data.total || 0;

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

	const switchTab = (e) => {
		currentTab.value = e.currentIndex;
		fetchMyOpportunities(true);
	};

	const switchIdentity = (val) => {
		isEnterpriseFilter.value = val;
		fetchMyOpportunities(true);
	};

	const handleEdit = (id) => {
		uni.navigateTo({
			url: `/packages/home-opportunitiesPublish/home-opportunitiesPublish?id=${id}`
		});
	};

	/**
	 * 【新增】跳转到猎伙互动信息页
	 * @param {number|string} id - 商机 ID
	 */
	const goToInterests = (id) => {
		uni.navigateTo({
			url: `/packages/liehuo-interests/liehuo-interests?id=${id}`
		});
	};

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

	const openAppealModal = (post) => {
		currentAppealPost.value = post;
		appealPopup.value.open();
	};

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
	// 4. 工具函数
	// ==========================================

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

	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const date = new Date(ts);
		return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	};

	const previewImage = (urls, current) => {
		uni.previewImage({
			urls,
			current: urls[current]
		});
	};

	const skipCommercialDetail = (id) => {
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
		});
	};

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

	/* 1. 筛选栏 */
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

	/* 2. 帖子卡片 */
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

	/* 状态标签 */
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

	/* ===== 猎伙元信息标签行 ===== */
	.liehuo-meta-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10rpx;
		margin-bottom: 16rpx;
	}

	/* 紧急程度小标签 */
	.urgency-mini {
		font-size: 20rpx;
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
		font-weight: bold;
	}

	.urgency-normal {
		background: #f5f5f5;
		color: #888;
	}

	.urgency-urgent {
		background: #FF8C00;
		color: #fff;
	}

	.urgency-super {
		background: #FF3B30;
		color: #fff;
	}

	/* 猎伙类型小标签 */
	.partner-mini {
		font-size: 20rpx;
		color: #1890FF;
		background: #E6F7FF;
		border: 1rpx solid rgba(24, 144, 255, 0.3);
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
	}

	/* 感兴趣人数气泡 */
	.interest-bubble {
		font-size: 20rpx;
		color: #52c41a;
		background: #f6ffed;
		border: 1rpx solid #b7eb8f;
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
		margin-left: auto;
		/* 靠右 */
	}

	/* 帖子内容 */
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

	/* 3. 媒体 */
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
		align-items: center;
		flex-wrap: wrap;
		gap: 16rpx;
		border-top: 1rpx solid #F8F8F8;
		padding-top: 24rpx;

		.action-btn {
			display: flex;
			align-items: center;
			gap: 6rpx;
			padding: 12rpx 24rpx;
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

		/* 感兴趣商友按钮 */
		.interest-btn {
			background: #EAF4FF;
			color: #1890FF;
			border: 1rpx solid rgba(24, 144, 255, 0.25);
			margin-right: auto;
			/* 靠左，与编辑/删除分开 */
		}

		.interest-btn:active {
			background: #d6eaff;
		}

		/* 红点数字徽章 */
		.interest-count-badge {
			background: #ff4d4f;
			color: #fff;
			font-size: 18rpx;
			min-width: 28rpx;
			height: 28rpx;
			border-radius: 14rpx;
			text-align: center;
			line-height: 28rpx;
			padding: 0 6rpx;
			margin-left: 4rpx;
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