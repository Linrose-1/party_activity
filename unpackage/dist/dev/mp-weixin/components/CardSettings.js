"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_data_checkbox2 + _easycom_uni_popup2)();
}
const _easycom_uni_data_checkbox = () => "../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_data_checkbox + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "CardSettings",
  props: {
    modelValue: Object
  },
  emits: ["apply"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const popup = common_vendor.ref(null);
    const config = common_vendor.reactive({});
    const toggles = {
      cardShowSlogan: "品牌标语",
      cardShowContact: "联系方式",
      cardShowSocial: "社交媒体",
      cardShowOnlineStore: "线上线下门店",
      cardShowDetailAddress: "显示详细地址"
    };
    common_vendor.watch(() => props.modelValue, (v) => v && Object.assign(config, JSON.parse(JSON.stringify(v))), {
      immediate: true
    });
    const open = () => popup.value.open();
    const apply = () => {
      emit("apply", config);
      popup.value.close();
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(["#FF8600", "#007AFF", "#34C759", "#FF3B30", "#5856D6", "#000000"], (c, k0, i0) => {
          return {
            a: c,
            b: c,
            c: config.cardMainColor === c ? 1 : "",
            d: common_vendor.o(($event) => config.cardMainColor = c, c)
          };
        }),
        b: common_vendor.o(($event) => config.cardLogoStyle = $event),
        c: common_vendor.p({
          localdata: [{
            text: "圆形",
            value: 0
          }, {
            text: "方形",
            value: 1
          }, {
            text: "圆角",
            value: 2
          }],
          modelValue: config.cardLogoStyle
        }),
        d: common_vendor.f(toggles, (label, key, i0) => {
          return {
            a: common_vendor.t(label),
            b: config[key] === 1,
            c: common_vendor.o((e) => config[key] = e.detail.value ? 1 : 0, key),
            d: key
          };
        }),
        e: common_vendor.o(apply),
        f: common_vendor.sr(popup, "af537140-0", {
          "k": "popup"
        }),
        g: common_vendor.p({
          type: "bottom"
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-af537140"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/CardSettings.js.map
