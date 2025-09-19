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
  __name: "index",
  setup(__props) {
    const loginCode = common_vendor.ref("");
    const phoneCode = common_vendor.ref("");
    common_vendor.ref({});
    const nickname = common_vendor.ref("");
    const inviteCode = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    const isLoginDisabled = common_vendor.computed(() => {
      return !phoneCode.value || !nickname.value.trim() || !agreed.value;
    });
    common_vendor.onLoad(() => {
      getLoginCode();
      const pendingInviteCode = common_vendor.index.getStorageSync("pendingInviteCode");
      if (pendingInviteCode) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:105", "✅ [登录页] 读取到暂存的邀请码:", pendingInviteCode);
        inviteCode.value = pendingInviteCode;
        common_vendor.index.removeStorageSync("pendingInviteCode");
      }
    });
    const getLoginCode = async () => {
      try {
        const res = await common_vendor.index.login({
          provider: "weixin"
        });
        loginCode.value = res.code;
        common_vendor.index.__f__("log", "at pages/index/index.vue:123", "✅ 获取 loginCode 成功:", loginCode.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:125", "❌ 获取 loginCode 失败", error);
        common_vendor.index.showToast({
          title: "登录准备失败，请重试",
          icon: "none"
        });
      }
    };
    const getPhoneNumber = (e) => {
      if (e.detail.code) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:138", "✅ 获取手机号凭证 (phoneCode) 成功:", e.detail.code);
        phoneCode.value = e.detail.code;
        common_vendor.index.showToast({
          title: "手机号授权成功",
          icon: "none"
        });
      } else {
        common_vendor.index.__f__("error", "at pages/index/index.vue:145", "❌ 用户拒绝了手机号授权:", e.detail.errMsg);
        common_vendor.index.showToast({
          title: "您拒绝了授权",
          icon: "error"
        });
      }
    };
    const toggleAgreement = () => {
      agreed.value = !agreed.value;
    };
    const handleLogin = async () => {
      if (isLoginDisabled.value) {
        if (!nickname.value.trim()) {
          common_vendor.index.showToast({
            title: "请输入您的昵称",
            icon: "none"
          });
          return;
        }
        if (!agreed.value) {
          common_vendor.index.showToast({
            title: "请先阅读并同意用户协议",
            icon: "none"
          });
        } else if (!phoneCode.value) {
          common_vendor.index.showToast({
            title: "请先授权获取手机号",
            icon: "none"
          });
        }
        return;
      }
      common_vendor.index.showLoading({
        title: "正在登录..."
      });
      try {
        const payload = {
          loginCode: loginCode.value,
          phoneCode: phoneCode.value,
          state: "default",
          shardCode: inviteCode.value,
          nickname: nickname.value
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:208", "🚀 准备提交的一键登录数据:", payload);
        const result = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: payload
        });
        if (!result.error && result.data && result.data.accessToken) {
          common_vendor.index.setStorageSync("token", result.data.accessToken);
          common_vendor.index.setStorageSync("userId", result.data.userId);
          common_vendor.index.showLoading({
            title: "正在获取用户信息..."
          });
          const {
            data: fullUserInfo,
            error: infoError
          } = await utils_request.request("/app-api/member/user/get", {
            method: "GET"
          });
          if (infoError) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: `获取用户信息失败: ${infoError}`,
              icon: "none"
            });
            return;
          }
          common_vendor.index.__f__("log", "at pages/index/index.vue:247", "✅ [登录后] 成功获取到的完整用户信息:", JSON.parse(JSON.stringify(fullUserInfo)));
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(fullUserInfo));
          await (async () => {
            const pendingReward = common_vendor.index.getStorageSync("pendingShareReward");
            const currentUserId = result.data.userId;
            if (pendingReward && pendingReward.sharerId && pendingReward.bizId && pendingReward.type && pendingReward.sharerId !== currentUserId) {
              common_vendor.index.__f__("log", "at pages/index/index.vue:265", `✅ [登录后] 检测到待处理的分享奖励，类型: ${pendingReward.type}`, pendingReward);
              const {
                error
              } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
                method: "POST",
                data: {
                  type: pendingReward.type,
                  // 【升级】动态读取 type
                  shareUserId: pendingReward.sharerId,
                  bizId: pendingReward.bizId
                }
              });
              if (error) {
                common_vendor.index.__f__("error", "at pages/index/index.vue:280", "❌ [登录后] 调用分享加分接口失败:", error);
              } else {
                common_vendor.index.__f__("log", "at pages/index/index.vue:282", `✅ [登录后] 成功为分享者 (ID: ${pendingReward.sharerId}) 触发贡分增加`);
              }
              common_vendor.index.removeStorageSync("pendingShareReward");
              common_vendor.index.__f__("log", "at pages/index/index.vue:286", "🗑️ [登录后] 已清除 pendingShareReward 缓存。");
            }
          })();
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          common_vendor.index.switchTab({
            url: "/pages/home/home"
          });
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: result.error || "登录失败，请重试",
            icon: "none"
          });
          getLoginCode();
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/index/index.vue:312", "登录请求异常:", error);
        common_vendor.index.showToast({
          title: "请求异常，请检查网络",
          icon: "none"
        });
      }
    };
    const skipToAgreement = (type) => {
      common_vendor.index.navigateTo({
        url: `/pages/user-agreement/user-agreement?tab=${type}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "phone-filled",
          size: "22",
          color: "#FF7600"
        }),
        b: !phoneCode.value
      }, !phoneCode.value ? {
        c: common_vendor.o(getPhoneNumber)
      } : {}, {
        d: common_vendor.p({
          type: "person-filled",
          size: "22",
          color: "#FF7600"
        }),
        e: nickname.value,
        f: common_vendor.o(($event) => nickname.value = $event.detail.value),
        g: common_vendor.p({
          type: "paperplane-filled",
          size: "22",
          color: "#FF7600"
        }),
        h: inviteCode.value,
        i: common_vendor.o(($event) => inviteCode.value = $event.detail.value),
        j: agreed.value,
        k: common_vendor.o(toggleAgreement),
        l: common_vendor.o(($event) => skipToAgreement(0)),
        m: common_vendor.o(($event) => skipToAgreement(1)),
        n: isLoginDisabled.value,
        o: common_vendor.o(handleLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
