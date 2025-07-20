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
  __name: "home-commercialDetail",
  setup(__props) {
    const isLoading = common_vendor.ref(true);
    const postId = common_vendor.ref(null);
    const loggedInUserId = common_vendor.ref(null);
    const showFollowButton = common_vendor.ref(false);
    const isActionInProgress = common_vendor.ref(false);
    const postDetail = common_vendor.reactive({
      id: null,
      user: "",
      userId: null,
      time: "",
      content: "",
      images: [],
      tags: [],
      likes: 0,
      dislikes: 0,
      userAction: null,
      saved: false,
      isFollowedUser: false,
      cardFlag: true,
      commentFlag: true
    });
    const comments = common_vendor.ref([]);
    const newCommentText = common_vendor.ref("");
    const replyToCommentId = common_vendor.ref(0);
    const replyToNickname = common_vendor.ref("");
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const commentInputPlaceholder = common_vendor.computed(() => {
      return replyToNickname.value ? `回复 @${replyToNickname.value}` : "发表你的评论...";
    });
    function formatTimestamp(timestamp) {
      if (!timestamp)
        return "刚刚";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    }
    common_vendor.onLoad((options) => {
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (options && options.id) {
        postId.value = options.id;
        getBusinessOpportunitiesDetail();
      } else {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:219", "未接收到商机ID");
        common_vendor.index.showToast({
          title: "加载失败，无效的商机",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onMounted(() => {
    });
    const openSharePopup = () => {
      customShareTitle.value = postDetail.postTitle || "发现一个商机，快来看看吧！";
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
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:269", "触发分享给好友", res);
      closeSharePopup();
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      return {
        title: finalTitle,
        path: `/pages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`,
        imageUrl: postDetail.images.length > 0 ? postDetail.images[0] : "/static/logo.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:285", "触发分享到朋友圈");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      const finalImageUrl = postDetail.images.length > 0 ? postDetail.images[0] : "/static/logo.png";
      return {
        title: finalTitle,
        // query参数会附加到当前页面路径后面
        query: `id=${postDetail.id}&from=timeline`,
        imageUrl: finalImageUrl
      };
    });
    const getBusinessOpportunitiesDetail = async () => {
      isLoading.value = true;
      showFollowButton.value = false;
      try {
        const result = await utils_request.request("/app-api/member/business-opportunities/get", {
          method: "GET",
          data: {
            id: postId.value
          }
        });
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:315", "商机详情", result);
        if (result && !result.error && result.data) {
          const item = result.data;
          postDetail.id = item.id;
          postDetail.content = item.postContent;
          postDetail.postTitle = item.postTitle;
          postDetail.images = item.postImg ? String(item.postImg).split(",").filter((img) => img) : [];
          postDetail.likes = item.likesCount || 0;
          postDetail.dislikes = item.dislikesCount || 0;
          postDetail.time = formatTimestamp(item.createTime);
          postDetail.user = item.memberUser.nickname || "匿名用户";
          postDetail.avatar = item.memberUser.avatar;
          postDetail.userId = item.userId;
          postDetail.saved = item.followFlag === 1;
          postDetail.isFollowedUser = item.followUserFlag === 1;
          postDetail.userAction = item.userLikeStr || null;
          postDetail.cardFlag = item.cardFlag;
          postDetail.commentFlag = item.commentFlag;
          if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
            showFollowButton.value = true;
          }
          getCommentList();
        } else {
          common_vendor.index.showToast({
            title: "获取详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:346", "获取商机详情失败:", error);
        common_vendor.index.showToast({
          title: "网络请求异常",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const flattenComments = (apiComments, replyToUser = null) => {
      let flatList = [];
      if (!Array.isArray(apiComments))
        return flatList;
      apiComments.forEach((comment) => {
        const userVO = comment.memberUserBaseVO || {};
        let displayText = comment.content;
        if (replyToUser) {
          displayText = `回复 @${replyToUser}: ${displayText}`;
        }
        flatList.push({
          id: comment.id,
          userId: comment.userId,
          user: userVO.nickname || "匿名用户",
          avatar: userVO.avatar,
          time: formatTimestamp(comment.createTime),
          text: displayText,
          parentId: comment.parentId
        });
        if (comment.childrenList && comment.childrenList.length > 0) {
          const childComments = flattenComments(comment.childrenList, userVO.nickname || "匿名用户");
          flatList = flatList.concat(childComments);
        }
      });
      return flatList;
    };
    const getCommentList = async () => {
      try {
        const result = await utils_request.request("/app-api/member/comment/select-type-target-id", {
          method: "GET",
          data: {
            targetType: "post",
            targetId: postId.value
          }
        });
        if (result && !result.error && Array.isArray(result.data)) {
          comments.value = flattenComments(result.data);
        } else {
          comments.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:397", "请求评论列表异常:", error);
      }
    };
    const replyComment = (comment) => {
      replyToCommentId.value = comment.id;
      replyToNickname.value = comment.user;
      common_vendor.index.showToast({
        title: `正在回复 ${comment.user}`,
        icon: "none"
      });
    };
    const addComment = async () => {
      var _a;
      const content = newCommentText.value.trim();
      if (!content) {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
        return;
      }
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录再评论",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: postId.value,
          targetType: "post",
          parentId: replyToCommentId.value,
          content
        };
        const result = await utils_request.request("/app-api/member/comment/create", {
          method: "POST",
          data: requestData
        });
        if (result && !result.error) {
          common_vendor.index.showToast({
            title: "评论成功",
            icon: "success"
          });
          newCommentText.value = "";
          replyToCommentId.value = 0;
          replyToNickname.value = "";
          await getCommentList();
        } else {
          common_vendor.index.showToast({
            title: ((_a = result.error) == null ? void 0 : _a.message) || "评论失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:457", "创建评论异常:", error);
        common_vendor.index.showToast({
          title: "评论失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const toggleFollow = async (post) => {
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      const isAdding = !post.isFollowedUser;
      const apiUrl = isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      common_vendor.index.showLoading({
        title: "请稍候..."
      });
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: post.userId,
          targetType: "post_user"
        };
        const result = await utils_request.request(apiUrl, {
          method: "POST",
          data: requestData
        });
        if (result && result.error) {
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:504", "关注/取关用户异常:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
        await getBusinessOpportunitiesDetail();
        isActionInProgress.value = false;
      }
    };
    const toggleAction = async (item, clickedAction) => {
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      common_vendor.index.showLoading({
        title: "请稍候..."
      });
      const apiActionToSend = item.userAction === clickedAction ? "" : clickedAction;
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: item.id,
          // 目标是商机的ID
          targetType: "post",
          // 类型是post
          action: apiActionToSend
          // 发送 'like', 'dislike', 或 ''
        };
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:545", "点赞/踩/取消 操作, 请求:", requestData);
        const result = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: requestData
        });
        if (result && result.error) {
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:560", "点赞/踩操作异常:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
        await getBusinessOpportunitiesDetail();
        isActionInProgress.value = false;
      }
    };
    const toggleBookmark = async (post) => {
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      const isAdding = !post.saved;
      const apiUrl = isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      common_vendor.index.showLoading({
        title: "请稍候..."
      });
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: post.id,
          targetType: "post"
        };
        const result = await utils_request.request(apiUrl, {
          method: "POST",
          data: requestData
        });
        if (result && result.error) {
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:611", "收藏/取消收藏商机异常:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
        await getBusinessOpportunitiesDetail();
        isActionInProgress.value = false;
      }
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
      });
    };
    const navigateToBusinessCard = (userId) => {
      if (!postDetail.cardFlag) {
        common_vendor.index.showToast({
          title: "作者已关闭名片查看",
          icon: "none"
        });
        return;
      }
      if (!userId) {
        common_vendor.index.showToast({
          title: "无法查看该用户主页",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/applicationBusinessCard/applicationBusinessCard?userId=${userId}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: postDetail.avatar,
        b: common_vendor.o(($event) => navigateToBusinessCard(postDetail.userId)),
        c: common_vendor.t(postDetail.user),
        d: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        e: common_vendor.t(postDetail.time),
        f: showFollowButton.value
      }, showFollowButton.value ? {
        g: common_vendor.t(postDetail.isFollowedUser ? "已关注" : "关注"),
        h: postDetail.isFollowedUser ? 1 : "",
        i: common_vendor.o(($event) => toggleFollow(postDetail))
      } : {}, {
        j: common_vendor.t(postDetail.postTitle),
        k: common_vendor.t(postDetail.content),
        l: postDetail.images && postDetail.images.length
      }, postDetail.images && postDetail.images.length ? {
        m: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex),
            c: imgIndex
          };
        })
      } : {}, {
        n: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        o: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        p: common_vendor.t(postDetail.likes),
        q: postDetail.userAction === "like" ? 1 : "",
        r: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        s: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        t: common_vendor.t(postDetail.dislikes),
        v: postDetail.userAction === "dislike" ? 1 : "",
        w: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        x: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        y: common_vendor.o(openSharePopup),
        z: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        A: common_vendor.t(postDetail.saved ? "已收藏" : "收藏"),
        B: postDetail.saved ? 1 : "",
        C: common_vendor.o(($event) => toggleBookmark(postDetail)),
        D: postDetail.commentFlag
      }, postDetail.commentFlag ? common_vendor.e({
        E: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        F: common_vendor.t(comments.value.length),
        G: common_vendor.f(comments.value, (comment, k0, i0) => {
          return {
            a: comment.avatar,
            b: common_vendor.o(($event) => navigateToBusinessCard(comment.userId), comment.id),
            c: common_vendor.t(comment.user || "匿名用户"),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.text),
            f: "361e9b2c-6-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: comment.id,
            i: comment.parentId !== 0 ? 1 : ""
          };
        }),
        H: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        I: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        J: commentInputPlaceholder.value,
        K: common_vendor.o(addComment),
        L: newCommentText.value,
        M: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        N: common_vendor.o(addComment)
      }) : {
        O: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#999"
        })
      }, {
        P: customShareTitle.value,
        Q: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        R: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        S: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        T: common_vendor.o(guideShareTimeline),
        U: common_vendor.o(closeSharePopup),
        V: common_vendor.sr(sharePopup, "361e9b2c-8", {
          "k": "sharePopup"
        }),
        W: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        X: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        Y: common_assets._imports_0,
        Z: common_vendor.o(hideTimelineGuide)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-361e9b2c"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-commercialDetail/home-commercialDetail.js.map
