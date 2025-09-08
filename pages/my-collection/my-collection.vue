<template>
	<view class="my-favorites-app">

		<!-- 分段器 -->
		<view class="segmented-container">
			<uni-segmented-control :current="currentTab" :values="tabs" @clickItem="switchTab" style-type="button"
				active-color="#FF6B00" />
		</view>

		<!-- 收藏的聚会 -->
		<scroll-view v-show="currentTab === 0" scroll-y class="content-scroll" refresher-enabled
			:refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
			<view class="section-header">
				<text class="section-title">⭐ 收藏的聚会</text>
			</view>

			<view v-if="favoriteActivities.length > 0" class="activity-list">
				<!-- 注意: item.id 是关注记录的ID, item.activityRespVO.id 才是聚会的ID -->
				<view v-for="item in favoriteActivities" :key="item.id" class="activity-item"
					@click="skipActivityDetail(item.activityRespVO.id)">
					<!-- 数据绑定到 item.activityRespVO -->
					<image class="activity-image" :src="item.activityRespVO.coverImageUrl" mode="aspectFill" />

					<view class="activity-content">
						<view class="activity-header">
							<text class="activity-title">{{ item.activityRespVO.activityTitle }}</text>
						</view>

						<view class="activity-info">
							<uni-icons type="calendar" size="16" color="#999" />
							<text class="info-text">{{ formatTimestamp(item.activityRespVO.startDatetime) }}</text>
						</view>

						<view class="activity-info">
							<uni-icons type="map-pin" size="16" color="#999" />
							<text class="info-text">{{ item.activityRespVO.locationAddress }}</text>
						</view>

						<view class="activity-footer">
							<view class="organizer">
								<uni-icons type="person" size="16" color="#999" />
								<text>{{ item.activityRespVO.organizerUnitName }}</text>
							</view>
							<view class="action-buttons">
								<!-- 取消收藏时传入关注记录的id -->
								<button class="btn btn-cancel" @click.stop="removeFavorite(item.id, 'activity')">
									取消收藏
								</button>
								<button class="btn btn-detail" @click.stop="skipActivityDetail(item.activityRespVO.id)">
									查看详情
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more v-if="favoriteActivities.length > 0" :status="activityLoadingStatus" />

			<view v-if="activityLoadingStatus === 'noMore' && favoriteActivities.length === 0"
				class="empty-state-container">
				<empty-state title="暂无收藏聚会" description="快去发现并收藏感兴趣的聚会吧">
					<button class="primary-btn" @click="navigateToDiscoverActivities">去发现聚会</button>
				</empty-state>
			</view>

		</scroll-view>

		<!-- 收藏的商机 -->
		<scroll-view v-show="currentTab === 1" scroll-y class="content-scroll" refresher-enabled
			:refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
			<view class="section-header">
				<text class="section-title">?? 收藏的商机</text>
			</view>

			<view v-if="favoriteOpportunities.length > 0" class="post-list">
				<!-- 注意: item.id 是关注记录的ID, item.postRespVO.id 才是商机的ID -->
				<div v-for="item in favoriteOpportunities" :key="item.id" class="post-card"
					@click="skipCommercialDetail(item.postRespVO.id)">
					<!-- 数据绑定到 item.postRespVO -->
					<div class="post-header">
						<div class="user-info">
							<!-- <div class="avatar" @click.stop="skipApplicationBusinessCard">
								{{ item.postRespVO.memberUser.avatar }}
							</div> -->
							<image :src="item.postRespVO.memberUser.avatar" mode="" class="avatar"
								@click.stop="skipApplicationBusinessCard"></image>
							<div class="user-details-wrapper">
								<div class="user-name">{{ item.postRespVO.memberUser.nickname }}</div>
								<div class="post-time">
									<uni-icons type="redo" size="14" color="#888"></uni-icons>
									{{ formatTimestamp(item.postRespVO.createTime) }}
								</div>
							</div>
						</div>
						<!-- 取消收藏时传入关注记录的id -->
						<div class="delete-action" @click.stop="removeFavorite(item.id, 'post')">
							<uni-icons type="trash-fill" size="20" color="#FF6A00"></uni-icons>
							<text>取消收藏</text>
						</div>
					</div>

					<div class="post-content">
						{{ item.postRespVO.postContent }}
					</div>

					<view class="post-images" v-if="item.postRespVO.postImg && item.postRespVO.postImg.length"
						:class="['images-count-' + item.postRespVO.postImg.split(',').length]">
						<view v-for="(image, imgIndex) in item.postRespVO.postImg.split(',')" :key="imgIndex"
							class="image-wrapper"
							@click.stop="previewImage(item.postRespVO.postImg.split(','), imgIndex)">
							<!-- 核心改动：使用 image 标签并动态绑定 mode -->
							<image :src="image" class="post-image"
								:mode="item.postRespVO.postImg.split(',').length === 1 ? 'widthFix' : 'aspectFill'" />
						</view>
					</view>

					<div class="tags" v-if="item.postRespVO.tags && item.postRespVO.tags.length">
						<div v-for="(tag, tagIndex) in item.postRespVO.tags" :key="tagIndex" class="tag">
							{{ tag }}
						</div>
					</div>

					<div class="feedback-stats">
						<div class="like-count">
							<uni-icons type="hand-up-filled" size="18" color="#e74c3c"></uni-icons>
							<span>{{ item.postRespVO.likesCount }}</span>
						</div>
						<div class="dislike-count">
							<uni-icons type="hand-down-filled" size="18" color="#3498db"></uni-icons>
							<span>{{ item.postRespVO.dislikesCount }}</span>
						</div>
					</div>
				</div>
			</view>

			<!-- 加载状态 -->
			<uni-load-more v-if="favoriteOpportunities.length > 0" :status="opportunityLoadingStatus" />

			<view v-if="opportunityLoadingStatus === 'noMore' && favoriteOpportunities.length === 0"
				class="empty-state-container">
				<empty-state title="暂无收藏商机" description="快去发现并收藏感兴趣的商机吧">
					<button class="primary-btn" @click="navigateToDiscoverOpportunities">去发现商机</button>
				</empty-state>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	// --- 状态管理 ---
	const currentTab = ref(0);
	const tabs = ref(['收藏的聚会', '收藏的商机']);
	const refreshing = ref(false);
	const pageSize = 10;
	const userId = ref(null);

	// 聚会收藏的状态
	const favoriteActivities = ref([]);
	const activityPageNo = ref(1);
	const activityLoadingStatus = ref('more');

	// 商机收藏的状态
	const favoriteOpportunities = ref([]);
	const opportunityPageNo = ref(1);
	const opportunityLoadingStatus = ref('more');


	// --- 生命周期函数 ---
	onLoad(() => {
		userId.value = uni.getStorageSync('userId');
		if (!userId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none',
				duration: 2000,
			});
			return;
		}
		getFavorites(true);
	});

	// --- 核心方法 ---
	const getFavorites = async (isRefresh = false) => {
		const isActivityTab = currentTab.value === 0;
		const currentStatus = isActivityTab ? activityLoadingStatus.value : opportunityLoadingStatus.value;

		if (currentStatus === 'loading' || (currentStatus === 'noMore' && !isRefresh)) {
			if (isRefresh) refreshing.value = false;
			return;
		}

		if (isRefresh) {
			if (isActivityTab) {
				activityPageNo.value = 1;
				favoriteActivities.value = [];
				activityLoadingStatus.value = 'more';
			} else {
				opportunityPageNo.value = 1;
				favoriteOpportunities.value = [];
				opportunityLoadingStatus.value = 'more';
			}
		}

		if (isActivityTab) {
			activityLoadingStatus.value = 'loading';
		} else {
			opportunityLoadingStatus.value = 'loading';
		}

		const params = {
			pageNo: isActivityTab ? activityPageNo.value : opportunityPageNo.value,
			pageSize: pageSize,
			userId: userId.value,
			targetType: isActivityTab ? 'activity' : 'post'
		};

		try {
			const result = await request('/app-api/member/follow/page', {
				method: 'GET',
				data: params
			});

			console.log(`获取收藏的${isActivityTab ? '聚会' : '商机'}:`, result);

			if (result && !result.error && result.data) {
				const rawList = result.data.list || [];

				if (isActivityTab) {
					const filteredList = rawList.filter(item => item.activityRespVO && typeof item
						.activityRespVO === 'object');

					favoriteActivities.value.push(...filteredList);
					activityPageNo.value++;
					activityLoadingStatus.value = rawList.length < pageSize ? 'noMore' : 'more';

				} else {
					// ================================================================
					// 【最终核心修改】对商机数据进行深度过滤和清洗
					// ================================================================
					const filteredList = rawList
						.filter(item => item.postRespVO && typeof item.postRespVO ===
							'object') // 1. 过滤掉 postRespVO 为 null 的项
						.map(item => {
							// 2. 对每一项进行数据清洗，提供默认值
							const post = item.postRespVO;

							// 确保 contactPerson 是一个非空字符串
							post.contactPerson = post.contactPerson || '匿名';

							// 确保 postContent 是一个字符串
							post.postContent = post.postContent || '暂无内容';

							// 确保 postImg 是一个字符串，以便 .split() 安全调用
							post.postImg = post.postImg || '';

							// 确保 tags 是一个数组
							post.tags = post.tags || [];

							// 确保数值存在
							post.likesCount = post.likesCount || 0;
							post.dislikesCount = post.dislikesCount || 0;

							return item;
						});

					favoriteOpportunities.value.push(...filteredList);
					opportunityPageNo.value++;
					opportunityLoadingStatus.value = rawList.length < pageSize ? 'noMore' : 'more';
				}
			} else {
				if (isActivityTab) activityLoadingStatus.value = 'noMore';
				else opportunityLoadingStatus.value = 'noMore';
				uni.showToast({
					title: result.error || '加载失败',
					icon: 'none'
				});
			}
		} catch (error) {
			if (isActivityTab) activityLoadingStatus.value = 'noMore';
			else opportunityLoadingStatus.value = 'noMore';
			uni.showToast({
				title: '网络请求异常',
				icon: 'none'
			});
		} finally {
			if (isRefresh) {
				refreshing.value = false;
			}
		}
	};

	const removeFavorite = async (followId, type) => {
		uni.showModal({
			title: '取消收藏',
			content: `确定要取消收藏此${type === 'activity' ? '聚会' : '商机'}吗？`,
			success: async (res) => {
				if (res.confirm) {
					const payload = {
						targetId: followId,
						userId: userId.value,
						targetType: type // 'type' 参数的值就是 'activity' 或 'post'
					};

					const {
						error
					} = await request('/app-api/member/follow/del', {
						method: 'POST',
						data: payload // 使用新的请求体
					});

					if (!error) {
						uni.showToast({
							title: '已取消收藏',
							icon: 'success'
						});
						if (type === 'activity') {
							const index = favoriteActivities.value.findIndex(item => item.id ===
								followId);
							if (index !== -1) favoriteActivities.value.splice(index, 1);
						} else {
							const index = favoriteOpportunities.value.findIndex(item => item.id ===
								followId);
							if (index !== -1) favoriteOpportunities.value.splice(index, 1);
						}
					} else {
						uni.showToast({
							title: error || '操作失败',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	// --- 事件处理 ---
	const switchTab = (e) => {
		if (currentTab.value === e.currentIndex) return;
		currentTab.value = e.currentIndex;
		const isActivityTab = currentTab.value === 0;
		const shouldLoad = isActivityTab ? favoriteActivities.value.length === 0 : favoriteOpportunities.value
			.length === 0;
		if (shouldLoad) {
			getFavorites(true);
		}
	};

	const onRefresh = () => {
		refreshing.value = true;
		getFavorites(true);
	};

	const loadMore = () => {
		getFavorites(false);
	};

	// --- 辅助与导航 ---
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '时间待定';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	}
	const previewImage = (urls, current) => uni.previewImage({
		urls,
		current
	});
	const skipActivityDetail = (id) => uni.navigateTo({
		url: `/pages/active-detail/active-detail?id=${id}`
	});
	const navigateToDiscoverActivities = () => uni.switchTab({
		url: '/pages/active/active'
	});
	const skipCommercialDetail = (id) => uni.navigateTo({
		url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}`
	});
	const navigateToDiscoverOpportunities = () => uni.switchTab({
		url: '/pages/home/home'
	});
	const skipApplicationBusinessCard = () => uni.navigateTo({
		url: '/pages/applicationBusinessCard/applicationBusinessCard'
	});
</script>

<style lang="scss" scoped>
	/* 样式部分保持不变，因为结构和类名没有改变 */
	.my-favorites-app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f7fa;
		max-width: 750rpx;
		/* 限制内容最大宽度 */
		margin: 0 auto;
		/* 居中显示 */
	}

	/* 分段器容器 */
	.segmented-container {
		padding: 20rpx 24rpx;
		background-color: #fff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	/* 滚动内容区 */
	.content-scroll {
		flex: 1;
		height: 1px;
		/* 修复scroll-view高度问题 */
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	/* 区域标题 */
	.section-header {
		display: flex;
		align-items: center;
		padding: 24rpx 0;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			margin-left: 12rpx;
			/* 图标前的空间 */
			color: #1c1e21;
		}
	}

	/* 聚会列表项 - 复用“我的聚会”页面样式 */
	.activity-list {
		margin-bottom: 40rpx;
	}

	.activity-item {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

		&:active {
			opacity: 0.9;
		}
	}

	.activity-image {
		width: 100%;
		height: 300rpx;
	}

	.activity-content {
		padding: 24rpx;
	}

	.activity-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.activity-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1c1e21;
		flex: 1;
		margin-right: 20rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		word-break: break-all;
	}

	.activity-info {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		font-size: 26rpx;
		color: #666;

		.info-text {
			margin-left: 8rpx;
		}
	}

	.activity-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #f0f2f5;
	}

	.organizer {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #999;

		text {
			margin-left: 8rpx;
		}
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.btn {
		padding: 0 24rpx;
		height: 56rpx;
		line-height: 56rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		font-weight: 500;
		border: none;
		-webkit-appearance: none;
		background-color: transparent;
	}

	.btn::after {
		border: none;
	}

	.btn-detail {
		background-color: #f0f2f5;
		color: #606770;
	}

	.btn-cancel {
		background-color: #ffebee;
		color: #f44336;
	}

	/* 商机卡片 */
	.post-list {
		padding: 0;
		flex: 1;
		overflow-y: auto;
	}

	.post-card {
		background: white;
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.post-card:active {
		transform: translateY(-6rpx);
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	}

	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.post-header .user-info {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 36rpx;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.user-details-wrapper {
		flex: 1;
	}

	.user-name {
		font-weight: 600;
		font-size: 32rpx;
		margin-bottom: 6rpx;
	}

	.post-time {
		font-size: 26rpx;
		color: #888;
		display: flex;
		align-items: center;
	}

	.post-time uni-icons {
		margin-right: 10rpx;
	}

	.delete-action {
		padding: 10rpx 20rpx;
		border-radius: 40rpx;
		background: #ffebe6;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 20rpx;
		transition: background 0.3s;
		font-size: 28rpx;
		color: #FF6A00;
	}

	.delete-action uni-icons {
		color: #FF6A00 !important;
		margin-right: 8rpx;
	}

	.delete-action:active {
		background: #ffdbcc;
	}


	.post-content {
		font-size: 30rpx;
		line-height: 1.5;
		margin-bottom: 30rpx;
		color: #444;
	}

	.post-images {
		display: grid;
		gap: 10rpx;
		/* 网格间距 */
		margin-bottom: 30rpx;
	}

	.image-wrapper {
		width: 100%;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.post-image {
		width: 100%;
		height: 100%;
		display: block;
		/* 消除 image 标签底部空隙 */
	}

	/* --- 核心：根据图片数量调整网格布局 --- */

	/* 默认（3张及以上）: 3列网格 */
	.post-images {
		grid-template-columns: repeat(3, 1fr);
	}

	.image-wrapper {
		aspect-ratio: 1 / 1;
		/* 多图时，保持1:1的正方形比例 */
	}

	/* Case 1: 只有 1 张图片 */
	.images-count-1 .image-wrapper {
		grid-column: 1 / -1;
		/* 占据整行 */
		aspect-ratio: unset;
		/* 移除正方形限制，让图片以原始比例显示 */
	}

	/* Case 2: 有 2 张或 4 张图片 */
	.images-count-2,
	.images-count-4 {
		grid-template-columns: repeat(2, 1fr);
		/* 2列网格，布局更美观 */
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 30rpx;
	}

	.tag {
		background: #fff0e6;
		color: #FF6A00;
		padding: 10rpx 24rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
	}

	.feedback-stats {
		display: flex;
		align-items: center;
		background: #f8f8f8;
		border-radius: 30rpx;
		padding: 16rpx 30rpx;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 30rpx;
	}

	.feedback-stats .like-count {
		display: flex;
		align-items: center;
		margin-right: 30rpx;
		color: #e74c3c;
	}

	.feedback-stats .dislike-count {
		display: flex;
		align-items: center;
		color: #3498db;
	}

	.feedback-stats uni-icons {
		margin-right: 10rpx;
	}

	/* 空状态容器 */
	.empty-state-container {
		padding-top: 80rpx;
	}

	.empty-state {
		text-align: center;
		padding: 80rpx 0;
		background-color: #fff;
		border-radius: 16rpx;
		margin-top: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.primary-btn {
		background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
		color: white;
		border: none;
		padding: 0 48rpx;
		height: 72rpx;
		line-height: 72rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		margin-top: 24rpx;
		-webkit-appearance: none;
		background-color: transparent;
	}

	.primary-btn::after {
		border: none;
	}
</style>