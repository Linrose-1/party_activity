"use strict";
const common_vendor = require("../common/vendor.js");
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
  props: {
    // 支持外部传入路径覆盖默认配置
    config: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["actionSuccess"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const popup = common_vendor.ref(null);
    const addCircleRef = common_vendor.ref(null);
    const inviteCircleRef = common_vendor.ref(null);
    const targetUser = common_vendor.ref({});
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
    const open = (user) => {
      targetUser.value = user || {};
      popup.value.open();
    };
    const close = () => popup.value.close();
    const handleAction = (type) => {
      const socialTypes = ["addCircle", "inviteCircle", "viewPath"];
      if (isSelf.value && socialTypes.includes(type))
        return;
      const user = targetUser.value;
      switch (type) {
        case "viewCard":
          if (user.isEnterpriseSource) {
            common_vendor.index.navigateTo({
              url: `${PATHS.enterpriseCard}?id=${user.id}`
            });
          } else {
            const url = `${PATHS.personalCard}?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || "")}`;
            common_vendor.index.navigateTo({
              url
            });
          }
          break;
        case "viewPath":
          common_vendor.index.navigateTo({
            url: `${PATHS.relationshipPath}?targetUserId=${user.id}&name=${encodeURIComponent(user.name || "商友")}`
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
      close();
    };
    const onSocialSuccess = (id) => {
      emit("actionSuccess", id);
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return {
        a: targetUser.value.avatar || defaultAvatar,
        b: common_vendor.t(targetUser.value.name || "商友"),
        c: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#fff"
        }),
        d: common_vendor.o(close),
        e: common_vendor.p({
          type: "person",
          size: "26",
          color: "#FF7009"
        }),
        f: common_vendor.o(($event) => handleAction("viewCard")),
        g: common_vendor.p({
          type: "staff-filled",
          size: "26",
          color: isSelf.value ? "#999" : "#FF7009"
        }),
        h: !isSelf.value ? 1 : "",
        i: common_vendor.t(isSelf.value ? "本人" : "人脉链路"),
        j: common_vendor.n(isSelf.value ? "disabled" : "primary-outline"),
        k: common_vendor.o(($event) => handleAction("viewPath")),
        l: common_vendor.p({
          type: "star",
          size: "26",
          color: "#FF7009"
        }),
        m: common_vendor.o(($event) => handleAction("comment")),
        n: common_vendor.p({
          type: "paperplane-filled",
          size: "26",
          color: isSelf.value ? "#999" : "#FF7009"
        }),
        o: common_vendor.t(isSelf.value ? "本人" : "邀入我圈"),
        p: common_vendor.n(isSelf.value ? "disabled" : "primary-outline"),
        q: common_vendor.o(($event) => handleAction("inviteCircle")),
        r: common_vendor.p({
          type: "plusempty",
          size: "26",
          color: "isSelf ? '#999' : '#FF7009'"
        }),
        s: common_vendor.t(isSelf.value ? "本人" : "加入TA圈"),
        t: common_vendor.n(isSelf.value ? "disabled" : "primary-outline"),
        v: common_vendor.o(($event) => handleAction("addCircle")),
        w: common_vendor.p({
          type: "search",
          size: "26",
          color: "#FF7009"
        }),
        x: common_vendor.o(($event) => handleAction("resourceMatch")),
        y: common_vendor.sr(popup, "5571075f-0", {
          "k": "popup"
        }),
        z: common_vendor.p({
          type: "center",
          ["mask-click"]: true
        }),
        A: common_vendor.sr(addCircleRef, "5571075f-8", {
          "k": "addCircleRef"
        }),
        B: common_vendor.o(onSocialSuccess),
        C: common_vendor.sr(inviteCircleRef, "5571075f-9", {
          "k": "inviteCircleRef"
        }),
        D: common_vendor.o(onSocialSuccess)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5571075f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AvatarLongPressMenu.js.map
