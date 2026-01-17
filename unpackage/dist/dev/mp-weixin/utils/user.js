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
let loginPromise = null;
async function globalSilentLogin() {
  if (common_vendor.index.getStorageSync("token")) {
    return true;
  }
  if (loginPromise) {
    return loginPromise;
  }
  loginPromise = new Promise(async (resolve) => {
    common_vendor.index.__f__("log", "at utils/user.js:103", "🚀 [Global] 开始全局静默登录...");
    try {
      const loginRes = await common_vendor.index.login({
        provider: "weixin"
      });
      if (loginRes.code) {
        const {
          request
        } = require("./request.js");
        const pendingInviteCode = common_vendor.index.getStorageSync("pendingInviteCode");
        const {
          data
        } = await request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: {
            loginCode: loginRes.code,
            state: "default",
            shardCode: pendingInviteCode || ""
          }
        });
        if (data && data.accessToken) {
          common_vendor.index.setStorageSync("token", data.accessToken);
          common_vendor.index.setStorageSync("userId", data.userId);
          common_vendor.index.__f__("log", "at utils/user.js:131", "✅ [Global] 静默登录成功");
          resolve(true);
          return;
        }
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/user.js:137", "❌ [Global] 静默登录失败", e);
    } finally {
      loginPromise = null;
    }
    resolve(false);
  });
  return loginPromise;
}
exports.checkLoginGuard = checkLoginGuard;
exports.getCachedUserInfo = getCachedUserInfo;
exports.getInviteCode = getInviteCode;
exports.globalSilentLogin = globalSilentLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/user.js.map
