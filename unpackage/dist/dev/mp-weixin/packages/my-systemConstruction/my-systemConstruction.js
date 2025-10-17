"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const defaultAvatarUrl = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "my-systemConstruction",
  setup(__props) {
    const loggedInUserId = common_vendor.ref(null);
    const suggestionList = common_vendor.ref([]);
    const searchQuery = common_vendor.ref("");
    const activeTab = common_vendor.ref("all");
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const loadingStatus = common_vendor.ref("more");
    common_vendor.onLoad(() => {
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      getSuggestionList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        getSuggestionList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      getSuggestionList(true);
    });
    const getSuggestionList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh) {
        pageNo.value = 1;
        suggestionList.value = [];
        loadingStatus.value = "more";
      }
      loadingStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value
      };
      if (searchQuery.value) {
        params.title = searchQuery.value;
      }
      if (activeTab.value === "mine" && loggedInUserId.value) {
        params.creator = loggedInUserId.value;
      }
      try {
        const {
          data: apiData,
          error
        } = await utils_request.request("/app-api/member/suggestion/list", {
          method: "GET",
          data: params
        });
        if (error || !apiData || !apiData.list) {
          loadingStatus.value = "noMore";
          if (error)
            common_vendor.index.showToast({
              title: `加载失败: ${error}`,
              icon: "none"
            });
          return;
        }
        const mappedData = apiData.list.map((item) => {
          var _a, _b, _c;
          return {
            id: item.id,
            title: item.title,
            content: item.content,
            images: item.img ? item.img.split(",").filter(Boolean) : [],
            time: formatTimestamp(item.createTime),
            user: {
              id: ((_a = item.memberUser) == null ? void 0 : _a.id) || item.creator,
              name: ((_b = item.memberUser) == null ? void 0 : _b.nickname) || "匿名用户",
              avatar: ((_c = item.memberUser) == null ? void 0 : _c.avatar) || defaultAvatarUrl
            }
          };
        });
        suggestionList.value = isRefresh ? mappedData : [...suggestionList.value, ...mappedData];
        if (suggestionList.value.length >= apiData.total) {
          loadingStatus.value = "noMore";
        } else {
          loadingStatus.value = "more";
          pageNo.value++;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/my-systemConstruction/my-systemConstruction.vue:177", "getSuggestionList 逻辑异常:", err);
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: "页面加载异常",
          icon: "none"
        });
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleSearch = () => {
      getSuggestionList(true);
    };
    const handleTabClick = (tab) => {
      if (activeTab.value === tab)
        return;
      activeTab.value = tab;
      getSuggestionList(true);
    };
    const navigateToCreate = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-systemSuggestions/my-systemSuggestions"
        // 请确认此路径是否正确
      });
    };
    const previewImage = (images, currentIndex) => {
      common_vendor.index.previewImage({
        urls: images,
        // 传入图片数组
        current: currentIndex
        // 传入当前点击的图片索引
      });
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "20",
          color: "#FF852B"
        }),
        b: common_vendor.o(handleSearch),
        c: searchQuery.value,
        d: common_vendor.o(($event) => searchQuery.value = $event.detail.value),
        e: common_vendor.o(handleSearch),
        f: activeTab.value === "all" ? 1 : "",
        g: common_vendor.o(($event) => handleTabClick("all")),
        h: activeTab.value === "mine" ? 1 : "",
        i: common_vendor.o(($event) => handleTabClick("mine")),
        j: common_vendor.f(suggestionList.value, (suggestion, k0, i0) => {
          return common_vendor.e({
            a: suggestion.user.avatar,
            b: common_vendor.t(suggestion.user.name),
            c: common_vendor.t(suggestion.time),
            d: common_vendor.t(suggestion.title),
            e: suggestion.content
          }, suggestion.content ? {
            f: common_vendor.t(suggestion.content)
          } : {}, {
            g: suggestion.images && suggestion.images.length > 0
          }, suggestion.images && suggestion.images.length > 0 ? {
            h: common_vendor.f(suggestion.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(suggestion.images, imgIndex), imgIndex),
                c: imgIndex
              };
            }),
            i: common_vendor.n("images-count-" + suggestion.images.length)
          } : {}, {
            j: suggestion.id
          });
        }),
        k: suggestionList.value.length === 0 && loadingStatus.value === "noMore"
      }, suggestionList.value.length === 0 && loadingStatus.value === "noMore" ? {} : {
        l: common_vendor.p({
          status: loadingStatus.value
        })
      }, {
        m: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#FFFFFF"
        }),
        n: common_vendor.o(navigateToCreate)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d9b70221"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-systemConstruction/my-systemConstruction.js.map
