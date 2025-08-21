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
    const isLoading = common_vendor.ref(false);
    const userLocation = common_vendor.ref(null);
    const filters = common_vendor.ref([{
      name: "全部",
      value: "all"
    }]);
    const bannerList = common_vendor.ref([]);
    const getCurrentLocation = () => {
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:114", "[定位流程] 开始执行 getCurrentLocation 函数...");
      return new Promise((resolve) => {
        let isResolved = false;
        const timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            common_vendor.index.__f__("error", "at pages/shop/shop.vue:123", "[定位流程] 获取位置超时（8秒），主动返回失败。");
            common_vendor.index.showToast({
              title: "定位超时，请稍后重试",
              icon: "none"
            });
            resolve(null);
          }
        }, 8e3);
        const handleSuccess = (res) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            common_vendor.index.__f__("log", "at pages/shop/shop.vue:136", "[定位流程] 成功获取位置", res);
            const location = {
              latitude: res.latitude,
              longitude: res.longitude
            };
            userLocation.value = location;
            common_vendor.index.setStorageSync("userLocation", location);
            resolve(location);
          }
        };
        const handleError = (err) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            common_vendor.index.__f__("error", "at pages/shop/shop.vue:151", "[定位流程] 获取位置失败", err);
            if (isRefreshing.value) {
              common_vendor.index.showToast({
                title: "定位失败，请检查权限",
                icon: "none"
              });
            }
            resolve(null);
          }
        };
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:163", "[定位流程] 正在调用 uni.getLocation API...");
        common_vendor.index.getLocation({
          type: "gcj02",
          isHighAccuracy: true,
          accuracy: "best",
          success: handleSuccess,
          fail: (err) => {
            common_vendor.index.__f__("warn", "at pages/shop/shop.vue:170", "[定位流程] 高精度定位失败，尝试普通定位...", err);
            common_vendor.index.getLocation({
              type: "gcj02",
              success: handleSuccess,
              fail: handleError
            });
          }
        });
      });
    };
    const fetchBanners = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/banner-rec/list", {
        method: "GET",
        data: {
          positionCode: "1",
          pageNo: 1,
          pageSize: 50
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:199", "获取聚店页轮播图失败:", error);
        bannerList.value = [];
        return;
      }
      if (data && data.list) {
        bannerList.value = data.list.sort((a, b) => a.sort - b.sort);
      } else {
        bannerList.value = [];
      }
    };
    const getStoreList = async () => {
      if (!userLocation.value) {
        common_vendor.index.__f__("warn", "at pages/shop/shop.vue:216", "getStoreList 中断：位置信息为空。");
        isRefreshing.value = false;
        loadingMore.value = false;
        if (pageNo.value === 1) {
          allStores.value = [];
          hasMore.value = false;
        }
        return;
      }
      if (loadingMore.value || pageNo.value > 1 && !hasMore.value) {
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
      if (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:255", "获取店铺列表失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      const newList = result ? result.list : [];
      const total = result ? result.total : 0;
      if (pageNo.value === 1) {
        allStores.value = newList;
      } else {
        allStores.value = [...allStores.value, ...newList];
      }
      if (newList.length > 0) {
        pageNo.value++;
        hasMore.value = allStores.value.length < total;
      } else {
        hasMore.value = false;
      }
    };
    const handleRefresh = async (isPullDown = false) => {
      if (isLoading.value) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:287", "刷新操作已在进行中，本次触发被忽略。");
        return;
      }
      isLoading.value = true;
      if (isPullDown) {
        isRefreshing.value = true;
      } else {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
      }
      try {
        const location = await getCurrentLocation();
        pageNo.value = 1;
        hasMore.value = true;
        allStores.value = [];
        if (location) {
          await getStoreList();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:315", "handleRefresh 过程中捕获到错误:", error);
      } finally {
        isLoading.value = false;
        if (isPullDown) {
          isRefreshing.value = false;
        } else {
          common_vendor.index.hideLoading();
        }
      }
    };
    const getShopType = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        data: {
          type: "member_store_category"
        }
      });
      if (error) {
        return;
      }
      if (data && data.length > 0) {
        const dynamicFilters = data.map((item) => ({
          name: item.label,
          value: item.value
        }));
        filters.value = [{
          name: "全部",
          value: "all"
        }, ...dynamicFilters];
      }
    };
    common_vendor.onMounted(() => {
      getShopType();
      fetchBanners();
    });
    common_vendor.onShow(() => {
      if (allStores.value.length === 0) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:368", "onShow: 列表为空，执行初次加载...");
        const storedLocation = common_vendor.index.getStorageSync("userLocation");
        if (storedLocation) {
          userLocation.value = storedLocation;
        }
        handleRefresh();
      } else {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:376", "onShow: 列表已有数据，不自动刷新位置。");
      }
    });
    const handleRefresherRefresh = async () => {
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:382", "--- scroll-view 的 @refresherrefresh 事件已触发 ---");
      await handleRefresh(true);
    };
    const loadMore = () => {
      getStoreList();
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
    const skipToNewShop = () => {
      common_vendor.index.navigateTo({
        url: "/pages/myStore-edit/myStore-edit"
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
        e: bannerList.value.length > 0
      }, bannerList.value.length > 0 ? {
        f: common_vendor.f(bannerList.value, (banner, k0, i0) => {
          return common_vendor.e({
            a: banner.imageUrl,
            b: banner.title
          }, banner.title ? {
            c: common_vendor.t(banner.title)
          } : {}, {
            d: banner.id
          });
        })
      } : {}, {
        g: common_vendor.f(filters.value, (filter, k0, i0) => {
          return {
            a: common_vendor.t(filter.name),
            b: filter.value,
            c: activeFilter.value === filter.value ? 1 : "",
            d: common_vendor.o(($event) => selectFilter(filter.value), filter.value)
          };
        }),
        h: common_vendor.f(filteredStores.value, (store, k0, i0) => {
          return {
            a: store.id,
            b: common_vendor.o(goToStoreDetail, store.id),
            c: "6d1ef275-1-" + i0,
            d: common_vendor.p({
              store
            })
          };
        }),
        i: loadingMore.value
      }, loadingMore.value ? {
        j: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        k: !hasMore.value && allStores.value.length > 0
      }, !hasMore.value && allStores.value.length > 0 ? {
        l: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        m: allStores.value.length === 0 && !loadingMore.value && !isRefreshing.value
      }, allStores.value.length === 0 && !loadingMore.value && !isRefreshing.value ? {
        n: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ffd8c1"
        })
      } : {}, {
        o: common_vendor.o(loadMore),
        p: isRefreshing.value,
        q: common_vendor.o(handleRefresherRefresh),
        r: common_vendor.p({
          type: "hand-up-filled",
          size: "20",
          color: "#fff"
        }),
        s: common_vendor.o(shareStore),
        t: common_vendor.p({
          type: "plus-filled",
          size: "20",
          color: "#fff"
        }),
        v: common_vendor.o(skipToNewShop)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map
