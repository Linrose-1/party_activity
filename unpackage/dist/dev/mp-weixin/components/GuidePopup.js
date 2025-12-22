"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const STORAGE_KEY = "has_shown_add_desktop_guide";
const _sfc_main = {
  __name: "GuidePopup",
  setup(__props, { expose: __expose }) {
    const popup = common_vendor.ref(null);
    const checkAndShow = () => {
      const hasShown = common_vendor.index.getStorageSync(STORAGE_KEY);
      if (!hasShown) {
        popup.value.open();
      }
    };
    const handleRemindLater = () => {
      popup.value.close();
    };
    const handleGoSetting = () => {
      common_vendor.index.setStorageSync(STORAGE_KEY, "true");
      popup.value.close();
      common_vendor.index.showToast({
        title: "请点击右上角 ··· 进行设置",
        icon: "none",
        duration: 3e3
      });
    };
    __expose({
      checkAndShow
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleRemindLater),
        b: common_vendor.o(handleGoSetting),
        c: common_vendor.sr(popup, "7e85ea7b-0", {
          "k": "popup"
        }),
        d: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e85ea7b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/GuidePopup.js.map
