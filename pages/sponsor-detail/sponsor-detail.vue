<template>
	<view class="page" v-if="detail">
		<!-- 1. 顶部头图 (取赞助商图集第一张，或者默认图) -->
		<view class="header-banner">
			<image :src="headerImage" mode="aspectFill" class="bg-img" />
			<view class="header-mask">
				<image :src="detail.logoUrl" mode="aspectFill" class="sponsor-logo" />
				<view class="header-info">
					<text class="sp-name">{{ detail.sponsorName }}</text>
					<text class="sp-loc" v-if="detail.location">📍 {{ detail.location }}</text>
				</view>
			</view>
		</view>

		<!-- 2. 赞助核心信息 -->
		<view class="card-section">
			<view class="section-title">本次赞助</view>
			<view class="sponsor-highlight">
				<template v-if="detail.sponsorType === 1">
					<view class="highlight-item">
						<text class="label">赞助总额</text>
						<text class="value money">¥{{ detail.cashAmount }}</text>
					</view>
					<view class="divider"></view>
					<view class="highlight-item">
						<text class="label">人均赞助</text>
						<text class="value">¥{{ detail.perCapitalAmount }}</text>
					</view>
				</template>
				<template v-else>
					<view class="highlight-item full-width">
						<text class="label">赞助物品</text>
						<text class="value goods">{{ detail.goodsDescription }} × {{ detail.goodsNum }}</text>
					</view>
				</template>
			</view>
		</view>

		<!-- 3. 简介 -->
		<view class="card-section">
			<view class="section-title">品牌简介</view>
			<text class="intro-text">{{ detail.introduction }}</text>
		</view>

		<!-- 4. 品牌风采 (Swiper) -->
		<view class="card-section" v-if="galleryImages.length > 0">
			<view class="section-title">品牌风采</view>
			<swiper class="gallery-swiper" circular indicator-dots autoplay>
				<swiper-item v-for="(img, idx) in galleryImages" :key="idx">
					<image :src="img" mode="aspectFill" class="gallery-img" @click="previewGallery(idx)" />
				</swiper-item>
			</swiper>
		</view>

		<!-- 5. 负责人 -->
		<view class="card-section contact-card" v-if="detail.contactName">
			<view class="section-title">负责人</view>
			<view class="contact-row">
				<image :src="detail.contactAvatar || '/static/default-avatar.png'" class="contact-avatar" />
				<text class="contact-name">{{ detail.contactName }}</text>
			</view>
		</view>
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

	// 头图逻辑：优先用图集第一张，没有则用默认背景
	const headerImage = computed(() => {
		if (galleryImages.value.length > 0) return galleryImages.value[0];
		return 'https://img.gofor.club/default_sponsor_bg.jpg'; // 建议替换为本地默认背景
	});

	// 解析图集 JSON
	const galleryImages = computed(() => {
		if (!detail.value || !detail.value.galleryImageUrls) return [];
		try {
			return JSON.parse(detail.value.galleryImageUrls);
		} catch (e) {
			return [];
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
	.page {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-bottom: 40rpx;
	}

	/* 头部 */
	.header-banner {
		height: 400rpx;
		position: relative;

		.bg-img {
			width: 100%;
			height: 100%;
		}

		.header-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.4);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #fff;

			.sponsor-logo {
				width: 140rpx;
				height: 140rpx;
				border-radius: 12rpx;
				background: #fff;
				margin-bottom: 20rpx;
			}

			.sp-name {
				font-size: 36rpx;
				font-weight: bold;
				margin-bottom: 10rpx;
			}

			.sp-loc {
				font-size: 24rpx;
				opacity: 0.9;
			}
		}
	}

	/* 卡片通用 */
	.card-section {
		background: #fff;
		margin: 24rpx;
		padding: 30rpx;
		border-radius: 20rpx;

		.section-title {
			font-size: 30rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
			padding-left: 16rpx;
			border-left: 8rpx solid #FF6F00;
			color: #333;
		}
	}

	/* 核心高亮数据 */
	.sponsor-highlight {
		display: flex;
		align-items: center;
		background: #fff9f0;
		padding: 30rpx;
		border-radius: 12rpx;

		.highlight-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;

			&.full-width {
				align-items: flex-start;
			}

			.label {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 8rpx;
			}

			.value {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.value.money {
				color: #FF6F00;
				font-size: 36rpx;
			}

			.value.goods {
				font-size: 30rpx;
				color: #333;
			}
		}

		.divider {
			width: 2rpx;
			height: 60rpx;
			background: #eee;
			margin: 0 20rpx;
		}
	}

	.intro-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.6;
	}

	.gallery-swiper {
		width: 100%;
		height: 360rpx;
		border-radius: 12rpx;
		overflow: hidden;

		.gallery-img {
			width: 100%;
			height: 100%;
		}
	}

	.contact-row {
		display: flex;
		align-items: center;
		gap: 20rpx;

		.contact-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background: #eee;
		}

		.contact-name {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
		}
	}
</style>