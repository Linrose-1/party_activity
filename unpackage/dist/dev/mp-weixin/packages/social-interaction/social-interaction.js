"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_user = require("../../utils/user.js");
const utils_unread = require("../../utils/unread.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "social-interaction",
  setup(__props) {
    common_vendor.onShow(() => {
      utils_unread.fetchGlobalUnread();
    });
    const navigateTo = async (type) => {
      if (!await utils_user.checkLoginGuard())
        return;
      switch (type) {
        case "reviews":
          common_vendor.index.navigateTo({
            url: "/packages/my-reviews/my-reviews"
          });
          break;
        case "hunter":
          common_vendor.index.navigateTo({
            url: "/packages/hunter-interaction/hunter-interaction"
          });
          break;
        case "business":
          common_vendor.index.navigateTo({
            url: "/packages/business-interaction/business-interaction"
          });
          break;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "chatboxes-filled",
          size: "24",
          color: "#fff"
        }),
        b: common_vendor.unref(utils_unread.unreadState).reviewUnreadCount > 0
      }, common_vendor.unref(utils_unread.unreadState).reviewUnreadCount > 0 ? {
        c: common_vendor.t(common_vendor.unref(utils_unread.unreadState).reviewUnreadCount > 99 ? "99+" : common_vendor.unref(utils_unread.unreadState).reviewUnreadCount)
      } : {}, {
        d: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        e: common_vendor.o(($event) => navigateTo("reviews")),
        f: common_vendor.p({
          type: "staff-filled",
          size: "24",
          color: "#fff"
        }),
        g: common_vendor.unref(utils_unread.unreadState).hunterInterestCount > 0
      }, common_vendor.unref(utils_unread.unreadState).hunterInterestCount > 0 ? {
        h: common_vendor.t(common_vendor.unref(utils_unread.unreadState).hunterInterestCount > 99 ? "99+" : common_vendor.unref(utils_unread.unreadState).hunterInterestCount)
      } : {}, {
        i: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        j: common_vendor.o(($event) => navigateTo("hunter")),
        k: common_vendor.p({
          type: "shop-filled",
          size: "24",
          color: "#fff"
        }),
        l: common_vendor.unref(utils_unread.unreadState).businessOpCommentCount > 0
      }, common_vendor.unref(utils_unread.unreadState).businessOpCommentCount > 0 ? {
        m: common_vendor.t(common_vendor.unref(utils_unread.unreadState).businessOpCommentCount > 99 ? "99+" : common_vendor.unref(utils_unread.unreadState).businessOpCommentCount)
      } : {}, {
        n: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        o: common_vendor.o(($event) => navigateTo("business"))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bcbcdbe7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/social-interaction/social-interaction.js.map
