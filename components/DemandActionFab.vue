<template>
	<view class="custom-fab-container" v-if="show">
		<!-- 展开后的菜单项 -->
		<view class="fab-menu" :class="{ 'menu-active': isExpand }">
			<view class="menu-item" @click="handleAction('SHARE')">
				<view class="item-icon bg-orange"><uni-icons type="redo-filled" size="20" color="#fff" /></view>
				<text class="item-text">智能分享</text>
			</view>
			<view class="menu-item" @click="handleAction(0)">
				<view class="item-icon bg-blue"><uni-icons type="personadd-filled" size="20" color="#fff" /></view>
				<text class="item-text">收下数字名片</text>
			</view>
			<view class="menu-item" @click="handleAction(1)">
				<view class="item-icon bg-green"><uni-icons type="compose" size="20" color="#fff" /></view>
				<text class="item-text">也做数字名片</text>
			</view>
			<view class="menu-item" @click="handleAction(2)">
				<view class="item-icon bg-purple"><uni-icons type="paperplane-filled" size="20" color="#fff" /></view>
				<text class="item-text">逛一逛猩聚社</text>
			</view>
		</view>

		<!-- 主按钮 -->
		<view class="fab-main-btn" :class="{ 'btn-active': isExpand }" @click="isExpand = !isExpand">
			<text v-if="!isExpand" class="main-text">更多</text>
			<uni-icons v-else type="closeempty" size="24" color="#fff" />
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	defineProps({
		show: {
			type: Boolean,
			default: true
		}
	});

	const emit = defineEmits(['shareClick']);

	const isExpand = ref(false);

	const handleAction = (type, index) => {
		isExpand.value = false;

		if (type === 'SHARE') {
			// 通知父组件打开分享逻辑
			emit('shareClick');
		} else {
			const paths = [
				'/packages/my-shareList/my-shareList',
				'/packages/my-edit/my-edit',
				'/pages/home/home'
			];
			const target = paths[index];
			if (target.includes('home')) {
				uni.switchTab({
					url: target
				});
			} else {
				uni.navigateTo({
					url: target
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.custom-fab-container {
		position: fixed;
		right: 40rpx;
		/* 关键：调高位置，避开底部 140rpx 的操作栏 */
		bottom: calc(240rpx + env(safe-area-inset-bottom));
		z-index: 1001;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	/* 主按钮样式 */
	.fab-main-btn {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #FF8C00, #FF6A00);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(255, 106, 0, 0.4);
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

		.main-text {
			color: #fff;
			font-size: 26rpx;
			font-weight: bold;
		}

		&:active {
			transform: scale(0.9);
		}
	}

	.btn-active {
		transform: rotate(90deg);
		background: #333;
		/* 展开后变色，增加对比度 */
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
	}

	/* 菜单项容器 */
	.fab-menu {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 20rpx;
		opacity: 0;
		transform: translateY(20rpx) scale(0.8);
		pointer-events: none;
		transition: all 0.3s ease;
	}

	.menu-active {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
	}

	/* 单个菜单项样式 */
	.menu-item {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.95);
		padding: 10rpx 24rpx 10rpx 10rpx;
		border-radius: 60rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid #eee;

		&:active {
			background: #f0f0f0;
		}

		.item-icon {
			width: 70rpx;
			height: 70rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 16rpx;
		}

		.item-text {
			font-size: 24rpx;
			color: #333;
			font-weight: 500;
			white-space: nowrap;
		}
	}

	/* 图标背景色 */
	.bg-orange{
		background: linear-gradient(135deg, #ffaa00 0%, #fee526 100%);
	}
	.bg-blue {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}

	.bg-green {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
	}

	.bg-purple {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
</style>