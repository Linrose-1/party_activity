<template>
	<view class="connections-page">
		<view class="header-section" @click="goToShakePage">
			<image src="/static/connections-bg.png" mode="aspectFill" class="header-bg"></image>
			<view class="header-content">
				<!-- 左侧标题 -->
				<view class="header-title-group">
					<h1 class="page-title">六度人脉</h1>
					<p class="page-subtitle">连接每一个有价值的相遇</p>
				</view>

				<!-- 右侧新的摇一摇入口 -->
				<view class="shake-entry-new">
					<!-- 单个图标 -->
					<uni-icons type="personadd" size="42" color="#fff" class="entry-icon"></uni-icons>
					<!-- 文字组合 -->
					<view class="entry-text-group">
						<text class="entry-text">摇一摇</text>
						<text class="entry-text">找商友</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 【修改后】的选择器区域 -->
			<view class="selectors-card">
				<!-- ==================== 【核心模板修改点】: 为重置按钮创建一个独立的行 ==================== -->
				<!-- 1. 创建一个 wrapper 容器，它将占据一整行 -->
				<view class="reset-btn-wrapper">
					<!-- 2. 将重置按钮放在这个容器里 -->
					<view class="reset-btn" @click="resetFilters">
						<uni-icons type="refreshempty" size="16" color="#666"></uni-icons>
						<text>重置</text>
					</view>
				</view>
				<!-- ==================================================================================== -->

				<!-- 访友地点 -->
				<view class="selector-item" @click="handleChooseLocation">
					<uni-icons type="paperplane" size="20" color="#999"></uni-icons>
					<view class="picker-view">
						<text class="label">访友地点：</text>
						<text class="value">{{ destination.name || '请选择拟访友地点' }}</text>
					</view>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>

				<!-- 到达时间 -->
				<view class="selector-item">
					<uni-icons type="calendar" size="20" color="#999"></uni-icons>
					<uni-datetime-picker v-model="timeRange" type="datetimerange" @change="handleTimeChange">
						<view class="picker-view">
							<text class="label">访友时段：</text>
							<text class="value">{{ timeRangeText }}</text>
						</view>
					</uni-datetime-picker>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 标签页切换 -->
			<view class="tabs">
				<view class="tab-item" :class="{ 'active': activeTab === 0 }" @click="switchTab(0)">
					<uni-icons type="paperplane-filled" size="18"
						:color="activeTab === 0 ? themeColor : '#666'"></uni-icons>
					当地商友
				</view>
				<view class="tab-item" :class="{ 'active': activeTab === 1 }" @click="switchTab(1)">
					<uni-icons type="heart-filled" size="18" :color="activeTab === 1 ? themeColor : '#666'"></uni-icons>
					当地关注
				</view>
			</view>

			<!-- 人脉列表 -->
			<view class="user-list">
				<!-- 【修改】将 v-for 移到 user-card 上，统一循环 userList -->
				<view class="user-card" v-for="user in userList" :key="user.id">
					<image :src="user.avatar" mode="aspectFill" class="avatar"
						@click.stop="navigateToBusinessCard(user)"></image>
					<view class="user-info">
						<view class="name-row">
							<text class="name">{{ user.nickname }}</text>
							<view v-if="user.levelName" class="industry-tag">{{ user.levelName }}</view>
						</view>
						<view class="company">{{ user.companyName }}</view>
						<!-- “关注的人”Tab下，额外显示“关注了你”的状态 -->
						<view v-if="activeTab === 1 && user.followMyFlag === 1" class="follow-status">
							<text class="status-tag follower">关注了你</text>
						</view>
					</view>

					<!-- 【核心修改】统一按钮逻辑，都根据 followToFlag 判断，并调用同一个方法 -->
					<button class="follow-btn" :class="{ 'followed-btn': user.followToFlag === 1 }"
						@click.stop="handleFollowAction(user)">
						{{ user.followToFlag === 1 ? '已关注' : '+ 关注' }}
					</button>
				</view>

				<!-- 列表为空的提示 (无变化) -->
				<view v-if="isListEmpty" class="empty-state">
					<uni-icons type="staff" size="60" color="#e0e0e0"></uni-icons>
					<text class="empty-text">暂无相关商友</text>
					<text class="empty-subtext">请填写访友地点与访友时段</text>
					<text class="empty-subtext">查找您需要的商友</text>
				</view>

				<!-- 加载更多组件 (无变化) -->
				<uni-load-more :status="loadingStatus" v-if="userList.length > 0 || loadingStatus === 'loading'"
					:contentText="{
									contentdown: '上拉加载更多',
									contentrefresh: '正在加载...',
									contentnomore: '—— 我是有底线的 ——'
								}"></uni-load-more>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		watch
	} from 'vue';
	import {
		onLoad,
		onPullDownRefresh,
		onReachBottom,
		onShow,
		onHide,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		useShakeLock
	} from '@/utils/shakeLock.js';
	import {
		getInviteCode,
		checkLoginGuard
	} from '@/utils/user.js';

	const themeColor = '#FF7500';

	const {
		isShakeLocked,
		lockShake
	} = useShakeLock(); //获取锁的状态和方法

	// --- 辅助函数 ---
	const formatDateTime = (date) => {
		if (!(date instanceof Date)) return '';
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	// --- 核心状态变量 ---
	const destination = ref({});
	const timeRange = ref([]);
	const activeTab = ref(0);
	const userList = ref([]);
	const total = ref(0);
	const loadingStatus = ref('more');
	const queryParams = reactive({
		pageNo: 1,
		pageSize: 10,
	});
	// 【新增】状态锁，防止用户在关注操作完成前重复点击
	const isFollowActionInProgress = ref(false);

	const isShaking = ref(false);


	// --- 计算属性 ---
	const timeRangeText = computed(() => {
		if (timeRange.value && timeRange.value.length === 2) {
			const start = timeRange.value[0].slice(5, 16);
			const end = timeRange.value[1].slice(5, 16);
			return `${start} - ${end}`;
		}
		return '请选择拟访友时段';
	});
	const isListEmpty = computed(() => userList.value.length === 0 && loadingStatus.value !== 'loading');

	// --- API 调用与数据处理 ---
	const fetchUserList = async (isRefresh = false) => {
		// 1. 如果是刷新操作，先停止之前的下拉动画（以防万一）
		if (isRefresh) {
			uni.stopPullDownRefresh();
		}

		// 2. 检查筛选条件是否满足
		if (!destination.value.longitude || timeRange.value.length < 2) {
			userList.value = [];
			// 当筛选条件不满足时，状态应为 'noMore' 而不是 'no-more'
			loadingStatus.value = 'noMore';
			return; // 提前返回
		}

		// 3. 防止重复加载
		if (loadingStatus.value === 'loading' && !isRefresh) return;

		// 4. 重置状态
		if (isRefresh) {
			queryParams.pageNo = 1;
			userList.value = [];
			loadingStatus.value = 'more'; // 准备重新加载
		}

		loadingStatus.value = 'loading';

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/connection-list', {
				method: 'GET',
				data: {
					...queryParams,
					longitude: destination.value.longitude,
					latitude: destination.value.latitude,
					nextLocationTime: formatDateTime(new Date(timeRange.value[0])),
					tabIndex: activeTab.value
				}
			});

			if (error) throw new Error(error);

			const newList = data.list || [];
			userList.value = isRefresh ? newList : [...userList.value, ...newList];
			total.value = data.total;

			// uni-load-more 的状态应该是 'noMore'
			loadingStatus.value = userList.value.length >= total.value ? 'noMore' : 'more';

		} catch (err) {
			loadingStatus.value = 'more'; // 失败时允许重试
			uni.showToast({
				title: err.message || '加载失败',
				icon: 'none'
			});
		}
	};

	const updateNextLocation = async () => {
		if (!destination.value.longitude || timeRange.value.length < 2) return;

		uni.showLoading({
			title: '正在规划行程...'
		});
		const {
			error
		} = await request('/app-api/member/user/upload-next-location', {
			method: 'POST',
			data: {
				longitude: destination.value.longitude,
				latitude: destination.value.latitude,
				nextLocationStartTime: formatDateTime(new Date(timeRange.value[0])),
				nextLocationEndTime: formatDateTime(new Date(timeRange.value[1])),
			}
		});
		uni.hideLoading();

		if (error) {
			uni.showToast({
				title: `行程规划失败: ${error}`,
				icon: 'none'
			});
		} else {
			uni.showToast({
				title: '行程已更新',
				icon: 'success'
			});
			fetchUserList(true);
		}
	};

	// --- 【修改】关注/取关 逻辑实现 (参照商机页的最佳实践) ---

	const handleFollowAction = async (user) => {
		// 1. 使用状态锁防止重复点击
		if (isFollowActionInProgress.value) return;

		// 2. 检查登录状态
		const currentUserId = uni.getStorageSync('userId');
		if (!currentUserId) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isFollowActionInProgress.value = true;

		// 3. 准备乐观更新
		const originalFollowStatus = user.followToFlag; // 原始状态 (0 或 1)
		const newFollowStatus = originalFollowStatus === 1 ? 0 : 1; // 目标状态
		const apiUrl = newFollowStatus === 1 ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMsg = newFollowStatus === 1 ? '关注成功' : '已取消关注';

		// 4. 立即执行乐观更新UI
		user.followToFlag = newFollowStatus;

		try {
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: {
					userId: currentUserId,
					targetId: user.id,
					targetType: 'post_user'
				}
			});

			if (error) {
				throw new Error(error); // 如果请求失败，抛出错误进入catch块
			}

			// API请求成功
			uni.showToast({
				title: successMsg,
				icon: 'success'
			});

		} catch (err) {
			// 5. 如果API请求失败，回滚UI
			user.followToFlag = originalFollowStatus;
			uni.showToast({
				title: err.message || '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 6. 释放状态锁
			isFollowActionInProgress.value = false;
		}
	};

	/**
	 * ==================== 跳转到个人名片页 ====================
	 * 
	 */
	const navigateToBusinessCard = (user) => {
		// 1. 检查传入的 user 对象和 user.id 是否有效
		if (!user || !user.id) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}

		// 2. 【核心】为 avatar 提供一个默认值，防止空字符串导致的问题
		const defaultAvatar = '/static/icon/default-avatar.png'; // 请确保这个默认头像图片存在于你的项目中
		// 【注意】这里的 user.nickname 对应的是后端返回的字段
		const name = user.nickname || '匿名用户';
		const avatarUrl = user.avatar || defaultAvatar;

		// 3. 构建带有多参数的URL，并使用 encodeURIComponent 编码
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;

		console.log('从人脉列表页跳转，URL:', url);

		// 4. 执行跳转
		uni.navigateTo({
			url: url
		});
	};

	/**
	 * @description 重置访友地点和时段的筛选条件
	 */
	const resetFilters = () => {
		uni.showModal({
			title: '提示',
			content: '确定要重置所有筛选条件吗？',
			success: (res) => {
				if (res.confirm) {
					destination.value = {};
					timeRange.value = [];

					// 重置后，列表应该变为空，所以直接调用 fetchUserList 即可
					// fetchUserList 内部有判断，当条件不满足时会自动清空列表
					fetchUserList(true);

					uni.showToast({
						title: '已重置',
						icon: 'none'
					});
				}
			}
		});
	};



	// --- 事件处理器 ---
	const handleChooseLocation = async () => {
		if (!await checkLoginGuard()) return;

		uni.chooseLocation({
			success: (res) => destination.value = res
		});
	};
	const handleTimeChange = async (e) => {
		if (!await checkLoginGuard()) {
			// 如果未登录，重置时间选择，防止触发 watch
			timeRange.value = [];
			return;
		}

		timeRange.value = e;
	};
	const switchTab = (tabIndex) => activeTab.value = tabIndex;
	const goToShakePage = async () => {
		if (!await checkLoginGuard()) return;

		uni.navigateTo({
			url: '/pages/location/location?autoShake=true'
		});
	};

	// --- 监听筛选条件变化 ---
	watch([destination, timeRange], updateNextLocation);
	watch(activeTab, () => fetchUserList(true));


	// --- 页面生命周期 ---
	onShow(() => {
		console.log("人脉页 onShow: 开始监听摇一摇");
		// isShaking.value = false; // 不再需要页面内的锁

		uni.onAccelerometerChange((res) => {
			if (Math.abs(res.x) > 1.5 || Math.abs(res.y) > 1.5 || Math.abs(res.z) > 1.5) {

				// 【【【核心修改：使用全局锁】】】
				if (!isShakeLocked.value) {
					// 1. 立即上锁
					lockShake();

					// 2. 静默跳转（保持之前的修改）
					console.log("检测到摇一摇，准备跳转...");
					goToShakePage();
				}
			}
		});
	});

	/**
	 * 页面隐藏时，停止监听，节省资源
	 */
	onHide(() => {
		console.log("人脉页 onHide: 停止监听摇一摇");
		uni.stopAccelerometer();
	});
	onLoad(() => {});
	onPullDownRefresh(() => {
		fetchUserList(true); // 直接调用即可，内部已处理 stopPullDownRefresh
	});
	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			queryParams.pageNo++;
			fetchUserList(false);
		}
	});

	// ==========================================================
	// --- 【新增】分享功能逻辑 ---
	// ==========================================================

	/**
	 * @description 监听用户点击“分享给好友”
	 */
	onShareAppMessage(() => {
		// 1. 获取当前用户的邀请码
		const inviteCode = getInviteCode();
		console.log(`[分享] 准备分享人脉页面给好友，邀请码: ${inviteCode}`);

		// 2. 构建分享路径
		// 基础路径是当前页面
		let sharePath = '/pages/relation/relation'; // 请确保这个路径是正确的
		if (inviteCode) {
			sharePath += `?inviteCode=${inviteCode}`;
		}

		// 3. 返回分享对象
		const shareContent = {
			title: '来这里拓展你的人脉圈，发现无限商机！',
			path: sharePath,
			imageUrl: '/static/connections-bg.png' // 使用页面头部的背景图作为分享封面
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
		console.log(`[分享] 准备分享人脉页面到朋友圈，邀请码: ${inviteCode}`);

		// 2. 构建 query 字符串
		let queryString = '';
		if (inviteCode) {
			queryString = `inviteCode=${inviteCode}`;
		}

		// 3. 返回分享对象
		const shareContent = {
			title: '来这里拓展你的人脉圈，发现无限商机！',
			query: queryString,
			imageUrl: '/static/connections-bg.png' // 使用页面头部的背景图作为分享封面
		};

		console.log('[分享] 分享到朋友圈的内容:', JSON.stringify(shareContent));

		return shareContent;
	});
</script>

<style lang="scss" scoped>
	$theme-color: #FF7500;

	.connections-page {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header-section {
		position: relative;
		height: 250rpx;
		color: white;
		overflow: hidden;
		border-radius: 0 0 40rpx 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		background-color: $theme-color;
	}

	.header-content {
		position: relative;
		z-index: 2;
		padding: 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		box-sizing: border-box;
	}

	/* 左侧标题组 */
	.header-title-group {
		flex: 1;
	}

	.page-title {
		font-size: 52rpx;
		font-weight: bold;
		text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
	}

	.page-subtitle {
		font-size: 26rpx;
		margin-top: 10rpx;
		opacity: 0.9;
	}

	/* 右侧入口样式 */
	.shake-entry-new {
		display: flex;
		align-items: center;
		/* 垂直居中对齐图标和文字组 */
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20rpx;
		padding: 15rpx 30rpx;
		flex-shrink: 0;
		/* 防止被压缩 */
	}

	.entry-icon {
		margin-right: 20rpx;
		/* 图标和文字之间的距离 */
	}

	.entry-text-group {
		display: flex;
		flex-direction: column;
		/* 让文字垂直排列 */
	}

	.entry-text {
		font-size: 38rpx;
		font-weight: 900;
		line-height: 1.4;
		/* 调整行高，让两行文字更紧凑 */
	}

	.main-content {
		padding: 30rpx;
		margin-top: -80rpx;
		position: relative;
		z-index: 10;
	}

	.selectors-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 20rpx 30rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
		margin-bottom: 40rpx;
		// 不再需要相对定位
		// position: relative; 
	}

	.selector-item {
		display: flex;
		align-items: center;
		padding: 25rpx 0;
		border-bottom: 1rpx solid #f0f0f0;

		// 移除之前为避免重叠而加的 padding-right
		// &:first-of-type {
		// 	padding-right: 150rpx; 
		// }

		&:last-child {
			border-bottom: none;
		}

		.picker-view {
			flex: 1;
			margin-left: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			min-width: 0;

			.label {
				font-size: 30rpx;
				color: #666;
				flex-shrink: 0;
				margin-right: 20rpx;
			}

			.value {
				font-size: 30rpx;
				color: #333;
				font-weight: 500;
				text-align: right;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	// 【全新的、最简单的重置按钮样式】
	// 1. 按钮行的容器
	.reset-btn-wrapper {
		display: flex; // 使用 flex 布局
		justify-content: flex-end; // 将内部元素推到最右边
		padding-bottom: 15rpx; // 按钮行与下方内容的分隔
		margin-bottom: 15rpx; // 
		border-bottom: 1rpx solid #f0f0f0; // 添加一条分割线，使其看起来更规整
	}

	// 2. 按钮本身
	.reset-btn {
		// 移除所有定位属性
		// position: absolute;

		display: flex;
		align-items: center;
		padding: 8rpx 15rpx;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		font-size: 24rpx;
		color: #666;

		text {
			margin-left: 8rpx;
		}
	}

	.tabs {
		display: flex;
		background-color: #ffffff;
		border-radius: 40rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 25rpx 0;
			font-size: 30rpx;
			color: #666;
			font-weight: 500;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;

			&.active {
				background-color: lighten($theme-color, 35%);
				color: $theme-color;
				font-weight: bold;
			}
		}
	}

	.user-list {
		display: flex;
		flex-direction: column;
		gap: 25rpx;
	}

	.user-card {
		display: flex;
		align-items: center;
		background-color: #fff;
		padding: 25rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 25rpx;
		flex-shrink: 0;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.name-row {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.industry-tag {
		margin-left: 15rpx;
		background-color: #FFF0E6;
		color: $theme-color;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		font-size: 22rpx;
		font-weight: 500;
		flex-shrink: 0;
	}

	.company {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.follow-status {
		display: flex;
		gap: 10rpx;

		.status-tag {
			font-size: 22rpx;
			padding: 4rpx 10rpx;
			border-radius: 6rpx;
		}

		.follower {
			background-color: #e9ecef;
			color: #495057;
		}
	}

	.follow-btn {
		background: $theme-color;
		color: white;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 26rpx;
		border-radius: 30rpx;
		padding: 0 30rpx;
		margin-left: 20rpx;
		flex-shrink: 0;

		&::after {
			border: none;
		}

		&.followed-btn {
			background: #ccc;
			color: #666;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		text-align: center;

		.empty-text {
			margin-top: 20rpx;
			font-size: 30rpx;
			color: #888;
		}

		.empty-subtext {
			margin-top: 10rpx;
			font-size: 26rpx;
			color: #aaa;
		}
	}
</style>