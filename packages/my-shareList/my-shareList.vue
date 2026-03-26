<template>
	<view class="page-container">
		<!-- 1. 吸顶头部：搜索 + 统计信息 -->
		<view class="sticky-header">
			<view class="search-wrapper">
				<uni-easyinput prefixIcon="search" v-model="searchKey" placeholder="搜索姓名/公司/学校..."
					@confirm="handleSearch" @clear="handleSearch"></uni-easyinput>
			</view>

			<!-- 【新增】统计信息栏 -->
			<view class="stats-bar">
				<view class="stats-left">
					<view class="title-indicator"></view>
					<text class="main-title">我邀请的商友</text>
				</view>
				<view class="stats-right">
					<text class="total-count">{{ totalCount }}</text>
					<text class="unit">位</text>
				</view>
			</view>
		</view>

		<!-- 2. 商友列表 -->
		<view class="friend-list">
			<view class="friend-card" v-for="friend in friendList" :key="friend.id"
				@click="navigateToBusinessCard(friend)">
				<image class="friend-avatar" :src="friend.avatar || '/static/images/default-avatar.png'"
					mode="aspectFill" @click.stop="handleAvatarClick(friend)">
				</image>

				<view class="friend-info">
					<view class="info-header">
						<text class="friend-name">{{ friend.nickname || friend.realName || '匿名商友' }}</text>
						<!-- 关系标签 -->
						<view class="relation-tags"
							v-if="friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1">
							<text v-if="friend.friendParentFlag === 1" class="tag fellow-circle">同圈</text>
							<text v-if="friend.fellowTownspeopleCityFlag === 1" class="tag fellow-townsman">同乡</text>
							<text v-if="friend.peerFlag === 1" class="tag peer">同行</text>
							<text v-if="friend.classmateFlag === 1" class="tag classmate">同学</text>
						</view>
					</view>

					<view class="friend-company">
						<uni-icons type="briefcase" size="14" color="#888"></uni-icons>
						<text>{{ friend.companyName || '暂未设置公司信息' }}</text>
					</view>

					<!-- 【优化】邀请时间移至下方，样式更轻巧 -->
					<view class="invite-time-row" v-if="friend.followTime">
						<text>邀请于 {{ formatTimestamp(friend.followTime) }}</text>
					</view>
				</view>

				<view class="action-area">
					<!-- 【修复】增加处理中的禁用逻辑 -->
					<button class="follow-btn" :class="{ 'followed': friend.followFlag === 1 }"
						@click.stop="handleFollowAction(friend)">
						{{ friend.followFlag === 1 ? '已关注' : '+ 关注' }}
					</button>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<uni-load-more :status="loadStatus" v-if="friendList.length > 0 || loadStatus === 'loading'"></uni-load-more>

		<!-- 空状态 -->
		<view class="empty-container" v-if="friendList.length === 0 && loadStatus === 'noMore'">
			<image class="empty-image" src="/static/images/empty-invite.png" mode="widthFix"></image>
			<text class="empty-text">您还没有邀请过商友哦，快去分享吧！</text>
		</view>
	</view>

	<AvatarLongPressMenu ref="avatarMenuRef" @action="handleMenuAction" />
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import { checkLoginGuard } from '@/utils/user.js'; 
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';

	// --- 状态变量 ---
	const friendList = ref([]);
	const pageNo = ref(1);
	const totalCount = ref(0);
	const loadStatus = ref('more');
	const searchKey = ref('');
	const isFollowProcessing = ref(false); // 关注请求锁
	let searchDebounceTimer = null;

	const avatarMenuRef = ref(null);

	// --- 数据获取 ---
	const fetchList = async (isRefresh = false) => {
		if (loadStatus.value === 'loading' || (!isRefresh && loadStatus.value === 'noMore')) return;

		if (isRefresh) {
			pageNo.value = 1;
		}
		loadStatus.value = 'loading';

		// 1. 先构建基础必传参数
		const params = {
			pageNo: pageNo.value,
			pageSize: 10
		};

		// 2. 【核心修复】：只有当 searchKey 真正有值时，才加入到 params 对象中
		const trimmedKey = searchKey.value ? searchKey.value.trim() : '';
		if (trimmedKey !== '') {
			params.searchKey = trimmedKey;
		}

		try {
			// 打印一下请求参数，方便你调试
			console.log('--- 发起请求，参数为：', params);

			const {
				data,
				error
			} = await request('/app-api/member/user/share-user-list', {
				method: 'GET',
				data: params
			});

			if (!error && data) {
				const list = data.list || [];
				friendList.value = isRefresh ? list : [...friendList.value, ...list];
				totalCount.value = data.total || 0;

				// 更新加载状态
				if (friendList.value.length >= totalCount.value) {
					loadStatus.value = 'noMore';
				} else {
					loadStatus.value = 'more';
					pageNo.value++;
				}
			} else {
				loadStatus.value = 'noMore';
			}
		} catch (e) {
			console.error('请求异常:', e);
			loadStatus.value = 'more';
		} finally {
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	// --- 关注/取关逻辑 (已修复) ---
	const handleFollowAction = async (user) => {
		if (isFollowProcessing.value) return;

		const isAdding = user.followFlag !== 1;
		isFollowProcessing.value = true;

		// 乐观更新 UI
		const originalStatus = user.followFlag;
		user.followFlag = isAdding ? 1 : 0;

		try {
			const {
				error
			} = await request(isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del', {
				method: 'POST',
				data: {
					targetId: user.id,
					targetType: 'post_user'
				}
			});

			if (error) {
				// 失败回滚
				user.followFlag = originalStatus;
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: isAdding ? '关注成功' : '已取消关注',
					icon: 'none'
				});
			}
		} catch (e) {
			user.followFlag = originalStatus;
		} finally {
			isFollowProcessing.value = false;
		}
	};

	/**
	 * 【核心优化】处理头像点击
	 * 直接调用组件的 open 方法，传入基础数据
	 */
	const handleAvatarClick = async (friend) => {
		// 1. 权限拦截
		if (!await checkLoginGuard()) return;

		// 2. 构造组件需要的参数
		// 注意：组件内部 open 方法会自动根据 id 去请求信用分和等级数据
		const userParams = {
			id: friend.id,
			name: friend.nickname || friend.realName || '商友',
			avatar: friend.avatar || '',
			// 如果是从企业列表点开，可传 true，商友列表通常为个人
			isEnterpriseSource: false
		};

		// 3. 打开弹窗
		avatarMenuRef.value.open(userParams);
	};


	// --- 搜索与辅助函数 ---
	const handleSearch = () => fetchList(true);
	const navigateToBusinessCard = (user) => uni.navigateTo({
		url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname || user.realName)}&avatar=${encodeURIComponent(user.avatar || '')}&fromShare=1`
	});
	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const d = new Date(Number(ts));
		return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
	};

	watch(searchKey, () => {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(() => fetchList(true), 500);
	});

	onMounted(() => fetchList(true));
	onPullDownRefresh(() => fetchList(true));
	onReachBottom(() => fetchList());
</script>

<style lang="scss" scoped>
	$primary-color: #FF6E00;

	.page-container {
		min-height: 100vh;
		background-color: #f7f8fa;
	}

	.sticky-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: #fff;
		padding: 20rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	.search-wrapper {
		margin-bottom: 20rpx;
	}

	/* 【优化】统计栏样式 */
	.stats-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 0;

		.stats-left {
			display: flex;
			align-items: center;

			.title-indicator {
				width: 6rpx;
				height: 30rpx;
				background: $primary-color;
				border-radius: 4rpx;
				margin-right: 16rpx;
			}

			.main-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.stats-right {
			background: rgba($primary-color, 0.08);
			padding: 4rpx 20rpx;
			border-radius: 40rpx;

			.total-count {
				color: $primary-color;
				font-weight: bold;
				font-size: 28rpx;
				margin-right: 4rpx;
			}

			.unit {
				font-size: 22rpx;
				color: #999;
			}
		}
	}

	.friend-list {
		padding: 20rpx;
	}

	.friend-card {
		display: flex;
		align-items: flex-start;
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
	}

	.friend-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		border: 2rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.friend-info {
		flex: 1;
		min-width: 0;

		.info-header {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;
			flex-wrap: wrap;
			gap: 12rpx;
		}

		.friend-name {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.relation-tags {
			display: flex;
			gap: 8rpx;
		}

		.tag {
			font-size: 18rpx;
			padding: 2rpx 10rpx;
			border-radius: 6rpx;

			&.fellow-circle {
				background: #f3e5f5;
				color: #9c27b0;
			}

			&.fellow-townsman {
				background: #e8f5e9;
				color: #388e3c;
			}

			&.peer {
				background: #e3f2fd;
				color: #1976d2;
			}

			&.classmate {
				background: #fff3e0;
				color: #ef6c00;
			}
		}
	}

	.friend-company {
		font-size: 24rpx;
		color: #666;
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 6rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.invite-time-row {
		margin-top: 16rpx;
		font-size: 20rpx;
		color: #bbb;
	}

	.action-area {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100rpx;
	}

	.follow-btn {
		font-size: 24rpx;
		background: linear-gradient(135deg, #FF9533, $primary-color);
		color: #fff;
		border-radius: 40rpx;
		padding: 0 30rpx;
		height: 56rpx;
		line-height: 56rpx;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.2);

		&::after {
			border: none;
		}

		&.followed {
			background: #f0f0f0;
			color: #aaa;
			box-shadow: none;
		}
	}

	.empty-container {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #ccc;

		.empty-image {
			width: 240rpx;
			margin-bottom: 20rpx;
			opacity: 0.6;
		}
	}
</style>