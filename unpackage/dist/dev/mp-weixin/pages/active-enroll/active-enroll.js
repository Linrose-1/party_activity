"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput)();
}
const _sfc_main = {
  __name: "active-enroll",
  setup(__props) {
    const currentStep = common_vendor.ref(1);
    const formData = common_vendor.reactive({
      userName: "",
      userPhone: "",
      contactAddress: "",
      remark: "",
      paymentScreenshotUrl: ""
      // 用于存储上传后的真实网络URL
    });
    const activityId = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.id) {
        activityId.value = options.id;
        getActiveDetail();
      } else {
        common_vendor.index.__f__("error", "at pages/active-enroll/active-enroll.vue:184", "未接收到活动ID！");
        common_vendor.index.showToast({ title: "加载活动详情失败，缺少ID", icon: "none" });
      }
    });
    const currentDate = (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).replace(/\//g, "-");
    const formatRangeTime = (start, end) => {
      const format = (timestamp) => {
        if (!timestamp)
          return "";
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      };
      return `${format(start)} - ${format(end)}`;
    };
    const formattedRegistrationTime = common_vendor.computed(() => {
      if (!activityDetail.value)
        return "待定";
      return formatRangeTime(activityDetail.value.registrationStartDatetime, activityDetail.value.registrationEndDatetime);
    });
    const isQueuing = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      return (activityDetail.value.joinCount || 0) >= activityDetail.value.totalSlots;
    });
    const canSubmitStep1 = common_vendor.computed(() => {
      const baseValid = formData.userName.trim() && /^1[3-9]\d{9}$/.test(formData.userPhone);
      if (isQueuing.value) {
        return baseValid && formData.remark.trim();
      }
      return baseValid;
    });
    const confirmSignup = () => {
      if (!canSubmitStep1.value) {
        if (!formData.userName.trim()) {
          common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.userPhone)) {
          common_vendor.index.showToast({ title: "请输入有效的手机号", icon: "none" });
          return;
        }
        if (isQueuing.value && !formData.remark.trim()) {
          common_vendor.index.showToast({ title: "报名已满，请填写申请理由", icon: "none" });
          return;
        }
      }
      currentStep.value = 2;
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const file = res.tempFiles[0];
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            return common_vendor.index.showToast({ title: "文件大小不能超过5MB", icon: "none" });
          }
          common_vendor.index.showLoading({ title: "上传中...", mask: true });
          const result = await utils_upload.uploadFile(file, { directory: "payment-proof" });
          common_vendor.index.hideLoading();
          if (result.data) {
            formData.paymentScreenshotUrl = result.data;
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
          } else {
            common_vendor.index.__f__("error", "at pages/active-enroll/active-enroll.vue:258", "上传失败:", result.error);
            common_vendor.index.showToast({ title: result.error || "上传失败", icon: "none" });
          }
        }
      });
    };
    const getActiveDetail = async () => {
      if (!activityId.value)
        return;
      const result = await utils_request.request("/app-api/member/activity/get", {
        method: "GET",
        data: { id: activityId.value }
      });
      if (result && !result.error) {
        activityDetail.value = result.data;
      } else {
        common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:275", "请求失败:", result ? result.error : "无返回结果");
      }
    };
    const joinActivity = async () => {
      if (!formData.paymentScreenshotUrl) {
        common_vendor.index.showToast({ title: "请上传付款截图", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中...", mask: true });
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "无法获取用户信息，请重新登录", icon: "none" });
        return;
      }
      const params = {
        activityId: activityId.value,
        userId,
        registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
        paymentScreenshotUrl: formData.paymentScreenshotUrl,
        userName: formData.userName,
        userPhone: formData.userPhone,
        contactAddress: formData.contactAddress,
        remark: formData.remark
      };
      const result = await utils_request.request("/app-api/member/activity-join/join-activity", {
        method: "POST",
        data: params
      });
      common_vendor.index.hideLoading();
      if (result && !result.error) {
        common_vendor.index.showToast({ title: "报名成功！", icon: "success" });
        currentStep.value = 3;
      } else {
        common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:316", "报名失败:", result ? result.error : "无返回结果");
        common_vendor.index.showToast({ title: result.error || "报名失败，请重试", icon: "none" });
      }
    };
    const generateTicketNumber = () => {
      const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      const randomNumbers = Math.floor(1e5 + Math.random() * 9e5);
      return `TK${randomLetter}${randomNumbers}`;
    };
    const backToHome = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(activityDetail.value ? activityDetail.value.activityTitle : "活动报名"),
        b: currentStep.value >= 1 ? 1 : "",
        c: currentStep.value >= 2 ? 1 : "",
        d: currentStep.value >= 3 ? 1 : "",
        e: activityDetail.value
      }, activityDetail.value ? {
        f: common_vendor.p({
          type: "person",
          size: "18",
          color: "#FF6E00"
        }),
        g: common_vendor.t(activityDetail.value.organizerUnitName),
        h: common_vendor.t(activityDetail.value.organizerContactPhone),
        i: common_vendor.t(formatRangeTime(activityDetail.value.startDatetime, activityDetail.value.endDatetime)),
        j: common_vendor.t(formattedRegistrationTime.value),
        k: common_vendor.t(activityDetail.value.locationAddress)
      } : {}, {
        l: currentStep.value === 1
      }, currentStep.value === 1 ? common_vendor.e({
        m: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FF6E00"
        }),
        n: common_vendor.o(($event) => formData.userName = $event),
        o: common_vendor.p({
          type: "text",
          placeholder: "请输入您的姓名",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.userName
        }),
        p: common_vendor.o(($event) => formData.userPhone = $event),
        q: common_vendor.p({
          type: "tel",
          placeholder: "请输入手机号",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.userPhone
        }),
        r: common_vendor.o(($event) => formData.contactAddress = $event),
        s: common_vendor.p({
          type: "text",
          placeholder: "请输入单位或学校名称",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.contactAddress
        }),
        t: isQueuing.value
      }, isQueuing.value ? {
        v: common_vendor.o(($event) => formData.remark = $event),
        w: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "当前报名人数已满，填写申请理由可提高审核通过率",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.remark
        })
      } : {}, {
        x: !canSubmitStep1.value ? 1 : "",
        y: common_vendor.o(confirmSignup)
      }) : {}, {
        z: currentStep.value === 2 && activityDetail.value
      }, currentStep.value === 2 && activityDetail.value ? common_vendor.e({
        A: common_vendor.p({
          type: "shop",
          size: "18",
          color: "#FF6E00"
        }),
        B: common_vendor.t(activityDetail.value.registrationFee),
        C: activityDetail.value.organizerPaymentQrCodeUrl,
        D: common_vendor.p({
          type: "image",
          size: "18",
          color: "#FF6E00"
        }),
        E: !formData.paymentScreenshotUrl
      }, !formData.paymentScreenshotUrl ? {
        F: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#FF6E00"
        })
      } : {
        G: formData.paymentScreenshotUrl
      }, {
        H: common_vendor.o(chooseImage),
        I: !formData.paymentScreenshotUrl ? 1 : "",
        J: common_vendor.o(joinActivity)
      }) : {}, {
        K: currentStep.value === 3
      }, currentStep.value === 3 ? common_vendor.e({
        L: activityDetail.value
      }, activityDetail.value ? {
        M: common_vendor.t(activityDetail.value.activityTitle),
        N: common_vendor.t(generateTicketNumber()),
        O: common_vendor.t(common_vendor.unref(currentDate))
      } : {}, {
        P: common_vendor.o(backToHome)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d315542e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-enroll/active-enroll.js.map
