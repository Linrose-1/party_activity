<template>
	<view class="business-opportunity-app">
		<!-- ==================== 1. 顶部区域 ==================== -->
		<view class="header wechat-style">
			<view class="app-title">猩聚社</view>
			<view class="app-subtitle">商友连接·商机分享</view>
			<view class="app-description">连接全球精英商友</view>
			<view class="search-section">
				<view class="search-container">
					<uni-icons type="search" size="20" color="#FF6A00"></uni-icons>
					<input type="text" v-model="searchQuery" class="search-input" placeholder="搜索商友或商机"
						confirm-type="search" @confirm="handleSearch" />
					<button class="search-button" @click="handleSearch">搜索</button>
				</view>
			</view>
		</view>

		<!-- ==================== 2. 导航与操作区 ==================== -->
		<view class="section-title">商友圈</view>
		<view class="tabs">
			<view class="tab" :class="{ active: activeTab === 1 }" @click="handleTabClick(1)">推荐</view>
			<view class="tab" :class="{ active: activeTab === 2 }" @click="handleTabClick(2)">附近</view>
			<view class="tab" :class="{ active: activeTab === 3 }" @click="handleTabClick(3)">关注</view>
			<view class="tab" :class="{ active: activeTab === 4 }" @click="handleTabClick(4)">֍猎伙</view>
			<button class="post-button" @click="postNew">
				<uni-icons type="compose" size="18" color="#FFFFFF"></uni-icons>
				发帖
			</button>
		</view>

		<!-- ==================== 3. 帖子列表 ==================== -->
		<view class="post-list">
			<view v-for="post in postList" :key="post.id" class="post-card" @click="handlePostClick(post)">
				<!-- 3.1 卡片头部 -->
				<view class="post-header">
					<image :src="post.user.avatar" mode="aspectFill" class="avatar"
						@click.stop="navigateToBusinessCard(post.user)" />
					<view class="user-info">
						<view class="user-name">{{ post.user.name }}</view>
						<view class="post-time">{{ post.time }}</view>
					</view>
					<button v-if="isLogin && loggedInUserId !== post.user.id" class="follow-button"
						:class="{ 'followed': post.isFollowedUser }" @click.stop="toggleFollow(post)">
						{{ post.isFollowedUser ? '已关注' : '关注' }}
					</button>
				</view>

				<!-- 3.2 卡片内容 (公开) -->
				<view class="post-content-title">{{ post.title }}</view>
				<view v-if="post.contentPreview" class="post-content-preview">{{ post.contentPreview }}</view>
				<view class="post-images" v-if="post.images && post.images.length">
					<view v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-wrapper">
						<image :src="image" alt="商机图片" class="post-image" mode="aspectFill" />
					</view>
				</view>
				<view class="tags" v-if="post.tags && post.tags.length">
					<view v-for="(tag, tagIndex) in post.tags" :key="tagIndex" class="tag">{{ tag }}</view>
				</view>

				<!-- 3.3 卡片交互 (登录后可见) -->
				<template v-if="isLogin">
					<view class="post-actions">
						<view class="action like" :class="{ active: post.userAction === 'like' }"
							@click.stop="toggleAction(post, 'like')">
							<uni-icons :type="post.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" size="20"
								:color="post.userAction === 'like' ? '#e74c3c' : '#666'" />
							<span>{{ post.likes }}</span>
						</view>
						<view class="action dislike" :class="{ active: post.userAction === 'dislike' }"
							@click.stop="toggleAction(post, 'dislike')">
							<uni-icons :type="post.userAction === 'dislike' ? 'hand-down-filled' : 'hand-down'"
								size="20" :color="post.userAction === 'dislike' ? '#3498db' : '#666'" />
							<span>{{ post.dislikes }}</span>
						</view>
						<view class="action comment" @click.stop="navigateToComments(post)">
							<uni-icons type="chatbubble" size="20" color="#666" />
							<span>{{ post.comments }}</span>
						</view>
						<view class="action save" :class="{ active: post.isSaved }" @click.stop="toggleSave(post)">
							<uni-icons :type="post.isSaved ? 'star-filled' : 'star'" size="20"
								:color="post.isSaved ? '#FF6A00' : '#666'" />
							<span>{{ post.isSaved ? '已收藏' : '收藏' }}</span>
						</view>
						<view class="action delete-btn" v-if="isLogin && loggedInUserId === post.user.id"
							@click.stop="deletePost(post)">
							<uni-icons type="trash" size="20" color="#e74c3c" />
						</view>
					</view>
				</template>
			</view>

			<!-- 3.4 列表加载状态 -->
			<view class="loading-status">
				<view v-if="!isLogin && postList.length === 0" class="content-placeholder"
					style="margin-top: 40rpx; border: none; background: transparent;">
					<view class="placeholder-text">登录后查看更多精彩内容</view>
					<button class="placeholder-button" @click.stop="goToLogin">立即登录</button>
				</view>
				<view v-else-if="isLogin && postList.length === 0 && loadingStatus === 'noMore'"
					class="no-posts-message">
					暂无相关商机！
				</view>
				<view v-else-if="loadingStatus === 'loading'">
					<uni-load-more status="loading" contentText.loading="正在加载..." />
				</view>
				<view v-else-if="loadingStatus === 'noMore'">
					<uni-load-more status="noMore" contentText.noMore="暂无更多内容" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh,
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import {
		getInviteCode
	} from '../../utils/user.js';


	// ============================
	// 1. 响应式状态定义 (Refs & Reactives)
	// ============================

	// 用户与权限状态
	const loggedInUserId = ref(null);
	const isLogin = ref(false);
	const member = ref('白银'); // 示例会员等级

	// 列表与筛选状态
	const postList = ref([]);
	const activeTab = ref(1);
	const searchQuery = ref('');

	// 分页与加载状态
	const pageNo = ref(1);
	const pageSize = ref(10);
	const loadingStatus = ref('more'); // 'more', 'loading', 'noMore'

	// 操作锁定状态
	const isActionInProgress = ref(false);

	// 地理位置状态
	const location = reactive({
		longitude: '',
		latitude: ''
	});

	const defaultAvatarUrl = '/static/icon/default-avatar.png';


	// ============================
	// 2. 计算属性 (Computed)
	// ============================

	const hasPaidMembership = computed(() => {
		const paidLevels = ['青铜', '白银', '黄金', '黑钻'];
		return paidLevels.includes(member.value);
	});

	// ============================
	// 3. 生命周期钩子 (Lifecycle Hooks)
	// ============================

	onShow(() => {
		// 每次进入页面时检查登录状态并刷新数据
		loggedInUserId.value = uni.getStorageSync('userId');
		isLogin.value = !!loggedInUserId.value;
		getBusinessOpportunitiesList(true);

		// 确保分享菜单总是可用
		uni.showShareMenu({
			withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			getBusinessOpportunitiesList();
		}
	});

	onPullDownRefresh(() => {
		getBusinessOpportunitiesList(true);
	});

	// ============================
	// 4. 分享逻辑 (Sharing Logic)
	// ============================

	onShareAppMessage(() => {
		const sharerId = uni.getStorageSync('userId');
		const inviteCode = getInviteCode();

		const params = [];
		if (sharerId) params.push(`sharerId=${sharerId}`);
		if (inviteCode) params.push(`inviteCode=${inviteCode}`);

		const sharePath = `/pages/home/home${params.length > 0 ? '?' + params.join('&') : ''}`;

		return {
			title: '发现了一个每天都想打开的商友社交小工具！点戳进入☞☞',
			path: sharePath,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	onShareTimeline(() => {
		const sharerId = uni.getStorageSync('userId');
		const inviteCode = getInviteCode();

		const params = [];
		if (sharerId) params.push(`sharerId=${sharerId}`);
		if (inviteCode) params.push(`inviteCode=${inviteCode}`);

		const queryString = params.join('&');

		return {
			title: '发现了一个每天都想打开的商友社交小工具！点戳进入☞☞',
			query: queryString,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	// ============================
	// 5. 主要业务方法 (Business Methods)
	// ============================

	const getBusinessOpportunitiesList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;
		loadingStatus.value = 'loading';

		if (isRefresh) {
			pageNo.value = 1;
			postList.value = [];
			loadingStatus.value = 'more';
		}

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize.value,
			tabIndex: activeTab.value,
		};
		if (searchQuery.value) params.searchKey = searchQuery.value;
		if (activeTab.value === 2 && location.longitude && location.latitude) {
			params.longitude = location.longitude;
			params.latitude = location.latitude;
		}

		try {
			const {
				data: apiData,
				error
			} = await request('/app-api/member/business-opportunities/list', {
				method: 'GET',
				data: params
			});

			if (error || !apiData || !apiData.list) {
				loadingStatus.value = error ? 'more' : 'noMore';
				if (error) uni.showToast({
					title: `加载失败: ${error}`,
					icon: 'none'
				});
				if (isRefresh) postList.value = [];
				return;
			}

			const mappedData = apiData.list.map(item => ({
				id: item.id,
				title: item.postTitle,
				contentPreview: generateContentPreview(item.postContent),
				images: item.postImg ? String(item.postImg).split(',').filter(img => img) : [],
				tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',')
					.filter(tag => tag)) : [],
				likes: item.likesCount || 0,
				dislikes: item.dislikesCount || 0,
				comments: item.commentsCount || 0,
				userAction: item.userLikeStr || null,
				isSaved: item.followFlag === 1,
				isFollowedUser: item.followUserFlag === 1,
				time: formatTimestamp(item.createTime),
				user: {
					id: item.memberUser?.id || item.userId,
					name: item.memberUser?.nickname || '匿名用户',
					avatar: item.memberUser?.avatar || defaultAvatarUrl
				}
			}));

			postList.value = isRefresh ? mappedData : [...postList.value, ...mappedData];

			if (postList.value.length >= apiData.total) {
				loadingStatus.value = 'noMore';
			} else {
				loadingStatus.value = 'more';
				pageNo.value++;
			}
		} catch (err) {
			console.error('getBusinessOpportunitiesList 逻辑异常:', err);
			loadingStatus.value = 'more';
			uni.showToast({
				title: '页面逻辑异常，请稍后重试',
				icon: 'none'
			});
		} finally {
			uni.stopPullDownRefresh();
		}
	};

	const handleSearch = () => {
		getBusinessOpportunitiesList(true);
	};

	const handleTabClick = (tabIndex) => {
		if (activeTab.value === tabIndex) return;
		activeTab.value = tabIndex;

		if (tabIndex === 2) {
			checkAndGetLocation();
		} else {
			getBusinessOpportunitiesList(true);
		}
	};

	const checkAndGetLocation = () => {
		uni.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userLocation']) {
					getLocationAndFetchData();
				} else {
					uni.authorize({
						scope: 'scope.userLocation',
						success: () => getLocationAndFetchData(),
						fail: () => uni.showModal({
							title: '温馨提示',
							content: '您已拒绝获取位置信息，无法查看附近商机。请在设置中开启位置权限。',
							showCancel: false,
							confirmText: '我知道了'
						}),
					});
				}
			}
		});
	};

	const getLocationAndFetchData = () => {
		uni.showLoading({
			title: '正在定位...'
		});
		uni.getLocation({
			type: 'wgs84',
			success: (res) => {
				location.longitude = res.longitude.toString();
				location.latitude = res.latitude.toString();
			},
			complete: () => {
				uni.hideLoading();
				getBusinessOpportunitiesList(true);
			}
		});
	};

	// ============================
	// 6. 卡片交互方法 (Card Interaction Methods)
	// ============================

	const toggleAction = async (post, clickedAction) => {
		if (isActionInProgress.value || !isLogin.value) return;
		isActionInProgress.value = true;

		const originalAction = post.userAction;
		const originalLikes = post.likes;
		const originalDislikes = post.dislikes;

		// 乐观更新 UI
		if (post.userAction === clickedAction) {
			post.userAction = null;
			if (clickedAction === 'like') post.likes--;
			else post.dislikes--;
		} else {
			if (clickedAction === 'like') {
				post.likes++;
				if (originalAction === 'dislike') post.dislikes--;
			} else {
				post.dislikes++;
				if (originalAction === 'like') post.likes--;
			}
			post.userAction = clickedAction;
		}

		try {
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: post.id,
					targetType: 'post',
					action: post.userAction,
				},
			});

			if (error) {
				// API失败，回滚UI
				post.userAction = originalAction;
				post.likes = originalLikes;
				post.dislikes = originalDislikes;
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			}
		} catch (err) {
			// 网络异常，回滚UI
			post.userAction = originalAction;
			post.likes = originalLikes;
			post.dislikes = originalDislikes;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};

	const toggleGenericFollow = async (post, type, targetId, statusKey, successMsg, failureMsg) => {
		if (isActionInProgress.value || !isLogin.value) return;
		isActionInProgress.value = true;

		const originalStatus = post[statusKey];
		post[statusKey] = !originalStatus;

		const apiUrl = post[statusKey] ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		try {
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: {
					targetId: targetId,
					targetType: type
				}
			});

			if (error) {
				post[statusKey] = originalStatus; // 回滚
				uni.showToast({
					title: failureMsg,
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: post[statusKey] ? successMsg.add : successMsg.remove,
					icon: 'none'
				});
			}
		} catch (err) {
			post[statusKey] = originalStatus; // 回滚
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};

	const toggleSave = (post) => {
		toggleGenericFollow(
			post,
			'post',
			post.id,
			'isSaved', {
				add: '已收藏',
				remove: '已取消收藏'
			},
			'收藏失败'
		);
	};

	const toggleFollow = (post) => {
		toggleGenericFollow(
			post,
			'post_user',
			post.user.id,
			'isFollowedUser', {
				add: '已关注',
				remove: '已取消关注'
			},
			'关注失败'
		);
	};

	const deletePost = (postToDelete) => {
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
							id: postToDelete.id
						}
					});
					uni.hideLoading();

					if (error) {
						uni.showToast({
							title: `删除失败: ${error}`,
							icon: 'none'
						});
						return;
					}

					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
					const index = postList.value.findIndex(p => p.id === postToDelete.id);
					if (index !== -1) {
						postList.value.splice(index, 1);
					}
				}
			}
		});
	};

	// ============================
	// 7. 导航方法 (Navigation Methods)
	// ============================

	const handlePostClick = (post) => {
		if (!isLogin.value) {
			goToLogin();
		} else if (!hasPaidMembership.value) {
			goToMembership();
		} else {
			skipCommercialDetail(post.id);
		}
	};

	const navigateToComments = (post) => {
		// 复用卡片点击的权限检查逻辑
		if (!isLogin.value) {
			goToLogin();
		} else if (!hasPaidMembership.value) {
			goToMembership();
		} else {
			uni.navigateTo({
				url: `/packages/home-commercialDetail/home-commercialDetail?id=${post.id}&scrollTo=comments`
			});
		}
	};

	const navigateToBusinessCard = (user) => {
		if (!user || !user.id) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}
		const avatarUrl = user.avatar || defaultAvatarUrl;
		const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(user.name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;
		uni.navigateTo({
			url
		});
	};

	const postNew = () => uni.navigateTo({
		url: '/pages/home-opportunitiesPublish/home-opportunitiesPublish'
	});
	const goToLogin = () => uni.navigateTo({
		url: '/pages/index/index'
	}); // 指向登录页
	const goToMembership = () => uni.showToast({
		title: '正在前往会员中心...',
		icon: 'none'
	});
	const skipCommercialDetail = (postId) => uni.navigateTo({
		url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
	});

	// ============================
	// 8. 辅助/工具函数 (Helper/Util Functions)
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

	const generateContentPreview = (content) => {
		if (!content) return '';
		const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
		return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
	};
</script>

<style scoped>
	/* =========================
	 * 1. 页面通用与头部样式
	 * ========================= */
	.header {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		padding: 40rpx 40rpx 60rpx;
		border-radius: 0 0 40rpx 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	.header::before {
		content: "";
		position: absolute;
		top: -60rpx;
		right: -60rpx;
		width: 240rpx;
		height: 240rpx;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
	}

	.app-title {
		font-size: 56rpx;
		font-weight: 700;
		margin-bottom: 16rpx;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.app-subtitle {
		font-size: 32rpx;
		margin-bottom: 10rpx;
		opacity: 0.95;
	}

	.app-description {
		font-size: 28rpx;
		margin-bottom: 40rpx;
		opacity: 0.9;
	}

	.search-container {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 60rpx;
		padding: 20rpx 40rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}

	.search-container uni-icons {
		margin-right: 20rpx;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #555;
		background: transparent;
	}

	.search-button {
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 10rpx 30rpx;
		font-size: 28rpx;
		font-weight: bold;
		margin-left: 20rpx;
		line-height: 1;
		box-shadow: 0 4rpx 10rpx rgba(255, 106, 0, 0.2);
		transition: all 0.2s ease;
	}

	.search-button:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 6rpx rgba(255, 106, 0, 0.3);
	}

	.search-button::after,
	.post-button::after,
	.follow-button::after,
	.placeholder-button::after {
		border: none;
	}

	/* =========================
	 * 2. 导航栏 (Tabs) 样式
	 * ========================= */
	.section-title {
		font-size: 40rpx;
		font-weight: 700;
		padding: 40rpx 40rpx 30rpx;
		color: #FF6A00;
		display: flex;
		align-items: center;
	}

	.section-title::before {
		content: "";
		display: inline-block;
		width: 8rpx;
		height: 40rpx;
		background: #FF6A00;
		border-radius: 4rpx;
		margin-right: 20rpx;
	}

	.tabs {
		display: flex;
		background: white;
		padding: 0 40rpx;
		border-bottom: 2rpx solid #eee;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab {
		flex: 1;
		text-align: center;
		padding: 40rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;
		transition: color 0.3s, font-weight 0.3s;
	}

	.tab.active {
		color: #FF6A00;
		font-weight: 600;
	}

	.tab.active::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48rpx;
		height: 6rpx;
		background: #FF6A00;
		border-radius: 6rpx;
	}

	.post-button {
		background: linear-gradient(to right, #FF6A00, #FF8C37);
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 0 32rpx;
		margin: 15rpx 0;
		font-size: 28rpx;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
		display: flex;
		align-items: center;
		margin-left: 30rpx;
	}

	.post-button uni-icons {
		margin-right: 10rpx;
	}

	/* =========================
	 * 3. 帖子卡片 (Post Card) 样式
	 * ========================= */
	.post-list {
		padding: 20rpx 30rpx;
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

	/* 3.1 卡片头部 */
	.post-header {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 10rpx;
		margin-right: 24rpx;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-weight: 600;
		font-size: 32rpx;
		margin-bottom: 6rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.post-time {
		font-size: 26rpx;
		color: #888;
	}

	.follow-button {
		background-color: #FF6A00;
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 10rpx 28rpx;
		font-size: 26rpx;
		font-weight: 500;
		margin-left: 20rpx;
		white-space: nowrap;
		line-height: 1.5;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2rpx 8rpx rgba(255, 106, 0, 0.2);
	}

	.follow-button.followed {
		background: #e0e0e0;
		color: #666;
		box-shadow: none;
	}

	/* 3.2 卡片内容 */
	.post-content-title {
		font-size: 30rpx;
		line-height: 1.5;
		margin-top: 30rpx;
		color: #444;
		font-weight: 700;
	}

	.post-content-preview {
		font-size: 28rpx;
		line-height: 1.6;
		margin-top: 16rpx;
		color: #666;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.post-images {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
		margin-top: 30rpx;
	}

	.image-wrapper {
		width: 100%;
		aspect-ratio: 1 / 1;
		border-radius: 12rpx;
		overflow: hidden;
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
		margin-top: 30rpx;
	}

	.tag {
		background: #fff0e6;
		color: #FF6A00;
		padding: 10rpx 24rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
	}

	/* 3.3 卡片交互 */
	.post-actions {
		display: flex;
		justify-content: space-around;
		align-items: center;
		border-top: 2rpx solid #f0f0f0;
		padding-top: 30rpx;
		margin-top: 30rpx;
	}

	.action {
		display: flex;
		align-items: center;
		color: #666;
		font-size: 28rpx;
		transition: color 0.2s;
	}

	.action uni-icons {
		margin-right: 12rpx;
	}

	.action span {
		line-height: 1;
	}

	.action:active {
		opacity: 0.7;
	}

	.action.active {
		/* 激活状态的通用样式，具体颜色由内联 color 属性控制 */
		font-weight: 500;
	}

	.action.delete-btn {
		padding: 0 10rpx;
	}

	/* =========================
	 * 4. 列表状态提示样式
	 * ========================= */
	.loading-status {
		width: 100%;
		padding: 20rpx 0;
	}

	.content-placeholder {
		margin-top: 30rpx;
		padding: 60rpx 40rpx;
		text-align: center;
	}

	.placeholder-text {
		font-size: 30rpx;
		color: #666;
		margin-bottom: 40rpx;
	}

	.placeholder-button {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 16rpx 60rpx;
		font-size: 28rpx;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
		line-height: 1.5;
	}

	.no-posts-message {
		text-align: center;
		padding: 60rpx;
		color: #999;
		font-size: 32rpx;
	}
</style>