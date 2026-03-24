// src/utils/user.js
import request from '@/utils/request.js';

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

// /**
//  * @description 统一的登录权限校验卫士
//  * 如果未完整登录，自动弹出提示框并引导去登录页。
//  * @param {string} content - 弹窗提示文案，默认为标准话术
//  * @returns {boolean} true=校验通过, false=校验不通过(已弹窗)
//  */
// export function checkLoginGuard(content = '该功能需要您完善登录信息（绑定手机号）后才能使用，是否立即前往登录？') {
// 	if (isUserFullyLoggedIn()) {
// 		return true;
// 	}

// 	// 校验未通过，弹出引导窗
// 	uni.showModal({
// 		title: '温馨提示',
// 		content: content,
// 		confirmText: '去登录',
// 		cancelText: '再逛逛',
// 		confirmColor: '#FF6A00',
// 		success: (res) => {
// 			if (res.confirm) {
// 				uni.navigateTo({
// 					url: '/pages/index/index'
// 				});
// 			}
// 		}
// 	});

// 	return false;
// }

/**
 * @description 智能登录权限校验卫士 (Async)
 * 1. 检查本地是否已完整登录 -> 是：放行 (true)
 * 2. 尝试静默登录获取 Token
 * 3. 获取用户信息检查是否绑定 -> 是：存缓存，放行 (true)
 * 4. 否：弹窗引导去绑定页 -> 拦截 (false)
 * 
 * @param {string} content - 弹窗提示文案
 * @returns {Promise<boolean>} true=校验通过/已自动登录, false=校验不通过(已弹窗)
 */
export async function checkLoginGuard(content = '该功能需要您完善登录信息（绑定手机号）后才能使用，是否立即前往登录？') {
	// 1. 第一道防线：本地缓存检查
	// 如果本地已经有 Token 且有手机号，直接放行，速度最快
	if (isUserFullyLoggedIn()) {
		return true;
	}

	// 2. 第二道防线：尝试静默登录补救
	// (即使用户本地没 Token，或者有 Token 但没手机号，我们都试着去后端问问“我是不是老用户？”)

	uni.showLoading({
		title: '检查身份...',
		mask: true
	});

	try {
		// 2.1 执行静默登录拿 Token
		// 这里复用 globalSilentLogin 或者直接写逻辑，为了独立性，这里写个精简版
		const loginRes = await uni.login({
			provider: 'weixin'
		});
		if (loginRes.code) {
			const pendingInviteCode = uni.getStorageSync('pendingInviteCode');
			const {
				data: loginData,
				error: loginError
			} = await request('/app-api/member/auth/weixin-mini-app-login', {
				method: 'POST',
				data: {
					loginCode: loginRes.code,
					state: 'default',
					shardCode: pendingInviteCode || ''
				}
			});

			if (!loginError && loginData && loginData.accessToken) {
				// 存 Token
				uni.setStorageSync('token', loginData.accessToken);
				uni.setStorageSync('userId', loginData.userId);

				// 2.2 拿到 Token 后，立即获取用户信息，检查是否绑定了手机号
				const {
					data: userData,
					error: userError
				} = await request('/app-api/member/user/get', {
					method: 'GET'
				});

				if (!userError && userData) {
					// 存用户信息
					uni.setStorageSync('userInfo', JSON.stringify(userData));

					// 【关键判断】：是老用户吗？(有手机号)
					if (userData.mobile) {
						uni.hideLoading();
						// 是老用户，直接放行！
						return true;
					}
				}
			}
		}
	} catch (e) {
		console.error('守卫检测异常:', e);
	} finally {
		uni.hideLoading();
	}

	// 3. 第三道防线：确实是新用户（或者接口挂了），弹窗引导
	// 只有到了这一步，才认为“真的需要去绑定了”
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



/**
 * @description 判断用户是否属于“情况3”：已登录、已绑手机号、但资料未完善
 */
export function isScenario3User() {
	const userInfo = getCachedUserInfo();
	const token = uni.getStorageSync('token');

	// 优化点：使用 != 1 兼容字符串 "1" 和数字 1，并确保字段存在
	return !!(token && userInfo && userInfo.mobile && userInfo.isComplete != 1);
}

/**
 * @description 从后端拉取最新的用户信息并同步到本地缓存
 * @returns {Promise<object|null>} 最新的用户信息或 null
 */
export async function syncUserInfo() {
	const {
		data,
		error
	} = await request('/app-api/member/user/get', {
		method: 'GET'
	});

	if (!error && data) {
		console.log('🔄 [User] 正在同步用户信息到缓存...', data);
		uni.setStorageSync('userInfo', JSON.stringify(data));
		uni.setStorageSync('userId', data.id); // 顺便同步一下userId确保一致
		return data;
	}
	return null;
}

// src/utils/user.js


/**
 * @description 尝试触发完善资料提醒（带频控）
 * 逻辑：
 * 1. 先进行本地静态检查 (isScenario3User)
 * 2. 如果本地校验通过，再请求后端频控接口打卡
 * 3. 只有接口返回成功（data为true），才允许前端弹窗
 * @returns {Promise<boolean>} 是否允许显示弹窗
 */
export async function canShowProfileRemind() {
	// 1. 本地预检：如果资料已经完善了，不需要提醒
	if (!isScenario3User()) {
		return false;
	}

	// 2. 调用后端频控接口（每天限2次）
	const {
		data,
		error
	} = await request('/app-api/member/user/profile-remind', {
		method: 'POST'
	});

	// 3. 逻辑判断：
	// 如果有 error，说明可能接口报错或者已经超过了今日次数 (msg: "已超过当日提醒次数")
	if (error) {
		console.warn('今日提醒额度已满或接口异常，不再弹窗:', error);
		return false;
	}

	// 4. 返回后端给出的布尔值结果
	return !!data;
}