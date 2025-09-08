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
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_picker2 + _easycom_uni_forms2 + _easycom_uni_icons2)();
}
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_data_picker + _easycom_uni_forms + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "my-edit",
  setup(__props) {
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({
      nickname: "",
      avatar: "",
      realName: "",
      sex: null,
      birthday: "",
      locationAddress: null,
      // 将存储ID数组用于反显，或单个ID用于提交
      birthplace: null,
      // 将存储ID数组用于反显，或单个ID用于提交
      nativePlace: "",
      professionalTitle: "",
      industry: null,
      companyName: "",
      school: "",
      mobile: "",
      contactEmail: "",
      wechatQrCodeUrl: "",
      hobby: "",
      personalBio: "",
      idCard: "",
      cardName: ""
    });
    const areaTree = common_vendor.ref([]);
    const industryTree = common_vendor.ref([]);
    const genderOptions = [{
      value: 1,
      text: "男"
    }, {
      value: 2,
      text: "女"
    }];
    const today = common_vendor.computed(() => {
      const date = /* @__PURE__ */ new Date();
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    });
    const rules = {
      nickname: {
        rules: [{
          required: true,
          errorMessage: "请输入用户昵称"
        }]
      },
      avatar: {
        rules: [{
          required: true,
          errorMessage: "请上传头像"
        }]
      },
      sex: {
        rules: [{
          type: "number",
          required: true,
          errorMessage: "请选择性别"
        }]
      }
    };
    const Api = {
      getAreaTree: () => utils_request.request("/app-api/system/area/tree", {
        method: "GET"
      }),
      getIndustryTree: () => utils_request.request("/app-api/member/national-industry/tree", {
        method: "POST"
      }),
      getUserInfo: () => utils_request.request("/app-api/member/user/get", {
        method: "GET"
      }),
      updateUser: (data) => utils_request.request("/app-api/member/user/update", {
        method: "PUT",
        data
      })
    };
    common_vendor.onMounted(async () => {
      common_vendor.index.showLoading({
        title: "加载基础数据..."
      });
      await Promise.all([
        getAreaTreeData(),
        getIndustryTreeData()
      ]);
      await fetchUserInfoAndPopulateForm();
      common_vendor.index.hideLoading();
    });
    const getAreaTreeData = async () => {
      const {
        data,
        error
      } = await Api.getAreaTree();
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit/my-edit.vue:230", "获取地区树失败:", error);
      } else {
        areaTree.value = data || [];
      }
    };
    const getIndustryTreeData = async () => {
      const {
        data,
        error
      } = await Api.getIndustryTree();
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit/my-edit.vue:242", "获取行业树失败:", error);
      } else {
        industryTree.value = data || [];
      }
    };
    function findPathById(tree, targetId) {
      for (const node of tree) {
        if (node.id === targetId)
          return [node.id];
        if (node.children && node.children.length > 0) {
          const path = findPathById(node.children, targetId);
          if (path)
            return [node.id, ...path];
        }
      }
      return null;
    }
    const fetchUserInfoAndPopulateForm = async () => {
      const {
        data: userInfo,
        error
      } = await Api.getUserInfo();
      if (error) {
        return common_vendor.index.showToast({
          title: error || "获取用户信息失败",
          icon: "none"
        });
      }
      if (userInfo) {
        Object.keys(form.value).forEach((key) => {
          if (userInfo[key] !== void 0 && userInfo[key] !== null) {
            form.value[key] = userInfo[key];
          }
        });
        if (userInfo.locationAddress) {
          const targetId = parseInt(userInfo.locationAddress, 10);
          const path = findPathById(areaTree.value, targetId);
          if (path)
            form.value.locationAddress = path;
        }
        if (userInfo.birthplace) {
          const targetId = parseInt(userInfo.birthplace, 10);
          const path = findPathById(areaTree.value, targetId);
          if (path)
            form.value.birthplace = path;
        }
        if (userInfo.birthday && typeof userInfo.birthday === "number") {
          const date = new Date(userInfo.birthday);
          form.value.birthday = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        }
      }
    };
    const maskedName = common_vendor.computed(() => {
      return form.value.cardName || "信息已隐藏";
    });
    const maskedIdCard = common_vendor.computed(() => {
      return form.value.idCard || "信息已隐藏";
    });
    const chooseAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.wx$1.cropImage({
            src: tempFilePath,
            cropScale: "1:1",
            success: (cropRes) => uploadAvatar(cropRes.tempFilePath),
            fail: (err) => common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:330", "用户取消裁剪或裁剪失败:", err)
          });
        }
      });
    };
    const uploadAvatar = async (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中...",
        mask: true
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
        directory: "avatar"
      });
      common_vendor.index.hideLoading();
      if (result.data) {
        form.value.avatar = result.data;
        common_vendor.index.showToast({
          title: "头像更新成功",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: result.error || "上传失败",
          icon: "none"
        });
      }
    };
    function chooseWechatQr() {
      handleImageUpload("wechatQrCodeUrl", "qrcode");
    }
    const handleImageUpload = (field, directory) => {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: async (res) => {
          const file = res.tempFiles[0];
          if (file.size > 5 * 1024 * 1024) {
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
          } else {
            common_vendor.index.showToast({
              title: result.error || "上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        urls: [url]
      });
    };
    const submitForm = () => {
      formRef.value.validate().then(async () => {
        common_vendor.index.showLoading({
          title: "正在保存..."
        });
        const payload = {
          ...form.value
        };
        if (Array.isArray(payload.locationAddress) && payload.locationAddress.length > 0) {
          payload.locationAddress = payload.locationAddress[payload.locationAddress.length - 1];
        }
        if (Array.isArray(payload.birthplace) && payload.birthplace.length > 0) {
          payload.birthplace = payload.birthplace[payload.birthplace.length - 1];
        }
        if (payload.birthday && typeof payload.birthday === "string") {
          const dateStr = payload.birthday.replace(/-/g, "/");
          payload.birthday = new Date(dateStr).getTime();
        }
        const {
          error
        } = await Api.updateUser(payload);
        common_vendor.index.hideLoading();
        if (error) {
          common_vendor.index.showToast({
            title: error || "保存失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/my-edit/my-edit.vue:451", "表单验证失败：", err);
      });
    };
    const goToLabelEditPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-edit-label/my-edit-label"
      });
    };
    const goToAuthPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-auth/my-auth"
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
        v: common_vendor.o(($event) => form.value.birthplace = $event),
        w: common_vendor.p({
          placeholder: "请选择出生地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.birthplace
        }),
        x: common_vendor.p({
          label: "出生地",
          name: "birthplace"
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
          placeholder: "请输入邮箱",
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
        ai: common_vendor.o(goToLabelEditPage),
        aj: form.value.idCard
      }, form.value.idCard ? {
        ak: common_vendor.t(maskedName.value),
        al: common_vendor.t(maskedIdCard.value),
        am: common_vendor.p({
          type: "checkbox-filled",
          color: "#00C777",
          size: "18"
        })
      } : {
        an: common_vendor.o(goToAuthPage)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13622257"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit/my-edit.js.map
