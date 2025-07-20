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
  __name: "my-opportunity",
  setup(__props) {
    const postList = common_vendor.ref([]);
    common_vendor.ref("");
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      const s = date.getSeconds().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const getMyOpportunitiesList = async (isRefresh = false) => {
      if (loadStatus.value === "loading" || loadStatus.value === "noMore" && !isRefresh) {
        return;
      }
      if (isRefresh) {
        pageNo.value = 1;
        postList.value = [];
        loadStatus.value = "more";
      }
      loadStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        // searchKey: searchKey.value.trim(),
        userId: 247
      };
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/business-opportunities/my-list", {
        method: "GET",
        data: params
      });
      common_vendor.index.__f__("log", "at pages/my-opportunity/my-opportunity.vue:138", "我的商机", data);
      if (isRefresh) {
        common_vendor.index.stopPullDownRefresh();
      }
      if (error) {
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        loadStatus.value = "more";
        return;
      }
      if (data && data.list && data.list.length > 0) {
        postList.value = [...postList.value, ...data.list];
        total.value = data.total;
        if (postList.value.length >= total.value) {
          loadStatus.value = "noMore";
        } else {
          loadStatus.value = "more";
          pageNo.value++;
        }
      } else {
        if (pageNo.value === 1) {
          total.value = 0;
          postList.value = [];
        }
        loadStatus.value = "noMore";
      }
    };
    const deleteOpportunity = (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "您确定要删除这条商机吗？删除后将无法恢复。",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            const {
              error
            } = await utils_request.request("/app-api/member/business-opportunities/delete", {
              method: "POST",
              data: {
                id
              }
              // 符合接口文档的请求体
            });
            common_vendor.index.hideLoading();
            if (error) {
              common_vendor.index.showToast({
                title: "删除失败: " + error,
                icon: "none"
              });
              return;
            }
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            getMyOpportunitiesList(true);
          }
        }
      });
    };
    const postNew = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    const skipApplicationBusinessCard = () => {
      common_vendor.index.navigateTo({
        url: "/pages/applicationBusinessCard/applicationBusinessCard"
      });
    };
    const skipCommercialDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}`
      });
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
      });
    };
    common_vendor.onLoad(() => {
      getMyOpportunitiesList(true);
    });
    common_vendor.onReachBottom(() => {
      getMyOpportunitiesList();
    });
    common_vendor.onPullDownRefresh(() => {
      getMyOpportunitiesList(true);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(postList.value, (post, k0, i0) => {
          return common_vendor.e({
            a: post.memberUser.avatar,
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.memberUser.nickname || "匿名用户"),
            d: "481e0091-0-" + i0,
            e: common_vendor.t(formatTimestamp(post.createTime)),
            f: "481e0091-1-" + i0,
            g: common_vendor.o(($event) => deleteOpportunity(post.id), post.id),
            h: common_vendor.t(post.postContent),
            i: post.postImg
          }, post.postImg ? {
            j: common_vendor.f(post.postImg.split(","), (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.postImg.split(","), imgIndex), imgIndex),
                c: imgIndex
              };
            })
          } : {}, {
            k: post.tags && post.tags.length > 0
          }, post.tags && post.tags.length > 0 ? {
            l: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, {
            m: "481e0091-2-" + i0,
            n: common_vendor.t(post.likesCount),
            o: "481e0091-3-" + i0,
            p: common_vendor.t(post.dislikesCount),
            q: post.id,
            r: common_vendor.o(($event) => skipCommercialDetail(post.id), post.id)
          });
        }),
        b: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        c: common_vendor.p({
          type: "close",
          size: "15",
          color: "#FF6A00"
        }),
        d: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#e74c3c"
        }),
        e: common_vendor.p({
          type: "hand-down-filled",
          size: "18",
          color: "#3498db"
        }),
        f: postList.value.length > 0
      }, postList.value.length > 0 ? {
        g: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        h: postList.value.length === 0 && loadStatus.value === "noMore"
      }, postList.value.length === 0 && loadStatus.value === "noMore" ? {
        i: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        }),
        j: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#FFFFFF"
        }),
        k: common_vendor.o(postNew)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-481e0091"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-opportunity/my-opportunity.js.map
