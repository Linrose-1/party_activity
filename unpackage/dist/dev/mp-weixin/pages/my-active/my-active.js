"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_badge2 = common_vendor.resolveComponent("uni-badge");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_badge2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_badge = () => "../../uni_modules/uni-badge/components/uni-badge/uni-badge.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_badge)();
}
const _sfc_main = {
  __name: "my-active",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["我的报名", "我的发起"]);
    const refreshing = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const enrolledActivities = common_vendor.ref([]);
    const enrolledPageNo = common_vendor.ref(1);
    const enrolledHasMore = common_vendor.ref(true);
    const publishedActivities = common_vendor.ref([]);
    const publishedPageNo = common_vendor.ref(1);
    const publishedHasMore = common_vendor.ref(true);
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/my-active/my-active.vue:215", "页面显示，刷新当前 Tab 数据");
      handleRefresh();
    });
    const getMyActivitiesList = async (isLoadMore = false) => {
      if (loading.value)
        return;
      const currentHasMore = currentTab.value === 0 ? enrolledHasMore.value : publishedHasMore.value;
      if (isLoadMore && !currentHasMore) {
        return;
      }
      loading.value = true;
      const currentPageNo = currentTab.value === 0 ? enrolledPageNo.value : publishedPageNo.value;
      const params = {
        pageNo: currentPageNo,
        pageSize: 10,
        tabIndex: currentTab.value
      };
      try {
        const result = await utils_request.request("/app-api/member/activity/my-list", {
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/my-active/my-active.vue:246", `获取Tab ${currentTab.value} 的聚会`, result);
        if (result && !result.error && result.data) {
          const list = result.data.list || [];
          const total = result.data.total || 0;
          if (currentTab.value === 0) {
            enrolledActivities.value = isLoadMore ? [...enrolledActivities.value, ...list] : list;
            enrolledHasMore.value = enrolledActivities.value.length < total;
            enrolledPageNo.value++;
          } else {
            publishedActivities.value = isLoadMore ? [...publishedActivities.value, ...list] : list;
            publishedHasMore.value = publishedActivities.value.length < total;
            publishedPageNo.value++;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my-active/my-active.vue:265", "请求我的聚会列表失败:", error);
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const switchTab = (e) => {
      if (currentTab.value === e.currentIndex)
        return;
      currentTab.value = e.currentIndex;
      const list = currentTab.value === 0 ? enrolledActivities.value : publishedActivities.value;
      if (list.length === 0) {
        handleRefresh();
      }
    };
    const onRefresh = () => {
      handleRefresh();
    };
    const onReachBottom = () => {
      getMyActivitiesList(true);
    };
    const handleRefresh = async () => {
      if (refreshing.value)
        return;
      refreshing.value = true;
      if (currentTab.value === 0) {
        enrolledPageNo.value = 1;
        enrolledHasMore.value = true;
      } else {
        publishedPageNo.value = 1;
        publishedHasMore.value = true;
      }
      await getMyActivitiesList(false);
    };
    const getStatusClass = (statusStr) => {
      const classMap = {
        // 我的报名状态
        "待支付": "pending_payment",
        // 假设用 pending 样式
        "已支付": "enrolled",
        // 假设用 enrolled 样式
        "待退款": "refund_pending",
        "已退款": "ended",
        // 假设用 ended 样式
        "替补": "upcoming",
        // 假设用 upcoming 样式
        "已驳回": "status-rejected",
        // 我的发布状态 (保持不变)
        "已取消": "canceled",
        "未开始": "upcoming",
        "报名中": "enrolled",
        "即将开始": "upcoming",
        "进行中": "ongoing",
        "已结束": "ended"
      };
      return classMap[statusStr] || "";
    };
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr)
        return "时间待定";
      const date = new Date(dateTimeStr);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    const handleActivityClick = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/packages/active-detail/active-detail?id=${activityId}`
      });
    };
    const viewDetail = (activityId) => {
      common_vendor.index.navigateTo({
        url: `/packages/active-detail/active-detail?id=${activityId}`
      });
    };
    const cancelEnroll = (activityId) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消报名吗？",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在提交..."
            });
            const result = await utils_request.request("/app-api/member/activity/quit-activity", {
              method: "POST",
              data: {
                id: activityId
              }
            });
            common_vendor.index.hideLoading();
            if (result && !result.error) {
              common_vendor.index.showToast({
                title: "取消成功",
                icon: "success"
              });
              handleRefresh();
            } else {
              common_vendor.index.showToast({
                title: result.error || "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const applyForRefund = (activityItem) => {
      const activityJson = JSON.stringify(activityItem);
      const encodedData = encodeURIComponent(activityJson);
      common_vendor.index.navigateTo({
        url: `/pages/my-active-apply/my-active-apply?item=${encodedData}`
      });
    };
    const cancelActivity = (activityId) => {
      common_vendor.index.showModal({
        title: "警告",
        content: "确定要取消您发布的此聚会吗？此操作不可逆。",
        confirmColor: "#f44336",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在删除..."
            });
            const result = await utils_request.request("/app-api/member/activity/cancel-activity", {
              method: "POST",
              data: {
                id: activityId
              }
            });
            common_vendor.index.hideLoading();
            if (result && !result.error) {
              common_vendor.index.showToast({
                title: "聚会已取消",
                icon: "success"
              });
              handleRefresh();
            } else {
              common_vendor.index.showToast({
                title: result.error || "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const manageRefunds = (activityItem, mode) => {
      const activityJson = JSON.stringify(activityItem);
      const encodedData = encodeURIComponent(activityJson);
      common_vendor.index.navigateTo({
        url: `/pages/my-active-manage/my-active-manage?item=${encodedData}&mode=${mode}`
      });
    };
    const navigateToReUpload = (activityItem) => {
      const activityJson = JSON.stringify(activityItem);
      const encodedData = encodeURIComponent(activityJson);
      common_vendor.index.navigateTo({
        url: `/pages/my-active-secondRegistration/my-active-secondRegistration?item=${encodedData}`
      });
    };
    const navigateToRegisteredUsers = (activityItem) => {
      const activityJson = JSON.stringify(activityItem);
      const encodedData = encodeURIComponent(activityJson);
      common_vendor.index.navigateTo({
        url: `/pages/my-active-registeredUser/my-active-registeredUser?item=${encodedData}`
      });
    };
    const navigateToDiscover = () => {
      common_vendor.index.switchTab({
        url: "/pages/active/active"
      });
    };
    const navigateToCreate = () => {
      common_vendor.index.navigateTo({
        url: "/packages/active-publish/active-publish"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(switchTab),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: enrolledActivities.value.length > 0
      }, enrolledActivities.value.length > 0 ? {
        d: common_vendor.f(enrolledActivities.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.coverImageUrl,
            b: common_vendor.t(item.activityTitle),
            c: item.memberActivityJoinResp.rejectMsg
          }, item.memberActivityJoinResp.rejectMsg ? {} : {
            d: common_vendor.t(item.memberActivityJoinResp.paymentStatusStr),
            e: common_vendor.n(getStatusClass(item.memberActivityJoinResp.paymentStatusStr))
          }, {
            f: "37541c0b-1-" + i0,
            g: common_vendor.t(formatDateTime(item.startDatetime)),
            h: "37541c0b-2-" + i0,
            i: common_vendor.t(item.locationAddress || "线上聚会"),
            j: "37541c0b-3-" + i0,
            k: common_vendor.t(item.joinCount || 0),
            l: common_vendor.t(item.totalSlots || "不限"),
            m: item.memberActivityJoinResp.rejectMsg
          }, item.memberActivityJoinResp.rejectMsg ? {
            n: "37541c0b-4-" + i0,
            o: common_vendor.p({
              type: "info-filled",
              color: "#f56c6c",
              size: "16"
            }),
            p: common_vendor.t(item.memberActivityJoinResp.rejectMsg)
          } : {}, {
            q: ["待支付", "已支付", "替补"].includes(item.memberActivityJoinResp.paymentStatusStr) && !item.memberActivityJoinResp.rejectMsg
          }, ["待支付", "已支付", "替补"].includes(item.memberActivityJoinResp.paymentStatusStr) && !item.memberActivityJoinResp.rejectMsg ? {
            r: common_vendor.o(($event) => cancelEnroll(item.id), item.id)
          } : {}, {
            s: item.memberActivityJoinResp.paymentStatusStr === "待退款"
          }, item.memberActivityJoinResp.paymentStatusStr === "待退款" ? {
            t: common_vendor.o(($event) => applyForRefund(item), item.id)
          } : {}, {
            v: item.memberActivityJoinResp.rejectMsg
          }, item.memberActivityJoinResp.rejectMsg ? {
            w: common_vendor.o(($event) => navigateToReUpload(item), item.id)
          } : {}, {
            x: common_vendor.o(($event) => viewDetail(item.id), item.id),
            y: item.id,
            z: common_vendor.o(($event) => handleActivityClick(item.id), item.id)
          });
        }),
        e: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        f: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        g: common_vendor.p({
          type: "person-filled",
          size: "16",
          color: "#999"
        })
      } : !loading.value ? {
        i: common_vendor.o(navigateToDiscover)
      } : {}, {
        h: !loading.value,
        j: currentTab.value === 0,
        k: refreshing.value,
        l: common_vendor.o(onRefresh),
        m: common_vendor.o(onReachBottom),
        n: publishedActivities.value.length > 0
      }, publishedActivities.value.length > 0 ? {
        o: common_vendor.f(publishedActivities.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.coverImageUrl,
            b: common_vendor.t(item.activityTitle),
            c: common_vendor.t(item.statusStr),
            d: common_vendor.n(getStatusClass(item.statusStr)),
            e: "37541c0b-5-" + i0,
            f: common_vendor.t(formatDateTime(item.startDatetime)),
            g: "37541c0b-6-" + i0,
            h: common_vendor.t(item.locationAddress || "线上聚会"),
            i: "37541c0b-7-" + i0,
            j: common_vendor.t(item.joinCount || 0),
            k: common_vendor.t(item.totalSlots || "不限"),
            l: item.paddingReturnCount > 0
          }, item.paddingReturnCount > 0 ? {
            m: "37541c0b-8-" + i0,
            n: common_vendor.p({
              text: item.paddingReturnCount,
              type: "error"
            }),
            o: common_vendor.o(($event) => manageRefunds(item, "individual"), item.id)
          } : {}, {
            p: ["未开始", "报名中", "聚会即将开始", "进行中"].includes(item.statusStr)
          }, ["未开始", "报名中", "聚会即将开始", "进行中"].includes(item.statusStr) ? {
            q: common_vendor.o(($event) => cancelActivity(item.id), item.id)
          } : {}, {
            r: item.statusStr === "聚会取消"
          }, item.statusStr === "聚会取消" ? {
            s: common_vendor.o(($event) => manageRefunds(item, "all"), item.id)
          } : {}, {
            t: item.statusStr !== "聚会取消"
          }, item.statusStr !== "聚会取消" ? {
            v: common_vendor.o(($event) => navigateToRegisteredUsers(item), item.id)
          } : {}, {
            w: common_vendor.o(($event) => viewDetail(item.id), item.id),
            x: item.id,
            y: common_vendor.o(($event) => handleActivityClick(item.id), item.id)
          });
        }),
        p: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        q: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        r: common_vendor.p({
          type: "person-filled",
          size: "16",
          color: "#999"
        })
      } : !loading.value ? {
        t: common_vendor.o(navigateToCreate)
      } : {}, {
        s: !loading.value,
        v: currentTab.value === 1,
        w: refreshing.value,
        x: common_vendor.o(onRefresh),
        y: common_vendor.o(onReachBottom),
        z: loading.value
      }, loading.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-37541c0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active/my-active.js.map
