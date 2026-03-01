<template>
	<view class="app">

		<!-- 1. 顶部固定区域：搜索 + 定位 -->
		<view class="fixed-header">
			<view class="search-location-bar">
				<!-- 左侧定位 -->
				<view class="location-trigger" @click="handleChooseLocation">
					<text class="city-text">{{ shortAddress }}</text>
					<uni-icons type="bottom" size="12" color="#333"></uni-icons>
				</view>
				<!-- 中间搜索框 -->
				<view class="search-box">
					<uni-icons type="search" size="16" color="#999"></uni-icons>
					<!-- 修复3：补上 @input 绑定，使输入防抖生效 -->
					<input class="search-input" type="text" placeholder="搜索聚店名称或关键词..." v-model="searchTerm"
						@input="onSearchInput" @confirm="handleSearchClick" />
				</view>
				<!-- 右侧搜索按钮 -->
				<view class="search-btn-text" @click="handleSearchClick">搜索</view>
			</view>
		</view>

		<!-- 2. 可滚动区域 -->
		<scroll-view class="main-scroll" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="handleRefresherRefresh">
			<!-- 2.1 轮播图 -->
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

			<!-- 2.2 功能入口区 -->
			<view class="function-grid">
				<view class="func-item" @click="shareStore">
					<view class="icon-box share-bg">
						<uni-icons type="hand-up-filled" size="24" color="#fff"></uni-icons>
					</view>
					<text>推荐聚店</text>
				</view>
				<view class="func-item" @click="skipToNewShop">
					<view class="icon-box join-bg">
						<uni-icons type="shop-filled" size="24" color="#fff"></uni-icons>
					</view>
					<text>自荐聚店</text>
				</view>
			</view>

			<!-- 2.3 吸顶筛选栏 -->
			<view class="sticky-tabs">
				<scroll-view scroll-x class="filters-scroll">
					<view class="filters">
						<button v-for="filter in filters" :key="filter.value" class="filter-btn"
							:class="{ active: activeFilter === filter.value }" @click="selectFilter(filter.value)">
							{{ filter.name }}
						</button>
					</view>
				</scroll-view>
			</view>

			<!-- 2.4 店铺列表 -->
			<view class="store-list-container">
				<StoreCard v-for="store in filteredStores" :key="store.id" :store="store" @click-card="goToStoreDetail"
					@update-like="handleLikeChange" />

				<!-- 加载中 -->
				<view v-if="loadingMore" class="load-more">
					<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
					<text>加载中...</text>
				</view>
				<!-- 已加载全部 -->
				<view v-if="!hasMore && allStores.length > 0" class="load-more">
					<uni-icons type="checkmarkempty" size="20" color="#999"></uni-icons>
					<text>已加载全部内容</text>
				</view>

				<!-- 空状态 -->
				<view v-if="allStores.length === 0 && !loadingMore && !isRefreshing" class="empty-state">
					<uni-icons type="info" size="60" color="#ffd8c1"></uni-icons>
					<text>附近3公里暂无合适的"聚店"</text>
					<text>请在下方猛击 "聚店推荐" </text>
					<text>(推荐成功可获贡分)</text>
				</view>
			</view>

			<view style="height: 20rpx;"></view>
		</scroll-view>

	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch,
		onUnmounted
	} from 'vue';
	import {
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import StoreCard from '../../components/StoreCard.vue';
	import request from '../../utils/request.js';
	import {
		getInviteCode,
		checkLoginGuard
	} from '../../utils/user.js';

	// ─── 状态变量 ───
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
	const displayAddress = ref('');

	// ─── 计算属性 ───

	/**
	 * 顶部显示的简短地址，超过4字截断加省略号
	 */
	const shortAddress = computed(() => {
		if (!displayAddress.value) return '定位中';
		if (displayAddress.value.length > 4) {
			return displayAddress.value.substring(0, 4) + '...';
		}
		return displayAddress.value;
	});

	/** 保持模板简洁，filteredStores 直接映射 allStores */
	const filteredStores = computed(() => allStores.value);


	// ─── 定位 ───

	/**
	 * 获取实时 GPS 位置
	 * 高精度定位失败时自动降级为普通定位，8秒超时后主动 resolve(null)
	 * 定位成功后同步更新顶部地址显示（逆地理编码）
	 * @returns {Promise<{latitude: number, longitude: number} | null>}
	 */
	const getCurrentLocation = () => {
		console.log('[定位] 开始定位...');

		return new Promise((resolve) => {
			let isResolved = false;

			// 8 秒超时保护，防止定位 API 无响应时页面一直卡住
			const timeoutId = setTimeout(() => {
				if (!isResolved) {
					isResolved = true;
					console.error('[定位] 超时（8秒），主动返回失败');
					uni.showToast({
						title: '定位超时，请稍后重试',
						icon: 'none'
					});
					resolve(null);
				}
			}, 8000);

			const handleSuccess = (res) => {
				if (isResolved) return;
				isResolved = true;
				clearTimeout(timeoutId);
				console.log('[定位] 成功:', res);

				const location = {
					latitude: res.latitude,
					longitude: res.longitude
				};
				userLocation.value = location;
				uni.setStorageSync('userLocation', location);

				// 逆地理编码，将经纬度转为可读地址
				uni.request({
					url: `https://restapi.amap.com/v3/geocode/regeo?key=您的高德Web服务KEY&location=${res.longitude},${res.latitude}`,
					success: (geoRes) => {
						const address = geoRes.data?.regeocode?.formatted_address || '当前位置';
						displayAddress.value = address;
						uni.setStorageSync('displayAddress', address);
					},
					fail: () => {
						displayAddress.value = '当前位置';
						uni.setStorageSync('displayAddress', '当前位置');
					}
				});

				resolve(location);
			};

			const handleError = (err) => {
				if (isResolved) return;
				isResolved = true;
				clearTimeout(timeoutId);
				console.error('[定位] 失败:', err);
				uni.showToast({
					title: '定位失败，请检查权限',
					icon: 'none'
				});
				resolve(null);
			};

			// 先尝试高精度定位，失败后降级
			uni.getLocation({
				type: 'gcj02',
				isHighAccuracy: true,
				accuracy: 'best',
				success: handleSuccess,
				fail: (err) => {
					console.warn('[定位] 高精度失败，尝试普通定位...', err);
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
	 * 用户手动点击左上角地址，打开地图选点
	 * 选点成功后更新地址和位置缓存，并立即刷新列表
	 */
	const handleChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log('[选址] 用户手动选择:', res);
				const newAddress = res.name || res.address;
				const newLocation = {
					latitude: res.latitude,
					longitude: res.longitude
				};

				displayAddress.value = newAddress;
				userLocation.value = newLocation;
				uni.setStorageSync('userLocation', newLocation);
				uni.setStorageSync('displayAddress', newAddress);

				handleRefresh();
			},
			fail: (err) => {
				if (!err.errMsg.includes('cancel')) {
					uni.showToast({
						title: '选择位置失败',
						icon: 'none'
					});
				}
			}
		});
	};


	// ─── 数据请求 ───

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
			console.error('[Banner] 获取失败:', error);
			bannerList.value = [];
			return;
		}

		bannerList.value = data?.list ? data.list.sort((a, b) => a.sort - b.sort) : [];
	};

	/**
	 * 获取店铺分类，用于顶部筛选栏
	 */
	const getShopType = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: {
				type: 'member_store_category'
			}
		});

		if (error || !data?.length) return;

		filters.value = [{
				name: '全部',
				value: 'all'
			},
			...data.map(item => ({
				name: item.label,
				value: item.value
			}))
		];
	};

	/**
	 * 获取店铺列表（分页）
	 * 若有位置信息则附带经纬度参数
	 * 第1页时重置列表，后续页追加
	 */
	const getStoreList = async () => {
		if (loadingMore.value || (pageNo.value > 1 && !hasMore.value)) return;

		loadingMore.value = true;

		const params = {
			pageNo: pageNo.value,
			pageSize,
			storeName: searchTerm.value.trim(),
		};

		if (userLocation.value) {
			params.longitude = userLocation.value.longitude;
			params.latitude = userLocation.value.latitude;
		}

		if (activeFilter.value !== 'all') {
			params.category = activeFilter.value;
		}

		console.log('[StoreList] 请求参数:', params);

		const {
			data: result,
			error
		} = await request('/app-api/member/store/list', {
			method: 'GET',
			data: params
		});

		loadingMore.value = false;

		if (error) {
			if (error.includes('信息绑定')) {
				console.warn('[StoreList] 需绑定信息才能查看更多');
				await checkLoginGuard();
				return;
			}
			console.error('[StoreList] 获取失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		const newList = result?.list ?? [];
		const total = result?.total ?? 0;

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
	 * 刷新列表核心函数（重置分页后重新拉取第1页）
	 * @param {boolean} isPullDown - 是否由下拉刷新触发
	 */
	const handleRefresh = async (isPullDown = false) => {
		if (isLoading.value) return;
		isLoading.value = true;

		if (isPullDown) {
			isRefreshing.value = true;
		}

		try {
			pageNo.value = 1;
			hasMore.value = true;
			allStores.value = [];
			await getStoreList();
		} catch (error) {
			console.error('[handleRefresh] 异常:', error);
		} finally {
			isLoading.value = false;
			// 修复1：无论成功失败，都重置下拉刷新状态，防止永久卡住
			isRefreshing.value = false;
		}
	};

	/**
	 * scroll-view 下拉刷新触发
	 * 修复1：调用 handleRefresh(true)，结束后 finally 里会重置 isRefreshing
	 */
	const handleRefresherRefresh = async () => {
		console.log('[下拉刷新] 触发');
		await handleRefresh(true);
	};

	/**
	 * 滚动到底部时触发加载更多
	 */
	const loadMore = () => {
		getStoreList();
	};


	// ─── 互动操作 ───

	/**
	 * 处理卡片的点赞 / 踩操作
	 * 采用乐观更新策略：先修改本地数据立即反馈，API 失败后回滚
	 * @param {{id, action, clickedAction}} payload
	 */
	const handleLikeChange = async ({
		id,
		action,
		clickedAction
	}) => {
		const store = allStores.value.find(item => item.id === id);
		if (!store) return;

		// 备份，用于失败回滚
		const originalAction = store.userLikeStr;
		const originalLikes = store.likesCount || 0;
		const originalDislikes = store.dislikesCount || 0;

		// 乐观更新本地数据
		if (action === 'cancel') {
			store.userLikeStr = null;
			clickedAction === 'like' ? store.likesCount-- : store.dislikesCount--;
		} else {
			store.userLikeStr = clickedAction;
			if (clickedAction === 'like') {
				store.likesCount = (store.likesCount || 0) + 1;
				if (originalAction === 'dislike') store.dislikesCount = Math.max(0, (store.dislikesCount || 0) -
				1);
			} else {
				store.dislikesCount = (store.dislikesCount || 0) + 1;
				if (originalAction === 'like') store.likesCount = Math.max(0, (store.likesCount || 0) - 1);
			}
		}

		try {
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: id,
					targetType: 'store',
					action
				}
			});
			if (error) throw new Error(error);
		} catch (e) {
			// API 失败，回滚本地数据
			store.userLikeStr = originalAction;
			store.likesCount = originalLikes;
			store.dislikesCount = originalDislikes;
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			});
		}
	};


	// ─── 页面跳转 ───

	/**
	 * 跳转到聚店详情页
	 */
	const goToStoreDetail = async (store) => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: `/packages/shop-detail/shop-detail?id=${store.id}`
		});
	};

	/**
	 * 跳转到推荐聚店页
	 */
	const shareStore = async () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: '/pages/shop-recommend/shop-recommend'
		});
	};

	/**
	 * 跳转到自荐聚店（新增店铺）页
	 */
	const skipToNewShop = async () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: '/packages/myStore-edit/myStore-edit'
		});
	};


	// ─── 搜索 ───

	let searchTimer = null;

	/**
	 * 输入框实时输入防抖处理
	 * 用户停止输入 500ms 后自动刷新列表
	 */
	const onSearchInput = () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			handleRefresh();
		}, 500);
	};

	/**
	 * 点击"搜索"按钮或键盘回车，立即刷新
	 */
	const handleSearchClick = () => {
		clearTimeout(searchTimer);
		handleRefresh();
	};

	/**
	 * 切换分类筛选
	 */
	const selectFilter = (filterValue) => {
		activeFilter.value = filterValue;
	};

	// 监听筛选分类切换，自动刷新列表
	watch(activeFilter, (newValue, oldValue) => {
		if (newValue !== oldValue) handleRefresh();
	});


	// ─── 生命周期 ───

	onMounted(() => {
		getShopType();
		fetchBanners();

		// 监听详情页互动数据变更，同步更新列表里的对应卡片
		uni.$on('storeInteractionChanged', (data) => {
			const index = allStores.value.findIndex(s => String(s.id) === String(data.id));
			if (index === -1) return;

			if (data.type === 'action') {
				allStores.value[index].userLikeStr = data.userLikeStr;
				allStores.value[index].likesCount = data.likesCount;
				allStores.value[index].dislikesCount = data.dislikesCount;
			}
			if (data.type === 'comment') {
				allStores.value[index].commonCount = data.totalCount;
			}
		});
	});

	onUnmounted(() => {
		uni.$off('storeInteractionChanged');
	});

	/**
	 * 修复2：每次进入页面都重新定位
	 * 策略：先用缓存快速渲染（即时反馈），同时后台静默重新定位
	 * 定位成功后刷新列表（获取附近最新数据）
	 */
	onShow(async () => {
		// 1. 先读缓存，让用户立即看到上次的地址，不显示"定位中"
		const storedLocation = uni.getStorageSync('userLocation');
		const storedAddress = uni.getStorageSync('displayAddress');
		if (storedLocation) userLocation.value = storedLocation;
		if (storedAddress) displayAddress.value = storedAddress;

		// 2. 列表为空时先用缓存位置加载一次（首次进入或被清空后）
		if (allStores.value.length === 0) {
			handleRefresh();
		}

		// 3. 后台静默重新定位，拿到新位置后再刷新一次列表
		// 这样即使用户换了地方，数据也会自动更新，无感知
		getCurrentLocation().then(newLoc => {
			if (newLoc) {
				console.log('[onShow] 重新定位成功，刷新列表');
				handleRefresh();
			}
		});
	});


	// ─── 分享 ───

	/**
	 * 分享给好友
	 */
	onShareAppMessage(() => {
		const inviteCode = getInviteCode();
		let sharePath = '/pages/shop/shop';
		if (inviteCode) sharePath += `?inviteCode=${inviteCode}`;

		return {
			title: '我发现了很多宝藏"聚店"，快来一起看看吧！',
			path: sharePath,
			imageUrl: bannerList.value.length > 0 ?
				bannerList.value[0].imageUrl :
				'https://img.gofor.club/logo.png'
		};
	});

	/**
	 * 分享到朋友圈
	 */
	onShareTimeline(() => {
		const inviteCode = getInviteCode();
		return {
			title: '我发现了很多宝藏"聚店"，快来一起看看吧！',
			query: inviteCode ? `inviteCode=${inviteCode}` : '',
			imageUrl: bannerList.value.length > 0 ?
				bannerList.value[0].imageUrl :
				'https://img.gofor.club/logo.png'
		};
	});
</script>

<style lang="scss">
	$primary: #FF6B00;

	/* ── 页面容器 ── */
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	/* ── 顶部固定区域 ── */
	.fixed-header {
		background: #fff;
		padding: 20rpx;
		z-index: 100;
	}

	.search-location-bar {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.location-trigger {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		max-width: 160rpx;
	}

	.city-text {
		margin-right: 6rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.search-box {
		flex: 1;
		background: #f5f5f5;
		border-radius: 30rpx;
		padding: 12rpx 20rpx;
		display: flex;
		align-items: center;
	}

	.search-input {
		flex: 1;
		font-size: 26rpx;
		margin-left: 10rpx;
	}

	.search-btn-text {
		font-size: 28rpx;
		color: $primary;
		font-weight: 500;
	}

	/* ── 主滚动区域 ── */
	.main-scroll {
		flex: 1;
		height: 0;
		/* 配合 flex:1 使内部可独立滚动 */
	}

	/* ── 轮播图 ── */
	.swiper-section {
		margin: 20rpx;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.swiper {
		height: 250rpx;
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
		color: #fff;
		font-size: 36rpx;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}

	/* ── 功能金刚区 ── */
	.function-grid {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 40rpx;
		background: #fff;
		margin: 0 20rpx 20rpx;
		border-radius: 16rpx;
	}

	.func-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
		font-size: 24rpx;
		color: #333;
	}

	.icon-box {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.share-bg {
		background: linear-gradient(135deg, #4facfe, #00f2fe);
	}

	.join-bg {
		background: linear-gradient(135deg, #FF8C00, $primary);
	}

	/* ── 吸顶筛选栏 ── */
	.sticky-tabs {
		position: sticky;
		top: 0;
		z-index: 99;
		background: #f5f5f5;
		padding: 10rpx 0;
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
		color: #666;
		border: none;
		padding: 16rpx 28rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
		white-space: nowrap;
		flex-shrink: 0;
		line-height: 1;
		margin: 0;

		&::after {
			border: none;
		}

		&.active {
			background: $primary;
			color: #fff;
			font-weight: 500;
		}
	}

	/* ── 列表容器 ── */
	.store-list-container {
		padding: 0 20rpx;
	}

	/* ── 加载更多 ── */
	.load-more {
		text-align: center;
		padding: 15rpx;
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
		padding-top: 100rpx;
		color: #999;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		text {
			font-size: 28rpx;
			margin-top: 10rpx;
			line-height: 1.5;
		}
	}
</style>