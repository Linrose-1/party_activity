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
const _sfc_main = {
  __name: "user-review-list",
  setup(__props) {
    const ReviewApi = {
      /** 获取评论分页列表 */
      getPage: (params) => utils_request.request("/app-api/member/user-review/page", {
        method: "GET",
        data: params
      }),
      /** 创建互动 (点赞/点踩) */
      createInteraction: (data) => utils_request.request("/app-api/member/user-review-interaction/create", {
        method: "POST",
        data
      }),
      /** 取消互动 */
      cancelInteraction: (data) => utils_request.request(`/app-api/member/user-review-interaction/cancel?id=${data.id}`, {
        method: "DELETE"
      })
    };
    const targetUserId = common_vendor.ref(null);
    const currentFilter = common_vendor.ref(0);
    const searchKey = common_vendor.ref("");
    const reviewList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadingStatus = common_vendor.ref("more");
    const isActionInProgress = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.userId) {
        targetUserId.value = options.userId;
        fetchList(true);
      }
    });
    common_vendor.onPullDownRefresh(() => {
      fetchList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        fetchList();
      }
    });
    const switchFilter = (val) => {
      if (currentFilter.value === val)
        return;
      currentFilter.value = val;
      fetchList(true);
    };
    const handleSearch = () => {
      fetchList(true);
    };
    const fetchList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh) {
        pageNo.value = 1;
        loadingStatus.value = "more";
      }
      loadingStatus.value = "loading";
      try {
        const params = {
          reviewedId: targetUserId.value,
          pageNo: pageNo.value,
          pageSize: pageSize.value
        };
        if (currentFilter.value !== 0) {
          params.isLike = currentFilter.value;
        }
        const {
          data,
          error
        } = await ReviewApi.getPage(params);
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
        if (!error && data) {
          const list = data.list || [];
          reviewList.value = isRefresh ? list : [...reviewList.value, ...list];
          total.value = data.total;
          if (reviewList.value.length >= total.value) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
          }
        } else {
          loadingStatus.value = "noMore";
        }
      } catch (e) {
        loadingStatus.value = "more";
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const toggleAction = async (item, actionType) => {
      if (isActionInProgress.value) {
        common_vendor.index.showToast({
          title: "操作太快了，请稍候",
          icon: "none"
        });
        return;
      }
      const currentUserId = common_vendor.index.getStorageSync("userId");
      if (!currentUserId) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      const targetIsLike = actionType === "like" ? 1 : 2;
      const currentStatus = item.isReview;
      let isCancel = false;
      if (currentStatus === targetIsLike) {
        isCancel = true;
      }
      const originalStatus = item.isReview;
      const originalLikes = item.likesCount;
      const originalDislikes = item.dislikesCount;
      if (isCancel) {
        item.isReview = 0;
        if (originalStatus === 1)
          item.likesCount--;
        if (originalStatus === 2)
          item.dislikesCount--;
      } else {
        item.isReview = targetIsLike;
        if (targetIsLike === 1) {
          item.likesCount++;
          if (originalStatus === 2)
            item.dislikesCount--;
        } else {
          item.dislikesCount++;
          if (originalStatus === 1)
            item.likesCount--;
        }
      }
      try {
        if (isCancel) {
          const {
            error
          } = await ReviewApi.cancelInteraction({
            id: item.id
          });
          if (error)
            throw new Error(error.msg);
        } else {
          const {
            data,
            error
          } = await ReviewApi.createInteraction({
            userId: currentUserId,
            reviewId: item.id,
            isLike: targetIsLike
          });
          if (error)
            throw new Error(error.msg);
        }
      } catch (e) {
        item.isReview = originalStatus;
        item.likesCount = originalLikes;
        item.dislikesCount = originalDislikes;
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      } finally {
        setTimeout(() => {
          isActionInProgress.value = false;
        }, 2e3);
      }
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: common_vendor.o(handleSearch),
        c: common_vendor.o(($event) => searchKey.value = $event),
        d: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索反馈内容",
          modelValue: searchKey.value
        }),
        e: currentFilter.value === 0 ? 1 : "",
        f: common_vendor.o(($event) => switchFilter(0)),
        g: currentFilter.value === 1 ? 1 : "",
        h: common_vendor.o(($event) => switchFilter(1)),
        i: currentFilter.value === 2 ? 1 : "",
        j: common_vendor.o(($event) => switchFilter(2)),
        k: common_vendor.f(reviewList.value, (item, k0, i0) => {
          return {
            a: "e97763d7-1-" + i0,
            b: common_vendor.p({
              type: item.isLike === 1 ? "hand-up-filled" : "hand-down-filled",
              size: "16",
              color: item.isLike === 1 ? "#FF6A00" : "#666"
            }),
            c: common_vendor.t(item.isLike === 1 ? "正面反馈" : "改进建议"),
            d: common_vendor.n(item.isLike === 1 ? "like" : "dislike"),
            e: "e97763d7-2-" + i0,
            f: common_vendor.t(formatTime(item.createTime)),
            g: common_vendor.t(item.reviewContent || (item.isLike === 1 ? "（未填写具体原因，默认为好评）" : "（未填写具体原因，默认为改进建议）")),
            h: "e97763d7-3-" + i0,
            i: common_vendor.p({
              type: item.isReview === 1 ? "hand-up-filled" : "hand-up",
              size: "18",
              color: item.isReview === 1 ? "#FF6A00" : "#999"
            }),
            j: common_vendor.t(item.likesCount || 0),
            k: item.isReview === 1 ? 1 : "",
            l: common_vendor.o(($event) => toggleAction(item, "like"), item.id),
            m: "e97763d7-4-" + i0,
            n: common_vendor.p({
              type: item.isReview === 2 ? "hand-down-filled" : "hand-down",
              size: "18",
              color: item.isReview === 2 ? "#333" : "#999"
            }),
            o: common_vendor.t(item.dislikesCount || 0),
            p: item.isReview === 2 ? 1 : "",
            q: common_vendor.o(($event) => toggleAction(item, "dislike"), item.id),
            r: item.id
          };
        }),
        l: common_vendor.p({
          type: "locked-filled",
          size: "14",
          color: "#999"
        }),
        m: reviewList.value.length > 0 || loadingStatus.value === "loading"
      }, reviewList.value.length > 0 || loadingStatus.value === "loading" ? {
        n: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        o: reviewList.value.length === 0 && loadingStatus.value === "noMore"
      }, reviewList.value.length === 0 && loadingStatus.value === "noMore" ? {
        p: common_vendor.p({
          type: "chatboxes",
          size: "60",
          color: "#e0e0e0"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e97763d7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/user-review-list/user-review-list.js.map
