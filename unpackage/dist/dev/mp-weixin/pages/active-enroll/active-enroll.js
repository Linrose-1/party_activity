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
    const isUserVerified = common_vendor.ref(true);
    const checkUserVerificationStatus = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (!error && data) {
        isUserVerified.value = !!data.idCard;
      } else {
        isUserVerified.value = false;
        common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:213", "获取用户信息失败，无法确认实名状态。");
      }
    };
    const goToAuthPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-auth/my-auth"
      });
    };
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
    const agreedToTerms = common_vendor.ref(false);
    const ticketNumber = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      checkUserVerificationStatus();
      if (options.id) {
        activityId.value = options.id;
        getActiveDetail();
      } else {
        common_vendor.index.__f__("error", "at pages/active-enroll/active-enroll.vue:249", "未接收到聚会ID！");
        common_vendor.index.showToast({
          title: "加载聚会详情失败，缺少ID",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    const toggleAgreement = () => {
      agreedToTerms.value = !agreedToTerms.value;
    };
    const navigateToAgreement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/user-agreement/user-agreement"
      });
    };
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
          common_vendor.index.showToast({
            title: "请输入姓名",
            icon: "none"
          });
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.userPhone)) {
          common_vendor.index.showToast({
            title: "请输入有效的手机号",
            icon: "none"
          });
          return;
        }
        if (isQueuing.value && !formData.remark.trim()) {
          common_vendor.index.showToast({
            title: "报名已满，请填写申请理由",
            icon: "none"
          });
          return;
        }
        return;
      }
      if (activityDetail.value && activityDetail.value.registrationFee === 0) {
        common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:338", "免费活动，直接提交报名");
        joinActivity();
      } else {
        common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:342", "收费活动，进入支付步骤");
        currentStep.value = 2;
      }
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
            return common_vendor.index.showToast({
              title: "文件大小不能超过5MB",
              icon: "none"
            });
          }
          common_vendor.index.showLoading({
            title: "上传中...",
            mask: true
          });
          const result = await utils_upload.uploadFile(file, {
            directory: "payment-proof"
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            formData.paymentScreenshotUrl = result.data;
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          } else {
            common_vendor.index.__f__("error", "at pages/active-enroll/active-enroll.vue:386", "上传失败:", result.error);
            common_vendor.index.showToast({
              title: result.error || "上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const getActiveDetail = async () => {
      if (!activityId.value)
        return;
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
      });
      try {
        const result = await utils_request.request("/app-api/member/activity/get", {
          method: "GET",
          data: {
            id: activityId.value
          }
        });
        common_vendor.index.hideLoading();
        if (result && !result.error) {
          const data = result.data;
          common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:417", "getActiveDetail result:", data);
          if (data && data.memberActivityJoinResp && data.memberActivityJoinResp.paymentStatusStr) {
            common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:421", "用户已有效报名 (paymentStatusStr 存在)，直接跳转到成功页。");
            activityDetail.value = data;
            ticketNumber.value = generateTicketNumber();
            currentStep.value = 3;
            formData.userName = data.memberActivityJoinResp.userName || "";
            formData.userPhone = data.memberActivityJoinResp.userPhone || "";
            formData.paymentScreenshotUrl = data.memberActivityJoinResp.paymentScreenshotUrl || "";
          } else {
            common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:438", "用户未报名或报名状态无效，进入正常报名流程。");
            activityDetail.value = data;
            currentStep.value = 1;
          }
        } else {
          common_vendor.index.__f__("log", "at pages/active-enroll/active-enroll.vue:444", "请求失败:", result ? result.error : "无返回结果");
          common_vendor.index.showToast({
            title: result.error || "获取聚会信息失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/active-enroll/active-enroll.vue:452", "获取聚会详情时发生异常:", e);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      }
    };
    const joinActivity = async () => {
      const isFree = activityDetail.value && activityDetail.value.registrationFee === 0;
      if (!isFree) {
        if (!formData.paymentScreenshotUrl) {
          common_vendor.index.showToast({
            title: "请上传付款截图",
            icon: "none"
          });
          return;
        }
        if (!agreedToTerms.value) {
          common_vendor.index.showToast({
            title: "请先阅读并同意用户协议",
            icon: "none"
          });
          return;
        }
      }
      common_vendor.index.showLoading({
        title: "提交中...",
        mask: true
      });
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "无法获取用户信息，请重新登录",
          icon: "none"
        });
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
        common_vendor.index.showToast({
          title: "报名成功！",
          icon: "success"
        });
        currentStep.value = 3;
      } else {
        const error = result.error;
        if (typeof error === "object" && error !== null && error.code === 453) {
          common_vendor.index.showModal({
            title: "认证提醒",
            content: error.msg || "报名聚会需要先完成实名认证，是否现在就去认证？",
            confirmText: "去认证",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.navigateTo({
                  url: "/pages/my-auth/my-auth"
                });
              }
            }
          });
        } else {
          common_vendor.index.showToast({
            title: (typeof error === "string" ? error : error.msg) || "报名失败，请重试",
            icon: "none"
          });
        }
      }
    };
    const previewQrCode = () => {
      if (activityDetail.value && activityDetail.value.organizerPaymentQrCodeUrl) {
        common_vendor.index.previewImage({
          // uni.previewImage 需要一个 URL 数组
          urls: [activityDetail.value.organizerPaymentQrCodeUrl],
          // 指定当前要显示的图片，因为只有一个，所以就是它自己
          current: activityDetail.value.organizerPaymentQrCodeUrl
        });
      }
    };
    const generateTicketNumber = () => {
      if (!ticketNumber.value) {
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const randomNumbers = Math.floor(1e5 + Math.random() * 9e5);
        ticketNumber.value = `TK${randomLetter}${randomNumbers}`;
      }
      return ticketNumber.value;
    };
    const step1ButtonText = common_vendor.computed(() => {
      if (activityDetail.value && activityDetail.value.registrationFee === 0) {
        return "提交报名";
      }
      return "下一步：支付报名费";
    });
    const backToHome = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isUserVerified.value
      }, !isUserVerified.value ? {
        b: common_vendor.p({
          type: "info-filled",
          size: "18",
          color: "#e6a23c"
        }),
        c: common_vendor.o(goToAuthPage)
      } : {}, {
        d: common_vendor.t(activityDetail.value ? activityDetail.value.activityTitle : "聚会报名"),
        e: currentStep.value >= 1 ? 1 : "",
        f: currentStep.value >= 2 ? 1 : "",
        g: currentStep.value >= 3 ? 1 : "",
        h: activityDetail.value
      }, activityDetail.value ? {
        i: common_vendor.t(activityDetail.value.organizerUnitName),
        j: common_vendor.t(activityDetail.value.organizerContactPhone),
        k: common_vendor.t(formatRangeTime(activityDetail.value.startDatetime, activityDetail.value.endDatetime)),
        l: common_vendor.t(formattedRegistrationTime.value),
        m: common_vendor.t(activityDetail.value.locationAddress)
      } : {}, {
        n: currentStep.value === 1
      }, currentStep.value === 1 ? common_vendor.e({
        o: common_vendor.o(($event) => formData.userName = $event),
        p: common_vendor.p({
          type: "text",
          placeholder: "请输入您的姓名",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.userName
        }),
        q: common_vendor.o(($event) => formData.userPhone = $event),
        r: common_vendor.p({
          type: "tel",
          placeholder: "请输入手机号",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.userPhone
        }),
        s: common_vendor.o(($event) => formData.contactAddress = $event),
        t: common_vendor.p({
          type: "text",
          placeholder: "请输入单位或学校名称",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.contactAddress
        }),
        v: isQueuing.value
      }, isQueuing.value ? {
        w: common_vendor.o(($event) => formData.remark = $event),
        x: common_vendor.p({
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
        y: common_vendor.t(step1ButtonText.value),
        z: !canSubmitStep1.value ? 1 : "",
        A: common_vendor.o(confirmSignup)
      }) : {}, {
        B: currentStep.value === 2 && activityDetail.value
      }, currentStep.value === 2 && activityDetail.value ? common_vendor.e({
        C: common_vendor.t(activityDetail.value.registrationFee),
        D: activityDetail.value.organizerPaymentQrCodeUrl
      }, activityDetail.value.organizerPaymentQrCodeUrl ? {
        E: activityDetail.value.organizerPaymentQrCodeUrl,
        F: common_vendor.o(previewQrCode)
      } : {}, {
        G: common_vendor.p({
          type: "image",
          size: "18",
          color: "#FF6E00"
        }),
        H: !formData.paymentScreenshotUrl
      }, !formData.paymentScreenshotUrl ? {} : {
        I: formData.paymentScreenshotUrl
      }, {
        J: common_vendor.o(chooseImage),
        K: agreedToTerms.value,
        L: common_vendor.o(toggleAgreement),
        M: common_vendor.o(navigateToAgreement),
        N: !formData.paymentScreenshotUrl || !agreedToTerms.value ? 1 : "",
        O: common_vendor.o(joinActivity)
      }) : {}, {
        P: currentStep.value === 3
      }, currentStep.value === 3 ? common_vendor.e({
        Q: activityDetail.value
      }, activityDetail.value ? {
        R: common_vendor.t(activityDetail.value.activityTitle),
        S: common_vendor.t(common_vendor.unref(currentDate))
      } : {}, {
        T: common_vendor.o(backToHome)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d315542e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-enroll/active-enroll.js.map
