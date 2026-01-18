"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + MyRadarChart)();
}
const MyRadarChart = () => "../../components/MyRadarChart.js";
const _sfc_main = {
  __name: "user-reviews",
  setup(__props) {
    const ReviewApi = {
      // 创建评论（赞/踩）
      create: (data) => utils_request.request("/app-api/member/user-review/create", {
        method: "POST",
        data
      }),
      // 获取评论分页
      getPage: (params) => utils_request.request("/app-api/member/user-review/page", {
        method: "GET",
        data: params
      }),
      // 更新评论
      update: (data) => utils_request.request("/app-api/member/user-review/update", {
        method: "PUT",
        data
      }),
      // 获取我的点评列表 (这里用于查"我发给某人"的)
      getMyList: (params) => utils_request.request("/app-api/member/user-review/my-list", {
        method: "GET",
        data: params
      })
    };
    const ScoreApi = {
      // 获取综合统计或自我评价统计 (type: 0自评, 3综合)
      getStatistics: (userId, type) => utils_request.request("/app-api/member/user-scores/complexStatistics", {
        method: "GET",
        data: {
          userId,
          type
        }
      }),
      // 获取详细评分信息
      getInfo: (userId) => utils_request.request("/app-api/member/user-scores/getInfo", {
        method: "GET",
        data: {
          userId
        }
      }),
      // 保存评分
      save: (data) => utils_request.request("/app-api/member/user-scores/saveOrUpdate", {
        method: "POST",
        data
      })
    };
    const currentTab = common_vendor.ref(0);
    const targetUserId = common_vendor.ref(null);
    const currentUserId = common_vendor.ref(null);
    const isReviewSubmitting = common_vendor.ref(false);
    const reviewForm = common_vendor.reactive({
      isLike: 1,
      // 1:点赞, 2:点踩
      reviewContent: ""
    });
    const recentReviews = common_vendor.ref([]);
    const totalReviews = common_vendor.ref(0);
    const reviewRecordId = common_vendor.ref(null);
    const isReviewEditMode = common_vendor.ref(false);
    common_vendor.ref(false);
    const scoreRecordId = common_vendor.ref(null);
    const radarDatasets = common_vendor.ref([]);
    const scores = common_vendor.ref({
      punctuality: 0,
      promiseKeep: 0,
      lawAbiding: 0,
      responsible: 0,
      sincere: 0,
      tolerance: 0,
      altruism: 0,
      empathy: 0,
      focus: 0,
      efficient: 0,
      detailOriented: 0,
      expandVision: 0,
      contribution: 0,
      humility: 0,
      foresight: 0,
      mission: 0
    });
    common_vendor.onLoad((options) => {
      if (options.userId) {
        targetUserId.value = options.userId;
      } else {
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
      currentUserId.value = common_vendor.index.getStorageSync("userId");
    });
    common_vendor.onMounted(() => {
      if (targetUserId.value) {
        fetchRecentReviews();
        fetchMyReviewToTarget();
        fetchMyHistoryScore();
        fetchRadarStatistics();
      }
    });
    const switchTab = (index) => {
      currentTab.value = index;
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    };
    const fetchMyReviewToTarget = async () => {
      try {
        const {
          data,
          error
        } = await ReviewApi.getMyList({
          reviewedId: targetUserId.value,
          // 关键：后端 my-list 接口文档说支持 userId 筛选，
          // 且 isOwn=1 表示我发出的。为了精准，最好加上 userId=currentUserId
          // 或者 isOwn=1 (取决于后端实现，通常 my-list 默认就是查自己的)
          // 根据文档：isOwn: 0点评我的，1我点评的
          isOwn: 1,
          pageNo: 1,
          pageSize: 1
        });
        if (!error && data && data.list && data.list.length > 0) {
          const myReview = data.list[0];
          reviewForm.isLike = myReview.isLike;
          reviewForm.reviewContent = myReview.reviewContent;
          reviewRecordId.value = myReview.id;
          isReviewEditMode.value = true;
          common_vendor.index.__f__("log", "at packages/user-reviews/user-reviews.vue:337", "✅ 回显我的历史评价:", myReview);
        } else {
          isReviewEditMode.value = false;
          reviewRecordId.value = null;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/user-reviews/user-reviews.vue:344", "获取我的评价失败", e);
      }
    };
    const selectLike = (val) => {
      reviewForm.isLike = val;
    };
    const handleReviewSubmit = async () => {
      if (!reviewForm.isLike) {
        common_vendor.index.showToast({
          title: "请选择评价类型",
          icon: "none"
        });
        return;
      }
      if (isReviewSubmitting.value)
        return;
      isReviewSubmitting.value = true;
      try {
        let error;
        if (isReviewEditMode.value && reviewRecordId.value) {
          const payload = {
            id: reviewRecordId.value,
            // 必填
            userId: currentUserId.value,
            reviewedId: targetUserId.value,
            isLike: reviewForm.isLike,
            reviewContent: reviewForm.reviewContent,
            isAnonymous: 1,
            // 保持匿名
            starRating: 0
          };
          const res = await ReviewApi.update(payload);
          error = res.error;
        } else {
          const payload = {
            userId: currentUserId.value,
            reviewedId: targetUserId.value,
            isLike: reviewForm.isLike,
            reviewContent: reviewForm.reviewContent,
            isAnonymous: 1,
            starRating: 0
          };
          const res = await ReviewApi.create(payload);
          error = res.error;
        }
        if (!error) {
          common_vendor.index.showToast({
            title: isReviewEditMode.value ? "修改成功" : "提交成功",
            icon: "success"
          });
          await fetchMyReviewToTarget();
          fetchRecentReviews();
        } else {
          const msg = typeof error === "string" ? error : error.msg || "操作失败";
          common_vendor.index.showToast({
            title: msg,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        isReviewSubmitting.value = false;
      }
    };
    const fetchRecentReviews = async () => {
      try {
        const {
          data,
          error
        } = await ReviewApi.getPage({
          reviewedId: targetUserId.value,
          pageNo: 1,
          pageSize: 5
        });
        if (!error && data) {
          recentReviews.value = data.list || [];
          totalReviews.value = data.total || 0;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/user-reviews/user-reviews.vue:438", "获取最近反馈失败", e);
      }
    };
    const goToAllReviews = () => {
      common_vendor.index.navigateTo({
        url: `/packages/user-review-list/user-review-list?userId=${targetUserId.value}`
      });
    };
    const goToRatePage = () => {
      common_vendor.index.navigateTo({
        url: `/pages/my-edit-label/my-edit-label?id=${targetUserId.value}`
      });
    };
    const fetchRadarStatistics = async () => {
      try {
        const [selfRes, complexRes] = await Promise.all([
          ScoreApi.getStatistics(targetUserId.value, 0),
          ScoreApi.getStatistics(targetUserId.value, 3)
        ]);
        const newDatasets = [];
        if (!selfRes.error && selfRes.data) {
          newDatasets.push({
            name: "自我评价",
            data: [
              selfRes.data.avg1 || 0,
              selfRes.data.avg2 || 0,
              selfRes.data.avg3 || 0,
              selfRes.data.avg4 || 0
            ],
            color: "#FF7D00"
          });
        }
        if (!complexRes.error && complexRes.data) {
          newDatasets.push({
            name: "综合评价",
            data: [
              complexRes.data.avg1 || 0,
              complexRes.data.avg2 || 0,
              complexRes.data.avg3 || 0,
              complexRes.data.avg4 || 0
            ],
            color: "#1890FF"
          });
        }
        radarDatasets.value = newDatasets;
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/user-reviews/user-reviews.vue:497", "获取统计数据失败", e);
      }
    };
    const fetchMyHistoryScore = async () => {
      try {
        const {
          data,
          error
        } = await ScoreApi.getInfo(targetUserId.value);
        if (!error && data) {
          common_vendor.index.__f__("log", "at packages/user-reviews/user-reviews.vue:510", "✅ 获取到历史评分:", data);
          if (data.id)
            scoreRecordId.value = data.id;
          Object.keys(scores.value).forEach((key) => {
            if (data[key] !== void 0 && data[key] !== null) {
              scores.value[key] = data[key];
            }
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/user-reviews/user-reviews.vue:520", "获取历史评分异常:", e);
      }
    };
    const getScoreValue = (datasetIndex, dimIndex) => {
      const ds = radarDatasets.value[datasetIndex];
      if (ds && ds.data) {
        const val = ds.data[dimIndex];
        return val !== void 0 ? val : "-";
      }
      return "-";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === 0
      }, currentTab.value === 0 ? {} : {}, {
        b: currentTab.value === 0 ? 1 : "",
        c: common_vendor.o(($event) => switchTab(0)),
        d: currentTab.value === 1
      }, currentTab.value === 1 ? {} : {}, {
        e: currentTab.value === 1 ? 1 : "",
        f: common_vendor.o(($event) => switchTab(1)),
        g: currentTab.value === 0
      }, currentTab.value === 0 ? common_vendor.e({
        h: common_vendor.p({
          type: "hand-up-filled",
          size: "24",
          color: reviewForm.isLike === 1 ? "#fff" : "#FF6A00"
        }),
        i: reviewForm.isLike === 1 ? "#fff" : "#FF6A00",
        j: reviewForm.isLike === 1 ? 1 : "",
        k: common_vendor.o(($event) => selectLike(1)),
        l: common_vendor.p({
          type: "hand-down-filled",
          size: "24",
          color: reviewForm.isLike === 2 ? "#fff" : "#666"
        }),
        m: reviewForm.isLike === 2 ? "#fff" : "#666",
        n: reviewForm.isLike === 2 ? 1 : "",
        o: common_vendor.o(($event) => selectLike(2)),
        p: reviewForm.reviewContent,
        q: common_vendor.o(($event) => reviewForm.reviewContent = $event.detail.value),
        r: common_vendor.t(isReviewSubmitting.value ? "处理中..." : isReviewEditMode.value ? "修改反馈" : "提交反馈"),
        s: isReviewSubmitting.value,
        t: common_vendor.o(handleReviewSubmit),
        v: recentReviews.value.length > 0
      }, recentReviews.value.length > 0 ? {
        w: common_vendor.f(recentReviews.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.isLike === 1
          }, item.isLike === 1 ? {
            b: "91a56258-2-" + i0,
            c: common_vendor.p({
              type: "hand-up-filled",
              size: "18",
              color: "#FF6A00"
            })
          } : {
            d: "91a56258-3-" + i0,
            e: common_vendor.p({
              type: "hand-down-filled",
              size: "18",
              color: "#999"
            })
          }, {
            f: common_vendor.t(item.reviewContent || (item.isLike === 1 ? "点了个赞" : "踩了一下")),
            g: common_vendor.t(formatTime(item.createTime)),
            h: item.id
          });
        }),
        x: common_vendor.t(totalReviews.value),
        y: common_vendor.o(goToAllReviews)
      } : {}) : {}, {
        z: currentTab.value === 1
      }, currentTab.value === 1 ? common_vendor.e({
        A: radarDatasets.value.length > 0
      }, radarDatasets.value.length > 0 ? {
        B: common_vendor.p({
          type: "data-filled",
          size: "16",
          color: "#1890FF"
        }),
        C: common_vendor.p({
          categories: ["基础信用", "协作态度", "专业能力", "精神格局"],
          datasets: radarDatasets.value
        }),
        D: common_vendor.f(["基础信用", "协作态度", "专业能力", "精神格局"], (dim, index, i0) => {
          return {
            a: common_vendor.t(dim),
            b: common_vendor.t(getScoreValue(0, index)),
            c: common_vendor.t(getScoreValue(1, index)),
            d: index
          };
        })
      } : {}, {
        E: common_vendor.p({
          type: "info-filled",
          size: "16",
          color: "#FF8C00"
        }),
        F: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#FF8C00"
        }),
        G: common_vendor.p({
          type: "right",
          size: "20",
          color: "#ccc"
        }),
        H: common_vendor.o(goToRatePage)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-91a56258"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/user-reviews/user-reviews.js.map
