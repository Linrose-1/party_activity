"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
require("../../utils/feedback.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup + PointsFeedbackPopup)();
}
const PointsFeedbackPopup = () => "../../components/PointsFeedbackPopup.js";
const defaultAvatarUrl = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "home-commercialDetail",
  setup(__props) {
    const hasDataChanged = common_vendor.ref(false);
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
      video: "",
      tags: [],
      likes: 0,
      dislikes: 0,
      userAction: null,
      saved: false,
      isFollowedUser: false,
      cardFlag: true,
      commentFlag: true,
      businessCoverImageUrl: "",
      postType: 0
    });
    const comments = common_vendor.ref([]);
    const newCommentText = common_vendor.ref("");
    const replyToCommentId = common_vendor.ref(0);
    const replyToNickname = common_vendor.ref("");
    const isAnonymous = common_vendor.ref(false);
    const pointsPopup = common_vendor.ref(null);
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const keyboardHeight = common_vendor.ref(0);
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
      if (options.scrollTo === "comments") {
        common_vendor.onReady(() => {
          scrollToCommentsSection();
        });
      }
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:321", `✅ [商机详情页] 在 onLoad 中捕获到 options: ${JSON.stringify(options)}`);
      if (options && options.inviteCode) {
        const inviteCode = options.inviteCode;
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:324", `✅ [商机详情页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (options && options.id) {
        postId.value = options.id;
        getBusinessOpportunitiesDetail();
      } else {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:334", "未接收到商机ID");
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
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:349", "用户点击了自己的分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:353", "其他用户点击了分享链接，且已登录，准备加分。");
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:359", "用户点击了分享链接，但尚未登录。暂存 sharerId 和 bizId。");
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
      common_vendor.index.onKeyboardHeightChange((res) => {
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:379", "键盘高度变化:", res.height);
        keyboardHeight.value = res.height;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    common_vendor.onBackPress((options) => {
      if (hasDataChanged.value) {
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:395", "详情页数据已变更，发出通知: postUpdated");
        common_vendor.index.$emit("postUpdated");
      }
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
    const scrollToCommentsSection = () => {
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(".comments-section").boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res && res[0] && res[1]) {
            const elementTop = res[0].top;
            const scrollTop = res[1].scrollTop;
            const finalScrollTop = scrollTop + elementTop;
            common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:448", `准备滚动到评论区, 计算位置: ${finalScrollTop}`);
            common_vendor.index.pageScrollTo({
              scrollTop: finalScrollTop,
              duration: 300
            });
          } else {
            common_vendor.index.__f__("warn", "at packages/home-commercialDetail/home-commercialDetail.vue:454", "无法找到 .comments-section 元素进行滚动");
          }
        });
      }, 100);
    };
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:462", "触发分享给好友", res);
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      const inviteCode = utils_user.getInviteCode();
      let sharePath = `/packages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`;
      if (sharerId) {
        sharePath += `&sharerId=${sharerId}`;
      }
      if (inviteCode) {
        sharePath += `&inviteCode=${inviteCode}`;
      }
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:484", "分享商机（好友），携带邀请码:", inviteCode);
      let shareImageUrl = "https://img.gofor.club/logo_share.jpg";
      if (postDetail.businessCoverImageUrl) {
        shareImageUrl = postDetail.businessCoverImageUrl;
      } else if (postDetail.images && postDetail.images.length > 0) {
        shareImageUrl = postDetail.images[0];
      }
      return {
        title: finalTitle,
        path: sharePath,
        // 使用拼接后的路径
        imageUrl: shareImageUrl
        // imageUrl: postDetail.images.length > 0 ? postDetail.images[0] : 'https://img.gofor.club/logo_share.jpg'
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:507", "触发分享到朋友圈");
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      const inviteCode = utils_user.getInviteCode();
      postDetail.images.length > 0 ? postDetail.images[0] : "https://img.gofor.club/logo_share.jpg";
      let queryString = `id=${postDetail.id}&from=timeline`;
      if (sharerId) {
        queryString += `&sharerId=${sharerId}`;
      }
      if (inviteCode) {
        queryString += `&inviteCode=${inviteCode}`;
      }
      let shareImageUrl = "https://img.gofor.club/logo_share.jpg";
      if (postDetail.businessCoverImageUrl) {
        shareImageUrl = postDetail.businessCoverImageUrl;
      } else if (postDetail.images && postDetail.images.length > 0) {
        shareImageUrl = postDetail.images[0];
      }
      return {
        title: finalTitle,
        query: queryString,
        // 使用拼接后的 query
        imageUrl: shareImageUrl
      };
    });
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:556", `准备为分享者 (ID: ${sharerId}) 增加贡分, 关联商机ID: ${bizId}`);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:570", "调用分享加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:572", `成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
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
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:586", "商机详情", result);
        if (result && !result.error && result.data) {
          const item = result.data;
          postDetail.id = item.id;
          postDetail.content = item.postContent;
          postDetail.postTitle = item.postTitle;
          postDetail.video = item.postVideo || "";
          postDetail.businessCoverImageUrl = item.businessCoverImageUrl || "";
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
          postDetail.postType = item.postType || 0;
          if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
            showFollowButton.value = true;
          }
          if (item.checkContribution === 1) {
            setTimeout(() => {
              if (pointsPopup.value) {
                pointsPopup.value.show("阅读商机详情", 10);
              }
            }, 500);
          }
          getCommentList();
        } else {
          common_vendor.index.showToast({
            title: "获取详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:629", "获取商机详情失败:", error);
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
        const isAnon = comment.anonymous === 1;
        const displayName = isAnon ? "匿名用户" : userVO.nickname || "匿名用户";
        const displayAvatar = isAnon ? "/static/icon/default-avatar.png" : userVO.avatar;
        let displayText = comment.content;
        if (replyToUser) {
          displayText = `回复 @${replyToUser}: ${displayText}`;
        }
        flatList.push({
          id: comment.id,
          userId: comment.userId,
          user: displayName,
          // 使用处理后的名字
          avatar: displayAvatar,
          // 使用处理后的头像
          time: formatTimestamp(comment.createTime),
          text: displayText,
          parentId: comment.parentId,
          anonymous: isAnon,
          // 【新增】保存匿名状态
          // 【新增】保存原始昵称，供子评论回复时引用（如果匿名，子评论回复时也应显示“回复 @匿名用户”）
          rawNickname: displayName
        });
        if (comment.childrenList && comment.childrenList.length > 0) {
          const childComments = flattenComments(comment.childrenList, displayName);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:694", "请求评论列表异常:", error);
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
          content,
          anonymous: isAnonymous.value ? 1 : 0
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
          const currentTotalCount = comments.value.length;
          common_vendor.index.$emit("postInteractionChanged", {
            postId: postId.value,
            type: "comment",
            totalCount: currentTotalCount
            // 直接告诉首页现在的总数是多少
          });
          isAnonymous.value = false;
        } else {
          common_vendor.index.showToast({
            title: ((_a = result.error) == null ? void 0 : _a.message) || "评论失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:768", "创建评论异常:", error);
        common_vendor.index.showToast({
          title: "评论失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const deleteComment = (commentId) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除这条评论吗？",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            const {
              error
            } = await utils_request.request(`/app-api/member/comment/delete?id=${commentId}`, {
              method: "DELETE"
              // data: {} 
            });
            common_vendor.index.hideLoading();
            if (!error) {
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              getCommentList();
            } else {
              common_vendor.index.showToast({
                title: error || "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const toggleAction = async (post, clickedAction) => {
      if (isActionInProgress.value)
        return;
      isActionInProgress.value = true;
      const originalAction = post.userAction;
      const originalLikes = post.likes;
      const originalDislikes = post.dislikes;
      if (post.userAction === clickedAction) {
        post.userAction = null;
        if (clickedAction === "like")
          post.likes--;
        else
          post.dislikes--;
      } else {
        if (clickedAction === "like") {
          post.likes++;
          if (originalAction === "dislike")
            post.dislikes--;
        } else {
          post.dislikes++;
          if (originalAction === "like")
            post.likes--;
        }
        post.userAction = clickedAction;
      }
      try {
        const {
          error
        } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: post.id,
            targetType: "post",
            action: clickedAction
          }
        });
        if (!error) {
          hasDataChanged.value = true;
          common_vendor.index.$emit("postInteractionChanged", {
            postId: post.id,
            type: "action",
            userAction: post.userAction,
            likes: post.likes,
            dislikes: post.dislikes
          });
        }
        if (error) {
          post.userAction = originalAction;
          post.likes = originalLikes;
          post.dislikes = originalDislikes;
          common_vendor.index.showToast({
            title: `操作失败: ${error}`,
            icon: "none"
          });
        }
      } catch (err) {
        post.userAction = originalAction;
        post.likes = originalLikes;
        post.dislikes = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
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
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: requestData
        });
        if (!error) {
          hasDataChanged.value = true;
          common_vendor.index.showToast({
            title: successMessage,
            icon: "success"
          });
          common_vendor.index.$emit("userFollowStatusChanged", {
            userId: post.userId,
            isFollowed: post.isFollowedUser
          });
        } else {
          throw new Error(error);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:948", "关注/取关用户异常:", err);
        post.isFollowedUser = originalFollowState;
        common_vendor.index.showToast({
          title: typeof err === "string" ? err : "操作失败，请重试",
          icon: "none"
        });
      } finally {
        setTimeout(() => {
          isActionInProgress.value = false;
        }, 500);
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
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: requestData
        });
        if (!error) {
          hasDataChanged.value = true;
          common_vendor.index.showToast({
            title: successMessage,
            icon: "success"
          });
          common_vendor.index.$emit("postInteractionChanged", {
            postId: post.id,
            type: "save",
            isSaved: post.saved
          });
        } else {
          throw new Error(error);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1015", "收藏/取消收藏商机异常:", err);
        post.saved = originalSavedState;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        setTimeout(() => {
          isActionInProgress.value = false;
        }, 500);
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
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}`;
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
    const copyMenu = common_vendor.reactive({
      show: false,
      text: ""
      // 准备要复制的文本
    });
    const handleLongPress = (textToCopy) => {
      if (!textToCopy)
        return;
      copyMenu.text = textToCopy;
      copyMenu.show = true;
    };
    const executeCopy = () => {
      if (!copyMenu.text)
        return;
      common_vendor.index.setClipboardData({
        data: copyMenu.text,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制",
            icon: "none"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1127", "setClipboardData failed in detail page:", err);
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        },
        complete: () => {
          hideCopyMenu();
        }
      });
    };
    const hideCopyMenu = () => {
      copyMenu.show = false;
      copyMenu.text = "";
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
          size: "12",
          color: "#e74c3c"
        }),
        l: common_vendor.o(deletePost)
      } : {}, {
        j: loggedInUserId.value && loggedInUserId.value === postDetail.userId,
        m: postDetail.postType == 1
      }, postDetail.postType == 1 ? {} : postDetail.postType == 3 ? {} : {}, {
        n: postDetail.postType == 3,
        o: common_vendor.t(postDetail.postTitle),
        p: common_vendor.o(($event) => handleLongPress(postDetail.postTitle)),
        q: common_vendor.t(postDetail.content),
        r: common_vendor.o(($event) => handleLongPress(postDetail.content)),
        s: postDetail.video
      }, postDetail.video ? {
        t: postDetail.video
      } : postDetail.images && postDetail.images.length ? {
        w: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: imgIndex,
            c: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex)
          };
        }),
        x: common_vendor.n("images-count-" + postDetail.images.length)
      } : {}, {
        v: postDetail.images && postDetail.images.length,
        y: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        z: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        A: common_vendor.t(postDetail.likes),
        B: postDetail.userAction === "like" ? 1 : "",
        C: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        D: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        E: common_vendor.t(postDetail.dislikes),
        F: postDetail.userAction === "dislike" ? 1 : "",
        G: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        H: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        I: common_vendor.o(openSharePopup),
        J: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        K: common_vendor.t(postDetail.saved ? "已收藏" : "收藏"),
        L: postDetail.saved ? 1 : "",
        M: common_vendor.o(($event) => toggleBookmark(postDetail)),
        N: postDetail.commentFlag
      }, postDetail.commentFlag ? common_vendor.e({
        O: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        P: common_vendor.t(comments.value.length),
        Q: common_vendor.f(comments.value, (comment, k0, i0) => {
          return common_vendor.e({
            a: comment.avatar,
            b: common_vendor.o(($event) => !comment.anonymous && navigateToBusinessCard({
              id: comment.userId,
              name: comment.user,
              avatar: comment.avatar
            }), comment.id),
            c: common_vendor.t(comment.user || "匿名用户"),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.text),
            f: "8303b14f-7-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: loggedInUserId.value == comment.userId
          }, loggedInUserId.value == comment.userId ? {
            i: "8303b14f-8-" + i0,
            j: common_vendor.p({
              type: "trash",
              size: "14",
              color: "#999"
            }),
            k: common_vendor.o(($event) => deleteComment(comment.id), comment.id)
          } : {}, {
            l: comment.id,
            m: comment.parentId !== 0 ? 1 : ""
          });
        }),
        R: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        S: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        T: common_vendor.p({
          type: isAnonymous.value ? "eye-slash-filled" : "eye-filled",
          size: "18",
          color: isAnonymous.value ? "#FF6A00" : "#999"
        }),
        U: common_vendor.t(isAnonymous.value ? "匿名" : "显名"),
        V: isAnonymous.value ? 1 : "",
        W: common_vendor.o(($event) => isAnonymous.value = !isAnonymous.value),
        X: commentInputPlaceholder.value,
        Y: newCommentText.value,
        Z: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        aa: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#fff"
        }),
        ab: newCommentText.value.trim().length > 0 ? 1 : "",
        ac: common_vendor.o(addComment),
        ad: keyboardHeight.value + "px"
      }) : {
        ae: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#999"
        })
      }, {
        af: customShareTitle.value,
        ag: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        ah: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        ai: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        aj: common_vendor.o(guideShareTimeline),
        ak: common_vendor.o(closeSharePopup),
        al: common_vendor.sr(sharePopup, "8303b14f-12", {
          "k": "sharePopup"
        }),
        am: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        an: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        ao: common_assets._imports_0$2,
        ap: common_vendor.o(hideTimelineGuide)
      } : {}, {
        aq: copyMenu.show
      }, copyMenu.show ? {
        ar: common_vendor.o(executeCopy),
        as: common_vendor.o(() => {
        }),
        at: common_vendor.o(hideCopyMenu)
      } : {}, {
        av: common_vendor.sr(pointsPopup, "8303b14f-15", {
          "k": "pointsPopup"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8303b14f"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/home-commercialDetail/home-commercialDetail.js.map
