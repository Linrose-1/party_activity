<template>
	<view class="container">
		<!-- 1. 页面头部 -->
		<view class="page-header">
			<view class="header-content">
				<view class="header-title">
					<text class="title-text">我发出的评论</text>
					<text class="title-subtitle">记录您的每一次互动</text>
				</view>
				<view class="header-stats">
					<view class="stat-item">
						<text class="stat-number">{{ total }}</text>
						<text class="stat-label">条评论</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 2. 评论列表 -->
		<view class="list-container">
			<!-- 评论卡片 -->
			<view class="comment-card" v-for="item in commentList" :key="item.id">
				<!-- 卡片头部：用户信息 -->
				<view class="card-header">
					<view class="user-info-left">
						<image :src="item.memberUserBaseVO?.avatar || '/static/images/default-avatar.png'" class="avatar" mode="aspectFill" />
						<view class="user-detail">
							<view class="name-row">
								<text class="name">{{ item.anonymous === 1 ? '匿名商友' : (item.memberUserBaseVO?.nickname || '未知商友') }}</text>
							</view>
							<view class="meta-row">
								<text class="time">{{ formatTime(item.createTime) }}</text>
								<text class="separator">·</text>
								<text class="anon-label" v-if="item.anonymous === 1">匿名评论</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 评论内容 -->
				<view class="card-content">
					<text>{{ item.content }}</text>
				</view>

				<!-- 被评论对象信息 -->
				<view class="target-section" @click="goToTarget(item)">
					<view class="target-icon">
						<uni-icons type="shop-filled" size="18" color="#FF8700"></uni-icons>
					</view>
					<view class="target-content">
						<view class="target-label">评论了商机</view>
						<view class="target-title">{{ getTargetTitle(item) }}</view>
					</view>
					<view class="target-arrow">
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
				</view>

				<!-- 子评论列表 -->
				<view class="children-section" v-if="item.childrenList && item.childrenList.length > 0">
					<view class="children-header">
						<uni-icons type="chatbubble" size="12" color="#999"></uni-icons>
						<text>{{ item.childrenList.length }} 条回复</text>
					</view>
					<view class="children-list">
						<view class="child-item" v-for="child in item.childrenList" :key="child.id">
							<image :src="child.memberUserBaseVO?.avatar || '/static/images/default-avatar.png'" class="child-avatar" mode="aspectFill" />
							<view class="child-content">
								<view class="child-header">
									<text class="child-name">{{ child.anonymous === 1 ? '匿名商友' : (child.memberUserBaseVO?.nickname || '未知商友') }}</text>
									<text class="child-time">{{ formatTime(child.createTime) }}</text>
								</view>
								<view class="child-text">{{ child.content }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more :status="loadingStatus" v-if="commentList.length > 0 || loadingStatus === 'loading'">
			</uni-load-more>

			<!-- 空状态 -->
			<view v-if="commentList.length === 0 && loadingStatus === 'noMore'" class="empty-state">
				<view class="empty-icon">
					<uni-icons type="chat" size="80" color="#e0e0e0"></uni-icons>
				</view>
				<text class="empty-text">暂无发出的评论</text>
				<text class="empty-tip">去商机页面评论，与商友互动吧</text>
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
	// 1. API 定义区域
	// ==========================================
	const CommentApi = {
		/** 获取登录用户发出的评论分页列表 */
		getMyCommentList: (params) => request('/app-api/member/comment/my-comment-list', {
			method: 'GET',
			data: params
		})
	};

	// ==========================================
	// 2. 状态变量区域
	// ==========================================
	const loadingStatus = ref('more'); // more, loading, noMore
	const commentList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);

	// ==========================================
	// 3. 生命周期区域
	// ==========================================
	onMounted(() => {
		fetchList(true);
	});

	onPullDownRefresh(() => {
		fetchList(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			fetchList();
		}
	});

	// ==========================================
	// 4. 方法逻辑区域
	// ==========================================

	// --- 数据获取 ---
	const fetchList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'more';
		}
		loadingStatus.value = 'loading';

		try {
			// targetType: post 表示商机
			const params = {
				targetType: 'post',
				pageNo: pageNo.value,
				pageSize: pageSize.value
			};

			const {
				data,
				error
			} = await CommentApi.getMyCommentList(params);

			if (!error && data) {
				const list = data.list || [];
				commentList.value = isRefresh ? list : [...commentList.value, ...list];
				total.value = data.total;

				if (commentList.value.length >= total.value) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;
				}
			} else {
				loadingStatus.value = 'noMore';
			}
		} catch (e) {
			loadingStatus.value = 'more';
			console.error('获取我的评论列表失败:', e);
		}

		if (isRefresh) {
			uni.stopPullDownRefresh();
		}
	};

	// --- 辅助显示函数 ---

	/**
	 * 格式化时间
	 */
	const formatTime = (str) => {
		if (!str) return '';
		const d = new Date(str);
		const now = new Date();
		const diff = now - d;

		// 小于1小时
		if (diff < 3600000) {
			const minutes = Math.floor(diff / 60000);
			return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
		}
		// 小于24小时
		if (diff < 86400000) {
			const hours = Math.floor(diff / 3600000);
			return `${hours}小时前`;
		}
		// 小于7天
		if (diff < 604800000) {
			const days = Math.floor(diff / 86400000);
			return `${days}天前`;
		}
		// 大于7天显示具体日期
		return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
	};

	/**
	 * 获取被评论对象的标题
	 */
	const getTargetTitle = (item) => {
		if (item.memberBusinessOpportunitiesRespVO) {
			return item.memberBusinessOpportunitiesRespVO.title || '商机详情';
		}
		return '查看详情';
	};

	/**
	 * 跳转到被评论对象
	 * 如果商机已被删除，显示后端报错信息
	 */
	const goToTarget = (item) => {
		if (!item.targetId) {
			uni.showToast({
				title: '商机ID不存在',
				icon: 'none'
			});
			return;
		}

		// 携带评论ID参数，用于在详情页定位到对应评论位置
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${item.targetId}&commentId=${item.id}`,
			success: () => {
				console.log('跳转成功');
			},
			fail: (err) => {
				// 捕获跳转失败或后端报错
				console.error('跳转失败:', err);
				let errorMsg = '跳转失败';
				if (err.errMsg && err.errMsg.includes('navigateTo:fail')) {
					errorMsg = '该商机已被删除或不存在';
				} else if (err.errMsg) {
					errorMsg = err.errMsg;
				}
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 3000
				});
			}
		});
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF8700;
	$primary-gradient: linear-gradient(135deg, #FF8700 0%, #FF6B00 100%);
	$card-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	$header-shadow: 0 4rpx 30rpx rgba(255, 135, 0, 0.08);

	.container {
		min-height: 100vh;
		background: linear-gradient(180deg, #FFF9F5 0%, #f5f7fa 20%);
		display: flex;
		flex-direction: column;
	}

	/* 页面头部 */
	.page-header {
		background: $primary-gradient;
		padding: 40rpx 30rpx 50rpx;
		box-shadow: $header-shadow;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: -50%;
			right: -20%;
			width: 400rpx;
			height: 400rpx;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
			border-radius: 50%;
		}

		.header-content {
			position: relative;
			z-index: 1;
		}

		.header-title {
			margin-bottom: 30rpx;

			.title-text {
				display: block;
				font-size: 48rpx;
				font-weight: bold;
				color: #fff;
				margin-bottom: 8rpx;
				letter-spacing: 2rpx;
			}

			.title-subtitle {
				display: block;
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.85);
				font-weight: 300;
			}
		}

		.header-stats {
			.stat-item {
				display: flex;
				align-items: baseline;
				gap: 8rpx;

				.stat-number {
					font-size: 56rpx;
					font-weight: bold;
					color: #fff;
					line-height: 1;
					text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
				}

				.stat-label {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.9);
					font-weight: 300;
				}
			}
		}
	}

	.list-container {
		padding: 30rpx;
		flex: 1;
		margin-top: -20rpx;
		position: relative;
		z-index: 2;
	}

	/* 评论卡片 */
	.comment-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: $card-shadow;
		transition: all 0.3s ease;

		&:active {
			transform: translateY(-2rpx);
			box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
		}
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;

		.user-info-left {
			display: flex;
			align-items: center;
			flex: 1;
		}

		.avatar {
			width: 88rpx;
			height: 88rpx;
			border-radius: 50%;
			margin-right: 20rpx;
			background-color: #f5f5f5;
			border: 3rpx solid #fff;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		}

		.user-detail {
			flex: 1;

			.name-row {
				display: flex;
				align-items: center;
				margin-bottom: 8rpx;

				.name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
			}

			.meta-row {
				display: flex;
				align-items: center;
				font-size: 22rpx;

				.time {
					color: #999;
				}

				.separator {
					color: #ddd;
					margin: 0 8rpx;
				}

				.anon-label {
					color: #999;
				}
			}
		}
	}

	.card-content {
		font-size: 30rpx;
		color: #333;
		line-height: 1.8;
		margin-bottom: 24rpx;
		font-weight: 400;
		letter-spacing: 0.5rpx;
	}

	/* 被评论对象区域 */
	.target-section {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #FFF9F5 0%, #FFF5E8 100%);
		padding: 24rpx;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		border-left: 4rpx solid $theme-color;
		transition: all 0.2s ease;

		&:active {
			background: linear-gradient(135deg, #FFF5E8 0%, #FFEFD5 100%);
		}

		.target-icon {
			width: 48rpx;
			height: 48rpx;
			border-radius: 12rpx;
			background-color: rgba(255, 135, 0, 0.1);
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 16rpx;
		}

		.target-content {
			flex: 1;

			.target-label {
				font-size: 22rpx;
				color: #999;
				margin-bottom: 6rpx;
			}

			.target-title {
				font-size: 28rpx;
				color: #666;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-weight: 500;
			}
		}

		.target-arrow {
			margin-left: 12rpx;
		}
	}

	/* 子评论区域 */
	.children-section {
		background-color: #fafafa;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;

		.children-header {
			display: flex;
			align-items: center;
			gap: 6rpx;
			font-size: 22rpx;
			color: #999;
			margin-bottom: 20rpx;
			padding-bottom: 16rpx;
			border-bottom: 1rpx solid #f0f0f0;
		}

		.children-list {
			.child-item {
				display: flex;
				margin-bottom: 20rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.child-avatar {
					width: 56rpx;
					height: 56rpx;
					border-radius: 50%;
					margin-right: 16rpx;
					background-color: #eee;
				}

				.child-content {
					flex: 1;

					.child-header {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 8rpx;

						.child-name {
							font-size: 26rpx;
							color: #666;
							font-weight: 500;
						}

						.child-time {
							font-size: 20rpx;
							color: #ccc;
						}
					}

					.child-text {
						font-size: 26rpx;
						color: #333;
						line-height: 1.6;
					}
				}
			}
		}
	}

	/* 空状态 */
	.empty-state {
		padding: 120rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;

		.empty-icon {
			opacity: 0.5;
		}

		.empty-text {
			font-size: 28rpx;
			color: #ccc;
			font-weight: 500;
		}

		.empty-tip {
			font-size: 24rpx;
			color: #ddd;
		}
	}
</style>