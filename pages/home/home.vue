<template>
	<div class="business-opportunity-app">
		<!-- 顶部区域 -->
		<div class="header wechat-style">
			<div class="app-title">聚一聚</div>
			<div class="app-subtitle">商友连接·商机分享</div>
			<div class="app-description">· ·连接全球精英商友· ·</div>

			<view class="search-section">
				<view class="search-container">
					<uni-icons type="search" size="20" color="#FF6A00"></uni-icons>
					<input type="text" v-model="searchQuery" class="search-input" placeholder="搜索活动、商友或商机"
						confirm-type="search" @confirm="handleSearch" />
					<button class="search-button" @click="handleSearch">搜索</button>
				</view>
			</view>
		</div>

		<!-- 商机发现标题 -->
		<div class="section-title">商机发现</div>

		<!-- 导航标签栏 -->
		<div class="tabs">
			<div class="tab" :class="{ active: activeTab === 'recommend' }" @click="handleTabClick('recommend')">
				推荐
			</div>
			<div class="tab" :class="{ active: activeTab === 'nearby' }" @click="handleTabClick('nearby')">
				附近
			</div>
			<div class="tab" :class="{ active: activeTab === 'follow' }" @click="handleTabClick('follow')">
				关注
			</div>
			<div class="tab" :class="{ active: activeTab === 'hunting' }" @click="handleTabClick('hunting')">
				创业猎伙
			</div>
			<button class="post-button" @click="postNew">
				<uni-icons type="compose" size="18" color="#FFFFFF"></uni-icons>
				发帖
			</button>
		</div>

		<!-- 帖子列表 -->
		<div class="post-list">
			<!-- 帖子卡片 -->
			<div v-for="post in displayedPosts" :key="post.id" class="post-card" @click="handlePostClick(post)">
				<div class="post-header">
					<div class="avatar" @click.stop="skipApplicationBusinessCard">{{ post.user.charAt(0) }}</div>
					<div class="user-info">
						<div class="user-name">{{ post.user }}</div>
						<div class="post-time">{{ post.time }}</div>
					</div>
					<button class="follow-button" :class="{ 'followed': post.isFollowed }"
						@click.stop="toggleFollow(post)">
						{{ post.isFollowed ? '已关注' : '关注' }}
					</button>
				</div>

				<!-- ==================== 内容权限控制逻辑 ==================== -->

				<!-- 条件1：用户已登录 并且 是付费会员 -->
				<template v-if="isLogin && hasPaidMembership">
					<div class="post-content">
						{{ post.content }}
					</div>
					<div class="post-images" v-if="post.images && post.images.length">
						<div v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-wrapper">
							<img :src="image" alt="商机图片" class="post-image" />
						</div>
					</div>
					<div class="tags">
						<div v-for="(tag, tagIndex) in post.tags" :key="tagIndex" class="tag">
							{{ tag }}
						</div>
					</div>
					<div class="feedback-stats">
						<div class="like-count">
							<uni-icons type="hand-up-filled" size="18" color="#e74c3c"></uni-icons>
							<span>{{ post.likes }}</span>
						</div>
						<div class="dislike-count">
							<uni-icons type="hand-down-filled" size="18" color="#3498db"></uni-icons>
							<span>{{ post.dislikes }}</span>
						</div>
					</div>
					<div class="post-actions">
						<div class="action-group">
							<div class="action like" :class="{ active: post.userAction === 'like' }"
								@click.stop="toggleAction(post, 'like')">
								<uni-icons :type="post.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" size="20"
									:color="post.userAction === 'like' ? '#e74c3c' : '#666'"></uni-icons>
								<span>赞</span>
							</div>
							<div class="action dislike" :class="{ active: post.userAction === 'dislike' }"
								@click.stop="toggleAction(post, 'dislike')">
								<uni-icons :type="post.userAction === 'dislike' ? 'hand-down-filled' : 'hand-down'"
									size="20" :color="post.userAction === 'dislike' ? '#3498db' : '#666'"></uni-icons>
								<span>踩</span>
							</div>
						</div>
						<div class="action-group">
							<div class="action comment" :class="{ active: post.saved }" @click.stop="toggleSave(post)">
								<uni-icons :type="post.saved ? 'star-filled' : 'star'" size="20"
									:color="post.saved ? '#FF6A00' : '#666'"></uni-icons>
								<span>收藏</span>
							</div>
							<div class="action share" @click.stop="sharePost(post)">
								<uni-icons type="redo" size="20" color="#666"></uni-icons>
								<span>分享</span>
							</div>
						</div>
					</div>
				</template>

				<!-- 条件2：用户已登录 但 是游客 -->
				<div v-else-if="isLogin && !hasPaidMembership" class="content-placeholder">
					<div class="placeholder-text">升级为会员，解锁全部商机信息</div>
					<button class="placeholder-button" @click.stop="goToMembership">立即升级</button>
				</div>

				<!-- 条件3：用户未登录 -->
				<div v-else class="content-placeholder">
					<div class="placeholder-text">登录后查看更多精彩内容</div>
					<button class="placeholder-button" @click.stop="goToLogin">立即登录</button>
				</div>

				<!-- ==================== 内容权限控制逻辑结束 ==================== -->
			</div>

			<!-- 如果没有帖子显示 -->
			<div v-if="displayedPosts.length === 0" class="no-posts-message">
				暂无相关商机，快去发布吧！
			</div>
			<!-- 新增：暂无更多内容提示 -->
			<div v-if="displayedPosts.length > 0" class="no-more-content-message">
				暂无更多内容
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted
	} from 'vue';

	import request from '../../utils/request.js';

	// 页面加载时获取精选报告
	onMounted(() => {
		getLogin();
	});

	// ==================== 用户状态模拟 ====================
	// 定义isLogin字段，模拟用户登录状态。true为已登录，false为未登录
	// 您可以在实际应用中根据后端返回或本地存储来改变这个值
	const isLogin = ref(true);

	// 定义member字段，模拟用户会员等级。
	// 可选值: '游客', '青铜', '白银', '黄金', '黑钻'
	const member = ref('白银');

	// 计算属性，用于判断用户是否为付费会员，让模板代码更简洁
	const hasPaidMembership = computed(() => {
		const paidLevels = ['青铜', '白银', '黄金', '黑钻'];
		return paidLevels.includes(member.value);
	});
	// =========================================================

	const openId = ref('')
	const sessionKey = ref('')
	const getLogin = () => {
		uni.login({
			success(res) {
				console.log('login', res)
				if (res.code) {
					uni.request({
						url: 'https://api.weixin.qq.com/sns/jscode2session',
						data: {
							appid: 'wx5710552f6a4d9a21',
							secret: '40cd5c7376efe0bd9adf43325aaf1c42',
							js_code: res.code,
							grant_type: 'authorization_code'
						},
						success: (response) => {
							console.log('res', response)
							openId.value = response.data.openid;
							sessionKey.value = response.data.session_key;
						}
					})
				} else {
					console.log('登录失败！' + res.errMsg)
				}
			}
		})
	}

	// 当前激活的标签页
	const activeTab = ref('recommend');

	// 搜索框的响应式数据
	const searchQuery = ref('');

	// 处理搜索按钮点击和键盘回车事件
	const handleSearch = () => {
		console.log('用户搜索内容:', searchQuery.value);
	};

	// 帖子数据 (模拟不同分类的帖子数据)
	const recommendPosts = reactive([{
		id: 1,
		user: '陈总',
		time: '2025-06-15 20:44:34',
		content: '我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统，有意向的可以私信我详谈。',
		images: ['../../static/abc.png', '../../static/abc.png', '../../static/abc.png'],
		tags: ['#技术合作', '#AI开发', '#商务合作'],
		likes: 24,
		dislikes: 3,
		userAction: null,
		saved: false,
		isFollowed: false
	}, ]);

	const nearbyPosts = reactive([{
		id: 4,
		user: '王老板',
		time: '2025-06-15 18:00:00',
		content: '我在XX商圈新开了一家智能咖啡馆，提供共享办公空间和优质咖啡，欢迎附近的朋友来体验！',
		images: ['../../static/abc.png', '../../static/abc.png', '../../static/abc.png', '../../static/abc.png',
			'../../static/abc.png', '../../static/abc.png'
		],
		tags: ['#本地商机', '#餐饮', '#共享空间'],
		likes: 12,
		dislikes: 1,
		userAction: null,
		saved: false,
		isFollowed: false,
	}, ]);

	const followPosts = reactive([{
		id: 6,
		user: 'A股大V',
		time: '2025-06-15 10:00:00',
		content: '分享近期对新能源汽车板块的看法，认为下半年仍有较大增长潜力，欢迎交流。',
		images: ['../../static/abc.png'],
		tags: ['#股市分析', '#新能源', '#投资'],
		likes: 100,
		dislikes: 10,
		userAction: null,
		saved: false,
		isFollowed: false
	}, ]);

	const huntingPosts = reactive([{
		id: 8,
		user: '猎头-张',
		time: '2025-06-16 09:00:00',
		content: '寻找一位有经验的全栈开发工程师，加入一个快速发展的金融科技初创公司，技术栈要求Vue + Node.js，待遇优厚，有期权激励。',
		images: [],
		tags: ['#人才招聘', '#全栈工程师', '#金融科技'],
		likes: 55,
		dislikes: 1,
		userAction: null,
		saved: false,
		isFollowed: false
	}, {
		id: 9,
		user: '创业者-刘',
		time: '2025-06-16 11:30:00',
		content: '我的新项目是一个基于社区的二手环保交易平台，已完成MVP，寻求一位市场合伙人共同开拓市场。有相关经验的请联系我！',
		images: ['../../static/abc.png'],
		tags: ['#寻找合伙人', '#市场推广', '#环保项目'],
		likes: 68,
		dislikes: 2,
		userAction: null,
		saved: false,
		isFollowed: false
	}]);


	// 根据 activeTab 动态显示帖子列表
	const displayedPosts = computed(() => {
		switch (activeTab.value) {
			case 'recommend':
				return recommendPosts;
			case 'nearby':
				return nearbyPosts;
			case 'follow':
				return followPosts;
			case 'hunting':
				return huntingPosts;
			default:
				return [];
		}
	});

	/**
	 * 切换点赞/踩状态
	 */
	const toggleAction = (post, action) => {
		if (post.userAction === action) {
			post.userAction = null;
			if (action === 'like') post.likes--;
			else post.dislikes--;
		} else {
			const prevAction = post.userAction;
			post.userAction = action;
			if (action === 'like') {
				post.likes++;
				if (prevAction === 'dislike') post.dislikes--;
			} else {
				post.dislikes++;
				if (prevAction === 'like') post.likes--;
			}
		}
	};

	/**
	 * 切换收藏状态
	 */
	const toggleSave = (post) => {
		post.saved = !post.saved;
		uni.showToast({
			title: post.saved ? '已收藏' : '已取消收藏',
			icon: 'none'
		});
	};

	/**
	 * 切换关注状态
	 */
	const toggleFollow = (post) => {
		post.isFollowed = !post.isFollowed;
		uni.showToast({
			title: post.isFollowed ? '已关注' : '已取消关注',
			icon: 'none'
		});
	};

	/**
	 * 分享帖子
	 */
	const sharePost = (post) => {
		uni.showToast({
			title: '分享功能即将上线',
			icon: 'none'
		});
	};

	/**
	 * 跳转到发布新帖页面
	 */
	const postNew = () => {
		uni.navigateTo({
			url: '/pages/home-opportunitiesPublish/home-opportunitiesPublish'
		})
	};

	/**
	 * 处理跳转到登录页面的函数
	 */
	const goToLogin = () => {
		console.log('触发跳转到登录页面');
		// 在此替换为您的真实登录页路径
		// uni.navigateTo({ url: '/pages/login/login' });
		uni.showToast({
			title: '正在前往登录页...',
			icon: 'none'
		});
	};

	/**
	 * 处理跳转到会员页面的函数
	 */
	const goToMembership = () => {
		console.log('触发跳转到会员升级页面');
		// 在此替换为您的真实会员页路径
		// uni.navigateTo({ url: '/pages/membership/membership' });
		uni.showToast({
			title: '正在前往会员中心...',
			icon: 'none'
		});
	};

	/**
	 * 帖子卡片点击事件处理
	 */
	const handlePostClick = (post) => {
		if (isLogin.value && hasPaidMembership.value) {
			skipCommercialDetail(post.id);
		} else if (isLogin.value && !hasPaidMembership.value) {
			goToMembership();
		} else {
			goToLogin();
		}
	};

	/**
	 * 跳转到个人名片页面
	 */
	const skipApplicationBusinessCard = () => {
		uni.navigateTo({
			url: '/pages/applicationBusinessCard/applicationBusinessCard'
		})
	}

	/**
	 * 跳转到商机详情页
	 */
	const skipCommercialDetail = (postId) => {
		uni.navigateTo({
			url: `/pages/home-commercialDetail/home-commercialDetail?id=${postId}`
		})
	}

	let lastLocationFetchTimestamp = 0;
	const FETCH_LOCATION_MIN_INTERVAL = 5000;

	/**
	 * 处理标签页点击事件
	 */
	const handleTabClick = (tabName) => {
		if (tabName === 'nearby') {
			uni.getSetting({
				success: (res) => {
					if (res.authSetting['scope.userLocation']) {
						tryGetLocationAndSwitchTab(tabName);
					} else {
						uni.authorize({
							scope: 'scope.userLocation',
							success: () => {
								tryGetLocationAndSwitchTab(tabName);
							},
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
				},
				fail: (err) => {
					uni.showToast({
						title: '检查权限失败',
						icon: 'none'
					});
				}
			});
		} else {
			activeTab.value = tabName;
		}
	};

	/**
	 * 尝试获取用户地理位置并切换标签页
	 */
	const tryGetLocationAndSwitchTab = (tabName) => {
		const currentTime = Date.now();
		if (currentTime - lastLocationFetchTimestamp < FETCH_LOCATION_MIN_INTERVAL) {
			activeTab.value = tabName;
			uni.showToast({
				title: '位置信息已是最新',
				icon: 'none',
				duration: 1000
			});
			return;
		}

		uni.getLocation({
			type: 'wgs84',
			success: (res) => {
				console.log('用户位置信息:', res);
				uni.showToast({
					title: '位置获取成功',
					icon: 'success',
					duration: 1000
				});
				activeTab.value = tabName;
				lastLocationFetchTimestamp = currentTime;
			},
			fail: (err) => {
				console.error('获取位置失败', err);
				let errorMessage = '获取位置失败，无法查看附近商机。';
				if (err.errMsg.includes('频繁调用')) {
					errorMessage = '您点击太快啦，请稍后再试。';
				} else if (err.errMsg.includes('denied')) {
					errorMessage = '您已拒绝获取位置信息，无法查看附近商机。请检查系统设置。';
				}
				uni.showModal({
					title: '温馨提示',
					content: errorMessage,
					showCancel: false,
					confirmText: '我知道了'
				});
			}
		});
	};
</script>

<style scoped>
	.business-opportunity-app {
		background-color: #f9f9f9;
		color: #333;
		max-width: 1000rpx;
		margin: 0 auto;
		padding-bottom: 160rpx;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

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
		padding: 0 30rpx;
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