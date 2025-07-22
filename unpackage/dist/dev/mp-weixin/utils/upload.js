"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "https://jyj.gofor.club";
const uploadFile = async (filePath, options = {}) => {
  if (!filePath) {
    common_vendor.index.__f__("error", "at utils/upload.js:16", "uploadFile Error: filePath is required.");
    return { data: null, error: "未提供文件路径" };
  }
  const { directory = "", name = "file" } = options;
  const token = common_vendor.index.getStorageSync("token");
  try {
    const res = await common_vendor.index.uploadFile({
      url: baseURL + "/app-api/infra/file/upload",
      // 完整的上传接口地址
      filePath,
      name,
      // 使用可配置的字段名
      header: {
        "Authorization": token || ""
        // 携带认证 Token
      },
      formData: {
        // 携带额外的表单数据
        "directory": directory
      }
    });
    if (res.statusCode === 200) {
      const responseData = JSON.parse(res.data);
      if (responseData.code === 0) {
        return { data: responseData.data, error: null };
      } else {
        return { data: null, error: responseData.msg || "上传失败" };
      }
    } else {
      return { data: null, error: `服务器错误: ${res.statusCode}` };
    }
  } catch (err) {
    return { data: null, error: err.message || "网络错误" };
  }
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/upload.js.map
