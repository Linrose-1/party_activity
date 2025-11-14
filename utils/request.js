import {
	ref
} from 'vue';

// 请求的基本配置
// const baseURL = 'https://chuxia5207.top';
const baseURL = 'https://jyj.gofor.club';
// const baseURL = 'http://8.163.18.207:48080';
const timeout = 10000; // 请求超时

// 封装请求方法
const request = async (url, options = {}) => {
	const config = {
		url: baseURL + url,
		method: options.method || 'GET', // 默认为GET请求
		data: options.data || {}, // 请求的数据
		header: options.header || {}, // 请求头
		timeout: options.timeout || timeout, // 请求超时
	};

	// 获取 access_token 并加入请求头
	const token = uni.getStorageSync('token');
	// const token = '0cdbffcfe50141019187077afdf4fb6f';
	if (token) {
		// config.header['Authorization'] = `Bearer ${token}`;
		config.header['Authorization'] = token;
	}

	try {
		const res = await uni.request(config);

		if (res.statusCode === 200) {
			// 判断返回的 code 字段是否为 0 (成功)
			if (res.data.code === 0) {
				return {
					data: res.data.data,
					error: null
				};
			} else {
				// 【【【核心修改点在这里】】】
				// 检查是否是需要特殊处理的 453 错误码
				if (res.data.code === 453) {
					// 如果是 453，返回整个 res.data 对象
					// 这样业务代码就能拿到 code 和 msg
					return {
						data: null,
						error: res.data // 返回 { code: 453, msg: '...' }
					};
				} else {
					// 对于其他所有业务错误，保持原有逻辑不变
					return {
						data: null,
						error: res.data.msg || '请求失败' // 只返回错误消息字符串
					};
				}
			}
		} else {
			return {
				data: null,
				error: '请求失败，状态码: ' + res.statusCode
			};
		}
	} catch (err) {
		return {
			data: null,
			error: err.message || '网络错误'
		};
	}
};

// 导出封装的请求方法
export default request;