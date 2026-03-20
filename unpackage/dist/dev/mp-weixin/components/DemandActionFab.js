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
  __name: "DemandActionFab",
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  emits: ["shareClick"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const isExpand = common_vendor.ref(false);
    const handleAction = (type, index) => {
      isExpand.value = false;
      if (type === "SHARE") {
        emit("shareClick");
      } else {
        const paths = [
          "/packages/my-shareList/my-shareList",
          "/packages/my-edit/my-edit",
          "/pages/home/home"
        ];
        const target = paths[index];
        if (target.includes("home")) {
          common_vendor.index.switchTab({
            url: target
          });
        } else {
          common_vendor.index.navigateTo({
            url: target
          });
        }
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.show
      }, __props.show ? common_vendor.e({
        b: common_vendor.p({
          type: "redo-filled",
          size: "20",
          color: "#fff"
        }),
        c: common_vendor.o(($event) => handleAction("SHARE")),
        d: common_vendor.p({
          type: "personadd-filled",
          size: "20",
          color: "#fff"
        }),
        e: common_vendor.o(($event) => handleAction(0)),
        f: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#fff"
        }),
        g: common_vendor.o(($event) => handleAction(1)),
        h: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#fff"
        }),
        i: common_vendor.o(($event) => handleAction(2)),
        j: isExpand.value ? 1 : "",
        k: !isExpand.value
      }, !isExpand.value ? {} : {
        l: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#fff"
        })
      }, {
        m: isExpand.value ? 1 : "",
        n: common_vendor.o(($event) => isExpand.value = !isExpand.value)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6d679bc3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/DemandActionFab.js.map
