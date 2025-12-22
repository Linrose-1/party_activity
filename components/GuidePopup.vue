<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="guide-popup">
			<view class="popup-header">
				<text class="popup-title">💎 快速找到猩聚社，商机不错过</text>
			</view>

			<view class="popup-content">
				<view class="intro-text">建议您完成以下两个操作：</view>

				<view class="step-item">
					<text class="step-title">📌 第一步：添加到桌面</text>
					<view class="step-desc">1. 点击右上角 <text class="dots">···</text></view>
					<view class="step-desc">2. 选择「添加到桌面」</view>
				</view>

				<view class="step-item">
					<text class="step-title">⭐ 第二步：收藏到小程序</text>
					<view class="step-desc">1. 点击右上角 <text class="dots">···</text></view>
					<view class="step-desc">2. 选择「收藏」</view>
				</view>

				<view class="benefits-box">
					<view class="benefit-item">✅ 桌面一键启动，像APP一样方便</view>
					<view class="benefit-item">✅ 微信下拉快速访问，优先显示</view>
					<view class="benefit-item">✅ 重要商机提醒第一时间收到</view>
				</view>
			</view>

			<view class="popup-footer">
				<view class="btn btn-secondary" @click="handleRemindLater">知道了，请下次提醒</view>
				<view class="btn btn-primary" @click="handleGoSetting">好的，我这就去设置</view>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	const popup = ref(null);
	const STORAGE_KEY = 'has_shown_add_desktop_guide';

	// 公开方法：检查并显示弹窗
	const checkAndShow = () => {
		const hasShown = uni.getStorageSync(STORAGE_KEY);
		// 如果没有显示过，或者是之前点了“下次提醒”但过期了(这里简化为没标记过就显示)
		if (!hasShown) {
			popup.value.open();
		}
	};

	// 点击“知道了，请下次提醒”
	const handleRemindLater = () => {
		// 这里可以不做标记，或者记录一个时间戳，下次进来根据时间间隔判断是否显示
		// 简单起见，如果点这个，这次关掉，下次进来还会弹（符合“下次提醒”的字面意思）
		popup.value.close();
	};

	// 点击“好的，我这就去设置”
	const handleGoSetting = () => {
		// 标记为已展示，以后不再弹
		uni.setStorageSync(STORAGE_KEY, 'true');
		popup.value.close();

		// 可以在这里引导用户去点击右上角，例如显示一个指向右上角的浮层（可选）
		// 或者只是简单的关闭弹窗，让用户自己去操作
		uni.showToast({
			title: '请点击右上角 ··· 进行设置',
			icon: 'none',
			duration: 3000
		});
	};

	// 暴露给父组件的方法
	defineExpose({
		checkAndShow
	});
</script>

<style lang="scss" scoped>
	.guide-popup {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		padding-bottom: 30rpx;
	}

	.popup-header {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		padding: 30rpx;
		text-align: center;
	}

	.popup-title {
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
	}

	.popup-content {
		padding: 40rpx 30rpx 20rpx;
	}

	.intro-text {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 30rpx;
		font-weight: 500;
	}

	.step-item {
		margin-bottom: 24rpx;
	}

	.step-title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #FF6A00;
		margin-bottom: 10rpx;
	}

	.step-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
		padding-left: 20rpx;
	}

	.dots {
		font-weight: bold;
		background: #f0f0f0;
		padding: 0 8rpx;
		border-radius: 8rpx;
		margin: 0 4rpx;
	}

	.benefits-box {
		background-color: #fff8f2;
		border: 1rpx solid #ffe8d1;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-top: 30rpx;
	}

	.benefit-item {
		font-size: 24rpx;
		color: #555;
		margin-bottom: 8rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.popup-footer {
		display: flex;
		flex-direction: column;
		padding: 0 30rpx;
		gap: 20rpx;
		margin-top: 20rpx;
	}

	.btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 40rpx;
		font-size: 28rpx;
		font-weight: 500;

		&:active {
			opacity: 0.8;
		}
	}

	.btn-primary {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		box-shadow: 0 4rpx 10rpx rgba(255, 106, 0, 0.3);
	}

	.btn-secondary {
		background-color: #f5f5f5;
		color: #999;
	}
</style>