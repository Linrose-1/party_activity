"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_data_checkbox + _easycom_uni_forms)();
}
const DRAFT_STORAGE_KEY = "activity_draft";
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    const isUserVerified = common_vendor.ref(true);
    common_vendor.onMounted(() => {
      checkUserVerificationStatus();
      getActiveType();
    });
    const checkUserVerificationStatus = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (!error && data) {
        isUserVerified.value = !!data.idCard;
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:221", "用户实名状态:", isUserVerified.value);
      } else {
        isUserVerified.value = false;
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:225", "获取用户信息失败，无法确认实名状态。");
      }
    };
    const goToAuthPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-auth/my-auth"
      });
    };
    const isPublishing = common_vendor.ref(false);
    const isPickerOpen = common_vendor.ref(false);
    const timeRange = common_vendor.ref([]);
    const enrollTimeRange = common_vendor.ref([]);
    const associatedStoreName = common_vendor.ref("");
    const form = common_vendor.ref({
      activityTitle: "",
      activityDescription: "",
      totalSlots: null,
      limitSlots: null,
      activityFunds: 1,
      // 1: AA, 2: 赞助
      registrationFee: null,
      companyName: "",
      companyLogo: "",
      locationAddress: "",
      // 由地图选择填充
      latitude: null,
      // 由地图选择填充
      longitude: null,
      // 由地图选择填充
      coverImageUrl: "",
      organizerUnitName: "",
      organizerContactPhone: "",
      organizerPaymentQrCodeUrl: "",
      associatedStoreId: null,
      // 由店铺选择页面填充
      tag: "",
      // 这是UI选择的单值，提交时会放入`tags`数组
      activitySessions: [{
        sessionTitle: "环节标题",
        sessionDescription: "环节描述"
      }]
    });
    const tagOptions = common_vendor.ref([]);
    const getActiveType = async () => {
      const result = await utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        // 请求方式
        data: {
          type: "member_activity_category "
        }
      });
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:288", "getActiveType result:", result);
      tagOptions.value = result.data.map((item) => ({
        value: item.value,
        // 使用后端返回的value
        text: item.label
        // 使用后端返回的label
      }));
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:293", "tagOptions updated:", tagOptions.value);
      if (result.error) {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:296", "请求失败:", result.error);
      }
    };
    const enrollmentOptions = common_vendor.ref([
      {
        text: "AA",
        value: 1
      },
      {
        text: "赞助",
        value: 2
      }
    ]);
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          form.value.locationAddress = res.address || res.name;
          form.value.latitude = res.latitude;
          form.value.longitude = res.longitude;
        },
        fail: (err) => {
          if (!err.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "选择位置失败",
              icon: "none"
            });
          }
        }
      });
    };
    const handleImageUpload = (field, directory) => {
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
            directory
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            form.value[field] = result.data;
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "none"
            });
          } else {
            common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:366", "上传失败:", result.error);
            common_vendor.index.showToast({
              title: result.error || "上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    function uploadCover() {
      handleImageUpload("coverImageUrl", "activity-cover");
    }
    function uploadSponsorLogo() {
      handleImageUpload("companyLogo", "sponsor-logo");
    }
    function uploadCode() {
      handleImageUpload("organizerPaymentQrCodeUrl", "payment-qrcode");
    }
    function addAgenda() {
      form.value.activitySessions.push({
        sessionTitle: "",
        sessionDescription: ""
      });
    }
    function removeAgenda(index) {
      form.value.activitySessions.splice(index, 1);
    }
    function goToSelectShop() {
      common_vendor.index.navigateTo({
        url: "/pages/shop-list/shop-list"
      });
    }
    common_vendor.onLoad((options) => {
      if (options && options.storeId && options.storeName) {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:410", "从聚店页跳转而来，自动填充聚店信息...");
        form.value.associatedStoreId = options.storeId;
        associatedStoreName.value = decodeURIComponent(options.storeName);
        common_vendor.index.showToast({
          title: `已选择聚店: ${associatedStoreName.value}`,
          icon: "none"
        });
      }
      try {
        const draftDataString = common_vendor.index.getStorageSync(DRAFT_STORAGE_KEY);
        if (draftDataString) {
          const parsedDraft = JSON.parse(draftDataString);
          form.value = parsedDraft.form;
          timeRange.value = parsedDraft.timeRange;
          enrollTimeRange.value = parsedDraft.enrollTimeRange;
          associatedStoreName.value = parsedDraft.associatedStoreName;
          common_vendor.index.showToast({
            title: "已成功加载草稿",
            icon: "none"
          });
          common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:438", "草稿已加载:", parsedDraft);
        } else {
          const now = /* @__PURE__ */ new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, "0");
          const day = now.getDate().toString().padStart(2, "0");
          const todayStr = `${year}-${month}-${day}`;
          enrollTimeRange.value = [`${todayStr} 09:00:00`, `${todayStr} 18:00:00`];
          timeRange.value = [`${todayStr} 19:00:00`, `${todayStr} 21:00:00`];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:452", "加载草稿失败:", error);
        common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
      }
      common_vendor.index.$on("shopSelected", (shop) => {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:458", "接收到选择的店铺信息:", shop);
        form.value.associatedStoreId = shop.id;
        associatedStoreName.value = shop.storeName;
      });
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("shopSelected");
    });
    function saveDraft() {
      const draftData = {
        form: form.value,
        timeRange: timeRange.value,
        enrollTimeRange: enrollTimeRange.value,
        associatedStoreName: associatedStoreName.value
      };
      try {
        common_vendor.index.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        common_vendor.index.showToast({
          title: "聚会已保存为草稿",
          icon: "none"
        });
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:489", "草稿已保存:", draftData);
      } catch (e) {
        common_vendor.index.showToast({
          title: "草稿保存失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:495", "保存草稿到本地存储失败:", e);
      }
    }
    async function publish() {
      if (isPublishing.value)
        return;
      if (isPublishing.value) {
        common_vendor.index.showToast({
          title: "正在发布中，请稍候...",
          icon: "none"
        });
        return;
      }
      if (!form.value.activityTitle) {
        common_vendor.index.showToast({
          title: "请输入聚会标题",
          icon: "none"
        });
        return;
      }
      if (!form.value.tag) {
        common_vendor.index.showToast({
          title: "请选择聚会类型",
          icon: "none"
        });
        return;
      }
      if (!timeRange.value || timeRange.value.length !== 2) {
        common_vendor.index.showToast({
          title: "请选择聚会时间",
          icon: "none"
        });
        return;
      }
      if (!enrollTimeRange.value || enrollTimeRange.value.length !== 2) {
        common_vendor.index.showToast({
          title: "请选择报名时间",
          icon: "none"
        });
        return;
      }
      if (!form.value.locationAddress) {
        common_vendor.index.showToast({
          title: "请选择聚会地点",
          icon: "none"
        });
        return;
      }
      if (!form.value.totalSlots || form.value.totalSlots <= 0) {
        common_vendor.index.showToast({
          title: "请输入正确的总名额",
          icon: "none"
        });
        return;
      }
      if (!form.value.limitSlots || form.value.limitSlots <= 0) {
        common_vendor.index.showToast({
          title: "请输入正确的最低起聚名额",
          icon: "none"
        });
        return;
      }
      if (parseInt(form.value.limitSlots) > parseInt(form.value.totalSlots)) {
        common_vendor.index.showToast({
          title: "最低起聚名额不能大于总名额",
          icon: "none"
        });
        return;
      }
      if (form.value.activityFunds === 1) {
        if (form.value.registrationFee === null || form.value.registrationFee < 0) {
          common_vendor.index.showToast({
            title: "请输入正确的预报名费用",
            icon: "none"
          });
          return;
        }
      } else if (form.value.activityFunds === 2) {
        if (!form.value.companyName) {
          common_vendor.index.showToast({
            title: "请输入公司名称",
            icon: "none"
          });
          return;
        }
        if (!form.value.companyLogo) {
          common_vendor.index.showToast({
            title: "请上传公司Logo",
            icon: "none"
          });
          return;
        }
      }
      if (!form.value.activityDescription) {
        common_vendor.index.showToast({
          title: "请输入聚会介绍",
          icon: "none"
        });
        return;
      }
      if (!form.value.organizerUnitName) {
        common_vendor.index.showToast({
          title: "请输入组织单位",
          icon: "none"
        });
        return;
      }
      if (!form.value.organizerContactPhone) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return;
      }
      if (form.value.activityFunds === 1 && !form.value.organizerPaymentQrCodeUrl) {
        common_vendor.index.showToast({
          title: "AA制聚会请上传收款码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认发布",
        content: "请确认您填写的内容无误。",
        success: async (res) => {
          if (res.confirm) {
            await processPublishing();
          }
        }
      });
    }
    async function processPublishing() {
      isPublishing.value = true;
      common_vendor.index.showLoading({
        title: "正在处理...",
        mask: true
      });
      try {
        const payload = JSON.parse(JSON.stringify(form.value));
        payload.startDatetime = new Date(timeRange.value[0]).getTime();
        payload.endDatetime = new Date(timeRange.value[1]).getTime();
        payload.registrationStartDatetime = new Date(enrollTimeRange.value[0]).getTime();
        payload.registrationEndDatetime = new Date(enrollTimeRange.value[1]).getTime();
        const selectedTagOption = tagOptions.value.find((option) => option.value === payload.tag);
        if (selectedTagOption) {
          payload.category = selectedTagOption.value;
          payload.tags = [selectedTagOption.text];
        } else {
          payload.category = payload.tag;
          payload.tags = [payload.tag];
        }
        delete payload.tag;
        payload.activitySessions = payload.activitySessions.map((session, index) => ({
          ...session,
          sessionOrder: index + 1
        }));
        if (payload.activityFunds === 1) {
          delete payload.companyName;
          delete payload.companyLogo;
        } else {
          delete payload.registrationFee;
        }
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:688", "发布聚会 - 最终Payload:", payload);
        const {
          success,
          error
        } = await createActive(payload);
        if (success) {
          common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
          common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:697", "聚会发布成功，草稿已清除。");
          common_vendor.index.showModal({
            title: "发布成功",
            content: "可在【我的】-【我的聚会】中查看您发布的聚会。",
            showCancel: false,
            confirmText: "知道了",
            success: (modalRes) => {
              if (modalRes.confirm) {
                common_vendor.index.switchTab({
                  url: "/pages/active/active"
                });
              }
            }
          });
        } else {
          if (typeof error === "object" && error !== null && error.code === 453) {
            common_vendor.index.hideLoading();
            saveDraft();
            common_vendor.index.showModal({
              title: "认证提醒",
              content: error.msg || "发布聚会需要先完成实名认证，是否现在就去认证？您的聚会信息已为您保存为草稿。",
              // 使用 error.msg
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
            isPublishing.value = false;
            return;
          }
          common_vendor.index.showToast({
            title: typeof error === "string" ? error : error.msg || "发布失败",
            icon: "none",
            duration: 3e3
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:745", "发布流程中发生未知错误:", e);
        common_vendor.index.showToast({
          title: "操作失败，请检查网络",
          icon: "none"
        });
      } finally {
        isPublishing.value = false;
        common_vendor.index.hideLoading();
      }
    }
    const createActive = async (payload) => {
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:758", "payload", payload);
      const result = await utils_request.request("/app-api/member/activity/create", {
        method: "POST",
        data: payload
      });
      if (result && !result.error) {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:766", "createActive result:", result);
        return {
          success: true,
          error: null
        };
      } else {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:775", "请求失败:", result.error);
        return {
          success: false,
          error: result.error
        };
      }
    };
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:790", `[活动发布页] 分享给好友，获取到邀请码: ${inviteCode}`);
      let sharePath = "/packages/active-publish/active-publish";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "快来组织一场有趣的聚会吧，链接你的商友！",
        path: sharePath,
        // 建议使用一个固定的、吸引人的分享图片
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:806", "[活动发布页] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:816", `[活动发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "快来组织一场有趣的聚会吧，链接你的商友！",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:831", "[活动发布页] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
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
        d: common_vendor.o(($event) => form.value.activityTitle = $event),
        e: common_vendor.p({
          placeholder: "请输入聚会主题",
          modelValue: form.value.activityTitle
        }),
        f: common_vendor.p({
          label: "聚会主题",
          required: true
        }),
        g: common_vendor.o(($event) => form.value.tag = $event),
        h: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择聚会类型",
          modelValue: form.value.tag
        }),
        i: common_vendor.p({
          label: "聚会类型",
          required: true
        }),
        j: form.value.coverImageUrl
      }, form.value.coverImageUrl ? {
        k: form.value.coverImageUrl
      } : {}, {
        l: common_vendor.o(uploadCover),
        m: common_vendor.p({
          label: "聚会封面"
        }),
        n: common_vendor.o(($event) => isPickerOpen.value = false),
        o: common_vendor.o(($event) => isPickerOpen.value = false),
        p: common_vendor.o(($event) => timeRange.value = $event),
        q: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: timeRange.value
        }),
        r: common_vendor.o(($event) => isPickerOpen.value = true),
        s: common_vendor.p({
          label: "聚会时间",
          required: true
        }),
        t: common_vendor.o(($event) => isPickerOpen.value = false),
        v: common_vendor.o(($event) => isPickerOpen.value = false),
        w: common_vendor.o(($event) => enrollTimeRange.value = $event),
        x: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: enrollTimeRange.value
        }),
        y: common_vendor.o(($event) => isPickerOpen.value = true),
        z: common_vendor.p({
          label: "报名时间",
          required: true
        }),
        A: form.value.locationAddress
      }, form.value.locationAddress ? {
        B: common_vendor.t(form.value.locationAddress)
      } : {}, {
        C: common_vendor.o(openMapToChooseLocation),
        D: common_vendor.p({
          label: "聚会地点",
          required: true
        }),
        E: associatedStoreName.value
      }, associatedStoreName.value ? {
        F: common_vendor.t(associatedStoreName.value)
      } : {}, {
        G: common_vendor.o(goToSelectShop),
        H: common_vendor.p({
          label: "合作聚店",
          ["label-width"]: 80
        }),
        I: common_vendor.o(($event) => form.value.totalSlots = $event),
        J: common_vendor.p({
          type: "number",
          placeholder: "超过人数上限,不能报名",
          modelValue: form.value.totalSlots
        }),
        K: common_vendor.p({
          label: "人数上限",
          required: true
        }),
        L: common_vendor.o(($event) => form.value.limitSlots = $event),
        M: common_vendor.p({
          type: "number",
          placeholder: "不达起聚人数,聚会取消",
          modelValue: form.value.limitSlots
        }),
        N: common_vendor.p({
          label: "起聚人数",
          required: true
        }),
        O: common_vendor.o(($event) => form.value.activityFunds = $event),
        P: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "button",
          modelValue: form.value.activityFunds
        }),
        Q: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        R: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? {
        S: common_vendor.o(($event) => form.value.registrationFee = $event),
        T: common_vendor.p({
          type: "digit",
          placeholder: "请输入聚会费用(元)",
          modelValue: form.value.registrationFee
        }),
        U: common_vendor.p({
          label: "单人费用",
          required: true
        })
      } : {}, {
        V: form.value.activityFunds === 2
      }, form.value.activityFunds === 2 ? common_vendor.e({
        W: common_vendor.o(($event) => form.value.companyName = $event),
        X: common_vendor.p({
          placeholder: "请输入赞助公司名称",
          modelValue: form.value.companyName
        }),
        Y: common_vendor.p({
          label: "公司名称",
          required: true
        }),
        Z: form.value.companyLogo
      }, form.value.companyLogo ? {
        aa: form.value.companyLogo
      } : {}, {
        ab: common_vendor.o(uploadSponsorLogo),
        ac: common_vendor.p({
          label: "公司Logo",
          required: true
        })
      }) : {}, {
        ad: common_vendor.p({
          ["label-width"]: 80
        }),
        ae: common_vendor.o(($event) => form.value.activityDescription = $event),
        af: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入聚会详细介绍",
          modelValue: form.value.activityDescription
        }),
        ag: common_vendor.p({
          label: "聚会介绍",
          required: true,
          ["label-width"]: 80
        }),
        ah: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: "5d3444db-26-" + i0,
            b: common_vendor.o(($event) => item.sessionTitle = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.sessionTitle
            }),
            d: "5d3444db-27-" + i0,
            e: common_vendor.o(($event) => item.sessionDescription = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.sessionDescription
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "5d3444db-28-" + i0,
            i: index
          };
        }),
        ai: common_vendor.p({
          type: "close"
        }),
        aj: common_vendor.p({
          type: "plusempty",
          color: "red"
        }),
        ak: common_vendor.o(addAgenda),
        al: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        am: common_vendor.p({
          placeholder: "请输入组织者名称",
          modelValue: form.value.organizerUnitName
        }),
        an: common_vendor.p({
          label: "组织者",
          required: true
        }),
        ao: common_vendor.o(($event) => form.value.organizerContactPhone = $event),
        ap: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          modelValue: form.value.organizerContactPhone
        }),
        aq: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        ar: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? common_vendor.e({
        as: form.value.organizerPaymentQrCodeUrl
      }, form.value.organizerPaymentQrCodeUrl ? {
        at: form.value.organizerPaymentQrCodeUrl
      } : {}, {
        av: common_vendor.o(uploadCode),
        aw: common_vendor.p({
          label: "收款码",
          required: true
        })
      }) : {}, {
        ax: common_vendor.p({
          ["label-width"]: 80
        }),
        ay: common_vendor.o(saveDraft),
        az: common_vendor.t(isPublishing.value ? "发布中..." : "发起聚会"),
        aA: isPublishing.value ? 1 : "",
        aB: common_vendor.o(publish),
        aC: isPickerOpen.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5d3444db"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-publish/active-publish.js.map
