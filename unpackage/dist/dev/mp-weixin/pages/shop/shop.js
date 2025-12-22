"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
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
    const displayAddress = common_vendor.ref("");
    const handleChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/shop/shop.vue:240", "用户手动选择了新位置:", res);
          const newAddress = res.name || res.address;
          const newLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          displayAddress.value = newAddress;
          userLocation.value = newLocation;
          common_vendor.index.setStorageSync("userLocation", newLocation);
          common_vendor.index.setStorageSync("displayAddress", newAddress);
          handleRefresh();
        },
        fail: (err) => {
          if (!err.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "选择位置失败",
              icon: "none"
            });
          }
        }
      });
    };
    const shortAddress = common_vendor.computed(() => {
      if (!displayAddress.value)
        return "定位中";
      if (displayAddress.value.length > 4) {
        return displayAddress.value.substring(0, 4) + "...";
      }
      return displayAddress.value;
    });
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
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:300", "获取聚店页轮播图失败:", error);
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
      if (loadingMore.value || pageNo.value > 1 && !hasMore.value) {
        return;
      }
      loadingMore.value = true;
      const params = {
        pageNo: pageNo.value,
        pageSize,
        storeName: searchTerm.value.trim()
      };
      if (userLocation.value) {
        params.longitude = userLocation.value.longitude;
        params.latitude = userLocation.value.latitude;
      }
      if (activeFilter.value !== "all") {
        params.category = activeFilter.value;
      }
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:347", "🚀 [getStoreList] 最终请求参数:", params);
      const {
        data: result,
        error
      } = await utils_request.request("/app-api/member/store/list", {
        method: "GET",
        data: params
      });
      loadingMore.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:360", "获取店铺列表失败:", error);
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
      if (isLoading.value)
        return;
      isLoading.value = true;
      if (isPullDown) {
        isRefreshing.value = true;
      }
      try {
        pageNo.value = 1;
        hasMore.value = true;
        allStores.value = [];
        await getStoreList();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:405", "handleRefresh 过程中捕获到错误:", error);
      } finally {
        isLoading.value = false;
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
      handleRefresh();
    });
    common_vendor.onShow(() => {
      if (allStores.value.length === 0) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:452", "onShow: 列表为空，执行初次加载...");
        const storedLocation = common_vendor.index.getStorageSync("userLocation");
        const storedAddress = common_vendor.index.getStorageSync("displayAddress");
        if (storedLocation) {
          userLocation.value = storedLocation;
        }
        if (storedAddress) {
          displayAddress.value = storedAddress;
          handleRefresh();
        } else {
          displayAddress.value = "正在定位...";
          handleRefresh();
        }
      } else {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:468", "onShow: 列表已有数据，不自动刷新位置。");
      }
    });
    const handleRefresherRefresh = async () => {
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:474", "--- scroll-view 的 @refresherrefresh 事件已触发 ---");
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
    const handleSearchClick = () => {
      clearTimeout(searchTimer);
      handleRefresh();
    };
    const selectFilter = (filterValue) => {
      activeFilter.value = filterValue;
    };
    const goToStoreDetail = (store) => {
      if (!utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: `/pages/shop-detail/shop-detail?id=${store.id}`
      });
    };
    const shareStore = () => {
      if (!utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/shop-recommend/shop-recommend"
      });
    };
    const skipToNewShop = () => {
      if (!utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/myStore-edit/myStore-edit"
      });
    };
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:547", `[分享] 准备分享聚店页面给好友，邀请码: ${inviteCode}`);
      let sharePath = "/pages/shop/shop";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "我发现了很多宝藏“聚店”，快来一起看看吧！",
        path: sharePath,
        imageUrl: bannerList.value.length > 0 ? bannerList.value[0].imageUrl : "https://img.gofor.club/logo.png"
        // 优先使用第一张轮播图作为分享封面
      };
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:564", "[分享] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:576", `[分享] 准备分享聚店页面到朋友圈，邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "我发现了很多宝藏“聚店”，快来一起看看吧！",
        query: queryString,
        imageUrl: bannerList.value.length > 0 ? bannerList.value[0].imageUrl : "https://img.gofor.club/logo.png"
      };
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:592", "[分享] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(shortAddress.value || "定位"),
        b: common_vendor.p({
          type: "bottom",
          size: "12",
          color: "#333"
        }),
        c: common_vendor.o(handleChooseLocation),
        d: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        e: common_vendor.o(handleSearchClick),
        f: searchTerm.value,
        g: common_vendor.o(($event) => searchTerm.value = $event.detail.value),
        h: common_vendor.o(handleSearchClick),
        i: bannerList.value.length > 0
      }, bannerList.value.length > 0 ? {
        j: common_vendor.f(bannerList.value, (banner, k0, i0) => {
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
        k: common_vendor.p({
          type: "hand-up-filled",
          size: "24",
          color: "#fff"
        }),
        l: common_vendor.o(shareStore),
        m: common_vendor.p({
          type: "shop-filled",
          size: "24",
          color: "#fff"
        }),
        n: common_vendor.o(skipToNewShop),
        o: common_vendor.f(filters.value, (filter, k0, i0) => {
          return {
            a: common_vendor.t(filter.name),
            b: filter.value,
            c: activeFilter.value === filter.value ? 1 : "",
            d: common_vendor.o(($event) => selectFilter(filter.value), filter.value)
          };
        }),
        p: common_vendor.f(filteredStores.value, (store, k0, i0) => {
          return {
            a: store.id,
            b: common_vendor.o(goToStoreDetail, store.id),
            c: "6d1ef275-4-" + i0,
            d: common_vendor.p({
              store
            })
          };
        }),
        q: loadingMore.value
      }, loadingMore.value ? {
        r: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        s: !hasMore.value && allStores.value.length > 0
      }, !hasMore.value && allStores.value.length > 0 ? {
        t: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        v: allStores.value.length === 0 && !loadingMore.value && !isRefreshing.value
      }, allStores.value.length === 0 && !loadingMore.value && !isRefreshing.value ? {
        w: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ffd8c1"
        })
      } : {}, {
        x: common_vendor.o(loadMore),
        y: isRefreshing.value,
        z: common_vendor.o(handleRefresherRefresh),
        A: [2]
      });
    };
  }
};
_sfc_main.__runtimeHooks = 6;
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map
