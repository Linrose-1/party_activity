"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  ActivityCard();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const pageSize = 10;
const _sfc_main = {
  __name: "store-activity-list",
  setup(__props) {
    const storeId = common_vendor.ref(null);
    const storeName = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const pageNo = common_vendor.ref(1);
    const activitiesData = common_vendor.ref([]);
    const isLogin = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      storeId.value = options.storeId;
      storeName.value = options.storeName ? decodeURIComponent(options.storeName) : "聚店";
      common_vendor.index.setNavigationBarTitle({
        title: storeName.value + " · 历史聚会"
      });
      isLogin.value = !!common_vendor.index.getStorageSync("token");
      fetchList(false);
    });
    common_vendor.onPullDownRefresh(async () => {
      await fetchList(false);
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      if (hasMore.value && !loading.value) {
        fetchList(true);
      }
    });
    const fetchList = async (isLoadMore = false) => {
      if (loading.value)
        return;
      if (isLoadMore && !hasMore.value)
        return;
      if (!storeId.value)
        return;
      loading.value = true;
      if (!isLoadMore) {
        pageNo.value = 1;
        activitiesData.value = [];
        hasMore.value = true;
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/activity/store-list", {
          method: "GET",
          data: {
            storeId: storeId.value,
            pageNo: pageNo.value,
            pageSize
          }
        });
        if (error) {
          common_vendor.index.showToast({
            title: error,
            icon: "none"
          });
          hasMore.value = false;
          return;
        }
        if (data) {
          const {
            list = [],
            total = 0
          } = data;
          if (isLoadMore) {
            activitiesData.value.push(...list);
          } else {
            activitiesData.value = list;
          }
          hasMore.value = activitiesData.value.length < total;
          pageNo.value++;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/store-activity-list/store-activity-list.vue:142", "[store-activity-list] 请求异常:", e);
        hasMore.value = false;
      } finally {
        loading.value = false;
      }
    };
    const handleFavoriteChange = (event) => {
      const activity = activitiesData.value.find((a) => a.id == event.id);
      if (activity)
        activity.followFlag = event.newFollowFlag;
    };
    const handleLikeChange = async ({
      id,
      action,
      clickedAction
    }) => {
      const activity = activitiesData.value.find((item) => item.id == id);
      if (!activity)
        return;
      const originalAction = activity.userLikeStr;
      const originalLikes = activity.likesCount;
      const originalDislikes = activity.dislikesCount;
      if (action === "cancel") {
        activity.userLikeStr = null;
        clickedAction === "like" ? activity.likesCount-- : activity.dislikesCount--;
      } else {
        activity.userLikeStr = clickedAction;
        if (clickedAction === "like") {
          activity.likesCount++;
          if (originalAction === "dislike")
            activity.dislikesCount--;
        } else {
          activity.dislikesCount++;
          if (originalAction === "like")
            activity.likesCount--;
        }
      }
      const {
        error
      } = await utils_request.request("/app-api/member/like-action/add", {
        method: "POST",
        data: {
          targetId: id,
          targetType: "activity",
          action
        }
      });
      if (error) {
        activity.userLikeStr = originalAction;
        activity.likesCount = originalLikes;
        activity.dislikesCount = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !loading.value && activitiesData.value.length === 0
      }, !loading.value && activitiesData.value.length === 0 ? {
        b: common_assets._imports_0$13
      } : {}, {
        c: common_vendor.f(activitiesData.value, (activity, k0, i0) => {
          return {
            a: activity.id,
            b: common_vendor.o(handleFavoriteChange, activity.id),
            c: common_vendor.o(handleLikeChange, activity.id),
            d: "07459c0c-0-" + i0,
            e: common_vendor.p({
              activity,
              ["is-login"]: isLogin.value
            })
          };
        }),
        d: !hasMore.value && activitiesData.value.length > 0
      }, !hasMore.value && activitiesData.value.length > 0 ? {} : {}, {
        e: loading.value
      }, loading.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07459c0c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/store-activity-list/store-activity-list.js.map
