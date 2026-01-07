<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="points-popup">
			<!-- 装饰背景图/图标 -->
			<view class="popup-header">
				<image src="/static/icon/coin-bag.png" mode="aspectFit" class="header-img" v-if="hasIcon"></image>
				<uni-icons v-else type="gift-filled" size="50" color="#fff"></uni-icons>
			</view>

			<view class="popup-body">
				<view class="congrats-text">🎉 恭喜您！</view>

				<view class="detail-text">
					今日【<text class="highlight">{{ actionName }}</text>】，您已获得
				</view>

				<view class="points-value">
					+{{ points }} <text class="unit">贡分</text>
				</view>

				<view class="sub-tip">
					（贡分可用于获得参与平台分享的权益）
				</view>
			</view>

			<view class="popup-footer">
				<button class="confirm-btn" @click="close">太棒了！</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	// 定义音效 URL (复用之前的)
	const SOUND_URL = 'https://img.gofor.club/20251119/retro-coin-4-236671_1763536579022.mp3';
	const audioCtx = uni.createInnerAudioContext();
	audioCtx.src = SOUND_URL;

	const popup = ref(null);
	const actionName = ref('');
	const points = ref(0);
	const hasIcon = ref(false); // 如果你有切图可以设为 true 并替换 src

	/**
	 * 打开弹窗并播放音效
	 * @param {string} name - 行为名称
	 * @param {number} value - 分数
	 */
	const show = (name, value) => {
		actionName.value = name;
		points.value = value;

		// 播放音效
		audioCtx.stop();
		audioCtx.seek(0);
		audioCtx.play();

		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	defineExpose({
		show,
		close
	});
</script>

<style lang="scss" scoped>
	.points-popup {
		width: 560rpx;
		background-color: #fff;
		border-radius: 30rpx;
		overflow: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* 稍微加一点阴影 */
		box-shadow: 0 10rpx 40rpx rgba(255, 110, 0, 0.2);
	}

	.popup-header {
		width: 100%;
		height: 160rpx;
		background: linear-gradient(135deg, #FF8C37, #FF6E00);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 50% 20rpx;
		border-bottom-right-radius: 50% 20rpx;
		margin-bottom: 20rpx;

		.header-img {
			width: 120rpx;
			height: 120rpx;
		}
	}

	.popup-body {
		padding: 20rpx 40rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.congrats-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #FF6E00;
		margin-bottom: 20rpx;
	}

	.detail-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		margin-bottom: 10rpx;

		.highlight {
			font-weight: bold;
			color: #FF6E00;
			margin: 0 4rpx;
		}
	}

	.points-value {
		font-size: 60rpx;
		font-weight: 800;
		color: #FF4D4F;
		/* 用红色更醒目，或者继续用主题橙 #FF6E00 */
		margin: 20rpx 0;
		font-family: 'Helvetica Neue', Helvetica, sans-serif;

		.unit {
			font-size: 28rpx;
			font-weight: normal;
			color: #666;
			margin-left: 6rpx;
		}
	}

	.sub-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.popup-footer {
		width: 100%;
		padding: 30rpx 40rpx 40rpx;
		box-sizing: border-box;
	}

	.confirm-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		background: linear-gradient(to right, #FF8C37, #FF6E00);
		color: #fff;
		font-size: 30rpx;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(255, 110, 0, 0.3);

		&::after {
			border: none;
		}

		&:active {
			opacity: 0.9;
			transform: translateY(2rpx);
		}
	}
</style>