// const baseURL = 'https://jyj.gofor.club';
const baseURL = 'https://test-api.gofor.club/local';
// const baseURL = 'https://chuxia5207.top';
// const baseURL = 'http://8.163.18.207:48080';s
const timeout = 10000;

const request = async (url, options = {}) => {
	// 1. 初始化 Header，默认加上 JSON 类型
	const headers = {
		'Content-Type': 'application/json',
		...options.header
	};

	// 2. 处理 Token
	const token = uni.getStorageSync('token');
	// 只有当 token 有效且非空字符串时，才添加 Authorization
	if (token && typeof token === 'string' && token.trim() !== '') {
		headers['Authorization'] = token;
	}

	const config = {
		url: baseURL + url,
		method: options.method || 'GET',
		data: options.data || {},
		header: headers, // 使用处理好的 headers
		timeout: options.timeout || timeout,
	};

	// --- 调试日志 --
	// console.log(`[Request] ${config.method} ${config.url}`);
	// console.log(`[Headers]`, JSON.stringify(config.header));
	// console.log(`[Data]`, JSON.stringify(config.data));
	// ---------------------------------

	try {
		const res = await uni.request(config);

		// 打印后端返回的原始数据，看看系统异常到底长啥样
		console.log(`[Response]`, res.statusCode, res.data);

		if (res.statusCode === 200) {
			if (res.data.code === 0) {
				return {
					data: res.data.data,
					error: null
				};
			} else if (res.data.code === 401) {
				// 401 逻辑：只清除 Token，不强制跳转
				// 这样首页 onShow 里的 if (!token) 逻辑就会生效，从而触发静默登录
				console.warn('Token 失效 (401)，清除本地缓存');
				uni.removeStorageSync('token');
				uni.removeStorageSync('userId');
				// 注意：不要清除 userInfo，以免影响静默登录前的展示

				// 返回错误，让业务层知道失败了
				return {
					data: null,
					error: '账号未登录'
				};
			} else if (res.data.code === 453) {
				return {
					data: null,
					error: res.data
				};
			} else {
				return {
					data: null,
					error: res.data.msg || '请求失败'
				};
			}
		} else {
			return {
				data: null,
				error: 'HTTP状态码: ' + res.statusCode
			};
		}
	} catch (err) {
		console.error('[Network Error]', err);
		return {
			data: null,
			error: err.message || '网络错误'
		};
	}
};

export default request;