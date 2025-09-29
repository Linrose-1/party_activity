"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "my-opportunity",
  setup(__props) {
    const postList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const appealPopup = common_vendor.ref(null);
    const currentAppealPost = common_vendor.ref(null);
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
    const getStatusInfo = (post) => {
      switch (post.status) {
        case "active":
        case "reactive":
          return {
            text: "正常",
            class: "status-active"
          };
        case "hidden":
          return {
            text: "待申诉",
            class: "status-hidden"
          };
        case "reject":
          return {
            text: "申诉失败",
            class: "status-rejected"
          };
        case "completed":
          return {
            text: "已完成",
            class: "status-completed"
          };
        case "closed":
          return {
            text: "已关闭",
            class: "status-closed"
          };
        default:
          return {
            text: "未知",
            class: "status-unknown"
          };
      }
    };
    const getMyOpportunitiesList = async (isRefresh = false) => {
      if (loadStatus.value === "loading" || loadStatus.value === "noMore" && !isRefresh)
        return;
      if (isRefresh) {
        pageNo.value = 1;
        postList.value = [];
        loadStatus.value = "more";
      }
      loadStatus.value = "loading";
      const userId = common_vendor.index.getStorageSync("userId");
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/business-opportunities/my-list", {
        method: "GET",
        data: {
          pageNo: pageNo.value,
          pageSize: pageSize.value,
          userId
        }
      });
      if (isRefresh)
        common_vendor.index.stopPullDownRefresh();
      if (error) {
        loadStatus.value = "more";
        return;
      }
      if (data && data.list && data.list.length > 0) {
        postList.value = [...postList.value, ...data.list];
        total.value = data.total;
        loadStatus.value = postList.value.length >= total.value ? "noMore" : "more";
        if (loadStatus.value === "more")
          pageNo.value++;
      } else {
        if (pageNo.value === 1) {
          postList.value = [];
        }
        loadStatus.value = "noMore";
      }
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
      });
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
    const openAppealModal = (post) => {
      currentAppealPost.value = post;
      appealPopup.value.open();
    };
    const confirmAppeal = async (appealContent) => {
      if (!appealContent || !appealContent.trim()) {
        common_vendor.index.showToast({
          title: "申诉内容不能为空",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      const {
        error
      } = await utils_request.request("/app-api/member/business-opportunities/appeal", {
        method: "POST",
        data: {
          id: currentAppealPost.value.id,
          appealContent
        }
      });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({
          title: "申诉失败: " + error,
          icon: "none"
        });
      } else {
        common_vendor.index.showToast({
          title: "申诉已提交，请等待审核",
          icon: "success"
        });
        appealPopup.value.close();
        getMyOpportunitiesList(true);
      }
    };
    const skipCommercialDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
      });
    };
    const goToPublishPage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    common_vendor.onLoad(() => getMyOpportunitiesList(true));
    common_vendor.onReachBottom(() => getMyOpportunitiesList());
    common_vendor.onPullDownRefresh(() => getMyOpportunitiesList(true));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(postList.value, (post, k0, i0) => {
          return common_vendor.e({
            a: post.memberUser.avatar,
            b: common_vendor.o((...args) => _ctx.skipApplicationBusinessCard && _ctx.skipApplicationBusinessCard(...args), post.id),
            c: common_vendor.t(post.memberUser.nickname || "匿名用户"),
            d: "481e0091-0-" + i0,
            e: common_vendor.t(formatTimestamp(post.createTime)),
            f: common_vendor.t(getStatusInfo(post).text),
            g: common_vendor.n(getStatusInfo(post).class),
            h: common_vendor.t(post.postContent),
            i: post.postImg
          }, post.postImg ? {
            j: common_vendor.f(post.postImg.split(","), (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.postImg.split(","), imgIndex), imgIndex),
                c: imgIndex
              };
            }),
            k: post.postImg.split(",").length === 1 ? "widthFix" : "aspectFill",
            l: common_vendor.n("images-count-" + post.postImg.split(",").length)
          } : {}, {
            m: post.tags && post.tags.length > 0
          }, post.tags && post.tags.length > 0 ? {} : {}, {
            n: "481e0091-1-" + i0,
            o: common_vendor.o(($event) => deleteOpportunity(post.id), post.id),
            p: "481e0091-2-" + i0,
            q: common_vendor.p({
              type: "chat-filled",
              size: "16",
              color: post.status === "hidden" ? "#3498db" : "#ccc"
            }),
            r: post.status !== "hidden" ? 1 : "",
            s: post.status !== "hidden",
            t: common_vendor.o(($event) => openAppealModal(post), post.id),
            v: post.id,
            w: common_vendor.o(($event) => skipCommercialDetail(post.id), post.id)
          });
        }),
        b: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        c: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#e74c3c"
        }),
        d: postList.value.length > 0
      }, postList.value.length > 0 ? {
        e: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        f: postList.value.length === 0 && loadStatus.value === "noMore"
      }, postList.value.length === 0 && loadStatus.value === "noMore" ? {
        g: common_vendor.p({
          type: "compose",
          size: "60",
          color: "#e0e0e0"
        }),
        h: common_vendor.o(goToPublishPage)
      } : {}, {
        i: common_vendor.o(confirmAppeal),
        j: common_vendor.p({
          mode: "input",
          title: "提交申诉",
          placeholder: "请输入申诉理由..."
        }),
        k: common_vendor.sr(appealPopup, "481e0091-5", {
          "k": "appealPopup"
        }),
        l: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-481e0091"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-opportunity/my-opportunity.js.map
