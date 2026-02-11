<template>
	<view>
		<uni-popup ref="popup" type="center" :mask-click="true">
			<view class="menu-card">
				<!-- 1. 头部信息区 -->
				<view class="card-header">
					<view class="avatar-wrapper">
						<image :src="targetUser.avatar || defaultAvatar" class="menu-avatar" mode="aspectFill"></image>
					</view>
					<view class="user-info">
						<text class="user-name">{{ targetUser.name || '商友' }}</text>
						<text class="user-desc">与您相遇在猩聚社</text>
					</view>
					<view class="close-icon" @click="close">
						<uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
					</view>
				</view>

				<!-- 2. 操作按钮区 (3x2 布局) -->
				<view class="action-grid">
					<!-- 查看名片 -->
					<view class="grid-item primary-outline" @click="handleAction('viewCard')">
						<view class="icon-box"><uni-icons type="person" size="26" color="#FF7009" /></view>
						<text class="item-text">查看名片</text>
					</view>

					<!-- 人脉链路 -->
					<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
						@click="handleAction('viewPath')">
						<view class="icon-box" :class="{ 'path-style': !isSelf }">
							<uni-icons type="staff-filled" size="26" :color="isSelf ? '#999' : '#FF7009'" />
						</view>
						<text class="item-text">{{ isSelf ? '本人' : '人脉链路' }}</text>
					</view>

					<!-- 商友点评 -->
					<view class="grid-item primary-outline" @click="handleAction('comment')">
						<view class="icon-box"><uni-icons type="star" size="26" color="#FF7009" /></view>
						<text class="item-text">商友点评</text>
					</view>

					<!-- 邀入我圈 -->
					<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
						@click="handleAction('inviteCircle')">
						<view class="icon-box"><uni-icons type="paperplane-filled" size="26"
								:color="isSelf ? '#999' : '#FF7009'" /></view>
						<text class="item-text">{{ isSelf ? '本人' : '邀入我圈' }}</text>
					</view>

					<!-- 加入TA圈 -->
					<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
						@click="handleAction('addCircle')">
						<view class="icon-box"><uni-icons type="plusempty" size="26"
								:color="isSelf ? '#999' : '#FF7009'" /></view>
						<text class="item-text">{{ isSelf ? '本人' : '加入TA圈' }}</text>
					</view>

					<!-- 资源匹配 -->
					<view class="grid-item primary-outline"
						@click="handleAction('resourceMatch')">
						<view class="icon-box"><uni-icons type="search" size="26"
								color="#FF7009" /></view>
						<text class="item-text">资源匹配</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 3. 内置：加圈与邀圈的确认弹窗 (实现内部闭环) -->
		<AddCircleConfirmPopup ref="addCircleRef" @success="onSocialSuccess" />
		<InviteCircleConfirmPopup ref="inviteCircleRef" @success="onSocialSuccess" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import AddCircleConfirmPopup from '@/components/AddCircleConfirmPopup.vue';
	import InviteCircleConfirmPopup from '@/components/InviteCircleConfirmPopup.vue';

	// --- Props 定义 ---
	const props = defineProps({
		// 支持外部传入路径覆盖默认配置
		config: {
			type: Object,
			default: () => ({})
		}
	});

	const emit = defineEmits(['actionSuccess']);

	// --- 状态变量 ---
	const popup = ref(null);
	const addCircleRef = ref(null);
	const inviteCircleRef = ref(null);
	const targetUser = ref({});
	const defaultAvatar = '/static/icon/default-avatar.png';

	/**
	 * 默认业务路径配置
	 */
	const PATHS = {
		personalCard: '/packages/applicationBusinessCard/applicationBusinessCard',
		enterpriseCard: '/packages/enterprise-card/enterprise-card',
		relationshipPath: '/packages/relationship-path/relationship-path',
		reviews: '/packages/user-reviews/user-reviews',
		resourceMatch: '/packages/resource-match/resource-match'
	};

	/**
	 * [计算属性] 判定是否为“我本人”或“我的企业”
	 */
	const isSelf = computed(() => {
		const loggedInId = uni.getStorageSync('userId');
		const managerId = targetUser.value.managerId || targetUser.value.id;
		return loggedInId && managerId && String(loggedInId) === String(managerId);
	});

	/**
	 * [方法] 打开菜单
	 */
	const open = (user) => {
		targetUser.value = user || {};
		popup.value.open();
	};

	/**
	 * [方法] 关闭菜单
	 */
	const close = () => popup.value.close();

	/**
	 * [核心逻辑] 统一处理点击动作
	 */
	const handleAction = (type) => {
		// 1. 权限拦截：本人不可操作社交项
		const socialTypes = ['addCircle', 'inviteCircle', 'viewPath'];
		if (isSelf.value && socialTypes.includes(type)) return;

		const user = targetUser.value;

		// 2. 分流处理
		switch (type) {
			case 'viewCard': // 3. 查看名片 (自动分流：企业 vs 个人)
				if (user.isEnterpriseSource) {
					uni.navigateTo({
						url: `${PATHS.enterpriseCard}?id=${user.id}`
					});
				} else {
					const url =
						`${PATHS.personalCard}?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || '')}`;
					uni.navigateTo({
						url
					});
				}
				break;

			case 'viewPath': // 4. 人脉链路
				uni.navigateTo({
					url: `${PATHS.relationshipPath}?targetUserId=${user.id}&name=${encodeURIComponent(user.name || '商友')}`
				});
				break;

			case 'comment': // 5. 商友点评
				uni.navigateTo({
					url: `${PATHS.reviews}?userId=${user.id}`
				});
				break;

			case 'resourceMatch': // 6. 资源匹配
				uni.navigateTo({
					url: `${PATHS.resourceMatch}?targetUserId=${user.id}`
				});
				break;

			case 'addCircle': // 7. 加入TA圈 (唤起内部组件)
				addCircleRef.value.open(user);
				break;

			case 'inviteCircle': // 8. 邀入我圈 (唤起内部组件)
				inviteCircleRef.value.open(user);
				break;
		}

		close(); // 操作后关闭菜单
	};

	/**
	 * [方法] 内部弹窗操作成功后的回调
	 */
	const onSocialSuccess = (id) => {
		emit('actionSuccess', id);
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	/* 样式保持 3x2 布局及 #FF7009 主题色 */
	.menu-card {
		width: 620rpx;
		background-color: #fff;
		border-radius: 32rpx;
		overflow: hidden;
		position: relative;
	}

	.card-header {
		background: linear-gradient(135deg, #FF7009, #FF9A44);
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
	}

	.avatar-wrapper {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.6);
		overflow: hidden;
		margin-right: 24rpx;
	}

	.menu-avatar {
		width: 100%;
		height: 100%;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;

		.user-name {
			font-size: 34rpx;
			font-weight: bold;
			color: #fff;
			margin-bottom: 4rpx;
		}

		.user-desc {
			font-size: 22rpx;
			color: rgba(255, 255, 255, 0.8);
		}
	}

	.close-icon {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 10rpx;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 40rpx 10rpx;
		padding: 50rpx 20rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		&:active {
			transform: scale(0.95);
			opacity: 0.8;
		}

		.icon-box {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 12rpx;
			border: 2rpx solid #FF7009;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		}

		.icon-box.path-style {
			background-color: #FFF5EE;
		}

		.item-text {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}
	}

	.grid-item.disabled {
		pointer-events: none;

		.icon-box {
			background-color: #f2f2f2;
			border-color: #ddd;
			box-shadow: none;
		}

		.item-text {
			color: #bbb;
		}
	}
</style>