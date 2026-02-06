"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_DragImageUploader2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_DragImageUploader = () => "../../components/DragImageUploader/DragImageUploader.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons + _easycom_DragImageUploader)();
}
const _sfc_main = {
  __name: "myStore-edit",
  setup(__props) {
    const isLoading = common_vendor.ref(true);
    const isSubmitting = common_vendor.ref(false);
    const form = common_vendor.ref({
      id: null,
      storeName: "",
      storeCoverImageUrl: "",
      storeCoverImageUrls: "",
      category: "",
      // 默认为空
      fullAddress: "",
      longitude: null,
      latitude: null,
      storeDescription: "",
      operatingHours: "",
      contactPhone: "",
      contactWechatQrCodeUrl: "",
      averageConsumptionRange: "",
      tags: []
    });
    const coverImages = common_vendor.ref([]);
    const categoryList = common_vendor.ref([]);
    const categoryOptions = common_vendor.computed(() => categoryList.value.map((item) => item.label));
    const categoryMap = common_vendor.computed(() => {
      const map = {};
      categoryList.value.forEach((item) => {
        map[item.value] = item.label;
      });
      return map;
    });
    const editableHours = common_vendor.reactive({
      // regular 现在代表“每天”的时间段列表
      // 默认初始化一个 09:00 - 22:00 的段
      regular: [{
        open: "09:00",
        close: "22:00",
        is_open: true,
        description: "全天"
      }],
      special: []
    });
    const weekDayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    common_vendor.onLoad(async (options) => {
      await getStoreCategories();
      const storeId = options.id;
      if (storeId) {
        common_vendor.index.setNavigationBarTitle({
          title: "修改聚店信息"
        });
        await getStoreDetails(storeId);
      } else {
        common_vendor.index.setNavigationBarTitle({
          title: "申请聚店入驻"
        });
        parseOperatingHours(null);
        isLoading.value = false;
      }
    });
    const getStoreCategories = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        data: {
          type: "member_store_category"
          // 根据聚店列表页的经验，类型是这个
        }
      });
      if (error) {
        common_vendor.index.showToast({
          title: "加载聚店类别失败",
          icon: "none"
        });
        categoryList.value = [];
        return;
      }
      if (data && Array.isArray(data)) {
        categoryList.value = data;
        common_vendor.index.__f__("log", "at packages/myStore-edit/myStore-edit.vue:319", "成功获取聚店类别:", categoryList.value);
      }
    };
    const getStoreDetails = async (storeId) => {
      isLoading.value = true;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/store/findStore", {
        method: "GET",
        data: {
          id: storeId
        }
      });
      isLoading.value = false;
      if (error) {
        common_vendor.index.showToast({
          title: `加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      if (!error) {
        Object.assign(form.value, data);
        parseOperatingHours(data.operatingHours);
        if (data.storeCoverImageUrls && Array.isArray(data.storeCoverImageUrls)) {
          coverImages.value = data.storeCoverImageUrls;
        }
      }
    };
    const addTimeSegment = () => {
      editableHours.regular.push({
        open: "09:00",
        close: "18:00",
        is_open: true,
        description: ""
      });
    };
    const removeTimeSegment = (index) => {
      editableHours.regular.splice(index, 1);
    };
    const parseOperatingHours = (jsonString) => {
      var _a;
      try {
        const rawData = (_a = JSON.parse(jsonString)) == null ? void 0 : _a.business_hours;
        if (!rawData || !rawData.regular)
          throw new Error("empty");
        const firstDayLabel = weekDayLabels[0];
        const dailySegments = rawData.regular.filter((item) => item.date === firstDayLabel);
        if (dailySegments.length > 0) {
          editableHours.regular = dailySegments.map((s) => ({
            open: s.open || "09:00",
            close: s.close || "22:00",
            is_open: s.is_open ?? true,
            description: s.description === firstDayLabel ? "营业时间" : s.description
          }));
        }
        editableHours.special = (rawData.special_dates || []).map((d) => ({
          ...d
        }));
      } catch (e) {
        editableHours.regular = [{
          open: "09:00",
          close: "22:00",
          is_open: true,
          description: "营业时间"
        }];
        editableHours.special = [];
      }
    };
    const serializeOperatingHours = () => {
      const regularArray = [];
      weekDayLabels.forEach((dayName) => {
        editableHours.regular.forEach((segment) => {
          regularArray.push({
            date: dayName,
            is_open: segment.is_open,
            description: segment.description || dayName,
            open: segment.open,
            close: segment.close
          });
        });
      });
      const dataToSerialize = {
        business_hours: {
          timezone: "Asia/Shanghai",
          special_dates: editableHours.special,
          regular: regularArray
        }
      };
      return JSON.stringify(dataToSerialize);
    };
    const addSpecialHour = () => {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      editableHours.special.push({
        date: today,
        is_open: true,
        open: "10:00",
        close: "22:00",
        description: ""
      });
    };
    const removeSpecialHour = (index) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "您确定要删除这条特殊营业时间吗？",
        success: (res) => {
          if (res.confirm) {
            editableHours.special.splice(index, 1);
          }
        }
      });
    };
    const handleImageUpload = (type) => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const tempFile = res.tempFiles[0];
          if (!tempFile) {
            common_vendor.index.showToast({
              title: "选择图片失败，请重试",
              icon: "none"
            });
            return;
          }
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const {
            data: fileUrl,
            error
          } = await utils_upload.uploadFile(tempFile);
          common_vendor.index.hideLoading();
          if (error) {
            common_vendor.index.showToast({
              title: `上传失败: ${error}`,
              icon: "none"
            });
            return;
          }
          if (type === "cover") {
            form.value.storeCoverImageUrl = fileUrl;
          } else if (type === "wechat") {
            form.value.contactWechatQrCodeUrl = fileUrl;
          }
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        }
      });
    };
    const handleCoverImageUpload = () => {
      if (coverImages.value.length >= 9)
        return;
      common_vendor.index.chooseImage({
        count: 9 - coverImages.value.length,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const uploadPromises = res.tempFiles.map((file) => utils_upload.uploadFile(file, {
            directory: "store-cover"
          }));
          const results = await Promise.all(uploadPromises);
          common_vendor.index.hideLoading();
          const successfulUrls = results.filter((r) => r.data).map((r) => r.data);
          coverImages.value.push(...successfulUrls);
          if (results.some((r) => r.error)) {
            common_vendor.index.showToast({
              title: "部分上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        latitude: form.value.latitude,
        longitude: form.value.longitude,
        success: (res) => {
          form.value.fullAddress = res.address;
          form.value.longitude = res.longitude;
          form.value.latitude = res.latitude;
          if (!form.value.storeName) {
            form.value.storeName = res.name;
          }
        }
      });
    };
    const handleCategoryChange = (e) => {
      const selectedIndex = e.detail.value;
      const selectedCategory = categoryList.value[selectedIndex];
      if (selectedCategory) {
        form.value.category = selectedCategory.value;
      }
    };
    const handleSubmit = async () => {
      if (!form.value.storeName.trim())
        return common_vendor.index.showToast({
          title: "请输入聚店名称",
          icon: "none"
        });
      if (!form.value.category)
        return common_vendor.index.showToast({
          title: "请选择聚店类别",
          icon: "none"
        });
      if (!form.value.fullAddress)
        return common_vendor.index.showToast({
          title: "请选择聚店地址",
          icon: "none"
        });
      if (coverImages.value.length === 0) {
        return common_vendor.index.showToast({
          title: "请至少上传一张聚店封面",
          icon: "none"
        });
      }
      isSubmitting.value = true;
      const payload = {
        ...form.value,
        storeCoverImageUrls: coverImages.value,
        operatingHours: serializeOperatingHours()
      };
      const isUpdate = !!form.value.id;
      const apiUrl = isUpdate ? "/app-api/member/store/update" : "/app-api/member/store/create";
      const successMsg = isUpdate ? "修改成功，等待审核" : "申请成功，等待审核";
      const errorMsgPrefix = isUpdate ? "修改失败: " : "申请失败: ";
      if (!isUpdate) {
        delete payload.id;
      }
      const {
        error
      } = await utils_request.request(apiUrl, {
        method: "POST",
        data: payload
      });
      isSubmitting.value = false;
      if (error) {
        common_vendor.index.showToast({
          title: `${errorMsgPrefix}${error}`,
          icon: "none",
          duration: 2e3
        });
      } else {
        common_vendor.index.showToast({
          title: successMsg,
          icon: "success"
        });
        const pages = getCurrentPages();
        if (pages.length > 1) {
          const prevPage = pages[pages.length - 2];
          if (prevPage && typeof prevPage.handleRefresh === "function") {
            prevPage.handleRefresh();
          }
        }
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isLoading.value
      }, !isLoading.value ? common_vendor.e({
        b: common_vendor.o(($event) => form.value.storeName = $event),
        c: common_vendor.p({
          placeholder: "请输入聚店名称",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          placeholderStyle: "color:#bbb;font-size:28rpx;",
          modelValue: form.value.storeName
        }),
        d: common_vendor.t(categoryMap.value[form.value.category] || "请选择聚店类别"),
        e: common_vendor.n(form.value.category ? "is-value" : "is-placeholder"),
        f: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        g: categoryOptions.value,
        h: categoryOptions.value.indexOf(categoryMap.value[form.value.category]),
        i: common_vendor.o(handleCategoryChange),
        j: common_vendor.o(handleCoverImageUpload),
        k: common_vendor.o(($event) => coverImages.value = $event),
        l: common_vendor.p({
          ["max-count"]: 9,
          modelValue: coverImages.value
        }),
        m: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF9800"
        }),
        n: common_vendor.p({
          type: "location-filled",
          size: "18",
          color: "#FF6B00"
        }),
        o: common_vendor.t(form.value.fullAddress || "点击在地图上选择"),
        p: common_vendor.n(form.value.fullAddress ? "is-value" : "is-placeholder"),
        q: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        r: common_vendor.o(openMapToChooseLocation),
        s: common_vendor.o(($event) => form.value.storeDescription = $event),
        t: common_vendor.p({
          type: "textarea",
          placeholder: "请简要介绍您的店铺特色、服务内容等...",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          placeholderStyle: "color:#bbb;font-size:28rpx;",
          modelValue: form.value.storeDescription
        }),
        v: editableHours.regular.length < 3
      }, editableHours.regular.length < 3 ? {
        w: common_vendor.p({
          type: "plusempty",
          size: "12",
          color: "#FF6B00"
        }),
        x: common_vendor.o(addTimeSegment)
      } : {}, {
        y: common_vendor.f(editableHours.regular, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.open),
            b: item.open,
            c: common_vendor.o((e) => item.open = e.detail.value, index),
            d: common_vendor.t(item.close),
            e: item.close,
            f: common_vendor.o((e) => item.close = e.detail.value, index),
            g: item.description,
            h: common_vendor.o(($event) => item.description = $event.detail.value, index)
          }, editableHours.regular.length > 1 ? {
            i: "856a9ece-8-" + i0,
            j: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#999"
            }),
            k: common_vendor.o(($event) => removeTimeSegment(index), index)
          } : {}, {
            l: index
          });
        }),
        z: editableHours.regular.length > 1,
        A: common_vendor.p({
          type: "plusempty",
          size: "12",
          color: "#FF6B00"
        }),
        B: common_vendor.o(addSpecialHour),
        C: editableHours.special.length === 0
      }, editableHours.special.length === 0 ? {} : {}, {
        D: common_vendor.f(editableHours.special, (specialDay, index, i0) => {
          return common_vendor.e({
            a: "856a9ece-10-" + i0,
            b: common_vendor.t(specialDay.date || "选择日期"),
            c: specialDay.date,
            d: common_vendor.o((e) => specialDay.date = e.detail.value, index),
            e: specialDay.is_open,
            f: common_vendor.o((e) => specialDay.is_open = e.detail.value, index),
            g: "856a9ece-11-" + i0,
            h: common_vendor.o(($event) => removeSpecialHour(index), index),
            i: specialDay.is_open
          }, specialDay.is_open ? {
            j: common_vendor.t(specialDay.open),
            k: specialDay.open,
            l: common_vendor.o((e) => specialDay.open = e.detail.value, index),
            m: common_vendor.t(specialDay.close),
            n: specialDay.close,
            o: common_vendor.o((e) => specialDay.close = e.detail.value, index),
            p: specialDay.description,
            q: common_vendor.o(($event) => specialDay.description = $event.detail.value, index)
          } : {}, {
            r: index
          });
        }),
        E: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#666"
        }),
        F: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#999"
        }),
        G: common_vendor.o(($event) => form.value.contactPhone = $event),
        H: common_vendor.p({
          type: "number",
          placeholder: "请输入电话",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          modelValue: form.value.contactPhone
        }),
        I: common_vendor.o(($event) => form.value.averageConsumptionRange = $event),
        J: common_vendor.p({
          type: "text",
          placeholder: "如: 100-200",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          modelValue: form.value.averageConsumptionRange
        }),
        K: form.value.contactWechatQrCodeUrl
      }, form.value.contactWechatQrCodeUrl ? {
        L: form.value.contactWechatQrCodeUrl
      } : {
        M: common_vendor.p({
          type: "scan",
          size: "30",
          color: "#ccc"
        })
      }, {
        N: common_vendor.o(($event) => handleImageUpload("wechat")),
        O: common_vendor.t(isSubmitting.value ? "正在提交..." : form.value.id ? "保存修改" : "自荐聚店"),
        P: common_vendor.o(handleSubmit),
        Q: isSubmitting.value,
        R: isSubmitting.value
      }) : {
        S: common_vendor.p({
          type: "spinner-cycle",
          size: "40",
          color: "#ccc"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-856a9ece"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/myStore-edit/myStore-edit.js.map
