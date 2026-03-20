import {
	reactive
} from 'vue';
import request from './request.js';

// 1. 定义响应式状态，增加 sixDegreeCount
export const unreadState = reactive({
	businessCount: 0,
	activityCount: 0,
	sixDegreeCount: 0, // 【新增】六度人脉未读数
	storeCount: 0,
	total: 0, // 猩世界显示的总未读数
	reviewUnreadCount: 0, // 点评互动
	hunterInterestCount: 0, // 猎伙互动 (对应 businessOpportunitiesInterestCount)
	businessOpCommentCount: 0 // 商机评论 (对应 businessOpportunitiesUnreadCount)
});

/**
 * 更新 TabBar 红点的方法
 * 索引对应 pages.json：
 * 0: 商友圈 (home)
 * 1: 聚会 (active)
 * 2: 六度人脉 (six-degrees)
 * 3: 聚店 (shop)
 * 4: 猩世界 (my)
 */
export const updateTabBarDots = () => {
	const pages = getCurrentPages();
	if (pages.length === 0) return;

	const currentPage = pages[pages.length - 1];
	const tabBarPages = [
		'pages/home/home',
		'pages/active/active',
		'pages/six-degrees/six-degrees',
		'pages/shop/shop',
		'pages/my/my'
	];

	if (!tabBarPages.includes(currentPage.route)) return;

	const safeSetDot = (idx, show) => {
		try {
			if (show) {
				uni.showTabBarRedDot({
					index: idx
				});
			} else {
				uni.hideTabBarRedDot({
					index: idx
				});
			}
		} catch (e) {}
	};

	// 0. 商友圈 (Tab 0)
	safeSetDot(0, unreadState.businessCount > 0);
	// 1. 聚会 (Tab 1)
	safeSetDot(1, unreadState.activityCount > 0);

	// 2. 【新增】六度人脉 (Tab 2)
	safeSetDot(2, unreadState.sixDegreeCount > 0);

	// 3. 聚店 (Tab 3)
	safeSetDot(3, unreadState.storeCount > 0);
	// 4. 猩世界 (Tab 4)
	safeSetDot(4, unreadState.total > 0);
};


/**
 * 核心请求函数
 */
export const fetchGlobalUnread = async () => {
	const token = uni.getStorageSync('token');
	if (!token) return;

	try {
		const {
			data,
			error
		} = await request('/app-api/member/user/unread-count', {
			method: 'GET'
		});
		if (!error && data) {
			// 更新各维度数量
			unreadState.businessCount = data.businessCount || 0;
			unreadState.activityCount = data.activityCount || 0;
			unreadState.sixDegreeCount = data.sixDegreeCount || 0; // 【新增】
			unreadState.storeCount = data.storeCount || 0;

			// 【优化】直接使用后端返回的 totalUnreadCount 字段作为“猩世界”红点依据
			// 这样能确保包含 评论互动、商机感兴趣等所有逻辑
			unreadState.total = data.totalUnreadCount || 0;

			unreadState.reviewUnreadCount = data.reviewUnreadCount || 0;
			unreadState.hunterInterestCount = data.businessOpportunitiesInterestCount || 0;
			unreadState.businessOpCommentCount = data.businessOpportunitiesUnreadCount || 0;

			// 执行红点更新
			updateTabBarDots();
		}
	} catch (e) {
		console.error('获取全局未读数失败', e);
	}
};


// 轮询控制器
let timer = null;
export const startUnreadPolling = () => {
	if (timer) clearInterval(timer);
	fetchGlobalUnread(); // 立即执行一次
	timer = setInterval(fetchGlobalUnread, 30000); // 30秒查一次
};

export const stopUnreadPolling = () => {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
};

export const fetchUnreadCounts = async () => {
	const token = uni.getStorageSync('token');
	if (!token) return null;

	const {
		data,
		error
	} = await request('/app-api/member/user/unread-count', {
		method: 'GET'
	});

	if (!error && data) {
		// 将未读数据缓存，方便各页面直接读取
		uni.setStorageSync('unread_data', data);

		// 如果是 TabBar 页面，可以顺便更新 TabBar 红点（假设第四个是我的/猩世界）
		if (data.totalUnreadCount > 0) {
			uni.showTabBarRedDot({
				index: 4
			});
		} else {
			uni.hideTabBarRedDot({
				index: 4
			});
		}
		return data;
	}
	return null;
};