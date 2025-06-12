"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_uni_label = common_vendor.resolveComponent("uni-label");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_component_uni_label + _easycom_uni_easyinput2 + _easycom_uni_icons2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "shop-recommend",
  setup(__props) {
    const form = common_vendor.ref({
      name: "",
      address: "",
      reason: ""
    });
    const handleSubmit = () => {
      if (!form.value.name.trim() || !form.value.address.trim() || !form.value.reason.trim()) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/shop-recommend/shop-recommend.vue:79", "提交数据:", form.value);
      common_vendor.index.showModal({
        title: "推荐提交成功",
        content: `店铺：${form.value.name}
地址：${form.value.address}
理由：${form.value.reason}`,
        showCancel: false,
        success: () => {
          form.value = {
            name: "",
            address: "",
            reason: ""
          };
        }
      });
    };
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => form.value.name = $event),
        b: common_vendor.p({
          type: "text",
          placeholder: "请输入店铺名称",
          inputBorder: false,
          required: true,
          modelValue: form.value.name
        }),
        c: common_vendor.o(($event) => form.value.address = $event),
        d: common_vendor.p({
          type: "text",
          placeholder: "请输入详细地址",
          inputBorder: false,
          required: true,
          modelValue: form.value.address
        }),
        e: common_vendor.o(($event) => form.value.reason = $event),
        f: common_vendor.p({
          type: "textarea",
          placeholder: "请输入推荐理由，如特色服务、环境氛围等",
          inputBorder: false,
          required: true,
          modelValue: form.value.reason
        }),
        g: common_vendor.p({
          type: "paperplane",
          size: "16",
          color: "#fff"
        }),
        h: common_vendor.o(handleSubmit)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop-recommend/shop-recommend.js.map
