"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "my-active-secondRegistration",
  setup(__props) {
    const activityInfo = common_vendor.ref(null);
    const rejectionMsg = common_vendor.ref("");
    const oldProofUrl = common_vendor.ref("");
    const enrollmentInfo = common_vendor.ref(null);
    const newProofLocalPath = common_vendor.ref("");
    const isSubmitting = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.item) {
        try {
          const itemData = JSON.parse(decodeURIComponent(options.item));
          activityInfo.value = itemData;
          enrollmentInfo.value = itemData.memberActivityJoinResp;
          rejectionMsg.value = enrollmentInfo.value.rejectMsg;
          oldProofUrl.value = enrollmentInfo.value.paymentScreenshotUrl;
          common_vendor.index.setNavigationBarTitle({ title: "重新上传支付凭证" });
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/my-active-secondRegistration/my-active-secondRegistration.vue:72", "解析数据失败", e);
          common_vendor.index.showToast({ title: "页面数据加载失败", icon: "none" });
        }
      }
    });
    const handleChooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          newProofLocalPath.value = res.tempFilePaths[0];
        }
      });
    };
    const handleSubmit = async () => {
      if (!newProofLocalPath.value) {
        common_vendor.index.showToast({ title: "请先选择新的支付凭证", icon: "none" });
        return;
      }
      if (isSubmitting.value)
        return;
      isSubmitting.value = true;
      common_vendor.index.showLoading({ title: "正在上传凭证..." });
      const uploadResult = await utils_upload.uploadFile({ path: newProofLocalPath.value });
      if (uploadResult.error) {
        common_vendor.index.hideLoading();
        isSubmitting.value = false;
        if (uploadResult.error.includes("审核中")) {
          common_vendor.index.showToast({
            title: "图片正在安全审核，请稍后重试",
            icon: "none",
            duration: 2500
          });
        } else {
          common_vendor.index.showToast({
            title: `上传失败: ${uploadResult.error}`,
            icon: "none",
            duration: 2500
          });
        }
        return;
      }
      try {
        const newImageUrl = uploadResult.data;
        common_vendor.index.showLoading({ title: "正在提交信息..." });
        const params = {
          id: enrollmentInfo.value.id,
          activityId: activityInfo.value.id,
          userId: enrollmentInfo.value.userId,
          paymentScreenshotUrl: newImageUrl
        };
        const submitResult = await utils_request.request("/app-api/member/activity-join/upload-payment-img", {
          method: "POST",
          data: params
        });
        if (submitResult.error) {
          throw new Error(submitResult.error);
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "提交成功，请等待审核",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 2e3);
      } catch (err) {
        common_vendor.index.hideLoading();
        isSubmitting.value = false;
        common_vendor.index.showToast({
          title: err.message || "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const previewImage = (urls) => {
      common_vendor.index.previewImage({ urls });
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "未知";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityInfo.value
      }, activityInfo.value ? {
        b: common_vendor.t(activityInfo.value.activityTitle),
        c: common_vendor.t(formatTime(activityInfo.value.startDatetime))
      } : {}, {
        d: common_vendor.t(rejectionMsg.value),
        e: oldProofUrl.value,
        f: common_vendor.o(($event) => previewImage([oldProofUrl.value])),
        g: newProofLocalPath.value
      }, newProofLocalPath.value ? {
        h: newProofLocalPath.value
      } : {
        i: common_vendor.p({
          type: "plusempty",
          size: "40",
          color: "#c8c9cc"
        })
      }, {
        j: !newProofLocalPath.value
      }, !newProofLocalPath.value ? {} : {}, {
        k: common_vendor.o(handleChooseImage),
        l: common_vendor.t(isSubmitting.value ? "提交中..." : "确认并提交"),
        m: !newProofLocalPath.value || isSubmitting.value,
        n: common_vendor.o(handleSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b11478c6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active-secondRegistration/my-active-secondRegistration.js.map
