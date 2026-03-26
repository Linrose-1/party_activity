"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "sponsor-list",
  setup(__props) {
    const sponsorList = common_vendor.ref([]);
    const activityId = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.activityId) {
        activityId.value = options.activityId;
      }
      if (options.data) {
        try {
          const decodedData = decodeURIComponent(options.data);
          sponsorList.value = JSON.parse(decodedData);
          common_vendor.index.__f__("log", "at packages/sponsor-list/sponsor-list.vue:73", "✅ 赞助商数据解析成功:", sponsorList.value);
        } catch (e) {
          common_vendor.index.__f__("error", "at packages/sponsor-list/sponsor-list.vue:75", "❌ 解析赞助商数据失败:", e);
          common_vendor.index.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      }
    });
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/sponsor-detail/sponsor-detail?sponsorId=${item.id}&activityId=${activityId.value}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(sponsorList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: item.logoUrl || "/static/images/default-store.png",
            c: common_vendor.t(item.sponsorName),
            d: common_vendor.t(item.introduction || "致力为商友提供优质资源与服务"),
            e: item.sponsorType === 1
          }, item.sponsorType === 1 ? {} : item.sponsorType === 2 ? {} : {}, {
            f: item.sponsorType === 2,
            g: "008c2f84-0-" + i0,
            h: item.id,
            i: common_vendor.o(($event) => goToDetail(item), item.id)
          });
        }),
        b: common_vendor.p({
          type: "right",
          size: "14",
          color: "#FF62B1"
        }),
        c: sponsorList.value.length === 0
      }, sponsorList.value.length === 0 ? {
        d: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ddd"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-008c2f84"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/sponsor-list/sponsor-list.js.map
