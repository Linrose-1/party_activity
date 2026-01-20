"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "ContactService",
  setup(__props) {
    const qrCodeUrl = common_vendor.ref(
      "https://img.gofor.club/post/20260120/bYIigxFi4rpHd5c68a1fff9f38e5411a58c9b8cec504_1768890701193.png"
    );
    const wechatId = common_vendor.ref("xiaodaxia2045");
    const phoneNumber = common_vendor.ref("18024545855");
    const previewQrCode = () => {
      common_vendor.index.previewImage({
        urls: [qrCodeUrl.value],
        current: qrCodeUrl.value
      });
    };
    const makePhoneCall = () => {
      common_vendor.index.makePhoneCall({
        phoneNumber: phoneNumber.value,
        fail: (err) => {
          common_vendor.index.__f__("log", "at packages/ContactService/ContactService.vue:85", "拨打电话取消或失败", err);
        }
      });
    };
    const copyWechat = () => {
      common_vendor.index.setClipboardData({
        data: wechatId.value,
        success: () => {
          common_vendor.index.showToast({
            title: "微信号已复制",
            icon: "success"
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: qrCodeUrl.value,
        b: common_vendor.o(previewQrCode),
        c: common_vendor.p({
          type: "weixin",
          size: "24",
          color: "#FF8400"
        }),
        d: common_vendor.t(wechatId.value),
        e: common_vendor.o(copyWechat),
        f: common_vendor.p({
          type: "phone-filled",
          size: "24",
          color: "#FF8400"
        }),
        g: common_vendor.t(phoneNumber.value),
        h: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        i: common_vendor.o(makePhoneCall)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-828940d1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/ContactService/ContactService.js.map
