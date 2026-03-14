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
  setup(__props) {
    const isExpand = common_vendor.ref(false);
    const handleAction = (index) => {
      const paths = [
        "/packages/my-friendInvitation/my-friendInvitation?currentTab=1",
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
      isExpand.value = false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.show
      }, __props.show ? common_vendor.e({
        b: common_vendor.p({
          type: "personadd-filled",
          size: "20",
          color: "#fff"
        }),
        c: common_vendor.o(($event) => handleAction(0)),
        d: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#fff"
        }),
        e: common_vendor.o(($event) => handleAction(1)),
        f: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#fff"
        }),
        g: common_vendor.o(($event) => handleAction(2)),
        h: isExpand.value ? 1 : "",
        i: !isExpand.value
      }, !isExpand.value ? {} : {
        j: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#fff"
        })
      }, {
        k: isExpand.value ? 1 : "",
        l: common_vendor.o(($event) => isExpand.value = !isExpand.value)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6d679bc3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/DemandActionFab.js.map
