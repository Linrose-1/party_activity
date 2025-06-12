"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_empty_state = common_vendor.resolveComponent("empty-state");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _component_empty_state)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "my-active",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["我的报名", "我的发布"]);
    const refreshing = common_vendor.ref(false);
    const loadStatus = common_vendor.ref("more");
    const enrolledActivities = common_vendor.ref([
      {
        id: 1,
        title: "周末户外登山活动 - 挑战青龙山",
        image: "../../static/abc.png",
        date: "2023年11月25日 08:00-17:00",
        location: "青龙山国家森林公园",
        participants: {
          current: 28,
          total: 50
        },
        organizer: "户外探险俱乐部",
        status: "enrolled",
        tags: ["户外", "运动"]
      }
      // 更多数据...
    ]);
    const publishedActivities = common_vendor.ref([
      {
        id: 4,
        title: "宠物爱好者交流聚会",
        image: "../../static/abc.png",
        date: "2023年12月2日 10:00-14:00",
        location: "人民公园草坪区",
        participants: {
          current: 23,
          total: 30
        },
        organizer: "我",
        status: "ongoing",
        tags: ["宠物", "社交"]
      }
      // 更多数据...
    ]);
    const switchTab = (e) => {
      currentTab.value = e.currentIndex;
      loadStatus.value = "more";
    };
    const getStatusText = (status) => {
      const statusMap = {
        enrolled: "已报名",
        pending: "待审核",
        ended: "已结束",
        ongoing: "进行中",
        upcoming: "未开始"
      };
      return statusMap[status] || "";
    };
    const handleActivityClick = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/detail?id=${item.id}`
      });
    };
    const viewDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/detail?id=${item.id}`
      });
    };
    const cancelEnroll = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消报名此活动吗？",
        success: (res) => {
          if (res.confirm) {
            enrolledActivities.value = enrolledActivities.value.filter((act) => act.id !== item.id);
            common_vendor.index.showToast({
              title: "已取消报名",
              icon: "success"
            });
          }
        }
      });
    };
    const manageActivity = (item) => {
      if (item.status === "ended") {
        common_vendor.index.navigateTo({
          url: `/pages/activity/stats?id=${item.id}`
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/activity/manage?id=${item.id}`
        });
      }
    };
    const navigateToDiscover = () => {
      common_vendor.index.switchTab({
        url: "/pages/discover/index"
      });
    };
    const navigateToCreate = () => {
      common_vendor.index.navigateTo({
        url: "/pages/activity/create"
      });
    };
    const onRefresh = () => {
      refreshing.value = true;
      setTimeout(() => {
        refreshing.value = false;
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      }, 1e3);
    };
    common_vendor.onLoad(() => {
    });
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
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getStatusText(item.status)),
            d: common_vendor.n(item.status),
            e: "37541c0b-1-" + i0,
            f: common_vendor.t(item.date),
            g: "37541c0b-2-" + i0,
            h: common_vendor.t(item.location),
            i: "37541c0b-3-" + i0,
            j: common_vendor.t(item.participants.current),
            k: common_vendor.t(item.participants.total),
            l: item.status === "enrolled"
          }, item.status === "enrolled" ? {
            m: common_vendor.o(($event) => cancelEnroll(item), index)
          } : {}, {
            n: common_vendor.o(($event) => viewDetail(item), index),
            o: index,
            p: common_vendor.o(($event) => handleActivityClick(item), index)
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
          type: "people",
          size: "16",
          color: "#999"
        })
      } : {
        h: common_vendor.o(navigateToDiscover),
        i: common_vendor.p({
          title: "暂无报名活动",
          description: "快去发现并报名感兴趣的活动吧"
        })
      }, {
        j: currentTab.value === 0,
        k: refreshing.value,
        l: common_vendor.o(onRefresh),
        m: publishedActivities.value.length > 0
      }, publishedActivities.value.length > 0 ? {
        n: common_vendor.f(publishedActivities.value, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getStatusText(item.status)),
            d: common_vendor.n(item.status),
            e: "37541c0b-5-" + i0,
            f: common_vendor.t(item.date),
            g: "37541c0b-6-" + i0,
            h: common_vendor.t(item.location),
            i: "37541c0b-7-" + i0,
            j: common_vendor.t(item.participants.current),
            k: common_vendor.t(item.participants.total),
            l: common_vendor.t(item.status === "ended" ? "数据统计" : "删除"),
            m: common_vendor.o(($event) => manageActivity(item), index),
            n: common_vendor.o(($event) => viewDetail(item), index),
            o: index,
            p: common_vendor.o(($event) => handleActivityClick(item), index)
          };
        }),
        o: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        p: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        q: common_vendor.p({
          type: "people",
          size: "16",
          color: "#999"
        })
      } : {
        r: common_vendor.o(navigateToCreate),
        s: common_vendor.p({
          title: "暂无发布活动",
          description: "创建一个活动，邀请大家参与吧"
        })
      }, {
        t: currentTab.value === 1,
        v: refreshing.value,
        w: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-37541c0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active/my-active.js.map
