"use strict";
const common_vendor = require("../common/vendor.js");
function getCachedUserInfo() {
  const userInfoStr = common_vendor.index.getStorageSync("userInfo");
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/user.js:13", "解析缓存的用户信息失败:", e);
      return null;
    }
  }
  return null;
}
function getInviteCode() {
  const userInfo = getCachedUserInfo();
  return userInfo ? userInfo.shardCode || "" : "";
}
exports.getCachedUserInfo = getCachedUserInfo;
exports.getInviteCode = getInviteCode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/user.js.map
