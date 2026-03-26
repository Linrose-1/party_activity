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
    const isOldUser = common_vendor.ref(false);
    const loginCode = common_vendor.ref("");
    const phoneCode = common_vendor.ref("");
    const nickName = common_vendor.ref(null);
    const avatarUrl = common_vendor.ref(null);
    const inviteCode = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    const hasParent = common_vendor.ref(false);
    const upstreamInviteCode = common_vendor.ref("");
    const isLoginDisabled = common_vendor.computed(() => {
      if (!agreed.value)
        return true;
      if (isOldUser.value) {
        return !phoneCode.value;
      } else {
        return !avatarUrl.value || !phoneCode.value || !nickName.value || !nickName.value.trim();
      }
    });
    common_vendor.onLoad(async (options) => {
      getLoginCode();
      common_vendor.index.__f__("log", "at pages/index/index.vue:118", "🔄 [登录页] 页面加载，正在预加载最新 Token...");
      performSilentLoginForBind().then((success) => {
        if (success) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:121", "✅ [登录页] Token 预加载成功");
        } else {
          common_vendor.index.__f__("warn", "at pages/index/index.vue:123", "⚠️ [登录页] Token 预加载失败，将在点击登录时重试");
        }
      });
      const codeFromUrl = options == null ? void 0 : options.inviteCode;
      const codeFromStorage = common_vendor.index.getStorageSync("pendingInviteCode");
      let finalInviteCode = "";
      if (codeFromUrl) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:135", "✅ [登录页] 从 URL 参数中捕获到邀请码:", codeFromUrl);
        finalInviteCode = codeFromUrl;
        if (codeFromStorage) {
          common_vendor.index.removeStorageSync("pendingInviteCode");
        }
      } else if (codeFromStorage) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:142", "✅ [登录页] 从本地缓存读取到暂存的邀请码:", codeFromStorage);
        finalInviteCode = codeFromStorage;
        common_vendor.index.removeStorageSync("pendingInviteCode");
      }
      if (finalInviteCode) {
        inviteCode.value = finalInviteCode;
        upstreamInviteCode.value = finalInviteCode;
      }
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        try {
          const {
            data
          } = await utils_request.request("/app-api/member/user/get", {
            method: "GET"
          });
          if (data && data.parentId) {
            hasParent.value = true;
            common_vendor.index.__f__("log", "at pages/index/index.vue:166", "✅ 用户已绑定上级 (ID:", data.parentId, ")，隐藏邀请码输入框");
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:169", "预检用户信息失败", e);
        }
      }
    });
    const onChooseAvatar = (e) => {
      const tempAvatarPath = e.detail.avatarUrl;
      if (tempAvatarPath) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:183", "✅ 用户选择了头像，临时路径:", tempAvatarPath);
        uploadAvatar(tempAvatarPath);
      } else {
        common_vendor.index.__f__("error", "at pages/index/index.vue:187", "❌ 获取头像临时路径失败");
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:230", "✅ 获取 loginCode 成功:", loginCode.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:232", "❌ 获取 loginCode 失败", error);
        common_vendor.index.showToast({
          title: "登录准备失败，请重试",
          icon: "none"
        });
      }
    };
    const getPhoneNumber = (e) => {
      if (e.detail.code) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:245", "getPhoneNumber获取到的值：", e.detail);
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
    const performSilentLoginForBind = async () => {
      try {
        const loginRes = await common_vendor.index.login({
          provider: "weixin"
        });
        if (!loginRes.code)
          return false;
        const silentResult = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: {
            loginCode: loginRes.code,
            state: "default",
            shardCode: inviteCode.value
          }
        });
        if (silentResult.data && silentResult.data.accessToken) {
          common_vendor.index.setStorageSync("token", silentResult.data.accessToken);
          common_vendor.index.setStorageSync("userId", silentResult.data.userId);
          const {
            data: userInfo
          } = await utils_request.request("/app-api/member/user/get", {
            method: "GET"
          });
          if (userInfo) {
            if (userInfo.mobile) {
              isOldUser.value = true;
              nickName.value = userInfo.nickname;
              avatarUrl.value = userInfo.avatar;
              common_vendor.index.__f__("log", "at pages/index/index.vue:306", "✨ [检测] 该用户为老用户，已跳过资料填写");
            }
            if (userInfo.parentId) {
              hasParent.value = true;
            }
            return true;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:317", "前置预检异常:", e);
      }
      return false;
    };
    const handleLogin = async () => {
      if (isLoginDisabled.value)
        return;
      common_vendor.index.showLoading({
        title: "正在登录..."
      });
      try {
        const payload = {
          phoneCode: phoneCode.value,
          telephone: "",
          nickName: nickName.value,
          avatar: avatarUrl.value,
          shardCode: inviteCode.value
        };
        const loginResult = await utils_request.request("/app-api/member/auth/bind/info", {
          method: "POST",
          data: payload
        });
        if (loginResult.error) {
          if (loginResult.error.code === 453) {
            common_vendor.index.showToast({
              title: loginResult.error.msg,
              icon: "none",
              duration: 3e3
            });
          } else {
            throw new Error(loginResult.error.msg || "登录失败");
          }
          return;
        }
        common_vendor.index.clearStorage();
        await performSilentLogin();
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: isOldUser.value ? "欢迎回来" : "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/home/home"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "系统异常",
          icon: "none"
        });
      }
    };
    const skipToAgreement = (type) => {
      common_vendor.index.navigateTo({
        url: `/pages/user-agreement/user-agreement?tab=${type}`
      });
    };
    common_vendor.onShareAppMessage(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:458", "[分享] 用户在登录页发起了分享");
      const finalInviteCode = upstreamInviteCode.value || utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/index/index.vue:466", `[分享] 登录页最终使用的邀请码: ${finalInviteCode}`);
      let sharePath = "/pages/index/index";
      if (finalInviteCode) {
        sharePath += `?inviteCode=${finalInviteCode}`;
      }
      const shareContent = {
        title: "猩聚社丨精英商友·跨域社交工具 Gofor Gathering ☞☞",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:479", "[分享] 登录页分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:490", "[分享] 用户在登录页分享到朋友圈");
      const finalInviteCode = upstreamInviteCode.value || utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/index/index.vue:493", `[分享] 登录页朋友圈分享最终使用的邀请码: ${finalInviteCode}`);
      let queryString = "";
      if (finalInviteCode) {
        queryString = `inviteCode=${finalInviteCode}`;
      }
      const shareContent = {
        title: "猩聚社丨精英商友·跨域社交工具 Gofor Gathering ☞☞",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:506", "[分享] 登录页分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    const performSilentLogin = async () => {
      try {
        const loginRes = await common_vendor.index.login({
          provider: "weixin"
        });
        if (!loginRes || !loginRes.code) {
          return;
        }
        const pendingInviteCode = common_vendor.index.getStorageSync("pendingInviteCode");
        const payload = {
          loginCode: loginRes.code,
          state: "default",
          shardCode: pendingInviteCode || ""
        };
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: payload
        });
        if (!error && data && data.accessToken) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:546", "✅ 静默登录成功!", data);
          common_vendor.index.setStorageSync("token", data.accessToken);
          common_vendor.index.setStorageSync("userId", data.userId);
          fetchCurrentUserInfo();
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:565", "静默登录未成功 (可能是非新用户需手机号或接口异常):", error);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:568", "静默登录流程异常:", e);
      }
    };
    const fetchCurrentUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:581", "首页实时获取用户信息失败:", error);
        currentUserInfo.value = getCachedUserInfo();
      } else {
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(data));
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isOldUser.value
      }, !isOldUser.value ? {
        b: avatarUrl.value || "/static/images/default-avatar.png",
        c: common_vendor.o(onChooseAvatar),
        d: common_vendor.p({
          type: "person-filled",
          size: "22",
          color: _ctx.PRIMARY_COLOR
        }),
        e: nickName.value,
        f: common_vendor.o(($event) => nickName.value = $event.detail.value)
      } : {}, {
        g: common_vendor.p({
          type: "phone-filled",
          size: "22",
          color: _ctx.PRIMARY_COLOR
        }),
        h: !phoneCode.value
      }, !phoneCode.value ? {
        i: common_vendor.o(getPhoneNumber)
      } : {}, {
        j: !isOldUser.value && !hasParent.value
      }, !isOldUser.value && !hasParent.value ? {
        k: common_vendor.p({
          type: "paperplane-filled",
          size: "22",
          color: _ctx.PRIMARY_COLOR
        }),
        l: inviteCode.value,
        m: common_vendor.o(($event) => inviteCode.value = $event.detail.value)
      } : {}, {
        n: agreed.value,
        o: common_vendor.o(toggleAgreement),
        p: common_vendor.o(($event) => skipToAgreement(0)),
        q: common_vendor.o(($event) => skipToAgreement(1)),
        r: isLoginDisabled.value,
        s: common_vendor.o(handleLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
