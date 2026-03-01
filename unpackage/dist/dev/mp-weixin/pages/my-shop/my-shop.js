"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + StoreCard)();
}
const StoreCard = () => "../../components/StoreCard.js";
const pageSize = 10;
const _sfc_main = {
  __name: "my-shop",
  setup(__props) {
    const searchTerm = common_vendor.ref("");
    const stores = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const loadingMore = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const isLoading = common_vendor.ref(false);
    const getMyStores = async () => {
      if (loadingMore.value || pageNo.value > 1 && !hasMore.value)
        return;
      loadingMore.value = true;
      const {
        data: result,
        error
      } = await utils_request.request("/app-api/member/store/my-list", {
        method: "GET",
        data: {
          pageNo: pageNo.value,
          pageSize,
          storeName: searchTerm.value.trim()
        }
      });
      loadingMore.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-shop/my-shop.vue:97", "[我的聚店] 获取失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      const newList = (result == null ? void 0 : result.list) ?? [];
      const total = (result == null ? void 0 : result.total) ?? 0;
      if (pageNo.value === 1) {
        stores.value = newList;
      } else {
        stores.value = [...stores.value, ...newList];
      }
      if (newList.length > 0) {
        pageNo.value++;
        hasMore.value = stores.value.length < total;
      } else {
        hasMore.value = false;
      }
    };
    const handleRefresh = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        pageNo.value = 1;
        hasMore.value = true;
        stores.value = [];
        await getMyStores();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my-shop/my-shop.vue:136", "[我的聚店] 刷新异常:", e);
      } finally {
        isLoading.value = false;
        isRefreshing.value = false;
      }
    };
    const loadMore = () => {
      if (hasMore.value)
        getMyStores();
    };
    const onPullDownRefresh = () => {
      isRefreshing.value = true;
      handleRefresh();
    };
    let searchTimer = null;
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        handleRefresh();
      }, 500);
    };
    const handleSearchClick = () => {
      clearTimeout(searchTimer);
      handleRefresh();
    };
    const goToStoreDetail = (store) => {
      common_vendor.index.navigateTo({
        url: `/packages/shop-detail/shop-detail?id=${store.id}`
      });
    };
    const goToEditPage = (store) => {
      common_vendor.index.navigateTo({
        url: `/packages/myStore-edit/myStore-edit?id=${store.id}`
      });
    };
    const goToApplyPage = () => {
      common_vendor.index.navigateTo({
        url: "/packages/myStore-edit/myStore-edit"
      });
    };
    const handleLikeChange = () => {
    };
    common_vendor.onMounted(() => {
      handleRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "20",
          color: "#999"
        }),
        b: common_vendor.o([($event) => searchTerm.value = $event.detail.value, onSearchInput]),
        c: common_vendor.o(handleSearchClick),
        d: searchTerm.value,
        e: common_vendor.o(handleSearchClick),
        f: common_vendor.f(stores.value, (store, k0, i0) => {
          return {
            a: store.id,
            b: common_vendor.o(goToStoreDetail, store.id),
            c: common_vendor.o(goToEditPage, store.id),
            d: common_vendor.o(handleLikeChange, store.id),
            e: "b712bf36-1-" + i0,
            f: common_vendor.p({
              store,
              mode: "mine"
            })
          };
        }),
        g: loadingMore.value
      }, loadingMore.value ? {
        h: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        i: !hasMore.value && stores.value.length > 0
      }, !hasMore.value && stores.value.length > 0 ? {
        j: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        k: stores.value.length === 0 && !loadingMore.value && !isRefreshing.value
      }, stores.value.length === 0 && !loadingMore.value && !isRefreshing.value ? {
        l: common_vendor.p({
          type: "shop",
          size: "60",
          color: "#ffd8c1"
        }),
        m: common_vendor.o(goToApplyPage)
      } : {}, {
        n: common_vendor.o(loadMore),
        o: isRefreshing.value,
        p: common_vendor.o(onPullDownRefresh)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-shop/my-shop.js.map
