"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "https://jyj.gofor.club";
const timeout = 1e4;
const request = async (url, options = {}) => {
  const config = {
    url: baseURL + url,
    method: options.method || "GET",
    // 默认为GET请求
    data: options.data || {},
    // 请求的数据
    header: options.header || {},
    // 请求头
    timeout: options.timeout || timeout
    // 请求超时
  };
  const token = common_vendor.index.getStorageSync("token");
  if (token) {
    config.header["Authorization"] = token;
  }
  try {
    const res = await common_vendor.index.request(config);
    if (res.statusCode === 200) {
      if (res.data.code === 0) {
        return {
          data: res.data.data,
          error: null
        };
      } else {
        if (res.data.code === 453) {
          return {
            data: null,
            error: res.data
            // 返回 { code: 453, msg: '...' }
          };
        } else {
          return {
            data: null,
            error: res.data.msg || "请求失败"
            // 只返回错误消息字符串
          };
        }
      }
    } else {
      return {
        data: null,
        error: "请求失败，状态码: " + res.statusCode
      };
    }
  } catch (err) {
    return {
      data: null,
      error: err.message || "网络错误"
    };
  }
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
