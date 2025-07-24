<template>
	<view class="app">

		<!-- 1. 搜索和筛选区域 -->
		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="20" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索聚店名称或关键词" v-model="searchTerm"
					@input="onSearchInput" />
				<button class="search-btn" @click="handleSearchClick">搜索</button>
			</view>

			<scroll-view scroll-x class="filters-scroll">
				<view class="filters">
					<!-- v-for 动态渲染从接口获取的 filters -->
					<button v-for="filter in filters" :key="filter.value" class="filter-btn"
						:class="{ active: activeFilter === filter.value }" @click="selectFilter(filter.value)">
						{{ filter.name }}
					</button>
				</view>
			</scroll-view>
		</view>

		<!-- 2. 店铺列表区域 -->
		<scroll-view class="store-list" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="onPullDownRefresh">
			<!-- 卡片列表 -->
			<!-- 修复：之前这里缺少了 @click-card 事件来处理跳转 -->
			<StoreCard v-for="store in filteredStores" :key="store.id" :store="store"  @click-card="goToStoreDetail" />

			<!-- 加载状态提示 -->
			<view v-if="loadingMore" class="load-more">
				<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			<view v-if="!hasMore && allStores.length > 0" class="load-more">
				<uni-icons type="checkmarkempty" size="20" color="#999"></uni-icons>
				<text>已加载全部内容</text>
			</view>

			<!-- 空状态提示 -->
			<view v-if="allStores.length === 0 && !loadingMore && !isRefreshing" class="empty-state">
				<uni-icons type="info" size="60" color="#ffd8c1"></uni-icons>
				<text>暂无相关聚店</text>
				<text>请尝试其他关键词或筛选条件</text>
			</view>
		</scroll-view>

		<!-- 3. 底部操作栏 -->
		<view class="action-bar">
			<button class="action-btn share-btn" @click="shareStore">
				<uni-icons type="redo" size="20" color="#fff"></uni-icons>
				<text>聚店推荐</text>
			</button>
			<button class="action-btn register-btn" open-type="contact">
				<uni-icons type="plus-filled" size="20" color="#fff"></uni-icons>
				<text>申请上榜</text>
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch
	} from 'vue';
	import {
		onShow
	} from '@dcloudio/uni-app';
	import StoreCard from '../../components/StoreCard.vue';
	import request from '../../utils/request.js';

	const searchTerm = ref('');
	const activeFilter = ref('all');

	// --- 状态变量 ---
	const allStores = ref([]);
	const loadingMore = ref(false);
	const hasMore = ref(true);
	const pageNo = ref(1);
	const pageSize = 10;
	const isRefreshing = ref(false);
	const userLocation = ref(null);
	const filters = ref([{
		name: '全部',
		value: 'all'
	}]);
	// [新增] 一个标志位，防止 onShow 和 onMounted 中的位置获取逻辑冲突
	const isLocationLoaded = ref(false);

	/**
	 * 获取店铺列表
	 */
	const getStoreList = async () => {
		if (loadingMore.value || !hasMore.value) {
			return;
		}
		// [核心修改] 这里的判断依然保留，作为最后一道防线
		if (!userLocation.value) {
			console.log('getStoreList 被调用，但位置信息依然为空，已中断。');
			isRefreshing.value = false;
			return;
		}

		loadingMore.value = true;

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			storeName: searchTerm.value.trim(),
			longitude: userLocation.value.longitude,
			latitude: userLocation.value.latitude,
		};

		if (activeFilter.value !== 'all') {
			params.category = activeFilter.value;
		}

		const {
			data: result,
			error
		} = await request('/app-api/member/store/list', {
			method: 'GET',
			data: params
		});

		loadingMore.value = false;
		isRefreshing.value = false;

		if (error) {
			console.error('获取店铺列表失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		const newList = result ? result.list : [];
		const total = result ? result.total : 0;

		if (newList && newList.length > 0) {
			allStores.value = pageNo.value === 1 ? newList : [...allStores.value, ...newList];
			pageNo.value++;
			hasMore.value = allStores.value.length < total;
		} else {
			if (pageNo.value === 1) {
				allStores.value = [];
			}
			hasMore.value = false;
		}
	};

	/**
	 * [核心修改] 封装一个获取位置并加载数据的主函数
	 */
	const initData = () => {
		const storedLocation = uni.getStorageSync('userLocation');
		if (storedLocation) {
			console.log('从缓存加载位置信息');
			userLocation.value = storedLocation;
			isLocationLoaded.value = true;
			// 有缓存位置，直接刷新列表
			handleRefresh();
		} else {
			console.log('缓存中无位置，开始请求...');
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					console.log('成功获取新位置信息');
					const location = {
						latitude: res.latitude,
						longitude: res.longitude
					};
					userLocation.value = location;
					uni.setStorageSync('userLocation', location);
					isLocationLoaded.value = true;
					// [关键] 在获取位置成功的回调里，才去刷新列表
					handleRefresh();
				},
				fail: (err) => {
					console.error('获取位置信息失败:', err);
					isLocationLoaded.value = true; // 标记为已处理，防止 onShow 重复调用
					uni.showModal({
						title: '定位失败',
						content: '无法获取您的位置信息，将无法为您推荐附近的聚店。',
						showCancel: false,
						success: () => {
							// 定位失败，列表将显示为空状态
							handleRefresh();
						}
					});
				}
			});
		}
	};
	
	/**
	 * 获取店铺分类
	 */
	const getShopType = async () => {
		const { data, error } = await request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: { type: "member_store_category" }
		});
		if (error) { return; }
		if (data && data.length > 0) {
			const dynamicFilters = data.map(item => ({ name: item.label, value: item.value }));
			filters.value = [{ name: '全部', value: 'all' }, ...dynamicFilters];
		}
	};
	
	/**
	 * onMounted: 仅执行一次性的初始化，比如获取分类
	 */
	onMounted(() => {
		getShopType();
	});

	/**
	 * onShow: 每次页面显示时检查数据是否需要加载
	 */
	onShow(() => {
		// 如果位置信息还未加载过（首次进入或权限被重置后），则启动初始化流程
		if (!isLocationLoaded.value) {
			initData();
		}
	});

	// --- 以下为辅助函数和监听器，逻辑基本不变 ---

	const handleRefresh = () => {
		pageNo.value = 1;
		allStores.value = [];
		hasMore.value = true;
		getStoreList();
	};
	
	const loadMore = () => {
		getStoreList();
	};
	
	const onPullDownRefresh = () => {
		isRefreshing.value = true;
		handleRefresh();
	};

	watch(activeFilter, (newValue, oldValue) => {
		// 只有在值真正改变时才刷新，避免 onShow 触发不必要的刷新
		if(newValue !== oldValue) {
			handleRefresh();
		}
	});

	const filteredStores = computed(() => allStores.value);

	let searchTimer = null;
	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			handleRefresh();
		}, 500);
	};

	const handleSearchClick = () => {
		clearTimeout(searchTimer);
		handleRefresh();
	};

	const selectFilter = (filterValue) => {
		activeFilter.value = filterValue;
	};

	const goToStoreDetail = (store) => {
		uni.navigateTo({
			url: `/pages/shop-detail/shop-detail?id=${store.id}`
		});
	};

	const shareStore = () => {
		uni.navigateTo({
			url: '/pages/shop-recommend/shop-recommend'
		});
	};
</script>

<style lang="scss">
	:root {
		--primary: #FF6B00;
		--primary-light: #FF8A33;
		--light-bg: #f8f8f8;
		--dark-text: #333;
		--gray-text: #666;
		--light-text: #999;
		--border: #eee;
		--weui-BG-0: #ededed;
		--weui-BG-1: #f7f7f7;
	}

	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #ededed;
		color: #333;
		font-size: 16px;
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
		padding: 10rpx 10rpx 10rpx 15rpx; // 调整内边距适应按钮
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

	/* 新增：搜索按钮的样式 */
	.search-btn {
		background: #FF6B00;
		color: white;
		border: none;
		padding: 10rpx 28rpx;
		border-radius: 16rpx;
		font-size: 24rpx;
		cursor: pointer;
		margin-left: 10rpx;
		/* 与输入框隔开一些距离 */
		line-height: 1.2;
		/* 修正按钮文字垂直居中 */
		height: auto;
		display: inline-flex;
		align-items: center;
	}

	/* 新增：去除uni-app按钮默认边框 */
	.search-btn::after {
		border: none;
	}

	.filters-scroll {
		white-space: nowrap;
		width: 100%;
		padding-top: 15rpx;
	}

	.filters {
		display: flex;
		gap: 10rpx;
	}

	.filter-btn {
		background: #f1f1f1;
		color: var(--gray-text);
		border: none;
		padding: 16rpx 28rpx;
		border-radius: 16rpx;
		font-size: 24rpx;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
		line-height: 1;
		margin: 0;
	}

	.filter-btn::after {
		border: none;
	}

	.filter-btn.active {
		background: #FF6B00;
		color: white;
		font-weight: 500;
	}

	.store-list {
		flex: 1;
		padding: 0 15rpx;
		box-sizing: border-box;
		overflow-y: hidden;
	}

	.empty-state {
		text-align: center;
		padding-top: 100rpx;
		color: #999;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-state .uni-icons {
		margin-bottom: 20rpx;
	}

	.empty-state text {
		font-size: 28rpx;
		margin-top: 10rpx;
		line-height: 1.5;
	}

	.load-more {
		text-align: center;
		padding: 15rpx;
		color: #999;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.load-more .uni-icons {
		margin-right: 5rpx;
	}

	.action-bar {
		background: white;
		display: flex;
		padding: 20rpx;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		border-radius: 8rpx;
		font-weight: 500;
		cursor: pointer;
		line-height: 1;
	}

	.action-btn .uni-icons {
		margin-right: 5rpx;
	}

	.share-btn {
		background: #00A0E9;
		color: #fff;
		margin-right: 10rpx;
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
		// font-size: 32rpx
	}
</style>