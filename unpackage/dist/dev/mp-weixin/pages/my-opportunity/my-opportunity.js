"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_load_more + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "my-opportunity",
  setup(__props) {
    const postList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["普通商机", "创业猎伙"]);
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
      if (loadStatus.value === "loading")
        return;
      if (!isRefresh && loadStatus.value === "noMore")
        return;
      if (isRefresh) {
        pageNo.value = 1;
        postList.value = [];
        loadStatus.value = "more";
      }
      loadStatus.value = "loading";
      const userId = common_vendor.index.getStorageSync("userId");
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        userId,
        postType: currentTab.value
        // 0 或 1
      };
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/business-opportunities/my-list", {
          method: "GET",
          data: params
        });
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
        if (error) {
          loadStatus.value = "more";
          return;
        }
        if (data && data.list && data.list.length > 0) {
          const mappedList = data.list.map((item) => {
            let imgList = [];
            if (item.postImg) {
              imgList = String(item.postImg).split(",").filter((s) => s && s.trim());
            }
            return {
              ...item,
              video: item.postVideo || "",
              images: imgList
            };
          });
          postList.value = isRefresh ? mappedList : [...postList.value, ...mappedList];
          total.value = data.total || 0;
          if (postList.value.length >= total.value) {
            loadStatus.value = "noMore";
          } else {
            loadStatus.value = "more";
            pageNo.value++;
          }
        } else {
          if (isRefresh)
            postList.value = [];
          loadStatus.value = "noMore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my-opportunity/my-opportunity.vue:235", e);
        loadStatus.value = "more";
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
        // 直接使用索引，而不是再次查找
      });
    };
    const switchTab = (e) => {
      if (currentTab.value === e.currentIndex)
        return;
      currentTab.value = e.currentIndex;
      getMyOpportunitiesList(true);
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
    const skipApplicationBusinessCard = (userId) => {
      common_vendor.index.__f__("log", "at pages/my-opportunity/my-opportunity.vue:349", "点击用户头像 ID:", userId);
    };
    const skipCommercialDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
      });
    };
    const goToPublishPage = () => {
      common_vendor.index.navigateTo({
        url: "/packages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    common_vendor.onShow(() => {
      getMyOpportunitiesList(true);
    });
    common_vendor.onReachBottom(() => getMyOpportunitiesList());
    common_vendor.onPullDownRefresh(() => getMyOpportunitiesList(true));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(switchTab),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: common_vendor.f(postList.value, (post, k0, i0) => {
          return common_vendor.e({
            a: post.memberUser.avatar,
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.memberUser.nickname || "匿名用户"),
            d: "481e0091-1-" + i0,
            e: common_vendor.t(formatTimestamp(post.createTime)),
            f: common_vendor.t(getStatusInfo(post).text),
            g: common_vendor.n(getStatusInfo(post).class),
            h: common_vendor.t(post.postContent),
            i: post.video
          }, post.video ? {
            j: "video-" + post.id,
            k: post.video,
            l: common_vendor.o(() => {
            }, post.id)
          } : post.images && post.images.length > 0 ? {
            n: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.images, imgIndex), imgIndex),
                c: imgIndex
              };
            }),
            o: post.images.length === 1 ? "widthFix" : "aspectFill",
            p: common_vendor.n("images-count-" + post.images.length)
          } : {}, {
            m: post.images && post.images.length > 0,
            q: post.tags && post.tags.length > 0
          }, post.tags && post.tags.length > 0 ? {} : {}, {
            r: "481e0091-2-" + i0,
            s: common_vendor.o(($event) => deleteOpportunity(post.id), post.id),
            t: "481e0091-3-" + i0,
            v: common_vendor.p({
              type: "chat-filled",
              size: "16",
              color: post.status === "hidden" ? "#3498db" : "#ccc"
            }),
            w: post.status !== "hidden" ? 1 : "",
            x: post.status !== "hidden",
            y: common_vendor.o(($event) => openAppealModal(post), post.id),
            z: post.id,
            A: common_vendor.o(($event) => skipCommercialDetail(post.id), post.id)
          });
        }),
        d: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        e: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#e74c3c"
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
          type: "compose",
          size: "60",
          color: "#e0e0e0"
        }),
        j: common_vendor.o(goToPublishPage)
      } : {}, {
        k: common_vendor.o(confirmAppeal),
        l: common_vendor.p({
          mode: "input",
          title: "提交申诉",
          placeholder: "请输入申诉理由..."
        }),
        m: common_vendor.sr(appealPopup, "481e0091-6", {
          "k": "appealPopup"
        }),
        n: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-481e0091"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-opportunity/my-opportunity.js.map
