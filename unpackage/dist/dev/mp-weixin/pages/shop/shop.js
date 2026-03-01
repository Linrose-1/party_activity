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
    const shortAddress = common_vendor.computed(() => {
      if (!displayAddress.value)
        return "定位中";
      if (displayAddress.value.length > 4) {
        return displayAddress.value.substring(0, 4) + "...";
      }
      return displayAddress.value;
    });
    const filteredStores = common_vendor.computed(() => allStores.value);
    const getCurrentLocation = () => {
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:163", "[定位] 开始定位...");
      return new Promise((resolve) => {
        let isResolved = false;
        const timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            common_vendor.index.__f__("error", "at pages/shop/shop.vue:172", "[定位] 超时（8秒），主动返回失败");
            common_vendor.index.showToast({
              title: "定位超时，请稍后重试",
              icon: "none"
            });
            resolve(null);
          }
        }, 8e3);
        const handleSuccess = (res) => {
          if (isResolved)
            return;
          isResolved = true;
          clearTimeout(timeoutId);
          common_vendor.index.__f__("log", "at pages/shop/shop.vue:185", "[定位] 成功:", res);
          const location = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          userLocation.value = location;
          common_vendor.index.setStorageSync("userLocation", location);
          common_vendor.index.request({
            url: `https://restapi.amap.com/v3/geocode/regeo?key=您的高德Web服务KEY&location=${res.longitude},${res.latitude}`,
            success: (geoRes) => {
              var _a, _b;
              const address = ((_b = (_a = geoRes.data) == null ? void 0 : _a.regeocode) == null ? void 0 : _b.formatted_address) || "当前位置";
              displayAddress.value = address;
              common_vendor.index.setStorageSync("displayAddress", address);
            },
            fail: () => {
              displayAddress.value = "当前位置";
              common_vendor.index.setStorageSync("displayAddress", "当前位置");
            }
          });
          resolve(location);
        };
        const handleError = (err) => {
          if (isResolved)
            return;
          isResolved = true;
          clearTimeout(timeoutId);
          common_vendor.index.__f__("error", "at pages/shop/shop.vue:215", "[定位] 失败:", err);
          common_vendor.index.showToast({
            title: "定位失败，请检查权限",
            icon: "none"
          });
          resolve(null);
        };
        common_vendor.index.getLocation({
          type: "gcj02",
          isHighAccuracy: true,
          accuracy: "best",
          success: handleSuccess,
          fail: (err) => {
            common_vendor.index.__f__("warn", "at pages/shop/shop.vue:230", "[定位] 高精度失败，尝试普通定位...", err);
            common_vendor.index.getLocation({
              type: "gcj02",
              success: handleSuccess,
              fail: handleError
            });
          }
        });
      });
    };
    const handleChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/shop/shop.vue:248", "[选址] 用户手动选择:", res);
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
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:293", "[Banner] 获取失败:", error);
        bannerList.value = [];
        return;
      }
      bannerList.value = (data == null ? void 0 : data.list) ? data.list.sort((a, b) => a.sort - b.sort) : [];
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
      if (error || !(data == null ? void 0 : data.length))
        return;
      filters.value = [
        {
          name: "全部",
          value: "all"
        },
        ...data.map((item) => ({
          name: item.label,
          value: item.value
        }))
      ];
    };
    const getStoreList = async () => {
      if (loadingMore.value || pageNo.value > 1 && !hasMore.value)
        return;
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
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:353", "[StoreList] 请求参数:", params);
      const {
        data: result,
        error
      } = await utils_request.request("/app-api/member/store/list", {
        method: "GET",
        data: params
      });
      loadingMore.value = false;
      if (error) {
        if (error.includes("信息绑定")) {
          common_vendor.index.__f__("warn", "at pages/shop/shop.vue:367", "[StoreList] 需绑定信息才能查看更多");
          await utils_user.checkLoginGuard();
          return;
        }
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:371", "[StoreList] 获取失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      const newList = (result == null ? void 0 : result.list) ?? [];
      const total = (result == null ? void 0 : result.total) ?? 0;
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
        common_vendor.index.__f__("error", "at pages/shop/shop.vue:414", "[handleRefresh] 异常:", error);
      } finally {
        isLoading.value = false;
        isRefreshing.value = false;
      }
    };
    const handleRefresherRefresh = async () => {
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:427", "[下拉刷新] 触发");
      await handleRefresh(true);
    };
    const loadMore = () => {
      getStoreList();
    };
    const handleLikeChange = async ({
      id,
      action,
      clickedAction
    }) => {
      const store = allStores.value.find((item) => item.id === id);
      if (!store)
        return;
      const originalAction = store.userLikeStr;
      const originalLikes = store.likesCount || 0;
      const originalDislikes = store.dislikesCount || 0;
      if (action === "cancel") {
        store.userLikeStr = null;
        clickedAction === "like" ? store.likesCount-- : store.dislikesCount--;
      } else {
        store.userLikeStr = clickedAction;
        if (clickedAction === "like") {
          store.likesCount = (store.likesCount || 0) + 1;
          if (originalAction === "dislike")
            store.dislikesCount = Math.max(0, (store.dislikesCount || 0) - 1);
        } else {
          store.dislikesCount = (store.dislikesCount || 0) + 1;
          if (originalAction === "like")
            store.likesCount = Math.max(0, (store.likesCount || 0) - 1);
        }
      }
      try {
        const {
          error
        } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: id,
            targetType: "store",
            action
          }
        });
        if (error)
          throw new Error(error);
      } catch (e) {
        store.userLikeStr = originalAction;
        store.likesCount = originalLikes;
        store.dislikesCount = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const goToStoreDetail = async (store) => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: `/packages/shop-detail/shop-detail?id=${store.id}`
      });
    };
    const shareStore = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/shop-recommend/shop-recommend"
      });
    };
    const skipToNewShop = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/myStore-edit/myStore-edit"
      });
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
    const selectFilter = (filterValue) => {
      activeFilter.value = filterValue;
    };
    common_vendor.watch(activeFilter, (newValue, oldValue) => {
      if (newValue !== oldValue)
        handleRefresh();
    });
    common_vendor.onMounted(() => {
      getShopType();
      fetchBanners();
      common_vendor.index.$on("storeInteractionChanged", (data) => {
        const index = allStores.value.findIndex((s) => String(s.id) === String(data.id));
        if (index === -1)
          return;
        if (data.type === "action") {
          allStores.value[index].userLikeStr = data.userLikeStr;
          allStores.value[index].likesCount = data.likesCount;
          allStores.value[index].dislikesCount = data.dislikesCount;
        }
        if (data.type === "comment") {
          allStores.value[index].commonCount = data.totalCount;
        }
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("storeInteractionChanged");
    });
    common_vendor.onShow(async () => {
      const storedLocation = common_vendor.index.getStorageSync("userLocation");
      const storedAddress = common_vendor.index.getStorageSync("displayAddress");
      if (storedLocation)
        userLocation.value = storedLocation;
      if (storedAddress)
        displayAddress.value = storedAddress;
      if (allStores.value.length === 0) {
        handleRefresh();
      }
      getCurrentLocation().then((newLoc) => {
        if (newLoc) {
          common_vendor.index.__f__("log", "at pages/shop/shop.vue:616", "[onShow] 重新定位成功，刷新列表");
          handleRefresh();
        }
      });
    });
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      let sharePath = "/pages/shop/shop";
      if (inviteCode)
        sharePath += `?inviteCode=${inviteCode}`;
      return {
        title: '我发现了很多宝藏"聚店"，快来一起看看吧！',
        path: sharePath,
        imageUrl: bannerList.value.length > 0 ? bannerList.value[0].imageUrl : "https://img.gofor.club/logo.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      return {
        title: '我发现了很多宝藏"聚店"，快来一起看看吧！',
        query: inviteCode ? `inviteCode=${inviteCode}` : "",
        imageUrl: bannerList.value.length > 0 ? bannerList.value[0].imageUrl : "https://img.gofor.club/logo.png"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(shortAddress.value),
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
        e: common_vendor.o([($event) => searchTerm.value = $event.detail.value, onSearchInput]),
        f: common_vendor.o(handleSearchClick),
        g: searchTerm.value,
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
            c: common_vendor.o(handleLikeChange, store.id),
            d: "6d1ef275-4-" + i0,
            e: common_vendor.p({
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
        z: common_vendor.o(handleRefresherRefresh)
      });
    };
  }
};
_sfc_main.__runtimeHooks = 6;
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map
