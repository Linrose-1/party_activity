"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _component_empty_state = common_vendor.resolveComponent("empty-state");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_load_more2 + _component_empty_state)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_load_more)();
}
const pageSize = 10;
const _sfc_main = {
  __name: "my-collection",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["收藏的活动", "收藏的商机"]);
    const refreshing = common_vendor.ref(false);
    const userId = common_vendor.ref(null);
    const favoriteActivities = common_vendor.ref([]);
    const activityPageNo = common_vendor.ref(1);
    const activityLoadingStatus = common_vendor.ref("more");
    const favoriteOpportunities = common_vendor.ref([]);
    const opportunityPageNo = common_vendor.ref(1);
    const opportunityLoadingStatus = common_vendor.ref("more");
    common_vendor.onLoad(() => {
      userId.value = common_vendor.index.getStorageSync("userId");
      if (!userId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      getFavorites(true);
    });
    const getFavorites = async (isRefresh = false) => {
      const isActivityTab = currentTab.value === 0;
      const currentStatus = isActivityTab ? activityLoadingStatus.value : opportunityLoadingStatus.value;
      if (currentStatus === "loading" || currentStatus === "noMore" && !isRefresh) {
        if (isRefresh)
          refreshing.value = false;
        return;
      }
      if (isRefresh) {
        if (isActivityTab) {
          activityPageNo.value = 1;
          favoriteActivities.value = [];
          activityLoadingStatus.value = "more";
        } else {
          opportunityPageNo.value = 1;
          favoriteOpportunities.value = [];
          opportunityLoadingStatus.value = "more";
        }
      }
      if (isActivityTab) {
        activityLoadingStatus.value = "loading";
      } else {
        opportunityLoadingStatus.value = "loading";
      }
      const params = {
        pageNo: isActivityTab ? activityPageNo.value : opportunityPageNo.value,
        pageSize,
        userId: userId.value,
        targetType: isActivityTab ? "activity" : "post"
      };
      try {
        const result = await utils_request.request("/app-api/member/follow/page", {
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/my-collection/my-collection.vue:233", `获取收藏的${isActivityTab ? "活动" : "商机"}:`, result);
        if (result && !result.error && result.data) {
          const rawList = result.data.list || [];
          if (isActivityTab) {
            const filteredList = rawList.filter((item) => item.activityRespVO && typeof item.activityRespVO === "object");
            favoriteActivities.value.push(...filteredList);
            activityPageNo.value++;
            activityLoadingStatus.value = rawList.length < pageSize ? "noMore" : "more";
          } else {
            const filteredList = rawList.filter((item) => item.postRespVO && typeof item.postRespVO === "object").map((item) => {
              const post = item.postRespVO;
              post.contactPerson = post.contactPerson || "匿名";
              post.postContent = post.postContent || "暂无内容";
              post.postImg = post.postImg || "";
              post.tags = post.tags || [];
              post.likesCount = post.likesCount || 0;
              post.dislikesCount = post.dislikesCount || 0;
              return item;
            });
            favoriteOpportunities.value.push(...filteredList);
            opportunityPageNo.value++;
            opportunityLoadingStatus.value = rawList.length < pageSize ? "noMore" : "more";
          }
        } else {
          if (isActivityTab)
            activityLoadingStatus.value = "noMore";
          else
            opportunityLoadingStatus.value = "noMore";
          common_vendor.index.showToast({
            title: result.error || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        if (isActivityTab)
          activityLoadingStatus.value = "noMore";
        else
          opportunityLoadingStatus.value = "noMore";
        common_vendor.index.showToast({
          title: "网络请求异常",
          icon: "none"
        });
      } finally {
        if (isRefresh) {
          refreshing.value = false;
        }
      }
    };
    const removeFavorite = async (followId, type) => {
      common_vendor.index.showModal({
        title: "取消收藏",
        content: `确定要取消收藏此${type === "activity" ? "活动" : "商机"}吗？`,
        success: async (res) => {
          if (res.confirm) {
            const payload = {
              targetId: followId,
              userId: userId.value,
              targetType: type
              // 'type' 参数的值就是 'activity' 或 'post'
            };
            const {
              error
            } = await utils_request.request("/app-api/member/follow/del", {
              method: "POST",
              data: payload
              // 使用新的请求体
            });
            if (!error) {
              common_vendor.index.showToast({
                title: "已取消收藏",
                icon: "success"
              });
              if (type === "activity") {
                const index = favoriteActivities.value.findIndex((item) => item.id === followId);
                if (index !== -1)
                  favoriteActivities.value.splice(index, 1);
              } else {
                const index = favoriteOpportunities.value.findIndex((item) => item.id === followId);
                if (index !== -1)
                  favoriteOpportunities.value.splice(index, 1);
              }
            } else {
              common_vendor.index.showToast({
                title: error || "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const switchTab = (e) => {
      if (currentTab.value === e.currentIndex)
        return;
      currentTab.value = e.currentIndex;
      const isActivityTab = currentTab.value === 0;
      const shouldLoad = isActivityTab ? favoriteActivities.value.length === 0 : favoriteOpportunities.value.length === 0;
      if (shouldLoad) {
        getFavorites(true);
      }
    };
    const onRefresh = () => {
      refreshing.value = true;
      getFavorites(true);
    };
    const loadMore = () => {
      getFavorites(false);
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "时间待定";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    const previewImage = (urls, current) => common_vendor.index.previewImage({
      urls,
      current
    });
    const skipActivityDetail = (id) => common_vendor.index.navigateTo({
      url: `/pages/active-detail/active-detail?id=${id}`
    });
    const navigateToDiscoverActivities = () => common_vendor.index.switchTab({
      url: "/pages/active/active"
    });
    const skipCommercialDetail = (id) => common_vendor.index.navigateTo({
      url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}`
    });
    const navigateToDiscoverOpportunities = () => common_vendor.index.switchTab({
      url: "/pages/home/home"
    });
    const skipApplicationBusinessCard = () => common_vendor.index.navigateTo({
      url: "/pages/applicationBusinessCard/applicationBusinessCard"
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(switchTab),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: favoriteActivities.value.length > 0
      }, favoriteActivities.value.length > 0 ? {
        d: common_vendor.f(favoriteActivities.value, (item, k0, i0) => {
          return {
            a: item.activityRespVO.coverImageUrl,
            b: common_vendor.t(item.activityRespVO.activityTitle),
            c: "7c9d235a-1-" + i0,
            d: common_vendor.t(formatTimestamp(item.activityRespVO.startDatetime)),
            e: "7c9d235a-2-" + i0,
            f: common_vendor.t(item.activityRespVO.locationAddress),
            g: "7c9d235a-3-" + i0,
            h: common_vendor.t(item.activityRespVO.organizerUnitName),
            i: common_vendor.o(($event) => removeFavorite(item.id, "activity"), item.id),
            j: common_vendor.o(($event) => skipActivityDetail(item.activityRespVO.id), item.id),
            k: item.id,
            l: common_vendor.o(($event) => skipActivityDetail(item.activityRespVO.id), item.id)
          };
        }),
        e: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        f: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        g: common_vendor.p({
          type: "person",
          size: "16",
          color: "#999"
        })
      } : {}, {
        h: favoriteActivities.value.length > 0
      }, favoriteActivities.value.length > 0 ? {
        i: common_vendor.p({
          status: activityLoadingStatus.value
        })
      } : {}, {
        j: activityLoadingStatus.value === "noMore" && favoriteActivities.value.length === 0
      }, activityLoadingStatus.value === "noMore" && favoriteActivities.value.length === 0 ? {
        k: common_vendor.o(navigateToDiscoverActivities),
        l: common_vendor.p({
          title: "暂无收藏活动",
          description: "快去发现并收藏感兴趣的活动吧"
        })
      } : {}, {
        m: currentTab.value === 0,
        n: refreshing.value,
        o: common_vendor.o(onRefresh),
        p: common_vendor.o(loadMore),
        q: favoriteOpportunities.value.length > 0
      }, favoriteOpportunities.value.length > 0 ? {
        r: common_vendor.f(favoriteOpportunities.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.postRespVO.memberUser.avatar,
            b: common_vendor.o(skipApplicationBusinessCard, item.id),
            c: common_vendor.t(item.postRespVO.memberUser.nickname),
            d: "7c9d235a-6-" + i0,
            e: common_vendor.t(formatTimestamp(item.postRespVO.createTime)),
            f: "7c9d235a-7-" + i0,
            g: common_vendor.o(($event) => removeFavorite(item.id, "post"), item.id),
            h: common_vendor.t(item.postRespVO.postContent),
            i: item.postRespVO.postImg && item.postRespVO.postImg.length
          }, item.postRespVO.postImg && item.postRespVO.postImg.length ? {
            j: common_vendor.f(item.postRespVO.postImg.split(","), (image, imgIndex, i1) => {
              return {
                a: image,
                b: imgIndex,
                c: common_vendor.o(($event) => previewImage(item.postRespVO.postImg.split(","), imgIndex), imgIndex)
              };
            }),
            k: item.postRespVO.postImg.split(",").length === 1 ? "widthFix" : "aspectFill",
            l: common_vendor.n("images-count-" + item.postRespVO.postImg.split(",").length)
          } : {}, {
            m: item.postRespVO.tags && item.postRespVO.tags.length
          }, item.postRespVO.tags && item.postRespVO.tags.length ? {
            n: common_vendor.f(item.postRespVO.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, {
            o: "7c9d235a-8-" + i0,
            p: common_vendor.t(item.postRespVO.likesCount),
            q: "7c9d235a-9-" + i0,
            r: common_vendor.t(item.postRespVO.dislikesCount),
            s: item.id,
            t: common_vendor.o(($event) => skipCommercialDetail(item.postRespVO.id), item.id)
          });
        }),
        s: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        t: common_vendor.p({
          type: "trash-fill",
          size: "20",
          color: "#FF6A00"
        }),
        v: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#e74c3c"
        }),
        w: common_vendor.p({
          type: "hand-down-filled",
          size: "18",
          color: "#3498db"
        })
      } : {}, {
        x: favoriteOpportunities.value.length > 0
      }, favoriteOpportunities.value.length > 0 ? {
        y: common_vendor.p({
          status: opportunityLoadingStatus.value
        })
      } : {}, {
        z: opportunityLoadingStatus.value === "noMore" && favoriteOpportunities.value.length === 0
      }, opportunityLoadingStatus.value === "noMore" && favoriteOpportunities.value.length === 0 ? {
        A: common_vendor.o(navigateToDiscoverOpportunities),
        B: common_vendor.p({
          title: "暂无收藏商机",
          description: "快去发现并收藏感兴趣的商机吧"
        })
      } : {}, {
        C: currentTab.value === 1,
        D: refreshing.value,
        E: common_vendor.o(onRefresh),
        F: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c9d235a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-collection/my-collection.js.map
