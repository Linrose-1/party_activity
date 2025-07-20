"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "user-agreement",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const userAgreement = common_vendor.ref("");
    const privacyPolicy = common_vendor.ref("");
    const switchTab = (index) => {
      currentTab.value = index;
    };
    common_vendor.onLoad((options) => {
      if (options && options.tab) {
        const initialTab = parseInt(options.tab, 10);
        if (!isNaN(initialTab) && (initialTab === 0 || initialTab === 1)) {
          currentTab.value = initialTab;
        }
      }
      getUserAgreement();
      getPrivacyPolicy();
    });
    const getUserAgreement = async () => {
      const result = await utils_request.request("/app-api/member/config/userAgreement", {
        method: "GET"
      });
      if (result && result.data) {
        userAgreement.value = result.data;
      } else {
        common_vendor.index.__f__("log", "at pages/user-agreement/user-agreement.vue:73", "获取用户协议失败:", (result == null ? void 0 : result.error) || "返回数据格式不正确");
      }
    };
    const getPrivacyPolicy = async () => {
      const result = await utils_request.request("/app-api/member/config/privacyPolicy", {
        method: "GET"
      });
      if (result && result.data) {
        privacyPolicy.value = result.data;
      } else {
        common_vendor.index.__f__("log", "at pages/user-agreement/user-agreement.vue:84", "获取隐私政策失败:", (result == null ? void 0 : result.error) || "返回数据格式不正确");
      }
    };
    return (_ctx, _cache) => {
      return {
        a: currentTab.value === 0 ? 1 : "",
        b: common_vendor.o(($event) => switchTab(0)),
        c: currentTab.value === 1 ? 1 : "",
        d: common_vendor.o(($event) => switchTab(1)),
        e: userAgreement.value,
        f: currentTab.value === 0,
        g: privacyPolicy.value,
        h: currentTab.value === 1
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e6ae5d36"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-agreement/user-agreement.js.map
