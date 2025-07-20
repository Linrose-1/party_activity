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
      if (options.id) {
        targetUserId.value = parseInt(options.id, 10);
        fetchInitialData();
      } else {
        common_vendor.index.showToast({ title: "缺少目标用户ID", icon: "error" });
        setTimeout(() => common_vendor.index.navigateBack(), 1e3);
      }
    });
    const fetchInitialData = async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const [currentUserRes, targetUserRes] = await Promise.all([
          utils_request.request("/app-api/member/user/get", { method: "GET" }),
          // 获取当前用户信息
          utils_request.request(`/app-api/member/user/get?id=${targetUserId.value}`, { method: "GET" })
          // 获取目标用户信息
        ]);
        if (currentUserRes.data) {
          currentUserInfo.value = currentUserRes.data;
        } else {
          common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:139", "获取当前用户信息失败:", currentUserRes.error);
        }
        if (targetUserRes.data) {
          targetUserInfo.value = targetUserRes.data;
        } else {
          common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:146", "获取目标用户信息失败:", targetUserRes.error);
          common_vendor.index.showToast({ title: "获取对方信息失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:150", "初始化数据时发生错误:", e);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
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
      const { data, error, ...fullResponse } = await utils_request.request("/app-api/member/user/pay-read-card", {
        method: "POST",
        data: {
          readUserId: targetUserId.value
        }
      });
      common_vendor.index.__f__("log", "at pages/applicationBusinessCard/applicationBusinessCard.vue:184", "支付接口响应:", { data, error, fullResponse });
      isPaying.value = false;
      if (error) {
        common_vendor.index.showToast({ title: `支付失败: ${error}`, icon: "none", duration: 2e3 });
      } else if (data === true) {
        common_vendor.index.showToast({ title: "支付成功！", icon: "success", duration: 2e3 });
        fetchInitialData();
        setTimeout(() => {
          common_vendor.index.redirectTo({
            // 使用 redirectTo 避免用户返回此支付页
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
      const myName = currentUserInfo.value.realName || currentUserInfo.value.nickname;
      const myCompany = currentUserInfo.value.companyName || "我的公司";
      const myWork = currentUserInfo.value.professionalTitle || "我的职位";
      return `您好！我是${myCompany}的${myName}，目前在从事${myWork}工作。我从高伙猩球平台获得您的联系方式，希望可以认识一下。`;
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
        f: common_vendor.t(targetUserInfo.value.companyName || "公司信息未设置"),
        g: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        h: currentUserInfo.value
      }, currentUserInfo.value ? {
        i: common_vendor.t(currentUserInfo.value.point),
        j: currentUserInfo.value.point < 1 ? 1 : ""
      } : {}, {
        k: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        l: common_vendor.t(isPaying.value ? "支付中..." : "确认支付"),
        m: common_vendor.o(handlePayToReadCard),
        n: isPaying.value,
        o: isPaying.value,
        p: common_vendor.o(goToEarnPoints)
      }) : {
        q: common_vendor.p({
          status: "loading",
          contentText: "正在加载用户信息..."
        })
      }, {
        r: currentUserInfo.value && targetUserInfo.value
      }, currentUserInfo.value && targetUserInfo.value ? {
        s: common_vendor.t(formattedFriendRequestMessage.value),
        t: common_vendor.o(copyFriendRequestMessage)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0843d79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/applicationBusinessCard/applicationBusinessCard.js.map
