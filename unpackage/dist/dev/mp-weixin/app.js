"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
if (!Math) {
  "./pages/home/home.js";
  "./pages/index/index.js";
  "./pages/active/active.js";
  "./pages/shop/shop.js";
  "./pages/my/my.js";
  "./pages/active-detail/active-detail.js";
  "./pages/active-publish/active-publish.js";
  "./pages/active-enroll/active-enroll.js";
  "./pages/my-edit/my-edit.js";
  "./pages/my-account/my-account.js";
  "./pages/my-businessCard/my-businessCard.js";
  "./pages/shop-detail/shop-detail.js";
  "./pages/home-commercialDetail/home-commercialDetail.js";
  "./pages/applicationBusinessCard/applicationBusinessCard.js";
  "./pages/shop-recommend/shop-recommend.js";
  "./pages/home-opportunitiesPublish/home-opportunitiesPublish.js";
  "./pages/my-active/my-active.js";
  "./pages/my-opportunity/my-opportunity.js";
  "./pages/my-collection/my-collection.js";
  "./pages/user-agreement/user-agreement.js";
  "./pages/location/location.js";
  "./pages/shop-list/shop-list.js";
  "./pages/my-setting/my-setting.js";
  "./pages/my-follow/my-follow.js";
  "./pages/my-active-apply/my-active-apply.js";
  "./pages/my-active-manage/my-active-manage.js";
  "./pages/my-active-approval/my-active-approval.js";
  "./pages/my-shop/my-shop.js";
  "./pages/my-shopRecommend/my-shopRecommend.js";
  "./pages/myStore-edit/myStore-edit.js";
  "./pages/login/login.js";
  "./pages/activity-participants/activity-participants.js";
  "./pages/my-edit-label/my-edit-label.js";
  "./pages/my-active-registeredUser/my-active-registeredUser.js";
  "./pages/my-active-secondRegistration/my-active-secondRegistration.js";
  "./pages/my-recommendFriends/my-recommendFriends.js";
  "./pages/recharge/recharge.js";
  "./pages/my-memberDetails/my-memberDetails.js";
  "./pages/my-order/my-order.js";
  "./pages/relation/relation.js";
  "./pages/shop-apply/shop-apply.js";
  "./pages/my-systemSuggestions/my-systemSuggestions.js";
  "./pages/my-auth/my-auth.js";
  "./packages/my-account-informationDetails/my-account-informationDetails.js";
}
const _sfc_main = {
  data() {
    return {
      locationTimer: null
    };
  },
  onLaunch: function(options) {
    common_vendor.index.__f__("warn", "at App.vue:11", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
    common_vendor.index.__f__("log", "at App.vue:12", "App Launch");
    common_vendor.index.__f__("log", "at App.vue:14", "App Launch, 启动参数 options:", options);
    let finalQuery = options.query || {};
    if (options.scene) {
      const sceneStr = decodeURIComponent(options.scene);
      common_vendor.index.__f__("log", "at App.vue:21", "✅ [App.vue] 检测到 scene 参数:", sceneStr);
      const sceneParams = {};
      sceneStr.split("&").forEach((item) => {
        const parts = item.split("=");
        if (parts[0] && parts[1]) {
          sceneParams[parts[0]] = parts[1];
        }
      });
      common_vendor.index.__f__("log", "at App.vue:30", "✅ [App.vue] scene 解析结果:", sceneParams);
      finalQuery = {
        ...finalQuery,
        ...sceneParams
      };
    }
    const inviteCode = finalQuery.c || finalQuery.inviteCode;
    if (inviteCode) {
      common_vendor.index.__f__("log", "at App.vue:41", "✅ [App.vue] 全局捕获到邀请码:", inviteCode);
      common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:46", "App Show");
    this.startLocationUpdates();
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:51", "App Hide");
    this.stopLocationUpdates();
  },
  methods: {
    /**
     * 检查用户是否已登录
     */
    isLoggedIn() {
      const token = common_vendor.index.getStorageSync("token");
      return !!token;
    },
    /**
     * 启动周期性位置上传
     */
    startLocationUpdates() {
      this.stopLocationUpdates();
      if (!this.isLoggedIn()) {
        common_vendor.index.__f__("log", "at App.vue:76", "用户未登录，不启动位置上传定时器");
        return;
      }
      const updateTask = () => {
        common_vendor.index.__f__("log", "at App.vue:81", "正在获取并上传用户当前位置...");
        common_vendor.index.getLocation({
          type: "gcj02",
          success: async (res) => {
            common_vendor.index.__f__("log", "at App.vue:85", `获取位置成功: ${res.longitude}, ${res.latitude}`);
            const {
              error
            } = await utils_request.request("/app-api/member/user/upload-location", {
              method: "POST",
              data: {
                longitude: res.longitude,
                latitude: res.latitude
              }
            });
            if (error) {
              common_vendor.index.__f__("error", "at App.vue:99", "自动上传位置信息失败:", error);
            } else {
              common_vendor.index.__f__("log", "at App.vue:101", "用户当前位置上传成功！");
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at App.vue:105", "获取位置信息失败:", err);
          }
        });
      };
      updateTask();
      this.locationTimer = setInterval(updateTask, 6e5);
      common_vendor.index.__f__("log", "at App.vue:115", "位置上传定时器已启动");
    },
    /**
     * 停止位置上传
     */
    stopLocationUpdates() {
      if (this.locationTimer) {
        clearInterval(this.locationTimer);
        this.locationTimer = null;
        common_vendor.index.__f__("log", "at App.vue:125", "位置上传定时器已停止");
      }
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
