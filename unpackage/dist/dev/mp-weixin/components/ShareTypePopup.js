"use strict";
const common_vendor = require("../common/vendor.js");
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
const _sfc_main = {
  __name: "ShareTypePopup",
  emits: ["selectMode", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const popupRef = common_vendor.ref(null);
    const open = () => {
      popupRef.value.open();
    };
    const close = () => {
      popupRef.value.close();
    };
    const handleShare = (mode) => {
      emit("selectMode", mode);
      setTimeout(() => {
        close();
      }, 100);
    };
    const onChange = (e) => {
      emit("change", e);
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "person-filled",
          size: "32",
          color: "#FF6A00"
        }),
        b: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        c: common_vendor.o(($event) => handleShare("SELF")),
        d: common_vendor.p({
          type: "staff-filled",
          size: "32",
          color: "#1890FF"
        }),
        e: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        f: common_vendor.o(($event) => handleShare("PROXY")),
        g: common_vendor.o(close),
        h: common_vendor.sr(popupRef, "a159665f-0", {
          "k": "popupRef"
        }),
        i: common_vendor.o(onChange),
        j: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a159665f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ShareTypePopup.js.map
