"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_user = require("../../utils/user.js");
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
          common_vendor.index.showToast({
            title: "猎伙互动功能开发中",
            icon: "none"
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
      return {
        a: common_vendor.p({
          type: "chatboxes-filled",
          size: "24",
          color: "#fff"
        }),
        b: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        c: common_vendor.o(($event) => navigateTo("reviews")),
        d: common_vendor.p({
          type: "staff-filled",
          size: "24",
          color: "#fff"
        }),
        e: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        f: common_vendor.o(($event) => navigateTo("hunter")),
        g: common_vendor.p({
          type: "shop-filled",
          size: "24",
          color: "#fff"
        }),
        h: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        i: common_vendor.o(($event) => navigateTo("business"))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bcbcdbe7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/social-interaction/social-interaction.js.map
