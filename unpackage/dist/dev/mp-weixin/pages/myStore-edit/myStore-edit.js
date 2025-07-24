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
      category: "",
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
    const editableHours = common_vendor.reactive({
      regular: [],
      special: []
    });
    const weekdays = [
      { key: "monday", label: "周一" },
      { key: "tuesday", label: "周二" },
      { key: "wednesday", label: "周三" },
      { key: "thursday", label: "周四" },
      { key: "friday", label: "周五" },
      { key: "saturday", label: "周六" },
      { key: "sunday", label: "周日" }
    ];
    const getStoreDetails = async (storeId) => {
      isLoading.value = true;
      const { data, error } = await utils_request.request("/app-api/member/store/findStore", {
        method: "GET",
        data: { id: storeId }
      });
      isLoading.value = false;
      if (error) {
        common_vendor.index.showToast({ title: `加载失败: ${error}`, icon: "none" });
        return;
      }
      Object.assign(form.value, data);
      parseOperatingHours(data.operatingHours);
    };
    common_vendor.onLoad(async (options) => {
      const storeId = options.id;
      if (!storeId) {
        common_vendor.index.showToast({ title: "无效的聚店ID", icon: "error" });
        common_vendor.index.navigateBack();
        return;
      }
      await getStoreDetails(storeId);
    });
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
        editableHours.special = data.special_dates || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/myStore-edit/myStore-edit.vue:203", "解析营业时间失败，将使用默认值:", e);
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
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "上传中..." });
          const { data: fileUrl, error } = await utils_upload.uploadFile(tempFilePath);
          common_vendor.index.hideLoading();
          if (error) {
            common_vendor.index.showToast({ title: `上传失败: ${error}`, icon: "none" });
            return;
          }
          if (type === "cover") {
            form.value.storeCoverImageUrl = fileUrl;
          } else if (type === "wechat") {
            form.value.contactWechatQrCodeUrl = fileUrl;
          }
          common_vendor.index.showToast({ title: "上传成功", icon: "success" });
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
        },
        fail: (err) => {
          if (!err.errMsg.includes("cancel")) {
            common_vendor.index.showToast({ title: "选择位置失败", icon: "none" });
          }
        }
      });
    };
    const handleSubmit = async () => {
      if (!form.value.storeName.trim()) {
        return common_vendor.index.showToast({ title: "请输入聚店名称", icon: "none" });
      }
      if (!form.value.fullAddress) {
        return common_vendor.index.showToast({ title: "请选择聚店地址", icon: "none" });
      }
      isSubmitting.value = true;
      const operatingHoursJson = serializeOperatingHours();
      const payload = {
        ...form.value,
        operatingHours: operatingHoursJson
      };
      const { error } = await utils_request.request("/app-api/member/store/update", {
        method: "POST",
        data: payload
      });
      isSubmitting.value = false;
      if (error) {
        common_vendor.index.showToast({ title: `修改失败: ${error}`, icon: "none", duration: 2e3 });
      } else {
        common_vendor.index.showToast({ title: "修改成功，等待审核", icon: "none" });
        const pages = getCurrentPages();
        if (pages.length > 1) {
          const prevPage = pages[pages.length - 2];
          if (prevPage && typeof prevPage.handleRefresh === "function") {
            prevPage.handleRefresh();
          }
        }
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isLoading.value
      }, !isLoading.value ? {
        b: common_vendor.o(($event) => form.value.storeName = $event),
        c: common_vendor.p({
          placeholder: "请输入聚店名称",
          inputBorder: false,
          modelValue: form.value.storeName
        }),
        d: form.value.storeCoverImageUrl || "/static/images/placeholder-cover.png",
        e: common_vendor.o(($event) => handleImageUpload("cover")),
        f: common_vendor.t(form.value.fullAddress || "点击选择位置"),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        h: common_vendor.o(openMapToChooseLocation),
        i: common_vendor.o(($event) => form.value.storeDescription = $event),
        j: common_vendor.p({
          type: "textarea",
          placeholder: "请输入聚店简介",
          inputBorder: false,
          modelValue: form.value.storeDescription
        }),
        k: common_vendor.f(editableHours.regular, (day, index, i0) => {
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
        l: common_vendor.o(($event) => form.value.contactPhone = $event),
        m: common_vendor.p({
          type: "text",
          placeholder: "请输入联系电话",
          inputBorder: false,
          modelValue: form.value.contactPhone
        }),
        n: common_vendor.o(($event) => form.value.averageConsumptionRange = $event),
        o: common_vendor.p({
          type: "text",
          placeholder: "例如：100-200",
          inputBorder: false,
          modelValue: form.value.averageConsumptionRange
        }),
        p: form.value.contactWechatQrCodeUrl || "/static/images/placeholder-qr.png",
        q: common_vendor.o(($event) => handleImageUpload("wechat")),
        r: common_vendor.t(isSubmitting.value ? "提交中..." : "提交审核"),
        s: common_vendor.o(handleSubmit),
        t: isSubmitting.value,
        v: isSubmitting.value
      } : {
        w: common_vendor.p({
          type: "spinner-cycle",
          size: "30",
          color: "#999"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1bd087ec"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/myStore-edit/myStore-edit.js.map
