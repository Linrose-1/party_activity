"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
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
const _sfc_main = {
  __name: "relation",
  setup(__props) {
    const formatDateTime = (date) => {
      if (!date)
        return "";
      const d = new Date(date);
      const Y = d.getFullYear();
      const M = (d.getMonth() + 1).toString().padStart(2, "0");
      const D = d.getDate().toString().padStart(2, "0");
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      const s = d.getSeconds().toString().padStart(2, "0");
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
    const timeRangeText = common_vendor.computed(() => {
      if (timeRange.value && timeRange.value.length === 2) {
        const start = timeRange.value[0].slice(5, 16);
        const end = timeRange.value[1].slice(5, 16);
        return `${start} 至 ${end}`;
      }
      return "请选择拟访友时段";
    });
    const isListEmpty = common_vendor.computed(() => userList.value.length === 0 && loadingStatus.value !== "loading");
    const fetchUserList = async (isRefresh = false) => {
      if (isRefresh)
        common_vendor.index.stopPullDownRefresh();
      if (!destination.value.longitude || !timeRange.value || timeRange.value.length < 2) {
        userList.value = [];
        loadingStatus.value = "noMore";
        return;
      }
      if (loadingStatus.value === "loading" && !isRefresh)
        return;
      if (isRefresh) {
        queryParams.pageNo = 1;
        userList.value = [];
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
            // 【修改点】：更新为后端新的两个字段
            nextStartLocationTime: formatDateTime(timeRange.value[0]),
            nextEndLocationTime: formatDateTime(timeRange.value[1]),
            tabIndex: activeTab.value
          }
        });
        if (error)
          throw new Error(error);
        const newList = data.list || [];
        userList.value = isRefresh ? newList : [...userList.value, ...newList];
        total.value = data.total || 0;
        loadingStatus.value = userList.value.length >= total.value ? "noMore" : "more";
      } catch (err) {
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: err.message || "加载失败",
          icon: "none"
        });
      }
    };
    const handleCriteriaChange = async () => {
      if (!destination.value.longitude || !timeRange.value || timeRange.value.length < 2)
        return;
      common_vendor.index.showLoading({
        title: "同步行程..."
      });
      const {
        error
      } = await utils_request.request("/app-api/member/user/upload-next-location", {
        method: "POST",
        data: {
          longitude: destination.value.longitude,
          latitude: destination.value.latitude,
          // 1. 移除 encodeURIComponent，直接传 formatDateTime 的结果
          // 2. 检查字段名：如果后端报“结束时间不能为空”，说明它没认出 nextEndLocationTime
          // 请确认 POST 接口是否应使用原来的字段名：nextLocationStartTime 和 nextLocationEndTime
          nextLocationStartTime: formatDateTime(timeRange.value[0]),
          nextLocationEndTime: formatDateTime(timeRange.value[1])
        }
      });
      common_vendor.index.hideLoading();
      if (!error) {
        fetchUserList(true);
      }
    };
    const handleFollowAction = async (user) => {
      if (isFollowActionInProgress.value)
        return;
      const currentUserId = common_vendor.index.getStorageSync("userId");
      if (!currentUserId)
        return common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
      isFollowActionInProgress.value = true;
      const originalStatus = user.followToFlag;
      const newStatus = originalStatus === 1 ? 0 : 1;
      user.followToFlag = newStatus;
      try {
        const apiUrl = newStatus === 1 ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            targetId: user.id,
            targetType: "post_user"
          }
        });
        if (error)
          throw new Error(error);
        common_vendor.index.showToast({
          title: newStatus === 1 ? "关注成功" : "已取消关注",
          icon: "success"
        });
      } catch (err) {
        user.followToFlag = originalStatus;
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      } finally {
        isFollowActionInProgress.value = false;
      }
    };
    const resetFilters = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要重置筛选条件吗？",
        success: (res) => {
          if (res.confirm) {
            destination.value = {};
            timeRange.value = [];
            userList.value = [];
            loadingStatus.value = "noMore";
          }
        }
      });
    };
    const handleChooseLocation = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.chooseLocation({
        success: (res) => {
          destination.value = res;
          handleCriteriaChange();
        }
      });
    };
    const handleTimeChange = (e) => {
      timeRange.value = e;
      handleCriteriaChange();
    };
    const switchTab = (index) => {
      activeTab.value = index;
      fetchUserList(true);
    };
    const navigateToBusinessCard = (user) => {
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar || "")}`
      });
    };
    common_vendor.onPullDownRefresh(() => fetchUserList(true));
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        queryParams.pageNo++;
        fetchUserList();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.p({
          type: "refreshempty",
          size: "16",
          color: "#666"
        }),
        c: common_vendor.o(resetFilters),
        d: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: "#FF8400"
        }),
        e: common_vendor.t(destination.value.name || "请选择拟访友地点"),
        f: common_vendor.p({
          type: "right",
          size: "16",
          color: "#CCC"
        }),
        g: common_vendor.o(handleChooseLocation),
        h: common_vendor.p({
          type: "calendar-filled",
          size: "20",
          color: "#FF8400"
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
          color: "#CCC"
        }),
        n: activeTab.value === 0 ? 1 : "",
        o: common_vendor.o(($event) => switchTab(0)),
        p: activeTab.value === 1 ? 1 : "",
        q: common_vendor.o(($event) => switchTab(1)),
        r: common_vendor.f(userList.value, (user, k0, i0) => {
          return common_vendor.e({
            a: user.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => navigateToBusinessCard(user), user.id),
            c: common_vendor.t(user.nickname),
            d: user.idCert === 1
          }, user.idCert === 1 ? {} : {}, {
            e: common_vendor.t(user.companyName || "保密机构"),
            f: common_vendor.t(user.positionTitle || user.professionalTitle || "精英商友"),
            g: common_vendor.t(user.followToFlag === 1 ? "已关注" : "+ 关注"),
            h: user.followToFlag === 1 ? 1 : "",
            i: common_vendor.o(($event) => handleFollowAction(user), user.id),
            j: user.id
          });
        }),
        s: isListEmpty.value
      }, isListEmpty.value ? {
        t: common_vendor.p({
          type: "staff",
          size: "60",
          color: "#e0e0e0"
        })
      } : {}, {
        v: userList.value.length > 0 || loadingStatus.value === "loading"
      }, userList.value.length > 0 || loadingStatus.value === "loading" ? {
        w: common_vendor.p({
          status: loadingStatus.value
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85e55c19"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/relation/relation.js.map
