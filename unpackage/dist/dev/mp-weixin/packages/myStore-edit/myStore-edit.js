"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons)();
}
const dragColumns = 3;
const dragItemHeightRpx = 210;
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
      regular: [],
      special: []
    });
    const weekdays = [
      {
        key: "monday",
        label: "周一"
      },
      {
        key: "tuesday",
        label: "周二"
      },
      {
        key: "wednesday",
        label: "周三"
      },
      {
        key: "thursday",
        label: "周四"
      },
      {
        key: "friday",
        label: "周五"
      },
      {
        key: "saturday",
        label: "周六"
      },
      {
        key: "sunday",
        label: "周日"
      }
    ];
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
        common_vendor.index.__f__("log", "at packages/myStore-edit/myStore-edit.vue:358", "成功获取聚店类别:", categoryList.value);
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
    const parseOperatingHours = (jsonString) => {
      var _a;
      try {
        const data = (_a = JSON.parse(jsonString)) == null ? void 0 : _a.business_hours;
        if (!data || !data.regular)
          throw new Error("无效的营业时间格式");
        editableHours.regular = weekdays.map((dayInfo) => {
          const dayData = data.regular[dayInfo.key];
          return {
            key: dayInfo.key,
            label: dayInfo.label,
            isOpen: (dayData == null ? void 0 : dayData.is_open) ?? false,
            openTime: (dayData == null ? void 0 : dayData.open) ?? "09:00",
            closeTime: (dayData == null ? void 0 : dayData.close) ?? "22:00"
          };
        });
        editableHours.special = (data.special_dates || []).map((d) => ({
          date: d.date || "",
          is_open: d.is_open ?? true,
          open: d.open || "10:00",
          close: d.close || "22:00",
          description: d.description || ""
        }));
      } catch (e) {
        common_vendor.index.__f__("warn", "at packages/myStore-edit/myStore-edit.vue:425", "解析营业时间失败或为新建状态，将使用默认值:", e.message);
        editableHours.regular = weekdays.map((dayInfo) => ({
          key: dayInfo.key,
          label: dayInfo.label,
          isOpen: true,
          openTime: "09:00",
          closeTime: "22:00"
        }));
        editableHours.special = [];
      }
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
    const serializeOperatingHours = () => {
      const regularData = editableHours.regular.reduce((acc, day) => {
        acc[day.key] = {
          open: day.openTime,
          close: day.closeTime,
          is_open: day.isOpen
        };
        return acc;
      }, {});
      const dataToSerialize = {
        business_hours: {
          regular: regularData,
          special_dates: editableHours.special,
          timezone: "Asia/Shanghai"
        }
      };
      return JSON.stringify(dataToSerialize);
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
              title: "部分图片上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const deleteCoverImage = (index) => {
      coverImages.value.splice(index, 1);
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
    common_vendor.watch(() => coverImages.value, (newVal) => {
      if (!isDragging.value) {
        initDragList(newVal);
      }
    }, {
      deep: true
    });
    const initDragList = (originList) => {
      if (!originList || originList.length === 0) {
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
        coverImages.value = sortedUrls;
      }
      dragIndex.value = -1;
    };
    const previewCoverImage = (index) => {
      common_vendor.index.previewImage({
        urls: coverImages.value,
        current: index
      });
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
        j: common_vendor.f(dragDisplayList.value, (item, index, i0) => {
          return {
            a: item.data,
            b: common_vendor.o(($event) => previewCoverImage(item.realIndex), item.id),
            c: "856a9ece-2-" + i0,
            d: common_vendor.o(($event) => deleteCoverImage(item.realIndex), item.id),
            e: item.id,
            f: item.x,
            g: item.y,
            h: item.zIndex,
            i: !isDragging.value && item.zIndex === 1,
            j: common_vendor.o(($event) => onMovableChange($event, index), item.id),
            k: common_vendor.o(($event) => onMovableStart(index), item.id),
            l: common_vendor.o(onMovableEnd, item.id)
          };
        }),
        k: common_vendor.p({
          type: "closeempty",
          size: "12",
          color: "#fff"
        }),
        l: dragItemWidth.value + "px",
        m: dragItemHeight.value + "px",
        n: dragAreaHeight.value + "px",
        o: dragAreaHeight.value > 0 ? dragAreaHeight.value + "px" : "0",
        p: coverImages.value.length < 9
      }, coverImages.value.length < 9 ? {
        q: common_vendor.p({
          type: "plusempty",
          size: "28",
          color: "#ccc"
        }),
        r: common_vendor.o(handleCoverImageUpload)
      } : {}, {
        s: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF9800"
        }),
        t: common_vendor.p({
          type: "location-filled",
          size: "18",
          color: "#FF6B00"
        }),
        v: common_vendor.t(form.value.fullAddress || "点击在地图上选择"),
        w: common_vendor.n(form.value.fullAddress ? "is-value" : "is-placeholder"),
        x: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        y: common_vendor.o(openMapToChooseLocation),
        z: common_vendor.o(($event) => form.value.storeDescription = $event),
        A: common_vendor.p({
          type: "textarea",
          placeholder: "请简要介绍您的店铺特色、服务内容等...",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          placeholderStyle: "color:#bbb;font-size:28rpx;",
          modelValue: form.value.storeDescription
        }),
        B: common_vendor.f(editableHours.regular, (day, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(day.label),
            b: day.isOpen
          }, day.isOpen ? {
            c: common_vendor.t(day.openTime),
            d: day.openTime,
            e: common_vendor.o((e) => day.openTime = e.detail.value, index),
            f: common_vendor.t(day.closeTime),
            g: day.closeTime,
            h: common_vendor.o((e) => day.closeTime = e.detail.value, index)
          } : {}, {
            i: day.isOpen,
            j: common_vendor.o((e) => day.isOpen = e.detail.value, index),
            k: index
          });
        }),
        C: common_vendor.p({
          type: "plusempty",
          size: "12",
          color: "#FF6B00"
        }),
        D: common_vendor.o(addSpecialHour),
        E: editableHours.special.length === 0
      }, editableHours.special.length === 0 ? {} : {}, {
        F: common_vendor.f(editableHours.special, (specialDay, index, i0) => {
          return common_vendor.e({
            a: "856a9ece-9-" + i0,
            b: common_vendor.t(specialDay.date || "选择日期"),
            c: specialDay.date,
            d: common_vendor.o((e) => specialDay.date = e.detail.value, index),
            e: specialDay.is_open,
            f: common_vendor.o((e) => specialDay.is_open = e.detail.value, index),
            g: "856a9ece-10-" + i0,
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
        G: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#666"
        }),
        H: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#999"
        }),
        I: common_vendor.o(($event) => form.value.contactPhone = $event),
        J: common_vendor.p({
          type: "number",
          placeholder: "请输入电话",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          modelValue: form.value.contactPhone
        }),
        K: common_vendor.o(($event) => form.value.averageConsumptionRange = $event),
        L: common_vendor.p({
          type: "text",
          placeholder: "如: 100-200",
          inputBorder: false,
          styles: {
            backgroundColor: "transparent"
          },
          modelValue: form.value.averageConsumptionRange
        }),
        M: form.value.contactWechatQrCodeUrl
      }, form.value.contactWechatQrCodeUrl ? {
        N: form.value.contactWechatQrCodeUrl
      } : {
        O: common_vendor.p({
          type: "scan",
          size: "30",
          color: "#ccc"
        })
      }, {
        P: common_vendor.o(($event) => handleImageUpload("wechat")),
        Q: common_vendor.t(isSubmitting.value ? "正在提交..." : form.value.id ? "保存修改" : "立即入驻"),
        R: common_vendor.o(handleSubmit),
        S: isSubmitting.value,
        T: isSubmitting.value
      }) : {
        U: common_vendor.p({
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
