"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_data_checkbox + _easycom_uni_forms)();
}
const DRAFT_STORAGE_KEY = "activity_draft";
const dragColumns = 3;
const dragItemHeightRpx = 210;
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    const isUserVerified = common_vendor.ref(true);
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(Number(timestamp));
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      const s = date.getSeconds().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const initDefaultTimes = () => {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;
      enrollTimeRange.value = [`${todayStr} 09:00:00`, `${todayStr} 18:00:00`];
      timeRange.value = [`${todayStr} 19:00:00`, `${todayStr} 21:00:00`];
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:255", "已初始化默认时间:", todayStr);
    };
    const loadDraft = () => {
      try {
        const draftDataString = common_vendor.index.getStorageSync(DRAFT_STORAGE_KEY);
        if (draftDataString) {
          const parsedDraft = JSON.parse(draftDataString);
          if (!parsedDraft.form.activityCoverImageUrls) {
            parsedDraft.form.activityCoverImageUrls = [];
          }
          form.value = parsedDraft.form;
          timeRange.value = parsedDraft.timeRange;
          enrollTimeRange.value = parsedDraft.enrollTimeRange;
          associatedStoreName.value = parsedDraft.associatedStoreName;
          common_vendor.index.showToast({
            title: "已恢复上次草稿",
            icon: "none"
          });
          return true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:278", "加载草稿失败:", error);
        common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
      }
      return false;
    };
    common_vendor.onMounted(() => {
      checkUserVerificationStatus();
      getActiveType();
      initDragLayout();
    });
    const checkUserVerificationStatus = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (!error && data) {
        isUserVerified.value = !!data.idCard;
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:301", "用户实名状态:", isUserVerified.value);
      } else {
        isUserVerified.value = false;
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:305", "获取用户信息失败，无法确认实名状态。");
      }
    };
    const goToAuthPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-auth/my-auth"
      });
    };
    const isPublishing = common_vendor.ref(false);
    const isPickerOpen = common_vendor.ref(false);
    const timeRange = common_vendor.ref([]);
    const enrollTimeRange = common_vendor.ref([]);
    const associatedStoreName = common_vendor.ref("");
    const mode = common_vendor.ref("create");
    const editActivityId = common_vendor.ref(null);
    const form = common_vendor.ref({
      activityTitle: "",
      activityDescription: "",
      totalSlots: null,
      limitSlots: null,
      activityFunds: 1,
      // 1: AA, 2: 赞助
      registrationFee: null,
      companyName: "",
      companyLogo: "",
      locationAddress: "",
      // 由地图选择填充
      latitude: null,
      // 由地图选择填充
      longitude: null,
      // 由地图选择填充
      coverImageUrl: "",
      activityCoverImageUrls: [],
      organizerUnitName: "",
      organizerContactPhone: "",
      organizerPaymentQrCodeUrl: "",
      associatedStoreId: null,
      // 由店铺选择页面填充
      tag: "",
      // 这是UI选择的单值，提交时会放入`tags`数组
      activitySessions: [{
        sessionTitle: "环节标题",
        sessionDescription: "环节描述"
      }]
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
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:372", "getActiveType result:", result);
      tagOptions.value = result.data.map((item) => ({
        value: item.value,
        // 使用后端返回的value
        text: item.label
        // 使用后端返回的label
      }));
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:377", "tagOptions updated:", tagOptions.value);
      if (result.error) {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:380", "请求失败:", result.error);
      }
    };
    const enrollmentOptions = common_vendor.ref([
      {
        text: "AA/付费",
        value: 1
      },
      {
        text: "赞助/免费",
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
          const result = await utils_upload.uploadFile(file, {
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
            common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:450", "上传失败:", result.error);
            common_vendor.index.showToast({
              title: result.error || "上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    function uploadCover() {
      common_vendor.index.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFiles[0].tempFilePath;
          common_vendor.wx$1.cropImage({
            src: tempFilePath,
            // 图片路径
            cropScale: "5:4",
            // 裁剪比例
            success: (cropRes) => {
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:475", "裁剪成功:", cropRes.tempFilePath);
              uploadFileToCloud(cropRes.tempFilePath, "coverImageUrl", "activity-cover");
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:480", "用户取消裁剪或不支持:", err);
              uploadFileToCloud(tempFilePath, "coverImageUrl", "activity-cover");
            }
          });
        }
      });
    }
    const handleActivityImagesUpload = () => {
      common_vendor.index.chooseImage({
        count: 9 - form.value.activityCoverImageUrls.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const uploadPromises = res.tempFiles.map((file) => utils_upload.uploadFile({
            path: file.path
          }, {
            directory: "activity-gallery"
          }));
          try {
            const results = await Promise.all(uploadPromises);
            common_vendor.index.hideLoading();
            const successfulUrls = results.filter((r) => r.data).map((r) => r.data);
            if (successfulUrls.length > 0) {
              form.value.activityCoverImageUrls.push(...successfulUrls);
            }
            if (results.some((r) => r.error)) {
              common_vendor.index.showToast({
                title: "部分图片上传失败",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:530", "上传异常:", error);
            common_vendor.index.showToast({
              title: "上传出错",
              icon: "none"
            });
          }
        }
      });
    };
    const deleteActivityImage = (index) => {
      form.value.activityCoverImageUrls.splice(index, 1);
    };
    const previewActivityImage = (index) => {
      common_vendor.index.previewImage({
        urls: form.value.activityCoverImageUrls,
        current: index
      });
    };
    const uploadFileToCloud = async (filePath, field, directory) => {
      common_vendor.index.showLoading({
        title: "上传中...",
        mask: true
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
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
        common_vendor.index.showToast({
          title: result.error || "上传失败",
          icon: "none"
        });
      }
    };
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
    common_vendor.onLoad(async (options) => {
      if (options && options.mode === "edit" && options.id) {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:616", "进入编辑模式");
        mode.value = "edit";
        editActivityId.value = options.id;
        common_vendor.index.setNavigationBarTitle({
          title: "编辑聚会"
        });
        await loadActivityDetailForEdit(options.id);
      } else {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:628", "进入创建模式");
        mode.value = "create";
        common_vendor.index.setNavigationBarTitle({
          title: "发起聚会"
        });
        const hasDraft = loadDraft();
        if (!hasDraft) {
          initDefaultTimes();
        }
      }
      if (options && options.storeId && options.storeName) {
        form.value.associatedStoreId = options.storeId;
        associatedStoreName.value = decodeURIComponent(options.storeName);
        common_vendor.index.showToast({
          title: `已选择聚店: ${associatedStoreName.value}`,
          icon: "none"
        });
      }
      common_vendor.index.$on("shopSelected", (shop) => {
        form.value.associatedStoreId = shop.id;
        associatedStoreName.value = shop.storeName;
      });
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("shopSelected");
    });
    const loadActivityDetailForEdit = async (id) => {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      const [detailRes, dictRes] = await Promise.all([
        utils_request.request("/app-api/member/activity/get", {
          method: "GET",
          data: {
            id
          }
        }),
        // 如果 tagOptions 已经有值，就不必请求了，直接返回 null 占位
        tagOptions.value.length === 0 ? utils_request.request("/app-api/system/dict-data/type", {
          method: "GET",
          data: {
            type: "member_activity_category "
          }
        }) : Promise.resolve(null)
      ]);
      common_vendor.index.hideLoading();
      if (dictRes && !dictRes.error && dictRes.data) {
        tagOptions.value = dictRes.data.map((item) => ({
          value: item.value,
          text: item.label
        }));
      }
      if (detailRes.error || !detailRes.data) {
        common_vendor.index.showToast({
          title: "加载活动详情失败",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
        return;
      }
      const data = detailRes.data;
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:711", "获取详情用于编辑:", data);
      form.value.activityTitle = data.activityTitle;
      form.value.activityDescription = data.activityDescription;
      form.value.totalSlots = data.totalSlots;
      form.value.limitSlots = data.limitSlots;
      form.value.activityFunds = data.activityFunds;
      form.value.registrationFee = data.registrationFee;
      form.value.companyName = data.companyName;
      form.value.companyLogo = data.companyLogo;
      form.value.locationAddress = data.locationAddress;
      form.value.latitude = data.latitude;
      form.value.longitude = data.longitude;
      form.value.coverImageUrl = data.coverImageUrl;
      if (data.activityCoverImageUrls && data.activityCoverImageUrls.length > 0) {
        form.value.activityCoverImageUrls = data.activityCoverImageUrls;
      } else {
        form.value.activityCoverImageUrls = [];
      }
      form.value.organizerUnitName = data.organizerUnitName;
      form.value.organizerContactPhone = data.organizerContactPhone;
      form.value.organizerPaymentQrCodeUrl = data.organizerPaymentQrCodeUrl;
      let matchedValue = "";
      if (data.category) {
        const targetVal = String(data.category);
        const foundOption = tagOptions.value.find((opt) => String(opt.value) === targetVal);
        if (foundOption) {
          matchedValue = foundOption.value;
        }
      }
      if (!matchedValue && data.tags && data.tags.length > 0) {
        const tagName = data.tags[0];
        const foundOption = tagOptions.value.find((opt) => opt.text === tagName);
        if (foundOption) {
          matchedValue = foundOption.value;
        }
      }
      form.value.tag = matchedValue;
      if (data.startDatetime && data.endDatetime) {
        timeRange.value = [
          formatTimestamp(data.startDatetime),
          formatTimestamp(data.endDatetime)
        ];
      }
      if (data.registrationStartDatetime && data.registrationEndDatetime) {
        enrollTimeRange.value = [
          formatTimestamp(data.registrationStartDatetime),
          formatTimestamp(data.registrationEndDatetime)
        ];
      }
      if (data.memberStoreRespVO) {
        form.value.associatedStoreId = data.memberStoreRespVO.id;
        associatedStoreName.value = data.memberStoreRespVO.storeName;
      }
      if (data.memberActivitySessionList && data.memberActivitySessionList.length > 0) {
        form.value.activitySessions = data.memberActivitySessionList.map((item) => ({
          id: item.id,
          // 关键：保留ID
          sessionTitle: item.sessionTitle,
          sessionDescription: item.sessionDescription
        }));
      }
    };
    function saveDraft() {
      const draftData = {
        form: form.value,
        timeRange: timeRange.value,
        enrollTimeRange: enrollTimeRange.value,
        associatedStoreName: associatedStoreName.value
      };
      try {
        common_vendor.index.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        common_vendor.index.showToast({
          title: "聚会已保存为草稿",
          icon: "none"
        });
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:826", "草稿已保存:", draftData);
      } catch (e) {
        common_vendor.index.showToast({
          title: "草稿保存失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:832", "保存草稿到本地存储失败:", e);
      }
    }
    async function publish() {
      if (isPublishing.value)
        return;
      if (isPublishing.value) {
        common_vendor.index.showToast({
          title: "正在发布中，请稍候...",
          icon: "none"
        });
        return;
      }
      if (!form.value.activityTitle) {
        common_vendor.index.showToast({
          title: "请输入聚会标题",
          icon: "none"
        });
        return;
      }
      if (!form.value.tag) {
        common_vendor.index.showToast({
          title: "请选择聚会类型",
          icon: "none"
        });
        return;
      }
      if (!timeRange.value || timeRange.value.length !== 2) {
        common_vendor.index.showToast({
          title: "请选择聚会时间",
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
          title: "请选择聚会地点",
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
          title: "请输入聚会介绍",
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
      if (form.value.activityFunds === 1 && !form.value.organizerPaymentQrCodeUrl) {
        common_vendor.index.showToast({
          title: "AA制聚会请上传收款码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认发布",
        content: "请确认您填写的内容无误。",
        success: async (res) => {
          if (res.confirm) {
            await processPublishing();
          }
        }
      });
    }
    async function processPublishing() {
      isPublishing.value = true;
      common_vendor.index.showLoading({
        title: "正在处理...",
        mask: true
      });
      try {
        const payload = JSON.parse(JSON.stringify(form.value));
        payload.activityCoverImageUrls = form.value.activityCoverImageUrls;
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
        }));
        if (payload.activityFunds === 1) {
          delete payload.companyName;
          delete payload.companyLogo;
        } else {
          delete payload.registrationFee;
        }
        let result;
        if (mode.value === "edit") {
          payload.id = editActivityId.value;
          common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1032", "编辑提交 Payload:", payload);
          result = await editActive(payload);
        } else {
          common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1036", "创建提交 Payload:", payload);
          result = await createActive(payload);
        }
        if (result.success) {
          if (mode.value === "create")
            common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
          common_vendor.index.showModal({
            title: mode.value === "edit" ? "修改成功" : "发布成功",
            content: mode.value === "edit" ? "聚会信息已更新。" : "可在【我的】-【我的聚会】中查看。",
            showCancel: false,
            confirmText: "知道了",
            success: (modalRes) => {
              if (modalRes.confirm) {
                common_vendor.index.navigateBack({
                  delta: 1
                });
              }
            }
          });
        } else {
          const error = result.error;
          if (typeof error === "object" && error !== null && error.code === 453) {
            common_vendor.index.hideLoading();
            saveDraft();
            common_vendor.index.showModal({
              title: "认证提醒",
              content: error.msg || "发布聚会需要先完成实名认证，是否现在就去认证？您的聚会信息已为您保存为草稿。",
              // 使用 error.msg
              confirmText: "去认证",
              cancelText: "取消",
              success: (res) => {
                if (res.confirm) {
                  common_vendor.index.navigateTo({
                    url: "/pages/my-auth/my-auth"
                  });
                }
              }
            });
            isPublishing.value = false;
            return;
          }
          common_vendor.index.showToast({
            title: typeof error === "string" ? error : error.msg || "发布失败",
            icon: "none",
            duration: 3e3
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:1112", "发布流程中发生未知错误:", e);
        common_vendor.index.showToast({
          title: "操作失败，请检查网络",
          icon: "none"
        });
      } finally {
        isPublishing.value = false;
        common_vendor.index.hideLoading();
      }
    }
    const createActive = async (payload) => {
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1125", "payload", payload);
      const result = await utils_request.request("/app-api/member/activity/create", {
        method: "POST",
        data: payload
      });
      if (result && !result.error) {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1133", "createActive result:", result);
        return {
          success: true,
          error: null
        };
      } else {
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1142", "请求失败:", result.error);
        return {
          success: false,
          error: result.error
        };
      }
    };
    const editActive = async (payload) => {
      const result = await utils_request.request("/app-api/member/activity/edit", {
        method: "POST",
        data: payload
      });
      if (result && !result.error) {
        return {
          success: true,
          error: null
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    };
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1177", `[活动发布页] 分享给好友，获取到邀请码: ${inviteCode}`);
      let sharePath = "/packages/active-publish/active-publish";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "快来组织一场有趣的聚会吧，链接你的商友！",
        path: sharePath,
        // 建议使用一个固定的、吸引人的分享图片
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1193", "[活动发布页] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1203", `[活动发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "快来组织一场有趣的聚会吧，链接你的商友！",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:1218", "[活动发布页] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    const dragDisplayList = common_vendor.ref([]);
    const dragItemWidth = common_vendor.ref(0);
    const dragItemHeight = common_vendor.ref(0);
    const dragAreaHeight = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const dragIndex = common_vendor.ref(-1);
    const initDragLayout = () => {
      const sys = common_vendor.index.getSystemInfoSync();
      const containerWidth = sys.windowWidth - common_vendor.index.upx2px(100);
      dragItemWidth.value = containerWidth / dragColumns;
      dragItemHeight.value = common_vendor.index.upx2px(dragItemHeightRpx);
    };
    common_vendor.watch(() => form.value.activityCoverImageUrls, (newVal) => {
      if (!isDragging.value) {
        initDragList(newVal || []);
      }
    }, {
      deep: true
    });
    const initDragList = (originList) => {
      if (!originList) {
        dragDisplayList.value = [];
        dragAreaHeight.value = 0;
        return;
      }
      if (dragItemWidth.value === 0)
        initDragLayout();
      dragDisplayList.value = originList.map((url, index) => {
        const {
          x,
          y
        } = getPos(index);
        return {
          id: `img_${index}_${Math.random()}`,
          data: url,
          x,
          y,
          zIndex: 1,
          realIndex: index
        };
      });
      updateDragHeight();
    };
    const getPos = (index) => {
      const row = Math.floor(index / dragColumns);
      const col = index % dragColumns;
      return {
        x: col * dragItemWidth.value,
        y: row * dragItemHeight.value
      };
    };
    const updateDragHeight = () => {
      const count = dragDisplayList.value.length;
      const rows = Math.ceil(count / dragColumns);
      dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
    };
    const onMovableStart = (index) => {
      isDragging.value = true;
      dragIndex.value = index;
      dragDisplayList.value[index].zIndex = 99;
    };
    const onMovableChange = (e, index) => {
      if (!isDragging.value || index !== dragIndex.value)
        return;
      const x = e.detail.x;
      const y = e.detail.y;
      const centerX = x + dragItemWidth.value / 2;
      const centerY = y + dragItemHeight.value / 2;
      const col = Math.floor(centerX / dragItemWidth.value);
      const row = Math.floor(centerY / dragItemHeight.value);
      let targetIndex = row * dragColumns + col;
      if (targetIndex < 0)
        targetIndex = 0;
      if (targetIndex >= dragDisplayList.value.length)
        targetIndex = dragDisplayList.value.length - 1;
      if (targetIndex !== dragIndex.value) {
        const mover = dragDisplayList.value[dragIndex.value];
        dragDisplayList.value.splice(dragIndex.value, 1);
        dragDisplayList.value.splice(targetIndex, 0, mover);
        dragDisplayList.value.forEach((item, idx) => {
          if (idx !== targetIndex) {
            const pos = getPos(idx);
            item.x = pos.x;
            item.y = pos.y;
          }
        });
        dragIndex.value = targetIndex;
      }
    };
    const onMovableEnd = () => {
      isDragging.value = false;
      if (dragIndex.value !== -1) {
        const item = dragDisplayList.value[dragIndex.value];
        item.zIndex = 1;
        const pos = getPos(dragIndex.value);
        common_vendor.nextTick$1(() => {
          item.x = pos.x;
          item.y = pos.y;
        });
        const sortedUrls = dragDisplayList.value.map((wrapper) => wrapper.data);
        form.value.activityCoverImageUrls = sortedUrls;
      }
      dragIndex.value = -1;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isUserVerified.value
      }, !isUserVerified.value ? {
        b: common_vendor.p({
          type: "info-filled",
          size: "18",
          color: "#e6a23c"
        }),
        c: common_vendor.o(goToAuthPage)
      } : {}, {
        d: common_vendor.o(($event) => form.value.activityTitle = $event),
        e: common_vendor.p({
          placeholder: "请输入聚会主题",
          modelValue: form.value.activityTitle
        }),
        f: common_vendor.p({
          label: "聚会主题",
          required: true
        }),
        g: common_vendor.o(($event) => form.value.tag = $event),
        h: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择聚会类型",
          modelValue: form.value.tag
        }),
        i: common_vendor.p({
          label: "聚会类型",
          required: true
        }),
        j: form.value.coverImageUrl
      }, form.value.coverImageUrl ? {
        k: form.value.coverImageUrl
      } : {}, {
        l: common_vendor.o(uploadCover),
        m: common_vendor.p({
          label: "聚会封面"
        }),
        n: common_vendor.f(dragDisplayList.value, (item, index, i0) => {
          return {
            a: item.data,
            b: common_vendor.o(($event) => previewActivityImage(item.realIndex), item.id),
            c: common_vendor.o(($event) => deleteActivityImage(item.realIndex), item.id),
            d: item.id,
            e: item.x,
            f: item.y,
            g: item.zIndex,
            h: !isDragging.value && item.zIndex === 1,
            i: common_vendor.o(($event) => onMovableChange($event, index), item.id),
            j: common_vendor.o(($event) => onMovableStart(index), item.id),
            k: common_vendor.o(onMovableEnd, item.id)
          };
        }),
        o: dragItemWidth.value + "px",
        p: dragItemHeight.value + "px",
        q: dragAreaHeight.value + "px",
        r: dragAreaHeight.value > 0 ? dragAreaHeight.value + "px" : "0px",
        s: form.value.activityCoverImageUrls.length < 9
      }, form.value.activityCoverImageUrls.length < 9 ? {
        t: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#ccc"
        }),
        v: common_vendor.o(handleActivityImagesUpload)
      } : {}, {
        w: common_vendor.p({
          label: "聚会图集"
        }),
        x: common_vendor.o(($event) => isPickerOpen.value = false),
        y: common_vendor.o(($event) => isPickerOpen.value = false),
        z: common_vendor.o(($event) => timeRange.value = $event),
        A: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: timeRange.value
        }),
        B: common_vendor.o(($event) => isPickerOpen.value = true),
        C: common_vendor.p({
          label: "聚会时间",
          required: true
        }),
        D: common_vendor.o(($event) => isPickerOpen.value = false),
        E: common_vendor.o(($event) => isPickerOpen.value = false),
        F: common_vendor.o(($event) => enrollTimeRange.value = $event),
        G: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: "至",
          modelValue: enrollTimeRange.value
        }),
        H: common_vendor.o(($event) => isPickerOpen.value = true),
        I: common_vendor.p({
          label: "报名时间",
          required: true
        }),
        J: form.value.locationAddress
      }, form.value.locationAddress ? {
        K: common_vendor.t(form.value.locationAddress)
      } : {}, {
        L: common_vendor.o(openMapToChooseLocation),
        M: common_vendor.p({
          label: "聚会地点",
          required: true
        }),
        N: associatedStoreName.value
      }, associatedStoreName.value ? {
        O: common_vendor.t(associatedStoreName.value)
      } : {}, {
        P: common_vendor.o(goToSelectShop),
        Q: common_vendor.p({
          label: "合作聚店",
          ["label-width"]: 80
        }),
        R: common_vendor.o(($event) => form.value.totalSlots = $event),
        S: common_vendor.p({
          type: "number",
          placeholder: "超过人数上限,不能报名",
          modelValue: form.value.totalSlots
        }),
        T: common_vendor.p({
          label: "人数上限"
        }),
        U: common_vendor.o(($event) => form.value.limitSlots = $event),
        V: common_vendor.p({
          type: "number",
          placeholder: "不达起聚人数,聚会取消",
          modelValue: form.value.limitSlots
        }),
        W: common_vendor.p({
          label: "起聚人数"
        }),
        X: common_vendor.o(($event) => form.value.activityFunds = $event),
        Y: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "button",
          modelValue: form.value.activityFunds
        }),
        Z: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        aa: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? {
        ab: common_vendor.o(($event) => form.value.registrationFee = $event),
        ac: common_vendor.p({
          type: "digit",
          placeholder: "请输入聚会费用(元)",
          modelValue: form.value.registrationFee
        }),
        ad: common_vendor.p({
          label: "单人费用",
          required: true
        })
      } : {}, {
        ae: form.value.activityFunds === 2
      }, form.value.activityFunds === 2 ? common_vendor.e({
        af: common_vendor.o(($event) => form.value.companyName = $event),
        ag: common_vendor.p({
          placeholder: "请输入赞助公司名称",
          modelValue: form.value.companyName
        }),
        ah: common_vendor.p({
          label: "公司名称",
          required: true
        }),
        ai: form.value.companyLogo
      }, form.value.companyLogo ? {
        aj: form.value.companyLogo
      } : {}, {
        ak: common_vendor.o(uploadSponsorLogo),
        al: common_vendor.p({
          label: "公司Logo",
          required: true
        })
      }) : {}, {
        am: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        an: common_vendor.o(($event) => form.value.activityDescription = $event),
        ao: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入聚会详细介绍",
          modelValue: form.value.activityDescription
        }),
        ap: common_vendor.p({
          label: "聚会介绍",
          required: true,
          ["label-width"]: 80
        }),
        aq: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: "5d3444db-28-" + i0,
            b: common_vendor.o(($event) => item.sessionTitle = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.sessionTitle
            }),
            d: "5d3444db-29-" + i0,
            e: common_vendor.o(($event) => item.sessionDescription = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.sessionDescription
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "5d3444db-30-" + i0,
            i: index
          };
        }),
        ar: common_vendor.p({
          type: "close"
        }),
        as: common_vendor.p({
          type: "plusempty",
          color: "red"
        }),
        at: common_vendor.o(addAgenda),
        av: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        aw: common_vendor.p({
          placeholder: "请输入组织者名称",
          modelValue: form.value.organizerUnitName
        }),
        ax: common_vendor.p({
          label: "组织者",
          required: true
        }),
        ay: common_vendor.o(($event) => form.value.organizerContactPhone = $event),
        az: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          modelValue: form.value.organizerContactPhone
        }),
        aA: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        aB: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? common_vendor.e({
        aC: form.value.organizerPaymentQrCodeUrl
      }, form.value.organizerPaymentQrCodeUrl ? {
        aD: form.value.organizerPaymentQrCodeUrl
      } : {}, {
        aE: common_vendor.o(uploadCode),
        aF: common_vendor.p({
          label: "收款码",
          required: true
        })
      }) : {}, {
        aG: common_vendor.p({
          ["label-width"]: 80
        }),
        aH: mode.value === "create"
      }, mode.value === "create" ? {
        aI: common_vendor.o(saveDraft)
      } : {}, {
        aJ: common_vendor.t(isPublishing.value ? "处理中..." : mode.value === "edit" ? "保存修改" : "发起聚会"),
        aK: isPublishing.value ? 1 : "",
        aL: common_vendor.o(publish),
        aM: isPickerOpen.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5d3444db"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-publish/active-publish.js.map
