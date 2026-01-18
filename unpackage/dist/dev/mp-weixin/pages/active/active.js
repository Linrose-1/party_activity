"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_collapse_item2 = common_vendor.resolveComponent("uni-collapse-item");
  const _easycom_uni_collapse2 = common_vendor.resolveComponent("uni-collapse");
  (_easycom_uni_icons2 + _easycom_uni_collapse_item2 + _easycom_uni_collapse2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_collapse_item = () => "../../uni_modules/uni-collapse/components/uni-collapse-item/uni-collapse-item.js";
const _easycom_uni_collapse = () => "../../uni_modules/uni-collapse/components/uni-collapse/uni-collapse.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_collapse_item + _easycom_uni_collapse + ActivityCard)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
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
    const searchKeyword = common_vendor.ref("");
    const typeList = common_vendor.ref([]);
    const typeIndex = common_vendor.ref(0);
    const selectedCategory = common_vendor.ref("");
    const statusList = common_vendor.ref([]);
    const statusIndex = common_vendor.ref(0);
    const selectedLocationInfo = common_vendor.ref(null);
    let filterDebounceTimer = null;
    const typePickerRange = common_vendor.computed(() => {
      const labels = typeList.value.map((item) => item.label);
      return ["全部类型", ...labels];
    });
    const statusPickerRange = common_vendor.computed(() => {
      const labels = statusList.value.map((item) => item.label);
      return ["全部状态", ...labels];
    });
    common_vendor.onShow(() => {
      const token = common_vendor.index.getStorageSync("token");
      isLogin.value = !!token;
      common_vendor.index.__f__("log", "at pages/active/active.vue:180", "页面显示，当前登录状态:", isLogin.value);
      initializePage();
    });
    common_vendor.onPullDownRefresh(async () => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:188", "用户触发了下拉刷新");
      await initializePage();
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:195", "滑动到底部，触发加载更多");
      if (hasMore.value && !loading.value) {
        getActiveList(true);
      }
    });
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
        common_vendor.index.__f__("error", "at pages/active/active.vue:230", "页面初始化失败:", error);
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
          // 固定参数
          pageNo: 1,
          pageSize: 50
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:257", "获取轮播图失败:", error);
        bannerList.value = [];
        return;
      }
      if (data && data.list) {
        bannerList.value = data.list.sort((a, b) => a.sort - b.sort);
        common_vendor.index.__f__("log", "at pages/active/active.vue:265", "轮播图数据获取成功:", bannerList.value);
      } else {
        bannerList.value = [];
      }
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
        common_vendor.index.__f__("error", "at pages/active/active.vue:284", "获取聚会类型列表失败:", error);
        throw new Error("获取类型失败");
      }
      typeList.value = data || [];
      common_vendor.index.__f__("log", "at pages/active/active.vue:289", "动态聚会类型列表获取成功:", typeList.value);
    };
    const fetchActivityStatusList = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/activity/status-list");
      if (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:298", "获取聚会状态列表失败:", error);
        throw new Error("获取状态失败");
      }
      statusList.value = data || [];
      common_vendor.index.__f__("log", "at pages/active/active.vue:302", "动态聚会状态列表获取成功:", statusList.value);
    };
    const getActiveList = async (isLoadMore = false) => {
      if (loading.value)
        return;
      if (isLoadMore && !hasMore.value)
        return;
      loading.value = true;
      if (!isLoadMore) {
        pageNo.value = 1;
      }
      const selectedStatusItem = statusIndex.value > 0 ? statusList.value[statusIndex.value - 1] : null;
      const params = {
        pageNo: pageNo.value,
        pageSize,
        name: searchKeyword.value,
        category: selectedCategory.value,
        // 使用动态选择的类型值
        status: selectedStatusItem ? selectedStatusItem.value : "",
        // 使用动态选择的状态值
        longitude: selectedLocationInfo.value ? selectedLocationInfo.value.longitude : "",
        latitude: selectedLocationInfo.value ? selectedLocationInfo.value.latitude : ""
      };
      try {
        common_vendor.index.__f__("log", "at pages/active/active.vue:334", "发起聚会列表请求, 参数:", params);
        const result = await utils_request.request("/app-api/member/activity/list", {
          method: "GET",
          data: params
        });
        if (result && !result.error && result.data) {
          const {
            list = [],
            total = 0
          } = result.data;
          if (isLoadMore) {
            activitiesData.value.push(...list);
          } else {
            activitiesData.value = list;
          }
          hasMore.value = activitiesData.value.length < total;
          pageNo.value++;
        } else {
          common_vendor.index.__f__("error", "at pages/active/active.vue:357", "获取聚会列表失败:", result ? result.error : "无有效返回");
          hasMore.value = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:361", "请求异常:", error);
        hasMore.value = false;
      } finally {
        loading.value = false;
      }
    };
    const resetFilters = () => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:371", "--- 重置所有筛选条件 ---");
      searchKeyword.value = "";
      typeIndex.value = 0;
      selectedCategory.value = "";
      statusIndex.value = 0;
      selectedLocationInfo.value = null;
      common_vendor.index.showToast({
        title: "筛选已重置",
        icon: "none"
      });
    };
    const bindTypePickerChange = (e) => {
      const newIndex = Number(e.detail.value);
      typeIndex.value = newIndex;
      if (newIndex === 0) {
        selectedCategory.value = "";
      } else {
        selectedCategory.value = typeList.value[newIndex - 1].value;
      }
    };
    const bindStatusPickerChange = (e) => {
      statusIndex.value = e.detail.value;
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
          common_vendor.index.__f__("log", "at pages/active/active.vue:421", "选择位置失败:", err);
          if (err.errMsg.includes("auth deny") || err.errMsg.includes("auth denied")) {
            common_vendor.index.showModal({
              title: "定位权限未开启",
              content: "需要您的位置权限来筛选附近的聚会，是否前往设置开启？",
              success: (res) => {
                if (res.confirm) {
                  common_vendor.index.openSetting();
                }
              }
            });
          }
        }
      });
    };
    const handleFavoriteChange = (event) => {
      const activityToUpdate = activitiesData.value.find((activity) => activity.id === event.id);
      if (activityToUpdate) {
        activityToUpdate.followFlag = event.newFollowFlag;
      }
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
      if (!banner || !banner.targetUrl) {
        common_vendor.index.__f__("log", "at pages/active/active.vue:462", "该轮播图没有配置跳转链接，不执行任何操作。");
        return;
      }
      const activityId = banner.targetUrl;
      common_vendor.index.__f__("log", "at pages/active/active.vue:468", `用户点击了轮播图，准备跳转到聚会详情页，ID: ${activityId}`);
      common_vendor.index.navigateTo({
        url: `/packages/active-detail/active-detail?id=${activityId}`
      });
    };
    common_vendor.watch(
      [searchKeyword, selectedCategory, statusIndex, selectedLocationInfo],
      () => {
        clearTimeout(filterDebounceTimer);
        filterDebounceTimer = setTimeout(() => {
          common_vendor.index.__f__("log", "at pages/active/active.vue:502", "筛选条件变化（已防抖），重新搜索...");
          common_vendor.index.showLoading({
            title: "正在筛选..."
          });
          getActiveList(false).finally(() => {
            common_vendor.index.hideLoading();
          });
        }, 300);
      },
      {
        deep: true
      }
    );
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/active/active.vue:525", `[分享] 准备分享给好友，获取到邀请码: ${inviteCode}`);
      let sharePath = "/pages/active/active";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个超棒的商友聚会平台，快来看看吧！",
        // 自定义分享标题
        path: sharePath,
        // 用户点击后进入的页面路径及参数
        imageUrl: "https://img.gofor.club/logo.png"
        // 自定义分享封面图，建议使用一个有代表性的图片URL
      };
      common_vendor.index.__f__("log", "at pages/active/active.vue:542", "[分享] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/active/active.vue:554", `[分享] 准备分享到朋友圈，获取到邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个超棒的商友聚会平台，快来看看吧！",
        // 朋友圈分享的标题
        query: queryString,
        // 传递的参数
        imageUrl: "https://img.gofor.club/logo.png"
        // 朋友圈分享的封面图
      };
      common_vendor.index.__f__("log", "at pages/active/active.vue:570", "[分享] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "rgba(255, 255, 255, 0.7)"
        }),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: bannerList.value.length > 0
      }, bannerList.value.length > 0 ? {
        e: common_vendor.f(bannerList.value, (banner, k0, i0) => {
          return common_vendor.e({
            a: banner.imageUrl,
            b: banner.title
          }, banner.title ? {
            c: common_vendor.t(banner.title)
          } : {}, {
            d: banner.id,
            e: common_vendor.o(($event) => handleBannerClick(banner), banner.id)
          });
        })
      } : {}, {
        f: common_vendor.o(resetFilters),
        g: common_vendor.t(typePickerRange.value[typeIndex.value]),
        h: common_vendor.o(bindTypePickerChange),
        i: typeIndex.value,
        j: typePickerRange.value,
        k: common_vendor.t(statusPickerRange.value[statusIndex.value]),
        l: common_vendor.o(bindStatusPickerChange),
        m: statusIndex.value,
        n: statusPickerRange.value,
        o: selectedLocationInfo.value
      }, selectedLocationInfo.value ? {
        p: common_vendor.t(selectedLocationInfo.value.address || selectedLocationInfo.value.name)
      } : {}, {
        q: common_vendor.o(openMapToChooseLocation),
        r: common_vendor.p({
          title: "聚会筛选",
          open: true
        }),
        s: common_vendor.f(activitiesData.value, (activity, index, i0) => {
          return {
            a: activity.id,
            b: common_vendor.o(handleFavoriteChange, activity.id),
            c: "12e513cf-3-" + i0,
            d: common_vendor.p({
              activity,
              ["is-login"]: isLogin.value
            })
          };
        }),
        t: !hasMore.value && activitiesData.value.length > 0
      }, !hasMore.value && activitiesData.value.length > 0 ? {} : {}, {
        v: !loading.value && activitiesData.value.length === 0
      }, !loading.value && activitiesData.value.length === 0 ? {} : {}, {
        w: common_vendor.p({
          type: "plus",
          size: "18",
          color: "white"
        }),
        x: common_vendor.o(publishActivity)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12e513cf"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active/active.js.map
