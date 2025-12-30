"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
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
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_data_checkbox + _easycom_uni_forms + SponsorPopup)();
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
    const dragDisplayList = common_vendor.ref([]);
    const dragItemWidth = common_vendor.ref(0);
    const dragItemHeight = common_vendor.ref(0);
    const dragAreaHeight = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const dragIndex = common_vendor.ref(-1);
    common_vendor.onMounted(() => {
      checkUserVerificationStatus();
      getActiveType();
      initDragLayout();
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
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:435", "裁剪成功:", cropRes.tempFilePath);
              processUpload(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:440", "用户取消裁剪或失败:", err);
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
        success: async (res) => {
          const list = await Promise.all(res.tempFiles.map((f) => utils_upload.uploadFile({
            path: f.path
          }, {
            directory: "gallery"
          })));
          form.value.activityCoverImageUrls.push(...list.filter((r) => r.data).map((r) => r.data));
        }
      });
    };
    const deleteActivityImage = (i) => form.value.activityCoverImageUrls.splice(i, 1);
    const previewActivityImage = (i) => common_vendor.index.previewImage({
      urls: form.value.activityCoverImageUrls,
      current: i
    });
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
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:577", "开始同步赞助商:", activityId);
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
      common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:699", "获取详情用于编辑:", data);
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
            common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:770", "解析赞助商图集失败:", e);
            gallery = [];
          }
          return {
            ...item,
            galleryImageUrls: gallery
          };
        });
        common_vendor.index.__f__("log", "at packages/active-publish/active-publish.vue:778", "赞助商回显完成:", sponsorsList.value);
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
        common_vendor.index.__f__("error", "at packages/active-publish/active-publish.vue:882", e);
        common_vendor.index.showToast({
          title: e.message || "系统异常",
          icon: "none"
        });
      } finally {
        isPublishing.value = false;
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.watch(() => form.value.activityCoverImageUrls, (val) => {
      if (!isDragging.value) {
        dragDisplayList.value = (val || []).map((u, i) => {
          const r = Math.floor(i / 3), c = i % 3;
          return {
            id: `pg_${i}`,
            data: u,
            x: c * dragItemWidth.value,
            y: r * dragItemHeight.value,
            zIndex: 1,
            realIndex: i
          };
        });
        dragAreaHeight.value = Math.ceil((val || []).length / 3) * dragItemHeight.value;
      }
    }, {
      deep: true
    });
    const initDragLayout = () => {
      const sys = common_vendor.index.getSystemInfoSync();
      dragItemWidth.value = (sys.windowWidth - common_vendor.index.upx2px(100)) / 3;
      dragItemHeight.value = common_vendor.index.upx2px(210);
    };
    const onMovableStart = (i) => {
      isDragging.value = true;
      dragIndex.value = i;
      dragDisplayList.value[i].zIndex = 99;
    };
    const onMovableChange = (e, i) => {
      if (!isDragging.value || i !== dragIndex.value)
        return;
      const x = e.detail.x;
      const y = e.detail.y;
      const c = Math.floor((x + dragItemWidth.value / 2) / dragItemWidth.value);
      const r = Math.floor((y + dragItemHeight.value / 2) / dragItemHeight.value);
      let target = r * 3 + c;
      if (target < 0)
        target = 0;
      if (target >= dragDisplayList.value.length)
        target = dragDisplayList.value.length - 1;
      if (target !== dragIndex.value) {
        const m = dragDisplayList.value[dragIndex.value];
        dragDisplayList.value.splice(dragIndex.value, 1);
        dragDisplayList.value.splice(target, 0, m);
        dragDisplayList.value.forEach((item, idx) => {
          if (idx !== target) {
            const nr = Math.floor(idx / 3), nc = idx % 3;
            item.x = nc * dragItemWidth.value;
            item.y = nr * dragItemHeight.value;
          }
        });
        dragIndex.value = target;
      }
    };
    const onMovableEnd = () => {
      isDragging.value = false;
      if (dragIndex.value !== -1) {
        const item = dragDisplayList.value[dragIndex.value];
        item.zIndex = 1;
        const r = Math.floor(dragIndex.value / 3), c = dragIndex.value % 3;
        common_vendor.nextTick$1(() => {
          item.x = c * dragItemWidth.value;
          item.y = r * dragItemHeight.value;
        });
        form.value.activityCoverImageUrls = dragDisplayList.value.map((o) => o.data);
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
        c: common_vendor.o((...args) => _ctx.goToAuthPage && _ctx.goToAuthPage(...args))
      } : {}, {
        d: common_vendor.o(($event) => form.value.activityTitle = $event),
        e: common_vendor.p({
          placeholder: "请输入聚会名称",
          modelValue: form.value.activityTitle
        }),
        f: common_vendor.p({
          label: "聚会名称",
          required: true
        }),
        g: common_vendor.o(($event) => form.value.tag = $event),
        h: common_vendor.p({
          localdata: tagOptions.value,
          placeholder: "请选择类型",
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
        ae: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        af: common_vendor.t(sponsorsList.value.length > 0 ? `已添加 ${sponsorsList.value.length} 位` : "暂无赞助商"),
        ag: common_vendor.p({
          type: isSponsorExpanded.value ? "top" : "bottom",
          size: "16",
          color: "#999"
        }),
        ah: common_vendor.o(($event) => isSponsorExpanded.value = !isSponsorExpanded.value),
        ai: isSponsorExpanded.value
      }, isSponsorExpanded.value ? {
        aj: common_vendor.f(sponsorsList.value, (item, index, i0) => {
          return {
            a: item.logoUrl,
            b: common_vendor.t(item.sponsorName),
            c: common_vendor.t(item.sponsorType === 1 ? `现金 ￥${item.cashAmount}` : `物品: ${item.goodsDescription}`),
            d: "5d3444db-24-" + i0,
            e: common_vendor.o(($event) => handleEditSponsor(index), index),
            f: "5d3444db-25-" + i0,
            g: common_vendor.o(($event) => handleDeleteSponsor(index), index),
            h: index
          };
        }),
        ak: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#FF6F00"
        }),
        al: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#dd524d"
        }),
        am: common_vendor.p({
          type: "plusempty",
          size: "18",
          color: "#FF6F00"
        }),
        an: common_vendor.o(handleAddSponsor)
      } : {}, {
        ao: common_vendor.o(($event) => form.value.activityDescription = $event),
        ap: common_vendor.p({
          type: "textarea",
          autoHeight: true,
          placeholder: "请输入聚会详细介绍",
          modelValue: form.value.activityDescription
        }),
        aq: common_vendor.p({
          label: "聚会介绍",
          required: true,
          ["label-width"]: 80
        }),
        ar: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        as: common_vendor.f(form.value.activitySessions, (item, index, i0) => {
          return {
            a: "5d3444db-30-" + i0,
            b: common_vendor.o(($event) => item.sessionTitle = $event, index),
            c: common_vendor.p({
              placeholder: "环节标题",
              modelValue: item.sessionTitle
            }),
            d: "5d3444db-31-" + i0,
            e: common_vendor.o(($event) => item.sessionDescription = $event, index),
            f: common_vendor.p({
              placeholder: "环节描述",
              modelValue: item.sessionDescription
            }),
            g: common_vendor.o(($event) => removeAgenda(index), index),
            h: "5d3444db-32-" + i0,
            i: index
          };
        }),
        at: common_vendor.p({
          type: "close"
        }),
        av: common_vendor.p({
          type: "plusempty",
          color: "red"
        }),
        aw: common_vendor.o(addAgenda),
        ax: common_vendor.o(($event) => form.value.organizerUnitName = $event),
        ay: common_vendor.p({
          placeholder: "请输入组织者名称",
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
      } : {}, {
        aG: common_vendor.o(uploadCode),
        aH: common_vendor.p({
          label: "收款码",
          required: true
        })
      }) : {}, {
        aI: common_vendor.p({
          ["label-width"]: 80,
          ["label-position"]: "top"
        }),
        aJ: mode.value === "create"
      }, mode.value === "create" ? {
        aK: common_vendor.o(saveDraft)
      } : {}, {
        aL: common_vendor.t(isPublishing.value ? "处理中..." : mode.value === "edit" ? "保存修改" : "发起聚会"),
        aM: isPublishing.value ? 1 : "",
        aN: common_vendor.o(publish),
        aO: isPickerOpen.value ? 1 : "",
        aP: common_vendor.o(($event) => showSponsorPopup.value = false),
        aQ: common_vendor.o(handleSponsorSave),
        aR: common_vendor.p({
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
