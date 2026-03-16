"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const unreadState = common_vendor.reactive({
  businessCount: 0,
  activityCount: 0,
  storeCount: 0,
  total: 0
  // 给猩世界使用的总数
});
const updateTabBarDots = () => {
  const pages = getCurrentPages();
  if (pages.length === 0)
    return;
  const currentPage = pages[pages.length - 1];
  const tabBarPages = [
    "pages/home/home",
    "pages/active/active",
    "pages/six-degrees/six-degrees",
    "pages/shop/shop",
    "pages/my/my"
  ];
  if (!tabBarPages.includes(currentPage.route)) {
    return;
  }
  const safeSetDot = (idx, show) => {
    try {
      if (show) {
        common_vendor.index.showTabBarRedDot({
          index: idx
        });
      } else {
        common_vendor.index.hideTabBarRedDot({
          index: idx
        });
      }
    } catch (e) {
    }
  };
  safeSetDot(0, unreadState.businessCount > 0);
  safeSetDot(1, unreadState.activityCount > 0);
  safeSetDot(3, unreadState.storeCount > 0);
  safeSetDot(4, unreadState.total > 0);
};
const fetchGlobalUnread = async () => {
  const token = common_vendor.index.getStorageSync("token");
  if (!token)
    return;
  try {
    const {
      data,
      error
    } = await utils_request.request("/app-api/member/user/unread-count", {
      method: "GET"
    });
    if (!error && data) {
      unreadState.businessCount = data.businessCount || 0;
      unreadState.activityCount = data.activityCount || 0;
      unreadState.storeCount = data.storeCount || 0;
      unreadState.total = unreadState.businessCount + unreadState.activityCount + unreadState.storeCount;
      updateTabBarDots();
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/unread.js:91", "获取全局未读数失败", e);
  }
};
let timer = null;
const startUnreadPolling = () => {
  if (timer)
    clearInterval(timer);
  fetchGlobalUnread();
  timer = setInterval(fetchGlobalUnread, 3e4);
};
const stopUnreadPolling = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
exports.fetchGlobalUnread = fetchGlobalUnread;
exports.startUnreadPolling = startUnreadPolling;
exports.stopUnreadPolling = stopUnreadPolling;
exports.unreadState = unreadState;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/unread.js.map
