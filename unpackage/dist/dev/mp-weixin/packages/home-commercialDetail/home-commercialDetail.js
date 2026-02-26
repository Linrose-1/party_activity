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
      avatar: "",
      // 显示的头像 (个人头像或企业Logo)
      enterpriseId: null,
      // 如果是企业发布，存储企业主键ID
      isEnterpriseSource: false,
      // 身份标记
      isEntVerified: false,
      // 企业是否认证 (status 3)
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:378", `✅ [商机详情页] 在 onLoad 中捕获到 options: ${JSON.stringify(options)}`);
      if (options && options.inviteCode) {
        const inviteCode = options.inviteCode;
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:381", `✅ [商机详情页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      if (options && options.commentId) {
        targetCommentId.value = options.commentId;
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:388", `✅ [商机详情页] 接收到目标评论ID: ${targetCommentId.value}`);
      }
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      if (options && options.id) {
        postId.value = options.id;
        getBusinessOpportunitiesDetail();
      } else {
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:397", "未接收到商机ID");
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
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:412", "用户点击了自己的分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:416", "其他用户点击了分享链接，且已登录，准备加分。");
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:422", "用户点击了分享链接，但尚未登录。暂存 sharerId 和 bizId。");
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId
          });
        }
      }
      common_vendor.index.showShareMenu({
        // withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onMounted(() => {
      common_vendor.index.onKeyboardHeightChange((res) => {
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:442", "键盘高度变化:", res.height);
        keyboardHeight.value = res.height;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    common_vendor.onBackPress((options) => {
      if (hasDataChanged.value) {
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:458", "详情页数据已变更，发出通知: postUpdated");
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
            common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:511", `准备滚动到评论区, 计算位置: ${finalScrollTop}`);
            common_vendor.index.pageScrollTo({
              scrollTop: finalScrollTop,
              duration: 300
            });
          } else {
            common_vendor.index.__f__("warn", "at packages/home-commercialDetail/home-commercialDetail.vue:517", "无法找到 .comments-section 元素进行滚动");
          }
        });
      }, 100);
    };
    const scrollToTargetComment = (commentId) => {
      if (!commentId) {
        common_vendor.index.__f__("warn", "at packages/home-commercialDetail/home-commercialDetail.vue:529", "未提供评论ID，无法定位");
        return;
      }
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:533", `准备滚动到评论ID: ${commentId}`);
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(`[data-comment-id="${commentId}"]`).boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res && res[0] && res[1]) {
            const elementTop = res[0].top;
            const scrollTop = res[1].scrollTop;
            const finalScrollTop = scrollTop + elementTop - 100;
            common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:547", `找到评论元素，准备滚动到位置: ${finalScrollTop}`);
            common_vendor.index.pageScrollTo({
              scrollTop: finalScrollTop,
              duration: 300,
              success: () => {
                common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:552", "滚动到评论成功");
                common_vendor.index.showToast({
                  title: "已定位到该评论",
                  icon: "none",
                  duration: 1500
                });
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:561", "滚动失败:", err);
              }
            });
          } else {
            common_vendor.index.__f__("warn", "at packages/home-commercialDetail/home-commercialDetail.vue:565", `未找到评论ID为 ${commentId} 的元素`);
            scrollToCommentsSection();
          }
        });
      }, 300);
    };
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:575", "触发分享给好友", res);
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:597", "分享商机（好友），携带邀请码:", inviteCode);
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:620", "触发分享到朋友圈");
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:669", `准备为分享者 (ID: ${sharerId}) 增加贡分, 关联商机ID: ${bizId}`);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:683", "调用分享加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:685", `成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
      }
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
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:699", "商机详情", result);
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
          if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
            showFollowButton.value = true;
          }
          if (item.isReadTrace === 1) {
            common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:736", "🔍 该商机已开启阅读留痕，正在拉取浏览记录...");
            getViewerList();
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:757", "获取商机详情失败:", error);
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
      common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:781", "📊 浏览记录接口返回:", data);
      if (data) {
        viewerList.value = data.list || [];
        viewerTotal.value = data.total || 0;
        common_vendor.index.__f__("log", "at packages/home-commercialDetail/home-commercialDetail.vue:788", "🧐 显示留痕判断条件:", {
          "是否本人": postDetail.userId == loggedInUserId.value,
          "是否开启留痕": postDetail.isReadTrace === 1,
          "浏览总数": viewerTotal.value
        });
      }
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
        const userObj = {
          id: postDetail.userId,
          name: postDetail.user,
          avatar: postDetail.avatar
        };
        navigateToBusinessCard(userObj);
      }
    };
    const goToTraceList = () => {
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${postId.value}`
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:899", "请求评论列表异常:", error);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:977", "创建评论异常:", error);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1161", "关注/取关用户异常:", err);
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
        common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1230", "收藏/取消收藏商机异常:", err);
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
          common_vendor.index.__f__("error", "at packages/home-commercialDetail/home-commercialDetail.vue:1342", "setClipboardData failed in detail page:", err);
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
        k: showFollowButton.value
      }, showFollowButton.value ? {
        l: common_vendor.t(postDetail.isFollowedUser ? "已关注" : "关注"),
        m: postDetail.isFollowedUser ? 1 : "",
        n: common_vendor.o(($event) => toggleFollow(postDetail))
      } : loggedInUserId.value && loggedInUserId.value === postDetail.userId ? {
        p: common_vendor.p({
          type: "trash",
          size: "12",
          color: "#e74c3c"
        }),
        q: common_vendor.o(deletePost)
      } : {}, {
        o: loggedInUserId.value && loggedInUserId.value === postDetail.userId,
        r: common_vendor.o(handleAuthorClick),
        s: postDetail.postType == 1
      }, postDetail.postType == 1 ? {} : postDetail.postType == 3 ? {} : {}, {
        t: postDetail.postType == 3,
        v: common_vendor.t(postDetail.postTitle),
        w: common_vendor.o(($event) => handleLongPress(postDetail.postTitle)),
        x: common_vendor.t(postDetail.content),
        y: common_vendor.o(($event) => handleLongPress(postDetail.content)),
        z: postDetail.video
      }, postDetail.video ? {
        A: postDetail.video
      } : postDetail.images && postDetail.images.length ? {
        C: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: imgIndex,
            c: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex)
          };
        }),
        D: common_vendor.n("images-count-" + postDetail.images.length)
      } : {}, {
        B: postDetail.images && postDetail.images.length,
        E: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        F: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        G: common_vendor.t(postDetail.likes),
        H: postDetail.userAction === "like" ? 1 : "",
        I: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        J: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        K: common_vendor.t(postDetail.dislikes),
        L: postDetail.userAction === "dislike" ? 1 : "",
        M: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        N: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        O: common_vendor.o(openSharePopup),
        P: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        Q: common_vendor.t(postDetail.saved ? "已收藏" : "收藏"),
        R: postDetail.saved ? 1 : "",
        S: common_vendor.o(($event) => toggleBookmark(postDetail)),
        T: postDetail && postDetail.isReadTrace === 1 && viewerTotal.value > 0
      }, postDetail && postDetail.isReadTrace === 1 && viewerTotal.value > 0 ? common_vendor.e({
        U: common_vendor.t(viewerTotal.value),
        V: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        W: common_vendor.o(goToTraceList),
        X: common_vendor.f(viewerList.value, (item, index, i0) => {
          return {
            a: item.memberUser.avatar,
            b: item.id
          };
        }),
        Y: viewerTotal.value > 7
      }, viewerTotal.value > 7 ? {} : {}, {
        Z: common_vendor.t(viewerTotal.value),
        aa: common_vendor.o(goToTraceList)
      }) : {}, {
        ab: postDetail.commentFlag
      }, postDetail.commentFlag ? common_vendor.e({
        ac: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        ad: common_vendor.t(comments.value.length),
        ae: common_vendor.f(comments.value, (comment, k0, i0) => {
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
            f: "8303b14f-9-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: loggedInUserId.value == comment.userId
          }, loggedInUserId.value == comment.userId ? {
            i: "8303b14f-10-" + i0,
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
        af: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        ag: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        ah: common_vendor.p({
          type: isAnonymous.value ? "eye-slash-filled" : "eye-filled",
          size: "18",
          color: isAnonymous.value ? "#FF6A00" : "#999"
        }),
        ai: common_vendor.t(isAnonymous.value ? "匿名" : "显名"),
        aj: isAnonymous.value ? 1 : "",
        ak: common_vendor.o(($event) => isAnonymous.value = !isAnonymous.value),
        al: commentInputPlaceholder.value,
        am: newCommentText.value,
        an: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        ao: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#fff"
        }),
        ap: newCommentText.value.trim().length > 0 ? 1 : "",
        aq: common_vendor.o(addComment),
        ar: keyboardHeight.value + "px"
      }) : {
        as: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#999"
        })
      }, {
        at: customShareTitle.value,
        av: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        aw: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        ax: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        ay: common_vendor.o(guideShareTimeline),
        az: common_vendor.o(closeSharePopup),
        aA: common_vendor.sr(sharePopup, "8303b14f-14", {
          "k": "sharePopup"
        }),
        aB: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        aC: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        aD: common_assets._imports_0$3,
        aE: common_vendor.o(hideTimelineGuide)
      } : {}, {
        aF: copyMenu.show
      }, copyMenu.show ? {
        aG: common_vendor.o(executeCopy),
        aH: common_vendor.o(() => {
        }),
        aI: common_vendor.o(hideCopyMenu)
      } : {}, {
        aJ: common_vendor.sr(pointsPopup, "8303b14f-17", {
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
