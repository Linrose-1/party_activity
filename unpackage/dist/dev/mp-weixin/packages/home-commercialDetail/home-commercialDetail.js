"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
const utils_upload = require("../../utils/upload.js");
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
      "1": "求贤若渴",
      "2": "产品众筹",
      "3": "项目合作",
      "4": "其他合作",
      "5": "寻找资源"
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
      isInterested: false,
      // 当前用户是否已表达感兴趣
      targetViewNum: 0,
      // 总阅读人数
      hasSilentLoginUser: 0
      // 是否有静默用户查看
    });
    const imageUrls = common_vendor.ref([]);
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:492", `✅ [商机详情页] onLoad options: ${JSON.stringify(options)}`);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:507", "未接收到商机ID");
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
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:520", "用户点击了自己的分享链接，不计分。");
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:627", "调用分享加分接口失败:", error);
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
          const pubType = item.enterprisePublishType;
          postDetail.id = item.id;
          postDetail.userId = item.userId;
          postDetail.isEnterpriseSource = !!isEnt;
          postDetail.enterpriseId = isEnt ? item.enterpriseInfo.id : null;
          if (isEnt) {
            if (pubType === 1) {
              postDetail.user = item.enterpriseInfo.brandName || "未设置品牌名";
              postDetail.avatar = item.enterpriseInfo.logoUrl || defaultAvatarUrl;
            } else {
              postDetail.user = item.enterpriseInfo.enterpriseName || "未设置企业名";
              postDetail.avatar = item.enterpriseInfo.enterpriseLogo || item.enterpriseInfo.logoUrl || defaultAvatarUrl;
            }
          } else {
            postDetail.user = ((_a = item.memberUser) == null ? void 0 : _a.nickname) || "匿名用户";
            postDetail.avatar = ((_b = item.memberUser) == null ? void 0 : _b.avatar) || defaultAvatarUrl;
          }
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
          postDetail.targetViewNum = item.targetViewNum || 0;
          postDetail.hasSilentLoginUser = item.hasSilentLoginUser || 0;
          postDetail.commentFlag = item.commentFlag;
          postDetail.postType = item.postType || 0;
          postDetail.tags = item.tags || [];
          if (item.postType == 1 || item.postType == 2) {
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:744", "获取商机详情失败:", error);
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
    const goToHunterInteraction = () => {
      common_vendor.index.navigateTo({
        url: `/packages/interaction-message/interaction-message?targetId=${postDetail.id}`
      });
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
      const id = postDetail.id;
      const hasSilent = postDetail.hasSilentLoginUser || 0;
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${id}&type=post&hasSilent=${hasSilent}`
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
        let imageUrls2 = comment.imageUrls || [];
        if (Array.isArray(imageUrls2) && imageUrls2.length > 0) {
          if (typeof imageUrls2[0] === "string" && imageUrls2[0].startsWith('["') && imageUrls2[0].endsWith(
            '"]'
          )) {
            try {
              const parsed = JSON.parse(imageUrls2[0]);
              imageUrls2 = Array.isArray(parsed) ? parsed : imageUrls2;
            } catch (e) {
              common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:923", "解析imageUrls失败:", e);
            }
          }
        }
        flatList.push({
          id: comment.id,
          userId: comment.userId,
          user: displayName,
          avatar: displayAvatar,
          time: formatTimestamp(comment.createTime),
          text: displayText,
          parentId: comment.parentId,
          anonymous: isAnon,
          rawNickname: displayName,
          imageUrls: imageUrls2
          // 使用处理后的imageUrls
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
              scrollToTargetComment(targetCommentId.value);
            });
          }
        } else {
          comments.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:969", "请求评论列表异常:", error);
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
      if (!content && (!imageUrls.value || imageUrls.value.length === 0))
        return common_vendor.index.showToast({
          title: "评论内容或图片不能为空",
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
            imageUrls: imageUrls.value,
            // 添加图片URL数组
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
          imageUrls.value = [];
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1037", "创建评论异常:", error);
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
    const handleChooseImage = async () => {
      common_vendor.index.chooseImage({
        count: 1,
        // 限制为1张
        sourceType: ["album", "camera"],
        success: async (res) => {
          const validFiles = res.tempFiles.filter((file) => file.size <= 5 * 1024 * 1024);
          if (res.tempFiles.length > validFiles.length) {
            common_vendor.index.showToast({
              title: "部分文件过大(>5MB)，已忽略",
              icon: "none"
            });
          }
          if (validFiles.length === 0)
            return;
          common_vendor.index.showLoading({
            title: `正在上传...`,
            mask: true
          });
          const uploadPromises = validFiles.map((file) => utils_upload.uploadFile(file, {
            directory: "comment"
          }));
          const results = await Promise.all(uploadPromises);
          common_vendor.index.hideLoading();
          const successfulUrls = [];
          results.forEach((result) => {
            if (result.data)
              successfulUrls.push(result.data);
            else
              common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1112", "上传失败:", result.error);
          });
          imageUrls.value = successfulUrls;
          if (successfulUrls.length < validFiles.length) {
            common_vendor.index.showToast({
              title: "部分图片上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const removeImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            imageUrls.value.splice(index, 1);
          }
        }
      });
    };
    const previewImage = (urls, index) => {
      common_vendor.index.previewImage({
        urls,
        current: index,
        loop: true
      });
    };
    const previewCommentImage = (urls, index) => {
      common_vendor.index.previewImage({
        urls,
        current: index,
        loop: true
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
      let apiActionToSend = clickedAction;
      if (originalAction === clickedAction) {
        apiActionToSend = "cancel";
      }
      if (originalAction === clickedAction) {
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
            action: apiActionToSend
            // 【关键修改】：使用计算后的值
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
        } else {
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
    const previewBusinessImage = (urls, current) => {
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
        const idSelector = `[data-comment-id="${commentId}"]`;
        query.select(idSelector).boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res && res[0]) {
            common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:1523", "✅ 找到目标评论元素，准备滚动", res[0].top);
            common_vendor.index.pageScrollTo({
              // 目标位置 = 当前滚动位 + 元素相对顶部的距离 - 预留的偏移量(100rpx)
              scrollTop: res[1].scrollTop + res[0].top - 100,
              duration: 300
            });
            common_vendor.index.showToast({
              title: "已定位到该评论",
              icon: "none"
            });
          } else {
            common_vendor.index.__f__("warn", "at packages/home-commercialDetail/home-commercialDetail.vue:1537", "❌ 未找到评论元素，执行兜底：跳转到评论区顶部");
            scrollToCommentsSection();
          }
        });
      }, 600);
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
      }, postDetail.postType == 1 ? {} : postDetail.postType == 2 ? {} : postDetail.postType == 3 ? {} : {}, {
        t: postDetail.postType == 2,
        v: postDetail.postType == 3,
        w: common_vendor.t(postDetail.postTitle),
        x: common_vendor.t(postDetail.content),
        y: postDetail.postType == 1 || postDetail.postType == 2
      }, postDetail.postType == 1 || postDetail.postType == 2 ? common_vendor.e({
        z: postDetail.urgentLevel
      }, postDetail.urgentLevel ? {
        A: common_vendor.t(urgentLevelText(postDetail.urgentLevel)),
        B: postDetail.urgentLevel === 1 ? 1 : "",
        C: postDetail.urgentLevel === 2 ? 1 : "",
        D: postDetail.urgentLevel === 3 ? 1 : ""
      } : {}, {
        E: postDetail.partnerTypeLabels && postDetail.partnerTypeLabels.length
      }, postDetail.partnerTypeLabels && postDetail.partnerTypeLabels.length ? {
        F: common_vendor.f(postDetail.partnerTypeLabels, (label, idx, i0) => {
          return {
            a: common_vendor.t(label),
            b: idx
          };
        })
      } : {}, {
        G: postDetail.expectedInvestmentObj && hasInvestmentContent(postDetail.expectedInvestmentObj)
      }, postDetail.expectedInvestmentObj && hasInvestmentContent(postDetail.expectedInvestmentObj) ? {
        H: common_vendor.f(postDetail.expectedInvestmentObj, (val, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(val),
            c: key
          };
        })
      } : {}, {
        I: postDetail.interestCount > 0
      }, postDetail.interestCount > 0 ? {
        J: common_vendor.p({
          type: "person-filled",
          size: "14",
          color: "#1890FF"
        }),
        K: common_vendor.t(postDetail.interestCount)
      } : {}) : {}, {
        L: postDetail.video
      }, postDetail.video ? {
        M: postDetail.video
      } : postDetail.images && postDetail.images.length ? {
        O: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: imgIndex,
            c: common_vendor.o(($event) => previewBusinessImage(postDetail.images, imgIndex), imgIndex)
          };
        }),
        P: common_vendor.n("images-count-" + postDetail.images.length)
      } : {}, {
        N: postDetail.images && postDetail.images.length,
        Q: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        R: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        S: common_vendor.t(postDetail.likes),
        T: postDetail.userAction === "like" ? 1 : "",
        U: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        V: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        W: common_vendor.t(postDetail.dislikes),
        X: postDetail.userAction === "dislike" ? 1 : "",
        Y: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        Z: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        aa: common_vendor.o(openSharePopup),
        ab: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        ac: common_vendor.t(postDetail.saved ? "已收藏" : "收藏"),
        ad: postDetail.saved ? 1 : "",
        ae: common_vendor.o(($event) => toggleBookmark(postDetail)),
        af: loggedInUserId.value && loggedInUserId.value === postDetail.userId
      }, loggedInUserId.value && loggedInUserId.value === postDetail.userId ? {
        ag: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#e74c3c"
        }),
        ah: common_vendor.o(deletePost)
      } : {}, {
        ai: (postDetail.postType == 1 || postDetail.postType == 2) && loggedInUserId.value && loggedInUserId.value !== postDetail.userId
      }, (postDetail.postType == 1 || postDetail.postType == 2) && loggedInUserId.value && loggedInUserId.value !== postDetail.userId ? common_vendor.e({
        aj: common_vendor.t(postDetail.isInterested ? "✅" : "🤝"),
        ak: common_vendor.t(postDetail.isInterested ? "已感兴趣" : "我感兴趣"),
        al: postDetail.isInterested ? 1 : "",
        am: common_vendor.o(toggleInterest),
        an: postDetail.isInterested
      }, postDetail.isInterested ? {
        ao: common_vendor.p({
          type: "chat-filled",
          size: "20",
          color: "#fff"
        }),
        ap: common_vendor.o(goToHunterInteraction)
      } : {}, {
        aq: postDetail.isInterested ? 1 : ""
      }) : {}, {
        ar: postDetail && postDetail.isReadTrace === 1 && viewerTotal.value > 0
      }, postDetail && postDetail.isReadTrace === 1 && viewerTotal.value > 0 ? common_vendor.e({
        as: postDetail.targetViewNum > 0
      }, postDetail.targetViewNum > 0 ? {
        at: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#333"
        }),
        av: common_vendor.t(postDetail.targetViewNum)
      } : {}, {
        aw: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        ax: common_vendor.o(goToTraceList),
        ay: common_vendor.f(viewerList.value, (item, index, i0) => {
          return {
            a: item.memberUser.avatar,
            b: item.id
          };
        }),
        az: postDetail.hasSilentLoginUser === 1
      }, postDetail.hasSilentLoginUser === 1 ? {} : {}, {
        aA: viewerTotal.value > 7
      }, viewerTotal.value > 7 ? {} : {}, {
        aB: common_vendor.o(goToTraceList)
      }) : {}, {
        aC: postDetail.commentFlag
      }, postDetail.commentFlag ? common_vendor.e({
        aD: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        aE: common_vendor.t(comments.value.length),
        aF: common_vendor.f(comments.value, (comment, k0, i0) => {
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
            f: comment.imageUrls && comment.imageUrls.length > 0
          }, comment.imageUrls && comment.imageUrls.length > 0 ? {
            g: common_vendor.f(comment.imageUrls, (img, imgIndex, i1) => {
              return {
                a: img,
                b: imgIndex,
                c: common_vendor.o(($event) => previewCommentImage(comment.imageUrls, imgIndex), imgIndex)
              };
            })
          } : {}, {
            h: "8303b14f-13-" + i0,
            i: common_vendor.o(($event) => replyComment(comment), comment.id),
            j: loggedInUserId.value == comment.userId
          }, loggedInUserId.value == comment.userId ? {
            k: "8303b14f-14-" + i0,
            l: common_vendor.p({
              type: "trash",
              size: "14",
              color: "#999"
            }),
            m: common_vendor.o(($event) => deleteComment(comment.id), comment.id)
          } : {}, {
            n: comment.id,
            o: comment.parentId !== 0 ? 1 : "",
            p: comment.id
          });
        }),
        aG: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        aH: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        aI: common_vendor.p({
          type: isAnonymous.value ? "eye-slash-filled" : "eye-filled",
          size: "18",
          color: isAnonymous.value ? "#FF6A00" : "#999"
        }),
        aJ: common_vendor.t(isAnonymous.value ? "匿名" : "显名"),
        aK: isAnonymous.value ? 1 : "",
        aL: common_vendor.o(($event) => isAnonymous.value = !isAnonymous.value),
        aM: commentInputPlaceholder.value,
        aN: newCommentText.value,
        aO: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        aP: !imageUrls.value || imageUrls.value.length === 0
      }, !imageUrls.value || imageUrls.value.length === 0 ? {
        aQ: common_vendor.p({
          type: "image",
          size: "24",
          color: "#999"
        }),
        aR: common_vendor.o(handleChooseImage)
      } : {}, {
        aS: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#fff"
        }),
        aT: newCommentText.value.trim().length > 0 || imageUrls.value && imageUrls.value.length > 0 ? 1 : "",
        aU: common_vendor.o(addComment),
        aV: imageUrls.value && imageUrls.value.length > 0
      }, imageUrls.value && imageUrls.value.length > 0 ? {
        aW: common_vendor.f(imageUrls.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(imageUrls.value, index), index),
            c: common_vendor.o(($event) => removeImage(index), index),
            d: index
          };
        })
      } : {}, {
        aX: keyboardHeight.value + "px"
      }) : {
        aY: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#999"
        })
      }, {
        aZ: customShareTitle.value,
        ba: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        bb: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        bc: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        bd: common_vendor.o(guideShareTimeline),
        be: common_vendor.o(closeSharePopup),
        bf: common_vendor.sr(sharePopup, "8303b14f-19", {
          "k": "sharePopup"
        }),
        bg: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        bh: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        bi: common_assets._imports_0$3,
        bj: common_vendor.o(hideTimelineGuide)
      } : {}, {
        bk: showInterestSuccessModal.value
      }, showInterestSuccessModal.value ? {
        bl: common_vendor.o(closeInterestModal),
        bm: common_vendor.o(goToMoreLiehuo),
        bn: common_vendor.o(() => {
        }),
        bo: common_vendor.o(closeInterestModal)
      } : {}, {
        bp: common_vendor.sr(pointsPopup, "8303b14f-22", {
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
