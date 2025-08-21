"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  (_easycom_uni_icons2 + _easycom_uni_datetime_picker2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_datetime_picker)();
}
const themeColor = "#FF7500";
const _sfc_main = {
  __name: "relation",
  setup(__props) {
    const formatDateTime = (date) => {
      if (!(date instanceof Date))
        return "";
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      const s = date.getSeconds().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const destination = common_vendor.ref({});
    const timeRange = common_vendor.ref([]);
    const activeTab = common_vendor.ref(0);
    const userList = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const loadingStatus = common_vendor.ref("more");
    const queryParams = common_vendor.reactive({
      pageNo: 1,
      pageSize: 10
    });
    const isFollowActionInProgress = common_vendor.ref(false);
    const isShaking = common_vendor.ref(false);
    const timeRangeText = common_vendor.computed(() => {
      if (timeRange.value && timeRange.value.length === 2) {
        const start = timeRange.value[0].slice(5, 16);
        const end = timeRange.value[1].slice(5, 16);
        return `${start} - ${end}`;
      }
      return "请选择时间范围";
    });
    const isListEmpty = common_vendor.computed(() => userList.value.length === 0 && loadingStatus.value !== "loading");
    const fetchUserList = async (isRefresh = false) => {
      if (!destination.value.longitude || timeRange.value.length < 2) {
        userList.value = [];
        loadingStatus.value = "no-more";
        return;
      }
      if (loadingStatus.value === "loading")
        return;
      loadingStatus.value = "loading";
      if (isRefresh) {
        queryParams.pageNo = 1;
        userList.value = [];
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/connection-list", {
          method: "GET",
          data: {
            ...queryParams,
            longitude: destination.value.longitude,
            latitude: destination.value.latitude,
            nextLocationTime: formatDateTime(new Date(timeRange.value[0])),
            tabIndex: activeTab.value
          }
        });
        if (error)
          throw new Error(error);
        userList.value = [...userList.value, ...data.list];
        total.value = data.total;
        loadingStatus.value = userList.value.length >= total.value ? "no-more" : "more";
      } catch (err) {
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: err.message,
          icon: "none"
        });
      } finally {
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const updateNextLocation = async () => {
      if (!destination.value.longitude || timeRange.value.length < 2)
        return;
      common_vendor.index.showLoading({
        title: "正在规划行程..."
      });
      const {
        error
      } = await utils_request.request("/app-api/member/user/upload-next-location", {
        method: "POST",
        data: {
          longitude: destination.value.longitude,
          latitude: destination.value.latitude,
          nextLocationStartTime: formatDateTime(new Date(timeRange.value[0])),
          nextLocationEndTime: formatDateTime(new Date(timeRange.value[1]))
        }
      });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({
          title: `行程规划失败: ${error}`,
          icon: "none"
        });
      } else {
        common_vendor.index.showToast({
          title: "行程已更新",
          icon: "success"
        });
        fetchUserList(true);
      }
    };
    const handleFollowAction = async (user) => {
      if (isFollowActionInProgress.value)
        return;
      const currentUserId = common_vendor.index.getStorageSync("userId");
      if (!currentUserId) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isFollowActionInProgress.value = true;
      const originalFollowStatus = user.followToFlag;
      const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
      const apiUrl = newFollowStatus === 1 ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      const successMsg = newFollowStatus === 1 ? "关注成功" : "已取消关注";
      user.followToFlag = newFollowStatus;
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
        if (error) {
          throw new Error(error);
        }
        common_vendor.index.showToast({
          title: successMsg,
          icon: "success"
        });
      } catch (err) {
        user.followToFlag = originalFollowStatus;
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
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:327", "从人脉列表页跳转，URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    const handleChooseLocation = () => common_vendor.index.chooseLocation({
      success: (res) => destination.value = res
    });
    const handleTimeChange = (e) => timeRange.value = e;
    const switchTab = (tabIndex) => activeTab.value = tabIndex;
    const goToShakePage = () => common_vendor.index.navigateTo({
      url: "/pages/location/location"
    });
    common_vendor.watch([destination, timeRange], updateNextLocation);
    common_vendor.watch(activeTab, () => fetchUserList(true));
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:354", "人脉页 onShow: 开始监听摇一摇");
      isShaking.value = false;
      common_vendor.index.onAccelerometerChange((res) => {
        if (Math.abs(res.x) > 1.5 || Math.abs(res.y) > 1.5 || Math.abs(res.z) > 1.5) {
          if (!isShaking.value) {
            isShaking.value = true;
            common_vendor.index.vibrateShort();
            common_vendor.index.__f__("log", "at pages/relation/relation.vue:370", "检测到摇一摇，准备跳转...");
            goToShakePage();
            setTimeout(() => {
              isShaking.value = false;
            }, 2e3);
          }
        }
      });
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:385", "人脉页 onHide: 停止监听摇一摇");
      common_vendor.index.stopAccelerometer();
    });
    common_vendor.onLoad(() => {
    });
    common_vendor.onPullDownRefresh(() => fetchUserList(true));
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        queryParams.pageNo++;
        fetchUserList(false);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$3,
        b: common_vendor.p({
          type: "personadd",
          size: "36",
          color: "#fff"
        }),
        c: common_vendor.o(goToShakePage),
        d: common_vendor.p({
          type: "paperplane",
          size: "20",
          color: "#999"
        }),
        e: common_vendor.t(destination.value.name || "请选择目的地"),
        f: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        g: common_vendor.o(handleChooseLocation),
        h: common_vendor.p({
          type: "calendar",
          size: "20",
          color: "#999"
        }),
        i: common_vendor.t(timeRangeText.value),
        j: common_vendor.o(handleTimeChange),
        k: common_vendor.o(($event) => timeRange.value = $event),
        l: common_vendor.p({
          type: "datetimerange",
          modelValue: timeRange.value
        }),
        m: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        n: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: activeTab.value === 0 ? themeColor : "#666"
        }),
        o: activeTab.value === 0 ? 1 : "",
        p: common_vendor.o(($event) => switchTab(0)),
        q: common_vendor.p({
          type: "heart-filled",
          size: "18",
          color: activeTab.value === 1 ? themeColor : "#666"
        }),
        r: activeTab.value === 1 ? 1 : "",
        s: common_vendor.o(($event) => switchTab(1)),
        t: common_vendor.f(userList.value, (user, k0, i0) => {
          return common_vendor.e({
            a: user.avatar,
            b: common_vendor.o(($event) => navigateToBusinessCard(user), user.id),
            c: common_vendor.t(user.nickname),
            d: user.levelName
          }, user.levelName ? {
            e: common_vendor.t(user.levelName)
          } : {}, {
            f: common_vendor.t(user.companyName),
            g: activeTab.value === 1 && user.followMyFlag === 1
          }, activeTab.value === 1 && user.followMyFlag === 1 ? {} : {}, {
            h: common_vendor.t(user.followToFlag === 1 ? "已关注" : "+ 关注"),
            i: user.followToFlag === 1 ? 1 : "",
            j: common_vendor.o(($event) => handleFollowAction(user), user.id),
            k: user.id
          });
        }),
        v: isListEmpty.value
      }, isListEmpty.value ? {
        w: common_vendor.p({
          type: "staff",
          size: "60",
          color: "#e0e0e0"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85e55c19"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/relation/relation.js.map
