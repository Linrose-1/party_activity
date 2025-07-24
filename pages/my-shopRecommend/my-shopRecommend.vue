<template>
	<view class="recommendations-page">
		<scroll-view class="list-scroll" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="onPullDownRefresh">
			
			<!-- 推荐卡片列表 - 直接在页面中循环渲染 -->
			<view v-for="item in recommendations" :key="item.id" class="card">
				<view class="card-header">
					<text class="store-name">{{ item.storeName }}</text>
					<!-- 直接调用方法来获取状态信息 -->
					<view class="status" :class="getStatusInfo(item).class">
						{{ getStatusInfo(item).text }}
					</view>
				</view>
				<view class="card-body">
					<view class="info-item">
						<uni-icons type="location-filled" size="16" color="#666"></uni-icons>
						<text class="info-text">{{ item.fullAddress }}</text>
					</view>
					<view class="info-item">
						<uni-icons type="chat-filled" size="16" color="#666"></uni-icons>
						<text class="info-text">{{ item.recommendText }}</text>
					</view>
				</view>
				<view class="card-footer">
					<uni-icons type="calendar-filled" size="16" color="#999"></uni-icons>
					<!-- 直接调用方法来格式化时间 -->
					<text class="time-text">推荐于: {{ formatTime(item) }}</text>
				</view>
			</view>

			<!-- 加载状态提示 -->
			<view v-if="loadingMore" class="load-more">
				<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			<view v-if="!hasMore && recommendations.length > 0" class="load-more">
				<uni-icons type="checkmarkempty" size="20" color="#999"></uni-icons>
				<text>没有更多推荐记录了</text>
			</view>

			<!-- 空状态提示 -->
			<view v-if="recommendations.length === 0 && !loadingMore && !isRefreshing" class="empty-state">
				<uni-icons type="chat-bubble" size="60" color="#e0e0e0"></uni-icons>
				<text>您还没有推荐过任何聚店</text>
				<text class="tip">快去发现和分享吧！</text>
			</view>
			
		</scroll-view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import request from '../../utils/request.js';

	// --- 页面状态变量 ---
	const recommendations = ref([]);
	const pageNo = ref(1);
	const pageSize = 10;
	const hasMore = ref(true);
	const loadingMore = ref(false);
	const isRefreshing = ref(false);

	// --- 核心数据获取逻辑 ---
	const getMyRecommendations = async () => {
		if (loadingMore.value || !hasMore.value) {
			return;
		}
		loadingMore.value = true;
		
		const userId = uni.getStorageSync('userId');
		if (!userId) {
			uni.showToast({ title: '请先登录', icon: 'none' });
			loadingMore.value = false;
			return;
		}

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			userId: userId,
		};

		const { data: result, error } = await request('/app-api/member/store-recommend/list', {
			method: 'GET',
			data: params
		});

		loadingMore.value = false;
		isRefreshing.value = false;

		if (error) {
			console.error('获取我的推荐列表失败:', error);
			uni.showToast({ title: error, icon: 'none' });
			return;
		}
		
		const newList = result?.list || [];
		const total = result?.total || 0;

		if (newList.length > 0) {
			recommendations.value = pageNo.value === 1 ? newList : [...recommendations.value, ...newList];
			pageNo.value++;
			hasMore.value = recommendations.value.length < total;
		} else {
			if (pageNo.value === 1) {
				recommendations.value = [];
			}
			hasMore.value = false;
		}
	};
	
	// --- 交互处理函数 ---
	const handleRefresh = () => {
		pageNo.value = 1;
		recommendations.value = [];
		hasMore.value = true;
		getMyRecommendations();
	};

	const loadMore = () => {
		if (hasMore.value) {
			getMyRecommendations();
		}
	};

	const onPullDownRefresh = () => {
		isRefreshing.value = true;
		handleRefresh();
	};
	
	onMounted(() => {
		handleRefresh();
	});

	// --- 视图辅助函数 (替代原组件中的 computed) ---

	/**
	 * 根据推荐项的状态码返回文本和样式类
	 * @param {object} item - 单条推荐数据
	 */
	const getStatusInfo = (item) => {
		switch (item.status) {
			case 1:
				return { text: '待审核', class: 'status-pending' };
			case 2:
				return { text: '审核通过', class: 'status-approved' };
			default:
				return { text: '未知', class: 'status-unknown' };
		}
	};

	/**
	 * 格式化时间戳为 YYYY-MM-DD 格式
	 * @param {object} item - 单条推荐数据
	 */
	const formatTime = (item) => {
		if (!item.createTime) {
			return 'N/A';
		}
		const date = new Date(item.createTime);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	};
</script>

<style lang="scss">
	/* 页面整体样式 */
	.recommendations-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f8f8f8;
	}

	.list-scroll {
		flex: 1;
		padding-top: 30rpx;
		box-sizing: border-box;
		overflow-y: hidden;
	}
	
	/* 卡片样式 (直接从组件合并过来) */
	.card {
		background-color: #fff;
		border-radius: 16rpx;
		margin: 0 30rpx 30rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.store-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.status {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
		font-weight: 500;

		&.status-pending {
			background-color: #fff5ec;
			color: #fa8c16;
		}
		&.status-approved {
			background-color: #f6ffed;
			color: #52c41a;
		}
		&.status-unknown {
			background-color: #f0f0f0;
			color: #999;
		}
	}

	.card-body {
		padding: 20rpx 0;
	}

	.info-item {
		display: flex;
		align-items: flex-start;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 16rpx;
		
		&:last-child {
			margin-bottom: 0;
		}

		.uni-icons {
			margin-right: 10rpx;
			position: relative;
			top: 4rpx;
		}
		.info-text {
			flex: 1;
			line-height: 1.5;
		}
	}

	.card-footer {
		display: flex;
		align-items: center;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
		font-size: 24rpx;
		color: #999;
		
		.uni-icons {
			margin-right: 10rpx;
		}
	}
	
	/* 加载和空状态样式 */
	.empty-state {
		text-align: center;
		padding-top: 200rpx;
		color: #999;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		
		.uni-icons {
			margin-bottom: 20rpx;
		}

		text {
			font-size: 28rpx;
			line-height: 1.5;
		}
		.tip {
			font-size: 24rpx;
			color: #ccc;
		}
	}

	.load-more {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.uni-icons {
			margin-right: 10rpx;
		}
	}
</style>