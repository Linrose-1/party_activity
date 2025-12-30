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
  __name: "sponsor-detail",
  setup(__props) {
    const detail = common_vendor.ref(null);
    common_vendor.onLoad(async (options) => {
      if (options.sponsorId && options.activityId) {
        loadDetail(options.sponsorId, options.activityId);
      }
    });
    const loadDetail = async (sponsorId, activityId) => {
      common_vendor.index.showLoading({
        title: "加载中"
      });
      const res = await utils_request.request("/app-api/member/sponsor-activity-record/get", {
        method: "GET",
        data: {
          sponsorId,
          activityId
        }
      });
      common_vendor.index.hideLoading();
      if (!res.error && res.data) {
        detail.value = res.data;
      }
    };
    const headerImage = common_vendor.computed(() => {
      if (galleryImages.value.length > 0)
        return galleryImages.value[0];
      return "https://img.gofor.club/default_sponsor_bg.jpg";
    });
    const galleryImages = common_vendor.computed(() => {
      if (!detail.value || !detail.value.galleryImageUrls)
        return [];
      try {
        return JSON.parse(detail.value.galleryImageUrls);
      } catch (e) {
        return [];
      }
    });
    const parsedGoodsList = common_vendor.computed(() => {
      if (!detail.value || !detail.value.goodsDescription)
        return [];
      try {
        const raw = detail.value.goodsDescription;
        if (Array.isArray(raw))
          return raw;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (typeof item === "object" && item !== null) {
              return item.desc || item.name || JSON.stringify(item);
            }
            return String(item);
          });
        }
        return [String(parsed)];
      } catch (e) {
        return [detail.value.goodsDescription];
      }
    });
    const previewGallery = (current) => {
      common_vendor.index.previewImage({
        urls: galleryImages.value,
        current
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: detail.value
      }, detail.value ? common_vendor.e({
        b: headerImage.value,
        c: detail.value.logoUrl,
        d: common_vendor.t(detail.value.sponsorName),
        e: detail.value.location
      }, detail.value.location ? {
        f: common_vendor.t(detail.value.location)
      } : {}, {
        g: detail.value.sponsorType === 1 || detail.value.sponsorType === 3
      }, detail.value.sponsorType === 1 || detail.value.sponsorType === 3 ? {
        h: common_vendor.t(detail.value.cashAmount),
        i: common_vendor.t(detail.value.perCapitalAmount)
      } : {}, {
        j: detail.value.sponsorType === 3
      }, detail.value.sponsorType === 3 ? {} : {}, {
        k: detail.value.sponsorType === 2 || detail.value.sponsorType === 3
      }, detail.value.sponsorType === 2 || detail.value.sponsorType === 3 ? common_vendor.e({
        l: parsedGoodsList.value.length > 0
      }, parsedGoodsList.value.length > 0 ? {
        m: common_vendor.f(parsedGoodsList.value, (item, index, i0) => {
          return {
            a: "5a2ebc52-0-" + i0,
            b: common_vendor.t(item),
            c: index
          };
        }),
        n: common_vendor.p({
          type: "gift-filled",
          size: "14",
          color: "#19be6b"
        })
      } : {}) : {}, {
        o: common_vendor.t(detail.value.introduction),
        p: galleryImages.value.length > 0
      }, galleryImages.value.length > 0 ? {
        q: common_vendor.f(galleryImages.value, (img, idx, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewGallery(idx), idx),
            c: idx
          };
        })
      } : {}, {
        r: detail.value.contactName
      }, detail.value.contactName ? {
        s: detail.value.contactAvatar || "/static/default-avatar.png",
        t: common_vendor.t(detail.value.contactName)
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a2ebc52"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sponsor-detail/sponsor-detail.js.map
