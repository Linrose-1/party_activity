"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  __name: "recharge",
  setup(__props) {
    const isSubmitting = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const form = common_vendor.reactive({
      payType: null,
      // 1-智米, 2-会员
      amount: "",
      payNo: "",
      remark: "",
      imageUrls: []
      // 存储上传成功后的 URL
    });
    const imageValue = common_vendor.ref([]);
    common_vendor.onLoad((options) => {
      if (options.type === "membership") {
        form.payType = 2;
      } else if (options.type === "points") {
        form.payType = 1;
      }
      fetchUserInfo();
    });
    const fetchUserInfo = async () => {
      const { data, error } = await utils_request.request("/app-api/member/user/get");
      if (error) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:140", "获取用户信息失败:", error);
        common_vendor.index.showToast({ title: "无法获取用户信息，请重新登录", icon: "none" });
        return;
      }
      userInfo.value = data;
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:145", "获取用户信息:", userInfo.value);
    };
    const createPaymentRecord = (payload) => {
      return utils_request.request("/app-api/member/user-post-pay-record/create", {
        method: "POST",
        data: payload
      });
    };
    const selectRechargeType = (type) => {
      form.payType = type;
    };
    const previewQRCode = () => {
      common_vendor.index.previewImage({
        urls: ["/static/fake-qrcode.png"]
        // 只有一个二维码
      });
    };
    const handleFileSelect = async (e) => {
      isSubmitting.value = true;
      common_vendor.index.showLoading({ title: "图片上传中..." });
      for (const tempFile of e.tempFiles) {
        const { data: url, error } = await utils_upload.uploadFile(tempFile);
        if (error) {
          common_vendor.index.hideLoading();
          isSubmitting.value = false;
          common_vendor.index.showToast({ title: `图片上传失败: ${error}`, icon: "none" });
          const index = imageValue.value.findIndex((item) => item.uuid === tempFile.uuid);
          if (index > -1) {
            imageValue.value.splice(index, 1);
          }
          return;
        }
        form.imageUrls.push(url);
      }
      common_vendor.index.hideLoading();
      isSubmitting.value = false;
    };
    const handleFileDelete = (e) => {
      const removedFile = e.tempFile;
      const index = imageValue.value.findIndex((item) => item.url === removedFile.url);
      if (index > -1) {
        form.imageUrls.splice(index, 1);
      }
    };
    const goToMemberDetails = () => {
      common_vendor.index.navigateTo({ url: "/pages/my-memberDetails/my-memberDetails" });
    };
    const handleSubmit = async () => {
      if (!form.payType) {
        return common_vendor.index.showToast({ title: "请选择充值类型", icon: "none" });
      }
      if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
        return common_vendor.index.showToast({ title: "请输入有效的付款金额", icon: "none" });
      }
      if (!form.payNo.trim()) {
        return common_vendor.index.showToast({ title: "请输入支付订单号", icon: "none" });
      }
      if (form.imageUrls.length === 0) {
        return common_vendor.index.showToast({ title: "请上传支付凭证", icon: "none" });
      }
      if (!userInfo.value || !userInfo.value.id) {
        return common_vendor.index.showToast({ title: "无法获取用户信息，请重试", icon: "none" });
      }
      isSubmitting.value = true;
      common_vendor.index.showLoading({ title: "正在提交..." });
      const payload = {
        userId: userInfo.value.id,
        amount: parseFloat(form.amount),
        payNo: form.payNo.trim(),
        imageUrls: form.imageUrls.join(","),
        // 将 URL 数组拼接成字符串
        remark: form.remark.trim(),
        payType: form.payType
      };
      const { data: recordId, error } = await createPaymentRecord(payload);
      common_vendor.index.hideLoading();
      isSubmitting.value = false;
      if (error) {
        return common_vendor.index.showToast({ title: `提交失败: ${error}`, icon: "none" });
      }
      common_vendor.index.showModal({
        title: "提交成功",
        content: `您的充值申请已提交，ID为 ${recordId}，请耐心等待后台审核。`,
        showCancel: false,
        success: () => {
          common_vendor.index.navigateBack();
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.o(previewQRCode),
        c: common_vendor.o(($event) => selectRechargeType(2)),
        d: form.payType === 2 ? 1 : "",
        e: common_vendor.o(($event) => selectRechargeType(1)),
        f: form.payType === 1 ? 1 : "",
        g: form.payType === 2
      }, form.payType === 2 ? {
        h: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF6E00"
        }),
        i: common_vendor.o(goToMemberDetails)
      } : {}, {
        j: form.amount,
        k: common_vendor.o(($event) => form.amount = $event.detail.value),
        l: form.payNo,
        m: common_vendor.o(($event) => form.payNo = $event.detail.value),
        n: common_vendor.p({
          type: "help",
          size: "14",
          color: "#999"
        }),
        o: common_vendor.o(handleFileSelect),
        p: common_vendor.o(handleFileDelete),
        q: common_vendor.o(($event) => imageValue.value = $event),
        r: common_vendor.p({
          fileMediatype: "image",
          mode: "grid",
          limit: "3",
          title: "最多选择3张图片",
          modelValue: imageValue.value
        }),
        s: common_vendor.p({
          type: "help",
          size: "14",
          color: "#999"
        }),
        t: form.remark,
        v: common_vendor.o(($event) => form.remark = $event.detail.value),
        w: common_vendor.p({
          type: "shield-filled",
          size: "18",
          color: "#FF6E00"
        }),
        x: common_vendor.t(isSubmitting.value ? "正在提交..." : "确认提交"),
        y: common_vendor.o(handleSubmit),
        z: isSubmitting.value,
        A: isSubmitting.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2984a38c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map
