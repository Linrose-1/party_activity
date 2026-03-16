"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Math) {
  ShareQrCode();
}
const ShareQrCode = () => "../../components/ShareQrCode.js";
const _sfc_main = {
  __name: "platform-intro",
  setup(__props) {
    const content = common_vendor.ref("");
    const platformName = common_vendor.ref("平台介绍");
    common_vendor.onLoad(() => {
      common_vendor.index.showLoading({
        title: "正在加载...",
        mask: true
      });
      fetchPlatformInfo();
      common_vendor.index.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
      }, 3e3);
    });
    const fetchPlatformInfo = async () => {
      try {
        const {
          data
        } = await utils_request.request("/app-api/system/platformConfig/getPlatformConfig");
        if (data) {
          content.value = data.content || "";
          platformName.value = data.name || "平台介绍";
          common_vendor.index.setNavigationBarTitle({
            title: platformName.value
          });
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      const sharePath = `/pages/platform-intro/platform-intro?inviteCode=${inviteCode}`;
      common_vendor.index.__f__("log", "at pages/platform-intro/platform-intro.vue:85", "带分享码：", sharePath);
      return {
        title: platformName.value + " | 猩聚社精英商友社区",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      return {
        title: platformName.value,
        query: `inviteCode=${inviteCode}`,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: content.value,
        b: content.value
      }, content.value ? {} : {}, {
        c: common_vendor.p({
          path: "pages/home/home",
          label: "首页邀约码"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-08c6f3b5"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/platform-intro/platform-intro.js.map
