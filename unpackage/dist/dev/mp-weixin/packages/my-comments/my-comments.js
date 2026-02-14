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
const _sfc_main = {
  __name: "my-comments",
  setup(__props) {
    const CommentApi = {
      /** 获取登录用户发出的评论分页列表 */
      getMyCommentList: (params) => utils_request.request("/app-api/member/comment/my-comment-list", {
        method: "GET",
        data: params
      })
    };
    const loadingStatus = common_vendor.ref("more");
    const commentList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      fetchList(true);
    });
    common_vendor.onPullDownRefresh(() => {
      fetchList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        fetchList();
      }
    });
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
          targetType: "post",
          pageNo: pageNo.value,
          pageSize: pageSize.value
        };
        const {
          data,
          error
        } = await CommentApi.getMyCommentList(params);
        if (!error && data) {
          const list = data.list || [];
          commentList.value = isRefresh ? list : [...commentList.value, ...list];
          total.value = data.total;
          if (commentList.value.length >= total.value) {
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
        common_vendor.index.__f__("error", "at packages/my-comments/my-comments.vue:187", "获取我的评论列表失败:", e);
      }
      if (isRefresh) {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const formatTime = (str) => {
      if (!str)
        return "";
      const d = new Date(str);
      const now = /* @__PURE__ */ new Date();
      const diff = now - d;
      if (diff < 36e5) {
        const minutes = Math.floor(diff / 6e4);
        return minutes < 1 ? "刚刚" : `${minutes}分钟前`;
      }
      if (diff < 864e5) {
        const hours = Math.floor(diff / 36e5);
        return `${hours}小时前`;
      }
      if (diff < 6048e5) {
        const days = Math.floor(diff / 864e5);
        return `${days}天前`;
      }
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    };
    const getTargetTitle = (item) => {
      if (item.memberBusinessOpportunitiesRespVO) {
        return item.memberBusinessOpportunitiesRespVO.title || "商机详情";
      }
      return "查看详情";
    };
    const goToTarget = (item) => {
      if (!item.targetId) {
        common_vendor.index.showToast({
          title: "商机ID不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/packages/home-commercialDetail/home-commercialDetail?id=${item.targetId}&commentId=${item.id}`,
        success: () => {
          common_vendor.index.__f__("log", "at packages/my-comments/my-comments.vue:252", "跳转成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at packages/my-comments/my-comments.vue:256", "跳转失败:", err);
          let errorMsg = "跳转失败";
          if (err.errMsg && err.errMsg.includes("navigateTo:fail")) {
            errorMsg = "该商机已被删除或不存在";
          } else if (err.errMsg) {
            errorMsg = err.errMsg;
          }
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 3e3
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(total.value),
        b: common_vendor.f(commentList.value, (item, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: ((_a = item.memberUserBaseVO) == null ? void 0 : _a.avatar) || "/static/images/default-avatar.png",
            b: common_vendor.t(item.anonymous === 1 ? "匿名商友" : ((_b = item.memberUserBaseVO) == null ? void 0 : _b.nickname) || "未知商友"),
            c: common_vendor.t(formatTime(item.createTime)),
            d: item.anonymous === 1
          }, item.anonymous === 1 ? {} : {}, {
            e: common_vendor.t(item.content),
            f: "3666a41d-0-" + i0,
            g: common_vendor.t(getTargetTitle(item)),
            h: "3666a41d-1-" + i0,
            i: common_vendor.o(($event) => goToTarget(item), item.id),
            j: item.childrenList && item.childrenList.length > 0
          }, item.childrenList && item.childrenList.length > 0 ? {
            k: "3666a41d-2-" + i0,
            l: common_vendor.p({
              type: "chatbubble",
              size: "12",
              color: "#999"
            }),
            m: common_vendor.t(item.childrenList.length),
            n: common_vendor.f(item.childrenList, (child, k1, i1) => {
              var _a2, _b2;
              return {
                a: ((_a2 = child.memberUserBaseVO) == null ? void 0 : _a2.avatar) || "/static/images/default-avatar.png",
                b: common_vendor.t(child.anonymous === 1 ? "匿名商友" : ((_b2 = child.memberUserBaseVO) == null ? void 0 : _b2.nickname) || "未知商友"),
                c: common_vendor.t(formatTime(child.createTime)),
                d: common_vendor.t(child.content),
                e: child.id
              };
            })
          } : {}, {
            o: item.id
          });
        }),
        c: common_vendor.p({
          type: "shop-filled",
          size: "18",
          color: "#FF8700"
        }),
        d: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        e: commentList.value.length > 0 || loadingStatus.value === "loading"
      }, commentList.value.length > 0 || loadingStatus.value === "loading" ? {
        f: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        g: commentList.value.length === 0 && loadingStatus.value === "noMore"
      }, commentList.value.length === 0 && loadingStatus.value === "noMore" ? {
        h: common_vendor.p({
          type: "chat",
          size: "80",
          color: "#e0e0e0"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3666a41d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-comments/my-comments.js.map
