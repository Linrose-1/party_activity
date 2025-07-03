"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
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
      nickname: "",
      avatar: "",
      realName: "",
      sex: null,
      birthday: "",
      locationAddress: "",
      professionalTitle: "",
      companyName: "",
      mobile: "",
      wechatQrCodeUrl: "",
      personalBio: "",
      latitude: null,
      longitude: null
    });
    const rules = {
      nickname: { rules: [{ required: true, errorMessage: "请输入用户昵称" }] },
      avatar: { rules: [{ required: true, errorMessage: "请上传头像" }] },
      sex: { rules: [{ type: "number", required: true, errorMessage: "请选择性别" }] }
    };
    const genderOptions = [{ value: 1, text: "男" }, { value: 2, text: "女" }];
    const today = common_vendor.computed(() => {
      const date = /* @__PURE__ */ new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    });
    const handleImageUpload = (field, directory) => {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: async (res) => {
          const file = res.tempFiles[0];
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            return common_vendor.index.showToast({ title: "文件大小不能超过5MB", icon: "none" });
          }
          common_vendor.index.showLoading({ title: "上传中...", mask: true });
          const result = await utils_upload.uploadFile(file.path, { directory });
          common_vendor.index.hideLoading();
          if (result.data) {
            form.value[field] = result.data;
            common_vendor.index.showToast({ title: "上传成功", icon: "none" });
          } else {
            common_vendor.index.__f__("error", "at pages/my-edit/my-edit.vue:162", "上传失败:", result.error);
            common_vendor.index.showToast({ title: result.error || "上传失败", icon: "none" });
          }
        }
      });
    };
    function chooseAvatar() {
      handleImageUpload("avatar", "avatar");
    }
    function chooseWechatQr() {
      handleImageUpload("wechatQrCodeUrl", "qrcode");
    }
    const getUserInfo = async () => {
      try {
        const result = await utils_request.request("/app-api/member/user/get", { method: "GET" });
        if (result.data) {
          const userInfo = result.data;
          Object.keys(form.value).forEach((key) => {
            if (userInfo[key] !== void 0 && userInfo[key] !== null) {
              form.value[key] = userInfo[key];
            }
          });
        } else {
          common_vendor.index.showToast({ title: result.msg || "获取用户信息失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "网络错误，请稍后再试", icon: "error" });
      }
    };
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        latitude: form.value.latitude || void 0,
        longitude: form.value.longitude || void 0,
        success: (res) => {
          form.value.locationAddress = res.address || res.name;
          form.value.latitude = res.latitude;
          form.value.longitude = res.longitude;
        }
      });
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({ urls: [url] });
    };
    const submitForm = () => {
      formRef.value.validate().then(async () => {
        common_vendor.index.showLoading({ title: "正在保存..." });
        const result = await utils_request.request("/app-api/member/user/update", {
          method: "PUT",
          data: form.value
          // 直接提交包含图片 URL 的表单数据
        });
        common_vendor.index.hideLoading();
        if (result.data !== null) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({ title: result.error || "保存失败", icon: "none" });
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:237", "表单验证失败：", err);
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.value.avatar
      }, form.value.avatar ? {
        b: form.value.avatar
      } : {}, {
        c: common_vendor.t(form.value.avatar ? "更换头像" : "上传头像"),
        d: common_vendor.o(chooseAvatar),
        e: common_vendor.p({
          label: "头像",
          name: "avatar"
        }),
        f: common_vendor.o(($event) => form.value.nickname = $event),
        g: common_vendor.p({
          placeholder: "请输入用户昵称",
          modelValue: form.value.nickname
        }),
        h: common_vendor.p({
          label: "用户昵称",
          name: "nickname"
        }),
        i: common_vendor.o(($event) => form.value.realName = $event),
        j: common_vendor.p({
          placeholder: "请输入真实姓名",
          modelValue: form.value.realName
        }),
        k: common_vendor.p({
          label: "真实姓名",
          name: "realName"
        }),
        l: common_vendor.o(($event) => form.value.sex = $event),
        m: common_vendor.p({
          localdata: genderOptions,
          placeholder: "请选择性别",
          modelValue: form.value.sex
        }),
        n: common_vendor.p({
          label: "性别",
          name: "sex"
        }),
        o: common_vendor.o(($event) => form.value.birthday = $event),
        p: common_vendor.p({
          type: "date",
          end: today.value,
          ["return-type"]: "string",
          modelValue: form.value.birthday
        }),
        q: common_vendor.p({
          label: "出生日期",
          name: "birthday"
        }),
        r: form.value.locationAddress
      }, form.value.locationAddress ? {
        s: common_vendor.t(form.value.locationAddress)
      } : {}, {
        t: common_vendor.o(openMapToChooseLocation),
        v: common_vendor.p({
          label: "所在地",
          name: "locationAddress"
        }),
        w: common_vendor.o(($event) => form.value.professionalTitle = $event),
        x: common_vendor.p({
          placeholder: "请输入职业",
          modelValue: form.value.professionalTitle
        }),
        y: common_vendor.p({
          label: "职业",
          name: "professionalTitle"
        }),
        z: common_vendor.o(($event) => form.value.companyName = $event),
        A: common_vendor.p({
          placeholder: "请输入公司或机构名称",
          modelValue: form.value.companyName
        }),
        B: common_vendor.p({
          label: "公司/机构",
          name: "companyName"
        }),
        C: common_vendor.o(($event) => form.value.mobile = $event),
        D: common_vendor.p({
          disabled: true,
          modelValue: form.value.mobile
        }),
        E: common_vendor.p({
          label: "手机号码",
          name: "mobile"
        }),
        F: form.value.wechatQrCodeUrl
      }, form.value.wechatQrCodeUrl ? {
        G: form.value.wechatQrCodeUrl,
        H: common_vendor.o(($event) => previewImage(form.value.wechatQrCodeUrl))
      } : {}, {
        I: common_vendor.t(form.value.wechatQrCodeUrl ? "更换二维码" : "上传二维码"),
        J: common_vendor.o(chooseWechatQr),
        K: common_vendor.p({
          label: "微信二维码",
          name: "wechatQrCodeUrl"
        }),
        L: common_vendor.o(($event) => form.value.personalBio = $event),
        M: common_vendor.p({
          type: "textarea",
          placeholder: "介绍一下自己...",
          modelValue: form.value.personalBio
        }),
        N: common_vendor.p({
          label: "个人简介",
          name: "personalBio"
        }),
        O: common_vendor.sr(formRef, "13622257-0", {
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
