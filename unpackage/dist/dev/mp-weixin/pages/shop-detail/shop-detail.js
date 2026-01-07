"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + PointsFeedbackPopup)();
}
const PointsFeedbackPopup = () => "../../components/PointsFeedbackPopup.js";
const _sfc_main = {
  __name: "shop-detail",
  setup(__props) {
    const storeDetail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const pointsPopup = common_vendor.ref(null);
    const coverImages = common_vendor.computed(() => {
      if (storeDetail.value && Array.isArray(storeDetail.value.storeCoverImageUrls)) {
        return storeDetail.value.storeCoverImageUrls;
      }
      if (storeDetail.value && storeDetail.value.storeCoverImageUrl) {
        return [storeDetail.value.storeCoverImageUrl];
      }
      return [];
    });
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
        common_vendor.index.__f__("error", "at pages/shop-detail/shop-detail.vue:230", "解析营业时间失败:", error);
        return {
          regular: [{
            day: "营业时间",
            time: storeDetail.value.operatingHours
          }],
          special: []
        };
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
        common_vendor.index.__f__("error", "at pages/shop-detail/shop-detail.vue:268", "获取聚店详情失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      storeDetail.value = data;
      common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:277", "聚店详情数据:", storeDetail.value);
      if (data.checkContribution === 1) {
        setTimeout(() => {
          if (pointsPopup.value) {
            pointsPopup.value.show("查看聚店详情", 10);
          }
        }, 500);
      }
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
          common_vendor.index.showToast({
            title: "无法打开地图",
            icon: "none"
          });
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
          common_vendor.index.showToast({
            title: "拨打电话失败",
            icon: "none"
          });
        }
      });
    };
    const previewImage = (urls, current = 0) => {
      if (!urls || urls.length === 0)
        return;
      const finalUrls = Array.isArray(urls) ? urls : [urls];
      common_vendor.index.previewImage({
        urls: finalUrls,
        current: Array.isArray(urls) ? urls[current] : urls
        // 兼容旧的单图预览
      });
    };
    common_vendor.onShareAppMessage(() => {
      if (!storeDetail.value)
        return {};
      return {
        title: storeDetail.value.storeName + " - 聚店推荐",
        path: `/pages/shop-detail/shop-detail?id=${storeDetail.value.id}`,
        imageUrl: coverImages.value[0] || ""
        // 封面图（支持可选）
      };
    });
    common_vendor.onShareTimeline(() => {
      if (!storeDetail.value)
        return {};
      return {
        title: storeDetail.value.storeName + " - 聚店推荐",
        query: `id=${storeDetail.value.id}`,
        imageUrl: coverImages.value[0] || ""
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: storeDetail.value
      }, storeDetail.value ? common_vendor.e({
        b: coverImages.value.length > 0
      }, coverImages.value.length > 0 ? {
        c: common_vendor.f(coverImages.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(coverImages.value, index), index),
            c: index
          };
        })
      } : {
        d: common_vendor.t(storeDetail.value.storeName)
      }, {
        e: common_vendor.t(storeDetail.value.storeName),
        f: storeDetail.value.distance !== null
      }, storeDetail.value.distance !== null ? {
        g: common_vendor.p({
          type: "paperplane-filled",
          color: "#fff",
          size: "16"
        }),
        h: common_vendor.t(storeDetail.value.distance)
      } : {}, {
        i: storeDetail.value.tags && storeDetail.value.tags.length > 0
      }, storeDetail.value.tags && storeDetail.value.tags.length > 0 ? {
        j: common_vendor.f(storeDetail.value.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        k: common_vendor.t(storeDetail.value.storeDescription || "暂无简介"),
        l: common_vendor.t(storeDetail.value.fullAddress || "暂无地址信息"),
        m: formattedOperatingHours.value.regular.length > 0
      }, formattedOperatingHours.value.regular.length > 0 ? common_vendor.e({
        n: common_vendor.f(formattedOperatingHours.value.regular, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.day),
            b: common_vendor.t(item.time),
            c: item.day
          };
        }),
        o: formattedOperatingHours.value.special.length > 0
      }, formattedOperatingHours.value.special.length > 0 ? {
        p: common_vendor.f(formattedOperatingHours.value.special, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.description),
            c: common_vendor.t(item.status),
            d: item.date
          };
        })
      } : {}) : {}, {
        q: storeDetail.value.contactPhone
      }, storeDetail.value.contactPhone ? {
        r: common_vendor.t(storeDetail.value.contactPhone)
      } : {}, {
        s: storeDetail.value.contactWechatQrCodeUrl
      }, storeDetail.value.contactWechatQrCodeUrl ? {
        t: storeDetail.value.contactWechatQrCodeUrl,
        v: common_vendor.o(($event) => previewImage(storeDetail.value.contactWechatQrCodeUrl))
      } : {}, {
        w: storeDetail.value.averageConsumptionRange
      }, storeDetail.value.averageConsumptionRange ? {
        x: common_vendor.t(storeDetail.value.averageConsumptionRange)
      } : {}, {
        y: common_vendor.p({
          type: "map-pin-ellipse",
          size: "40",
          color: "#ccc"
        }),
        z: common_vendor.o(openMap),
        A: common_vendor.p({
          type: "map-filled",
          color: "#FF6B00",
          size: "20"
        }),
        B: common_vendor.o((...args) => common_vendor.unref(openNavigation) && common_vendor.unref(openNavigation)(...args)),
        C: common_vendor.p({
          type: "phone-filled",
          color: "#fff",
          size: "20"
        }),
        D: common_vendor.o(callPhone),
        E: common_vendor.sr(pointsPopup, "b8678dae-4", {
          "k": "pointsPopup"
        })
      }) : {
        F: common_vendor.p({
          type: "spinner-cycle",
          size: "30",
          color: "#999"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b8678dae"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop-detail/shop-detail.js.map
