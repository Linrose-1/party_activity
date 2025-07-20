<template>
	<view class="my-opportunities-app">

		<!-- 搜索框 -->
		<!-- <view class="search-bar-container">
			<uni-search-bar v-model="searchKey" placeholder="搜索商机标题、内容等" cancelButton="none" @confirm="handleSearch"
				@clear="handleClear" />
		</view> -->

		<!-- 帖子列表 -->
		<view class="post-list">
			<!-- 帖子卡片 - v-for 循环动态数据 postList -->
			<view v-for="post in postList" :key="post.id" class="post-card" @click="skipCommercialDetail(post.id)">
				<view class="post-header">
					<view class="user-info">
						<image :src="post.memberUser.avatar" mode="" class="avatar" @click.stop="skipApplicationBusinessCard"></image>
						<view class="user-details-wrapper">
							<view class="user-name">{{ post.memberUser.nickname || '匿名用户' }}</view>
							<view class="post-time">
								<!-- 1. 数据显示优化：使用 formatTimestamp 函数转换时间 -->
								<uni-icons type="redo" size="14" color="#888"></uni-icons>
								{{ formatTimestamp(post.createTime) }}
							</view>
						</view>
					</view>
					<!-- 删除按钮 -->
					<view class="delete-action" @click.stop="deleteOpportunity(post.id)">
						<uni-icons type="close" size="15" color="#FF6A00">删除</uni-icons>
					</view>
				</view>

				<view class="post-content">
					{{ post.postContent }}
				</view>

				<view class="post-images" v-if="post.postImg">
					<view v-for="(image, imgIndex) in post.postImg.split(',')" :key="imgIndex" class="image-wrapper">
						<img :src="image" alt="商机图片" class="post-image"
							@click.stop="previewImage(post.postImg.split(','), imgIndex)" />
					</view>
				</view>

				<view class="tags" v-if="post.tags && post.tags.length > 0">
					<view v-for="(tag, tagIndex) in post.tags" :key="tagIndex" class="tag">
						{{ tag }}
					</view>
				</view>

				<view class="feedback-stats">
					<view class="like-count">
						<uni-icons type="hand-up-filled" size="18" color="#e74c3c"></uni-icons>
						<span>{{ post.likesCount }}</span>
					</view>
					<view class="dislike-count">
						<uni-icons type="hand-down-filled" size="18" color="#3498db"></uni-icons>
						<span>{{ post.dislikesCount }}</span>
					</view>
				</view>

			</view>

			<uni-load-more v-if="postList.length > 0" :status="loadStatus"></uni-load-more>

			<view v-if="postList.length === 0 && loadStatus === 'noMore'" class="no-posts-message">
				<uni-icons type="info" size="60" color="#ccc"></uni-icons>
				<p>您还没有发布任何商机</p>
				<button class="empty-post-button" @click="postNew">
					<uni-icons type="compose" size="20" color="#FFFFFF"></uni-icons> 发布我的第一个商机
				</button>
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
	import request from '@/utils/request.js'; // ‼️ 请确保此路径相对于您的页面文件是正确的

	// --- 状态定义 ---
	const postList = ref([]);
	const searchKey = ref('');
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more');

	// --- 辅助函数 ---

	/**
	 * 1. 新增：格式化时间戳为 'YYYY-MM-DD HH:mm:ss'
	 * @param {number} timestamp - 时间戳 (例如 1750339776000)
	 * @returns {string} 格式化后的日期字符串
	 */
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	// --- 核心数据请求函数 ---
	const getMyOpportunitiesList = async (isRefresh = false) => {
		if (loadStatus.value === 'loading' || (loadStatus.value === 'noMore' && !isRefresh)) {
			return;
		}
		if (isRefresh) {
			pageNo.value = 1;
			postList.value = [];
			loadStatus.value = 'more';
		}
		loadStatus.value = 'loading';
		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize.value,
			// searchKey: searchKey.value.trim(),
			userId: 247
		};
		const {
			data,
			error
		} = await request('/app-api/member/business-opportunities/my-list', {
			method: 'GET',
			data: params
		});
		
		console.log("我的商机",data)

		if (isRefresh) {
			uni.stopPullDownRefresh();
		}
		if (error) {
			uni.showToast({
				title: error,
				icon: 'none'
			});
			loadStatus.value = 'more';
			return;
		}
		if (data && data.list && data.list.length > 0) {
			postList.value = [...postList.value, ...data.list];
			total.value = data.total;
			if (postList.value.length >= total.value) {
				loadStatus.value = 'noMore';
			} else {
				loadStatus.value = 'more';
				pageNo.value++;
			}
		} else {
			if (pageNo.value === 1) {
				total.value = 0;
				postList.value = [];
			}
			loadStatus.value = 'noMore';
		}
	};

	// --- 事件处理函数 ---
	const handleSearch = () => {
		getMyOpportunitiesList(true);
	};
	const handleClear = () => {
		searchKey.value = '';
		getMyOpportunitiesList(true);
	};

	/**
	 * 2. 功能实现：删除商机
	 * @param {number} id - 要删除的商机ID
	 */
	const deleteOpportunity = (id) => {
		uni.showModal({
			title: '确认删除',
			content: '您确定要删除这条商机吗？删除后将无法恢复。',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '删除中...'
					});

					// 调用后端的删除接口
					const {
						error
					} = await request('/app-api/member/business-opportunities/delete', {
						method: 'POST',
						data: {
							id: id
						} // 符合接口文档的请求体
					});

					uni.hideLoading();

					if (error) {
						uni.showToast({
							title: '删除失败: ' + error,
							icon: 'none'
						});
						return;
					}

					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});

					// 删除成功后，刷新列表以保证数据同步
					getMyOpportunitiesList(true);
				}
			}
		});
	};

	// --- 页面跳转函数 ---
	const postNew = () => {
		uni.navigateTo({
			url: '/pages/home-opportunitiesPublish/home-opportunitiesPublish'
		})
	};
	const skipApplicationBusinessCard = () => {
		uni.navigateTo({
			url: '/pages/applicationBusinessCard/applicationBusinessCard'
		})
	};
	const skipCommercialDetail = (id) => {
		uni.navigateTo({
			url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}`
		})
	};
	const previewImage = (urls, current) => {
		uni.previewImage({
			urls: urls,
			current: urls[current]
		});
	};

	// --- Uni-app 页面生命周期钩子 ---
	onLoad(() => {
		getMyOpportunitiesList(true);
	});
	onReachBottom(() => {
		getMyOpportunitiesList();
	});
	onPullDownRefresh(() => {
		getMyOpportunitiesList(true);
	});
</script>

<style scoped>
	/* 页面根容器样式 */
	.my-opportunities-app {
		background-color: #f9f9f9;
		color: #333;
		max-width: 750rpx;
		margin: 0 auto;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 搜索框容器样式 */
	.search-bar-container {
		padding: 16rpx 20rpx;
		background-color: #ffffff;
		position: sticky;
		/* 吸顶效果 */
		top: 0;
		z-index: 99;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.03);
	}

	/* 帖子列表样式 */
	.post-list {
		padding: 30rpx;
		flex: 1;
		padding-bottom: 40rpx;
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
		padding: 10rpx;
		border-radius: 40rpx;
		background: #ffebe6;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 20rpx;
		transition: background 0.3s;
	}

	.delete-action:active {
		background: #ffdbcc;
	}

	.delete-action uni-icons {
		color: #FF6A00 !important;
	}

	.post-content {
		font-size: 30rpx;
		line-height: 1.5;
		margin-bottom: 30rpx;
		color: #444;
	}

	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.image-wrapper {
		width: calc((100% - 32rpx) / 3);
		aspect-ratio: 1 / 1;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.post-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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

	.no-posts-message {
		text-align: center;
		padding: 100rpx 40rpx;
		color: #999;
		font-size: 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 30rpx;
		margin-top: 50rpx;
	}

	.no-posts-message p {
		margin: 20rpx 0;
	}

	.empty-post-button {
		background: linear-gradient(to right, #FF6A00, #FF8C37);
		color: white;
		border: none;
		border-radius: 60rpx;
		padding: 24rpx 50rpx;
		font-size: 32rpx;
		font-weight: 600;
		box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 40rpx;
		-webkit-appearance: none;
		background-color: transparent;
	}

	.empty-post-button::after {
		border: none;
	}

	.empty-post-button uni-icons {
		margin-right: 15rpx;
		color: white !important;
	}
</style>