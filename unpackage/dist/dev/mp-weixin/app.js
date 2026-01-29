"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
const utils_user = require("./utils/user.js");
if (!Math) {
  "./pages/home/home.js";
  "./pages/index/index.js";
  "./pages/active/active.js";
  "./pages/shop/shop.js";
  "./pages/my/my.js";
  "./pages/shop-detail/shop-detail.js";
  "./pages/shop-recommend/shop-recommend.js";
  "./pages/my-opportunity/my-opportunity.js";
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
  "./pages/platform-intro/platform-intro.js";
  "./pages/my-order-detail/my-order-detail.js";
  "./pages/sponsor-detail/sponsor-detail.js";
  "./packages/my-account-informationDetails/my-account-informationDetails.js";
  "./packages/my-account/my-account.js";
  "./packages/home-opportunitiesPublish/home-opportunitiesPublish.js";
  "./packages/home-commercialDetail/home-commercialDetail.js";
  "./packages/my-edit/my-edit.js";
  "./packages/active-publish/active-publish.js";
  "./packages/active-detail/active-detail.js";
  "./packages/active-enroll/active-enroll.js";
  "./packages/my-points/my-points.js";
  "./packages/my-zhimi/my-zhimi.js";
  "./packages/getPoints/getPoints.js";
  "./packages/my-member/my-member.js";
  "./packages/my-friendInvitation/my-friendInvitation.js";
  "./packages/my-systemConstruction/my-systemConstruction.js";
  "./packages/user-opportunities/user-opportunities.js";
  "./packages/home-customization/home-customization.js";
  "./packages/my-businessCard/my-businessCard.js";
  "./packages/applicationBusinessCard/applicationBusinessCard.js";
  "./packages/myStore-edit/myStore-edit.js";
  "./packages/my-active/my-active.js";
  "./packages/my-collection/my-collection.js";
  "./packages/participant-detail/participant-detail.js";
  "./packages/user-reviews/user-reviews.js";
  "./packages/user-review-list/user-review-list.js";
  "./packages/social-interaction/social-interaction.js";
  "./packages/my-reviews/my-reviews.js";
  "./packages/ContactService/ContactService.js";
  "./packages/smart-rice-records/smart-rice-records.js";
  "./packages/experience-records/experience-records.js";
  "./packages/enterprise-edit/enterprise-edit.js";
  "./packages/enterprise-list/enterprise-list.js";
  "./packages/enterprise-detail/enterprise-detail.js";
  "./packages/enterprise-auth/enterprise-auth.js";
  "./packages/enterprise-card/enterprise-card.js";
  "./packages/relationship-path/relationship-path.js";
  "./packages/user-view-trace/user-view-trace.js";
}
const _sfc_main = {
  data() {
    return {
      locationTimer: null
    };
  },
  onLaunch: function(options) {
    common_vendor.index.__f__("log", "at App.vue:14", "App Launch, 启动参数 options:", options);
    let finalQuery = options.query || {};
    if (options.query && options.query.scene) {
      const sceneStr = decodeURIComponent(options.query.scene);
      common_vendor.index.__f__("log", "at App.vue:22", "✅ 解析 query.scene:", sceneStr);
      parseScene(sceneStr);
    } else if (options.scene && typeof options.scene === "string" && options.scene.includes("=")) {
      const sceneStr = decodeURIComponent(options.scene);
      common_vendor.index.__f__("log", "at App.vue:29", "✅ 解析 options.scene:", sceneStr);
      parseScene(sceneStr);
    }
    function parseScene(str) {
      const sceneParams = {};
      str.split("&").forEach((item) => {
        const parts = item.split("=");
        if (parts[0] && parts[1]) {
          sceneParams[parts[0]] = parts[1];
        }
      });
      finalQuery = {
        ...finalQuery,
        ...sceneParams
      };
    }
    const inviteCode = finalQuery.c || finalQuery.inviteCode;
    if (inviteCode) {
      common_vendor.index.__f__("log", "at App.vue:50", "✅ 最终捕获到邀请码:", inviteCode);
      common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
    }
  },
  // onLaunch: function(options) {
  // 	uni.__f__('warn','at App.vue:55','当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
  // 	uni.__f__('log','at App.vue:56','App Launch')
  // 	uni.__f__('log','at App.vue:58','App Launch, 启动参数 options:', options);
  // 	let finalQuery = options.query || {};
  // 	// 1. 检查是否存在 scene 参数 (扫码进入)
  // 	if (options.scene) {
  // 		const sceneStr = decodeURIComponent(options.scene);
  // 		uni.__f__('log','at App.vue:65','✅ [App.vue] 检测到 scene 参数:', sceneStr);
  // 		// 2. 将 scene 字符串解析成键值对对象
  // 		const sceneParams = {};
  // 		sceneStr.split('&').forEach(item => {
  // 			const parts = item.split('=');
  // 			if (parts[0] && parts[1]) {
  // 				sceneParams[parts[0]] = parts[1];
  // 			}
  // 		});
  // 		uni.__f__('log','at App.vue:74','✅ [App.vue] scene 解析结果:', sceneParams);
  // 		// 3. 将解析后的参数合并到 finalQuery 中，优先使用 scene 里的参数
  // 		finalQuery = {
  // 			...finalQuery,
  // 			...sceneParams
  // 		};
  // 	}
  // 	// 4. 从最终的参数对象中提取邀请码
  // 	const inviteCode = finalQuery.c || finalQuery.inviteCode;
  // 	if (inviteCode) {
  // 		uni.__f__('log','at App.vue:85','✅ [App.vue] 全局捕获到邀请码:', inviteCode);
  // 		uni.setStorageSync('pendingInviteCode', inviteCode);
  // 	}
  // },
  onShow: function() {
    utils_user.globalSilentLogin();
    common_vendor.index.__f__("log", "at App.vue:92", "App Show");
    this.startLocationUpdates();
    this.checkUpdate();
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:99", "App Hide");
    this.stopLocationUpdates();
  },
  methods: {
    /**
     * 检查小程序更新
     */
    checkUpdate() {
      const updateManager = common_vendor.index.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        common_vendor.index.__f__("log", "at App.vue:114", "是否有新版本发布:", res.hasUpdate);
      });
      updateManager.onUpdateReady(function() {
        common_vendor.index.showModal({
          title: "更新提示",
          content: "新版本已经准备好，是否重启应用？",
          success: function(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      updateManager.onUpdateFailed(function() {
        common_vendor.index.__f__("error", "at App.vue:134", "新版本下载失败");
      });
    },
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
        common_vendor.index.__f__("log", "at App.vue:159", "用户未登录，不启动位置上传定时器");
        return;
      }
      const updateTask = () => {
        common_vendor.index.__f__("log", "at App.vue:164", "正在获取并上传用户当前位置...");
        common_vendor.index.getLocation({
          type: "gcj02",
          success: async (res) => {
            common_vendor.index.__f__("log", "at App.vue:168", `获取位置成功: ${res.longitude}, ${res.latitude}`);
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
              common_vendor.index.__f__("error", "at App.vue:182", "自动上传位置信息失败:", error);
            } else {
              common_vendor.index.__f__("log", "at App.vue:184", "用户当前位置上传成功！");
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at App.vue:188", "获取位置信息失败:", err);
          }
        });
      };
      updateTask();
      this.locationTimer = setInterval(updateTask, 6e5);
      common_vendor.index.__f__("log", "at App.vue:198", "位置上传定时器已启动");
    },
    /**
     * 停止位置上传
     */
    stopLocationUpdates() {
      if (this.locationTimer) {
        clearInterval(this.locationTimer);
        this.locationTimer = null;
        common_vendor.index.__f__("log", "at App.vue:208", "位置上传定时器已停止");
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
