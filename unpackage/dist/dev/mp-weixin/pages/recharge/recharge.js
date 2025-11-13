"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_upload = require("../../utils/upload.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  (_easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_file_picker2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_file_picker)();
}
const _sfc_main = {
  __name: "recharge",
  setup(__props) {
    const isSubmitting = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const paymentQRCodeUrl = common_vendor.ref("");
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
    });
    common_vendor.onMounted(() => {
      Promise.all([
        fetchUserInfo(),
        fetchPlatformConfig()
      ]).catch((error) => {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:149", "初始化页面数据时发生错误:", error);
      });
    });
    const fetchPlatformConfig = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/system/platformConfig/getPlatformConfig");
      if (error) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:165", "获取平台配置失败:", error);
        common_vendor.index.showToast({
          title: "收款码加载失败，请刷新重试",
          icon: "none"
        });
        return;
      }
      if (data && data.paymentUrl) {
        paymentQRCodeUrl.value = data.paymentUrl;
        common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:175", "成功获取收款码URL:", paymentQRCodeUrl.value);
      } else {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:177", "平台配置中未找到 paymentUrl");
        common_vendor.index.showToast({
          title: "无法获取收款码",
          icon: "none"
        });
      }
    };
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get");
      if (error) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:193", "获取用户信息失败:", error);
        common_vendor.index.showToast({
          title: "无法获取用户信息，请重新登录",
          icon: "none"
        });
        return;
      }
      userInfo.value = data;
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:201", "获取用户信息:", userInfo.value);
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
      if (!paymentQRCodeUrl.value) {
        common_vendor.index.showToast({
          title: "二维码正在加载中...",
          icon: "none"
        });
        return;
      }
      common_vendor.index.previewImage({
        urls: [paymentQRCodeUrl.value]
        // 使用动态获取的 URL
      });
    };
    const handleFileSelect = async (e) => {
      isSubmitting.value = true;
      common_vendor.index.showLoading({
        title: "图片上传中..."
      });
      for (const tempFile of e.tempFiles) {
        const {
          data: url,
          error
        } = await utils_upload.uploadFile(tempFile);
        if (error) {
          common_vendor.index.hideLoading();
          isSubmitting.value = false;
          common_vendor.index.showToast({
            title: `图片上传失败: ${error}`,
            icon: "none"
          });
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
      common_vendor.index.navigateTo({
        url: "/pages/my-memberDetails/my-memberDetails"
      });
    };
    const handleSubmit = async () => {
      if (!form.payType) {
        return common_vendor.index.showToast({
          title: "请选择充值类型",
          icon: "none"
        });
      }
      if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
        return common_vendor.index.showToast({
          title: "请输入有效的付款金额",
          icon: "none"
        });
      }
      if (!form.payNo.trim()) {
        return common_vendor.index.showToast({
          title: "请输入支付订单号",
          icon: "none"
        });
      }
      if (form.imageUrls.length === 0) {
        return common_vendor.index.showToast({
          title: "请上传支付凭证",
          icon: "none"
        });
      }
      if (!userInfo.value || !userInfo.value.id) {
        return common_vendor.index.showToast({
          title: "无法获取用户信息，请重试",
          icon: "none"
        });
      }
      isSubmitting.value = true;
      common_vendor.index.showLoading({
        title: "正在提交..."
      });
      const payload = {
        userId: userInfo.value.id,
        amount: parseFloat(form.amount),
        payNo: form.payNo.trim(),
        imageUrls: form.imageUrls.join(","),
        // 将 URL 数组拼接成字符串
        remark: form.remark.trim(),
        payType: form.payType
      };
      const {
        data: recordId,
        error
      } = await createPaymentRecord(payload);
      common_vendor.index.hideLoading();
      isSubmitting.value = false;
      if (error) {
        return common_vendor.index.showToast({
          title: `提交失败: ${error}`,
          icon: "none"
        });
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
        a: paymentQRCodeUrl.value
      }, paymentQRCodeUrl.value ? {
        b: paymentQRCodeUrl.value,
        c: common_vendor.o(previewQRCode)
      } : {
        d: common_vendor.p({
          status: "loading",
          ["contentText.loading"]: "收款码加载中..."
        })
      }, {
        e: common_vendor.o(($event) => selectRechargeType(2)),
        f: form.payType === 2 ? 1 : "",
        g: common_vendor.o(($event) => selectRechargeType(1)),
        h: form.payType === 1 ? 1 : "",
        i: form.payType === 2
      }, form.payType === 2 ? {
        j: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF6E00"
        }),
        k: common_vendor.o(goToMemberDetails)
      } : {}, {
        l: form.amount,
        m: common_vendor.o(($event) => form.amount = $event.detail.value),
        n: form.payNo,
        o: common_vendor.o(($event) => form.payNo = $event.detail.value),
        p: common_vendor.p({
          type: "help",
          size: "14",
          color: "#999"
        }),
        q: common_vendor.o(handleFileSelect),
        r: common_vendor.o(handleFileDelete),
        s: common_vendor.o(($event) => imageValue.value = $event),
        t: common_vendor.p({
          fileMediatype: "image",
          mode: "grid",
          limit: "3",
          title: "最多选择3张图片",
          modelValue: imageValue.value
        }),
        v: common_vendor.p({
          type: "help",
          size: "14",
          color: "#999"
        }),
        w: form.remark,
        x: common_vendor.o(($event) => form.remark = $event.detail.value),
        y: common_vendor.p({
          type: "shield-filled",
          size: "18",
          color: "#FF6E00"
        }),
        z: common_vendor.t(isSubmitting.value ? "正在提交..." : "确认提交"),
        A: common_vendor.o(handleSubmit),
        B: isSubmitting.value,
        C: isSubmitting.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2984a38c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map
