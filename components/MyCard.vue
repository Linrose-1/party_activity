<template>
	<view class="business-card-container">
		<!-- 名片正面 - 全新模块化布局 -->
		<view class="card-front">
			<!-- 1. 顶部：身份核心区 -->
			<view class="header-section">
				<view class="avatar" @click="previewImage(avatar)">
					<image :src="avatar" mode="aspectFill" show-menu-by-longpress />
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

			<!-- 2. 基础资料区 (新顺序) -->
			<view class="section-block basic-info-section">
				<view class="info-item">
					<uni-icons type="calendar-filled" size="18" color="#888" />
					<text class="info-label">年代：</text>
					<text class="info-value era-value">{{ era || '未设置' }}</text>
				</view>
				<view class="info-item" v-for="(item, index) in contactInfo" :key="index">
					<uni-icons :type="item.icon" size="18" color="#888" />
					<text class="info-label">{{ item.label }}：</text>
					<text class="info-value">{{ item.value }}</text>
				</view>
			</view>

			<!-- 3. 社会职务区 (突出显示) -->
			<view class="section-block professional-section" v-if="professionalTitles.length > 0">
				<view class="section-title">
					<uni-icons type="staff-filled" size="18" color="#C9A063"></uni-icons>
					<text>社会职务</text>
				</view>
				<view class="tag-list">
					<text class="tag" v-for="(item, index) in professionalTitles" :key="index">{{ item }}</text>
				</view>
			</view>

			<!-- 4. 职业信息区 (按组显示) -->
			<view class="section-block career-section" v-if="careerGroups.length > 0">
				<view class="section-title">
					<uni-icons type="flag-filled" size="18" color="#F78C2F"></uni-icons>
					<text>职业信息</text>
				</view>
				<view class="career-group" v-for="(group, index) in careerGroups" :key="index">
					<view class="career-item">
						<text class="career-label">公司：</text>
						<text class="career-value">{{ group.company }}</text>
					</view>
					<view class="career-item">
						<text class="career-label">职务：</text>
						<text class="career-value">{{ group.position }}</text>
					</view>
					<view class="career-item">
						<text class="career-label">行业：</text>
						<text class="career-value">{{ group.industry }}</text>
					</view>
				</view>
			</view>

			<!-- 5. 资源对接区 -->
			<view class="section-block resource-section" v-if="haveResources || needResources">
				<view v-if="haveResources" class="resource-item">
					<view class="resource-title have-title">
						<uni-icons type="hand-up-filled" size="18" color="#28a745"></uni-icons>
						<text>我有资源</text>
					</view>
					<view class="resource-content">{{ haveResources }}</view>
				</view>
				<view v-if="needResources" class="resource-item">
					<view class="resource-title need-title">
						<uni-icons type="paperplane-filled" size="18" color="#007bff"></uni-icons>
						<text>我需资源</text>
					</view>
					<view class="resource-content">{{ needResources }}</view>
				</view>
			</view>

			<!-- 6. 个人展示区 -->
			<view class="section-block personal-bio-section" v-if="signature || personalBio">
				<view v-if="signature" class="signature-item">
					<text class="quote-start">“</text>
					<text class="signature-text">{{ signature }}</text>
					<text class="quote-end">”</text>
				</view>
				<view v-if="personalBio" class="bio-item">
					<view class="bio-title">个人简介</view>
					<view class="bio-content">{{ personalBio }}</view>
				</view>
			</view>

			<!-- 7. 用户个人微信二维码 -->
			<view class="user-qr-section" v-if="showUserQrCode">
				<view class="qr-title">我的微信二维码</view>
				<view class="qr-code-box" @click="previewImage(userWeChatQrCodeUrl)">
					<image :src="userWeChatQrCodeUrl" mode="aspectFit" show-menu-by-longpress />
				</view>
				<view class="qr-hint">扫码或长按识别添加微信</view>
			</view>

			<!-- 8. 邀请码 (样式保留) -->
			<view v-if="shardCode" class="shard-code-section" @click="copyShardCode">
				<view class="shard-code-value">
					<text>邀请码：</text>
					<text class="code">{{ shardCode }}</text>
				</view>
				<view class="copy-action">
					<uni-icons type="paperclip" size="16" color="#F78C2F"></uni-icons>
					<text>点击复制</text>
				</view>
			</view>

			<!-- 9. 底部 Slogan (样式保留) -->
			<view class="value-slogan">
				<view class="line"></view>
				<text>价值连接·生态共创</text>
			</view>
		</view>

		<!-- 名片背面 - 品牌/平台信息 (优化视觉) -->
		<view class="card-back">
			<view class="slogan-primary">连接全球精英商友</view>
			<view class="slogan-secondary">GO FOR PARTNERS • GO FOR FUTURE</view>
			<view class="platform-qr-code" @click="previewImage(platformQrCodeUrl)">
				<image :src="platformQrCodeUrl" mode="aspectFit" show-menu-by-longpress />
			</view>
			<!-- 新增：平台二维码下方的提示文字 -->
			<view class="qr-hint-back">扫码或长按识别加入平台</view>
			<view class="logo">
				<image :src="logoUrl" mode="aspectFit" />
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		computed
	} from 'vue';

	const props = defineProps({
		// --- 身份核心信息 ---
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
		title: {
			type: String,
			default: '首席运营官'
		},
		era: {
			type: String,
			default: ''
		}, // 新增：年代

		// --- 职业与社会信息 ---
		companyName: {
			type: String,
			default: '高伙猩球'
		},
		positionTitle: {
			type: String,
			default: '总裁'
		}, // 新增：职务
		industry: {
			type: String,
			default: '互联网'
		}, // 新增：行业
		professionalTitle: {
			type: String,
			default: ''
		}, // 新增：社会职务

		// --- 资源信息 ---
		haveResources: {
			type: String,
			default: ''
		}, // 新增：我有资源
		needResources: {
			type: String,
			default: ''
		}, // 新增：我需资源

		// --- 个人展示信息 ---
		signature: {
			type: String,
			default: ''
		}, // 新增：个性签名
		personalBio: {
			type: String,
			default: ''
		}, // 新增：个人简介

		// --- 联系方式 ---
		contactInfo: {
			type: Array,
			default: () => [{
					icon: 'phone-filled',
					label: '手机',
					value: '18888888888'
				},
				{
					icon: 'email-filled',
					label: '邮箱',
					value: 'ZHANGSAN@foxmail.com'
				},
				{
					icon: 'location-filled',
					label: '地址',
					value: '广东省广州市天河区珠江新城'
				}
			]
		},

		// --- 二维码与邀请码 ---
		shardCode: {
			type: String,
			default: ''
		},
		showUserQrCode: {
			type: Boolean,
			default: true
		},
		userWeChatQrCodeUrl: {
			type: String,
			default: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=user-wechat'
		},

		// --- 平台信息 ---
		platformQrCodeUrl: {
			type: String,
			default: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info'
		},
		logoUrl: {
			type: String,
			default: 'https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png'
		},

		// --- 以下为旧版兼容，新版已不再直接使用 ---
		department: {
			type: String,
			default: ''
		},
		fullCompanyName: {
			type: String,
			default: ''
		},
	});

	// 计算属性，处理多项社会职务
	const professionalTitles = computed(() => {
		return props.professionalTitle ? props.professionalTitle.split(',').filter(item => item.trim()) : [];
	});

	// 【新增】计算属性，处理职业信息分组
	const careerGroups = computed(() => {
		const companies = props.companyName ? props.companyName.split(',') : [];
		const positions = props.positionTitle ? props.positionTitle.split(',') : [];
		const industries = props.industry ? props.industry.split(',') : [];

		const maxLength = Math.max(companies.length, positions.length, industries.length);
		const groups = [];

		for (let i = 0; i < maxLength; i++) {
			groups.push({
				company: (companies[i] || '未填写').trim(),
				position: (positions[i] || '未填写').trim(),
				industry: (industries[i] || '未填写').trim(),
			});
		}

		return groups;
	});


	const copyShardCode = () => {
		if (!props.shardCode) return;
		uni.setClipboardData({
			data: props.shardCode,
			success: () => uni.showToast({
				title: '邀请码已复制',
				icon: 'success'
			}),
			fail: () => uni.showToast({
				title: '复制失败',
				icon: 'none'
			})
		});
	};

	// 预览图片方法
	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url],
			current: url
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
		background-color: #f9f9f9;
	}

	// ===================================
	// 名片正面样式 (全新布局)
	// ===================================
	.card-front {
		background: linear-gradient(to bottom, #ffffff, #fdfdfd);
		padding: 40rpx;
	}

	// 1. 顶部身份核心区
	.header-section {
		display: flex;
		align-items: center;
		margin-bottom: 50rpx;

		.avatar {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-right: 30rpx;
			flex-shrink: 0;
			border: 6rpx solid #fff;
			box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);

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
				color: #2c3e50;
				margin-right: 20rpx;
			}

			.pinyin {
				font-size: 26rpx;
				color: #95a5a6;
				font-weight: 300;
			}

			.title-line {
				font-size: 28rpx;
				color: #34495e;
			}
		}
	}

	// 通用模块样式
	.section-block {
		background-color: #ffffff;
		border: 1rpx solid #f0f0f0;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	// 2. 基础资料区
	.basic-info-section {
		display: flex;
		flex-direction: column;
		gap: 25rpx;

		.info-item {
			display: flex;
			align-items: center;
			font-size: 28rpx;
		}

		.info-label {
			color: #888;
			margin-left: 20rpx;
			flex-shrink: 0;
		}

		.info-value {
			color: #333;
			word-break: break-all;
		}

		.era-value {
			background-color: #ecf0f1;
			color: #7f8c8d;
			font-size: 26rpx;
			padding: 4rpx 16rpx;
			border-radius: 8rpx;
		}
	}


	// 3. 社会职务区 (突出)
	.professional-section {
		background: linear-gradient(135deg, #FFFBF5, #FFF3E6);
		border: 1px solid #FDE4C9;

		.section-title {
			display: flex;
			align-items: center;
			font-size: 30rpx;
			font-weight: 600;
			color: #A37E4A;
			margin-bottom: 25rpx;

			text {
				margin-left: 15rpx;
			}
		}

		.tag-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
		}

		.tag {
			background-color: #fff;
			border: 1rpx solid #FADDC2;
			color: #BF915B;
			font-size: 26rpx;
			padding: 8rpx 20rpx;
			border-radius: 30rpx;
		}
	}

	// 4. 职业信息区 (分组)
	.career-section {
		.section-title {
			display: flex;
			align-items: center;
			font-size: 30rpx;
			font-weight: 600;
			color: #F78C2F;
			margin-bottom: 25rpx;

			text {
				margin-left: 15rpx;
			}
		}

		.career-group {
			padding: 25rpx;
			border: 1rpx solid #f5f5f5;
			border-radius: 12rpx;
			background-color: #fafafa;

			&:not(:last-child) {
				margin-bottom: 25rpx;
			}
		}

		.career-item {
			display: flex;
			font-size: 28rpx;

			&:not(:last-child) {
				margin-bottom: 15rpx;
			}
		}

		.career-label {
			color: #888;
			width: 120rpx; // 固定标签宽度，使其对齐
			flex-shrink: 0;
		}

		.career-value {
			color: #333;
			font-weight: 500;
			word-break: break-all;
		}
	}


	// --- 其他模块样式保持不变，但为了完整性，在此全部提供 ---

	// 5. 资源对接区
	.resource-section {
		.resource-item:not(:last-child) {
			margin-bottom: 30rpx;
			padding-bottom: 30rpx;
			border-bottom: 1rpx dashed #eee;
		}

		.resource-title {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			font-weight: 600;
			margin-bottom: 15rpx;

			text {
				margin-left: 15rpx;
			}

			&.have-title {
				color: #28a745;
			}

			&.need-title {
				color: #007bff;
			}
		}

		.resource-content {
			font-size: 28rpx;
			color: #555;
			line-height: 1.6;
			white-space: pre-wrap; // 支持换行
		}
	}

	// 6. 个人展示区
	.personal-bio-section {
		.signature-item {
			font-style: italic;
			color: #777;
			margin-bottom: 30rpx;
			padding-bottom: 30rpx;
			border-bottom: 1rpx dashed #eee;
			position: relative;
			padding: 0 20rpx;

			.signature-text {
				font-size: 28rpx;
			}

			.quote-start,
			.quote-end {
				font-size: 40rpx;
				color: #F78C2F;
				position: absolute;
			}

			.quote-start {
				top: -10rpx;
				left: -10rpx;
			}

			.quote-end {
				bottom: -10rpx;
				right: -10rpx;
			}
		}

		.bio-item {
			.bio-title {
				font-size: 28rpx;
				font-weight: 600;
				color: #555;
				margin-bottom: 15rpx;
			}

			.bio-content {
				font-size: 28rpx;
				color: #555;
				line-height: 1.6;
			}
		}
	}


	// 7. 用户二维码
	.user-qr-section {
		text-align: center;
		padding: 40rpx 0;

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

	.shard-code-section,
	.value-slogan {
		// ... (这些样式保持不变)
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
		cursor: pointer;

		&:active {
			background-color: #fff0e0;
		}

		.shard-code-value {
			font-size: 30rpx;
			color: #555;

			.code {
				font-size: 32rpx;
				font-weight: bold;
				color: #F78C2F;
				margin-left: 10rpx;
				letter-spacing: 2rpx;
			}
		}

		.copy-action {
			display: flex;
			align-items: center;
			color: #F78C2F;
			font-size: 26rpx;

			.uni-icons {
				margin-right: 8rpx;
			}
		}
	}

	.value-slogan {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 60rpx;
		padding-top: 40rpx;
		border-top: 1rpx solid #f0f0f0;

		.line {
			width: 60rpx;
			height: 4rpx;
			background-color: #F78C2F;
			margin-right: 20rpx;
		}

		text {
			font-size: 30rpx;
			font-weight: 500;
			color: #F78C2F;
		}
	}

	// ===================================
	// 名片背面样式 (优化渐变)
	// ===================================
	.card-back {
		background: linear-gradient(135deg, #F9A825, #F78C2F);
		color: white;
		padding: 60rpx 40rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;

		.slogan-primary {
			font-size: 44rpx;
			font-weight: bold;
			letter-spacing: 2rpx;
			margin-bottom: 15rpx;
		}

		.slogan-secondary {
			font-size: 24rpx;
			opacity: 0.9;
			letter-spacing: 1rpx;
			margin-bottom: 40rpx;
		}

		.platform-qr-code {
			width: 280rpx;
			height: 280rpx;
			background-color: white;
			padding: 20rpx;
			border-radius: 20rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		// 新增样式
		.qr-hint-back {
			font-size: 26rpx;
			color: rgba(255, 255, 255, 0.9);
			margin-top: 30rpx;
			margin-bottom: 40rpx;
		}

		.logo {
			width: 250rpx;
			height: 80rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>