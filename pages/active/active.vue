<template>
	<view class="container">
		<!-- 1. 顶部吸顶：位置 + 搜索 -->
		<view class="fixed-header">
			<view class="search-location-bar">
				<!-- 左侧：手动位置选择 -->
				<view class="location-trigger" @click="openMapToChooseLocation">
					<text
						class="city-text">{{ selectedLocationInfo ? (selectedLocationInfo.name || '已选位置') : '选择位置' }}</text>
					<uni-icons type="bottom" size="12" color="#333"></uni-icons>
				</view>
				<!-- 中间：搜索框 -->
				<view class="search-box">
					<uni-icons type="search" size="16" color="#999"></uni-icons>
					<input class="search-input" type="text" placeholder="搜索聚会主题..." v-model="searchKeyword" />
				</view>
				<!--右侧：扫码核销入口 -->
				<view class="scan-trigger" @click="handleTopScan">
					<uni-icons type="scan" size="26" color="#FF6B00"></uni-icons>
				</view>
			</view>
		</view>

		<view class="header-placeholder" style="height: 100rpx;"></view>

		<!-- 3. 轮播图 -->
		<view v-if="bannerList.length > 0" class="swiper-section">
			<swiper class="swiper" circular indicator-dots autoplay :interval="3000" :duration="500">
				<swiper-item v-for="banner in bannerList" :key="banner.id" @click="handleBannerClick(banner)">
					<image :src="banner.imageUrl" mode="aspectFill" class="swiper-image"></image>
				</swiper-item>
			</swiper>
		</view>

		<view class="filter-rows-container">
			<!-- 第一行：选择类型 -->
			<scroll-view scroll-x class="filter-row-scroll">
				<view class="tabs-line">
					<text class="row-label">类型：</text>
					<view v-for="(item, index) in typePickerRange" :key="'type'+index" class="tab-pill"
						:class="{ active: typeIndex === index }" @click="selectType(index)">{{ item }}</view>
				</view>
			</scroll-view>

			<!-- 第二行：选择状态 -->
			<scroll-view scroll-x class="filter-row-scroll">
				<view class="tabs-line">
					<text class="row-label">状态：</text>
					<view v-for="(item, index) in statusPickerRange" :key="'status'+index" class="tab-pill"
						:class="{ active: statusIndex === index }" @click="selectStatus(index)">{{ item }}</view>
				</view>
			</scroll-view>
		</view>

		<!-- 4. 聚会列表 -->
		<view class="activity-list">
			<ActivityCard v-for="activity in activitiesData" :key="activity.id" :activity="activity" :is-login="isLogin"
				@updateFavoriteStatus="handleFavoriteChange" @updateLikeStatus="handleLikeChange" />
		</view>

		<view v-if="!hasMore && activitiesData.length > 0" class="no-more-content">暂无更多聚会</view>
		<view v-if="!loading && activitiesData.length === 0" class="empty-state">
			<uni-icons type="info" size="50" color="#ddd" />
			<text>当前筛选下暂无聚会</text>
			<view class="reset-link" @click="resetFilters">重置筛选条件</view>
		</view>

		<!-- 底部发起按钮 -->
		<view class="action-bar">
			<view class="action-btn register-btn" @click="publishActivity">
				<uni-icons type="plus" size="18" color="white" />
				<text>发起聚会</text>
			</view>
		</view>
	</view>
	<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />
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
		onReachBottom,
		onPullDownRefresh,
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import ActivityCard from '@/components/ActivityCard.vue';
	import request from '../../utils/request.js';
	import {
		fetchGlobalUnread
	} from '@/utils/unread.js';
	import {
		getInviteCode,
		checkLoginGuard,
		isScenario3User
	} from '../../utils/user.js';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';

	// ─── 核心状态 ───
	const loading = ref(false);
	const hasMore = ref(true);
	const pageNo = ref(1);
	const pageSize = 10;
	const activitiesData = ref([]);
	const isLogin = ref(false);
	const bannerList = ref([]);
	const smartGuidePopupRef = ref(null);

	// ─── 筛选条件 ───
	const searchKeyword = ref('');
	const typeList = ref([]);
	const typeIndex = ref(0);
	const selectedCategory = ref('');
	const statusList = ref([]);
	const statusIndex = ref(0);
	const selectedLocationInfo = ref(null);
	let filterDebounceTimer = null;

	// ─── 计算属性：Picker 显示范围 ───
	const typePickerRange = computed(() => ['全部类型', ...typeList.value.map(item => item.label)]);
	const statusPickerRange = computed(() => ['全部状态', ...statusList.value.map(item => item.label)]);


	// ─── 事件监听：来自详情页的精准互动同步 ───

	onMounted(() => {
		/**
		 * 监听详情页赞踩/收藏/评论变更事件
		 * 收到后精准更新对应卡片字段，无需整体刷新列表
		 */
		uni.$on('activityInteractionChanged', (data) => {
			if (data.type === 'action') {
				updateLocalActivityData(data.id, {
					userLikeStr: data.userLikeStr,
					likesCount: data.likesCount,
					dislikesCount: data.dislikesCount
				});
			} else if (data.type === 'save') {
				updateLocalActivityData(data.id, {
					followFlag: data.isSaved ? 1 : 0
				});
			} else if (data.type === 'comment') {
				updateLocalActivityData(data.id, {
					commonCount: data.totalCount
				});
			}
		});

		//监听全局刷新需求 (发布成功或报名成功时触发)
		uni.$on('refreshActivityList', () => {
			console.log('收到刷新信号，执行静默刷新');
			silentRefresh();
		});
	});

	onUnmounted(() => {
		uni.$off('activityInteractionChanged');
		uni.$off('refreshActivityList');
	});


	// ─── 生命周期 ───

	/**
	 * onShow：每次页面显示时触发
	 *
	 * 防回顶策略（与聚店列表页一致）：
	 * - 列表为空（首次进入 / 下拉刷新清空后）→ 完整初始化
	 * - 列表有数据（从详情页返回）→ 只更新登录状态，不重置列表
	 *   详情页的赞踩变更已通过 uni.$emit('activityInteractionChanged') 精准同步
	 *   无需整体刷新，保持当前滚动位置
	 */
	onShow(() => {
		// 始终更新登录状态
		const token = uni.getStorageSync('token');
		isLogin.value = !!token;

		// 仅在列表为空时才做完整初始化（首次进入 / 被清空后）
		if (activitiesData.value.length === 0) {
			initializePage();
		}
	});

	/**
	 * 下拉刷新：强制完整重新加载
	 */
	onPullDownRefresh(async () => {
		resetFilters();
		await initializePage();
		uni.stopPullDownRefresh();

		fetchGlobalUnread();
	});

	/**
	 * 上拉到底部：加载更多
	 */
	onReachBottom(() => {
		if (hasMore.value && !loading.value) {
			getActiveList(true);
		}
	});


	// ─── 核心数据方法 ───

	// 3. 核心逻辑：静默刷新函数
	const silentRefresh = async () => {
		// 不像 initializePage 那样清空 activitiesData.value = []
		// 而是直接请求第一页，请求回来后再替换，这样用户视觉上不会感到闪烁
		pageNo.value = 1;
		hasMore.value = true;

		// 调用获取列表函数，isLoadMore 传 false 表示覆盖第一页
		await getActiveList(false);
	};

	/**
	 * 精准更新本地列表中指定 ID 的聚会字段
	 * 用于详情页返回时的增量同步，避免整体刷新
	 * @param {string|number} id - 聚会 ID
	 * @param {object} payload - 要更新的字段
	 */
	const updateLocalActivityData = (id, payload) => {
		const index = activitiesData.value.findIndex(item => item.id == id);
		if (index !== -1) {
			activitiesData.value[index] = {
				...activitiesData.value[index],
				...payload
			};
		}
	};

	/**
	 * 处理卡片直接点赞/踩操作
	 * 乐观更新本地 UI，接口失败后回滚
	 * @param {{ id, action, clickedAction }} param
	 */
	const handleLikeChange = async ({
		id,
		action,
		clickedAction
	}) => {
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

	/**
	 * 页面完整初始化
	 * 清空列表，并行拉取 banner + 类型 + 状态列表，再加载第一页聚会
	 * 仅在首次进入或下拉刷新时调用，从详情页返回时不调用（防回顶）
	 */
	const initializePage = async () => {
		uni.showLoading({
			title: '加载中...'
		});
		try {
			pageNo.value = 1;
			hasMore.value = true;
			activitiesData.value = [];

			await Promise.all([
				fetchBanners(),
				fetchActivityTypeList(),
				fetchActivityStatusList()
			]);

			await getActiveList(false);
		} catch (error) {
			console.error('[聚会列表] 初始化失败:', error);
			uni.showToast({
				title: '数据加载失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 获取轮播图数据，失败时不中断整体流程
	 */
	const fetchBanners = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/banner-rec/list', {
			method: 'GET',
			data: {
				positionCode: '0',
				pageNo: 1,
				pageSize: 50
			}
		});
		if (error) {
			console.error('[轮播图] 获取失败:', error);
			bannerList.value = [];
			return; // 不抛出，避免中断 Promise.all
		}
		bannerList.value = (data && data.list) ?
			data.list.sort((a, b) => a.sort - b.sort) : [];
	};

	/**
	 * 获取聚会类型字典列表（用于筛选 Picker）
	 */
	const fetchActivityTypeList = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/dict-data/type', {
			data: {
				type: 'member_activity_category'
			}
		});
		if (error) {
			console.error('[类型列表] 获取失败:', error);
			throw new Error('获取类型失败');
		}
		typeList.value = data || [];
	};

	/**
	 * 获取聚会状态列表（用于筛选 Picker）
	 */
	const fetchActivityStatusList = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/activity/status-list');
		if (error) {
			console.error('[状态列表] 获取失败:', error);
			throw new Error('获取状态失败');
		}
		statusList.value = data || [];
	};

	/**
	 * 获取聚会列表（支持首次加载和加载更多）
	 * @param {boolean} isLoadMore - true 为追加数据，false 为重置列表
	 */
	const getActiveList = async (isLoadMore = false) => {
		if (loading.value) return;
		if (isLoadMore && !hasMore.value) return;

		loading.value = true;
		if (!isLoadMore) pageNo.value = 1;

		const selectedStatusItem = statusIndex.value > 0 ? statusList.value[statusIndex.value - 1] : null;
		const params = {
			pageNo: pageNo.value,
			pageSize,
			name: searchKeyword.value,
			category: selectedCategory.value,
			status: selectedStatusItem ? selectedStatusItem.value : '',
			longitude: selectedLocationInfo.value ? selectedLocationInfo.value.longitude : '',
			latitude: selectedLocationInfo.value ? selectedLocationInfo.value.latitude : ''
		};

		try {
			const result = await request('/app-api/member/activity/list', {
				method: 'GET',
				data: params
			});

			if (result.error) {
				if (result.error.includes('信息绑定')) {
					await checkLoginGuard();
					loading.value = false;
					return;
				}
				uni.showToast({
					title: result.error,
					icon: 'none'
				});
				hasMore.value = false;
				return;
			}

			if (result && result.data) {
				const {
					list = [], total = 0
				} = result.data;
				isLoadMore
					?
					activitiesData.value.push(...list) :
					activitiesData.value = list;

				hasMore.value = activitiesData.value.length < total;
				pageNo.value++;
			} else {
				hasMore.value = false;
			}

			fetchGlobalUnread();

		} catch (error) {
			console.error('[聚会列表] 请求异常:', error);
			hasMore.value = false;
		} finally {
			loading.value = false;
		}
	};


	// ─── 事件处理器 ───
	/**
	 * 顶部扫码逻辑 - 针对 Android 日志精准修复
	 */
	const handleTopScan = () => {
		if (!isLogin.value) {
			checkLoginGuard('请先登录后再进行核销操作');
			return;
		}

		uni.scanCode({
			onlyFromCamera: true,
			success: (res) => {
				console.log('🔵 [第一步] 原始数据:', res.path);

				let rawPath = res.path || res.result || '';
				if (rawPath) {
					// 1. 统一格式：确保以 / 开头
					let url = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

					// 2. 【核心修复】深度解析 scene 参数
					if (url.includes('scene=')) {
						// 提取 scene 后的全部内容，并进行全平台通用的 URL 解码
						let sceneContent = url.split('scene=')[1];

						// 【关键步骤】解码！把 %3D 转回 =，把 %26 转回 &
						const decodedScene = decodeURIComponent(sceneContent);
						console.log('🌈 [解码后数据]:', decodedScene); // 应显示 a=20794&u=247

						const params = {};
						decodedScene.split('&').forEach(item => {
							const [k, v] = item.split('=');
							if (k === 'a') params.activityId = v;
							if (k === 'u') params.joinUserId = v;
						});

						// 3. 重新组装成标准路径，确保参数不再是 undefined
						if (params.activityId && params.joinUserId) {
							url =
								`/packages/active-verify/active-verify?activityId=${params.activityId}&joinUserId=${params.joinUserId}`;
						} else {
							console.error('❌ 解析后的参数缺失:', params);
						}
					}

					// 4. 延迟跳转，确保相机已完全销毁
					setTimeout(() => {
						console.log('🚀 [第二步] 最终跳转 URL:', url);
						uni.navigateTo({
							url: url,
							fail: (err) => {
								uni.showModal({
									title: '跳转失败',
									content: err.errMsg,
									showCancel: false
								});
							}
						});
					}, 300);
				}
			}
		});
	};
	/**
	 * 优化：手动选择类型和状态
	 */
	const selectType = (index) => {
		typeIndex.value = index;
		selectedCategory.value = index === 0 ? '' : typeList.value[index - 1].value;
	};

	const selectStatus = (index) => {
		statusIndex.value = index;
	};


	/**
	 * 重置所有筛选条件
	 * watch 会自动捕获状态变化并触发列表刷新，无需手动调用 getActiveList
	 */
	const resetFilters = () => {
		searchKeyword.value = '';
		typeIndex.value = 0;
		selectedCategory.value = '';
		statusIndex.value = 0;
		selectedLocationInfo.value = null;
	};

	/**
	 * 聚会类型 Picker 选择变更
	 * @param {Event} e
	 */
	const bindTypePickerChange = (e) => {
		const newIndex = Number(e.detail.value);
		typeIndex.value = newIndex;
		selectedCategory.value = newIndex === 0 ? '' : typeList.value[newIndex - 1].value;
	};

	/**
	 * 聚会状态 Picker 选择变更
	 * @param {Event} e
	 */
	const bindStatusPickerChange = (e) => {
		statusIndex.value = e.detail.value;
	};

	/**
	 * 打开地图选择位置（用于按距离筛选）
	 * 用户拒绝定位权限时引导去设置页开启
	 */
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				selectedLocationInfo.value = {
					name: res.name,
					address: res.address,
					latitude: res.latitude,
					longitude: res.longitude
				};
			},
			fail: (err) => {
				if (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied')) {
					uni.showModal({
						title: '定位权限未开启',
						content: '需要您的位置权限来筛选附近的聚会，是否前往设置开启？',
						success: (res) => {
							if (res.confirm) uni.openSetting();
						}
					});
				}
			}
		});
	};

	/**
	 * 子组件收藏状态变更回调
	 * @param {{ id, newFollowFlag }} event
	 */
	const handleFavoriteChange = (event) => {
		const activity = activitiesData.value.find(a => a.id == event.id);
		if (activity) activity.followFlag = event.newFollowFlag;
	};

	/**
	 * 点击"发起聚会"，校验登录后跳转发布页
	 */
	const publishActivity = async () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: '/packages/active-publish/active-publish'
		});
	};

	/**
	 * 点击轮播图，跳转到对应聚会详情页
	 * @param {object} banner - 轮播图数据，targetUrl 为聚会 ID
	 */
	const handleBannerClick = async (banner) => {
		if (!await checkLoginGuard()) return;
		if (!banner || !banner.targetUrl) return;
		uni.navigateTo({
			url: '/packages/active-detail/active-detail?id=' + banner.targetUrl
		});
	};


	// ─── 监听器：筛选条件变化自动防抖刷新 ───

	watch(
		[searchKeyword, selectedCategory, statusIndex, selectedLocationInfo],
		() => {
			clearTimeout(filterDebounceTimer);
			filterDebounceTimer = setTimeout(() => {
				uni.showLoading({
					title: '正在筛选...'
				});
				getActiveList(false).finally(() => uni.hideLoading());
			}, 300);
		}, {
			deep: true
		}
	);


	// ─── 分享配置 ───

	/**
	 * 分享给好友：携带邀请码
	 */
	onShareAppMessage(() => {
		const inviteCode = getInviteCode();
		let sharePath = '/pages/active/active';
		if (inviteCode) sharePath += '?inviteCode=' + inviteCode;
		return {
			title: '发现一个超棒的商友聚会平台，快来看看吧！',
			path: sharePath,
			imageUrl: 'https://img.gofor.club/logo.png'
		};
	});

	/**
	 * 分享到朋友圈：携带邀请码（朋友圈只支持 query）
	 */
	onShareTimeline(() => {
		const inviteCode = getInviteCode();
		return {
			title: '发现一个超棒的商友聚会平台，快来看看吧！',
			query: inviteCode ? 'inviteCode=' + inviteCode : '',
			imageUrl: 'https://img.gofor.club/logo.png'
		};
	});
</script>

<style lang="scss" scoped>
	$primary: #FF6B00;

	.container {
		background-color: #f8f9fa;
		padding-bottom: 120rpx;
		min-height: 100vh;
	}

	/* 1. 顶部固定区域 */
	.fixed-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: #fff;
		z-index: 100;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.search-location-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx; // 稍微缩小左右间距
		gap: 16rpx; // 统一间距

		.location-trigger {
			display: flex;
			align-items: center;
			gap: 4rpx;
			max-width: 140rpx; // 稍微收窄一点，给中间留空间

			.city-text {
				font-size: 26rpx;
				font-weight: bold;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.search-box {
			flex: 1;
			background: #f5f5f5;
			border-radius: 30rpx;
			padding: 12rpx 24rpx;
			display: flex;
			align-items: center;

			.search-input {
				flex: 1;
				font-size: 26rpx;
				margin-left: 10rpx;
			}
		}

		.scan-trigger {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10rpx; // 增加点击区域
			transition: transform 0.1s;

			&:active {
				transform: scale(0.9); // 点击缩放反馈
				opacity: 0.8;
			}
		}
	}

	/* 2. 吸顶标签筛选 */
	.fixed-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: #fff;
		z-index: 100;
	}

	/* 新的双行筛选容器 */
	.filter-rows-container {
		background: #fff;
		padding: 10rpx 0 20rpx;
		margin-bottom: 10rpx;

		/* --- 核心吸顶代码 --- */
		position: sticky;
		/* 开启粘性布局 */
		top: 100rpx;
		/* 这里的 100rpx 必须等于 .header-placeholder 的高度 */
		z-index: 99;
		/* 确保在列表内容上方，但在 fixed-header (z-index: 100) 下方 */
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.02);
		/* 吸顶时增加一点微弱投影，区分内容 */
		/* ------------------ */

		.filter-row-scroll {
			width: 100%;
			white-space: nowrap;
			margin-bottom: 16rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.tabs-line {
			display: flex;
			align-items: center;
			padding: 0 30rpx;
		}

		.row-label {
			font-size: 24rpx;
			color: #999;
			margin-right: 10rpx;
			flex-shrink: 0;
		}

		.tab-pill {
			display: inline-block;
			padding: 8rpx 24rpx;
			background: #f5f5f5;
			border-radius: 30rpx;
			font-size: 24rpx;
			color: #666;
			margin-right: 16rpx;
			transition: all 0.2s;
			border: 1rpx solid transparent;

			&.active {
				background: #fff0e5;
				color: $primary;
				border-color: $primary;
				font-weight: bold;
			}
		}
	}

	.header-placeholder {
		height: 180rpx;
	}

	// 动态占位高度

	.swiper-section {
		margin: 20rpx 30rpx;
		border-radius: 16rpx;
		overflow: hidden;
		height: 260rpx;

		.swiper {
			height: 100%;
		}

		.swiper-image {
			width: 100%;
			height: 100%;
		}
	}

	.activity-list {
		padding: 10rpx 30rpx;
	}

	.empty-state {
		padding: 100rpx 0;
		text-align: center;
		color: #999;
		font-size: 26rpx;

		.reset-link {
			color: $primary;
			margin-top: 20rpx;
			text-decoration: underline;
		}
	}


	/* ── 筛选区域 ── */
	// .collapse-title {
	// 	color: #FF6B00;
	// }

	// .filters {
	// 	padding: 0 32rpx;
	// 	background: white;
	// 	border-bottom: 2rpx solid #eee;
	// }

	// .filter-header {
	// 	display: flex;
	// 	justify-content: flex-end;
	// 	margin-bottom: 20rpx;
	// }

	// /* 修复：改为 view，消除 button 默认样式和 &::after 编译问题 */
	// .reset-btn {
	// 	background-color: #f0f0f0;
	// 	color: #666;
	// 	border: 1rpx solid #e0e0e0;
	// 	padding: 8rpx 20rpx;
	// 	font-size: 24rpx;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// 	border-radius: 8rpx;
	// 	margin-right: 40rpx;
	// }

	// .uni-list {
	// 	margin: 15rpx auto;

	// 	.uni-list-cell {
	// 		display: flex;
	// 		align-items: center;
	// 	}

	// 	.uni-list-cell-left {
	// 		padding: 10rpx;
	// 		border-radius: 10rpx;
	// 		flex-shrink: 0;
	// 	}

	// 	.uni-list-cell-db {
	// 		margin-left: 10rpx;
	// 		padding: 10rpx;
	// 		background-color: #FFF0E5;
	// 		flex: 1;
	// 		min-width: 0;

	// 		.uni-input {
	// 			margin-left: 10rpx;
	// 			display: flex;
	// 			align-items: center;
	// 			width: 100%;

	// 			text,
	// 			.placeholder {
	// 				white-space: nowrap;
	// 				overflow: hidden;
	// 				text-overflow: ellipsis;
	// 			}

	// 			.arrow {
	// 				color: #999;
	// 				font-size: 32rpx;
	// 				margin-left: auto;
	// 				padding: 0 10rpx;
	// 			}
	// 		}
	// 	}
	// }

	/* ── 聚会列表 ── */
	.activity-list {
		padding: 0 32rpx;
	}

	.no-more-content {
		text-align: center;
		color: #999;
		padding: 30rpx 0;
		font-size: 28rpx;
		margin-top: 20rpx;
	}

	/* ── 底部操作栏 ── */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		display: flex;
		padding: 20rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 18rpx;
		border-radius: 16rpx;
		font-weight: 500;
		font-size: 32rpx;

		text {
			margin-left: 12rpx;
		}
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
	}
</style>