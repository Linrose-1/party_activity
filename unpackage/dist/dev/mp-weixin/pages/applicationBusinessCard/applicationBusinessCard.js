"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
const _sfc_main = {
  __name: "applicationBusinessCard",
  setup(__props) {
    const currentUserInfo = common_vendor.ref(null);
    const targetUserInfo = common_vendor.ref(null);
    const targetUserId = common_vendor.ref(null);
    const isPaying = common_vendor.ref(false);
    const showInsufficient = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.id && options.name) {
        targetUserId.value = parseInt(options.id, 10);
        targetUserInfo.value = {
          id: targetUserId.value,
          nickname: decodeURIComponent(options.name),
          realName: decodeURIComponent(options.name),
          // 预填充，后续可能被API覆盖
          avatar: options.avatar ? decodeURIComponent(options.avatar) : "/static/images/default-avatar.png"
        };
        common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:126", "已预填充目标用户信息:", targetUserInfo.value);
        initializePage();
      } else {
        common_vendor.index.showToast({ title: "缺少必要的用户信息", icon: "error" });
        setTimeout(() => common_vendor.index.navigateBack(), 1e3);
      }
    });
    const initializePage = async () => {
      await Promise.all([
        checkAccessPermission(),
        fetchCurrentUserInfo()
      ]);
    };
    const checkAccessPermission = async () => {
      const checkResult = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: { readUserId: targetUserId.value }
      });
      if (checkResult && checkResult.data && !checkResult.error) {
        common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:156", "权限检查成功，直接跳转到名片页。");
        common_vendor.index.redirectTo({
          url: `/pages/my-businessCard/my-businessCard?id=${targetUserId.value}`
        });
      } else {
        common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:162", "权限检查失败，显示支付页面。", checkResult.error);
      }
    };
    const fetchCurrentUserInfo = async () => {
      const { data, error } = await utils_request.request("/app-api/member/user/get", { method: "GET" });
      if (data) {
        currentUserInfo.value = data;
        common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:171", "已获取当前登录用户信息:", currentUserInfo.value);
      } else {
        common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:173", "获取当前用户信息失败:", error);
        common_vendor.index.showToast({ title: "获取您的账户信息失败", icon: "none" });
      }
    };
    const handlePayToReadCard = async () => {
      if (isPaying.value)
        return;
      if (!targetUserId.value) {
        common_vendor.index.showToast({ title: "目标用户ID无效", icon: "none" });
        return;
      }
      if (currentUserInfo.value && currentUserInfo.value.point < 1) {
        showInsufficient.value = true;
        common_vendor.index.showToast({ title: "智米不足", icon: "none" });
        return;
      }
      isPaying.value = true;
      showInsufficient.value = false;
      const { data, error } = await utils_request.request("/app-api/member/user/pay-read-card", {
        method: "POST",
        data: { readUserId: targetUserId.value }
      });
      isPaying.value = false;
      if (error) {
        common_vendor.index.showToast({ title: `支付失败: ${error}`, icon: "none", duration: 2e3 });
      } else if (data === true) {
        common_vendor.index.showToast({ title: "支付成功！", icon: "success", duration: 2e3 });
        fetchCurrentUserInfo();
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: `/pages/my-businessCard/my-businessCard?id=${targetUserId.value}`
          });
        }, 2e3);
      } else {
        common_vendor.index.showToast({ title: "支付遇到未知问题", icon: "none", duration: 2e3 });
      }
    };
    const goToEarnPoints = () => {
      common_vendor.index.navigateTo({ url: "/pages/my-account/my-account" });
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
        success: () => common_vendor.index.showToast({ title: "复制成功！", icon: "success" }),
        fail: () => common_vendor.index.showToast({ title: "复制失败", icon: "none" })
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: targetUserInfo.value
      }, targetUserInfo.value ? common_vendor.e({
        b: targetUserInfo.value.avatar
      }, targetUserInfo.value.avatar ? {
        c: targetUserInfo.value.avatar
      } : {
        d: common_vendor.t((targetUserInfo.value.realName || targetUserInfo.value.nickname || "?").charAt(0))
      }, {
        e: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        f: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        g: currentUserInfo.value
      }, currentUserInfo.value ? {
        h: common_vendor.t(currentUserInfo.value.point),
        i: currentUserInfo.value.point < 1 ? 1 : ""
      } : {}, {
        j: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        k: common_vendor.t(isPaying.value ? "支付中..." : "确认支付"),
        l: common_vendor.o(handlePayToReadCard),
        m: isPaying.value,
        n: isPaying.value,
        o: common_vendor.o(goToEarnPoints)
      }) : {
        p: common_vendor.p({
          status: "loading",
          contentText: "正在加载用户信息..."
        })
      }, {
        q: currentUserInfo.value && targetUserInfo.value
      }, currentUserInfo.value && targetUserInfo.value ? {
        r: common_vendor.t(formattedFriendRequestMessage.value),
        s: common_vendor.o(copyFriendRequestMessage)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0843d79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/applicationBusinessCard/applicationBusinessCard.js.map
