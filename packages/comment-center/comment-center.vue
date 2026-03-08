<template>
	<view class="container">
		<!-- 1. 渐变头部统计 -->
		<view class="page-header">
			<view class="header-content">
				<view class="header-title">
					<text class="title-text">评论中心</text>
					<text class="title-subtitle">{{ actionTab === 'received' ? '谁在关注您的动态' : '回顾您的精彩互动' }}</text>
				</view>
				<view class="header-stats">
					<view class="stat-item">
						<text class="stat-number">{{ total }}</text>
						<text class="stat-label">条记录</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 2. 二级筛选 Tab 区域 -->
		<view class="filter-sticky-section">
			<!-- 第一层：收/发切换 -->
			<view class="action-tabs">
				<view class="action-tab" :class="{ active: actionTab === 'received' }"
					@click="switchAction('received')">
					收到的评论
					<view class="tab-line"></view>
				</view>
				<view class="action-tab" :class="{ active: actionTab === 'sent' }" @click="switchAction('sent')">
					我发出的
					<view class="tab-line"></view>
				</view>
			</view>

			<!-- 第二层：业务类型切换 (商机/聚会/聚店) -->
			<view class="business-tabs">
				<view v-for="tab in businessTabs" :key="tab.value" class="biz-tab"
					:class="{ active: targetType === tab.value }" @click="switchBusiness(tab.value)">
					{{ tab.label }}
				</view>
			</view>
		</view>

		<!-- 3. 评论列表 -->
		<view class="list-container">
			<view class="comment-card" v-for="item in commentList" :key="item.id">
				<!-- 卡片头部：用户信息 -->
				<view class="card-header">
					<view class="user-info-left">
						<image :src="item.memberUserBaseVO?.avatar || '/static/images/default-avatar.png'"
							class="avatar" mode="aspectFill" />
						<view class="user-detail">
							<view class="name-row">
								<text
									class="name">{{ item.anonymous === 1 ? '匿名商友' : (item.memberUserBaseVO?.nickname || '商友') }}</text>
								<view class="owner-badge" v-if="item.owner === 1">本人</view>
							</view>
							<view class="meta-row">
								<text class="time">{{ formatTime(item.createTime) }}</text>
								<view class="unread-dot" v-if="actionTab === 'received' && item.isRead === 0"></view>
							</view>
						</view>
					</view>
				</view>

				<!-- 评论内容 -->
				<view class="card-content">
					<text>{{ item.content }}</text>
				</view>
				
				<!-- 评论图片展示 -->
				<view v-if="item.imageUrls && item.imageUrls.length > 0" class="comment-images">
					<view v-for="(img, imgIndex) in item.imageUrls" :key="imgIndex" class="comment-image-item" @click="previewImage(item.imageUrls, imgIndex)">
						<image :src="img" mode="aspectFill" class="comment-image"></image>
					</view>
				</view>

				<!-- 动态被评论对象（商机/聚会/聚店） -->
				<view class="target-section" @click="goToTarget(item)">
					<view class="target-icon">
						<uni-icons :type="getBizConfig().icon" size="18" :color="getBizConfig().color"></uni-icons>
					</view>
					<view class="target-content">
						<view class="target-label">
							{{ actionTab === 'received' ? '评论了我的' : '我评论了' }}{{ getBizConfig().label }}
						</view>
						<view class="target-title">{{ getTargetTitle(item) }}</view>
					</view>
					<uni-icons type="right" size="12" color="#ccc"></uni-icons>
				</view>

				<!-- 子评论 (如果是收到的，展示回复流) -->
				<view class="children-section" v-if="item.childrenList && item.childrenList.length > 0">
					<view class="child-item" v-for="child in item.childrenList.slice(0, 1)" :key="child.id">
						<text class="child-name">{{ child.memberUserBaseVO?.nickname || '商友' }}</text>
						<text class="child-text">: {{ child.content }}</text>
					</view>
					<view class="more-replies" v-if="item.childrenList.length > 1">
						共{{ item.childrenList.length }}条回复...
					</view>
				</view>

				<!-- 快捷动作 -->
				<view class="card-actions" v-if="actionTab === 'received'">
					<view class="reply-btn" @click="goToTarget(item)">
						<text>回复评论</text>
						<uni-icons type="chatbubble" size="14" color="#FF8700"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 加载/空状态 -->
			<uni-load-more :status="loadingStatus" v-if="commentList.length > 0 || loadingStatus === 'loading'" />
			<view v-if="commentList.length === 0 && loadingStatus === 'noMore'" class="empty-state">
				<uni-icons type="chat-filled" size="80" color="#e0e0e0" class="empty-icon"></uni-icons>
				<text class="empty-text">暂无相关评论</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// ==========================================
	// 1. 配置与状态
	// ==========================================
	const actionTab = ref('received'); // received | sent
	const targetType = ref('post'); // post | activity | store

	const businessTabs = [{
			label: '商机',
			value: 'post'
		},
		{
			label: '聚会',
			value: 'activity'
		},
		{
			label: '聚店',
			value: 'store'
		}
	];

	const commentList = ref([]);
	const pageNo = ref(1);
	const total = ref(0);
	const loadingStatus = ref('more');

	// ==========================================
	// 2. 方法逻辑
	// ==========================================

	const fetchList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;
		if (isRefresh) pageNo.value = 1;
		loadingStatus.value = 'loading';

		// 根据 actionTab 切换接口
		const apiUrl = actionTab.value === 'received' ?
			'/app-api/member/comment/my-page-by-target-type' :
			'/app-api/member/comment/my-comment-list';

		try {
			const {
				data,
				error
			} = await request(apiUrl, {
				method: 'GET',
				data: {
					targetType: targetType.value,
					pageNo: pageNo.value,
					pageSize: 10
				}
			});

			if (!error && data) {
				const list = data.list || [];
				// 处理评论数据，确保imageUrls字段正确格式化
				const processedList = list.map(item => {
					// 处理当前评论的imageUrls
					let imageUrls = item.imageUrls || [];
					if (Array.isArray(imageUrls) && imageUrls.length > 0) {
						// 如果数组中第一个元素是字符串格式的数组（如"[\"url1\",\"url2\"]"），需要解析
						if (typeof imageUrls[0] === 'string' && imageUrls[0].startsWith('[')) {
							try {
								imageUrls = JSON.parse(imageUrls[0]);
							} catch (e) {
								console.warn('解析imageUrls失败:', e);
								imageUrls = [];
							}
						}
					}
					
					// 处理子评论的imageUrls
					if (item.childrenList && Array.isArray(item.childrenList)) {
						item.childrenList = item.childrenList.map(child => {
							let childImageUrls = child.imageUrls || [];
							if (Array.isArray(childImageUrls) && childImageUrls.length > 0) {
								if (typeof childImageUrls[0] === 'string' && childImageUrls[0].startsWith('[')) {
									try {
										childImageUrls = JSON.parse(childImageUrls[0]);
									} catch (e) {
										console.warn('解析子评论imageUrls失败:', e);
										childImageUrls = [];
									}
								}
							}
							return {
								...child,
								imageUrls: childImageUrls
							};
						});
					}
					
					return {
						...item,
						imageUrls: imageUrls
					};
				});
				
				commentList.value = isRefresh ? processedList : [...commentList.value, ...processedList];
				total.value = data.total;
				loadingStatus.value = commentList.value.length >= total.value ? 'noMore' : 'more';
				pageNo.value++;
			}
		} catch (e) {
			console.error(e);
		} finally {
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	const switchAction = (val) => {
		actionTab.value = val;
		fetchList(true);
	};

	const switchBusiness = (val) => {
		targetType.value = val;
		fetchList(true);
	};

	// 动态解析业务图标与文案
	const getBizConfig = () => {
		const configs = {
			'post': {
				label: '商机',
				icon: 'shop-filled',
				color: '#FF8700'
			},
			'activity': {
				label: '聚会',
				icon: 'calendar-filled',
				color: '#007AFF'
			},
			'store': {
				label: '聚店',
				icon: 'home-filled',
				color: '#4CD964'
			}
		};
		return configs[targetType.value];
	};

	// 动态解析被评论对象标题
	const getTargetTitle = (item) => {
		if (targetType.value === 'post') return item.memberBusinessOpportunitiesRespVO?.title || '商机详情';
		if (targetType.value === 'activity') return item.memberActivityRespVO?.activityTitle || '聚会详情';
		if (targetType.value === 'store') return item.memberStoreRespVO?.storeName || '聚店详情';
		return '查看详情';
	};

	// 通用跳转逻辑
	const goToTarget = (item) => {
		let url = '';
		const id = item.targetId;
		if (targetType.value === 'post') url = `/packages/home-commercialDetail/home-commercialDetail?id=${id}`;
		else if (targetType.value === 'activity') url = `/packages/active-detail/active-detail?id=${id}`;
		else if (targetType.value === 'store') url = `/packages/shop-detail/shop-detail?id=${id}`;

		if (url) {
			uni.navigateTo({
				url: `${url}&commentId=${item.id}`
			});
		}
	};

	const formatTime = (str) => {
		if (!str) return '';
		const d = new Date(str);
		return `${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
	};

	/**
	 * 预览图片
	 * @param {Array} urls - 图片URL数组
	 * @param {Number} current - 当前图片索引
	 */
	const previewImage = (urls, current) => {
		uni.previewImage({
			urls: urls,
			current: current
		});
	};

	onMounted(() => fetchList(true));
	onPullDownRefresh(() => fetchList(true));
	onReachBottom(() => loadingStatus.value === 'more' && fetchList());
</script>

<style lang="scss" scoped>
	$theme-color: #FF8700;
	$primary-gradient: linear-gradient(135deg, #FF8700 0%, #FF6B00 100%);

	.container {
		min-height: 100vh;
		background: #f5f7fa;
	}

	.page-header {
		background: $primary-gradient;
		padding: 60rpx 40rpx 100rpx;
		color: #fff;

		.header-title {
			.title-text {
				font-size: 44rpx;
				font-weight: bold;
				display: block;
			}

			.title-subtitle {
				font-size: 24rpx;
				opacity: 0.8;
			}
		}

		.header-stats {
			margin-top: 30rpx;

			.stat-number {
				font-size: 50rpx;
				font-weight: bold;
			}
		}
	}

	.filter-sticky-section {
		position: sticky;
		top: 0;
		z-index: 100;
		background: #fff;
		margin-top: -40rpx;
		border-radius: 40rpx 40rpx 0 0;
		padding: 20rpx 0;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.action-tabs {
		display: flex;
		justify-content: space-around;
		padding: 10rpx 60rpx;

		.action-tab {
			font-size: 30rpx;
			color: #999;
			position: relative;
			padding: 10rpx 0;

			&.active {
				color: $theme-color;
				font-weight: bold;

				.tab-line {
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 6rpx;
					background: $theme-color;
					border-radius: 3rpx;
				}
			}
		}
	}

	.business-tabs {
		display: flex;
		justify-content: center;
		gap: 20rpx;
		margin-top: 20rpx;
		padding: 0 30rpx;

		.biz-tab {
			padding: 10rpx 30rpx;
			border-radius: 30rpx;
			background: #f0f2f5;
			font-size: 24rpx;
			color: #666;

			&.active {
				background: rgba(255, 135, 0, 0.1);
				color: $theme-color;
				border: 1rpx solid $theme-color;
			}
		}
	}

	.list-container {
		padding: 30rpx;
	}

	.comment-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		.name {
			font-size: 30rpx;
			font-weight: bold;
		}

		.owner-badge {
			font-size: 18rpx;
			background: #FF6B00;
			color: #fff;
			padding: 2rpx 10rpx;
			border-radius: 6rpx;
			margin-left: 10rpx;
		}

		.time {
			font-size: 22rpx;
			color: #bbb;
		}

		.unread-dot {
			width: 12rpx;
			height: 12rpx;
			background: #ff4d4f;
			border-radius: 50%;
			margin-left: 10rpx;
		}
	}

	.card-content {
		font-size: 28rpx;
		color: #333;
		margin: 20rpx 0;
		line-height: 1.6;
	}

	/* 评论图片样式 */
	.comment-images {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin: 10rpx 0;
	}

	.comment-image-item {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.comment-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.target-section {
		display: flex;
		align-items: center;
		background: #f9f9f9;
		padding: 20rpx;
		border-radius: 12rpx;

		.target-content {
			flex: 1;
			margin-left: 16rpx;

			.target-label {
				font-size: 20rpx;
				color: #999;
			}

			.target-title {
				font-size: 26rpx;
				color: #666;
				font-weight: 500;
			}
		}
	}

	.children-section {
		background: #fafafa;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-top: 20rpx;

		.child-name {
			font-size: 24rpx;
			color: $theme-color;
			font-weight: bold;
		}

		.child-text {
			font-size: 24rpx;
			color: #666;
		}

		.more-replies {
			font-size: 22rpx;
			color: #999;
			margin-top: 10rpx;
		}
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;

		.reply-btn {
			display: flex;
			align-items: center;
			gap: 8rpx;
			font-size: 26rpx;
			color: $theme-color;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 100rpx;
	}

	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		opacity: 0.5;
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
		margin-top: 20rpx;
	}
</style>