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
  __name: "comment-center",
  setup(__props) {
    const actionTab = common_vendor.ref("received");
    const targetType = common_vendor.ref("post");
    const businessTabs = [
      {
        label: "商机",
        value: "post"
      },
      {
        label: "聚会",
        value: "activity"
      },
      {
        label: "聚店",
        value: "store"
      }
    ];
    const commentList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const total = common_vendor.ref(0);
    const loadingStatus = common_vendor.ref("more");
    const fetchList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh)
        pageNo.value = 1;
      loadingStatus.value = "loading";
      const apiUrl = actionTab.value === "received" ? "/app-api/member/comment/my-page-by-target-type" : "/app-api/member/comment/my-comment-list";
      try {
        const {
          data,
          error
        } = await utils_request.request(apiUrl, {
          method: "GET",
          data: {
            targetType: targetType.value,
            pageNo: pageNo.value,
            pageSize: 10
          }
        });
        if (!error && data) {
          const list = data.list || [];
          const processedList = list.map((item) => {
            let imageUrls = item.imageUrls || [];
            if (Array.isArray(imageUrls) && imageUrls.length > 0) {
              if (typeof imageUrls[0] === "string" && imageUrls[0].startsWith("[")) {
                try {
                  imageUrls = JSON.parse(imageUrls[0]);
                } catch (e) {
                  common_vendor.index.__f__("warn", "at packages/comment-center/comment-center.vue:196", "解析imageUrls失败:", e);
                  imageUrls = [];
                }
              }
            }
            if (item.childrenList && Array.isArray(item.childrenList)) {
              item.childrenList = item.childrenList.map((child) => {
                let childImageUrls = child.imageUrls || [];
                if (Array.isArray(childImageUrls) && childImageUrls.length > 0) {
                  if (typeof childImageUrls[0] === "string" && childImageUrls[0].startsWith("[")) {
                    try {
                      childImageUrls = JSON.parse(childImageUrls[0]);
                    } catch (e) {
                      common_vendor.index.__f__("warn", "at packages/comment-center/comment-center.vue:211", "解析子评论imageUrls失败:", e);
                      childImageUrls = [];
                    }
                  }
                }
                return {
                  ...child,
                  imageUrls: childImageUrls
                };
              });
            }
            return {
              ...item,
              imageUrls
            };
          });
          commentList.value = isRefresh ? processedList : [...commentList.value, ...processedList];
          total.value = data.total;
          loadingStatus.value = commentList.value.length >= total.value ? "noMore" : "more";
          pageNo.value++;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/comment-center/comment-center.vue:235", e);
      } finally {
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const switchAction = (val) => {
      actionTab.value = val;
      fetchList(true);
    };
    const switchBusiness = (val) => {
      targetType.value = val;
      fetchList(true);
    };
    const getBizConfig = () => {
      const configs = {
        "post": {
          label: "商机",
          icon: "shop-filled",
          color: "#FF8700"
        },
        "activity": {
          label: "聚会",
          icon: "calendar-filled",
          color: "#007AFF"
        },
        "store": {
          label: "聚店",
          icon: "home-filled",
          color: "#4CD964"
        }
      };
      return configs[targetType.value];
    };
    const getTargetTitle = (item) => {
      var _a, _b, _c;
      if (targetType.value === "post")
        return ((_a = item.memberBusinessOpportunitiesRespVO) == null ? void 0 : _a.title) || "商机详情";
      if (targetType.value === "activity")
        return ((_b = item.memberActivityRespVO) == null ? void 0 : _b.activityTitle) || "聚会详情";
      if (targetType.value === "store")
        return ((_c = item.memberStoreRespVO) == null ? void 0 : _c.storeName) || "聚店详情";
      return "查看详情";
    };
    const goToTarget = (item) => {
      let url = "";
      const id = item.targetId;
      if (targetType.value === "post")
        url = `/packages/home-commercialDetail/home-commercialDetail?id=${id}`;
      else if (targetType.value === "activity")
        url = `/packages/active-detail/active-detail?id=${id}`;
      else if (targetType.value === "store")
        url = `/packages/shop-detail/shop-detail?id=${id}`;
      if (url) {
        common_vendor.index.navigateTo({
          url: `${url}&commentId=${item.id}`
        });
      }
    };
    const formatTime = (str) => {
      if (!str)
        return "";
      const d = new Date(str);
      return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current
      });
    };
    common_vendor.onMounted(() => fetchList(true));
    common_vendor.onPullDownRefresh(() => fetchList(true));
    common_vendor.onReachBottom(() => loadingStatus.value === "more" && fetchList());
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(actionTab.value === "received" ? "谁在关注您的动态" : "回顾您的精彩互动"),
        b: common_vendor.t(total.value),
        c: actionTab.value === "received" ? 1 : "",
        d: common_vendor.o(($event) => switchAction("received")),
        e: actionTab.value === "sent" ? 1 : "",
        f: common_vendor.o(($event) => switchAction("sent")),
        g: common_vendor.f(businessTabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: tab.value,
            c: targetType.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => switchBusiness(tab.value), tab.value)
          };
        }),
        h: common_vendor.f(commentList.value, (item, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: ((_a = item.memberUserBaseVO) == null ? void 0 : _a.avatar) || "/static/images/default-avatar.png",
            b: common_vendor.t(item.anonymous === 1 ? "匿名商友" : ((_b = item.memberUserBaseVO) == null ? void 0 : _b.nickname) || "商友"),
            c: item.owner === 1
          }, item.owner === 1 ? {} : {}, {
            d: common_vendor.t(formatTime(item.createTime)),
            e: actionTab.value === "received" && item.isRead === 0
          }, actionTab.value === "received" && item.isRead === 0 ? {} : {}, {
            f: common_vendor.t(item.content),
            g: item.imageUrls && item.imageUrls.length > 0
          }, item.imageUrls && item.imageUrls.length > 0 ? {
            h: common_vendor.f(item.imageUrls, (img, imgIndex, i1) => {
              return {
                a: img,
                b: imgIndex,
                c: common_vendor.o(($event) => previewImage(item.imageUrls, imgIndex), imgIndex)
              };
            })
          } : {}, {
            i: "c078da3e-0-" + i0,
            j: common_vendor.t(getTargetTitle(item)),
            k: "c078da3e-1-" + i0,
            l: common_vendor.o(($event) => goToTarget(item), item.id),
            m: item.childrenList && item.childrenList.length > 0
          }, item.childrenList && item.childrenList.length > 0 ? common_vendor.e({
            n: common_vendor.f(item.childrenList.slice(0, 1), (child, k1, i1) => {
              var _a2;
              return {
                a: common_vendor.t(((_a2 = child.memberUserBaseVO) == null ? void 0 : _a2.nickname) || "商友"),
                b: common_vendor.t(child.content),
                c: child.id
              };
            }),
            o: item.childrenList.length > 1
          }, item.childrenList.length > 1 ? {
            p: common_vendor.t(item.childrenList.length)
          } : {}) : {}, actionTab.value === "received" ? {
            q: "c078da3e-2-" + i0,
            r: common_vendor.p({
              type: "chatbubble",
              size: "14",
              color: "#FF8700"
            }),
            s: common_vendor.o(($event) => goToTarget(item), item.id)
          } : {}, {
            t: item.id
          });
        }),
        i: common_vendor.p({
          type: getBizConfig().icon,
          size: "18",
          color: getBizConfig().color
        }),
        j: common_vendor.t(actionTab.value === "received" ? "评论了我的" : "我评论了"),
        k: common_vendor.t(getBizConfig().label),
        l: common_vendor.p({
          type: "right",
          size: "12",
          color: "#ccc"
        }),
        m: actionTab.value === "received",
        n: commentList.value.length > 0 || loadingStatus.value === "loading"
      }, commentList.value.length > 0 || loadingStatus.value === "loading" ? {
        o: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        p: commentList.value.length === 0 && loadingStatus.value === "noMore"
      }, commentList.value.length === 0 && loadingStatus.value === "noMore" ? {
        q: common_vendor.p({
          type: "chat-filled",
          size: "80",
          color: "#e0e0e0"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c078da3e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/comment-center/comment-center.js.map
