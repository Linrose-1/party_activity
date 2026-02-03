<template>
	<view class="page-container">
		<!-- 1. 顶部 Tab 切换 -->
		<view class="tabs-container">
			<uni-segmented-control :current="currentTab" :values="tabItems" @clickItem="handleTabClick"
				style-type="button" active-color="#FF6B00" style="width: 90%; margin: 0 auto;" />
		</view>

		<!-- 2. 内容区域 -->
		<view class="content-area">
			<!-- 我的商友 -->
			<view v-show="currentTab === 0" class="tab-panel">

				<!-- 邀请新商友模块 -->
				<view class="invite-tools-section">
					<view class="section-title">邀请新商友</view>
					<view class="tools-grid">
						<view class="tool-item" v-for="(item, index) in inviteTools" :key="index"
							@click="handleToolClick(item)">
							<!-- 增加 inner 容器保持布局一致性 -->
							<view class="tool-item-inner">
								<image :src="item.icon" class="tool-icon" mode="aspectFit"></image>
								<view class="tool-content">
									<view class="tool-name">{{ item.name }}</view>
									<view class="tool-desc">{{ item.desc }}</view>
								</view>
								<text class="chevron-icon">›</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 我邀请的人 -->
				<view class="inviter-section">

					<!-- 1. 平台邀请人卡片 (移到最上方，固定显示) -->
					<!-- 只要平台数据加载到了就显示，不再依赖 shouldShowPlatformCard -->
					<view v-if="platformInfo.name" class="inviter-card platform-card" @click="goToPlatformIntro">
						<view class="inviter-avatar">
							<image :src="platformInfo.img" class="inviter-avatar-img platform-img" mode="aspectFill">
							</image>
						</view>
						<view class="inviter-info">
							<view class="inviter-name">{{ platformInfo.name }} <text class="tag-platform">平台</text>
							</view>
							<view class="inviter-desc">点击查看平台介绍与首页邀约码</view>
						</view>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>

					<!-- 2. "我的邀请人" 标题 (下移到这里) -->
					<!-- 只有当有真实上级时才显示标题和卡片 -->
					<view v-if="userInfo && userInfo.parentName" class="section-title" style="margin-top: 30rpx;">我的邀请人
					</view>

					<!-- 3. 个人上级邀请人 (UserInfo 中的 parent) -->
					<view v-if="userInfo && userInfo.parentName" class="inviter-card" @click="viewParentCard">
						<view class="inviter-avatar">
							<image v-if="userInfo.parentAvatar" :src="userInfo.parentAvatar" class="inviter-avatar-img"
								mode="aspectFill"></image>
							<view v-else class="avatar-placeholder">{{ userInfo.parentName.charAt(0) }}</view>
						</view>
						<view class="inviter-info">
							<view class="inviter-name">{{ userInfo.parentName }}</view>
							<view v-if="userInfo.parentName === '猩聚社'" class="inviter-desc">平台直属</view>
						</view>
					</view>

					<!-- 4. 空状态 (如果既没有个人上级) -->
					<!-- 注意：之前这里有个 !shouldShowPlatformCard 判断，现在去掉了，因为平台始终显示 -->
					<!-- 现在的逻辑是：如果没有上级 parentName，则显示"不是通过邀请加入"的提示 -->
					<view v-if="userInfo && !userInfo.parentName" class="empty-container"
						style="padding-top: 40rpx; padding-bottom: 20rpx;">
						<text class="empty-text" style="font-size: 24rpx;">您不是通过个人邀请加入的哦</text>
					</view>

				</view>
				<!-- <view v-else class="empty-container">
					<image class="empty-image" src="/static/images/empty-box.png" mode="widthFix"></image>
					<text class="empty-text">您不是通过邀请加入的哦</text>
				</view> -->

				<!-- 我邀请的人 -->
				<!-- 【关键】吸顶头部 -->
				<view class="sticky-header">
					<view class="section-title list-title">我邀请的人</view>
					<view class="search-wrapper">
						<uni-easyinput prefixIcon="search" v-model="searchKey" placeholder="搜索商友姓名/昵称/公司,同学/同行/同乡/同圈"
							@confirm="handleSearch" @clear="handleSearch"></uni-easyinput>
					</view>
				</view>

				<!-- 商友列表内容 -->
				<view class="friend-list">
					<view class="friend-card" v-for="friend in friendList" :key="friend.id"
						@click="navigateToBusinessCard(friend)">
						<image class="friend-avatar" :src="friend.avatar || '/static/images/default-avatar.png'"
							mode="aspectFill"></image>
						<view class="friend-info">
							<view class="info-header">
								<text class="friend-name">{{ friend.nickname || friend.realName || '匿名用户' }}</text>
								<view class="relation-tags"
									v-if="friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1">
									<text v-if="friend.friendParentFlag === 1" class="tag fellow-circle">同圈</text>

									<text v-if="friend.fellowTownspeopleCityFlag === 1"
										class="tag fellow-townsman">同乡</text>
									<text v-if="friend.peerFlag === 1" class="tag peer">同行</text>
									<text v-if="friend.classmateFlag === 1" class="tag classmate">同学</text>
								</view>
							</view>
							<view class="friend-company">
								<uni-icons type="briefcase-filled" size="14" color="#888"></uni-icons>
								<text>{{ friend.companyName || '暂无公司信息' }}</text>
							</view>
						</view>
						<view class="action-area">
							<button class="follow-btn" :class="{ 'followed': friend.followFlag === 1 }"
								@click.stop="handleFollowAction(friend)">
								{{ friend.followFlag === 1 ? '取关' : '关注' }}
							</button>
							<view class="invite-time" v-if="friend.followTime">
								{{ formatTimestamp(friend.followTime) }}
							</view>
						</view>
					</view>
				</view>
				<!-- 加载更多 -->
				<uni-load-more :status="loadStatus"
					v-if="friendList.length > 0 || loadStatus === 'loading'"></uni-load-more>

				<view class="empty-container" v-if="friendList.length === 0 && loadStatus === 'noMore'">
					<image class="empty-image" src="/static/images/empty-invite.png" mode="widthFix"></image>
					<text class="empty-text">您还没有邀请过商友哦，快去分享吧！</text>
				</view>

			</view>

			<!-- Tab 0: 我邀请的人 (列表) -->
			<view v-show="currentTab === 1" class="tab-panel">

				<!-- 1. 顶部搜索 (圈友专属) -->
				<view class="sticky-header-circle">
					<view class="search-wrapper">
						<uni-easyinput prefixIcon="search" v-model="circleSearchKey" placeholder="搜索圈友姓名"
							@confirm="handleCircleSearch" @clear="handleCircleSearch"></uni-easyinput>
					</view>

					<!-- 【新增】圈友类型筛选 Tab -->
					<view class="circle-sub-tabs">
						<view class="sub-tab-item" :class="{ active: circleAddInitiator === 0 }"
							@click="switchCircleFilter(0)">
							我圈的人
						</view>
						<view class="sub-tab-item" :class="{ active: circleAddInitiator === 1 }"
							@click="switchCircleFilter(1)">
							圈我的人
						</view>
					</view>
				</view>


				<!-- 2. 新申请入口 -->
				<!-- 只有当有新申请或者想要常驻显示时展示 -->
				<view class="new-apply-entry" @click="openApplyPopup">
					<view class="entry-left">
						<view class="icon-box">
							<uni-icons type="personadd-filled" size="24" color="#fff"></uni-icons>
						</view>
						<text class="entry-title">新的圈友</text>
					</view>
					<view class="entry-right">
						<!-- 如果有申请，显示红点数字 -->
						<view v-if="newApplyCount > 0" class="badge">{{ newApplyCount }}</view>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<!-- 2. 圈友列表 -->
				<view class="friend-list">
					<view class="friend-card" v-for="friend in circleFriendList" :key="friend.id"
						@click="navigateToBusinessCard(friend)">
						<image class="friend-avatar" :src="friend.avatar || '/static/images/default-avatar.png'"
							mode="aspectFill"></image>
						<view class="friend-info">
							<view class="info-header">
								<text class="friend-name">{{ friend.realName || friend.nickname || '匿名用户' }}</text>
								<!-- 关系标签 -->
								<view class="relation-tags">
									<text v-if="friend.fellowTownspeopleFlag === 1"
										class="tag fellow-townsman">同乡</text>
									<text v-if="friend.peerFlag === 1" class="tag peer">同行</text>
									<text v-if="friend.classmateFlag === 1" class="tag classmate">同学</text>
									<!-- 也可以加上同城: fellowTownspeopleCityFlag -->
								</view>
							</view>
							<view class="friend-company">
								<uni-icons type="briefcase-filled" size="14" color="#888"></uni-icons>
								<text>{{ friend.companyName || '暂无公司信息' }}</text>
								<text v-if="friend.positionTitle"> | {{ friend.positionTitle }}</text>
							</view>
						</view>

						<!-- 右侧操作区 (如果是圈友，可能不需要关注按钮，或者显示“已互圈”) -->
						<view class="action-area" @click.stop="confirmDeleteFriend(friend)">
							<!-- 比如显示一个互圈的图标 -->
							<uni-icons type="checkbox-filled" size="20" color="#4cd964"></uni-icons>
							<text class="friend-status">已互圈</text>
						</view>
					</view>
				</view>

				<!-- 加载状态 -->
				<uni-load-more :status="circleLoadStatus"
					v-if="circleFriendList.length > 0 || circleLoadStatus === 'loading'"></uni-load-more>

				<!-- 空状态 -->
				<view class="empty-container" v-if="circleFriendList.length === 0 && circleLoadStatus === 'noMore'">
					<image class="empty-image" src="/static/images/empty-box.png" mode="widthFix"></image>
					<text class="empty-text">暂无圈友，快去添加吧！</text>
				</view>

			</view>




		</view>

		<CircleApplyPopup ref="applyPopupRef" @refresh="handleAuditSuccess" />
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch,
		computed
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom,
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js'; // 确保路径正确
	import CircleApplyPopup from '@/components/CircleApplyPopup.vue';

	// --- 页面配置与状态 ---
	const themeColor = ref('#FF6E00');
	const currentTab = ref(0);
	const tabItems = ['我的商友', '我的圈友'];
	const loading = ref(false);

	// --- "我邀请的人" 列表相关状态 ---
	const friendList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more');
	const isFollowActionInProgress = ref(false);

	const searchKey = ref('');
	let searchDebounceTimer = null;

	// --- "我的邀请人" 相关状态 ---
	const userInfo = ref(null);
	const platformInfo = ref({});

	// --- 圈友列表相关状态 ---
	const circleFriendList = ref([]);
	const circlePageNo = ref(1);
	const circleLoadStatus = ref('more'); // 'more', 'loading', 'noMore'
	const circleSearchKey = ref(''); // 圈友专属搜索框
	const circleAddInitiator = ref(0);

	// --- 新申请相关状态 ---
	const newApplyList = ref([]); // 申请列表数据
	const newApplyCount = ref(0); // 待处理数量
	const applyPopupRef = ref(null);

	const openApplyPopup = () => {
		// 传入当前获取到的新申请列表数据
		applyPopupRef.value.open(newApplyList.value);
	};

	// 审批操作成功后，刷新数据
	const handleAuditSuccess = () => {
		getNewApplyList(); // 刷新红点数量
		getCircleFriendList(true); // 刷新圈友列表（因为同意后会变成好友）
	};

	// 计算属性：是否显示独立的平台卡片
	// 逻辑：如果有平台信息，且 (没有个人上级 或者 个人上级不是“猩聚社”)
	const shouldShowPlatformCard = computed(() => {
		if (!platformInfo.value.name) return false;
		// 如果 userInfo 还没加载，暂时不显示
		if (!userInfo.value) return false;

		// 如果个人上级就是平台 (parentName === platformName)，则不需要额外显示一个平台卡片，
		// 因为下面的卡片显示的已经是平台了。
		// 但是，下面的卡片没有“点击跳转介绍”的功能，且头像可能不一致。
		// 为了体验一致性，建议：如果是直属，下面的卡片也渲染成平台样式。
		// 或者简单点：只要有平台信息就显示，不管下面是谁。

		// 按照您的具体需求：“如果不是猩聚社...增加平台这个邀请人”
		return userInfo.value.parentName !== '猩聚社';
	});



	// 获取平台配置
	const fetchPlatformConfig = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/platformConfig/getPlatformConfig');
		if (!error && data) {
			platformInfo.value = data;
		}
	};

	// 跳转平台介绍
	const goToPlatformIntro = () => {
		uni.navigateTo({
			url: '/pages/platform-intro/platform-intro'
		});
	};


	// --- 邀请工具配置 ---
	// 图标路径使用了你之前提供的路径，请确保图片真实存在
	const inviteTools = ref([{
			name: '注册邀请',
			desc: '注册分享邀请',
			icon: '/static/icon/精准投放.png', // 这里复用了"精准投放"的图标，或者你可以换成 /static/icon/invite-register.png
			path: '/pages/index/index' // 跳转到注册/登录页
		},
		{
			name: '名片邀请',
			desc: '名片分享邀请',
			icon: '/static/icon/我的名片.png',
			path: '/packages/my-businessCard/my-businessCard' // 跳转到名片页
		},
		{
			name: '发贴邀请',
			desc: '商机分享邀友',
			icon: '/static/icon/商机.png',
			path: '/packages/home-opportunitiesPublish/home-opportunitiesPublish' // 商机发布页路径
		},
		{
			name: '聚会邀请',
			desc: '聚会分享邀友',
			icon: '/static/icon/聚会.png',
			path: '/packages/active-publish/active-publish' //聚会发布页路径
		}
	]);

	// --- 生命周期 ---
	onMounted(() => {
		// 页面加载时，调用新的初始化函数
		initializePage();
		getShareUserList(true);
		fetchUserInfo();
	});

	onLoad((options) => {
		// 1. 处理 Tab 跳转参数
		if (options.currentTab) {
			currentTab.value = Number(options.currentTab);
		}

		// ... (原有的 inviteCode 处理逻辑) ...
		// ... (原有的 loggedInUserId 处理逻辑) ...

		// 确保根据新的 Tab 加载数据
		if (currentTab.value === 1) {
			// 如果默认进圈友页，可能需要预加载圈友数据
			// 但 initializePage 已经全量加载了，所以这里通常不需要额外操作，
			// 除非你想做一些针对性的优化。
			// 目前 initializePage 会并行加载所有数据，所以界面会自动显示出来。
		}
	});

	onPullDownRefresh(async () => {
		console.log("触发下拉刷新...");
		try {
			if (currentTab.value === 0) {
				// 刷新“我的商友”页的所有数据
				await Promise.all([getShareUserList(true), fetchUserInfo()]);
			}
			if (currentTab.value === 1) {
				await Promise.all([
					getCircleFriendList(true),
					getNewApplyList() // 刷新圈友时同步刷新申请
				]);
			}
		} catch (error) {
			// 即使出错，也要确保停止刷新动画
			console.error("下拉刷新时发生错误:", error);
		} finally {
			// 【关键】无论 try 块中的操作成功还是失败，finally 块总会执行
			console.log("刷新操作完成，停止动画。");
			uni.stopPullDownRefresh();
		}
	});

	onReachBottom(() => {
		if (currentTab.value === 0) {
			// 加载更多商友
			if (loadStatus.value === 'more' && !loading.value) {
				getShareUserList();
			}
		} else {
			// 加载更多圈友
			if (circleLoadStatus.value === 'more') getCircleFriendList();
		}
	});

	// --- 方法 ---
	/**
	 * 页面初始化函数，整合所有首次加载和刷新的逻辑
	 */
	// const initializePage = async () => {
	// 	// 两个接口都可以并行请求
	// 	const fetchListPromise = getShareUserList(true); // 加载我邀请的人列表
	// 	const fetchInfoPromise = fetchUserInfo(); // 加载当前用户信息

	// 	// 等待所有请求完成
	// 	await Promise.all([fetchListPromise, fetchInfoPromise]);

	// 	// 所有数据加载完毕后，统一停止下拉刷新动画
	// 	uni.stopPullDownRefresh();
	// };
	const initializePage = async () => {
		await Promise.all([
			getShareUserList(true),
			fetchUserInfo(),
			fetchPlatformConfig(),
			getCircleFriendList(true),
			getNewApplyList()
		]);

		uni.stopPullDownRefresh();
	};

	// const handleTabClick = (e) => {
	// 	currentTab.value = e.currentIndex;
	// };
	const handleTabClick = (e) => {
		// 如果点击当前 tab，不做操作
		if (currentTab.value === e.currentIndex) return;

		currentTab.value = e.currentIndex;

		// 切换 Tab 时滚动回顶部
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0
		});

		// 【新增】根据 Tab 索引刷新对应数据
		if (currentTab.value === 0) {
			// 切换到“我的商友”：刷新商友列表和用户信息
			getShareUserList(true);
			fetchUserInfo();
		} else if (currentTab.value === 1) {
			// 切换到“我的圈友”：刷新圈友列表和新申请
			getCircleFriendList(true);
			getNewApplyList();
		}
	};

	const switchCircleFilter = (type) => {
		if (circleAddInitiator.value === type) return;
		circleAddInitiator.value = type;
		// 切换后立即刷新列表
		getCircleFriendList(true);
	};


	/**
	 * @description 获取当前用户信息 (用于"我的邀请人")
	 */
	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get');
		if (!error) {
			userInfo.value = data;
		}
	};

	/**
	 * 查看上级邀请人名片
	 * 逻辑：使用 parentId 跳转名片页，并带上 fromShare=1 参数以绕过支付
	 */
	const viewParentCard = () => {

		// 2. 数据校验
		// if (!userInfo.value || !userInfo.value.parentId) {
		// 	uni.showToast({
		// 		title: '无法获取上级信息',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

		// 3. 如果上级是平台（ID为0或特定值，或者名字是猩聚社），可能不跳转或跳转平台介绍
		// if (userInfo.value.parentName === '猩聚社') {
		// 	goToPlatformIntro();
		// 	return;
		// }

		// 4. 构建参数
		const targetId = userInfo.value.parentId;
		const name = userInfo.value.parentName || '邀请人';
		const avatar = userInfo.value.parentAvatar || '';

		// 5. 跳转名片页
		// 关键：带上 fromShare=1，后端接口会根据这个参数判断是否免支付查看
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${targetId}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatar)}` +
			`&fromShare=1`; // 【关键参数】

		uni.navigateTo({
			url
		});
	};

	/**
	 * @description 获取我邀请的人列表 (原"我推荐的商友")
	 */
	const getShareUserList = async (isRefresh = false) => {
		// 1. 防并发请求和重复加载
		if (loadStatus.value === 'loading' || (!isRefresh && loadStatus.value === 'noMore')) {
			return;
		}

		// 2. 如果是刷新，重置分页状态
		if (isRefresh) {
			pageNo.value = 1;
		}

		// 3. 设置为加载中状态
		loadStatus.value = 'loading';

		try {
			// 4. 发送 API 请求
			const params = {
				pageNo: pageNo.value,
				pageSize: pageSize.value,
			};
			// 只有当 searchKey 有值时，才将其添加到参数中
			if (searchKey.value.trim()) {
				params.searchKey = searchKey.value.trim();
			}

			const {
				data,
				error
			} = await request('/app-api/member/user/share-user-list', {
				data: params
			});

			if (error) {
				throw new Error(error); // 抛出错误
			}

			if (data && data.list) {
				const list = data.list || [];
				// 5. 合并数据
				friendList.value = isRefresh ? list : [...friendList.value, ...list];

				// 6. 更新加载状态
				if (friendList.value.length >= data.total) {
					loadStatus.value = 'noMore';
				} else {
					loadStatus.value = 'more';
				}

				// 7. 如果成功，页码+1
				pageNo.value++;

			} else {
				// 如果没有数据返回，也视为没有更多了
				loadStatus.value = 'noMore';
			}
		} catch (err) {
			console.error("获取邀请列表失败:", err);
			// 发生错误时，将状态重置为'more'，以便用户可以下拉刷新或重新尝试上拉
			loadStatus.value = 'more';
		}
	};

	// --- 获取圈友列表 ---
	const getCircleFriendList = async (isRefresh = false) => {
		if (circleLoadStatus.value === 'loading') return;
		if (!isRefresh && circleLoadStatus.value === 'noMore') return;

		if (isRefresh) {
			circlePageNo.value = 1;
			circleLoadStatus.value = 'more';
		}

		circleLoadStatus.value = 'loading';

		try {
			const params = {
				pageNo: circlePageNo.value,
				pageSize: pageSize.value,
				status: 1, // 1: 好友位 (全部圈友)
				addInitiator: circleAddInitiator.value
			};
			if (circleSearchKey.value.trim()) {
				params.searchKey = circleSearchKey.value.trim();
			}

			const {
				data,
				error
			} = await request('/app-api/member/user/friend/list', {
				method: 'GET',
				data: params
			});

			if (error) throw new Error(error);

			if (data && data.list) {
				const list = data.list;
				circleFriendList.value = isRefresh ? list : [...circleFriendList.value, ...list];

				if (circleFriendList.value.length >= data.total) {
					circleLoadStatus.value = 'noMore';
				} else {
					circleLoadStatus.value = 'more';
					circlePageNo.value++;
				}
			} else {
				circleLoadStatus.value = 'noMore';
			}
		} catch (e) {
			console.error("获取圈友列表失败:", e);
			circleLoadStatus.value = 'more';
		} finally {
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	// --- 获取新申请列表 ---
	const getNewApplyList = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/friend/list', {
				method: 'GET',
				data: {
					pageNo: 1,
					pageSize: 10, // 只取前10条展示红点即可，详情在浮层里看
					status: 0 // 0: 申请中
				}
			});

			if (!error && data) {
				newApplyList.value = data.list;
				newApplyCount.value = data.total;
			}
		} catch (e) {
			console.error('获取新申请失败', e);
		}
	};

	watch(searchKey, (newValue, oldValue) => {
		// 避免首次加载时触发
		if (newValue !== oldValue) {
			clearTimeout(searchDebounceTimer);
			searchDebounceTimer = setTimeout(() => {
				// 输入停止 500ms 后，执行刷新搜索
				getShareUserList(true);
			}, 500); // 500ms 防抖
		}
	});

	const handleToolClick = (item) => {
		if (item.path) {
			uni.navigateTo({
				url: item.path,
				fail: (err) => {
					console.error('跳转失败', err);
					uni.showToast({
						title: '页面路径未配置',
						icon: 'none'
					});
				}
			});
		} else {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		}
	};

	// --- 圈友搜索处理 ---
	const handleCircleSearch = () => {
		getCircleFriendList(true);
	};

	// 弹出删除确认框
	const confirmDeleteFriend = (friend) => {
		uni.showModal({
			title: '解除互圈关系',
			content: `⚠️ 确定要与 ${friend.realName || friend.nickname} 解除互圈吗？\n\n📌 解除后：\n\n• 双方不再显示为圈友\n\n• 将移出彼此的圈友列表`,
			confirmText: '确认解除',
			confirmColor: '#dd524d',
			cancelText: '取消',
			success: async (res) => {
				if (res.confirm) {
					await deleteFriend(friend);
				}
			}
		});
	};

	// 调用删除接口
	const deleteFriend = async (friend) => {
		uni.showLoading({
			title: '删除中...'
		});
		try {
			const url = `/app-api/member/user/friend/del`;
			// 注意：这里传的是 fid (关系ID) 还是 id (用户ID)？
			// 根据审核接口的经验，大概率是 fid。
			const payload = {
				id: friend.fid
			};

			const {
				error
			} = await request(url, {
				method: 'POST',
				data: payload
			});

			if (!error) {
				uni.showToast({
					title: '解除成功',
					icon: 'success'
				});
				// 从列表中移除
				circleFriendList.value = circleFriendList.value.filter(item => item.id !== friend.id);
				// 也可以选择重新加载列表
				// getCircleFriendList(true);
			} else {
				uni.showToast({
					title: error || '删除失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};


	// 处理键盘确认和清除按钮的函数
	const handleSearch = () => {
		clearTimeout(searchDebounceTimer);
		getShareUserList(true);
	};
	// const getShareUserList = async (isRefresh = false) => {
	// 	if (loadStatus.value === 'loading' || (!isRefresh && loadStatus.value === 'noMore')) return;
	// 	if (isRefresh) {
	// 		pageNo.value = 1;
	// 		friendList.value = [];
	// 		loadStatus.value = 'more';
	// 	}
	// 	loadStatus.value = 'loading';

	// 	const {
	// 		data,
	// 		error
	// 	} = await request('/app-api/member/user/share-user-list', {
	// 		data: {
	// 			pageNo: pageNo.value,
	// 			pageSize: pageSize.value
	// 		}
	// 	});

	// 	// if (isRefresh) uni.stopPullDownRefresh();

	// 	if (error) {
	// 		loadStatus.value = 'more';
	// 		return;
	// 	}

	// 	if (data && data.list) {
	// 		const list = data.list || [];
	// 		friendList.value = isRefresh ? list : [...friendList.value, ...list];
	// 		total.value = data.total;
	// 		loadStatus.value = friendList.value.length >= total.value ? 'noMore' : 'more';
	// 		if (loadStatus.value === 'more') pageNo.value++;
	// 	} else {
	// 		loadStatus.value = 'noMore';
	// 	}
	// };

	const handleFollowAction = async (user) => {
		if (isFollowActionInProgress.value) return;

		const currentUserId = uni.getStorageSync('userId');
		if (!currentUserId) {
			uni.showModal({
				title: '需要登录',
				content: '关注功能需要登录后才能使用，是否前往登录？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}
				}
			});
			return;
		}

		isFollowActionInProgress.value = true;

		const originalFollowStatus = user.followFlag;
		const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
		const apiUrl = newFollowStatus === 1 ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMsg = newFollowStatus === 1 ? '关注成功' : '已取消关注';

		// 乐观更新UI
		user.followFlag = newFollowStatus;

		try {
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: {
					userId: currentUserId,
					targetId: user.id,
					targetType: 'post_user'
				}
			});

			if (error) throw new Error(error);

			uni.showToast({
				title: successMsg,
				icon: 'success'
			});

		} catch (err) {
			// 失败回滚
			user.followFlag = originalFollowStatus;
			uni.showToast({
				title: err.message || '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isFollowActionInProgress.value = false;
		}
	};

	/**
	 * @description 跳转到申请兑换名片页面
	 * @param {object} user - 包含用户信息的对象 (id, nickname, realName, avatar)
	 */
	const navigateToBusinessCard = (user) => {
		// 1. 安全检查，确保 user 对象和 id 存在
		// if (!user || !user.id) {
		// 	uni.showToast({
		// 		title: '无法查看该用户主页',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

		// 2. 准备传递的参数，并提供默认值
		const defaultAvatar = '/static/images/default-avatar.png'; // 确保这个默认头像图片存在
		const name = user.nickname || user.realName || '匿名用户';
		const avatarUrl = user.avatar || defaultAvatar;

		// 3. 构建带有多参数的URL，并使用 encodeURIComponent 编码，防止特殊字符导致问题
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}` +
			`&fromShare=1`;

		console.log('从推荐商友页跳转到名片申请页, URL:', url);

		// 4. 执行跳转
		uni.navigateTo({
			url: url
		});
	};

	/**
	 * 时间格式化函数
	 */
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`; // 年月日 + 时:分
	};
</script>

<style lang="scss" scoped>
	.page-container {
		// display: flex;
		// flex-direction: column;
		// height: 100vh;
		min-height: 100vh;
		background-color: #f7f8fa;
		/*  paddingTop 为固定定位的 Tabs 留出空间 */
		padding-top: 100rpx;
	}

	/* --- 3. 吸顶头部 (列表标题+搜索) --- */
	.sticky-header {
		position: sticky;
		/* 吸顶位置 = Tabs 的高度 */
		/* 如果有 var(--window-top)，也要加上 */
		top: 100rpx;
		/* top: calc(100rpx + var(--window-top)); */
		z-index: 10;
		background-color: #f7f8fa;
		padding-top: 20rpx;
	}

	.list-title {
		/* 增加具体的左内边距 */
		padding-left: 30rpx;
		padding-right: 30rpx;
		padding-bottom: 20rpx;

		font-size: 34rpx;
		font-weight: bold;
		color: #333;
	}


	.tabs-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 999;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		height: 100rpx;

		/* 【关键】移除 padding，改用 Flex 居中 */
		padding: 0;

		display: flex;
		align-items: center;
		/* justify-content: center;  这个可以保留，作为双重保险 */
		justify-content: center;

		box-sizing: border-box;
	}

	.content-area {
		// flex: 1;
		// overflow-y: auto;
	}

	.tab-panel {
		height: 100%;
	}

	.search-wrapper {
		padding: 20rpx;
		background-color: #fff;

		// 深度选择器，修改 uni-easyinput 的内部样式
		::v-deep .uni-easyinput__content {
			border-radius: 40rpx !important;
			background-color: #f7f8fa !important;
			border: 1rpx solid #eee !important;
		}
	}

	/* --- "我邀请的人" 列表样式 (基本复用) --- */
	.friend-list {
		padding: 20rpx;
	}

	.friend-card {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.friend-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 30rpx;
		flex-shrink: 0;
	}

	.friend-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.info-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.friend-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.relation-tags {
		display: flex;
		gap: 10rpx;
		flex-shrink: 0;
		/* 防止标签被挤压 */
	}

	.tag {
		font-size: 20rpx;
		/* 可以适当调整大小 */
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-weight: 500;
	}

	.fellow-circle {
		background-color: #f3e5f5;
		/* 浅紫色背景 */
		color: #9c27b0;
		/* 紫色文字 */
		border: 1rpx solid #e1bee7;
	}

	.fellow-townsman {
		background-color: #e8f5e9;
		color: #388e3c;
		border: 1rpx solid #a5d6a7;
	}

	.peer {
		background-color: #e3f2fd;
		color: #1976d2;
		border: 1rpx solid #90caf9;
	}

	.classmate {
		background-color: #fff3e0;
		color: #ef6c00;
		border: 1rpx solid #ffcc80;
	}

	.friend-company {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.friend-company uni-icons {
		margin-right: 10rpx;
	}

	.action-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* 居中对齐 */
		gap: 8rpx;
		/* 按钮和时间之间的间距 */
		margin-left: 20rpx;
		flex-shrink: 0;
	}


	.follow-btn {
		background-color: v-bind(themeColor);
		color: white;
		border: none;
		padding: 0 30rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
		// margin-left: 20rpx;
		flex-shrink: 0;

		&::after {
			border: none;
		}
	}

	.invite-time {
		font-size: 22rpx;
		color: #999;
		white-space: nowrap;
		/* 防止换行 */
	}


	.follow-btn.followed {
		background: #f0f2f5;
		color: #999;
	}

	/* --- "我的邀请人" 模块样式 --- */
	.platform-card {
		margin-bottom: 20rpx;
		/* 与下方的个人卡片隔开 */
		background-color: #fcfcfc;
		/*稍微区分一下背景*/
		border: 1rpx solid #eee;
	}

	.tag-platform {
		font-size: 20rpx;
		background-color: #FF6E00;
		color: white;
		padding: 2rpx 8rpx;
		border-radius: 6rpx;
		margin-left: 10rpx;
		vertical-align: middle;
	}

	.inviter-section {
		padding: 30rpx 30rpx 0 30rpx;
		/* 调整 padding */
	}

	.invite-tools-section {
		padding: 30rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		// margin-bottom: 30rpx;
		color: #333;
	}

	.inviter-card {
		display: flex;
		align-items: center;
		padding: 40rpx;
		background: #fff;
		border-radius: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.06);
		margin-top: 10rpx;
	}

	.inviter-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, v-bind(themeColor), #ff8c00);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		color: white;
		font-size: 48rpx;
		font-weight: bold;
		overflow: hidden;
		flex-shrink: 0;
	}

	.inviter-avatar-img {
		width: 100%;
		height: 100%;
	}

	/* 专门给平台头像加个白色背景，看起来更像 logo */
	.platform-avatar-bg {
		background: #fff !important;
		/* 覆盖原来的渐变色 */
		border: 1rpx solid #eee;
		/* 加个边框防止和白底混在一起 */
	}

	/* 控制图片大小，不要撑满，留点呼吸感 */
	.platform-img {
		width: 70% !important;
		/* 缩小到 70% */
		height: 70% !important;
	}

	.inviter-info {
		flex: 1;
	}

	.inviter-name {
		font-size: 34rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.inviter-desc {
		font-size: 28rpx;
		color: #666;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		/* 双列 */
		gap: 20rpx;
		margin-top: 10rpx;
	}

	.tool-item {
		background: #fff;
		padding: 30rpx 20rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		transition: background-color 0.2s;
	}

	.tool-item:active {
		background-color: #fafafa;
	}

	.tool-item-inner {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.tool-icon {
		width: 70rpx;
		height: 70rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.tool-content {
		flex: 1;
		min-width: 0;
	}

	.tool-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 6rpx;
	}

	.tool-desc {
		font-size: 22rpx;
		color: #999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chevron-icon {
		font-size: 30rpx;
		color: #ddd;
		margin-left: 10rpx;
	}

	/* --- 通用空状态样式 --- */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		color: #999;
	}

	.empty-image {
		width: 300rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 28rpx;
	}


	/* 圈友列表的吸顶搜索栏 */
	/* 圈友列表的吸顶容器 */
	.sticky-header-circle {
		position: sticky;
		top: 100rpx;
		z-index: 10;
		background-color: #f7f8fa;
		padding-bottom: 20rpx;
		/* 移除之前的 padding-bottom: 20rpx，改由子元素控制间距 */
	}

	/* 子 Tab 筛选样式 */
	.circle-sub-tabs {
		display: flex;
		background-color: #fff;
		padding: 10rpx 20rpx;
		margin-top: 2rpx;
		/* 稍微与搜索框隔开一点 */
		border-bottom: 1rpx solid #eee;
	}

	.sub-tab-item {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		padding: 20rpx 0;
		position: relative;
		transition: all 0.3s;
		font-weight: 500;

		&.active {
			color: #FF6E00;
			/* 主题色 */
			font-weight: bold;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background-color: #FF6E00;
				border-radius: 2rpx;
			}
		}
	}

	.friend-status {
		font-size: 24rpx;
		color: #999;
		background-color: #f0f2f5;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;

		/* 增加点击感 */
		padding: 8rpx 16rpx;
		background-color: #f0f2f5;
		border: 1rpx solid transparent;
		transition: all 0.2s;

		&:active {
			background-color: #e6e6e6;
			border-color: #d9d9d9;
		}
	}

	/* 新申请入口样式 */
	.new-apply-entry {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #fff;
		padding: 24rpx 30rpx;
		margin-bottom: 20rpx;
		/* 与下方列表隔开 */
		/* 如果需要吸顶，也可以加 sticky，或者就让它随页面滚动 */
	}

	.entry-left {
		display: flex;
		align-items: center;
	}

	.icon-box {
		width: 80rpx;
		height: 80rpx;
		background-color: #FF6E00;
		/* 主题色背景 */
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.entry-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.entry-right {
		display: flex;
		align-items: center;
	}

	.badge {
		background-color: #ff4d4f;
		color: #fff;
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		margin-right: 10rpx;
	}

	/* 平台头像优化 */
	.platform-card .inviter-avatar {
		background: #fff !important;
		/* 白色底 */
		border: 1rpx solid #f0f0f0;
	}

	.platform-card .inviter-avatar-img {
		width: 75% !important;
		/* 缩小图片比例 */
		height: 75% !important;
		border-radius: 0;
		/* 如果 logo 是方形的，这里可以去掉圆角；如果是圆框内的logo，保持父级overflow:hidden即可 */
	}
</style>