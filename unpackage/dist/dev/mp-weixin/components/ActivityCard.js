"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "ActivityCard",
  props: {
    activity: {
      type: Object,
      required: true
    },
    isLogin: {
      type: Boolean,
      default: false
    }
  },
  emits: ["updateFavoriteStatus"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isFavorite = common_vendor.ref(props.activity.followFlag === 1);
    const loading = common_vendor.ref(false);
    const formattedDate = common_vendor.computed(() => {
      if (!props.activity.startDatetime) {
        return "时间待定";
      }
      const date = new Date(props.activity.startDatetime);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    });
    const formattedDistance = common_vendor.computed(() => {
      if (typeof props.activity.distance === "number") {
        return `${props.activity.distance.toFixed(2)} km`;
      }
      return null;
    });
    const getStatusClass = (statusStr) => {
      const classMap = {
        "已取消": "canceled",
        "未开始": "upcoming",
        "报名中": "enrolled",
        "即将开始": "upcoming",
        "进行中": "ongoing",
        "已结束": "ended",
        "待退款": "refund_pending"
      };
      return classMap[statusStr] || "";
    };
    const requireLogin = (actionCallback, message) => {
      if (props.isLogin) {
        actionCallback();
      } else {
        common_vendor.index.showModal({
          title: "温馨提示",
          content: message || "您还未登录，登录后才能进行此操作哦！",
          confirmText: "去登录",
          cancelText: "再看看",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
      }
    };
    const handleCardClick = () => {
      requireLogin(() => {
        common_vendor.index.navigateTo({
          url: `/packages/active-detail/active-detail?id=${props.activity.id}`
        });
      }, "登录后才能查看聚会详情，是否立即登录？");
    };
    const handleRegisterClick = () => {
      requireLogin(() => {
        common_vendor.index.navigateTo({
          url: `/pages/active-enroll/active-enroll?id=${props.activity.id}`
        });
      }, "登录后才能报名聚会，是否立即登录？");
    };
    const toggleFavorite = async () => {
      if (loading.value) {
        return;
      }
      requireLogin(async () => {
        loading.value = true;
        const userId = common_vendor.index.getStorageSync("userId");
        const originalFavoriteStatus = isFavorite.value;
        isFavorite.value = !isFavorite.value;
        const endpoint = isFavorite.value ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
        const successMessage = isFavorite.value ? "收藏成功" : "已取消收藏";
        const payload = {
          userId,
          targetId: props.activity.id,
          targetType: "activity"
        };
        try {
          const {
            error
          } = await utils_request.request(endpoint, {
            method: "POST",
            data: payload
          });
          if (!error) {
            common_vendor.index.showToast({
              title: successMessage,
              icon: "success"
            });
            emit("updateFavoriteStatus", {
              id: props.activity.id,
              newFollowFlag: isFavorite.value ? 1 : 0
            });
          } else {
            isFavorite.value = originalFavoriteStatus;
            common_vendor.index.showToast({
              title: error || "操作失败",
              icon: "none"
            });
          }
        } catch (err) {
          isFavorite.value = originalFavoriteStatus;
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }, "登录后才能收藏聚会，是否立即登录？");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activity.coverImageUrl,
        b: common_vendor.t(__props.activity.activityTitle),
        c: __props.activity.statusStr
      }, __props.activity.statusStr ? {
        d: common_vendor.t(__props.activity.statusStr),
        e: common_vendor.n(getStatusClass(__props.activity.statusStr))
      } : {}, {
        f: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#FF6B00"
        }),
        g: common_vendor.t(formattedDate.value),
        h: common_vendor.p({
          type: "location",
          size: "16",
          color: "#FF6B00"
        }),
        i: common_vendor.t(__props.activity.locationAddress || "线上聚会"),
        j: common_vendor.t(__props.activity.joinCount || 0),
        k: common_vendor.t(__props.activity.totalSlots || "不限"),
        l: formattedDistance.value
      }, formattedDistance.value ? {
        m: common_vendor.p({
          type: "paperplane-filled",
          size: "16",
          color: "#FF6B00"
        }),
        n: common_vendor.t(formattedDistance.value)
      } : {}, {
        o: common_vendor.f(__props.activity.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        p: common_vendor.o(handleCardClick),
        q: common_vendor.p({
          type: "contact-filled",
          size: "16",
          color: "#FF6B00"
        }),
        r: common_vendor.t(__props.activity.memberUser.nickname || "主办方"),
        s: common_vendor.p({
          type: isFavorite.value ? "heart-filled" : "heart",
          size: "16",
          color: "#FF6B00"
        }),
        t: common_vendor.t(isFavorite.value ? "已收藏" : "收藏"),
        v: common_vendor.o(toggleFavorite),
        w: loading.value,
        x: common_vendor.o(handleRegisterClick)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f73ae0ce"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ActivityCard.js.map
