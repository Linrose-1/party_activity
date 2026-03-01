"use strict";
const common_vendor = require("../common/vendor.js");
const utils_user = require("../utils/user.js");
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
  emits: ["click-card", "update-like"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const handleAction = async (clickedAction) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const apiAction = props.store.userLikeStr === clickedAction ? "cancel" : clickedAction;
      emit("update-like", {
        id: props.store.id,
        action: apiAction,
        clickedAction
      });
    };
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
        b: common_vendor.p({
          type: __props.store.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "14",
          color: __props.store.userLikeStr === "like" ? "#ff6b00" : "#999"
        }),
        c: common_vendor.t(__props.store.likesCount || 0),
        d: __props.store.userLikeStr === "like" ? 1 : "",
        e: common_vendor.o(($event) => handleAction("like")),
        f: common_vendor.p({
          type: __props.store.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "14",
          color: __props.store.userLikeStr === "dislike" ? "#3498db" : "#999"
        }),
        g: common_vendor.t(__props.store.dislikesCount || 0),
        h: __props.store.userLikeStr === "dislike" ? 1 : "",
        i: common_vendor.o(($event) => handleAction("dislike")),
        j: common_vendor.p({
          type: "chatbubble",
          size: "14",
          color: "#999"
        }),
        k: common_vendor.t(__props.store.commonCount || 0),
        l: common_vendor.t(__props.store.storeName),
        m: displayDistance.value
      }, displayDistance.value ? {
        n: common_vendor.t(displayDistance.value)
      } : {}, {
        o: common_vendor.t(__props.store.storeDescription || "暂无介绍"),
        p: __props.store.averageConsumptionRange
      }, __props.store.averageConsumptionRange ? {
        q: common_vendor.t(__props.store.averageConsumptionRange)
      } : {}, {
        r: common_vendor.o(handleCardClick),
        s: common_vendor.o(handleInitiateParty),
        t: common_vendor.o(handleCardClick)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8cae2ec5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/StoreCard.js.map
