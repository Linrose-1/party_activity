"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup + PointsFeedbackPopup)();
}
const PointsFeedbackPopup = () => "../../components/PointsFeedbackPopup.js";
const _sfc_main = {
  __name: "active-detail",
  setup(__props) {
    const activityId = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    const sponsorList = common_vendor.ref([]);
    const loggedInUserId = common_vendor.ref(null);
    const participantList = common_vendor.ref([]);
    const participantTotal = common_vendor.ref(0);
    const viewerList = common_vendor.ref([]);
    const viewerTotal = common_vendor.ref(0);
    const commentPreviewList = common_vendor.ref([]);
    const commentTotal = common_vendor.ref(0);
    const isActionInProgress = common_vendor.ref(false);
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const isActionBarHidden = common_vendor.ref(false);
    const pointsPopup = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options && options.inviteCode) {
        common_vendor.index.setStorageSync("pendingInviteCode", options.inviteCode);
      }
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (!options.id) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:404", "[聚会详情] 缺少聚会ID");
        common_vendor.index.showToast({
          title: "加载聚会详情失败，缺少ID",
          icon: "none"
        });
        return;
      }
      activityId.value = options.id;
      getActiveDetail();
      getParticipantList();
      getCommentPreview();
      if (options.sharerId) {
        const sharerId = options.sharerId;
        const bizId = options.id;
        if (sharerId === loggedInUserId.value) {
          common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:424", "[分享加分] 本人点击，跳过");
        } else if (loggedInUserId.value && bizId) {
          triggerShareHitApi(sharerId, bizId);
        } else if (bizId) {
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId,
            type: 31
          });
        }
      }
      common_vendor.index.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onShow(() => {
      if (activityId.value) {
        getCommentPreview();
      }
    });
    const isOrganizer = common_vendor.computed(() => {
      if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser)
        return false;
      return parseInt(loggedInUserId.value) === activityDetail.value.memberUser.id;
    });
    const isRegistrationActive = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      return activityDetail.value.status === 2;
    });
    const formattedActivityTime = common_vendor.computed(() => {
      if (!activityDetail.value)
        return "";
      return formatDateTime(activityDetail.value.startDatetime) + " 至 " + formatDateTime(activityDetail.value.endDatetime);
    });
    const formattedRegistrationTimes = common_vendor.computed(() => {
      if (!activityDetail.value)
        return {
          start: "",
          end: ""
        };
      return {
        start: formatDateTime(activityDetail.value.registrationStartDatetime),
        end: formatDateTime(activityDetail.value.registrationEndDatetime)
      };
    });
    const statusInfo = common_vendor.computed(() => {
      if (!activityDetail.value)
        return {
          text: "",
          color: ""
        };
      const map = {
        0: {
          text: "聚会已取消",
          color: "#909399"
        },
        1: {
          text: "聚会未开始",
          color: "#f9ae3d"
        },
        2: {
          text: "正在报名中",
          color: "#4cd964"
        },
        3: {
          text: "聚会即将开始",
          color: "#007aff"
        },
        4: {
          text: "聚会进行中",
          color: "#dd524d"
        },
        5: {
          text: "聚会已结束",
          color: "#8f8f94"
        },
        6: {
          text: "聚会待退款",
          color: "#e6a23c"
        }
      };
      return map[activityDetail.value.status] || {
        text: "状态未知",
        color: "#909399"
      };
    });
    const showLimitSlotsTip = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      const inRelevantStatus = [1, 2].includes(activityDetail.value.status);
      const notEnough = (activityDetail.value.joinCount || 0) < activityDetail.value.limitSlots;
      return inRelevantStatus && notEnough;
    });
    const bannerImages = common_vendor.computed(() => {
      if (!activityDetail.value)
        return [];
      if (activityDetail.value.activityCoverImageUrls && activityDetail.value.activityCoverImageUrls.length > 0) {
        return activityDetail.value.activityCoverImageUrls;
      }
      if (activityDetail.value.coverImageUrl) {
        return [activityDetail.value.coverImageUrl];
      }
      return [];
    });
    const formatDateTime = (timestamp) => {
      if (!timestamp)
        return "时间待定";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return Y + "-" + M + "-" + D + " " + h + ":" + m;
    };
    const getActiveDetail = async () => {
      if (!activityId.value)
        return;
      const result = await utils_request.request("/app-api/member/activity/get", {
        method: "GET",
        data: {
          id: activityId.value
        }
      });
      if (result && !result.error) {
        activityDetail.value = result.data;
        getViewerList(activityId.value);
        sponsorList.value = result.data.memberSponsorList && Array.isArray(result.data.memberSponsorList) ? result.data.memberSponsorList : [];
        if (result.data.checkContribution === 1) {
          setTimeout(() => {
            if (pointsPopup.value)
              pointsPopup.value.show("阅读聚会详情", 10);
          }, 500);
        }
      } else {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:624", "[聚会详情] 获取失败:", result ? result.error : "无返回");
      }
    };
    const getParticipantList = async () => {
      if (!activityId.value)
        return;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/activity-join/list", {
        method: "GET",
        data: {
          activityId: activityId.value,
          pageNo: 1,
          pageSize: 8
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:647", "[报名列表] 获取失败:", error);
        return;
      }
      if (data && data.list) {
        participantList.value = data.list;
        participantTotal.value = data.total;
      }
    };
    const getViewerList = async (id) => {
      const {
        data
      } = await utils_request.request("/app-api/member/target-view/page", {
        method: "GET",
        data: {
          targetId: id,
          targetType: "activity",
          pageNo: 1,
          pageSize: 7
        }
      });
      if (data) {
        viewerList.value = data.list || [];
        viewerTotal.value = data.total || 0;
      }
    };
    const getCommentPreview = async () => {
      if (!activityId.value)
        return;
      const {
        data
      } = await utils_request.request("/app-api/member/comment/select-type-target-id", {
        method: "GET",
        data: {
          targetId: activityId.value,
          targetType: "activity"
        }
      });
      if (data && Array.isArray(data)) {
        commentTotal.value = data.length;
        commentPreviewList.value = data.slice(0, 2);
      }
    };
    const toggleAction = async (clickedAction) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (isActionInProgress.value)
        return;
      isActionInProgress.value = true;
      const originalAction = activityDetail.value.userLikeStr;
      const originalLikes = activityDetail.value.likesCount;
      const originalDislikes = activityDetail.value.dislikesCount;
      const apiAction = originalAction === clickedAction ? "cancel" : clickedAction;
      if (apiAction === "cancel") {
        activityDetail.value.userLikeStr = null;
        clickedAction === "like" ? activityDetail.value.likesCount-- : activityDetail.value.dislikesCount--;
      } else {
        activityDetail.value.userLikeStr = clickedAction;
        if (clickedAction === "like") {
          activityDetail.value.likesCount++;
          if (originalAction === "dislike")
            activityDetail.value.dislikesCount--;
        } else {
          activityDetail.value.dislikesCount++;
          if (originalAction === "like")
            activityDetail.value.likesCount--;
        }
      }
      try {
        const {
          error
        } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: activityId.value,
            targetType: "activity",
            action: apiAction
          }
        });
        if (error)
          throw new Error(error);
        common_vendor.index.$emit("activityInteractionChanged", {
          id: Number(activityId.value),
          type: "action",
          userLikeStr: activityDetail.value.userLikeStr,
          likesCount: activityDetail.value.likesCount,
          dislikesCount: activityDetail.value.dislikesCount
        });
      } catch (e) {
        activityDetail.value.userLikeStr = originalAction;
        activityDetail.value.likesCount = originalLikes;
        activityDetail.value.dislikesCount = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const openSharePopup = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      customShareTitle.value = activityDetail.value && activityDetail.value.activityTitle || "发现一个很棒的聚会，快来看看吧！";
      sharePopup.value.open();
    };
    const closeSharePopup = () => {
      sharePopup.value.close();
    };
    const guideShareTimeline = () => {
      closeSharePopup();
      showTimelineGuide.value = true;
    };
    const hideTimelineGuide = () => {
      showTimelineGuide.value = false;
    };
    const onPopupChange = (e) => {
      isActionBarHidden.value = e.show;
    };
    const previewBanner = (index) => {
      common_vendor.index.previewImage({
        urls: bannerImages.value,
        current: index
      });
    };
    const viewAllUsers = () => {
      if (participantTotal.value === 0) {
        common_vendor.index.showToast({
          title: "暂无用户报名",
          icon: "none"
        });
        return;
      }
      let url = "/pages/activity-participants/activity-participants?id=" + activityId.value;
      if (isOrganizer.value)
        url += "&isOrganizer=1";
      common_vendor.index.navigateTo({
        url
      });
    };
    const goToCommentPage = () => {
      common_vendor.index.navigateTo({
        url: "/packages/comment-page/comment-page?id=" + activityId.value + "&type=activity"
      });
    };
    const goToTraceList = () => {
      common_vendor.index.navigateTo({
        url: "/packages/user-view-trace/user-view-trace?id=" + activityId.value + "&type=activity"
      });
    };
    const register = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!isRegistrationActive.value) {
        common_vendor.index.showToast({
          title: "当前非报名时间",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/packages/active-enroll/active-enroll?id=" + activityId.value
      });
    };
    const navigateToSponsorDetail = (item) => {
      if (!item.id)
        return;
      common_vendor.index.navigateTo({
        url: "/pages/sponsor-detail/sponsor-detail?sponsorId=" + item.id + "&activityId=" + activityId.value
      });
    };
    const navigateToBusinessCard = (user, isFreeView = false) => {
      const name = user.nickname || "匿名用户";
      const avatarUrl = user.avatar || "/static/images/default-avatar.png";
      let url = "/packages/applicationBusinessCard/applicationBusinessCard?id=" + user.id + "&name=" + encodeURIComponent(name) + "&avatar=" + encodeURIComponent(avatarUrl);
      if (isFreeView)
        url += "&fromShare=1";
      common_vendor.index.navigateTo({
        url
      });
    };
    const navigateToStoreDetail = (store) => {
      if (!store || !store.id) {
        common_vendor.index.showToast({
          title: "无法查看聚店详情",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/packages/shop-detail/shop-detail?id=" + store.id
      });
    };
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      const {
        error
      } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 31,
          shareUserId: sharerId,
          bizId
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:957", "[分享加分] 接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:959", "[分享加分] 成功触发, sharerId:", sharerId);
      }
    };
    common_vendor.onShareAppMessage(() => {
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const inviteCode = utils_user.getInviteCode();
      const finalTitle = customShareTitle.value || activityDetail.value && activityDetail.value.activityTitle || "发现一个很棒的聚会，快来看看吧！";
      let sharePath = "/packages/active-detail/active-detail?id=" + (activityDetail.value && activityDetail.value.id);
      if (sharerId)
        sharePath += "&sharerId=" + sharerId;
      if (inviteCode)
        sharePath += "&inviteCode=" + inviteCode;
      return {
        title: finalTitle,
        path: sharePath,
        imageUrl: activityDetail.value && activityDetail.value.coverImageUrl || "/static/default-share-image.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      const sharerId = common_vendor.index.getStorageSync("userId");
      const inviteCode = utils_user.getInviteCode();
      const finalTitle = customShareTitle.value || activityDetail.value && activityDetail.value.activityTitle || "发现一个很棒的聚会，快来看看吧！";
      let queryString = "id=" + (activityDetail.value && activityDetail.value.id) + "&from=timeline";
      if (sharerId)
        queryString += "&sharerId=" + sharerId;
      if (inviteCode)
        queryString += "&inviteCode=" + inviteCode;
      return {
        title: finalTitle,
        query: queryString,
        imageUrl: activityDetail.value && activityDetail.value.coverImageUrl || "/static/default-share-image.png"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityDetail.value
      }, activityDetail.value ? common_vendor.e({
        b: bannerImages.value.length > 0
      }, bannerImages.value.length > 0 ? {
        c: common_vendor.f(bannerImages.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewBanner(index), index),
            c: index
          };
        })
      } : {
        d: common_vendor.p({
          type: "image",
          size: "40",
          color: "#ccc"
        })
      }, {
        e: activityDetail.value.tags && activityDetail.value.tags.length > 0
      }, activityDetail.value.tags && activityDetail.value.tags.length > 0 ? {
        f: common_vendor.t(activityDetail.value.tags.join(" · "))
      } : {}, {
        g: statusInfo.value.text
      }, statusInfo.value.text ? {
        h: common_vendor.t(statusInfo.value.text),
        i: statusInfo.value.color
      } : {}, {
        j: showLimitSlotsTip.value
      }, showLimitSlotsTip.value ? {
        k: common_vendor.p({
          type: "info-filled",
          color: "#e6a23c",
          size: "16"
        }),
        l: common_vendor.t(activityDetail.value.limitSlots)
      } : {}, {
        m: common_vendor.t(activityDetail.value.activityTitle),
        n: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#FF6B00"
        }),
        o: common_vendor.t(formattedActivityTime.value),
        p: common_vendor.p({
          type: "location",
          size: "18",
          color: "#FF6B00"
        }),
        q: common_vendor.t(activityDetail.value.locationAddress),
        r: common_vendor.t(participantTotal.value || 0),
        s: common_vendor.t(activityDetail.value.totalSlots),
        t: [1, 3].includes(activityDetail.value.activityFunds)
      }, [1, 3].includes(activityDetail.value.activityFunds) ? {
        v: common_vendor.t(activityDetail.value.registrationFee)
      } : activityDetail.value.activityFunds === 2 ? {} : {}, {
        w: activityDetail.value.activityFunds === 2,
        x: common_vendor.t(activityDetail.value.activityDescription),
        y: common_vendor.f(activityDetail.value.memberActivitySessionList, (item, index, i0) => {
          return common_vendor.e({
            a: index !== activityDetail.value.memberActivitySessionList.length - 1
          }, index !== activityDetail.value.memberActivitySessionList.length - 1 ? {} : {}, {
            b: common_vendor.t(item.sessionTitle),
            c: common_vendor.t(item.sessionDescription),
            d: item.id
          });
        }),
        z: activityDetail.value.memberUser.avatar,
        A: common_vendor.t(activityDetail.value.memberUser.nickname),
        B: common_vendor.t(activityDetail.value.organizerContactPhone),
        C: common_vendor.o(($event) => navigateToBusinessCard(activityDetail.value.memberUser, true)),
        D: activityDetail.value.memberStoreRespVO
      }, activityDetail.value.memberStoreRespVO ? common_vendor.e({
        E: activityDetail.value.memberStoreRespVO.storeCoverImageUrl
      }, activityDetail.value.memberStoreRespVO.storeCoverImageUrl ? {
        F: activityDetail.value.memberStoreRespVO.storeCoverImageUrl
      } : {
        G: common_vendor.p({
          type: "shop-filled",
          size: "24",
          color: "#fff"
        })
      }, {
        H: common_vendor.t(activityDetail.value.memberStoreRespVO.storeName),
        I: common_vendor.t(activityDetail.value.memberStoreRespVO.fullAddress),
        J: common_vendor.t(activityDetail.value.memberStoreRespVO.contactPhone),
        K: common_vendor.o(($event) => navigateToStoreDetail(activityDetail.value.memberStoreRespVO))
      }) : {}, {
        L: participantTotal.value > 0
      }, participantTotal.value > 0 ? {
        M: common_vendor.o(viewAllUsers)
      } : {}, {
        N: participantList.value.length > 0
      }, participantList.value.length > 0 ? common_vendor.e({
        O: common_vendor.f(participantList.value, (participant, k0, i0) => {
          return {
            a: participant.id,
            b: participant.memberUser.avatar
          };
        }),
        P: participantTotal.value > participantList.value.length
      }, participantTotal.value > participantList.value.length ? {} : {}, {
        Q: common_vendor.t(participantTotal.value)
      }) : {}, {
        R: sponsorList.value && sponsorList.value.length > 0
      }, sponsorList.value && sponsorList.value.length > 0 ? {
        S: common_vendor.t(sponsorList.value.length),
        T: common_vendor.f(sponsorList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.logoUrl
          }, item.logoUrl ? {
            b: item.logoUrl
          } : {}, {
            c: common_vendor.t(item.sponsorName),
            d: item.sponsorType === 1
          }, item.sponsorType === 1 ? {} : item.sponsorType === 2 ? {} : item.sponsorType === 3 ? {} : {}, {
            e: item.sponsorType === 2,
            f: item.sponsorType === 3,
            g: item.id,
            h: common_vendor.o(($event) => navigateToSponsorDetail(item), item.id)
          });
        })
      } : {}, {
        U: activityDetail.value && activityDetail.value.isReadTrace === 1 && viewerTotal.value > 0
      }, activityDetail.value && activityDetail.value.isReadTrace === 1 && viewerTotal.value > 0 ? common_vendor.e({
        V: common_vendor.t(viewerTotal.value),
        W: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        X: common_vendor.o(goToTraceList),
        Y: common_vendor.f(viewerList.value, (item, index, i0) => {
          return {
            a: item.memberUser && item.memberUser.avatar ? item.memberUser.avatar : "/static/icon/default-avatar.png",
            b: item.id
          };
        }),
        Z: viewerTotal.value > 7
      }, viewerTotal.value > 7 ? {} : {}, {
        aa: common_vendor.t(viewerTotal.value),
        ab: common_vendor.o(goToTraceList)
      }) : {}, {
        ac: commentTotal.value > 0
      }, commentTotal.value > 0 ? {
        ad: common_vendor.t(commentTotal.value)
      } : {}, {
        ae: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        af: commentPreviewList.value.length > 0
      }, commentPreviewList.value.length > 0 ? {
        ag: common_vendor.f(commentPreviewList.value, (c, k0, i0) => {
          return {
            a: common_vendor.t(c.anonymous === 1 ? "匿名商友" : c.memberUserBaseVO && c.memberUserBaseVO.nickname ? c.memberUserBaseVO.nickname : "商友"),
            b: common_vendor.t(c.content),
            c: c.id
          };
        })
      } : {
        ah: common_vendor.p({
          type: "chatbubble",
          size: "18",
          color: "#ccc"
        })
      }, {
        ai: common_vendor.o(goToCommentPage),
        aj: common_vendor.t(formattedRegistrationTimes.value.start),
        ak: common_vendor.t(formattedRegistrationTimes.value.end),
        al: common_vendor.p({
          type: activityDetail.value.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "22",
          color: activityDetail.value.userLikeStr === "like" ? "#FF6B00" : "#666"
        }),
        am: common_vendor.t(activityDetail.value.likesCount || 0),
        an: common_vendor.n(activityDetail.value.userLikeStr === "like" ? "capsule-like-active" : ""),
        ao: common_vendor.o(($event) => toggleAction("like")),
        ap: common_vendor.p({
          type: activityDetail.value.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "22",
          color: activityDetail.value.userLikeStr === "dislike" ? "#3498db" : "#666"
        }),
        aq: common_vendor.t(activityDetail.value.dislikesCount || 0),
        ar: common_vendor.n(activityDetail.value.userLikeStr === "dislike" ? "capsule-dislike-active" : ""),
        as: common_vendor.o(($event) => toggleAction("dislike")),
        at: !isActionBarHidden.value
      }, !isActionBarHidden.value ? {
        av: common_vendor.o(openSharePopup),
        aw: !isRegistrationActive.value ? 1 : "",
        ax: !isRegistrationActive.value,
        ay: common_vendor.o(register)
      } : {}, {
        az: customShareTitle.value,
        aA: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        aB: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        aC: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        aD: common_vendor.o(guideShareTimeline),
        aE: common_vendor.o(closeSharePopup),
        aF: common_vendor.sr(sharePopup, "9217aa1c-10", {
          "k": "sharePopup"
        }),
        aG: common_vendor.o(onPopupChange),
        aH: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        aI: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        aJ: common_assets._imports_0$3,
        aK: common_vendor.o(hideTimelineGuide)
      } : {}, {
        aL: common_vendor.sr(pointsPopup, "9217aa1c-13", {
          "k": "pointsPopup"
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9217aa1c"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-detail/active-detail.js.map
