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
    const props = __props;
    const emit = __emit;
    const isFavorite = common_vendor.ref(false);
    const formattedDate = common_vendor.computed(() => {
      if (!props.activity.startDatetime) {
        return "时间待定";
      }
      const date = new Date(props.activity.startDatetime);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    });
    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value;
      emit("favorite", isFavorite.value);
    };
    const registerActivity = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/active-enroll/active-enroll?id=${activityId}`
      });
    };
    const detailActivity = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/active-detail/active-detail?id=${activityId}`
      });
    };
    return (_ctx, _cache) => {
      return {
        a: __props.activity.coverImageUrl,
        b: common_vendor.t(__props.activity.activityTitle),
        c: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#FF6B00"
        }),
        d: common_vendor.t(formattedDate.value),
        e: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#FF6B00"
        }),
        f: common_vendor.t(__props.activity.location || "线上活动"),
        g: common_vendor.t(__props.activity.participantCount || 0),
        h: common_vendor.t(__props.activity.maxParticipants || "不限"),
        i: common_vendor.o(($event) => detailActivity(__props.activity.id)),
        j: common_vendor.p({
          type: "person",
          size: "16",
          color: "#FF6B00"
        }),
        k: common_vendor.t(__props.activity.organizerName || "主办方"),
        l: common_vendor.p({
          type: isFavorite.value ? "heart-filled" : "heart",
          size: "16",
          color: "#FF6B00"
        }),
        m: common_vendor.t(isFavorite.value ? "已收藏" : "收藏"),
        n: common_vendor.o(toggleFavorite),
        o: common_vendor.o(($event) => registerActivity(__props.activity.id))
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f73ae0ce"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ActivityCard.js.map
