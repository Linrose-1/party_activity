"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "my-zhimi",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      fetchUserInfo();
    });
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error) {
        common_vendor.index.showToast({
          title: `加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      userInfo.value = data;
    };
    const handleExchangeSmartRice = () => {
      common_vendor.index.showToast({
        title: "兑换功能正在开发中...",
        icon: "none"
      });
    };
    const handleRechargeSmartRice = () => {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge"
        // 跳转到统一的充值页面
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? {
        b: common_vendor.p({
          type: "wallet",
          size: "24",
          color: "#FF6B00"
        }),
        c: common_vendor.t(userInfo.value.point),
        d: common_vendor.p({
          type: "forward",
          size: "20",
          color: "#fff"
        }),
        e: common_vendor.o(handleExchangeSmartRice),
        f: common_vendor.p({
          type: "wallet",
          size: "20",
          color: "#fff"
        }),
        g: common_vendor.o(handleRechargeSmartRice)
      } : {
        h: common_vendor.p({
          status: "loading",
          contentText: "正在加载您的智米信息..."
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7da666c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-zhimi/my-zhimi.js.map
