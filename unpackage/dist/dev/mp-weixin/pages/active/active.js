"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_unread = require("../../utils/unread.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + ActivityCard + SmartGuidePopup)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const pageSize = 10;
const _sfc_main = {
  __name: "active",
  setup(__props) {
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const pageNo = common_vendor.ref(1);
    const activitiesData = common_vendor.ref([]);
    const isLogin = common_vendor.ref(false);
    const bannerList = common_vendor.ref([]);
    const smartGuidePopupRef = common_vendor.ref(null);
    const searchKeyword = common_vendor.ref("");
    const typeList = common_vendor.ref([]);
    const typeIndex = common_vendor.ref(0);
    const selectedCategory = common_vendor.ref("");
    const statusList = common_vendor.ref([]);
    const statusIndex = common_vendor.ref(0);
    const selectedLocationInfo = common_vendor.ref(null);
    let filterDebounceTimer = null;
    const typePickerRange = common_vendor.computed(() => ["全部类型", ...typeList.value.map((item) => item.label)]);
    const statusPickerRange = common_vendor.computed(() => ["全部状态", ...statusList.value.map((item) => item.label)]);
    common_vendor.onMounted(() => {
      common_vendor.index.$on("activityInteractionChanged", (data) => {
        if (data.type === "action") {
          updateLocalActivityData(data.id, {
            userLikeStr: data.userLikeStr,
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount
          });
        } else if (data.type === "save") {
          updateLocalActivityData(data.id, {
            followFlag: data.isSaved ? 1 : 0
          });
        } else if (data.type === "comment") {
          updateLocalActivityData(data.id, {
            commonCount: data.totalCount
          });
        }
      });
      common_vendor.index.$on("refreshActivityList", () => {
        common_vendor.index.__f__("log", "at pages/active/active.vue:158", "收到刷新信号，执行静默刷新");
        silentRefresh();
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("activityInteractionChanged");
      common_vendor.index.$off("refreshActivityList");
    });
    common_vendor.onShow(() => {
      const token = common_vendor.index.getStorageSync("token");
      isLogin.value = !!token;
      if (activitiesData.value.length === 0) {
        initializePage();
      }
    });
    common_vendor.onPullDownRefresh(async () => {
      resetFilters();
      await initializePage();
      common_vendor.index.stopPullDownRefresh();
      utils_unread.fetchGlobalUnread();
    });
    common_vendor.onReachBottom(() => {
      if (hasMore.value && !loading.value) {
        getActiveList(true);
      }
    });
    const silentRefresh = async () => {
      pageNo.value = 1;
      hasMore.value = true;
      await getActiveList(false);
    };
    const updateLocalActivityData = (id, payload) => {
      const index = activitiesData.value.findIndex((item) => item.id == id);
      if (index !== -1) {
        activitiesData.value[index] = {
          ...activitiesData.value[index],
          ...payload
        };
      }
    };
    const handleLikeChange = async ({
      id,
      action,
      clickedAction
    }) => {
      const activity = activitiesData.value.find((item) => item.id == id);
      if (!activity)
        return;
      const originalAction = activity.userLikeStr;
      const originalLikes = activity.likesCount;
      const originalDislikes = activity.dislikesCount;
      if (action === "cancel") {
        activity.userLikeStr = null;
        clickedAction === "like" ? activity.likesCount-- : activity.dislikesCount--;
      } else {
        activity.userLikeStr = clickedAction;
        if (clickedAction === "like") {
          activity.likesCount++;
          if (originalAction === "dislike")
            activity.dislikesCount--;
        } else {
          activity.dislikesCount++;
          if (originalAction === "like")
            activity.likesCount--;
        }
      }
      const {
        error
      } = await utils_request.request("/app-api/member/like-action/add", {
        method: "POST",
        data: {
          targetId: id,
          targetType: "activity",
          action
        }
      });
      if (error) {
        activity.userLikeStr = originalAction;
        activity.likesCount = originalLikes;
        activity.dislikesCount = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const initializePage = async () => {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        pageNo.value = 1;
        hasMore.value = true;
        activitiesData.value = [];
        await Promise.all([
          fetchBanners(),
          fetchActivityTypeList(),
          fetchActivityStatusList()
        ]);
        await getActiveList(false);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:318", "[聚会列表] 初始化失败:", error);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const fetchBanners = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/banner-rec/list", {
        method: "GET",
        data: {
          positionCode: "0",
          pageNo: 1,
          pageSize: 50
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:344", "[轮播图] 获取失败:", error);
        bannerList.value = [];
        return;
      }
      bannerList.value = data && data.list ? data.list.sort((a, b) => a.sort - b.sort) : [];
    };
    const fetchActivityTypeList = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/system/dict-data/type", {
        data: {
          type: "member_activity_category"
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:365", "[类型列表] 获取失败:", error);
        throw new Error("获取类型失败");
      }
      typeList.value = data || [];
    };
    const fetchActivityStatusList = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/activity/status-list");
      if (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:380", "[状态列表] 获取失败:", error);
        throw new Error("获取状态失败");
      }
      statusList.value = data || [];
    };
    const getActiveList = async (isLoadMore = false) => {
      if (loading.value)
        return;
      if (isLoadMore && !hasMore.value)
        return;
      loading.value = true;
      if (!isLoadMore)
        pageNo.value = 1;
      const selectedStatusItem = statusIndex.value > 0 ? statusList.value[statusIndex.value - 1] : null;
      const params = {
        pageNo: pageNo.value,
        pageSize,
        name: searchKeyword.value,
        category: selectedCategory.value,
        status: selectedStatusItem ? selectedStatusItem.value : "",
        longitude: selectedLocationInfo.value ? selectedLocationInfo.value.longitude : "",
        latitude: selectedLocationInfo.value ? selectedLocationInfo.value.latitude : ""
      };
      try {
        const result = await utils_request.request("/app-api/member/activity/list", {
          method: "GET",
          data: params
        });
        if (result.error) {
          if (result.error.includes("信息绑定")) {
            await utils_user.checkLoginGuard();
            loading.value = false;
            return;
          }
          common_vendor.index.showToast({
            title: result.error,
            icon: "none"
          });
          hasMore.value = false;
          return;
        }
        if (result && result.data) {
          const {
            list = [],
            total = 0
          } = result.data;
          isLoadMore ? activitiesData.value.push(...list) : activitiesData.value = list;
          hasMore.value = activitiesData.value.length < total;
          pageNo.value++;
        } else {
          hasMore.value = false;
        }
        utils_unread.fetchGlobalUnread();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:446", "[聚会列表] 请求异常:", error);
        hasMore.value = false;
      } finally {
        loading.value = false;
      }
    };
    const handleTopScan = () => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:459", "🚀 准备扫码...");
      common_vendor.index.scanCode({
        // 1. 【关键】不要写 scanType: ['qrCode']，直接去掉这个参数
        // 或者写成 ['qrCode', 'barCode', 'datamatrix', 'pdf417']，但建议直接删掉
        onlyFromCamera: true,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/active/active.vue:466", "✅ 扫码原始结果:", res);
          let targetPath = res.path;
          if (targetPath) {
            const finalUrl = targetPath.startsWith("/") ? targetPath : "/" + targetPath;
            common_vendor.index.__f__("log", "at pages/active/active.vue:475", "🔗 目标跳转路径:", finalUrl);
            common_vendor.index.navigateTo({
              url: finalUrl,
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/active/active.vue:480", "❌ 跳转失败:", err);
                common_vendor.index.showModal({
                  title: "跳转失败",
                  content: "路径可能未配置：" + finalUrl,
                  showCancel: false
                });
              }
            });
          } else {
            common_vendor.index.showModal({
              title: "提示",
              content: "此码不是有效的核销小程序码\n解析内容：" + (res.result || "空"),
              showCancel: false
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/active/active.vue:498", "❌ 扫码过程出错/取消:", err);
        }
      });
    };
    const selectType = (index) => {
      typeIndex.value = index;
      selectedCategory.value = index === 0 ? "" : typeList.value[index - 1].value;
    };
    const selectStatus = (index) => {
      statusIndex.value = index;
    };
    const resetFilters = () => {
      searchKeyword.value = "";
      typeIndex.value = 0;
      selectedCategory.value = "";
      statusIndex.value = 0;
      selectedLocationInfo.value = null;
    };
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          selectedLocationInfo.value = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
        },
        fail: (err) => {
          if (err.errMsg.includes("auth deny") || err.errMsg.includes("auth denied")) {
            common_vendor.index.showModal({
              title: "定位权限未开启",
              content: "需要您的位置权限来筛选附近的聚会，是否前往设置开启？",
              success: (res) => {
                if (res.confirm)
                  common_vendor.index.openSetting();
              }
            });
          }
        }
      });
    };
    const handleFavoriteChange = (event) => {
      const activity = activitiesData.value.find((a) => a.id == event.id);
      if (activity)
        activity.followFlag = event.newFollowFlag;
    };
    const publishActivity = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/active-publish/active-publish"
      });
    };
    const handleBannerClick = async (banner) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (!banner || !banner.targetUrl)
        return;
      common_vendor.index.navigateTo({
        url: "/packages/active-detail/active-detail?id=" + banner.targetUrl
      });
    };
    common_vendor.watch(
      [searchKeyword, selectedCategory, statusIndex, selectedLocationInfo],
      () => {
        clearTimeout(filterDebounceTimer);
        filterDebounceTimer = setTimeout(() => {
          common_vendor.index.showLoading({
            title: "正在筛选..."
          });
          getActiveList(false).finally(() => common_vendor.index.hideLoading());
        }, 300);
      },
      {
        deep: true
      }
    );
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      let sharePath = "/pages/active/active";
      if (inviteCode)
        sharePath += "?inviteCode=" + inviteCode;
      return {
        title: "发现一个超棒的商友聚会平台，快来看看吧！",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      return {
        title: "发现一个超棒的商友聚会平台，快来看看吧！",
        query: inviteCode ? "inviteCode=" + inviteCode : "",
        imageUrl: "https://img.gofor.club/logo.png"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedLocationInfo.value ? selectedLocationInfo.value.name || "已选位置" : "选择位置"),
        b: common_vendor.p({
          type: "bottom",
          size: "12",
          color: "#333"
        }),
        c: common_vendor.o(openMapToChooseLocation),
        d: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: common_vendor.p({
          type: "scan",
          size: "26",
          color: "#FF6B00"
        }),
        h: common_vendor.o(handleTopScan),
        i: bannerList.value.length > 0
      }, bannerList.value.length > 0 ? {
        j: common_vendor.f(bannerList.value, (banner, k0, i0) => {
          return {
            a: banner.imageUrl,
            b: banner.id,
            c: common_vendor.o(($event) => handleBannerClick(banner), banner.id)
          };
        })
      } : {}, {
        k: common_vendor.f(typePickerRange.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: "type" + index,
            c: typeIndex.value === index ? 1 : "",
            d: common_vendor.o(($event) => selectType(index), "type" + index)
          };
        }),
        l: common_vendor.f(statusPickerRange.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: "status" + index,
            c: statusIndex.value === index ? 1 : "",
            d: common_vendor.o(($event) => selectStatus(index), "status" + index)
          };
        }),
        m: common_vendor.f(activitiesData.value, (activity, k0, i0) => {
          return {
            a: activity.id,
            b: common_vendor.o(handleFavoriteChange, activity.id),
            c: common_vendor.o(handleLikeChange, activity.id),
            d: "12e513cf-3-" + i0,
            e: common_vendor.p({
              activity,
              ["is-login"]: isLogin.value
            })
          };
        }),
        n: !hasMore.value && activitiesData.value.length > 0
      }, !hasMore.value && activitiesData.value.length > 0 ? {} : {}, {
        o: !loading.value && activitiesData.value.length === 0
      }, !loading.value && activitiesData.value.length === 0 ? {
        p: common_vendor.p({
          type: "info",
          size: "50",
          color: "#ddd"
        }),
        q: common_vendor.o(resetFilters)
      } : {}, {
        r: common_vendor.p({
          type: "plus",
          size: "18",
          color: "white"
        }),
        s: common_vendor.o(publishActivity),
        t: common_vendor.sr(smartGuidePopupRef, "12e513cf-6", {
          "k": "smartGuidePopupRef"
        }),
        v: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12e513cf"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active/active.js.map
