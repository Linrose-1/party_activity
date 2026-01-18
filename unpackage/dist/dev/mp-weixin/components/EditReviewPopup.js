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
  __name: "EditReviewPopup",
  props: {
    reviewData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["close", "save"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const popupRef = common_vendor.ref(null);
    const content = common_vendor.ref("");
    const currentIsLike = common_vendor.ref(1);
    const loading = common_vendor.ref(false);
    const open = () => {
      content.value = props.reviewData.reviewContent || "";
      currentIsLike.value = props.reviewData.isLike || 1;
      popupRef.value.open();
    };
    const close = () => {
      popupRef.value.close();
      emit("close");
    };
    const selectLike = (val) => {
      currentIsLike.value = val;
    };
    const handleSave = () => {
      loading.value = true;
      emit("save", {
        id: props.reviewData.id,
        reviewContent: content.value,
        isLike: currentIsLike.value,
        // 提交新的赞踩状态
        // 保持其他字段
        userId: props.reviewData.userId,
        reviewedId: props.reviewData.reviewedId,
        isAnonymous: props.reviewData.isAnonymous
      }, () => {
        loading.value = false;
        close();
      });
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.reviewData.targetName || "商友"),
        b: common_vendor.p({
          type: "hand-up-filled",
          size: "20",
          color: currentIsLike.value === 1 ? "#fff" : "#FF8500"
        }),
        c: currentIsLike.value === 1 ? 1 : "",
        d: common_vendor.o(($event) => selectLike(1)),
        e: common_vendor.p({
          type: "hand-down-filled",
          size: "20",
          color: currentIsLike.value === 2 ? "#fff" : "#666"
        }),
        f: currentIsLike.value === 2 ? 1 : "",
        g: common_vendor.o(($event) => selectLike(2)),
        h: content.value,
        i: common_vendor.o(($event) => content.value = $event.detail.value),
        j: common_vendor.t(content.value.length),
        k: common_vendor.o(close),
        l: common_vendor.t(loading.value ? "保存中..." : "保存修改"),
        m: common_vendor.o(handleSave),
        n: loading.value,
        o: common_vendor.sr(popupRef, "a5c11758-0", {
          "k": "popupRef"
        }),
        p: common_vendor.p({
          type: "center",
          ["is-mask-click"]: false,
          ["background-color"]: "#fff"
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a5c11758"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/EditReviewPopup.js.map
