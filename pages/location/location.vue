<template>
	<view class="nearby-container">
		<view class="header">
			<view class="tabs-wrapper">
				<uni-segmented-control :current="currentTab" :values="tabItems" style-type="button"
					active-color="#FF6B00" @clickItem="handleTabClick" />
			</view>
		</view>

		<view class="content-area">
			<!-- 1. 摇一摇界面 (v-if="!shaken") -->
			<view v-if="!shaken" class="shake-container">
				<view class="shake-btn" @click="triggerShakeSequence">
					<uni-icons type="hand-up" size="60" color="#FFFFFF" class="shake-icon" />
					<text>摇一摇</text>
				</view>
				<text class="shake-hint">点击按钮或晃动手机，发现附近的聚会和商友</text>
			</view>

			<!-- 2. 加载中界面 (v-else-if="loading") -->
			<view v-else-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">正在发现附近内容...</text>
			</view>

			<!-- 3. 结果列表界面 (v-else) -->
			<view v-else class="list-container fade-in">
				<!-- 聚会列表 -->
				<view v-show="currentTab === 0">
					<view class="list-title">
						<uni-icons type="staff-filled" size="20" color="#FF6B00" />
						<text>附近商友</text>
					</view>
					<view v-for="business in businesses" :key="business.id" class="business-card">
						<image :src="business.avatar || '/static/images/default-avatar.png'" mode="aspectFill"
							class="business-avatar" @click.stop="navigateToBusinessCard(business)" />
						<view class="business-info">
							<view class="name-line">
								<text class="business-name">{{ business.nickname }}</text>
							</view>
							<view class="card-position" v-if="business.professionalTitle">
								{{ business.professionalTitle }}
							</view>
							<view class="card-company" v-if="business.companyName">
								{{ business.companyName }}
							</view>
							<view class="relation-tags"
								v-if="business.fellowTownspeopleCityFlag === 1 || business.peerFlag === 1 || business.classmateFlag === 1">
								<text v-if="business.friendParentFlag === 1" class="tag fellow-circle">同圈</text>
								<text v-if="business.fellowTownspeopleCityFlag === 1"
									class="tag fellow-townsman">同乡</text>
								<text v-if="business.peerFlag === 1" class="tag peer">同行</text>
								<text v-if="business.classmateFlag === 1" class="tag classmate">同学</text>
							</view>
						</view>
						<!-- 【核心修改】按钮状态绑定到 followFlag，并调用统一的 handleFollowAction 方法 -->
						<button class="connect-btn" :class="{ 'connected': business.followFlag === 1 }"
							@click.stop="handleFollowAction(business)">
							{{ business.followFlag === 1 ? '取关' : '关注' }}
						</button>
					</view>
					<uni-load-more :status="businessLoadingStatus"></uni-load-more>
					<view v-if="businesses.length === 0 && businessLoadingStatus === 'noMore'" class="no-more-content">
						附近暂无商友，去别处看看吧
					</view>
				</view>

				<!-- 商友列表 -->
				<view v-show="currentTab === 1">
					<view class="list-title">
						<uni-icons type="calendar-filled" size="20" color="#FF6B00" />
						<text>附近聚会</text>
					</view>
					<ActivityCard v-for="activity in activities" :key="activity.id" :activity="activity"
						:is-login="isUserLoggedIn" />
					<uni-load-more :status="activityLoadingStatus"></uni-load-more>
					<view v-if="activities.length === 0 && activityLoadingStatus === 'noMore'" class="no-more-content">
						附近暂无聚会，去别处看看吧
					</view>



				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		nextTick
	} from 'vue';
	import {
		onReachBottom,
		onShow,
		onHide,
		onLoad
	} from '@dcloudio/uni-app';
	import ActivityCard from '@/components/ActivityCard.vue';
	import request from '../../utils/request.js';
	import {
		useShakeLock
	} from '@/utils/shakeLock.js';

	let shakeAudioContext = null;

	const {
		isShakeLocked,
		lockShake
	} = useShakeLock();

	const isUserLoggedIn = ref(false);

	const autoShakeOnLoad = ref(false);

	// --- 状态管理 ---
	const currentTab = ref(0);
	const tabItems = ref(['商友', '聚会']);
	const shaken = ref(false); // 是否已经摇过并显示结果
	const loading = ref(false); // 是否正在加载数据（摇动后）
	const shakeDebounce = ref(true); // 摇一摇的防抖
	const userLocation = ref(null);

	// 分页和加载状态
	const activityPageNo = ref(1);
	const businessPageNo = ref(1);
	const activityLoadingStatus = ref('more');
	const businessLoadingStatus = ref('more');
	const isFollowActionInProgress = ref(false);

	// 数据
	const activities = ref([]);
	const businesses = ref([]);

	// --- 重置页面状态的函数 ---
	const resetState = () => {
		console.log("页面状态已重置");
		shaken.value = false;
		loading.value = false;
		activities.value = [];
		businesses.value = [];
		activityPageNo.value = 1;
		businessPageNo.value = 1;
		activityLoadingStatus.value = 'more';
		businessLoadingStatus.value = 'more';
		// shakeDebounce.value = true;
	};

	// --- 方法 ---
	const checkLoginStatus = () => {
		const token = uni.getStorageSync('token');
		isUserLoggedIn.value = !!token; // 如果token存在，则为true，否则为false
	};



	const handleTabClick = (e) => {
		if (loading.value) return;
		currentTab.value = e.currentIndex;
		console.log("🔥点击切换tab！当前 Tab 索引为:", currentTab.value); // 调试日志
	};

	const triggerShakeSequence = () => {
		// 1. 立即捕获当前的 Tab
		const savedTabIndex = currentTab.value;

		console.log("🔥 摇一摇触发！当前 Tab 索引为:", savedTabIndex); // 调试日志

		lockShake();

		if (shakeAudioContext) {
			shakeAudioContext.stop();
			shakeAudioContext.play();
		}

		// 2. 将捕获到的 Tab 传给下一步
		getLocationAndProceed(savedTabIndex);
	};

	const getLocationAndProceed = (savedTabIndex = 0) => {
		uni.showLoading({
			title: '正在定位...',
			mask: true
		});

		uni.getLocation({
			type: 'gcj02',
			success: async (res) => {
				uni.hideLoading();
				userLocation.value = {
					latitude: res.latitude,
					longitude: res.longitude,
				};

				shaken.value = true;
				loading.value = true;
				uni.vibrateShort();

				// 确保 Tab 还是摇动前那个（防止意外变动）
				currentTab.value = savedTabIndex;

				try {
					// 两个接口都请求，这样切换 Tab 时数据都在
					await Promise.all([
						getNearbyActivities(true),
						getNearbyBusinesses(true)
					]);
				} catch (error) {
					console.error('加载错误:', error);
				} finally {
					loading.value = false;

					// 再次确保 Tab 没变
					if (currentTab.value !== savedTabIndex) {
						currentTab.value = savedTabIndex;
					}
				}
			},
			fail: (err) => {
				uni.hideLoading();
				uni.showToast({
					title: '定位失败',
					icon: 'none'
				});
				// 解锁摇一摇
				// if (typeof lockShake === 'function') lockShake(1000);
			}
		});
	};

	const getNearbyActivities = async (isRefresh = false) => {
		if (activityLoadingStatus.value === 'loading' && !isRefresh) return;
		activityLoadingStatus.value = 'loading';

		if (isRefresh) {
			activityPageNo.value = 1;
			activities.value = [];
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/activity/list', {
				method: 'GET',
				data: {
					pageNo: activityPageNo.value,
					pageSize: 10,
					longitude: userLocation.value.longitude,
					latitude: userLocation.value.latitude,
				}
			});

			if (error) throw new Error(error);

			const list = data.list || [];
			activities.value = isRefresh ? list : [...activities.value, ...list];
			activityLoadingStatus.value = activities.value.length >= data.total ? 'noMore' : 'more';
			if (activityLoadingStatus.value === 'more') activityPageNo.value++;

		} catch (err) {
			activityLoadingStatus.value = 'more';
		}
	};

	const getNearbyBusinesses = async (isRefresh = false) => {
		if (businessLoadingStatus.value === 'loading' && !isRefresh) return;
		businessLoadingStatus.value = 'loading';

		if (isRefresh) {
			businessPageNo.value = 1;
			businesses.value = [];
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/list', {
				method: 'GET',
				data: {
					pageNo: businessPageNo.value,
					pageSize: 10,
					longitude: userLocation.value.longitude,
					latitude: userLocation.value.latitude,
				}
			});

			if (error) throw new Error(error);

			const list = data.list || [];
			businesses.value = isRefresh ? list : [...businesses.value, ...list];
			businessLoadingStatus.value = businesses.value.length >= data.total ? 'noMore' : 'more';
			if (businessLoadingStatus.value === 'more') businessPageNo.value++;

		} catch (err) {
			businessLoadingStatus.value = 'more';
		}
	};

	// --- 关注/取关功能 ---
	const handleFollowAction = async (user) => {
		if (isFollowActionInProgress.value) return;

		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showModal({
				title: '需要登录',
				content: '关注功能需要登录后才能使用，是否前往登录？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/index/index' // 或者你的登录页
						});
					}
				}
			});
			return;
		}

		const currentUserId = uni.getStorageSync('userId');


		isFollowActionInProgress.value = true;

		const originalFollowStatus = user.followFlag;
		const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
		const apiUrl = newFollowStatus === 1 ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMsg = newFollowStatus === 1 ? '关注成功' : '已取消关注';

		user.followFlag = newFollowStatus; // 乐观更新

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

			if (error) throw new Error(error);

			uni.showToast({
				title: successMsg,
				icon: 'success'
			});

		} catch (err) {
			user.followFlag = originalFollowStatus; // 失败回滚
			uni.showToast({
				title: err.message || '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isFollowActionInProgress.value = false;
		}
	};

	/**
	 * ==================== 跳转到个人名片页 ====================
	 * (此为标准可复用函数)
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

		// 2. 准备参数，并提供默认值
		const defaultAvatar = '/static/icon/default-avatar.png'; // 请确保这个默认头像图片存在
		const name = user.nickname || '匿名用户';
		const avatarUrl = user.avatar || defaultAvatar;

		// 3. 构建带有多参数的URL，并使用 encodeURIComponent 编码
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;

		console.log('从摇一摇页跳转，URL:', url);

		// 4. 执行跳转
		uni.navigateTo({
			url: url
		});
	};

	// --- 生命周期钩子 ---
	onLoad((options) => {
		resetState();
		// 这个钩子只在页面首次加载时运行一次
		if (options.autoShake === 'true') {
			console.log("onLoad: 接收到自动摇一摇指令");
			// 设置标记，告诉 onShow 需要立即执行
			autoShakeOnLoad.value = true;
		}
	});

	onShow(() => {
		checkLoginStatus();

		// 初始化音频
		if (!shakeAudioContext) {
			shakeAudioContext = uni.createInnerAudioContext();
			shakeAudioContext.src = 'https://img.gofor.club/wechat_shake.mp3';
		}

		// 只有在明确收到“自动摇”指令时才重置
		if (autoShakeOnLoad.value) {
			console.log("onShow: 执行自动摇一摇流程");
			// 只有自动摇的时候，才强制重置状态
			resetState();
			// 自动摇默认应该在商友页，或者你可以指定
			// currentTab.value = 0;
			triggerShakeSequence();
			autoShakeOnLoad.value = false;
		}

		// 监听摇一摇
		uni.onAccelerometerChange((res) => {
			if (Math.abs(res.x) > 1.2 && Math.abs(res.y) > 1.2) {
				if (!isShakeLocked.value) {
					triggerShakeSequence();
				}
			}
		});
	});

	onHide(() => {
		uni.stopAccelerometer();
		if (shakeAudioContext) {
			shakeAudioContext.destroy();
			shakeAudioContext = null;
		}
	});

	/**
	 * @description 页面滚动到底部时触发加载更多
	 */
	onReachBottom(() => {
		// 检查当前激活的 Tab 是哪个
		switch (currentTab.value) {
			case 0: // 当前是 "商友" (Businesses) Tab
				// 检查商友列表是否还有更多数据可加载
				if (businessLoadingStatus.value === 'more') {
					console.log("触底加载更多商友...");
					getNearbyBusinesses(); // 【修复】调用正确的加载商友方法
				}
				break;
			case 1: // 当前是 "聚会" (Activities) Tab
				// 检查聚会列表是否还有更多数据可加载
				if (activityLoadingStatus.value === 'more') {
					console.log("触底加载更多聚会...");
					getNearbyActivities(); // 【修复】调用正确的加载聚会方法
				}
				break;
		}
	});
</script>


<style lang="scss" scoped>
	/* 您的样式完全不用修改，这里省略以保持简洁 */
	.nearby-container {
		background-color: #f8f9fa;
		min-height: 100vh;
	}

	.header {
		background-color: #fff;
		padding: 20rpx 30rpx;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		padding-top: var(--status-bar-height);

		.tabs-wrapper {
			margin: 0 auto;
		}
	}

	.content-area {
		padding: 0 32rpx;
	}

	.shake-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 70vh;
		text-align: center;
	}

	.shake-btn {
		width: 320rpx;
		height: 320rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 40rpx;
		font-weight: bold;
		box-shadow: 0 20rpx 50rpx rgba(255, 107, 0, 0.3);
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.95);
			box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.4);
		}
	}

	.shake-icon {
		animation: pulse 2s infinite;
	}

	.shake-hint {
		margin-top: 40rpx;
		font-size: 28rpx;
		color: #666;
		max-width: 600rpx;
		line-height: 1.6;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		color: #666;
	}

	.loading-spinner {
		width: 50rpx;
		height: 50rpx;
		border: 4rpx solid #e0e0e0;
		border-top-color: #ff6b00;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}

	.loading-text {
		font-size: 28rpx;
	}

	.no-more-content {
		text-align: center;
		color: #999;
		padding: 30rpx 0;
		font-size: 28rpx;
	}

	.list-container {
		padding-top: 30rpx;
	}

	.list-title {
		font-size: 36rpx;
		font-weight: 600;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;

		text {
			margin-left: 16rpx;
		}
	}

	.business-card {
		background: white;
		border-radius: 24rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);

		.business-avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			margin-right: 30rpx;
			flex-shrink: 0;
		}

		.card-position,
		.card-company {
			font-size: 26rpx;
			color: #666;
			margin-top: 8rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.business-info {
			flex: 1;
			min-width: 0;

			// 【新增】名字和标签行的样式
			.name-line {
				margin-bottom: 10rpx;
			}

			.business-name {
				font-size: 32rpx;
				font-weight: 600;
			}

			.card-position,
			.card-company {
				font-size: 26rpx;
				color: #666;
				margin-top: 8rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			/* 为移动后的标签容器添加样式 */
			.relation-tags {
				display: flex;
				gap: 10rpx;
				margin-top: 16rpx;
				/* 与上方的公司信息拉开距离 */
			}

			// 通用标签样式
			.tag {
				font-size: 16rpx;
				padding: 3rpx 12rpx;
				border-radius: 6rpx;
				font-weight: 500;
				white-space: nowrap;
			}

			// 不同类型标签的颜色
			.fellow-townsman {
				background-color: #e8f5e9; // 淡绿色背景
				color: #388e3c; // 深绿色文字
				border: 1rpx solid #a5d6a7;
			}

			.fellow-circle {
				background-color: #f3e5f5;
				/* 浅紫色背景 */
				color: #9c27b0;
				/* 紫色文字 */
				border: 1rpx solid #e1bee7;
			}

			.peer {
				background-color: #e3f2fd; // 淡蓝色背景
				color: #1976d2; // 深蓝色文字
				border: 1rpx solid #90caf9;
			}

			.classmate {
				background-color: #fff3e0; // 淡橙色背景
				color: #ef6c00; // 深橙色文字
				border: 1rpx solid #ffcc80;
			}
		}

		.business-name {
			font-size: 32rpx;
			font-weight: 600;
			margin-bottom: 10rpx;
		}

		.connect-btn {
			background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
			color: white;
			border: none;
			padding: 0 30rpx;
			height: 60rpx;
			line-height: 60rpx;
			border-radius: 40rpx;
			font-weight: 500;
			align-self: center;
			font-size: 26rpx;
			margin-left: 20rpx;
			white-space: nowrap;

			&::after {
				border: none;
			}
		}

		.connect-btn.connected {
			background: #f0f2f5;
			color: #999;
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.1);
		}

		100% {
			transform: scale(1);
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.fade-in {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.iconfont {
		margin-right: 10rpx;
	}
</style>