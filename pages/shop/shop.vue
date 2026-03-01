<template>
	<view class="app">

		<!-- 1. 顶部固定区域：搜索 + 定位 -->
		<view class="fixed-header">
			<view class="search-location-bar">
				<!-- 左侧定位 -->
				<view class="location-trigger" @click="handleChooseLocation">
					<text class="city-text">{{ shortAddress || '定位' }}</text>
					<uni-icons type="bottom" size="12" color="#333"></uni-icons>
				</view>
				<!-- 中间搜索 -->
				<view class="search-box">
					<uni-icons type="search" size="16" color="#999"></uni-icons>
					<input class="search-input" type="text" placeholder="搜索聚店名称或关键词..." v-model="searchTerm"
						@confirm="handleSearchClick" />
				</view>
				<!-- 右侧搜索按钮 (可选，或者直接用键盘回车) -->
				<view class="search-btn-text" @click="handleSearchClick">搜索</view>
			</view>
		</view>

		<!-- 2. 可滚动区域 (包含 Banner、金刚区按钮、筛选栏、列表) -->
		<scroll-view class="main-scroll" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="handleRefresherRefresh" :sticky-header-indices="[2]">
			<!-- 如果用原生 sticky 也可以 -->

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

			<!-- 2.2 功能入口区 (原底部按钮移至此处) -->
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

			<!-- 2.3 筛选栏 (吸顶) -->
			<!-- 使用 CSS position: sticky 实现吸顶 -->
			<view class="sticky-tabs">
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

			<!-- 2.4 店铺列表 -->
			<view class="store-list-container">
				<!-- 卡片列表 -->
				<!-- 之前这里缺少了 @click-card 事件来处理跳转 -->
				<StoreCard v-for="store in filteredStores" :key="store.id" :store="store" @click-card="goToStoreDetail"
					@update-like="handleLikeChange" />

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
			</view>

			<!-- 底部垫高，防止被 TabBar 遮挡 -->
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
	const displayAddress = ref('');


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

					uni.request({
						url: `https://restapi.amap.com/v3/geocode/regeo?key=您的高德Web服务KEY&location=${res.longitude},${res.latitude}`,
						success: (geoRes) => {
							if (geoRes.data && geoRes.data.regeocode) {
								displayAddress.value = geoRes.data.regeocode.formatted_address;
							} else {
								displayAddress.value = "当前位置";
							}
						},
						fail: () => {
							displayAddress.value = "当前位置";
						}
					});

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
	 * 处理聚店卡片直接发出的点赞/点踩操作
	 */
	const handleLikeChange = async ({
		id,
		action,
		clickedAction
	}) => {
		// 1. 找到本地列表中对应的店铺对象
		const store = allStores.value.find(item => item.id === id);
		if (!store) return;

		// 2. 备份数据以便回滚
		const originalAction = store.userLikeStr;
		const originalLikes = store.likesCount || 0;
		const originalDislikes = store.dislikesCount || 0;

		// 3. 【乐观更新】立即操作本地数组
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
			// 4. 调用 API
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: id,
					targetType: 'store',
					action: action
				}
			});

			if (error) throw new Error(error);

			// 列表页点击不需要 emit 事件，因为它本身就是“源头”，且已经修改了本地数据
		} catch (e) {
			// 5. 失败回滚
			store.userLikeStr = originalAction;
			store.likesCount = originalLikes;
			store.dislikesCount = originalDislikes;
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			});
		}
	};

	/**
	 * @description 允许用户手动在地图上选择一个位置
	 */
	const handleChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log('用户手动选择了新位置:', res);
				const newAddress = res.name || res.address;
				const newLocation = {
					latitude: res.latitude,
					longitude: res.longitude
				};

				// 1. 更新UI显示的地址
				displayAddress.value = newAddress;

				// 2. 更新用于API请求的经纬度
				userLocation.value = newLocation;

				// 3. 【关键修正】将新选择的【位置】和【地址名称】都存入缓存
				uni.setStorageSync('userLocation', newLocation);
				uni.setStorageSync('displayAddress', newAddress);

				// 4. 立即使用新位置刷新列表
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

	// 简短地址，用于顶部显示
	const shortAddress = computed(() => {
		if (!displayAddress.value) return '定位中';
		// 简单的截取逻辑，或者在获取地址时就解析出 district/street
		// 假设 displayAddress 是完整地址，这里只取前几个字或特定部分
		// 实际项目中建议在 getCurrentLocation 里就把 district 单独存下来
		if (displayAddress.value.length > 4) {
			return displayAddress.value.substring(0, 4) + '...';
		}
		return displayAddress.value;
	});

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
		// if (!userLocation.value) {
		// 	console.warn("getStoreList 中断：位置信息为空。");
		// 	isRefreshing.value = false;
		// 	loadingMore.value = false;
		// 	if (pageNo.value === 1) {
		// 		allStores.value = [];
		// 		hasMore.value = false;
		// 	}
		// 	return;
		// }

		if (loadingMore.value || (pageNo.value > 1 && !hasMore.value)) {
			return;
		}

		loadingMore.value = true;

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			storeName: searchTerm.value.trim(),
		};
		// 只有在 userLocation 有值 (用户已手动选择) 的情况下，才添加经纬度参数
		if (userLocation.value) {
			params.longitude = userLocation.value.longitude;
			params.latitude = userLocation.value.latitude;
		}
		if (activeFilter.value !== 'all') {
			params.category = activeFilter.value;
		}

		console.log('🚀 [getStoreList] 最终请求参数:', params);

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
				console.warn('捕获到业务限制：需绑定信息才能查看更多店铺');
				// 触发登录守卫弹窗（内部会自动处理跳转逻辑）
				await checkLoginGuard();
				return;
			}

			console.error('获取店铺列表失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		// if (error) {
		// 	console.error('获取店铺列表失败:', error);
		// 	uni.showToast({
		// 		title: error,
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

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
		if (isLoading.value) return;
		isLoading.value = true;

		if (isPullDown) {
			isRefreshing.value = true;
		}

		try {
			// 重置分页和状态
			pageNo.value = 1;
			hasMore.value = true;
			allStores.value = [];
			// 直接调用获取列表的函数，它会根据 userLocation 的有无来决定是否传经纬度
			await getStoreList();
		} catch (error) {
			console.error("handleRefresh 过程中捕获到错误:", error);
		} finally {
			isLoading.value = false;
			// isRefreshing 在 getStoreList 内部被重置
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
		handleRefresh();

		uni.$on('storeInteractionChanged', (data) => {
			const index = allStores.value.findIndex(s => String(s.id) === String(data.id));
			if (index !== -1) {
				// 精准更新本地数据
				if (data.type === 'action') {
					allStores.value[index].userLikeStr = data.userLikeStr;
					allStores.value[index].likesCount = data.likesCount;
					allStores.value[index].dislikesCount = data.dislikesCount;
				}
				// 建议：也加上评论数同步（详情页发布评论后也会用到）
				if (data.type === 'comment') {
					allStores.value[index].commonCount = data.totalCount;
				}
			}
		});
	});

	onUnmounted(() => {
		uni.$off('storeInteractionChanged');
	});

	onShow(() => {
		// 只有在列表为空（首次进入）时，才触发自动刷新
		if (allStores.value.length === 0) {
			console.log('onShow: 列表为空，执行初次加载...');
			const storedLocation = uni.getStorageSync('userLocation');
			const storedAddress = uni.getStorageSync('displayAddress');
			if (storedLocation) {
				userLocation.value = storedLocation;
			}

			// 优先使用缓存的地址名，如果没有，再显示"正在定位..."
			if (storedAddress) {
				displayAddress.value = storedAddress;
				handleRefresh(); // 如果有地址缓存，直接刷新
			} else {
				displayAddress.value = '正在定位...';
				handleRefresh(); // 触发自动定位和刷新
			}
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

	const goToStoreDetail = async (store) => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: `/packages/shop-detail/shop-detail?id=${store.id}`
		});
	};

	const shareStore = async () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: '/pages/shop-recommend/shop-recommend'
		});
	};
	const skipToNewShop = async () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: '/packages/myStore-edit/myStore-edit'
		});
	};


	// ==========================================================
	// --- 【新增】分享功能逻辑 ---
	// ==========================================================

	/**
	 * @description 监听用户点击“分享给好友”
	 */
	onShareAppMessage(() => {
		// 1. 获取当前用户的邀请码
		const inviteCode = getInviteCode();
		console.log(`[分享] 准备分享聚店页面给好友，邀请码: ${inviteCode}`);

		// 2. 构建分享路径
		// 基础路径是当前页面
		let sharePath = '/pages/shop/shop'; // 请确保这个路径是正确的
		if (inviteCode) {
			sharePath += `?inviteCode=${inviteCode}`;
		}

		// 3. 返回分享对象
		const shareContent = {
			title: '我发现了很多宝藏“聚店”，快来一起看看吧！',
			path: sharePath,
			imageUrl: bannerList.value.length > 0 ? bannerList.value[0].imageUrl :
				'https://img.gofor.club/logo.png' // 优先使用第一张轮播图作为分享封面
		};

		console.log('[分享] 分享给好友的内容:', JSON.stringify(shareContent));

		return shareContent;
	});


	/**
	 * @description 监听用户点击“分享到朋友圈”
	 */
	onShareTimeline(() => {
		// 1. 获取邀请码
		const inviteCode = getInviteCode();
		console.log(`[分享] 准备分享聚店页面到朋友圈，邀请码: ${inviteCode}`);

		// 2. 构建 query 字符串
		let queryString = '';
		if (inviteCode) {
			queryString = `inviteCode=${inviteCode}`;
		}

		// 3. 返回分享对象
		const shareContent = {
			title: '我发现了很多宝藏“聚店”，快来一起看看吧！',
			query: queryString,
			imageUrl: bannerList.value.length > 0 ? bannerList.value[0].imageUrl :
				'https://img.gofor.club/logo.png'
		};

		console.log('[分享] 分享到朋友圈的内容:', JSON.stringify(shareContent));

		return shareContent;
	});
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
		background-color: #f5f5f5;
	}

	/* 1. 顶部固定区域 */
	.fixed-header {
		background: #fff;
		padding: 20rpx;
		z-index: 100;
		/* 保持固定在顶部 */
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
		/* 限制宽度 */
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
		color: #FF6B00;
		font-weight: 500;
	}

	/* 2. 主滚动区域 */
	.main-scroll {
		flex: 1;
		/* 占据剩余所有空间 */
		height: 0;
		/* 配合 flex: 1 使用 */
	}

	/* 轮播图 */
	.swiper-section {
		margin: 20rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	/* 功能金刚区 */
	.function-grid {
		display: flex;
		justify-content: space-around;
		/* 两个按钮分散居中 */
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
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
	}

	/* 吸顶筛选栏 */
	.sticky-tabs {
		position: sticky;
		top: 0;
		/* 滚动到顶部时吸附 */
		z-index: 99;
		background: #f5f5f5;
		/* 与背景同色，或者用 #fff */
		padding: 10rpx 0;
	}

	/* 列表容器 */
	.store-list-container {
		padding: 0 20rpx;
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

	.location-selector {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #f7f7f7;
		border-radius: 16rpx;
		margin-top: 20rpx;
		border: 1rpx solid #f0f0f0;
	}

	.location-text {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		margin: 0 16rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
		font-size: 28rpx
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