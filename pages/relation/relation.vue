<template>
	<view class="connections-page">
		<!-- 1. 优化后的头部：去掉了摇一摇，改为纯净的子页面标题 -->
		<view class="header-section">
			<image src="/static/connections-bg.png" mode="aspectFill" class="header-bg"></image>
			<view class="header-content">
				<view class="header-title-group">
					<text class="page-title">自定义访友搜索</text>
					<text class="page-subtitle">跨城出差 · 提前布局 · 精准访友</text>
				</view>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 选择器区域 -->
			<view class="selectors-card">
				<!-- 重置按钮行 -->
				<view class="reset-btn-wrapper">
					<view class="reset-btn" @click="resetFilters">
						<uni-icons type="refreshempty" size="16" color="#666"></uni-icons>
						<text>重置筛选</text>
					</view>
				</view>

				<!-- 访友地点 -->
				<view class="selector-item" @click="handleChooseLocation">
					<uni-icons type="paperplane-filled" size="20" color="#FF8400"></uni-icons>
					<view class="picker-view">
						<text class="label">拟访地点：</text>
						<text class="value">{{ destination.name || '请选择拟访友地点' }}</text>
					</view>
					<uni-icons type="right" size="16" color="#CCC"></uni-icons>
				</view>

				<!-- 访友时段 -->
				<view class="selector-item">
					<uni-icons type="calendar-filled" size="20" color="#FF8400"></uni-icons>
					<uni-datetime-picker v-model="timeRange" type="datetimerange" @change="handleTimeChange">
						<view class="picker-view">
							<text class="label">访友时段：</text>
							<text class="value">{{ timeRangeText }}</text>
						</view>
					</uni-datetime-picker>
					<uni-icons type="right" size="16" color="#CCC"></uni-icons>
				</view>
			</view>

			<!-- 标签页切换 -->
			<view class="tabs">
				<view class="tab-item" :class="{ 'active': activeTab === 0 }" @click="switchTab(0)">
					当地商友
				</view>
				<view class="tab-item" :class="{ 'active': activeTab === 1 }" @click="switchTab(1)">
					当地关注
				</view>
			</view>

			<!-- 人脉列表 -->
			<view class="user-list">
				<view class="user-card" v-for="user in userList" :key="user.id">
					<image :src="user.avatar || '/static/images/default-avatar.png'" mode="aspectFill" class="avatar"
						@click.stop="navigateToBusinessCard(user)"></image>
					<view class="user-info">
						<view class="name-row">
							<text class="name">{{ user.nickname }}</text>
							<view v-if="user.idCert === 1" class="cert-tag">已实名</view>
						</view>
						<view class="company">{{ user.companyName || '保密机构' }}</view>
						<view class="position">{{ user.positionTitle || user.professionalTitle || '精英商友' }}</view>
					</view>

					<button class="follow-btn" :class="{ 'followed-btn': user.followToFlag === 1 }"
						@click.stop="handleFollowAction(user)">
						{{ user.followToFlag === 1 ? '已关注' : '+ 关注' }}
					</button>
				</view>

				<!-- 列表为空的提示 -->
				<view v-if="isListEmpty" class="empty-state">
					<uni-icons type="staff" size="60" color="#e0e0e0"></uni-icons>
					<text class="empty-text">未找到相关行程的商友</text>
					<text class="empty-subtext">请确保已选择访友地点与有效时段</text>
				</view>

				<uni-load-more :status="loadingStatus"
					v-if="userList.length > 0 || loadingStatus === 'loading'"></uni-load-more>
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
		onShow
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	const themeColor = '#FF8400';

	// --- 辅助函数 ---
	const formatDateTime = (date) => {
		if (!date) return '';
		const d = new Date(date);
		const Y = d.getFullYear();
		const M = (d.getMonth() + 1).toString().padStart(2, '0');
		const D = d.getDate().toString().padStart(2, '0');
		const h = d.getHours().toString().padStart(2, '0');
		const m = d.getMinutes().toString().padStart(2, '0');
		const s = d.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	// --- 核心状态 ---
	const destination = ref({});
	const timeRange = ref([]);
	const activeTab = ref(0);
	const userList = ref([]);
	const total = ref(0);
	const loadingStatus = ref('more');
	const queryParams = reactive({
		pageNo: 1,
		pageSize: 10
	});
	const isFollowActionInProgress = ref(false);

	const timeRangeText = computed(() => {
		if (timeRange.value && timeRange.value.length === 2) {
			const start = timeRange.value[0].slice(5, 16);
			const end = timeRange.value[1].slice(5, 16);
			return `${start} 至 ${end}`;
		}
		return '请选择拟访友时段';
	});

	const isListEmpty = computed(() => userList.value.length === 0 && loadingStatus.value !== 'loading');

	// --- API 调用 (核心逻辑更新) ---
	const fetchUserList = async (isRefresh = false) => {
		if (isRefresh) uni.stopPullDownRefresh();

		// 检查条件
		if (!destination.value.longitude || !timeRange.value || timeRange.value.length < 2) {
			userList.value = [];
			loadingStatus.value = 'noMore';
			return;
		}

		if (loadingStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			queryParams.pageNo = 1;
			userList.value = [];
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
					// 【修改点】：更新为后端新的两个字段
					nextStartLocationTime: formatDateTime(timeRange.value[0]),
					nextEndLocationTime: formatDateTime(timeRange.value[1]),
					tabIndex: activeTab.value
				}
			});

			if (error) throw new Error(error);

			const newList = data.list || [];
			userList.value = isRefresh ? newList : [...userList.value, ...newList];
			total.value = data.total || 0;
			loadingStatus.value = userList.value.length >= total.value ? 'noMore' : 'more';

		} catch (err) {
			loadingStatus.value = 'more';
			uni.showToast({
				title: err.message || '加载失败',
				icon: 'none'
			});
		}
	};

	// 监听筛选变化自动上传行程并刷新列表
	const handleCriteriaChange = async () => {
		if (!destination.value.longitude || !timeRange.value || timeRange.value.length < 2) return;

		uni.showLoading({
			title: '同步行程...'
		});

		const {
			error
		} = await request('/app-api/member/user/upload-next-location', {
			method: 'POST',
			data: {
				longitude: destination.value.longitude,
				latitude: destination.value.latitude,
				// 1. 移除 encodeURIComponent，直接传 formatDateTime 的结果
				// 2. 检查字段名：如果后端报“结束时间不能为空”，说明它没认出 nextEndLocationTime
				// 请确认 POST 接口是否应使用原来的字段名：nextLocationStartTime 和 nextLocationEndTime
				nextLocationStartTime: formatDateTime(timeRange.value[0]),
				nextLocationEndTime: formatDateTime(timeRange.value[1]),
			}
		});

		uni.hideLoading();

		if (!error) {
			fetchUserList(true);
		}
	};

	// --- 关注/取关 逻辑 ---
	const handleFollowAction = async (user) => {
		if (isFollowActionInProgress.value) return;
		const currentUserId = uni.getStorageSync('userId');
		if (!currentUserId) return uni.showToast({
			title: '请先登录',
			icon: 'none'
		});

		isFollowActionInProgress.value = true;
		const originalStatus = user.followToFlag;
		const newStatus = originalStatus === 1 ? 0 : 1;
		user.followToFlag = newStatus; // 乐观更新

		try {
			const apiUrl = newStatus === 1 ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: {
					targetId: user.id,
					targetType: 'post_user'
				}
			});
			if (error) throw new Error(error);
			uni.showToast({
				title: newStatus === 1 ? '关注成功' : '已取消关注',
				icon: 'success'
			});
		} catch (err) {
			user.followToFlag = originalStatus; // 回滚
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			});
		} finally {
			isFollowActionInProgress.value = false;
		}
	};

	const resetFilters = () => {
		uni.showModal({
			title: '提示',
			content: '确定要重置筛选条件吗？',
			success: (res) => {
				if (res.confirm) {
					destination.value = {};
					timeRange.value = [];
					userList.value = [];
					loadingStatus.value = 'noMore';
				}
			}
		});
	};

	const handleChooseLocation = async () => {
		if (!await checkLoginGuard()) return;
		uni.chooseLocation({
			success: (res) => {
				destination.value = res;
				handleCriteriaChange();
			}
		});
	};

	const handleTimeChange = (e) => {
		timeRange.value = e;
		handleCriteriaChange();
	};

	const switchTab = (index) => {
		activeTab.value = index;
		fetchUserList(true);
	};

	const navigateToBusinessCard = (user) => {
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar || '')}`
		});
	};

	onPullDownRefresh(() => fetchUserList(true));
	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			queryParams.pageNo++;
			fetchUserList();
		}
	});
</script>

<style lang="scss" scoped>
	$theme-color: #FF8400;

	.connections-page {
		background-color: #f8f9fb;
		min-height: 100vh;
	}

	.header-section {
		position: relative;
		height: 260rpx;
		color: white;
		border-radius: 0 0 50rpx 50rpx;
		overflow: hidden;

		.header-bg {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background-color: #1A1A1A;
		}
	}

	.header-content {
		position: relative;
		z-index: 2;
		padding: 60rpx 40rpx;
		display: flex;
		align-items: center;

		.page-title {
			font-size: 44rpx;
			font-weight: bold;
			display: block;
		}

		.page-subtitle {
			font-size: 24rpx;
			opacity: 0.6;
			margin-top: 10rpx;
			display: block;
		}
	}

	.main-content {
		padding: 30rpx;
		margin-top: -60rpx;
		position: relative;
		z-index: 10;
	}

	.selectors-card {
		background: #FFF;
		border-radius: 30rpx;
		padding: 10rpx 30rpx 30rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 40rpx;

		.reset-btn-wrapper {
			display: flex;
			justify-content: flex-end;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #F0F0F0;
		}

		.reset-btn {
			font-size: 24rpx;
			color: #999;
			display: flex;
			align-items: center;
			gap: 6rpx;
		}
	}

	.selector-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #F8F8F8;

		&:last-child {
			border-bottom: none;
		}

		.picker-view {
			flex: 1;
			margin-left: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.label {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}

			.value {
				font-size: 28rpx;
				color: $theme-color;
				font-weight: bold;
				text-align: right;
				flex: 1;
				margin-left: 20rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.tabs {
		display: flex;
		background: #FFF;
		border-radius: 50rpx;
		margin-bottom: 30rpx;
		padding: 10rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 20rpx 0;
			font-size: 28rpx;
			color: #666;
			border-radius: 40rpx;
			transition: all 0.3s;

			&.active {
				background: $theme-color;
				color: #FFF;
				font-weight: bold;
				box-shadow: 0 6rpx 20rpx rgba($theme-color, 0.3);
			}
		}
	}

	.user-card {
		display: flex;
		align-items: center;
		background: #FFF;
		padding: 30rpx;
		border-radius: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			background: #EEE;
		}

		.user-info {
			flex: 1;
			margin-left: 24rpx;
			overflow: hidden;

			.name-row {
				display: flex;
				align-items: center;
				margin-bottom: 8rpx;

				.name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}

				.cert-tag {
					margin-left: 12rpx;
					background: #E6F7FF;
					color: #1890FF;
					font-size: 20rpx;
					padding: 2rpx 10rpx;
					border-radius: 4rpx;
				}
			}

			.company {
				font-size: 24rpx;
				color: #666;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.position {
				font-size: 22rpx;
				color: #999;
				margin-top: 4rpx;
			}
		}

		.follow-btn {
			background: #333;
			color: #FFF;
			font-size: 24rpx;
			padding: 0 30rpx;
			height: 60rpx;
			line-height: 60rpx;
			border-radius: 30rpx;
			font-weight: bold;

			&.followed-btn {
				background: #F5F5F5;
				color: #CCC;
			}
		}
	}

	.empty-state {
		padding: 100rpx 0;
		text-align: center;

		.empty-text {
			font-size: 30rpx;
			color: #999;
			margin-top: 20rpx;
			display: block;
		}

		.empty-subtext {
			font-size: 24rpx;
			color: #CCC;
			margin-top: 10rpx;
			display: block;
		}
	}
</style>