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

			<!-- 轮播图区域 -->
			<view v-if="bannerList.length > 0" class="swiper-section">
				<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000"
					:duration="500">
					<swiper-item v-for="banner in bannerList" :key="banner.id">
						<view class="swiper-item">
							<image :src="banner.imageUrl" mode="aspectFill" class="swiper-image"></image>
							<view v-if="banner.title" class="swiper-title">{{ banner.title }}</view>
						</view>
					</swiper-item>
				</swiper>
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
			:refresher-triggered="isRefreshing" @refresherrefresh="handleRefresherRefresh">
			<!-- 卡片列表 -->
			<!-- 之前这里缺少了 @click-card 事件来处理跳转 -->
			<StoreCard v-for="store in filteredStores" :key="store.id" :store="store" @click-card="goToStoreDetail" />

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
				<text>附近3公里暂无合适的“聚店”</text>
				<text>请在下方猛击 “聚店推荐” </text>
				<text>(推荐成功可获贡分)</text>
			
			</view>
		</scroll-view>

		<!-- 3. 底部操作栏 -->
		<view class="action-bar">
			<button class="action-btn share-btn" @click="shareStore">
				<uni-icons type="hand-up-filled" size="20" color="#fff"></uni-icons>
				<text>聚店推荐</text>
			</button>
			<button class="action-btn register-btn" @click="skipToNewShop">
				<uni-icons type="plus-filled" size="20" color="#fff"></uni-icons>
				<text>申请入驻</text>
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

	// --- 状态变量 ---
	const searchTerm = ref('');
	const activeFilter = ref('all');
	const allStores = ref([]);
	const loadingMore = ref(false);
	const hasMore = ref(true);
	const pageNo = ref(1);
	const pageSize = 10;
	const isRefreshing = ref(false);
	const isLoading = ref(false);
	const userLocation = ref(null);
	const filters = ref([{
		name: '全部',
		value: 'all'
	}]);
	const bannerList = ref([]);

	/**
	 * 获取实时位置的 Promise 函数
	 * 增加了高精度定位失败后自动降级的功能，提高成功率
	 * @returns {Promise<{latitude: number, longitude: number}|null>}
	 */
	const getCurrentLocation = () => {
		console.log('[定位流程] 开始执行 getCurrentLocation 函数...');

		return new Promise((resolve) => {
			let isResolved = false; // 标志位，防止重复 resolve

			// 设置一个8秒的超时定时器
			const timeoutId = setTimeout(() => {
				if (!isResolved) {
					isResolved = true;
					console.error('[定位流程] 获取位置超时（8秒），主动返回失败。');
					uni.showToast({
						title: '定位超时，请稍后重试',
						icon: 'none'
					});
					resolve(null); // 超时，主动 resolve(null) 让程序继续
				}
			}, 8000); // 8秒超时

			const handleSuccess = (res) => {
				if (!isResolved) {
					isResolved = true;
					clearTimeout(timeoutId); // 清除超时定时器
					console.log('[定位流程] 成功获取位置', res);
					const location = {
						latitude: res.latitude,
						longitude: res.longitude
					};
					userLocation.value = location;
					uni.setStorageSync('userLocation', location);
					resolve(location);
				}
			};

			const handleError = (err) => {
				if (!isResolved) {
					isResolved = true;
					clearTimeout(timeoutId); // 清除超时定时器
					console.error('[定位流程] 获取位置失败', err);
					if (isRefreshing.value) {
						uni.showToast({
							title: '定位失败，请检查权限',
							icon: 'none'
						});
					}
					resolve(null);
				}
			};

			// 开始调用 uni.getLocation
			console.log('[定位流程] 正在调用 uni.getLocation API...');
			uni.getLocation({
				type: 'gcj02',
				isHighAccuracy: true,
				accuracy: 'best',
				success: handleSuccess,
				fail: (err) => {
					console.warn('[定位流程] 高精度定位失败，尝试普通定位...', err);
					// 降级尝试
					uni.getLocation({
						type: 'gcj02',
						success: handleSuccess,
						fail: handleError,
					});
				},
			});
		});
	};

	/**
	 * 获取轮播图数据
	 */
	const fetchBanners = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/banner-rec/list', {
			method: 'GET',
			data: {
				positionCode: '1',
				pageNo: 1,
				pageSize: 50
			}
		});

		if (error) {
			console.error('获取聚店页轮播图失败:', error);
			bannerList.value = [];
			return;
		}

		if (data && data.list) {
			bannerList.value = data.list.sort((a, b) => a.sort - b.sort);
		} else {
			bannerList.value = [];
		}
	};

	/**
	 * 获取店铺列表
	 */
	const getStoreList = async () => {
		if (!userLocation.value) {
			console.warn("getStoreList 中断：位置信息为空。");
			isRefreshing.value = false;
			loadingMore.value = false;
			if (pageNo.value === 1) {
				allStores.value = [];
				hasMore.value = false;
			}
			return;
		}

		if (loadingMore.value || (pageNo.value > 1 && !hasMore.value)) {
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

		if (pageNo.value === 1) {
			allStores.value = newList;
		} else {
			allStores.value = [...allStores.value, ...newList];
		}

		if (newList.length > 0) {
			pageNo.value++;
			hasMore.value = allStores.value.length < total;
		} else {
			hasMore.value = false;
		}
	};

	/**
	 * 刷新/加载数据的核心函数
	 * @param {boolean} isPullDown - 是否由下拉刷新触发
	 */
	const handleRefresh = async (isPullDown = false) => {
		// 【关键】检查“加载锁”，如果正在加载，则直接退出，防止重复执行
		if (isLoading.value) {
			console.log("刷新操作已在进行中，本次触发被忽略。");
			return;
		}

		// 上锁，开始加载流程
		isLoading.value = true;

		if (isPullDown) {
			isRefreshing.value = true;
		} else {
			uni.showLoading({
				title: '加载中...'
			});
		}

		try {
			// --- 核心逻辑 ---
			const location = await getCurrentLocation();

			pageNo.value = 1;
			hasMore.value = true;
			allStores.value = [];

			if (location) {
				await getStoreList();
			}
		} catch (error) {
			// 捕获意料之外的错误
			console.error("handleRefresh 过程中捕获到错误:", error);
		} finally {
			// 【关键】解锁！无论成功或失败，最后一定要把锁打开
			isLoading.value = false;

			// 恢复UI状态
			if (isPullDown) {
				isRefreshing.value = false;
			} else {
				uni.hideLoading();
			}
		}
	};

	/**
	 * 获取店铺分类
	 */
	const getShopType = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: {
				type: "member_store_category"
			}
		});
		if (error) {
			return;
		}
		if (data && data.length > 0) {
			const dynamicFilters = data.map(item => ({
				name: item.label,
				value: item.value
			}));
			filters.value = [{
				name: '全部',
				value: 'all'
			}, ...dynamicFilters];
		}
	};


	// --- 生命周期钩子 ---

	onMounted(() => {
		getShopType();
		fetchBanners();
	});

	onShow(() => {
		// 只有在列表为空（首次进入）时，才触发自动刷新
		if (allStores.value.length === 0) {
			console.log('onShow: 列表为空，执行初次加载...');
			// 尝试从缓存快速恢复位置，避免加载白屏
			const storedLocation = uni.getStorageSync('userLocation');
			if (storedLocation) {
				userLocation.value = storedLocation;
			}
			handleRefresh();
		} else {
			console.log('onShow: 列表已有数据，不自动刷新位置。');
		}
	});

	const handleRefresherRefresh = async () => {
		// 为了调试，先放一个日志确保它被调用了
		console.log('--- scroll-view 的 @refresherrefresh 事件已触发 ---');
		await handleRefresh(true);
	};



	// --- 用户交互与监听 ---

	const loadMore = () => {
		getStoreList();
	};

	watch(activeFilter, (newValue, oldValue) => {
		// 用户主动切换筛选分类，刷新数据
		if (newValue !== oldValue) {
			handleRefresh();
		}
	});

	// 计算属性，保持模板简洁
	const filteredStores = computed(() => allStores.value);

	let searchTimer = null;
	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			handleRefresh(); // 用户输入停止后，主动刷新
		}, 500);
	};

	const handleSearchClick = () => {
		clearTimeout(searchTimer);
		handleRefresh(); // 用户点击搜索，立即主动刷新
	};

	const selectFilter = (filterValue) => {
		activeFilter.value = filterValue;
	};


	// --- 页面跳转 ---

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
	const skipToNewShop = () => {
		uni.navigateTo({
			url: '/pages/myStore-edit/myStore-edit'
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

	/* 【新增】轮播图样式，与聚会页保持一致 */
	.swiper-section {
		margin-top: 20rpx; // 与搜索框拉开一点距离
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.swiper {
		height: 250rpx; // 聚店页的轮播图可以稍微矮一些
	}

	.swiper-item {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.swiper-title {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 36rpx;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}

	.filters-scroll {
		white-space: nowrap;
		width: 100%;
		padding-top: 20rpx;
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
		font-size: 28rpx;
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
		background: linear-gradient(to right, #007bff, #0056b3);
		color: #fff;
		margin-right: 10rpx;
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
		// font-size: 32rpx
	}
</style>