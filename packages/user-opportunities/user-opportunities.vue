<template>
	<view class="user-opportunities-app">
		<!-- 1. 页面头部，显示用户名 -->
		<!-- <view class="page-header">
			<text class="user-name-title">{{ pageTitle }}</text>
		</view> -->

		<!-- 2. 商机列表 -->
		<view class="post-list">
			<view v-for="post in postList" :key="post.id" class="post-card" @click="goToDetail(post.id)">
				<!-- 卡片头部：时间戳 -->
				<view class="post-header">
					<view class="post-time">
						<uni-icons type="calendar-filled" size="14" color="#888"></uni-icons>
						{{ post.time }}
					</view>
				</view>

				<!-- 卡片内容 -->
				<view class="post-content-title">{{ post.title }}</view>
				<view v-if="post.contentPreview" class="post-content-preview">{{ post.contentPreview }}</view>

				<!-- ==================== 【视频/图片】 ==================== -->

				<!-- Case 1: 如果存在视频，则优先渲染视频播放器 -->
				<view v-if="post.video" class="post-video-container">
					<video :id="'video-' + post.id" :src="post.video" class="post-video" :show-center-play-btn="true"
						@click.stop object-fit="cover"></video>
				</view>

				<!-- Case 2: 如果没有视频，但存在图片，则渲染图片网格 -->
				<view v-else-if="post.images && post.images.length > 0"
					:class="['post-images', 'images-count-' + post.images.length]">
					<view v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-wrapper">
						<image :src="image" class="post-image"
							:mode="post.images.length === 1 ? 'widthFix' : 'aspectFill'"
							@click.stop="previewImage(post.images, imgIndex)" />
					</view>
				</view>

				<!-- ============================================================ -->
			</view>

			<!-- 3. 加载状态 -->
			<uni-load-more v-if="postList.length > 0" :status="loadStatus"></uni-load-more>
			<view v-if="postList.length === 0 && loadStatus === 'noMore'" class="empty-state">
				<uni-icons type="list" size="50" color="#e0e0e0"></uni-icons>
				<text class="empty-text">Ta 还没有发布过任何商机</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	// --- 状态定义 ---
	const postList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const targetUserId = ref(null);
	const pageTitle = ref('商友圈');
	const loadStatus = ref('more');
	const defaultAvatarUrl = '/static/icon/default-avatar.png';

	// --- 页面生命周期 ---
	onLoad((options) => {
		if (options.userId) {
			targetUserId.value = options.userId;
			// 设置页面标题
			const userName = decodeURIComponent(options.userName || 'Ta');
			pageTitle.value = `${userName}的商友圈`;
			uni.setNavigationBarTitle({
				title: pageTitle.value
			});

			getOpportunitiesList(true);
		} else {
			uni.showToast({
				title: '缺少用户信息',
				icon: 'none'
			});
			loadStatus.value = 'noMore';
		}
	});

	onReachBottom(() => {
		if (loadStatus.value === 'more') {
			getOpportunitiesList();
		}
	});

	onPullDownRefresh(() => {
		getOpportunitiesList(true);
	});

	// --- 核心数据请求 ---
	const getOpportunitiesList = async (isRefresh = false) => {
		if (loadStatus.value === 'loading' || (loadStatus.value === 'noMore' && !isRefresh)) return;

		if (isRefresh) {
			pageNo.value = 1;
			postList.value = [];
			loadStatus.value = 'more';
		}

		loadStatus.value = 'loading';

		// 使用首页商机列表接口，并传入用户ID
		const {
			data,
			error
		} = await request('/app-api/member/business-opportunities/list', {
			method: 'GET',
			data: {
				pageNo: pageNo.value,
				pageSize: pageSize.value,
				userId: targetUserId.value // 【核心】传入指定的用户ID
			}
		});

		if (isRefresh) uni.stopPullDownRefresh();

		if (error || !data || !data.list) {
			loadStatus.value = 'more'; // 允许重试
			return;
		}

		const mappedData = data.list.map(item => ({
			id: item.id,
			title: item.postTitle,
			contentPreview: generateContentPreview(item.postContent),
			video: item.postVideo || '',
			images: item.postImg ? item.postImg.split(',').filter(img => img) : [],
			time: formatTimestamp(item.createTime),
		}));

		postList.value = isRefresh ? mappedData : [...postList.value, ...mappedData];

		if (postList.value.length >= data.total) {
			loadStatus.value = 'noMore';
		} else {
			loadStatus.value = 'more';
			pageNo.value++;
		}
	};

	// --- 事件处理 & 辅助函数 ---
	const goToDetail = (id) => {
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
		});
	};

	const previewImage = (urls, current) => {
		uni.previewImage({
			urls,
			current
		});
	};

	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		return `${Y}-${M}-${D}`;
	};

	const generateContentPreview = (content) => {
		if (!content) return '';
		const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
		return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;
	};
</script>

<style scoped>
	.user-opportunities-app {
		background-color: #f9f9f9;
		min-height: 100vh;
	}

	.page-header {
		padding: 30rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		text-align: center;
	}

	.user-name-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.post-list {
		padding: 30rpx;
	}

	.post-card {
		background: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.post-header {
		margin-bottom: 20rpx;
	}

	.post-time {
		font-size: 24rpx;
		color: #999;
		display: flex;
		align-items: center;
	}

	.post-time .uni-icons {
		margin-right: 8rpx;
	}

	.post-content-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
	}

	.post-content-preview {
		font-size: 28rpx;
		line-height: 1.6;
		color: #666;
		margin-bottom: 20rpx;
	}

	.post-images {
		display: grid;
		gap: 10rpx;
		grid-template-columns: repeat(3, 1fr);
	}

	.image-wrapper {
		width: 100%;
		border-radius: 8rpx;
		overflow: hidden;
		aspect-ratio: 1 / 1;
	}

	.post-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.images-count-1 .image-wrapper {
		grid-column: 1 / -1;
		aspect-ratio: unset;
	}

	.images-count-2,
	.images-count-4 {
		grid-template-columns: repeat(2, 1fr);
	}

	/* ==================== 【新增】视频容器和播放器样式 ==================== */
	.post-video-container {
		width: 100%;
		aspect-ratio: 16 / 9;
		/* 保持16:9的宽高比 */
		max-height: 400rpx;
		border-radius: 8rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		background-color: #000;
	}

	.post-video {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* ===================================================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 100rpx 0;
	}

	.empty-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999;
	}
</style>