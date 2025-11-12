"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
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
    const nickName = common_vendor.ref(null);
    const avatarUrl = common_vendor.ref(null);
    const inviteCode = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    const upstreamInviteCode = common_vendor.ref("");
    const isLoginDisabled = common_vendor.computed(() => {
      return !phoneCode.value || !agreed.value;
    });
    common_vendor.onLoad((options) => {
      getLoginCode();
      const codeFromUrl = options == null ? void 0 : options.inviteCode;
      const codeFromStorage = common_vendor.index.getStorageSync("pendingInviteCode");
      let finalInviteCode = "";
      if (codeFromUrl) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:122", "✅ [登录页] 从 URL 参数中捕获到邀请码:", codeFromUrl);
        finalInviteCode = codeFromUrl;
        if (codeFromStorage) {
          common_vendor.index.removeStorageSync("pendingInviteCode");
        }
      } else if (codeFromStorage) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:129", "✅ [登录页] 从本地缓存读取到暂存的邀请码:", codeFromStorage);
        finalInviteCode = codeFromStorage;
        common_vendor.index.removeStorageSync("pendingInviteCode");
      }
      if (finalInviteCode) {
        inviteCode.value = finalInviteCode;
        upstreamInviteCode.value = finalInviteCode;
      }
    });
    const onChooseAvatar = (e) => {
      const tempAvatarPath = e.detail.avatarUrl;
      if (tempAvatarPath) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:151", "✅ 用户选择了头像，临时路径:", tempAvatarPath);
        uploadAvatar(tempAvatarPath);
      } else {
        common_vendor.index.__f__("error", "at pages/index/index.vue:155", "❌ 获取头像临时路径失败");
      }
    };
    const uploadAvatar = async (filePath) => {
      common_vendor.index.showLoading({
        title: "头像上传中...",
        mask: true
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
        directory: "avatar"
      });
      common_vendor.index.hideLoading();
      if (result.data) {
        avatarUrl.value = result.data;
        common_vendor.index.showToast({
          title: "头像设置成功",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: result.error || "上传失败",
          icon: "none"
        });
      }
    };
    const getLoginCode = async () => {
      try {
        const res = await common_vendor.index.login({
          provider: "weixin"
        });
        loginCode.value = res.code;
        common_vendor.index.__f__("log", "at pages/index/index.vue:198", "✅ 获取 loginCode 成功:", loginCode.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:200", "❌ 获取 loginCode 失败", error);
        common_vendor.index.showToast({
          title: "登录准备失败，请重试",
          icon: "none"
        });
      }
    };
    const getPhoneNumber = (e) => {
      if (e.detail.code) {
        phoneCode.value = e.detail.code;
        common_vendor.index.showToast({
          title: "手机号授权成功",
          icon: "none"
        });
      } else {
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
      var _a;
      if (isLoginDisabled.value) {
        if (!phoneCode.value) {
          common_vendor.index.showToast({
            title: "请授权手机号",
            icon: "none"
          });
        } else if (!agreed.value) {
          common_vendor.index.showToast({
            title: "请同意用户协议和隐私政策",
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
          nickName: nickName.value,
          avatar: avatarUrl.value,
          // 将获取到的头像URL加入
          shardCode: inviteCode.value,
          state: "default"
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:294", "🚀 准备提交的登录数据:", payload);
        const loginResult = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: payload
        });
        if (loginResult.error || !((_a = loginResult.data) == null ? void 0 : _a.accessToken)) {
          if (loginResult.error && loginResult.error.code === 453) {
            common_vendor.index.showToast({
              title: loginResult.error.msg,
              icon: "none",
              duration: 3e3
            });
          } else {
            throw new Error(loginResult.error || "登录失败，请重试");
          }
          getLoginCode();
          return;
        }
        const {
          accessToken,
          userId
        } = loginResult.data;
        common_vendor.index.setStorageSync("token", accessToken);
        common_vendor.index.setStorageSync("userId", userId);
        await fetchAndCacheUserInfo();
        await handlePendingShareReward(userId);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        common_vendor.index.switchTab({
          url: "/pages/home/home"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/index/index.vue:345", "登录流程异常:", error);
        common_vendor.index.showToast({
          title: error.message,
          icon: "none"
        });
        getLoginCode();
      }
    };
    const fetchAndCacheUserInfo = async () => {
      common_vendor.index.showLoading({
        title: "正在同步信息..."
      });
      const {
        data: fullUserInfo,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:369", "❌ [登录后] 获取用户信息失败:", error);
        common_vendor.index.showToast({
          title: "用户信息同步失败",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/index/index.vue:376", "✅ [登录后] 成功获取并缓存用户信息:", JSON.parse(JSON.stringify(fullUserInfo)));
      common_vendor.index.setStorageSync("userInfo", JSON.stringify(fullUserInfo));
    };
    const handlePendingShareReward = async (currentUserId) => {
      const pendingReward = common_vendor.index.getStorageSync("pendingShareReward");
      if (pendingReward && pendingReward.sharerId && pendingReward.bizId && pendingReward.type && pendingReward.sharerId !== currentUserId) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:388", `✅ [登录后] 检测到待处理分享奖励`, pendingReward);
        const {
          error
        } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
          method: "POST",
          data: {
            type: pendingReward.type,
            shareUserId: pendingReward.sharerId,
            bizId: pendingReward.bizId
          }
        });
        if (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:400", "❌ [登录后] 调用分享加分接口失败:", error);
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:402", `✅ [登录后] 成功为分享者(ID: ${pendingReward.sharerId})触发奖励`);
        }
        common_vendor.index.removeStorageSync("pendingShareReward");
      }
    };
    const skipToAgreement = (type) => {
      common_vendor.index.navigateTo({
        url: `/pages/user-agreement/user-agreement?tab=${type}`
      });
    };
    common_vendor.onShareAppMessage(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:428", "[分享] 用户在登录页发起了分享");
      const finalInviteCode = upstreamInviteCode.value || utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/index/index.vue:436", `[分享] 登录页最终使用的邀请码: ${finalInviteCode}`);
      let sharePath = "/pages/index/index";
      if (finalInviteCode) {
        sharePath += `?inviteCode=${finalInviteCode}`;
      }
      const shareContent = {
        title: "猩聚社 - 链接商机，共创未来，快来加入我们！",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:449", "[分享] 登录页分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:460", "[分享] 用户在登录页分享到朋友圈");
      const finalInviteCode = upstreamInviteCode.value || utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/index/index.vue:463", `[分享] 登录页朋友圈分享最终使用的邀请码: ${finalInviteCode}`);
      let queryString = "";
      if (finalInviteCode) {
        queryString = `inviteCode=${finalInviteCode}`;
      }
      const shareContent = {
        title: "猩聚社 - 链接商机，共创未来，快来加入我们！",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:476", "[分享] 登录页分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: avatarUrl.value || "/static/images/default-avatar.png",
        b: common_vendor.o(onChooseAvatar),
        c: common_vendor.p({
          type: "person-filled",
          size: "22",
          color: "#FF7600"
        }),
        d: nickName.value,
        e: common_vendor.o(($event) => nickName.value = $event.detail.value),
        f: common_vendor.p({
          type: "phone-filled",
          size: "22",
          color: "#FF7600"
        }),
        g: !phoneCode.value
      }, !phoneCode.value ? {
        h: common_vendor.o(getPhoneNumber)
      } : {}, {
        i: common_vendor.p({
          type: "paperplane-filled",
          size: "22",
          color: "#FF7600"
        }),
        j: inviteCode.value,
        k: common_vendor.o(($event) => inviteCode.value = $event.detail.value),
        l: agreed.value,
        m: common_vendor.o(toggleAgreement),
        n: common_vendor.o(($event) => skipToAgreement(0)),
        o: common_vendor.o(($event) => skipToAgreement(1)),
        p: isLoginDisabled.value,
        q: common_vendor.o(handleLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
