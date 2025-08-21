"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2 + _easycom_uni_icons2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_data_checkbox + _easycom_uni_forms + _easycom_uni_icons)();
}
const DRAFT_STORAGE_KEY = "activity_draft";
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    common_vendor.onMounted(() => {
      getActiveType();
    });
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
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:244", "getActiveType result:", result);
      tagOptions.value = result.data.map((item) => ({
        value: item.value,
        // 使用后端返回的value
        text: item.label
        // 使用后端返回的label
      }));
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:249", "tagOptions updated:", tagOptions.value);
      if (result.error) {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:252", "请求失败:", result.error);
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
            common_vendor.index.__f__("error", "at pages/active-publish/active-publish.vue:322", "上传失败:", result.error);
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
    common_vendor.onLoad(() => {
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
          common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:381", "草稿已加载:", parsedDraft);
        } else {
          timeRange.value = ["2025-01-01 14:00:00", "2025-01-01 17:00:00"];
          enrollTimeRange.value = ["2025-01-01 14:00:00", "2025-01-01 17:00:00"];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/active-publish/active-publish.vue:388", "加载草稿失败:", error);
        common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
      }
      common_vendor.index.$on("shopSelected", (shop) => {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:394", "接收到选择的店铺信息:", shop);
        form.value.associatedStoreId = shop.id;
        associatedStoreName.value = shop.storeName;
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
          icon: "success"
          // 使用成功图标
        });
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:420", "草稿已保存:", draftData);
      } catch (e) {
        common_vendor.index.showToast({
          title: "草稿保存失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/active-publish/active-publish.vue:426", "保存草稿到本地存储失败:", e);
      }
    }
    async function publish() {
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
      if (!form.value.coverImageUrl) {
        common_vendor.index.showToast({
          title: "请上传聚会封面",
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
      if (!form.value.organizerPaymentQrCodeUrl) {
        common_vendor.index.showToast({
          title: "请上传收款码",
          icon: "none"
        });
        return;
      }
      if (!form.value.associatedStoreId) {
        common_vendor.index.showToast({
          title: "请选择合作店铺",
          icon: "none"
        });
        return;
      }
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
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:602", "发布聚会 - 最终Payload:", payload);
        const success = await createActive(payload);
        if (success) {
          common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
          common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:608", "聚会发布成功，草稿已清除。");
          common_vendor.index.switchTab({
            url: "/pages/active/active"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/active-publish/active-publish.vue:618", "发布流程中发生未知错误:", e);
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
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:632", "payload", payload);
      const result = await utils_request.request("/app-api/member/activity/create", {
        method: "POST",
        data: payload
      });
      if (result && !result.error) {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:640", "createActive result:", result);
        common_vendor.index.showToast({
          title: "聚会发布成功！",
          icon: "success"
        });
        return true;
      } else {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:649", "请求失败:", result.error);
        common_vendor.index.showToast({
          title: result.error || "发布失败，请检查填写内容",
          // 优先使用后端返回的错误
          icon: "none",
          duration: 3e3
          // 延长提示时间
        });
        return false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => form.value.activityTitle = $event),
        b: common_vendor.p({
          placeholder: "请输入聚会主题",
          modelValue: form.value.activityTitle
        }),
        c: common_vendor.p({
          label: "聚会主题",
          required: true
        }),
        d: common_vendor.o(($event) => form.value.tag = $event),
        e: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择聚会类型",
          modelValue: form.value.tag
        }),
        f: common_vendor.p({
          label: "聚会类型",
          required: true
        }),
        g: form.value.coverImageUrl
      }, form.value.coverImageUrl ? {
        h: form.value.coverImageUrl
      } : {}, {
        i: common_vendor.o(uploadCover),
        j: common_vendor.p({
          label: "聚会封面",
          required: true
        }),
        k: common_vendor.o(($event) => isPickerOpen.value = false),
        l: common_vendor.o(($event) => isPickerOpen.value = false),
        m: common_vendor.o(($event) => timeRange.value = $event),
        n: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: timeRange.value
        }),
        o: common_vendor.o(($event) => isPickerOpen.value = true),
        p: common_vendor.p({
          label: "聚会时间",
          required: true
        }),
        q: common_vendor.o(($event) => isPickerOpen.value = false),
        r: common_vendor.o(($event) => isPickerOpen.value = false),
        s: common_vendor.o(($event) => enrollTimeRange.value = $event),
        t: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: enrollTimeRange.value
        }),
        v: common_vendor.o(($event) => isPickerOpen.value = true),
        w: common_vendor.p({
          label: "报名时间",
          required: true
        }),
        x: form.value.locationAddress
      }, form.value.locationAddress ? {
        y: common_vendor.t(form.value.locationAddress)
      } : {}, {
        z: common_vendor.o(openMapToChooseLocation),
        A: common_vendor.p({
          label: "聚会地点",
          required: true
        }),
        B: associatedStoreName.value
      }, associatedStoreName.value ? {
        C: common_vendor.t(associatedStoreName.value)
      } : {}, {
        D: common_vendor.o(goToSelectShop),
        E: common_vendor.p({
          label: "合作聚店",
          required: true,
          ["label-width"]: 80
        }),
        F: common_vendor.o(($event) => form.value.totalSlots = $event),
        G: common_vendor.p({
          type: "number",
          placeholder: "超过人数上限,不能报名",
          modelValue: form.value.totalSlots
        }),
        H: common_vendor.p({
          label: "人数上限",
          required: true
        }),
        I: common_vendor.o(($event) => form.value.limitSlots = $event),
        J: common_vendor.p({
          type: "number",
          placeholder: "不达起聚人数,聚会取消",
          modelValue: form.value.limitSlots
        }),
        K: common_vendor.p({
          label: "起聚人数",
          required: true
        }),
        L: common_vendor.o(($event) => form.value.activityFunds = $event),
        M: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "button",
          modelValue: form.value.activityFunds
        }),
        N: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        O: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? {
        P: common_vendor.o(($event) => form.value.registrationFee = $event),
        Q: common_vendor.p({
          type: "digit",
          placeholder: "请输入聚会费用(元)",
          modelValue: form.value.registrationFee
        }),
        R: common_vendor.p({
          label: "单人费用",
          required: true
        })
      } : {}, {
        S: form.value.activityFunds === 2
      }, form.value.activityFunds === 2 ? common_vendor.e({
        T: common_vendor.o(($event) => form.value.companyName = $event),
        U: common_vendor.p({
          placeholder: "请输入赞助公司名称",
          modelValue: form.value.companyName
        }),
        V: common_vendor.p({
          label: "公司名称",
          required: true
        }),
        W: form.value.companyLogo
      }, form.value.companyLogo ? {
        X: form.value.companyLogo
      } : {}, {
        Y: common_vendor.o(uploadSponsorLogo),
        Z: common_vendor.p({
          label: "公司Logo",
          required: true
        })
      }) : {}, {
        aa: common_vendor.p({
          ["label-width"]: 80
        }),
        ab: common_vendor.o(($event) => form.value.activityDescription = $event),
        ac: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入聚会详细介绍",
          modelValue: form.value.activityDescription
        }),
        ad: common_vendor.p({
          label: "聚会介绍",
          required: true,
          ["label-width"]: 80
        }),
        ae: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: "d21abf49-25-" + i0,
            b: common_vendor.o(($event) => item.sessionTitle = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.sessionTitle
            }),
            d: "d21abf49-26-" + i0,
            e: common_vendor.o(($event) => item.sessionDescription = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.sessionDescription
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "d21abf49-27-" + i0,
            i: index
          };
        }),
        af: common_vendor.p({
          type: "close"
        }),
        ag: common_vendor.p({
          type: "plusempty",
          color: "red"
        }),
        ah: common_vendor.o(addAgenda),
        ai: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        aj: common_vendor.p({
          placeholder: "请输入组织者名称",
          modelValue: form.value.organizerUnitName
        }),
        ak: common_vendor.p({
          label: "组织者",
          required: true
        }),
        al: common_vendor.o(($event) => form.value.organizerContactPhone = $event),
        am: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          modelValue: form.value.organizerContactPhone
        }),
        an: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        ao: form.value.organizerPaymentQrCodeUrl
      }, form.value.organizerPaymentQrCodeUrl ? {
        ap: form.value.organizerPaymentQrCodeUrl
      } : {}, {
        aq: common_vendor.o(uploadCode),
        ar: common_vendor.p({
          label: "收款码",
          required: true
        }),
        as: common_vendor.p({
          ["label-width"]: 80
        }),
        at: common_vendor.o(saveDraft),
        av: common_vendor.t(isPublishing.value ? "发布中..." : "发起聚会"),
        aw: isPublishing.value ? 1 : "",
        ax: common_vendor.o(publish),
        ay: isPickerOpen.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d21abf49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-publish/active-publish.js.map
