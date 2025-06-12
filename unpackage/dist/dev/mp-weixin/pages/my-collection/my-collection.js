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
  __name: "my-collection",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["收藏的活动", "收藏的商机"]);
    const refreshing = common_vendor.ref(false);
    const loadStatus = common_vendor.ref("more");
    const favoriteActivities = common_vendor.ref([
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
        status: "upcoming",
        collectedTime: "2023-11-10"
      }
      // 更多数据...
    ]);
    const favoriteOpportunities = common_vendor.ref([
      {
        id: 101,
        user: "张总",
        time: "2023-11-15 14:30",
        content: "寻找AI技术合作伙伴，共同开发智能客服系统，有意向请联系详谈",
        tags: ["技术合作", "AI开发", "商务合作"],
        likes: 24,
        comments: 8,
        status: "active",
        // active/expired
        collectedTime: "2023-11-16"
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
    const getActivityStatusText = (status) => {
      const statusMap = {
        upcoming: "未开始",
        ongoing: "进行中",
        ended: "已结束"
      };
      return statusMap[status] || "";
    };
    const viewActivityDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/detail?id=${item.id}`
      });
    };
    const viewOpportunityDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/business/detail?id=${item.id}`
      });
    };
    const viewUserProfile = (user) => {
      common_vendor.index.navigateTo({
        url: `/pages/user/profile?name=${encodeURIComponent(user)}`
      });
    };
    const uncollectActivity = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消收藏此活动吗？",
        success: (res) => {
          if (res.confirm) {
            favoriteActivities.value = favoriteActivities.value.filter((act) => act.id !== item.id);
            common_vendor.index.showToast({
              title: "已取消收藏",
              icon: "success"
            });
          }
        }
      });
    };
    const uncollectOpportunity = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消收藏此商机吗？",
        success: (res) => {
          if (res.confirm) {
            favoriteOpportunities.value = favoriteOpportunities.value.filter((op) => op.id !== item.id);
            common_vendor.index.showToast({
              title: "已取消收藏",
              icon: "success"
            });
          }
        }
      });
    };
    const contactPublisher = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/message/chat?userId=${item.userId}`
      });
    };
    const navigateToDiscover = () => {
      common_vendor.index.switchTab({
        url: "/pages/discover/index"
      });
    };
    const navigateToBusiness = () => {
      common_vendor.index.switchTab({
        url: "/pages/business/index"
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
          favoriteActivities.value.push(...mockActivityData());
        } else {
          favoriteOpportunities.value.push(...mockOpportunityData());
        }
        loadStatus.value = "noMore";
      }, 1500);
    };
    common_vendor.onReachBottom(() => {
      loadMore();
    });
    const mockActivityData = () => [...Array(2)].map((_, i) => ({
      id: favoriteActivities.value.length + i + 1,
      title: `新收藏活动 ${favoriteActivities.value.length + i + 1}`,
      image: `/static/activity${(favoriteActivities.value.length + i) % 6 + 1}.jpg`,
      date: "2023年12月" + (5 + i) + "日",
      location: "活动地点" + (favoriteActivities.value.length + i),
      participants: {
        current: Math.floor(Math.random() * 50),
        total: 50
      },
      status: ["upcoming", "ongoing", "ended"][Math.floor(Math.random() * 3)],
      collectedTime: "2023-11-" + (15 + i)
    }));
    const mockOpportunityData = () => [...Array(2)].map((_, i) => ({
      id: favoriteOpportunities.value.length + i + 101,
      user: "用户" + (favoriteOpportunities.value.length + i),
      time: "2023-11-" + (20 + i) + " 10:30",
      content: `新的商机内容 ${favoriteOpportunities.value.length + i + 1}，寻找合作伙伴共同开发项目`,
      tags: ["标签" + (i + 1), "合作"],
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      status: ["active", "expired"][Math.floor(Math.random() * 2)],
      collectedTime: "2023-11-" + (15 + i)
    }));
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleBack),
        b: common_vendor.p({
          ["left-icon"]: "arrowleft",
          title: "我的收藏",
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
          type: "star-filled",
          size: "20",
          color: "#FF6B00"
        }),
        f: favoriteActivities.value.length > 0
      }, favoriteActivities.value.length > 0 ? {
        g: common_vendor.f(favoriteActivities.value, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getActivityStatusText(item.status)),
            d: common_vendor.n(item.status),
            e: "7c9d235a-3-" + i0,
            f: common_vendor.t(item.date),
            g: "7c9d235a-4-" + i0,
            h: common_vendor.t(item.location),
            i: "7c9d235a-5-" + i0,
            j: common_vendor.t(item.participants.current),
            k: common_vendor.t(item.participants.total),
            l: common_vendor.o(($event) => uncollectActivity(item), index),
            m: common_vendor.o(($event) => viewActivityDetail(item), index),
            n: index,
            o: common_vendor.o(($event) => viewActivityDetail(item), index)
          };
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
          title: "暂无收藏活动",
          description: "发现并收藏你感兴趣的活动吧"
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
          type: "star-filled",
          size: "20",
          color: "#FF6B00"
        }),
        s: favoriteOpportunities.value.length > 0
      }, favoriteOpportunities.value.length > 0 ? {
        t: common_vendor.f(favoriteOpportunities.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.user.charAt(0)),
            b: common_vendor.o(($event) => viewUserProfile(item.user), index),
            c: common_vendor.t(item.user),
            d: common_vendor.t(item.time),
            e: common_vendor.t(item.content),
            f: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            g: "7c9d235a-9-" + i0,
            h: common_vendor.t(item.likes),
            i: "7c9d235a-10-" + i0,
            j: common_vendor.t(item.comments),
            k: common_vendor.o(($event) => uncollectOpportunity(item), index),
            l: item.status === "active"
          }, item.status === "active" ? {
            m: common_vendor.o(($event) => contactPublisher(item), index)
          } : {}, {
            n: index,
            o: common_vendor.o(($event) => viewOpportunityDetail(item), index)
          });
        }),
        v: common_vendor.p({
          type: "hand-up",
          size: "16",
          color: "#999"
        }),
        w: common_vendor.p({
          type: "chat",
          size: "16",
          color: "#999"
        })
      } : {
        x: common_vendor.o(navigateToBusiness),
        y: common_vendor.p({
          title: "暂无收藏商机",
          description: "发现并收藏有价值的商机吧"
        })
      }, {
        z: common_vendor.o(loadMore),
        A: common_vendor.p({
          status: loadStatus.value,
          ["content-text"]: {
            contentdown: "上拉加载更多",
            contentrefresh: "正在加载...",
            contentnomore: "没有更多了"
          }
        }),
        B: currentTab.value === 1,
        C: refreshing.value,
        D: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c9d235a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-collection/my-collection.js.map
