<template>
	<!-- 使用 v-if 确保在数据加载完成前不渲染内容 -->
	<view class="store-detail-page" v-if="storeDetail">

		<!-- 内容可滚动区域 -->
		<scroll-view scroll-y class="content-scroll">

			<!-- 1. 商店封面图轮播 -->
			<view class="store-cover-container">
				<swiper v-if="coverImages.length > 0" class="cover-swiper" circular indicator-dots autoplay>
					<swiper-item v-for="(img, index) in coverImages" :key="index">
						<image :src="img" class="swiper-image" mode="aspectFill"
							@click="previewImage(coverImages, index)" />
					</swiper-item>
				</swiper>

				<!-- 无图时的默认占位背景 -->
				<view v-else class="cover-placeholder"></view>

				<!-- 封面底部：店名 + 距离 -->
				<view class="cover-info-overlay">
					<view class="store-name">{{ storeDetail.storeName }}</view>
					<view class="distance" v-if="storeDetail.distance !== null">
						<uni-icons type="paperplane-filled" color="#fff" size="16"></uni-icons>
						{{ storeDetail.distance }}公里
					</view>
				</view>
			</view>

			<!-- 2. 商店基本信息：标签 + 简介 -->
			<view class="store-info">
				<view class="store-tags" v-if="storeDetail.tags && storeDetail.tags.length > 0">
					<view class="store-tag" v-for="(tag, index) in storeDetail.tags" :key="index">{{ tag }}</view>
				</view>
				<view class="store-desc">
					{{ storeDetail.storeDescription || '暂无简介' }}
				</view>
			</view>

			<!-- 3. 基本信息卡片 -->
			<view class="detail-card">
				<view class="card-title">基本信息</view>

				<!-- 地址 -->
				<view class="info-item">
					<view class="info-content">
						<view class="info-title">📌 地址</view>
						<view class="info-text">{{ storeDetail.fullAddress || '暂无地址信息' }}</view>
					</view>
				</view>

				<!-- 营业时间 -->
				<view class="info-item" v-if="formattedOperatingHours.regular.length > 0">
					<view class="info-content">
						<view class="info-title">🕒 每天营业时间</view>
						<view class="hours-item-row" v-for="(item, index) in formattedOperatingHours.regular"
							:key="index">
							<text class="hours-label">{{ item.label }}</text>
							<text class="hours-val">{{ item.time }}</text>
						</view>
						<view v-if="formattedOperatingHours.special.length > 0" class="special-section">
							<view class="special-tag">特殊日期安排</view>
							<view class="hours-item-row" v-for="(item, index) in formattedOperatingHours.special"
								:key="index">
								<text class="hours-label">{{ item.date }} ({{ item.description }})</text>
								<text class="hours-val">{{ item.status }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 电话（可点击拨打） -->
				<view class="info-item info-item-clickable" v-if="storeDetail.contactPhone" @click="callPhone">
					<view class="info-content">
						<view class="info-title">📱 电话</view>
						<view class="info-text phone-text">{{ storeDetail.contactPhone }}</view>
					</view>
					<uni-icons type="phone-filled" size="20" color="#FF6B00"></uni-icons>
				</view>

				<!-- 微信二维码 -->
				<view class="info-item" v-if="storeDetail.contactWechatQrCodeUrl">
					<view class="info-content">
						<view class="info-title">💬 微信</view>
						<image class="wechat-qr" :src="storeDetail.contactWechatQrCodeUrl" mode="aspectFit"
							@click="previewImage([storeDetail.contactWechatQrCodeUrl], 0)"></image>
					</view>
				</view>

				<!-- 人均消费 -->
				<view class="info-item" v-if="storeDetail.averageConsumptionRange">
					<view class="info-content">
						<view class="info-title">💰 人均消费</view>
						<view class="info-text">¥{{ storeDetail.averageConsumptionRange }}</view>
					</view>
				</view>

				<!-- 真实地图组件 -->
				<view class="map-preview" @click="openMap">
					<map v-if="storeDetail.latitude && storeDetail.longitude" class="real-map"
						:latitude="storeDetail.latitude" :longitude="storeDetail.longitude" :markers="mapMarkers"
						:enable-scroll="false" :show-location="false"></map>
					<view v-else class="map-placeholder">
						<uni-icons type="map-pin-ellipse" size="40" color="#ccc"></uni-icons>
					</view>
					<view class="map-overlay">点击查看地图位置</view>
				</view>
			</view>

			<!-- 4. 浏览留痕模块 -->
			<view class="viewer-module-card" v-if="storeDetail.isReadTrace === 1 && viewerTotal > 0"
				@click="goToTraceList">
				<view class="viewer-header">
					<view class="left-title">
						<view class="title-indicator"></view>
						<text class="title-txt">最近浏览</text>
						<text class="title-count">{{ viewerTotal }}</text>
					</view>
					<view class="right-more">
						<text>浏览详情</text>
						<uni-icons type="right" size="14" color="#999"></uni-icons>
					</view>
				</view>
				<view class="viewer-content">
					<view class="avatar-stack">
						<view class="avatar-item" v-for="item in viewerList" :key="item.id">
							<image
								:src="item.memberUser && item.memberUser.avatar ? item.memberUser.avatar : '/static/icon/default-avatar.png'"
								class="v-avatar" mode="aspectFill"></image>
						</view>
						<view v-if="viewerTotal > 7" class="more-dots">
							<text class="dot"></text>
							<text class="dot"></text>
							<text class="dot"></text>
						</view>
					</view>
					<view class="viewer-tips">已有 {{ viewerTotal }} 位商友进入了您的聚店</view>
				</view>
			</view>

			<!-- 5. 赞踩胶囊（内容流，随页面滚动） -->
			<view class="interaction-capsule-section">
				<view class="capsule-container">
					<view class="capsule-item capsule-like"
						:class="{ 'capsule-like-active': storeDetail.userLikeStr === 'like' }"
						@click="toggleAction('like')">
						<uni-icons :type="storeDetail.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="22"
							:color="storeDetail.userLikeStr === 'like' ? '#FF6B00' : '#666'"></uni-icons>
						<text class="capsule-count">{{ storeDetail.likesCount || 0 }}</text>
						<text class="capsule-label">好评</text>
					</view>

					<view class="capsule-divider"></view>

					<view class="capsule-item capsule-dislike"
						:class="{ 'capsule-dislike-active': storeDetail.userLikeStr === 'dislike' }"
						@click="toggleAction('dislike')">
						<uni-icons :type="storeDetail.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'"
							size="22" :color="storeDetail.userLikeStr === 'dislike' ? '#3498db' : '#666'"></uni-icons>
						<text class="capsule-count">{{ storeDetail.dislikesCount || 0 }}</text>
						<text class="capsule-label">踩踩</text>
					</view>
				</view>
			</view>

			<!-- 6. 评论预览卡片（整体可点击） -->
			<view class="comment-preview-card" @click="goToCommentPage">
				<view class="preview-header">
					<view class="left-title">
						<view class="title-indicator"></view>
						<text class="title-txt">商友评论</text>
						<text class="title-count" v-if="commentTotal > 0">{{ commentTotal }}</text>
					</view>
					<view class="right-more">
						<text>查看全部</text>
						<uni-icons type="right" size="14" color="#999"></uni-icons>
					</view>
				</view>

				<view class="preview-list" v-if="commentPreviewList.length > 0">
					<view class="preview-item" v-for="c in commentPreviewList" :key="c.id">
						<text class="p-user">
							{{ c.anonymous === 1 ? '匿名商友' : (c.memberUserBaseVO && c.memberUserBaseVO.nickname ? c.memberUserBaseVO.nickname : '商友') }}:
						</text>
						<text class="p-content">{{ c.content }}</text>
					</view>
				</view>

				<view v-else class="preview-empty">
					<uni-icons type="chatbubble" size="18" color="#ccc"></uni-icons>
					<text>暂无评论，点击发表第一条评论</text>
				</view>
			</view>

			<!-- 底部留白，防止内容被 action-bar 遮挡 -->
			<view style="height: 160rpx;"></view>

		</scroll-view>

		<!-- 底部操作栏：导航 + 电话 -->
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
		computed
	} from 'vue';
	import {
		onLoad,
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import {
		getInviteCode,
		checkLoginGuard
	} from '../../utils/user.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	// ─── 状态变量 ───
	const storeId = ref(null);
	const storeDetail = ref(null);
	const isLoading = ref(true);
	const isActionInProgress = ref(false);
	const loggedInUserId = ref(uni.getStorageSync('userId'));
	const viewerList = ref([]);
	const viewerTotal = ref(0);
	const commentPreviewList = ref([]);
	const commentTotal = ref(0);
	const pointsPopup = ref(null);

	// ─── 计算属性 ───

	/**
	 * 封面图数组
	 * 优先取 storeCoverImageUrls 数组，兼容旧的单图字段
	 */
	const coverImages = computed(() => {
		if (storeDetail.value && Array.isArray(storeDetail.value.storeCoverImageUrls)) {
			return storeDetail.value.storeCoverImageUrls;
		}
		if (storeDetail.value && storeDetail.value.storeCoverImageUrl) {
			return [storeDetail.value.storeCoverImageUrl];
		}
		return [];
	});

	/**
	 * 地图标记点，用于真实 map 组件展示店铺位置
	 */
	const mapMarkers = computed(() => {
		if (!storeDetail.value || !storeDetail.value.latitude || !storeDetail.value.longitude) return [];
		return [{
			id: 1,
			latitude: storeDetail.value.latitude,
			longitude: storeDetail.value.longitude,
			title: storeDetail.value.storeName,
			iconPath: '/static/icon/map-pin.png',
			width: 32,
			height: 32
		}];
	});

	/**
	 * 解析并格式化营业时间
	 * 只取"周一"数据作为每天时段的代表，避免重复展示周一至周日
	 */
	const formattedOperatingHours = computed(() => {
		const defaultResult = {
			regular: [],
			special: []
		};
		if (!storeDetail.value || !storeDetail.value.operatingHours) return defaultResult;

		try {
			const hoursData = JSON.parse(storeDetail.value.operatingHours);
			const businessHours = hoursData.business_hours;
			if (!businessHours || !businessHours.regular) return defaultResult;

			const dailySegments = businessHours.regular.filter(
				item => item.date === '周一' && item.is_open
			);

			const regular = dailySegments.map(s => ({
				label: s.description && s.description !== '周一' ? s.description : '营业时段',
				time: s.open + ' - ' + s.close
			}));

			const special = (businessHours.special_dates || []).map(item => ({
				date: item.date,
				description: item.description,
				status: item.is_open ? item.open + ' - ' + item.close : '休息'
			}));

			return {
				regular,
				special
			};
		} catch (error) {
			console.error('[营业时间] 解析失败:', error);
			return {
				regular: [{
					label: '营业时间',
					time: '点击联系商家确认'
				}],
				special: []
			};
		}
	});


	// ─── 生命周期 ───

	/**
	 * 页面加载：获取店铺详情、浏览记录、评论预览
	 * 修复1：storeId 判空改为判 storeId.value
	 * 修复2：getViewerList 传 storeId.value 而非 ref 对象
	 */
	onLoad(async (options) => {
		storeId.value = options.id;

		if (!storeId.value) {
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
				id: storeId.value
			}
		});

		isLoading.value = false;

		if (error) {
			console.error('[详情] 获取失败:', error);
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		storeDetail.value = data;
		console.log('[详情] 数据:', storeDetail.value);

		if (data.checkContribution === 1) {
			setTimeout(() => {
				if (pointsPopup.value) {
					pointsPopup.value.show('查看聚店详情', 10);
				}
			}, 500);
		}

		getViewerList(storeId.value);
		getCommentPreview();
	});


	// ─── 数据请求 ───

	/**
	 * 获取浏览留痕列表（仅店主可见）
	 * @param {string|number} id - 店铺 ID
	 */
	const getViewerList = async (id) => {
		const {
			data
		} = await request('/app-api/member/target-view/page', {
			method: 'GET',
			data: {
				targetId: id,
				targetType: 'store',
				pageNo: 1,
				pageSize: 7
			}
		});
		if (data) {
			viewerList.value = data.list || [];
			viewerTotal.value = data.total || 0;
		}
	};

	/**
	 * 获取评论预览（最多展示前2条）
	 */
	const getCommentPreview = async () => {
		const {
			data
		} = await request('/app-api/member/comment/select-type-target-id', {
			method: 'GET',
			data: {
				targetId: storeId.value,
				targetType: 'store'
			}
		});
		if (data && Array.isArray(data)) {
			commentTotal.value = data.length;
			commentPreviewList.value = data.slice(0, 2);
		}
	};


	/**
	 * 每次回到详情页时检查评论是否有变化
	 * 评论页发布/删除评论后会 emit 'commentChanged' 事件，触发重新拉取预览
	 */
	onShow(() => {
		// storeId 有值才说明 onLoad 已执行完毕，页面数据已就绪
		if (storeId.value) {
			getCommentPreview();
		}
	});


	// ─── 互动操作 ───

	/**
	 * 切换点赞 / 踩操作
	 * 采用乐观更新策略：先更新 UI，API 失败后回滚
	 * @param {'like'|'dislike'} clickedAction
	 */
	const toggleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		isActionInProgress.value = true;

		const originalAction = storeDetail.value.userLikeStr;
		const originalLikes = storeDetail.value.likesCount || 0;
		const originalDislikes = storeDetail.value.dislikesCount || 0;

		const apiAction = originalAction === clickedAction ? 'cancel' : clickedAction;

		if (apiAction === 'cancel') {
			storeDetail.value.userLikeStr = null;
			clickedAction === 'like' ? storeDetail.value.likesCount-- : storeDetail.value.dislikesCount--;
		} else {
			storeDetail.value.userLikeStr = clickedAction;
			if (clickedAction === 'like') {
				storeDetail.value.likesCount++;
				if (originalAction === 'dislike') storeDetail.value.dislikesCount--;
			} else {
				storeDetail.value.dislikesCount++;
				if (originalAction === 'like') storeDetail.value.likesCount--;
			}
		}

		try {
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: storeId.value,
					targetType: 'store',
					action: apiAction
				}
			});

			if (error) throw new Error(error);

			uni.$emit('storeInteractionChanged', {
				id: storeId.value,
				type: 'action',
				userLikeStr: storeDetail.value.userLikeStr,
				likesCount: storeDetail.value.likesCount,
				dislikesCount: storeDetail.value.dislikesCount
			});
		} catch (e) {
			storeDetail.value.userLikeStr = originalAction;
			storeDetail.value.likesCount = originalLikes;
			storeDetail.value.dislikesCount = originalDislikes;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};


	// ─── 页面操作 ───

	/**
	 * 打开系统地图，导航到店铺位置
	 */
	const openMap = () => {
		if (!storeDetail.value) return;
		uni.openLocation({
			latitude: storeDetail.value.latitude,
			longitude: storeDetail.value.longitude,
			name: storeDetail.value.storeName,
			address: storeDetail.value.fullAddress,
			fail: () => uni.showToast({
				title: '无法打开地图',
				icon: 'none'
			})
		});
	};

	const openNavigation = openMap;

	/**
	 * 拨打店铺电话
	 */
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
			phoneNumber,
			fail: () => uni.showToast({
				title: '拨打电话失败',
				icon: 'none'
			})
		});
	};

	/**
	 * 预览图片
	 * @param {string[]} urls - 图片 URL 数组
	 * @param {number} current - 当前预览的索引
	 */
	const previewImage = (urls, current) => {
		if (!urls || urls.length === 0) return;
		const finalUrls = Array.isArray(urls) ? urls : [urls];
		const idx = current || 0;
		uni.previewImage({
			urls: finalUrls,
			current: finalUrls[idx]
		});
	};

	/**
	 * 跳转至完整浏览留痕列表页
	 */
	const goToTraceList = () => {
		uni.navigateTo({
			url: '/packages/user-view-trace/user-view-trace?id=' + storeDetail.value.id + '&type=store'
		});
	};

	/**
	 * 跳转至评论页
	 */
	const goToCommentPage = () => {
		uni.navigateTo({
			url: '/packages/comment-page/comment-page?id=' + storeId.value + '&type=store'
		});
	};


	// ─── 分享 ───

	/** 分享给微信好友 */
	onShareAppMessage(() => {
		if (!storeDetail.value) return {};
		return {
			title: storeDetail.value.storeName + ' - 聚店推荐',
			path: '/packages/shop-detail/shop-detail?id=' + storeDetail.value.id,
			imageUrl: coverImages.value[0] || ''
		};
	});

	/** 分享到朋友圈 */
	onShareTimeline(() => {
		if (!storeDetail.value) return {};
		return {
			title: storeDetail.value.storeName + ' - 聚店推荐',
			query: 'id=' + storeDetail.value.id,
			imageUrl: coverImages.value[0] || ''
		};
	});
</script>

<style scoped>
	/* ── CSS 变量 ── */
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

	/* ── 页面容器 ── */
	.store-detail-page {
		background-color: #f8f8f8;
		color: var(--dark-text);
		font-size: 32rpx;
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* scroll 区域撑满，height:0 配合 flex:1 使内部可独立滚动 */
	.content-scroll {
		flex: 1;
		height: 0;
	}

	/* ── 封面轮播 ── */
	.store-cover-container {
		aspect-ratio: 5 / 4;
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

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.cover-info-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 2;
		padding: 40rpx 30rpx;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: #fff;
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

	/* ── 基本信息区 ── */
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

	/* ── 卡片通用 ── */
	.detail-card,
	.viewer-module-card,
	.comment-preview-card {
		background: #fff;
		margin: 0 30rpx 24rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
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

	/* ── 信息条目 ── */
	.info-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1px solid var(--border);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-item-clickable {
		cursor: pointer;
	}

	.info-item-clickable:active {
		background-color: #fafafa;
		border-radius: 8rpx;
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

	.phone-text {
		color: var(--primary);
		text-decoration: underline;
	}

	.wechat-qr {
		width: 200rpx;
		height: 200rpx;
		margin-top: 10rpx;
		border-radius: 8rpx;
		display: block;
	}

	/* ── 地图 ── */
	.map-preview {
		height: 300rpx;
		border-radius: 16rpx;
		margin-top: 30rpx;
		position: relative;
		overflow: hidden;
		background: #f7f7f7;
	}

	.real-map {
		width: 100%;
		height: 100%;
	}

	.map-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.map-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		text-align: center;
		font-size: 28rpx;
	}

	/* ── 营业时间 ── */
	.hours-item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12rpx 0;
		font-size: 28rpx;
	}

	.hours-label {
		color: #999;
		font-size: 26rpx;
	}

	.hours-val {
		color: #333;
		font-weight: bold;
		font-variant-numeric: tabular-nums;
	}

	.special-section {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 2rpx dashed #eee;
	}

	.special-tag {
		font-size: 20rpx;
		color: var(--primary);
		background: rgba(255, 107, 0, 0.08);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		display: inline-block;
		margin-bottom: 16rpx;
	}

	/* ── 浏览留痕 ── */
	.viewer-module-card {
		border: 1rpx solid #f0f0f0;
	}

	.viewer-module-card:active {
		background-color: #fafafa;
	}

	.viewer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.left-title {
		display: flex;
		align-items: center;
	}

	.title-indicator {
		width: 6rpx;
		height: 24rpx;
		background-color: var(--primary);
		border-radius: 4rpx;
		margin-right: 12rpx;
	}

	.title-txt {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
	}

	.title-count {
		font-size: 22rpx;
		color: var(--primary);
		background: rgba(255, 107, 0, 0.1);
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
		margin-left: 10rpx;
	}

	.right-more {
		display: flex;
		align-items: center;
	}

	.right-more text {
		font-size: 22rpx;
		color: #999;
		margin-right: 4rpx;
	}

	.avatar-stack {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 12rpx;
	}

	.avatar-item {
		margin-right: 12rpx;
	}

	.v-avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		border: 2rpx solid #fff;
		background-color: #f5f5f5;
	}

	.more-dots {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background-color: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dot {
		width: 4rpx;
		height: 4rpx;
		background-color: #ccc;
		border-radius: 50%;
		margin: 0 2rpx;
	}

	.viewer-tips {
		font-size: 22rpx;
		color: #bbb;
	}

	/* ── 赞踩胶囊（内容流版） ── */
	.interaction-capsule-section {
		display: flex;
		justify-content: center;
		margin: 0 30rpx 24rpx;
	}

	.capsule-container {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 60rpx;
		padding: 10rpx 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		border: 1rpx solid #f0f0f0;
		width: 100%;
		justify-content: center;
	}

	.capsule-item {
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
	}

	.capsule-item:active {
		transform: scale(0.9);
		opacity: 0.7;
	}

	.capsule-count {
		font-size: 32rpx;
		font-weight: bold;
		margin: 0 8rpx 0 12rpx;
		color: #333;
	}

	.capsule-label {
		font-size: 24rpx;
		color: #999;
	}

	.capsule-like-active .capsule-count,
	.capsule-like-active .capsule-label {
		color: #FF6B00;
	}

	.capsule-dislike-active .capsule-count,
	.capsule-dislike-active .capsule-label {
		color: #3498db;
	}

	.capsule-divider {
		width: 2rpx;
		height: 40rpx;
		background-color: #eee;
		margin: 0 30rpx;
	}

	/* ── 评论预览 ── */
	.comment-preview-card {
		border: 1rpx solid #f0f0f0;
	}

	.comment-preview-card:active {
		background-color: #fafafa;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.preview-list {
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 12rpx;
	}

	.preview-item {
		font-size: 26rpx;
		line-height: 1.6;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.preview-item:last-child {
		margin-bottom: 0;
	}

	.p-user {
		color: var(--primary);
		font-weight: bold;
		margin-right: 12rpx;
	}

	.p-content {
		color: #555;
	}

	.preview-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
		color: #bbb;
		font-size: 26rpx;
		gap: 12rpx;
	}

	/* ── 底部操作栏 ── */
	.action-bar {
		background: #fff;
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

	/* 展开写，不用 & 嵌套，兼容微信小程序 WXSS */
	.nav-btn::after {
		border: none;
	}

	.primary-btn::after {
		border: none;
	}

	.nav-btn text,
	.primary-btn text {
		margin-left: 10rpx;
	}

	.nav-btn {
		background: #fff;
		color: var(--primary);
		border: 1px solid var(--primary);
	}

	.primary-btn {
		background: var(--primary);
		color: #fff;
		border: none;
	}

	/* ── 加载状态 ── */
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