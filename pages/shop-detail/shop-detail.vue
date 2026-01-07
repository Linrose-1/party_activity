<template>
	<!-- 使用 v-if 确保在数据加载完成前不渲染内容，避免错误 -->
	<view class="store-detail-page" v-if="storeDetail">

		<!-- 内容可滚动区域 -->
		<scroll-view scroll-y class="content-scroll">
			<!-- 1. 商店封面图 -->
			<view class="store-cover-container">
				<swiper v-if="coverImages.length > 0" class="cover-swiper" circular indicator-dots autoplay>
					<swiper-item v-for="(img, index) in coverImages" :key="index">
						<image :src="img" class="swiper-image" mode="aspectFill"
							@click="previewImage(coverImages, index)" />
					</swiper-item>
				</swiper>

				<!-- 如果没有图片，可以显示一个默认的占位背景 -->
				<view v-else class="cover-placeholder">
					<!-- 覆盖层依然保留，用于显示店名 -->
					<view class="cover-overlay">
						<view class="store-name">{{ storeDetail.storeName }}</view>
					</view>
				</view>

				<view class="cover-info-overlay">
					<view class="store-name">{{ storeDetail.storeName }}</view>
					<view class="distance" v-if="storeDetail.distance !== null">
						<uni-icons type="paperplane-filled" color="#fff" size="16"></uni-icons>
						{{ storeDetail.distance }}公里
					</view>
				</view>
			</view>

			<!-- 覆盖在轮播图或占位图之上的店名和距离信息 -->
			<!-- 【注意】这部分从原来的封面图中移出来，独立放置 -->
			<!-- <view class="cover-info-overlay">
				<view class="store-name">{{ storeDetail.storeName }}</view>
				<view class="distance" v-if="storeDetail.distance !== null">
					<uni-icons type="paperplane-filled" color="#fff" size="16"></uni-icons>
					{{ storeDetail.distance }}公里
				</view>
			</view> -->

			<!-- 2. 商店基本信息 -->
			<view class="store-info">
				<view class="store-tags" v-if="storeDetail.tags && storeDetail.tags.length > 0">
					<view class="store-tag" v-for="(tag, index) in storeDetail.tags" :key="index">{{ tag }}</view>
				</view>

				<view class="store-desc">
					{{ storeDetail.storeDescription || '暂无简介' }}
				</view>
			</view>

			<!-- 3. 详情卡片 - 基本信息 -->
			<view class="detail-card">
				<view class="card-title">基本信息</view>

				<!-- 地址 -->
				<view class="info-item">
					<view class="info-content">
						<view class="info-title">📌地址</view>
						<view class="info-text">{{ storeDetail.fullAddress || '暂无地址信息' }}</view>
					</view>
				</view>

				<!-- 营业时间 (v-if 判断是否存在) -->
				<view class="info-item" v-if="formattedOperatingHours.regular.length > 0">
					<view class="info-content">
						<view class="info-title">🕒营业时间</view>
						<!-- 使用 v-for 循环渲染解析后的常规营业时间 -->
						<view class="hours-item" v-for="item in formattedOperatingHours.regular" :key="item.day">
							<view class="hours-day">{{ item.day }}</view>
							<view class="hours-time">{{ item.time }}</view>
						</view>
						<!-- 渲染特殊日期 -->
						<view v-if="formattedOperatingHours.special.length > 0" class="special-hours">
							<view class="hours-item" v-for="item in formattedOperatingHours.special" :key="item.date">
								<view class="hours-day">{{ item.date }} ({{ item.description }})</view>
								<view class="hours-time">{{ item.status }}</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 电话 -->
				<view class="info-item" v-if="storeDetail.contactPhone">
					<view class="info-content">
						<view class="info-title">📱电话</view>
						<view class="info-text">{{ storeDetail.contactPhone }}</view>
					</view>
				</view>

				<!-- 微信二维码 -->
				<view class="info-item" v-if="storeDetail.contactWechatQrCodeUrl">
					<view class="info-content">
						<view class="info-title">💬微信</view>
						<image class="wechat-qr" :src="storeDetail.contactWechatQrCodeUrl" mode="aspectFit"
							@click="previewImage(storeDetail.contactWechatQrCodeUrl)"></image>
					</view>
				</view>

				<!-- 人均消费 -->
				<view class="info-item" v-if="storeDetail.averageConsumptionRange">
					<view class="info-content">
						<view class="info-title">💰人均消费</view>
						<!-- 添加人民币符号 -->
						<view class="info-text">¥{{ storeDetail.averageConsumptionRange }}</view>
					</view>
				</view>

				<!-- 地图预览 -->
				<view class="map-preview" @click="openMap">
					<uni-icons type="map-pin-ellipse" size="40" color="#ccc"></uni-icons>
					<view class="map-overlay">点击查看地图位置</view>
				</view>
			</view>

		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<button class="nav-btn" @click="openNavigation">
				<uni-icons type="map-filled" color="#FF6B00" size="20"></uni-icons>
				<text>聚店导航</text>
			</button>
			<button class="primary-btn" @click="callPhone">
				<uni-icons type="phone-filled" color="#fff" size="20"></uni-icons>
				<text>电话预订</text>
			</button>
		</view>

		<PointsFeedbackPopup ref="pointsPopup" />

	</view>

	<!-- 加载状态 -->
	<view v-else class="loading-state">
		<uni-icons type="spinner-cycle" size="30" color="#999"></uni-icons>
		<text>加载中...</text>
	</view>

</template>

<script setup>
	import {
		ref,
		computed // 导入 computed
	} from 'vue';
	import {
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	const storeDetail = ref(null);
	const isLoading = ref(true);

	const pointsPopup = ref(null);

	const coverImages = computed(() => {
		// 直接返回后端提供的数组，如果不存在则返回空数组
		if (storeDetail.value && Array.isArray(storeDetail.value.storeCoverImageUrls)) {
			return storeDetail.value.storeCoverImageUrls;
		}
		// (可选的兼容逻辑) 如果新字段不存在，但旧的单图字段存在
		if (storeDetail.value && storeDetail.value.storeCoverImageUrl) {
			return [storeDetail.value.storeCoverImageUrl];
		}
		return [];
	});

	// --- 解析营业时间的计算属性 ---
	const formattedOperatingHours = computed(() => {
		const defaultResult = {
			regular: [],
			special: []
		};
		if (!storeDetail.value || !storeDetail.value.operatingHours) {
			return defaultResult;
		}

		try {
			// 1. 解析JSON字符串
			const hoursData = JSON.parse(storeDetail.value.operatingHours);
			const businessHours = hoursData.business_hours;

			if (!businessHours) return defaultResult;

			// 2. 定义星期映射和顺序
			const dayMap = {
				monday: '周一',
				tuesday: '周二',
				wednesday: '周三',
				thursday: '周四',
				friday: '周五',
				saturday: '周六',
				sunday: '周日',
			};
			const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

			// 3. 处理常规营业时间
			const regular = dayOrder
				.filter(day => businessHours.regular[day] && businessHours.regular[day].is_open)
				.map(day => {
					const time = businessHours.regular[day];
					return {
						day: dayMap[day],
						time: `${time.open} - ${time.close}`
					};
				});

			// 4. 处理特殊日期
			const special = (businessHours.special_dates || []).map(item => {
				return {
					date: item.date,
					description: item.description,
					status: item.is_open ? `${item.open} - ${item.close}` : '休息'
				};
			});

			return {
				regular,
				special
			};
		} catch (error) {
			console.error('解析营业时间失败:', error);
			// 如果解析失败，返回原始字符串或一个提示
			return {
				regular: [{
					day: '营业时间',
					time: storeDetail.value.operatingHours
				}],
				special: []
			};
		}
	});


	onLoad(async (options) => {
		const storeId = options.id;

		if (!storeId) {
			uni.showToast({
				title: '无效的聚店ID',
				icon: 'error'
			});
			setTimeout(() => uni.navigateBack(), 1000);
			return;
		}

		const {
			data,
			error
		} = await request('/app-api/member/store/findStore', {
			method: 'GET',
			data: {
				id: storeId
			}
		});

		isLoading.value = false;

		if (error) {
			console.error('获取聚店详情失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		storeDetail.value = data;
		console.log('聚店详情数据:', storeDetail.value);

		if (data.checkContribution === 1) {
			setTimeout(() => {
				if (pointsPopup.value) {
					pointsPopup.value.show('查看聚店详情', 10);
				}
			}, 500); // 延迟 500ms 显示
		}
	});

	const openMap = () => {
		if (!storeDetail.value) return;
		uni.openLocation({
			latitude: storeDetail.value.latitude,
			longitude: storeDetail.value.longitude,
			name: storeDetail.value.storeName,
			address: storeDetail.value.fullAddress,
			fail: (err) => {
				uni.showToast({
					title: '无法打开地图',
					icon: 'none'
				});
			}
		});
	};

	const openNavigation = openMap;

	const callPhone = () => {
		if (!storeDetail.value) return;
		const phoneNumber = storeDetail.value.contactPhone;
		if (!phoneNumber) {
			uni.showToast({
				title: '该聚店暂无联系电话',
				icon: 'none'
			});
			return;
		}
		uni.makePhoneCall({
			phoneNumber: phoneNumber,
			fail: (err) => {
				uni.showToast({
					title: '拨打电话失败',
					icon: 'none'
				});
			}
		});
	};

	const previewImage = (urls, current = 0) => {
		if (!urls || urls.length === 0) return;

		// 如果传入的是字符串，则包装成数组
		const finalUrls = Array.isArray(urls) ? urls : [urls];

		uni.previewImage({
			urls: finalUrls,
			current: Array.isArray(urls) ? urls[current] : urls // 兼容旧的单图预览
		});
	};

	// 1. 微信好友分享
	onShareAppMessage(() => {
		if (!storeDetail.value) return {};

		return {
			title: storeDetail.value.storeName + " - 聚店推荐",
			path: `/pages/shop-detail/shop-detail?id=${storeDetail.value.id}`,
			imageUrl: coverImages.value[0] || "" // 封面图（支持可选）
		};
	});

	// 2. 朋友圈分享
	onShareTimeline(() => {
		if (!storeDetail.value) return {};

		return {
			title: storeDetail.value.storeName + " - 聚店推荐",
			query: `id=${storeDetail.value.id}`,
			imageUrl: coverImages.value[0] || ""
		};
	});
</script>

<style scoped>
	/* --- [新增] 营业时间相关样式 --- */
	.hours-item {
		display: flex;
		justify-content: space-between;
		font-size: 28rpx;
		margin-bottom: 12rpx;
	}

	.hours-item:last-child {
		margin-bottom: 0;
	}

	.hours-day {
		color: var(--gray-text);
	}

	.hours-time {
		font-weight: 500;
		color: var(--dark-text);
	}

	.special-hours {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1px dashed #eee;
	}

	/* --- 以下为原有样式，保持不变 --- */
	:root {
		--primary: #FF6B00;
		--primary-light: #FF8A33;
		--primary-lightest: #fff5ec;
		--light-bg: #f8f8f8;
		--dark-text: #333;
		--gray-text: #666;
		--light-text: #999;
		--border: #eee;
	}

	.store-detail-page {
		background-color: #f8f8f8;
		color: var(--dark-text);
		font-size: 32rpx;
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content-scroll {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.store-cover-container {
		aspect-ratio: 5 / 4;
		/* ★ 设定为 5:4 固定比例 */
		width: 100%;
		position: relative;
		overflow: hidden;
		background: linear-gradient(45deg, #2c3e50, #4a6491);
	}


	.cover-swiper,
	.cover-placeholder {
		width: 100%;
		height: 100%;
	}

	.cover-info-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 2;
		/* 确保在图片之上 */
		padding: 40rpx 30rpx;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.store-cover {
		height: 480rpx;
		position: relative;
		overflow: hidden;
		background-size: cover;
		background-position: center;
	}

	.cover-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 40rpx 30rpx;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.store-name {
		font-size: 48rpx;
		font-weight: 700;
	}

	.distance {
		background: rgba(255, 255, 255, 0.2);
		padding: 12rpx 24rpx;
		border-radius: 32rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		backdrop-filter: blur(4px);
	}

	.store-info {
		padding: 40rpx 30rpx;
		background-color: #fff;
		margin-bottom: 20rpx;
	}

	.store-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 30rpx;
	}

	.store-tag {
		background: var(--primary-lightest);
		color: var(--primary);
		padding: 10rpx 24rpx;
		border-radius: 32rpx;
		font-size: 26rpx;
		font-weight: 500;
	}

	.store-desc {
		font-size: 30rpx;
		color: var(--gray-text);
		line-height: 1.7;
	}

	.detail-card {
		background: white;
		padding: 40rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.detail-card:last-of-type {
		margin-bottom: 0;
	}

	.card-title {
		font-size: 36rpx;
		font-weight: 600;
		position: relative;
		padding-left: 24rpx;
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.card-title::before {
		content: "";
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 8rpx;
		height: 32rpx;
		background: var(--primary);
		border-radius: 4rpx;
	}

	.info-item {
		display: flex;
		padding: 24rpx 0;
		border-bottom: 1px solid var(--border);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-content {
		flex: 1;
	}

	.info-title {
		font-weight: 500;
		margin-bottom: 8rpx;
		color: var(--dark-text);
		font-size: 30rpx;
	}

	.info-text {
		color: var(--gray-text);
		font-size: 28rpx;
	}

	.wechat-qr {
		width: 200rpx;
		height: 200rpx;
		margin-top: 10rpx;
		border-radius: 8rpx;
		display: block;
	}

	.map-preview {
		height: 300rpx;
		background: #f7f7f7;
		border-radius: 16rpx;
		margin-top: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.map-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		text-align: center;
		font-size: 28rpx;
	}

	.action-bar {
		background: white;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		display: flex;
		gap: 20rpx;
		border-top: 1px solid var(--border);
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	}

	.nav-btn,
	.primary-btn {
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		height: 90rpx;
		line-height: 1;
		margin: 0;
		padding: 0;
	}

	.nav-btn::after,
	.primary-btn::after {
		border: none;
	}

	.nav-btn text,
	.primary-btn text {
		margin-left: 10rpx;
	}

	.nav-btn {
		background: white;
		color: var(--primary);
		border: 1px solid var(--primary);
	}

	.primary-btn {
		background: var(--primary);
		color: white;
		border: none;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		color: #999;
		font-size: 28rpx;
	}

	.loading-state text {
		margin-top: 10rpx;
	}
</style>