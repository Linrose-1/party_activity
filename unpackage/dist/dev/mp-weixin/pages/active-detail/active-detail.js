"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "active-detail",
  setup(__props) {
    const activityId = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.id) {
        activityId.value = options.id;
        getActiveDetail();
      } else {
        common_vendor.index.__f__("error", "at pages/active-detail/active-detail.vue:200", "未接收到活动ID！");
        common_vendor.index.showToast({
          title: "加载活动详情失败，缺少ID",
          icon: "none"
        });
      }
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
        common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:324", "getActiveDetail result:", activityDetail.value);
      } else {
        common_vendor.index.__f__("log", "at pages/active-detail/active-detail.vue:326", "请求失败:", result ? result.error : "无返回结果");
      }
    };
    function share() {
      common_vendor.index.showToast({
        title: "已分享到微信朋友圈",
        icon: "none"
      });
    }
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
        w: common_vendor.p({
          type: "person-filled",
          size: "24",
          color: "#fff"
        }),
        x: common_vendor.t(activityDetail.value.organizerUnitName),
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
        P: common_vendor.o(share),
        Q: !isRegistrationActive.value ? 1 : "",
        R: !isRegistrationActive.value,
        S: common_vendor.o(register)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-de6b8eea"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-detail/active-detail.js.map
