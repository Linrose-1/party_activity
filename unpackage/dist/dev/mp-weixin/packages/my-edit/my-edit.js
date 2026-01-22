"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_select2 + _easycom_uni_data_picker2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_select + _easycom_uni_data_picker + _easycom_uni_data_checkbox + _easycom_uni_forms + UserScoreBoard)();
}
const UserScoreBoard = () => "../../components/UserScoreBoard.js";
const DRAFT_KEY = "user_profile_draft_v3";
const _sfc_main = {
  __name: "my-edit",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabItems = ["基本信息", "数字标签"];
    common_vendor.ref("");
    const userId = common_vendor.ref(common_vendor.index.getStorageSync("userId"));
    const isDataLoaded = common_vendor.ref(false);
    let draftTimer = null;
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
      needResources: "",
      // 我需资源
      enterpriseIdCert: 0
    });
    const areaTree = common_vendor.ref([]);
    const industryTree = common_vendor.ref([]);
    const professionOptions = common_vendor.ref([]);
    const hobbyOptions = common_vendor.ref([]);
    const radarDatasets = common_vendor.ref([]);
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
    const dataSnapshot = common_vendor.computed(() => {
      return {
        // 解构 form 的内容，确保深层变化能被感知
        ...form.value,
        // 包含动态数组
        professionsList: professionsList.value,
        schoolsList: schoolsList.value,
        companyAndIndustryList: companyAndIndustryList.value,
        selectedHobbies: selectedHobbies.value,
        otherHobbyText: otherHobbyText.value
      };
    });
    common_vendor.watch(dataSnapshot, (newVal) => {
      if (!isDataLoaded.value) {
        return;
      }
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        const draftData = {
          ...newVal,
          // 直接使用计算属性的值
          timestamp: Date.now()
        };
        try {
          common_vendor.index.setStorageSync(DRAFT_KEY, JSON.stringify(draftData));
          common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:448", "✅ [自动保存] 资料已写入缓存", (/* @__PURE__ */ new Date()).toLocaleTimeString());
        } catch (e) {
          common_vendor.index.__f__("error", "at packages/my-edit/my-edit.vue:450", "保存缓存失败", e);
        }
      }, 1e3);
    }, {
      deep: true
    });
    watchAndSanitize(professionsList);
    watchAndSanitize(schoolsList);
    watchAndSanitize(companyAndIndustryList, "name");
    watchAndSanitize(otherHobbyText);
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
      }),
      autoPostToCircle: () => utils_request.request("/app-api/member/business-opportunities/autoOpportunities", {
        method: "POST"
      }),
      getStatistics: (userId2, type) => utils_request.request("/app-api/member/user-scores/complexStatistics", {
        method: "GET",
        data: {
          userId: userId2,
          type
        }
      })
    };
    common_vendor.onMounted(async () => {
      common_vendor.index.showLoading({
        title: "加载基础数据..."
      });
      if (!userId.value) {
        userId.value = common_vendor.index.getStorageSync("userId");
      }
      await Promise.all([
        getAreaTreeData(),
        getIndustryTreeData(),
        getProfessionData(),
        getHobbyData(),
        fetchRadarStatistics()
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
    const onEnterpriseSwitchChange = (e) => {
      form.value.enterpriseIdCert = e.detail.value ? 1 : 0;
    };
    const fetchRadarStatistics = async () => {
      try {
        const [selfRes, friendRes, complexRes] = await Promise.all([
          Api.getStatistics(userId.value, 0),
          Api.getStatistics(userId.value, 1),
          Api.getStatistics(userId.value, 3)
        ]);
        const newDatasets = [];
        newDatasets.push({
          name: "自我评价",
          data: !selfRes.error && selfRes.data ? [
            selfRes.data.avg1 || 0,
            selfRes.data.avg2 || 0,
            selfRes.data.avg3 || 0,
            selfRes.data.avg4 || 0
          ] : [0, 0, 0, 0],
          color: "#FF7D00"
        });
        newDatasets.push({
          name: "商友评价",
          data: !friendRes.error && friendRes.data ? [
            friendRes.data.avg1 || 0,
            friendRes.data.avg2 || 0,
            friendRes.data.avg3 || 0,
            friendRes.data.avg4 || 0
          ] : [0, 0, 0, 0],
          color: "#4CAF50"
        });
        newDatasets.push({
          name: "综合评价",
          data: !complexRes.error && complexRes.data ? [
            complexRes.data.avg1 || 0,
            complexRes.data.avg2 || 0,
            complexRes.data.avg3 || 0,
            complexRes.data.avg4 || 0
          ] : [0, 0, 0, 0],
          color: "#1890FF"
        });
        radarDatasets.value = newDatasets;
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:609", "✅ 统计数据加载完毕，索引已固定：[0]自我, [1]商友, [2]综合");
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-edit/my-edit.vue:612", "获取统计数据异常", e);
      }
    };
    const getAreaTreeData = async () => {
      const {
        data,
        error
      } = await Api.getAreaTree();
      if (error) {
        common_vendor.index.__f__("error", "at packages/my-edit/my-edit.vue:679", "获取地区树失败:", error);
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
        common_vendor.index.__f__("error", "at packages/my-edit/my-edit.vue:726", "获取行业树失败:", error);
      } else {
        industryTree.value = processIndustryTree(data || []);
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:730", "处理后的行业树:", industryTree.value);
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
      }
      setTimeout(() => {
        isDataLoaded.value = true;
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:890", "✅ [系统状态] 数据初始化完成，开始监听修改...");
        checkAndRestoreDraft();
      }, 500);
    };
    const checkAndRestoreDraft = () => {
      const draftStr = common_vendor.index.getStorageSync(DRAFT_KEY);
      if (!draftStr) {
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:901", "📭 [缓存检查] 无本地草稿");
        return;
      }
      common_vendor.index.showModal({
        title: "恢复编辑",
        content: "检测到您有上次未保存的资料，是否恢复？",
        confirmText: "恢复",
        cancelText: "放弃",
        success: (res) => {
          if (res.confirm) {
            try {
              const draft = JSON.parse(draftStr);
              Object.assign(form.value, draft.form || draft);
              if (draft.professionsList)
                professionsList.value = draft.professionsList;
              if (draft.schoolsList)
                schoolsList.value = draft.schoolsList;
              if (draft.companyAndIndustryList)
                companyAndIndustryList.value = draft.companyAndIndustryList;
              if (draft.selectedHobbies)
                selectedHobbies.value = draft.selectedHobbies;
              if (draft.otherHobbyText)
                otherHobbyText.value = draft.otherHobbyText;
              common_vendor.index.showToast({
                title: "已恢复",
                icon: "none"
              });
            } catch (e) {
              common_vendor.index.removeStorageSync(DRAFT_KEY);
            }
          } else if (res.cancel) {
            common_vendor.index.removeStorageSync(DRAFT_KEY);
          }
        }
      });
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
            fail: (err) => common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:1032", "用户取消裁剪或裁剪失败:", err)
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
    const chooseWechatQr = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.wx$1.cropImage({
            src: tempFilePath,
            cropScale: "1:1",
            success: (cropRes) => {
              common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:1084", "二维码裁剪成功");
              uploadQrCode(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:1088", "取消裁剪或失败:", err);
            }
          });
        }
      });
    };
    const uploadQrCode = async (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中...",
        mask: true
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
        directory: "qrcode"
      });
      common_vendor.index.hideLoading();
      if (result.data) {
        form.value.wechatQrCodeUrl = result.data;
        common_vendor.index.showToast({
          title: "二维码上传成功",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: result.error || "上传失败",
          icon: "none"
        });
      }
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
          common_vendor.index.removeStorageSync(DRAFT_KEY);
          common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:1250", "🧹 [提交成功] 草稿已清除");
          common_vendor.index.showToast({
            title: "资料保存成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.showModal({
              title: "发布到商友圈",
              content: "您的资料已更新，发布名片问候语到商友圈的“商友连接”模块，让商友们更快看见您！",
              confirmText: "立即发布",
              cancelText: "暂不发布",
              success: (res) => {
                if (res.confirm) {
                  handleAutoPost();
                } else if (res.cancel) {
                  common_vendor.index.navigateBack();
                }
              }
            });
          }, 800);
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at packages/my-edit/my-edit.vue:1278", "表单验证失败：", err);
      });
    };
    const handleAutoPost = async () => {
      common_vendor.index.showLoading({
        title: "正在发布..."
      });
      const {
        data,
        error
      } = await Api.autoPostToCircle();
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showModal({
          title: "发布失败",
          content: typeof error === "object" ? error.msg : error,
          showCancel: false,
          // 只显示确认按钮
          confirmText: "知道了"
        });
      } else {
        common_vendor.index.showToast({
          title: "已成功发布到商友圈",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/home/home"
            // 【重要】首页是Tab页，必须用 switchTab
          });
        }, 1500);
      }
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
          ["style-type"]: "text",
          ["active-color"]: "#FF8700"
        }),
        c: form.value.avatar
      }, form.value.avatar ? {
        d: form.value.avatar
      } : {
        e: common_assets._imports_0$3
      }, {
        f: common_vendor.p({
          type: "camera-filled",
          size: "18",
          color: "#fff"
        }),
        g: common_vendor.t(form.value.avatar ? "点击更换头像" : "上传头像"),
        h: common_vendor.o(chooseAvatar),
        i: common_vendor.p({
          name: "avatar"
        }),
        j: common_vendor.o(($event) => form.value.nickname = $event),
        k: common_vendor.p({
          placeholder: "请输入用户昵称",
          modelValue: form.value.nickname
        }),
        l: common_vendor.p({
          label: "用户昵称",
          name: "nickname"
        }),
        m: common_vendor.o(($event) => form.value.realName = $event),
        n: common_vendor.p({
          placeholder: "请输入真实姓名",
          disabled: true,
          modelValue: form.value.realName
        }),
        o: common_vendor.p({
          label: "真实姓名",
          name: "realName"
        }),
        p: common_vendor.o(($event) => form.value.sex = $event),
        q: common_vendor.p({
          localdata: genderOptions,
          placeholder: "请选择性别",
          clear: false,
          modelValue: form.value.sex
        }),
        r: common_vendor.p({
          label: "性别",
          name: "sex"
        }),
        s: common_vendor.o(($event) => form.value.era = $event),
        t: common_vendor.p({
          localdata: eraOptions,
          placeholder: "请选择出生年代",
          clear: false,
          modelValue: form.value.era
        }),
        v: common_vendor.p({
          label: "出生年代",
          name: "era"
        }),
        w: common_vendor.o(($event) => form.value.mobile = $event),
        x: common_vendor.p({
          disabled: true,
          modelValue: form.value.mobile
        }),
        y: common_vendor.p({
          label: "手机号码",
          name: "mobile"
        }),
        z: common_vendor.o(($event) => form.value.contactEmail = $event),
        A: common_vendor.p({
          placeholder: "请输入邮箱",
          modelValue: form.value.contactEmail
        }),
        B: common_vendor.p({
          label: "常用邮箱",
          name: "contactEmail"
        }),
        C: form.value.wechatQrCodeUrl
      }, form.value.wechatQrCodeUrl ? {
        D: form.value.wechatQrCodeUrl,
        E: common_vendor.o(($event) => previewImage(form.value.wechatQrCodeUrl))
      } : {
        F: common_vendor.p({
          type: "scan",
          size: "32",
          color: "#ccc"
        })
      }, {
        G: common_vendor.p({
          type: "camera",
          size: "16",
          color: "#FF8700"
        }),
        H: common_vendor.t(form.value.wechatQrCodeUrl ? "点击更换" : "点击上传"),
        I: common_vendor.o(chooseWechatQr),
        J: common_vendor.p({
          label: "微信二维码",
          name: "wechatQrCodeUrl",
          ["label-position"]: "top"
        }),
        K: common_vendor.t(form.value.enterpriseIdCert === 1 ? "已开启" : "未开启"),
        L: form.value.enterpriseIdCert === 1,
        M: common_vendor.o(onEnterpriseSwitchChange),
        N: common_vendor.p({
          label: "企业号认证",
          name: "enterpriseIdCert"
        }),
        O: common_vendor.o(($event) => form.value.locationAddress = $event),
        P: common_vendor.p({
          placeholder: "请选择商务/办公地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.locationAddress
        }),
        Q: common_vendor.p({
          label: "商务/办公地",
          name: "locationAddress"
        }),
        R: common_vendor.o(($event) => form.value.nativePlace = $event),
        S: common_vendor.p({
          placeholder: "请选择籍贯/出生地",
          ["popup-title"]: "请选择省市区",
          localdata: areaTree.value,
          map: {
            text: "name",
            value: "id"
          },
          modelValue: form.value.nativePlace
        }),
        T: common_vendor.p({
          label: "籍贯/出生地",
          name: "nativePlace"
        }),
        U: professionsList.value.length < 3
      }, professionsList.value.length < 3 ? {
        V: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#FF8700"
        }),
        W: common_vendor.o(addProfession)
      } : {}, {
        X: common_vendor.f(professionsList.value, (profession, index, i0) => {
          return common_vendor.e({
            a: "2d637515-25-" + i0 + ",2d637515-1",
            b: common_vendor.o(($event) => professionsList.value[index] = $event, index),
            c: common_vendor.p({
              placeholder: "示例：XXX商会/会长",
              inputBorder: false,
              modelValue: professionsList.value[index]
            })
          }, professionsList.value.length > 1 ? {
            d: "2d637515-26-" + i0 + ",2d637515-1",
            e: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#999"
            }),
            f: common_vendor.o(($event) => removeProfession(index), index)
          } : {}, {
            g: index
          });
        }),
        Y: professionsList.value.length > 1,
        Z: companyAndIndustryList.value.length < 3
      }, companyAndIndustryList.value.length < 3 ? {
        aa: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#FF8700"
        }),
        ab: common_vendor.o(addCompany)
      } : {}, {
        ac: common_vendor.f(companyAndIndustryList.value, (company, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1)
          }, companyAndIndustryList.value.length > 1 ? {
            b: common_vendor.o(($event) => removeCompany(index), index)
          } : {}, {
            c: "2d637515-29-" + i0 + "," + ("2d637515-28-" + i0),
            d: common_vendor.o(($event) => company.industryName = $event, index),
            e: common_vendor.p({
              placeholder: "请选择行业",
              ["popup-title"]: "请选择行业",
              localdata: industryTree.value,
              map: {
                text: "name",
                value: "name"
              },
              modelValue: company.industryName
            }),
            f: "2d637515-28-" + i0 + ",2d637515-1",
            g: common_vendor.p({
              label: `所在行业`,
              name: `industry_${index}`,
              ["label-width"]: "70px"
            }),
            h: "2d637515-31-" + i0 + "," + ("2d637515-30-" + i0),
            i: common_vendor.o(($event) => company.name = $event, index),
            j: common_vendor.p({
              placeholder: "请输入公司名称",
              modelValue: company.name
            }),
            k: "2d637515-30-" + i0 + ",2d637515-1",
            l: common_vendor.p({
              label: `公司名称`,
              name: `company_${index}`,
              ["label-width"]: "70px"
            }),
            m: "2d637515-33-" + i0 + "," + ("2d637515-32-" + i0),
            n: common_vendor.o(($event) => company.positionTitle = $event, index),
            o: common_vendor.p({
              placeholder: "请输入您的职务",
              modelValue: company.positionTitle
            }),
            p: "2d637515-32-" + i0 + ",2d637515-1",
            q: common_vendor.p({
              label: `担任职务`,
              name: `position_${index}`,
              ["label-width"]: "70px"
            }),
            r: index
          });
        }),
        ad: companyAndIndustryList.value.length > 1,
        ae: schoolsList.value.length < 6
      }, schoolsList.value.length < 6 ? {
        af: common_vendor.p({
          type: "plusempty",
          size: "14",
          color: "#FF8700"
        }),
        ag: common_vendor.o(addSchool)
      } : {}, {
        ah: common_vendor.f(schoolsList.value, (school, index, i0) => {
          return common_vendor.e({
            a: "2d637515-35-" + i0 + ",2d637515-1",
            b: common_vendor.o(($event) => schoolsList.value[index] = $event, index),
            c: common_vendor.p({
              placeholder: "请输入学校名称",
              modelValue: schoolsList.value[index]
            })
          }, schoolsList.value.length > 1 ? {
            d: "2d637515-36-" + i0 + ",2d637515-1",
            e: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#999"
            }),
            f: common_vendor.o(($event) => removeSchool(index), index)
          } : {}, {
            g: index
          });
        }),
        ai: schoolsList.value.length > 1,
        aj: common_vendor.o(onHobbyChange),
        ak: common_vendor.o(($event) => selectedHobbies.value = $event),
        al: common_vendor.p({
          localdata: hobbyOptions.value,
          multiple: true,
          selectedColor: "#FF8700",
          selectedTextColor: "#FF8700",
          modelValue: selectedHobbies.value
        }),
        am: isOtherHobbySelected.value
      }, isOtherHobbySelected.value ? {
        an: common_vendor.o(($event) => otherHobbyText.value = $event),
        ao: common_vendor.p({
          placeholder: "请输入您的其他爱好",
          modelValue: otherHobbyText.value
        })
      } : {}, {
        ap: common_vendor.p({
          label: "个人爱好",
          name: "hobby",
          ["label-position"]: "top"
        }),
        aq: common_vendor.o(($event) => form.value.signature = $event),
        ar: common_vendor.p({
          placeholder: "设置一个独特的个性签名吧",
          type: "textarea",
          autoHeight: true,
          modelValue: form.value.signature
        }),
        as: common_vendor.p({
          label: "个性签名",
          name: "signature",
          ["label-position"]: "top"
        }),
        at: common_vendor.o(($event) => form.value.personalBio = $event),
        av: common_vendor.p({
          placeholder: "介绍一下自己...",
          type: "textarea",
          autoHeight: true,
          modelValue: form.value.personalBio
        }),
        aw: common_vendor.p({
          label: "个人简介",
          name: "personalBio",
          ["label-position"]: "top"
        }),
        ax: common_vendor.o(($event) => form.value.haveResources = $event),
        ay: common_vendor.p({
          placeholder: "用来智能匹配商友资源",
          type: "textarea",
          autoHeight: true,
          modelValue: form.value.haveResources
        }),
        az: common_vendor.p({
          label: "我有资源",
          name: "haveResources",
          ["label-position"]: "top"
        }),
        aA: common_vendor.o(($event) => form.value.needResources = $event),
        aB: common_vendor.p({
          placeholder: "用来智能匹配商友资源",
          type: "textarea",
          autoHeight: true,
          modelValue: form.value.needResources
        }),
        aC: common_vendor.p({
          label: "我需资源",
          name: "needResources",
          ["label-position"]: "top"
        }),
        aD: common_vendor.sr(formRef, "2d637515-1", {
          "k": "formRef"
        }),
        aE: common_vendor.p({
          modelValue: form.value,
          rules,
          ["label-width"]: "85px",
          ["label-position"]: "top"
        }),
        aF: common_vendor.o(submitForm),
        aG: currentTab.value === 0,
        aH: currentTab.value === 1
      }, currentTab.value === 1 ? {
        aI: common_vendor.p({
          type: "info",
          size: "24",
          color: "#FF8700"
        }),
        aJ: common_vendor.p({
          type: "checkmarkempty",
          size: "14",
          color: "#fff"
        }),
        aK: common_vendor.p({
          type: "checkmarkempty",
          size: "14",
          color: "#fff"
        }),
        aL: common_vendor.p({
          type: "checkmarkempty",
          size: "14",
          color: "#fff"
        }),
        aM: common_vendor.p({
          type: "compose",
          color: "#fff",
          size: "18"
        }),
        aN: common_vendor.o(goToLabelEditPage),
        aO: common_vendor.p({
          datasets: radarDatasets.value,
          showTitle: true
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2d637515"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-edit/my-edit.js.map
