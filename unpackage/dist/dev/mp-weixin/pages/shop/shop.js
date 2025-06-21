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
const _sfc_main = {
  __name: "shop",
  setup(__props) {
    const searchTerm = common_vendor.ref("");
    const activeFilter = common_vendor.ref("all");
    const loadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    common_vendor.onMounted(() => {
      getStoreList();
    });
    const getStoreList = async () => {
      const result = await utils_request.request("/app-api/member/store/list", {
        method: "GET",
        // 请求方式
        data: {
          "pageNo": 1,
          "pageSize": 10
        }
      });
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:87", "login result.data:", result);
      if (result.error) {
        common_vendor.index.__f__("log", "at pages/shop/shop.vue:91", "请求失败:", result.error);
      }
    };
    const allStores = common_vendor.ref([
      {
        id: 1,
        name: "蓝调酒吧",
        category: "bar",
        distance: "0.8km",
        description: "爵士乐主题酒吧，提供各类特色鸡尾酒和精酿啤酒，环境优雅，适合朋友聚会和小型派对。",
        tags: ["鸡尾酒", "爵士乐", "聚会"],
        icon: "cocktail"
        // FontAwesome 图标名称
      },
      {
        id: 2,
        name: "川味小厨",
        category: "food",
        distance: "0.3km",
        description: "地道川菜馆，主打麻辣火锅和各式川味小吃，食材新鲜，口味正宗，价格实惠。",
        tags: ["川菜", "火锅", "麻辣"],
        icon: "utensils"
      },
      {
        id: 3,
        name: "星光KTV",
        category: "ktv",
        distance: "1.2km",
        description: "高端KTV娱乐场所，拥有豪华包间和专业音响设备，提供丰富歌单和优质服务，适合公司团建和生日派对。",
        tags: ["豪华包间", "专业音响", "团建"],
        icon: "microphone-alt"
      },
      {
        id: 4,
        name: "王者台球俱乐部",
        category: "billiards",
        distance: "1.5km",
        description: "专业台球俱乐部，拥有国际标准球台，环境舒适，提供饮品和小吃，定期举办台球比赛。",
        tags: ["专业球台", "比赛", "休闲娱乐"],
        icon: "dice"
      },
      {
        id: 5,
        name: "意大利披萨屋",
        category: "food",
        distance: "0.9km",
        description: "正宗意式披萨餐厅，采用传统窑烤工艺，食材进口，提供多种意式美食和葡萄酒。",
        tags: ["窑烤披萨", "意式美食", "葡萄酒"],
        icon: "pizza-slice"
      },
      {
        id: 6,
        name: "精酿啤酒屋",
        category: "bar",
        distance: "1.7km",
        description: "自酿啤酒专门店，提供20多种手工精酿啤酒，搭配美式烧烤和小吃，工业风装修风格。",
        tags: ["手工啤酒", "美式烧烤", "工业风"],
        icon: "beer"
      },
      {
        id: 7,
        name: "麦霸主题KTV",
        category: "ktv",
        distance: "2.1km",
        description: "主题包厢KTV，每个包厢有不同主题装饰，最新曲库，智能点歌系统，提供自助餐服务。",
        tags: ["主题包厢", "最新曲库", "自助餐"],
        icon: "music"
      }
    ]);
    const filters = common_vendor.ref([
      {
        name: "全部",
        value: "all"
      },
      {
        name: "咖啡",
        value: "bar"
      },
      {
        name: "茶馆",
        value: "food"
      },
      {
        name: "美食",
        value: "ktv"
      },
      {
        name: "酒吧",
        value: "billiards"
      },
      {
        name: "其他",
        value: "other"
      }
    ]);
    const filteredStores = common_vendor.computed(() => {
      let result = allStores.value;
      if (activeFilter.value !== "all") {
        result = result.filter((store) => store.category === activeFilter.value);
      }
      if (searchTerm.value.trim() !== "") {
        const lowerCaseSearchTerm = searchTerm.value.toLowerCase().trim();
        result = result.filter(
          (store) => store.name.toLowerCase().includes(lowerCaseSearchTerm) || store.description.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
      return result;
    });
    const onSearchInput = () => {
    };
    const selectFilter = (filterValue) => {
      activeFilter.value = filterValue;
    };
    const loadMoreStores = () => {
      if (loadingMore.value || !hasMore.value) {
        return;
      }
      loadingMore.value = true;
      setTimeout(() => {
        hasMore.value = false;
        loadingMore.value = false;
      }, 1e3);
    };
    const goToStoreDetail = (store) => {
      common_vendor.index.navigateTo({
        url: `/pages/store/detail?id=${store.id}&name=${store.name}`
        // 示例导航
      });
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:233", "进入", store.name, "详情页");
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
      common_vendor.index.__f__("log", "at pages/shop/shop.vue:247", "点击申请上榜");
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
        d: common_vendor.f(filters.value, (filter, k0, i0) => {
          return {
            a: common_vendor.t(filter.name),
            b: filter.value,
            c: activeFilter.value === filter.value ? 1 : "",
            d: common_vendor.o(($event) => selectFilter(filter.value), filter.value)
          };
        }),
        e: common_vendor.f(filteredStores.value, (store, k0, i0) => {
          return {
            a: store.id,
            b: common_vendor.o(($event) => goToStoreDetail(store), store.id),
            c: "6d1ef275-1-" + i0,
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
        h: !hasMore.value && filteredStores.value.length > 0
      }, !hasMore.value && filteredStores.value.length > 0 ? {
        i: common_vendor.p({
          type: "checkmarkempty",
          size: "20",
          color: "#999"
        })
      } : {}, {
        j: filteredStores.value.length === 0 && !loadingMore.value
      }, filteredStores.value.length === 0 && !loadingMore.value ? {
        k: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ffd8c1"
        })
      } : {}, {
        l: common_vendor.o(loadMoreStores),
        m: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#333"
        }),
        n: common_vendor.o(shareStore),
        o: common_vendor.p({
          type: "plus-filled",
          size: "20",
          color: "#fff"
        }),
        p: common_vendor.o(applyToList)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map
