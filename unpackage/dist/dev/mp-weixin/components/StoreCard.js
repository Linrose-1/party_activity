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
  setup(__props) {
    const props = __props;
    const navigateToStoreDetail = () => {
      common_vendor.index.navigateTo({
        url: "/pages/shop-detail/shop-detail"
      });
    };
    const navigateToMap = () => {
      common_vendor.index.showToast({
        title: `即将打开地图导航到 ${props.store.name}`,
        icon: "none"
      });
      common_vendor.index.__f__("log", "at components/StoreCard.vue:51", `即将打开地图导航到 ${props.store.name}`);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: __props.store.icon,
          size: "20",
          color: "#FF6B00"
        }),
        b: common_vendor.t(__props.store.storeName),
        c: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#FF6B00"
        }),
        d: common_vendor.t(__props.store.distance),
        e: common_vendor.t(__props.store.storeDescription),
        f: common_vendor.f(__props.store.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        }),
        g: common_vendor.p({
          type: "map-filled",
          size: "16",
          color: "#fff"
        }),
        h: common_vendor.o(navigateToMap),
        i: common_vendor.o(navigateToStoreDetail)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8cae2ec5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/StoreCard.js.map
