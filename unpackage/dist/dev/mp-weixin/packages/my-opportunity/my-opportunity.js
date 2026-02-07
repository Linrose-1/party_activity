"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
const defaultAvatar = "/static/icon/default-avatar.png";
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
    const isEnterpriseFilter = common_vendor.ref(0);
    const appealPopup = common_vendor.ref(null);
    const currentAppealPost = common_vendor.ref(null);
    common_vendor.onShow(() => {
      fetchMyOpportunities(true);
    });
    common_vendor.onPullDownRefresh(() => {
      fetchMyOpportunities(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadStatus.value === "more")
        fetchMyOpportunities(false);
    });
    const fetchMyOpportunities = async (isRefresh = false) => {
      if (loadStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh) {
        pageNo.value = 1;
        loadStatus.value = "more";
      }
      loadStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        postType: currentTab.value,
        // 一级筛选：0-普通, 1-猎伙
        isEnterprise: isEnterpriseFilter.value
        // 二级筛选：0-个人, 1-企业
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
        if (data && data.list) {
          const mappedList = data.list.map((item) => ({
            ...item,
            video: item.postVideo || "",
            images: item.postImg ? String(item.postImg).split(",").filter((s) => s && s.trim()) : []
          }));
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
        loadStatus.value = "more";
        common_vendor.index.__f__("error", "at packages/my-opportunity/my-opportunity.vue:220", "数据加载异常:", e);
      }
    };
    const switchTab = (e) => {
      currentTab.value = e.currentIndex;
      fetchMyOpportunities(true);
    };
    const switchIdentity = (val) => {
      isEnterpriseFilter.value = val;
      fetchMyOpportunities(true);
    };
    const handleEdit = (id) => {
      common_vendor.index.navigateTo({
        url: `/packages/home-opportunitiesPublish/home-opportunitiesPublish?id=${id}`
      });
    };
    const deleteOpportunity = (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "删除后该商机将从所有商圈中移除，确定吗？",
        confirmColor: "#e74c3c",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在删除..."
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
            if (!error) {
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              fetchMyOpportunities(true);
            }
          }
        }
      });
    };
    const openAppealModal = (post) => {
      currentAppealPost.value = post;
      appealPopup.value.open();
    };
    const confirmAppeal = async (content) => {
      if (!content || !content.trim())
        return common_vendor.index.showToast({
          title: "请输入申诉内容",
          icon: "none"
        });
      common_vendor.index.showLoading({
        title: "正在提交..."
      });
      const {
        error
      } = await utils_request.request("/app-api/member/business-opportunities/appeal", {
        method: "POST",
        data: {
          id: currentAppealPost.value.id,
          appealContent: content
        }
      });
      common_vendor.index.hideLoading();
      if (!error) {
        common_vendor.index.showToast({
          title: "申诉已提交"
        });
        appealPopup.value.close();
        fetchMyOpportunities(true);
      }
    };
    const getStatusInfo = (post) => {
      const statusMap = {
        "active": {
          text: "展示中",
          class: "status-active"
        },
        "reactive": {
          text: "已恢复",
          class: "status-active"
        },
        "hidden": {
          text: "待申诉",
          class: "status-hidden"
        },
        "reject": {
          text: "申诉失败",
          class: "status-rejected"
        },
        "completed": {
          text: "已完成",
          class: "status-completed"
        },
        "closed": {
          text: "已关闭",
          class: "status-closed"
        }
      };
      return statusMap[post.status] || {
        text: "处理中",
        class: "status-unknown"
      };
    };
    const formatTimestamp = (ts) => {
      if (!ts)
        return "";
      const date = new Date(ts);
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
      });
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(switchTab),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: isEnterpriseFilter.value === 0 ? 1 : "",
        d: common_vendor.o(($event) => switchIdentity(0)),
        e: isEnterpriseFilter.value === 1 ? 1 : "",
        f: common_vendor.o(($event) => switchIdentity(1)),
        g: common_vendor.f(postList.value, (post, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: post.isEnterprise === 1 ? ((_a = post.enterpriseInfo) == null ? void 0 : _a.logoUrl) || defaultAvatar : post.memberUser.avatar,
            b: post.isEnterprise === 1
          }, post.isEnterprise === 1 ? {
            c: common_assets._imports_0
          } : {}, {
            d: common_vendor.t(post.isEnterprise === 1 ? (_b = post.enterpriseInfo) == null ? void 0 : _b.enterpriseName : post.memberUser.nickname),
            e: "b7876dfc-1-" + i0,
            f: common_vendor.t(formatTimestamp(post.createTime)),
            g: common_vendor.t(getStatusInfo(post).text),
            h: common_vendor.n(getStatusInfo(post).class),
            i: post.postTitle
          }, post.postTitle ? {
            j: common_vendor.t(post.postTitle)
          } : {}, {
            k: common_vendor.t(post.postContent),
            l: post.video
          }, post.video ? {
            m: "video-" + post.id,
            n: post.video,
            o: common_vendor.o(() => {
            }, post.id)
          } : post.images && post.images.length > 0 ? {
            q: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.images, imgIndex), imgIndex),
                c: imgIndex
              };
            }),
            r: common_vendor.n("images-count-" + post.images.length)
          } : {}, {
            p: post.images && post.images.length > 0,
            s: "b7876dfc-2-" + i0,
            t: common_vendor.o(($event) => handleEdit(post.id), post.id),
            v: "b7876dfc-3-" + i0,
            w: common_vendor.p({
              type: "chat-filled",
              size: "16",
              color: post.status === "hidden" ? "#3498db" : "#ccc"
            }),
            x: post.status !== "hidden" ? 1 : "",
            y: post.status !== "hidden",
            z: common_vendor.o(($event) => openAppealModal(post), post.id),
            A: "b7876dfc-4-" + i0,
            B: common_vendor.o(($event) => deleteOpportunity(post.id), post.id),
            C: post.id,
            D: common_vendor.o(($event) => skipCommercialDetail(post.id), post.id)
          });
        }),
        h: common_vendor.p({
          type: "calendar",
          size: "12",
          color: "#BBB"
        }),
        i: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#FF6B00"
        }),
        j: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#e74c3c"
        }),
        k: postList.value.length > 0
      }, postList.value.length > 0 ? {
        l: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        m: postList.value.length === 0 && loadStatus.value === "noMore"
      }, postList.value.length === 0 && loadStatus.value === "noMore" ? {
        n: common_vendor.p({
          type: "paperplane-filled",
          size: "60",
          color: "#e0e0e0"
        }),
        o: common_vendor.o(goToPublishPage)
      } : {}, {
        p: common_vendor.o(confirmAppeal),
        q: common_vendor.p({
          mode: "input",
          title: "提交申诉",
          placeholder: "请输入申诉详细理由..."
        }),
        r: common_vendor.sr(appealPopup, "b7876dfc-7", {
          "k": "appealPopup"
        }),
        s: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b7876dfc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-opportunity/my-opportunity.js.map
