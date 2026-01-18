"use strict";
const common_vendor = require("../common/vendor.js");
const utils_user = require("../utils/user.js");
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
    const coverImage = common_vendor.computed(() => {
      if (props.store.storeCoverImageUrls && props.store.storeCoverImageUrls.length > 0) {
        return props.store.storeCoverImageUrls[0];
      }
      if (props.store.storeCoverImageUrl) {
        return props.store.storeCoverImageUrl;
      }
      return "/static/images/default-store.png";
    });
    const displayDistance = common_vendor.computed(() => {
      if (props.store.distanceKm)
        return props.store.distanceKm;
      if (typeof props.store.distance === "number") {
        return props.store.distance.toFixed(1) + "km";
      }
      return "";
    });
    const handleCardClick = () => {
      emit("click-card", props.store);
    };
    const handleInitiateParty = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!props.store || !props.store.id)
        return;
      const url = `/packages/active-publish/active-publish?storeId=${props.store.id}&storeName=${encodeURIComponent(props.store.storeName)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: coverImage.value,
        b: common_vendor.t(__props.store.storeName),
        c: displayDistance.value
      }, displayDistance.value ? {
        d: common_vendor.t(displayDistance.value)
      } : {}, {
        e: common_vendor.t(__props.store.storeDescription || "暂无介绍"),
        f: __props.store.averageConsumptionRange
      }, __props.store.averageConsumptionRange ? {
        g: common_vendor.t(__props.store.averageConsumptionRange)
      } : {}, {
        h: common_vendor.o(handleInitiateParty),
        i: common_vendor.o(handleCardClick)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8cae2ec5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/StoreCard.js.map
