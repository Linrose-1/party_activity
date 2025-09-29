"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "StoreCard",
  props: {
    store: {
      type: Object,
      required: true
    }
  },
  emits: ["click-card"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const formattedDistance = common_vendor.computed(() => {
      if (typeof props.store.distance !== "number") {
        return null;
      }
      const distanceWithDecimals = props.store.distance.toFixed(2);
      return `${distanceWithDecimals}公里`;
    });
    const handleCardClick = () => {
      emit("click-card", props.store);
    };
    const handleInitiateParty = () => {
      common_vendor.index.navigateTo({
        url: `/packages/active-publish/active-publish?storeId=${props.store.id}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: __props.store.icon,
          size: "20",
          color: "#FF6B00"
        }),
        b: common_vendor.t(__props.store.storeName),
        c: formattedDistance.value
      }, formattedDistance.value ? {
        d: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#FF6B00"
        }),
        e: common_vendor.t(formattedDistance.value)
      } : {}, {
        f: common_vendor.t(__props.store.storeDescription),
        g: common_vendor.o(handleInitiateParty),
        h: common_vendor.o(handleCardClick)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8cae2ec5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/StoreCard.js.map
