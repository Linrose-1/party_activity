"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_data_picker + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "my-edit",
  setup(__props) {
    const AreaApi = {
      getAreaTree: () => utils_request.request("/app-api/system/area/tree", { method: "GET" })
    };
    const IndustryApi = {
      getIndustryTree: () => utils_request.request("/app-api/member/national-industry/tree", { method: "POST" })
    };
    common_vendor.onMounted(async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      await Promise.all([
        getUserInfo(),
        getAreaTreeData(),
        getIndustryTreeData()
        // 新增
      ]);
      common_vendor.index.hideLoading();
    });
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({
      nickname: "",
      avatar: "",
      realName: "",
      sex: null,
      birthday: "",
      locationAddress: null,
      // 【修正】存储常住地ID，初始为null
      residence: null,
      // 【修正】存储出生地ID，初始为null
      nativePlace: "",
      professionalTitle: "",
      industry: null,
      // 【核心修改】新增行业ID字段
      companyName: "",
      school: "",
      mobile: "",
      contactEmail: "",
      wechatQrCodeUrl: "",
      hobby: "",
      personalBio: ""
    });
    const industryTree = common_vendor.ref([]);
    const areaTree = common_vendor.ref([]);
    const rules = {
      // 校验规则无变化
      nickname: { rules: [{ required: true, errorMessage: "请输入用户昵称" }] },
      avatar: { rules: [{ required: true, errorMessage: "请上传头像" }] },
      sex: { rules: [{ type: "number", required: true, errorMessage: "请选择性别" }] }
    };
    const genderOptions = [{ value: 1, text: "男" }, { value: 2, text: "女" }];
    const today = common_vendor.computed(() => {
      const date = /* @__PURE__ */ new Date();
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    });
    const getAreaTreeData = async () => {
      const { data, error } = await AreaApi.getAreaTree();
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit/my-edit.vue:193", "获取地区树失败:", error);
        common_vendor.index.showToast({ title: "地区数据加载失败", icon: "none" });
      } else {
        areaTree.value = data;
      }
    };
    const getIndustryTreeData = async () => {
      const { data, error } = await IndustryApi.getIndustryTree();
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit/my-edit.vue:204", "获取行业树失败:", error);
        common_vendor.index.showToast({ title: "行业数据加载失败", icon: "none" });
      } else {
        industryTree.value = data;
      }
    };
    const getUserInfo = async () => {
      const { data: userInfo, error } = await utils_request.request("/app-api/member/user/get", { method: "GET" });
      if (userInfo) {
        Object.keys(form.value).forEach((key) => {
          if (userInfo[key] !== void 0 && userInfo[key] !== null) {
            form.value[key] = userInfo[key];
          }
        });
      } else {
        common_vendor.index.showToast({ title: error || "获取用户信息失败", icon: "none" });
      }
    };
    const handleImageUpload = (field, directory) => {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: async (res) => {
          const file = res.tempFiles[0];
          if (file.size > 5 * 1024 * 1024) {
            return common_vendor.index.showToast({ title: "文件大小不能超过5MB", icon: "none" });
          }
          common_vendor.index.showLoading({ title: "上传中...", mask: true });
          const result = await utils_upload.uploadFile(file, { directory });
          common_vendor.index.hideLoading();
          if (result.data) {
            form.value[field] = result.data;
          } else {
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
    const previewImage = (url) => {
      common_vendor.index.previewImage({ urls: [url] });
    };
    const submitForm = () => {
      formRef.value.validate().then(async () => {
        common_vendor.index.showLoading({ title: "正在保存..." });
        const result = await utils_request.request("/app-api/member/user/update", {
          method: "PUT",
          data: form.value
        });
        common_vendor.index.hideLoading();
        if (result.data !== null) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({ title: result.error || "保存失败", icon: "none" });
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:269", "表单验证失败：", err);
      });
    };
    const goToLabelEditPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-edit-label/my-edit-label"
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
        r: common_vendor.o(($event) => form.value.locationAddress = $event),
        s: common_vendor.p({
          placeholder: "请选择常住地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.locationAddress
        }),
        t: common_vendor.p({
          label: "常住地",
          name: "locationAddress"
        }),
        v: common_vendor.o(($event) => form.value.residence = $event),
        w: common_vendor.p({
          placeholder: "请选择出生地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.residence
        }),
        x: common_vendor.p({
          label: "出生地",
          name: "residence"
        }),
        y: common_vendor.o(($event) => form.value.nativePlace = $event),
        z: common_vendor.p({
          placeholder: "请输入籍贯",
          modelValue: form.value.nativePlace
        }),
        A: common_vendor.p({
          label: "籍贯",
          name: "nativePlace"
        }),
        B: common_vendor.o(($event) => form.value.professionalTitle = $event),
        C: common_vendor.p({
          placeholder: "请输入职业",
          modelValue: form.value.professionalTitle
        }),
        D: common_vendor.p({
          label: "职业",
          name: "professionalTitle"
        }),
        E: common_vendor.o(($event) => form.value.industry = $event),
        F: common_vendor.p({
          placeholder: "请选择所在行业",
          ["popup-title"]: "请选择行业",
          localdata: industryTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.industry
        }),
        G: common_vendor.p({
          label: "行业",
          name: "industryId"
        }),
        H: common_vendor.o(($event) => form.value.companyName = $event),
        I: common_vendor.p({
          placeholder: "请输入公司或机构名称",
          modelValue: form.value.companyName
        }),
        J: common_vendor.p({
          label: "公司/机构",
          name: "companyName"
        }),
        K: common_vendor.o(($event) => form.value.school = $event),
        L: common_vendor.p({
          placeholder: "请输入毕业学校",
          modelValue: form.value.school
        }),
        M: common_vendor.p({
          label: "毕业学校",
          name: "school"
        }),
        N: common_vendor.o(($event) => form.value.mobile = $event),
        O: common_vendor.p({
          disabled: true,
          modelValue: form.value.mobile
        }),
        P: common_vendor.p({
          label: "手机号码",
          name: "mobile"
        }),
        Q: common_vendor.o(($event) => form.value.contactEmail = $event),
        R: common_vendor.p({
          modelValue: form.value.contactEmail
        }),
        S: common_vendor.p({
          label: "邮箱",
          name: "contactEmail"
        }),
        T: form.value.wechatQrCodeUrl
      }, form.value.wechatQrCodeUrl ? {
        U: form.value.wechatQrCodeUrl,
        V: common_vendor.o(($event) => previewImage(form.value.wechatQrCodeUrl))
      } : {}, {
        W: common_vendor.t(form.value.wechatQrCodeUrl ? "更换二维码" : "上传二维码"),
        X: common_vendor.o(chooseWechatQr),
        Y: common_vendor.p({
          label: "微信二维码",
          name: "wechatQrCodeUrl"
        }),
        Z: common_vendor.o(($event) => form.value.hobby = $event),
        aa: common_vendor.p({
          placeholder: "请输入爱好",
          modelValue: form.value.hobby
        }),
        ab: common_vendor.p({
          label: "爱好",
          name: "hobby"
        }),
        ac: common_vendor.o(($event) => form.value.personalBio = $event),
        ad: common_vendor.p({
          type: "textarea",
          placeholder: "介绍一下自己...",
          modelValue: form.value.personalBio
        }),
        ae: common_vendor.p({
          label: "个人简介",
          name: "personalBio"
        }),
        af: common_vendor.sr(formRef, "13622257-0", {
          "k": "formRef"
        }),
        ag: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        ah: common_vendor.o(submitForm),
        ai: common_vendor.o(goToLabelEditPage)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13622257"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit/my-edit.js.map
