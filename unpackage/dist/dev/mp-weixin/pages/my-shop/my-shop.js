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
    const getMyStores = async () => {
      if (loadingMore.value || !hasMore.value) {
        return;
      }
      loadingMore.value = true;
      const params = {
        pageNo: pageNo.value,
        pageSize,
        storeName: searchTerm.value.trim()
      };
      const {
        data: result,
        error
      } = await utils_request.request("/app-api/member/store/my-list", {
        method: "GET",
        data: params
      });
      loadingMore.value = false;
      if (isRefreshing.value) {
        isRefreshing.value = false;
      }
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-shop/my-shop.vue:92", "获取我的聚店列表失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      const newList = result ? result.list : [];
      const total = result ? result.total : 0;
      if (newList && newList.length > 0) {
        stores.value = pageNo.value === 1 ? newList : [...stores.value, ...newList];
        pageNo.value++;
        hasMore.value = stores.value.length < total;
      } else {
        if (pageNo.value === 1) {
          stores.value = [];
        }
        hasMore.value = false;
      }
    };
    const handleRefresh = () => {
      pageNo.value = 1;
      stores.value = [];
      hasMore.value = true;
      getMyStores();
    };
    const loadMore = () => {
      if (hasMore.value) {
        getMyStores();
      }
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
    const goToApplyPage = () => {
      common_vendor.index.navigateTo({
        // 目标是新建/编辑页面
        url: `/packages/myStore-edit/myStore-edit`
      });
    };
    const goToEditPage = (store) => {
      common_vendor.index.navigateTo({
        // 目标是修改页面
        url: `/packages/myStore-edit/myStore-edit?id=${store.id}`
      });
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
        c: searchTerm.value,
        d: common_vendor.o(handleSearchClick),
        e: common_vendor.f(stores.value, (store, k0, i0) => {
          return {
            a: store.id,
            b: common_vendor.o(goToEditPage, store.id),
            c: "b712bf36-1-" + i0,
            d: common_vendor.p({
              store
            })
          };
        }),
        f: loadingMore.value
      }, loadingMore.value ? {
        g: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        h: !hasMore.value && stores.value.length > 0
      }, !hasMore.value && stores.value.length > 0 ? {
        i: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        j: stores.value.length === 0 && !loadingMore.value && !isRefreshing.value
      }, stores.value.length === 0 && !loadingMore.value && !isRefreshing.value ? {
        k: common_vendor.p({
          type: "shop",
          size: "60",
          color: "#ffd8c1"
        }),
        l: common_vendor.o(goToApplyPage)
      } : {}, {
        m: common_vendor.o(loadMore),
        n: isRefreshing.value,
        o: common_vendor.o(onPullDownRefresh)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-shop/my-shop.js.map
