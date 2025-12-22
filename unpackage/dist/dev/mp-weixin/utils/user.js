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
function isUserFullyLoggedIn() {
  const userId = common_vendor.index.getStorageSync("userId");
  const token = common_vendor.index.getStorageSync("token");
  if (!userId || !token) {
    return false;
  }
  const userInfo = getCachedUserInfo();
  if (!userInfo || !userInfo.mobile) {
    return false;
  }
  return true;
}
function checkLoginGuard(content = "该功能需要您完善登录信息（绑定手机号）后才能使用，是否立即前往登录？") {
  if (isUserFullyLoggedIn()) {
    return true;
  }
  common_vendor.index.showModal({
    title: "温馨提示",
    content,
    confirmText: "去登录",
    cancelText: "再逛逛",
    confirmColor: "#FF6A00",
    success: (res) => {
      if (res.confirm) {
        common_vendor.index.navigateTo({
          url: "/pages/index/index"
        });
      }
    }
  });
  return false;
}
exports.checkLoginGuard = checkLoginGuard;
exports.getCachedUserInfo = getCachedUserInfo;
exports.getInviteCode = getInviteCode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/user.js.map
