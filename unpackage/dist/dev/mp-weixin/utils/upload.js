"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const FileApi = {
  /**
   * 从后端获取文件的预签名上传地址
   */
  getFilePresignedUrl: (fileName, directory) => {
    return utils_request.request("/app-api/infra/file/presigned-url", {
      method: "GET",
      data: {
        name: fileName,
        directory
      }
    });
  },
  /**
   * 【新增】调用后端接口检查图片内容是否合规
   * @param {string} url - 要检查的图片的URL
   * @returns {Promise<{data: any, error: string|null}>}
   */
  checkImage: (url) => {
    return utils_request.request("/app-api/infra/file/check-img", {
      method: "GET",
      data: {
        imgUrl: url
        // 根据接口文档，参数名为 imgUrl
      }
    });
  }
};
const uploadFile = async (file, options = {}) => {
  if (!file || !file.path) {
    const errorMsg = "未提供有效的文件对象（缺少 path 属性）";
    common_vendor.index.__f__("error", "at utils/upload.js:53", "uploadFile Error:", errorMsg);
    return {
      data: null,
      error: errorMsg
    };
  }
  const fileName = file.name || file.path.substring(file.path.lastIndexOf("/") + 1);
  const fileType = file.type || "application/octet-stream";
  const {
    directory = ""
  } = options;
  const {
    data: presignedInfo,
    error: getUrlError
  } = await FileApi.getFilePresignedUrl(fileName, directory);
  if (getUrlError) {
    common_vendor.index.__f__("error", "at utils/upload.js:71", "获取预签名URL失败:", getUrlError);
    return {
      data: null,
      error: getUrlError
    };
  }
  const fileBufferResult = await new Promise((resolve) => {
    common_vendor.index.getFileSystemManager().readFile({
      filePath: file.path,
      success: (res) => resolve({
        data: res.data,
        error: null
      }),
      fail: (err) => resolve({
        data: null,
        error: err.errMsg || "读取本地文件失败"
      })
    });
  });
  if (fileBufferResult.error) {
    common_vendor.index.__f__("error", "at utils/upload.js:93", "读取本地文件失败:", fileBufferResult.error);
    return {
      data: null,
      error: fileBufferResult.error
    };
  }
  const fileBuffer = fileBufferResult.data;
  try {
    await new Promise((resolve, reject) => {
      common_vendor.index.request({
        url: presignedInfo.uploadUrl,
        method: "PUT",
        header: {
          "Content-Type": fileType
        },
        data: fileBuffer,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res);
          } else {
            reject(new Error(`云存储上传失败，状态码: ${res.statusCode}`));
          }
        },
        fail: (err) => reject(err)
      });
    });
  } catch (err) {
    common_vendor.index.__f__("error", "at utils/upload.js:122", "上传文件到云存储异常:", err);
    return {
      data: null,
      error: err.message || "文件上传到云端失败"
    };
  }
  try {
    common_vendor.index.__f__("log", "at utils/upload.js:132", `[准备检查图片] URL: ${presignedInfo.url}`);
    const {
      error: checkError
    } = await FileApi.checkImage(presignedInfo.url);
    common_vendor.index.__f__("log", "at utils/upload.js:139", "[图片检查完成] 返回的错误信息:", checkError);
    if (checkError) {
      common_vendor.index.__f__("warn", "at utils/upload.js:142", "文件安全检查未通过:", checkError);
      return {
        data: null,
        error: `内容违规: ${checkError}`
      };
    }
  } catch (err) {
    common_vendor.index.__f__("error", "at utils/upload.js:149", "调用安全检查接口时发生异常:", err);
    return {
      data: null,
      error: "文件安全检查失败"
    };
  }
  return {
    data: presignedInfo.url,
    error: null
  };
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/upload.js.map
