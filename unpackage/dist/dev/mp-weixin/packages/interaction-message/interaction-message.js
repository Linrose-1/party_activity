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
  __name: "interaction-message",
  setup(__props) {
    const targetId = common_vendor.ref(null);
    const viewUserId = common_vendor.ref(void 0);
    const commentList = common_vendor.ref([]);
    const content = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const scrollTarget = common_vendor.ref("");
    const safeBottomHeight = common_vendor.ref(0);
    const inputBarHeight = common_vendor.ref(60);
    const keyboardHeight = common_vendor.ref(0);
    common_vendor.onLoad((options) => {
      var _a;
      const sys = common_vendor.index.getSystemInfoSync();
      safeBottomHeight.value = ((_a = sys.safeAreaInsets) == null ? void 0 : _a.bottom) ?? 0;
      inputBarHeight.value = 70 + safeBottomHeight.value;
      targetId.value = options.targetId;
      if (options.userId && options.userId !== "null" && options.userId !== "undefined") {
        viewUserId.value = options.userId;
      }
      common_vendor.index.onKeyboardHeightChange((res) => {
        keyboardHeight.value = res.height;
        common_vendor.index.getSystemInfoSync();
        const baseHeight = 70 + safeBottomHeight.value;
        inputBarHeight.value = res.height > 0 ? baseHeight + res.height : baseHeight;
        if (res.height > 0) {
          scrollToBottom();
        }
      });
      fetchComments();
    });
    common_vendor.onUnload(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    const onInputFocus = () => {
      setTimeout(() => {
        scrollToBottom();
      }, 350);
    };
    const onInputBlur = () => {
      inputBarHeight.value = 70 + safeBottomHeight.value;
    };
    const fetchComments = async () => {
      isLoading.value = true;
      const queryParams = {
        targetId: targetId.value,
        targetType: "partner_post",
        pageNo: 1,
        pageSize: 100
      };
      if (viewUserId.value) {
        queryParams.userId = viewUserId.value;
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/comment/partner-post-comment-list", {
        method: "GET",
        data: queryParams
      });
      if (!error && (data == null ? void 0 : data.list)) {
        commentList.value = [...data.list].reverse();
        scrollToBottom();
      }
      isLoading.value = false;
    };
    const handleSend = async () => {
      const text = content.value.trim();
      if (!text)
        return;
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      common_vendor.index.showLoading({
        title: "发送中",
        mask: true
      });
      const payload = {
        userId: loggedInUserId,
        targetId: targetId.value,
        targetType: "partner_post",
        content: text,
        anonymous: 0,
        id: 0
      };
      if (viewUserId.value)
        payload.replyUserId = viewUserId.value;
      const {
        error
      } = await utils_request.request("/app-api/member/comment/create", {
        method: "POST",
        data: payload
      });
      common_vendor.index.hideLoading();
      if (!error) {
        content.value = "";
        await fetchComments();
      } else {
        common_vendor.index.showToast({
          title: error || "发送失败",
          icon: "none"
        });
      }
    };
    const scrollToBottom = () => {
      common_vendor.nextTick$1(() => {
        scrollTarget.value = "";
        setTimeout(() => {
          scrollTarget.value = "chat-bottom-anchor";
        }, 100);
      });
    };
    const formatTime = (time) => {
      if (!time)
        return "";
      let date;
      if (typeof time === "number") {
        date = new Date(time);
      } else if (typeof time === "string") {
        const normalized = time.replace("T", " ").replace(/-/g, "/");
        date = new Date(normalized);
        if (isNaN(date.getTime())) {
          return time.replace("T", " ").substring(5, 16);
        }
      } else {
        return "";
      }
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${M}-${D} ${h}:${m}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF730E"
        }),
        b: common_vendor.f(commentList.value, (item, k0, i0) => {
          var _a, _b;
          return {
            a: ((_a = item.memberUserBaseVO) == null ? void 0 : _a.avatar) || "/static/icon/default-avatar.png",
            b: common_vendor.t(((_b = item.memberUserBaseVO) == null ? void 0 : _b.nickname) || "商友"),
            c: common_vendor.t(item.content),
            d: common_vendor.t(formatTime(item.createTime)),
            e: item.id,
            f: "msg-" + item.id,
            g: item.owner === 1 ? 1 : ""
          };
        }),
        c: commentList.value.length === 0 && !isLoading.value
      }, commentList.value.length === 0 && !isLoading.value ? {
        d: common_vendor.p({
          type: "chat-filled",
          size: "50",
          color: "#eee"
        })
      } : {}, {
        e: scrollTarget.value,
        f: inputBarHeight.value + "px",
        g: common_vendor.o(onInputFocus),
        h: common_vendor.o(onInputBlur),
        i: content.value,
        j: common_vendor.o(($event) => content.value = $event.detail.value),
        k: content.value.trim() ? 1 : "",
        l: common_vendor.o(handleSend),
        m: safeBottomHeight.value + "px",
        n: common_vendor.o((...args) => _ctx.onInputBarLayout && _ctx.onInputBarLayout(...args))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c723bf2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/interaction-message/interaction-message.js.map
