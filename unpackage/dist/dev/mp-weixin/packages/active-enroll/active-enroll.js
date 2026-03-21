"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_popup + SmartGuidePopup)();
}
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const FORM_CACHE_KEY = "active_enroll_form_cache";
const _sfc_main = {
  __name: "active-enroll",
  setup(__props) {
    common_vendor.ref(true);
    const smartGuidePopupRef = common_vendor.ref(null);
    const currentStep = common_vendor.ref(1);
    const formData = common_vendor.reactive({
      userName: "",
      userPhone: "",
      contactAddress: "",
      remark: "",
      paymentScreenshotUrl: ""
      // 用于存储上传后的真实网络URL
    });
    const loggedInUserId = common_vendor.ref(null);
    const activityId = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    const agreedToTerms = common_vendor.ref(false);
    const ticketNumber = common_vendor.ref("");
    const invitePopup = common_vendor.ref(null);
    const inputInviteCode = common_vendor.ref("");
    const verifiedInviteCode = common_vendor.ref("");
    const fetchAndPrefillUserInfo = async () => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        if (!error && data) {
          if (!formData.userName) {
            formData.userName = data.realName || data.nickname || "";
          }
          if (!formData.userPhone) {
            formData.userPhone = data.mobile || "";
          }
          if (!formData.contactAddress) {
            formData.contactAddress = data.companyName || "";
          }
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:261", "✅ 已根据用户资料自动预填报名信息");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:264", "自动预填信息失败:", e);
      }
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:270", "📥 [报名页-接收] 收到参数:", options);
      if (options.meetingInviteCode) {
        verifiedInviteCode.value = options.meetingInviteCode;
        common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:275", "✅ [报名页] 邀请码已透传并自动验证成功:", verifiedInviteCode.value);
      }
      const storageUserId = common_vendor.index.getStorageSync("userId");
      loggedInUserId.value = storageUserId;
      common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:281", "当前登录用户ID:", loggedInUserId.value);
      if (options.id) {
        activityId.value = options.id;
        getActiveDetail();
      } else {
        common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:291", "未接收到聚会ID！");
        common_vendor.index.showToast({
          title: "加载聚会详情失败，缺少ID",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
      let hasCache = false;
      try {
        const cachedData = common_vendor.index.getStorageSync(FORM_CACHE_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          formData.userName = parsedData.userName || "";
          formData.userPhone = parsedData.userPhone || "";
          formData.contactAddress = parsedData.contactAddress || "";
          formData.remark = parsedData.remark || "";
          formData.paymentScreenshotUrl = parsedData.paymentScreenshotUrl || "";
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:314", "已恢复上次未提交的报名信息");
          hasCache = true;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:319", "读取缓存失败", e);
      }
      if (!hasCache) {
        fetchAndPrefillUserInfo();
      }
    });
    common_vendor.onReady(() => {
      var _a;
      if (utils_user.isScenario3User()) {
        (_a = smartGuidePopupRef.value) == null ? void 0 : _a.open();
      }
    });
    common_vendor.watch(formData, (newVal) => {
      try {
        common_vendor.index.setStorageSync(FORM_CACHE_KEY, JSON.stringify(newVal));
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:342", "保存缓存失败", e);
      }
    }, {
      deep: true
    });
    const isOrganizer = common_vendor.computed(() => {
      if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser) {
        return false;
      }
      return Number(loggedInUserId.value) === Number(activityDetail.value.memberUser.id);
    });
    const toggleAgreement = () => {
      agreedToTerms.value = !agreedToTerms.value;
    };
    const navigateToAgreement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/user-agreement/user-agreement"
      });
    };
    const cancelInvite = () => {
      common_vendor.index.navigateBack();
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
    common_vendor.computed(() => {
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
        common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:443", "免费活动，直接提交报名");
        joinActivity();
      } else {
        common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:447", "收费活动，进入支付步骤");
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
            common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:491", "上传失败:", result.error);
            common_vendor.index.showToast({
              title: result.error || "上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const verifyInviteCode = () => {
      if (!inputInviteCode.value)
        return common_vendor.index.showToast({
          title: "请输入邀请码",
          icon: "none"
        });
      if (inputInviteCode.value === activityDetail.value.inviteCode) {
        verifiedInviteCode.value = inputInviteCode.value;
        invitePopup.value.close();
        common_vendor.index.showToast({
          title: "验证通过",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: "邀请码错误",
          icon: "none"
        });
      }
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
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:547", "getActiveDetail result:", data);
          activityDetail.value = data;
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:552", "🕵️ [报名页] 身份判定 - 是否本人:", isOrganizer.value);
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:553", "🕵️ [报名页] 状态判定 - 已验证码:", verifiedInviteCode.value);
          if (activityDetail.value.requireInviteCode === 1 && activityDetail.value.joinStatus === 0 && !verifiedInviteCode.value && !isOrganizer.value) {
            invitePopup.value.open();
          }
          let status = 0;
          if (data.joinStatus !== void 0) {
            status = data.joinStatus;
          } else if (data.memberActivityJoinResp) {
            status = 2;
          }
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:587", "当前报名状态 joinStatus:", status);
          if (status === 2) {
            common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:591", "状态：已报名，跳转成功页");
            ticketNumber.value = generateTicketNumber();
            if (data.memberActivityJoinResp) {
              formData.userName = data.memberActivityJoinResp.userName || "";
              formData.userPhone = data.memberActivityJoinResp.userPhone || "";
              formData.paymentScreenshotUrl = data.memberActivityJoinResp.paymentScreenshotUrl || "";
            }
            currentStep.value = 3;
          } else if (status === 1) {
            common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:604", "状态：待确认，跳转等待页");
            if (data.memberActivityJoinResp) {
              formData.userName = data.memberActivityJoinResp.userName || "";
              formData.userPhone = data.memberActivityJoinResp.userPhone || "";
            }
            currentStep.value = 3;
          } else {
            common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:615", "状态：未报名，进入填写页");
            currentStep.value = 1;
          }
        } else {
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:619", "请求失败:", result ? result.error : "无返回结果");
          common_vendor.index.showToast({
            title: result.error || "获取聚会信息失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:627", "获取聚会详情时发生异常:", e);
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
        remark: formData.remark,
        inviteCode: isOrganizer.value ? activityDetail.value.inviteCode || "" : verifiedInviteCode.value
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
        common_vendor.index.removeStorageSync(FORM_CACHE_KEY);
        common_vendor.index.$emit("refreshActivityList");
        await getActiveDetail();
      } else {
        const error = result.error;
        common_vendor.index.showToast({
          title: (typeof error === "string" ? error : error.msg) || "报名失败，请重试",
          icon: "none"
        });
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
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: common_vendor.t(activityDetail.value ? activityDetail.value.activityTitle : "聚会报名"),
        b: currentStep.value >= 1 ? 1 : "",
        c: currentStep.value >= 2 ? 1 : "",
        d: currentStep.value >= 3 ? 1 : "",
        e: activityDetail.value
      }, activityDetail.value ? {
        f: common_vendor.t(activityDetail.value.organizerUnitName),
        g: common_vendor.t(formatRangeTime(activityDetail.value.startDatetime, activityDetail.value.endDatetime)),
        h: common_vendor.t(activityDetail.value.locationAddress)
      } : {}, {
        i: currentStep.value === 1
      }, currentStep.value === 1 ? common_vendor.e({
        j: common_vendor.o(($event) => formData.userName = $event),
        k: common_vendor.p({
          placeholder: "请输入姓名",
          styles: _ctx.inputStyles,
          modelValue: formData.userName
        }),
        l: common_vendor.o(($event) => formData.userPhone = $event),
        m: common_vendor.p({
          type: "tel",
          placeholder: "请输入手机号",
          styles: _ctx.inputStyles,
          modelValue: formData.userPhone
        }),
        n: common_vendor.o(($event) => formData.contactAddress = $event),
        o: common_vendor.p({
          placeholder: "请输入单位或组织名称",
          styles: _ctx.inputStyles,
          modelValue: formData.contactAddress
        }),
        p: isQueuing.value
      }, isQueuing.value ? {
        q: common_vendor.o(($event) => formData.remark = $event),
        r: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请填写申请理由",
          styles: _ctx.inputStyles,
          modelValue: formData.remark
        })
      } : {}, {
        s: common_vendor.t(step1ButtonText.value),
        t: !canSubmitStep1.value ? 1 : "",
        v: common_vendor.o(confirmSignup)
      }) : {}, {
        w: currentStep.value === 2 && activityDetail.value
      }, currentStep.value === 2 && activityDetail.value ? common_vendor.e({
        x: common_vendor.t(activityDetail.value.registrationFee),
        y: activityDetail.value.organizerPaymentQrCodeUrl
      }, activityDetail.value.organizerPaymentQrCodeUrl ? {
        z: activityDetail.value.organizerPaymentQrCodeUrl,
        A: common_vendor.o(previewQrCode)
      } : {}, {
        B: formData.paymentScreenshotUrl
      }, formData.paymentScreenshotUrl ? {
        C: formData.paymentScreenshotUrl
      } : {
        D: common_vendor.p({
          type: "camera-filled",
          size: "30",
          color: "#FF62B1"
        })
      }, {
        E: common_vendor.o(chooseImage),
        F: agreedToTerms.value,
        G: common_vendor.o(navigateToAgreement),
        H: common_vendor.o(toggleAgreement),
        I: !formData.paymentScreenshotUrl || !agreedToTerms.value ? 1 : "",
        J: common_vendor.o(joinActivity)
      }) : {}, {
        K: currentStep.value === 3
      }, currentStep.value === 3 ? common_vendor.e({
        L: ((_a = activityDetail.value) == null ? void 0 : _a.joinStatus) === 2
      }, ((_b = activityDetail.value) == null ? void 0 : _b.joinStatus) === 2 ? {} : {}, {
        M: common_vendor.t(((_c = activityDetail.value) == null ? void 0 : _c.joinStatus) === 2 ? "报名成功" : "报名已提交，等待确认"),
        N: common_vendor.t(((_d = activityDetail.value) == null ? void 0 : _d.joinStatus) === 2 ? "期待您的准时参与！" : "您的申请已提交给组织者，审核结果将通过消息通知。"),
        O: common_vendor.t((_e = activityDetail.value) == null ? void 0 : _e.activityTitle),
        P: common_vendor.t(common_vendor.unref(currentDate)),
        Q: common_vendor.o(backToHome)
      }) : {}, {
        R: inputInviteCode.value,
        S: common_vendor.o(($event) => inputInviteCode.value = $event.detail.value),
        T: common_vendor.o(cancelInvite),
        U: common_vendor.o(verifyInviteCode),
        V: common_vendor.sr(invitePopup, "3a3637dc-5", {
          "k": "invitePopup"
        }),
        W: common_vendor.p({
          ["mask-click"]: false
        }),
        X: common_vendor.sr(smartGuidePopupRef, "3a3637dc-6", {
          "k": "smartGuidePopupRef"
        }),
        Y: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3a3637dc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-enroll/active-enroll.js.map
