"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
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
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({
      avatar: "",
      realName: "",
      // name -> realName
      sex: "",
      // gender -> sex
      birth: "",
      // 该字段接口没有，暂时保留
      locationAddress: "",
      // location -> locationAddress
      professionalTitle: "",
      // job -> professionalTitle
      companyName: "",
      // company -> companyName
      mobile: "",
      // phone -> mobile
      wechatQrCodeUrl: "",
      // wechatQr -> wechatQrCodeUrl
      personalBio: "",
      // intro -> personalBio
      inviteCode: "",
      // 该字段接口没有，暂时保留
      latitude: "",
      // 地图选择后赋值
      longitude: ""
      // 地图选择后赋值
    });
    const rules = {
      avatar: {
        required: true,
        errorMessage: "请上传头像"
      },
      realName: {
        // name -> realName
        required: true,
        errorMessage: "请输入真实姓名"
      },
      sex: {
        // gender -> sex
        required: true,
        errorMessage: "请选择性别"
      },
      professionalTitle: {
        // job -> professionalTitle
        required: true,
        errorMessage: "请输入职业"
      },
      companyName: {
        // company -> companyName
        required: true,
        errorMessage: "请输入公司/机构名称"
      },
      mobile: [
        {
          // phone -> mobile
          required: true,
          errorMessage: "请输入手机号码"
        },
        {
          pattern: /^1[3-9]\d{9}$/,
          errorMessage: "请输入有效的手机号"
        }
      ]
    };
    const genderOptions = [
      {
        value: 1,
        // 'male' -> 1
        text: "男"
      },
      {
        value: 2,
        // 'female' -> 2
        text: "女"
      }
      // 你可以根据实际情况保留或删除“其他”
      // {
      // 	value: 0, // 'other' -> 0 (通常 0 代表未知)
      // 	text: '其他'
      // },
    ];
    function chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          form.value.avatar = res.tempFilePaths[0];
        }
      });
    }
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          form.value.locationAddress = res.address || res.name;
          form.value.latitude = res.latitude;
          form.value.longitude = res.longitude;
          common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:176", res);
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
    const phoneCodes = ["+86", "+852", "+853", "+886"];
    const codeIndex = common_vendor.ref(0);
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          form.value.wechatQrCodeUrl = res.tempFilePaths[0];
        }
      });
    }
    function submitForm() {
      formRef.value.validate().then(() => {
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:210", "准备提交的表单数据:", form.value);
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:212", "验证失败：", err);
      });
    }
    function onCodeChange(e) {
      codeIndex.value = e.detail.value;
    }
    const getUserInfo = async () => {
      try {
        const result = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:227", "getUserInfo result:", result);
        if (result && result.data) {
          const userInfo = result.data;
          form.value.avatar = userInfo.avatar;
          form.value.realName = userInfo.realName;
          form.value.sex = userInfo.sex;
          form.value.locationAddress = userInfo.locationAddress;
          form.value.professionalTitle = userInfo.professionalTitle;
          form.value.companyName = userInfo.companyName;
          form.value.mobile = userInfo.mobile;
          form.value.wechatQrCodeUrl = userInfo.wechatQrCodeUrl;
          form.value.personalBio = userInfo.personalBio;
          form.value.latitude = userInfo.latitude;
          form.value.longitude = userInfo.longitude;
        } else {
          common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:247", "未能获取到用户信息:", result ? result.msg : "无返回数据");
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:250", "请求失败:", error);
        common_vendor.index.showToast({
          title: "获取信息失败",
          icon: "error"
        });
      }
    };
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
        n: form.value.location
      }, form.value.location ? {
        o: common_vendor.t(form.value.location)
      } : {}, {
        p: common_vendor.o(openMapToChooseLocation),
        q: common_vendor.p({
          label: "所在地",
          name: "location"
        }),
        r: common_vendor.o(($event) => form.value.job = $event),
        s: common_vendor.p({
          placeholder: "请输入职业",
          modelValue: form.value.job
        }),
        t: common_vendor.p({
          label: "职业",
          name: "job",
          required: true
        }),
        v: common_vendor.o(($event) => form.value.company = $event),
        w: common_vendor.p({
          placeholder: "请输入公司或机构名称",
          modelValue: form.value.company
        }),
        x: common_vendor.p({
          label: "公司/机构",
          name: "company",
          required: true
        }),
        y: common_vendor.t(phoneCodes[codeIndex.value]),
        z: phoneCodes,
        A: codeIndex.value,
        B: common_vendor.o(onCodeChange),
        C: common_vendor.o(($event) => form.value.phone = $event),
        D: common_vendor.p({
          placeholder: "请输入手机号码",
          modelValue: form.value.phone
        }),
        E: common_vendor.p({
          label: "手机号码",
          name: "phone",
          required: true
        }),
        F: common_vendor.o(chooseImage),
        G: form.value.wechatQr
      }, form.value.wechatQr ? {
        H: form.value.wechatQr
      } : {}, {
        I: common_vendor.p({
          label: "微信二维码",
          name: "wechatQr"
        }),
        J: common_vendor.o(($event) => form.value.intro = $event),
        K: common_vendor.p({
          type: "textarea",
          placeholder: "介绍一下自己...",
          modelValue: form.value.intro
        }),
        L: common_vendor.p({
          label: "个人简介",
          name: "intro"
        }),
        M: common_vendor.o(($event) => form.value.inviteCode = $event),
        N: common_vendor.p({
          placeholder: "填写对方的邀请码（可选）",
          modelValue: form.value.inviteCode
        }),
        O: common_vendor.p({
          label: "邀请码",
          name: "inviteCode"
        }),
        P: common_vendor.sr(formRef, "13622257-1", {
          "k": "formRef"
        }),
        Q: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        R: common_vendor.o(submitForm)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13622257"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit/my-edit.js.map
