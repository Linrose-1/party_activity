"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const mobile = common_vendor.ref("");
    const password = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const handleLogin = async () => {
      if (!mobile.value) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(mobile.value)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号格式",
          icon: "none"
        });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      isLoading.value = true;
      const requestData = {
        mobile: mobile.value,
        password: password.value
      };
      try {
        const { data, error } = await utils_request.request("/app-api/member/auth/login", {
          method: "POST",
          data: requestData
        });
        if (error) {
          common_vendor.index.showToast({
            title: error,
            icon: "none",
            duration: 2e3
          });
        } else {
          common_vendor.index.showToast({
            title: "登录成功！",
            icon: "success"
          });
          common_vendor.index.setStorageSync("token", data.accessToken);
          common_vendor.index.setStorageSync("userId", data.userId);
          common_vendor.index.setStorageSync("refreshToken", data.refreshToken);
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/home/home"
            });
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "发生未知错误，请稍后重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const goToRegister = () => {
      common_vendor.index.showToast({
        title: "功能开发中...",
        icon: "none"
      });
    };
    const goToForgotPassword = () => {
      common_vendor.index.showToast({
        title: "功能开发中...",
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "person",
          size: "22",
          color: "#999"
        }),
        b: mobile.value,
        c: common_vendor.o(($event) => mobile.value = $event.detail.value),
        d: common_vendor.p({
          type: "locked",
          size: "22",
          color: "#999"
        }),
        e: password.value,
        f: common_vendor.o(($event) => password.value = $event.detail.value),
        g: common_vendor.t(isLoading.value ? "登录中..." : "立即登录"),
        h: common_vendor.o(handleLogin),
        i: isLoading.value,
        j: isLoading.value,
        k: common_vendor.o(goToRegister),
        l: common_vendor.o(goToForgotPassword)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
