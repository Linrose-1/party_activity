"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_shakeLock = require("../../utils/shakeLock.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_datetime_picker2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_datetime_picker + _easycom_uni_load_more)();
}
const themeColor = "#FF7500";
const _sfc_main = {
  __name: "relation",
  setup(__props) {
    const {
      isShakeLocked,
      lockShake
    } = utils_shakeLock.useShakeLock();
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
    common_vendor.ref(false);
    const timeRangeText = common_vendor.computed(() => {
      if (timeRange.value && timeRange.value.length === 2) {
        const start = timeRange.value[0].slice(5, 16);
        const end = timeRange.value[1].slice(5, 16);
        return `${start} - ${end}`;
      }
      return "请选择拟访友时段";
    });
    const isListEmpty = common_vendor.computed(() => userList.value.length === 0 && loadingStatus.value !== "loading");
    const fetchUserList = async (isRefresh = false) => {
      if (isRefresh) {
        common_vendor.index.stopPullDownRefresh();
      }
      if (!destination.value.longitude || timeRange.value.length < 2) {
        userList.value = [];
        loadingStatus.value = "noMore";
        return;
      }
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh) {
        queryParams.pageNo = 1;
        userList.value = [];
        loadingStatus.value = "more";
      }
      loadingStatus.value = "loading";
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
        const newList = data.list || [];
        userList.value = isRefresh ? newList : [...userList.value, ...newList];
        total.value = data.total;
        loadingStatus.value = userList.value.length >= total.value ? "noMore" : "more";
      } catch (err) {
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: err.message || "加载失败",
          icon: "none"
        });
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
      const defaultAvatar = "/static/icon/default-avatar.png";
      const name = user.nickname || "匿名用户";
      const avatarUrl = user.avatar || defaultAvatar;
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:373", "从人脉列表页跳转，URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    const resetFilters = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要重置所有筛选条件吗？",
        success: (res) => {
          if (res.confirm) {
            destination.value = {};
            timeRange.value = [];
            fetchUserList(true);
            common_vendor.index.showToast({
              title: "已重置",
              icon: "none"
            });
          }
        }
      });
    };
    const handleChooseLocation = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.chooseLocation({
        success: (res) => destination.value = res
      });
    };
    const handleTimeChange = async (e) => {
      if (!await utils_user.checkLoginGuard()) {
        timeRange.value = [];
        return;
      }
      timeRange.value = e;
    };
    const switchTab = (tabIndex) => activeTab.value = tabIndex;
    const goToShakePage = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/location/location?autoShake=true"
      });
    };
    const goToviewPath = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/location/location?autoShake=true"
      });
    };
    common_vendor.watch([destination, timeRange], updateNextLocation);
    common_vendor.watch(activeTab, () => fetchUserList(true));
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:448", "人脉页 onShow: 开始监听摇一摇");
      common_vendor.index.onAccelerometerChange((res) => {
        if (Math.abs(res.x) > 1.5 || Math.abs(res.y) > 1.5 || Math.abs(res.z) > 1.5) {
          if (!isShakeLocked.value) {
            lockShake();
            common_vendor.index.__f__("log", "at pages/relation/relation.vue:460", "检测到摇一摇，准备跳转...");
            goToShakePage();
          }
        }
      });
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:471", "人脉页 onHide: 停止监听摇一摇");
      common_vendor.index.stopAccelerometer();
    });
    common_vendor.onLoad(() => {
    });
    common_vendor.onPullDownRefresh(() => {
      fetchUserList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        queryParams.pageNo++;
        fetchUserList(false);
      }
    });
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:495", `[分享] 准备分享人脉页面给好友，邀请码: ${inviteCode}`);
      let sharePath = "/pages/relation/relation";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "来这里拓展你的人脉圈，发现无限商机！",
        path: sharePath,
        imageUrl: "/static/connections-bg.png"
        // 使用页面头部的背景图作为分享封面
      };
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:511", "[分享] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:523", `[分享] 准备分享人脉页面到朋友圈，邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "来这里拓展你的人脉圈，发现无限商机！",
        query: queryString,
        imageUrl: "/static/connections-bg.png"
        // 使用页面头部的背景图作为分享封面
      };
      common_vendor.index.__f__("log", "at pages/relation/relation.vue:538", "[分享] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.o(goToviewPath),
        c: common_vendor.p({
          type: "personadd",
          size: "42",
          color: "#fff"
        }),
        d: common_vendor.o(goToShakePage),
        e: common_vendor.p({
          type: "refreshempty",
          size: "16",
          color: "#666"
        }),
        f: common_vendor.o(resetFilters),
        g: common_vendor.p({
          type: "paperplane",
          size: "20",
          color: "#999"
        }),
        h: common_vendor.t(destination.value.name || "请选择拟访友地点"),
        i: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        j: common_vendor.o(handleChooseLocation),
        k: common_vendor.p({
          type: "calendar",
          size: "20",
          color: "#999"
        }),
        l: common_vendor.t(timeRangeText.value),
        m: common_vendor.o(handleTimeChange),
        n: common_vendor.o(($event) => timeRange.value = $event),
        o: common_vendor.p({
          type: "datetimerange",
          modelValue: timeRange.value
        }),
        p: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        q: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: activeTab.value === 0 ? themeColor : "#666"
        }),
        r: activeTab.value === 0 ? 1 : "",
        s: common_vendor.o(($event) => switchTab(0)),
        t: common_vendor.p({
          type: "heart-filled",
          size: "18",
          color: activeTab.value === 1 ? themeColor : "#666"
        }),
        v: activeTab.value === 1 ? 1 : "",
        w: common_vendor.o(($event) => switchTab(1)),
        x: common_vendor.f(userList.value, (user, k0, i0) => {
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
        y: isListEmpty.value
      }, isListEmpty.value ? {
        z: common_vendor.p({
          type: "staff",
          size: "60",
          color: "#e0e0e0"
        })
      } : {}, {
        A: userList.value.length > 0 || loadingStatus.value === "loading"
      }, userList.value.length > 0 || loadingStatus.value === "loading" ? {
        B: common_vendor.p({
          status: loadingStatus.value,
          contentText: {
            contentdown: "上拉加载更多",
            contentrefresh: "正在加载...",
            contentnomore: "—— 我是有底线的 ——"
          }
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85e55c19"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/relation/relation.js.map
