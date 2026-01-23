<template>
	<view class="detail-container" v-if="ent">
		<!-- 1. 顶部视觉区 -->
		<view class="header-visual">
			<image :src="ent.backgroundUrl" mode="aspectFill" class="bg-img" v-if="ent.backgroundUrl" />
			<view class="bg-gradient" v-else></view>
			<view class="header-content">
				<image :src="ent.logoUrl" mode="aspectFill" class="main-logo" />
				<text class="ent-name">{{ ent.enterpriseName }}</text>
				<text class="ent-slogan" v-if="ent.brandSlogan">{{ ent.brandSlogan }}</text>
			</view>
		</view>

		<view class="content-body">
			<!-- 2. 基本信息模块 -->
			<view class="section-card">
				<view class="section-title" @click="toggleSection('basic')">
					<text class="t-txt">▾ 基本信息</text>
				</view>
				<view class="info-list">
					<view class="info-item">
						<text class="label">🏷️ 企业类型：</text>
						<text class="val">{{ ent.enterpriseType || '暂无数据' }}</text>
					</view>
					<view class="info-item" @click="showFullCreditCode = !showFullCreditCode">
						<text class="label">🔢 信用代码：</text>
						<text class="val">{{ maskCreditCode(ent.creditCode, showFullCreditCode) }}</text>
						<uni-icons :type="showFullCreditCode ? 'eye-slash' : 'eye'" size="16" color="#999"
							class="m-l-10"></uni-icons>
					</view>
					<view class="info-item">
						<text class="label">👤 法定代表人：</text>
						<text class="val">{{ ent.legalPerson || '暂无数据' }}</text>
					</view>
					<view class="info-item">
						<text class="label">📅 成立日期：</text>
						<text class="val">{{ formatDate(ent.establishDate) }}</text>
					</view>
					<view class="info-item" @click="makePhoneCall(ent.officePhone)">
						<text class="label">📞 办公电话：</text>
						<text class="val link">{{ ent.officePhone || '暂无数据' }}</text>
					</view>
					<view class="info-item">
						<text class="label">📧 官方邮箱：</text>
						<text class="val">{{ ent.officialEmail || '暂无数据' }}</text>
					</view>
				</view>
			</view>

			<!-- 3. 品牌介绍模块 -->
			<view class="section-card">
				<view class="section-title">
					<text class="t-txt">▾ 品牌介绍</text>
				</view>
				<view class="brand-intro">
					<text class="intro-content">{{ ent.shortIntro || '暂无简短介绍' }}</text>
					<view class="meta-row m-t-20" v-if="ent.coreValue">
						<text class="meta-label">✨ 核心价值：</text>
						<text class="meta-val">{{ ent.coreValue }}</text>
					</view>
					<view class="meta-row">
						<text class="meta-label">🏭 所属行业：</text>
						<text
							class="meta-val">{{ ent.industryFirst }}{{ ent.industrySecond ? ' > ' + ent.industrySecond : '' }}</text>
					</view>
					<view class="tag-row" v-if="parsedTags.length">
						<view class="tag-item" v-for="(tag, index) in parsedTags" :key="index">#{{ tag }}</view>
					</view>
				</view>
			</view>

			<!-- 4. 官方联系模块 -->
			<view class="section-card">
				<view class="section-title">
					<text class="t-txt">▾ 官方联系</text>
				</view>
				<view class="contact-list">
					<view class="info-item" v-if="ent.officialWebsite">
						<text class="label">🌐 官方网站：</text>
						<text class="val link">{{ ent.officialWebsite }}</text>
					</view>

					<view class="sub-group-title">【微信生态】</view>
					<view class="info-item" v-if="ent.wechatMpName">
						<view class="flex-1">
							<text class="label">📱 公众号：</text>
							<text class="val">{{ ent.wechatMpName }} (ID: {{ ent.wechatMpId }})</text>
						</view>
						<view class="qr-btn" @click="openQrPopup(ent.wechatMpQrcode, ent.wechatMpName)">查看二维码</view>
					</view>
					<view class="info-item" v-if="ent.videoAccount">
						<view class="flex-1">
							<text class="label">🎬 视频号：</text>
							<text class="val">{{ ent.videoAccount }}</text>
						</view>
						<view class="qr-btn" @click="openQrPopup(ent.videoAccountQrcode, '视频号')">查看二维码</view>
					</view>

					<view class="sub-group-title">【联系方式】</view>
					<view class="info-item" @click="makePhoneCall(ent.customerServicePhone)">
						<text class="label">📞 客服电话：</text>
						<text class="val link">{{ ent.customerServicePhone }}</text>
					</view>
					<view class="info-item">
						<text class="label">🤝 商务合作：</text>
						<text class="val">{{ ent.businessCooperation }}</text>
					</view>
					<view class="info-item">
						<text class="label">🛠️ 售后支持：</text>
						<text class="val">{{ ent.afterSaleEmail }}</text>
					</view>
				</view>
			</view>

			<!-- 5. 线上门店模块 -->
			<view class="section-card" v-if="onlineStores.length">
				<view class="section-title">
					<text class="t-txt">▾ 线上门店 ({{ onlineStores.length }}个)</text>
				</view>
				<view class="store-item" v-for="(store, index) in onlineStores" :key="index"
					v-show="index < 3 || showAllStores">
					<view class="store-icon">{{ getStoreIcon(store.platform) }}</view>
					<view class="store-info">
						<text class="s-name">{{ store.name }}</text>
						<text class="s-platform">{{ store.platform }}</text>
					</view>
					<view class="enter-btn" @click="openStoreLink(store.link)">进入店铺</view>
				</view>
				<view class="expand-btn" v-if="onlineStores.length > 3" @click="showAllStores = !showAllStores">
					{{ showAllStores ? '收起全部' : '展开全部' }}
				</view>
			</view>
			<!-- 线下门店模块 -->
			<view class="section-card" v-if="offlineStores.length">
				<view class="section-title">
					<text class="t-txt">▾ 线下门店 ({{ offlineStores.length }}个)</text>
				</view>
				<view class="offline-item" v-for="(store, index) in offlineStores" :key="'off-'+index">
					<view class="loc-icon">
						<uni-icons type="location-filled" size="24" color="#FF8600"></uni-icons>
					</view>
					<view class="store-info">
						<text class="s-name">{{ store.name }}</text>
						<text class="s-addr">{{ store.address }}</text>
					</view>
					<view class="nav-btn" @click="openMap(store)">
						<text>路线</text>
					</view>
				</view>
			</view>

			<!-- 6. 品牌展示模块 -->
			<view class="section-card">
				<view class="section-title">
					<text class="t-txt">▾ 品牌展示</text>
				</view>
				<!-- 图库 -->
				<view class="gallery-grid">
					<image v-for="(img, index) in brandImageList" :key="index" :src="img" mode="aspectFill"
						class="grid-img" @click="previewImage(index)" />
				</view>
				<view class="view-all-gallery" @click="previewImage(0)">[查看全部图片]</view>

				<!-- 宣传视频 -->
				<view class="video-section m-t-30" v-if="ent.videoUrl">
					<video :src="ent.videoUrl" class="ent-video" controls></video>
					<view class="video-title">▶ 品牌宣传视频</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="footer-action">
			<button class="card-btn" @click="goToCard">
				<uni-icons type="paperplane-filled" size="18" color="#fff"></uni-icons>
				<text>🚀 查看企业名片</text>
			</button>
		</view>

		<!-- 二维码查看弹窗 -->
		<uni-popup ref="qrPopup" type="center">
			<view class="qr-popup-box">
				<text class="qr-title">{{ currentQrTitle }}</text>
				<image :src="currentQrUrl" mode="aspectFit" class="qr-image" />
				<text class="qr-tip">微信扫码关注</text>
				<view class="qr-btns">
					<button class="q-btn save" @click="saveQrImage">保存图片</button>
					<button class="q-btn close" @click="closeQrPopup">关闭</button>
				</view>
			</view>
		</uni-popup>
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

	const ent = ref(null);
	const showFullCreditCode = ref(false);
	const showAllStores = ref(false);
	const currentQrUrl = ref('');
	const currentQrTitle = ref('');
	const qrPopup = ref(null);

	onLoad((options) => {
		if (options.id) {
			fetchEnterpriseDetail(options.id);
		}
	});

	const fetchEnterpriseDetail = async (id) => {
		uni.showLoading({
			title: '加载中'
		});
		const {
			data,
			error
		} = await request('/app-api/member/user-enterprise-info/get', {
			method: 'GET',
			data: {
				id
			}
		});
		uni.hideLoading();
		if (!error) {
			ent.value = data;
		}
	};

	// --- 数据解析 ---
	const brandImageList = computed(() => ent.value?.brandImages ? ent.value.brandImages.split(',') : []);
	const onlineStores = computed(() => ent.value?.onlineStores ? JSON.parse(ent.value.onlineStores) : []);
	const parsedTags = computed(() => ent.value?.tags ? JSON.parse(ent.value.tags) : []);

	// --- 逻辑处理 ---
	const maskCreditCode = (code, showFull) => {
		if (!code) return '';
		if (showFull) return code;
		return code.substring(0, 8) + '******' + code.substring(code.length - 4);
	};

	const formatDate = (ts) => {
		if (!ts || ts === 0) return '待完善';
		const d = new Date(ts);
		return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
	};

	const makePhoneCall = (num) => {
		if (!num) return;
		uni.makePhoneCall({
			phoneNumber: num
		});
	};

	const getStoreIcon = (platform) => {
		const map = {
			'美团': '🟡',
			'大众点评': '🔴',
			'饿了么': '🔵'
		};
		return map[platform] || '🏪';
	};

	const openQrPopup = (url, title) => {
		if (!url) return uni.showToast({
			title: '暂无二维码',
			icon: 'none'
		});
		currentQrUrl.value = url;
		currentQrTitle.value = title;
		qrPopup.value.open();
	};

	const closeQrPopup = () => qrPopup.value.close();

	const previewImage = (index) => {
		uni.previewImage({
			urls: brandImageList.value,
			current: index
		});
	};

	const openStoreLink = (link) => {
		if (!link) return;
		// 这里可以扩展识别小程序路径还是H5
		uni.setClipboardData({
			data: link,
			success: () => uni.showToast({
				title: '链接已复制，请在浏览器打开'
			})
		});
	};

	const goToCard = () => {
		uni.navigateTo({
			url: `/pages/enterprise/card?id=${ent.value.id}`
		});
	};

	const saveQrImage = () => {
		uni.downloadFile({
			url: currentQrUrl.value,
			success: (res) => {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => uni.showToast({
						title: '已保存至相册'
					})
				});
			}
		});
	};

	const offlineStores = computed(() => {
		if (!ent.value?.offlineStores) return [];
		try {
			// 接口返回的是 JSON 字符串，需要解析
			const data = typeof ent.value.offlineStores === 'string' ?
				JSON.parse(ent.value.offlineStores) : ent.value.offlineStores;
			return Array.isArray(data) ? data : [];
		} catch (e) {
			return [];
		}
	});

	/**
	 * 调起手机地图进行导航
	 * @param {Object} store - 门店对象，包含 lat, lng, name, address
	 */
	const openMap = (store) => {
		if (!store.lat || !store.lng) {
			return uni.showToast({
				title: '暂无位置坐标',
				icon: 'none'
			});
		}
		// 确保经纬度是浮点数
		uni.openLocation({
			latitude: Number(store.lat),
			longitude: Number(store.lng),
			name: store.name,
			address: store.address,
			success: () => {
				console.log('成功调起地图导航');
			},
			fail: (err) => {
				console.error('打开地图失败', err);
				uni.showToast({
					title: '无法打开地图',
					icon: 'none'
				});
			}
		});
	};
</script>

<style scoped lang="scss">
	$theme: #FF8600;

	.detail-container {
		background-color: #F7F8FA;
		min-height: 100vh;
		padding-bottom: 140rpx;
	}

	/* 顶部视觉区 */
	.header-visual {
		position: relative;
		height: 370rpx;
		background: #fff;

		.bg-img {
			width: 100%;
			height: 200rpx;
			filter: blur(4rpx);
		}

		.bg-gradient {
			width: 100%;
			height: 200rpx;
			background: linear-gradient(135deg, $theme, #FFB347);
		}

		.header-content {
			position: absolute;
			top: 120rpx;
			left: 0;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			.main-logo {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 6rpx solid #fff;
				background: #fff;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			}

			.ent-name {
				font-size: 38rpx;
				font-weight: bold;
				color: #333;
				margin-top: 16rpx;
			}

			.ent-slogan {
				font-size: 26rpx;
				color: #999;
				margin-top: 8rpx;
			}
		}
	}

	.content-body {
		padding: 20rpx 30rpx;
	}

	.section-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
	}

	.section-title {
		border-bottom: 1rpx solid #F5F5F5;
		padding-bottom: 20rpx;
		margin-bottom: 24rpx;

		.t-txt {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.info-item {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		margin-bottom: 20rpx;

		.label {
			color: #666;
			white-space: nowrap;
		}

		.val {
			color: #333;
			flex: 1;
		}

		.val.link {
			color: $theme;
			text-decoration: underline;
		}
	}

	.brand-intro {
		.intro-content {
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
			display: block;
		}

		.meta-row {
			font-size: 26rpx;
			margin-bottom: 10rpx;
		}

		.meta-label {
			color: #999;
		}

		.meta-val {
			color: #333;
		}

		.tag-row {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
			margin-top: 20rpx;
		}

		.tag-item {
			background: #FFF5EE;
			color: $theme;
			font-size: 22rpx;
			padding: 4rpx 16rpx;
			border-radius: 8rpx;
		}
	}

	.sub-group-title {
		font-size: 24rpx;
		font-weight: bold;
		color: #999;
		margin: 30rpx 0 20rpx;
		background: #F8F8F8;
		padding: 4rpx 16rpx;
		border-radius: 4rpx;
	}

	.qr-btn {
		font-size: 22rpx;
		color: $theme;
		border: 1rpx solid $theme;
		padding: 4rpx 16rpx;
		border-radius: 30rpx;
	}

	/* 线上门店 */
	.store-item {
		display: flex;
		align-items: center;
		background: #FAFAFA;
		padding: 20rpx;
		border-radius: 16rpx;
		margin-bottom: 16rpx;

		.store-icon {
			font-size: 40rpx;
			margin-right: 20rpx;
		}

		.store-info {
			flex: 1;

			.s-name {
				font-size: 28rpx;
				font-weight: bold;
				display: block;
			}

			.s-platform {
				font-size: 22rpx;
				color: #999;
			}
		}

		.enter-btn {
			background: $theme;
			color: #fff;
			font-size: 24rpx;
			padding: 10rpx 24rpx;
			border-radius: 40rpx;
		}
	}

	.expand-btn {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin-top: 10rpx;
	}

	/* 线下门店样式 */
	.offline-item {
		display: flex;
		align-items: center;
		background: #FAFAFA;
		padding: 24rpx;
		border-radius: 16rpx;
		margin-bottom: 16rpx;
		border: 1rpx solid #F0F0F0;

		.loc-icon {
			margin-right: 20rpx;
		}

		.store-info {
			flex: 1;
			min-width: 0;

			.s-name {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				display: block;
				margin-bottom: 6rpx;
			}

			.s-addr {
				font-size: 24rpx;
				color: #999;
				line-height: 1.4;
				display: block;
				/* 超过一行显示省略号 */
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.nav-btn {
			margin-left: 20rpx;
			background: #fff;
			border: 1rpx solid $theme;
			color: $theme;
			font-size: 22rpx;
			padding: 8rpx 20rpx;
			border-radius: 30rpx;

			&:active {
				background-color: $theme;
				color: #fff;
			}
		}
	}

	/* 品牌展示 */
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10rpx;

		.grid-img {
			width: 100%;
			height: 180rpx;
			border-radius: 8rpx;
		}
	}

	.view-all-gallery {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin-top: 20rpx;
	}

	.video-section {
		.ent-video {
			width: 100%;
			height: 380rpx;
			border-radius: 16rpx;
		}

		.video-title {
			font-size: 24rpx;
			color: #666;
			margin-top: 10rpx;
			text-align: center;
		}
	}

	/* 底部操作 */
	.footer-action {
		position: fixed;
		bottom: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx 40rpx 40rpx;
		box-sizing: border-box;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

		.card-btn {
			background: $theme;
			color: #fff;
			border-radius: 50rpx;
			height: 90rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			gap: 10rpx;
		}
	}

	/* 二维码弹窗 */
	.qr-popup-box {
		background: #fff;
		width: 500rpx;
		padding: 40rpx;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.qr-title {
			font-size: 32rpx;
			font-weight: bold;
			margin-bottom: 30rpx;
		}

		.qr-image {
			width: 360rpx;
			height: 360rpx;
			margin-bottom: 20rpx;
		}

		.qr-tip {
			font-size: 24rpx;
			color: #999;
			margin-bottom: 40rpx;
		}

		.qr-btns {
			width: 100%;
			display: flex;
			gap: 20rpx;

			.q-btn {
				flex: 1;
				font-size: 26rpx;
				border-radius: 40rpx;
			}

			.save {
				background: $theme;
				color: #fff;
			}

			.close {
				background: #f5f5f5;
				color: #666;
			}
		}
	}

	.m-t-20 {
		margin-top: 20rpx;
	}

	.m-t-30 {
		margin-top: 30rpx;
	}

	.m-l-10 {
		margin-left: 10rpx;
	}

	.flex-1 {
		flex: 1;
	}
</style>