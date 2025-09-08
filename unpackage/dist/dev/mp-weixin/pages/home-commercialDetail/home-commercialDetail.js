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
const defaultAvatarUrl = "/static/icon/default-avatar.png";
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
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:234", "未接收到商机ID");
        common_vendor.index.showToast({
          title: "加载失败，无效的商机",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
      if (options && options.sharerId) {
        const sharerId = options.sharerId;
        const bizId = options.id;
        if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
          common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:249", "用户点击了自己的分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:253", "其他用户点击了分享链接，且已登录，准备加分。");
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:259", "用户点击了分享链接，但尚未登录。暂存 sharerId 和 bizId。");
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId
          });
        }
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
      common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:311", "触发分享给好友", res);
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      let sharePath = `/pages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`;
      if (sharerId) {
        sharePath += `&sharerId=${sharerId}`;
      }
      return {
        title: finalTitle,
        path: sharePath,
        // 使用拼接后的路径
        imageUrl: postDetail.images.length > 0 ? postDetail.images[0] : "/static/logo.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:336", "触发分享到朋友圈");
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      const finalImageUrl = postDetail.images.length > 0 ? postDetail.images[0] : "/static/logo.png";
      let queryString = `id=${postDetail.id}&from=timeline`;
      if (sharerId) {
        queryString += `&sharerId=${sharerId}`;
      }
      return {
        title: finalTitle,
        query: queryString,
        // 使用拼接后的 query
        imageUrl: finalImageUrl
      };
    });
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:366", `准备为分享者 (ID: ${sharerId}) 增加贡分, 关联商机ID: ${bizId}`);
      const {
        error
      } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 32,
          // 32 代表 "分享商机奖励"
          shareUserId: sharerId,
          bizId
          // 新增：传递关联的商机ID
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:380", "调用分享加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:382", `成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
      }
    };
    const getBusinessOpportunitiesDetail = async () => {
      var _a, _b;
      isLoading.value = true;
      showFollowButton.value = false;
      try {
        const result = await utils_request.request("/app-api/member/business-opportunities/get", {
          method: "GET",
          data: {
            id: postId.value
          }
        });
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:396", "商机详情", result);
        if (result && !result.error && result.data) {
          const item = result.data;
          postDetail.id = item.id;
          postDetail.content = item.postContent;
          postDetail.postTitle = item.postTitle;
          postDetail.images = item.postImg ? String(item.postImg).split(",").filter((img) => img) : [];
          postDetail.likes = item.likesCount || 0;
          postDetail.dislikes = item.dislikesCount || 0;
          postDetail.time = formatTimestamp(item.createTime);
          postDetail.user = ((_a = item.memberUser) == null ? void 0 : _a.nickname) || "匿名用户";
          postDetail.avatar = ((_b = item.memberUser) == null ? void 0 : _b.avatar) || defaultAvatarUrl;
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
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:427", "获取商机详情失败:", error);
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
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:478", "请求评论列表异常:", error);
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
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:538", "创建评论异常:", error);
        common_vendor.index.showToast({
          title: "评论失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
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
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:579", "点赞/踩/取消 操作, 请求:", requestData);
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
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:594", "点赞/踩操作异常:", error);
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
      const originalFollowState = post.isFollowedUser;
      post.isFollowedUser = !post.isFollowedUser;
      const isAdding = post.isFollowedUser;
      const apiUrl = isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      const successMessage = isAdding ? "关注成功" : "已取消关注";
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
          post.isFollowedUser = originalFollowState;
          common_vendor.index.showToast({
            title: result.error || "操作失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: successMessage,
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:660", "关注/取关用户异常:", error);
        post.isFollowedUser = originalFollowState;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
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
      const originalSavedState = post.saved;
      post.saved = !post.saved;
      const isAdding = post.saved;
      const apiUrl = isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      const successMessage = isAdding ? "收藏成功" : "已取消收藏";
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
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:710", "触发收藏", result);
        if (result && result.error) {
          post.saved = originalSavedState;
          common_vendor.index.showToast({
            title: result.error || "操作失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: successMessage,
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:728", "收藏/取消收藏商机异常:", error);
        post.saved = originalSavedState;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
      });
    };
    const navigateToBusinessCard = (user) => {
      if (!postDetail.cardFlag) {
        common_vendor.index.showToast({
          title: "作者已关闭名片查看",
          icon: "none"
        });
        return;
      }
      if (!user || !user.id) {
        common_vendor.index.showToast({
          title: "无法查看该用户主页",
          icon: "none"
        });
        return;
      }
      const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const deletePost = () => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "您确定要删除这条商机吗？删除后将无法恢复。",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            const {
              error
            } = await utils_request.request("/app-api/member/business-opportunities/delete", {
              method: "POST",
              data: {
                id: postDetail.id
                // 使用详情页的商机ID
              }
            });
            common_vendor.index.hideLoading();
            if (error) {
              common_vendor.index.showToast({
                title: "删除失败: " + error,
                icon: "none"
              });
              return;
            }
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: postDetail.avatar,
        b: common_vendor.o(($event) => navigateToBusinessCard({
          id: postDetail.userId,
          name: postDetail.user,
          avatar: postDetail.avatar
        })),
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
      } : loggedInUserId.value && loggedInUserId.value === postDetail.userId ? {
        k: common_vendor.p({
          type: "trash",
          size: "14",
          color: "#e74c3c"
        }),
        l: common_vendor.o(deletePost)
      } : {}, {
        j: loggedInUserId.value && loggedInUserId.value === postDetail.userId,
        m: common_vendor.t(postDetail.postTitle),
        n: common_vendor.t(postDetail.content),
        o: postDetail.images && postDetail.images.length
      }, postDetail.images && postDetail.images.length ? {
        p: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: imgIndex,
            c: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex)
          };
        }),
        q: postDetail.images.length === 1 ? "widthFix" : "aspectFill",
        r: common_vendor.n("images-count-" + postDetail.images.length)
      } : {}, {
        s: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        t: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        v: common_vendor.t(postDetail.likes),
        w: postDetail.userAction === "like" ? 1 : "",
        x: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        y: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        z: common_vendor.t(postDetail.dislikes),
        A: postDetail.userAction === "dislike" ? 1 : "",
        B: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        C: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        D: common_vendor.o(openSharePopup),
        E: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        F: common_vendor.t(postDetail.saved ? "已收藏" : "收藏"),
        G: postDetail.saved ? 1 : "",
        H: common_vendor.o(($event) => toggleBookmark(postDetail)),
        I: postDetail.commentFlag
      }, postDetail.commentFlag ? common_vendor.e({
        J: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        K: common_vendor.t(comments.value.length),
        L: common_vendor.f(comments.value, (comment, k0, i0) => {
          return {
            a: comment.avatar,
            b: common_vendor.o(($event) => navigateToBusinessCard({
              id: comment.userId,
              name: comment.user,
              avatar: comment.avatar
            }), comment.id),
            c: common_vendor.t(comment.user || "匿名用户"),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.text),
            f: "361e9b2c-7-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: comment.id,
            i: comment.parentId !== 0 ? 1 : ""
          };
        }),
        M: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        N: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        O: commentInputPlaceholder.value,
        P: common_vendor.o(addComment),
        Q: newCommentText.value,
        R: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        S: common_vendor.o(addComment)
      }) : {
        T: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#999"
        })
      }, {
        U: customShareTitle.value,
        V: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        W: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        X: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        Y: common_vendor.o(guideShareTimeline),
        Z: common_vendor.o(closeSharePopup),
        aa: common_vendor.sr(sharePopup, "361e9b2c-9", {
          "k": "sharePopup"
        }),
        ab: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        ac: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        ad: common_assets._imports_0,
        ae: common_vendor.o(hideTimelineGuide)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-361e9b2c"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-commercialDetail/home-commercialDetail.js.map
