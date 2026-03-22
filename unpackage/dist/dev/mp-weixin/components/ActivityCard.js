"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const utils_user = require("../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + SmartGuidePopup)();
}
const SmartGuidePopup = () => "./SmartGuidePopup.js";
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
  emits: ["updateFavoriteStatus", "updateLikeStatus"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const smartGuidePopupRef = common_vendor.ref(null);
    const emit = __emit;
    const isFavorite = common_vendor.ref(props.activity.followFlag === 1);
    const loading = common_vendor.ref(false);
    const isOwner = common_vendor.computed(() => {
      var _a;
      const userId = common_vendor.index.getStorageSync("userId");
      return !!userId && ((_a = props.activity.memberUser) == null ? void 0 : _a.id) == userId;
    });
    const isRegistrationDisabled = common_vendor.computed(() => {
      const disabledStatuses = ["已结束", "活动取消", "聚会取消", "已取消"];
      return disabledStatuses.includes(props.activity.statusStr);
    });
    const formattedDate = common_vendor.computed(() => {
      if (!props.activity.startDatetime)
        return "待定";
      const date = new Date(props.activity.startDatetime);
      const pad = (n) => n.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} 开始`;
    });
    const formattedRegDate = common_vendor.computed(() => {
      if (!props.activity.registrationStartDatetime)
        return "待定";
      const date = new Date(props.activity.registrationStartDatetime);
      const pad = (n) => n.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} 开始`;
    });
    common_vendor.computed(() => {
      if (typeof props.activity.distance === "number") {
        return `${props.activity.distance.toFixed(2)} km`;
      }
      return null;
    });
    const getStatusColor = (status) => {
      const colorMap = {
        0: "#909399",
        // 已取消
        1: "#f9ae3d",
        // 未开始
        2: "#FF62B1",
        // 正在报名中 (主题色)
        3: "#007aff",
        // 即将开始
        4: "#dd524d",
        // 进行中
        5: "#8f8f94",
        // 已结束
        6: "#e6a23c"
        // 待退款
      };
      return colorMap[status] || "#999";
    };
    const handleAction = async (clickedAction) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const apiAction = props.activity.userLikeStr === clickedAction ? "cancel" : clickedAction;
      emit("updateLikeStatus", {
        id: props.activity.id,
        action: apiAction,
        clickedAction
      });
    };
    const handleCardClick = async () => {
      if (!await utils_user.checkLoginGuard("登录并绑定手机号后才能查看聚会详情，是否立即登录？"))
        return;
      common_vendor.index.navigateTo({
        url: `/packages/active-detail/active-detail?id=${props.activity.id}`
      });
    };
    const handleRegisterClick = async () => {
      if (!await utils_user.checkLoginGuard("登录并绑定手机号后才能报名聚会，是否立即登录？"))
        return;
      if (isRegistrationDisabled.value)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/active-enroll/active-enroll?id=${props.activity.id}`
      });
    };
    const toggleFavorite = async () => {
      if (loading.value)
        return;
      if (!await utils_user.checkLoginGuard("登录并绑定手机号后才能收藏聚会，是否立即登录？"))
        return;
      loading.value = true;
      const original = isFavorite.value;
      isFavorite.value = !isFavorite.value;
      const endpoint = isFavorite.value ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const {
          error
        } = await utils_request.request(endpoint, {
          method: "POST",
          data: {
            userId: common_vendor.index.getStorageSync("userId"),
            targetId: props.activity.id,
            targetType: "activity"
          }
        });
        if (!error) {
          common_vendor.index.showToast({
            title: isFavorite.value ? "收藏成功" : "已取消收藏",
            icon: "success"
          });
          emit("updateFavoriteStatus", {
            id: props.activity.id,
            newFollowFlag: isFavorite.value ? 1 : 0
          });
          if (utils_user.isScenario3User()) {
            setTimeout(() => {
              var _a;
              (_a = smartGuidePopupRef.value) == null ? void 0 : _a.open();
            }, 1e3);
          }
        } else {
          isFavorite.value = original;
          common_vendor.index.showToast({
            title: error || "操作失败",
            icon: "none"
          });
        }
      } catch {
        isFavorite.value = original;
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const goToRegisteredUsers = () => {
      common_vendor.index.navigateTo({
        url: `/pages/my-active-registeredUser/my-active-registeredUser?item=${encodeURIComponent(JSON.stringify(props.activity))}`
      });
    };
    const handleManageRefunds = (mode) => {
      common_vendor.index.navigateTo({
        url: `/pages/my-active-manage/my-active-manage?item=${encodeURIComponent(JSON.stringify(props.activity))}&mode=${mode}`
      });
    };
    const handleViewTrace = () => {
      const hasSilent = props.activity.hasSilentLoginUser || 0;
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${props.activity.id}&type=activity&hasSilent=${hasSilent}`
      });
    };
    const showOwnerMoreActions = () => {
      const itemList = [];
      const availableActions = {};
      itemList.push("参会名单");
      availableActions["参会名单"] = () => common_vendor.index.navigateTo({
        url: `/packages/participant-detail/participant-detail?id=${props.activity.id}`
      });
      if (["未开始", "报名中", "活动即将开始", "进行中"].includes(props.activity.statusStr)) {
        itemList.push("取消聚会");
        availableActions["取消聚会"] = confirmCancelActivity;
      }
      itemList.push("修改编辑");
      availableActions["修改编辑"] = () => common_vendor.index.navigateTo({
        url: `/packages/active-publish/active-publish?mode=edit&id=${props.activity.id}`
      });
      common_vendor.index.showActionSheet({
        itemList,
        success: (res) => {
          const tappedItem = itemList[res.tapIndex];
          if (availableActions[tappedItem])
            availableActions[tappedItem]();
        },
        fail: (res) => {
          common_vendor.index.__f__("log", "at components/ActivityCard.vue:359", res.errMsg);
        }
      });
    };
    const confirmCancelActivity = () => {
      common_vendor.index.showModal({
        title: "警告",
        content: "确定要取消此聚会吗？此操作不可逆。",
        confirmColor: "#f44336",
        success: async (res) => {
          if (!res.confirm)
            return;
          common_vendor.index.showLoading({
            title: "正在取消..."
          });
          const result = await utils_request.request("/app-api/member/activity/delete", {
            method: "POST",
            data: {
              id: props.activity.id
            }
          });
          common_vendor.index.hideLoading();
          if (result && !result.error) {
            common_vendor.index.showToast({
              title: "聚会已取消",
              icon: "success"
            });
            common_vendor.index.$emit("activityCanceled", {
              id: props.activity.id
            });
          } else {
            const msg = typeof result.error === "object" ? result.error.msg || JSON.stringify(result.error) : result.error || "操作失败";
            common_vendor.index.showToast({
              title: msg,
              icon: "none"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: isOwner.value
      }, isOwner.value ? common_vendor.e({
        b: common_vendor.p({
          type: "more-filled",
          size: "14",
          color: "#FF6B00"
        }),
        c: common_vendor.o(showOwnerMoreActions),
        d: __props.activity.statusStr === "活动取消" || __props.activity.statusStr === "聚会取消"
      }, __props.activity.statusStr === "活动取消" || __props.activity.statusStr === "聚会取消" ? {
        e: common_vendor.p({
          type: "wallet",
          size: "14",
          color: "#f56c6c"
        }),
        f: common_vendor.o(($event) => handleManageRefunds("all"))
      } : {}, {
        g: __props.activity.statusStr === "活动取消" || __props.activity.statusStr === "聚会取消"
      }, __props.activity.statusStr === "活动取消" || __props.activity.statusStr === "聚会取消" ? {} : {}, {
        h: common_vendor.p({
          type: "person-filled",
          size: "14",
          color: "#FF6B00"
        }),
        i: __props.activity.pendingConfirmCount > 0
      }, __props.activity.pendingConfirmCount > 0 ? {
        j: common_vendor.t(__props.activity.pendingConfirmCount)
      } : {}, {
        k: common_vendor.o(goToRegisteredUsers),
        l: __props.activity.paddingReturnCount > 0
      }, __props.activity.paddingReturnCount > 0 ? {
        m: common_vendor.p({
          type: "notification-filled",
          size: "14",
          color: "#fff"
        }),
        n: common_vendor.t(__props.activity.paddingReturnCount),
        o: common_vendor.o(($event) => handleManageRefunds("individual"))
      } : {}, {
        p: common_vendor.o(() => {
        })
      }) : {}, {
        q: __props.activity.coverImageUrl,
        r: __props.activity.tags && __props.activity.tags.length > 0
      }, __props.activity.tags && __props.activity.tags.length > 0 ? {
        s: common_vendor.t(__props.activity.tags[0])
      } : {}, {
        t: __props.activity.statusStr
      }, __props.activity.statusStr ? {
        v: common_vendor.t(__props.activity.statusStr),
        w: getStatusColor(__props.activity.status)
      } : {}, {
        x: __props.activity.memberUser.avatar,
        y: common_vendor.t(__props.activity.memberUser.nickname || "主办方"),
        z: common_vendor.t(__props.activity.activityTitle),
        A: common_vendor.t(formattedDate.value),
        B: common_vendor.t(formattedRegDate.value),
        C: common_vendor.t(__props.activity.locationAddress || "线上聚会"),
        D: common_vendor.o(handleCardClick),
        E: __props.activity.isReadTrace === 1 && (((_a = __props.activity.targetViews) == null ? void 0 : _a.length) > 0 || __props.activity.hasSilentLoginUser === 1)
      }, __props.activity.isReadTrace === 1 && (((_b = __props.activity.targetViews) == null ? void 0 : _b.length) > 0 || __props.activity.hasSilentLoginUser === 1) ? common_vendor.e({
        F: common_vendor.f((__props.activity.targetViews || []).slice(0, __props.activity.hasSilentLoginUser === 1 ? 7 : 8), (viewer, vIdx, i0) => {
          var _a2;
          return {
            a: ((_a2 = viewer.memberUser) == null ? void 0 : _a2.avatar) || "/static/icon/default-avatar.png",
            b: vIdx
          };
        }),
        G: __props.activity.hasSilentLoginUser === 1
      }, __props.activity.hasSilentLoginUser === 1 ? {} : {}, {
        H: common_vendor.t(__props.activity.targetViewNum || 0),
        I: common_vendor.p({
          type: "right",
          size: "12",
          color: "#ccc"
        }),
        J: common_vendor.o(handleViewTrace)
      }) : {}, {
        K: common_vendor.p({
          type: __props.activity.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: __props.activity.userLikeStr === "like" ? "#FF6B00" : "#888"
        }),
        L: common_vendor.t(__props.activity.likesCount || 0),
        M: __props.activity.userLikeStr === "like" ? 1 : "",
        N: common_vendor.o(($event) => handleAction("like")),
        O: common_vendor.p({
          type: __props.activity.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: __props.activity.userLikeStr === "dislike" ? "#3498db" : "#888"
        }),
        P: common_vendor.t(__props.activity.dislikesCount || 0),
        Q: __props.activity.userLikeStr === "dislike" ? 1 : "",
        R: common_vendor.o(($event) => handleAction("dislike")),
        S: common_vendor.p({
          type: "chatbubble",
          size: "18",
          color: "#888"
        }),
        T: common_vendor.t(__props.activity.commonCount || 0),
        U: common_vendor.p({
          type: isFavorite.value ? "heart-filled" : "heart",
          size: "16",
          color: "#FF6B00"
        }),
        V: common_vendor.t(isFavorite.value ? "已收" : "收藏"),
        W: common_vendor.o(toggleFavorite),
        X: common_vendor.t(__props.activity.joinStatus > 0 ? "聚会核销码" : "立即报名"),
        Y: isRegistrationDisabled.value ? 1 : "",
        Z: common_vendor.o(handleRegisterClick),
        aa: common_vendor.sr(smartGuidePopupRef, "f73ae0ce-9", {
          "k": "smartGuidePopupRef"
        }),
        ab: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f73ae0ce"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ActivityCard.js.map
