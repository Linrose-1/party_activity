<template>
	<view class="interaction-container">
		<!-- 1. 顶部统计区 -->
		<view class="header-stats">
			<view class="stats-content">
				<text class="stats-num">{{ total }}</text>
				<text class="stats-label">位商友对您的猎伙感兴趣</text>
			</view>
		</view>

		<!-- 2. 互动列表 -->
		<view class="list-wrapper">
			<view v-for="(item, index) in interactionList" :key="item.id" class="interaction-card">
				<!-- 用户头部信息 -->
				<view class="card-top">
					<!-- 头像：点击触发功能弹窗 -->
					<view class="avatar-box" @click.stop="handleAvatarClick(item.memberUser)">
						<image :src="item.memberUser.avatar || defaultAvatar" mode="aspectFill" class="user-avatar" />
						<image v-if="item.memberUser.enterpriseIdCert === 1" src="/static/icon/企业认证.png"
							class="v-badge" />
					</view>

					<view class="user-meta">
						<view class="name-row">
							<text class="user-name">{{ item.memberUser.nickname || '商友' }}</text>
							<text v-if="item.memberUser.idCert === 1" class="cert-tag">已实名</text>
						</view>
						<text class="interaction-time">{{ formatTime(item.createTime) }} 表达了兴趣</text>
					</view>

					<!-- 右侧动作：由于是免智米查看，直接放个按钮引导 -->
					<!-- <view class="action-btn" @click.stop="viewUserCard(item.memberUser)">
						回访名片
					</view> -->
				</view>

				<!-- 关联的商机内容摘要 -->
				<view class="post-context" @click="goToPostDetail(item.targetId)">
					<view class="context-label">针对您的猎伙：</view>
					<view class="post-title">{{ item.businessOpportunity?.postTitle || '内容已删除' }}</view>
					<uni-icons type="right" size="14" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more :status="loadingStatus"></uni-load-more>

			<!-- 空状态 -->
			<view v-if="interactionList.length === 0 && loadingStatus === 'noMore'" class="empty-box">
				<uni-icons type="info" size="60" color="#eee"></uni-icons>
				<text>暂无商友表达兴趣，快去发布更多猎伙吧</text>
			</view>
		</view>

		<!-- 3. 功能弹窗组件群 -->
		<AvatarLongPressMenu ref="avatarMenuRef" @action="handleMenuAction" />
		<AddCircleConfirmPopup ref="addCirclePopup" />
		<InviteCircleConfirmPopup ref="invitePopupRef" />
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
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	// 组件引用
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';
	import AddCircleConfirmPopup from '@/components/AddCircleConfirmPopup.vue';
	import InviteCircleConfirmPopup from '@/components/InviteCircleConfirmPopup.vue';

	// --- 状态定义 ---
	const interactionList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadingStatus = ref('more');
	const defaultAvatar = '/static/images/default-avatar.png';

	// 弹窗 Refs
	const avatarMenuRef = ref(null);
	const addCirclePopup = ref(null);
	const invitePopupRef = ref(null);

	// --- 生命周期 ---
	onMounted(() => {
		fetchInteractions(true);
	});

	onPullDownRefresh(() => {
		fetchInteractions(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			fetchInteractions();
		}
	});

	// --- 数据获取 ---
	const fetchInteractions = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'loading';
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/target-interest/my-business-opportunities-interests', {
				method: 'GET',
				data: {
					pageNo: pageNo.value,
					pageSize: pageSize.value
				}
			});

			if (!error && data) {
				const list = data.list || [];
				interactionList.value = isRefresh ? list : [...interactionList.value, ...list];
				total.value = data.total || 0;

				if (interactionList.value.length >= total.value) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;
				}
			}
		} catch (e) {
			console.error('获取互动列表失败', e);
		} finally {
			uni.stopPullDownRefresh();
		}
	};

	// --- 头像功能区逻辑 ---

	/**
	 * 点击头像，打开功能菜单
	 */
	const handleAvatarClick = async (user) => {
		if (!await checkLoginGuard()) return;

		// 适配组件需要的结构
		const menuUser = {
			id: user.id,
			name: user.nickname || user.realName || '商友',
			avatar: user.avatar || defaultAvatar,
			// isEnterpriseSource: user.enterpriseIdCert === 1,
			isIdVerified: user.idCert === 1
		};

		avatarMenuRef.value.open(menuUser);
	};

	/**
	 * 处理菜单点击回调
	 */
	const handleMenuAction = ({
		type,
		user
	}) => {
		switch (type) {
			case 'viewCard':
				viewUserCard(user);
				break;
			case 'viewPath':
				uni.navigateTo({
					url: `/packages/relationship-path/relationship-path?targetUserId=${user.id}&name=${encodeURIComponent(user.name)}`
				});
				break;
			case 'addCircle':
				addCirclePopup.value.open(user);
				break;
			case 'inviteCircle':
				invitePopupRef.value.open(user);
				break;
			case 'comment':
				uni.navigateTo({
					url: `/packages/user-reviews/user-reviews?userId=${user.id}`
				});
				break;
		}
	};

	/**
	 * 关键优化：免智米查看名片
	 * 通过传递 fromShare=1，使 applicationBusinessCard 页面调用 read-card 时传 notPay: 1
	 */
	const viewUserCard = (user) => {
		const id = user.userId || user.id;
		const name = user.nickname || user.name || '商友';
		const avatar = user.avatar || defaultAvatar;

		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&fromShare=1`
		});
	};

	// --- 辅助功能 ---
	const goToPostDetail = (postId) => {
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
		});
	};

	const formatTime = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF7901;

	.interaction-container {
		min-height: 100vh;
		background-color: #f8f9fa;
	}

	/* 顶部统计 */
	.header-stats {
		background: linear-gradient(135deg, $theme-color, #FF9533);
		padding: 60rpx 40rpx;
		color: white;
		border-radius: 0 0 40rpx 40rpx;

		.stats-content {
			display: flex;
			flex-direction: column;

			.stats-num {
				font-size: 64rpx;
				font-weight: bold;
			}

			.stats-label {
				font-size: 28rpx;
				opacity: 0.9;
				margin-top: 10rpx;
			}
		}
	}

	/* 列表区域 */
	.list-wrapper {
		padding: 30rpx;
		margin-top: -30rpx;
	}

	.interaction-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.card-top {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.avatar-box {
		position: relative;
		width: 100rpx;
		height: 100rpx;
		margin-right: 20rpx;

		.user-avatar {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			border: 2rpx solid #eee;
		}

		.v-badge {
			position: absolute;
			bottom: 0;
			right: 0;
			width: 32rpx;
			height: 32rpx;
		}
	}

	.user-meta {
		flex: 1;

		.name-row {
			display: flex;
			align-items: center;
			gap: 10rpx;

			.user-name {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.cert-tag {
				font-size: 20rpx;
				color: #52c41a;
				background: #f6ffed;
				padding: 2rpx 8rpx;
				border-radius: 4rpx;
			}
		}

		.interaction-time {
			font-size: 24rpx;
			color: #999;
			margin-top: 6rpx;
			display: block;
		}
	}

	.action-btn {
		background-color: rgba($theme-color, 0.1);
		color: $theme-color;
		font-size: 24rpx;
		font-weight: 500;
		padding: 12rpx 24rpx;
		border-radius: 30rpx;

		&:active {
			opacity: 0.7;
		}
	}

	/* 关联商机背景块 */
	.post-context {
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;

		.context-label {
			font-size: 24rpx;
			color: #888;
			white-space: nowrap;
		}

		.post-title {
			flex: 1;
			font-size: 24rpx;
			color: #555;
			font-weight: 500;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 100rpx;
		color: #ccc;
		font-size: 26rpx;
		gap: 20rpx;
	}
</style>