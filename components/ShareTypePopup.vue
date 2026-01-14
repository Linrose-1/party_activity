<!-- components/ShareTypePopup.vue -->
<template>
	<uni-popup ref="popupRef" type="bottom" background-color="#fff" @change="onChange">
		<view class="share-type-container">
			<view class="popup-title">选择分享方式</view>
			<view class="popup-subtitle">转发名片给好友，您希望新用户绑定谁？</view>

			<view class="share-options">
				<!-- 选项1：自发 (绑定我自己) -->
				<!-- open-type="share" 是关键，点击后直接触发父页面的 onShareAppMessage -->
				<button class="option-btn self-share" open-type="share" @click="handleShare('SELF')">
					<view class="icon-wrap">
						<uni-icons type="person-filled" size="32" color="#FF6A00"></uni-icons>
					</view>
					<view class="text-wrap">
						<text class="main-text">自发推荐</text>
						<text class="sub-text">新用户将绑定<text class="highlight">您</text>的邀请码</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</button>

				<!-- 选项2：代发 (绑定名片主) -->
				<button class="option-btn proxy-share" open-type="share" @click="handleShare('PROXY')">
					<view class="icon-wrap">
						<uni-icons type="staff-filled" size="32" color="#1890FF"></uni-icons>
					</view>
					<view class="text-wrap">
						<text class="main-text">帮TA转发</text>
						<text class="sub-text">新用户将绑定<text class="highlight">名片主人</text>的邀请码</text>
					</view>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</button>
			</view>

			<view class="cancel-btn" @click="close">取消</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		defineEmits
	} from 'vue';

	const emit = defineEmits(['selectMode', 'change']);
	const popupRef = ref(null);

	const open = () => {
		popupRef.value.open();
	};

	const close = () => {
		popupRef.value.close();
	};

	const handleShare = (mode) => {
		// 1. 立即通知父组件更新分享模式
		// 注意：这必须是同步的，因为 onShareAppMessage 会紧随其后触发
		emit('selectMode', mode);

		// 2. 关闭弹窗 (稍作延迟，让用户看到点击反馈，也避免动画冲突)
		setTimeout(() => {
			close();
		}, 100);
	};

	const onChange = (e) => {
		// e.show 为 true 表示打开，false 表示关闭
		emit('change', e);
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.share-type-container {
		background-color: #fff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		padding: 40rpx 30rpx;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	}

	.popup-title {
		text-align: center;
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.popup-subtitle {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.share-options {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		margin-bottom: 40rpx;
	}

	.option-btn {
		display: flex;
		align-items: center;
		background-color: #f9f9f9;
		padding: 30rpx;
		border-radius: 20rpx;
		border: 2rpx solid transparent;
		text-align: left;
		line-height: 1.5;
		transition: all 0.2s;

		&::after {
			border: none;
		}

		&:active {
			background-color: #f0f0f0;
		}

		&.self-share {
			background-color: #FFF7E6; // 浅橙色背景
			border-color: #FFE8CC;
		}

		&.proxy-share {
			background-color: #E6F7FF; // 浅蓝色背景
			border-color: #BAE7FF;
		}
	}

	.icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}

	.text-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;

		.main-text {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 6rpx;
		}

		.sub-text {
			font-size: 24rpx;
			color: #666;

			.highlight {
				font-weight: bold;
				margin: 0 4rpx;
			}

			// 自发的强调色
			.self-share & .highlight {
				color: #FF6A00;
			}

			// 代发的强调色
			.proxy-share & .highlight {
				color: #1890FF;
			}
		}
	}

	.cancel-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		background-color: #f5f5f5;
		border-radius: 45rpx;
		font-size: 30rpx;
		color: #666;
		font-weight: 500;
	}
</style>