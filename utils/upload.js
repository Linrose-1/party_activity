/**
 * uploadFile.js
 * 
 * 一个基于“预签名URL”模式的文件上传模块。
 * 它会依次执行：
 * 1. 从后端获取上传许可（预签名URL）。
 * 2. 将文件直接上传到云存储。
 * 3. 【新增】调用后端接口对上传成功的图片进行安全检查。
 */

// 1. 导入您项目中封装好的 request 函数
import request from '@/utils/request.js';

// 2. 封装一个 FileApi 对象来管理文件相关的后端接口调用
const FileApi = {
	/**
	 * 从后端获取文件的预签名上传地址
	 */
	getFilePresignedUrl: (fileName, directory) => {
		return request('/app-api/infra/file/presigned-url', {
			method: 'GET',
			data: {
				name: fileName,
				directory: directory,
			}
		});
	},

	/**
	 * 【新增】调用后端接口检查图片内容是否合规
	 * @param {string} url - 要检查的图片的URL
	 * @returns {Promise<{data: any, error: string|null}>}
	 */
	checkImage: (url) => {
		return request('/app-api/infra/file/check-img', {
			method: 'GET',
			data: {
				imgUrl: url // 根据接口文档，参数名为 imgUrl
			}
		});
	}
};

/**
 * 封装文件上传（预签名URL模式 + 安全检查）
 *
 * ... (JSDoc 注释保持不变) ...
 */
const uploadFile = async (file, options = {}) => {
	// ------------------- 1. 参数校验和准备 (无变化) -------------------
	if (!file || !file.path) {
		const errorMsg = '未提供有效的文件对象（缺少 path 属性）';
		console.error('uploadFile Error:', errorMsg);
		return {
			data: null,
			error: errorMsg
		};
	}
	const fileName = file.name || file.path.substring(file.path.lastIndexOf('/') + 1);
	const fileType = file.type || 'application/octet-stream';
	const {
		directory = ''
	} = options;

	// ------------------- 2. 获取预签名URL (无变化) -------------------
	const {
		data: presignedInfo,
		error: getUrlError
	} = await FileApi.getFilePresignedUrl(fileName, directory);
	if (getUrlError) {
		console.error('获取预签名URL失败:', getUrlError);
		return {
			data: null,
			error: getUrlError
		};
	}

	// ------------------- 3. 读取文件本地二进制数据 (无变化) -------------------
	const fileBufferResult = await new Promise(resolve => {
		uni.getFileSystemManager().readFile({
			filePath: file.path,
			success: res => resolve({
				data: res.data,
				error: null
			}),
			fail: err => resolve({
				data: null,
				error: err.errMsg || '读取本地文件失败'
			}),
		});
	});
	if (fileBufferResult.error) {
		console.error('读取本地文件失败:', fileBufferResult.error);
		return {
			data: null,
			error: fileBufferResult.error
		};
	}
	const fileBuffer = fileBufferResult.data;

	// ------------------- 4. 上传文件到云存储 (无变化) -------------------
	try {
		await new Promise((resolve, reject) => {
			uni.request({
				url: presignedInfo.uploadUrl,
				method: 'PUT',
				header: {
					'Content-Type': fileType
				},
				data: fileBuffer,
				success: res => {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(res);
					} else {
						reject(new Error(`云存储上传失败，状态码: ${res.statusCode}`));
					}
				},
				fail: err => reject(err),
			});
		});
	} catch (err) {
		console.error('上传文件到云存储异常:', err);
		return {
			data: null,
			error: err.message || '文件上传到云端失败'
		};
	}

	// ------------------- 5. 【新增】调用接口进行图片安全检查 -------------------
	// 只有当文件是图片类型时，才进行检查。可以根据需要调整这个判断逻辑。
	try {
		console.log(`[准备检查图片] URL: ${presignedInfo.url}`);

		const {
			error: checkError
		} = await FileApi.checkImage(presignedInfo.url);

		// 【在这里也加上日志】
		console.log('[图片检查完成] 返回的错误信息:', checkError);

		if (checkError) {
			console.warn('文件安全检查未通过:', checkError);
			return {
				data: null,
				error: `内容违规: ${checkError}`
			};
		}
	} catch (err) {
		console.error('调用安全检查接口时发生异常:', err);
		return {
			data: null,
			error: '文件安全检查失败'
		};
	}

	// ------------------- 6. 返回最终结果 -------------------
	// 如果所有步骤都成功，返回最终可访问的 URL
	return {
		data: presignedInfo.url,
		error: null
	};
};

// 将核心函数导出
export default uploadFile;