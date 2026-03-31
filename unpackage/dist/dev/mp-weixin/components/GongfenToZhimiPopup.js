"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "GongfenToZhimiPopup",
  setup(__props, { expose: __expose }) {
    const popup = common_vendor.ref(null);
    const data = common_vendor.ref(null);
    const isSubmitting = common_vendor.ref(false);
    const open = async (isAuto = false) => {
      try {
        if (isAuto) {
          const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          if (common_vendor.index.getStorageSync("last_seen_zhimi_alloc") === today)
            return;
        }
        const {
          data: resData,
          error
        } = await utils_request.request("/app-api/member/contribution-convert/pending-confirm", {
          method: "GET"
        });
        if (error || !resData || resData.allocatedPoint <= 0) {
          return;
        }
        data.value = resData;
        popup.value.open();
        if (isAuto) {
          const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          common_vendor.index.setStorageSync("last_seen_zhimi_alloc", today);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/GongfenToZhimiPopup.vue:90", "Pending Confirm Error:", e);
      }
    };
    const handleConfirm = async () => {
      if (isSubmitting.value)
        return;
      isSubmitting.value = true;
      try {
        const {
          data: success,
          error
        } = await utils_request.request("/app-api/member/contribution-convert/confirm", {
          method: "POST"
        });
        if (!error && success) {
          common_vendor.index.showToast({
            title: "确认分配成功",
            icon: "success"
          });
          setTimeout(() => {
            popup.value.close();
          }, 1e3);
        } else {
          common_vendor.index.showToast({
            title: error || "确认失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    const navTo = (type) => {
      const url = type === "gongfen" ? "/packages/my-points/my-points" : "/packages/my-zhimi/my-zhimi";
      common_vendor.index.navigateTo({
        url
      });
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: data.value
      }, data.value ? {
        b: common_assets._imports_0$12,
        c: common_vendor.t(data.value.allocatedPoint),
        d: common_vendor.t(data.value.availableExperience),
        e: common_vendor.o(($event) => navTo("gongfen")),
        f: common_vendor.t(data.value.availablePoint),
        g: common_vendor.o(($event) => navTo("zhimi")),
        h: common_vendor.t(data.value.totalExperience),
        i: common_vendor.o(($event) => navTo("gongfen")),
        j: common_vendor.t(data.value.totalPoint),
        k: common_vendor.o(($event) => navTo("zhimi"))
      } : {}, {
        l: isSubmitting.value,
        m: common_vendor.o(handleConfirm),
        n: common_vendor.sr(popup, "d014df9e-0", {
          "k": "popup"
        }),
        o: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d014df9e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/GongfenToZhimiPopup.js.map
