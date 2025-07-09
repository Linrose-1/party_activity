"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + ActivityCard)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const _sfc_main = {
  __name: "location",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabItems = ["活动", "商友"];
    const shaken = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const shakeDebounce = common_vendor.ref(true);
    const userLocation = common_vendor.ref(null);
    const activityPageNo = common_vendor.ref(1);
    const activityHasMore = common_vendor.ref(true);
    const businessPageNo = common_vendor.ref(1);
    const businessHasMore = common_vendor.ref(true);
    const activities = common_vendor.ref([]);
    const businesses = common_vendor.ref([]);
    const handleTabClick = (e) => {
      currentTab.value = e.currentIndex;
    };
    const triggerShakeSequence = () => {
      if (!shakeDebounce.value)
        return;
      shakeDebounce.value = false;
      getLocationAndProceed();
    };
    const getLocationAndProceed = () => {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: async (res) => {
          common_vendor.index.__f__("log", "at pages/location/location.vue:134", "✅ 获取用户位置成功:", res);
          userLocation.value = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          shaken.value = true;
          loading.value = true;
          common_vendor.index.vibrateShort();
          try {
            await Promise.all([
              getNearbyActivities(false),
              getNearbyBusinesses(false)
            ]);
            common_vendor.index.__f__("log", "at pages/location/location.vue:151", "✅ 附近活动和商友数据均已加载完毕");
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/location/location.vue:153", "❌ 加载初始数据时发生错误:", error);
          } finally {
            loading.value = false;
            setTimeout(() => {
              shakeDebounce.value = true;
            }, 1e3);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/location/location.vue:164", "❌ 获取位置失败:", err);
          shakeDebounce.value = true;
        }
      });
    };
    const getNearbyActivities = async (isLoadMore = false) => {
      if (isLoadMore && (!activityHasMore.value || loading.value))
        return;
      if (isLoadMore)
        loading.value = true;
      if (!isLoadMore) {
        activityPageNo.value = 1;
        activities.value = [];
        activityHasMore.value = true;
      }
      const params = {
        pageNo: activityPageNo.value,
        pageSize: 10,
        longitude: userLocation.value.longitude,
        latitude: userLocation.value.latitude
      };
      const result = await utils_request.request("/app-api/member/activity/list", {
        method: "GET",
        data: params
      });
      if (result && !result.error && result.data) {
        const list = result.data.list || [];
        activities.value = isLoadMore ? [...activities.value, ...list] : list;
        if (activities.value.length >= result.data.total)
          activityHasMore.value = false;
        activityPageNo.value++;
      } else {
        activityHasMore.value = false;
      }
      if (isLoadMore)
        loading.value = false;
    };
    const getNearbyBusinesses = async (isLoadMore = false) => {
      if (isLoadMore && (!businessHasMore.value || loading.value))
        return;
      if (isLoadMore)
        loading.value = true;
      if (!isLoadMore) {
        businessPageNo.value = 1;
        businesses.value = [];
        businessHasMore.value = true;
      }
      const params = {
        pageNo: businessPageNo.value,
        pageSize: 10,
        longitude: userLocation.value.longitude,
        latitude: userLocation.value.latitude
      };
      common_vendor.index.__f__("log", "at pages/location/location.vue:231", "发起附近商友列表请求, 参数:", params);
      const result = await utils_request.request("/app-api/member/user/list", {
        method: "GET",
        data: params
      });
      common_vendor.index.__f__("log", "at pages/location/location.vue:236", "发起附近商友列表result:", result);
      if (result && !result.error && result.data) {
        const list = result.data.list || [];
        list.forEach((item) => {
          item.isFollowed = false;
          item.loading = false;
        });
        businesses.value = isLoadMore ? [...businesses.value, ...list] : list;
        if (businesses.value.length >= result.data.total) {
          businessHasMore.value = false;
        }
        businessPageNo.value++;
      } else {
        common_vendor.index.__f__("error", "at pages/location/location.vue:250", "获取附近商友列表失败:", result.error);
        businessHasMore.value = false;
      }
      if (isLoadMore)
        loading.value = false;
    };
    const handleConnect = async (business) => {
      business.loading = true;
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        business.loading = false;
        return;
      }
      const endpoint = business.isFollowed ? "/app-api/member/follow/del" : "/app-api/member/follow/add";
      const successMessage = business.isFollowed ? "已取消关注" : "关注成功";
      const payload = {
        userId,
        targetId: business.id,
        targetType: "post_user"
        // 【关键】目标类型为用户
      };
      const result = await utils_request.request(endpoint, {
        method: "POST",
        data: payload
      });
      if (result && !result.error) {
        common_vendor.index.showToast({
          title: successMessage,
          icon: "success"
        });
        business.isFollowed = !business.isFollowed;
      } else {
        common_vendor.index.showToast({
          title: result.error || "操作失败",
          icon: "none"
        });
      }
      business.loading = false;
    };
    common_vendor.onMounted(() => {
      common_vendor.index.onAccelerometerChange((res) => {
        if (Math.abs(res.x) > 1 && Math.abs(res.y) > 1) {
          triggerShakeSequence();
        }
      });
    });
    common_vendor.onUnmounted(() => common_vendor.index.stopAccelerometer());
    common_vendor.onReachBottom(() => {
      if (loading.value)
        return;
      if (currentTab.value === 0 && activityHasMore.value) {
        common_vendor.index.__f__("log", "at pages/location/location.vue:321", "滑动到底部，加载更多附近活动...");
        getNearbyActivities(true);
      } else if (currentTab.value === 1 && businessHasMore.value) {
        common_vendor.index.__f__("log", "at pages/location/location.vue:324", "滑动到底部，加载更多附近商友...");
        getNearbyBusinesses(true);
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
            b: common_vendor.o(triggerShakeSequence, activity.id),
            c: "4d9b4fcb-3-" + i0,
            d: common_vendor.p({
              activity
            })
          };
        }),
        i: !activityHasMore.value && activities.value.length > 0
      }, !activityHasMore.value && activities.value.length > 0 ? {} : {}, {
        j: activities.value.length === 0
      }, activities.value.length === 0 ? {} : {}, {
        k: currentTab.value === 0,
        l: common_vendor.p({
          type: "staff-filled",
          size: "20",
          color: "#FF6B00"
        }),
        m: common_vendor.f(businesses.value, (business, k0, i0) => {
          return common_vendor.e({
            a: business.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(business.nickname),
            c: business.professionalTitle
          }, business.professionalTitle ? {
            d: common_vendor.t(business.professionalTitle)
          } : {}, {
            e: business.companyName
          }, business.companyName ? {
            f: common_vendor.t(business.companyName)
          } : {}, {
            g: common_vendor.t(business.isFollowed ? "已关注" : "关注"),
            h: common_vendor.o(($event) => handleConnect(business), business.id),
            i: business.loading,
            j: business.isFollowed ? 1 : "",
            k: business.id
          });
        }),
        n: !businessHasMore.value && businesses.value.length > 0
      }, !businessHasMore.value && businesses.value.length > 0 ? {} : {}, {
        o: businesses.value.length === 0
      }, businesses.value.length === 0 ? {} : {}, {
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
