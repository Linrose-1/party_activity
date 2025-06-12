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
  __name: "ActivityCard",
  props: {
    activity: {
      type: Object,
      required: true
    }
  },
  emits: ["favorite"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const isFavorite = common_vendor.ref(false);
    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value;
      emit("favorite", isFavorite.value);
    };
    const registerActivity = () => {
      common_vendor.index.navigateTo({
        url: "/pages/active-enroll/active-enroll"
      });
    };
    const detailActivity = () => {
      common_vendor.index.navigateTo({
        url: "/pages/active-detail/active-detail"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: __props.activity.image,
        b: common_vendor.t(__props.activity.title),
        c: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#FF6B00"
        }),
        d: common_vendor.t(__props.activity.date),
        e: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#FF6B00"
        }),
        f: common_vendor.t(__props.activity.location),
        g: common_vendor.t(__props.activity.participants.current),
        h: common_vendor.t(__props.activity.participants.total),
        i: common_vendor.f(__props.activity.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        j: common_vendor.o(($event) => detailActivity()),
        k: common_vendor.p({
          type: "person",
          size: "16",
          color: "#FF6B00"
        }),
        l: common_vendor.t(__props.activity.organizer),
        m: common_vendor.p({
          type: isFavorite.value ? "heart-filled" : "heart",
          size: "16",
          color: "#FF6B00"
        }),
        n: common_vendor.t(isFavorite.value ? "已收藏" : "收藏"),
        o: common_vendor.o(toggleFavorite),
        p: common_vendor.o(registerActivity)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f73ae0ce"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ActivityCard.js.map
