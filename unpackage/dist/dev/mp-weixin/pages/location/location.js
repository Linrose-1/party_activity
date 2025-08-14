"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
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
  (_easycom_uni_segmented_control + _easycom_uni_icons + ActivityCard + _easycom_uni_load_more)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const _sfc_main = {
  __name: "location",
  setup(__props) {
    let shakeAudioContext = null;
    const currentTab = common_vendor.ref(0);
    const tabItems = ["活动", "商友"];
    const shaken = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const shakeDebounce = common_vendor.ref(true);
    const userLocation = common_vendor.ref(null);
    const activityPageNo = common_vendor.ref(1);
    const businessPageNo = common_vendor.ref(1);
    const activityLoadingStatus = common_vendor.ref("more");
    const businessLoadingStatus = common_vendor.ref("more");
    const isFollowActionInProgress = common_vendor.ref(false);
    const activities = common_vendor.ref([]);
    const businesses = common_vendor.ref([]);
    const resetState = () => {
      common_vendor.index.__f__("log", "at pages/location/location.vue:110", "页面状态已重置");
      shaken.value = false;
      loading.value = false;
      activities.value = [];
      businesses.value = [];
      activityPageNo.value = 1;
      businessPageNo.value = 1;
      activityLoadingStatus.value = "more";
      businessLoadingStatus.value = "more";
      shakeDebounce.value = true;
    };
    const handleTabClick = (e) => {
      currentTab.value = e.currentIndex;
    };
    const triggerShakeSequence = () => {
      if (!shakeDebounce.value)
        return;
      if (shakeAudioContext) {
        shakeAudioContext.stop();
        shakeAudioContext.play();
      }
      shakeDebounce.value = false;
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
            common_vendor.index.__f__("error", "at pages/location/location.vue:163", "加载初始数据时发生错误:", error);
          } finally {
            loading.value = false;
            setTimeout(() => {
              shakeDebounce.value = true;
            }, 1e3);
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "获取位置失败",
            icon: "none"
          });
          shakeDebounce.value = true;
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
      const currentUserId = common_vendor.index.getStorageSync("userId");
      if (!currentUserId) {
        common_vendor.index.showModal({
          title: "需要登录",
          content: "关注功能需要登录后才能使用，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
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
      const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.__f__("log", "at pages/location/location.vue:336", "从摇一摇页跳转，URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    common_vendor.onShow(() => {
      resetState();
      shakeAudioContext = common_vendor.index.createInnerAudioContext();
      shakeAudioContext.src = "https://img.gofor.club/wechat_shake.mp3";
      common_vendor.index.onAccelerometerChange((res) => {
        if (Math.abs(res.x) > 1.2 && Math.abs(res.y) > 1.2) {
          triggerShakeSequence();
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
      if (currentTab.value === 0 && activityLoadingStatus.value === "more") {
        getNearbyActivities();
      } else if (currentTab.value === 1 && businessLoadingStatus.value === "more") {
        getNearbyBusinesses();
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
          type: "calendar-filled",
          size: "20",
          color: "#FF6B00"
        }),
        h: common_vendor.f(activities.value, (activity, k0, i0) => {
          return {
            a: activity.id,
            b: "4d9b4fcb-3-" + i0,
            c: common_vendor.p({
              activity
            })
          };
        }),
        i: common_vendor.p({
          status: activityLoadingStatus.value
        }),
        j: activities.value.length === 0 && activityLoadingStatus.value === "noMore"
      }, activities.value.length === 0 && activityLoadingStatus.value === "noMore" ? {} : {}, {
        k: currentTab.value === 0,
        l: common_vendor.p({
          type: "staff-filled",
          size: "20",
          color: "#FF6B00"
        }),
        m: common_vendor.f(businesses.value, (business, k0, i0) => {
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
            h: common_vendor.t(business.followFlag === 1 ? "已关注" : "关注"),
            i: business.followFlag === 1 ? 1 : "",
            j: common_vendor.o(($event) => handleFollowAction(business), business.id),
            k: business.id
          });
        }),
        n: common_vendor.p({
          status: businessLoadingStatus.value
        }),
        o: businesses.value.length === 0 && businessLoadingStatus.value === "noMore"
      }, businesses.value.length === 0 && businessLoadingStatus.value === "noMore" ? {} : {}, {
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
