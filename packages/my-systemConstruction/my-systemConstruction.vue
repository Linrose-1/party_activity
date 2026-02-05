<template>
	<view class="system-construction-app">
		<!-- 1. 顶部搜索区：品牌渐变色背景 -->
		<view class="header">
			<view class="page-title">系统共建</view>
			<view class="search-container">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="searchQuery" class="search-input" placeholder="搜索您感兴趣的建议标题..."
					confirm-type="search" @confirm="handleSearch" />
				<view class="search-confirm-btn" @click="handleSearch">搜索</view>
			</view>
		</view>

		<!-- 2. 导航Tabs：悬浮胶囊风格 -->
		<view class="tabs-wrapper">
			<view class="tabs">
				<view class="tab" :class="{ active: activeTab === 'all' }" @click="handleTabClick('all')">
					<text>全部建议</text>
					<view class="active-line"></view>
				</view>
				<view class="tab" :class="{ active: activeTab === 'mine' }" @click="handleTabClick('mine')">
					<text>我的发布</text>
					<view class="active-line"></view>
				</view>
			</view>
		</view>

		<!-- 3. 建议列表区 -->
		<view class="suggestion-list">
			<view v-for="suggestion in suggestionList" :key="suggestion.id" class="suggestion-card">
				<!-- 3.1 卡片头部：用户信息与管理操作 -->
				<view class="card-header">
					<view class="user-meta" @click.stop="goUserCard(suggestion.user.id)">
						<image :src="suggestion.user.avatar || defaultAvatarUrl" mode="aspectFill" class="avatar" />
						<view class="user-detail">
							<text class="user-name">{{ suggestion.user.name }}</text>
							<text class="post-time">{{ suggestion.time }}</text>
						</view>
					</view>

					<!-- 管理操作区：仅本人可见 -->
					<view v-if="loggedInUserId == suggestion.user.id" class="manage-group">
						<view class="btn-mini edit" @click.stop="handleEditSuggestion(suggestion.id)">
							<uni-icons type="compose" size="14" color="#FF852B"></uni-icons>
							<text>编辑</text>
						</view>
						<view class="btn-mini delete" @click.stop="handleDeleteSuggestion(suggestion.id)">
							<uni-icons type="trash" size="14" color="#999"></uni-icons>
						</view>
					</view>
				</view>

				<!-- 3.2 卡片主体：内容展示 -->
				<view class="card-body">
					<view class="suggestion-title">
						<!-- <text class="status-badge"
							:class="'status-' + suggestion.rawStatus">{{ getStatusText(suggestion.rawStatus) }}</text> -->
						{{ suggestion.title }}
					</view>
					<view v-if="suggestion.content" class="suggestion-content">{{ suggestion.content }}</view>

					<!-- 图片展示网格 -->
					<view class="suggestion-images" v-if="suggestion.images && suggestion.images.length > 0"
						:class="['images-count-' + suggestion.images.length]">
						<view v-for="(image, imgIndex) in suggestion.images" :key="imgIndex" class="image-wrapper">
							<image :src="image" class="suggestion-image" mode="aspectFill"
								@click.stop="previewImage(suggestion.images, imgIndex)" />
						</view>
					</view>
				</view>
			</view>

			<!-- 3.3 状态提示 -->
			<view class="loading-status">
				<view v-if="suggestionList.length === 0 && loadingStatus === 'noMore'" class="empty-box">
					<uni-icons type="info" size="50" color="#ddd"></uni-icons>
					<text>暂无相关建议信息</text>
				</view>
				<uni-load-more v-else :status="loadingStatus" />
			</view>
		</view>

		<!-- 4. 悬浮新建按钮 -->
		<view class="fab-btn" @click="navigateToCreate">
			<uni-icons type="plusempty" size="24" color="#FFFFFF"></uni-icons>
			<text>提建议</text>
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
		onPullDownRefresh,
		onShow
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	// ============================
	// 1. 响应式数据
	// ============================
	const loggedInUserId = ref(null);
	const suggestionList = ref([]);
	const searchQuery = ref('');
	const activeTab = ref('all');
	const pageNo = ref(1);
	const pageSize = 10;
	const loadingStatus = ref('more');
	const defaultAvatarUrl = '/static/icon/default-avatar.png';

	// ============================
	// 2. 生命周期
	// ============================
	onLoad(() => {
		loggedInUserId.value = uni.getStorageSync('userId');
	});

	onShow(() => {
		// 每次进入页面刷新列表，确保编辑后的内容同步
		fetchSuggestionList(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') fetchSuggestionList();
	});

	onPullDownRefresh(() => {
		fetchSuggestionList(true);
	});

	// ============================
	// 3. 业务逻辑方法
	// ============================

	/**
	 * [接口方法] 获取建议列表
	 * @param {Boolean} isRefresh 是否重置刷新
	 */
	const fetchSuggestionList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;
		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'more';
		}
		loadingStatus.value = 'loading';

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			title: searchQuery.value || ''
		};
		// 如果是“我的”Tab，增加过滤条件
		if (activeTab.value === 'mine') params.creator = loggedInUserId.value;

		try {
			const {
				data,
				error
			} = await request('/app-api/member/suggestion/list', {
				method: 'GET',
				data: params
			});

			if (isRefresh) uni.stopPullDownRefresh();

			if (error || !data) {
				loadingStatus.value = 'noMore';
				return;
			}

			const mappedData = data.list.map(item => ({
				id: item.id,
				title: item.title,
				content: item.content,
				rawStatus: item.status, // 保存原始状态码用于样式
				images: item.img ? item.img.split(',').filter(Boolean) : [],
				time: formatTimestamp(item.createTime),
				user: {
					id: item.memberUser?.id || item.creator,
					name: item.memberUser?.nickname || '商友',
					avatar: item.memberUser?.avatar || defaultAvatarUrl
				}
			}));

			suggestionList.value = isRefresh ? mappedData : [...suggestionList.value, ...mappedData];
			loadingStatus.value = suggestionList.value.length >= data.total ? 'noMore' : 'more';
			if (loadingStatus.value === 'more') pageNo.value++;

		} catch (err) {
			loadingStatus.value = 'more';
		}
	};

	/**
	 * [方法] 执行删除操作
	 */
	const handleDeleteSuggestion = (id) => {
		uni.showModal({
			title: '确定删除？',
			content: '删除后此共建建议将不再对他人展示。',
			confirmColor: '#FF852B',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '处理中...'
					});
					const {
						error
					} = await request(`/app-api/member/suggestion/delete?id=${id}`, {
						method: 'DELETE'
					});
					uni.hideLoading();
					if (!error) {
						uni.showToast({
							title: '已删除'
						});
						suggestionList.value = suggestionList.value.filter(item => item.id !== id);
					}
				}
			}
		});
	};

	/**
	 * [方法] 跳转至编辑页
	 */
	const handleEditSuggestion = (id) => {
		uni.navigateTo({
			url: `/pages/my-systemSuggestions/my-systemSuggestions?id=${id}`
		});
	};

	/**
	 * [方法] 跳转到详情页面
	 * @param {Number} id - 建议ID
	 */
	const goDetail = (id) => {
		uni.navigateTo({
			url: `/packages/suggestion-detail/suggestion-detail?id=${id}`
		});
	};

	/**
	 * [方法] 切换Tab筛选
	 */
	const handleTabClick = (tab) => {
		if (activeTab.value === tab) return;
		activeTab.value = tab;
		fetchSuggestionList(true);
	};

	/**
	 * [方法] 处理搜索
	 */
	const handleSearch = () => fetchSuggestionList(true);

	/**
	 * [方法] 新建建议跳转
	 */
	const navigateToCreate = () => {
		uni.navigateTo({
			url: '/pages/my-systemSuggestions/my-systemSuggestions'
		});
	};

	/**
	 * [方法] 图片大图预览
	 */
	const previewImage = (images, index) => {
		uni.previewImage({
			urls: images,
			current: index
		});
	};

	/**
	 * [方法] 跳转至用户名片
	 */
	const goUserCard = (userId) => {
		if (!userId) return;
		uni.navigateTo({
			url: `/packages/my-businessCard/my-businessCard?id=${userId}`
		});
	};

	// ============================
	// 4. 辅助函数
	// ============================
	const getStatusText = (status) => {
		const map = {
			0: '待处理',
			1: '已采纳',
			2: '处理中'
		};
		return map[status] || '已公示';
	};

	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const d = new Date(ts);
		return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	};
</script>

<style scoped lang="scss">
	$theme: #FF852B;

	.system-construction-app {
		background-color: #F8F9FA;
		min-height: 100vh;
		padding-bottom: 200rpx;
	}

	/* 1. 顶部 Header */
	.header {
		background: linear-gradient(135deg, $theme, #FFAC70);
		padding: 40rpx 30rpx 60rpx;
		border-radius: 0 0 50rpx 50rpx;

		.page-title {
			font-size: 40rpx;
			font-weight: bold;
			color: #fff;
			margin-bottom: 30rpx;
		}

		.search-container {
			display: flex;
			align-items: center;
			background: #fff;
			border-radius: 50rpx;
			padding: 10rpx 10rpx 10rpx 30rpx;

			.search-input {
				flex: 1;
				font-size: 26rpx;
			}

			.search-confirm-btn {
				background: $theme;
				color: #fff;
				font-size: 24rpx;
				font-weight: bold;
				padding: 12rpx 30rpx;
				border-radius: 40rpx;
				margin-left: 10rpx;
			}
		}
	}

	/* 2. Tabs 胶囊风格 */
	.tabs-wrapper {
		padding: 0 30rpx;
		margin-top: -30rpx;
	}

	.tabs {
		display: flex;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.tab {
			flex: 1;
			text-align: center;
			padding: 24rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;

			&.active {
				color: $theme;
				font-weight: bold;

				.active-line {
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 6rpx;
					background: $theme;
					border-radius: 3rpx;
				}
			}
		}
	}

	/* 3. 建议卡片设计 */
	.suggestion-list {
		padding: 30rpx;
	}

	.suggestion-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.02);

		&:active {
			transform: scale(0.99);
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24rpx;

		.user-meta {
			display: flex;
			align-items: center;
			gap: 16rpx;

			.avatar {
				width: 72rpx;
				height: 72rpx;
				border-radius: 50%;
				background: #f0f0f0;
			}

			.user-name {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				display: block;
			}

			.post-time {
				font-size: 20rpx;
				color: #BBB;
			}
		}
	}

	/* 按钮组 */
	.manage-group {
		display: flex;
		gap: 16rpx;
	}

	.btn-mini {
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		gap: 4rpx;

		&.edit {
			background: #FFF5EE;
			color: $theme;
			border: 1rpx solid rgba($theme, 0.2);
		}

		&.delete {
			background: #F8F8F8;
			color: #999;
		}
	}

	.suggestion-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #222;
		margin-bottom: 12rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;

		.status-badge {
			font-size: 18rpx;
			padding: 4rpx 12rpx;
			border-radius: 6rpx;
			font-weight: normal;

			&.status-0 {
				background: #f0f0f0;
				color: #999;
			}

			&.status-1 {
				background: #EFFFF4;
				color: #4CAF50;
			}
		}
	}

	.suggestion-content {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 20rpx;
	}

	/* 图片网格自适应 */
	.suggestion-images {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10rpx;
		margin-top: 20rpx;
	}

	.image-wrapper {
		width: 100%;
		aspect-ratio: 1/1;
		border-radius: 12rpx;
		overflow: hidden;

		.suggestion-image {
			width: 100%;
			height: 100%;
		}
	}

	.images-count-1 {
		grid-template-columns: 1fr;

		.image-wrapper {
			aspect-ratio: 16/9;
		}
	}

	.images-count-2,
	.images-count-4 {
		grid-template-columns: repeat(2, 1fr);
	}

	/* 悬浮按钮 */
	.fab-btn {
		position: fixed;
		bottom: 60rpx;
		right: 40rpx;
		background: linear-gradient(135deg, $theme, #FFAC70);
		color: #fff;
		border-radius: 50rpx;
		padding: 24rpx 46rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		box-shadow: 0 10rpx 30rpx rgba($theme, 0.3);
		font-weight: bold;
		font-size: 28rpx;
	}

	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 100rpx;
		color: #ccc;
		font-size: 24rpx;
		gap: 20rpx;
	}
</style>