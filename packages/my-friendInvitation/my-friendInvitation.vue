<template>
	<view class="page-container">
		<!-- 1. 顶部 Tab 切换 -->
		<view class="tabs-container">
			<uni-segmented-control :current="currentTab" :values="tabItems" @clickItem="handleTabClick"
				style-type="button" active-color="#FF6B00" />
		</view>

		<!-- 2. 内容区域 -->
		<view class="content-area">
			<!-- Tab 0: 我邀请的人 (列表) -->
			<view v-show="currentTab === 1" class="tab-panel">
				<!-- 商友列表 -->
				<view class="friend-list">
					<view class="friend-card" v-for="friend in friendList" :key="friend.id"
						@click="navigateToBusinessCard(friend)">
						<image class="friend-avatar" :src="friend.avatar || '/static/images/default-avatar.png'"
							mode="aspectFill"></image>
						<view class="friend-info">
							<view class="info-header">
								<text class="friend-name">{{ friend.nickname || friend.realName || '匿名用户' }}</text>
								<view class="relation-tags"
									v-if="friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1">
									<text v-if="friend.fellowTownspeopleCityFlag === 1"
										class="tag fellow-townsman">同乡</text>
									<text v-if="friend.peerFlag === 1" class="tag peer">同行</text>
									<text v-if="friend.classmateFlag === 1" class="tag classmate">同学</text>
								</view>
							</view>
							<view class="friend-company">
								<uni-icons type="briefcase-filled" size="14" color="#888"></uni-icons>
								<text>{{ friend.companyName || '暂无公司信息' }}</text>
							</view>
						</view>
						<view class="action-area">
							<button class="follow-btn" :class="{ 'followed': friend.followFlag === 1 }"
								@click.stop="handleFollowAction(friend)">
								{{ friend.followFlag === 1 ? '取关' : '关注' }}
							</button>
							<view class="invite-time" v-if="friend.followTime">
								{{ formatTimestamp(friend.followTime) }}
							</view>
						</view>
					</view>
				</view>
				<!-- 加载与空状态 -->
				<uni-load-more :status="loadStatus"
					v-if="friendList.length > 0 || loadStatus === 'loading'"></uni-load-more>
				<view class="empty-container" v-if="friendList.length === 0 && loadStatus === 'noMore'">
					<image class="empty-image" src="/static/images/empty-invite.png" mode="widthFix"></image>
					<text class="empty-text">您还没有邀请过商友哦，快去分享吧！</text>
				</view>
			</view>

			<!-- Tab 1: 我的邀请人 (单个卡片) -->
			<view v-show="currentTab === 0" class="tab-panel">
				<!-- 根据 userInfo.parentName 的存在与否显示不同内容 -->
				<view v-if="userInfo && userInfo.parentName" class="inviter-section">
					<view class="section-title">我的邀请人</view>
					<view class="inviter-card">
						<view class="inviter-avatar">
							<!-- 同样使用头像或文字占位 -->
							<image v-if="userInfo.parentAvatar" :src="userInfo.parentAvatar" class="inviter-avatar-img"
								mode="aspectFill"></image>
							<view v-else class="avatar-placeholder">{{ userInfo.parentName.charAt(0) }}</view>
						</view>
						<view class="inviter-info">
							<view class="inviter-name">{{ userInfo.parentName }}</view>
							<!-- <view class="inviter-desc">感谢引荐，共同成长！</view> -->
						</view>
					</view>
				</view>
				<view v-else class="empty-container">
					<image class="empty-image" src="/static/images/empty-box.png" mode="widthFix"></image>
					<text class="empty-text">您不是通过邀请加入的哦</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js'; // 确保路径正确

	// --- 页面配置与状态 ---
	const themeColor = ref('#FF6E00');
	const currentTab = ref(0);
	const tabItems = ['我的邀请人', '我邀请的人'];

	// --- "我邀请的人" 列表相关状态 ---
	const friendList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more');
	const isFollowActionInProgress = ref(false);

	// --- "我的邀请人" 相关状态 ---
	const userInfo = ref(null);

	// --- 生命周期 ---
	// onMounted(() => {
	// 	// 页面加载时，两个接口都可以请求
	// 	getShareUserList(true); // 加载我邀请的人列表
	// 	fetchUserInfo(); // 加载当前用户信息
	// });

	// onPullDownRefresh(() => {
	// 	// 下拉刷新只针对当前显示的列表
	// 	if (currentTab.value === 0) {
	// 		getShareUserList(true);
	// 	} else {
	// 		// “我的邀请人”也可以刷新一下
	// 		fetchUserInfo().finally(() => uni.stopPullDownRefresh());
	// 	}
	// });
	onMounted(() => {
		// 页面加载时，调用新的初始化函数
		initializePage();
	});

	onPullDownRefresh(() => {
		// 根据新的顺序调整逻辑
		if (currentTab.value === 1) { // 索引为 1 的是“我邀请的人”列表
			getShareUserList(true);
		} else {
			// 索引为 0 的是“我的邀请人”
			fetchUserInfo().finally(() => uni.stopPullDownRefresh());
		}
	});

	onReachBottom(() => {
		// 触底加载只对“我邀请的人”列表有效
		if (currentTab.value === 1) { // 只有在列表页才加载更多
			getShareUserList();
		}
	});

	// --- 方法 ---
	/**
	 * 页面初始化函数，整合所有首次加载和刷新的逻辑
	 */
	const initializePage = async () => {
		// 两个接口都可以并行请求
		const fetchListPromise = getShareUserList(true); // 加载我邀请的人列表
		const fetchInfoPromise = fetchUserInfo(); // 加载当前用户信息

		// 等待所有请求完成
		await Promise.all([fetchListPromise, fetchInfoPromise]);

		// 所有数据加载完毕后，统一停止下拉刷新动画
		uni.stopPullDownRefresh();
	};

	const handleTabClick = (e) => {
		currentTab.value = e.currentIndex;
	};

	/**
	 * @description 获取当前用户信息 (用于"我的邀请人")
	 */
	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get');
		if (!error) {
			userInfo.value = data;
		}
	};

	/**
	 * @description 获取我邀请的人列表 (原"我推荐的商友")
	 */
	const getShareUserList = async (isRefresh = false) => {
		if (loadStatus.value === 'loading' || (!isRefresh && loadStatus.value === 'noMore')) return;
		if (isRefresh) {
			pageNo.value = 1;
			friendList.value = [];
			loadStatus.value = 'more';
		}
		loadStatus.value = 'loading';

		const {
			data,
			error
		} = await request('/app-api/member/user/share-user-list', {
			data: {
				pageNo: pageNo.value,
				pageSize: pageSize.value
			}
		});

		// if (isRefresh) uni.stopPullDownRefresh();

		if (error) {
			loadStatus.value = 'more';
			return;
		}

		if (data && data.list) {
			const list = data.list || [];
			friendList.value = isRefresh ? list : [...friendList.value, ...list];
			total.value = data.total;
			loadStatus.value = friendList.value.length >= total.value ? 'noMore' : 'more';
			if (loadStatus.value === 'more') pageNo.value++;
		} else {
			loadStatus.value = 'noMore';
		}
	};

	const handleFollowAction = async (user) => {
		if (isFollowActionInProgress.value) return;

		const currentUserId = uni.getStorageSync('userId');
		if (!currentUserId) {
			uni.showModal({
				title: '需要登录',
				content: '关注功能需要登录后才能使用，是否前往登录？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}
				}
			});
			return;
		}

		isFollowActionInProgress.value = true;

		const originalFollowStatus = user.followFlag;
		const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
		const apiUrl = newFollowStatus === 1 ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMsg = newFollowStatus === 1 ? '关注成功' : '已取消关注';

		// 乐观更新UI
		user.followFlag = newFollowStatus;

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
			// 失败回滚
			user.followFlag = originalFollowStatus;
			uni.showToast({
				title: err.message || '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isFollowActionInProgress.value = false;
		}
	};

	/**
	 * @description 跳转到申请兑换名片页面
	 * @param {object} user - 包含用户信息的对象 (id, nickname, realName, avatar)
	 */
	const navigateToBusinessCard = (user) => {
		// 1. 安全检查，确保 user 对象和 id 存在
		if (!user || !user.id) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}

		// 2. 准备传递的参数，并提供默认值
		const defaultAvatar = '/static/images/default-avatar.png'; // 确保这个默认头像图片存在
		const name = user.nickname || user.realName || '匿名用户';
		const avatarUrl = user.avatar || defaultAvatar;

		// 3. 构建带有多参数的URL，并使用 encodeURIComponent 编码，防止特殊字符导致问题
		const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}` +
			`&fromShare=1`;

		console.log('从推荐商友页跳转到名片申请页, URL:', url);

		// 4. 执行跳转
		uni.navigateTo({
			url: url
		});
	};

	/**
	 * 时间格式化函数
	 */
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		return `${Y}-${M}-${D}`; // 只显示年月日
	};
</script>

<style lang="scss" scoped>
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f7f8fa;
	}

	.tabs-container {
		background-color: #fff;
		padding: 20rpx 30rpx;
		/* 增加上下内边距，让分段器看起来更舒展 */
		border-bottom: 1rpx solid #eee;
		flex-shrink: 0;
	}

	// 深度选择器修改组件内部样式
	// :deep(.segmented-control__text) {
	// 	font-size: 30rpx !important;
	// }

	.content-area {
		flex: 1;
		overflow-y: auto;
	}

	.tab-panel {
		height: 100%;
	}

	/* --- "我邀请的人" 列表样式 (基本复用) --- */
	.friend-list {
		padding: 20rpx;
	}

	.friend-card {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.friend-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 30rpx;
		flex-shrink: 0;
	}

	.friend-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.info-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.friend-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.relation-tags {
		display: flex;
		gap: 10rpx;
		flex-shrink: 0;
		/* 防止标签被挤压 */
	}

	.tag {
		font-size: 20rpx;
		/* 可以适当调整大小 */
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-weight: 500;
	}

	.fellow-townsman {
		background-color: #e8f5e9;
		color: #388e3c;
		border: 1rpx solid #a5d6a7;
	}

	.peer {
		background-color: #e3f2fd;
		color: #1976d2;
		border: 1rpx solid #90caf9;
	}

	.classmate {
		background-color: #fff3e0;
		color: #ef6c00;
		border: 1rpx solid #ffcc80;
	}

	.friend-company {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.friend-company uni-icons {
		margin-right: 10rpx;
	}

	.action-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* 居中对齐 */
		gap: 8rpx;
		/* 按钮和时间之间的间距 */
		margin-left: 20rpx;
		flex-shrink: 0;
	}


	.follow-btn {
		background-color: v-bind(themeColor);
		color: white;
		border: none;
		padding: 0 30rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
		// margin-left: 20rpx;
		flex-shrink: 0;

		&::after {
			border: none;
		}
	}

	.invite-time {
		font-size: 22rpx;
		color: #999;
		white-space: nowrap;
		/* 防止换行 */
	}


	.follow-btn.followed {
		background: #f0f2f5;
		color: #999;
	}

	/* --- "我的邀请人" 模块样式 --- */
	.inviter-section {
		padding: 40rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		color: #333;
	}

	.inviter-card {
		display: flex;
		align-items: center;
		padding: 40rpx;
		background: #fff;
		border-radius: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.06);
	}

	.inviter-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, v-bind(themeColor), #ff8c00);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		color: white;
		font-size: 48rpx;
		font-weight: bold;
		overflow: hidden;
		flex-shrink: 0;
	}

	.inviter-avatar-img {
		width: 100%;
		height: 100%;
	}

	.inviter-info {
		flex: 1;
	}

	.inviter-name {
		font-size: 34rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.inviter-desc {
		font-size: 28rpx;
		color: #666;
	}

	/* --- 通用空状态样式 --- */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		color: #999;
	}

	.empty-image {
		width: 300rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 28rpx;
	}
</style>