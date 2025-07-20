"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + MyCard + _easycom_uni_popup)();
}
const MyCard = () => "../../components/MyCard.js";
const _sfc_main = {
  __name: "my-businessCard",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const sharePopup = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      fetchUserInfo();
    });
    const fetchUserInfo = async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      const { data, error } = await utils_request.request("/app-api/member/user/get", { method: "GET" });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({ title: `加载失败: ${error}`, icon: "none" });
        return;
      }
      userInfo.value = data;
    };
    const formattedContactInfo = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      return [
        { icon: "phone-filled", value: userInfo.value.mobile || "未设置手机" },
        { icon: "email-filled", value: userInfo.value.contactEmail || "未设置邮箱" },
        { icon: "location-filled", value: userInfo.value.locationAddress || "未设置地址" }
      ];
    });
    const goToEdit = () => {
      common_vendor.index.navigateTo({ url: "/pages/my-edit/my-edit" });
    };
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:100", "触发了分享给好友", res);
      if (!userInfo.value) {
        return {
          title: "快来看看我的专业电子名片！"
        };
      }
      return {
        title: `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`,
        path: `/pages/my-businessCard/my-businessCard?id=${userInfo.value.id}`,
        // 必须是小程序内的页面路径，带上参数
        imageUrl: userInfo.value.avatar
        // 自定义分享图片
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:116", "触发了分享到朋友圈");
      if (!userInfo.value) {
        return {
          title: "快来看看我的专业电子名片！"
        };
      }
      return {
        title: `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`,
        query: `id=${userInfo.value.id}`,
        // 分享到朋友圈的参数
        imageUrl: userInfo.value.avatar
      };
    });
    const openSharePopup = () => {
      if (!userInfo.value) {
        common_vendor.index.showToast({ title: "信息加载中，请稍候", icon: "none" });
        return;
      }
      sharePopup.value.open();
    };
    const closeSharePopup = () => {
      sharePopup.value.close();
    };
    const guideShareToMoments = () => {
      closeSharePopup();
      common_vendor.index.showToast({
        title: "请点击右上角「...」，然后选择「分享到朋友圈」",
        icon: "none",
        duration: 3e3
      });
    };
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          type: "undo-filled",
          size: "24",
          color: "#fff"
        }),
        b: common_vendor.o(openSharePopup),
        c: userInfo.value
      }, userInfo.value ? {
        d: common_vendor.p({
          avatar: userInfo.value.avatar,
          name: userInfo.value.realName || userInfo.value.nickname,
          ["pinyin-name"]: (_a = userInfo.value.topUpLevel) == null ? void 0 : _a.name,
          title: (_b = userInfo.value.level) == null ? void 0 : _b.name,
          ["company-name"]: userInfo.value.companyName,
          department: "",
          ["full-company-name"]: userInfo.value.professionalTitle,
          ["contact-info"]: formattedContactInfo.value,
          ["show-user-qr-code"]: !!userInfo.value.wechatQrCodeUrl,
          ["user-we-chat-qr-code-url"]: userInfo.value.wechatQrCodeUrl,
          ["platform-qr-code-url"]: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info",
          ["logo-url"]: "https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png"
        })
      } : {}, {
        e: userInfo.value
      }, userInfo.value ? {
        f: common_vendor.o(goToEdit)
      } : {}, {
        g: common_vendor.o(guideShareToMoments),
        h: common_vendor.o(closeSharePopup),
        i: common_vendor.sr(sharePopup, "30894501-2", {
          "k": "sharePopup"
        }),
        j: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30894501"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-businessCard/my-businessCard.js.map
