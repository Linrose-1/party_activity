"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_segmented_control2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_select2 + _easycom_uni_data_picker2 + _easycom_uni_icons2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_select + _easycom_uni_data_picker + _easycom_uni_icons + _easycom_uni_data_checkbox + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "my-edit",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabItems = ["普通资料", "数字标签"];
    const initialDataState = common_vendor.ref("");
    const watchAndSanitize = (target, key = null) => {
      common_vendor.watch(target, (newValue) => {
        if (Array.isArray(newValue)) {
          newValue.forEach((item, index) => {
            if (key && typeof item === "object") {
              if (item[key] && typeof item[key] === "string" && item[key].includes(",")) {
                target.value[index][key] = item[key].replace(/,/g, "");
              }
            } else if (typeof item === "string" && item.includes(",")) {
              target.value[index] = item.replace(/,/g, "");
            }
          });
        } else if (typeof newValue === "string" && newValue.includes(",")) {
          target.value = newValue.replace(/,/g, "");
        }
      }, {
        deep: true
      });
    };
    watchAndSanitize(professionsList);
    watchAndSanitize(schoolsList);
    watchAndSanitize(companyAndIndustryList, "name");
    watchAndSanitize(otherHobbyText);
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
      professionalTitle: "",
      industry: "",
      companyName: "",
      school: "",
      mobile: "",
      contactEmail: "",
      wechatQrCodeUrl: "",
      hobby: "",
      personalBio: "",
      idCard: "",
      cardName: "",
      era: null,
      // 出生年代
      signature: "",
      // 个性签名
      haveResources: "",
      // 我有资源
      needResources: ""
      // 我需资源
    });
    const areaTree = common_vendor.ref([]);
    const industryTree = common_vendor.ref([]);
    const professionOptions = common_vendor.ref([]);
    const hobbyOptions = common_vendor.ref([]);
    const eraOptions = [
      {
        value: "50/60",
        text: "50/60"
      },
      {
        value: "70/80",
        text: "70/80"
      },
      {
        value: "90/00",
        text: "90/00"
      },
      {
        value: "不问年代",
        text: "不问年代"
      }
    ];
    const selectedHobbies = common_vendor.ref([]);
    const otherHobbyText = common_vendor.ref("");
    const isOtherHobbySelected = common_vendor.computed(() => selectedHobbies.value.includes("其他"));
    const professionsList = common_vendor.ref([""]);
    const schoolsList = common_vendor.ref([""]);
    const companyAndIndustryList = common_vendor.ref([{
      name: "",
      industryName: "",
      positionTitle: ""
    }]);
    const genderOptions = [{
      value: 1,
      text: "男"
    }, {
      value: 2,
      text: "女"
    }];
    common_vendor.computed(() => {
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
      getDictData: (type) => utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        data: {
          type
        }
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
        getIndustryTreeData(),
        getProfessionData(),
        getHobbyData()
      ]);
      await fetchUserInfoAndPopulateForm();
      common_vendor.index.hideLoading();
    });
    common_vendor.onBackPress((options) => {
      if (options.from === "navigateBack") {
        return false;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "若有更改资料，请记得保存",
        confirmText: "确认退出",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
      return true;
    });
    const handleTabClick = (e) => {
      currentTab.value = e.currentIndex;
    };
    const getAreaTreeData = async () => {
      const {
        data,
        error
      } = await Api.getAreaTree();
      if (error) {
        common_vendor.index.__f__("error", "at packages/my-edit/my-edit.vue:418", "获取地区树失败:", error);
      } else {
        areaTree.value = data || [];
      }
    };
    const processIndustryTree = (tree) => {
      if (!Array.isArray(tree))
        return [];
      return tree.map((node) => {
        if (node.children && node.children.length === 1 && node.children[0].name === node.name) {
          return {
            ...node.children[0],
            children: null
          };
        } else if (node.children) {
          return {
            ...node,
            children: processIndustryTree(node.children)
          };
        }
        return node;
      });
    };
    const getIndustryTreeData = async () => {
      const {
        data,
        error
      } = await Api.getIndustryTree();
      if (error) {
        common_vendor.index.__f__("error", "at packages/my-edit/my-edit.vue:465", "获取行业树失败:", error);
      } else {
        industryTree.value = processIndustryTree(data || []);
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:469", "处理后的行业树:", industryTree.value);
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
        ["locationAddress", "birthplace", "nativePlace"].forEach((key) => {
          if (userInfo[key]) {
            const targetId = parseInt(userInfo[key], 10);
            const path = findPathById(areaTree.value, targetId);
            if (path)
              form.value[key] = path;
          }
        });
        if (userInfo.hobby) {
          const hobbies = userInfo.hobby.split(",");
          const predefinedHobbies = hobbies.filter((h) => hobbyOptions.value.some((opt) => opt.value === h));
          const otherHobbies = hobbies.filter((h) => !hobbyOptions.value.some((opt) => opt.value === h));
          selectedHobbies.value = [...predefinedHobbies];
          if (otherHobbies.length > 0) {
            selectedHobbies.value.push("其他");
            otherHobbyText.value = otherHobbies.join(",");
          }
        }
        if (userInfo.professionalTitle) {
          professionsList.value = userInfo.professionalTitle.split(",");
        } else {
          professionsList.value = [""];
        }
        if (userInfo.school) {
          schoolsList.value = userInfo.school.split(",");
        } else {
          schoolsList.value = [""];
        }
        if (userInfo.companyName || userInfo.industry || userInfo.positionTitle) {
          const companyNames = (userInfo.companyName || "").split(",");
          const industryNames = (userInfo.industry || "").split(",");
          const positionTitles = (userInfo.positionTitle || "").split(",");
          const maxLength = Math.max(companyNames.length, industryNames.length, positionTitles.length);
          const newList = [];
          for (let i = 0; i < maxLength; i++) {
            if (companyNames[i] || industryNames[i] || positionTitles[i]) {
              newList.push({
                name: companyNames[i] || "",
                industryName: industryNames[i] || "",
                positionTitle: positionTitles[i] || ""
              });
            }
          }
          companyAndIndustryList.value = newList.length > 0 ? newList : [{
            name: "",
            industryName: "",
            positionTitle: ""
          }];
        } else {
          companyAndIndustryList.value = [{
            name: "",
            industryName: "",
            positionTitle: ""
          }];
        }
        if (userInfo.birthday && typeof userInfo.birthday === "number") {
          const date = new Date(userInfo.birthday);
          form.value.birthday = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        }
        initialDataState.value = JSON.stringify({
          form: form.value,
          professionsList: professionsList.value,
          schoolsList: schoolsList.value,
          companyAndIndustryList: companyAndIndustryList.value,
          selectedHobbies: selectedHobbies.value,
          otherHobbyText: otherHobbyText.value
        });
      }
    };
    common_vendor.computed(() => {
      return form.value.cardName || "信息已隐藏";
    });
    common_vendor.computed(() => {
      return form.value.idCard || "信息已隐藏";
    });
    const getProfessionData = async () => {
      const {
        data,
        error
      } = await Api.getDictData("professional_list");
      if (!error && data) {
        professionOptions.value = data.map((item) => ({
          text: item.label,
          value: item.value
        }));
      }
    };
    const getHobbyData = async () => {
      const {
        data,
        error
      } = await Api.getDictData("hobby_list");
      if (!error && data) {
        hobbyOptions.value = data.map((item) => ({
          text: item.label,
          value: item.label
          // value 直接使用中文标签
        }));
        hobbyOptions.value.push({
          text: "其他",
          value: "其他"
        });
      }
    };
    const onHobbyChange = (e) => {
      if (!e.detail.value.includes("其他")) {
        otherHobbyText.value = "";
      }
    };
    const addCompany = () => {
      if (companyAndIndustryList.value.length < 3) {
        companyAndIndustryList.value.push({
          name: "",
          industryName: "",
          positionTitle: ""
        });
      }
    };
    const addProfession = () => {
      if (professionsList.value.length < 3)
        professionsList.value.push("");
    };
    const removeProfession = (index) => {
      professionsList.value.splice(index, 1);
    };
    const addSchool = () => {
      if (schoolsList.value.length < 6)
        schoolsList.value.push("");
    };
    const removeSchool = (index) => {
      schoolsList.value.splice(index, 1);
    };
    const removeCompany = (index) => {
      companyAndIndustryList.value.splice(index, 1);
    };
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
            fail: (err) => common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:715", "用户取消裁剪或裁剪失败:", err)
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
        ["locationAddress", "birthplace", "nativePlace"].forEach((key) => {
          if (Array.isArray(payload[key]) && payload[key].length > 0) {
            payload[key] = payload[key][payload[key].length - 1];
          }
        });
        let finalHobbies = selectedHobbies.value.filter((h) => h !== "其他");
        if (isOtherHobbySelected.value && otherHobbyText.value.trim()) {
          finalHobbies.push(otherHobbyText.value.trim());
        }
        payload.hobby = finalHobbies.join(",");
        payload.professionalTitle = professionsList.value.map((p) => p.trim()).filter((p) => p).join(",");
        payload.school = schoolsList.value.map((s) => s.trim()).filter((s) => s).join(",");
        payload.companyName = companyAndIndustryList.value.map((item) => (item.name || "").trim()).filter((name) => name).join(",");
        payload.industry = companyAndIndustryList.value.map((item) => (item.industryName || "").trim()).join(",");
        payload.positionTitle = companyAndIndustryList.value.map((item) => (item.positionTitle || "").trim()).filter((title) => title).join(",");
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
          initialDataState.value = JSON.stringify({
            form: form.value,
            professionsList: professionsList.value,
            schoolsList: schoolsList.value,
            companyAndIndustryList: companyAndIndustryList.value,
            selectedHobbies: selectedHobbies.value,
            otherHobbyText: otherHobbyText.value
          });
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:874", "表单验证失败：", err);
      });
    };
    const goToLabelEditPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-edit-label/my-edit-label"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleTabClick),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabItems,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: form.value.avatar
      }, form.value.avatar ? {
        d: form.value.avatar
      } : {}, {
        e: common_vendor.t(form.value.avatar ? "更换头像" : "上传头像"),
        f: common_vendor.o(chooseAvatar),
        g: common_vendor.p({
          label: "头像",
          name: "avatar"
        }),
        h: common_vendor.o(($event) => form.value.nickname = $event),
        i: common_vendor.p({
          placeholder: "请输入用户昵称",
          modelValue: form.value.nickname
        }),
        j: common_vendor.p({
          label: "用户昵称",
          name: "nickname"
        }),
        k: common_vendor.o(($event) => form.value.realName = $event),
        l: common_vendor.p({
          placeholder: "请输入真实姓名",
          modelValue: form.value.realName
        }),
        m: common_vendor.p({
          label: "真实姓名",
          name: "realName"
        }),
        n: common_vendor.o(($event) => form.value.sex = $event),
        o: common_vendor.p({
          localdata: genderOptions,
          placeholder: "请选择性别",
          modelValue: form.value.sex
        }),
        p: common_vendor.p({
          label: "性别",
          name: "sex"
        }),
        q: common_vendor.o(($event) => form.value.era = $event),
        r: common_vendor.p({
          localdata: eraOptions,
          placeholder: "请选择出生年代",
          modelValue: form.value.era
        }),
        s: common_vendor.p({
          label: "出生年代",
          name: "era"
        }),
        t: common_vendor.o(($event) => form.value.locationAddress = $event),
        v: common_vendor.p({
          placeholder: "请选择常住地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.locationAddress
        }),
        w: common_vendor.p({
          label: "常住地",
          name: "locationAddress"
        }),
        x: common_vendor.o(($event) => form.value.birthplace = $event),
        y: common_vendor.p({
          placeholder: "请选择出生地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.birthplace
        }),
        z: common_vendor.p({
          label: "出生地",
          name: "birthplace"
        }),
        A: common_vendor.o(($event) => form.value.nativePlace = $event),
        B: common_vendor.p({
          placeholder: "请选择籍贯",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.nativePlace
        }),
        C: common_vendor.p({
          label: "籍贯",
          name: "nativePlace"
        }),
        D: professionsList.value.length < 3
      }, professionsList.value.length < 3 ? {
        E: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#007bff"
        }),
        F: common_vendor.o(addProfession)
      } : {}, {
        G: common_vendor.f(professionsList.value, (profession, index, i0) => {
          return common_vendor.e({
            a: "2d637515-18-" + i0 + ",2d637515-1",
            b: common_vendor.o(($event) => professionsList.value[index] = $event, index),
            c: common_vendor.p({
              placeholder: "示例：XXX商会/会长，XXX协会/理事",
              modelValue: professionsList.value[index]
            })
          }, professionsList.value.length > 1 ? {
            d: common_vendor.o(($event) => removeProfession(index), index)
          } : {}, {
            e: index
          });
        }),
        H: professionsList.value.length > 1,
        I: companyAndIndustryList.value.length < 3
      }, companyAndIndustryList.value.length < 3 ? {
        J: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#007bff"
        }),
        K: common_vendor.o(addCompany)
      } : {}, {
        L: common_vendor.f(companyAndIndustryList.value, (company, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1)
          }, companyAndIndustryList.value.length > 1 ? {
            b: common_vendor.o(($event) => removeCompany(index), index)
          } : {}, {
            c: "2d637515-21-" + i0 + "," + ("2d637515-20-" + i0),
            d: common_vendor.o(($event) => company.industryName = $event, index),
            e: common_vendor.p({
              placeholder: "请选择所在行业",
              ["popup-title"]: "请选择行业",
              localdata: industryTree.value,
              map: {
                text: "name",
                value: "name"
              },
              modelValue: company.industryName
            }),
            f: "2d637515-20-" + i0 + ",2d637515-1",
            g: common_vendor.p({
              label: `行业`,
              name: `industry_${index}`
            }),
            h: "2d637515-23-" + i0 + "," + ("2d637515-22-" + i0),
            i: common_vendor.o(($event) => company.name = $event, index),
            j: common_vendor.p({
              placeholder: "请输入公司或机构名称",
              modelValue: company.name
            }),
            k: "2d637515-22-" + i0 + ",2d637515-1",
            l: common_vendor.p({
              label: `公司`,
              name: `company_${index}`
            }),
            m: "2d637515-25-" + i0 + "," + ("2d637515-24-" + i0),
            n: common_vendor.o(($event) => company.positionTitle = $event, index),
            o: common_vendor.p({
              placeholder: "请输入您的职务",
              modelValue: company.positionTitle
            }),
            p: "2d637515-24-" + i0 + ",2d637515-1",
            q: common_vendor.p({
              label: `职务`,
              name: `position_${index}`
            }),
            r: index
          });
        }),
        M: companyAndIndustryList.value.length > 1,
        N: schoolsList.value.length < 6
      }, schoolsList.value.length < 6 ? {
        O: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#007bff"
        }),
        P: common_vendor.o(addSchool)
      } : {}, {
        Q: common_vendor.f(schoolsList.value, (school, index, i0) => {
          return common_vendor.e({
            a: "2d637515-27-" + i0 + ",2d637515-1",
            b: common_vendor.o(($event) => schoolsList.value[index] = $event, index),
            c: common_vendor.p({
              placeholder: "可以多填,用以查同学会",
              modelValue: schoolsList.value[index]
            })
          }, schoolsList.value.length > 1 ? {
            d: common_vendor.o(($event) => removeSchool(index), index)
          } : {}, {
            e: index
          });
        }),
        R: schoolsList.value.length > 1,
        S: common_vendor.o(($event) => form.value.mobile = $event),
        T: common_vendor.p({
          disabled: true,
          modelValue: form.value.mobile
        }),
        U: common_vendor.p({
          label: "手机号码",
          name: "mobile"
        }),
        V: common_vendor.o(($event) => form.value.contactEmail = $event),
        W: common_vendor.p({
          placeholder: "请输入邮箱",
          modelValue: form.value.contactEmail
        }),
        X: common_vendor.p({
          label: "邮箱",
          name: "contactEmail"
        }),
        Y: form.value.wechatQrCodeUrl
      }, form.value.wechatQrCodeUrl ? {
        Z: form.value.wechatQrCodeUrl,
        aa: common_vendor.o(($event) => previewImage(form.value.wechatQrCodeUrl))
      } : {}, {
        ab: common_vendor.t(form.value.wechatQrCodeUrl ? "更换二维码" : "上传二维码"),
        ac: common_vendor.o(chooseWechatQr),
        ad: common_vendor.p({
          label: "微信二维码",
          name: "wechatQrCodeUrl"
        }),
        ae: common_vendor.o(onHobbyChange),
        af: common_vendor.o(($event) => selectedHobbies.value = $event),
        ag: common_vendor.p({
          localdata: hobbyOptions.value,
          multiple: true,
          modelValue: selectedHobbies.value
        }),
        ah: isOtherHobbySelected.value
      }, isOtherHobbySelected.value ? {
        ai: common_vendor.o(($event) => otherHobbyText.value = $event),
        aj: common_vendor.p({
          placeholder: "请输入您的其他爱好",
          modelValue: otherHobbyText.value
        })
      } : {}, {
        ak: common_vendor.p({
          label: "爱好",
          name: "hobby"
        }),
        al: common_vendor.o(($event) => form.value.signature = $event),
        am: common_vendor.p({
          placeholder: "设置一个独特的个性签名吧",
          modelValue: form.value.signature
        }),
        an: common_vendor.p({
          label: "个性签名",
          name: "signature"
        }),
        ao: common_vendor.o(($event) => form.value.personalBio = $event),
        ap: common_vendor.p({
          type: "textarea",
          placeholder: "介绍一下自己...",
          modelValue: form.value.personalBio
        }),
        aq: common_vendor.p({
          label: "个人简介",
          name: "personalBio"
        }),
        ar: common_vendor.o(($event) => form.value.haveResources = $event),
        as: common_vendor.p({
          type: "textarea",
          placeholder: "用来智能匹配商友资源",
          modelValue: form.value.haveResources
        }),
        at: common_vendor.p({
          label: "我有资源",
          name: "haveResources"
        }),
        av: common_vendor.o(($event) => form.value.needResources = $event),
        aw: common_vendor.p({
          type: "textarea",
          placeholder: "用来智能匹配商友资源",
          modelValue: form.value.needResources
        }),
        ax: common_vendor.p({
          label: "我需资源",
          name: "needResources"
        }),
        ay: common_vendor.sr(formRef, "2d637515-1", {
          "k": "formRef"
        }),
        az: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        aA: common_vendor.o(submitForm),
        aB: currentTab.value === 0,
        aC: common_vendor.p({
          type: "checkmarkempty",
          color: "#00C777"
        }),
        aD: common_vendor.p({
          type: "checkmarkempty",
          color: "#00C777"
        }),
        aE: common_vendor.p({
          type: "checkmarkempty",
          color: "#00C777"
        }),
        aF: common_vendor.p({
          type: "compose",
          color: "#fff",
          size: "20"
        }),
        aG: common_vendor.o(goToLabelEditPage),
        aH: currentTab.value === 1
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2d637515"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-edit/my-edit.js.map
