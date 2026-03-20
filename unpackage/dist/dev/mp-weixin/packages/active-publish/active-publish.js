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
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_select2 + _easycom_DragImageUploader2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_DragImageUploader = () => "../../components/DragImageUploader/DragImageUploader.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_DragImageUploader + _easycom_uni_datetime_picker + _easycom_uni_data_checkbox + _easycom_uni_forms + SponsorPopup + SmartGuidePopup)();
}
const SponsorPopup = () => "../../components/sponsor-popup.js";
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const DRAFT_STORAGE_KEY = "activity_draft";
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    const autoSaveTimer = common_vendor.ref(null);
    const lastAutoSaveTime = common_vendor.ref("");
    const isUserVerified = common_vendor.ref(true);
    const isPublishing = common_vendor.ref(false);
    const mode = common_vendor.ref("create");
    const editActivityId = common_vendor.ref(null);
    const remainingQuota = common_vendor.ref(0);
    const isQuotaLoaded = common_vendor.ref(false);
    const smartGuidePopupRef = common_vendor.ref(null);
    const timeRange = common_vendor.ref([]);
    const enrollTimeRange = common_vendor.ref([]);
    const associatedStoreName = common_vendor.ref("");
    const tagOptions = common_vendor.ref([]);
    const enrollmentOptions = common_vendor.ref([
      {
        text: "AA/付费",
        value: 1
      },
      {
        text: "赞助/免费",
        value: 2
      },
      {
        text: "AA+赞助",
        value: 3
      }
    ]);
    const isTimeRangeUserSelected = common_vendor.ref(false);
    const isEnrollTimeRangeUserSelected = common_vendor.ref(false);
    const form = common_vendor.ref({
      activityTitle: "",
      activityDescription: "",
      totalSlots: null,
      limitSlots: null,
      activityFunds: 1,
      registrationFee: null,
      locationAddress: "",
      latitude: null,
      longitude: null,
      coverImageUrl: "",
      activityCoverImageUrls: [],
      organizerUnitName: "",
      organizerContactPhone: "",
      organizerPaymentQrCodeUrl: "",
      associatedStoreId: null,
      tag: "",
      activitySessions: [{
        _id: Date.now(),
        sessionTitle: "环节标题",
        sessionDescription: "环节描述"
      }]
    });
    const isSponsorExpanded = common_vendor.ref(false);
    const showSponsorPopup = common_vendor.ref(false);
    const sponsorsList = common_vendor.ref([]);
    const deletedSponsorIds = common_vendor.ref([]);
    const currentSponsorIndex = common_vendor.ref(-1);
    const currentSponsorData = common_vendor.ref(null);
    const isPickerOpen = common_vendor.ref(false);
    const inputStyles = common_vendor.ref({
      color: "#333",
      borderColor: "#dcdfe6",
      disableColor: "#f5f7fa"
    });
    const openPicker = () => {
      isPickerOpen.value = true;
    };
    const closePicker = () => {
      setTimeout(() => {
        isPickerOpen.value = false;
      }, 100);
    };
    const onTimeRangeChange = () => {
      isTimeRangeUserSelected.value = true;
      closePicker();
    };
    const onEnrollTimeRangeChange = () => {
      isEnrollTimeRangeUserSelected.value = true;
      closePicker();
    };
    common_vendor.onMounted(() => {
      checkUserVerificationStatus();
      getActiveType();
    });
    common_vendor.onShow(() => {
      if (common_vendor.index.getStorageSync("token")) {
        checkPublishQuota();
      }
    });
    common_vendor.onLoad(async (options) => {
      if (options && options.mode === "edit" && options.id) {
        mode.value = "edit";
        editActivityId.value = options.id;
        common_vendor.index.setNavigationBarTitle({
          title: "编辑聚会"
        });
        await loadActivityDetailForEdit(options.id);
      } else {
        mode.value = "create";
        common_vendor.index.setNavigationBarTitle({
          title: "发起聚会"
        });
        const hasDraft = loadDraft();
        if (!hasDraft)
          initDefaultTimes();
      }
      if (options && options.storeId && options.storeName) {
        form.value.associatedStoreId = options.storeId;
        associatedStoreName.value = decodeURIComponent(options.storeName);
      }
      common_vendor.index.$on("shopSelected", (shop) => {
        form.value.associatedStoreId = shop.id;
        associatedStoreName.value = shop.storeName;
      });
    });
    common_vendor.onReady(() => {
      var _a;
      if (utils_user.isScenario3User()) {
        (_a = smartGuidePopupRef.value) == null ? void 0 : _a.open();
      }
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("shopSelected");
      if (autoSaveTimer.value)
        clearTimeout(autoSaveTimer.value);
    });
    common_vendor.watch([timeRange, enrollTimeRange], () => {
      isPickerOpen.value = false;
    });
    common_vendor.watch(
      [form, timeRange, enrollTimeRange, sponsorsList, associatedStoreName],
      () => {
        triggerAutoSave();
      },
      {
        deep: true
      }
    );
    const autoSaveDraft = () => {
      if (mode.value !== "create")
        return;
      const draft = {
        form: form.value,
        timeRange: timeRange.value,
        enrollTimeRange: enrollTimeRange.value,
        associatedStoreName: associatedStoreName.value,
        sponsorsList: sponsorsList.value,
        savedAt: Date.now()
      };
      common_vendor.index.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      const now = /* @__PURE__ */ new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      lastAutoSaveTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };
    const triggerAutoSave = () => {
      if (mode.value !== "create")
        return;
      if (autoSaveTimer.value)
        clearTimeout(autoSaveTimer.value);
      autoSaveTimer.value = setTimeout(() => {
        autoSaveDraft();
      }, 500);
    };
    const formatTimestamp = (ts) => {
      if (!ts)
        return "";
      const d = new Date(Number(ts));
      const pad = (n) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    const initDefaultTimes = () => {
      const now = /* @__PURE__ */ new Date();
      const day = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
      enrollTimeRange.value = [`${day} 09:00:00`, `${day} 18:00:00`];
      timeRange.value = [`${day} 19:00:00`, `${day} 21:00:00`];
      isTimeRangeUserSelected.value = false;
      isEnrollTimeRangeUserSelected.value = false;
    };
    const checkUserVerificationStatus = async () => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        if (!error && data) {
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(data));
          isUserVerified.value = data.idCert === 1;
        } else {
          const cached = common_vendor.index.getStorageSync("userInfo");
          if (cached) {
            try {
              isUserVerified.value = JSON.parse(cached).idCert === 1;
            } catch (e) {
              isUserVerified.value = true;
            }
          } else {
            isUserVerified.value = true;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:565", "获取用户实名状态失败:", e);
        isUserVerified.value = true;
      }
    };
    const goToAuthPage = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-auth/my-auth"
      });
    };
    const getActiveType = async () => {
      const res = await utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        data: {
          type: "member_activity_category "
        }
      });
      if (res.data)
        tagOptions.value = res.data.map((i) => ({
          value: i.value,
          text: i.label
        }));
    };
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          form.value.locationAddress = res.address;
          form.value.latitude = res.latitude;
          form.value.longitude = res.longitude;
        }
      });
    };
    const goToSelectShop = () => common_vendor.index.navigateTo({
      url: "/pages/shop-list/shop-list"
    });
    const uploadCover = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.wx$1.cropImage({
            src: tempFilePath,
            cropScale: "4:3",
            success: (cropRes) => {
              processUpload(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:623", "用户取消裁剪或失败:", err);
            }
          });
        }
      });
    };
    const processUpload = async (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
        directory: "cover"
      });
      common_vendor.index.hideLoading();
      if (result.data) {
        form.value.coverImageUrl = result.data;
        common_vendor.index.showToast({
          title: "封面已设置",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
      }
    };
    const handleActivityImagesUpload = () => {
      common_vendor.index.chooseImage({
        count: 9 - form.value.activityCoverImageUrls.length,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "正在上传...",
            mask: true
          });
          try {
            const uploadPromises = res.tempFiles.map((file) => utils_upload.uploadFile({
              path: file.path
            }, {
              directory: "gallery"
            }));
            const results = await Promise.all(uploadPromises);
            const successfulUrls = results.filter((res2) => res2.data).map((res2) => res2.data);
            if (successfulUrls.length > 0) {
              form.value.activityCoverImageUrls.push(...successfulUrls);
            }
            if (successfulUrls.length < res.tempFiles.length) {
              common_vendor.index.showToast({
                title: "部分图片上传失败",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.showToast({
              title: "上传出错",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        },
        fail: (err) => {
          if (err.errMsg.indexOf("cancel") === -1) {
            common_vendor.index.showToast({
              title: "选择图片失败",
              icon: "none"
            });
          }
        }
      });
    };
    const uploadCode = async () => {
      common_vendor.index.chooseImage({
        success: async (res) => {
          const r = await utils_upload.uploadFile({
            path: res.tempFilePaths[0]
          }, {
            directory: "qrcode"
          });
          if (r.data)
            form.value.organizerPaymentQrCodeUrl = r.data;
        }
      });
    };
    const addAgenda = () => {
      form.value.activitySessions.push({
        _id: Date.now() + Math.random(),
        sessionTitle: "",
        sessionDescription: ""
      });
    };
    const removeAgenda = (i) => form.value.activitySessions.splice(i, 1);
    const handleAddSponsor = () => {
      currentSponsorIndex.value = -1;
      currentSponsorData.value = null;
      showSponsorPopup.value = true;
    };
    const handleEditSponsor = (index) => {
      currentSponsorIndex.value = index;
      currentSponsorData.value = sponsorsList.value[index];
      common_vendor.nextTick$1(() => {
        showSponsorPopup.value = true;
      });
    };
    const handleDeleteSponsor = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定移除该赞助商吗？",
        success: (res) => {
          if (res.confirm) {
            const item = sponsorsList.value[index];
            if (item.id)
              deletedSponsorIds.value.push(item.id);
            sponsorsList.value.splice(index, 1);
          }
        }
      });
    };
    const handleSponsorSave = (data) => {
      if (currentSponsorIndex.value === -1) {
        sponsorsList.value.push(data);
      } else {
        sponsorsList.value.splice(currentSponsorIndex.value, 1, data);
      }
      showSponsorPopup.value = false;
    };
    const syncSponsorsInline = async (activityId) => {
      const userId = common_vendor.index.getStorageSync("userId");
      for (const id of deletedSponsorIds.value) {
        await utils_request.request(`/app-api/member/sponsor/delete?id=${id}`, {
          method: "DELETE"
        });
      }
      sponsorsList.value.forEach((item, index) => item.displaySort = index);
      for (const item of sponsorsList.value) {
        const sponsorPayload = {
          ...item,
          userId,
          activityId,
          galleryImageUrls: JSON.stringify(item.galleryImageUrls || [])
        };
        if (item.id) {
          await utils_request.request("/app-api/member/sponsor-activity-record/update-in-activity", {
            method: "PUT",
            data: sponsorPayload
          });
        } else {
          await utils_request.request("/app-api/member/sponsor-activity-record/create-in-activity", {
            method: "POST",
            data: sponsorPayload
          });
        }
      }
    };
    const loadDraft = () => {
      try {
        const str = common_vendor.index.getStorageSync(DRAFT_STORAGE_KEY);
        if (str) {
          const d = JSON.parse(str);
          form.value = d.form || form.value;
          if (!form.value.activityCoverImageUrls)
            form.value.activityCoverImageUrls = [];
          timeRange.value = d.timeRange || [];
          enrollTimeRange.value = d.enrollTimeRange || [];
          associatedStoreName.value = d.associatedStoreName || "";
          if (d.sponsorsList)
            sponsorsList.value = d.sponsorsList;
          isTimeRangeUserSelected.value = !!(d.timeRange && d.timeRange.length);
          isEnrollTimeRangeUserSelected.value = !!(d.enrollTimeRange && d.enrollTimeRange.length);
          common_vendor.index.showToast({
            title: "已恢复草稿",
            icon: "none"
          });
          return true;
        }
      } catch (e) {
      }
      return false;
    };
    const saveDraft = () => {
      const draft = {
        form: form.value,
        timeRange: timeRange.value,
        enrollTimeRange: enrollTimeRange.value,
        associatedStoreName: associatedStoreName.value,
        sponsorsList: sponsorsList.value
      };
      common_vendor.index.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      common_vendor.index.showToast({
        title: "草稿已保存",
        icon: "none"
      });
    };
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
      form.value.activityTitle = data.activityTitle;
      form.value.activityDescription = data.activityDescription;
      form.value.totalSlots = data.totalSlots;
      form.value.limitSlots = data.limitSlots;
      form.value.activityFunds = data.activityFunds;
      form.value.registrationFee = data.registrationFee;
      form.value.locationAddress = data.locationAddress;
      form.value.latitude = data.latitude;
      form.value.longitude = data.longitude;
      form.value.coverImageUrl = data.coverImageUrl;
      form.value.organizerUnitName = data.organizerUnitName;
      form.value.organizerContactPhone = data.organizerContactPhone;
      form.value.organizerPaymentQrCodeUrl = data.organizerPaymentQrCodeUrl;
      form.value.activityCoverImageUrls = data.activityCoverImageUrls && data.activityCoverImageUrls.length > 0 ? data.activityCoverImageUrls : [];
      let matchedValue = "";
      if (data.category) {
        const targetVal = String(data.category);
        const foundOption = tagOptions.value.find((opt) => String(opt.value) === targetVal);
        if (foundOption)
          matchedValue = foundOption.value;
      }
      if (!matchedValue && data.tags && data.tags.length > 0) {
        const tagName = data.tags[0];
        const foundOption = tagOptions.value.find((opt) => opt.text === tagName);
        if (foundOption)
          matchedValue = foundOption.value;
      }
      form.value.tag = matchedValue;
      if (data.startDatetime && data.endDatetime) {
        timeRange.value = [formatTimestamp(data.startDatetime), formatTimestamp(data.endDatetime)];
      }
      if (data.registrationStartDatetime && data.registrationEndDatetime) {
        enrollTimeRange.value = [formatTimestamp(data.registrationStartDatetime), formatTimestamp(data.registrationEndDatetime)];
      }
      isTimeRangeUserSelected.value = true;
      isEnrollTimeRangeUserSelected.value = true;
      if (data.memberStoreRespVO) {
        form.value.associatedStoreId = data.memberStoreRespVO.id;
        associatedStoreName.value = data.memberStoreRespVO.storeName;
      }
      if (data.memberActivitySessionList && data.memberActivitySessionList.length > 0) {
        form.value.activitySessions = data.memberActivitySessionList.map((item) => ({
          _id: item.id,
          sessionTitle: item.sessionTitle,
          sessionDescription: item.sessionDescription
        }));
      }
      if (data.memberSponsorList && data.memberSponsorList.length > 0) {
        sponsorsList.value = data.memberSponsorList.map((item) => {
          let gallery = [];
          try {
            if (item.galleryImageUrls && typeof item.galleryImageUrls === "string") {
              gallery = JSON.parse(item.galleryImageUrls);
            } else if (Array.isArray(item.galleryImageUrls)) {
              gallery = item.galleryImageUrls;
            }
          } catch (e) {
            gallery = [];
          }
          return {
            ...item,
            galleryImageUrls: gallery
          };
        });
      } else {
        sponsorsList.value = [];
      }
    };
    const checkPublishQuota = async () => {
      try {
        const {
          data
        } = await utils_request.request("/app-api/member/top-up-level-rights/get-remaining", {
          method: "GET",
          data: {
            rightsType: 3
          }
        });
        remainingQuota.value = typeof data === "number" ? data : 0;
        isQuotaLoaded.value = true;
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:968", "获取权益网络异常", e);
      }
    };
    const showQuotaExceededModal = () => {
      common_vendor.index.showModal({
        title: "额度已用完",
        content: "您本月的聚会发布次数已耗尽。升级会员可获取更多额度。",
        confirmText: "升级会员",
        cancelText: "取消",
        confirmColor: "#FF6B00",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/packages/recharge/recharge?type=membership"
            });
          }
        }
      });
    };
    const handlePublishClick = () => {
      common_vendor.index.hideKeyboard();
      if (mode.value === "create" && isQuotaLoaded.value && remainingQuota.value == 0) {
        showQuotaExceededModal();
        return;
      }
      publish();
    };
    const publish = async () => {
      if (isPublishing.value)
        return;
      if (!form.value.activityTitle)
        return common_vendor.index.showToast({
          title: "标题必填",
          icon: "none"
        });
      if (!form.value.tag)
        return common_vendor.index.showToast({
          title: "类型必选",
          icon: "none"
        });
      if (!form.value.locationAddress)
        return common_vendor.index.showToast({
          title: "地点必填",
          icon: "none"
        });
      const needsFee = [1, 3].includes(form.value.activityFunds);
      if (needsFee) {
        if (!form.value.registrationFee)
          return common_vendor.index.showToast({
            title: "请输入单人费用",
            icon: "none"
          });
        if (!form.value.organizerPaymentQrCodeUrl)
          return common_vendor.index.showToast({
            title: "请上传收款码",
            icon: "none"
          });
      }
      if (!isTimeRangeUserSelected.value) {
        common_vendor.index.showModal({
          title: "请确认聚会时间",
          content: "检测到您使用的是系统默认时间，请先手动选择实际的聚会时间后再发布。",
          showCancel: false,
          confirmText: "去选择"
        });
        return;
      }
      if (!isEnrollTimeRangeUserSelected.value) {
        common_vendor.index.showModal({
          title: "请确认报名时间",
          content: "检测到您使用的是系统默认时间，请先手动选择实际的报名时间后再发布。",
          showCancel: false,
          confirmText: "去选择"
        });
        return;
      }
      if (!timeRange.value.length || !enrollTimeRange.value.length) {
        return common_vendor.index.showToast({
          title: "时间必填",
          icon: "none"
        });
      }
      common_vendor.index.showModal({
        title: "确认发布",
        content: "确认内容无误？",
        success: (res) => {
          if (res.confirm)
            processPublishing();
        }
      });
    };
    const processPublishing = async () => {
      isPublishing.value = true;
      common_vendor.index.showLoading({
        title: "处理中...",
        mask: true
      });
      try {
        const payload = JSON.parse(JSON.stringify(form.value));
        payload.startDatetime = new Date(timeRange.value[0]).getTime();
        payload.endDatetime = new Date(timeRange.value[1]).getTime();
        payload.registrationStartDatetime = new Date(enrollTimeRange.value[0]).getTime();
        payload.registrationEndDatetime = new Date(enrollTimeRange.value[1]).getTime();
        const tagObj = tagOptions.value.find((o) => o.value == payload.tag);
        payload.category = payload.tag;
        payload.tags = tagObj ? [tagObj.text] : [payload.tag];
        delete payload.tag;
        payload.activitySessions = payload.activitySessions.map((s, i) => ({
          ...s,
          sessionOrder: i + 1
        }));
        delete payload.companyName;
        delete payload.companyLogo;
        if (payload.activityFunds === 2) {
          delete payload.registrationFee;
          delete payload.organizerPaymentQrCodeUrl;
        }
        let finalActivityId = null;
        if (mode.value === "edit") {
          payload.id = editActivityId.value;
          const res = await utils_request.request("/app-api/member/activity/edit", {
            method: "POST",
            data: payload
          });
          if (res.error)
            throw new Error(
              typeof res.error === "object" ? res.error.msg || res.error.message || JSON.stringify(
                res.error
              ) : res.error
            );
          finalActivityId = editActivityId.value;
        } else {
          const res = await utils_request.request("/app-api/member/activity/create", {
            method: "POST",
            data: payload
          });
          if (res.error)
            throw new Error(
              typeof res.error === "object" ? res.error.msg || res.error.message || JSON.stringify(
                res.error
              ) : res.error
            );
          finalActivityId = res.data;
        }
        if (finalActivityId) {
          await syncSponsorsInline(finalActivityId);
        }
        if (mode.value === "create")
          common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
        common_vendor.index.$emit("refreshActivityList");
        common_vendor.index.showModal({
          title: "成功",
          content: "发布完成",
          showCancel: false,
          success: () => common_vendor.index.navigateBack({
            delta: 1
          })
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:1136", "发布失败:", e);
        const errMsg = e.message || String(e) || "系统异常，请稍后重试";
        const isAuthError = errMsg.includes("实名") || errMsg.includes("认证") || errMsg.includes("idCert");
        common_vendor.index.showModal({
          title: isAuthError ? "需要实名认证" : "发布失败",
          content: errMsg,
          confirmText: isAuthError ? "去认证" : "我知道了",
          showCancel: isAuthError,
          cancelText: "稍后再说",
          confirmColor: "#FF6F00",
          success: (res) => {
            if (isAuthError && res.confirm) {
              common_vendor.index.navigateTo({
                url: "/packages/my-auth/my-auth"
              });
            }
          }
        });
      } finally {
        isPublishing.value = false;
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isUserVerified.value
      }, !isUserVerified.value ? {
        b: common_vendor.p({
          type: "info-filled",
          size: "18",
          color: isQuotaLoaded.value && remainingQuota.value <= 0 ? "#D32F2F" : "#FF6F00"
        }),
        c: common_vendor.t(isQuotaLoaded.value && remainingQuota.value <= 0 ? "免实名次数已用完，继续发布请先完成实名认证" : "尚未实名认证，建议完成认证保障活动安全"),
        d: isQuotaLoaded.value && remainingQuota.value <= 0 ? 1 : "",
        e: common_vendor.p({
          type: "right",
          size: "12",
          color: isQuotaLoaded.value && remainingQuota.value <= 0 ? "#D32F2F" : "#FF6F00"
        }),
        f: isQuotaLoaded.value && remainingQuota.value <= 0 ? 1 : "",
        g: common_vendor.o(goToAuthPage)
      } : {}, {
        h: common_vendor.o(($event) => form.value.activityTitle = $event),
        i: common_vendor.p({
          placeholder: "请输入聚会主题",
          inputBorder: true,
          primaryColor: "#FF6F00",
          styles: inputStyles.value,
          cursorSpacing: 30,
          adjustPosition: true,
          modelValue: form.value.activityTitle
        }),
        j: common_vendor.p({
          label: "聚会主题",
          required: true
        }),
        k: common_vendor.o(($event) => form.value.tag = $event),
        l: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择类型",
          clear: false,
          modelValue: form.value.tag
        }),
        m: common_vendor.p({
          label: "聚会类型",
          required: true
        }),
        n: form.value.coverImageUrl
      }, form.value.coverImageUrl ? {
        o: form.value.coverImageUrl
      } : {
        p: common_vendor.p({
          type: "camera-filled",
          size: "32",
          color: "#FF6F00"
        })
      }, {
        q: common_vendor.o(uploadCover),
        r: common_vendor.p({
          label: "聚会封面"
        }),
        s: common_vendor.o(handleActivityImagesUpload),
        t: common_vendor.o(($event) => form.value.activityCoverImageUrls = $event),
        v: common_vendor.p({
          ["max-count"]: 9,
          modelValue: form.value.activityCoverImageUrls
        }),
        w: common_vendor.p({
          label: "聚会图集"
        }),
        x: common_vendor.o(closePicker),
        y: common_vendor.o(onTimeRangeChange),
        z: common_vendor.o(($event) => timeRange.value = $event),
        A: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: " 至 ",
          modelValue: timeRange.value
        }),
        B: common_vendor.o(openPicker),
        C: timeRange.value && timeRange.value.length === 2
      }, timeRange.value && timeRange.value.length === 2 ? {
        D: common_vendor.p({
          type: "calendar-filled",
          size: "14",
          color: "#FF6F00"
        }),
        E: common_vendor.t(timeRange.value[0]),
        F: common_vendor.t(timeRange.value[1])
      } : {}, {
        G: common_vendor.p({
          label: "聚会时间",
          required: true
        }),
        H: common_vendor.o(closePicker),
        I: common_vendor.o(onEnrollTimeRangeChange),
        J: common_vendor.o(($event) => enrollTimeRange.value = $event),
        K: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: " 至 ",
          modelValue: enrollTimeRange.value
        }),
        L: common_vendor.o(openPicker),
        M: enrollTimeRange.value && enrollTimeRange.value.length === 2
      }, enrollTimeRange.value && enrollTimeRange.value.length === 2 ? {
        N: common_vendor.p({
          type: "time-filled",
          size: "14",
          color: "#FF6F00"
        }),
        O: common_vendor.t(enrollTimeRange.value[0]),
        P: common_vendor.t(enrollTimeRange.value[1])
      } : {}, {
        Q: common_vendor.p({
          label: "报名时间",
          required: true
        }),
        R: form.value.locationAddress
      }, form.value.locationAddress ? {
        S: common_vendor.t(form.value.locationAddress)
      } : {}, {
        T: common_vendor.p({
          type: "location",
          size: "20",
          color: "#FF6F00"
        }),
        U: common_vendor.o(openMapToChooseLocation),
        V: common_vendor.p({
          label: "聚会地点",
          required: true
        }),
        W: associatedStoreName.value
      }, associatedStoreName.value ? {
        X: common_vendor.t(associatedStoreName.value)
      } : {}, {
        Y: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        Z: common_vendor.o(goToSelectShop),
        aa: common_vendor.p({
          label: "合作聚店"
        }),
        ab: common_vendor.o(($event) => form.value.totalSlots = $event),
        ac: common_vendor.p({
          type: "number",
          placeholder: "0",
          inputBorder: true,
          styles: inputStyles.value,
          modelValue: form.value.totalSlots
        }),
        ad: common_vendor.p({
          label: "人数上限"
        }),
        ae: common_vendor.o(($event) => form.value.limitSlots = $event),
        af: common_vendor.p({
          type: "number",
          placeholder: "0",
          inputBorder: true,
          styles: inputStyles.value,
          modelValue: form.value.limitSlots
        }),
        ag: common_vendor.p({
          label: "起聚人数"
        }),
        ah: common_vendor.o(($event) => form.value.activityFunds = $event),
        ai: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "tag",
          selectedColor: "#FF6F00",
          selectedTextColor: "#FF6F00",
          modelValue: form.value.activityFunds
        }),
        aj: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        ak: [1, 3].includes(form.value.activityFunds)
      }, [1, 3].includes(form.value.activityFunds) ? {
        al: common_vendor.o(($event) => form.value.registrationFee = $event),
        am: common_vendor.p({
          type: "digit",
          placeholder: "请输入聚会费用(元)",
          inputBorder: true,
          styles: inputStyles.value,
          modelValue: form.value.registrationFee
        }),
        an: common_vendor.p({
          label: "单人费用",
          required: true
        })
      } : {}, {
        ao: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        ap: [2, 3].includes(form.value.activityFunds)
      }, [2, 3].includes(form.value.activityFunds) ? common_vendor.e({
        aq: common_vendor.t(sponsorsList.value.length > 0 ? `已添加 ${sponsorsList.value.length} 位` : "暂无赞助商"),
        ar: common_vendor.p({
          type: isSponsorExpanded.value ? "top" : "bottom",
          size: "14",
          color: "#999"
        }),
        as: common_vendor.o(($event) => isSponsorExpanded.value = !isSponsorExpanded.value),
        at: isSponsorExpanded.value
      }, isSponsorExpanded.value ? {
        av: common_vendor.f(sponsorsList.value, (item, index, i0) => {
          return {
            a: item.logoUrl,
            b: common_vendor.t(item.sponsorName),
            c: common_vendor.t(item.sponsorType === 1 ? "现金" : item.sponsorType === 2 ? "物品" : "混合"),
            d: common_vendor.t(item.sponsorType === 1 ? `￥${item.cashAmount}` : item.goodsDescription),
            e: "5d3444db-30-" + i0,
            f: common_vendor.o(($event) => handleEditSponsor(index), index),
            g: "5d3444db-31-" + i0,
            h: common_vendor.o(($event) => handleDeleteSponsor(index), index),
            i: index
          };
        }),
        aw: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FF6F00"
        }),
        ax: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ff4d4f"
        }),
        ay: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#FF6F00"
        }),
        az: common_vendor.o(handleAddSponsor)
      } : {}) : {}, {
        aA: common_vendor.o(($event) => form.value.activityDescription = $event),
        aB: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          maxlength: "2000",
          placeholder: "请输入聚会详细介绍，让大家更了解活动内容~",
          inputBorder: true,
          styles: inputStyles.value,
          ["cursor-spacing"]: 50,
          ["adjust-position"]: true,
          modelValue: form.value.activityDescription
        }),
        aC: common_vendor.p({
          label: "聚会介绍",
          required: true
        }),
        aD: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        aE: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "5d3444db-36-" + i0,
            c: common_vendor.o(($event) => removeAgenda(index), item._id || index),
            d: item.sessionTitle,
            e: common_vendor.o(($event) => item.sessionTitle = $event.detail.value, item._id || index),
            f: item.sessionDescription,
            g: common_vendor.o(($event) => item.sessionDescription = $event.detail.value, item._id || index),
            h: item._id || index
          };
        }),
        aF: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#999"
        }),
        aG: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#FF6F00"
        }),
        aH: common_vendor.o(addAgenda),
        aI: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        aJ: common_vendor.p({
          placeholder: "请输入组织者名称",
          inputBorder: true,
          styles: inputStyles.value,
          modelValue: form.value.organizerUnitName
        }),
        aK: common_vendor.p({
          label: "组织者",
          required: true
        }),
        aL: common_vendor.o(($event) => form.value.organizerContactPhone = $event),
        aM: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          inputBorder: true,
          styles: inputStyles.value,
          modelValue: form.value.organizerContactPhone
        }),
        aN: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        aO: [1, 3].includes(form.value.activityFunds)
      }, [1, 3].includes(form.value.activityFunds) ? common_vendor.e({
        aP: form.value.organizerPaymentQrCodeUrl
      }, form.value.organizerPaymentQrCodeUrl ? {
        aQ: form.value.organizerPaymentQrCodeUrl
      } : {
        aR: common_vendor.p({
          type: "scan",
          size: "28",
          color: "#ccc"
        })
      }, {
        aS: common_vendor.o(uploadCode),
        aT: common_vendor.p({
          label: "收款码",
          required: true
        })
      }) : {}, {
        aU: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        aV: mode.value === "create"
      }, mode.value === "create" ? {
        aW: common_vendor.p({
          type: "download",
          size: "16",
          color: "#666"
        }),
        aX: common_vendor.o(saveDraft)
      } : {}, {
        aY: isPublishing.value
      }, isPublishing.value ? {} : mode.value === "edit" ? {} : {}, {
        aZ: mode.value === "edit",
        ba: isPublishing.value || mode.value === "create" && isQuotaLoaded.value && remainingQuota.value <= 0 ? 1 : "",
        bb: common_vendor.o(handlePublishClick),
        bc: isPickerOpen.value ? 1 : "",
        bd: showSponsorPopup.value,
        be: common_vendor.o(($event) => showSponsorPopup.value = false),
        bf: common_vendor.o(handleSponsorSave),
        bg: common_vendor.p({
          visible: showSponsorPopup.value,
          data: currentSponsorData.value
        }),
        bh: common_vendor.sr(smartGuidePopupRef, "5d3444db-47", {
          "k": "smartGuidePopupRef"
        }),
        bi: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5d3444db"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-publish/active-publish.js.map
