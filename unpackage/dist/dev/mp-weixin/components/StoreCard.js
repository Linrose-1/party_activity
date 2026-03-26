"use strict";
const common_vendor = require("../common/vendor.js");
const utils_user = require("../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const PRIMARY_COLOR = "#FF62B1";
const SECONDARY_COLOR = "#29CFFE";
const _sfc_main = {
  __name: "StoreCard",
  props: {
    store: {
      type: Object,
      required: true
    },
    /**
     * 卡片使用场景
     * 'browse' - 浏览模式（默认）：显示赞踩、发起聚会
     * 'mine'   - 我的聚店模式：显示审核状态、帮创标识、编辑按钮
     */
    mode: {
      type: String,
      default: "browse"
    }
  },
  emits: ["click-card", "update-like", "edit-store"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const coverImage = common_vendor.computed(() => {
      if (props.store.storeCoverImageUrls && props.store.storeCoverImageUrls.length > 0) {
        return props.store.storeCoverImageUrls[0];
      }
      if (props.store.storeCoverImageUrl) {
        return props.store.storeCoverImageUrl;
      }
      return "/static/images/default-store.png";
    });
    const displayDistance = common_vendor.computed(() => {
      if (props.store.distanceKm)
        return props.store.distanceKm;
      if (typeof props.store.distance === "number") {
        return props.store.distance.toFixed(1) + "km";
      }
      return "";
    });
    const statusText = common_vendor.computed(() => {
      const map = {
        1: "正常",
        2: "审核中",
        0: "审核失败"
      };
      return map[props.store.status] ?? "未知";
    });
    const statusClass = common_vendor.computed(() => {
      const map = {
        1: "status-normal",
        2: "status-pending",
        0: "status-failed"
      };
      return map[props.store.status] ?? "";
    });
    const handleAction = async (clickedAction) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const apiAction = props.store.userLikeStr === clickedAction ? "cancel" : clickedAction;
      emit("update-like", {
        id: props.store.id,
        action: apiAction,
        clickedAction
      });
    };
    const handleCardClick = () => {
      emit("click-card", props.store);
    };
    const handleViewDetail = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: `/packages/shop-detail/shop-detail?id=${props.store.id}`
      });
    };
    const handleViewTrace = () => {
      const hasSilent = props.store.hasSilentLoginUser || 0;
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${props.store.id}&type=store&hasSilent=${hasSilent}`
      });
    };
    const handleEditStore = () => {
      emit("edit-store", props.store);
    };
    const handleInitiateParty = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!props.store || !props.store.id)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/active-publish/active-publish?storeId=${props.store.id}&storeName=${encodeURIComponent(props.store.storeName)}`
      });
    };
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: coverImage.value,
        b: __props.mode === "browse"
      }, __props.mode === "browse" ? {
        c: common_vendor.p({
          type: __props.store.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "14",
          color: __props.store.userLikeStr === "like" ? PRIMARY_COLOR : "#999"
        }),
        d: common_vendor.t(__props.store.likesCount || 0),
        e: __props.store.userLikeStr === "like" ? 1 : "",
        f: common_vendor.o(($event) => handleAction("like")),
        g: common_vendor.p({
          type: __props.store.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "14",
          color: __props.store.userLikeStr === "dislike" ? SECONDARY_COLOR : "#999"
        }),
        h: common_vendor.t(__props.store.dislikesCount || 0),
        i: __props.store.userLikeStr === "dislike" ? 1 : "",
        j: common_vendor.o(($event) => handleAction("dislike")),
        k: common_vendor.p({
          type: "chatbubble",
          size: "14",
          color: "#999"
        }),
        l: common_vendor.t(__props.store.commonCount || 0)
      } : {}, {
        m: __props.mode === "mine" && __props.store.isStoreOwner === 0
      }, __props.mode === "mine" && __props.store.isStoreOwner === 0 ? {
        n: common_vendor.p({
          type: "flag",
          size: "12",
          color: "#888"
        })
      } : {}, {
        o: common_vendor.t(__props.store.storeName),
        p: __props.mode === "browse" && displayDistance.value
      }, __props.mode === "browse" && displayDistance.value ? {
        q: common_vendor.t(displayDistance.value)
      } : {}, {
        r: __props.mode === "mine"
      }, __props.mode === "mine" ? {
        s: common_vendor.t(statusText.value),
        t: common_vendor.n(statusClass.value)
      } : {}, {
        v: common_vendor.t(__props.store.storeDescription || "暂无介绍"),
        w: __props.store.averageConsumptionRange
      }, __props.store.averageConsumptionRange ? {
        x: common_vendor.t(__props.store.averageConsumptionRange)
      } : {}, {
        y: __props.mode === "browse"
      }, __props.mode === "browse" ? {
        z: common_vendor.o(handleCardClick),
        A: common_vendor.o(handleInitiateParty)
      } : {}, {
        B: __props.mode === "mine"
      }, __props.mode === "mine" ? {
        C: common_vendor.o(handleViewDetail),
        D: common_vendor.o(handleEditStore)
      } : {}, {
        E: __props.mode === "browse" && __props.store.isReadTrace === 1 && (((_a = __props.store.targetViews) == null ? void 0 : _a.length) > 0 || __props.store.hasSilentLoginUser === 1)
      }, __props.mode === "browse" && __props.store.isReadTrace === 1 && (((_b = __props.store.targetViews) == null ? void 0 : _b.length) > 0 || __props.store.hasSilentLoginUser === 1) ? common_vendor.e({
        F: common_vendor.f((__props.store.targetViews || []).slice(0, __props.store.hasSilentLoginUser === 1 ? 7 : 8), (viewer, vIdx, i0) => {
          var _a2;
          return {
            a: ((_a2 = viewer.memberUser) == null ? void 0 : _a2.avatar) || "/static/icon/default-avatar.png",
            b: vIdx
          };
        }),
        G: __props.store.hasSilentLoginUser === 1
      }, __props.store.hasSilentLoginUser === 1 ? {} : {}, {
        H: common_vendor.t(__props.store.targetViewNum || 0),
        I: common_vendor.p({
          type: "right",
          size: "12",
          color: "#ccc"
        }),
        J: common_vendor.o(handleViewTrace)
      }) : {}, {
        K: common_vendor.o(handleCardClick)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8cae2ec5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/StoreCard.js.map
