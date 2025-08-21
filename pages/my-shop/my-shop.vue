<template>
	<view class="my-stores-page">
		<!-- 1. 搜索区域 -->
		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="20" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索我的聚店名称" v-model="searchTerm"
					@input="onSearchInput" />
				<button class="search-btn" @click="handleSearchClick">搜索</button>
			</view>
		</view>

		<!-- 2. 店铺列表区域 -->
		<scroll-view class="store-list" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="onPullDownRefresh">
			
			<!-- 卡片列表 -->
			<StoreCard v-for="store in stores" :key="store.id" :store="store" @click-card="goToEditPage" />

			<!-- 加载状态提示 -->
			<view v-if="loadingMore" class="load-more">
				<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			<view v-if="!hasMore && stores.length > 0" class="load-more">
				<uni-icons type="checkmarkempty" size="20" color="#999"></uni-icons>
				<text>没有更多了</text>
			</view>

			<!-- 空状态提示 -->
			<view v-if="stores.length === 0 && !loadingMore && !isRefreshing" class="empty-state">
			    <uni-icons type="shop" size="60" color="#ffd8c1"></uni-icons>
			    <text class="empty-text">您还没有自己的聚店</text>
			    <text class="empty-subtext">立即申请，让更多人发现您的店铺</text>
			    <button class="apply-button" @click="goToApplyPage">申请上榜</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onMounted
	} from 'vue';
	import StoreCard from '../../components/StoreCard.vue'; // 确保路径正确
	import request from '../../utils/request.js'; // 确保路径正确

	// --- 状态变量 ---
	const searchTerm = ref('');
	const stores = ref([]);
	const pageNo = ref(1);
	const pageSize = 10;
	const hasMore = ref(true);
	const loadingMore = ref(false);
	const isRefreshing = ref(false);

	/**
	 * 核心函数：获取我的聚店列表
	 */
	const getMyStores = async () => {
		// 防止重复加载
		if (loadingMore.value || !hasMore.value) {
			return;
		}

		loadingMore.value = true;

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			storeName: searchTerm.value.trim()
		};

		const {
			data: result,
			error
		} = await request('/app-api/member/store/my-list', {
			method: 'GET',
			data: params
		});

		// 结束加载状态
		loadingMore.value = false;
		if (isRefreshing.value) {
			isRefreshing.value = false;
		}

		if (error) {
			console.error('获取我的聚店列表失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}
		
		const newList = result ? result.list : [];
		const total = result ? result.total : 0;

		if (newList && newList.length > 0) {
			// 如果是第一页，直接替换；否则，追加到列表末尾
			stores.value = pageNo.value === 1 ? newList : [...stores.value, ...newList];
			// 页码自增
			pageNo.value++;
			// 判断是否还有更多数据
			hasMore.value = stores.value.length < total;
		} else {
			// 如果是第一页就没有数据，则清空列表
			if (pageNo.value === 1) {
				stores.value = [];
			}
			hasMore.value = false;
		}
	};
	
	/**
	 * 统一的刷新/搜索处理函数
	 */
	const handleRefresh = () => {
		pageNo.value = 1;
		stores.value = [];
		hasMore.value = true;
		getMyStores();
	};

	/**
	 * 上拉加载更多
	 */
	const loadMore = () => {
		if (hasMore.value) {
			getMyStores();
		}
	};

	/**
	 * 下拉刷新
	 */
	const onPullDownRefresh = () => {
		isRefreshing.value = true;
		handleRefresh();
	};
	
	/**
	 * 搜索输入处理（防抖）
	 */
	let searchTimer = null;
	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			handleRefresh();
		}, 500); // 延迟500毫秒触发搜索
	};
	
	/**
	 * 点击搜索按钮
	 */
	const handleSearchClick = () => {
		clearTimeout(searchTimer);
		handleRefresh();
	};
	
	/**
	 * 【新增】跳转到申请上榜页面的方法
	 */
	const goToApplyPage = () => {
	    uni.navigateTo({
	        // 目标是新建/编辑页面
	        url: `/pages/myStore-edit/myStore-edit` 
	    });
	};

	/**
	 * 【修改】将原来的跳转函数修改为跳转到编辑页
	 * @param {object} store - 从子组件事件中接收到的店铺对象
	 */
	const goToEditPage = (store) => {
		uni.navigateTo({
			// 目标是修改页面
			url: `/pages/myStore-edit/myStore-edit?id=${store.id}` 
		});
	};
	
	/**
	 * 页面加载时，获取初始数据
	 */
	onMounted(() => {
		handleRefresh();
	});
</script>

<style lang="scss">
	// 样式与聚店列表页保持高度一致，确保UI统一
	.my-stores-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #ededed;
	}

	.search-container {
		background: white;
		padding: 15rpx;
		z-index: 90;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 10rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		background: #f7f7f7;
		border-radius: 20rpx;
		padding: 10rpx 10rpx 10rpx 15rpx;
		border: 1rpx solid #ffe8d9;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 24rpx;
		outline: none;
		color: #333;
		margin-left: 10rpx;
	}

	.search-btn {
		background: #FF6B00;
		color: white;
		border: none;
		padding: 10rpx 28rpx;
		border-radius: 16rpx;
		font-size: 24rpx;
		cursor: pointer;
		margin-left: 10rpx;
		line-height: 1.2;
		height: auto;
		display: inline-flex;
		align-items: center;
		&::after {
			border: none;
		}
	}

	.store-list {
		flex: 1;
		padding: 0 15rpx;
		box-sizing: border-box;
		overflow-y: hidden;
	}

	.empty-state {
		text-align: center;
		padding-top: 150rpx;
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
			margin-top: 10rpx;
			line-height: 1.5;
		}
		
		
		.empty-text {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-top: 10rpx;
			}
		
			.empty-subtext {
				font-size: 26rpx;
				color: #999;
				margin-top: 10rpx;
				margin-bottom: 40rpx;
			}
		
			.apply-button {
				background: #FF6B00;
				color: white;
				border: none;
				padding: 18rpx 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: bold;
				box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.3);
				transition: all 0.2s ease;
			}
		
			.apply-button::after {
				border: none;
			}
		
			.apply-button:active {
				background: #e05a00;
				transform: scale(0.98);
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