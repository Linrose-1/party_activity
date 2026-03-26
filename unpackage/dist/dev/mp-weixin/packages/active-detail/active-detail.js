"use strict";
const common_vendor = require("../../common/vendor.js");
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
    common_vendor.ref(true);
    const currentStandardCode = common_vendor.ref("");
    const currentExclusiveCode = common_vendor.ref("");
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
    const isExclusiveVisible = common_vendor.ref(false);
    const shareCodeType = common_vendor.ref("STANDARD");
    const pointsPopup = common_vendor.ref(null);
    common_vendor.ref("");
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:491", "📥 [详情页-接收] URL参数为:", options);
      if (options.inviteCode) {
        currentStandardCode.value = options.inviteCode;
      }
      if (options.exclusiveInviteCode) {
        currentExclusiveCode.value = options.exclusiveInviteCode;
      }
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (!options.id) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:505", "[聚会详情] 缺少聚会ID");
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
          common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:525", "[分享加分] 本人点击，跳过");
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
    const limitSlotsInfo = common_vendor.computed(() => {
      if (!activityDetail.value || !activityDetail.value.limitSlots)
        return null;
      const currentCount = Number(participantTotal.value || activityDetail.value.joinCount || 0);
      const targetCount = Number(activityDetail.value.limitSlots);
      const inRelevantStatus = [1, 2].includes(activityDetail.value.status);
      if (!inRelevantStatus)
        return null;
      const isReached = currentCount >= targetCount;
      return {
        isReached,
        text: isReached ? `该聚会已达到起聚人数（${targetCount}人），聚会将如期进行！` : `该聚会未达到起聚人数（${targetCount}人），聚会可能会被取消，敬请咨询聚会发起人。`,
        // 达到显示绿色，未达到显示主题色（粉色）
        color: isReached ? "#1FD6FE" : "#FF62B1",
        bgColor: isReached ? "rgba(79, 172, 254, 0.08)" : "rgba(255, 98, 177, 0.08)"
      };
    });
    const handleShareTypeChange = (e) => {
      shareCodeType.value = e.detail.value;
    };
    const copyExclusiveCode = () => {
      common_vendor.index.setClipboardData({
        data: activityDetail.value.exclusiveInviteCode,
        success: () => common_vendor.index.showToast({
          title: "专属码已复制",
          icon: "none"
        })
      });
    };
    const joinStatusInfo = common_vendor.computed(() => {
      const status = activityDetail.value && activityDetail.value.joinStatus !== null && activityDetail.value.joinStatus !== void 0 ? activityDetail.value.joinStatus : 0;
      const map = {
        0: {
          text: "未报名",
          icon: "info",
          color: "#999"
        },
        1: {
          text: "待确认",
          icon: "auth",
          color: "#f39c12"
        },
        2: {
          text: "已报名",
          icon: "checkbox-filled",
          color: "#2ecc71"
        }
      };
      return map[status] || map[0];
    });
    const isContentLocked = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      return activityDetail.value.isPublic === 0 && !activityDetail.value.activityDescription;
    });
    const copyInviteCode = () => {
      common_vendor.index.setClipboardData({
        data: activityDetail.value.inviteCode,
        success: () => common_vendor.index.showToast({
          title: "已复制",
          icon: "none"
        })
      });
    };
    const isOrganizer = common_vendor.computed(() => {
      if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser)
        return false;
      return parseInt(loggedInUserId.value) === activityDetail.value.memberUser.id;
    });
    const isRegistrationActive = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      return [2, 4].includes(activityDetail.value.status);
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
          color: "#FF62B1"
        },
        // 主题色
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
    common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      const inRelevantStatus = [1, 2].includes(activityDetail.value.status);
      const currentCount = Number(participantTotal.value || activityDetail.value.joinCount || 0);
      const requiredCount = Number(activityDetail.value.limitSlots || 0);
      if (requiredCount <= 0)
        return false;
      const notEnough = currentCount < requiredCount;
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
    const openLocationMap = () => {
      if (!activityDetail.value.latitude || !activityDetail.value.longitude) {
        common_vendor.index.showToast({
          title: "暂无位置经纬度信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.openLocation({
        latitude: Number(activityDetail.value.latitude),
        longitude: Number(activityDetail.value.longitude),
        name: activityDetail.value.activityLocation,
        address: activityDetail.value.locationAddress
      });
    };
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
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:851", "[聚会详情] 获取失败:", result ? result.error : "无返回");
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
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:874", "[报名列表] 获取失败:", error);
        return;
      }
      if (data && data.list) {
        participantList.value = data.list;
        participantTotal.value = data.total;
        if (activityDetail.value) {
          activityDetail.value.joinCount = data.total;
        }
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
      let url = "/packages/activity-participants/activity-participants?id=" + activityId.value;
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
    const goToSponsorList = () => {
      const sponsorData = encodeURIComponent(JSON.stringify(sponsorList.value));
      common_vendor.index.navigateTo({
        url: `/packages/sponsor-list/sponsor-list?data=${sponsorData}&activityId=${activityId.value}`
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
      const inv = currentStandardCode.value || "";
      const exc = currentExclusiveCode.value || "";
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:1119", "🔗 [详情页 -> 报名页] 携带参数:", {
        inv,
        exc
      });
      common_vendor.index.navigateTo({
        url: `/packages/active-enroll/active-enroll?id=${activityId.value}&inviteCode=${inv}&exclusiveInviteCode=${exc}`
      });
    };
    const navigateToSponsorDetail = (item) => {
      if (!item.id)
        return;
      common_vendor.index.navigateTo({
        url: "/pages/sponsor-detail/sponsor-detail?sponsorId=" + item.id + "&activityId=" + activityId.value
      });
    };
    const goToTraceList = () => {
      const hasSilent = activityDetail.value.hasSilentLoginUser || 0;
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${activityId.value}&type=activity&hasSilent=${hasSilent}`
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
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:1208", "[分享加分] 接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:1210", "[分享加分] 成功触发, sharerId:", sharerId);
      }
    };
    common_vendor.onShareAppMessage(() => {
      var _a, _b;
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const globalInviteCode = utils_user.getInviteCode();
      const finalTitle = customShareTitle.value || ((_a = activityDetail.value) == null ? void 0 : _a.activityTitle) || "邀请你参加聚会";
      let sharePath = `/packages/active-detail/active-detail?id=${activityId.value}`;
      if (shareCodeType.value === "STANDARD") {
        sharePath += `&inviteCode=${activityDetail.value.inviteCode}`;
      } else if (shareCodeType.value === "EXCLUSIVE") {
        sharePath += `&exclusiveInviteCode=${activityDetail.value.exclusiveInviteCode}`;
      }
      if (sharerId)
        sharePath += `&sharerId=${sharerId}`;
      if (globalInviteCode)
        sharePath += `&c=${globalInviteCode}`;
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:1245", "🚀 [详情页-分享中] 最终生成的路径:", sharePath);
      return {
        title: finalTitle,
        path: sharePath,
        imageUrl: ((_b = activityDetail.value) == null ? void 0 : _b.coverImageUrl) || ""
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
      } : {}, {
        d: activityDetail.value.tags && activityDetail.value.tags.length > 0
      }, activityDetail.value.tags && activityDetail.value.tags.length > 0 ? {
        e: common_vendor.t(activityDetail.value.tags.join(" · "))
      } : {}, {
        f: common_vendor.p({
          type: joinStatusInfo.value.icon,
          size: "14",
          color: "#fff"
        }),
        g: common_vendor.t(joinStatusInfo.value.text),
        h: common_vendor.n("join-status-" + activityDetail.value.joinStatus),
        i: sponsorList.value && sponsorList.value.length > 0
      }, sponsorList.value && sponsorList.value.length > 0 ? {
        j: common_vendor.f(sponsorList.value.slice(0, 2), (item, index, i0) => {
          return {
            a: item.logoUrl || "/static/images/default-avatar.png",
            b: common_vendor.t(item.sponsorName),
            c: item.id
          };
        }),
        k: common_vendor.o(goToSponsorList)
      } : {}, {
        l: statusInfo.value.text
      }, statusInfo.value.text ? {
        m: common_vendor.t(statusInfo.value.text),
        n: statusInfo.value.color
      } : {}, {
        o: limitSlotsInfo.value
      }, limitSlotsInfo.value ? {
        p: common_vendor.p({
          type: limitSlotsInfo.value.isReached ? "checkbox-filled" : "info-filled",
          color: limitSlotsInfo.value.color,
          size: "16"
        }),
        q: common_vendor.t(limitSlotsInfo.value.text),
        r: limitSlotsInfo.value.color,
        s: limitSlotsInfo.value.bgColor,
        t: limitSlotsInfo.value.color
      } : {}, {
        v: common_vendor.t(activityDetail.value.activityTitle),
        w: common_vendor.t(formattedActivityTime.value),
        x: common_vendor.t(formattedRegistrationTimes.value.start),
        y: common_vendor.t(formattedRegistrationTimes.value.end),
        z: common_vendor.t(activityDetail.value.locationAddress),
        A: common_vendor.o(openLocationMap),
        B: common_vendor.t(activityDetail.value.activityLocation || "未公开地点"),
        C: activityDetail.value.memberStoreRespVO
      }, activityDetail.value.memberStoreRespVO ? {
        D: common_vendor.t(activityDetail.value.memberStoreRespVO.storeName),
        E: common_vendor.o(($event) => navigateToStoreDetail(activityDetail.value.memberStoreRespVO))
      } : {}, {
        F: isOrganizer.value && activityDetail.value.inviteCode
      }, isOrganizer.value && activityDetail.value.inviteCode ? {
        G: common_vendor.t(activityDetail.value.inviteCode),
        H: common_vendor.o(copyInviteCode)
      } : {}, {
        I: isOrganizer.value && activityDetail.value.exclusiveInviteCode
      }, isOrganizer.value && activityDetail.value.exclusiveInviteCode ? common_vendor.e({
        J: common_vendor.t(isExclusiveVisible.value ? activityDetail.value.exclusiveInviteCode : "**********"),
        K: common_vendor.p({
          type: isExclusiveVisible.value ? "eye-filled" : "eye-slash-filled",
          size: "20",
          color: "#FF62B1"
        }),
        L: common_vendor.o(($event) => isExclusiveVisible.value = !isExclusiveVisible.value),
        M: isExclusiveVisible.value
      }, isExclusiveVisible.value ? {
        N: common_vendor.o(copyExclusiveCode)
      } : {}) : {}, {
        O: common_vendor.t(participantTotal.value || 0),
        P: common_vendor.o(viewAllUsers),
        Q: common_vendor.t(activityDetail.value.totalSlots),
        R: [1, 3].includes(activityDetail.value.activityFunds)
      }, [1, 3].includes(activityDetail.value.activityFunds) ? {
        S: common_vendor.t(activityDetail.value.registrationFee)
      } : activityDetail.value.activityFunds === 2 ? {} : {}, {
        T: activityDetail.value.activityFunds === 2,
        U: common_vendor.o(register),
        V: isContentLocked.value
      }, isContentLocked.value ? {
        W: common_vendor.p({
          type: "eye-slash-filled",
          size: "30",
          color: "#FF62B1"
        })
      } : {
        X: common_vendor.f(activityDetail.value.memberActivitySessionList, (item, index, i0) => {
          return common_vendor.e({
            a: index !== activityDetail.value.memberActivitySessionList.length - 1
          }, index !== activityDetail.value.memberActivitySessionList.length - 1 ? {} : {}, {
            b: common_vendor.t(item.sessionTitle),
            c: common_vendor.t(item.sessionDescription),
            d: item.id
          });
        })
      }, {
        Y: isContentLocked.value
      }, isContentLocked.value ? {
        Z: common_vendor.p({
          type: "locked-filled",
          size: "30",
          color: "#FF62B1"
        })
      } : {
        aa: common_vendor.t(activityDetail.value.activityDescription)
      }, {
        ab: activityDetail.value.memberUser.avatar,
        ac: common_vendor.t(activityDetail.value.memberUser.nickname),
        ad: common_vendor.t(activityDetail.value.organizerContactPhone || "未公开联系方式"),
        ae: common_vendor.o(($event) => navigateToBusinessCard(activityDetail.value.memberUser, true)),
        af: sponsorList.value && sponsorList.value.length > 0
      }, sponsorList.value && sponsorList.value.length > 0 ? common_vendor.e({
        ag: common_vendor.t(sponsorList.value.length),
        ah: isContentLocked.value
      }, isContentLocked.value ? {} : {
        ai: common_vendor.f(sponsorList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.logoUrl
          }, item.logoUrl ? {
            b: item.logoUrl
          } : {}, {
            c: common_vendor.t(item.sponsorName),
            d: item.id,
            e: common_vendor.o(($event) => navigateToSponsorDetail(item), item.id)
          });
        })
      }) : {}, {
        aj: activityDetail.value && activityDetail.value.isReadTrace === 1 && (viewerTotal.value > 0 || activityDetail.value.hasSilentLoginUser === 1)
      }, activityDetail.value && activityDetail.value.isReadTrace === 1 && (viewerTotal.value > 0 || activityDetail.value.hasSilentLoginUser === 1) ? common_vendor.e({
        ak: activityDetail.value.targetViewNum > 0
      }, activityDetail.value.targetViewNum > 0 ? {
        al: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#333"
        }),
        am: common_vendor.t(activityDetail.value.targetViewNum)
      } : {}, {
        an: activityDetail.value.targetViewNum > 0
      }, activityDetail.value.targetViewNum > 0 ? {
        ao: common_vendor.o(goToTraceList)
      } : {}, {
        ap: common_vendor.o(goToTraceList),
        aq: common_vendor.f(viewerList.value, (item, k0, i0) => {
          var _a;
          return {
            a: ((_a = item.memberUser) == null ? void 0 : _a.avatar) || "/static/icon/default-avatar.png",
            b: item.id
          };
        }),
        ar: activityDetail.value.hasSilentLoginUser === 1
      }, activityDetail.value.hasSilentLoginUser === 1 ? {} : {}, {
        as: common_vendor.o(goToTraceList)
      }) : {}, {
        at: commentTotal.value > 0
      }, commentTotal.value > 0 ? {
        av: common_vendor.t(commentTotal.value)
      } : {}, {
        aw: commentTotal.value > 0
      }, commentTotal.value > 0 ? {
        ax: common_vendor.o(goToCommentPage)
      } : {}, {
        ay: commentPreviewList.value.length > 0
      }, commentPreviewList.value.length > 0 ? {
        az: common_vendor.f(commentPreviewList.value, (c, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(c.anonymous === 1 ? "匿名商友" : ((_a = c.memberUserBaseVO) == null ? void 0 : _a.nickname) || "商友"),
            b: common_vendor.t(c.content),
            c: c.id
          };
        })
      } : {}, {
        aA: common_vendor.o(goToCommentPage),
        aB: common_vendor.p({
          type: activityDetail.value.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "22",
          color: activityDetail.value.userLikeStr === "like" ? "#FF62B1" : "#666"
        }),
        aC: common_vendor.t(activityDetail.value.likesCount || 0),
        aD: activityDetail.value.userLikeStr === "like" ? 1 : "",
        aE: common_vendor.o(($event) => toggleAction("like")),
        aF: common_vendor.p({
          type: activityDetail.value.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "22",
          color: activityDetail.value.userLikeStr === "dislike" ? "#3498db" : "#666"
        }),
        aG: common_vendor.t(activityDetail.value.dislikesCount || 0),
        aH: activityDetail.value.userLikeStr === "dislike" ? 1 : "",
        aI: common_vendor.o(($event) => toggleAction("dislike")),
        aJ: !isActionBarHidden.value
      }, !isActionBarHidden.value ? {
        aK: common_vendor.o(openSharePopup),
        aL: common_vendor.t(activityDetail.value.joinStatus > 0 ? "🎫 聚会核销码" : "➕ 立即报名"),
        aM: !isRegistrationActive.value && activityDetail.value.joinStatus === 0 ? 1 : "",
        aN: common_vendor.o(register)
      } : {}, {
        aO: customShareTitle.value,
        aP: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        aQ: isOrganizer.value && (activityDetail.value.requireInviteCode === 1 || activityDetail.value.exclusiveInviteCode)
      }, isOrganizer.value && (activityDetail.value.requireInviteCode === 1 || activityDetail.value.exclusiveInviteCode) ? common_vendor.e({
        aR: shareCodeType.value === "NONE",
        aS: activityDetail.value.requireInviteCode === 1
      }, activityDetail.value.requireInviteCode === 1 ? {
        aT: shareCodeType.value === "STANDARD"
      } : {}, {
        aU: activityDetail.value.exclusiveInviteCode
      }, activityDetail.value.exclusiveInviteCode ? {
        aV: shareCodeType.value === "EXCLUSIVE"
      } : {}, {
        aW: common_vendor.o(handleShareTypeChange)
      }) : {}, {
        aX: common_vendor.p({
          type: "weixin",
          size: "34",
          color: "#07c160"
        }),
        aY: common_vendor.p({
          type: "pyq",
          size: "34",
          color: "#53a046"
        }),
        aZ: common_vendor.o(guideShareTimeline),
        ba: common_vendor.o(closeSharePopup),
        bb: common_vendor.sr(sharePopup, "9217aa1c-8", {
          "k": "sharePopup"
        }),
        bc: common_vendor.o(onPopupChange),
        bd: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        be: common_vendor.sr(pointsPopup, "9217aa1c-11", {
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
