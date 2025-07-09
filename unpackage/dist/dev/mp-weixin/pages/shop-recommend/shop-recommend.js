"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
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
      reason: ""
    });
    const selectedLocationInfo = common_vendor.ref(null);
    const handleSubmit = async () => {
      if (!form.value.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入聚店名称",
          icon: "none"
        });
        return;
      }
      if (!selectedLocationInfo.value) {
        common_vendor.index.showToast({
          title: "请选择聚店地址",
          icon: "none"
        });
        return;
      }
      if (!form.value.reason.trim()) {
        common_vendor.index.showToast({
          title: "请输入推荐理由",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在提交..."
      });
      const result = await storeRecommend();
      common_vendor.index.hideLoading();
      if (result.error) {
        common_vendor.index.showToast({
          title: result.error,
          icon: "none",
          duration: 2e3
        });
      } else {
        common_vendor.index.showToast({
          title: "推荐成功，感谢您的分享！",
          icon: "success"
        });
        form.value.name = "";
        form.value.reason = "";
        selectedLocationInfo.value = null;
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    };
    const storeRecommend = async () => {
      const result = await utils_request.request("/app-api/member/store-recommend/create", {
        method: "POST",
        // 请求方式
        data: {
          // 将页面数据映射到接口参数
          storeName: form.value.name,
          fullAddress: selectedLocationInfo.value.address,
          recommendText: form.value.reason,
          longitude: selectedLocationInfo.value.longitude,
          latitude: selectedLocationInfo.value.latitude
        }
      });
      return result;
    };
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/shop-recommend/shop-recommend.vue:166", "选择位置成功:", res);
          selectedLocationInfo.value = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/shop-recommend/shop-recommend.vue:177", "选择位置失败:", err);
          if (!err.errMsg.includes("cancel")) {
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
