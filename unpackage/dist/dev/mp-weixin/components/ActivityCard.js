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
    }
  },
  emits: ["refreshList"],
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
    const toggleFavorite = async () => {
      if (loading.value) {
        return;
      }
      loading.value = true;
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        loading.value = false;
        return;
      }
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
        const result = await utils_request.request(endpoint, {
          method: "POST",
          data: payload
        });
        if (result && !result.error) {
          common_vendor.index.showToast({
            title: successMessage,
            icon: "success"
          });
          emit("updateFavoriteStatus", {
            id: props.activity.id,
            newFollowFlag: isFavorite.value ? 1 : 0
            // 传递新的关注状态 (1 或 0)
          });
        } else {
          isFavorite.value = originalFavoriteStatus;
          common_vendor.index.showToast({
            title: result.error || "操作失败，请重试",
            icon: "none"
          });
        }
      } catch (error) {
        isFavorite.value = originalFavoriteStatus;
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const registerActivity = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/active-enroll/active-enroll?id=${activityId}`
      });
    };
    const detailActivity = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/pages/active-detail/active-detail?id=${activityId}`
      });
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
          type: "map-pin",
          size: "16",
          color: "#FF6B00"
        }),
        i: common_vendor.t(__props.activity.locationAddress || "线上活动"),
        j: common_vendor.t(__props.activity.joinCount || 0),
        k: common_vendor.t(__props.activity.totalSlots || "不限"),
        l: common_vendor.f(__props.activity.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        m: common_vendor.o(($event) => detailActivity(__props.activity.id)),
        n: common_vendor.p({
          type: "person",
          size: "16",
          color: "#FF6B00"
        }),
        o: common_vendor.t(__props.activity.memberUser.nickname || "主办方"),
        p: common_vendor.p({
          type: isFavorite.value ? "heart-filled" : "heart",
          size: "16",
          color: "#FF6B00"
        }),
        q: common_vendor.t(isFavorite.value ? "已收藏" : "收藏"),
        r: common_vendor.o(toggleFavorite),
        s: loading.value,
        t: common_vendor.o(($event) => registerActivity(__props.activity.id))
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f73ae0ce"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ActivityCard.js.map
