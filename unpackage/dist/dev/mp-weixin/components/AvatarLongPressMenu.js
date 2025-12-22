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
  __name: "AvatarLongPressMenu",
  emits: ["action"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const popup = common_vendor.ref(null);
    const targetUser = common_vendor.ref({});
    const emit = __emit;
    const open = (user) => {
      targetUser.value = user || {};
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    const handleAction = (type) => {
      close();
      emit("action", {
        type,
        user: targetUser.value
      });
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return {
        a: targetUser.value.avatar || "/static/icon/default-avatar.png",
        b: common_vendor.t(targetUser.value.name || "商友"),
        c: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#fff"
        }),
        d: common_vendor.o(close),
        e: common_vendor.p({
          type: "plusempty",
          size: "28",
          color: "#fff"
        }),
        f: common_vendor.o(($event) => handleAction("addCircle")),
        g: common_vendor.p({
          type: "person",
          size: "28",
          color: "#FF7009"
        }),
        h: common_vendor.o(($event) => handleAction("viewCard")),
        i: common_vendor.p({
          type: "star",
          size: "24",
          color: "#666"
        }),
        j: common_vendor.o(($event) => handleAction("comment")),
        k: common_vendor.p({
          type: "minus",
          size: "24",
          color: "#ff4d4f"
        }),
        l: common_vendor.o(($event) => handleAction("removeCircle")),
        m: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#ff4d4f"
        }),
        n: common_vendor.o(($event) => handleAction("disconnect")),
        o: common_vendor.sr(popup, "5571075f-0", {
          "k": "popup"
        }),
        p: common_vendor.p({
          type: "center",
          ["mask-click"]: true
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5571075f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AvatarLongPressMenu.js.map
