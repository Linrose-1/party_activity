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

			<view class="sponsor-highlight-box">
				<!-- A. 现金赞助部分 (当类型为1或3时显示) -->
				<view v-if="detail.sponsorType === 1 || detail.sponsorType === 3" class="highlight-row">
					<view class="h-item">
						<text class="label">赞助总额</text>
						<text class="value money">¥{{ detail.cashAmount }}</text>
					</view>
					<view class="v-line"></view>
					<view class="h-item">
						<text class="label">人均赞助</text>
						<text class="value">¥{{ detail.perCapitalAmount }}</text>
					</view>
				</view>

				<!-- 分割线 (仅在混合模式下显示) -->
				<view v-if="detail.sponsorType === 3" class="row-divider"></view>

				<!-- B. 物品赞助部分 (当类型为2或3时显示) -->
				<view v-if="detail.sponsorType === 2 || detail.sponsorType === 3" class="highlight-goods-col">
					<text class="label mb-10">赞助物品清单</text>

					<!-- 循环展示物品列表 -->
					<view v-if="parsedGoodsList.length > 0" class="goods-list">
						<view v-for="(item, index) in parsedGoodsList" :key="index" class="goods-item-tag">
							<uni-icons type="gift-filled" size="14" color="#19be6b"
								style="margin-right: 6rpx;"></uni-icons>
							<text>{{ item }}</text>
						</view>
					</view>

					<!-- 兜底显示 -->
					<view v-else class="empty-goods">暂无详细描述</view>
				</view>
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

	// 解析物品描述 (JSON String -> Array)
	const parsedGoodsList = computed(() => {
		if (!detail.value || !detail.value.goodsDescription) return [];

		try {
			const raw = detail.value.goodsDescription;
			// 如果已经是数组，直接返回
			if (Array.isArray(raw)) return raw;

			// 尝试解析 JSON 字符串
			const parsed = JSON.parse(raw);

			// 兼容处理：如果解析出来是数组，返回数组
			if (Array.isArray(parsed)) {
				// 处理一下可能存在的对象结构 [{"name": "水"}] -> ["水"]
				return parsed.map(item => {
					if (typeof item === 'object' && item !== null) {
						return item.desc || item.name || JSON.stringify(item);
					}
					return String(item);
				});
			}

			// 如果解析出来是纯字符串，放入数组返回
			return [String(parsed)];

		} catch (e) {
			// 如果解析失败（比如只是普通字符串），直接返回数组包裹
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
	.sponsor-highlight-box {
		background: #fff9f0;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 1rpx solid #ffe4ba;
	}

	.highlight-row {
		display: flex;
		align-items: center;
		padding-bottom: 10rpx;

		.h-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;

			.label {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 6rpx;
			}

			.value {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;

				&.money {
					color: #FF6F00;
					font-size: 40rpx;
					font-family: DINAlternate-Bold, sans-serif;
					/* 如果有数字字体 */
				}
			}
		}

		.v-line {
			width: 2rpx;
			height: 50rpx;
			background: #e0e0e0;
			margin: 0 20rpx;
		}
	}

	.row-divider {
		height: 2rpx;
		background: #eee;
		/* 或者 dashed */
		margin: 20rpx 0;
		width: 100%;
	}

	.highlight-goods-col {
		display: flex;
		flex-direction: column;

		.label {
			font-size: 24rpx;
			color: #999;
			display: block;

			&.mb-10 {
				margin-bottom: 16rpx;
			}
		}

		.goods-list {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;
		}

		.goods-item-tag {
			background: #fff;
			padding: 10rpx 24rpx;
			border-radius: 30rpx;
			font-size: 28rpx;
			color: #333;
			display: flex;
			align-items: center;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
			border: 1rpx solid #e1f3d8;
			/* 淡淡的绿色边框 */
		}

		.empty-goods {
			font-size: 26rpx;
			color: #ccc;
			font-style: italic;
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