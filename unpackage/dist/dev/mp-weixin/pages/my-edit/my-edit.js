"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "my-edit",
  setup(__props) {
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({
      avatar: "",
      name: "",
      gender: "",
      birth: "",
      location: "",
      job: "",
      company: "",
      phone: "",
      wechatQr: "",
      intro: "",
      inviteCode: ""
    });
    const rules = {
      avatar: { required: true, errorMessage: "请上传头像" },
      name: { required: true, errorMessage: "请输入真实姓名" },
      gender: { required: true, errorMessage: "请选择性别" },
      job: { required: true, errorMessage: "请输入职业" },
      company: { required: true, errorMessage: "请输入公司/机构名称" },
      phone: [
        { required: true, errorMessage: "请输入手机号码" },
        { pattern: /^1[3-9]\d{9}$/, errorMessage: "请输入有效的手机号" }
      ]
    };
    function chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          form.value.avatar = res.tempFilePaths[0];
        }
      });
    }
    const genderOptions = [
      { value: "male", text: "男" },
      { value: "female", text: "女" },
      { value: "other", text: "其他" }
    ];
    const phoneCodes = ["+86", "+852", "+853", "+886"];
    const codeIndex = common_vendor.ref(0);
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          form.value.wechatQr = res.tempFilePaths[0];
        }
      });
    }
    function submitForm() {
      formRef.value.validate().then(() => {
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:131", "验证失败：", err);
      });
    }
    function onCodeChange(e) {
      codeIndex.value = e.detail.value;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(chooseAvatar),
        b: form.value.avatar
      }, form.value.avatar ? {
        c: form.value.avatar
      } : {}, {
        d: common_vendor.p({
          label: "头像",
          name: "avatar",
          required: true
        }),
        e: common_vendor.o(($event) => form.value.name = $event),
        f: common_vendor.p({
          placeholder: "请输入真实姓名",
          modelValue: form.value.name
        }),
        g: common_vendor.p({
          label: "真实姓名",
          name: "name",
          required: true
        }),
        h: common_vendor.o(($event) => form.value.gender = $event),
        i: common_vendor.p({
          localdata: genderOptions,
          modelValue: form.value.gender
        }),
        j: common_vendor.p({
          label: "性别",
          name: "gender",
          required: true
        }),
        k: common_vendor.o(($event) => form.value.birth = $event),
        l: common_vendor.p({
          type: "date",
          modelValue: form.value.birth
        }),
        m: common_vendor.p({
          label: "出生日期",
          name: "birth"
        }),
        n: common_vendor.o(($event) => form.value.location = $event),
        o: common_vendor.p({
          placeholder: "请输入所在地",
          modelValue: form.value.location
        }),
        p: common_vendor.p({
          label: "所在地",
          name: "location"
        }),
        q: common_vendor.o(($event) => form.value.job = $event),
        r: common_vendor.p({
          placeholder: "请输入职业",
          modelValue: form.value.job
        }),
        s: common_vendor.p({
          label: "职业",
          name: "job",
          required: true
        }),
        t: common_vendor.o(($event) => form.value.company = $event),
        v: common_vendor.p({
          placeholder: "请输入公司或机构名称",
          modelValue: form.value.company
        }),
        w: common_vendor.p({
          label: "公司/机构",
          name: "company",
          required: true
        }),
        x: common_vendor.t(phoneCodes[codeIndex.value]),
        y: phoneCodes,
        z: codeIndex.value,
        A: common_vendor.o(onCodeChange),
        B: common_vendor.o(($event) => form.value.phone = $event),
        C: common_vendor.p({
          placeholder: "请输入手机号码",
          modelValue: form.value.phone
        }),
        D: common_vendor.p({
          label: "手机号码",
          name: "phone",
          required: true
        }),
        E: common_vendor.o(chooseImage),
        F: form.value.wechatQr
      }, form.value.wechatQr ? {
        G: form.value.wechatQr
      } : {}, {
        H: common_vendor.p({
          label: "微信二维码",
          name: "wechatQr"
        }),
        I: common_vendor.o(($event) => form.value.intro = $event),
        J: common_vendor.p({
          type: "textarea",
          placeholder: "介绍一下自己...",
          modelValue: form.value.intro
        }),
        K: common_vendor.p({
          label: "个人简介",
          name: "intro"
        }),
        L: common_vendor.o(($event) => form.value.inviteCode = $event),
        M: common_vendor.p({
          placeholder: "填写对方的邀请码（可选）",
          modelValue: form.value.inviteCode
        }),
        N: common_vendor.p({
          label: "邀请码",
          name: "inviteCode"
        }),
        O: common_vendor.sr(formRef, "13622257-1", {
          "k": "formRef"
        }),
        P: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        Q: common_vendor.o(submitForm)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13622257"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit/my-edit.js.map
