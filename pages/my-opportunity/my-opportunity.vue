<template>
	<view class="my-opportunities-app">

		<view class="segmented-wrapper">
			<uni-segmented-control :current="currentTab" :values="tabs" @clickItem="switchTab" style-type="button"
				active-color="#FF6B00" />
		</view>

		<!-- 帖子列表 -->
		<view class="post-list">
			<view v-for="post in postList" :key="post.id" class="post-card" @click="skipCommercialDetail(post.id)">
				<view class="post-header">
					<view class="user-info">
						<image :src="post.memberUser.avatar" mode="" class="avatar"
							@click.stop="skipApplicationBusinessCard"></image>
						<view class="user-details-wrapper">
							<view class="user-name">{{ post.memberUser.nickname || '匿名用户' }}</view>
							<view class="post-time">
								<uni-icons type="redo" size="14" color="#888"></uni-icons>
								{{ formatTimestamp(post.createTime) }}
							</view>
						</view>
					</view>
					<view class="status-tag" :class="getStatusInfo(post).class">
						{{ getStatusInfo(post).text }}
					</view>
				</view>

				<view class="post-content">
					{{ post.postContent }}
				</view>

				<!-- ======================================== -->

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

				<view class="tags" v-if="post.tags && post.tags.length > 0">
					<!-- ... -->
				</view>

				<view class="feedback-stats">
					<!-- ... -->
				</view>

				<!-- 底部操作按钮区域 -->
				<view class="card-actions">
					<button class="action-btn delete-btn" @click.stop="deleteOpportunity(post.id)">
						<uni-icons type="trash" size="16" color="#e74c3c"></uni-icons>
						删除
					</button>
					<button class="action-btn appeal-btn" :class="{ 'disabled': post.status !== 'hidden' }"
						:disabled="post.status !== 'hidden'" @click.stop="openAppealModal(post)">
						<uni-icons type="chat-filled" size="16"
							:color="post.status === 'hidden' ? '#3498db' : '#ccc'"></uni-icons>
						申诉
					</button>
				</view>
			</view>

			<uni-load-more v-if="postList.length > 0" :status="loadStatus"></uni-load-more>

			<view v-if="postList.length === 0 && loadStatus === 'noMore'" class="empty-state-container">
				<uni-icons type="compose" size="60" color="#e0e0e0"></uni-icons>
				<text class="empty-text">您还没有发布过任何商机</text>
				<text class="empty-subtext">分享您的商机，连接更多可能</text>
				<button class="publish-button" @click="goToPublishPage">立即发布</button>
			</view>
		</view>

		<!-- 【新增】申诉弹窗 -->
		<uni-popup ref="appealPopup" type="dialog">
			<uni-popup-dialog mode="input" title="提交申诉" placeholder="请输入申诉理由..."
				@confirm="confirmAppeal"></uni-popup-dialog>
		</uni-popup>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onShow,
		onLoad,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// --- 状态定义 ---
	const postList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more');
	const currentTab = ref(0); // 0: 普通商机, 1: 创业猎伙
	const tabs = ref(['普通商机', '创业猎伙']);

	// 申诉弹窗相关状态
	const appealPopup = ref(null); // 弹窗实例
	const currentAppealPost = ref(null); // 当前正在申诉的帖子对象

	// --- 辅助函数 ---
	const formatTimestamp = (timestamp) => {
		// ... 时间格式化函数保持不变
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`; // 简化时间显示
	};

	/**
	 * 根据状态码返回文本和样式类
	 */
	const getStatusInfo = (post) => {
		switch (post.status) {
			case 'active':
			case 'reactive': // reactive 也视为正常
				return {
					text: '正常', class: 'status-active'
				};
			case 'hidden':
				return {
					text: '待申诉', class: 'status-hidden'
				};
			case 'reject': // 假设'reject'是申诉失败的状态码
				return {
					text: '申诉失败', class: 'status-rejected'
				};
			case 'completed':
				return {
					text: '已完成', class: 'status-completed'
				};
			case 'closed':
				return {
					text: '已关闭', class: 'status-closed'
				};
			default:
				return {
					text: '未知', class: 'status-unknown'
				};
		}
	};

	// --- 核心数据请求函数 ---
	const getMyOpportunitiesList = async (isRefresh = false) => {
		if (loadStatus.value === 'loading') return;
		if (!isRefresh && loadStatus.value === 'noMore') return;

		if (isRefresh) {
			pageNo.value = 1;
			postList.value = [];
			loadStatus.value = 'more';
		}

		loadStatus.value = 'loading';
		const userId = uni.getStorageSync('userId');

		// 【新增】构造参数，加入 postType
		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize.value,
			userId: userId,
			postType: currentTab.value // 0 或 1
		};

		try {
			const {
				data,
				error
			} = await request('/app-api/member/business-opportunities/my-list', {
				method: 'GET',
				data: params
			});

			if (isRefresh) uni.stopPullDownRefresh();

			if (error) {
				loadStatus.value = 'more';
				return;
			}

			if (data && data.list && data.list.length > 0) {
				const mappedList = data.list.map(item => {
					// 【优化】更安全的图片解析逻辑，防止 item.postImg 为 null 报错
					let imgList = [];
					if (item.postImg) {
						// 过滤掉空字符串
						imgList = String(item.postImg).split(',').filter(s => s && s.trim());
					}

					return {
						...item,
						video: item.postVideo || '',
						images: imgList
					};
				});

				postList.value = isRefresh ? mappedList : [...postList.value, ...mappedList];
				total.value = data.total || 0;

				// 判断是否还有更多
				if (postList.value.length >= total.value) {
					loadStatus.value = 'noMore';
				} else {
					loadStatus.value = 'more';
					pageNo.value++;
				}
			} else {
				if (isRefresh) postList.value = []; // 如果刷新且没数据，清空列表
				loadStatus.value = 'noMore';
			}
		} catch (e) {
			console.error(e);
			loadStatus.value = 'more';
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	// 图片预览函数
	const previewImage = (urls, current) => {
		uni.previewImage({
			urls: urls,
			current: urls[current] // 直接使用索引，而不是再次查找
		});
	};

	// --- 事件处理函数 ---
	const switchTab = (e) => {
		if (currentTab.value === e.currentIndex) return;
		currentTab.value = e.currentIndex;
		// 切换后立即刷新列表
		getMyOpportunitiesList(true);
	};

	const deleteOpportunity = (id) => {
		uni.showModal({
			title: '确认删除',
			content: '您确定要删除这条商机吗？删除后将无法恢复。',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '删除中...'
					});
					const {
						error
					} = await request('/app-api/member/business-opportunities/delete', {
						method: 'POST',
						data: {
							id: id
						}
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
					getMyOpportunitiesList(true); // 刷新列表
				}
			}
		});
	};

	/**
	 * 打开申诉弹窗
	 * @param {object} post - 要申诉的帖子对象
	 */
	const openAppealModal = (post) => {
		currentAppealPost.value = post; // 保存当前帖子信息
		appealPopup.value.open();
	};

	/**
	 * 确认并提交申诉
	 * @param {string} appealContent - 用户在弹窗中输入的申诉内容
	 */
	const confirmAppeal = async (appealContent) => {
		if (!appealContent || !appealContent.trim()) {
			uni.showToast({
				title: '申诉内容不能为空',
				icon: 'none'
			});
			return;
		}

		uni.showLoading({
			title: '提交中...'
		});

		const {
			error
		} = await request('/app-api/member/business-opportunities/appeal', {
			method: 'POST',
			data: {
				id: currentAppealPost.value.id,
				appealContent: appealContent
			}
		});

		uni.hideLoading();

		if (error) {
			uni.showToast({
				title: '申诉失败: ' + error,
				icon: 'none'
			});
		} else {
			uni.showToast({
				title: '申诉已提交，请等待审核',
				icon: 'success'
			});
			appealPopup.value.close();
			// 申诉后，最好也刷新一下列表，以便看到状态更新
			getMyOpportunitiesList(true);
		}
	};

	// --- 页面跳转函数 ---
	const skipApplicationBusinessCard = (userId) => {
		// 暂时打印日志，防止报错。
		console.log('点击用户头像 ID:', userId);
	};
	const skipCommercialDetail = (id) => {
		uni.navigateTo({
			url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
		})
	};

	/**
	 * 跳转到发布商机页面的方法
	 */
	const goToPublishPage = () => {
		uni.navigateTo({
			url: '/packages/home-opportunitiesPublish/home-opportunitiesPublish'
		});
	};

	// --- Uni-app 页面生命周期钩子 ---
	onShow(() => {
		// 每次页面显示都刷新第一页数据
		getMyOpportunitiesList(true);
	});
	onReachBottom(() => getMyOpportunitiesList());
	onPullDownRefresh(() => getMyOpportunitiesList(true));
</script>

<style scoped>
	.my-opportunities-app {
		background-color: #f9f9f9;
		min-height: 100vh;
	}

	.segmented-wrapper {
		background-color: #fff;
		padding: 20rpx 30rpx;
		position: sticky;
		/* 吸顶效果 */
		top: 0;
		z-index: 99;
		border-bottom: 1rpx solid #eee;
	}

	.post-list {
		padding: 30rpx 0;
	}

	.post-card {
		background: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin: 0 30rpx 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.user-name {
		font-weight: 600;
		font-size: 30rpx;
	}

	.post-time {
		font-size: 24rpx;
		color: #999;
	}

	/* 【新增】状态标签样式 */
	.status-tag {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
		font-weight: 500;
	}

	.status-active {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.status-hidden {
		background-color: #fffbe6;
		color: #faad14;
	}

	.status-rejected {
		background-color: #fff1f0;
		color: #f5222d;
	}

	.status-completed,
	.status-closed {
		background-color: #f0f0f0;
		color: #999;
	}

	.status-unknown {
		background-color: #f0f0f0;
		color: #999;
	}

	.post-content {
		font-size: 28rpx;
		line-height: 1.6;
		margin-bottom: 20rpx;
	}

	.post-images {
		display: grid;
		gap: 10rpx;
		/* 网格间距 */
		margin-bottom: 20rpx;
	}

	.image-wrapper {
		width: 100%;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.post-image {
		width: 100%;
		height: 100%;
		display: block;
		/* 消除 image 标签底部空隙 */
	}

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

	.feedback-stats {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
		font-size: 26rpx;
		color: #666;
		border-bottom: 1rpx solid #f5f5f5;
		margin-bottom: 20rpx;
	}

	.like-count {
		margin-right: 30rpx;
		color: #e74c3c;
	}

	.dislike-count {
		color: #3498db;
	}

	.like-count,
	.dislike-count {
		display: flex;
		align-items: center;
	}

	.like-count uni-icons,
	.dislike-count uni-icons {
		margin-right: 8rpx;
	}

	/* 底部操作按钮样式 */
	.card-actions {
		display: flex;
		justify-content: flex-end;
		/* 按钮靠右对齐 */
		gap: 20rpx;
		padding-top: 20rpx;
	}

	.action-btn {
		display: flex;
		align-items: center;
		padding: 10rpx 24rpx;
		font-size: 26rpx;
		border-radius: 40rpx;
		background-color: #f5f5f5;
		color: #666;
		margin: 0;
		line-height: 1;
	}

	.action-btn::after {
		border: none;
	}

	.action-btn uni-icons {
		margin-right: 8rpx;
	}

	.delete-btn {
		color: #e74c3c;
	}

	.appeal-btn {
		color: #3498db;
	}

	.appeal-btn.disabled {
		background-color: #f5f5f5;
		color: #ccc;
		pointer-events: none;
		/* 禁用点击事件 */
	}

	.no-posts-message,
	.empty-post-button {
		/* 样式保持不变 */
	}


	/* 空状态引导容器的样式 */
	.empty-state-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 40rpx;
		margin: 30rpx;
		/* 与 post-card 的外边距保持一致 */
		background-color: #fff;
		border-radius: 20rpx;
	}

	.empty-text {
		margin-top: 20rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.empty-subtext {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.publish-button {
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 18rpx 80rpx;
		font-size: 28rpx;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
		transition: all 0.2s ease;
	}

	.publish-button::after {
		border: none;
	}

	.publish-button:active {
		background: linear-gradient(135deg, #e05a00, #e07a00);
		transform: scale(0.98);
	}
</style>