<!-- /pages/shop-list/shop-list.vue -->
<template>
	<view class="shop-select-page">
		<!-- 1. 搜索框 -->
		<view class="search-bar-container">
			<view class="search-bar">
				<uni-easyinput prefixIcon="search" v-model="searchKeyword" placeholder="搜索聚店名称或地址"
					@input="onSearchInput" @confirm="handleSearch" :inputBorder="false" />
				<button class="search-btn" @click="handleSearch">搜索</button>
			</view>
		</view>

		<!-- 2. 店铺列表 -->
		<view class="shop-list">
			<view v-for="shop in storeList" :key="shop.id" class="shop-item" @click="selectShop(shop)">
				<view class="shop-info">
					<view class="shop-name">{{ shop.storeName }}</view>
					<view class="shop-address">{{ shop.fullAddress }}</view>
				</view>
				<uni-icons type="right" size="16" color="#999"></uni-icons>
			</view>

			<!-- 加载状态提示 -->
			<view class="load-more-container">
				<!-- 【重要】当列表为空时不显示 'noMore' 状态 -->
				<uni-load-more v-if="storeList.length > 0" :status="loadStatus"></uni-load-more>
			</view>

			<!-- 空状态提示 -->
			<view v-if="isEmpty" class="empty-state">
				<uni-icons type="shop-filled" size="60" color="#e0e0e0"></uni-icons>
				<text>暂无相关聚店</text>
				<text class="sub-text">请尝试其他关键词</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue'; // onMounted 从 'vue' 导入
	import {
		onReachBottom
	} from '@dcloudio/uni-app'; // onReachBottom 从 '@dcloudio/uni-app' 导入
	// --- 修改结束 ---

	import request from '../../utils/request.js'; // 确认request工具的路径正确

	// --- 状态管理 ---
	const searchKeyword = ref('');
	const storeList = ref([]); // 店铺列表数据

	// 分页相关
	const pageNo = ref(1);
	const pageSize = 10; // 每页加载10条
	const loading = ref(false); // 用于防止重复请求
	const hasMore = ref(true); // 是否还有更多数据

	// --- 搜索逻辑 ---
	let searchTimer = null;

	// 输入时触发，带防抖
	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			handleSearch();
		}, 500); // 500毫秒防抖
	};

	// 点击搜索按钮或回车时立即触发
	const handleSearch = () => {
		clearTimeout(searchTimer);
		pageNo.value = 1; // 重置页码
		storeList.value = []; // 清空现有列表
		hasMore.value = true; // 重置状态
		getStoreList(); // 发起新的搜索请求
	};

	// --- 数据获取 ---
	const getStoreList = async () => {
		// 如果正在加载或没有更多数据了，则直接返回
		if (loading.value || !hasMore.value) {
			return;
		}

		loading.value = true;

		try {
			const params = {
				pageNo: pageNo.value,
				pageSize: pageSize,
				storeName: searchKeyword.value.trim(),
			};

			const {
				data: result,
				error
			} = await request('/app-api/member/store/list', {
				method: 'GET',
				data: params
			});

			console.log("123", result.list)

			if (error) {
				console.error('获取店铺列表失败:', error);
				uni.showToast({
					title: '获取店铺列表失败',
					icon: 'none'
				});
				return;
			}

			const newList = result?.list || [];
			const total = result?.total || 0;

			if (pageNo.value === 1) {
				storeList.value = newList;
				console.log("storeList", storeList.value)
			} else {
				storeList.value = [...storeList.value, ...newList];
				console.log("storeList2", storeList.value)
			}

			// 判断是否还有更多数据
			hasMore.value = storeList.value.length < total;

			if (hasMore.value) {
				pageNo.value++;
			}

		} catch (e) {
			console.error('请求异常:', e);
			uni.showToast({
				title: '网络请求异常',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};

	// --- 生命周期钩子 ---
	onMounted(() => {
		// 页面加载时，获取第一页数据
		getStoreList();
	});

	onReachBottom(() => {
		// 页面滚动到底部时，加载下一页
		getStoreList();
	});

	// --- 计算属性 ---
	// 计算加载更多组件的状态
	const loadStatus = computed(() => {
		if (loading.value) {
			return 'loading'; // 正在加载
		}
		if (!hasMore.value && storeList.value.length > 0) {
			return 'noMore'; // 没有更多了
		}
		return 'more'; // 还可以加载
	});

	// 计算是否显示空状态
	const isEmpty = computed(() => {
		return !loading.value && storeList.value.length === 0;
	});


	// --- 核心功能：选择店铺并返回 ---
	function selectShop(shop) {
		// 1. 触发一个全局事件，并把选择的店铺对象作为参数传递出去
		uni.$emit('shopSelected', shop);

		// 2. 关闭当前页面，返回到上一页（即聚会创建页）
		uni.navigateBack();
	}
</script>

<style lang="scss" scoped>
	.shop-select-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar-container {
		background-color: #fff;
		padding: 16rpx;
		border-bottom: 1rpx solid #eee;
		position: sticky;
		top: 0;
		z-index: 99;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 30rpx;
		padding-left: 10rpx; // 为按钮留出空间

		.search-btn {
			background: #FF6B00;
			color: white;
			border: none;
			padding: 10rpx 28rpx;
			border-radius: 30rpx;
			font-size: 26rpx;
			margin-left: auto;
			margin-right: 6rpx;
			line-height: 1.5;
			height: 60rpx;
			display: inline-flex;
			align-items: center;

			&::after {
				border: none;
			}
		}
	}

	.shop-list {
		// flex: 1;
		// overflow-y: auto;
		// height: 0; 
	}

	.shop-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
		padding: 30rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
		cursor: pointer;

		&:active {
			background-color: #fafafa;
		}
	}

	.shop-info {
		flex: 1;
		margin-right: 20rpx;
	}

	.shop-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
		// 单行省略
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.shop-address {
		font-size: 26rpx;
		color: #888;
		// 单行省略
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.load-more-container {
		padding: 20rpx 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		color: #999;

		.uni-icons {
			margin-bottom: 20rpx;
		}

		text {
			font-size: 28rpx;
		}

		.sub-text {
			font-size: 24rpx;
			color: #bbb;
			margin-top: 10rpx;
		}
	}
</style>