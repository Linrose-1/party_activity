// 1. 定义项目的基础URL，与 request.js 保持一致或集中管理
// const baseURL = 'http://8.163.18.207:48080';
const baseURL = 'https://jyj.gofor.club';

/**
 * 封装 uni.uploadFile 用于文件上传
 * @param {string} filePath - 必填，文件的本地临时路径
 * @param {object} [options={}] - 可选，其他配置项
 * @param {string} [options.directory=''] - 上传到服务器的目录
 * @param {string} [options.name='file'] - 后端接收文件时使用的字段名，默认为 'file'
 * @returns {Promise<{data: string|null, error: string|null}>} - 返回一个包含 { data, error } 的对象
 */
const uploadFile = async (filePath, options = {}) => {
	// ------------------- 参数处理 -------------------
	if (!filePath) {
		console.error('uploadFile Error: filePath is required.');
		return { data: null, error: '未提供文件路径' };
	}
	// 设置默认值
	const { directory = '', name = 'file' } = options;

	// ------------------- 获取认证信息 -------------------
	const token = uni.getStorageSync('token');

	// ------------------- 执行上传 -------------------
	try {
		const res = await uni.uploadFile({
			url: baseURL + '/app-api/infra/file/upload', // 完整的上传接口地址
			filePath: filePath,
			name: name, // 使用可配置的字段名
			header: {
				'Authorization': token || '', // 携带认证 Token
			},
			formData: {
				// 携带额外的表单数据
				'directory': directory
			}
		});

		// ------------------- 响应处理 -------------------
		if (res.statusCode === 200) {
			// uni.uploadFile 返回的 res.data 是 JSON 字符串，需要手动解析
			const responseData = JSON.parse(res.data);

			if (responseData.code === 0) {
				// 上传成功，返回 URL
				return { data: responseData.data, error: null };
			} else {
				// 后端业务逻辑错误
				return { data: null, error: responseData.msg || '上传失败' };
			}
		} else {
			// HTTP 状态码错误
			return { data: null, error: `服务器错误: ${res.statusCode}` };
		}
	} catch (err) {
		// 网络或其他异常
		return { data: null, error: err.message || '网络错误' };
	}
};

// 将核心函数导出，以便其他文件可以导入使用
export default uploadFile;