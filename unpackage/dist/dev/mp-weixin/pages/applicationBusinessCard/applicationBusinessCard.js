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
  __name: "applicationBusinessCard",
  setup(__props) {
    const currentUserInfo = common_vendor.ref(null);
    const targetUserInfo = common_vendor.ref(null);
    const targetUserId = common_vendor.ref(null);
    const fromShare = common_vendor.ref(false);
    const isPaying = common_vendor.ref(false);
    const showInsufficient = common_vendor.ref(false);
    common_vendor.ref(false);
    const isLoading = common_vendor.ref(true);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:156", "[business-card-apply] onLoad 触发。收到的选项：", options);
      if (options.id && options.name) {
        targetUserId.value = parseInt(options.id, 10);
        fromShare.value = options.fromShare === "1";
        targetUserInfo.value = {
          id: targetUserId.value,
          nickname: decodeURIComponent(options.name),
          realName: decodeURIComponent(options.name),
          avatar: options.avatar ? decodeURIComponent(options.avatar) : "/static/images/default-avatar.png"
        };
        initializePage();
      } else {
        isLoading.value = false;
        common_vendor.index.showToast({
          title: "缺少必要的用户信息",
          icon: "error"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    const initializePage = async () => {
      try {
        const hasPermission = await checkAccessPermission();
        if (hasPermission) {
          return;
        }
        await Promise.all([
          fetchCurrentUserInfo(),
          fetchSimpleTargetUserInfo()
        ]);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:211", "初始化页面时发生错误:", e);
      } finally {
        isLoading.value = false;
      }
    };
    const checkAccessPermission = async () => {
      const requestData = {
        readUserId: targetUserId.value
      };
      if (fromShare.value) {
        requestData.notPay = 1;
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: requestData
      });
      if (data && !error) {
        common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:237", "权限检查成功，直接跳转到名片页。");
        common_vendor.index.redirectTo({
          url: `/pages/my-businessCard/my-businessCard?id=${targetUserId.value}&fromShare=${fromShare.value ? "1" : "0"}`
        });
        return true;
      } else {
        common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:243", "权限检查失败，显示支付页面。", error);
        return false;
      }
    };
    const fetchSimpleTargetUserInfo = async () => {
      if (!targetUserId.value) {
        common_vendor.index.__f__("warn", "at pages/applicationBusinessCard/applicationBusinessCard.vue:255", "无法获取简要信息，因为 targetUserId 不存在。");
        return;
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/getSimpleUserInfo", {
        method: "GET",
        data: {
          readUserId: targetUserId.value,
          notPay: 1
          // 固定传 1
        }
      });
      common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:271", "----------- getSimpleUserInfo 接口返回数据 -----------");
      common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:272", JSON.stringify(data, null, 2));
      common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:273", "----------------------------------------------------");
      if (error) {
        common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:277", "获取目标用户简要信息失败:", error);
        return;
      }
      if (data) {
        targetUserInfo.value = {
          ...targetUserInfo.value,
          ...data
        };
      }
    };
    const fetchCurrentUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (data) {
        currentUserInfo.value = data;
      } else {
        common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:304", "获取当前用户信息失败:", error);
      }
    };
    const handlePayToReadCard = async () => {
      if (isPaying.value)
        return;
      if (!targetUserId.value) {
        common_vendor.index.showToast({
          title: "目标用户ID无效",
          icon: "none"
        });
        return;
      }
      if (currentUserInfo.value && currentUserInfo.value.point < 1) {
        showInsufficient.value = true;
        common_vendor.index.showToast({
          title: "智米不足",
          icon: "none"
        });
        return;
      }
      isPaying.value = true;
      showInsufficient.value = false;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/pay-read-card", {
        method: "POST",
        data: {
          readUserId: targetUserId.value
        }
      });
      isPaying.value = false;
      if (error) {
        common_vendor.index.showToast({
          title: `支付失败: ${error}`,
          icon: "none",
          duration: 2e3
        });
      } else if (data === true) {
        common_vendor.index.showToast({
          title: "支付成功！",
          icon: "success",
          duration: 2e3
        });
        fetchCurrentUserInfo();
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: `/pages/my-businessCard/my-businessCard?id=${targetUserId.value}`
          });
        }, 2e3);
      } else {
        common_vendor.index.showToast({
          title: "支付遇到未知问题",
          icon: "none",
          duration: 2e3
        });
      }
    };
    const goToEarnPoints = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-account/my-account"
      });
    };
    const formattedFriendRequestMessage = common_vendor.computed(() => {
      if (!currentUserInfo.value || !targetUserInfo.value)
        return "正在生成中...";
      const targetName = targetUserInfo.value.realName;
      const myName = currentUserInfo.value.realName || currentUserInfo.value.nickname;
      const myCompany = currentUserInfo.value.companyName || "我的公司";
      const myWork = currentUserInfo.value.professionalTitle || "我的职位";
      return `您好 ${targetName}！我是${myCompany}的${myName}，目前在从事${myWork}工作。我从高伙猩球平台获得您的联系方式，希望可以认识一下。`;
    });
    const copyFriendRequestMessage = () => {
      common_vendor.index.setClipboardData({
        data: formattedFriendRequestMessage.value,
        success: () => common_vendor.index.showToast({
          title: "复制成功！",
          icon: "success"
        }),
        fail: () => common_vendor.index.showToast({
          title: "复制失败",
          icon: "none"
        })
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {} : common_vendor.e({
        b: targetUserInfo.value
      }, targetUserInfo.value ? common_vendor.e({
        c: targetUserInfo.value.avatar
      }, targetUserInfo.value.avatar ? {
        d: targetUserInfo.value.avatar
      } : {
        e: common_vendor.t((targetUserInfo.value.realName || targetUserInfo.value.nickname || "?").charAt(0))
      }, {
        f: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        g: targetUserInfo.value.companyName
      }, targetUserInfo.value.companyName ? {
        h: common_vendor.p({
          type: "flag",
          size: "16",
          color: "#888"
        }),
        i: common_vendor.t(targetUserInfo.value.companyName)
      } : {}, {
        j: targetUserInfo.value.positionTitle
      }, targetUserInfo.value.positionTitle ? {
        k: common_vendor.p({
          type: "staff",
          size: "16",
          color: "#888"
        }),
        l: common_vendor.t(targetUserInfo.value.positionTitle)
      } : {}, {
        m: targetUserInfo.value.professionalTitle
      }, targetUserInfo.value.professionalTitle ? {
        n: common_vendor.p({
          type: "medal",
          size: "16",
          color: "#888"
        }),
        o: common_vendor.t(targetUserInfo.value.professionalTitle)
      } : {}, {
        p: targetUserInfo.value.socialOrganization
      }, targetUserInfo.value.socialOrganization ? {
        q: common_vendor.p({
          type: "network",
          size: "16",
          color: "#888"
        }),
        r: common_vendor.t(targetUserInfo.value.socialOrganization)
      } : {}, {
        s: targetUserInfo.value.personalBio
      }, targetUserInfo.value.personalBio ? {
        t: common_vendor.p({
          type: "paperclip",
          size: "16",
          color: "#888"
        }),
        v: common_vendor.t(targetUserInfo.value.personalBio)
      } : {}, {
        w: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        x: currentUserInfo.value
      }, currentUserInfo.value ? {
        y: common_vendor.t(currentUserInfo.value.point),
        z: currentUserInfo.value.point < 1 ? 1 : ""
      } : {}, {
        A: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        B: common_vendor.t(isPaying.value ? "支付中..." : "确认支付"),
        C: common_vendor.o(handlePayToReadCard),
        D: isPaying.value,
        E: isPaying.value,
        F: common_vendor.o(goToEarnPoints)
      }) : {
        G: common_vendor.p({
          status: "loading",
          contentText: "正在加载用户信息..."
        })
      }, {
        H: currentUserInfo.value && targetUserInfo.value
      }, currentUserInfo.value && targetUserInfo.value ? {
        I: common_vendor.t(formattedFriendRequestMessage.value),
        J: common_vendor.o(copyFriendRequestMessage)
      } : {}));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0843d79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/applicationBusinessCard/applicationBusinessCard.js.map
