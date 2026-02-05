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
const pageSize = 10;
const defaultAvatarUrl = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "my-systemConstruction",
  setup(__props) {
    const loggedInUserId = common_vendor.ref(null);
    const suggestionList = common_vendor.ref([]);
    const searchQuery = common_vendor.ref("");
    const activeTab = common_vendor.ref("all");
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    common_vendor.onLoad(() => {
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
    });
    common_vendor.onShow(() => {
      fetchSuggestionList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more")
        fetchSuggestionList();
    });
    common_vendor.onPullDownRefresh(() => {
      fetchSuggestionList(true);
    });
    const fetchSuggestionList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh) {
        pageNo.value = 1;
        loadingStatus.value = "more";
      }
      loadingStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize,
        title: searchQuery.value || ""
      };
      if (activeTab.value === "mine")
        params.creator = loggedInUserId.value;
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/suggestion/list", {
          method: "GET",
          data: params
        });
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
        if (error || !data) {
          loadingStatus.value = "noMore";
          return;
        }
        const mappedData = data.list.map((item) => {
          var _a, _b, _c;
          return {
            id: item.id,
            title: item.title,
            content: item.content,
            rawStatus: item.status,
            // 保存原始状态码用于样式
            images: item.img ? item.img.split(",").filter(Boolean) : [],
            time: formatTimestamp(item.createTime),
            user: {
              id: ((_a = item.memberUser) == null ? void 0 : _a.id) || item.creator,
              name: ((_b = item.memberUser) == null ? void 0 : _b.nickname) || "商友",
              avatar: ((_c = item.memberUser) == null ? void 0 : _c.avatar) || defaultAvatarUrl
            }
          };
        });
        suggestionList.value = isRefresh ? mappedData : [...suggestionList.value, ...mappedData];
        loadingStatus.value = suggestionList.value.length >= data.total ? "noMore" : "more";
        if (loadingStatus.value === "more")
          pageNo.value++;
      } catch (err) {
        loadingStatus.value = "more";
      }
    };
    const handleDeleteSuggestion = (id) => {
      common_vendor.index.showModal({
        title: "确定删除？",
        content: "删除后此共建建议将不再对他人展示。",
        confirmColor: "#FF852B",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "处理中..."
            });
            const {
              error
            } = await utils_request.request(`/app-api/member/suggestion/delete?id=${id}`, {
              method: "DELETE"
            });
            common_vendor.index.hideLoading();
            if (!error) {
              common_vendor.index.showToast({
                title: "已删除"
              });
              suggestionList.value = suggestionList.value.filter((item) => item.id !== id);
            }
          }
        }
      });
    };
    const handleEditSuggestion = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/my-systemSuggestions/my-systemSuggestions?id=${id}`
      });
    };
    const handleTabClick = (tab) => {
      if (activeTab.value === tab)
        return;
      activeTab.value = tab;
      fetchSuggestionList(true);
    };
    const handleSearch = () => fetchSuggestionList(true);
    const navigateToCreate = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-systemSuggestions/my-systemSuggestions"
      });
    };
    const previewImage = (images, index) => {
      common_vendor.index.previewImage({
        urls: images,
        current: index
      });
    };
    const goUserCard = (userId) => {
      if (!userId)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/my-businessCard/my-businessCard?id=${userId}`
      });
    };
    const formatTimestamp = (ts) => {
      if (!ts)
        return "";
      const d = new Date(ts);
      return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
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
            a: suggestion.user.avatar || defaultAvatarUrl,
            b: common_vendor.t(suggestion.user.name),
            c: common_vendor.t(suggestion.time),
            d: common_vendor.o(($event) => goUserCard(suggestion.user.id), suggestion.id),
            e: loggedInUserId.value == suggestion.user.id
          }, loggedInUserId.value == suggestion.user.id ? {
            f: "d9b70221-1-" + i0,
            g: common_vendor.p({
              type: "compose",
              size: "14",
              color: "#FF852B"
            }),
            h: common_vendor.o(($event) => handleEditSuggestion(suggestion.id), suggestion.id),
            i: "d9b70221-2-" + i0,
            j: common_vendor.p({
              type: "trash",
              size: "14",
              color: "#999"
            }),
            k: common_vendor.o(($event) => handleDeleteSuggestion(suggestion.id), suggestion.id)
          } : {}, {
            l: common_vendor.t(suggestion.title),
            m: suggestion.content
          }, suggestion.content ? {
            n: common_vendor.t(suggestion.content)
          } : {}, {
            o: suggestion.images && suggestion.images.length > 0
          }, suggestion.images && suggestion.images.length > 0 ? {
            p: common_vendor.f(suggestion.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(suggestion.images, imgIndex), imgIndex),
                c: imgIndex
              };
            }),
            q: common_vendor.n("images-count-" + suggestion.images.length)
          } : {}, {
            r: suggestion.id
          });
        }),
        k: suggestionList.value.length === 0 && loadingStatus.value === "noMore"
      }, suggestionList.value.length === 0 && loadingStatus.value === "noMore" ? {
        l: common_vendor.p({
          type: "info",
          size: "50",
          color: "#ddd"
        })
      } : {
        m: common_vendor.p({
          status: loadingStatus.value
        })
      }, {
        n: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#FFFFFF"
        }),
        o: common_vendor.o(navigateToCreate)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d9b70221"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-systemConstruction/my-systemConstruction.js.map
