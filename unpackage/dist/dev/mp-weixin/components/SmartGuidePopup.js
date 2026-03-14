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
  __name: "SmartGuidePopup",
  props: {
    scenario: {
      type: Number,
      default: 1
    }
    // 1:新户, 2:老游客, 3:未完善资料
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const popup = common_vendor.ref(null);
    const welcomeTitle = common_vendor.computed(() => {
      if (props.scenario === 1)
        return "欢迎来到猩聚社——精英商友跨域社交社区！";
      if (props.scenario === 2)
        return "欢迎您再次来到猩聚社——精英商友跨域社交社区！";
      if (props.scenario === 3)
        return "欢迎来到猩聚社——精英商友跨域社交社区！完善资料您可获赠10智米，解锁猩聚社创新社交功能";
      return "";
    });
    const open = () => popup.value.open();
    const close = () => popup.value.close();
    const handleAction = (type) => {
      popup.value.close();
      if (type === "home")
        common_vendor.index.switchTab({
          url: "/pages/home/home"
        });
      if (type === "login")
        common_vendor.index.navigateTo({
          url: "/pages/index/index"
        });
      if (type === "edit")
        common_vendor.index.navigateTo({
          url: "/packages/my-edit/my-edit"
        });
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#ccc"
        }),
        b: common_vendor.o(close),
        c: common_vendor.t(welcomeTitle.value),
        d: __props.scenario === 1 || __props.scenario === 2
      }, __props.scenario === 1 || __props.scenario === 2 ? {
        e: common_vendor.p({
          type: "home-filled",
          size: "22",
          color: "#FF6A00"
        }),
        f: common_vendor.o(($event) => handleAction("home")),
        g: common_vendor.p({
          type: "personadd-filled",
          size: "22",
          color: "#FF6A00"
        }),
        h: common_vendor.o(($event) => handleAction("login"))
      } : __props.scenario === 3 ? {
        j: common_vendor.p({
          type: "compose",
          size: "22",
          color: "#FF6A00"
        }),
        k: common_vendor.o(($event) => handleAction("edit"))
      } : {}, {
        i: __props.scenario === 3,
        l: common_vendor.sr(popup, "2c5025b6-0", {
          "k": "popup"
        }),
        m: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2c5025b6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/SmartGuidePopup.js.map
