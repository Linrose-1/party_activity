"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "comment-page",
  setup(__props) {
    const targetId = common_vendor.ref(null);
    const targetType = common_vendor.ref("");
    const comments = common_vendor.ref([]);
    const loggedInUserId = common_vendor.ref(common_vendor.index.getStorageSync("userId"));
    const newCommentText = common_vendor.ref("");
    const isAnonymous = common_vendor.ref(false);
    const replyToId = common_vendor.ref(0);
    const replyToName = common_vendor.ref("");
    const keyboardHeight = common_vendor.ref(0);
    const placeholderText = common_vendor.computed(
      () => replyToName.value ? `回复 @${replyToName.value}` : "友善评论，文明互动..."
    );
    common_vendor.onLoad((options) => {
      targetId.value = options.id;
      targetType.value = options.type;
      const titleMap = {
        "activity": "聚会评论",
        "store": "聚店评论"
      };
      common_vendor.index.setNavigationBarTitle({
        title: titleMap[targetType.value] || "评论"
      });
      fetchComments();
      common_vendor.index.onKeyboardHeightChange((res) => {
        keyboardHeight.value = res.height;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    const fetchComments = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/comment/select-type-target-id", {
        method: "GET",
        data: {
          targetId: targetId.value,
          targetType: targetType.value
        }
      });
      if (data) {
        comments.value = flattenComments(data);
      }
    };
    const flattenComments = (apiData, replyTo = null) => {
      let list = [];
      apiData.forEach((c) => {
        var _a, _b;
        const isAnon = c.anonymous === 1;
        const name = isAnon ? "匿名商友" : ((_a = c.memberUserBaseVO) == null ? void 0 : _a.nickname) || "商友";
        const avatar = isAnon ? "/static/icon/default-avatar.png" : (_b = c.memberUserBaseVO) == null ? void 0 : _b.avatar;
        list.push({
          id: c.id,
          userId: c.userId,
          user: name,
          avatar,
          time: formatTime(c.createTime),
          text: c.content,
          parentId: c.parentId,
          replyTo,
          isAnon
        });
        if (c.childrenList) {
          list = list.concat(flattenComments(c.childrenList, name));
        }
      });
      return list;
    };
    const emitCommentChanged = () => {
      common_vendor.index.$emit("commentChanged", {
        targetId: targetId.value,
        targetType: targetType.value,
        totalCount: comments.value.length
      });
    };
    const startReply = (comment) => {
      replyToId.value = comment.id;
      replyToName.value = comment.user;
      common_vendor.index.showToast({
        title: `回复 @${comment.user}`,
        icon: "none"
      });
    };
    const handleSend = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!newCommentText.value.trim())
        return;
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      const {
        error
      } = await utils_request.request("/app-api/member/comment/create", {
        method: "POST",
        data: {
          userId: loggedInUserId.value,
          targetId: targetId.value,
          targetType: targetType.value,
          parentId: replyToId.value || 0,
          content: newCommentText.value,
          anonymous: isAnonymous.value ? 1 : 0
        }
      });
      common_vendor.index.hideLoading();
      if (!error) {
        common_vendor.index.showToast({
          title: "发布成功"
        });
        newCommentText.value = "";
        replyToId.value = 0;
        replyToName.value = "";
        isAnonymous.value = false;
        await fetchComments();
        emitCommentChanged();
      }
    };
    const deleteComment = (id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除此评论吗？",
        success: async (res) => {
          if (res.confirm) {
            const {
              error
            } = await utils_request.request(`/app-api/member/comment/delete?id=${id}`, {
              method: "DELETE"
            });
            if (!error) {
              await fetchComments();
              emitCommentChanged();
            }
          }
        }
      });
    };
    const goUserCard = (comment) => {
      if (comment.isAnon)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${comment.userId}&name=${encodeURIComponent(comment.user)}&avatar=${encodeURIComponent(comment.avatar)}`
      });
    };
    const formatTime = (ts) => {
      const d = new Date(ts);
      return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    const copyMenu = common_vendor.reactive({
      show: false,
      text: ""
    });
    const handleLongPress = (text) => {
      copyMenu.text = text;
      copyMenu.show = true;
    };
    const executeCopy = () => {
      common_vendor.index.setClipboardData({
        data: copyMenu.text,
        success: () => {
          copyMenu.show = false;
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: comments.value.length > 0
      }, comments.value.length > 0 ? {
        b: common_vendor.f(comments.value, (comment, k0, i0) => {
          return common_vendor.e({
            a: comment.avatar,
            b: common_vendor.o(($event) => goUserCard(comment), comment.id),
            c: common_vendor.t(comment.user),
            d: common_vendor.t(comment.time),
            e: comment.replyTo
          }, comment.replyTo ? {
            f: common_vendor.t(comment.replyTo)
          } : {}, {
            g: common_vendor.t(comment.text),
            h: common_vendor.o(($event) => handleLongPress(comment.text), comment.id),
            i: "3a461f42-0-" + i0,
            j: common_vendor.o(($event) => startReply(comment), comment.id),
            k: loggedInUserId.value == comment.userId
          }, loggedInUserId.value == comment.userId ? {
            l: "3a461f42-1-" + i0,
            m: common_vendor.p({
              type: "trash",
              size: "14",
              color: "#999"
            }),
            n: common_vendor.o(($event) => deleteComment(comment.id), comment.id)
          } : {}, {
            o: comment.id,
            p: comment.parentId !== 0 ? 1 : ""
          });
        }),
        c: common_vendor.p({
          type: "chatbubble",
          size: "14",
          color: "#666"
        })
      } : {
        d: common_assets._imports_0$11
      }, {
        e: common_vendor.o((...args) => _ctx.onReachBottom && _ctx.onReachBottom(...args)),
        f: common_vendor.p({
          type: isAnonymous.value ? "eye-slash-filled" : "eye-filled",
          size: "18",
          color: isAnonymous.value ? "#FF6A00" : "#999"
        }),
        g: common_vendor.t(isAnonymous.value ? "匿名" : "显名"),
        h: isAnonymous.value ? 1 : "",
        i: common_vendor.o(($event) => isAnonymous.value = !isAnonymous.value),
        j: placeholderText.value,
        k: newCommentText.value,
        l: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        m: common_vendor.p({
          type: "paperplane-filled",
          size: "22",
          color: "#ffff7f"
        }),
        n: newCommentText.value.trim().length > 0 ? 1 : "",
        o: common_vendor.o(handleSend),
        p: keyboardHeight.value + "px",
        q: copyMenu.show
      }, copyMenu.show ? {
        r: common_vendor.o(executeCopy),
        s: common_vendor.o(($event) => copyMenu.show = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3a461f42"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/comment-page/comment-page.js.map
