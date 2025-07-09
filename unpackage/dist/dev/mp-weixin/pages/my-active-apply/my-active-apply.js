"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_upload = require("../../utils/upload.js");
const utils_request = require("../../utils/request.js");
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
    const fullActivityData = common_vendor.ref(null);
    const activityInfo = common_vendor.ref({});
    const qrCodeImage = common_vendor.ref([]);
    const qrCodeUrl = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      if (options.item) {
        try {
          const decodedData = decodeURIComponent(options.item);
          const parsedData = JSON.parse(decodedData);
          fullActivityData.value = parsedData;
          activityInfo.value = {
            id: parsedData.id,
            title: parsedData.activityTitle,
            image: parsedData.coverImageUrl,
            date: formatDateTime(parsedData.startDatetime),
            fee: parsedData.registrationFee.toFixed(2)
          };
          fetchExistingRefundInfo();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/my-active-apply/my-active-apply.vue:90", "解析活动数据失败:", e);
          common_vendor.index.showToast({ title: "加载活动信息失败", icon: "none" });
        }
      } else {
        common_vendor.index.__f__("error", "at pages/my-active-apply/my-active-apply.vue:94", "未从上个页面接收到活动信息");
        common_vendor.index.showToast({ title: "无法获取活动信息", icon: "none" });
      }
    });
    const fetchExistingRefundInfo = async () => {
      if (!fullActivityData.value || !fullActivityData.value.memberActivityJoinResp) {
        return;
      }
      const params = {
        activityId: fullActivityData.value.id,
        userId: fullActivityData.value.memberActivityJoinResp.userId,
        pageNo: 1,
        pageSize: 10
        // 通常只会有一条记录，10足够
      };
      const result = await utils_request.request("/app-api/member/activity-join/list", {
        method: "GET",
        data: params
      });
      if (result.data && result.data.list && result.data.list.length > 0) {
        const existingRecord = result.data.list[0];
        if (existingRecord.refundScreenshotUrl) {
          common_vendor.index.__f__("log", "at pages/my-active-apply/my-active-apply.vue:123", "发现已存在的收款码:", existingRecord.refundScreenshotUrl);
          qrCodeUrl.value = existingRecord.refundScreenshotUrl;
          qrCodeImage.value = [{
            name: "existing_qrcode.png",
            // 给个默认文件名
            extname: "png",
            url: existingRecord.refundScreenshotUrl
            // 关键是这个 URL
          }];
        }
      }
    };
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr)
        return "时间待定";
      const date = new Date(dateTimeStr);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    const handleImageSelect = async (e) => {
      const tempFilePath = e.tempFiles[0].path;
      common_vendor.index.showLoading({ title: "上传中...", mask: true });
      const result = await utils_upload.uploadFile(tempFilePath, { directory: "refund_qrcode" });
      common_vendor.index.hideLoading();
      if (result.data) {
        qrCodeUrl.value = result.data;
        common_vendor.index.showToast({ title: "上传成功", icon: "success" });
      } else {
        qrCodeImage.value = [];
        qrCodeUrl.value = "";
        common_vendor.index.showToast({ title: result.error || "上传失败", icon: "none" });
      }
    };
    const handleImageDelete = () => {
      qrCodeImage.value = [];
      qrCodeUrl.value = "";
    };
    const handleSubmit = async () => {
      if (!qrCodeUrl.value) {
        common_vendor.index.showToast({ title: "请先上传收款码", icon: "none" });
        return;
      }
      if (!fullActivityData.value || !fullActivityData.value.memberActivityJoinResp) {
        common_vendor.index.showToast({ title: "报名信息不完整，无法申请", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "正在提交..." });
      const payload = {
        id: fullActivityData.value.memberActivityJoinResp.id,
        activityId: fullActivityData.value.id,
        refundScreenshotUrl: qrCodeUrl.value
      };
      const submitResult = await utils_request.request("/app-api/member/activity-join/upload-refund-screenshot-url", {
        method: "POST",
        data: payload
      });
      common_vendor.index.hideLoading();
      if (submitResult.error) {
        common_vendor.index.showToast({ title: `申请失败: ${submitResult.error}`, icon: "none" });
      } else {
        common_vendor.index.showModal({
          title: "提交成功",
          content: "您的退款申请已提交，请耐心等待组织者处理。",
          showCancel: false,
          success: () => {
            common_vendor.index.navigateBack();
          }
        });
      }
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
        h: common_vendor.o(handleImageDelete),
        i: common_vendor.o(($event) => qrCodeImage.value = $event),
        j: common_vendor.p({
          ["file-mediatype"]: "image",
          mode: "grid",
          limit: 1,
          title: "点击上传收款码",
          modelValue: qrCodeImage.value
        }),
        k: common_vendor.o(handleSubmit),
        l: !qrCodeUrl.value
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0198e019"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active-apply/my-active-apply.js.map
