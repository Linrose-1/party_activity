"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const SOUND_URL = "https://img.gofor.club/20251119/retro-coin-4-236671_1763536579022.mp3";
const _sfc_main = {
  __name: "PointsFeedbackPopup",
  setup(__props, { expose: __expose }) {
    const audioCtx = common_vendor.index.createInnerAudioContext();
    audioCtx.src = SOUND_URL;
    const popup = common_vendor.ref(null);
    const actionName = common_vendor.ref("");
    const points = common_vendor.ref(0);
    const hasIcon = common_vendor.ref(false);
    const show = (name, value) => {
      actionName.value = name;
      points.value = value;
      audioCtx.stop();
      audioCtx.seek(0);
      audioCtx.play();
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    __expose({
      show,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: hasIcon.value
      }, hasIcon.value ? {
        b: common_assets._imports_0$6
      } : {
        c: common_vendor.p({
          type: "gift-filled",
          size: "50",
          color: "#fff"
        })
      }, {
        d: common_vendor.t(actionName.value),
        e: common_vendor.t(points.value),
        f: common_vendor.o(close),
        g: common_vendor.sr(popup, "fe1ae207-0", {
          "k": "popup"
        }),
        h: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fe1ae207"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/PointsFeedbackPopup.js.map
