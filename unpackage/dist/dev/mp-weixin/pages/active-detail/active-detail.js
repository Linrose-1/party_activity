"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "active-detail",
  setup(__props) {
    const activityId = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const isActionBarHidden = common_vendor.ref(false);
    const loggedInUserId = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (options.id) {
        activityId.value = options.id;
        getActiveDetail();
      } else {
        common_vendor.index.__f__("error", "at pages/active-detail/active-detail.vue:250", "未接收到活动ID！");
        common_vendor.index.showToast({
          title: "加载活动详情失败，缺少ID",
          icon: "none"
        });
      }
      if (options && options.sharerId) {
        const sharerId = options.sharerId;
        const bizId = options.id;
        if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
          common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:264", "用户点击了自己的活动分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:268", "其他用户点击了活动分享链接，且已登录，准备为分享者加分。");
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:273", "用户点击了活动分享链接，但尚未登录。暂存分享信息。");
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId,
            type: 31
            // 明确是分享活动
          });
        }
      }
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    const isRegistrationActive = common_vendor.computed(() => {
      if (!activityDetail.value) {
        return false;
      }
      return activityDetail.value.status === 2;
    });
    const avatars = [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
      "https://randomuser.me/api/portraits/men/4.jpg"
    ];
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
          text: "活动已取消",
          color: "#909399"
        },
        1: {
          text: "活动未开始",
          color: "#f9ae3d"
        },
        2: {
          text: "正在报名中",
          color: "#4cd964"
        },
        3: {
          text: "活动即将开始",
          color: "#007aff"
        },
        4: {
          text: "活动进行中",
          color: "#dd524d"
        },
        5: {
          text: "活动已结束",
          color: "#8f8f94"
        },
        6: {
          text: "活动待退款",
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
        common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:413", "getActiveDetail result:", activityDetail.value);
      } else {
        common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:415", "请求失败:", result ? result.error : "无返回结果");
      }
    };
    const openSharePopup = () => {
      customShareTitle.value = activityDetail.value.activityTitle || "发现一个很棒的活动，快来看看吧！";
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
      common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:446", `准备为分享者 (ID: ${sharerId}) 增加贡分, 关联活动ID: ${bizId}`);
      const {
        error
      } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 31,
          // 31 代表 "分享活动奖励"
          shareUserId: sharerId,
          bizId
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/active-detail/active-detail.vue:460", "调用分享加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:462", `成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
      }
    };
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:468", "触发分享给好友", res);
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || activityDetail.value.activityTitle || "发现一个很棒的活动，快来看看吧！";
      let sharePath = `/pages/active-detail/active-detail?id=${activityDetail.value.id}`;
      if (sharerId) {
        sharePath += `&sharerId=${sharerId}`;
      }
      return {
        title: finalTitle,
        path: sharePath,
        // 使用拼接后的路径
        imageUrl: activityDetail.value.coverImageUrl || "/static/default-share-image.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:490", "触发分享到朋友圈");
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || activityDetail.value.activityTitle || "发现一个很棒的活动，快来看看吧！";
      let queryString = `id=${activityDetail.value.id}&from=timeline`;
      if (sharerId) {
        queryString += `&sharerId=${sharerId}`;
      }
      return {
        title: finalTitle,
        query: queryString,
        // 使用拼接后的 query
        imageUrl: activityDetail.value.coverImageUrl || "/static/default-share-image.png"
      };
    });
    function register() {
      if (!isRegistrationActive.value) {
        common_vendor.index.showToast({
          title: "当前非报名时间",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/active-enroll/active-enroll?id=${activityId.value}`
      });
    }
    function viewAllUsers() {
      common_vendor.index.showToast({
        title: "查看全部参与用户",
        icon: "none"
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityDetail.value
      }, activityDetail.value ? common_vendor.e({
        b: common_vendor.t(activityDetail.value.tags.join(" · ")),
        c: `url(${activityDetail.value.coverImageUrl})`,
        d: statusInfo.value.text
      }, statusInfo.value.text ? {
        e: common_vendor.t(statusInfo.value.text),
        f: statusInfo.value.color
      } : {}, {
        g: showLimitSlotsTip.value
      }, showLimitSlotsTip.value ? {
        h: common_vendor.p({
          type: "info-filled",
          color: "#e6a23c",
          size: "16"
        }),
        i: common_vendor.t(activityDetail.value.limitSlots)
      } : {}, {
        j: common_vendor.t(activityDetail.value.activityTitle),
        k: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#FF6B00"
        }),
        l: common_vendor.t(formattedActivityTime.value),
        m: common_vendor.p({
          type: "location",
          size: "18",
          color: "#FF6B00"
        }),
        n: common_vendor.t(activityDetail.value.locationAddress),
        o: common_vendor.t(activityDetail.value.joinCount || 0),
        p: common_vendor.t(activityDetail.value.totalSlots),
        q: activityDetail.value.activityFunds === 1
      }, activityDetail.value.activityFunds === 1 ? {
        r: common_vendor.t(activityDetail.value.registrationFee)
      } : activityDetail.value.activityFunds === 2 ? {} : {}, {
        s: activityDetail.value.activityFunds === 2,
        t: common_vendor.t(activityDetail.value.activityDescription),
        v: common_vendor.f(activityDetail.value.memberActivitySessionList, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.sessionTitle),
            b: common_vendor.t(item.sessionDescription),
            c: item.id
          };
        }),
        w: activityDetail.value.memberUser.avatar,
        x: common_vendor.t(activityDetail.value.memberUser.nickname),
        y: common_vendor.t(activityDetail.value.organizerContactPhone),
        z: activityDetail.value.memberStoreRespVO
      }, activityDetail.value.memberStoreRespVO ? common_vendor.e({
        A: activityDetail.value.memberStoreRespVO.storeCoverImageUrl
      }, activityDetail.value.memberStoreRespVO.storeCoverImageUrl ? {
        B: activityDetail.value.memberStoreRespVO.storeCoverImageUrl
      } : {
        C: common_vendor.p({
          type: "shop-filled",
          size: "24",
          color: "#fff"
        })
      }, {
        D: common_vendor.t(activityDetail.value.memberStoreRespVO.storeName),
        E: common_vendor.t(activityDetail.value.memberStoreRespVO.fullAddress),
        F: common_vendor.t(activityDetail.value.memberStoreRespVO.contactPhone),
        G: common_vendor.t(activityDetail.value.memberStoreRespVO.operatingHours || "暂无营业时间")
      }) : {}, {
        H: common_vendor.o(viewAllUsers),
        I: common_vendor.f(avatars, (avatar, index, i0) => {
          return {
            a: index,
            b: avatar
          };
        }),
        J: activityDetail.value.activityFunds === 2
      }, activityDetail.value.activityFunds === 2 ? {
        K: activityDetail.value.companyLogo,
        L: common_vendor.t(activityDetail.value.companyName),
        M: common_vendor.t(activityDetail.value.companyName)
      } : {}, {
        N: common_vendor.t(formattedRegistrationTimes.value.start),
        O: common_vendor.t(formattedRegistrationTimes.value.end),
        P: !isActionBarHidden.value
      }, !isActionBarHidden.value ? {
        Q: common_vendor.o(openSharePopup),
        R: !isRegistrationActive.value ? 1 : "",
        S: !isRegistrationActive.value,
        T: common_vendor.o(register)
      } : {}, {
        U: customShareTitle.value,
        V: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        W: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        X: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        Y: common_vendor.o(guideShareTimeline),
        Z: common_vendor.o(closeSharePopup),
        aa: common_vendor.sr(sharePopup, "de6b8eea-4", {
          "k": "sharePopup"
        }),
        ab: common_vendor.o(onPopupChange),
        ac: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        ad: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        ae: common_assets._imports_0,
        af: common_vendor.o(hideTimelineGuide)
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-de6b8eea"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-detail/active-detail.js.map
