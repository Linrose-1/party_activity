"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
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
      common_vendor.index.__f__("log", "at pages/active/active.vue:167", "页面显示，当前登录状态:", isLogin.value);
      initializePage();
    });
    common_vendor.onPullDownRefresh(async () => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:175", "用户触发了下拉刷新");
      await initializePage();
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:182", "滑动到底部，触发加载更多");
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
        common_vendor.index.__f__("error", "at pages/active/active.vue:217", "页面初始化失败:", error);
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
        common_vendor.index.__f__("error", "at pages/active/active.vue:244", "获取轮播图失败:", error);
        bannerList.value = [];
        return;
      }
      if (data && data.list) {
        bannerList.value = data.list.sort((a, b) => a.sort - b.sort);
        common_vendor.index.__f__("log", "at pages/active/active.vue:252", "轮播图数据获取成功:", bannerList.value);
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
        common_vendor.index.__f__("error", "at pages/active/active.vue:271", "获取聚会类型列表失败:", error);
        throw new Error("获取类型失败");
      }
      typeList.value = data || [];
      common_vendor.index.__f__("log", "at pages/active/active.vue:276", "动态聚会类型列表获取成功:", typeList.value);
    };
    const fetchActivityStatusList = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/activity/status-list");
      if (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:285", "获取聚会状态列表失败:", error);
        throw new Error("获取状态失败");
      }
      statusList.value = data || [];
      common_vendor.index.__f__("log", "at pages/active/active.vue:289", "动态聚会状态列表获取成功:", statusList.value);
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
        common_vendor.index.__f__("log", "at pages/active/active.vue:321", "发起聚会列表请求, 参数:", params);
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
          common_vendor.index.__f__("error", "at pages/active/active.vue:344", "获取聚会列表失败:", result ? result.error : "无有效返回");
          hasMore.value = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:348", "请求异常:", error);
        hasMore.value = false;
      } finally {
        loading.value = false;
      }
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
          common_vendor.index.__f__("log", "at pages/active/active.vue:386", "选择位置失败:", err);
        }
      });
    };
    const handleFavoriteChange = (event) => {
      const activityToUpdate = activitiesData.value.find((activity) => activity.id === event.id);
      if (activityToUpdate) {
        activityToUpdate.followFlag = event.newFollowFlag;
      }
    };
    const publishActivity = () => {
      if (!isLogin.value) {
        common_vendor.index.showModal({
          title: "温馨提示",
          content: "登录后才能发布聚会，是否立即登录？",
          confirmText: "去登录",
          cancelText: "再看看",
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
      common_vendor.index.navigateTo({
        url: "/pages/active-publish/active-publish"
      });
    };
    common_vendor.watch(
      [searchKeyword, selectedCategory, statusIndex, selectedLocationInfo],
      (newValue, oldValue) => {
        common_vendor.index.__f__("log", "at pages/active/active.vue:428", "筛选条件变化，重新搜索...");
        getActiveList(false);
      },
      {
        deep: true
        // deep: true 对监听 selectedLocationInfo 对象变化是必需的
      }
    );
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
            d: banner.id
          });
        })
      } : {}, {
        f: common_vendor.t(typePickerRange.value[typeIndex.value]),
        g: common_vendor.o(bindTypePickerChange),
        h: typeIndex.value,
        i: typePickerRange.value,
        j: common_vendor.t(statusPickerRange.value[statusIndex.value]),
        k: common_vendor.o(bindStatusPickerChange),
        l: statusIndex.value,
        m: statusPickerRange.value,
        n: selectedLocationInfo.value
      }, selectedLocationInfo.value ? {
        o: common_vendor.t(selectedLocationInfo.value.address || selectedLocationInfo.value.name)
      } : {}, {
        p: common_vendor.o(openMapToChooseLocation),
        q: common_vendor.p({
          title: "聚会筛选",
          open: true
        }),
        r: common_vendor.f(activitiesData.value, (activity, index, i0) => {
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
        s: !hasMore.value && activitiesData.value.length > 0
      }, !hasMore.value && activitiesData.value.length > 0 ? {} : {}, {
        t: !loading.value && activitiesData.value.length === 0
      }, !loading.value && activitiesData.value.length === 0 ? {} : {}, {
        v: common_vendor.p({
          type: "plus",
          size: "18",
          color: "white"
        }),
        w: common_vendor.o(publishActivity)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12e513cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active/active.js.map
