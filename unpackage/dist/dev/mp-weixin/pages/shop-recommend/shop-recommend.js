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
      common_vendor.index.__f__("log", "at pages/shop-recommend/shop-recommend.vue:88", "提交数据:", form.value);
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
    const selectedLocationInfo = common_vendor.ref(null);
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/shop-recommend/shop-recommend.vue:109", "选择位置成功:", res);
          selectedLocationInfo.value = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/shop-recommend/shop-recommend.vue:118", "选择位置失败:", err);
          if (err.errMsg.includes("cancel"))
            ;
          else {
            common_vendor.index.showToast({
              title: "选择位置失败",
              icon: "none"
            });
          }
        }
      });
    };
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => form.value.name = $event),
        b: common_vendor.p({
          type: "text",
          placeholder: "请输入聚店名称",
          inputBorder: false,
          required: true,
          modelValue: form.value.name
        }),
        c: selectedLocationInfo.value
      }, selectedLocationInfo.value ? {
        d: common_vendor.t(selectedLocationInfo.value.address || selectedLocationInfo.value.name)
      } : {}, {
        e: common_vendor.o(openMapToChooseLocation),
        f: common_vendor.o(($event) => form.value.reason = $event),
        g: common_vendor.p({
          type: "textarea",
          placeholder: "请输入推荐理由，如特色服务、环境氛围等",
          inputBorder: false,
          required: true,
          modelValue: form.value.reason
        }),
        h: common_vendor.p({
          type: "paperplane",
          size: "16",
          color: "#fff"
        }),
        i: common_vendor.o(handleSubmit)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop-recommend/shop-recommend.js.map
