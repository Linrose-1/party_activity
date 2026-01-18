<template>
	<view class="business-opportunity-app">
		<view v-if="!isPageReady" class="full-screen-loading">
			<uni-icons type="spinner-cycle" size="40" color="#FF6A00" class="loading-icon"></uni-icons>
			<text class="loading-text">正在加载商友圈...</text>
		</view>
		<!-- <view class="custom-fab" @click="goToCustomizationPage">
			<uni-icons type="gear-filled" size="20" color="#FFFFFF"></uni-icons>
			<text>定制</text>
		</view> -->
		<!-- ==================== 1. 顶部区域 ==================== -->
		<view class="header wechat-style">

			<!-- 轮播区域 -->
			<swiper class="header-swiper" :indicator-dots="false" :autoplay="false" :circular="true" :vertical="false"
				interval="4000" duration="500" indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#FFFFFF"
				@click="goToCustomizationPage">
				<swiper-item v-for="(slide, index) in headerSlides" :key="index">
					<view class="header-content">
						<view class="app-title">{{ slide.title }}</view>
						<view class="app-subtitle">{{ slide.slogan }}</view>
						<!-- 描述文案是共用的，放在 swiper-item 里 -->
						<view class="app-description">{{ pageDescription }}</view>
					</view>
				</swiper-item>
			</swiper>


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
		<view class="nav-header-row">
			<!-- 左侧标题 -->
			<view class="section-title">商友圈</view>

			<!-- 右侧滚动条 (跑马灯) -->
			<view class="notice-bar" v-if="scrollBarData.length > 0">
				<view class="notice-icon">
					<uni-icons type="sound" size="14" color="#FF6A00"></uni-icons>
				</view>
				<swiper class="notice-swiper" vertical autoplay circular :interval="3000" :duration="500">
					<swiper-item v-for="(item, index) in scrollBarData" :key="index">
						<!-- 必须要有个容器包住，并且宽高100% -->
						<view class="swiper-item-box" @click="handleNoticeClick(item)">
							<text class="notice-text">{{ item.label }}</text>
							<text class="notice-num">（{{ item.count }}）</text>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</view>
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
					<!-- <image :src="post.user.avatar" mode="aspectFill" class="avatar"
						@click.stop="navigateToBusinessCard(post.user)" /> -->
					<image :src="post.user.avatar" mode="aspectFill" class="avatar"
						@click.stop="handleAvatarClick(post.user)" />
					<view class="user-info">
						<!-- 第一行：用户名 -->
						<view class="user-name">{{ post.user.name }}</view>

						<!-- 第二行：认证标识 -->
						<view class="user-certs-line">
							<!-- 蓝V图标 (企业认证) -->
							<image v-if="post.user.isEnterpriseVerified" src="/static/icon/企业认证.png"
								class="cert-icon" />

							<!-- 已实名 (个人认证) -->
							<text v-if="post.user.isIdVerified" class="cert-badge real-name">已实名</text>

							<!-- 已认证 (企业号认证) -->
							<text v-if="post.user.isEnterprise" class="cert-badge enterprise">已认证</text>
						</view>
					</view>
					<button v-if="isLogin && loggedInUserId !== post.user.id" class="follow-button"
						:class="{ 'followed': post.isFollowedUser }" @click.stop="toggleFollow(post)">
						{{ post.isFollowedUser ? '已关注' : '关注' }}
					</button>
				</view>

				<!-- 3.2 卡片内容-->
				<!-- 为标题添加新的 longpress 事件 -->
				<view class="post-content-title" @longpress.stop="handleLongPress(post.title)">
					<text v-if="post.postType == 1" class="type-tag hunter">创业猎伙</text>
					<text v-else-if="post.postType == 3" class="type-tag connection">商友连接</text>
					<text v-else class="type-tag business">商机分享</text>
					{{ post.title }}
				</view>

				<!-- 为内容预览区域添加新的 longpress 事件 -->
				<view v-if="post.displayContent" class="post-content-preview"
					@longpress.stop="handleLongPress(post.fullContent)">
					{{ post.displayContent }}<span v-if="post.isTruncated">...
						<span class="expand-link" @click.stop="handlePostClick(post)">展开</span>
					</span>
				</view>
				<!-- ==================== 【视频/图片】 ==================== -->

				<!-- Case 1: 如果存在视频 (post.video)，则优先渲染视频播放器 -->
				<view v-if="post.video" class="post-video-container">
					<video :id="'video-' + post.id" :src="post.video" class="post-video" :show-center-play-btn="true"
						:show-play-btn="true" @click.stop object-fit="cover" poster=""></video>
				</view>

				<!-- Case 2: 如果没有视频，但存在图片，则渲染图片网格 (保持原有逻辑) -->
				<view v-else-if="post.images && post.images.length > 0" class="post-images">
					<view v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-wrapper">
						<image :src="image" alt="商机图片" class="post-image" mode="aspectFill" />
					</view>
				</view>


				<!-- ============================================================ -->
				<view class="tags" v-if="post.tags && post.tags.length">
					<view v-for="(tag, tagIndex) in post.tags" :key="tagIndex" class="tag">{{ tag }}</view>
				</view>

				<view class="post-footer">
					<view class="post-time">{{ post.time }}</view>
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
							<span>{{ post.commonCount }}</span>
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
				<!-- <view v-if="!isLogin && postList.length === 0" class="content-placeholder"
					style="margin-top: 40rpx; border: none; background: transparent;">
					<view class="placeholder-text">登录后查看更多精彩内容</view>
					<button class="placeholder-button" @click.stop="goToLogin">立即登录</button>
				</view> -->
				<view v-if="isLogin && postList.length === 0 && loadingStatus === 'noMore'" class="no-posts-message">
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

		<!-- ==================== 9. 长按复制菜单 ==================== -->
		<view v-if="copyMenu.show" class="copy-menu-mask" @click="hideCopyMenu">
			<view class="copy-menu-content" @click.stop>
				<view class="copy-menu-item" @click="executeCopy">复制</view>
			</view>
		</view>
	</view>

	<GuidePopup ref="guidePopupRef" />

	<AvatarLongPressMenu ref="avatarMenuRef" @action="handleMenuAction" />

	<AddCircleConfirmPopup ref="addCirclePopup" />

	<InviteCircleConfirmPopup ref="invitePopupRef" />

	<ScrollPointsPopup ref="scrollPointsPopup" />

	<ZhimiPayPopup ref="payPopup" :price="10" content="定制功能需要支付10智米，请问是否同意支付开启该功能？"
		api-path="/app-api/member/user/pay-business-friend-auth" @success="handlePaySuccess" />

</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted,
		onUnmounted
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
		getInviteCode,
		getCachedUserInfo,
		checkLoginGuard
	} from '../../utils/user.js';
	import GuidePopup from '@/components/GuidePopup.vue';
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';
	import AddCircleConfirmPopup from '@/components/AddCircleConfirmPopup.vue';
	import InviteCircleConfirmPopup from '@/components/InviteCircleConfirmPopup.vue';
	import ScrollPointsPopup from '@/components/ScrollPointsPopup.vue'
	import ZhimiPayPopup from '@/components/ZhimiPayPopup.vue';



	// ============================
	// 1. 响应式状态定义 (Refs & Reactives)
	// ============================

	// 用户与权限状态
	const isPageReady = ref(false);
	const loggedInUserId = ref(null);
	const isLogin = ref(false);
	const member = ref('白银'); // 示例会员等级

	const currentUserInfo = ref(null);

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

	// 滚动条数据源
	const scrollBarData = ref([]);
	const pointsDetailData = ref(null); // 存储接口返回的 experienceStatisticsList，传给弹窗用


	// 标志位，用于控制 onShow 是否需要强制刷新
	const isInitialLoad = ref(true);

	const guidePopupRef = ref(null);

	const avatarMenuRef = ref(null);

	const addCirclePopup = ref(null);

	const invitePopupRef = ref(null);

	const scrollPointsPopup = ref(null);

	const payPopup = ref(null);




	// ============================
	// 2. 计算属性 (Computed)
	// ============================

	const pageTitle = computed(() => {
		// 优先使用 currentUserInfo (实时数据)，如果不存在，再尝试用缓存数据
		const info = currentUserInfo.value || getCachedUserInfo();
		return info?.homeTitle || '猩聚社';
	});

	const pageSlogan = computed(() => {
		const info = currentUserInfo.value || getCachedUserInfo();
		return info?.homeSlogan || '商友连接·商机分享';
	});

	// 计算轮播图数据源
	const headerSlides = computed(() => {
		const info = currentUserInfo.value || getCachedUserInfo() || {};
		const slides = [];

		// 1. 获取各级标题和口号
		const userTitle = info.homeTitle;
		const userSlogan = info.homeSlogan;
		const parentTitle = info.parentHomeTitle;
		const parentSlogan = info.parentHomeSlogan;

		// 默认文案 (作为 Parent/Platform 的兜底)
		const defaultTitle = '猩聚社';
		const defaultSlogan = '商友连接·商机分享';

		// 2. 处理本级定制 (User) - 永远作为第一张（如果有）
		if (userTitle) {
			slides.push({
				title: userTitle,
				slogan: userSlogan || ''
			});
		}

		// 3. 处理上一级定制 (Parent) - 作为第二张（或者第一张，如果User没定制）
		if (parentTitle) {
			slides.push({
				title: parentTitle,
				slogan: parentSlogan || ''
			});
		} else {
			// 如果没有 Parent 定制，显示平台默认值
			slides.push({
				title: defaultTitle,
				slogan: defaultSlogan
			});
		}

		return slides;
	});

	// 页面描述文案
	const pageDescription = computed(() => {
		const info = currentUserInfo.value || getCachedUserInfo() || {};
		// 只要有任意一个定制标题，就显示带 "by猩聚社" 的后缀
		if (info.parentHomeTitle || info.homeTitle) {
			return '连接全球精英商友——by猩聚社';
		}
		return '连接全球精英商友';
	});

	const hasPaidMembership = computed(() => {
		const paidLevels = ['青铜', '白银', '黄金', '黑钻'];
		return paidLevels.includes(member.value);
	});


	// ============================
	// 3. 生命周期钩子 (Lifecycle Hooks)
	// ============================

	onMounted(() => {
		console.log('首页 onMounted: 开始监听 postUpdated 事件');
		uni.$on('postUpdated', handlePostUpdate);

		// 监听用户关注状态变更
		uni.$on('userFollowStatusChanged', handleUserFollowStatusChange);
		//监听帖子互动状态变更
		uni.$on('postInteractionChanged', handlePostInteractionChange);
		// 监听用户信息变更 (来自定制页)
		uni.$on('userInfoChanged', handleUserInfoChange);

		// 延迟一点显示引导弹窗，避免和页面加载动画冲突，体验更好
		setTimeout(() => {
			if (guidePopupRef.value) {
				guidePopupRef.value.checkAndShow();
			}
		}, 2000); // 延迟2秒显示
	});

	onUnmounted(() => {
		console.log('首页 onUnmounted: 移除 postUpdated 事件监听');
		uni.$off('postUpdated', handlePostUpdate);

		// 移除监听
		uni.$off('userFollowStatusChanged', handleUserFollowStatusChange);
		// 移除
		uni.$off('postInteractionChanged', handlePostInteractionChange);
		uni.$off('userInfoChanged', handleUserInfoChange);
	});

	onShow(async () => {
		// --- 静默登录逻辑 ---
		// 1. 获取当前缓存中的 userId
		let currentUserId = uni.getStorageSync('userId');

		if (isInitialLoad.value) {
			if (!currentUserId) {
				// 未登录：保持 Loading，去执行静默登录
				console.log('检测到未登录，开始静默登录流程...');
				await performSilentLogin();
				// 登录完（无论成功失败），都要放行
			}

			// 首次加载逻辑结束，准备渲染数据
			isPageReady.value = true;
		} else {
			// 非首次加载（从详情页返回），直接显示
			isPageReady.value = true;
		}

		// 2. 如果本地没有 userId，说明未登录，尝试进行静默登录
		// if (!currentUserId) {
		// 	console.log('检测到未登录，尝试静默登录...');
		// 	await performSilentLogin();
		// 	// 静默登录尝试完成后，再次获取 userId (如果成功，现在应该有了)
		// 	currentUserId = uni.getStorageSync('userId');
		// }

		// 每次进入页面时检查登录状态并刷新数据
		// const currentUserId = uni.getStorageSync('userId');
		const currentUserIsLogin = !!currentUserId;

		// 只有在以下三种情况时才强制刷新列表：
		// 1. 首次进入页面 (isInitialLoad.value 为 true)
		// 2. 登录状态发生了变化 (例如，从未登录变为登录，或切换了账号)
		// 3. 帖子列表为空 (作为一种保险措施，防止白屏)
		if (isInitialLoad.value || isLogin.value !== currentUserIsLogin || postList.value.length === 0) {
			console.log('触发刷新: 首次加载或登录状态变更');

			// 更新登录状态
			loggedInUserId.value = currentUserId;
			isLogin.value = currentUserIsLogin;

			if (isLogin.value) {
				fetchCurrentUserInfo(); // 获取实时用户信息
			} else {
				currentUserInfo.value = null; // 未登录则清空
			}

			// 执行强制刷新
			getBusinessOpportunitiesList(true);

			// 首次加载完成后，将标志位置为 false
			isInitialLoad.value = false;
		} else {
			console.log('从详情页返回，不刷新列表，保持滚动位置。');
		}

		// 确保分享菜单总是可用
		uni.showShareMenu({
			// withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});

		if (uni.getStorageSync('token')) {
			fetchScrollBarData();
		}
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
			title: '精英商友社交，您需要这个带工具的平台——猩聚社！点戳进入☞☞',
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
			title: '精英商友社交，您需要这个带工具的平台——猩聚社！点戳进入☞☞',
			query: queryString,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	/**
	 * 一个处理刷新事件的函数
	 */
	const handlePostUpdate = () => {
		// 可以留空，或者只做一些非破坏性的更新
		// 因为我们已经通过具体的事件完成了数据同步
		console.log('postUpdated 触发，但已通过精准事件同步数据，跳过全量刷新');
	};

	// ============================
	// 5. 主要业务方法 (Business Methods)
	// ============================

	// 获取滚动条数据
	const fetchScrollBarData = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/experience-record/get-scroll-bar', {
				method: 'GET'
			});

			if (!error && data) {
				pointsDetailData.value = data;

				// 构造滚动条列表
				const list = [];

				// 1. 新的圈友
				if (data.totalFriendNum > 0) {
					list.push({
						type: 'friend',
						label: '新的圈友',
						count: data.totalFriendNum
					});
				}

				// 2. 昨日贡分 (总是显示，或者大于0显示)
				list.push({
					type: 'points',
					label: '昨日贡分',
					count: data.totalExperience || 0
				});

				// 3. 【新增】用户确认 (待审核报名)
				// 假设接口字段名为 pendingConfirmUserTotal
				if (data.pendingConfirmUserTotal > 0) {
					list.push({
						type: 'confirm',
						label: '聚会确认',
						count: data.pendingConfirmUserTotal
					});
				}

				scrollBarData.value = list;
			}
		} catch (e) {
			console.error('获取滚动条数据失败', e);
		}
	};

	/**
	 * 静默登录方法
	 * 尝试使用 wx.login 获取 code 直接调用登录接口
	 */
	const performSilentLogin = async () => {
		try {
			// 1. 获取微信 loginCode
			const loginRes = await uni.login({
				provider: 'weixin'
			});
			if (!loginRes || !loginRes.code) {
				return;
			}

			// 2. 检查是否有暂存的邀请码
			const pendingInviteCode = uni.getStorageSync('pendingInviteCode');

			// 3. 构造请求参数，只传 loginCode 和必要的邀请码
			const payload = {
				loginCode: loginRes.code,
				state: 'default',
				shardCode: pendingInviteCode || ''
			};

			// 4. 调用后端接口
			const {
				data,
				error
			} = await request('/app-api/member/auth/weixin-mini-app-login', {
				method: 'POST',
				data: payload
			});

			// 5. 登录成功处理
			if (!error && data && data.accessToken) {
				console.log('✅ 静默登录成功!', data);
				// 存储 Token 和 UserId
				uni.setStorageSync('token', data.accessToken);
				uni.setStorageSync('userId', data.userId);

				// 【关键】登录成功后，立即更新状态并刷新数据
				isLogin.value = true;
				loggedInUserId.value = data.userId;

				// 刷新用户信息和列表
				fetchCurrentUserInfo();
				getBusinessOpportunitiesList(true);

				// 如果之前使用了邀请码，现在可以清除了
				if (pendingInviteCode) {
					uni.removeStorageSync('pendingInviteCode');
				}
			} else {
				// 失败不弹窗，保持静默
				console.log('静默登录未成功 (可能是非新用户需手机号或接口异常):', error);
			}
		} catch (e) {
			console.error('静默登录流程异常:', e);
		}
	};

	const fetchCurrentUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (error) {
			console.error("首页实时获取用户信息失败:", error);
			// 失败时可以考虑使用缓存数据作为兜底
			currentUserInfo.value = getCachedUserInfo();
		} else {
			currentUserInfo.value = data;
			console.log("首页实时获取用户信息成功:", currentUserInfo.value);
			// 【重要】获取成功后，用新数据更新本地缓存
			uni.setStorageSync('userInfo', JSON.stringify(data));
		}
	};

	const getBusinessOpportunitiesList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;
		loadingStatus.value = 'loading';

		// if (isRefresh) {
		// 	pageNo.value = 1;
		// 	postList.value = [];
		// 	loadingStatus.value = 'more';
		// }
		let currentPage = pageNo.value;
		if (isRefresh) {
			currentPage = 1;
		}

		const params = {
			pageNo: currentPage,
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

			const mappedData = apiData.list.map(item => {
				// 处理内容的逻辑
				const plainText = (item.postContent || '').replace(/<[^>]+>/g, '').trim();
				const isTruncated = plainText.length > 100;
				const displayContent = isTruncated ? plainText.substring(0, 100) : plainText;

				return {
					id: item.id,
					title: item.postTitle,
					postType: item.postType || 0,
					fullContent: plainText, // 完整纯文本内容，为长按复制做准备
					displayContent: displayContent, // 用于显示的内容
					isTruncated: isTruncated, // 是否被截断的标志
					// ========================================
					// 1. 检查并赋值 postVideo 字段
					video: item.postVideo || '',

					// 2. 将 postImg 的处理结果赋值给 images 字段
					images: item.postImg ? String(item.postImg).split(',').filter(img => img) : [],
					// =======================================================
					tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',')
						.filter(tag => tag)) : [],
					likes: item.likesCount || 0,
					dislikes: item.dislikesCount || 0,
					commonCount: item.commonCount || 0,
					userAction: item.userLikeStr || null,
					isSaved: item.followFlag === 1,
					isFollowedUser: item.followUserFlag === 1,
					time: formatTimestamp(item.createTime),
					user: {
						id: item.memberUser?.id || item.userId,
						name: item.memberUser?.nickname || '匿名用户',
						avatar: item.memberUser?.avatar || defaultAvatarUrl,

						// certType: 表示企业号认证
						isEnterprise: item.memberUser?.certType === 1,
						// idCert: 表示个人实名认证
						isIdVerified: item.memberUser?.idCert === 1,
						// enterpriseIdCert: 表示是否为企业
						isEnterpriseVerified: item.memberUser?.enterpriseIdCert === 1,
					}
				}
			});

			// postList.value = isRefresh ? mappedData : [...postList.value, ...mappedData];

			if (isRefresh) {
				postList.value = mappedData; // 直接覆盖
				pageNo.value = 2; // 下次加载第2页
			} else {
				postList.value = [...postList.value, ...mappedData]; // 追加
				pageNo.value++; // 页码+1
			}

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

	const handleSearch = async () => {
		if (!await checkLoginGuard()) return;
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

	const handleAvatarClick = async (user) => {
		if (!await checkLoginGuard()) return;

		if (avatarMenuRef.value) {
			avatarMenuRef.value.open(user);
		}
	};

	// 处理菜单项点击
	const handleMenuAction = ({
		type,
		user
	}) => {
		console.log('菜单操作:', type, user);

		switch (type) {
			case 'viewCard':
				// 原有的跳转名片逻辑
				navigateToBusinessCard(user);
				break;
			case 'addCircle':
				addCirclePopup.value.open(user);
				break;
			case 'inviteCircle':
				invitePopupRef.value.open(user);
				break;
			case 'removeCircle':
				uni.showModal({
					title: '确认脱圈',
					content: `确定要与 ${user.name} 解除圈友关系吗？`,
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: '已脱圈',
								icon: 'none'
							});
							// 调用接口
						}
					}
				});
				break;
			case 'disconnect':
				uni.showToast({
					title: '已断开连接',
					icon: 'none'
				});
				break;
			case 'comment':
				uni.navigateTo({
					url: `/packages/user-reviews/user-reviews?userId=${user.id}`
				});
				break;
		}
	};

	/**
	 * 处理申请入圈
	 */
	const handleApplyCircle = (targetUser) => {
		// 1. 弹出确认框 
		uni.showModal({
			title: '建立圈友关系',
			content: `与 ${targetUser.name} 建立圈友关系\n 同时将您展示在对方的圈友网络中\n（这将建立双向的圈友关系）`,
			confirmText: '确认互圈',
			cancelText: '取消',
			confirmColor: '#FF7009', // 使用主题色
			success: async (res) => {
				if (res.confirm) {
					// 2. 用户确认后，调用接口
					await submitApplyCircle(targetUser.id);
				}
			}
		});
	};

	/**
	 * 提交加圈申请接口调用
	 */
	const submitApplyCircle = async (targetUserId) => {
		uni.showLoading({
			title: '申请中...'
		});

		try {
			// 构造 URL: /app-api/member/user/friend/apply/{userId}
			const url = `/app-api/member/user/friend/apply/${targetUserId}`;

			const {
				data,
				error
			} = await request(url, {
				method: 'POST'
			});

			if (!error) {
				uni.showToast({
					title: '申请已发送',
					icon: 'success'
				});
			} else {
				uni.showToast({
					title: error || '申请失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
			console.error(e);
		} finally {
			uni.hideLoading();
		}
	};

	// 点击处理
	const handleNoticeClick = (item) => {
		if (item.type === 'friend') {
			uni.navigateTo({
				url: '/packages/my-friendInvitation/my-friendInvitation?currentTab=1'
			});
		} else if (item.type === 'points') {
			if (scrollPointsPopup.value) {
				scrollPointsPopup.value.open(pointsDetailData.value);
			}
		} else if (item.type === 'confirm') {
			// 【新增】点击“用户确认”
			// 跳转到“我的聚会 - 我的发布”页面，那里有处理申请的入口
			uni.navigateTo({
				url: '/packages/my-active/my-active?currentTab=1'
			});
		}
	};

	// ============================
	// 6. 卡片交互方法 (Card Interaction Methods)
	// ============================

	/**
	 * 处理从详情页传来的关注状态变更
	 * @param {Object} data { userId, isFollowed }
	 */
	const handleUserFollowStatusChange = (data) => {
		console.log('接收到关注状态变更:', data);
		if (!data || !data.userId) return;

		// 遍历当前列表，找到所有该用户的帖子，同步更新关注状态
		postList.value.forEach(post => {
			if (post.user.id === data.userId) {
				post.isFollowedUser = data.isFollowed;
			}
		});
	};

	/**
	 * 处理帖子互动状态变更 (点赞/收藏/评论)
	 */
	const handlePostInteractionChange = (data) => {
		console.log('接收到帖子互动变更:', data);
		// 1. 基础校验
		if (!data || !data.postId) return;

		// 2. 查找目标帖子 (使用 String 转换确保 ID 类型匹配，防止 数字 vs 字符串 导致找不到)
		const targetPost = postList.value.find(p => String(p.id) === String(data.postId));

		// 3. 【关键】只有当找到了帖子，才进行更新
		if (targetPost) {
			if (data.type === 'action') {
				// 更新点赞/踩
				targetPost.userAction = data.userAction;
				targetPost.likes = data.likes;
				targetPost.dislikes = data.dislikes;
			} else if (data.type === 'save') {
				// 更新收藏
				targetPost.isSaved = data.isSaved;
			} else if (data.type === 'comment') {
				if (typeof data.totalCount === 'number') {
					targetPost.commonCount = data.totalCount;
				}
				// 兼容旧逻辑（如果以后有其他地方只传 delta）
				else if (data.delta) {
					const currentCount = Number(targetPost.commonCount) || 0;
					targetPost.commonCount = currentCount + data.delta;
				}
			}
		} else {
			console.warn(`未在当前列表中找到 ID 为 ${data.postId} 的帖子，跳过更新`);
		}
	};

	/**
	 * 处理用户信息变更 (如定制标题修改)
	 */
	const handleUserInfoChange = async () => {
		console.log('收到用户信息变更通知，刷新首页配置');
		// 1. 重新获取用户信息 (更新标题、口号等)
		await fetchCurrentUserInfo();
		// 2. (可选) 刷新列表，以防有其他关联数据变动
		// getBusinessOpportunitiesList(true); 
	};

	const toggleAction = async (post, clickedAction) => {
		if (isActionInProgress.value || !isLogin.value) return;
		if (!await checkLoginGuard()) return;
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
			// 1. 计算要发送给后端的 action 值
			let apiActionToSend;
			if (originalAction === clickedAction) {
				// 如果操作前的状态和当前点击的按钮一致，说明是“取消”操作
				apiActionToSend = 'cancel';
			} else {
				// 否则，是新增或切换操作
				apiActionToSend = clickedAction;
			}

			// 2. 在请求中发送计算好的 action 值
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: post.id,
					targetType: 'post',
					action: apiActionToSend, // 【关键】使用新的变量
				},
			});

			if (error) {
				// API失败，回滚UI
				post.userAction = originalAction;
				post.likes = originalLikes;
				post.dislikes = originalDislikes;
				uni.showToast({
					title: `操作失败: ${error}`,
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

	// 通用的关注/收藏处理函数
	const toggleGenericFollow = async (post, type, targetId, statusKey, successMsg, failureMsg) => {
		// 1. 防抖/节流检查
		if (isActionInProgress.value || !isLogin.value) return;
		if (!await checkLoginGuard()) return;
		isActionInProgress.value = true;

		// 2. 记录原始状态 (用于失败回滚)
		const originalStatus = post[statusKey];
		const newStatus = !originalStatus;

		// 3. 乐观更新 (如果是关注人，需要同步更新列表里所有该人的帖子)
		if (type === 'post_user') {
			// 遍历列表，找到所有该用户的帖子并更新状态
			postList.value.forEach(p => {
				if (p.user.id === targetId) {
					p[statusKey] = newStatus;
				}
			});
		} else {
			// 如果是收藏帖子，只更新当前这一条
			post[statusKey] = newStatus;
		}

		const apiUrl = newStatus ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

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
				throw new Error(error); // 抛出错误进入 catch 回滚
			} else {
				uni.showToast({
					title: newStatus ? successMsg.add : successMsg.remove,
					icon: 'none'
				});
			}
		} catch (err) {
			// 4. 失败回滚
			if (type === 'post_user') {
				postList.value.forEach(p => {
					if (p.user.id === targetId) {
						p[statusKey] = originalStatus;
					}
				});
			} else {
				post[statusKey] = originalStatus;
			}

			uni.showToast({
				title: failureMsg || '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 5. 释放锁 (为了防止过快点击，可以加一个小延迟，例如 500ms)
			setTimeout(() => {
				isActionInProgress.value = false;
			}, 500);
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

	// 跳转到定制页的函数
	const goToCustomizationPage = async () => {
		if (!await checkLoginGuard()) return;
		// 1. 检查是否登录
		if (!isLogin.value) {
			goToLogin();
			return;
		}

		// 2. 确保已获取到最新的用户信息
		// 如果 currentUserInfo 还没有值，主动获取一次
		if (!currentUserInfo.value) {
			await fetchCurrentUserInfo();
		}

		// 3. 从【实时】用户信息中获取支付状态
		const isPaid = currentUserInfo.value?.payBusinessFriendAuth === 1;

		if (isPaid) {
			// 如果已支付，直接跳转
			uni.navigateTo({
				url: `/packages/home-customization/home-customization`
			});
		} else {
			// 如果未支付，弹出确认支付弹窗
			payPopup.value.open();
			// uni.showModal({
			// 	title: '开启定制功能',
			// 	content: '定制功能需要支付10智米，请问是否同意支付开启该功能？',
			// 	confirmText: '立即支付',
			// 	cancelText: '再想想',
			// 	success: async (res) => {
			// 		if (res.confirm) {
			// 			// 用户确认支付，调用支付接口
			// 			uni.showLoading({
			// 				title: '正在开通...'
			// 			});
			// 			const {
			// 				data,
			// 				error
			// 			} = await request('/app-api/member/user/pay-business-friend-auth', {
			// 				method: 'POST'
			// 			});
			// 			uni.hideLoading();

			// 			if (error) {
			// 				uni.showToast({
			// 					title: error,
			// 					icon: 'none',
			// 					duration: 3000
			// 				});
			// 			} else {
			// 				uni.showToast({
			// 					title: '开通成功！',
			// 					icon: 'success'
			// 				});
			// 				// 支付成功后，重新获取用户信息以更新状态
			// 				await fetchCurrentUserInfo();
			// 				// 然后再跳转到定制页
			// 				setTimeout(() => {
			// 					uni.navigateTo({
			// 						url: `/packages/home-customization/home-customization`
			// 					});
			// 				}, 800);
			// 			}
			// 		}
			// 	}
			// });
		}
	};

	// 支付成功回调
	const handlePaySuccess = async () => {
		// 支付成功后，重新获取用户信息以更新状态
		await fetchCurrentUserInfo();
		// 然后再跳转到定制页
		setTimeout(() => {
			uni.navigateTo({
				url: `/packages/home-customization/home-customization`
			});
		}, 800);
	};

	const handlePostClick = async (post) => {
		if (!await checkLoginGuard()) return;
		if (!hasPaidMembership.value) {
			goToMembership();
		} else {
			skipCommercialDetail(post.id);
		}
	};

	const navigateToComments = async (post) => {
		// 复用卡片点击的权限检查逻辑
		if (!await checkLoginGuard()) return;
		if (!hasPaidMembership.value) {
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
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(user.name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;
		uni.navigateTo({
			url
		});
	};

	const postNew = async  () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: '/packages/home-opportunitiesPublish/home-opportunitiesPublish'
		});
	};
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

	// 长按复制文本的方法
	// 用于长按复制菜单的状态
	const copyMenu = reactive({
		show: false,
		text: '', // 准备要复制的文本
	});

	// 长按处理函数，现在它只负责显示菜单
	const handleLongPress = (textToCopy) => {
		if (!textToCopy) return;
		copyMenu.text = textToCopy;
		copyMenu.show = true;
	};

	// 点击“复制”按钮后真正执行复制操作的函数
	const executeCopy = () => {
		if (!copyMenu.text) return;
		uni.setClipboardData({
			data: copyMenu.text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'none'
				});
			},
			fail: (err) => {
				// 在真机上，如果这里还失败，可以加一些调试信息
				console.error('setClipboardData failed:', err);
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				});
			},
			complete: () => {
				// 复制完成后隐藏菜单
				copyMenu.show = false;
				copyMenu.text = '';
			}
		});
	};

	// 点击遮罩层隐藏菜单
	const hideCopyMenu = () => {
		copyMenu.show = false;
	};
</script>

<style scoped>
	.business-opportunity-app {
		position: relative;
	}

	.custom-fab {
		position: fixed;
		/* 关键：固定定位 */
		top: 100rpx;
		/* 与顶部的距离，您可以根据实际视觉效果微调 */
		right: 30rpx;
		/* 与右侧的距离 */
		z-index: 99;
		/* 确保在其他内容之上 */

		display: flex;
		flex-direction: column;
		/* 让图标和文字垂直排列 */
		align-items: center;
		justify-content: center;

		width: 100rpx;
		/* 按钮宽度 */
		height: 100rpx;
		/* 按钮高度 */

		background: linear-gradient(135deg, #4facfe, #00f2fe);
		/* 蓝色渐变 */
		color: white;
		border-radius: 50%;
		/* 圆形 */
		box-shadow: 0 8rpx 20rpx rgba(0, 191, 255, 0.4);

		font-size: 24rpx;
		/* 文字大小 */
		font-weight: 500;
	}

	/* 调整图标下方的间距 */
	.custom-fab .uni-icons {
		margin-bottom: 4rpx;
	}

	/* 全屏 Loading 样式 */
	.full-screen-loading {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-color: #fff;
		/* 白底遮盖 */
		z-index: 9999;
		/* 最高层级 */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	.loading-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #666;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	/* =========================
	 * 1. 页面通用与头部样式
	 * ========================= */
	.header {
		/* 保持原有背景和圆角 */
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		/* padding-bottom 留给搜索框，padding-top 可以适当减小，因为 swiper 自己有高度 */
		padding: 20rpx 40rpx 60rpx;
		border-radius: 0 0 40rpx 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	/* 补上 .header::before 的样式 (可能之前不小心删了或者本来就在) */
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

	/* 【新增】Swiper 样式 */
	.header-swiper {
		/* 高度需要根据内容自适应或给一个固定高度 */
		/* 预估高度：标题(56+16) + 口号(32+10) + 描述(28+40) ≈ 180~200rpx */
		height: 220rpx;
		width: 100%;
		/* margin-bottom: 20rpx; */
		/* 与搜索框的间距 */
	}

	.header-content {
		display: flex;
		flex-direction: column;
		/* 确保内容垂直居中或靠上 */
		justify-content: flex-start;
		height: 100%;
	}

	/* 原有文字样式微调，确保在 swiper 里显示正常 */
	.app-title {
		font-size: 56rpx;
		font-weight: 700;
		margin-bottom: 10rpx;
		/*稍微减小间距*/
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
		/* 防止长标题换行导致布局错乱 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
	.nav-header-row {
		display: flex;
		align-items: center;
		/* 垂直居中 */
		padding: 30rpx 40rpx 20rpx;
		background-color: #f5f7fa;
	}

	.section-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #FF6A00;
		display: flex;
		align-items: center;
		margin-right: 24rpx;
		/* 给右侧留出间距 */
		flex-shrink: 0;
		/* 防止标题被压缩 */
		/* 移除原来的 padding: 40rpx 40rpx 30rpx; */
		padding: 0;
		height: 50rpx;
		/* 明确高度 */
		line-height: 50rpx;
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

	/* --- 滚动条样式 --- */
	.notice-bar {
		width: 360rpx;
		/* 给一个固定宽度，或者 min-width */
		height: 50rpx;
		/* 与标题高度一致 */
		background-color: #fff;
		border-radius: 25rpx;
		/* 圆角高度一半 */
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		margin-left: auto;
		/* margin-left: 20rpx; */
		/* 与标题的间距 */
	}

	.notice-icon {
		margin-right: 12rpx;
		display: flex;
		align-items: center;
	}

	.notice-swiper {
		width: 100%;
		height: 100%;
	}


	.notice-item {
		height: 100%;
		line-height: 60rpx;
		/* 垂直居中 */
		font-size: 26rpx;
		color: #666;
	}

	.swiper-item-box {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		/* 居中显示 */
	}

	.notice-text {
		font-size: 24rpx;
		color: #666;
	}

	.notice-num {
		font-size: 24rpx;
		color: #ff4d4f;
		/* 红色 */
		font-weight: bold;
		margin-left: 4rpx;
	}

	/* 单行省略通用样式 (如果全局已有可省略) */
	.text-ellipsis {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
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

	.user-name-line {
		display: flex;
		align-items: center;
		gap: 12rpx;
		/* 图标和文字之间的间距 */
	}

	.user-name {
		font-weight: 600;
		font-size: 32rpx;
		margin-bottom: 8rpx;
		/* 【关键】在名字和认证行之间增加一点间距 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 新增：认证行的样式 */
	.user-certs-line {
		display: flex;
		align-items: center;
		gap: 12rpx;
		/* 图标和文字之间的间距 */
		/* 如果认证标识可能很多，可以加上 flex-wrap */
		/* flex-wrap: wrap; */
	}

	.cert-icon {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
		/* 防止图标被压缩变形 */
	}

	.cert-badge {
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-size: 20rpx;
		font-weight: 500;
		white-space: nowrap;
		/* 防止文字换行 */
		flex-shrink: 0;
	}

	.cert-badge.real-name {
		background-color: #ecf5ff;
		/* 淡蓝色背景 */
		color: #409eff;
		/* 蓝色文字 */
		border: 1rpx solid #d9ecff;
	}

	.cert-badge.enterprise {
		background-color: #fdf6ec;
		/* 淡橙色背景 */
		color: #e6a23c;
		/* 橙色文字 */
		border: 1rpx solid #faecd8;
	}

	.post-footer {
		display: flex;
		justify-content: flex-end;
		/* 让内容靠右对齐 */
		margin-top: 20rpx;
		/* 与上方内容隔开 */
	}

	.post-footer .post-time {
		font-size: 26rpx;
		color: #999;
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

	/* 类型标签基础样式 */
	.type-tag {
		font-size: 20rpx;
		padding: 2rpx 8rpx;
		border-radius: 6rpx;
		margin-right: 12rpx;
		font-weight: normal;
		display: inline-block;
		vertical-align: middle;
		line-height: 1.2;
		transform: translateY(-2rpx);
		/* 微调垂直对齐 */
	}

	/* 商机样式 (橙色系) */
	.type-tag.business {
		color: #FF6A00;
		background-color: #FFF0E6;
		border: 1rpx solid rgba(255, 106, 0, 0.3);
	}

	.type-tag.connection {
		color: #722ed1;
		background-color: #f9f0ff;
		border: 1rpx solid rgba(114, 46, 209, 0.3);
	}

	/* 猎伙样式 (蓝色系，突出显示) */
	.type-tag.hunter {
		color: #1890FF;
		background-color: #E6F7FF;
		border: 1rpx solid rgba(24, 144, 255, 0.3);
	}

	.post-content-preview {
		font-size: 28rpx;
		line-height: 1.6;
		margin-top: 16rpx;
		color: #666;
		/* 允许内容按空格或换行符自动换行 */
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* 【新增】“展开”链接的样式 */
	.expand-link {
		color: #007AFF;
		/* 蓝色，类似于微信的链接颜色 */
		margin-left: 8rpx;
		display: inline-block;
		/* 确保它像个按钮一样可交互 */
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

	/* ==================== 视频容器和播放器样式 ==================== */
	.post-video-container {
		width: 100%;
		/* 建议给视频一个最大高度，防止视频比例过高导致页面过长 */
		/* max-height: 400rpx; */
		aspect-ratio: 16 / 9;
		border-radius: 12rpx;
		overflow: hidden;
		margin-top: 30rpx;
		background-color: #000;
		/* 视频加载时的背景色 */
		position: relative;
		/* 用于可能的封面图或播放按钮定位 */
	}

	.post-video {
		width: 100%;
		height: 100%;
		/* 视频将填充容器 */
		display: block;
	}

	/* ===================================================================== */

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
		/* margin-top: 30rpx; */
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


	/* =========================
	 * 9. 长按复制菜单样式
	 * ========================= */
	.copy-menu-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		/* 半透明遮罩 */
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
		/* 确保在最上层 */
	}

	.copy-menu-content {
		background-color: white;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.copy-menu-item {
		padding: 24rpx 80rpx;
		font-size: 32rpx;
		color: #333;
		text-align: center;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.copy-menu-item:last-child {
		border-bottom: none;
	}

	/* 增加一个点击效果 */
	.copy-menu-item:active {
		background-color: #f7f7f7;
	}
</style>