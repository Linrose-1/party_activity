<template>
	<view class="contact-container">
		<!-- 1. 顶部背景装饰区 -->
		<view class="header-bg"></view>

		<!-- 2. 客服卡片内容区 -->
		<view class="service-card">
			<view class="card-header">
				<text class="title">联系平台客服</text>
				<text class="subtitle">如果您在使用过程中有任何疑问，请随时联系我们</text>
			</view>

			<!-- 二维码显示区 -->
			<view class="qr-section">
				<view class="qr-box" @click="previewQrCode">
					<image :src="qrCodeUrl" mode="aspectFit" show-menu-by-longpress class="qr-image" />
				</view>
				<text class="qr-hint">扫码或长按识别二维码添加微信</text>
			</view>

			<!-- 联系方式列表区 -->
			<view class="info-list">
				<!-- 微信号 -->
				<view class="info-item">
					<view class="item-left">
						<uni-icons type="weixin" size="24" color="#FF8400"></uni-icons>
						<text class="label">客服微信号</text>
					</view>
					<view class="item-right">
						<!-- selectable 属性支持长按选择复制 -->
						<text class="value" selectable>{{ wechatId }}</text>
						<view class="copy-btn" @click="copyWechat">复制</view>
					</view>
				</view>

				<!-- 手机号 -->
				<view class="info-item" @click="makePhoneCall">
					<view class="item-left">
						<uni-icons type="phone-filled" size="24" color="#FF8400"></uni-icons>
						<text class="label">客服手机号</text>
					</view>
					<view class="item-right">
						<text class="value phone-value">{{ phoneNumber }}</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 3. 底部服务时间提示 -->
		<!-- <view class="service-time">
			<text>服务时间：工作日 09:00 - 18:00</text>
		</view> -->
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	// 基础配置信息
	const qrCodeUrl = ref(
		'https://img.gofor.club/post/20260120/bYIigxFi4rpHd5c68a1fff9f38e5411a58c9b8cec504_1768890701193.png');
	const wechatId = ref('xiaodaxia2045');
	const phoneNumber = ref('18024545855');

	/**
	 * 预览二维码图片
	 */
	const previewQrCode = () => {
		uni.previewImage({
			urls: [qrCodeUrl.value],
			current: qrCodeUrl.value
		});
	};

	/**
	 * 拨打客服电话
	 */
	const makePhoneCall = () => {
		uni.makePhoneCall({
			phoneNumber: phoneNumber.value,
			fail: (err) => {
				console.log('拨打电话取消或失败', err);
			}
		});
	};

	/**
	 * 复制微信号
	 */
	const copyWechat = () => {
		uni.setClipboardData({
			data: wechatId.value,
			success: () => {
				uni.showToast({
					title: '微信号已复制',
					icon: 'success'
				});
			}
		});
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF8400;

	.contact-container {
		min-height: 100vh;
		background-color: #f8f9fb;
		position: relative;
		padding: 40rpx 30rpx;
	}

	/* 顶部氛围背景 */
	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 360rpx;
		background: linear-gradient(180deg, $theme-color 0%, rgba($theme-color, 0.1) 100%);
		z-index: 1;
	}

	/* 客服卡片主体 */
	.service-card {
		position: relative;
		z-index: 2;
		background: #ffffff;
		border-radius: 30rpx;
		padding: 50rpx 40rpx;
		margin-top: 80rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		text-align: center;
		margin-bottom: 50rpx;

		.title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 16rpx;
		}

		.subtitle {
			font-size: 26rpx;
			color: #999;
			line-height: 1.5;
		}
	}

	/* 二维码区域 */
	.qr-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;

		.qr-box {
			width: 320rpx;
			height: 320rpx;
			padding: 20rpx;
			background: #fff;
			border: 2rpx solid #f0f0f0;
			border-radius: 20rpx;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);

			.qr-image {
				width: 100%;
				height: 100%;
			}
		}

		.qr-hint {
			font-size: 24rpx;
			color: #FF8400;
			margin-top: 24rpx;
			font-weight: 500;
		}
	}

	/* 联系信息列表 */
	.info-list {
		background-color: #f9fafc;
		border-radius: 20rpx;
		padding: 10rpx 0;

		.info-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 30rpx;

			&:not(:last-child) {
				border-bottom: 1rpx solid #f0f0f0;
			}

			&:active {
				background-color: #f1f2f5;
			}
		}

		.item-left {
			display: flex;
			align-items: center;
			gap: 16rpx;

			.label {
				font-size: 28rpx;
				color: #666;
			}
		}

		.item-right {
			display: flex;
			align-items: center;
			gap: 12rpx;

			.value {
				font-size: 30rpx;
				color: #333;
				font-weight: bold;
			}

			.phone-value {
				color: #FF8400;
				/* 电话突出显示 */
			}

			.copy-btn {
				font-size: 22rpx;
				color: $theme-color;
				background: rgba($theme-color, 0.1);
				padding: 4rpx 16rpx;
				border-radius: 8rpx;
				border: 1rpx solid rgba($theme-color, 0.2);
			}
		}
	}

	/* 底部说明 */
	.service-time {
		text-align: center;
		margin-top: 60rpx;
		color: #bbb;
		font-size: 24rpx;
	}
</style>