"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
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
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_DragImageUploader + _easycom_uni_datetime_picker + _easycom_uni_data_checkbox + _easycom_uni_forms + SponsorPopup)();
}
const SponsorPopup = () => "../../components/sponsor-popup.js";
const DRAFT_STORAGE_KEY = "activity_draft";
const _sfc_main = {
  __name: "active-publish",
  setup(__props) {
    const isUserVerified = common_vendor.ref(true);
    const isPublishing = common_vendor.ref(false);
    const isPickerOpen = common_vendor.ref(false);
    const mode = common_vendor.ref("create");
    const editActivityId = common_vendor.ref(null);
    const timeRange = common_vendor.ref([]);
    const enrollTimeRange = common_vendor.ref([]);
    const associatedStoreName = common_vendor.ref("");
    const tagOptions = common_vendor.ref([]);
    const enrollmentOptions = common_vendor.ref([
      // 报名类型选项
      {
        text: "AA/付费",
        value: 1
      },
      {
        text: "赞助/免费",
        value: 2
      }
    ]);
    const form = common_vendor.ref({
      activityTitle: "",
      activityDescription: "",
      totalSlots: null,
      limitSlots: null,
      activityFunds: 1,
      // 1: AA, 2: 赞助
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
    common_vendor.onMounted(() => {
      checkUserVerificationStatus();
      getActiveType();
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
    common_vendor.onUnload(() => {
      common_vendor.index.$off("shopSelected");
    });
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
    };
    const checkUserVerificationStatus = async () => {
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
            // 图片路径
            cropScale: "5:4",
            // 【关键】设置裁剪比例为 5:4
            success: (cropRes) => {
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:461", "裁剪成功:", cropRes.tempFilePath);
              processUpload(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:466", "用户取消裁剪或失败:", err);
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
        // 上传目录
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
        // 建议加上这个
        sourceType: ["album", "camera"],
        // 建议加上这个
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "正在上传...",
            mask: true
          });
          try {
            const uploadPromises = res.tempFiles.map((file) => utils_upload.uploadFile({
              path: file.path
              // 适配你的 uploadFile 接口参数格式
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
            common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:555", "上传异常:", error);
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
    const addAgenda = () => form.value.activitySessions.push({
      sessionTitle: "",
      sessionDescription: ""
    });
    const removeAgenda = (i) => form.value.activitySessions.splice(i, 1);
    const handleAddSponsor = () => {
      currentSponsorIndex.value = -1;
      currentSponsorData.value = null;
      showSponsorPopup.value = true;
    };
    const handleEditSponsor = (index) => {
      currentSponsorIndex.value = index;
      currentSponsorData.value = sponsorsList.value[index];
      showSponsorPopup.value = true;
    };
    const handleDeleteSponsor = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定移除该赞助商吗？",
        success: (res) => {
          if (res.confirm) {
            const item = sponsorsList.value[index];
            if (item.id) {
              deletedSponsorIds.value.push(item.id);
            }
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
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:645", "开始同步赞助商:", activityId);
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
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:767", "获取详情用于编辑:", data);
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
      if (data.memberStoreRespVO) {
        form.value.associatedStoreId = data.memberStoreRespVO.id;
        associatedStoreName.value = data.memberStoreRespVO.storeName;
      }
      if (data.memberActivitySessionList && data.memberActivitySessionList.length > 0) {
        form.value.activitySessions = data.memberActivitySessionList.map((item) => ({
          id: item.id,
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
            common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:838", "解析赞助商图集失败:", e);
            gallery = [];
          }
          return {
            ...item,
            galleryImageUrls: gallery
          };
        });
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:846", "赞助商回显完成:", sponsorsList.value);
      } else {
        sponsorsList.value = [];
      }
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
      if (!timeRange.value.length || !enrollTimeRange.value.length)
        return common_vendor.index.showToast({
          title: "时间必填",
          icon: "none"
        });
      if (!form.value.locationAddress)
        return common_vendor.index.showToast({
          title: "地点必填",
          icon: "none"
        });
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
        if (payload.activityFunds === 2)
          delete payload.registrationFee;
        let finalActivityId = null;
        if (mode.value === "edit") {
          payload.id = editActivityId.value;
          const res = await utils_request.request("/app-api/member/activity/edit", {
            method: "POST",
            data: payload
          });
          if (res.error)
            throw new Error(res.error.msg || "修改失败");
          finalActivityId = editActivityId.value;
        } else {
          const res = await utils_request.request("/app-api/member/activity/create", {
            method: "POST",
            data: payload
          });
          if (res.error)
            throw new Error(res.error.msg || "创建失败");
          finalActivityId = res.data;
        }
        if (finalActivityId) {
          await syncSponsorsInline(finalActivityId);
        }
        if (mode.value === "create")
          common_vendor.index.removeStorageSync(DRAFT_STORAGE_KEY);
        common_vendor.index.showModal({
          title: "成功",
          content: "发布完成",
          showCancel: false,
          success: () => common_vendor.index.navigateBack({
            delta: 1
          })
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:950", e);
        common_vendor.index.showToast({
          title: e.message || "系统异常",
          icon: "none"
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
          color: "#FF6F00"
        }),
        c: common_vendor.p({
          type: "right",
          size: "12",
          color: "#FF6F00"
        }),
        d: common_vendor.o((...args) => _ctx.goToAuthPage && _ctx.goToAuthPage(...args))
      } : {}, {
        e: common_vendor.o(($event) => form.value.activityTitle = $event),
        f: common_vendor.p({
          placeholder: "请输入聚会名称",
          inputBorder: true,
          primaryColor: "#FF6F00",
          styles: _ctx.inputStyles,
          modelValue: form.value.activityTitle
        }),
        g: common_vendor.p({
          label: "聚会名称",
          required: true
        }),
        h: common_vendor.o(($event) => form.value.tag = $event),
        i: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择类型",
          clear: false,
          modelValue: form.value.tag
        }),
        j: common_vendor.p({
          label: "聚会类型",
          required: true
        }),
        k: form.value.coverImageUrl
      }, form.value.coverImageUrl ? {
        l: form.value.coverImageUrl
      } : {
        m: common_vendor.p({
          type: "camera-filled",
          size: "32",
          color: "#FF6F00"
        })
      }, {
        n: common_vendor.o(uploadCover),
        o: common_vendor.p({
          label: "聚会封面"
        }),
        p: common_vendor.o(handleActivityImagesUpload),
        q: common_vendor.o(($event) => form.value.activityCoverImageUrls = $event),
        r: common_vendor.p({
          ["max-count"]: 9,
          modelValue: form.value.activityCoverImageUrls
        }),
        s: common_vendor.p({
          label: "聚会图集"
        }),
        t: common_vendor.o(($event) => isPickerOpen.value = false),
        v: common_vendor.o(($event) => isPickerOpen.value = false),
        w: common_vendor.o(($event) => timeRange.value = $event),
        x: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: " 至 ",
          modelValue: timeRange.value
        }),
        y: common_vendor.o(($event) => isPickerOpen.value = true),
        z: common_vendor.p({
          label: "聚会时间",
          required: true
        }),
        A: common_vendor.o(($event) => isPickerOpen.value = false),
        B: common_vendor.o(($event) => isPickerOpen.value = false),
        C: common_vendor.o(($event) => enrollTimeRange.value = $event),
        D: common_vendor.p({
          type: "datetimerange",
          rangeSeparator: " 至 ",
          modelValue: enrollTimeRange.value
        }),
        E: common_vendor.o(($event) => isPickerOpen.value = true),
        F: common_vendor.p({
          label: "报名时间",
          required: true
        }),
        G: form.value.locationAddress
      }, form.value.locationAddress ? {
        H: common_vendor.t(form.value.locationAddress)
      } : {}, {
        I: common_vendor.p({
          type: "location",
          size: "20",
          color: "#FF6F00"
        }),
        J: common_vendor.o(openMapToChooseLocation),
        K: common_vendor.p({
          label: "聚会地点",
          required: true
        }),
        L: associatedStoreName.value
      }, associatedStoreName.value ? {
        M: common_vendor.t(associatedStoreName.value)
      } : {}, {
        N: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        O: common_vendor.o(goToSelectShop),
        P: common_vendor.p({
          label: "合作聚店"
        }),
        Q: common_vendor.o(($event) => form.value.totalSlots = $event),
        R: common_vendor.p({
          type: "number",
          placeholder: "0",
          inputBorder: true,
          styles: _ctx.inputStyles,
          modelValue: form.value.totalSlots
        }),
        S: common_vendor.p({
          label: "人数上限"
        }),
        T: common_vendor.o(($event) => form.value.limitSlots = $event),
        U: common_vendor.p({
          type: "number",
          placeholder: "0",
          inputBorder: true,
          styles: _ctx.inputStyles,
          modelValue: form.value.limitSlots
        }),
        V: common_vendor.p({
          label: "起聚人数"
        }),
        W: common_vendor.o(($event) => form.value.activityFunds = $event),
        X: common_vendor.p({
          localdata: enrollmentOptions.value,
          mode: "tag",
          selectedColor: "#FF6F00",
          selectedTextColor: "#FF6F00",
          modelValue: form.value.activityFunds
        }),
        Y: common_vendor.p({
          label: "报名类型",
          required: true
        }),
        Z: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? {
        aa: common_vendor.o(($event) => form.value.registrationFee = $event),
        ab: common_vendor.p({
          type: "digit",
          placeholder: "请输入聚会费用(元)",
          inputBorder: true,
          styles: _ctx.inputStyles,
          modelValue: form.value.registrationFee
        }),
        ac: common_vendor.p({
          label: "单人费用",
          required: true
        })
      } : {}, {
        ad: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        ae: form.value.activityFunds !== 1
      }, form.value.activityFunds !== 1 ? common_vendor.e({
        af: common_vendor.t(sponsorsList.value.length > 0 ? `已添加 ${sponsorsList.value.length} 位` : "暂无赞助商"),
        ag: common_vendor.p({
          type: isSponsorExpanded.value ? "top" : "bottom",
          size: "14",
          color: "#999"
        }),
        ah: common_vendor.o(($event) => isSponsorExpanded.value = !isSponsorExpanded.value),
        ai: isSponsorExpanded.value
      }, isSponsorExpanded.value ? {
        aj: common_vendor.f(sponsorsList.value, (item, index, i0) => {
          return {
            a: item.logoUrl,
            b: common_vendor.t(item.sponsorName),
            c: common_vendor.t(item.sponsorType === 1 ? "现金" : item.sponsorType === 2 ? "物品" : "混合"),
            d: common_vendor.t(item.sponsorType === 1 ? `￥${item.cashAmount}` : item.goodsDescription),
            e: "5d3444db-28-" + i0,
            f: common_vendor.o(($event) => handleEditSponsor(index), index),
            g: "5d3444db-29-" + i0,
            h: common_vendor.o(($event) => handleDeleteSponsor(index), index),
            i: index
          };
        }),
        ak: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FF6F00"
        }),
        al: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ff4d4f"
        }),
        am: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#FF6F00"
        }),
        an: common_vendor.o(handleAddSponsor)
      } : {}) : {}, {
        ao: common_vendor.o(($event) => form.value.activityDescription = $event),
        ap: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入聚会详细介绍，让大家更了解活动内容~",
          inputBorder: true,
          styles: _ctx.inputStyles,
          modelValue: form.value.activityDescription
        }),
        aq: common_vendor.p({
          label: "聚会介绍",
          required: true
        }),
        ar: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        as: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "5d3444db-34-" + i0,
            c: common_vendor.o(($event) => removeAgenda(index), index),
            d: "5d3444db-35-" + i0,
            e: common_vendor.o(($event) => item.sessionTitle = $event, index),
            f: common_vendor.p({
              placeholder: "请输入环节标题",
              inputBorder: true,
              styles: _ctx.inputStyles,
              modelValue: item.sessionTitle
            }),
            g: "5d3444db-36-" + i0,
            h: common_vendor.o(($event) => item.sessionDescription = $event, index),
            i: common_vendor.p({
              placeholder: "请输入环节描述",
              inputBorder: true,
              styles: _ctx.inputStyles,
              modelValue: item.sessionDescription
            }),
            j: index
          };
        }),
        at: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#999"
        }),
        av: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#FF6F00"
        }),
        aw: common_vendor.o(addAgenda),
        ax: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        ay: common_vendor.p({
          placeholder: "请输入组织者名称",
          inputBorder: true,
          styles: _ctx.inputStyles,
          modelValue: form.value.organizerUnitName
        }),
        az: common_vendor.p({
          label: "组织者",
          required: true
        }),
        aA: common_vendor.o(($event) => form.value.organizerContactPhone = $event),
        aB: common_vendor.p({
          type: "number",
          placeholder: "请输入联系电话",
          inputBorder: true,
          styles: _ctx.inputStyles,
          modelValue: form.value.organizerContactPhone
        }),
        aC: common_vendor.p({
          label: "联系电话",
          required: true
        }),
        aD: form.value.activityFunds === 1
      }, form.value.activityFunds === 1 ? common_vendor.e({
        aE: form.value.organizerPaymentQrCodeUrl
      }, form.value.organizerPaymentQrCodeUrl ? {
        aF: form.value.organizerPaymentQrCodeUrl
      } : {
        aG: common_vendor.p({
          type: "scan",
          size: "28",
          color: "#ccc"
        })
      }, {
        aH: common_vendor.o(uploadCode),
        aI: common_vendor.p({
          label: "收款码",
          required: true
        })
      }) : {}, {
        aJ: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        aK: mode.value === "create"
      }, mode.value === "create" ? {
        aL: common_vendor.p({
          type: "download",
          size: "16",
          color: "#666"
        }),
        aM: common_vendor.o(saveDraft)
      } : {}, {
        aN: common_vendor.t(isPublishing.value ? "处理中..." : mode.value === "edit" ? "保存修改" : "发起聚会"),
        aO: isPublishing.value ? 1 : "",
        aP: common_vendor.o(publish),
        aQ: isPickerOpen.value ? 1 : "",
        aR: common_vendor.o(($event) => showSponsorPopup.value = false),
        aS: common_vendor.o(handleSponsorSave),
        aT: common_vendor.p({
          visible: showSponsorPopup.value,
          data: currentSponsorData.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5d3444db"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-publish/active-publish.js.map
