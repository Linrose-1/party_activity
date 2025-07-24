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
const pageSize = 10;
const _sfc_main = {
  __name: "my-shopRecommend",
  setup(__props) {
    const recommendations = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const loadingMore = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const getMyRecommendations = async () => {
      if (loadingMore.value || !hasMore.value) {
        return;
      }
      loadingMore.value = true;
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        loadingMore.value = false;
        return;
      }
      const params = {
        pageNo: pageNo.value,
        pageSize,
        userId
      };
      const { data: result, error } = await utils_request.request("/app-api/member/store-recommend/list", {
        method: "GET",
        data: params
      });
      loadingMore.value = false;
      isRefreshing.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-shopRecommend/my-shopRecommend.vue:94", "获取我的推荐列表失败:", error);
        common_vendor.index.showToast({ title: error, icon: "none" });
        return;
      }
      const newList = (result == null ? void 0 : result.list) || [];
      const total = (result == null ? void 0 : result.total) || 0;
      if (newList.length > 0) {
        recommendations.value = pageNo.value === 1 ? newList : [...recommendations.value, ...newList];
        pageNo.value++;
        hasMore.value = recommendations.value.length < total;
      } else {
        if (pageNo.value === 1) {
          recommendations.value = [];
        }
        hasMore.value = false;
      }
    };
    const handleRefresh = () => {
      pageNo.value = 1;
      recommendations.value = [];
      hasMore.value = true;
      getMyRecommendations();
    };
    const loadMore = () => {
      if (hasMore.value) {
        getMyRecommendations();
      }
    };
    const onPullDownRefresh = () => {
      isRefreshing.value = true;
      handleRefresh();
    };
    common_vendor.onMounted(() => {
      handleRefresh();
    });
    const getStatusInfo = (item) => {
      switch (item.status) {
        case 1:
          return { text: "待审核", class: "status-pending" };
        case 2:
          return { text: "审核通过", class: "status-approved" };
        default:
          return { text: "未知", class: "status-unknown" };
      }
    };
    const formatTime = (item) => {
      if (!item.createTime) {
        return "N/A";
      }
      const date = new Date(item.createTime);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(recommendations.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.storeName),
            b: common_vendor.t(getStatusInfo(item).text),
            c: common_vendor.n(getStatusInfo(item).class),
            d: "29a24ad5-0-" + i0,
            e: common_vendor.t(item.fullAddress),
            f: "29a24ad5-1-" + i0,
            g: common_vendor.t(item.recommendText),
            h: "29a24ad5-2-" + i0,
            i: common_vendor.t(formatTime(item)),
            j: item.id
          };
        }),
        b: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#666"
        }),
        c: common_vendor.p({
          type: "chat-filled",
          size: "16",
          color: "#666"
        }),
        d: common_vendor.p({
          type: "calendar-filled",
          size: "16",
          color: "#999"
        }),
        e: loadingMore.value
      }, loadingMore.value ? {
        f: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        g: !hasMore.value && recommendations.value.length > 0
      }, !hasMore.value && recommendations.value.length > 0 ? {
        h: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        i: recommendations.value.length === 0 && !loadingMore.value && !isRefreshing.value
      }, recommendations.value.length === 0 && !loadingMore.value && !isRefreshing.value ? {
        j: common_vendor.p({
          type: "chat-bubble",
          size: "60",
          color: "#e0e0e0"
        })
      } : {}, {
        k: common_vendor.o(loadMore),
        l: isRefreshing.value,
        m: common_vendor.o(onPullDownRefresh)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-shopRecommend/my-shopRecommend.js.map
