<template>
	<view class="page-container" v-if="ent">
		<!-- 1. 顶部区域：高端商务动态名片金卡 -->
		<view class="hero-section">
			<!-- 使用 CSS 变量 --theme 动态绑定用户设置的主色调 -->
			<view class="premium-card" :style="{ '--theme': ent.cardMainColor }">
				<!-- 背景图层 -->
				<image class="card-bg" :src="ent.backgroundUrl || '/static/images/default-bg.jpg'" mode="aspectFill" />
				<view class="card-overlay"></view>

				<!-- 卡片内部文字与Logo -->
				<view class="card-inner">
					<view class="card-header">
						<!-- Logo 形状随设置动态切换：0圆 1方 2圆角 -->
						<image :src="ent.logoUrl" mode="aspectFill" class="ent-logo"
							:class="'logo-style-' + ent.cardLogoStyle" />
						<view class="ent-title-area">
							<text class="ent-name">{{ ent.enterpriseName }}</text>
							<text class="ent-slogan"
								v-if="ent.cardShowSlogan === 1">{{ ent.brandSlogan || '追求卓越，创造价值' }}</text>
						</view>
					</view>

					<!-- 卡片底部标签 -->
					<view class="card-footer-info">
						<view class="quick-tags">
							<text class="q-tag">{{ ent.industryFirst }}</text>
							<text class="q-tag" v-if="ent.enterpriseType">{{ ent.enterpriseType }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 2. 主体内容区域 -->
		<view class="main-content">
			<!-- 模块：品牌介绍 -->
			<view class="content-section">
				<view class="section-header">
					<view class="title-l">品牌介绍</view>
					<view class="title-line"></view>
				</view>
				<text class="brand-bio">{{ ent.shortIntro || '暂无详细介绍' }}</text>
				<view class="core-value" v-if="ent.coreValue">
					<uni-icons type="star-filled" size="14" :color="ent.cardMainColor"></uni-icons>
					<text>核心价值：{{ ent.coreValue }}</text>
				</view>
			</view>

			<!-- 模块：联系我们 (一行一个列表布局) -->
			<view class="content-section">
				<view class="section-header">
					<view class="title-l">联系我们</view>
					<view class="title-line"></view>
				</view>
				<view class="contact-list">
					<!-- 客服电话 -->
					<view class="contact-row-item" @click="makePhoneCall(ent.customerServicePhone)">
						<view class="c-icon"><uni-icons type="phone-filled" size="20" :color="ent.cardMainColor" />
						</view>
						<view class="c-body">
							<text class="c-label">客服电话</text>
							<text class="c-val">{{ ent.customerServicePhone || '暂无' }}</text>
						</view>
						<uni-icons type="right" size="14" color="#ccc" />
					</view>
					<!-- 官方邮箱 -->
					<view class="contact-row-item" @click="copyText(ent.officialEmail, '邮箱已复制')">
						<view class="c-icon"><uni-icons type="email-filled" size="20" :color="ent.cardMainColor" />
						</view>
						<view class="c-body">
							<text class="c-label">官方邮箱</text>
							<text class="c-val">{{ ent.officialEmail || '暂无' }}</text>
						</view>
						<uni-icons type="copy" size="16" color="#ccc" />
					</view>
					<!-- 商务合作 -->
					<view class="contact-row-item" @click="copyText(ent.businessCooperation, '内容已复制')">
						<view class="c-icon"><uni-icons type="auth-filled" size="20" :color="ent.cardMainColor" />
						</view>
						<view class="c-body">
							<text class="c-label">商务合作</text>
							<text class="c-val">{{ ent.businessCooperation || '暂无' }}</text>
						</view>
						<uni-icons type="copy" size="16" color="#ccc" />
					</view>
					<!-- 企业官网 -->
					<view class="contact-row-item" v-if="ent.officialWebsite"
						@click="copyText(ent.officialWebsite, '链接已复制')">
						<view class="c-icon"><uni-icons type="paperplane-filled" size="20" :color="ent.cardMainColor" />
						</view>
						<view class="c-body">
							<text class="c-label">官方网站</text>
							<text class="c-val">{{ ent.officialWebsite }}</text>
						</view>
						<uni-icons type="link" size="16" color="#ccc" />
					</view>
				</view>
			</view>

			<!-- 模块：社交媒体 (公众号/视频号) -->
			<view class="content-section">
				<view class="section-header">
					<view class="title-l">社交媒体</view>
					<view class="title-line"></view>
				</view>
				<view class="social-matrix">
					<!-- 公众号入口 -->
					<view class="social-cell" v-if="ent.wechatMpName"
						@click="showQr(ent.wechatMpQrcode, ent.wechatMpName)">
						<view class="s-brand-icon wechat"><uni-icons type="weixin" size="30" color="#fff" /></view>
						<view class="s-info">
							<text class="s-type">官方公众号</text>
							<text class="s-name">{{ ent.wechatMpName }}</text>
						</view>
						<view class="s-action" :style="{ color: ent.cardMainColor, borderColor: ent.cardMainColor }">查看
						</view>
					</view>

					<!-- 视频号入口 -->
					<view class="social-cell" v-if="ent.videoAccount" @click="showQr(ent.videoAccountQrcode, '官方视频号')">
						<view class="s-brand-icon video"><uni-icons type="videocam-filled" size="30" color="#fff" />
						</view>
						<view class="s-info">
							<text class="s-type">官方视频号</text>
							<text class="s-name">扫码关注</text>
						</view>
						<view class="s-action" :style="{ color: ent.cardMainColor, borderColor: ent.cardMainColor }">扫码
						</view>
					</view>
				</view>
			</view>

			<!-- 模块：门店入口 (线上+线下) -->
			<view class="content-section"
				>
				<view class="section-header">
					<view class="title-l">门店入口</view>
					<view class="title-line"></view>
				</view>
				<!-- 线上平台标识 -->
				<view class="online-stores" v-if="onlineStores.length">
					<view class="store-badge" v-for="(s, i) in onlineStores" :key="i"
						@click="copyText(s.link, '链接已复制')">
						{{ s.platform }}: {{ s.name }}
					</view>
				</view>
				<!-- 线下地址及导航 -->
				<view class="offline-address" v-for="(addr, i) in offlineStores" :key="'addr'+i" @click="openMap(addr)">
					<uni-icons type="location-filled" size="18" color="#666" />
					<text class="addr-txt">{{ addr.name }} · {{ addr.address }}</text>
					<uni-icons type="right" size="14" color="#ccc" />
				</view>
			</view>

			<!-- 模块：品牌视觉资产 (视频+图库) -->
			<view class="content-section">
				<view class="section-header">
					<view class="title-l">品牌视觉</view>
					<view class="title-line"></view>
				</view>
				<!-- 视频播放 -->
				<view class="video-container" v-if="ent.videoUrl">
					<video :src="ent.videoUrl" class="brand-video" object-fit="contain"></video>
				</view>
				<!-- 九图展示 -->
				<view class="gallery-masonry" v-if="brandImageList.length">
					<image v-for="(img, i) in brandImageList" :key="i" :src="img" mode="aspectFill" class="gallery-img"
						@click="previewImage(i)" />
				</view>
			</view>
		</view>

		<!-- 3. 底部悬浮操作 Bar -->
		<view class="floating-bar">
			<view class="bar-left" @click="openSettings">
				<uni-icons type="gear" size="24" color="#666" />
				<text>定制名片</text>
			</view>
			<button class="share-btn" open-type="share" :style="{ background: ent.cardMainColor }">
				<uni-icons type="redo-filled" size="20" color="#fff" />
				<text>分享名片</text>
			</button>
		</view>

		<!-- 全局弹窗：二维码查看器 -->
		<uni-popup ref="qrPopup" type="center">
			<view class="qr-box">
				<text class="qr-title">{{ currentQrTitle }}</text>
				<image :src="currentQrUrl" mode="aspectFit" class="qr-image" :show-menu-by-longpress="true"
					@click="previewQrSingle" />
				<text class="qr-tip">保存图片或长按扫码识别</text>
				<button class="qr-close" @click="qrPopup.close()">关闭</button>
			</view>
		</uni-popup>

		<!-- 组件：名片定制设置弹窗 -->
		<CardSettings ref="settingsRef" v-model="ent" @apply="handleApplySettings" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad,
		onShareAppMessage
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import CardSettings from '@/components/CardSettings.vue';

	// --- 响应式变量 ---
	const ent = ref(null); // 企业详情数据
	const settingsRef = ref(null); // 定制设置组件引用
	const qrPopup = ref(null); // 二维码弹窗引用
	const currentQrUrl = ref(''); // 当前预览的二维码地址
	const currentQrTitle = ref(''); // 当前预览的二维码标题

	/**
	 * 页面加载：获取企业 ID 并拉取详情
	 */
	onLoad((options) => {
		if (options.id) fetchDetail(options.id);
	});

	/**
	 * [接口方法] 获取企业/品牌详细信息
	 */
	const fetchDetail = async (id) => {
		const {
			data
		} = await request('/app-api/member/user-enterprise-info/get', {
			method: 'GET',
			data: {
				id
			}
		});
		if (data) ent.value = data;
	};

	// --- 计算属性：数据解析与格式化 ---

	// 将逗号分隔的图片字符串转为数组
	const brandImageList = computed(() => ent.value?.brandImages ? ent.value.brandImages.split(',').filter(i => i) : []);

	// 解析 JSON 格式的线上门店列表
	const onlineStores = computed(() => ent.value?.onlineStores ? JSON.parse(ent.value.onlineStores) : []);

	// 解析 JSON 格式的线下门店列表
	const offlineStores = computed(() => ent.value?.offlineStores ? JSON.parse(ent.value.offlineStores) : []);

	// 解析 JSON 格式的自定义标签
	const parsedTags = computed(() => ent.value?.tags ? JSON.parse(ent.value.tags) : []);

	// --- 交互处理方法 ---

	/**
	 * [方法] 拨打电话
	 */
	const makePhoneCall = (num) => {
		if (!num) return uni.showToast({
			title: '暂无电话信息',
			icon: 'none'
		});
		uni.makePhoneCall({
			phoneNumber: num
		});
	};

	/**
	 * [方法] 通用文字/链接复制
	 */
	const copyText = (text, msg) => {
		if (!text) return;
		uni.setClipboardData({
			data: text,
			success: () => uni.showToast({
				title: msg
			})
		});
	};

	/**
	 * [方法] 打开名片定制弹窗
	 */
	const openSettings = () => settingsRef.value.open();

	/**
	 * [方法] 图片大图预览
	 */
	const previewImage = (index) => uni.previewImage({
		urls: brandImageList.value,
		current: index
	});

	/**
	 * [方法] 显示社交媒体二维码弹窗
	 * @param {String} url 二维码图片地址
	 * @param {String} title 弹窗显示的标题
	 */
	const showQr = (url, title) => {
		if (!url) return uni.showToast({
			title: '未上传二维码',
			icon: 'none'
		});
		currentQrUrl.value = url;
		currentQrTitle.value = title;
		qrPopup.value.open();
	};

	/**
	 * [方法] 在弹窗中点击二维码，开启大图预览
	 * 微信全屏预览模式下，长按 100% 弹出识别二维码选项
	 */
	const previewQrSingle = () => {
		if (!currentQrUrl.value) return;
		uni.previewImage({
			urls: [currentQrUrl.value],
			current: 0
		});
	};

	/**
	 * [方法] 调起原生地图进行线下门店导航
	 */
	const openMap = (item) => {
		if (!item.lat || !item.lng) return uni.showToast({
			title: '坐标信息缺失',
			icon: 'none'
		});
		uni.openLocation({
			latitude: Number(item.lat),
			longitude: Number(item.lng),
			name: item.name,
			address: item.address
		});
	};

	/**
	 * [方法] 处理设置组件的应用回调
	 * 将新的 UI 配置保存到后端
	 */
	const handleApplySettings = async (newConfig) => {
		uni.showLoading({
			title: '保存中'
		});
		const {
			error
		} = await request('/app-api/member/user-enterprise-info/update-card', {
			method: 'PUT',
			data: {
				id: ent.value.id,
				userId: ent.value.userId,
				...newConfig
			}
		});
		uni.hideLoading();
		if (!error) {
			// 接口成功后同步更新本地 UI
			ent.value = {
				...ent.value,
				...newConfig
			};
			uni.showToast({
				title: '设置成功'
			});
		}
	};

	/**
	 * 微信分享设置
	 */
	onShareAppMessage(() => ({
		title: `您好！这是${ent.value.enterpriseName}的官方名片`,
		path: `/packages/enterprise-card/enterprise-card?id=${ent.value.id}`,
		imageUrl: ent.value.logoUrl
	}));
</script>

<style scoped lang="scss">
	/* SCSS 变量声明 */
	$theme-color: #FF8600;
	$bg-color: #F4F6F8;

	.page-container {
		background: $bg-color;
		min-height: 100vh;
		padding-bottom: 220rpx;
	}

	/* 1. 顶部金卡 Card 样式 */
	.hero-section {
		padding: 40rpx 30rpx;
		background: #fff;
	}

	.premium-card {
		width: 100%;
		height: 440rpx;
		border-radius: 40rpx;
		overflow: hidden;
		position: relative;
		box-shadow: 0 30rpx 60rpx rgba(0, 0, 0, 0.15);

		.card-bg {
			width: 100%;
			height: 100%;
		}

		.card-overlay {
			position: absolute;
			inset: 0;
			background: linear-gradient(210deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.85) 100%);
		}

		.card-inner {
			position: absolute;
			inset: 0;
			z-index: 2;
			padding: 40rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.card-header {
				display: flex;
				align-items: center;
				gap: 24rpx;

				.ent-logo {
					width: 100rpx;
					height: 100rpx;
					background: #fff;

					&.logo-style-0 {
						border-radius: 50%;
					}

					&.logo-style-2 {
						border-radius: 20rpx;
					}
				}

				.ent-name {
					color: #fff;
					font-size: 40rpx;
					font-weight: 800;
				}

				.ent-slogan {
					color: rgba(255, 255, 255, 0.7);
					font-size: 24rpx;
					margin-top: 4rpx;
					display: block;
				}
			}
		}
	}

	.q-tag {
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		font-size: 20rpx;
		padding: 6rpx 18rpx;
		border-radius: 30rpx;
		margin-right: 12rpx;
		backdrop-filter: blur(10rpx);
	}

	/* 2. 内容卡片通用布局 */
	.main-content {
		padding: 0 24rpx;
		margin-top: -20rpx;
	}

	.content-section {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;

		.section-header {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 24rpx;

			.title-l {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}

			.title-line {
				flex: 1;
				height: 1rpx;
				background: #f0f0f0;
			}
		}
	}

	.brand-bio {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	.core-value {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #444;
		background: #F9FAFB;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	/* 联系方式：列表布局 */
	.contact-row-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f8f8f8;

		&:last-child {
			border-bottom: none;
		}

		.c-icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background: #F9FAFB;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 24rpx;
		}

		.c-body {
			flex: 1;

			.c-label {
				font-size: 20rpx;
				color: #999;
				display: block;
			}

			.c-val {
				font-size: 28rpx;
				color: #333;
				font-weight: bold;
			}
		}
	}

	/* 社交媒体矩阵布局 */
	.social-matrix {
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.social-cell {
			display: flex;
			align-items: center;
			background: #F9FAFB;
			padding: 20rpx;
			border-radius: 16rpx;

			.s-brand-icon {
				width: 80rpx;
				height: 80rpx;
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 20rpx;

				&.wechat {
					background: #07C160;
				}

				&.video {
					background: $theme-color;
				}
			}

			.s-info {
				flex: 1;

				.s-type {
					font-size: 22rpx;
					color: #999;
					display: block;
				}

				.s-name {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
			}

			.s-action {
				font-size: 24rpx;
				font-weight: bold;
				border: 2rpx solid $theme-color;
				padding: 6rpx 24rpx;
				border-radius: 30rpx;
			}
		}
	}

	/* 门店样式 */
	.store-badge {
		padding: 8rpx 20rpx;
		background: #F4F5F7;
		border-radius: 8rpx;
		font-size: 22rpx;
		color: #666;
		margin: 0 12rpx 12rpx 0;
		display: inline-block;
	}

	.offline-address {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 24rpx 0;
		border-top: 1rpx solid #f8f8f8;

		.addr-txt {
			flex: 1;
			font-size: 24rpx;
			color: #666;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	/* 媒体资产显示 */
	.video-container {
		width: 100%;
		height: 380rpx;
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		background: #000;

		.brand-video {
			width: 100%;
			height: 100%;
		}
	}

	.gallery-masonry {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10rpx;

		.gallery-img {
			width: 100%;
			height: 200rpx;
			border-radius: 12rpx;
		}
	}

	/* 底部悬浮操作 Bar */
	.floating-bar {
		position: fixed;
		bottom: 40rpx;
		left: 40rpx;
		right: 40rpx;
		height: 110rpx;
		background: #fff;
		border-radius: 60rpx;
		display: flex;
		align-items: center;
		padding: 0 10rpx 0 40rpx;
		box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
		z-index: 99;

		.bar-left {
			display: flex;
			align-items: center;
			gap: 12rpx;
			font-size: 26rpx;
			color: #666;
			margin-right: 40rpx;
		}

		.share-btn {
			flex: 1;
			height: 90rpx;
			border-radius: 50rpx;
			color: #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			font-size: 30rpx;
			font-weight: bold;
			border: none;

			&::after {
				border: none;
			}
		}
	}

	/* 二维码预览弹窗 */
	.qr-box {
		background: #fff;
		padding: 40rpx;
		border-radius: 30rpx;
		width: 520rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.qr-title {
			font-size: 34rpx;
			font-weight: bold;
			margin-bottom: 30rpx;
		}

		.qr-image {
			width: 380rpx;
			height: 380rpx;
		}

		.qr-tip {
			font-size: 24rpx;
			color: #999;
			margin: 30rpx 0;
		}

		.qr-close {
			width: 100%;
			height: 88rpx;
			background: #f5f5f5;
			color: #666;
			border-radius: 44rpx;
			font-size: 28rpx;
			border: none;

			&::after {
				border: none;
			}
		}
	}
</style>