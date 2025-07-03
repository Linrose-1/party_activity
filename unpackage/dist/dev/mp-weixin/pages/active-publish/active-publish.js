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
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    common_vendor.onMounted(() => {
      getActiveType();
    });
    const isPickerOpen = common_vendor.ref(false);
    const timeRange = common_vendor.ref(["2025-07-19 14:00:00", "2025-07-19 17:00:00"]);
    const enrollTimeRange = common_vendor.ref(["2025-07-1 14:00:00", "2025-07-18 17:00:00"]);
    const associatedStoreName = common_vendor.ref("");
    const form = common_vendor.ref({
      activityTitle: "互联网创业者交流会",
      activityDescription: "本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。...",
      totalSlots: 50,
      limitSlots: 10,
      activityFunds: 1,
      // 1: AA, 2: 赞助
      registrationFee: 100,
      companyName: "",
      companyLogo: "",
      locationAddress: "",
      // 由地图选择填充
      latitude: null,
      // 由地图选择填充
      longitude: null,
      // 由地图选择填充
      coverImageUrl: "",
      organizerUnitName: "创新科技活动策划部",
      organizerContactPhone: "021-68881234",
      organizerPaymentQrCodeUrl: "",
      associatedStoreId: null,
      // 由店铺选择页面填充
      tag: "交流会",
      // 这是UI选择的单值，提交时会放入`tags`数组
      activitySessions: [
        {
          sessionTitle: "主题演讲",
          sessionDescription: "行业大咖分享创业经验"
        },
        {
          sessionTitle: "圆桌论坛",
          sessionDescription: "创业者互动讨论"
        },
        {
          sessionTitle: "自由交流",
          sessionDescription: "拓展人脉资源"
        }
      ]
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
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:230", "getActiveType result:", result);
      tagOptions.value = result.data.map((item) => ({
        value: item.value,
        // 使用后端返回的value
        text: item.label
        // 使用后端返回的label
      }));
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:235", "tagOptions updated:", tagOptions.value);
      if (result.error) {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:238", "请求失败:", result.error);
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
          const result = await utils_upload.uploadFile(file.path, {
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
            common_vendor.index.__f__("error", "at pages/active-publish/active-publish.vue:308", "上传失败:", result.error);
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
      common_vendor.index.$on("shopSelected", (shop) => {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:354", "接收到选择的店铺信息:", shop);
        form.value.associatedStoreId = shop.id;
        associatedStoreName.value = shop.storeName;
      });
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("shopSelected");
    });
    function saveDraft() {
      common_vendor.index.showToast({
        title: "活动已保存为草稿",
        icon: "none"
      });
      createActive();
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:370", "保存草稿:", form.value);
    }
    function publish() {
      if (!form.value.activityTitle) {
        common_vendor.index.showToast({
          title: "请输入活动标题",
          icon: "none"
        });
        return;
      }
      if (!form.value.tag) {
        common_vendor.index.showToast({
          title: "请选择活动类型",
          icon: "none"
        });
        return;
      }
      if (!form.value.coverImageUrl) {
        common_vendor.index.showToast({
          title: "请上传活动封面",
          icon: "none"
        });
        return;
      }
      if (!timeRange.value || timeRange.value.length !== 2) {
        common_vendor.index.showToast({
          title: "请选择活动时间",
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
          title: "请选择活动地点",
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
          title: "请输入活动介绍",
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
      if (!form.value.associatedStoreId) {
        common_vendor.index.showToast({
          title: "请选择合作店铺",
          icon: "none"
        });
        return;
      }
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
        // 顺序从1开始
      }));
      if (payload.activityFunds === 1) {
        delete payload.companyName;
        delete payload.companyLogo;
      } else {
        delete payload.registrationFee;
      }
      common_vendor.index.showToast({
        title: "活动发布成功！",
        icon: "success"
      });
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:539", "发布活动 - 最终Payload:", payload);
      createActive(payload);
    }
    const createActive = async (payload) => {
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:547", "payload", payload);
      const result = await utils_request.request("/app-api/member/activity/create", {
        method: "POST",
        // 请求方式
        data: payload
      });
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:554", "createActive result:", result);
      if (result.error) {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:557", "请求失败:", result.error);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => form.value.activityTitle = $event),
        b: common_vendor.p({
          placeholder: "请输入活动标题",
          modelValue: form.value.activityTitle
        }),
        c: common_vendor.p({
          label: "活动标题",
          required: true
        }),
        d: common_vendor.o(($event) => form.value.tag = $event),
        e: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择活动类型",
          modelValue: form.value.tag
        }),
        f: common_vendor.p({
          label: "活动类型",
          required: true
        }),
        g: form.value.coverImageUrl
      }, form.value.coverImageUrl ? {
        h: form.value.coverImageUrl
      } : {}, {
        i: common_vendor.o(uploadCover),
        j: common_vendor.p({
          label: "活动封面",
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
          label: "活动时间",
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
          label: "活动地点",
          required: true
        }),
        B: common_vendor.o(($event) => form.value.totalSlots = $event),
        C: common_vendor.p({
          type: "number",
          placeholder: "请输入活动总名额",
          modelValue: form.value.totalSlots
        }),
        D: common_vendor.p({
          label: "总名额",
          required: true
        }),
        E: common_vendor.o(($event) => form.value.limitSlots = $event),
        F: common_vendor.p({
          type: "number",
          placeholder: "请输入最低起聚名额",
          modelValue: form.value.limitSlots
        }),
        G: common_vendor.p({
          label: "最低起聚名额",
          required: true
        }),
        H: common_vendor.o(($event) => form.value.activityFunds = $event),
        I: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "button",
          modelValue: form.value.activityFunds
        }),
        J: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        K: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? {
        L: common_vendor.o(($event) => form.value.registrationFee = $event),
        M: common_vendor.p({
          type: "digit",
          placeholder: "请输入预报名费用",
          modelValue: form.value.registrationFee
        }),
        N: common_vendor.p({
          label: "预报名费用 (元)",
          required: true
        })
      } : {}, {
        O: form.value.activityFunds === 2
      }, form.value.activityFunds === 2 ? common_vendor.e({
        P: common_vendor.o(($event) => form.value.companyName = $event),
        Q: common_vendor.p({
          placeholder: "请输入赞助公司名称",
          modelValue: form.value.companyName
        }),
        R: common_vendor.p({
          label: "公司名称",
          required: true
        }),
        S: form.value.companyLogo
      }, form.value.companyLogo ? {
        T: form.value.companyLogo
      } : {}, {
        U: common_vendor.o(uploadSponsorLogo),
        V: common_vendor.p({
          label: "公司Logo",
          required: true
        })
      }) : {}, {
        W: common_vendor.o(($event) => form.value.activityDescription = $event),
        X: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入活动详细介绍",
          modelValue: form.value.activityDescription
        }),
        Y: common_vendor.p({
          label: "活动介绍",
          required: true
        }),
        Z: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: "d21abf49-24-" + i0,
            b: common_vendor.o(($event) => item.sessionTitle = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.sessionTitle
            }),
            d: "d21abf49-25-" + i0,
            e: common_vendor.o(($event) => item.sessionDescription = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.sessionDescription
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "d21abf49-26-" + i0,
            i: index
          };
        }),
        aa: common_vendor.p({
          type: "close"
        }),
        ab: common_vendor.p({
          type: "plusempty"
        }),
        ac: common_vendor.o(addAgenda),
        ad: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        ae: common_vendor.p({
          placeholder: "请输入组织单位名称",
          modelValue: form.value.organizerUnitName
        }),
        af: common_vendor.p({
          label: "组织单位",
          required: true
        }),
        ag: common_vendor.o(($event) => form.value.organizerContactPhone = $event),
        ah: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          modelValue: form.value.organizerContactPhone
        }),
        ai: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        aj: form.value.organizerPaymentQrCodeUrl
      }, form.value.organizerPaymentQrCodeUrl ? {
        ak: form.value.organizerPaymentQrCodeUrl
      } : {}, {
        al: common_vendor.o(uploadCode),
        am: common_vendor.p({
          label: "收款码上传"
        }),
        an: associatedStoreName.value
      }, associatedStoreName.value ? {
        ao: common_vendor.t(associatedStoreName.value)
      } : {}, {
        ap: common_vendor.o(goToSelectShop),
        aq: common_vendor.p({
          label: "合作店铺",
          required: true
        }),
        ar: common_vendor.o(saveDraft),
        as: common_vendor.o(publish),
        at: isPickerOpen.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d21abf49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-publish/active-publish.js.map
