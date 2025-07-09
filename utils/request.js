import {
	ref
} from 'vue';

// 请求的基本配置
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

	// 添加 ngrok-skip-browser-warning 头
	// config.header['ngrok-skip-browser-warning'] = '69420';

	try {
		// 使用 uni.request 来获取数据
		const res = await uni.request(config); // 直接等待响应，不需要解构

		if (res.statusCode === 200) {
			// 判断返回的 code 字段是否为 200
			if (res.data.code === 0) {
				return {
					data: res.data.data,
					error: null
				};
			} else {
				return {
					data: null,
					error: res.data.msg || '请求失败'
				}; // 返回错误信息
			}
		} else {
			return {
				data: null,
				error: '请求失败，状态码: ' + res.statusCode
			}; // 返回其他状态码的错误信息
		}
	} catch (err) {
		// 捕获网络或其他错误
		return {
			data: null,
			error: err.message || '网络错误'
		}; // 返回网络错误
	}
};

// 导出封装的请求方法
export default request;