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
    common_vendor.onMounted(() => {
      getActiveList();
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:134", "滑动到底部，触发加载更多");
      if (hasMore.value && !loading.value) {
        getActiveList(true);
      }
    });
    const getDate = (type) => {
      const date2 = /* @__PURE__ */ new Date();
      let year = date2.getFullYear();
      let month = date2.getMonth() + 1;
      let day = date2.getDate();
      if (type === "start") {
        year = year - 10;
      } else if (type === "end") {
        year = year + 10;
      }
      month = month > 9 ? month : "0" + month;
      day = day > 9 ? day : "0" + day;
      return `${year}-${month}-${day}`;
    };
    const searchKeyword = common_vendor.ref("");
    const array = common_vendor.ref(["全部类型", "交流会", "沙龙", "峰会", "分享会", "创业猎伙", "其他"]);
    const index = common_vendor.ref(0);
    const activeCategory = common_vendor.ref("全部类型");
    const date = common_vendor.ref(getDate({
      format: true
    }));
    const statusArray = common_vendor.ref(["全部状态", "未开始", "报名中", "即将开始", "进行中", "已结束", "已取消"]);
    const statusIndex = common_vendor.ref(0);
    const selectedStatus = common_vendor.ref("全部状态");
    const selectedLocationInfo = common_vendor.ref(null);
    const startDate = common_vendor.computed(() => getDate("start"));
    const endDate = common_vendor.computed(() => getDate("end"));
    const bindPickerChange = (e) => {
      index.value = e.detail.value;
      activeCategory.value = array.value[e.detail.value];
    };
    const bindDateChange = (e) => {
      date.value = e.detail.value;
    };
    const bindStatusPickerChange = (e) => {
      statusIndex.value = e.detail.value;
      selectedStatus.value = statusArray.value[e.detail.value];
    };
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/active/active.vue:201", "选择位置成功:", res);
          selectedLocationInfo.value = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/active/active.vue:211", "选择位置失败:", err);
        }
      });
    };
    const getActiveList = async (isLoadMore = false) => {
      if (loading.value) {
        return;
      }
      if (isLoadMore && !hasMore.value) {
        return;
      }
      loading.value = true;
      if (!isLoadMore) {
        pageNo.value = 1;
        activitiesData.value = [];
        hasMore.value = true;
      }
      const statusMap = {
        "全部状态": "",
        // 传空字符串表示查询全部
        "未开始": 1,
        "报名中": 2,
        "即将开始": 3,
        "进行中": 4,
        "已结束": 5,
        "已取消": 0
      };
      const params = {
        pageNo: pageNo.value,
        pageSize,
        name: searchKeyword.value,
        // 搜索框内容
        category: activeCategory.value === "全部类型" ? "" : activeCategory.value,
        // 活动类型
        status: statusMap[selectedStatus.value],
        // 活动状态
        longitude: selectedLocationInfo.value ? selectedLocationInfo.value.longitude : "",
        // 经度
        latitude: selectedLocationInfo.value ? selectedLocationInfo.value.latitude : ""
        // 纬度
      };
      try {
        common_vendor.index.__f__("log", "at pages/active/active.vue:262", "发起活动列表请求, 参数:", params);
        const result = await utils_request.request("/app-api/member/activity/list", {
          method: "GET",
          data: params
        });
        if (result && !result.error && result.data) {
          const list = result.data.list || [];
          if (isLoadMore) {
            activitiesData.value = [...activitiesData.value, ...list];
          } else {
            activitiesData.value = list;
          }
          if (activitiesData.value.length >= result.data.total) {
            hasMore.value = false;
          } else {
            hasMore.value = true;
          }
          pageNo.value++;
          common_vendor.index.__f__("log", "at pages/active/active.vue:294", "活动列表获取成功:", activitiesData.value);
        } else {
          common_vendor.index.__f__("error", "at pages/active/active.vue:297", "获取活动列表失败:", result);
          hasMore.value = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/active/active.vue:301", "请求异常:", error);
        hasMore.value = false;
      } finally {
        loading.value = false;
      }
    };
    common_vendor.watch(
      [searchKeyword, activeCategory, selectedStatus, selectedLocationInfo],
      () => {
        common_vendor.index.__f__("log", "at pages/active/active.vue:315", "筛选条件变化，重新搜索...");
        getActiveList(false);
      },
      { deep: true }
      // deep: true 确保能监听到 selectedLocationInfo 对象的内部变化
    );
    const publishActivity = () => {
      common_vendor.index.navigateTo({
        url: "/pages/active-publish/active-publish"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "rgba(255, 255, 255, 0.7)"
        }),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.t(array.value[index.value]),
        e: common_vendor.o(bindPickerChange),
        f: index.value,
        g: array.value,
        h: common_vendor.t(statusArray.value[statusIndex.value]),
        i: common_vendor.o(bindStatusPickerChange),
        j: statusIndex.value,
        k: statusArray.value,
        l: common_vendor.t(date.value),
        m: date.value,
        n: startDate.value,
        o: endDate.value,
        p: common_vendor.o(bindDateChange),
        q: selectedLocationInfo.value
      }, selectedLocationInfo.value ? {
        r: common_vendor.t(selectedLocationInfo.value.address || selectedLocationInfo.value.name)
      } : {}, {
        s: common_vendor.o(openMapToChooseLocation),
        t: common_vendor.p({
          title: "活动筛选",
          open: true
        }),
        v: common_vendor.f(activitiesData.value, (activity, index2, i0) => {
          return {
            a: activity.id,
            b: "12e513cf-3-" + i0,
            c: common_vendor.p({
              activity
            })
          };
        }),
        w: !hasMore.value && activitiesData.value.length > 0
      }, !hasMore.value && activitiesData.value.length > 0 ? {} : {}, {
        x: !loading.value && activitiesData.value.length === 0
      }, !loading.value && activitiesData.value.length === 0 ? {} : {}, {
        y: common_vendor.p({
          type: "plus",
          size: "18",
          color: "white"
        }),
        z: common_vendor.o(publishActivity)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12e513cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active/active.js.map
