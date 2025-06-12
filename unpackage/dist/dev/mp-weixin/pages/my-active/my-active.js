"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_empty_state = common_vendor.resolveComponent("empty-state");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_nav_bar2 + _easycom_uni_segmented_control2 + _easycom_uni_icons2 + _component_empty_state + _easycom_uni_load_more2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_load_more)();
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
        image: "/static/activity1.jpg",
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
        image: "/static/activity4.jpg",
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
    const handleBack = () => {
      common_vendor.index.navigateBack();
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
    const loadMore = () => {
      if (loadStatus.value !== "more")
        return;
      loadStatus.value = "loading";
      setTimeout(() => {
        if (currentTab.value === 0) {
          enrolledActivities.value.push(...mockEnrolledData());
        } else {
          publishedActivities.value.push(...mockPublishedData());
        }
        loadStatus.value = "noMore";
      }, 1500);
    };
    common_vendor.onReachBottom(() => {
      loadMore();
    });
    const mockEnrolledData = () => [...Array(2)].map((_, i) => ({
      id: enrolledActivities.value.length + i + 1,
      title: `新活动 ${enrolledActivities.value.length + i + 1}`,
      image: `/static/activity${(enrolledActivities.value.length + i) % 6 + 1}.jpg`,
      date: "2023年12月" + (15 + i) + "日",
      location: "活动地点" + (enrolledActivities.value.length + i),
      participants: {
        current: Math.floor(Math.random() * 50),
        total: 50
      },
      organizer: "组织者" + (enrolledActivities.value.length + i),
      status: ["enrolled", "pending", "ended"][Math.floor(Math.random() * 3)],
      tags: ["标签1", "标签2"]
    }));
    const mockPublishedData = () => [...Array(2)].map((_, i) => ({
      id: publishedActivities.value.length + i + 1,
      title: `新发布活动 ${publishedActivities.value.length + i + 1}`,
      image: `/static/activity${(publishedActivities.value.length + i) % 6 + 1}.jpg`,
      date: "2023年12月" + (20 + i) + "日",
      location: "发布地点" + (publishedActivities.value.length + i),
      participants: {
        current: Math.floor(Math.random() * 100),
        total: 100
      },
      organizer: "我",
      status: ["ongoing", "upcoming", "ended"][Math.floor(Math.random() * 3)],
      tags: ["发布标签1", "发布标签2"]
    }));
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleBack),
        b: common_vendor.p({
          ["left-icon"]: "arrowleft",
          title: "我的活动",
          border: false
        }),
        c: common_vendor.o(switchTab),
        d: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        e: common_vendor.p({
          type: "ticket",
          size: "20",
          color: "#FF6B00"
        }),
        f: enrolledActivities.value.length > 0
      }, enrolledActivities.value.length > 0 ? {
        g: common_vendor.f(enrolledActivities.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getStatusText(item.status)),
            d: common_vendor.n(item.status),
            e: "37541c0b-3-" + i0,
            f: common_vendor.t(item.date),
            g: "37541c0b-4-" + i0,
            h: common_vendor.t(item.location),
            i: "37541c0b-5-" + i0,
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
        h: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        i: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        j: common_vendor.p({
          type: "people",
          size: "16",
          color: "#999"
        })
      } : {
        k: common_vendor.o(navigateToDiscover),
        l: common_vendor.p({
          title: "暂无报名活动",
          description: "快去发现并报名感兴趣的活动吧"
        })
      }, {
        m: common_vendor.o(loadMore),
        n: common_vendor.p({
          status: loadStatus.value,
          ["content-text"]: {
            contentdown: "上拉加载更多",
            contentrefresh: "正在加载...",
            contentnomore: "没有更多了"
          }
        }),
        o: currentTab.value === 0,
        p: refreshing.value,
        q: common_vendor.o(onRefresh),
        r: common_vendor.p({
          type: "sound",
          size: "20",
          color: "#FF6B00"
        }),
        s: publishedActivities.value.length > 0
      }, publishedActivities.value.length > 0 ? {
        t: common_vendor.f(publishedActivities.value, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getStatusText(item.status)),
            d: common_vendor.n(item.status),
            e: "37541c0b-9-" + i0,
            f: common_vendor.t(item.date),
            g: "37541c0b-10-" + i0,
            h: common_vendor.t(item.location),
            i: "37541c0b-11-" + i0,
            j: common_vendor.t(item.participants.current),
            k: common_vendor.t(item.participants.total),
            l: common_vendor.t(item.status === "ended" ? "数据统计" : "管理"),
            m: common_vendor.o(($event) => manageActivity(item), index),
            n: common_vendor.o(($event) => viewDetail(item), index),
            o: index,
            p: common_vendor.o(($event) => handleActivityClick(item), index)
          };
        }),
        v: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        w: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        x: common_vendor.p({
          type: "people",
          size: "16",
          color: "#999"
        })
      } : {
        y: common_vendor.o(navigateToCreate),
        z: common_vendor.p({
          title: "暂无发布活动",
          description: "创建一个活动，邀请大家参与吧"
        })
      }, {
        A: common_vendor.o(loadMore),
        B: common_vendor.p({
          status: loadStatus.value,
          ["content-text"]: {
            contentdown: "上拉加载更多",
            contentrefresh: "正在加载...",
            contentnomore: "没有更多了"
          }
        }),
        C: currentTab.value === 1,
        D: refreshing.value,
        E: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-37541c0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active/my-active.js.map
