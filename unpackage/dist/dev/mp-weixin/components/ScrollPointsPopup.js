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
  __name: "ScrollPointsPopup",
  setup(__props, { expose: __expose }) {
    const popup = common_vendor.ref(null);
    const totalExperience = common_vendor.ref(0);
    const list = common_vendor.ref([]);
    const open = (data) => {
      if (!data)
        return;
      totalExperience.value = data.totalExperience || 0;
      list.value = data.experienceStatisticsList || [];
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    const goToMyPoints = () => {
      close();
      common_vendor.index.navigateTo({
        url: "/packages/my-points/my-points"
      });
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(close),
        b: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#fff"
        }),
        c: common_vendor.t(totalExperience.value),
        d: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: item.num > 1
          }, item.num > 1 ? {
            c: common_vendor.t(item.num)
          } : {}, {
            d: common_vendor.t(item.totalExperience),
            e: index
          });
        }),
        e: list.value.length === 0
      }, list.value.length === 0 ? {} : {}, {
        f: common_vendor.o(goToMyPoints),
        g: common_vendor.sr(popup, "8e8743b8-0", {
          "k": "popup"
        }),
        h: common_vendor.p({
          type: "center",
          ["mask-click"]: true
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8e8743b8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ScrollPointsPopup.js.map
