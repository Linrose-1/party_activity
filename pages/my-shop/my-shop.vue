<template>
	<view class="my-stores-page">
		<!-- 1. 搜索区域 -->
		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="20" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索我的聚店名称" v-model="searchTerm"
					@input="onSearchInput" @confirm="handleSearchClick" />
				<view class="search-btn" @click="handleSearchClick">
					<text>搜索</text>
				</view>
			</view>
		</view>

		<!-- 2. 店铺列表区域 -->
		<!-- 修复3：handleRefresh 的 finally 里重置 isRefreshing，此处 @refresherrefresh 正确传参 -->
		<scroll-view class="store-list" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="onPullDownRefresh">
			<!-- 卡片列表 -->
			<!-- 修复1：传入 mode="mine"，绑定 @edit-store 事件 -->
			<!-- 修复2：@update-like 绑定处理函数（mine 模式下不显示赞踩，但保持绑定以防万一） -->
			<StoreCard v-for="store in stores" :key="store.id" :store="store" mode="mine" @click-card="goToStoreDetail"
				@edit-store="goToEditPage" @update-like="handleLikeChange" />

			<!-- 加载中 -->
			<view v-if="loadingMore" class="load-more">
				<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			<!-- 已加载全部 -->
			<view v-if="!hasMore && stores.length > 0" class="load-more">
				<uni-icons type="checkmarkempty" size="20" color="#999"></uni-icons>
				<text>没有更多了</text>
			</view>

			<!-- 空状态 -->
			<view v-if="stores.length === 0 && !loadingMore && !isRefreshing" class="empty-state">
				<uni-icons type="shop" size="60" color="#ffd8c1"></uni-icons>
				<text class="empty-text">您还没有自己的聚店</text>
				<text class="empty-subtext">立即申请，让更多人发现您的店铺</text>
				<view class="apply-button" @click="goToApplyPage">
					<text>申请入驻</text>
				</view>
			</view>

			<view style="height: 40rpx;"></view>
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
	import StoreCard from '../../components/StoreCard.vue';
	import request from '../../utils/request.js';

	// ─── 状态变量 ───
	const searchTerm = ref('');
	const stores = ref([]);
	const pageNo = ref(1);
	const pageSize = 10;
	const hasMore = ref(true);
	const loadingMore = ref(false);
	const isRefreshing = ref(false);
	const isLoading = ref(false);

	// ─── 数据请求 ───

	/**
	 * 获取我的聚店列表（分页）
	 * 第1页时重置列表，后续页追加
	 */
	const getMyStores = async () => {
		if (loadingMore.value || (pageNo.value > 1 && !hasMore.value)) return;

		loadingMore.value = true;

		const {
			data: result,
			error
		} = await request('/app-api/member/store/my-list', {
			method: 'GET',
			data: {
				pageNo: pageNo.value,
				pageSize,
				storeName: searchTerm.value.trim()
			}
		});

		loadingMore.value = false;

		if (error) {
			console.error('[我的聚店] 获取失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		const newList = result?.list ?? [];
		const total = result?.total ?? 0;

		if (pageNo.value === 1) {
			stores.value = newList;
		} else {
			stores.value = [...stores.value, ...newList];
		}

		if (newList.length > 0) {
			pageNo.value++;
			hasMore.value = stores.value.length < total;
		} else {
			hasMore.value = false;
		}
	};

	/**
	 * 统一刷新函数：重置分页后重新拉取第1页
	 * 修复3：finally 里统一重置 isRefreshing，防止下拉永久卡住
	 */
	const handleRefresh = async () => {
		if (isLoading.value) return;
		isLoading.value = true;

		try {
			pageNo.value = 1;
			hasMore.value = true;
			stores.value = [];
			await getMyStores();
		} catch (e) {
			console.error('[我的聚店] 刷新异常:', e);
		} finally {
			isLoading.value = false;
			// 修复3：无论成功失败，都重置下拉刷新状态
			isRefreshing.value = false;
		}
	};

	/**
	 * 上拉加载更多
	 */
	const loadMore = () => {
		if (hasMore.value) getMyStores();
	};

	/**
	 * 下拉刷新
	 */
	const onPullDownRefresh = () => {
		isRefreshing.value = true;
		handleRefresh();
	};


	// ─── 搜索 ───

	let searchTimer = null;

	/**
	 * 输入框防抖搜索：停止输入 500ms 后自动触发
	 */
	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			handleRefresh();
		}, 500);
	};

	/**
	 * 点击搜索按钮或键盘确认，立即触发
	 */
	const handleSearchClick = () => {
		clearTimeout(searchTimer);
		handleRefresh();
	};


	// ─── 页面跳转 ───

	/**
	 * 点击"聚店详情"按钮，跳转到详情页
	 * 修复1：此函数只负责详情跳转，不再是编辑页
	 * @param {object} store - 店铺数据
	 */
	const goToStoreDetail = (store) => {
		uni.navigateTo({
			url: `/packages/shop-detail/shop-detail?id=${store.id}`
		});
	};

	/**
	 * 点击"编辑聚店"按钮，跳转到编辑页
	 * @param {object} store - 店铺数据
	 */
	const goToEditPage = (store) => {
		uni.navigateTo({
			url: `/packages/myStore-edit/myStore-edit?id=${store.id}`
		});
	};

	/**
	 * 空状态"申请入驻"按钮，跳转到新建店铺页
	 */
	const goToApplyPage = () => {
		uni.navigateTo({
			url: '/packages/myStore-edit/myStore-edit'
		});
	};

	/**
	 * 处理赞踩操作（mine 模式下不展示赞踩，此函数作为兜底防止报错）
	 */
	const handleLikeChange = () => {};


	// ─── 生命周期 ───

	onMounted(() => {
		handleRefresh();
	});
</script>

<style lang="scss">
	.my-stores-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	/* ── 搜索区域 ── */
	.search-container {
		background: #fff;
		padding: 20rpx;
		z-index: 90;
		border-bottom: 1rpx solid #eee;
	}

	.search-box {
		display: flex;
		align-items: center;
		background: #f7f7f7;
		border-radius: 40rpx;
		padding: 14rpx 20rpx;
		border: 1rpx solid #ffe8d9;
	}

	.search-input {
		flex: 1;
		background: transparent;
		font-size: 26rpx;
		color: #333;
		margin-left: 10rpx;
	}

	/* 修复4：搜索按钮改用 view，避免 button 的 WXSS &::after 编译报错 */
	.search-btn {
		background: #FF6B00;
		padding: 10rpx 28rpx;
		border-radius: 30rpx;
		margin-left: 10rpx;

		text {
			font-size: 26rpx;
			color: #fff;
			line-height: 1;
		}
	}

	/* ── 列表区域 ── */
	.store-list {
		flex: 1;
		height: 0;
		/* 配合 flex:1 使内部可独立滚动 */
		padding: 20rpx;
		box-sizing: border-box;
	}

	/* ── 加载更多 ── */
	.load-more {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	/* ── 空状态 ── */
	.empty-state {
		text-align: center;
		padding-top: 150rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-top: 20rpx;
	}

	.empty-subtext {
		font-size: 26rpx;
		color: #999;
		margin-top: 10rpx;
		margin-bottom: 40rpx;
	}

	/* 申请入驻按钮：改用 view 避免 button 编译问题 */
	.apply-button {
		background: #FF6B00;
		padding: 18rpx 80rpx;
		border-radius: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.3);

		text {
			font-size: 28rpx;
			color: #fff;
			font-weight: bold;
		}

		&:active {
			opacity: 0.85;
		}
	}
</style>