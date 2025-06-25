<template>
	<view class="app">

		<!-- 1. 搜索和筛选区域 -->
		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="20" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索聚店名称或关键词" v-model="searchTerm"
					@input="onSearchInput" />
				<!-- 新增：搜索按钮 -->
				<button class="search-btn" @click="handleSearchClick">搜索</button>
			</view>

			<scroll-view scroll-x class="filters-scroll">
				<view class="filters">
					<button v-for="filter in filters" :key="filter.value" class="filter-btn"
						:class="{ active: activeFilter === filter.value }" @click="selectFilter(filter.value)">
						{{ filter.name }}
					</button>
				</view>
			</scroll-view>
		</view>

		<!-- 2. 店铺列表区域 -->
		<scroll-view class="store-list" scroll-y="true" @scrolltolower="loadMore">
			<!-- 卡片列表 -->
			<StoreCard v-for="store in filteredStores" :key="store.id" :store="store" @click="goToStoreDetail(store)" />


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
			<view v-if="allStores.length === 0 && !loadingMore" class="empty-state">
				<uni-icons type="info" size="60" color="#ffd8c1"></uni-icons>
				<text>暂无相关聚店</text>
				<text>请尝试其他关键词或筛选条件</text>
			</view>
		</scroll-view>

		<!-- 3. 底部操作栏 -->
		<view class="action-bar">
			<view class="action-btn share-btn" @click="shareStore">
				<uni-icons type="redo" size="20" color="#333"></uni-icons>
				<text>聚店推荐</text>
			</view>
			<view class="action-btn register-btn" @click="applyToList">
				<uni-icons type="plus-filled" size="20" color="#fff"></uni-icons>
				<text>申请上榜</text>
			</view>
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
	import StoreCard from '../../components/StoreCard.vue';
	import request from '../../utils/request.js';

	const searchTerm = ref('');
	const activeFilter = ref('all');

	// 分页和列表状态
	const allStores = ref([]);
	const loadingMore = ref(false);
	const hasMore = ref(true);
	const pageNo = ref(1);
	const pageSize = 5;

	// 新增：用于存储用户位置信息的响应式变量
	const userLocation = ref(null);

	// 修改：getStoreList 方法
	// 修改后的 getStoreList 函数
	const getStoreList = async () => {
		// 如果正在加载或没有更多数据了，则直接返回
		if (loadingMore.value || !hasMore.value) {
			return;
		}
	
		// 如果还没有获取到位置信息，则不发起请求
		if (!userLocation.value) {
			console.log('等待位置信息获取...');
			allStores.value = [];
			hasMore.value = false; // 避免触发loadMore
			return;
		}
	
		loadingMore.value = true;
	
		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			storeName: searchTerm.value.trim(),
			// longitude: userLocation.value.longitude, 
			// latitude: userLocation.value.latitude,
		};
	    
	    // --- 修改开始 ---
	
		// 1. 修改变量名，因为返回的不再是列表，而是一个包含列表的对象
		const {
			data: result, // 将 newList 重命名为 result，因为它现在是 { list: [], total: 6 }
			error
		} = await request('/app-api/member/store/list', {
			method: 'GET',
			data: params
		});
	
		console.log("API Response:", result) // 打印完整的响应对象
	
		loadingMore.value = false;
	
		if (error) {
			console.error('获取店铺列表失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}
	
		// 2. 从 result 对象中获取真正的列表数组
		//    并进行安全检查，防止 result 或 result.list 为 null 或 undefined
		const newList = result ? result.list : [];
		const total = result ? result.total : 0;
	
		if (newList && newList.length > 0) {
			// 3. 使用 newList (即 result.list) 来更新 allStores
			allStores.value = pageNo.value === 1 ? newList : [...allStores.value, ...newList];
			pageNo.value++;
			// 4. (推荐) 使用 total 来判断是否还有更多数据，这比判断当前页数量更准确
			hasMore.value = allStores.value.length < total;
		} else {
			if (pageNo.value === 1) {
				allStores.value = [];
			}
			hasMore.value = false;
		}
	    // --- 修改结束 ---
	};

	// 修改：页面挂载时的逻辑
	onMounted(() => {
		// 1. 尝试从本地缓存中获取位置信息
		const storedLocation = uni.getStorageSync('userLocation');
		
		if (storedLocation) {
			// 2. 如果缓存中存在，则直接使用
			console.log('从缓存加载位置信息:', storedLocation);
			userLocation.value = storedLocation;
			// 直接获取店铺列表
			getStoreList();
		} else {
			// 3. 如果缓存中不存在，则调用API获取
			console.log('缓存中无位置信息，开始请求授权...');
			uni.getLocation({
				type: 'gcj02', // 国测局坐标，适用于大多数国内地图服务
				success: (res) => {
					console.log('成功获取位置信息:', res);
					const location = {
						latitude: res.latitude,
						longitude: res.longitude
					};
					// 将获取到的位置信息存入响应式变量
					userLocation.value = location;
					// 将位置信息存入本地缓存，下次使用
					uni.setStorageSync('userLocation', location);
					// 获取店铺列表
					getStoreList();
				},
				fail: (err) => {
					console.error('获取位置信息失败:', err);
					uni.showModal({
						title: '定位失败',
						content: '无法获取您的位置信息，将无法为您推荐附近的聚店。请检查系统定位服务是否开启，并允许应用获取位置权限。',
						showCancel: false,
						success: () => {
							// 用户拒绝后，虽然没有位置，但还是可以尝试加载一个不依赖位置的列表
							// 这里我们选择显示空状态，因为API需要经纬度
							// 如果你的API支持无经纬度查询，可以在这里再次调用getStoreList
							allStores.value = [];
							hasMore.value = false;
						}
					});
				}
			});
		}
	});

	const loadMore = () => {
		// 确保有位置信息才加载更多
		if (userLocation.value) {
			getStoreList();
		}
	};

	const handleRefresh = () => {
		pageNo.value = 1;
		allStores.value = [];
		hasMore.value = true;
		// 确保有位置信息才刷新
		if (userLocation.value) {
			getStoreList();
		}
	};

	watch(activeFilter, () => {
		handleRefresh();
	});

	const filteredStores = computed(() => allStores.value);

	let searchTimer = null;

	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			console.log(`搜索关键词: ${searchTerm.value}`);
			handleRefresh();
		}, 500);
	};

	const handleSearchClick = () => {
		clearTimeout(searchTimer);
		handleRefresh();
	};


	// --- 以下为其余辅助函数，保持不变 ---

	const filters = ref([{
			name: '全部',
			value: 'all'
		},
		{
			name: '咖啡',
			value: 'coffee'
		},
		{
			name: '茶馆',
			value: 'tea-house'
		},
		{
			name: '美食',
			value: 'food'
		},
		{
			name: '酒吧',
			value: 'bar'
		},
		{
			name: '其他',
			value: 'other'
		},
	]);

	const selectFilter = (filterValue) => {
		activeFilter.value = filterValue;
	};

	const goToStoreDetail = (store) => {
		uni.navigateTo({
			url: `/pages/store/detail?id=${store.id}`
		});
	};

	const shareStore = () => {
		uni.navigateTo({
			url: '/pages/shop-recommend/shop-recommend'
		})
	};

	const applyToList = () => {
		uni.showToast({
			title: '申请上榜',
			icon: 'none'
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
		background-color:#ededed;
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
		margin-left: 10rpx; /* 与输入框隔开一些距离 */
		line-height: 1.2; /* 修正按钮文字垂直居中 */
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
		background: #f0f0f0;
		color: #333;
		margin-right: 10rpx;
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
	}
</style>