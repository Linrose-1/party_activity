// import {
// 	ref
// } from 'vue';

// // 请求的基本配置
// const baseURL = 'https://jyj.gofor.club';
// // const baseURL = 'http://haiyan.nat300.top';
// // const baseURL = 'https://chuxia5207.top';
// // const baseURL = 'http://8.163.18.207:48080';
// const timeout = 10000; // 请求超时

// // 封装请求方法
// const request = async (url, options = {}) => {
// 	const config = {
// 		url: baseURL + url,
// 		method: options.method || 'GET', // 默认为GET请求
// 		data: options.data || {}, // 请求的数据
// 		header: options.header || {}, // 请求头
// 		timeout: options.timeout || timeout, // 请求超时
// 	};

// 	config.header['Content-Type'] = 'application/json';

// 	// 获取 access_token 并加入请求头
// 	const token = uni.getStorageSync('token');
// 	// const token = '0cdbffcfe50141019187077afdf4fb6f';
// 	if (token) {
// 		// config.header['Authorization'] = `Bearer ${token}`;
// 		config.header['Authorization'] = token;
// 	}

// 	console.log('================ 请求大起底 ================');
// 	console.log('1. 请求 URL:', config.url);
// 	console.log('2. 本地 Token 值:', token, '类型:', typeof token);
// 	console.log('3. 最终 Headers:', JSON.stringify(config.header));
// 	console.log('4. 发送 Body 数据:', JSON.stringify(config.data));
// 	console.log('==========================================');

// 	try {
// 		const res = await uni.request(config);

// 		if (res.statusCode === 200) {
// 			// 判断返回的 code 字段是否为 0 (成功)
// 			if (res.data.code === 0) {
// 				return {
// 					data: res.data.data,
// 					error: null
// 				};
// 			} else {
// 				// 【【【核心修改点在这里】】】
// 				// 检查是否是需要特殊处理的 453 错误码
// 				if (res.data.code === 453) {
// 					// 如果是 453，返回整个 res.data 对象
// 					// 这样业务代码就能拿到 code 和 msg
// 					return {
// 						data: null,
// 						error: res.data // 返回 { code: 453, msg: '...' }
// 					};
// 				} else {
// 					// 对于其他所有业务错误，保持原有逻辑不变
// 					return {
// 						data: null,
// 						error: res.data.msg || '请求失败' // 只返回错误消息字符串
// 					};
// 				}
// 			}
// 		} else {
// 			return {
// 				data: null,
// 				error: '请求失败，状态码: ' + res.statusCode
// 			};
// 		}
// 	} catch (err) {
// 		return {
// 			data: null,
// 			error: err.message || '网络错误'
// 		};
// 	}
// };

// // 导出封装的请求方法
// export default request;

// src/utils/request.js

const baseURL = 'https://jyj.gofor.club';
// const baseURL = 'http://haiyan.nat300.top';
// const baseURL = 'https://chuxia5207.top';
// const baseURL = 'http://8.163.18.207:48080';
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