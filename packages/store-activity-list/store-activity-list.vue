<template>
	<view class="container">

		<!-- 列表为空时的占位 -->
		<view v-if="!loading && activitiesData.length === 0" class="empty-state">
			<image src="/static/icon/empty-activity.png" mode="aspectFit" class="empty-img" />
			<text class="empty-text">该聚店暂无历史聚会记录</text>
		</view>

		<!-- 聚会卡片列表 -->
		<view class="activity-list">
			<ActivityCard v-for="activity in activitiesData" :key="activity.id" :activity="activity" :is-login="isLogin"
				@updateFavoriteStatus="handleFavoriteChange" @updateLikeStatus="handleLikeChange" />
		</view>

		<!-- 无更多数据提示 -->
		<view v-if="!hasMore && activitiesData.length > 0" class="no-more">已显示全部聚会</view>

		<!-- 加载中骨架 -->
		<view v-if="loading" class="loading-tip">
			<text>加载中...</text>
		</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import ActivityCard from '@/components/ActivityCard.vue';
	import request from '@/utils/request.js';

	// ─── 路由参数 ───
	const storeId = ref(null);
	const storeName = ref('');

	// ─── 核心状态 ───
	const loading = ref(false);
	const hasMore = ref(true);
	const pageNo = ref(1);
	const pageSize = 10;
	const activitiesData = ref([]);
	const isLogin = ref(false);

	// ─── 生命周期 ───

	onLoad((options) => {
		storeId.value = options.storeId;
		storeName.value = options.storeName ? decodeURIComponent(options.storeName) : '聚店';

		// 设置导航栏标题
		uni.setNavigationBarTitle({
			title: storeName.value + ' · 历史聚会'
		});

		// 更新登录状态
		isLogin.value = !!uni.getStorageSync('token');

		// 加载第一页
		fetchList(false);
	});

	/**
	 * 下拉刷新：重置后重新加载
	 */
	onPullDownRefresh(async () => {
		await fetchList(false);
		uni.stopPullDownRefresh();
	});

	/**
	 * 上拉到底部：加载更多
	 */
	onReachBottom(() => {
		if (hasMore.value && !loading.value) {
			fetchList(true);
		}
	});

	// ─── 数据获取 ───

	/**
	 * 拉取聚店历史聚会列表
	 * @param {boolean} isLoadMore - true 追加，false 重置
	 */
	const fetchList = async (isLoadMore = false) => {
		if (loading.value) return;
		if (isLoadMore && !hasMore.value) return;
		if (!storeId.value) return;

		loading.value = true;

		if (!isLoadMore) {
			pageNo.value = 1;
			activitiesData.value = [];
			hasMore.value = true;
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/activity/store-list', {
				method: 'GET',
				data: {
					storeId: storeId.value,
					pageNo: pageNo.value,
					pageSize
				}
			});

			if (error) {
				uni.showToast({
					title: error,
					icon: 'none'
				});
				hasMore.value = false;
				return;
			}

			if (data) {
				const {
					list = [], total = 0
				} = data;

				if (isLoadMore) {
					activitiesData.value.push(...list);
				} else {
					activitiesData.value = list;
				}

				hasMore.value = activitiesData.value.length < total;
				pageNo.value++;
			}
		} catch (e) {
			console.error('[store-activity-list] 请求异常:', e);
			hasMore.value = false;
		} finally {
			loading.value = false;
		}
	};

	// ─── 卡片事件处理 ───

	/**
	 * 收藏状态变更（来自 ActivityCard 子组件）
	 * @param {{ id, newFollowFlag }} event
	 */
	const handleFavoriteChange = (event) => {
		// eslint-disable-next-line eqeqeq
		const activity = activitiesData.value.find(a => a.id == event.id);
		if (activity) activity.followFlag = event.newFollowFlag;
	};

	/**
	 * 赞踩操作（来自 ActivityCard 子组件）
	 * 乐观更新本地数据，接口失败后回滚
	 * @param {{ id, action, clickedAction }} param
	 */
	const handleLikeChange = async ({
		id,
		action,
		clickedAction
	}) => {
		// eslint-disable-next-line eqeqeq
		const activity = activitiesData.value.find(item => item.id == id);
		if (!activity) return;

		const originalAction = activity.userLikeStr;
		const originalLikes = activity.likesCount;
		const originalDislikes = activity.dislikesCount;

		// 乐观更新
		if (action === 'cancel') {
			activity.userLikeStr = null;
			clickedAction === 'like' ? activity.likesCount-- : activity.dislikesCount--;
		} else {
			activity.userLikeStr = clickedAction;
			if (clickedAction === 'like') {
				activity.likesCount++;
				if (originalAction === 'dislike') activity.dislikesCount--;
			} else {
				activity.dislikesCount++;
				if (originalAction === 'like') activity.likesCount--;
			}
		}

		const {
			error
		} = await request('/app-api/member/like-action/add', {
			method: 'POST',
			data: {
				targetId: id,
				targetType: 'activity',
				action
			}
		});

		if (error) {
			// 接口失败，回滚
			activity.userLikeStr = originalAction;
			activity.likesCount = originalLikes;
			activity.dislikesCount = originalDislikes;
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			});
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.activity-list {
		padding: 24rpx 32rpx 0;
	}

	/* ── 无更多 ── */
	.no-more {
		text-align: center;
		color: #bbb;
		font-size: 26rpx;
		padding: 30rpx 0 20rpx;
	}

	/* ── 加载中 ── */
	.loading-tip {
		text-align: center;
		color: #999;
		font-size: 26rpx;
		padding: 30rpx 0;
	}

	/* ── 空状态 ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;

		.empty-img {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 24rpx;
			opacity: 0.5;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
</style>