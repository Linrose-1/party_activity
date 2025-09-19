<template>
	<view class="page-container">
		<!-- 商友列表 -->
		<view class="friend-list">
			<view class="friend-card" v-for="friend in friendList" :key="friend.id"
				@click="navigateToBusinessCard(friend)">
				<image class="friend-avatar" :src="friend.avatar || '/static/images/default-avatar.png'"
					mode="aspectFill" @error="handleImageError(friend)"></image>
				<view class="friend-info">
					<view class="info-header">
						<text class="friend-name">{{ friend.nickname || friend.realName || '匿名用户' }}</text>
						<view class="friend-company">
							<uni-icons type="briefcase-filled" size="14" color="#888"></uni-icons>
							<text>{{ friend.companyName || '暂无公司信息' }}</text>
						</view>
					</view>
					<view class="friend-title">
						<uni-icons type="person-filled" size="14" color="#888"></uni-icons>
						<text>{{ friend.professionalTitle || '暂无职位' }}</text>
					</view>
				</view>
				<!-- 【新增】关注/取消关注按钮 -->
				<button class="follow-btn" :class="{ 'followed': friend.followFlag === 1 }"
					@click.stop="handleFollowAction(friend)">
					{{ friend.followFlag === 1 ? '取关' : '关注' }}
				</button>
			</view>
		</view>

		<!-- 加载更多组件 -->
		<uni-load-more :status="loadStatus" v-if="friendList.length > 0 || loadStatus === 'loading'"></uni-load-more>

		<!-- 空状态 -->
		<view class="empty-container" v-if="friendList.length === 0 && loadStatus === 'noMore'">
			<image class="empty-image" src="/static/images/empty-box.png" mode="widthFix"></image>
			<text class="empty-text">您还没有推荐过商友哦</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js'; // 确保路径正确

	// --- 响应式状态 ---
	const friendList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more'); // 'more', 'loading', 'noMore'
	// 【新增】防止重复点击关注按钮的状态
	const isFollowActionInProgress = ref(false);

	// --- API 调用 ---
	const getShareUserList = async (isRefresh = false) => {
		// 防止重复加载
		if (loadStatus.value === 'loading') return;
		// 如果不是刷新且已无更多数据，则不执行
		if (!isRefresh && loadStatus.value === 'noMore') return;

		// 如果是刷新操作，重置状态
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
			method: 'GET',
			data: {
				pageNo: pageNo.value,
				pageSize: pageSize.value
			}
		});

		// 停止下拉刷新动画
		if (isRefresh) {
			uni.stopPullDownRefresh();
		}

		if (error) {
			loadStatus.value = 'more'; // 加载失败，允许重试
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		if (data && data.list) {
			const list = data.list || [];
			friendList.value = isRefresh ? list : [...friendList.value, ...list];
			total.value = data.total;

			// 判断是否还有更多数据
			if (friendList.value.length >= total.value) {
				loadStatus.value = 'noMore';
			} else {
				loadStatus.value = 'more';
				pageNo.value++; // 准备加载下一页
			}
		} else {
			loadStatus.value = 'noMore';
		}
	};

	// --- 图片加载失败处理 ---
	const handleImageError = (item) => {
		// 你可以给 item 一个默认图片，以防止无限循环的错误
		// 这里假设静态文件夹里有一个 default-avatar.png
		item.avatar = '/static/images/default-avatar.png';
	};

	// --- 【新增】关注/取关功能 (逻辑与摇一摇页面完全一致) ---
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

	// --- 生命周期钩子 ---
	onLoad(() => {
		uni.showLoading({
			title: '正在加载...'
		});
		getShareUserList(true).finally(() => {
			uni.hideLoading();
		});
	});

	onPullDownRefresh(() => {
		getShareUserList(true);
	});

	onReachBottom(() => {
		getShareUserList();
	});
</script>

<style scoped>
	.page-container {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

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
		transition: transform 0.2s ease-in-out;
	}

	.friend-card:active {
		transform: scale(0.98);
	}

	.friend-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 30rpx;
		flex-shrink: 0;
		background-color: #eee;
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
		flex-direction: column;
		gap: 10rpx;
	}

	.friend-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.friend-company,
	.friend-title {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
	}

	.friend-company uni-icons,
	.friend-title uni-icons {
		margin-right: 10rpx;
	}

	.friend-company text,
	.friend-title text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 【新增】关注按钮样式 */
	.follow-btn {
		background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
		color: white;
		border: none;
		padding: 0 30rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 40rpx;
		font-weight: 500;
		font-size: 26rpx;
		margin-left: 20rpx;
		/* 与左侧信息区拉开距离 */
		white-space: nowrap;
		flex-shrink: 0;
		/* 防止按钮被压缩 */
	}

	.follow-btn::after {
		border: none;
	}

	/* 【新增】已关注状态的样式 */
	.follow-btn.followed {
		background: #f0f2f5;
		color: #999;
	}

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