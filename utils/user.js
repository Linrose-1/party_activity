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
	const userInfo = getCachedUserInfo(); 
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



// utils/user.js

let loginPromise = null;

/**
 * 全局静默登录方法
 * 任何页面调用它，都会复用同一个请求，避免并发重复登录
 */
export async function globalSilentLogin() {
	// 1. 如果已有 Token，直接返回成功
	if (uni.getStorageSync('token')) {
		return true;
	}

	// 2. 如果正在登录中，返回同一个 Promise
	if (loginPromise) {
		return loginPromise;
	}

	// 3. 开始新的登录流程
	loginPromise = new Promise(async (resolve) => {
		console.log('🚀 [Global] 开始全局静默登录...');
		try {
			const loginRes = await uni.login({
				provider: 'weixin'
			});
			if (loginRes.code) {
				// 引入 request (注意循环依赖，如果 request 也引了 user.js，要小心)
				// 这里建议把 request 逻辑内联或者确保解耦
				// 简单起见，假设 request 可用
				const {
					request
				} = require('./request.js'); // 动态引入防循环

				const pendingInviteCode = uni.getStorageSync('pendingInviteCode');
				const {
					data
				} = await request('/app-api/member/auth/weixin-mini-app-login', {
					method: 'POST',
					data: {
						loginCode: loginRes.code,
						state: 'default',
						shardCode: pendingInviteCode || ''
					}
				});

				if (data && data.accessToken) {
					uni.setStorageSync('token', data.accessToken);
					uni.setStorageSync('userId', data.userId);
					console.log('✅ [Global] 静默登录成功');
					resolve(true);
					return;
				}
			}
		} catch (e) {
			console.error('❌ [Global] 静默登录失败', e);
		} finally {
			loginPromise = null; // 结束后清空锁
		}
		resolve(false);
	});

	return loginPromise;
}