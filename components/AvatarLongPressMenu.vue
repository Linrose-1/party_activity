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

			<!-- 2. 操作按钮区 -->
			<view class="action-grid">
				<!-- 主要操作 -->
				<view class="grid-item primary" @click="handleAction('addCircle')">
					<view class="icon-box">
						<uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
					</view>
					<text class="item-text">申请入圈</text>
				</view>

				<view class="grid-item" @click="handleAction('viewCard')">
					<view class="icon-box secondary">
						<uni-icons type="person" size="28" color="#FF7009"></uni-icons>
					</view>
					<text class="item-text">查看名片</text>
				</view>

				<!-- 次要操作 -->
				<view class="grid-item" @click="handleAction('comment')">
					<view class="icon-box normal">
						<uni-icons type="star" size="24" color="#666"></uni-icons>
					</view>
					<text class="item-text">商友点评</text>
				</view>

				<view class="grid-item" @click="handleAction('removeCircle')">
					<view class="icon-box danger">
						<uni-icons type="minus" size="24" color="#ff4d4f"></uni-icons>
					</view>
					<text class="item-text">一键脱圈</text>
				</view>

				<view class="grid-item" @click="handleAction('disconnect')">
					<view class="icon-box danger">
						<uni-icons type="closeempty" size="24" color="#ff4d4f"></uni-icons>
					</view>
					<text class="item-text">一键脱连</text>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	const popup = ref(null);
	const targetUser = ref({});
	const emit = defineEmits(['action']);

	const open = (user) => {
		targetUser.value = user || {};
		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	const handleAction = (type) => {
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

	/* 头部样式 */
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

	/* 操作网格样式 */
	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		/* 3列布局 */
		gap: 30rpx;
		padding: 40rpx 30rpx 50rpx;
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
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	/* 按钮风格 */
	.grid-item.primary .icon-box {
		background: linear-gradient(135deg, #FF7009, #FF8C00);
		box-shadow: 0 6rpx 16rpx rgba(255, 112, 9, 0.3);
	}

	.icon-box.secondary {
		background-color: #FFF3E0;
		/* 浅橙色 */
	}

	.icon-box.normal {
		background-color: #f5f5f5;
	}

	.icon-box.danger {
		background-color: #FFF0F0;
	}

	.item-text {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
	}
</style>