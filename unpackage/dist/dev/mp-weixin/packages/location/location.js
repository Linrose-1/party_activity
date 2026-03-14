"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_shakeLock = require("../../utils/shakeLock.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_load_more + ActivityCard + SmartGuidePopup)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const _sfc_main = {
  __name: "location",
  setup(__props) {
    let shakeAudioContext = null;
    const {
      isShakeLocked,
      lockShake
    } = utils_shakeLock.useShakeLock();
    const isUserLoggedIn = common_vendor.ref(false);
    const autoShakeOnLoad = common_vendor.ref(false);
    const currentTab = common_vendor.ref(0);
    const tabItems = common_vendor.ref(["商友", "聚会"]);
    const shaken = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    common_vendor.ref(true);
    const userLocation = common_vendor.ref(null);
    const smartGuidePopupRef = common_vendor.ref(null);
    const activityPageNo = common_vendor.ref(1);
    const businessPageNo = common_vendor.ref(1);
    const activityLoadingStatus = common_vendor.ref("more");
    const businessLoadingStatus = common_vendor.ref("more");
    const isFollowActionInProgress = common_vendor.ref(false);
    const activities = common_vendor.ref([]);
    const businesses = common_vendor.ref([]);
    const resetState = () => {
      common_vendor.index.__f__("log", "at packages/location/location.vue:149", "页面状态已重置");
      shaken.value = false;
      loading.value = false;
      activities.value = [];
      businesses.value = [];
      activityPageNo.value = 1;
      businessPageNo.value = 1;
      activityLoadingStatus.value = "more";
      businessLoadingStatus.value = "more";
    };
    const checkLoginStatus = () => {
      const token = common_vendor.index.getStorageSync("token");
      isUserLoggedIn.value = !!token;
    };
    const handleTabClick = (e) => {
      if (loading.value)
        return;
      currentTab.value = e.currentIndex;
      common_vendor.index.__f__("log", "at packages/location/location.vue:172", "🔥点击切换tab！当前 Tab 索引为:", currentTab.value);
    };
    const triggerShakeSequence = () => {
      const savedTabIndex = currentTab.value;
      common_vendor.index.__f__("log", "at packages/location/location.vue:179", "🔥 摇一摇触发！当前 Tab 索引为:", savedTabIndex);
      lockShake();
      if (shakeAudioContext) {
        shakeAudioContext.stop();
        shakeAudioContext.play();
      }
      getLocationAndProceed(savedTabIndex);
    };
    const getLocationAndProceed = (savedTabIndex = 0) => {
      common_vendor.index.showLoading({
        title: "正在定位...",
        mask: true
      });
      common_vendor.index.getLocation({
        type: "gcj02",
        success: async (res) => {
          common_vendor.index.hideLoading();
          userLocation.value = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          shaken.value = true;
          loading.value = true;
          common_vendor.index.vibrateShort();
          currentTab.value = savedTabIndex;
          try {
            await Promise.all([
              getNearbyActivities(true),
              getNearbyBusinesses(true)
            ]);
          } catch (error) {
            common_vendor.index.__f__("error", "at packages/location/location.vue:221", "加载错误:", error);
          } finally {
            loading.value = false;
            if (currentTab.value !== savedTabIndex) {
              currentTab.value = savedTabIndex;
            }
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "定位失败",
            icon: "none"
          });
        }
      });
    };
    const getNearbyActivities = async (isRefresh = false) => {
      if (activityLoadingStatus.value === "loading" && !isRefresh)
        return;
      activityLoadingStatus.value = "loading";
      if (isRefresh) {
        activityPageNo.value = 1;
        activities.value = [];
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/activity/list", {
          method: "GET",
          data: {
            pageNo: activityPageNo.value,
            pageSize: 10,
            longitude: userLocation.value.longitude,
            latitude: userLocation.value.latitude
          }
        });
        if (error)
          throw new Error(error);
        const list = data.list || [];
        activities.value = isRefresh ? list : [...activities.value, ...list];
        activityLoadingStatus.value = activities.value.length >= data.total ? "noMore" : "more";
        if (activityLoadingStatus.value === "more")
          activityPageNo.value++;
      } catch (err) {
        activityLoadingStatus.value = "more";
      }
    };
    const getNearbyBusinesses = async (isRefresh = false) => {
      if (businessLoadingStatus.value === "loading" && !isRefresh)
        return;
      businessLoadingStatus.value = "loading";
      if (isRefresh) {
        businessPageNo.value = 1;
        businesses.value = [];
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/list", {
          method: "GET",
          data: {
            pageNo: businessPageNo.value,
            pageSize: 10,
            longitude: userLocation.value.longitude,
            latitude: userLocation.value.latitude
          }
        });
        if (error)
          throw new Error(error);
        const list = data.list || [];
        businesses.value = isRefresh ? list : [...businesses.value, ...list];
        businessLoadingStatus.value = businesses.value.length >= data.total ? "noMore" : "more";
        if (businessLoadingStatus.value === "more")
          businessPageNo.value++;
      } catch (err) {
        businessLoadingStatus.value = "more";
      }
    };
    const handleFollowAction = async (user) => {
      if (isFollowActionInProgress.value)
        return;
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "需要登录",
          content: "关注功能需要登录后才能使用，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/index/index"
                // 或者你的登录页
              });
            }
          }
        });
        return;
      }
      const currentUserId = common_vendor.index.getStorageSync("userId");
      isFollowActionInProgress.value = true;
      const originalFollowStatus = user.followFlag;
      const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
      const apiUrl = newFollowStatus === 1 ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      const successMsg = newFollowStatus === 1 ? "关注成功" : "已取消关注";
      user.followFlag = newFollowStatus;
      try {
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            userId: currentUserId,
            targetId: user.id,
            targetType: "post_user"
          }
        });
        if (error)
          throw new Error(error);
        common_vendor.index.showToast({
          title: successMsg,
          icon: "success"
        });
      } catch (err) {
        user.followFlag = originalFollowStatus;
        common_vendor.index.showToast({
          title: err.message || "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isFollowActionInProgress.value = false;
      }
    };
    const navigateToBusinessCard = (user) => {
      const defaultAvatar = "/static/icon/default-avatar.png";
      const name = user.nickname || "匿名用户";
      const avatarUrl = user.avatar || defaultAvatar;
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.__f__("log", "at packages/location/location.vue:399", "从摇一摇页跳转，URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    const navigateToInvite = () => {
      common_vendor.index.navigateTo({
        url: "/pages/index/index"
      });
    };
    const navigateToSearch = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-friendInvitation/my-friendInvitation"
      });
    };
    const navigateToSearchActive = () => {
      common_vendor.index.switchTab({
        url: "/pages/active/active"
      });
    };
    const navigateToPublish = () => {
      common_vendor.index.navigateTo({
        url: "/packages/active-publish/active-publish"
      });
    };
    common_vendor.onLoad((options) => {
      resetState();
      if (options.autoShake === "true") {
        common_vendor.index.__f__("log", "at packages/location/location.vue:448", "onLoad: 接收到自动摇一摇指令");
        autoShakeOnLoad.value = true;
      }
    });
    common_vendor.onReady(() => {
      var _a;
      if (utils_user.isScenario3User()) {
        (_a = smartGuidePopupRef.value) == null ? void 0 : _a.open();
      }
    });
    common_vendor.onShow(() => {
      checkLoginStatus();
      if (!shakeAudioContext) {
        shakeAudioContext = common_vendor.index.createInnerAudioContext();
        shakeAudioContext.src = "https://img.gofor.club/wechat_shake.mp3";
      }
      if (autoShakeOnLoad.value) {
        common_vendor.index.__f__("log", "at packages/location/location.vue:472", "onShow: 执行自动摇一摇流程");
        resetState();
        triggerShakeSequence();
        autoShakeOnLoad.value = false;
      }
      common_vendor.index.onAccelerometerChange((res) => {
        if (Math.abs(res.x) > 1.2 && Math.abs(res.y) > 1.2) {
          if (!isShakeLocked.value) {
            triggerShakeSequence();
          }
        }
      });
    });
    common_vendor.onHide(() => {
      common_vendor.index.stopAccelerometer();
      if (shakeAudioContext) {
        shakeAudioContext.destroy();
        shakeAudioContext = null;
      }
    });
    common_vendor.onReachBottom(() => {
      switch (currentTab.value) {
        case 0:
          if (businessLoadingStatus.value === "more") {
            common_vendor.index.__f__("log", "at packages/location/location.vue:508", "触底加载更多商友...");
            getNearbyBusinesses();
          }
          break;
        case 1:
          if (activityLoadingStatus.value === "more") {
            common_vendor.index.__f__("log", "at packages/location/location.vue:515", "触底加载更多聚会...");
            getNearbyActivities();
          }
          break;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleTabClick),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabItems.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: !shaken.value
      }, !shaken.value ? {
        d: common_vendor.p({
          type: "hand-up",
          size: "60",
          color: "#FFFFFF"
        }),
        e: common_vendor.o(triggerShakeSequence)
      } : loading.value ? {} : common_vendor.e({
        g: common_vendor.p({
          type: "staff-filled",
          size: "20",
          color: "#FF6B00"
        }),
        h: common_vendor.f(businesses.value, (business, k0, i0) => {
          return common_vendor.e({
            a: business.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => navigateToBusinessCard(business), business.id),
            c: common_vendor.t(business.nickname),
            d: business.professionalTitle
          }, business.professionalTitle ? {
            e: common_vendor.t(business.professionalTitle)
          } : {}, {
            f: business.companyName
          }, business.companyName ? {
            g: common_vendor.t(business.companyName)
          } : {}, {
            h: business.fellowTownspeopleCityFlag === 1 || business.peerFlag === 1 || business.classmateFlag === 1
          }, business.fellowTownspeopleCityFlag === 1 || business.peerFlag === 1 || business.classmateFlag === 1 ? common_vendor.e({
            i: business.friendParentFlag === 1
          }, business.friendParentFlag === 1 ? {} : {}, {
            j: business.fellowTownspeopleCityFlag === 1
          }, business.fellowTownspeopleCityFlag === 1 ? {} : {}, {
            k: business.peerFlag === 1
          }, business.peerFlag === 1 ? {} : {}, {
            l: business.classmateFlag === 1
          }, business.classmateFlag === 1 ? {} : {}) : {}, {
            m: common_vendor.t(business.followFlag === 1 ? "取关" : "关注"),
            n: business.followFlag === 1 ? 1 : "",
            o: common_vendor.o(($event) => handleFollowAction(business), business.id),
            p: business.id
          });
        }),
        i: common_vendor.p({
          status: businessLoadingStatus.value
        }),
        j: businesses.value.length === 0 && businessLoadingStatus.value === "noMore"
      }, businesses.value.length === 0 && businessLoadingStatus.value === "noMore" ? {
        k: common_vendor.o(navigateToInvite),
        l: common_vendor.o(navigateToSearch)
      } : {}, {
        m: currentTab.value === 0,
        n: common_vendor.p({
          type: "calendar-filled",
          size: "20",
          color: "#FF6B00"
        }),
        o: common_vendor.f(activities.value, (activity, k0, i0) => {
          return {
            a: activity.id,
            b: "302d9b55-5-" + i0,
            c: common_vendor.p({
              activity,
              ["is-login"]: isUserLoggedIn.value
            })
          };
        }),
        p: common_vendor.p({
          status: activityLoadingStatus.value
        }),
        q: activities.value.length === 0 && activityLoadingStatus.value === "noMore"
      }, activities.value.length === 0 && activityLoadingStatus.value === "noMore" ? {
        r: common_vendor.o(navigateToPublish),
        s: common_vendor.o(navigateToSearchActive)
      } : {}, {
        t: currentTab.value === 1
      }), {
        f: loading.value,
        v: common_vendor.sr(smartGuidePopupRef, "302d9b55-7", {
          "k": "smartGuidePopupRef"
        }),
        w: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-302d9b55"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/location/location.js.map
