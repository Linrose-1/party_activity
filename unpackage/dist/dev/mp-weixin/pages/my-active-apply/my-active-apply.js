"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  (_easycom_uni_icons2 + _easycom_uni_file_picker2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_file_picker)();
}
const _sfc_main = {
  __name: "my-active-apply",
  setup(__props) {
    const activityInfo = common_vendor.ref({});
    const qrCodeImage = common_vendor.ref([]);
    common_vendor.onLoad((options) => {
      const activityId = options.id;
      activityInfo.value = {
        id: activityId,
        title: "城市摄影行走 - 发现老街角的故事",
        image: "../../static/abc.png",
        // 增加了图片字段
        date: "2023年12月10日 14:00-17:00",
        fee: "99.00"
      };
    });
    const handleImageSelect = (e) => {
      common_vendor.index.__f__("log", "at pages/my-active-apply/my-active-apply.vue:75", "选择了图片:", e.tempFiles);
    };
    const handleSubmit = () => {
      if (!qrCodeImage.value || qrCodeImage.value.length === 0) {
        common_vendor.index.showToast({
          title: "请上传收款码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/my-active-apply/my-active-apply.vue:88", "提交的图片信息:", qrCodeImage.value[0]);
      common_vendor.index.showLoading({
        title: "正在提交..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "提交成功",
          content: "您的退款申请已提交，请耐心等待组织者处理。",
          showCancel: false,
          success: () => {
            common_vendor.index.navigateBack();
          }
        });
      }, 1500);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "info-filled",
          color: "#FF6B00",
          size: "18"
        }),
        b: activityInfo.value.image,
        c: common_vendor.t(activityInfo.value.title),
        d: common_vendor.p({
          type: "calendar-filled",
          color: "#999",
          size: "16"
        }),
        e: common_vendor.t(activityInfo.value.date),
        f: common_vendor.t(activityInfo.value.fee),
        g: common_vendor.o(handleImageSelect),
        h: common_vendor.o(($event) => qrCodeImage.value = $event),
        i: common_vendor.p({
          ["file-mediatype"]: "image",
          mode: "grid",
          limit: 1,
          title: "点击上传收款码",
          modelValue: qrCodeImage.value
        }),
        j: common_vendor.o(handleSubmit),
        k: !qrCodeImage.value || qrCodeImage.value.length === 0
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0198e019"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active-apply/my-active-apply.js.map
