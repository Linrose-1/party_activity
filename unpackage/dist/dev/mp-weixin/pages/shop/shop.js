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
  __name: "shop",
  setup(__props) {
    const searchTerm = common_vendor.ref("");
    const activeFilter = common_vendor.ref("all");
    const allStores = common_vendor.ref([]);
    const loadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const pageNo = common_vendor.ref(1);
    const isRefreshing = common_vendor.ref(false);
    const userLocation = common_vendor.ref(null);
    const filters = common_vendor.ref([{
      name: "全部",
      value: "all"
    }]);
    const isLocationLoaded = common_vendor.ref(false);
    const getStoreList = async () => {
      if (loadingMore.value || !hasMore.value) {
        return;
      }
      if (!userLocation.value) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:103", "getStoreList 被调用，但位置信息依然为空，已中断。");
        isRefreshing.value = false;
        return;
      }
      loadingMore.value = true;
      const params = {
        pageNo: pageNo.value,
        pageSize,
        storeName: searchTerm.value.trim(),
        longitude: userLocation.value.longitude,
        latitude: userLocation.value.latitude
      };
      if (activeFilter.value !== "all") {
        params.category = activeFilter.value;
      }
      const {
        data: result,
        error
      } = await utils_request.request("/app-api/member/store/list", {
        method: "GET",
        data: params
      });
      loadingMore.value = false;
      isRefreshing.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:134", "获取店铺列表失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      const newList = result ? result.list : [];
      const total = result ? result.total : 0;
      if (newList && newList.length > 0) {
        allStores.value = pageNo.value === 1 ? newList : [...allStores.value, ...newList];
        pageNo.value++;
        hasMore.value = allStores.value.length < total;
      } else {
        if (pageNo.value === 1) {
          allStores.value = [];
        }
        hasMore.value = false;
      }
    };
    const initData = () => {
      const storedLocation = common_vendor.index.getStorageSync("userLocation");
      if (storedLocation) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:163", "从缓存加载位置信息");
        userLocation.value = storedLocation;
        isLocationLoaded.value = true;
        handleRefresh();
      } else {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:169", "缓存中无位置，开始请求...");
        common_vendor.index.getLocation({
          type: "gcj02",
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/shop/shop.vue:173", "成功获取新位置信息");
            const location = {
              latitude: res.latitude,
              longitude: res.longitude
            };
            userLocation.value = location;
            common_vendor.index.setStorageSync("userLocation", location);
            isLocationLoaded.value = true;
            handleRefresh();
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/shop/shop.vue:185", "获取位置信息失败:", err);
            isLocationLoaded.value = true;
            common_vendor.index.showModal({
              title: "定位失败",
              content: "无法获取您的位置信息，将无法为您推荐附近的聚店。",
              showCancel: false,
              success: () => {
                handleRefresh();
              }
            });
          }
        });
      }
    };
    const getShopType = async () => {
      const { data, error } = await utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        data: { type: "member_store_category" }
      });
      if (error) {
        return;
      }
      if (data && data.length > 0) {
        const dynamicFilters = data.map((item) => ({ name: item.label, value: item.value }));
        filters.value = [{ name: "全部", value: "all" }, ...dynamicFilters];
      }
    };
    common_vendor.onMounted(() => {
      getShopType();
    });
    common_vendor.onShow(() => {
      if (!isLocationLoaded.value) {
        initData();
      }
    });
    const handleRefresh = () => {
      pageNo.value = 1;
      allStores.value = [];
      hasMore.value = true;
      getStoreList();
    };
    const loadMore = () => {
      getStoreList();
    };
    const onPullDownRefresh = () => {
      isRefreshing.value = true;
      handleRefresh();
    };
    common_vendor.watch(activeFilter, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        handleRefresh();
      }
    });
    const filteredStores = common_vendor.computed(() => allStores.value);
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
    const selectFilter = (filterValue) => {
      activeFilter.value = filterValue;
    };
    const goToStoreDetail = (store) => {
      common_vendor.index.navigateTo({
        url: `/pages/shop-detail/shop-detail?id=${store.id}`
      });
    };
    const shareStore = () => {
      common_vendor.index.navigateTo({
        url: "/pages/shop-recommend/shop-recommend"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "20",
          color: "#999"
        }),
        b: common_vendor.o([($event) => searchTerm.value = $event.detail.value, onSearchInput]),
        c: searchTerm.value,
        d: common_vendor.o(handleSearchClick),
        e: common_vendor.f(filters.value, (filter, k0, i0) => {
          return {
            a: common_vendor.t(filter.name),
            b: filter.value,
            c: activeFilter.value === filter.value ? 1 : "",
            d: common_vendor.o(($event) => selectFilter(filter.value), filter.value)
          };
        }),
        f: common_vendor.f(filteredStores.value, (store, k0, i0) => {
          return {
            a: store.id,
            b: common_vendor.o(goToStoreDetail, store.id),
            c: "6d1ef275-1-" + i0,
            d: common_vendor.p({
              store
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
        i: !hasMore.value && allStores.value.length > 0
      }, !hasMore.value && allStores.value.length > 0 ? {
        j: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        k: allStores.value.length === 0 && !loadingMore.value && !isRefreshing.value
      }, allStores.value.length === 0 && !loadingMore.value && !isRefreshing.value ? {
        l: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ffd8c1"
        })
      } : {}, {
        m: common_vendor.o(loadMore),
        n: isRefreshing.value,
        o: common_vendor.o(onPullDownRefresh),
        p: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#fff"
        }),
        q: common_vendor.o(shareStore),
        r: common_vendor.p({
          type: "plus-filled",
          size: "20",
          color: "#fff"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map
