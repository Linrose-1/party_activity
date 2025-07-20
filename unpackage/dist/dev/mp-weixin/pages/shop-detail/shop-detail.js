"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "shop-detail",
  setup(__props) {
    const storeDetail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const formattedOperatingHours = common_vendor.computed(() => {
      const defaultResult = {
        regular: [],
        special: []
      };
      if (!storeDetail.value || !storeDetail.value.operatingHours) {
        return defaultResult;
      }
      try {
        const hoursData = JSON.parse(storeDetail.value.operatingHours);
        const businessHours = hoursData.business_hours;
        if (!businessHours)
          return defaultResult;
        const dayMap = {
          monday: "周一",
          tuesday: "周二",
          wednesday: "周三",
          thursday: "周四",
          friday: "周五",
          saturday: "周六",
          sunday: "周日"
        };
        const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const regular = dayOrder.filter((day) => businessHours.regular[day] && businessHours.regular[day].is_open).map((day) => {
          const time = businessHours.regular[day];
          return {
            day: dayMap[day],
            time: `${time.open} - ${time.close}`
          };
        });
        const special = (businessHours.special_dates || []).map((item) => {
          return {
            date: item.date,
            description: item.description,
            status: item.is_open ? `${item.open} - ${item.close}` : "休息"
          };
        });
        return {
          regular,
          special
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shop-detail/shop-detail.vue:185", "解析营业时间失败:", error);
        return { regular: [{ day: "营业时间", time: storeDetail.value.operatingHours }], special: [] };
      }
    });
    common_vendor.onLoad(async (options) => {
      const storeId = options.id;
      if (!storeId) {
        common_vendor.index.showToast({
          title: "无效的聚店ID",
          icon: "error"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1e3);
        return;
      }
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
        common_vendor.index.__f__("error", "at pages/shop-detail/shop-detail.vue:217", "获取聚店详情失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      storeDetail.value = data;
      common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:226", "聚店详情数据:", storeDetail.value);
    });
    const openMap = () => {
      if (!storeDetail.value)
        return;
      common_vendor.index.openLocation({
        latitude: storeDetail.value.latitude,
        longitude: storeDetail.value.longitude,
        name: storeDetail.value.storeName,
        address: storeDetail.value.fullAddress,
        fail: (err) => {
          common_vendor.index.showToast({ title: "无法打开地图", icon: "none" });
        }
      });
    };
    const openNavigation = openMap;
    const callPhone = () => {
      if (!storeDetail.value)
        return;
      const phoneNumber = storeDetail.value.contactPhone;
      if (!phoneNumber) {
        common_vendor.index.showToast({
          title: "该聚店暂无联系电话",
          icon: "none"
        });
        return;
      }
      common_vendor.index.makePhoneCall({
        phoneNumber,
        fail: (err) => {
          common_vendor.index.showToast({ title: "拨打电话失败", icon: "none" });
        }
      });
    };
    const previewImage = (imageUrl) => {
      common_vendor.index.previewImage({
        urls: [imageUrl],
        current: imageUrl
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: storeDetail.value
      }, storeDetail.value ? common_vendor.e({
        b: common_vendor.t(storeDetail.value.storeName),
        c: storeDetail.value.distance !== null
      }, storeDetail.value.distance !== null ? {
        d: common_vendor.p({
          type: "paperplane-filled",
          color: "#fff",
          size: "16"
        }),
        e: common_vendor.t(storeDetail.value.distance)
      } : {}, {
        f: storeDetail.value.storeCoverImageUrl ? `url(${storeDetail.value.storeCoverImageUrl})` : "linear-gradient(45deg, #2c3e50, #4a6491)",
        g: storeDetail.value.tags && storeDetail.value.tags.length > 0
      }, storeDetail.value.tags && storeDetail.value.tags.length > 0 ? {
        h: common_vendor.f(storeDetail.value.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        i: common_vendor.t(storeDetail.value.storeDescription || "暂无简介"),
        j: common_vendor.t(storeDetail.value.fullAddress || "暂无地址信息"),
        k: formattedOperatingHours.value.regular.length > 0
      }, formattedOperatingHours.value.regular.length > 0 ? common_vendor.e({
        l: common_vendor.f(formattedOperatingHours.value.regular, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.day),
            b: common_vendor.t(item.time),
            c: item.day
          };
        }),
        m: formattedOperatingHours.value.special.length > 0
      }, formattedOperatingHours.value.special.length > 0 ? {
        n: common_vendor.f(formattedOperatingHours.value.special, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.description),
            c: common_vendor.t(item.status),
            d: item.date
          };
        })
      } : {}) : {}, {
        o: storeDetail.value.contactPhone
      }, storeDetail.value.contactPhone ? {
        p: common_vendor.t(storeDetail.value.contactPhone)
      } : {}, {
        q: storeDetail.value.contactWechatQrCodeUrl
      }, storeDetail.value.contactWechatQrCodeUrl ? {
        r: storeDetail.value.contactWechatQrCodeUrl,
        s: common_vendor.o(($event) => previewImage(storeDetail.value.contactWechatQrCodeUrl))
      } : {}, {
        t: storeDetail.value.averageConsumptionRange
      }, storeDetail.value.averageConsumptionRange ? {
        v: common_vendor.t(storeDetail.value.averageConsumptionRange)
      } : {}, {
        w: common_vendor.p({
          type: "map-pin-ellipse",
          size: "40",
          color: "#ccc"
        }),
        x: common_vendor.o(openMap),
        y: common_vendor.p({
          type: "map-filled",
          color: "#FF6B00",
          size: "20"
        }),
        z: common_vendor.o((...args) => common_vendor.unref(openNavigation) && common_vendor.unref(openNavigation)(...args)),
        A: common_vendor.p({
          type: "phone-filled",
          color: "#fff",
          size: "20"
        }),
        B: common_vendor.o(callPhone)
      }) : {
        C: common_vendor.p({
          type: "spinner-cycle",
          size: "30",
          color: "#999"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b8678dae"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop-detail/shop-detail.js.map
