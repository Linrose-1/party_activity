"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "https://test-api.gofor.club/local";
const timeout = 1e4;
const request = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.header
  };
  const token = common_vendor.index.getStorageSync("token");
  if (token && typeof token === "string" && token.trim() !== "") {
    headers["Authorization"] = token;
  }
  const config = {
    url: baseURL + url,
    method: options.method || "GET",
    data: options.data || {},
    header: headers,
    // 使用处理好的 headers
    timeout: options.timeout || timeout
  };
  try {
    const res = await common_vendor.index.request(config);
    common_vendor.index.__f__("log", "at utils/request.js:38", `[Response]`, res.statusCode, res.data);
    if (res.statusCode === 200) {
      if (res.data.code === 0) {
        return {
          data: res.data.data,
          error: null
        };
      } else if (res.data.code === 401) {
        common_vendor.index.__f__("warn", "at utils/request.js:49", "Token 失效 (401)，清除本地缓存");
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("userId");
        return {
          data: null,
          error: "账号未登录"
        };
      } else if (res.data.code === 453) {
        return {
          data: null,
          error: res.data
        };
      } else {
        return {
          data: null,
          error: res.data.msg || "请求失败"
        };
      }
    } else {
      return {
        data: null,
        error: "HTTP状态码: " + res.statusCode
      };
    }
  } catch (err) {
    common_vendor.index.__f__("error", "at utils/request.js:77", "[Network Error]", err);
    return {
      data: null,
      error: err.message || "网络错误"
    };
  }
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
