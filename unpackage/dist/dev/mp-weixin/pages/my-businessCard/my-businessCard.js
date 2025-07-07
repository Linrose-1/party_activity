"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (MyCard + _easycom_uni_icons)();
}
const MyCard = () => "../../components/MyCard.js";
const _sfc_main = {
  __name: "my-businessCard",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
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
    const formattedInfoItems = common_vendor.computed(() => {
      if (!userInfo.value) {
        return [];
      }
      return [
        {
          icon: "staff",
          label: "职业",
          value: userInfo.value.professionalTitle || "未设置"
        },
        {
          icon: "shop",
          label: "公司/机构",
          value: userInfo.value.companyName || "未设置"
        },
        {
          icon: "phone",
          label: "联系方式",
          value: userInfo.value.mobile || "未设置"
        },
        {
          icon: "email",
          label: "邮箱",
          value: userInfo.value.contactEmail || "未设置"
        },
        {
          icon: "info",
          label: "个人简介",
          value: userInfo.value.personalBio || "暂无简介"
        }
      ];
    });
    const shareCard = () => {
      if (!userInfo.value) {
        common_vendor.index.showToast({ title: "请等待信息加载完成", icon: "none" });
        return;
      }
      common_vendor.index.share({
        provider: "weixin",
        scene: "WXSceneSession",
        // 分享到微信好友
        type: 0,
        // 分享图文
        href: "https://example.com/card/" + userInfo.value.id,
        // 分享的链接，最好替换成真实地址
        title: `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`,
        summary: `我正在使用XXX，这是我的名片，请惠存。`,
        imageUrl: userInfo.value.avatar,
        // 分享的缩略图
        success: function(res) {
          common_vendor.index.showToast({ title: "分享成功", icon: "success" });
        },
        fail: function(err) {
          common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:125", "分享失败:", JSON.stringify(err));
          common_vendor.index.showToast({ title: "分享失败", icon: "none" });
        }
      });
    };
    const goToEdit = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-edit/my-edit"
        // 请确保这个路径是您的编辑资料页面路径
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? {
        b: common_vendor.p({
          avatar: userInfo.value.avatar,
          name: userInfo.value.realName || userInfo.value.nickname,
          title: userInfo.value.professionalTitle,
          location: userInfo.value.locationAddress,
          infoItems: formattedInfoItems.value,
          inviteCode: userInfo.value.shardCode,
          qrCodeUrl: userInfo.value.wechatQrCodeUrl,
          showQrCode: !!userInfo.value.wechatQrCodeUrl
        })
      } : {}, {
        c: userInfo.value
      }, userInfo.value ? {
        d: common_vendor.o(goToEdit)
      } : {}, {
        e: common_vendor.p({
          type: "share",
          size: "20",
          color: "#fff"
        }),
        f: common_vendor.o(shareCard)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30894501"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-businessCard/my-businessCard.js.map
