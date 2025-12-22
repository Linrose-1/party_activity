// src/utils/user.js

/**
 * @description 从本地缓存中获取解析后的用户信息对象
 * @returns {object|null} 用户信息对象或 null
 */
export function getCachedUserInfo() {
	const userInfoStr = uni.getStorageSync('userInfo');
	if (userInfoStr) {
		try {
			return JSON.parse(userInfoStr);
		} catch (e) {
			console.error('解析缓存的用户信息失败:', e);
			return null;
		}
	}
	return null;
}

/**
 * @description 从本地缓存中直接获取用户的邀请码
 * @returns {string} 邀请码或空字符串
 */
export function getInviteCode() {
	const userInfo = getCachedUserInfo();
	return userInfo ? userInfo.shardCode || '' : '';
}

/**
 * @description 检查用户是否已完整登录（必须包含userId且已绑定手机号）
 * @returns {boolean} true=已完整登录, false=未登录或仅静默登录
 */
export function isUserFullyLoggedIn() {
	// 1. 检查是否有 token/userId (基础登录状态)
	const userId = uni.getStorageSync('userId');
	const token = uni.getStorageSync('token');
	if (!userId || !token) {
		return false;
	}

	// 2. 检查用户信息中是否有手机号
	const userInfo = getCachedUserInfo(); // 复用文件里已有的 getCachedUserInfo 方法
	if (!userInfo || !userInfo.mobile) {
		return false;
	}

	return true;
}

/**
 * @description 统一的登录权限校验卫士
 * 如果未完整登录，自动弹出提示框并引导去登录页。
 * @param {string} content - 弹窗提示文案，默认为标准话术
 * @returns {boolean} true=校验通过, false=校验不通过(已弹窗)
 */
export function checkLoginGuard(content = '该功能需要您完善登录信息（绑定手机号）后才能使用，是否立即前往登录？') {
	if (isUserFullyLoggedIn()) {
		return true;
	}

	// 校验未通过，弹出引导窗
	uni.showModal({
		title: '温馨提示',
		content: content,
		confirmText: '去登录',
		cancelText: '再逛逛',
		confirmColor: '#FF6A00',
		success: (res) => {
			if (res.confirm) {
				uni.navigateTo({
					url: '/pages/index/index'
				});
			}
		}
	});

	return false;
}