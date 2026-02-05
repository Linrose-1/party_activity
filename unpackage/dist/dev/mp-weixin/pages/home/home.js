"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more + GuidePopup + AvatarLongPressMenu + AddCircleConfirmPopup + InviteCircleConfirmPopup + ScrollPointsPopup + ZhimiPayPopup)();
}
const GuidePopup = () => "../../components/GuidePopup.js";
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const AddCircleConfirmPopup = () => "../../components/AddCircleConfirmPopup.js";
const InviteCircleConfirmPopup = () => "../../components/InviteCircleConfirmPopup.js";
const ScrollPointsPopup = () => "../../components/ScrollPointsPopup.js";
const ZhimiPayPopup = () => "../../components/ZhimiPayPopup.js";
const defaultAvatarUrl = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const isPageReady = common_vendor.ref(false);
    const loggedInUserId = common_vendor.ref(null);
    const isLogin = common_vendor.ref(false);
    const member = common_vendor.ref("白银");
    const currentUserInfo = common_vendor.ref(null);
    const swiperList = common_vendor.ref([]);
    const postList = common_vendor.ref([]);
    const activeTab = common_vendor.ref(1);
    const searchQuery = common_vendor.ref("");
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const loadingStatus = common_vendor.ref("more");
    const isActionInProgress = common_vendor.ref(false);
    const location = common_vendor.reactive({
      longitude: "",
      latitude: ""
    });
    const scrollBarData = common_vendor.ref([]);
    const pointsDetailData = common_vendor.ref(null);
    const isInitialLoad = common_vendor.ref(true);
    const guidePopupRef = common_vendor.ref(null);
    const avatarMenuRef = common_vendor.ref(null);
    const addCirclePopup = common_vendor.ref(null);
    const invitePopupRef = common_vendor.ref(null);
    const scrollPointsPopup = common_vendor.ref(null);
    const payPopup = common_vendor.ref(null);
    common_vendor.computed(() => {
      const info = currentUserInfo.value || utils_user.getCachedUserInfo();
      return (info == null ? void 0 : info.homeTitle) || "猩聚社";
    });
    common_vendor.computed(() => {
      const info = currentUserInfo.value || utils_user.getCachedUserInfo();
      return (info == null ? void 0 : info.homeSlogan) || "商友连接·商机分享";
    });
    common_vendor.computed(() => {
      const info = currentUserInfo.value || utils_user.getCachedUserInfo() || {};
      const slides = [];
      const userTitle = info.homeTitle;
      const userSlogan = info.homeSlogan;
      const parentTitle = info.parentHomeTitle;
      const parentSlogan = info.parentHomeSlogan;
      const defaultTitle = "猩聚社";
      const defaultSlogan = "商友连接·商机分享";
      if (userTitle) {
        slides.push({
          title: userTitle,
          slogan: userSlogan || ""
        });
      }
      if (parentTitle) {
        slides.push({
          title: parentTitle,
          slogan: parentSlogan || ""
        });
      } else {
        slides.push({
          title: defaultTitle,
          slogan: defaultSlogan
        });
      }
      return slides;
    });
    common_vendor.computed(() => {
      const info = currentUserInfo.value || utils_user.getCachedUserInfo() || {};
      if (info.parentHomeTitle || info.homeTitle) {
        return "连接全球精英商友——by猩聚社";
      }
      return "连接全球精英商友";
    });
    const hasPaidMembership = common_vendor.computed(() => {
      const paidLevels = ["青铜", "白银", "黄金", "黑钻"];
      return paidLevels.includes(member.value);
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:418", "首页 onMounted: 开始监听 postUpdated 事件");
      common_vendor.index.$on("postUpdated", handlePostUpdate);
      common_vendor.index.$on("userFollowStatusChanged", handleUserFollowStatusChange);
      common_vendor.index.$on("postInteractionChanged", handlePostInteractionChange);
      common_vendor.index.$on("userInfoChanged", handleUserInfoChange);
      setTimeout(() => {
        if (guidePopupRef.value) {
          guidePopupRef.value.checkAndShow();
        }
      }, 2e3);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:437", "首页 onUnmounted: 移除 postUpdated 事件监听");
      common_vendor.index.$off("postUpdated", handlePostUpdate);
      common_vendor.index.$off("userFollowStatusChanged", handleUserFollowStatusChange);
      common_vendor.index.$off("postInteractionChanged", handlePostInteractionChange);
      common_vendor.index.$off("userInfoChanged", handleUserInfoChange);
    });
    common_vendor.onShow(async () => {
      let currentUserId = common_vendor.index.getStorageSync("userId");
      if (isInitialLoad.value) {
        if (!currentUserId) {
          common_vendor.index.__f__("log", "at pages/home/home.vue:455", "检测到未登录，开始静默登录流程...");
          await performSilentLogin();
        }
        isPageReady.value = true;
      } else {
        isPageReady.value = true;
      }
      const currentUserIsLogin = !!currentUserId;
      if (isInitialLoad.value || isLogin.value !== currentUserIsLogin || postList.value.length === 0) {
        common_vendor.index.__f__("log", "at pages/home/home.vue:484", "触发刷新: 首次加载或登录状态变更");
        loggedInUserId.value = currentUserId;
        isLogin.value = currentUserIsLogin;
        if (isLogin.value) {
          fetchCurrentUserInfo();
        } else {
          currentUserInfo.value = null;
        }
        getBusinessOpportunitiesList(true);
        isInitialLoad.value = false;
      } else {
        common_vendor.index.__f__("log", "at pages/home/home.vue:502", "从详情页返回，不刷新列表，保持滚动位置。");
      }
      common_vendor.index.showShareMenu({
        // withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
      if (common_vendor.index.getStorageSync("token")) {
        fetchScrollBarData();
        fetchSwiperData();
      }
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        getBusinessOpportunitiesList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      getBusinessOpportunitiesList(true);
    });
    common_vendor.onShareAppMessage(() => {
      const sharerId = common_vendor.index.getStorageSync("userId");
      const inviteCode = utils_user.getInviteCode();
      const params = [];
      if (sharerId)
        params.push(`sharerId=${sharerId}`);
      if (inviteCode)
        params.push(`inviteCode=${inviteCode}`);
      const sharePath = `/pages/home/home${params.length > 0 ? "?" + params.join("&") : ""}`;
      return {
        title: "猩聚社丨精英商友 · 跨域社交工具  Gofor Gathering ☞☞",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    common_vendor.onShareTimeline(() => {
      const sharerId = common_vendor.index.getStorageSync("userId");
      const inviteCode = utils_user.getInviteCode();
      const params = [];
      if (sharerId)
        params.push(`sharerId=${sharerId}`);
      if (inviteCode)
        params.push(`inviteCode=${inviteCode}`);
      const queryString = params.join("&");
      return {
        title: "猩聚社丨精英商友 · 跨域社交工具  Gofor Gathering ☞☞",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    const handlePostUpdate = () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:571", "postUpdated 触发，但已通过精准事件同步数据，跳过全量刷新");
    };
    const fetchSwiperData = async () => {
      const defaultSlide = {
        id: 0,
        homeTitle: "猩聚社",
        homeSlogan: "商友连接·商机分享"
      };
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        swiperList.value = [defaultSlide];
        return;
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/get-slogans-by-Friend", {
          method: "GET"
        });
        if (!error && data && data.length > 0) {
          swiperList.value = data;
          common_vendor.index.__f__("log", "at pages/home/home.vue:608", "✅ 轮播口号加载完成");
        } else {
          swiperList.value = [defaultSlide];
        }
      } catch (e) {
        swiperList.value = [defaultSlide];
        common_vendor.index.__f__("error", "at pages/home/home.vue:616", "获取轮播数据异常", e);
      }
    };
    const handleSwiperItemClick = (item, index) => {
      const isLastItem = index === swiperList.value.length - 1;
      if (item.id === 0 || isLastItem) {
        common_vendor.index.__f__("log", "at pages/home/home.vue:658", "💡 点击了平台官方展示项，该项仅作展示，不执行跳转");
        return;
      }
      if (index === 0) {
        goToCustomizationPage();
      } else {
        const displayName = item.realName || item.nickname || item.homeTitle || "商友圈";
        const avatarUrl = item.avatar || "";
        const url = `/packages/my-friendList/my-friendList?userId=${item.id}&userName=${encodeURIComponent(displayName)}&avatar=${encodeURIComponent(avatarUrl)}`;
        common_vendor.index.__f__("log", "at pages/home/home.vue:677", `🚀 准备进入 [${displayName}] 的圈子，头像地址:`, avatarUrl);
        common_vendor.index.navigateTo({
          url
        });
      }
    };
    const getPageDescription = (item) => {
      if (item.homeTitle && item.homeTitle !== "猩聚社") {
        return "连接全球精英商友——by猩聚社";
      }
      return "连接全球精英商友";
    };
    const fetchScrollBarData = async () => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/experience-record/get-scroll-bar", {
          method: "GET"
        });
        if (!error && data) {
          pointsDetailData.value = data;
          const list = [];
          if (data.totalFriendNum > 0) {
            list.push({
              type: "friend",
              label: "新的圈友",
              count: data.totalFriendNum
            });
          }
          list.push({
            type: "points",
            label: "昨日贡分",
            count: data.totalExperience || 0
          });
          if (data.pendingConfirmUserTotal > 0) {
            list.push({
              type: "confirm",
              label: "聚会确认",
              count: data.pendingConfirmUserTotal
            });
          }
          scrollBarData.value = list;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:742", "获取滚动条数据失败", e);
      }
    };
    const performSilentLogin = async () => {
      try {
        const loginRes = await common_vendor.index.login({
          provider: "weixin"
        });
        if (!loginRes || !loginRes.code) {
          return;
        }
        const pendingInviteCode = common_vendor.index.getStorageSync("pendingInviteCode");
        const payload = {
          loginCode: loginRes.code,
          state: "default",
          shardCode: pendingInviteCode || ""
        };
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/auth/weixin-mini-app-login", {
          method: "POST",
          data: payload
        });
        if (!error && data && data.accessToken) {
          common_vendor.index.__f__("log", "at pages/home/home.vue:781", "✅ 静默登录成功!", data);
          common_vendor.index.setStorageSync("token", data.accessToken);
          common_vendor.index.setStorageSync("userId", data.userId);
          if (pendingInviteCode) {
            common_vendor.index.__f__("log", "at pages/home/home.vue:788", `🔗 [自动加圈] 检测到邀请码 ${pendingInviteCode}，正在执行圈友绑定...`);
            const bindRes = await utils_request.request(`/app-api/member/user/friend/bind-friend/${pendingInviteCode}`, {
              method: "POST"
            });
            if (!bindRes.error) {
              common_vendor.index.__f__("log", "at pages/home/home.vue:795", "✅ [自动加圈] 圈友关系绑定成功");
            } else {
              common_vendor.index.__f__("warn", "at pages/home/home.vue:797", "❌ [自动加圈] 绑定失败:", bindRes.error);
            }
          }
          isLogin.value = true;
          loggedInUserId.value = data.userId;
          fetchCurrentUserInfo();
          getBusinessOpportunitiesList(true);
          if (pendingInviteCode) {
            common_vendor.index.removeStorageSync("pendingInviteCode");
          }
        } else {
          common_vendor.index.__f__("log", "at pages/home/home.vue:815", "静默登录未成功 (可能是非新用户需手机号或接口异常):", error);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:818", "静默登录流程异常:", e);
      }
    };
    const fetchCurrentUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:830", "首页实时获取用户信息失败:", error);
        currentUserInfo.value = utils_user.getCachedUserInfo();
      } else {
        currentUserInfo.value = data;
        common_vendor.index.__f__("log", "at pages/home/home.vue:835", "首页实时获取用户信息成功:", currentUserInfo.value);
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(data));
      }
    };
    const getBusinessOpportunitiesList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      loadingStatus.value = "loading";
      let currentPage = pageNo.value;
      if (isRefresh) {
        currentPage = 1;
      }
      const params = {
        pageNo: currentPage,
        pageSize: pageSize.value,
        tabIndex: activeTab.value
      };
      if (searchQuery.value)
        params.searchKey = searchQuery.value;
      if (activeTab.value === 2 && location.longitude && location.latitude) {
        params.longitude = location.longitude;
        params.latitude = location.latitude;
      }
      if (activeTab.value === 5) {
        params.isEnterprise = 1;
      }
      try {
        const {
          data: apiData,
          error
        } = await utils_request.request("/app-api/member/business-opportunities/list", {
          method: "GET",
          data: params
        });
        if (error || !apiData || !apiData.list) {
          loadingStatus.value = error ? "more" : "noMore";
          if (error.includes("信息绑定")) {
            common_vendor.index.__f__("warn", "at pages/home/home.vue:881", "捕获到业务限制：需绑定信息");
            await utils_user.checkLoginGuard();
            return;
          }
          if (isRefresh)
            common_vendor.index.stopPullDownRefresh();
          common_vendor.index.showToast({
            title: error,
            icon: "none"
          });
          return;
        }
        const mappedData = apiData.list.map((item) => {
          var _a, _b, _c, _d;
          const plainText = (item.postContent || "").replace(/<[^>]+>/g, "").trim();
          const isTruncated = plainText.length > 100;
          const displayContent = isTruncated ? plainText.substring(0, 100) : plainText;
          const isEntPost = item.isEnterprise === 1 && item.enterpriseInfo;
          const author = {
            id: isEntPost ? item.enterpriseInfo.id : ((_a = item.memberUser) == null ? void 0 : _a.id) || item.userId,
            managerId: item.userId,
            name: isEntPost ? item.enterpriseInfo.enterpriseName : ((_b = item.memberUser) == null ? void 0 : _b.nickname) || "商友",
            avatar: isEntPost ? item.enterpriseInfo.logoUrl : ((_c = item.memberUser) == null ? void 0 : _c.avatar) || defaultAvatarUrl,
            // 标记：该作者是否为企业主体
            isEnterpriseSource: isEntPost,
            // 认证标识判断
            showBlueV: isEntPost,
            // 企业发布必带蓝V
            isIdVerified: !isEntPost && ((_d = item.memberUser) == null ? void 0 : _d.idCert) === 1,
            // 仅个人显示实名标识
            isEntVerified: isEntPost && item.enterpriseInfo.status === 3
            // 企业且status为3显示已认证
          };
          return {
            id: item.id,
            title: item.postTitle,
            postType: item.postType || 0,
            fullContent: plainText,
            // 完整纯文本内容，为长按复制做准备
            displayContent,
            // 用于显示的内容
            isTruncated,
            // 是否被截断的标志
            // ========================================
            // 1. 检查并赋值 postVideo 字段
            video: item.postVideo || "",
            // 2. 将 postImg 的处理结果赋值给 images 字段
            images: item.postImg ? String(item.postImg).split(",").filter((img) => img) : [],
            // =======================================================
            tags: item.tags ? Array.isArray(item.tags) ? item.tags : String(item.tags).split(",").filter((tag) => tag) : [],
            likes: item.likesCount || 0,
            dislikes: item.dislikesCount || 0,
            commonCount: item.commonCount || 0,
            userAction: item.userLikeStr || null,
            isSaved: item.followFlag === 1,
            isFollowedUser: item.followUserFlag === 1,
            time: formatTimestamp(item.createTime),
            user: author
          };
        });
        if (isRefresh) {
          postList.value = mappedData;
          pageNo.value = 2;
        } else {
          postList.value = [...postList.value, ...mappedData];
          pageNo.value++;
        }
        if (postList.value.length >= apiData.total) {
          loadingStatus.value = "noMore";
        } else {
          loadingStatus.value = "more";
          pageNo.value++;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:972", "getBusinessOpportunitiesList 逻辑异常:", err);
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: "页面逻辑异常，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleSearch = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      getBusinessOpportunitiesList(true);
    };
    const handleTabClick = async (tabIndex) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (activeTab.value === tabIndex)
        return;
      activeTab.value = tabIndex;
      if (tabIndex === 2) {
        checkAndGetLocation();
      } else {
        getBusinessOpportunitiesList(true);
      }
    };
    const checkAndGetLocation = () => {
      common_vendor.index.getSetting({
        success: (res) => {
          if (res.authSetting["scope.userLocation"]) {
            getLocationAndFetchData();
          } else {
            common_vendor.index.authorize({
              scope: "scope.userLocation",
              success: () => getLocationAndFetchData(),
              fail: () => common_vendor.index.showModal({
                title: "温馨提示",
                content: "您已拒绝获取位置信息，无法查看附近商机。请在设置中开启位置权限。",
                showCancel: false,
                confirmText: "我知道了"
              })
            });
          }
        }
      });
    };
    const getLocationAndFetchData = () => {
      common_vendor.index.showLoading({
        title: "正在定位..."
      });
      common_vendor.index.getLocation({
        type: "wgs84",
        success: (res) => {
          location.longitude = res.longitude.toString();
          location.latitude = res.latitude.toString();
        },
        complete: () => {
          common_vendor.index.hideLoading();
          getBusinessOpportunitiesList(true);
        }
      });
    };
    const handleAvatarClick = async (user) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (avatarMenuRef.value) {
        avatarMenuRef.value.open(user);
      }
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:1052", "菜单操作:", type, user);
      switch (type) {
        case "viewCard":
          if (user.isEnterpriseSource) {
            common_vendor.index.navigateTo({
              url: `/packages/enterprise-card/enterprise-card?id=${user.id}`
            });
          } else {
            navigateToBusinessCard(user);
          }
          break;
        case "viewPath":
          const displayName = user.realName || user.nickname || user.name || "商友";
          common_vendor.index.__f__("log", "at pages/home/home.vue:1069", "🚀 准备跳转，显示的姓名是:", displayName);
          common_vendor.index.navigateTo({
            url: `/packages/relationship-path/relationship-path?targetUserId=${user.id}&name=${encodeURIComponent(displayName)}`
          });
          break;
        case "addCircle":
          addCirclePopup.value.open(user);
          break;
        case "inviteCircle":
          invitePopupRef.value.open(user);
          break;
        case "removeCircle":
          common_vendor.index.showModal({
            title: "确认脱圈",
            content: `确定要与 ${user.name} 解除圈友关系吗？`,
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.showToast({
                  title: "已脱圈",
                  icon: "none"
                });
              }
            }
          });
          break;
        case "disconnect":
          common_vendor.index.showToast({
            title: "已断开连接",
            icon: "none"
          });
          break;
        case "comment":
          common_vendor.index.navigateTo({
            url: `/packages/user-reviews/user-reviews?userId=${user.id}`
          });
          break;
      }
    };
    const handleNoticeClick = (item) => {
      if (item.type === "friend") {
        common_vendor.index.navigateTo({
          url: "/packages/my-friendInvitation/my-friendInvitation?currentTab=1"
        });
      } else if (item.type === "points") {
        if (scrollPointsPopup.value) {
          scrollPointsPopup.value.open(pointsDetailData.value);
        }
      } else if (item.type === "confirm") {
        common_vendor.index.navigateTo({
          url: "/packages/my-active/my-active?currentTab=1"
        });
      }
    };
    const handleUserFollowStatusChange = (data) => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:1199", "接收到关注状态变更:", data);
      if (!data || !data.userId)
        return;
      postList.value.forEach((post) => {
        if (post.user.id === data.userId) {
          post.isFollowedUser = data.isFollowed;
        }
      });
    };
    const handlePostInteractionChange = (data) => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:1214", "接收到帖子互动变更:", data);
      if (!data || !data.postId)
        return;
      const targetPost = postList.value.find((p) => String(p.id) === String(data.postId));
      if (targetPost) {
        if (data.type === "action") {
          targetPost.userAction = data.userAction;
          targetPost.likes = data.likes;
          targetPost.dislikes = data.dislikes;
        } else if (data.type === "save") {
          targetPost.isSaved = data.isSaved;
        } else if (data.type === "comment") {
          if (typeof data.totalCount === "number") {
            targetPost.commonCount = data.totalCount;
          } else if (data.delta) {
            const currentCount = Number(targetPost.commonCount) || 0;
            targetPost.commonCount = currentCount + data.delta;
          }
        }
      } else {
        common_vendor.index.__f__("warn", "at pages/home/home.vue:1242", `未在当前列表中找到 ID 为 ${data.postId} 的帖子，跳过更新`);
      }
    };
    const handleUserInfoChange = async () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:1250", "收到用户信息变更通知，刷新首页配置");
      await fetchCurrentUserInfo();
    };
    const toggleAction = async (post, clickedAction) => {
      if (isActionInProgress.value || !isLogin.value)
        return;
      if (!await utils_user.checkLoginGuard())
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
        let apiActionToSend;
        if (originalAction === clickedAction) {
          apiActionToSend = "cancel";
        } else {
          apiActionToSend = clickedAction;
        }
        const {
          error
        } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: post.id,
            targetType: "post",
            action: apiActionToSend
            // 【关键】使用新的变量
          }
        });
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
    const toggleGenericFollow = async (post, type, targetId, statusKey, successMsg, failureMsg) => {
      if (isActionInProgress.value || !isLogin.value)
        return;
      if (!await utils_user.checkLoginGuard())
        return;
      isActionInProgress.value = true;
      const originalStatus = post[statusKey];
      const newStatus = !originalStatus;
      if (type === "post_user") {
        postList.value.forEach((p) => {
          if (p.user.id === targetId) {
            p[statusKey] = newStatus;
          }
        });
      } else {
        post[statusKey] = newStatus;
      }
      const apiUrl = newStatus ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            targetId,
            targetType: type
          }
        });
        if (error) {
          throw new Error(error);
        } else {
          common_vendor.index.showToast({
            title: newStatus ? successMsg.add : successMsg.remove,
            icon: "none"
          });
        }
      } catch (err) {
        if (type === "post_user") {
          postList.value.forEach((p) => {
            if (p.user.id === targetId) {
              p[statusKey] = originalStatus;
            }
          });
        } else {
          post[statusKey] = originalStatus;
        }
        common_vendor.index.showToast({
          title: failureMsg || "操作失败，请重试",
          icon: "none"
        });
      } finally {
        setTimeout(() => {
          isActionInProgress.value = false;
        }, 500);
      }
    };
    const toggleSave = (post) => {
      toggleGenericFollow(
        post,
        "post",
        post.id,
        "isSaved",
        {
          add: "已收藏",
          remove: "已取消收藏"
        },
        "收藏失败"
      );
    };
    const toggleFollow = (post) => {
      toggleGenericFollow(
        post,
        "post_user",
        post.user.id,
        "isFollowedUser",
        {
          add: "已关注",
          remove: "已取消关注"
        },
        "关注失败"
      );
    };
    const deletePost = (postToDelete) => {
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
                id: postToDelete.id
              }
            });
            common_vendor.index.hideLoading();
            if (error) {
              common_vendor.index.showToast({
                title: `删除失败: ${error}`,
                icon: "none"
              });
              return;
            }
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            const index = postList.value.findIndex((p) => p.id === postToDelete.id);
            if (index !== -1) {
              postList.value.splice(index, 1);
            }
          }
        }
      });
    };
    const goToCustomizationPage = async () => {
      var _a;
      if (!await utils_user.checkLoginGuard())
        return;
      if (!isLogin.value) {
        goToLogin();
        return;
      }
      if (!currentUserInfo.value) {
        await fetchCurrentUserInfo();
      }
      const isPaid = ((_a = currentUserInfo.value) == null ? void 0 : _a.payBusinessFriendAuth) === 1;
      if (isPaid) {
        common_vendor.index.navigateTo({
          url: `/packages/home-customization/home-customization`
        });
      } else {
        payPopup.value.open();
      }
    };
    const handlePaySuccess = async () => {
      await fetchCurrentUserInfo();
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: `/packages/home-customization/home-customization`
        });
      }, 800);
    };
    const handlePostClick = async (post) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!hasPaidMembership.value) {
        goToMembership();
      } else {
        skipCommercialDetail(post.id);
      }
    };
    const navigateToComments = async (post) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!hasPaidMembership.value) {
        goToMembership();
      } else {
        common_vendor.index.navigateTo({
          url: `/packages/home-commercialDetail/home-commercialDetail?id=${post.id}&scrollTo=comments`
        });
      }
    };
    const navigateToBusinessCard = (user) => {
      const avatarUrl = user.avatar || defaultAvatarUrl;
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const postNew = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    const goToLogin = () => common_vendor.index.navigateTo({
      url: "/pages/index/index"
    });
    const goToMembership = () => common_vendor.index.showToast({
      title: "正在前往会员中心...",
      icon: "none"
    });
    const skipCommercialDetail = (postId) => common_vendor.index.navigateTo({
      url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
    });
    const handleEdit = (id) => {
      if (!id)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/home-opportunitiesPublish/home-opportunitiesPublish?id=${id}`
      });
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
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
          common_vendor.index.__f__("error", "at pages/home/home.vue:1673", "setClipboardData failed:", err);
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        },
        complete: () => {
          copyMenu.show = false;
          copyMenu.text = "";
        }
      });
    };
    const hideCopyMenu = () => {
      copyMenu.show = false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isPageReady.value
      }, !isPageReady.value ? {
        b: common_vendor.p({
          type: "spinner-cycle",
          size: "40",
          color: "#FF6A00"
        })
      } : {}, {
        c: common_vendor.f(swiperList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.homeTitle || "猩聚社"),
            b: common_vendor.t(item.homeSlogan || "商友连接·商机分享"),
            c: common_vendor.t(getPageDescription(item)),
            d: common_vendor.o(($event) => handleSwiperItemClick(item, index), index),
            e: index
          };
        }),
        d: swiperList.value.length > 1,
        e: common_vendor.p({
          type: "search",
          size: "20",
          color: "#FF6A00"
        }),
        f: common_vendor.o(handleSearch),
        g: searchQuery.value,
        h: common_vendor.o(($event) => searchQuery.value = $event.detail.value),
        i: common_vendor.o(handleSearch),
        j: scrollBarData.value.length > 0
      }, scrollBarData.value.length > 0 ? {
        k: common_vendor.p({
          type: "sound",
          size: "14",
          color: "#FF6A00"
        }),
        l: common_vendor.f(scrollBarData.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.count),
            c: common_vendor.o(($event) => handleNoticeClick(item), index),
            d: index
          };
        })
      } : {}, {
        m: activeTab.value === 1 ? 1 : "",
        n: common_vendor.o(($event) => handleTabClick(1)),
        o: activeTab.value === 5 ? 1 : "",
        p: common_vendor.o(($event) => handleTabClick(5)),
        q: activeTab.value === 2 ? 1 : "",
        r: common_vendor.o(($event) => handleTabClick(2)),
        s: activeTab.value === 3 ? 1 : "",
        t: common_vendor.o(($event) => handleTabClick(3)),
        v: activeTab.value === 4 ? 1 : "",
        w: common_vendor.o(($event) => handleTabClick(4)),
        x: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FFFFFF"
        }),
        y: common_vendor.o(postNew),
        z: common_vendor.f(postList.value, (post, k0, i0) => {
          return common_vendor.e({
            a: post.user.avatar,
            b: post.user.isEnterpriseSource ? 1 : "",
            c: post.user.showBlueV
          }, post.user.showBlueV ? {
            d: common_assets._imports_0
          } : {}, {
            e: common_vendor.o(($event) => handleAvatarClick(post.user), post.id),
            f: common_vendor.t(post.user.name),
            g: post.user.isEntVerified
          }, post.user.isEntVerified ? {
            h: "07e72d3c-4-" + i0,
            i: common_vendor.p({
              type: "vip-filled",
              size: "10",
              color: "#fff"
            })
          } : {}, {
            j: post.user.isIdVerified
          }, post.user.isIdVerified ? {} : {}, isLogin.value ? common_vendor.e({
            k: loggedInUserId.value !== post.user.managerId
          }, loggedInUserId.value !== post.user.managerId ? {
            l: common_vendor.t(post.isFollowedUser ? "已关注" : "关注"),
            m: post.isFollowedUser ? 1 : "",
            n: common_vendor.o(($event) => toggleFollow(post), post.id)
          } : {
            o: "07e72d3c-5-" + i0,
            p: common_vendor.p({
              type: "compose",
              size: "14",
              color: "#FF6A00"
            }),
            q: common_vendor.o(($event) => handleEdit(post.id), post.id)
          }) : {}, {
            r: post.postType == 1
          }, post.postType == 1 ? {} : post.postType == 3 ? {} : {}, {
            s: post.postType == 3,
            t: common_vendor.t(post.title),
            v: common_vendor.o(($event) => handleLongPress(post.title), post.id),
            w: post.displayContent
          }, post.displayContent ? common_vendor.e({
            x: common_vendor.t(post.displayContent),
            y: post.isTruncated
          }, post.isTruncated ? {
            z: common_vendor.o(($event) => handlePostClick(post), post.id)
          } : {}, {
            A: common_vendor.o(($event) => handleLongPress(post.fullContent), post.id)
          }) : {}, {
            B: post.video
          }, post.video ? {
            C: "video-" + post.id,
            D: post.video,
            E: common_vendor.o(() => {
            }, post.id)
          } : post.images && post.images.length > 0 ? {
            G: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: imgIndex
              };
            })
          } : {}, {
            F: post.images && post.images.length > 0,
            H: post.tags && post.tags.length
          }, post.tags && post.tags.length ? {
            I: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, {
            J: common_vendor.t(post.time)
          }, isLogin.value ? common_vendor.e({
            K: "07e72d3c-6-" + i0,
            L: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            M: common_vendor.t(post.likes),
            N: post.userAction === "like" ? 1 : "",
            O: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            P: "07e72d3c-7-" + i0,
            Q: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            R: common_vendor.t(post.dislikes),
            S: post.userAction === "dislike" ? 1 : "",
            T: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            U: "07e72d3c-8-" + i0,
            V: common_vendor.p({
              type: "chatbubble",
              size: "20",
              color: "#666"
            }),
            W: common_vendor.t(post.commonCount),
            X: common_vendor.o(($event) => navigateToComments(post), post.id),
            Y: "07e72d3c-9-" + i0,
            Z: common_vendor.p({
              type: post.isSaved ? "star-filled" : "star",
              size: "20",
              color: post.isSaved ? "#FF6A00" : "#666"
            }),
            aa: common_vendor.t(post.isSaved ? "已收藏" : "收藏"),
            ab: post.isSaved ? 1 : "",
            ac: common_vendor.o(($event) => toggleSave(post), post.id),
            ad: isLogin.value && loggedInUserId.value == post.user.managerId
          }, isLogin.value && loggedInUserId.value == post.user.managerId ? {
            ae: "07e72d3c-10-" + i0,
            af: common_vendor.p({
              type: "trash",
              size: "20",
              color: "#e74c3c"
            }),
            ag: common_vendor.o(($event) => deletePost(post), post.id)
          } : {}) : {}, {
            ah: post.id,
            ai: common_vendor.o(($event) => handlePostClick(post), post.id)
          });
        }),
        A: isLogin.value,
        B: isLogin.value,
        C: isLogin.value && postList.value.length === 0 && loadingStatus.value === "noMore"
      }, isLogin.value && postList.value.length === 0 && loadingStatus.value === "noMore" ? {} : loadingStatus.value === "loading" ? {
        E: common_vendor.p({
          status: "loading",
          ["contentText.loading"]: "正在加载..."
        })
      } : loadingStatus.value === "noMore" ? {
        G: common_vendor.p({
          status: "noMore",
          ["contentText.noMore"]: "暂无更多内容"
        })
      } : {}, {
        D: loadingStatus.value === "loading",
        F: loadingStatus.value === "noMore",
        H: copyMenu.show
      }, copyMenu.show ? {
        I: common_vendor.o(executeCopy),
        J: common_vendor.o(() => {
        }),
        K: common_vendor.o(hideCopyMenu)
      } : {}, {
        L: common_vendor.sr(guidePopupRef, "07e72d3c-13", {
          "k": "guidePopupRef"
        }),
        M: common_vendor.sr(avatarMenuRef, "07e72d3c-14", {
          "k": "avatarMenuRef"
        }),
        N: common_vendor.o(handleMenuAction),
        O: common_vendor.sr(addCirclePopup, "07e72d3c-15", {
          "k": "addCirclePopup"
        }),
        P: common_vendor.sr(invitePopupRef, "07e72d3c-16", {
          "k": "invitePopupRef"
        }),
        Q: common_vendor.sr(scrollPointsPopup, "07e72d3c-17", {
          "k": "scrollPointsPopup"
        }),
        R: common_vendor.sr(payPopup, "07e72d3c-18", {
          "k": "payPopup"
        }),
        S: common_vendor.o(handlePaySuccess),
        T: common_vendor.p({
          price: 10,
          content: "定制功能需要支付10智米，请问是否同意支付开启该功能？",
          ["api-path"]: "/app-api/member/user/pay-business-friend-auth"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
