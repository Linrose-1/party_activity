<template>
	<view class="system-construction-app">
		<!-- ==================== 1. 顶部搜索区 ==================== -->
		<view class="header">
			<view class="page-title">系统共建</view>
			<view class="search-container">
				<uni-icons type="search" size="20" color="#FF852B"></uni-icons>
				<input type="text" v-model="searchQuery" class="search-input" placeholder="按标题搜索建议"
					confirm-type="search" @confirm="handleSearch" />
				<button class="search-button" @click="handleSearch">搜索</button>
			</view>
		</view>

		<!-- ==================== 2. 导航Tabs ==================== -->
		<view class="tabs">
			<view class="tab" :class="{ active: activeTab === 'all' }" @click="handleTabClick('all')">全部建议</view>
			<view class="tab" :class="{ active: activeTab === 'mine' }" @click="handleTabClick('mine')">我的建议</view>
		</view>

		<!-- ==================== 3. 建议列表 ==================== -->
		<view class="suggestion-list">
			<view v-for="suggestion in suggestionList" :key="suggestion.id" class="suggestion-card">
				<!-- 3.1 卡片头部：用户信息 -->
				<view class="card-header">
					<image :src="suggestion.user.avatar" mode="aspectFill" class="avatar" />
					<view class="user-info">
						<view class="user-name">{{ suggestion.user.name }}</view>
						<view class="suggestion-time">{{ suggestion.time }}</view>
					</view>
				</view>

				<!-- 3.2 卡片内容：建议详情 -->
				<view class="card-body">
					<view class="suggestion-title">{{ suggestion.title }}</view>
					<view v-if="suggestion.content" class="suggestion-content">{{ suggestion.content }}</view>
					<image v-if="suggestion.img" :src="suggestion.img" class="suggestion-image" mode="widthFix"
						@click.stop="previewImage(suggestion.img)" />
				</view>
			</view>

			<!-- 3.3 列表加载状态 -->
			<view class="loading-status">
				<view v-if="suggestionList.length === 0 && loadingStatus === 'noMore'" class="no-data-message">
					暂无相关建议
				</view>
				<uni-load-more v-else :status="loadingStatus" />
			</view>
		</view>

		<!-- ==================== 4. 新建建议按钮 (FAB) ==================== -->
		<view class="fab-container" @click="navigateToCreate">
			<uni-icons type="plusempty" size="24" color="#FFFFFF"></uni-icons>
			<text class="fab-text">新建建议</text>
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
	import request from '../../utils/request.js'; // 确认路径是否正确

	// ============================
	// 1. 响应式状态定义
	// ============================
	const loggedInUserId = ref(null);
	const suggestionList = ref([]);
	const searchQuery = ref('');
	const activeTab = ref('all'); // 'all' 或 'mine'

	const pageNo = ref(1);
	const pageSize = ref(10);
	const loadingStatus = ref('more'); // 'more', 'loading', 'noMore'
	const defaultAvatarUrl = '/static/icon/default-avatar.png'; // 默认头像路径

	// ============================
	// 2. 生命周期钩子
	// ============================
	onLoad(() => {
		loggedInUserId.value = uni.getStorageSync('userId');
		getSuggestionList(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			getSuggestionList();
		}
	});

	onPullDownRefresh(() => {
		getSuggestionList(true);
	});

	// ============================
	// 3. 主要业务方法
	// ============================
	const getSuggestionList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			pageNo.value = 1;
			suggestionList.value = [];
			loadingStatus.value = 'more';
		}

		loadingStatus.value = 'loading';

		// 构建请求参数
		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize.value,
		};
		if (searchQuery.value) {
			params.title = searchQuery.value;
		}
		if (activeTab.value === 'mine' && loggedInUserId.value) {
			params.creator = loggedInUserId.value;
		}

		try {
			const {
				data: apiData,
				error
			} = await request('/app-api/member/suggestion/list', {
				method: 'GET',
				data: params
			});

			if (error || !apiData || !apiData.list) {
				loadingStatus.value = 'noMore';
				if (error) uni.showToast({
					title: `加载失败: ${error}`,
					icon: 'none'
				});
				return;
			}

			// 数据映射，转换为模板友好的格式
			const mappedData = apiData.list.map(item => ({
				id: item.id,
				title: item.title,
				content: item.content,
				img: item.img,
				time: formatTimestamp(item.createTime),
				user: {
					id: item.memberUser?.id || item.creator,
					name: item.memberUser?.nickname || '匿名用户',
					avatar: item.memberUser?.avatar || defaultAvatarUrl
				}
			}));

			suggestionList.value = isRefresh ? mappedData : [...suggestionList.value, ...mappedData];

			// 更新加载状态
			if (suggestionList.value.length >= apiData.total) {
				loadingStatus.value = 'noMore';
			} else {
				loadingStatus.value = 'more';
				pageNo.value++;
			}

		} catch (err) {
			console.error('getSuggestionList 逻辑异常:', err);
			loadingStatus.value = 'more';
			uni.showToast({
				title: '页面加载异常',
				icon: 'none'
			});
		} finally {
			uni.stopPullDownRefresh();
		}
	};

	// ============================
	// 4. 事件处理方法
	// ============================
	const handleSearch = () => {
		getSuggestionList(true);
	};

	const handleTabClick = (tab) => {
		if (activeTab.value === tab) return;
		activeTab.value = tab;
		getSuggestionList(true);
	};



	const navigateToCreate = () => {
		uni.navigateTo({
			url: '/pages/my-systemSuggestions/my-systemSuggestions' // 请确认此路径是否正确
		});
	};

	const previewImage = (imageUrl) => {
		uni.previewImage({
			urls: [imageUrl],
			current: 0
		});
	};

	// ============================
	// 5. 辅助函数
	// ============================
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	};
</script>

<style scoped>
	/* 主题色 */
	:root {
		--theme-color: #FF852B;
	}

	.system-construction-app {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding-bottom: 180rpx;
		/* 为FAB按钮留出空间 */
	}

	/* 1. 顶部搜索区 */
	.header {
		background: linear-gradient(135deg, #FF852B, #FFAC70);
		padding: 30rpx 30rpx 40rpx;
		border-radius: 0 0 40rpx 40rpx;
	}

	.page-title {
		font-size: 44rpx;
		font-weight: bold;
		color: white;
		margin-bottom: 30rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.search-container {
		display: flex;
		align-items: center;
		background: #ffffff;
		border-radius: 50rpx;
		padding: 10rpx 20rpx;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		margin-left: 16rpx;
	}

	.search-button {
		background: #FF852B;
		color: white;
		border-radius: 30rpx;
		padding: 10rpx 30rpx;
		font-size: 28rpx;
		margin-left: 20rpx;
		line-height: 1.5;
	}

	.search-button::after {
		border: none;
	}

	/* 2. 导航Tabs */
	.tabs {
		display: flex;
		background: white;
		margin: 30rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.tab {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		font-size: 30rpx;
		color: #666;
		position: relative;
	}

	.tab.active {
		color: #FF852B;
		font-weight: bold;
	}

	.tab.active::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 6rpx;
		background-color: #FF852B;
		border-radius: 3rpx;
	}

	/* 3. 建议列表 */
	.suggestion-list {
		padding: 0 30rpx;
	}

	.suggestion-card {
		background: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #eee;
		flex-shrink: 0;
	}

	.user-info {
		flex: 1;
	}

	.user-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.suggestion-time {
		font-size: 24rpx;
		color: #999;
	}

	.card-body {}

	.suggestion-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #222;
		margin-bottom: 16rpx;
	}

	.suggestion-content {
		font-size: 28rpx;
		color: #555;
		line-height: 1.6;
		margin-bottom: 20rpx;
		white-space: pre-wrap;
	}

	.suggestion-image {
		width: 100%;
		border-radius: 12rpx;
		margin-top: 10rpx;
	}

	.loading-status {
		padding: 20rpx 0;
	}

	.no-data-message {
		text-align: center;
		color: #999;
		padding: 40rpx 0;
	}

	/* 4. 新建建议按钮 (FAB) */
	.fab-container {
		position: fixed;
		bottom: 100rpx;
		right: 40rpx;
		background: linear-gradient(135deg, #FF852B, #FFAC70);
		color: white;
		border-radius: 50rpx;
		padding: 20rpx 40rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 24rpx rgba(255, 133, 43, 0.4);
		z-index: 10;
		transition: transform 0.2s ease-in-out;
	}

	.fab-container:active {
		transform: scale(0.95);
	}

	.fab-text {
		font-size: 28rpx;
		font-weight: 500;
		margin-left: 10rpx;
	}
</style>