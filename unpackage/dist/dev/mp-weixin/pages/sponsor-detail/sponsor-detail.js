"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
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
    const sponsorTypeLabel = common_vendor.computed(() => {
      const map = {
        1: "💰 现金赞助",
        2: "📦 实物赞助",
        3: "💰+📦 混合赞助"
      };
      return detail.value ? map[detail.value.sponsorType] || "赞助商" : "";
    });
    const headerImage = common_vendor.computed(() => {
      if (galleryImages.value.length > 0)
        return galleryImages.value[0];
      return "https://img.gofor.club/default_sponsor_bg.jpg";
    });
    const galleryImages = common_vendor.computed(() => {
      var _a;
      if (!((_a = detail.value) == null ? void 0 : _a.galleryImageUrls))
        return [];
      try {
        const raw = detail.value.galleryImageUrls;
        if (Array.isArray(raw))
          return raw;
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    });
    const parsedGoodsList = common_vendor.computed(() => {
      var _a;
      if (!((_a = detail.value) == null ? void 0 : _a.goodsDescription))
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
        c: common_vendor.t(sponsorTypeLabel.value),
        d: detail.value.logoUrl || "/static/default-logo.png",
        e: common_vendor.t(detail.value.sponsorName),
        f: detail.value.location
      }, detail.value.location ? {
        g: common_vendor.t(detail.value.location)
      } : {}, {
        h: detail.value.sponsorType === 1 || detail.value.sponsorType === 3
      }, detail.value.sponsorType === 1 || detail.value.sponsorType === 3 ? {
        i: common_vendor.t(detail.value.cashAmount),
        j: common_vendor.t(detail.value.perCapitalAmount),
        k: common_vendor.t(sponsorTypeLabel.value)
      } : {}, {
        l: detail.value.sponsorType === 2
      }, detail.value.sponsorType === 2 ? {} : {}, {
        m: (detail.value.sponsorType === 2 || detail.value.sponsorType === 3) && parsedGoodsList.value.length > 0
      }, (detail.value.sponsorType === 2 || detail.value.sponsorType === 3) && parsedGoodsList.value.length > 0 ? {
        n: common_vendor.f(parsedGoodsList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        })
      } : {}, {
        o: detail.value.introduction
      }, detail.value.introduction ? {
        p: common_vendor.t(detail.value.introduction)
      } : {}, {
        q: galleryImages.value.length > 0
      }, galleryImages.value.length > 0 ? {
        r: common_vendor.f(galleryImages.value, (img, idx, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewGallery(idx), idx),
            c: idx
          };
        }),
        s: galleryImages.value.length > 1,
        t: common_vendor.t(galleryImages.value.length)
      } : {}, {
        v: detail.value.contactName
      }, detail.value.contactName ? {
        w: detail.value.contactAvatar || "/static/default-avatar.png",
        x: common_vendor.t(detail.value.contactName)
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a2ebc52"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sponsor-detail/sponsor-detail.js.map
