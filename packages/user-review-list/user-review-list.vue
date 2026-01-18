<template>
	<view class="container">
		<!-- 1. 顶部搜索与筛选 -->
		<view class="header-section">
			<!-- 搜索框 -->
			<view class="search-bar">
				<uni-easyinput prefixIcon="search" v-model="searchKey" placeholder="搜索反馈内容" @confirm="handleSearch"
					@clear="handleSearch">
				</uni-easyinput>
			</view>

			<!-- 筛选 Tab -->
			<view class="filter-tabs">
				<view class="tab-item" :class="{ active: currentFilter === 0 }" @click="switchFilter(0)">全部</view>
				<view class="tab-item" :class="{ active: currentFilter === 1 }" @click="switchFilter(1)">👍 好评</view>
				<view class="tab-item" :class="{ active: currentFilter === 2 }" @click="switchFilter(2)">👎 改进</view>
			</view>
		</view>

		<!-- 2. 列表内容 -->
		<view class="list-content">
			<view class="review-card" v-for="item in reviewList" :key="item.id">
				<!-- 头部：类型 + 匿名标识 + 时间 -->
				<view class="card-header">
					<!-- 类型标签 -->
					<view class="type-tag" :class="item.isLike === 1 ? 'like' : 'dislike'">
						<uni-icons :type="item.isLike === 1 ? 'hand-up-filled' : 'hand-down-filled'" size="16"
							:color="item.isLike === 1 ? '#FF6A00' : '#666'">
						</uni-icons>
						<text>{{ item.isLike === 1 ? '正面反馈' : '改进建议' }}</text>
					</view>

					<!-- 匿名标签 -->
					<view class="anon-tag">
						<uni-icons type="locked-filled" size="14" color="#999"></uni-icons> 匿名
					</view>

					<!-- 时间 -->
					<view class="time-tag">{{ formatTime(item.createTime) }}</view>
				</view>

				<!-- 内容区域 -->
				<view class="card-body">
					<text class="review-text">
						{{ item.reviewContent || (item.isLike === 1 ? '（未填写具体原因，默认为好评）' : '（未填写具体原因，默认为改进建议）') }}
					</text>
				</view>

				<!-- 底部互动区域 -->
				<view class="card-footer">
					<!-- 点赞按钮 -->
					<view class="action-item" :class="{ active: item.isReview === 1 }"
						@click="toggleAction(item, 'like')">
						<uni-icons :type="item.isReview === 1 ? 'hand-up-filled' : 'hand-up'" size="18"
							:color="item.isReview === 1 ? '#FF6A00' : '#999'">
						</uni-icons>
						<text>{{ item.likesCount || 0 }}</text>
					</view>

					<!-- 点踩按钮 -->
					<view class="action-item" :class="{ active: item.isReview === 2 }"
						@click="toggleAction(item, 'dislike')">
						<uni-icons :type="item.isReview === 2 ? 'hand-down-filled' : 'hand-down'" size="18"
							:color="item.isReview === 2 ? '#333' : '#999'">
						</uni-icons>
						<text>{{ item.dislikesCount || 0 }}</text>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more :status="loadingStatus" v-if="reviewList.length > 0 || loadingStatus === 'loading'">
			</uni-load-more>

			<!-- 空状态 -->
			<view v-if="reviewList.length === 0 && loadingStatus === 'noMore'" class="empty-state">
				<uni-icons type="chatboxes" size="60" color="#e0e0e0"></uni-icons>
				<text>暂无相关反馈</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		onLoad,
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// ==========================================
	// 1. API 定义区域
	// ==========================================
	const ReviewApi = {
		/** 获取评论分页列表 */
		getPage: (params) => request('/app-api/member/user-review/page', {
			method: 'GET',
			data: params
		}),
		/** 创建互动 (点赞/点踩) */
		createInteraction: (data) => request('/app-api/member/user-review-interaction/create', {
			method: 'POST',
			data: data
		}),
		/** 取消互动 */
		cancelInteraction: (data) => request(`/app-api/member/user-review-interaction/cancel?id=${data.id}`, {
			method: 'DELETE',
		})
	}

	// ==========================================
	// 2. 状态变量区域
	// ==========================================

	// 页面参数与筛选
	const targetUserId = ref(null); // 被点评人ID
	const currentFilter = ref(0); // 0全部, 1好评, 2差评
	const searchKey = ref(''); // 搜索关键词

	// 列表数据与分页
	const reviewList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadingStatus = ref('more'); // more, loading, noMore

	// ==========================================
	// 3. 生命周期区域
	// ==========================================

	onLoad((options) => {
		if (options.userId) {
			targetUserId.value = options.userId;
			fetchList(true);
		}
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

	// --- 筛选与搜索 ---

	const switchFilter = (val) => {
		if (currentFilter.value === val) return;
		currentFilter.value = val;
		fetchList(true);
	};

	const handleSearch = () => {
		fetchList(true);
	};

	// --- 数据获取 ---

	/**
	 * 获取列表数据
	 * @param {boolean} isRefresh 是否为下拉刷新/重置
	 */
	const fetchList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'more';
			// reviewList.value = []; // 保持旧数据平滑过渡
		}

		loadingStatus.value = 'loading';

		try {
			const params = {
				reviewedId: targetUserId.value,
				pageNo: pageNo.value,
				pageSize: pageSize.value
			};

			// 筛选条件
			if (currentFilter.value !== 0) {
				params.isLike = currentFilter.value;
			}
			// 如果有后端搜索字段，可在此添加 params.keyword = searchKey.value

			const {
				data,
				error
			} = await ReviewApi.getPage(params);

			if (isRefresh) uni.stopPullDownRefresh();

			if (!error && data) {
				const list = data.list || [];
				reviewList.value = isRefresh ? list : [...reviewList.value, ...list];
				total.value = data.total;

				if (reviewList.value.length >= total.value) {
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
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	// --- 用户互动 (点赞/点踩) ---

	/**
	 * 切换互动状态
	 * @param {object} item 评论对象
	 * @param {string} actionType 'like' | 'dislike'
	 */
	const toggleAction = async (item, actionType) => {
		// 1. 登录检查
		const currentUserId = uni.getStorageSync('userId');
		if (!currentUserId) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		// 2. 确定目标状态 (1=点赞, 2=点踩)
		const targetIsLike = actionType === 'like' ? 1 : 2;
		const currentStatus = item.isReview; // 0=无, 1=已赞, 2=已踩

		// 3. 判断是否为取消操作
		let isCancel = false;
		if (currentStatus === targetIsLike) {
			isCancel = true; // 点击已选中的 -> 取消
		}

		// 4. 【历史数据保护】
		// 如果是取消操作，但本地没有 interactionId，说明是历史数据，无法取消
		// if (isCancel && !item.interactionId) {
		// 	uni.showToast({
		// 		title: '暂无法取消历史评价',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

		// 5. 乐观更新 UI (先变界面，再请求)
		const originalStatus = item.isReview;
		const originalLikes = item.likesCount;
		const originalDislikes = item.dislikesCount;

		if (isCancel) {
			// 取消状态
			item.isReview = 0;
			if (originalStatus === 1) item.likesCount--;
			if (originalStatus === 2) item.dislikesCount--;
		} else {
			// 设置新状态
			item.isReview = targetIsLike;
			// 处理计数变化
			if (targetIsLike === 1) { // 目标是赞
				item.likesCount++;
				if (originalStatus === 2) item.dislikesCount--; // 如果原来是踩，踩数减1
			} else { // 目标是踩
				item.dislikesCount++;
				if (originalStatus === 1) item.likesCount--; // 如果原来是赞，赞数减1
			}
		}

		try {
			if (isCancel) {
				// === 取消互动 ===
				const {
					error
				} = await ReviewApi.cancelInteraction({
					id: item.id
				});
				if (error) throw new Error(error.msg);
			} else {
				// === 新增/切换互动 ===
				const {
					data,
					error
				} = await ReviewApi.createInteraction({
					userId: currentUserId,
					reviewId: item.id,
					isLike: targetIsLike
				});

				if (error) throw new Error(error.msg);

				// 保存返回的 ID，以便稍后取消
				// if (data) item.interactionId = data;
			}
		} catch (e) {
			// 6. 请求失败，回滚 UI
			item.isReview = originalStatus;
			item.likesCount = originalLikes;
			item.dislikesCount = originalDislikes;
			uni.showToast({
				title: e.message || '操作失败',
				icon: 'none'
			});
		}
	};

	// --- 工具方法 ---

	const formatTime = (timeStr) => {
		if (!timeStr) return '';
		const date = new Date(timeStr);
		return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
	};
</script>

<style lang="scss" scoped>
	/* 保持原有样式结构 */
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
	}

	.header-section {
		background-color: #fff;
		padding: 20rpx 30rpx 0;
		position: sticky;
		top: 0;
		z-index: 10;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
	}

	.search-bar {
		margin-bottom: 20rpx;
	}

	.filter-tabs {
		display: flex;
		gap: 40rpx;
		padding-bottom: 20rpx;

		.tab-item {
			font-size: 28rpx;
			color: #666;
			padding: 10rpx 0;
			position: relative;

			&.active {
				color: #333;
				font-weight: bold;
				font-size: 30rpx;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 32rpx;
					height: 6rpx;
					background-color: #FF6A00;
					border-radius: 4rpx;
				}
			}
		}
	}

	.list-content {
		padding: 30rpx;
	}

	.review-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		font-size: 24rpx;

		.type-tag {
			display: flex;
			align-items: center;
			gap: 6rpx;
			font-weight: bold;
			margin-right: 20rpx;

			&.like {
				color: #FF6A00;
			}

			&.dislike {
				color: #666;
			}
		}

		.anon-tag {
			display: flex;
			align-items: center;
			color: #999;
			gap: 4rpx;
			background: #f5f5f5;
			padding: 2rpx 10rpx;
			border-radius: 8rpx;
		}

		.time-tag {
			margin-left: auto;
			color: #ccc;
		}
	}

	.card-body {
		margin-bottom: 24rpx;

		.review-text {
			font-size: 30rpx;
			color: #333;
			line-height: 1.6;
		}
	}

	.card-footer {
		display: flex;
		gap: 40rpx;
		border-top: 1rpx solid #f9f9f9;
		padding-top: 20rpx;

		.action-item {
			display: flex;
			align-items: center;
			gap: 8rpx;
			color: #999;
			font-size: 26rpx;

			&.active {
				font-weight: bold;
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 100rpx 0;
		color: #ccc;
		gap: 20rpx;
	}
</style>