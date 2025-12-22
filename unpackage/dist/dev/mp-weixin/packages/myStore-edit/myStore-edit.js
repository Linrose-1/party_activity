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
        common_vendor.index.__f__("log", "at packages/myStore-edit/myStore-edit.vue:271", "成功获取聚店类别:", categoryList.value);
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
        common_vendor.index.__f__("warn", "at packages/myStore-edit/myStore-edit.vue:338", "解析营业时间失败或为新建状态，将使用默认值:", e.message);
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isLoading.value
      }, !isLoading.value ? common_vendor.e({
        b: common_vendor.o(($event) => form.value.storeName = $event),
        c: common_vendor.p({
          placeholder: "请输入聚店名称",
          inputBorder: false,
          modelValue: form.value.storeName
        }),
        d: common_vendor.t(categoryMap.value[form.value.category] || "请选择聚店类别"),
        e: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        f: categoryOptions.value,
        g: categoryOptions.value.indexOf(categoryMap.value[form.value.category]),
        h: common_vendor.o(handleCategoryChange),
        i: common_vendor.f(coverImages.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => deleteCoverImage(index), index),
            c: index
          };
        }),
        j: coverImages.value.length < 9
      }, coverImages.value.length < 9 ? {
        k: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#ccc"
        }),
        l: common_vendor.o(handleCoverImageUpload)
      } : {}, {
        m: common_vendor.t(form.value.fullAddress || "点击选择位置"),
        n: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        o: common_vendor.o(openMapToChooseLocation),
        p: common_vendor.o(($event) => form.value.storeDescription = $event),
        q: common_vendor.p({
          type: "textarea",
          placeholder: "请输入聚店简介",
          inputBorder: false,
          modelValue: form.value.storeDescription
        }),
        r: common_vendor.f(editableHours.regular, (day, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(day.label),
            b: day.isOpen
          }, day.isOpen ? {
            c: common_vendor.t(day.openTime),
            d: day.openTime,
            e: common_vendor.o((e) => day.openTime = e.detail.value, index)
          } : {}, {
            f: day.isOpen
          }, day.isOpen ? {} : {}, {
            g: day.isOpen
          }, day.isOpen ? {
            h: common_vendor.t(day.closeTime),
            i: day.closeTime,
            j: common_vendor.o((e) => day.closeTime = e.detail.value, index)
          } : {}, {
            k: day.isOpen,
            l: common_vendor.o((e) => day.isOpen = e.detail.value, index),
            m: index
          });
        }),
        s: common_vendor.o(addSpecialHour),
        t: editableHours.special.length === 0
      }, editableHours.special.length === 0 ? {} : {}, {
        v: common_vendor.f(editableHours.special, (specialDay, index, i0) => {
          return common_vendor.e({
            a: "856a9ece-5-" + i0,
            b: common_vendor.t(specialDay.date || "选择日期"),
            c: specialDay.date,
            d: common_vendor.o((e) => specialDay.date = e.detail.value, index),
            e: specialDay.is_open,
            f: common_vendor.o((e) => specialDay.is_open = e.detail.value, index),
            g: common_vendor.o(($event) => removeSpecialHour(index), index),
            h: "856a9ece-6-" + i0,
            i: specialDay.is_open
          }, specialDay.is_open ? {
            j: common_vendor.t(specialDay.open),
            k: specialDay.open,
            l: common_vendor.o((e) => specialDay.open = e.detail.value, index),
            m: common_vendor.t(specialDay.close),
            n: specialDay.close,
            o: common_vendor.o((e) => specialDay.close = e.detail.value, index)
          } : {}, {
            p: "856a9ece-7-" + i0,
            q: common_vendor.o(($event) => specialDay.description = $event, index),
            r: common_vendor.p({
              placeholder: "备注说明 (如：跨年夜延长)",
              inputBorder: false,
              modelValue: specialDay.description
            }),
            s: index
          });
        }),
        w: common_vendor.p({
          type: "calendar-filled",
          size: "16",
          color: "#666"
        }),
        x: common_vendor.p({
          type: "trash-filled",
          size: "22",
          color: "#e43d33"
        }),
        y: common_vendor.o(($event) => form.value.contactPhone = $event),
        z: common_vendor.p({
          type: "text",
          placeholder: "请输入联系电话",
          inputBorder: false,
          modelValue: form.value.contactPhone
        }),
        A: common_vendor.o(($event) => form.value.averageConsumptionRange = $event),
        B: common_vendor.p({
          type: "text",
          placeholder: "例如：100-200",
          inputBorder: false,
          modelValue: form.value.averageConsumptionRange
        }),
        C: form.value.contactWechatQrCodeUrl || "/static/images/placeholder-qr.png",
        D: common_vendor.o(($event) => handleImageUpload("wechat")),
        E: common_vendor.t(isSubmitting.value ? "提交中..." : form.value.id ? "提交修改" : "申请入驻"),
        F: common_vendor.o(handleSubmit),
        G: isSubmitting.value,
        H: isSubmitting.value
      }) : {
        I: common_vendor.p({
          type: "spinner-cycle",
          size: "30",
          color: "#999"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-856a9ece"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/myStore-edit/myStore-edit.js.map
