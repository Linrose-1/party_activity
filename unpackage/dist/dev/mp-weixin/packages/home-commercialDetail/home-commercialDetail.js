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
    const showInterestSuccessModal = common_vendor.ref(false);
    const partnerTypeMap = {
      "1": "求贤",
      "2": "找合伙人",
      "3": "寻资源",
      "4": "其他"
    };
    const urgentLevelText = (level) => {
      const map = {
        1: "普通",
        2: "紧急",
        3: "特急"
      };
      return map[level] || "";
    };
    const hasInvestmentContent = (obj) => {
      return obj && Object.keys(obj).length > 0;
    };
    const postDetail = common_vendor.reactive({
      id: null,
      user: "",
      userId: null,
      avatar: "",
      enterpriseId: null,
      isEnterpriseSource: false,
      isEntVerified: false,
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
      postType: 0,
      // ===== 猎伙专属字段 =====
      urgentLevel: null,
      // 紧急程度：1普通 2紧急 3特急
      partnerTypeLabels: [],
      // 猎伙类型标签数组（供展示用）
      expectedInvestmentObj: null,
      // 预期投入（解析后的对象）
      interestCount: 0,
      // 感兴趣人数
      isInterested: false
      // 当前用户是否已表达感兴趣
    });
    const viewerList = common_vendor.ref([]);
    const viewerTotal = common_vendor.ref(0);
    const comments = common_vendor.ref([]);
    const newCommentText = common_vendor.ref("");
    const replyToCommentId = common_vendor.ref(0);
    const replyToNickname = common_vendor.ref("");
    const targetCommentId = common_vendor.ref(null);
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:445", `✅ [商机详情页] onLoad options: ${JSON.stringify(options)}`);
      if (options && options.inviteCode) {
        common_vendor.index.setStorageSync("pendingInviteCode", options.inviteCode);
      }
      if (options && options.commentId) {
        targetCommentId.value = options.commentId;
      }
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (options && options.id) {
        postId.value = options.id;
        getBusinessOpportunitiesDetail();
      } else {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:460", "未接收到商机ID");
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
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:473", "用户点击了自己的分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId
          });
        }
      }
      common_vendor.index.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onMounted(() => {
      common_vendor.index.onKeyboardHeightChange((res) => {
        keyboardHeight.value = res.height;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    common_vendor.onBackPress(() => {
      if (hasDataChanged.value) {
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
    common_vendor.onShareAppMessage((res) => {
      closeSharePopup();
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      const inviteCode = utils_user.getInviteCode();
      let sharePath = `/packages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`;
      if (sharerId)
        sharePath += `&sharerId=${sharerId}`;
      if (inviteCode)
        sharePath += `&inviteCode=${inviteCode}`;
      let shareImageUrl = "https://img.gofor.club/logo_share.jpg";
      if (postDetail.businessCoverImageUrl)
        shareImageUrl = postDetail.businessCoverImageUrl;
      else if (postDetail.images && postDetail.images.length > 0)
        shareImageUrl = postDetail.images[0];
      return {
        title: finalTitle,
        path: sharePath,
        imageUrl: shareImageUrl
      };
    });
    common_vendor.onShareTimeline(() => {
      const sharerId = common_vendor.index.getStorageSync("userId");
      const finalTitle = customShareTitle.value || postDetail.postTitle || "发现一个商机，快来看看吧！";
      const inviteCode = utils_user.getInviteCode();
      let queryString = `id=${postDetail.id}&from=timeline`;
      if (sharerId)
        queryString += `&sharerId=${sharerId}`;
      if (inviteCode)
        queryString += `&inviteCode=${inviteCode}`;
      let shareImageUrl = "https://img.gofor.club/logo_share.jpg";
      if (postDetail.businessCoverImageUrl)
        shareImageUrl = postDetail.businessCoverImageUrl;
      else if (postDetail.images && postDetail.images.length > 0)
        shareImageUrl = postDetail.images[0];
      return {
        title: finalTitle,
        query: queryString,
        imageUrl: shareImageUrl
      };
    });
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      const {
        error
      } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 32,
          shareUserId: sharerId,
          bizId
        }
      });
      if (error)
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:580", "调用分享加分接口失败:", error);
    };
    const getBusinessOpportunitiesDetail = async () => {
      var _a, _b, _c;
      isLoading.value = true;
      showFollowButton.value = false;
      try {
        const result = await utils_request.request("/app-api/member/business-opportunities/get", {
          method: "GET",
          data: {
            id: postId.value
          }
        });
        if (result && !result.error && result.data) {
          const item = result.data;
          const isEnt = item.isEnterprise === 1 && item.enterpriseInfo;
          postDetail.id = item.id;
          postDetail.userId = item.userId;
          postDetail.isEnterpriseSource = !!isEnt;
          postDetail.enterpriseId = isEnt ? item.enterpriseInfo.id : null;
          postDetail.user = isEnt ? item.enterpriseInfo.enterpriseName : ((_a = item.memberUser) == null ? void 0 : _a.nickname) || "匿名用户";
          postDetail.avatar = isEnt ? item.enterpriseInfo.logoUrl : ((_b = item.memberUser) == null ? void 0 : _b.avatar) || defaultAvatarUrl;
          postDetail.isEntVerified = isEnt && item.enterpriseInfo.status === 3;
          postDetail.isIdVerified = !isEnt && ((_c = item.memberUser) == null ? void 0 : _c.idCert) === 1;
          postDetail.content = item.postContent;
          postDetail.postTitle = item.postTitle;
          postDetail.video = item.postVideo || "";
          postDetail.businessCoverImageUrl = item.businessCoverImageUrl || "";
          postDetail.images = item.postImg ? String(item.postImg).split(",").filter((img) => img) : [];
          postDetail.likes = item.likesCount || 0;
          postDetail.dislikes = item.dislikesCount || 0;
          postDetail.time = formatTimestamp(item.createTime);
          postDetail.saved = item.followFlag === 1;
          postDetail.isFollowedUser = item.followUserFlag === 1;
          postDetail.userAction = item.userLikeStr || null;
          postDetail.cardFlag = item.cardFlag;
          postDetail.isReadTrace = item.isReadTrace;
          postDetail.commentFlag = item.commentFlag;
          postDetail.postType = item.postType || 0;
          postDetail.tags = item.tags || [];
          if (item.postType == 1) {
            postDetail.urgentLevel = item.urgentLevel || null;
            postDetail.partnerTypeLabels = item.partnerTypes ? item.partnerTypes.split(",").filter((v) => v).map((v) => partnerTypeMap[v] || v) : [];
            if (item.expectedInvestment) {
              try {
                postDetail.expectedInvestmentObj = JSON.parse(item.expectedInvestment);
              } catch (e) {
                postDetail.expectedInvestmentObj = null;
              }
            } else {
              postDetail.expectedInvestmentObj = null;
            }
            postDetail.interestCount = item.interestCount || 0;
            postDetail.isInterested = item.userInterested === 1;
          }
          if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
            showFollowButton.value = true;
          }
          if (item.isReadTrace === 1) {
            getViewerList();
          }
          if (item.checkContribution === 1) {
            setTimeout(() => {
              if (pointsPopup.value)
                pointsPopup.value.show("阅读商机详情", 10);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:677", "获取商机详情失败:", error);
        common_vendor.index.showToast({
          title: "网络请求异常",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const getViewerList = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/target-view/page", {
        method: "GET",
        data: {
          targetId: postId.value,
          targetType: "post",
          pageNo: 1,
          pageSize: 7
        }
      });
      if (data) {
        viewerList.value = data.list || [];
        viewerTotal.value = data.total || 0;
      }
    };
    const toggleInterest = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (isActionInProgress.value)
        return;
      isActionInProgress.value = true;
      const wasInterested = postDetail.isInterested;
      postDetail.isInterested = !wasInterested;
      postDetail.interestCount += wasInterested ? -1 : 1;
      if (postDetail.interestCount < 0)
        postDetail.interestCount = 0;
      try {
        if (!wasInterested) {
          const {
            error
          } = await utils_request.request("/app-api/member/target-interest/express", {
            method: "POST",
            data: {
              id: 0,
              userId: common_vendor.index.getStorageSync("userId") || 0,
              targetType: "post",
              targetId: postDetail.id
            }
          });
          if (error)
            throw new Error(error);
          showInterestSuccessModal.value = true;
        } else {
          const {
            error
          } = await utils_request.request(
            `/app-api/member/target-interest/cancel?targetType=post&targetId=${postDetail.id}`,
            {
              method: "POST"
            }
          );
          if (error)
            throw new Error(error);
          common_vendor.index.showToast({
            title: "已取消",
            icon: "none"
          });
        }
      } catch (err) {
        postDetail.isInterested = wasInterested;
        postDetail.interestCount += wasInterested ? 1 : -1;
        common_vendor.index.showToast({
          title: String(err.message || "操作失败"),
          icon: "none"
        });
      } finally {
        setTimeout(() => {
          isActionInProgress.value = false;
        }, 500);
      }
    };
    const closeInterestModal = () => {
      showInterestSuccessModal.value = false;
    };
    const goToMoreLiehuo = () => {
      closeInterestModal();
      common_vendor.index.navigateBack();
    };
    const handleAuthorClick = () => {
      if (!postDetail.cardFlag) {
        return common_vendor.index.showToast({
          title: "作者已关闭名片查看",
          icon: "none"
        });
      }
      if (postDetail.isEnterpriseSource) {
        if (!postDetail.enterpriseId)
          return;
        common_vendor.index.navigateTo({
          url: `/packages/enterprise-card/enterprise-card?id=${postDetail.enterpriseId}`
        });
      } else {
        navigateToBusinessCard({
          id: postDetail.userId,
          name: postDetail.user,
          avatar: postDetail.avatar
        });
      }
    };
    const goToTraceList = () => {
      const id = typeof postId.value === "object" ? postId.value.id : postId.value;
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${id}&type=post`
      });
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
        if (replyToUser)
          displayText = `回复 @${replyToUser}: ${displayText}`;
        flatList.push({
          id: comment.id,
          userId: comment.userId,
          user: displayName,
          avatar: displayAvatar,
          time: formatTimestamp(comment.createTime),
          text: displayText,
          parentId: comment.parentId,
          anonymous: isAnon,
          rawNickname: displayName
        });
        if (comment.childrenList && comment.childrenList.length > 0) {
          flatList = flatList.concat(flattenComments(comment.childrenList, displayName));
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
          if (targetCommentId.value) {
            common_vendor.nextTick$1(() => {
              setTimeout(() => {
                scrollToTargetComment(targetCommentId.value);
              }, 200);
            });
          }
        } else {
          comments.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:871", "请求评论列表异常:", error);
      }
    };
    const replyComment = async (comment) => {
      if (!await utils_user.checkLoginGuard())
        return;
      replyToCommentId.value = comment.id;
      replyToNickname.value = comment.user;
      common_vendor.index.showToast({
        title: `正在回复 ${comment.user}`,
        icon: "none"
      });
    };
    const addComment = async () => {
      var _a;
      if (!await utils_user.checkLoginGuard())
        return;
      const content = newCommentText.value.trim();
      if (!content)
        return common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
      if (!loggedInUserId.value)
        return common_vendor.index.showToast({
          title: "请先登录再评论",
          icon: "none"
        });
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      try {
        const result = await utils_request.request("/app-api/member/comment/create", {
          method: "POST",
          data: {
            userId: loggedInUserId.value,
            targetId: postId.value,
            targetType: "post",
            parentId: replyToCommentId.value,
            content,
            anonymous: isAnonymous.value ? 1 : 0
          }
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
          });
          isAnonymous.value = false;
        } else {
          common_vendor.index.showToast({
            title: ((_a = result.error) == null ? void 0 : _a.message) || "评论失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:937", "创建评论异常:", error);
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
      if (!await utils_user.checkLoginGuard())
        return;
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
      if (!await utils_user.checkLoginGuard())
        return;
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value)
        return common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
      isActionInProgress.value = true;
      const originalFollowState = post.isFollowedUser;
      post.isFollowedUser = !post.isFollowedUser;
      const isAdding = post.isFollowedUser;
      const apiUrl = isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            userId: loggedInUserId.value,
            targetId: post.userId,
            targetType: "post_user"
          }
        });
        if (!error) {
          hasDataChanged.value = true;
          common_vendor.index.showToast({
            title: isAdding ? "关注成功" : "已取消关注",
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
      if (!await utils_user.checkLoginGuard())
        return;
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value)
        return common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
      isActionInProgress.value = true;
      const originalSavedState = post.saved;
      post.saved = !post.saved;
      const isAdding = post.saved;
      const apiUrl = isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            userId: loggedInUserId.value,
            targetId: post.id,
            targetType: "post"
          }
        });
        if (!error) {
          hasDataChanged.value = true;
          common_vendor.index.showToast({
            title: isAdding ? "收藏成功" : "已取消收藏",
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
              }
            });
            common_vendor.index.hideLoading();
            if (error)
              return common_vendor.index.showToast({
                title: "删除失败: " + error,
                icon: "none"
              });
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            setTimeout(() => common_vendor.index.navigateBack(), 1500);
          }
        }
      });
    };
    const handleEdit = () => {
      if (!postId.value)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/home-opportunitiesPublish/home-opportunitiesPublish?id=${postId.value}`
      });
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current]
      });
    };
    const navigateToBusinessCard = (user) => {
      if (!postDetail.cardFlag) {
        return common_vendor.index.showToast({
          title: "作者已关闭名片查看",
          icon: "none"
        });
      }
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const scrollToCommentsSection = () => {
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(".comments-section").boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res && res[0] && res[1]) {
            common_vendor.index.pageScrollTo({
              scrollTop: res[1].scrollTop + res[0].top,
              duration: 300
            });
          }
        });
      }, 100);
    };
    const scrollToTargetComment = (commentId) => {
      if (!commentId)
        return;
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(`[data-comment-id="${commentId}"]`).boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res && res[0] && res[1]) {
            common_vendor.index.pageScrollTo({
              scrollTop: res[1].scrollTop + res[0].top - 100,
              duration: 300,
              success: () => common_vendor.index.showToast({
                title: "已定位到该评论",
                icon: "none",
                duration: 1500
              })
            });
          } else {
            scrollToCommentsSection();
          }
        });
      }, 300);
    };
    const copyMenu = common_vendor.reactive({
      show: false,
      text: ""
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
        success: () => common_vendor.index.showToast({
          title: "已复制",
          icon: "none"
        }),
        fail: (err) => {
          common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1284", "setClipboardData failed:", err);
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        },
        complete: () => hideCopyMenu()
      });
    };
    const hideCopyMenu = () => {
      copyMenu.show = false;
      copyMenu.text = "";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: postDetail.avatar,
        b: postDetail.isEnterpriseSource ? 1 : "",
        c: postDetail.isEnterpriseSource
      }, postDetail.isEnterpriseSource ? {
        d: common_assets._imports_0
      } : {}, {
        e: common_vendor.t(postDetail.user),
        f: postDetail.isEntVerified
      }, postDetail.isEntVerified ? {
        g: common_vendor.p({
          type: "vip-filled",
          size: "10",
          color: "#fff"
        })
      } : {}, {
        h: postDetail.isIdVerified
      }, postDetail.isIdVerified ? {} : {}, {
        i: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        j: common_vendor.t(postDetail.time),
        k: loggedInUserId.value
      }, loggedInUserId.value ? common_vendor.e({
        l: loggedInUserId.value !== postDetail.userId
      }, loggedInUserId.value !== postDetail.userId ? {
        m: common_vendor.t(postDetail.isFollowedUser ? "已关注" : "关注"),
        n: postDetail.isFollowedUser ? 1 : "",
        o: common_vendor.o(($event) => toggleFollow(postDetail))
      } : {
        p: common_vendor.p({
          type: "compose",
          size: "14",
          color: "#FF6A00"
        }),
        q: common_vendor.o(handleEdit)
      }) : {}, {
        r: common_vendor.o(handleAuthorClick),
        s: postDetail.postType == 1
      }, postDetail.postType == 1 ? {} : postDetail.postType == 3 ? {} : {}, {
        t: postDetail.postType == 3,
        v: common_vendor.t(postDetail.postTitle),
        w: common_vendor.o(($event) => handleLongPress(postDetail.postTitle)),
        x: common_vendor.t(postDetail.content),
        y: common_vendor.o(($event) => handleLongPress(postDetail.content)),
        z: postDetail.postType == 1
      }, postDetail.postType == 1 ? common_vendor.e({
        A: postDetail.urgentLevel
      }, postDetail.urgentLevel ? {
        B: common_vendor.t(urgentLevelText(postDetail.urgentLevel)),
        C: postDetail.urgentLevel === 1 ? 1 : "",
        D: postDetail.urgentLevel === 2 ? 1 : "",
        E: postDetail.urgentLevel === 3 ? 1 : ""
      } : {}, {
        F: postDetail.partnerTypeLabels && postDetail.partnerTypeLabels.length
      }, postDetail.partnerTypeLabels && postDetail.partnerTypeLabels.length ? {
        G: common_vendor.f(postDetail.partnerTypeLabels, (label, idx, i0) => {
          return {
            a: common_vendor.t(label),
            b: idx
          };
        })
      } : {}, {
        H: postDetail.expectedInvestmentObj && hasInvestmentContent(postDetail.expectedInvestmentObj)
      }, postDetail.expectedInvestmentObj && hasInvestmentContent(postDetail.expectedInvestmentObj) ? {
        I: common_vendor.f(postDetail.expectedInvestmentObj, (val, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(val),
            c: key
          };
        })
      } : {}, {
        J: postDetail.interestCount > 0
      }, postDetail.interestCount > 0 ? {
        K: common_vendor.p({
          type: "person-filled",
          size: "14",
          color: "#1890FF"
        }),
        L: common_vendor.t(postDetail.interestCount)
      } : {}) : {}, {
        M: postDetail.video
      }, postDetail.video ? {
        N: postDetail.video
      } : postDetail.images && postDetail.images.length ? {
        P: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: imgIndex,
            c: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex)
          };
        }),
        Q: common_vendor.n("images-count-" + postDetail.images.length)
      } : {}, {
        O: postDetail.images && postDetail.images.length,
        R: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        S: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        T: common_vendor.t(postDetail.likes),
        U: postDetail.userAction === "like" ? 1 : "",
        V: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        W: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        X: common_vendor.t(postDetail.dislikes),
        Y: postDetail.userAction === "dislike" ? 1 : "",
        Z: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        aa: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        ab: common_vendor.o(openSharePopup),
        ac: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        ad: common_vendor.t(postDetail.saved ? "已收藏" : "收藏"),
        ae: postDetail.saved ? 1 : "",
        af: common_vendor.o(($event) => toggleBookmark(postDetail)),
        ag: loggedInUserId.value && loggedInUserId.value === postDetail.userId
      }, loggedInUserId.value && loggedInUserId.value === postDetail.userId ? {
        ah: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#e74c3c"
        }),
        ai: common_vendor.o(deletePost)
      } : {}, {
        aj: postDetail.postType == 1 && loggedInUserId.value && loggedInUserId.value !== postDetail.userId
      }, postDetail.postType == 1 && loggedInUserId.value && loggedInUserId.value !== postDetail.userId ? {
        ak: common_vendor.t(postDetail.isInterested ? "✅" : "🤝"),
        al: common_vendor.t(postDetail.isInterested ? "已表达兴趣" : "感兴趣"),
        am: postDetail.isInterested ? 1 : "",
        an: common_vendor.o(toggleInterest)
      } : {}, {
        ao: postDetail && postDetail.isReadTrace === 1 && viewerTotal.value > 0
      }, postDetail && postDetail.isReadTrace === 1 && viewerTotal.value > 0 ? common_vendor.e({
        ap: common_vendor.t(viewerTotal.value),
        aq: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        ar: common_vendor.o(goToTraceList),
        as: common_vendor.f(viewerList.value, (item, index, i0) => {
          return {
            a: item.memberUser.avatar,
            b: item.id
          };
        }),
        at: viewerTotal.value > 7
      }, viewerTotal.value > 7 ? {} : {}, {
        av: common_vendor.t(viewerTotal.value),
        aw: common_vendor.o(goToTraceList)
      }) : {}, {
        ax: postDetail.commentFlag
      }, postDetail.commentFlag ? common_vendor.e({
        ay: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        az: common_vendor.t(comments.value.length),
        aA: common_vendor.f(comments.value, (comment, k0, i0) => {
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
            f: "8303b14f-11-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: loggedInUserId.value == comment.userId
          }, loggedInUserId.value == comment.userId ? {
            i: "8303b14f-12-" + i0,
            j: common_vendor.p({
              type: "trash",
              size: "14",
              color: "#999"
            }),
            k: common_vendor.o(($event) => deleteComment(comment.id), comment.id)
          } : {}, {
            l: comment.id,
            m: comment.parentId !== 0 ? 1 : "",
            n: comment.id
          });
        }),
        aB: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        aC: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        aD: common_vendor.p({
          type: isAnonymous.value ? "eye-slash-filled" : "eye-filled",
          size: "18",
          color: isAnonymous.value ? "#FF6A00" : "#999"
        }),
        aE: common_vendor.t(isAnonymous.value ? "匿名" : "显名"),
        aF: isAnonymous.value ? 1 : "",
        aG: common_vendor.o(($event) => isAnonymous.value = !isAnonymous.value),
        aH: commentInputPlaceholder.value,
        aI: newCommentText.value,
        aJ: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        aK: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#fff"
        }),
        aL: newCommentText.value.trim().length > 0 ? 1 : "",
        aM: common_vendor.o(addComment),
        aN: keyboardHeight.value + "px"
      }) : {
        aO: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#999"
        })
      }, {
        aP: customShareTitle.value,
        aQ: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        aR: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        aS: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        aT: common_vendor.o(guideShareTimeline),
        aU: common_vendor.o(closeSharePopup),
        aV: common_vendor.sr(sharePopup, "8303b14f-16", {
          "k": "sharePopup"
        }),
        aW: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        aX: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        aY: common_assets._imports_0$3,
        aZ: common_vendor.o(hideTimelineGuide)
      } : {}, {
        ba: copyMenu.show
      }, copyMenu.show ? {
        bb: common_vendor.o(executeCopy),
        bc: common_vendor.o(() => {
        }),
        bd: common_vendor.o(hideCopyMenu)
      } : {}, {
        be: showInterestSuccessModal.value
      }, showInterestSuccessModal.value ? {
        bf: common_vendor.o(closeInterestModal),
        bg: common_vendor.o(goToMoreLiehuo),
        bh: common_vendor.o(() => {
        }),
        bi: common_vendor.o(closeInterestModal)
      } : {}, {
        bj: common_vendor.sr(pointsPopup, "8303b14f-19", {
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
