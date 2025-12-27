"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_shakeLock = require("../../utils/shakeLock.js");
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
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_load_more + ActivityCard)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
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
    const tabItems = ["商友", "聚会"];
    const shaken = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    common_vendor.ref(true);
    const userLocation = common_vendor.ref(null);
    const activityPageNo = common_vendor.ref(1);
    const businessPageNo = common_vendor.ref(1);
    const activityLoadingStatus = common_vendor.ref("more");
    const businessLoadingStatus = common_vendor.ref("more");
    const isFollowActionInProgress = common_vendor.ref(false);
    const activities = common_vendor.ref([]);
    const businesses = common_vendor.ref([]);
    const resetState = () => {
      common_vendor.index.__f__("log", "at pages/location/location.vue:136", "页面状态已重置");
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
      currentTab.value = e.currentIndex;
    };
    const triggerShakeSequence = () => {
      lockShake();
      if (shakeAudioContext) {
        shakeAudioContext.stop();
        shakeAudioContext.play();
      }
      getLocationAndProceed();
    };
    const getLocationAndProceed = () => {
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
          try {
            await Promise.all([
              getNearbyActivities(true),
              getNearbyBusinesses(true)
            ]);
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/location/location.vue:198", "加载初始数据时发生错误:", error);
          } finally {
            loading.value = false;
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "获取位置失败",
            icon: "none"
          });
          lockShake(1e3);
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
      if (!user || !user.id) {
        common_vendor.index.showToast({
          title: "无法查看该用户主页",
          icon: "none"
        });
        return;
      }
      const defaultAvatar = "/static/icon/default-avatar.png";
      const name = user.nickname || "匿名用户";
      const avatarUrl = user.avatar || defaultAvatar;
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.__f__("log", "at pages/location/location.vue:375", "从摇一摇页跳转，URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    common_vendor.onLoad((options) => {
      if (options.autoShake === "true") {
        common_vendor.index.__f__("log", "at pages/location/location.vue:387", "onLoad: 接收到自动摇一摇指令");
        autoShakeOnLoad.value = true;
      }
    });
    common_vendor.onShow(() => {
      checkLoginStatus();
      shakeAudioContext = common_vendor.index.createInnerAudioContext();
      shakeAudioContext.src = "https://img.gofor.club/wechat_shake.mp3";
      resetState();
      if (autoShakeOnLoad.value) {
        common_vendor.index.__f__("log", "at pages/location/location.vue:406", "onShow: 执行自动摇一摇流程");
        triggerShakeSequence();
        autoShakeOnLoad.value = false;
      } else {
        common_vendor.index.__f__("log", "at pages/location/location.vue:412", "onShow: 正常进入，等待用户手动触发");
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
            common_vendor.index.__f__("log", "at pages/location/location.vue:442", "触底加载更多商友...");
            getNearbyBusinesses();
          }
          break;
        case 1:
          if (activityLoadingStatus.value === "more") {
            common_vendor.index.__f__("log", "at pages/location/location.vue:449", "触底加载更多聚会...");
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
          values: tabItems,
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
            i: business.fellowTownspeopleCityFlag === 1
          }, business.fellowTownspeopleCityFlag === 1 ? {} : {}, {
            j: business.peerFlag === 1
          }, business.peerFlag === 1 ? {} : {}, {
            k: business.classmateFlag === 1
          }, business.classmateFlag === 1 ? {} : {}) : {}, {
            l: common_vendor.t(business.followFlag === 1 ? "取关" : "关注"),
            m: business.followFlag === 1 ? 1 : "",
            n: common_vendor.o(($event) => handleFollowAction(business), business.id),
            o: business.id
          });
        }),
        i: common_vendor.p({
          status: businessLoadingStatus.value
        }),
        j: businesses.value.length === 0 && businessLoadingStatus.value === "noMore"
      }, businesses.value.length === 0 && businessLoadingStatus.value === "noMore" ? {} : {}, {
        k: currentTab.value === 0,
        l: common_vendor.p({
          type: "calendar-filled",
          size: "20",
          color: "#FF6B00"
        }),
        m: common_vendor.f(activities.value, (activity, k0, i0) => {
          return {
            a: activity.id,
            b: "4d9b4fcb-5-" + i0,
            c: common_vendor.p({
              activity,
              ["is-login"]: isUserLoggedIn.value
            })
          };
        }),
        n: common_vendor.p({
          status: activityLoadingStatus.value
        }),
        o: activities.value.length === 0 && activityLoadingStatus.value === "noMore"
      }, activities.value.length === 0 && activityLoadingStatus.value === "noMore" ? {} : {}, {
        p: currentTab.value === 1
      }), {
        f: loading.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4d9b4fcb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/location/location.js.map
