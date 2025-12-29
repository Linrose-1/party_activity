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
        g: detail.value.sponsorType === 1
      }, detail.value.sponsorType === 1 ? {
        h: common_vendor.t(detail.value.cashAmount),
        i: common_vendor.t(detail.value.perCapitalAmount)
      } : {
        j: common_vendor.t(detail.value.goodsDescription),
        k: common_vendor.t(detail.value.goodsNum)
      }, {
        l: common_vendor.t(detail.value.introduction),
        m: galleryImages.value.length > 0
      }, galleryImages.value.length > 0 ? {
        n: common_vendor.f(galleryImages.value, (img, idx, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewGallery(idx), idx),
            c: idx
          };
        })
      } : {}, {
        o: detail.value.contactName
      }, detail.value.contactName ? {
        p: detail.value.contactAvatar || "/static/default-avatar.png",
        q: common_vendor.t(detail.value.contactName)
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a2ebc52"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sponsor-detail/sponsor-detail.js.map
