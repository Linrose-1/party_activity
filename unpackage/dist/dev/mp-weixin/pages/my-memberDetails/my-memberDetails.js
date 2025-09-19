"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "my-memberDetails",
  setup(__props) {
    const scrollTo = (elementId) => {
      common_vendor.index.pageScrollTo({
        selector: `#${elementId}`,
        duration: 300
        // 滚动动画时长
      });
    };
    const showContactModal = () => {
      common_vendor.index.showModal({
        title: "联系我们",
        // content 使用 \n 进行换行
        content: "本阶段属于会员需求测试期，请扫码添加猩聚社创始猿微信交流！",
        showCancel: false,
        // 只显示一个“确定”按钮
        confirmText: "知道了",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.previewImage({
              urls: ["https://img.gofor.club/index1.png"]
              // 将二维码URL放入数组
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => scrollTo("xuantie")),
        b: common_vendor.o(($event) => scrollTo("qingtong")),
        c: common_vendor.o(($event) => scrollTo("baiyin")),
        d: common_vendor.o(($event) => scrollTo("huangjin")),
        e: common_vendor.o(($event) => scrollTo("heizhuan")),
        f: common_assets._imports_0$3,
        g: common_vendor.o(showContactModal),
        h: common_assets._imports_1,
        i: common_vendor.o(showContactModal),
        j: common_assets._imports_2,
        k: common_vendor.o(showContactModal),
        l: common_assets._imports_3,
        m: common_vendor.o(showContactModal),
        n: common_assets._imports_4,
        o: common_vendor.o(showContactModal)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-abc533c5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-memberDetails/my-memberDetails.js.map
