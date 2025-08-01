<template>
	<view class="business-opportunity-app">
		<!-- 顶部区域 -->
		<view class="header wechat-style">
			<!-- ... header部分内容保持不变 ... -->
			<view class="app-title">猩聚社</view>
			<view class="app-subtitle">商友连接·商机分享</view>
			<view class="app-description">连接全球精英商友</view>

			<view class="search-section">
				<view class="search-container">
					<uni-icons type="search" size="20" color="#FF6A00"></uni-icons>
					<!-- v-model绑定到新的searchQuery ref -->
					<input type="text" v-model="searchQuery" class="search-input" placeholder="搜索活动、商友或商机"
						confirm-type="search" @confirm="handleSearch" />
					<button class="search-button" @click="handleSearch">搜索</button>
				</view>
			</view>
		</view>

		<!-- 商机发现标题 -->
		<view class="section-title">商机发现</view>

		<!-- 导航标签栏 -->
		<view class="tabs">
			<!-- activeTab的key值与后端tabIndex对应，方便管理 -->
			<view class="tab" :class="{ active: activeTab === 1 }" @click="handleTabClick(1)">
				推荐
			</view>
			<view class="tab" :class="{ active: activeTab === 2 }" @click="handleTabClick(2)">
				附近
			</view>
			<view class="tab" :class="{ active: activeTab === 3 }" @click="handleTabClick(3)">
				关注
			</view>
			<view class="tab" :class="{ active: activeTab === 4 }" @click="handleTabClick(4)">
				🔥猎伙
			</view>
			<button class="post-button" @click="postNew">
				<uni-icons type="compose" size="18" color="#FFFFFF"></uni-icons>
				发帖
			</button>
		</view>

		<!-- 帖子列表 -->
		<view class="post-list">
			<!-- 帖子卡片 - 循环改为 postList -->
			<!-- 【请用这个已修正的 post-card 块替换掉原来的】 -->
			<view v-for="post in postList" :key="post.id" class="post-card" @click="handlePostClick(post)">
			    <view class="post-header">
			        <image :src="post.user.avatar" mode="aspectFill" class="avatar"
			            @click.stop="navigateToBusinessCard(post.user)">
			        </image>
			        <view class="user-info">
			            <view class="user-name">{{ post.user.name }}</view>
			            <view class="post-time">{{ post.time }}</view>
			        </view>
			        <!-- 【优化】只有登录后才可能显示关注按钮 -->
			        <button v-if="isLogin && loggedInUserId !== post.user.id" class="follow-button"
			            :class="{ 'followed': post.isFollowedUser }" @click.stop="toggleFollow(post)">
			            {{ post.isFollowedUser ? '已关注' : '关注' }}
			        </button>
			    </view>
			
			    <!-- ==================== 内容权限控制逻辑（已修正） ==================== -->
			    
			    <!-- 1. 公开内容：这部分移出 v-if，所有人都能看到 -->
			    <view class="post-content">
			        {{ post.title }}
			    </view>
			    <view class="post-images" v-if="post.images && post.images.length">
			        <view v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-wrapper">
			            <!-- 【优化】uniapp 中推荐使用 image 标签 -->
			            <image :src="image" alt="商机图片" class="post-image" mode="aspectFill" />
			        </view>
			    </view>
			    <view class="tags" v-if="post.tags && post.tags.length">
			        <view v-for="(tag, tagIndex) in post.tags" :key="tagIndex" class="tag">
			            {{ tag }}
			        </view>
			    </view>
			
			    <!-- 2. 私有/交互内容：这部分保留在 v-if 内，仅登录用户可见 -->
			    <template v-if="isLogin">
			        <view class="feedback-stats">
			            <view class="like-count">
			                <uni-icons type="hand-up-filled" size="18" color="#e74c3c"></uni-icons>
			                <span>{{ post.likes }}</span>
			            </view>
			            <view class="dislike-count">
			                <uni-icons type="hand-down-filled" size="18" color="#3498db"></uni-icons>
			                <span>{{ post.dislikes }}</span>
			            </view>
			        </view>
			        <view class="post-actions">
			            <view class="action-group">
			                <view class="action like" :class="{ active: post.userAction === 'like' }"
			                    @click.stop="toggleAction(post, 'like')">
			                    <uni-icons :type="post.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" size="20"
			                        :color="post.userAction === 'like' ? '#e74c3c' : '#666'"></uni-icons>
			                    <span>赞</span>
			                </view>
			                <view class="action dislike" :class="{ active: post.userAction === 'dislike' }"
			                    @click.stop="toggleAction(post, 'dislike')">
			                    <uni-icons :type="post.userAction === 'dislike' ? 'hand-down-filled' : 'hand-down'"
			                        size="20" :color="post.userAction === 'dislike' ? '#3498db' : '#666'"></uni-icons>
			                    <span>踩</span>
			                </view>
			            </view>
			            <view class="action-group">
			                <view class="action comment" :class="{ active: post.isSaved }" @click.stop="toggleSave(post)">
			                    <uni-icons :type="post.isSaved ? 'star-filled' : 'star'" size="20"
			                        :color="post.isSaved ? '#FF6A00' : '#666'"></uni-icons>
			                    <span>{{ post.isSaved ? '已收藏' : '收藏' }}</span>
			                </view>
			            </view>
			        </view>
			    </template>
			</view>

			<!-- 加载状态提示 -->
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
					<uni-load-more status="loading" contentText.loading="正在加载..."></uni-load-more>
				</view>
				<view v-else-if="loadingStatus === 'noMore'">
					<uni-load-more status="noMore" contentText.noMore="暂无更多内容"></uni-load-more>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted,
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh,
		onShow
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	const loggedInUserId = ref(null);
	const isLogin = ref(false);
	const member = ref('白银');
	const hasPaidMembership = computed(() => {
		const paidLevels = ['青铜', '白银', '黄金', '黑钻'];
		return paidLevels.includes(member.value);
	});
	const defaultAvatarUrl = '/static/icon/default-avatar.png';

	const postList = ref([]);
	const activeTab = ref(1);
	const searchQuery = ref('');

	const pageNo = ref(1);
	const pageSize = ref(10);
	const loadingStatus = ref('more');

	// ==================== 新增：状态锁，防止用户快速重复点击 ====================
	const isActionInProgress = ref(false);

	const location = reactive({
		longitude: '',
		latitude: ''
	});

	onShow(() => {
		console.log('页面显示，执行 onShow 钩子');
		// 每次页面显示时，都重新检查登录状态
		loggedInUserId.value = uni.getStorageSync('userId');
		isLogin.value = !!loggedInUserId.value;
		console.log('当前登录状态 isLogin:', isLogin.value);

		// 刷新列表数据
		getBusinessOpportunitiesList(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			getBusinessOpportunitiesList();
		}
	});

	onPullDownRefresh(() => {
		console.log('用户触发了下拉刷新');
		getBusinessOpportunitiesList(true);
	});


	function formatTimestamp(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	}

	const getBusinessOpportunitiesList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return; // 防止重复加载，但允许下拉刷新
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
	
		if (searchQuery.value) {
			params.searchKey = searchQuery.value;
		}
	
		if (activeTab.value === 2 && location.longitude && location.latitude) {
			params.longitude = location.longitude;
			params.latitude = location.latitude;
		}
	
		try {
			const { data: apiData, error } = await request('/app-api/member/business-opportunities/list', {
				method: 'GET',
				data: params
			});
			
			// 【核心修改】直接处理成功和失败两种情况
			if (error) {
				// 如果请求真的发生错误（网络问题、服务器500等）
				loadingStatus.value = 'more'; // 允许用户重试
				uni.showToast({ title: `加载失败: ${error}`, icon: 'none' });
				return; // 终止
			}
			
			// 如果请求成功 (error为null)，但后端返回的业务数据为空或格式不对
			if (!apiData || !apiData.list) {
				loadingStatus.value = 'noMore'; // 没有数据了
				if (isRefresh) {
					postList.value = []; // 刷新时清空
				}
				return;
			}
	
			// 【核心修改】数据映射逻辑保持不变，但要确保它能处理 memberUser 为 null 的情况
			const mappedData = apiData.list.map(item => ({
				id: item.id,
				content: item.postContent,
				title: item.postTitle,
				images: item.postImg ? String(item.postImg).split(',').filter(img => img) : [],
				tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',').filter(tag => tag)) : [],
				likes: item.likesCount || 0,
				dislikes: item.dislikesCount || 0,
				// 【关键】未登录时 userLikeStr 为 null，这是正确的
				userAction: item.userLikeStr || null, 
				// 【关键】未登录时 followFlag 为 0 或 null，这样 isSaved 就是 false，这是正确的
				isSaved: item.followFlag === 1,
				// 【关键】未登录时 followUserFlag 为 0 或 null，isFollowedUser 就是 false，这是正确的
				isFollowedUser: item.followUserFlag === 1, 
				time: formatTimestamp(item.createTime),
				user: {
					// 【关键】处理 memberUser 可能为 null 的情况
					id: item.memberUser?.id || item.userId, 
					name: item.memberUser?.nickname || '匿名用户',
					avatar: item.memberUser?.avatar || defaultAvatarUrl
				}
			}));
	
			if (isRefresh) {
				postList.value = mappedData;
			} else {
				postList.value = [...postList.value, ...mappedData];
			}
	
			if (postList.value.length >= apiData.total) {
				loadingStatus.value = 'noMore';
			} else {
				loadingStatus.value = 'more';
				pageNo.value++;
			}
	
		} catch (err) {
			// 捕获 try...catch 的异常，比如代码本身写的有问题
			console.error('getBusinessOpportunitiesList 逻辑异常:', err);
			loadingStatus.value = 'more'; // 允许用户重试
			uni.showToast({ title: '页面逻辑异常，请稍后重试', icon: 'none' });
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
			uni.getSetting({
				success: (res) => {
					if (res.authSetting['scope.userLocation']) {
						getLocationAndFetchData();
					} else {
						uni.authorize({
							scope: 'scope.userLocation',
							success: () => getLocationAndFetchData(),
							fail: () => {
								uni.showModal({
									title: '温馨提示',
									content: '您已拒绝获取位置信息，无法查看附近商机。请在设置中开启位置权限。',
									showCancel: false,
									confirmText: '我知道了'
								});
							}
						});
					}
				}
			});
		} else {
			getBusinessOpportunitiesList(true);
		}
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
				getBusinessOpportunitiesList(true);
			},
			fail: (err) => {
				getBusinessOpportunitiesList(true);
			},
			complete: () => uni.hideLoading()
		});
	};


	/**
	 * 切换点赞/踩状态
	 */
	const toggleAction = async (post, clickedAction) => {
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;

		const originalAction = post.userAction;
		const originalLikes = post.likes;
		const originalDislikes = post.dislikes;

		// 乐观更新UI
		if (post.userAction === clickedAction) {
			post.userAction = null;
			if (clickedAction === 'like') post.likes--;
			else post.dislikes--;
		} else {
			post.userAction = clickedAction;
			if (clickedAction === 'like') {
				post.likes++;
				if (originalAction === 'dislike') post.dislikes--;
			} else {
				post.dislikes++;
				if (originalAction === 'like') post.likes--;
			}
		}

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.id,
				targetType: 'post',
				action: post.userAction, // 发送更新后的action ('like', 'dislike' 或 null)
			};

			const result = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: requestData,
			});

			if (result && result.error) {
				// API失败，回滚UI
				post.userAction = originalAction;
				post.likes = originalLikes;
				post.dislikes = originalDislikes;
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			}

		} catch (error) {
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

	/**
	 * 切换收藏状态
	 */
	const toggleSave = async (post) => {
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;
		const originalStatus = post.isSaved;

		// 乐观更新
		post.isSaved = !originalStatus;

		const apiUrl = post.isSaved ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.id,
				targetType: 'post'
			};
			const result = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});
			console.log("触发收藏", result)

			if (result && result.error) {
				// 失败回滚
				post.isSaved = originalStatus;
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: post.isSaved ? '已收藏' : '已取消收藏',
					icon: 'none'
				});
			}
		} catch (error) {
			// 失败回滚
			post.isSaved = originalStatus;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};

	/**
	 * 切换关注用户状态
	 */
	const toggleFollow = async (post) => {
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;
		const originalStatus = post.isFollowedUser;

		// 乐观更新
		post.isFollowedUser = !originalStatus;

		const apiUrl = post.isFollowedUser ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.user.id,
				targetType: 'post_user'
			};
			const result = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});

			if (result && result.error) {
				// 失败回滚
				post.isFollowedUser = originalStatus;
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: post.isFollowedUser ? '已关注' : '已取消关注',
					icon: 'none'
				});
			}
		} catch (error) {
			// 失败回滚
			post.isFollowedUser = originalStatus;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};

	const sharePost = (post) => {
		uni.showToast({
			title: '分享功能即将上线',
			icon: 'none'
		});
	};

	const postNew = () => {
		uni.navigateTo({
			url: '/pages/home-opportunitiesPublish/home-opportunitiesPublish'
		});
	};

	const goToLogin = () => {
		// 4. 【修改】实现真正的跳转逻辑
		uni.navigateTo({
			// url: '/pages/index/index' 
			url: '/pages/login/login' 
		});
	};

	const goToMembership = () => {
		uni.showToast({
			title: '正在前往会员中心...',
			icon: 'none'
		});
	};

	const handlePostClick = (post) => {
		if (isLogin.value && hasPaidMembership.value) {
			skipCommercialDetail(post.id);
		} else if (isLogin.value && !hasPaidMembership.value) {
			goToMembership();
		} else {
			goToLogin();
		}
	};

	const skipApplicationBusinessCard = (userId) => {
		uni.navigateTo({
			url: `/pages/applicationBusinessCard/applicationBusinessCard?id=${userId}`
		});
	}

	const navigateToBusinessCard = (user) => {
		// 1. 【修正】移除对 `postDetail` 的引用，因为它在列表页不存在。
		//    在列表页，我们通常假设名片都是可以尝试查看的。
		//    真正的权限检查（如 cardFlag）应该在详情页或由后端接口处理。

		// 2. 检查传入的 user 对象和 user.id 是否有效
		if (!user || !user.id) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}

		// 3. 【核心】为 avatar 提供一个默认值，防止空字符串导致的问题
		const defaultAvatar = '/static/images/default-avatar.png'; // 请确保这个默认头像图片存在
		const avatarUrl = user.avatar || defaultAvatar;

		// 4. 构建带有多参数的URL，并使用 encodeURIComponent 编码
		const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(user.name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;

		console.log('从商机列表页跳转，URL:', url);

		// 5. 执行跳转
		uni.navigateTo({
			url: url
		});
	};

	const skipCommercialDetail = (postId) => {
		uni.navigateTo({
			url: `/pages/home-commercialDetail/home-commercialDetail?id=${postId}`
		});
	}

	const getLogin = () => {}
</script>

<style scoped>
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
		display: flex;
		align-items: center;
	}

	.search-input {
		border: none;
		outline: none;
		flex: 1;
		font-size: 28rpx;
		color: #555;
		background: transparent;
		padding: 0;
		min-height: 40rpx;
	}

	.search-button {
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 10rpx 30rpx;
		font-size: 28rpx;
		margin-left: 20rpx;
		-webkit-appearance: none;
		background-color: transparent;
		line-height: 1;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(255, 106, 0, 0.2);
		transition: all 0.2s ease;
	}

	.search-button::after {
		border: none;
	}

	.search-button:active {
		background: linear-gradient(135deg, #e05a00, #e07a00);
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 6rpx rgba(255, 106, 0, 0.3);
	}

	.uni-icons {
		vertical-align: middle;
	}

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
		transition: all 0.3s;
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
		-webkit-appearance: none;
		background-color: transparent;
	}

	.post-button::after {
		border: none;
	}

	.post-button uni-icons {
		margin-right: 10rpx;
	}

	.post-list {
		padding: 20rpx 30rpx;
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
	}

	.user-info {
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
		-webkit-appearance: none;
		line-height: 1;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2rpx 8rpx rgba(255, 106, 0, 0.2);
	}

	.follow-button::after {
		border: none;
	}

	.follow-button:active {
		opacity: 0.8;
		transform: translateY(1rpx);
	}

	.follow-button.followed {
		background: #e0e0e0;
		color: #666;
		box-shadow: none;
	}

	.post-content {
		font-size: 30rpx;
		line-height: 1.5;
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		color: #444;
		font-weight: 700;
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

	.post-actions {
		display: flex;
		justify-content: space-between;
		border-top: 2rpx solid #f0f0f0;
		padding-top: 30rpx;
	}

	.action-group {
		display: flex;
		gap: 40rpx;
	}

	.action {
		display: flex;
		align-items: center;
		color: #666;
		transition: all 0.2s;
	}

	.action uni-icons {
		margin-right: 12rpx;
	}

	.action:active {
		opacity: 0.7;
	}

	.content-placeholder {
		margin-top: 30rpx;
		padding: 60rpx 40rpx;
		background: rgba(249, 249, 249, 0.8);
		border: 2rpx dashed #ddd;
		border-radius: 20rpx;
		text-align: center;
		backdrop-filter: blur(4rpx);
		-webkit-backdrop-filter: blur(4rpx);
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
		-webkit-appearance: none;
		line-height: 1;
	}

	.placeholder-button::after {
		border: none;
	}

	.placeholder-button:active {
		opacity: 0.9;
		transform: scale(0.98);
	}

	/* 新增或修改的样式 */
	.loading-status {
		width: 100%;
		padding: 20rpx 0;
	}

	.no-posts-message {
		text-align: center;
		padding: 60rpx;
		color: #999;
		font-size: 32rpx;
	}

	.no-more-content-message {
		text-align: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 28rpx;
		margin-top: 20rpx;
	}
</style>