"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  __name: "index",
  setup(__props) {
    const loginCode = common_vendor.ref("");
    const phoneCode = common_vendor.ref("");
    const userInfo = common_vendor.ref({});
    const inviteCode = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    const isLoginDisabled = common_vendor.computed(() => {
      return !phoneCode.value || !agreed.value;
    });
    common_vendor.onLoad(() => {
      getLoginCode();
    });
    const getLoginCode = async () => {
      try {
        const res = await common_vendor.index.login({ provider: "weixin" });
        loginCode.value = res.code;
        common_vendor.index.__f__("log", "at pages/index/index.vue:111", "✅ 获取 loginCode 成功:", loginCode.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:113", "❌ 获取 loginCode 失败", error);
        common_vendor.index.showToast({ title: "登录准备失败，请重试", icon: "none" });
      }
    };
    const getPhoneNumber = (e) => {
      if (e.detail.code) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:123", "✅ 获取手机号凭证 (phoneCode) 成功:", e.detail.code);
        phoneCode.value = e.detail.code;
        common_vendor.index.showToast({ title: "手机号授权成功", icon: "none" });
      } else {
        common_vendor.index.__f__("error", "at pages/index/index.vue:127", "❌ 用户拒绝了手机号授权:", e.detail.errMsg);
        common_vendor.index.showToast({ title: "您拒绝了授权", icon: "error" });
      }
    };
    const getUserProfile = () => {
      common_vendor.index.getUserProfile({
        desc: "用于完善会员资料",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:139", "✅ 获取用户信息成功:", res.userInfo);
          userInfo.value = res.userInfo;
          common_vendor.index.showToast({ title: "昵称授权成功", icon: "none" });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:144", "❌ 用户拒绝了信息授权:", err);
        }
      });
    };
    const agreeChange = (e) => {
      agreed.value = e.detail.value.length > 0;
    };
    const handleLogin = async () => {
      if (isLoginDisabled.value) {
        if (!agreed.value) {
          common_vendor.index.showToast({ title: "请先阅读并同意用户协议", icon: "none" });
        } else if (!phoneCode.value) {
          common_vendor.index.showToast({ title: "请先授权获取手机号", icon: "none" });
        }
        return;
      }
      common_vendor.index.showLoading({ title: "正在登录..." });
      try {
        const payload = {
          loginCode: loginCode.value,
          phoneCode: phoneCode.value,
          state: "default",
          // 按要求传入 'default'
          shardCode: inviteCode.value
          // 传入用户填写的邀请码
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:181", "🚀 准备提交的一键登录数据:", payload);
        const result = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: payload
        });
        common_vendor.index.hideLoading();
        if (!result.error && result.data && result.data.accessToken) {
          common_vendor.index.setStorageSync("token", result.data.accessToken);
          common_vendor.index.setStorageSync("userId", result.data.userId);
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          common_vendor.index.switchTab({
            url: "/pages/home/home"
            // 默认跳转到个人中心
          });
        } else {
          common_vendor.index.showToast({ title: result.error || "登录失败，请重试", icon: "none" });
          getLoginCode();
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/index/index.vue:211", "登录请求异常:", error);
        common_vendor.index.showToast({ title: "请求异常，请检查网络", icon: "none" });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.p({
          type: "phone-filled",
          size: "22",
          color: "#FF7600"
        }),
        c: !phoneCode.value
      }, !phoneCode.value ? {
        d: common_vendor.o(getPhoneNumber)
      } : {}, {
        e: common_vendor.p({
          type: "person-filled",
          size: "22",
          color: "#FF7600"
        }),
        f: !userInfo.value.nickName
      }, !userInfo.value.nickName ? {
        g: common_vendor.o(getUserProfile)
      } : {
        h: userInfo.value.avatarUrl,
        i: common_vendor.t(userInfo.value.nickName)
      }, {
        j: common_vendor.p({
          type: "paperplane-filled",
          size: "22",
          color: "#FF7600"
        }),
        k: inviteCode.value,
        l: common_vendor.o(($event) => inviteCode.value = $event.detail.value),
        m: agreed.value,
        n: common_vendor.o(agreeChange),
        o: isLoginDisabled.value,
        p: common_vendor.o(handleLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
