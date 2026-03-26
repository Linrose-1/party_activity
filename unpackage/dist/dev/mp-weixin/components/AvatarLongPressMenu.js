"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup + AddCircleConfirmPopup + InviteCircleConfirmPopup)();
}
const AddCircleConfirmPopup = () => "./AddCircleConfirmPopup.js";
const InviteCircleConfirmPopup = () => "./InviteCircleConfirmPopup.js";
const defaultAvatar = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "AvatarLongPressMenu",
  emits: ["actionSuccess"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const popup = common_vendor.ref(null);
    const addCircleRef = common_vendor.ref(null);
    const inviteCircleRef = common_vendor.ref(null);
    const targetUser = common_vendor.ref({});
    const creditLevel = common_vendor.ref("");
    const totalScore = common_vendor.ref(0);
    const PATHS = {
      personalCard: "/packages/applicationBusinessCard/applicationBusinessCard",
      enterpriseCard: "/packages/enterprise-card/enterprise-card",
      relationshipPath: "/packages/relationship-path/relationship-path",
      reviews: "/packages/user-reviews/user-reviews",
      resourceMatch: "/packages/resource-match/resource-match"
    };
    const isSelf = common_vendor.computed(() => {
      const loggedInId = common_vendor.index.getStorageSync("userId");
      const managerId = targetUser.value.managerId || targetUser.value.id;
      return loggedInId && managerId && String(loggedInId) === String(managerId);
    });
    const open = async (user) => {
      targetUser.value = {
        ...user
      };
      creditLevel.value = "";
      totalScore.value = 0;
      popup.value.open();
      if (user.id) {
        Promise.all([
          fetchSimpleInfo(user.id),
          fetchCreditData(user.id)
        ]);
      }
    };
    const fetchSimpleInfo = async (userId) => {
      var _a, _b;
      try {
        const {
          data
        } = await utils_request.request("/app-api/member/user/getSimpleUserInfo", {
          method: "GET",
          data: {
            readUserId: userId,
            notPay: 1
          }
        });
        if (data) {
          targetUser.value.pinyinName = ((_a = data.topUpLevel) == null ? void 0 : _a.name) || "";
          targetUser.value.title = ((_b = data.level) == null ? void 0 : _b.name) || "";
          targetUser.value.name = data.realName || data.nickname || targetUser.value.name;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/AvatarLongPressMenu.vue:179", e);
      }
    };
    const fetchCreditData = async (userId) => {
      const {
        data
      } = await utils_request.request(`/app-api/member/user/other_credit-score/${userId}`, {
        method: "GET"
      });
      if (data) {
        creditLevel.value = data.creditLevel;
        totalScore.value = data.totalScore;
      }
    };
    const close = () => popup.value.close();
    const handleAction = (type) => {
      const socialTypes = ["addCircle", "inviteCircle", "viewPath"];
      if (isSelf.value && socialTypes.includes(type))
        return;
      const user = targetUser.value;
      switch (type) {
        case "navToMember":
          common_vendor.index.navigateTo({
            url: "/packages/my-member/my-member"
          });
          break;
        case "navToCredit":
          common_vendor.index.navigateTo({
            url: `/packages/credit-score/credit-score?userId=${user.id}`
          });
          break;
        case "viewCard":
          if (user.isEnterpriseSource) {
            common_vendor.index.navigateTo({
              url: `${PATHS.enterpriseCard}?id=${user.id}`
            });
          } else {
            common_vendor.index.navigateTo({
              url: `${PATHS.personalCard}?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || "")}`
            });
          }
          break;
        case "viewPath":
          common_vendor.index.navigateTo({
            url: `${PATHS.relationshipPath}?targetUserId=${user.id}&name=${encodeURIComponent(user.name)}`
          });
          break;
        case "comment":
          common_vendor.index.navigateTo({
            url: `${PATHS.reviews}?userId=${user.id}`
          });
          break;
        case "resourceMatch":
          common_vendor.index.navigateTo({
            url: `${PATHS.resourceMatch}?targetUserId=${user.id}`
          });
          break;
        case "addCircle":
          addCircleRef.value.open(user);
          break;
        case "inviteCircle":
          inviteCircleRef.value.open(user);
          break;
      }
    };
    const onSocialSuccess = (id) => emit("actionSuccess", id);
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: targetUser.value.avatar || defaultAvatar,
        b: common_vendor.t(targetUser.value.name || "商友"),
        c: targetUser.value.pinyinName || targetUser.value.title
      }, targetUser.value.pinyinName || targetUser.value.title ? common_vendor.e({
        d: targetUser.value.pinyinName
      }, targetUser.value.pinyinName ? {
        e: common_vendor.t(targetUser.value.pinyinName),
        f: common_vendor.o(($event) => handleAction("navToMember"))
      } : {}, {
        g: targetUser.value.title
      }, targetUser.value.title ? {
        h: common_vendor.t(targetUser.value.title),
        i: common_vendor.o(($event) => handleAction("navToMember"))
      } : {}) : {}, {
        j: creditLevel.value || totalScore.value
      }, creditLevel.value || totalScore.value ? common_vendor.e({
        k: creditLevel.value
      }, creditLevel.value ? {
        l: common_vendor.p({
          type: "vip-filled",
          size: "12",
          color: "#fff"
        }),
        m: common_vendor.t(creditLevel.value),
        n: common_vendor.o(($event) => handleAction("navToCredit"))
      } : {}, {
        o: totalScore.value
      }, totalScore.value ? {
        p: common_vendor.t(totalScore.value)
      } : {}) : {}, {
        q: !targetUser.value.pinyinName && !targetUser.value.title && !creditLevel.value && !totalScore.value
      }, !targetUser.value.pinyinName && !targetUser.value.title && !creditLevel.value && !totalScore.value ? {} : {}, {
        r: common_vendor.p({
          type: "closeempty",
          size: "20",
          color: "#fff"
        }),
        s: common_vendor.o(close),
        t: common_vendor.p({
          type: "person",
          size: "26",
          color: "#FF7009"
        }),
        v: common_vendor.o(($event) => handleAction("viewCard")),
        w: common_vendor.p({
          type: "staff-filled",
          size: "26",
          color: isSelf.value ? "#ccc" : "#FF7009"
        }),
        x: !isSelf.value ? 1 : "",
        y: common_vendor.t(isSelf.value ? "本人" : "人脉链路"),
        z: common_vendor.n(isSelf.value ? "disabled" : ""),
        A: common_vendor.o(($event) => handleAction("viewPath")),
        B: common_vendor.p({
          type: "star",
          size: "26",
          color: "#FF7009"
        }),
        C: common_vendor.o(($event) => handleAction("comment")),
        D: common_vendor.p({
          type: "paperplane-filled",
          size: "26",
          color: isSelf.value ? "#ccc" : "#FF7009"
        }),
        E: common_vendor.t(isSelf.value ? "本人" : "邀入我圈"),
        F: common_vendor.n(isSelf.value ? "disabled" : ""),
        G: common_vendor.o(($event) => handleAction("inviteCircle")),
        H: common_vendor.p({
          type: "plusempty",
          size: "26",
          color: isSelf.value ? "#ccc" : "#FF7009"
        }),
        I: common_vendor.t(isSelf.value ? "本人" : "加入TA圈"),
        J: common_vendor.n(isSelf.value ? "disabled" : ""),
        K: common_vendor.o(($event) => handleAction("addCircle")),
        L: common_vendor.p({
          type: "search",
          size: "26",
          color: "#FF7009"
        }),
        M: common_vendor.o(($event) => handleAction("resourceMatch")),
        N: common_vendor.sr(popup, "5571075f-0", {
          "k": "popup"
        }),
        O: common_vendor.p({
          type: "center",
          ["mask-click"]: true
        }),
        P: common_vendor.sr(addCircleRef, "5571075f-9", {
          "k": "addCircleRef"
        }),
        Q: common_vendor.o(onSocialSuccess),
        R: common_vendor.sr(inviteCircleRef, "5571075f-10", {
          "k": "inviteCircleRef"
        }),
        S: common_vendor.o(onSocialSuccess)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5571075f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AvatarLongPressMenu.js.map
