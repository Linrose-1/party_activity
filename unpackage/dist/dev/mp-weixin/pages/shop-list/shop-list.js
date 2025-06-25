"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_load_more)();
}
const pageSize = 10;
const _sfc_main = {
  __name: "shop-list",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const storeList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    let searchTimer = null;
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        handleSearch();
      }, 500);
    };
    const handleSearch = () => {
      clearTimeout(searchTimer);
      pageNo.value = 1;
      storeList.value = [];
      hasMore.value = true;
      getStoreList();
    };
    const getStoreList = async () => {
      if (loading.value || !hasMore.value) {
        return;
      }
      loading.value = true;
      try {
        const params = {
          pageNo: pageNo.value,
          pageSize,
          storeName: searchKeyword.value.trim()
        };
        const { data: result, error } = await utils_request.request("/app-api/member/store/list", {
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/shop-list/shop-list.vue:108", "123", result.list);
        if (error) {
          common_vendor.index.__f__("error", "at pages/shop-list/shop-list.vue:111", "获取店铺列表失败:", error);
          common_vendor.index.showToast({ title: "获取店铺列表失败", icon: "none" });
          return;
        }
        const newList = (result == null ? void 0 : result.list) || [];
        const total = (result == null ? void 0 : result.total) || 0;
        if (pageNo.value === 1) {
          storeList.value = newList;
          common_vendor.index.__f__("log", "at pages/shop-list/shop-list.vue:121", "storeList", storeList.value);
        } else {
          storeList.value = [...storeList.value, ...newList];
          common_vendor.index.__f__("log", "at pages/shop-list/shop-list.vue:124", "storeList2", storeList.value);
        }
        hasMore.value = storeList.value.length < total;
        if (hasMore.value) {
          pageNo.value++;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/shop-list/shop-list.vue:135", "请求异常:", e);
        common_vendor.index.showToast({ title: "网络请求异常", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    common_vendor.onMounted(() => {
      getStoreList();
    });
    common_vendor.onReachBottom(() => {
      getStoreList();
    });
    const loadStatus = common_vendor.computed(() => {
      if (loading.value) {
        return "loading";
      }
      if (!hasMore.value && storeList.value.length > 0) {
        return "noMore";
      }
      return "more";
    });
    const isEmpty = common_vendor.computed(() => {
      return !loading.value && storeList.value.length === 0;
    });
    function selectShop(shop) {
      common_vendor.index.$emit("shopSelected", shop);
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(onSearchInput),
        b: common_vendor.o(handleSearch),
        c: common_vendor.o(($event) => searchKeyword.value = $event),
        d: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索店铺名称或地址",
          inputBorder: false,
          modelValue: searchKeyword.value
        }),
        e: common_vendor.o(handleSearch),
        f: common_vendor.f(storeList.value, (shop, k0, i0) => {
          return {
            a: common_vendor.t(shop.storeName),
            b: common_vendor.t(shop.fullAddress),
            c: "3128ea08-1-" + i0,
            d: shop.id,
            e: common_vendor.o(($event) => selectShop(shop), shop.id)
          };
        }),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        h: common_vendor.p({
          status: loadStatus.value
        }),
        i: isEmpty.value
      }, isEmpty.value ? {
        j: common_vendor.p({
          type: "shop-filled",
          size: "60",
          color: "#e0e0e0"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3128ea08"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop-list/shop-list.js.map
