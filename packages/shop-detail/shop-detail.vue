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
				<!-- 营业时间模块 -->
				<!-- 营业时间模块 -->
				<view class="info-item" v-if="formattedOperatingHours.regular.length > 0">
					<view class="info-content">
						<view class="info-title">🕒 每天营业时间</view>

						<!-- 循环显示用户定义的每一个时段 -->
						<view class="hours-item-row" v-for="(item, index) in formattedOperatingHours.regular"
							:key="index">
							<text class="hours-label">{{ item.label }}</text>
							<text class="hours-val">{{ item.time }}</text>
						</view>

						<!-- 特殊日期安排 -->
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

			<!-- ==================== 浏览留痕模块 ==================== -->
			<view class="viewer-module-card" v-if="storeDetail && storeDetail.isReadTrace === 1 && viewerTotal > 0">
				<view class="viewer-header" @click="goToTraceList">
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

				<view class="viewer-content" @click="goToTraceList">
					<view class="avatar-stack">
						<view class="avatar-item" v-for="(item, index) in viewerList" :key="item.id">
							<image :src="item.memberUser?.avatar || '/static/icon/default-avatar.png'" class="v-avatar"
								mode="aspectFill"></image>
						</view>
						<view v-if="viewerTotal > 7" class="more-dots">
							<text class="dot"></text>
							<text class="dot"></text>
							<text class="dot"></text>
						</view>
					</view>
					<view class="viewer-tips">
						已有 {{ viewerTotal }} 位商友进入了您的聚店
					</view>
				</view>
			</view>

			<!-- 评论预览模块 -->
			<view class="comment-preview-card">
				<view class="preview-header" @click="goToCommentPage">
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

				<!-- 简单评论列表 (展示最新2条) -->
				<view class="preview-list" v-if="commentPreviewList.length > 0" @click="goToCommentPage">
					<view class="preview-item" v-for="c in commentPreviewList" :key="c.id">
						<text
							class="p-user">{{ c.anonymous === 1 ? '匿名商友' : (c.memberUserBaseVO?.nickname || '商友') }}:</text>
						<text class="p-content">{{ c.content }}</text>
					</view>
				</view>

				<!-- 无评论时的占位 -->
				<view v-else class="preview-empty" @click="goToCommentPage">
					<uni-icons type="chatbubble" size="18" color="#ccc"></uni-icons>
					<text>暂无评论，点击发表第一条评论</text>
				</view>
			</view>

		</scroll-view>

		<!-- 聚店赞踩互动胶囊 (同步聚会版 UI) -->
		<view class="interaction-capsule-section">
			<view class="capsule-container">
				<view class="capsule-item like" :class="{ active: storeDetail.userLikeStr === 'like' }"
					@click="toggleAction('like')">
					<uni-icons :type="storeDetail.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="22"
						:color="storeDetail.userLikeStr === 'like' ? '#FF6B00' : '#666'"></uni-icons>
					<text class="count">{{ storeDetail.likesCount || 0 }}</text>
					<text class="label">好评</text>
				</view>

				<view class="capsule-divider"></view>

				<view class="capsule-item dislike" :class="{ active: storeDetail.userLikeStr === 'dislike' }"
					@click="toggleAction('dislike')">
					<uni-icons :type="storeDetail.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'"
						size="22" :color="storeDetail.userLikeStr === 'dislike' ? '#3498db' : '#666'"></uni-icons>
					<text class="count">{{ storeDetail.dislikesCount || 0 }}</text>
					<text class="label">踩踩</text>
				</view>
			</view>
		</view>

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
	import {
		getInviteCode,
		checkLoginGuard
	} from '../../utils/user.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	const storeId = ref(null);

	const loggedInUserId = ref(uni.getStorageSync('userId'));
	const viewerList = ref([]);
	const viewerTotal = ref(0);

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
	/**
	 * [计算属性] 解析并格式化营业时间
	 * 逻辑：提取用户在编辑页设置的“每天”时段，不重复展示周一至周日
	 */
	const formattedOperatingHours = computed(() => {
		const defaultResult = {
			regular: [],
			special: []
		};
		if (!storeDetail.value || !storeDetail.value.operatingHours) {
			return defaultResult;
		}

		try {
			// 1. 解析后端返回的 JSON 字符串
			const hoursData = JSON.parse(storeDetail.value.operatingHours);
			const businessHours = hoursData.business_hours;
			if (!businessHours || !businessHours.regular) return defaultResult;

			// 2. 【核心优化】：提取“每天”的营业时段
			// 因为编辑页是将同一套时段赋给了周一到周日，所以我们只需要抓取“周一”的时段作为代表
			const dailySegments = businessHours.regular.filter(item => item.date === '周一' && item.is_open);

			const regular = dailySegments.map(s => {
				return {
					// 如果用户填了描述（如“上午”），就显示描述，没填则不显示
					label: s.description && s.description !== '周一' ? s.description : '营业时段',
					time: `${s.open} - ${s.close}`
				};
			});

			// 3. 处理特殊日期安排 (保持原样)
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
			return {
				regular: [{
					label: '营业时间',
					time: '点击联系商家确认'
				}],
				special: []
			};
		}
	});


	onLoad(async (options) => {
		storeId.value = options.id;

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
				id: storeId.value
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

		getViewerList(storeId);

		getCommentPreview();
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

	// [方法] 获取浏览记录
	const getViewerList = async (storeId) => {
		// 只有本人创建的店，后端接口才会返回数据
		const {
			data
		} = await request('/app-api/member/target-view/page', {
			method: 'GET',
			data: {
				targetId: storeId,
				targetType: 'store', // 【关键】设置为 store
				pageNo: 1,
				pageSize: 7
			}
		});

		if (data) {
			viewerList.value = data.list || [];
			viewerTotal.value = data.total || 0;
		}
	};

	// [方法] 跳转至完整留痕列表页
	const goToTraceList = () => {
		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${storeDetail.value.id}&type=store`
		});
	};

	const commentPreviewList = ref([]);
	const commentTotal = ref(0);

	const getCommentPreview = async () => {
		const {
			data
		} = await request('/app-api/member/comment/select-type-target-id', {
			method: 'GET',
			data: {
				targetId: storeId.value, // 或者是 storeId
				targetType: 'store' // 或者是 'store'
			}
		});
		if (data && Array.isArray(data)) {
			commentTotal.value = data.length;
			// 只取前2条做预览
			commentPreviewList.value = data.slice(0, 2);
		}
	};

	const goToCommentPage = () => {
		uni.navigateTo({
			url: `/packages/comment-page/comment-page?id=${storeId.value}&type=store`
		});
	};

	// 1. 微信好友分享
	onShareAppMessage(() => {
		if (!storeDetail.value) return {};

		return {
			title: storeDetail.value.storeName + " - 聚店推荐",
			path: `/packages/shop-detail/shop-detail?id=${storeDetail.value.id}`,
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


	const isActionInProgress = ref(false);
	
	const toggleAction = async (clickedAction) => {
		// 1. 登录校验
		if (!await checkLoginGuard()) return;
		
		// 2. 防止连续点击
		if (isActionInProgress.value) return;
		isActionInProgress.value = true;
	
		// 3. 备份原始数据，用于请求失败时回滚
		const originalAction = storeDetail.value.userLikeStr;
		const originalLikes = storeDetail.value.likesCount || 0;
		const originalDislikes = storeDetail.value.dislikesCount || 0;
	
		// 4. 确定要发送给后端的动作 (相同则取消，不同则切换)
		const apiAction = originalAction === clickedAction ? 'cancel' : clickedAction;
	
		// 5. 【乐观更新】立即改变 UI 状态
		if (apiAction === 'cancel') {
			storeDetail.value.userLikeStr = null;
			clickedAction === 'like' ? storeDetail.value.likesCount-- : storeDetail.value.dislikesCount--;
		} else {
			storeDetail.value.userLikeStr = clickedAction;
			if (clickedAction === 'like') {
				storeDetail.value.likesCount++;
				// 如果之前是踩的状态，现在改赞，踩的数量要-1
				if (originalAction === 'dislike') storeDetail.value.dislikesCount--;
			} else {
				storeDetail.value.dislikesCount++;
				// 如果之前是赞的状态，现在改踩，赞的数量要-1
				if (originalAction === 'like') storeDetail.value.likesCount--;
			}
		}
	
		try {
			// 6. 发起后端请求
			const { error } = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: storeId.value,
					targetType: 'store', // 聚店业务标识
					action: apiAction
				}
			});
	
			if (!error) {
				// 7. 【关键】同步通知列表页更新内存数据，不刷新整页
				uni.$emit('storeInteractionChanged', {
					id: storeId.value,
					type: 'action',
					userLikeStr: storeDetail.value.userLikeStr,
					likesCount: storeDetail.value.likesCount,
					dislikesCount: storeDetail.value.dislikesCount
				});
			} else {
				throw new Error(error);
			}
		} catch (e) {
			// 8. 失败回滚：恢复到点击前的状态
			storeDetail.value.userLikeStr = originalAction;
			storeDetail.value.likesCount = originalLikes;
			storeDetail.value.dislikesCount = originalDislikes;
			uni.showToast({ title: '操作失败，请重试', icon: 'none' });
		} finally {
			isActionInProgress.value = false;
		}
	};
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
		margin-bottom: 20rpx;
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

	.detail-card,
	.viewer-module-card,
	.comment-preview-card {
		background: white;
		margin: 24rpx 30rpx;
		/* 确保所有卡片外边距一致 */
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
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

	/* 浏览留痕模块样式 */
	.viewer-module-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		margin-top: 30rpx;
		padding: 24rpx;
		border: 1rpx solid #f0f0f0;
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
		background-color: #FF6B00;
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
		color: #FF6B00;
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

	.viewer-module-card:active {
		background-color: #fafafa;
	}

	.comment-preview-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;
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
		/* 超过2行省略 */
		overflow: hidden;
	}

	.preview-item:last-child {
		margin-bottom: 0;
	}

	.p-user {
		color: #FF6B00;
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

	/* 聚会详情赞踩互动区样式 */
	.interaction-capsule-section {
		display: flex;
		justify-content: center;
		margin: 40rpx 30rpx 10rpx;
	}

	.capsule-container {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border-radius: 60rpx;
		padding: 10rpx 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		border: 1rpx solid #f0f0f0;
	}

	.capsule-item {
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
		transition: all 0.2s ease;
	}

	.capsule-item .count {
		font-size: 32rpx;
		font-weight: bold;
		margin: 0 8rpx 0 12rpx;
		color: #333;
	}

	.capsule-item .label {
		font-size: 24rpx;
		color: #999;
	}

	/* 激活状态 */
	.capsule-item.like.active .count,
	.capsule-item.like.active .label {
		color: #FF6B00;
	}

	.capsule-item.dislike.active .count,
	.capsule-item.dislike.active .label {
		color: #3498db;
	}

	.capsule-divider {
		width: 2rpx;
		height: 40rpx;
		background-color: #eee;
		margin: 0 30rpx;
	}

	.capsule-item:active {
		transform: scale(0.9);
		opacity: 0.7;
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

	/* 营业时间列表优化 */
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
		/* 让数字等宽对齐 */
	}

	.special-section {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 2rpx dashed #eee;
	}

	.special-tag {
		font-size: 20rpx;
		color: #FF6B00;
		background: rgba(255, 107, 0, 0.08);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		display: inline-block;
		margin-bottom: 16rpx;
	}

	.detail-interactions {
		display: flex;
		justify-content: space-around;
		align-items: center;
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 0 30rpx 30rpx;
		padding: 24rpx 0;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;
	}

	.interaction-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
		color: #666;
		font-size: 28rpx;
		padding: 10rpx 30rpx;
		border-radius: 40rpx;
		transition: all 0.2s;
	}

	.interaction-item text {
		font-weight: 500;
	}

	.interaction-item:active {
		background-color: #f5f5f5;
	}

	/* 激活状态下的微调 */
	.interaction-item.active text {
		color: inherit;
		/* 颜色由图标决定，或者此处指定特定颜色 */
	}
</style>