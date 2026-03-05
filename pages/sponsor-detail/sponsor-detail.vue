<template>
	<view class="page" v-if="detail">

		<!-- ========== 顶部沉浸式头图区 ========== -->
		<view class="hero-section">
			<!-- 背景大图 -->
			<image :src="headerImage" mode="aspectFill" class="hero-bg" />
			<!-- 渐变遮罩 -->
			<view class="hero-gradient" />

			<!-- 赞助商类型徽章 -->
			<view class="type-badge">
				<text>{{ sponsorTypeLabel }}</text>
			</view>

			<!-- 主体内容：Logo + 名称 -->
			<view class="hero-content">
				<view class="logo-ring">
					<image :src="detail.logoUrl || '/static/default-logo.png'" mode="aspectFill" class="logo-img" />
				</view>
				<text class="hero-name">{{ detail.sponsorName }}</text>
				<view class="hero-location" v-if="detail.location">
					<text class="loc-dot">●</text>
					<text class="loc-text">{{ detail.location }}</text>
				</view>
			</view>
		</view>

		<!-- ========== 核心赞助数据卡片 ========== -->
		<view class="stats-float-card" v-if="detail.sponsorType === 1 || detail.sponsorType === 3">
			<view class="stat-item">
				<text class="stat-label">赞助总额</text>
				<text class="stat-value orange">¥{{ detail.cashAmount }}</text>
			</view>
			<view class="stat-divider" />
			<view class="stat-item">
				<text class="stat-label">人均赞助</text>
				<text class="stat-value">¥{{ detail.perCapitalAmount }}</text>
			</view>
			<view class="stat-divider" />
			<view class="stat-item">
				<text class="stat-label">赞助方式</text>
				<text class="stat-value small">{{ sponsorTypeLabel }}</text>
			</view>
		</view>

		<!-- 纯物品赞助时的小标签 -->
		<view class="goods-only-badge" v-if="detail.sponsorType === 2">
			<text class="badge-icon">🎁</text>
			<text class="badge-text">实物赞助</text>
		</view>

		<view class="content-body">

			<!-- ========== 物品赞助清单 ========== -->
			<view class="section-card"
				v-if="(detail.sponsorType === 2 || detail.sponsorType === 3) && parsedGoodsList.length > 0">
				<view class="section-header">
					<view class="header-accent" />
					<text class="section-title">赞助物品清单</text>
				</view>
				<view class="goods-grid">
					<view v-for="(item, index) in parsedGoodsList" :key="index" class="goods-tag">
						<text class="goods-icon">🎁</text>
						<text class="goods-text">{{ item }}</text>
					</view>
				</view>
			</view>

			<!-- ========== 品牌简介 ========== -->
			<view class="section-card" v-if="detail.introduction">
				<view class="section-header">
					<view class="header-accent" />
					<text class="section-title">品牌简介</text>
				</view>
				<text class="intro-text">{{ detail.introduction }}</text>
			</view>

			<!-- ========== 品牌图集 ========== -->
			<view class="section-card no-pad" v-if="galleryImages.length > 0">
				<view class="section-header pad-header">
					<view class="header-accent" />
					<text class="section-title">品牌风采</text>
				</view>
				<swiper class="gallery-swiper" :circular="true" :indicator-dots="galleryImages.length > 1"
					indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#FF6F00" :autoplay="true"
					interval="3500" duration="400">
					<swiper-item v-for="(img, idx) in galleryImages" :key="idx">
						<image :src="img" mode="aspectFill" class="gallery-img" @click="previewGallery(idx)" />
					</swiper-item>
				</swiper>
				<view class="gallery-count-badge">
					<text>{{ galleryImages.length }} 张</text>
				</view>
			</view>

			<!-- ========== 负责人 ========== -->
			<view class="section-card contact-card" v-if="detail.contactName">
				<view class="section-header">
					<view class="header-accent" />
					<text class="section-title">负责人</text>
				</view>
				<view class="contact-row">
					<image :src="detail.contactAvatar || '/static/default-avatar.png'" mode="aspectFill"
						class="contact-avatar" />
					<view class="contact-info">
						<text class="contact-name">{{ detail.contactName }}</text>
						<text class="contact-sub">赞助负责人</text>
					</view>
					<view class="contact-tag">联系人</view>
				</view>
			</view>

		</view>

		<!-- 底部安全区占位 -->
		<view style="height: 60rpx;" />
	</view>

	<!-- 加载态骨架 -->
	<view class="skeleton-page" v-else>
		<view class="sk-hero" />
		<view class="sk-card" />
		<view class="sk-card short" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const detail = ref(null);

	onLoad(async (options) => {
		if (options.sponsorId && options.activityId) {
			loadDetail(options.sponsorId, options.activityId);
		}
	});

	const loadDetail = async (sponsorId, activityId) => {
		uni.showLoading({
			title: '加载中'
		});
		const res = await request('/app-api/member/sponsor-activity-record/get', {
			method: 'GET',
			data: {
				sponsorId,
				activityId
			}
		});
		uni.hideLoading();
		if (!res.error && res.data) {
			detail.value = res.data;
		}
	};

	// 赞助类型文案
	const sponsorTypeLabel = computed(() => {
		const map = {
			1: '💰 现金赞助',
			2: '📦 实物赞助',
			3: '💰+📦 混合赞助'
		};
		return detail.value ? (map[detail.value.sponsorType] || '赞助商') : '';
	});

	// 头图：优先图集第一张
	const headerImage = computed(() => {
		if (galleryImages.value.length > 0) return galleryImages.value[0];
		return 'https://img.gofor.club/default_sponsor_bg.jpg';
	});

	// 解析图集
	const galleryImages = computed(() => {
		if (!detail.value?.galleryImageUrls) return [];
		try {
			const raw = detail.value.galleryImageUrls;
			if (Array.isArray(raw)) return raw;
			return JSON.parse(raw);
		} catch (e) {
			return [];
		}
	});

	// 解析物品清单
	const parsedGoodsList = computed(() => {
		if (!detail.value?.goodsDescription) return [];
		try {
			const raw = detail.value.goodsDescription;
			if (Array.isArray(raw)) return raw;
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed.map(item => {
					if (typeof item === 'object' && item !== null) {
						return item.desc || item.name || JSON.stringify(item);
					}
					return String(item);
				});
			}
			return [String(parsed)];
		} catch (e) {
			return [detail.value.goodsDescription];
		}
	});

	const previewGallery = (current) => {
		uni.previewImage({
			urls: galleryImages.value,
			current
		});
	};
</script>

<style lang="scss" scoped>
	// ── 主题变量 ──────────────────────────────
	$orange: #FF6F00;
	$orange-light: #FFF3E0;
	$orange-deep: #E65100;
	$text-main: #1a1a1a;
	$text-sub: #888;
	$bg: #F5F5F7;
	$card-bg: #FFFFFF;
	$radius-lg: 28rpx;
	$radius-md: 18rpx;

	// ── 页面基础 ──────────────────────────────
	.page {
		min-height: 100vh;
		background-color: $bg;
	}

	// ── 骨架屏 ──────────────────────────────
	.skeleton-page {
		.sk-hero {
			width: 100%;
			height: 560rpx;
			background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
			background-size: 200% 100%;
			animation: shimmer 1.4s infinite;
		}

		.sk-card {
			margin: 24rpx;
			height: 200rpx;
			border-radius: $radius-lg;
			background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
			background-size: 200% 100%;
			animation: shimmer 1.4s infinite 0.2s;

			&.short {
				height: 120rpx;
			}
		}
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}

		100% {
			background-position: -200% 0;
		}
	}

	// ── 沉浸式头图 ──────────────────────────────
	.hero-section {
		position: relative;
		height: 560rpx;
		overflow: hidden;

		.hero-bg {
			width: 100%;
			height: 100%;
		}

		.hero-gradient {
			position: absolute;
			inset: 0;
			background: linear-gradient(to bottom,
					rgba(0, 0, 0, 0.15) 0%,
					rgba(0, 0, 0, 0.1) 30%,
					rgba(0, 0, 0, 0.65) 100%);
		}

		.back-btn {
			position: absolute;
			top: 88rpx;
			left: 32rpx;
			width: 68rpx;
			height: 68rpx;
			background: rgba(255, 255, 255, 0.2);
			backdrop-filter: blur(10px);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;

			.back-icon {
				font-size: 48rpx;
				color: #fff;
				line-height: 1;
				margin-top: -4rpx;
			}
		}

		.type-badge {
			position: absolute;
			top: 96rpx;
			right: 32rpx;
			background: rgba(255, 111, 0, 0.9);
			backdrop-filter: blur(8px);
			padding: 8rpx 22rpx;
			border-radius: 30rpx;
			font-size: 22rpx;
			color: #fff;
			font-weight: 600;
		}

		.hero-content {
			position: absolute;
			bottom: 48rpx;
			left: 0;
			right: 0;
			display: flex;
			flex-direction: column;
			align-items: center;

			.logo-ring {
				width: 136rpx;
				height: 136rpx;
				border-radius: 24rpx;
				border: 4rpx solid rgba(255, 255, 255, 0.6);
				overflow: hidden;
				background: #fff;
				margin-bottom: 20rpx;
				box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);

				.logo-img {
					width: 100%;
					height: 100%;
				}
			}

			.hero-name {
				font-size: 44rpx;
				font-weight: 700;
				color: #fff;
				letter-spacing: 2rpx;
				text-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.4);
				margin-bottom: 12rpx;
			}

			.hero-location {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.loc-dot {
					font-size: 14rpx;
					color: $orange;
				}

				.loc-text {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.85);
				}
			}
		}
	}

	// ── 悬浮数据卡片 ──────────────────────────────
	.stats-float-card {
		margin: -40rpx 32rpx 0;
		background: $card-bg;
		border-radius: $radius-lg;
		padding: 36rpx 24rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.10);
		position: relative;
		z-index: 10;

		.stat-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;

			.stat-label {
				font-size: 22rpx;
				color: $text-sub;
			}

			.stat-value {
				font-size: 38rpx;
				font-weight: 800;
				color: $text-main;
				line-height: 1.1;

				&.orange {
					color: $orange;
				}

				&.small {
					font-size: 26rpx;
					font-weight: 600;
					text-align: center;
				}
			}
		}

		.stat-divider {
			width: 2rpx;
			height: 56rpx;
			background: #f0f0f0;
			flex-shrink: 0;
		}
	}

	// 纯物品赞助标签
	.goods-only-badge {
		margin: -20rpx 32rpx 0;
		background: $card-bg;
		border-radius: $radius-lg;
		padding: 24rpx 32rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
		position: relative;
		z-index: 10;

		.badge-icon {
			font-size: 36rpx;
		}

		.badge-text {
			font-size: 30rpx;
			font-weight: 700;
			color: $text-main;
		}
	}

	// ── 内容区 ──────────────────────────────
	.content-body {
		margin-top: 32rpx;
		padding: 0 24rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	// ── 通用 section 卡片 ──────────────────────────────
	.section-card {
		background: $card-bg;
		border-radius: $radius-lg;
		padding: 32rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);

		&.no-pad {
			padding: 0;
			overflow: hidden;
		}

		.pad-header {
			padding: 32rpx 32rpx 0;
		}

		.section-header {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 28rpx;

			.header-accent {
				width: 8rpx;
				height: 32rpx;
				background: linear-gradient(to bottom, $orange, $orange-deep);
				border-radius: 4rpx;
			}

			.section-title {
				font-size: 30rpx;
				font-weight: 700;
				color: $text-main;
			}
		}
	}

	// ── 物品清单 ──────────────────────────────
	.goods-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;

		.goods-tag {
			display: flex;
			align-items: center;
			gap: 8rpx;
			background: $orange-light;
			border: 1rpx solid #FFD180;
			border-radius: 30rpx;
			padding: 12rpx 24rpx;

			.goods-icon {
				font-size: 28rpx;
			}

			.goods-text {
				font-size: 26rpx;
				color: #BF360C;
				font-weight: 500;
			}
		}
	}

	// ── 简介文字 ──────────────────────────────
	.intro-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		letter-spacing: 0.5rpx;
	}

	// ── 图集 ──────────────────────────────
	.gallery-swiper {
		width: 100%;
		height: 380rpx;
		display: block;

		.gallery-img {
			width: 100%;
			height: 100%;
		}
	}

	.gallery-count-badge {
		position: absolute;
		bottom: 20rpx;
		right: 24rpx;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(6px);
		border-radius: 20rpx;
		padding: 6rpx 18rpx;
		font-size: 22rpx;
		color: #fff;
	}

	// section-card.no-pad 内部需要 relative 才能让 badge 定位
	.section-card.no-pad {
		position: relative;
	}

	// ── 负责人 ──────────────────────────────
	.contact-card {
		.contact-row {
			display: flex;
			align-items: center;
			gap: 24rpx;

			.contact-avatar {
				width: 96rpx;
				height: 96rpx;
				border-radius: 50%;
				background: #eee;
				flex-shrink: 0;
				border: 3rpx solid $orange-light;
			}

			.contact-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 6rpx;

				.contact-name {
					font-size: 30rpx;
					font-weight: 700;
					color: $text-main;
				}

				.contact-sub {
					font-size: 22rpx;
					color: $text-sub;
				}
			}

			.contact-tag {
				font-size: 22rpx;
				color: $orange;
				background: $orange-light;
				border: 1rpx solid #FFD180;
				padding: 6rpx 18rpx;
				border-radius: 20rpx;
				font-weight: 600;
			}
		}
	}
</style>