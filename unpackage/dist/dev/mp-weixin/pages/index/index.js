"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
    const phoneCode = common_vendor.ref("");
    const userInfo = common_vendor.ref({});
    const realName = common_vendor.ref("");
    const inviteCode = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    const isLoginDisabled = common_vendor.computed(() => {
      return !phoneCode.value || !userInfo.value.nickName || !realName.value || !agreed.value;
    });
    const getPhoneNumber = (e) => {
      if (e.detail.code) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:92", "✅ 获取手机号凭证 (code) 成功:", e.detail.code);
        phoneCode.value = e.detail.code;
        common_vendor.index.showToast({ title: "手机号授权成功", icon: "none" });
      } else {
        common_vendor.index.__f__("error", "at pages/index/index.vue:96", "❌ 用户拒绝了手机号授权:", e.detail.errMsg);
        common_vendor.index.showToast({ title: "您拒绝了授权", icon: "error" });
      }
    };
    const getUserProfile = () => {
      common_vendor.index.getUserProfile({
        desc: "用于完善会员资料",
        // 声明获取用户个人信息后的用途，必填
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:108", "✅ 获取用户信息成功:", res.userInfo);
          userInfo.value = res.userInfo;
          common_vendor.index.showToast({ title: "昵称授权成功", icon: "none" });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:113", "❌ 用户拒绝了信息授权:", err);
          common_vendor.index.showToast({ title: "您拒绝了授权", icon: "error" });
        }
      });
    };
    const agreeChange = (e) => {
      agreed.value = e.detail.value.length > 0;
    };
    const handleLogin = () => {
      if (isLoginDisabled.value) {
        common_vendor.index.showToast({ title: "请先完善信息并同意协议", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中..." });
      const loginData = {
        phone_code: phoneCode.value,
        nickname: userInfo.value.nickName,
        avatar: userInfo.value.avatarUrl,
        real_name: realName.value,
        invite_code: inviteCode.value
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:146", "🚀 准备提交的登录数据:", loginData);
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        common_vendor.index.switchTab({
          url: "/pages/profile/profile"
          // 请确保这个路径是您“我的”页面的正确路径
        });
      }, 1500);
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
          type: "staff-filled",
          size: "22",
          color: "#FF7600"
        }),
        k: realName.value,
        l: common_vendor.o(($event) => realName.value = $event.detail.value),
        m: common_vendor.p({
          type: "paperplane-filled",
          size: "22",
          color: "#FF7600"
        }),
        n: inviteCode.value,
        o: common_vendor.o(($event) => inviteCode.value = $event.detail.value),
        p: agreed.value,
        q: common_vendor.o(agreeChange),
        r: isLoginDisabled.value,
        s: common_vendor.o(handleLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
