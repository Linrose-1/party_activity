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
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const isActionBarHidden = common_vendor.ref(false);
    const loggedInUserId = common_vendor.ref(null);
    const participantList = common_vendor.ref([]);
    const participantTotal = common_vendor.ref(0);
    const pointsPopup = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options && options.inviteCode) {
        const inviteCode = options.inviteCode;
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:336", `✅ [活动详情页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (options.id) {
        activityId.value = options.id;
        getActiveDetail();
        getParticipantList();
      } else {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:349", "未接收到聚会ID！");
        common_vendor.index.showToast({
          title: "加载聚会详情失败，缺少ID",
          icon: "none"
        });
      }
      if (options && options.sharerId) {
        const sharerId = options.sharerId;
        const bizId = options.id;
        if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
          common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:363", "用户点击了自己的聚会分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:367", "其他用户点击了聚会分享链接，且已登录，准备为分享者加分。");
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:372", "用户点击了聚会分享链接，但尚未登录。暂存分享信息。");
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId,
            type: 31
            // 明确是分享聚会
          });
        }
      }
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    const isOrganizer = common_vendor.computed(() => {
      if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser) {
        return false;
      }
      return parseInt(loggedInUserId.value) === activityDetail.value.memberUser.id;
    });
    const isRegistrationActive = common_vendor.computed(() => {
      if (!activityDetail.value) {
        return false;
      }
      return activityDetail.value.status === 2;
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
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    const onPopupChange = (e) => {
      isActionBarHidden.value = e.show;
    };
    const formattedActivityTime = common_vendor.computed(() => {
      if (!activityDetail.value)
        return "";
      const start = formatDateTime(activityDetail.value.startDatetime);
      const end = formatDateTime(activityDetail.value.endDatetime);
      return `${start} 至 ${end}`;
    });
    common_vendor.computed(() => {
      if (!activityDetail.value)
        return "";
      return formatDateTime(activityDetail.value.registrationEndDatetime);
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
      const statusMap = {
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
      return statusMap[activityDetail.value.status] || {
        text: "状态未知",
        color: "#909399"
      };
    });
    const showLimitSlotsTip = common_vendor.computed(() => {
      if (!activityDetail.value)
        return false;
      const relevantStatus = [1, 2].includes(activityDetail.value.status);
      const notEnoughPeople = (activityDetail.value.joinCount || 0) < activityDetail.value.limitSlots;
      return relevantStatus && notEnoughPeople;
    });
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
        if (result.data.memberSponsorList && Array.isArray(result.data.memberSponsorList)) {
          sponsorList.value = result.data.memberSponsorList;
        } else {
          sponsorList.value = [];
        }
        if (result.data.checkContribution === 1) {
          setTimeout(() => {
            if (pointsPopup.value) {
              pointsPopup.value.show("阅读聚会详情", 10);
            }
          }, 500);
        }
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:539", "getActiveDetail result:", activityDetail.value);
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:540", "解析到的赞助商列表:", sponsorList.value);
      } else {
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:542", "请求失败:", result ? result.error : "无返回结果");
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
          // 只获取少量用于预览
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:564", "获取报名用户列表失败:", error);
        return;
      }
      if (data && data.list) {
        participantList.value = data.list;
        participantTotal.value = data.total;
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:571", "获取到的报名用户列表:", participantList.value);
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:572", "总报名人数:", participantTotal.value);
      }
    };
    common_vendor.computed(() => {
      var _a, _b, _c, _d;
      const operatingHoursStr = (_b = (_a = activityDetail.value) == null ? void 0 : _a.memberStoreRespVO) == null ? void 0 : _b.operatingHours;
      if (!operatingHoursStr) {
        return ["暂无营业时间"];
      }
      try {
        const data = JSON.parse(operatingHoursStr);
        const regularHours = (_c = data == null ? void 0 : data.business_hours) == null ? void 0 : _c.regular;
        const specialDates = (_d = data == null ? void 0 : data.business_hours) == null ? void 0 : _d.special_dates;
        if (!regularHours && (!specialDates || specialDates.length === 0)) {
          return ["暂无营业时间"];
        }
        const resultLines = [];
        if (regularHours) {
          const dayMap = {
            monday: "周一",
            tuesday: "周二",
            wednesday: "周三",
            thursday: "周四",
            friday: "周五",
            saturday: "周六",
            sunday: "周日"
          };
          const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
          dayOrder.forEach((dayKey) => {
            const dayInfo = regularHours[dayKey];
            if (dayInfo && dayInfo.is_open) {
              const chineseDay = dayMap[dayKey];
              const isNextDay = dayInfo.close < dayInfo.open;
              const timeString = `${dayInfo.open} - ${isNextDay ? "次日" : ""}${dayInfo.close}`;
              resultLines.push(`${chineseDay}: ${timeString}`);
            }
          });
        }
        if (specialDates && specialDates.length > 0) {
          if (resultLines.length > 0) {
            resultLines.push("");
          }
          resultLines.push("【特殊营业时间】");
          specialDates.forEach((special) => {
            let line = special.date;
            if (special.description) {
              line += ` (${special.description})`;
            }
            if (special.is_open) {
              const isNextDay = special.close < special.open;
              line += `: ${special.open} - ${isNextDay ? "次日" : ""}${special.close}`;
            } else {
              line += `: 休息`;
            }
            resultLines.push(line);
          });
        }
        if (resultLines.length === 0) {
          return ["商家未设置营业时间"];
        }
        return resultLines;
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:651", "解析营业时间JSON失败:", e);
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:652", "原始字符串:", operatingHoursStr);
        return ["营业时间格式有误"];
      }
    });
    const openSharePopup = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      customShareTitle.value = activityDetail.value.activityTitle || "发现一个很棒的聚会，快来看看吧！";
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
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:686", `准备为分享者 (ID: ${sharerId}) 增加贡分, 关联聚会ID: ${bizId}`);
      const {
        error
      } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 31,
          // 31 代表 "分享聚会奖励"
          shareUserId: sharerId,
          bizId
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at packages/active-detail/active-detail.vue:700", "调用分享加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:702", `成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
      }
    };
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
    const previewBanner = (index) => {
      common_vendor.index.previewImage({
        urls: bannerImages.value,
        current: index
      });
    };
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:734", "触发分享给好友", res);
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || activityDetail.value.activityTitle || "发现一个很棒的聚会，快来看看吧！";
      const inviteCode = utils_user.getInviteCode();
      let sharePath = `/packages/active-detail/active-detail?id=${activityDetail.value.id}`;
      if (sharerId) {
        sharePath += `&sharerId=${sharerId}`;
      }
      if (inviteCode) {
        sharePath += `&inviteCode=${inviteCode}`;
      }
      return {
        title: finalTitle,
        path: sharePath,
        // 使用拼接后的路径
        imageUrl: activityDetail.value.coverImageUrl || "/static/default-share-image.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:762", "触发分享到朋友圈");
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || activityDetail.value.activityTitle || "发现一个很棒的聚会，快来看看吧！";
      const inviteCode = utils_user.getInviteCode();
      let queryString = `id=${activityDetail.value.id}&from=timeline`;
      if (sharerId) {
        queryString += `&sharerId=${sharerId}`;
      }
      if (inviteCode) {
        queryString += `&inviteCode=${inviteCode}`;
      }
      return {
        title: finalTitle,
        query: queryString,
        // 使用拼接后的 query
        imageUrl: activityDetail.value.coverImageUrl || "/static/default-share-image.png"
      };
    });
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
        url: `/packages/active-enroll/active-enroll?id=${activityId.value}`
      });
    };
    function viewAllUsers() {
      if (participantTotal.value === 0) {
        common_vendor.index.showToast({
          title: "暂无用户报名",
          icon: "none"
        });
        return;
      }
      let url = `/pages/activity-participants/activity-participants?id=${activityId.value}`;
      if (isOrganizer.value) {
        url += "&isOrganizer=1";
      }
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:827", "跳转到报名列表页, URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    }
    const navigateToSponsorDetail = (item) => {
      if (!item.id)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/sponsor-detail/sponsor-detail?sponsorId=${item.id}&activityId=${activityId.value}`
      });
    };
    const navigateToBusinessCard = (user, isFreeView = false) => {
      if (!user || !user.id) {
        common_vendor.index.showToast({
          title: "无法查看该用户主页",
          icon: "none"
        });
        return;
      }
      const defaultAvatar = "/static/images/default-avatar.png";
      const name = user.nickname || "匿名用户";
      const avatarUrl = user.avatar || defaultAvatar;
      let url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      if (isFreeView) {
        url += "&fromShare=1";
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:869", `[免费查看] 跳转到名片申请页, UserID: ${user.id}`);
      } else {
        common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:871", `[标准流程] 跳转到名片申请页, UserID: ${user.id}`);
      }
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
      const targetPath = "/pages/shop-detail/shop-detail";
      const url = `${targetPath}?id=${store.id}`;
      common_vendor.index.__f__("log", "at packages/active-detail/active-detail.vue:898", "从聚会详情页跳转到聚店详情页, URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
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
        t: activityDetail.value.activityFunds === 1
      }, activityDetail.value.activityFunds === 1 ? {
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
        U: common_vendor.t(formattedRegistrationTimes.value.start),
        V: common_vendor.t(formattedRegistrationTimes.value.end),
        W: !isActionBarHidden.value
      }, !isActionBarHidden.value ? {
        X: common_vendor.o(openSharePopup),
        Y: !isRegistrationActive.value ? 1 : "",
        Z: !isRegistrationActive.value,
        aa: common_vendor.o(register)
      } : {}, {
        ab: customShareTitle.value,
        ac: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        ad: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        ae: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        af: common_vendor.o(guideShareTimeline),
        ag: common_vendor.o(closeSharePopup),
        ah: common_vendor.sr(sharePopup, "9217aa1c-5", {
          "k": "sharePopup"
        }),
        ai: common_vendor.o(onPopupChange),
        aj: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        ak: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        al: common_assets._imports_0$2,
        am: common_vendor.o(hideTimelineGuide)
      } : {}, {
        an: common_vendor.sr(pointsPopup, "9217aa1c-8", {
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
