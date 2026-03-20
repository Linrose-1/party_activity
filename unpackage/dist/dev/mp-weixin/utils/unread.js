"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const unreadState = common_vendor.reactive({
  businessCount: 0,
  activityCount: 0,
  sixDegreeCount: 0,
  // 【新增】六度人脉未读数
  storeCount: 0,
  total: 0,
  // 猩世界显示的总未读数
  reviewUnreadCount: 0,
  // 点评互动
  hunterInterestCount: 0,
  // 猎伙互动 (对应 businessOpportunitiesInterestCount)
  businessOpCommentCount: 0
  // 商机评论 (对应 businessOpportunitiesUnreadCount)
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
  if (!tabBarPages.includes(currentPage.route))
    return;
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
  safeSetDot(2, unreadState.sixDegreeCount > 0);
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
      unreadState.sixDegreeCount = data.sixDegreeCount || 0;
      unreadState.storeCount = data.storeCount || 0;
      unreadState.total = data.totalUnreadCount || 0;
      unreadState.reviewUnreadCount = data.reviewUnreadCount || 0;
      unreadState.hunterInterestCount = data.businessOpportunitiesInterestCount || 0;
      unreadState.businessOpCommentCount = data.businessOpportunitiesUnreadCount || 0;
      updateTabBarDots();
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/unread.js:104", "获取全局未读数失败", e);
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
