"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  ShareQrCode();
}
const ShareQrCode = () => "../../components/ShareQrCode.js";
const _sfc_main = {
  __name: "platform-intro",
  setup(__props) {
    const content = common_vendor.ref("");
    common_vendor.onLoad(() => {
      fetchPlatformInfo();
    });
    const fetchPlatformInfo = async () => {
      const {
        data
      } = await utils_request.request("/app-api/system/platformConfig/getPlatformConfig");
      if (data) {
        content.value = data.content || "";
        common_vendor.index.setNavigationBarTitle({
          title: data.name || "平台介绍"
        });
      }
    };
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
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/platform-intro/platform-intro.js.map
