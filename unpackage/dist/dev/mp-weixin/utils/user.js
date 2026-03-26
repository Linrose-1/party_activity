"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
function getCachedUserInfo() {
  const userInfoStr = common_vendor.index.getStorageSync("userInfo");
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/user.js:14", "解析缓存的用户信息失败:", e);
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
async function checkLoginGuard(content = "该功能需要您完善登录信息（绑定手机号）后才能使用，是否立即前往登录？") {
  if (isUserFullyLoggedIn()) {
    return true;
  }
  common_vendor.index.showLoading({
    title: "检查身份...",
    mask: true
  });
  try {
    const loginRes = await common_vendor.index.login({
      provider: "weixin"
    });
    if (loginRes.code) {
      const pendingInviteCode = common_vendor.index.getStorageSync("pendingInviteCode");
      const {
        data: loginData,
        error: loginError
      } = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
        method: "POST",
        data: {
          loginCode: loginRes.code,
          state: "default",
          shardCode: pendingInviteCode || ""
        }
      });
      if (!loginError && loginData && loginData.accessToken) {
        common_vendor.index.setStorageSync("token", loginData.accessToken);
        common_vendor.index.setStorageSync("userId", loginData.userId);
        const {
          data: userData,
          error: userError
        } = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        if (!userError && userData) {
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(userData));
          if (userData.mobile) {
            common_vendor.index.hideLoading();
            return true;
          }
        }
      }
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/user.js:153", "守卫检测异常:", e);
  } finally {
    common_vendor.index.hideLoading();
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
    common_vendor.index.__f__("log", "at utils/user.js:197", "🚀 [Global] 开始全局静默登录...");
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
          common_vendor.index.__f__("log", "at utils/user.js:225", "✅ [Global] 静默登录成功");
          resolve(true);
          return;
        }
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/user.js:231", "❌ [Global] 静默登录失败", e);
    } finally {
      loginPromise = null;
    }
    resolve(false);
  });
  return loginPromise;
}
function isScenario3User() {
  const userInfo = getCachedUserInfo();
  const token = common_vendor.index.getStorageSync("token");
  return !!(token && userInfo && userInfo.mobile && userInfo.isComplete != 1);
}
async function syncUserInfo() {
  const {
    data,
    error
  } = await utils_request.request("/app-api/member/user/get", {
    method: "GET"
  });
  if (!error && data) {
    common_vendor.index.__f__("log", "at utils/user.js:267", "🔄 [User] 正在同步用户信息到缓存...", data);
    common_vendor.index.setStorageSync("userInfo", JSON.stringify(data));
    common_vendor.index.setStorageSync("userId", data.id);
    return data;
  }
  return null;
}
async function canShowProfileRemind() {
  if (!isScenario3User()) {
    return false;
  }
  const {
    data,
    error
  } = await utils_request.request("/app-api/member/user/profile-remind", {
    method: "POST"
  });
  if (error) {
    common_vendor.index.__f__("warn", "at utils/user.js:303", "今日提醒额度已满或接口异常，不再弹窗:", error);
    return false;
  }
  return !!data;
}
exports.canShowProfileRemind = canShowProfileRemind;
exports.checkLoginGuard = checkLoginGuard;
exports.getCachedUserInfo = getCachedUserInfo;
exports.getInviteCode = getInviteCode;
exports.globalSilentLogin = globalSilentLogin;
exports.isUserFullyLoggedIn = isUserFullyLoggedIn;
exports.syncUserInfo = syncUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/user.js.map
