<template>
	<uni-popup ref="popup" type="center" :mask-click="true">
		<view class="menu-card">
			<!-- 1. 头部信息区 -->
			<view class="card-header">
				<view class="avatar-wrapper">
					<image :src="targetUser.avatar || '/static/icon/default-avatar.png'" class="menu-avatar"
						mode="aspectFill"></image>
				</view>
				<view class="user-info">
					<text class="user-name">{{ targetUser.name || '商友' }}</text>
					<text class="user-desc">与您相遇在猩聚社</text>
				</view>
				<view class="close-icon" @click="close">
					<uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
				</view>
			</view>

			<!-- 2. 操作按钮区 (2x2 布局) -->
			<view class="action-grid">

				<!-- 1. 查看名片 -->
				<view class="grid-item" @click="handleAction('viewCard')">
					<view class="icon-box secondary">
						<uni-icons type="person" size="28" color="#FF7009"></uni-icons>
					</view>
					<text class="item-text">查看名片</text>
				</view>

				<!-- 2. 商友点评 -->
				<view class="grid-item" @click="handleAction('comment')">
					<view class="icon-box normal">
						<uni-icons type="star" size="24" color="#666"></uni-icons>
					</view>
					<text class="item-text">商友点评</text>
				</view>

				<!-- 3. 邀请入圈 (新增) -->
				<!-- 逻辑：如果是自己，禁用 -->
				<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
					@click="handleAction('inviteCircle')">
					<view class="icon-box invite-style">
						<uni-icons type="paperplane-filled" size="26" color="#FF7009"></uni-icons>
					</view>
					<text class="item-text">{{ isSelf ? '本人' : '邀请入圈' }}</text>
				</view>

				<!-- 4. 申请入圈 -->
				<view class="grid-item" :class="isSelf ? 'disabled' : 'primary'" @click="handleAction('addCircle')">
					<view class="icon-box">
						<uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
					</view>
					<text class="item-text">{{ isSelf ? '本人' : '申请入圈' }}</text>
				</view>

				<!-- <view class="grid-item" @click="handleAction('removeCircle')">
									<view class="icon-box danger">
										<uni-icons type="minus" size="24" color="#ff4d4f"></uni-icons>
									</view>
									<text class="item-text">一键脱圈</text>
								</view> -->

				<!-- <view class="grid-item" @click="handleAction('disconnect')">
									<view class="icon-box danger">
										<uni-icons type="closeempty" size="24" color="#ff4d4f"></uni-icons>
									</view>
									<text class="item-text">一键脱连</text>
								</view> -->

			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';

	const popup = ref(null);
	const targetUser = ref({});
	const emit = defineEmits(['action']);
	const currentUserId = ref(null);

	const isSelf = computed(() => {
		return currentUserId.value && targetUser.value.id && String(currentUserId.value) === String(targetUser
			.value.id);
	});

	const open = (user) => {
		targetUser.value = user || {};
		currentUserId.value = uni.getStorageSync('userId');
		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	const handleAction = (type) => {
		// 拦截自己操作
		if ((type === 'addCircle' || type === 'inviteCircle') && isSelf.value) {
			return;
		}
		close();
		emit('action', {
			type,
			user: targetUser.value
		});
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.menu-card {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		position: relative;
	}

	.card-header {
		background: linear-gradient(135deg, #FF7009, #FF9A44);
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		position: relative;
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
	}

	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 8rpx;
	}

	.user-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
	}

	.close-icon {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 10rpx;
		opacity: 0.8;
	}

	/* --- 2x2 网格布局修改 --- */
	.action-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		/* 改为2列 */
		gap: 40rpx;
		/* 增加间距 */
		padding: 50rpx 40rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		&:active {
			opacity: 0.8;
			transform: scale(0.98);
		}
	}

	.icon-box {
		width: 110rpx;
		/* 稍微加大图标区域 */
		height: 110rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	/* 申请入圈 (实心橙色) */
	.grid-item.primary .icon-box {
		background: linear-gradient(135deg, #FF7009, #FF8C00);
		box-shadow: 0 6rpx 16rpx rgba(255, 112, 9, 0.3);
	}

	/* 邀请入圈 (空心/浅橙色描边风格) */
	.grid-item.primary-outline .icon-box.invite-style {
		background-color: #fff;
		border: 2rpx solid #FF7009;
		color: #FF7009;
	}

	/* 查看名片 */
	.icon-box.secondary {
		background-color: #FFF3E0;
	}

	/* 点评 */
	.icon-box.normal {
		background-color: #f5f5f5;
	}

	.grid-item.disabled {
		pointer-events: none;

		.icon-box {
			background-color: #dcdcdc;
			box-shadow: none;
			border: none;
		}

		.item-text {
			color: #999;
		}
	}

	.item-text {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}
</style>