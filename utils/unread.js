import {
	reactive
} from 'vue';
import request from './request.js';

// 定义响应式状态
export const unreadState = reactive({
	businessCount: 0,
	activityCount: 0,
	storeCount: 0,
	total: 0 // 给猩世界使用的总数
});

/**
 * 更新 TabBar 红点的方法
 * 索引对应 pages.json：0:商友圈, 1:聚会, 3:聚店, 4:猩世界
 */
export const updateTabBarDots = () => {
	// 获取当前页面栈
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

	// 如果当前页面不在 TabBar 列表中，直接返回，不调用 API
	if (!tabBarPages.includes(currentPage.route)) {
		return;
	}
	// 封装一个内部函数，防止重复写 try-catch
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
		} catch (e) {
			// 这里静默处理：如果不是 TabBar 页面，微信会报错，直接忽略即可
			// console.warn('当前非 TabBar 页面，跳过红点更新');
		}
	};

	// 1. 商友圈 (Tab 0)
	safeSetDot(0, unreadState.businessCount > 0);

	// 2. 聚会 (Tab 1)
	safeSetDot(1, unreadState.activityCount > 0);

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
			unreadState.businessCount = data.businessCount || 0;
			unreadState.activityCount = data.activityCount || 0;
			unreadState.storeCount = data.storeCount || 0;
			unreadState.total = unreadState.businessCount + unreadState.activityCount + unreadState.storeCount;

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