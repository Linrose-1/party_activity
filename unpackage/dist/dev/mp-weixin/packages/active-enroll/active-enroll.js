"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_uni_popup2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_load_more + _easycom_uni_popup + SmartGuidePopup)();
}
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const FORM_CACHE_KEY = "active_enroll_form_cache";
const _sfc_main = {
  __name: "active-enroll",
  setup(__props) {
    const getFormattedNow = () => {
      const now = /* @__PURE__ */ new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };
    const formatRangeTime = (start, end) => {
      const format = (timestamp) => {
        if (!timestamp)
          return "";
        const date = new Date(timestamp);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
      };
      return start && end ? `${format(start)} - ${format(end)}` : "时间待定";
    };
    const generateTicketNumber = () => {
      const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      const randomNumbers = Math.floor(1e5 + Math.random() * 9e5);
      return `TK${randomLetter}${randomNumbers}`;
    };
    const currentStep = common_vendor.ref(1);
    common_vendor.ref(false);
    common_vendor.ref(true);
    const agreedToTerms = common_vendor.ref(false);
    const currentDate = common_vendor.ref(getFormattedNow());
    common_vendor.ref(generateTicketNumber());
    const activityId = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    const loggedInUserId = common_vendor.ref(null);
    const verifyQrCodeBase64 = common_vendor.ref("");
    const inputInviteCode = common_vendor.ref("");
    const verifiedInviteCode = common_vendor.ref("");
    common_vendor.ref("");
    const receivedInviteCode = common_vendor.ref("");
    const receivedExclusiveInviteCode = common_vendor.ref("");
    const formData = common_vendor.reactive({
      userName: "",
      userPhone: "",
      contactAddress: "",
      remark: "",
      paymentScreenshotUrl: ""
    });
    const smartGuidePopupRef = common_vendor.ref(null);
    const invitePopup = common_vendor.ref(null);
    const isQrLoading = common_vendor.ref(false);
    const qrLoadError = common_vendor.ref(false);
    const isActuallyFree = common_vendor.computed(() => {
      var _a;
      const isFeeZero = ((_a = activityDetail.value) == null ? void 0 : _a.registrationFee) === 0;
      const hasExCode = !!receivedExclusiveInviteCode.value;
      return isFeeZero || hasExCode;
    });
    const isOrganizer = common_vendor.computed(() => {
      var _a;
      if (!loggedInUserId.value || !((_a = activityDetail.value) == null ? void 0 : _a.memberUser))
        return false;
      return Number(loggedInUserId.value) === Number(activityDetail.value.memberUser.id);
    });
    const step1ButtonText = common_vendor.computed(() => {
      return isActuallyFree.value ? "立即免费报名" : "下一步：支付报名费";
    });
    const isQueuing = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      return (activityDetail.value.joinCount || 0) >= activityDetail.value.totalSlots;
    });
    const canSubmitStep1 = common_vendor.computed(() => {
      const baseValid = formData.userName.trim() && /^1[3-9]\d{9}$/.test(formData.userPhone);
      return isQueuing.value ? baseValid && formData.remark.trim() : baseValid;
    });
    common_vendor.computed(() => {
      if (!activityDetail.value)
        return "待定";
      return formatRangeTime(activityDetail.value.registrationStartDatetime, activityDetail.value.registrationEndDatetime);
    });
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
          activityDetail.value = data;
          const isVerified = verifiedInviteCode.value || receivedExclusiveInviteCode.value;
          if (data.requireInviteCode === 1 && data.joinStatus === 0 && !isVerified && // <-- 这里是关键：如果已经有任何一种码了，就不弹窗
          !isOrganizer.value) {
            invitePopup.value.open();
          }
          if (data.joinStatus === 1 || data.joinStatus === 2) {
            if (data.memberActivityJoinResp) {
              formData.userName = data.memberActivityJoinResp.userName || "";
              formData.userPhone = data.memberActivityJoinResp.userPhone || "";
              formData.paymentScreenshotUrl = data.memberActivityJoinResp.paymentScreenshotUrl || "";
            }
            currentStep.value = 3;
          } else {
            currentStep.value = 1;
          }
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      }
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
    const getVerifyQrCode = async () => {
      if (!activityId.value)
        return;
      const userId = common_vendor.index.getStorageSync("userId");
      isQrLoading.value = true;
      qrLoadError.value = false;
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/social-user/wxa-qrcode", {
          method: "POST",
          data: {
            scene: `a=${activityId.value}&u=${userId}`,
            path: "packages/active-verify/active-verify",
            width: 430,
            checkPath: false,
            hyaline: true
          }
        });
        if (!error && data) {
          verifyQrCodeBase64.value = `data:image/png;base64,${data}`;
        } else {
          qrLoadError.value = true;
        }
      } catch (e) {
        qrLoadError.value = true;
      } finally {
        isQrLoading.value = false;
      }
    };
    const joinActivity = async () => {
      var _a;
      if (!isActuallyFree.value) {
        if (!formData.paymentScreenshotUrl) {
          common_vendor.index.showToast({
            title: "请上传付款截图",
            icon: "none"
          });
          return;
        }
        if (!agreedToTerms.value) {
          common_vendor.index.showToast({
            title: "请先同意用户协议",
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
      const params = {
        activityId: activityId.value,
        userId,
        registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
        paymentScreenshotUrl: formData.paymentScreenshotUrl,
        userName: formData.userName,
        userPhone: formData.userPhone,
        contactAddress: formData.contactAddress,
        remark: formData.remark,
        // 普通邀请码：如果是组织者本人就传他自己的码，否则传收到的码
        inviteCode: isOrganizer.value ? activityDetail.value.inviteCode || "" : receivedInviteCode.value,
        // 专属邀请码：传收到的码（如果有的话）
        exclusiveInviteCode: receivedExclusiveInviteCode.value
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
        const dynamicKey = FORM_CACHE_KEY + "_" + activityId.value;
        common_vendor.index.removeStorageSync(dynamicKey);
        common_vendor.index.$emit("refreshActivityList");
        currentDate.value = getFormattedNow();
        await getActiveDetail();
      } else {
        common_vendor.index.showToast({
          title: ((_a = result.error) == null ? void 0 : _a.msg) || "报名失败",
          icon: "none"
        });
      }
    };
    const fetchAndPrefillUserInfo = async () => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        if (!error && data) {
          if (!formData.userName)
            formData.userName = data.realName || data.nickname || "";
          if (!formData.userPhone)
            formData.userPhone = data.mobile || "";
          if (!formData.contactAddress)
            formData.contactAddress = data.companyName || "";
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:557", "✅ 个人资料自动补全完成");
        }
      } catch (e) {
      }
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const result = await utils_upload.uploadFile(res.tempFiles[0], {
            directory: "payment-proof"
          });
          common_vendor.index.hideLoading();
          if (result.data)
            formData.paymentScreenshotUrl = result.data;
        }
      });
    };
    const previewQrCode = () => {
      var _a;
      if ((_a = activityDetail.value) == null ? void 0 : _a.organizerPaymentQrCodeUrl) {
        common_vendor.index.previewImage({
          urls: [activityDetail.value.organizerPaymentQrCodeUrl]
        });
      }
    };
    const previewVerifyQrCode = () => {
      if (verifyQrCodeBase64.value) {
        common_vendor.index.previewImage({
          urls: [verifyQrCodeBase64.value]
        });
      }
    };
    const toggleAgreement = () => agreedToTerms.value = !agreedToTerms.value;
    const navigateToAgreement = () => common_vendor.index.navigateTo({
      url: "/pages/user-agreement/user-agreement"
    });
    const cancelInvite = () => common_vendor.index.navigateBack();
    const confirmSignup = () => {
      if (!canSubmitStep1.value)
        return;
      if (isActuallyFree.value) {
        joinActivity();
      } else {
        currentStep.value = 2;
      }
    };
    const backToHome = () => common_vendor.index.navigateBack();
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:620", "📥 [报名页-接收] 参数:", options);
      if (options.inviteCode) {
        receivedInviteCode.value = options.inviteCode;
        verifiedInviteCode.value = options.inviteCode;
      }
      if (options.exclusiveInviteCode) {
        receivedExclusiveInviteCode.value = options.exclusiveInviteCode;
        common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:630", "✅ [报名页] 收到专属免单码，准予免码通行");
      }
      activityId.value = options.id;
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (!activityId.value) {
        common_vendor.index.showToast({
          title: "缺少ID",
          icon: "none"
        });
        return setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
      getActiveDetail();
      const dynamicKey = FORM_CACHE_KEY + "_" + activityId.value;
      const cachedData = common_vendor.index.getStorageSync(dynamicKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          Object.assign(formData, parsed);
          common_vendor.index.__f__("log", "at packages/active-enroll/active-enroll.vue:656", "📝 已恢复本聚会的专属草稿");
        } catch (e) {
          common_vendor.index.__f__("error", "at packages/active-enroll/active-enroll.vue:658", "解析草稿失败");
        }
      }
      fetchAndPrefillUserInfo();
    });
    common_vendor.onReady(() => {
      var _a;
      if (utils_user.isScenario3User())
        (_a = smartGuidePopupRef.value) == null ? void 0 : _a.open();
    });
    common_vendor.watch(formData, (newVal) => {
      if (activityId.value) {
        const dynamicKey = FORM_CACHE_KEY + "_" + activityId.value;
        common_vendor.index.setStorageSync(dynamicKey, JSON.stringify(newVal));
      }
    }, {
      deep: true
    });
    common_vendor.watch(() => {
      var _a;
      return (_a = activityDetail.value) == null ? void 0 : _a.joinStatus;
    }, (newVal) => {
      if (newVal === 2)
        getVerifyQrCode();
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g;
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
        O: ((_e = activityDetail.value) == null ? void 0 : _e.joinStatus) === 2 && verifyQrCodeBase64.value
      }, ((_f = activityDetail.value) == null ? void 0 : _f.joinStatus) === 2 && verifyQrCodeBase64.value ? common_vendor.e({
        P: isQrLoading.value
      }, isQrLoading.value ? {
        Q: common_vendor.p({
          status: "loading",
          iconSize: 20,
          color: "#FF62B1",
          contentText: {
            contentrefresh: "正在生成核销码..."
          }
        })
      } : qrLoadError.value ? {
        S: common_vendor.p({
          type: "refresh-filled",
          size: "30",
          color: "#999"
        }),
        T: common_vendor.o(getVerifyQrCode)
      } : verifyQrCodeBase64.value ? {
        V: verifyQrCodeBase64.value,
        W: common_vendor.p({
          type: "search",
          size: "24",
          color: "#fff"
        })
      } : {}, {
        R: qrLoadError.value,
        U: verifyQrCodeBase64.value,
        X: common_vendor.o(previewVerifyQrCode),
        Y: common_vendor.t(activityId.value),
        Z: common_vendor.t(loggedInUserId.value)
      }) : {}, {
        aa: common_vendor.t((_g = activityDetail.value) == null ? void 0 : _g.activityTitle),
        ab: common_vendor.t(currentDate.value),
        ac: common_vendor.o(backToHome)
      }) : {}, {
        ad: inputInviteCode.value,
        ae: common_vendor.o(($event) => inputInviteCode.value = $event.detail.value),
        af: common_vendor.o(cancelInvite),
        ag: common_vendor.o(verifyInviteCode),
        ah: common_vendor.sr(invitePopup, "3a3637dc-8", {
          "k": "invitePopup"
        }),
        ai: common_vendor.p({
          ["mask-click"]: false
        }),
        aj: common_vendor.sr(smartGuidePopupRef, "3a3637dc-9", {
          "k": "smartGuidePopupRef"
        }),
        ak: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3a3637dc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-enroll/active-enroll.js.map
