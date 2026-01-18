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
  (_easycom_uni_icons + _easycom_uni_load_more + EditReviewPopup)();
}
const EditReviewPopup = () => "../../components/EditReviewPopup.js";
const _sfc_main = {
  __name: "my-reviews",
  setup(__props) {
    const ReviewApi = {
      /** 获取我的点评列表 (发出的/收到的) */
      getMyList: (params) => utils_request.request("/app-api/member/user-review/my-list", {
        method: "GET",
        data: params
      }),
      /** 更新点评内容 */
      update: (data) => utils_request.request("/app-api/member/user-review/update", {
        method: "PUT",
        data
      }),
      /** 删除点评 (注意：ID拼接在URL上) */
      delete: (id) => utils_request.request(`/app-api/member/user-review/delete?id=${id}`, {
        method: "DELETE"
      })
    };
    const currentTab = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    const filterLike = common_vendor.ref(null);
    const reviewList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const editPopup = common_vendor.ref(null);
    const currentEditItem = common_vendor.ref({});
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
    const switchTab = (tab) => {
      if (currentTab.value === tab)
        return;
      currentTab.value = tab;
      filterLike.value = null;
      fetchList(true);
    };
    const toggleFilter = (val) => {
      if (filterLike.value === val) {
        filterLike.value = null;
      } else {
        filterLike.value = val;
      }
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
          isOwn: currentTab.value,
          pageNo: pageNo.value,
          pageSize: pageSize.value
        };
        if (filterLike.value) {
          params.isLike = filterLike.value;
        }
        const {
          data,
          error
        } = await ReviewApi.getMyList(params);
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
    const getAvatar = (item) => {
      var _a;
      if (currentTab.value === 0) {
        return "/static/icon/default-avatar.png";
      }
      return ((_a = item.memberUser) == null ? void 0 : _a.avatar) || "/static/icon/default-avatar.png";
    };
    const getName = (item) => {
      var _a;
      if (currentTab.value === 0) {
        return "匿名用户";
      }
      return ((_a = item.memberUser) == null ? void 0 : _a.nickname) || "未知用户";
    };
    const getRole = (item) => {
      var _a;
      if (currentTab.value === 0)
        return "";
      return ((_a = item.memberUser) == null ? void 0 : _a.levelName) || "";
    };
    const formatTime = (str) => {
      if (!str)
        return "";
      const d = new Date(str);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };
    const openEdit = (item) => {
      currentEditItem.value = {
        ...item,
        targetName: getName(item)
      };
      editPopup.value.open();
    };
    const onSaveReview = async (formData, done) => {
      try {
        const {
          error
        } = await ReviewApi.update(formData);
        if (!error) {
          common_vendor.index.showToast({
            title: "修改成功",
            icon: "success"
          });
          const index = reviewList.value.findIndex((i) => i.id === formData.id);
          if (index !== -1) {
            reviewList.value[index].reviewContent = formData.reviewContent;
            reviewList.value[index].isLike = formData.isLike;
          }
          done();
        } else {
          common_vendor.index.showToast({
            title: error.msg || "修改失败",
            icon: "none"
          });
          done();
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
        done();
      }
    };
    const handleDelete = (item) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "删除后无法恢复，确定要删除这条点评吗？",
        confirmColor: "#FF8500",
        success: async (res) => {
          if (res.confirm) {
            const {
              error
            } = await ReviewApi.delete(item.id);
            if (!error) {
              common_vendor.index.showToast({
                title: "已删除",
                icon: "success"
              });
              reviewList.value = reviewList.value.filter((i) => i.id !== item.id);
            } else {
              const msg = typeof error === "string" ? error : error.msg || "删除失败";
              common_vendor.index.showToast({
                title: msg,
                icon: "none"
              });
            }
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === 1
      }, currentTab.value === 1 ? {} : {}, {
        b: currentTab.value === 1 ? 1 : "",
        c: common_vendor.o(($event) => switchTab(1)),
        d: currentTab.value === 0
      }, currentTab.value === 0 ? {} : {}, {
        e: currentTab.value === 0 ? 1 : "",
        f: common_vendor.o(($event) => switchTab(0)),
        g: currentTab.value === 0
      }, currentTab.value === 0 ? {
        h: common_vendor.t(total.value),
        i: filterLike.value === 1 ? 1 : "",
        j: common_vendor.o(($event) => toggleFilter(1)),
        k: filterLike.value === 2 ? 1 : "",
        l: common_vendor.o(($event) => toggleFilter(2))
      } : {}, {
        m: common_vendor.f(reviewList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: getAvatar(item),
            b: common_vendor.t(getName(item)),
            c: getRole(item)
          }, getRole(item) ? {
            d: common_vendor.t(getRole(item))
          } : {}, {
            e: common_vendor.t(item.isLike === 1 ? "👍 正面评价" : "👎 改进建议"),
            f: common_vendor.n(item.isLike === 1 ? "like" : "dislike"),
            g: common_vendor.t(formatTime(item.createTime)),
            h: item.isAnonymous === 1 && currentTab.value === 0
          }, item.isAnonymous === 1 && currentTab.value === 0 ? {} : {}, {
            i: common_vendor.t(item.reviewContent)
          }, currentTab.value === 1 ? {
            j: "4d2c7548-0-" + i0,
            k: common_vendor.p({
              type: "compose",
              size: "16",
              color: "#666"
            }),
            l: common_vendor.o(($event) => openEdit(item), item.id),
            m: "4d2c7548-1-" + i0,
            n: common_vendor.p({
              type: "trash",
              size: "16",
              color: "#999"
            }),
            o: common_vendor.o(($event) => handleDelete(item), item.id)
          } : {}, {
            p: item.id
          });
        }),
        n: currentTab.value === 1,
        o: reviewList.value.length > 0 || loadingStatus.value === "loading"
      }, reviewList.value.length > 0 || loadingStatus.value === "loading" ? {
        p: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        q: reviewList.value.length === 0 && loadingStatus.value === "noMore"
      }, reviewList.value.length === 0 && loadingStatus.value === "noMore" ? {
        r: common_vendor.p({
          type: "chatboxes",
          size: "60",
          color: "#e0e0e0"
        })
      } : {}, {
        s: common_vendor.sr(editPopup, "4d2c7548-4", {
          "k": "editPopup"
        }),
        t: common_vendor.o(onSaveReview),
        v: common_vendor.p({
          ["review-data"]: currentEditItem.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4d2c7548"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-reviews/my-reviews.js.map
