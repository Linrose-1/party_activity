import request from '@/utils/request.js';

/**
 * 通用生成小程序码方法
 * @param {String} path - 页面路径，如 'pages/home/home'
 * @param {Object} customParams - 自定义参数对象，如 { id: 123 }
 * @returns {Promise<String>} - 返回 Base64 图片数据
 */
export const generatePromotionQrCode = async (path, customParams = {}) => {
	const userId = uni.getStorageSync('userId');
	const userInfoStr = uni.getStorageSync('userInfo');
	let inviteCode = '';

	if (userInfoStr) {
		try {
			const user = JSON.parse(userInfoStr);
			inviteCode = user.shardCode || '';
		} catch (e) {}
	}

	// 1. 组装 Scene 参数 (严格控制32位以内)
	// c: 邀请码, s: 分享人, fs: 分享标记
	const params = [];
	if (inviteCode) params.push(`c=${inviteCode}`);
	if (userId) params.push(`s=${userId}`);

	// 合并额外传入的参数 (如 i=123)
	Object.keys(customParams).forEach(key => {
		params.push(`${key}=${customParams[key]}`);
	});

	params.push('fs=1'); // 固定分享标记
	const scene = params.join('&');

	console.log(`🚀 [生成二维码] 路径: ${path}, Scene: ${scene}`);

	// 2. 调用接口
	const {
		data,
		error
	} = await request('/app-api/member/social-user/wxa-qrcode', {
		method: 'POST',
		data: {
			scene: scene,
			path: path,
			width: 430,
			autoColor: true,
			checkPath: true,
			hyaline: true
		}
	});

	if (error) {
		console.error('生成二维码失败:', error);
		return '';
	}

	// 3. 返回处理好的 Base64
	return data.startsWith('data:image') ? data : `data:image/png;base64,${data}`;
};