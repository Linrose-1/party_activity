<template>
	<view class="interaction-container">
		<!-- 1. 顶部 Tab 切换区 -->
		<view class="tab-header">
			<view class="tab-item" :class="{ active: activeTab === 0 }" @click="handleTabChange(0)">
				对我感兴趣
				<view class="tab-line"></view>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 1 }" @click="handleTabChange(1)">
				我感兴趣的
				<view class="tab-line"></view>
			</view>
		</view>

		<!-- 2. 列表内容区 -->
		<view class="list-wrapper">
			<view v-for="(item, index) in listData" :key="item.id" class="interaction-card">
				<!-- 卡片头部：用户信息 + 动作按钮 -->
				<view class="card-top">
					<!-- 头像区：点击触发功能菜单 -->
					<!-- 注意：如果是“我感兴趣的”视角，展示的是商机发布者的头像 -->
					<view class="avatar-box" @click.stop="handleAvatarClick(item.memberUser)">
						<image :src="item.memberUser?.avatar || defaultAvatar" mode="aspectFill" class="user-avatar" />
						<image v-if="item.memberUser?.enterpriseIdCert === 1" src="/static/icon/企业认证.png"
							class="v-badge" />
					</view>

					<!-- 用户基本信息 -->
					<view class="user-meta">
						<view class="name-row">
							<text class="user-name">{{ item.memberUser?.nickname || '商友' }}</text>
							<text v-if="item.memberUser?.idCert === 1" class="cert-tag">已实名</text>
						</view>
						<text class="interaction-time">{{ formatTime(item.createTime) }}</text>
					</view>

					<!-- 动作区：互动留言入口 -->
					<view class="card-right-action">
						<view class="message-btn-box" @click.stop="goToMessage(item)">
							<view class="btn-content">
								<uni-icons type="chat-filled" size="20" color="#FF7901"></uni-icons>
								<text class="btn-txt">互动留言</text>
							</view>
							<!-- 未读数红点 -->
							<view v-if="item.unreadCommentCount > 0" class="unread-badge">
								{{ item.unreadCommentCount > 99 ? '99+' : item.unreadCommentCount }}
							</view>
						</view>
					</view>
				</view>

				<!-- 底部关联内容摘要：显示针对哪个猎伙 -->
				<view class="post-context" @click="goToPostDetail(item.targetId)">
					<view class="context-label">{{ activeTab === 0 ? '针对您的猎伙：' : '感兴趣的猎伙：' }}</view>
					<view class="post-title">{{ item.businessOpportunity?.postTitle || '内容加载中...' }}</view>
					<uni-icons type="right" size="12" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 加载状态显示 -->
			<uni-load-more :status="loadingStatus"></uni-load-more>

			<!-- 无数据时的空状态 -->
			<view v-if="listData.length === 0 && loadingStatus === 'noMore'" class="empty-box">
				<uni-icons type="chat-filled" size="60" color="#eee"></uni-icons>
				<text>{{ activeTab === 0 ? '暂无商友表达兴趣，快去发布猎伙吧' : '您还没有对任何猎伙表达过兴趣' }}</text>
			</view>
		</view>

		<!-- 3. 全局功能组件 -->
		<!-- 头像点击菜单 -->
		<AvatarLongPressMenu ref="avatarMenuRef" @action="handleMenuAction" />
		<!-- 申请入圈弹窗 -->
		<AddCircleConfirmPopup ref="addCirclePopup" />
		<!-- 邀入我圈弹窗 -->
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
		onReachBottom,
		onShow
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
	const activeTab = ref(0); // 0: 对我猎伙感兴趣 (发布者视角), 1: 我感兴趣的 (意向人视角)
	const listData = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadingStatus = ref('more');
	const defaultAvatar = '/static/icon/default-avatar.png';

	// 弹窗组件引用
	const avatarMenuRef = ref(null);
	const addCirclePopup = ref(null);
	const invitePopupRef = ref(null);

	// --- 生命周期 ---
	onShow(() => {
		// 每次进入页面刷新一次数据，确保未读数红点最新
		fetchListData(true);
	});

	// 下拉刷新
	onPullDownRefresh(() => {
		fetchListData(true);
	});

	// 上拉加载更多
	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			fetchListData();
		}
	});

	/**
	 * [方法] 处理 Tab 切换
	 */
	const handleTabChange = (index) => {
		if (activeTab.value === index) return;
		activeTab.value = index;
		fetchListData(true);
	};

	/**
	 * [核心方法] 获取列表数据
	 * @param {Boolean} isRefresh 是否为刷新操作
	 */
	const fetchListData = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'loading';
		}

		// 根据 Tab 选择不同的 API 路径
		const apiPath = activeTab.value === 0 ?
			'/app-api/member/target-interest/my-business-opportunities-interests' :
			'/app-api/member/target-interest/my-interested-business-opportunities';

		try {
			const {
				data,
				error
			} = await request(apiPath, {
				method: 'GET',
				data: {
					pageNo: pageNo.value,
					pageSize: pageSize.value
				}
			});

			if (!error && data) {
				const list = data.list || [];
				listData.value = isRefresh ? list : [...listData.value, ...list];
				total.value = data.total || 0;

				// 更新分页状态
				if (listData.value.length >= total.value) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;
				}
			}
		} catch (e) {
			console.error('获取列表失败', e);
		} finally {
			uni.stopPullDownRefresh();
		}
	};

	/**
	 * [核心方法] 跳转到互动留言页面
	 * @param {Object} item 列表项数据
	 */
	const goToMessage = (item) => {
		const postId = item.targetId;
		// 逻辑：
		// 1. 如果是“对我感兴趣”(发布者视角)，必须传意向人的 userId 以确定对话唯一性
		// 2. 如果是“我感兴趣的”(意向人视角)，userId 传 null，留言页会根据 token 自动匹配发布者
		const userId = activeTab.value === 0 ? item.memberUser?.id : null;

		if (!postId) return uni.showToast({
			title: '参数缺失',
			icon: 'none'
		});

		uni.navigateTo({
			url: `/packages/interaction-message/interaction-message?targetId=${postId}${userId ? '&userId=' + userId : ''}`
		});
	};

	/**
	 * [辅助方法] 跳转商机详情
	 */
	const goToPostDetail = (postId) => {
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
		});
	};

	/**
	 * [交互方法] 点击头像，打开功能菜单
	 */
	const handleAvatarClick = async (user) => {
		if (!user) return;
		if (!await checkLoginGuard()) return;

		const menuUser = {
			id: user.id,
			name: user.nickname || '商友',
			avatar: user.avatar || defaultAvatar,
			isIdVerified: user.idCert === 1
		};
		avatarMenuRef.value.open(menuUser);
	};

	/**
	 * [交互方法] 处理菜单点击后的具体动作
	 */
	const handleMenuAction = ({
		type,
		user
	}) => {
		switch (type) {
			case 'viewCard':
				// 免智米查看名片逻辑
				uni.navigateTo({
					url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}&fromShare=1`
				});
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
	 * [工具方法] 格式化显示时间
	 */
	const formatTime = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp.replace ? timestamp.replace('T', ' ').replace(/-/g, '/') : timestamp);
		const M = date.getMonth() + 1;
		const D = date.getDate();
		const h = String(date.getHours()).padStart(2, '0');
		const m = String(date.getMinutes()).padStart(2, '0');
		return `${M}月${D}日 ${h}:${m}`;
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF7901;

	.interaction-container {
		min-height: 100vh;
		background-color: #f8f9fa;
		display: flex;
		flex-direction: column;
	}

	/* 顶部 Tab 样式 */
	.tab-header {
		display: flex;
		background-color: #fff;
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 0 40rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 30rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;
			transition: all 0.3s;

			&.active {
				color: $theme-color;
				font-weight: bold;
				font-size: 30rpx;

				.tab-line {
					opacity: 1;
					transform: translateX(-50%) scaleX(1);
				}
			}

			.tab-line {
				position: absolute;
				bottom: 0;
				left: 50%;
				width: 40rpx;
				height: 6rpx;
				background-color: $theme-color;
				border-radius: 4rpx;
				opacity: 0;
				transform: translateX(-50%) scaleX(0);
				transition: all 0.3s;
			}
		}
	}

	/* 列表区域 */
	.list-wrapper {
		padding: 30rpx;
	}

	.interaction-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.card-top {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
		justify-content: space-between;
	}

	.avatar-box {
		position: relative;
		width: 100rpx;
		height: 100rpx;
		flex-shrink: 0;

		.user-avatar {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			border: 2rpx solid #f0f0f0;
			background-color: #f8f8f8;
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
		margin-left: 20rpx;
		min-width: 0;

		.name-row {
			display: flex;
			align-items: center;
			gap: 10rpx;

			.user-name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.cert-tag {
				font-size: 18rpx;
				color: #52c41a;
				background: rgba(82, 196, 26, 0.1);
				padding: 2rpx 10rpx;
				border-radius: 4rpx;
				flex-shrink: 0;
			}
		}

		.interaction-time {
			font-size: 22rpx;
			color: #bbb;
			margin-top: 8rpx;
			display: block;
		}
	}

	/* 按钮与未读数 */
	.card-right-action {
		margin-left: 20rpx;
	}

	.message-btn-box {
		position: relative;
		background-color: rgba($theme-color, 0.08);
		border: 1rpx solid rgba($theme-color, 0.15);
		border-radius: 40rpx;
		padding: 14rpx 28rpx;

		&:active {
			opacity: 0.7;
			transform: scale(0.95);
		}

		.btn-content {
			display: flex;
			align-items: center;
			gap: 8rpx;
		}

		.btn-txt {
			font-size: 24rpx;
			color: $theme-color;
			font-weight: bold;
		}
	}

	.unread-badge {
		position: absolute;
		top: -12rpx;
		right: -6rpx;
		background-color: #ff4d4f;
		color: #fff;
		font-size: 18rpx;
		font-weight: bold;
		min-width: 30rpx;
		height: 30rpx;
		line-height: 30rpx;
		text-align: center;
		border-radius: 15rpx;
		padding: 0 8rpx;
		border: 3rpx solid #fff;
	}

	/* 底部背景块 */
	.post-context {
		background-color: #f9f9f9;
		padding: 20rpx 24rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;

		.context-label {
			font-size: 24rpx;
			color: #999;
			white-space: nowrap;
		}

		.post-title {
			flex: 1;
			font-size: 24rpx;
			color: #666;
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
		padding-top: 200rpx;
		color: #ccc;
		font-size: 26rpx;
		gap: 20rpx;
	}
</style>