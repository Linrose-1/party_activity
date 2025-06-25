"use strict";
const common_vendor = require("../../common/vendor.js");
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
    const form = common_vendor.ref({
      title: "互联网创业者交流会",
      activityType: "交流会",
      // 新增：活动类型字段，并设置默认值
      cover: "",
      enrollTime: ["2025-06-15 14:00:00", "2025-06-15 17:00:00"],
      time: ["2025-06-15 14:00:00", "2025-06-15 17:00:00"],
      location: "上海市浦东新区张江高科技园区",
      capacity: 50,
      enrollmentType: "aa",
      aaFee: 100,
      sponsorLogo: "",
      sponsorName: "",
      description: `本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。...`,
      agenda: [
        {
          title: "主题演讲",
          desc: "行业大咖分享创业经验"
        },
        {
          title: "圆桌论坛",
          desc: "创业者互动讨论"
        },
        {
          title: "自由交流",
          desc: "拓展人脉资源"
        }
      ],
      organizer: "张经理",
      organization: "创新科技活动策划部",
      phone: "021-68881234",
      qrcode: "",
      // 商圈信息现在默认为空，等待用户选择
      businessName: "",
      businessAddress: "",
      businessPhone: "",
      businessHours: ""
    });
    const activityTypeOptions = common_vendor.ref([
      {
        value: "交流会",
        text: "交流会"
      },
      {
        value: "沙龙",
        text: "沙龙"
      },
      {
        value: "峰会",
        text: "峰会"
      },
      {
        value: "分享会",
        text: "分享会"
      },
      {
        value: "创业猎伙",
        text: "创业猎伙"
      },
      {
        value: "其他",
        text: "其他"
      }
    ]);
    const enrollmentOptions = common_vendor.ref([
      {
        text: "AA",
        value: "aa"
      },
      {
        text: "赞助",
        value: "sponsor"
      }
    ]);
    const selectedLocationInfo = common_vendor.ref(null);
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:235", "选择位置成功:", res);
          selectedLocationInfo.value = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
          form.value.location = res.address || res.name;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:246", "选择位置失败:", err);
          if (err.errMsg.includes("cancel"))
            ;
          else {
            common_vendor.index.showToast({
              title: "选择位置失败",
              icon: "none"
            });
          }
        }
      });
    };
    function uploadCover() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => form.value.cover = res.tempFilePaths[0]
      });
    }
    function uploadCode() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => form.value.qrcode = res.tempFilePaths[0]
      });
    }
    function uploadSponsorLogo() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => form.value.sponsorLogo = res.tempFilePaths[0]
      });
    }
    function addAgenda() {
      form.value.agenda.push({
        title: "",
        desc: ""
      });
    }
    function removeAgenda(index) {
      form.value.agenda.splice(index, 1);
    }
    function saveDraft() {
      common_vendor.index.showToast({
        title: "活动已保存为草稿",
        icon: "none"
      });
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:302", "保存草稿:", form.value);
    }
    function publish() {
      if (!form.value.title) {
        common_vendor.index.showToast({
          title: "请输入活动标题",
          icon: "none"
        });
        return;
      }
      if (!form.value.activityType) {
        common_vendor.index.showToast({
          title: "请选择活动类型",
          icon: "none"
        });
        return;
      }
      if (!form.value.cover) {
        common_vendor.index.showToast({
          title: "请上传活动封面",
          icon: "none"
        });
        return;
      }
      if (!form.value.time || form.value.time.length !== 2) {
        common_vendor.index.showToast({
          title: "请选择活动时间",
          icon: "none"
        });
        return;
      }
      if (!form.value.enrollTime || form.value.enrollTime.length !== 2) {
        common_vendor.index.showToast({
          title: "请选择报名时间",
          icon: "none"
        });
        return;
      }
      if (!form.value.location) {
        common_vendor.index.showToast({
          title: "请选择活动地点",
          icon: "none"
        });
        return;
      }
      if (!form.value.capacity || form.value.capacity <= 0) {
        common_vendor.index.showToast({
          title: "请输入正确的总名额",
          icon: "none"
        });
        return;
      }
      if (form.value.enrollmentType === "aa") {
        if (form.value.aaFee === null || form.value.aaFee < 0) {
          common_vendor.index.showToast({
            title: "请输入正确的预报名费用",
            icon: "none"
          });
          return;
        }
      } else if (form.value.enrollmentType === "sponsor") {
        if (!form.value.sponsorName) {
          common_vendor.index.showToast({
            title: "请输入公司名称",
            icon: "none"
          });
          return;
        }
        if (!form.value.sponsorLogo) {
          common_vendor.index.showToast({
            title: "请上传公司Logo",
            icon: "none"
          });
          return;
        }
      }
      if (!form.value.description) {
        common_vendor.index.showToast({
          title: "请输入活动介绍",
          icon: "none"
        });
        return;
      }
      if (!form.value.organizer) {
        common_vendor.index.showToast({
          title: "请输入组织者姓名",
          icon: "none"
        });
        return;
      }
      if (!form.value.organization) {
        common_vendor.index.showToast({
          title: "请输入组织单位",
          icon: "none"
        });
        return;
      }
      if (!form.value.phone) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return;
      }
      if (!form.value.businessName) {
        common_vendor.index.showToast({
          title: "请选择合作店铺",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "活动发布成功！",
        icon: "success"
      });
      common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:425", "发布活动:", form.value);
    }
    common_vendor.ref("");
    common_vendor.ref([]);
    function goToSelectShop() {
      common_vendor.index.navigateTo({
        url: "/pages/shop-list/shop-list"
        // 这是我们下一步要创建的页面路径
      });
    }
    common_vendor.onLoad(() => {
      common_vendor.index.$on("shopSelected", (shop) => {
        common_vendor.index.__f__("log", "at pages/active-publish/active-publish.vue:443", "接收到选择的店铺信息:", shop);
        form.value.businessName = shop.storeName;
        form.value.businessAddress = shop.fullAddress;
      });
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("shopSelected");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => form.value.title = $event),
        b: common_vendor.p({
          placeholder: "请输入活动标题",
          modelValue: form.value.title
        }),
        c: common_vendor.p({
          label: "活动标题",
          required: true
        }),
        d: common_vendor.o(($event) => form.value.activityType = $event),
        e: common_vendor.p({
          localdata: activityTypeOptions.value,
          placeholder: "请选择活动类型",
          modelValue: form.value.activityType
        }),
        f: common_vendor.p({
          label: "活动类型",
          required: true
        }),
        g: form.value.cover
      }, form.value.cover ? {
        h: form.value.cover
      } : {}, {
        i: common_vendor.o(uploadCover),
        j: common_vendor.p({
          label: "活动封面",
          required: true
        }),
        k: common_vendor.o(($event) => form.value.time = $event),
        l: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: form.value.time
        }),
        m: common_vendor.p({
          label: "活动时间",
          required: true
        }),
        n: common_vendor.o(($event) => form.value.enrollTime = $event),
        o: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: form.value.enrollTime
        }),
        p: common_vendor.p({
          label: "报名时间",
          required: true
        }),
        q: selectedLocationInfo.value
      }, selectedLocationInfo.value ? {
        r: common_vendor.t(selectedLocationInfo.value.address || selectedLocationInfo.value.name)
      } : {}, {
        s: common_vendor.o(openMapToChooseLocation),
        t: common_vendor.p({
          label: "活动地点",
          required: true
        }),
        v: common_vendor.o(($event) => form.value.capacity = $event),
        w: common_vendor.p({
          type: "number",
          placeholder: "请输入活动总名额",
          modelValue: form.value.capacity
        }),
        x: common_vendor.p({
          label: "总名额",
          required: true
        }),
        y: common_vendor.o(($event) => form.value.enrollmentType = $event),
        z: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "button",
          modelValue: form.value.enrollmentType
        }),
        A: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        B: form.value.enrollmentType === "aa"
      }, form.value.enrollmentType === "aa" ? {
        C: common_vendor.o(($event) => form.value.aaFee = $event),
        D: common_vendor.p({
          type: "digit",
          placeholder: "请输入预报名费用",
          modelValue: form.value.aaFee
        }),
        E: common_vendor.p({
          label: "预报名费用 (元)",
          required: true
        })
      } : {}, {
        F: form.value.enrollmentType === "sponsor"
      }, form.value.enrollmentType === "sponsor" ? common_vendor.e({
        G: common_vendor.o(($event) => form.value.sponsorName = $event),
        H: common_vendor.p({
          placeholder: "请输入赞助公司名称",
          modelValue: form.value.sponsorName
        }),
        I: common_vendor.p({
          label: "公司名称",
          required: true
        }),
        J: form.value.sponsorLogo
      }, form.value.sponsorLogo ? {
        K: form.value.sponsorLogo
      } : {}, {
        L: common_vendor.o(uploadSponsorLogo),
        M: common_vendor.p({
          label: "公司Logo",
          required: true
        })
      }) : {}, {
        N: common_vendor.o(($event) => form.value.description = $event),
        O: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入活动详细介绍",
          modelValue: form.value.description
        }),
        P: common_vendor.p({
          label: "活动介绍",
          required: true
        }),
        Q: common_vendor.f(form.value.agenda, (item, index, i0) => {
          return {
            a: "d21abf49-22-" + i0,
            b: common_vendor.o(($event) => item.title = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.title
            }),
            d: "d21abf49-23-" + i0,
            e: common_vendor.o(($event) => item.desc = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.desc
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "d21abf49-24-" + i0,
            i: index
          };
        }),
        R: common_vendor.p({
          type: "close"
        }),
        S: common_vendor.p({
          type: "plusempty"
        }),
        T: common_vendor.o(addAgenda),
        U: common_vendor.o(($event) => form.value.organizer = $event),
        V: common_vendor.p({
          placeholder: "请输入组织者姓名",
          modelValue: form.value.organizer
        }),
        W: common_vendor.p({
          label: "组织者姓名",
          required: true
        }),
        X: common_vendor.o(($event) => form.value.organization = $event),
        Y: common_vendor.p({
          placeholder: "请输入组织单位名称",
          modelValue: form.value.organization
        }),
        Z: common_vendor.p({
          label: "组织单位",
          required: true
        }),
        aa: common_vendor.o(($event) => form.value.phone = $event),
        ab: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          modelValue: form.value.phone
        }),
        ac: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        ad: form.value.qrcode
      }, form.value.qrcode ? {
        ae: form.value.qrcode
      } : {}, {
        af: common_vendor.o(uploadCode),
        ag: common_vendor.p({
          label: "收款码上传"
        }),
        ah: form.value.businessName
      }, form.value.businessName ? {
        ai: common_vendor.t(form.value.businessName)
      } : {}, {
        aj: common_vendor.o(goToSelectShop),
        ak: common_vendor.p({
          label: "合作店铺",
          required: true
        }),
        al: common_vendor.o(saveDraft),
        am: common_vendor.o(publish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d21abf49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-publish/active-publish.js.map
