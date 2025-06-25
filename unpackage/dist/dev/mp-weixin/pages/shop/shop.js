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
const pageSize = 5;
const _sfc_main = {
  __name: "shop",
  setup(__props) {
    const searchTerm = common_vendor.ref("");
    const activeFilter = common_vendor.ref("all");
    const allStores = common_vendor.ref([]);
    const loadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const pageNo = common_vendor.ref(1);
    const userLocation = common_vendor.ref(null);
    const getStoreList = async () => {
      if (loadingMore.value || !hasMore.value) {
        return;
      }
      if (!userLocation.value) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:95", "等待位置信息获取...");
        allStores.value = [];
        hasMore.value = false;
        return;
      }
      loadingMore.value = true;
      const params = {
        pageNo: pageNo.value,
        pageSize,
        storeName: searchTerm.value.trim()
        // longitude: userLocation.value.longitude, 
        // latitude: userLocation.value.latitude,
      };
      const {
        data: result,
        // 将 newList 重命名为 result，因为它现在是 { list: [], total: 6 }
        error
      } = await utils_request.request("/app-api/member/store/list", {
        method: "GET",
        data: params
      });
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:122", "API Response:", result);
      loadingMore.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:127", "获取店铺列表失败:", error);
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
    common_vendor.onMounted(() => {
      const storedLocation = common_vendor.index.getStorageSync("userLocation");
      if (storedLocation) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:162", "从缓存加载位置信息:", storedLocation);
        userLocation.value = storedLocation;
        getStoreList();
      } else {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:168", "缓存中无位置信息，开始请求授权...");
        common_vendor.index.getLocation({
          type: "gcj02",
          // 国测局坐标，适用于大多数国内地图服务
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/shop/shop.vue:172", "成功获取位置信息:", res);
            const location = {
              latitude: res.latitude,
              longitude: res.longitude
            };
            userLocation.value = location;
            common_vendor.index.setStorageSync("userLocation", location);
            getStoreList();
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/shop/shop.vue:185", "获取位置信息失败:", err);
            common_vendor.index.showModal({
              title: "定位失败",
              content: "无法获取您的位置信息，将无法为您推荐附近的聚店。请检查系统定位服务是否开启，并允许应用获取位置权限。",
              showCancel: false,
              success: () => {
                allStores.value = [];
                hasMore.value = false;
              }
            });
          }
        });
      }
    });
    const loadMore = () => {
      if (userLocation.value) {
        getStoreList();
      }
    };
    const handleRefresh = () => {
      pageNo.value = 1;
      allStores.value = [];
      hasMore.value = true;
      if (userLocation.value) {
        getStoreList();
      }
    };
    common_vendor.watch(activeFilter, () => {
      handleRefresh();
    });
    const filteredStores = common_vendor.computed(() => allStores.value);
    let searchTimer = null;
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:231", `搜索关键词: ${searchTerm.value}`);
        handleRefresh();
      }, 500);
    };
    const handleSearchClick = () => {
      clearTimeout(searchTimer);
      handleRefresh();
    };
    const filters = common_vendor.ref([
      {
        name: "全部",
        value: "all"
      },
      {
        name: "咖啡",
        value: "coffee"
      },
      {
        name: "茶馆",
        value: "tea-house"
      },
      {
        name: "美食",
        value: "food"
      },
      {
        name: "酒吧",
        value: "bar"
      },
      {
        name: "其他",
        value: "other"
      }
    ]);
    const selectFilter = (filterValue) => {
      activeFilter.value = filterValue;
    };
    const goToStoreDetail = (store) => {
      common_vendor.index.navigateTo({
        url: `/pages/store/detail?id=${store.id}`
      });
    };
    const shareStore = () => {
      common_vendor.index.navigateTo({
        url: "/pages/shop-recommend/shop-recommend"
      });
    };
    const applyToList = () => {
      common_vendor.index.showToast({
        title: "申请上榜",
        icon: "none"
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
            b: common_vendor.o(($event) => goToStoreDetail(store), store.id),
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
        k: allStores.value.length === 0 && !loadingMore.value
      }, allStores.value.length === 0 && !loadingMore.value ? {
        l: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ffd8c1"
        })
      } : {}, {
        m: common_vendor.o(loadMore),
        n: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#333"
        }),
        o: common_vendor.o(shareStore),
        p: common_vendor.p({
          type: "plus-filled",
          size: "20",
          color: "#fff"
        }),
        q: common_vendor.o(applyToList)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map
