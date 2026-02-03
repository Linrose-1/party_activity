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

			<!-- 二维码显示区 (二维码通常由后端在 content 或 独立字段返回，这里暂时保留原 URL 作为兜底) -->
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
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import request from '@/utils/request.js';

	// 1. 定义响应式变量
	const wechatId = ref('加载中...'); // 初始显示加载中
	const phoneNumber = ref('加载中...');
	const qrCodeUrl = ref(
		'https://img.gofor.club/post/20260120/bYIigxFi4rpHd5c68a1fff9f38e5411a58c9b8cec504_1768890701193.png');

	// 2. 生命周期：挂载时拉取配置数据
	onMounted(() => {
		fetchStaticConfig();
	});

	/**
	 * [接口方法] 获取动态配置信息
	 */
	const fetchStaticConfig = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/config/getStaticWord', {
				method: 'GET'
			});

			if (!error && data) {
				// 核心赋值：从接口返回的 Map 中提取字段
				wechatId.value = data.csWechatId || 'XJS3026'; // 如果后台没配，使用之前的默认值兜底
				phoneNumber.value = data.csMobile || '18024545855';

				// 如果接口返回了二维码地址，也可以同步更新 (假设字段名为 csQrCode)
				if (data.csQrCode) {
					qrCodeUrl.value = data.csQrCode;
				}

				console.log('✅ 客服配置加载成功');
			} else {
				console.error('获取配置失败:', error);
			}
		} catch (e) {
			console.error('获取配置异常:', e);
		}
	};

	/**
	 * 预览二维码图片
	 */
	const previewQrCode = () => {
		if (!qrCodeUrl.value) return;
		uni.previewImage({
			urls: [qrCodeUrl.value],
			current: qrCodeUrl.value
		});
	};

	/**
	 * 拨打客服电话
	 */
	const makePhoneCall = () => {
		if (phoneNumber.value === '加载中...') return;
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
		if (wechatId.value === '加载中...') return;
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