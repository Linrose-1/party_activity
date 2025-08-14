<template>
	<view class="business-card-container">
		<!-- 名片正面 - 个人及联系信息 -->
		<view class="card-front">
			<!-- 1. 顶部：头像、姓名、职位 -->
			<view class="header-section">
				<view class="avatar">
					<image :src="avatar" mode="aspectFill" />
				</view>
				<view class="identity">
					<view class="name-line">
						<text class="name">{{ name }}</text>
						<text class="pinyin">{{ pinyinName }}</text>
					</view>
					<view class="title-line">
						<text class="title">{{ title }}</text>
					</view>
				</view>
			</view>

			<!-- 2. 中部：公司信息 -->
			<view class="company-section">
				<view class="company-main">{{ companyName }} <text v-if="department">{{ department }}</text></view>
				<view class="company-full">{{ fullCompanyName }}</view>
			</view>

			<!-- 3. 底部：联系方式列表 -->
			<view class="info-list">
				<view class="info-item" v-for="(item, index) in contactInfo" :key="index">
					<uni-icons :type="item.icon" size="18" color="#FF7B00" />
					<text class="info-text">{{ item.value }}</text>
				</view>
			</view>

			<!-- 4. 用户个人微信二维码 -->
			<view class="user-qr-section" v-if="showUserQrCode">
				<view class="qr-title">我的微信二维码</view>
				<view class="qr-code-box">
					<image :src="userWeChatQrCodeUrl" mode="aspectFit" />
				</view>
				<view class="qr-hint">扫码添加我的微信</view>
			</view>

			<view v-if="shardCode" class="shard-code-section" @click="copyShardCode">
				<view class="shard-code-value">
					<text>邀请码：</text>
					<text class="code">{{ shardCode }}</text>
				</view>
				<view class="copy-action">
					<uni-icons type="paperclip" size="16" color="#FF7B00"></uni-icons>
					<text>点击复制</text>
				</view>
			</view>

			<!-- 5. 底部 Slogan -->
			<view class="value-slogan">
				<view class="line"></view>
				<text>价值连接·生态共创</text>
			</view>
		</view>

		<!-- 名片背面 - 品牌/平台信息 -->
		<view class="card-back">
			<view class="slogan-primary">连接全球精英商友</view>
			<view class="slogan-secondary">GO FOR PARTNERS • GO FOR FUTURE</view>
			<!-- 平台二维码 -->
			<view class="platform-qr-code">
				<!-- <image :src="platformQrCodeUrl" mode="aspectFit" /> -->
				<image class="logo" src="https://img.gofor.club/index1.png" mode="aspectFit"></image>
			</view>
			<view class="logo">
				<image :src="logoUrl" mode="aspectFit" />
			</view>
		</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		// --- 顶部个人信息 ---
		avatar: {
			type: String,
			default: 'https://randomuser.me/api/portraits/men/41.jpg'
		},
		name: {
			type: String,
			default: '张三'
		},
		pinyinName: {
			type: String,
			default: 'ZHANG SAN'
		},
		groupName: {
			type: String,
			default: '伙猩人'
		},
		title: {
			type: String,
			default: '首席运营官'
		},
		// --- 公司与联系方式 ---
		companyName: {
			type: String,
			default: '高伙猩球'
		},
		department: {
			type: String,
			default: '数字化运营中心'
		},
		fullCompanyName: {
			type: String,
			default: '广东智米云科技有限公司'
		},
		contactInfo: {
			type: Array,
			default: () => [{
					icon: 'phone-filled',
					value: '18888888888'
				},
				{
					icon: 'email-filled',
					value: 'ZHANGSAN@foxmail.com'
				},
				{
					icon: 'location-filled',
					value: '广东省广州市天河区珠江新城潭村路328号二楼'
				}
			]
		},
		shardCode: {
			type: String,
			default: ''
		},
		// --- 用户个人二维码 ---
		showUserQrCode: {
			type: Boolean,
			default: true
		},
		userWeChatQrCodeUrl: {
			type: String,
			default: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=user-wechat'
		},
		// --- 底部平台信息 ---
		platformQrCodeUrl: {
			type: String,
			default: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info'
		},
		logoUrl: {
			type: String,
			default: 'https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png'
		}
	});

	const copyShardCode = () => {
		if (!props.shardCode) return;

		uni.setClipboardData({
			data: props.shardCode,
			success: () => {
				uni.showToast({
					title: '邀请码已复制',
					icon: 'success'
				});
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				});
			}
		});
	};
</script>

<style lang="scss" scoped>
	.business-card-container {
		width: 100%;
		min-width: 80vw;
		margin: 30rpx auto;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
		border-radius: 20rpx;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	// ===================================
	// 名片正面样式 (白色区域)
	// ===================================
	.card-front {
		background-color: #ffffff;
		padding: 40rpx;
	}

	.header-section {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 30rpx;
		flex-shrink: 0;
		border: 4rpx solid #f0f0f0;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.identity {
		.name-line {
			display: flex;
			align-items: baseline;
			margin-bottom: 10rpx;
		}

		.name {
			font-size: 48rpx;
			font-weight: bold;
			color: #333;
			margin-right: 20rpx;
		}

		.pinyin {
			font-size: 26rpx;
			color: #888;
			font-weight: 300;
		}

		.title-line {
			font-size: 28rpx;
			color: #555;
		}

		.group {
			margin-right: 16rpx;
		}
	}

	.company-section {
		margin-bottom: 40rpx;

		.company-main {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 8rpx;
		}

		.company-full {
			font-size: 26rpx;
			color: #666;
		}
	}

	.info-list {
		display: flex;
		flex-direction: column;
		gap: 25rpx;
		padding-bottom: 40rpx;
	}

	.info-item {
		display: flex;
		align-items: center;

		.info-text {
			margin-left: 20rpx;
			font-size: 28rpx;
			color: #333;
		}
	}

	.user-qr-section {
		text-align: center;
		padding: 40rpx 0;
		border-top: 1rpx solid #f0f0f0;
		border-bottom: 1rpx solid #f0f0f0;

		.qr-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #444;
			margin-bottom: 30rpx;
		}

		.qr-code-box {
			width: 280rpx;
			height: 280rpx;
			margin: 0 auto;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.qr-hint {
			font-size: 26rpx;
			color: #777;
			margin-top: 30rpx;
		}
	}

	.shard-code-section {
		margin-top: 40rpx;
		padding: 20rpx 30rpx;
		background-color: #fff8f2;
		border: 1rpx solid #ffe8d1;
		border-radius: 16rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer; // 提示用户这里可以点击
		transition: background-color 0.2s;

		&:active {
			background-color: #fff0e0; // 点击时的反馈效果
		}
	}

	.shard-code-value {
		font-size: 30rpx;
		color: #555;

		.code {
			font-size: 32rpx;
			font-weight: bold;
			color: #FF7B00;
			margin-left: 10rpx;
			letter-spacing: 2rpx; // 增加字符间距，更易读
		}
	}

	.copy-action {
		display: flex;
		align-items: center;
		color: #FF7B00;
		font-size: 26rpx;

		.uni-icons {
			margin-right: 8rpx;
		}
	}


	.value-slogan {
		display: flex;
		align-items: center;
		margin-top: 40rpx;

		.line {
			width: 60rpx;
			height: 4rpx;
			background-color: #FF7B00;
			margin-right: 20rpx;
		}

		text {
			font-size: 30rpx;
			font-weight: 500;
			color: #FF7B00;
		}
	}

	// ===================================
	// 名片背面样式 (橙色区域)
	// ===================================
	.card-back {
		background-color: #F78C2F;
		background-image:
			radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 5%, transparent 5.5%),
			radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 15%, transparent 15.5%),
			radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 25%, transparent 25.5%);
		color: white;
		padding: 60rpx 40rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30rpx;
	}

	.slogan-primary {
		font-size: 44rpx;
		font-weight: bold;
		letter-spacing: 2rpx;
	}

	.slogan-secondary {
		font-size: 24rpx;
		opacity: 0.9;
		letter-spacing: 1rpx;
		margin-top: -15rpx;
	}

	.platform-qr-code {
		width: 280rpx;
		height: 280rpx;
		background-color: white;
		padding: 20rpx;
		border-radius: 20rpx;
		margin-top: 20rpx;
		margin-bottom: 20rpx;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.logo {
		width: 250rpx;
		height: 80rpx;

		image {
			width: 100%;
			height: 100%;
		}
	}
</style>