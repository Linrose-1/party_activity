"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_datetime_picker2 + _easycom_uni_forms2 + _easycom_uni_icons2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_datetime_picker + _easycom_uni_forms + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    const form = common_vendor.ref({
      title: "互联网创业者交流会",
      cover: "",
      enrollTime: ["2025-06-15 14:00:00", "2025-06-15 17:00:00"],
      time: ["2025-06-15 14:00:00", "2025-06-15 17:00:00"],
      location: "上海市浦东新区张江高科技园区",
      capacity: 50,
      fee: 100,
      description: `本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。...`,
      agenda: [
        { title: "主题演讲", desc: "行业大咖分享创业经验" },
        { title: "圆桌论坛", desc: "创业者互动讨论" },
        { title: "自由交流", desc: "拓展人脉资源" }
      ],
      organizer: "张经理",
      organization: "创新科技活动策划部",
      phone: "021-68881234",
      qrcode: "",
      businessName: "创客空间咖啡厅",
      businessAddress: "张江高科技园区88号",
      businessPhone: "021-68881234",
      businessHours: "09:00-22:00 (每日营业)"
    });
    function uploadCover() {
      common_vendor.index.chooseImage({ count: 1, success: (res) => form.value.cover = res.tempFilePaths[0] });
    }
    function uploadCode() {
      common_vendor.index.chooseImage({ count: 1, success: (res) => form.value.qrcode = res.tempFilePaths[0] });
    }
    function addAgenda() {
      form.value.agenda.push({ title: "", desc: "" });
    }
    function removeAgenda(index) {
      form.value.agenda.splice(index, 1);
    }
    function saveDraft() {
      common_vendor.index.showToast({ title: "活动已保存为草稿", icon: "none" });
    }
    function publish() {
      common_vendor.index.showToast({ title: "活动发布成功！", icon: "success" });
    }
    const searchKeyword = common_vendor.ref("");
    common_vendor.ref([]);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => form.value.title = $event),
        b: common_vendor.p({
          placeholder: "请输入活动标题",
          modelValue: form.value.title
        }),
        c: common_vendor.p({
          label: "活动标题"
        }),
        d: form.value.cover
      }, form.value.cover ? {
        e: form.value.cover
      } : {}, {
        f: common_vendor.o(uploadCover),
        g: common_vendor.p({
          label: "活动封面"
        }),
        h: common_vendor.o(($event) => form.value.time = $event),
        i: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: form.value.time
        }),
        j: common_vendor.p({
          label: "活动时间"
        }),
        k: common_vendor.o(($event) => form.value.enrollTime = $event),
        l: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: form.value.enrollTime
        }),
        m: common_vendor.p({
          label: "报名时间"
        }),
        n: common_vendor.o(($event) => form.value.location = $event),
        o: common_vendor.p({
          placeholder: "请输入活动地点",
          modelValue: form.value.location
        }),
        p: common_vendor.p({
          label: "活动地点"
        }),
        q: common_vendor.o(($event) => form.value.capacity = $event),
        r: common_vendor.p({
          type: "number",
          modelValue: form.value.capacity
        }),
        s: common_vendor.p({
          label: "总名额"
        }),
        t: common_vendor.o(($event) => form.value.fee = $event),
        v: common_vendor.p({
          type: "number",
          modelValue: form.value.fee
        }),
        w: common_vendor.p({
          label: "报名费用 (元)"
        }),
        x: common_vendor.o(($event) => form.value.description = $event),
        y: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          modelValue: form.value.description
        }),
        z: common_vendor.p({
          label: "活动介绍"
        }),
        A: common_vendor.f(form.value.agenda, (item, index, i0) => {
          return {
            a: "d21abf49-16-" + i0,
            b: common_vendor.o(($event) => item.title = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.title
            }),
            d: "d21abf49-17-" + i0,
            e: common_vendor.o(($event) => item.desc = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.desc
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "d21abf49-18-" + i0,
            i: index
          };
        }),
        B: common_vendor.p({
          type: "close"
        }),
        C: common_vendor.p({
          type: "plusempty"
        }),
        D: common_vendor.o(addAgenda),
        E: common_vendor.o(($event) => form.value.organizer = $event),
        F: common_vendor.p({
          modelValue: form.value.organizer
        }),
        G: common_vendor.p({
          label: "组织者姓名"
        }),
        H: common_vendor.o(($event) => form.value.organization = $event),
        I: common_vendor.p({
          modelValue: form.value.organization
        }),
        J: common_vendor.p({
          label: "组织单位"
        }),
        K: common_vendor.o(($event) => form.value.phone = $event),
        L: common_vendor.p({
          modelValue: form.value.phone
        }),
        M: common_vendor.p({
          label: "联系电话"
        }),
        N: form.value.qrcode
      }, form.value.qrcode ? {
        O: form.value.qrcode
      } : {}, {
        P: common_vendor.o(uploadCode),
        Q: common_vendor.p({
          label: "收款码上传"
        }),
        R: common_vendor.o(_ctx.filterShops),
        S: common_vendor.o(($event) => searchKeyword.value = $event),
        T: common_vendor.p({
          placeholder: "搜索店铺名称",
          modelValue: searchKeyword.value
        }),
        U: form.value.businessName
      }, form.value.businessName ? {
        V: common_vendor.t(form.value.businessName)
      } : {}, {
        W: common_vendor.o(saveDraft),
        X: common_vendor.o(publish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d21abf49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-publish/active-publish.js.map
