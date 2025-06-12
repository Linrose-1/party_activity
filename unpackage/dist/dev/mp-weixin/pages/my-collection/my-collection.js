"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _component_empty_state = common_vendor.resolveComponent("empty-state");
  (_easycom_uni_icons2 + _easycom_uni_segmented_control2 + _component_empty_state)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_segmented_control)();
}
const _sfc_main = {
  __name: "my-collection",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["收藏的活动", "收藏的商机"]);
    const refreshing = common_vendor.ref(false);
    const favoriteActivities = common_vendor.reactive([
      {
        id: 1,
        title: "周末户外登山活动 - 挑战青龙山",
        image: "https://via.placeholder.com/300/FF6B00/FFFFFF?text=登山活动",
        date: "2023年11月25日 08:00-17:00",
        location: "青龙山国家森林公园",
        participants: { current: 28, total: 50 },
        organizer: "户外探险俱乐部",
        tags: ["户外", "运动"]
      },
      {
        id: 2,
        title: "科技创新交流沙龙",
        image: "https://via.placeholder.com/300/4CAF50/FFFFFF?text=科技沙龙",
        date: "2023年12月10日 14:00-17:00",
        location: "市科技馆报告厅",
        participants: { current: 80, total: 100 },
        organizer: "创新科技协会",
        tags: ["科技", "交流", "创新"]
      }
    ]);
    const favoriteOpportunities = common_vendor.reactive([
      {
        id: 101,
        user: "李总",
        time: "2025-06-16 10:00:00",
        content: "我司寻求智能家居项目合作，主要方向为AIoT设备连接与数据分析平台。欢迎有相关经验的团队联系，可提供技术方案或产品。",
        images: [
          "https://via.placeholder.com/150/FF6A00/FFFFFF?text=智能家居1",
          "https://via.placeholder.com/150/FF6A00/FFFFFF?text=智能家居2"
        ],
        tags: ["#智能家居", "#AIoT", "#项目合作"],
        likes: 15,
        dislikes: 0,
        userAction: null,
        saved: true
      },
      {
        id: 102,
        user: "王经理",
        time: "2025-06-15 14:30:00",
        content: "本人有一批高质量二手办公家具转让，适合创业公司或小型办公室，价格优惠，可上门看货。",
        images: [
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具1",
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具2",
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具3"
        ],
        tags: ["#二手转让", "#办公用品", "#创业福利"],
        likes: 8,
        dislikes: 1,
        userAction: null,
        saved: true
      }
    ]);
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const switchTab = (e) => {
      currentTab.value = e.currentIndex;
      refreshing.value = false;
    };
    const onRefresh = () => {
      refreshing.value = true;
      setTimeout(() => {
        common_vendor.index.__f__("log", "at pages/my-collection/my-collection.vue:258", "数据刷新完成");
        refreshing.value = false;
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      }, 1e3);
    };
    const skipActivityDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/active-detail/active-detail?id=${id}`
        // 假设活动详情页路由
      });
    };
    const removeFavoriteActivity = (id) => {
      common_vendor.index.showModal({
        title: "取消收藏",
        content: "确定要取消收藏此活动吗？",
        success: (res) => {
          if (res.confirm) {
            const index = favoriteActivities.findIndex((activity) => activity.id === id);
            if (index !== -1) {
              favoriteActivities.splice(index, 1);
              common_vendor.index.showToast({
                title: "已取消收藏",
                icon: "success"
              });
            }
          }
        }
      });
    };
    const navigateToDiscoverActivities = () => {
      common_vendor.index.switchTab({
        url: "/pages/activity/index"
        // 假设活动发现页的tabbar路径
      });
    };
    const skipCommercialDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}`
        // 假设商机详情页路由
      });
    };
    const removeFavoriteOpportunity = (id) => {
      common_vendor.index.showModal({
        title: "取消收藏",
        content: "确定要取消收藏此商机吗？",
        success: (res) => {
          if (res.confirm) {
            const index = favoriteOpportunities.findIndex((post) => post.id === id);
            if (index !== -1) {
              favoriteOpportunities.splice(index, 1);
              common_vendor.index.showToast({
                title: "已取消收藏",
                icon: "success"
              });
            }
          }
        }
      });
    };
    const navigateToDiscoverOpportunities = () => {
      common_vendor.index.switchTab({
        url: "/pages/home/index"
        // 假设商机发现页的tabbar路径
      });
    };
    const skipApplicationBusinessCard = () => {
      common_vendor.index.navigateTo({
        url: "/pages/applicationBusinessCard/applicationBusinessCard"
      });
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current],
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function(data) {
            common_vendor.index.__f__("log", "at pages/my-collection/my-collection.vue:344", "选中了第" + (data.tapIndex + 1) + "个按钮，第" + (data.index + 1) + "张图片");
          },
          fail: function(err) {
            common_vendor.index.__f__("log", "at pages/my-collection/my-collection.vue:347", err.errMsg);
          }
        }
      });
    };
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "22",
          color: "#FFFFFF"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.o(switchTab),
        d: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        e: favoriteActivities.length > 0
      }, favoriteActivities.length > 0 ? {
        f: common_vendor.f(favoriteActivities, (item, k0, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: "7c9d235a-2-" + i0,
            d: common_vendor.t(item.date),
            e: "7c9d235a-3-" + i0,
            f: common_vendor.t(item.location),
            g: "7c9d235a-4-" + i0,
            h: common_vendor.t(item.organizer),
            i: common_vendor.o(($event) => removeFavoriteActivity(item.id), item.id),
            j: common_vendor.o(($event) => skipActivityDetail(item.id), item.id),
            k: item.id,
            l: common_vendor.o(($event) => skipActivityDetail(item.id), item.id)
          };
        }),
        g: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        h: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#999"
        }),
        i: common_vendor.p({
          type: "person",
          size: "16",
          color: "#999"
        })
      } : {
        j: common_vendor.o(navigateToDiscoverActivities),
        k: common_vendor.p({
          title: "暂无收藏活动",
          description: "快去发现并收藏感兴趣的活动吧"
        })
      }, {
        l: currentTab.value === 0,
        m: refreshing.value,
        n: common_vendor.o(onRefresh),
        o: favoriteOpportunities.length > 0
      }, favoriteOpportunities.length > 0 ? {
        p: common_vendor.f(favoriteOpportunities, (post, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(post.user.charAt(0)),
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.user),
            d: "7c9d235a-6-" + i0,
            e: common_vendor.t(post.time),
            f: "7c9d235a-7-" + i0,
            g: common_vendor.o(($event) => removeFavoriteOpportunity(post.id), post.id),
            h: common_vendor.t(post.content),
            i: post.images && post.images.length
          }, post.images && post.images.length ? {
            j: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.images, imgIndex), imgIndex),
                c: imgIndex
              };
            })
          } : {}, {
            k: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            l: "7c9d235a-8-" + i0,
            m: common_vendor.t(post.likes),
            n: "7c9d235a-9-" + i0,
            o: common_vendor.t(post.dislikes),
            p: post.id,
            q: common_vendor.o(($event) => skipCommercialDetail(post.id), post.id)
          });
        }),
        q: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        r: common_vendor.p({
          type: "trash-fill",
          size: "20",
          color: "#FF6A00"
        }),
        s: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#e74c3c"
        }),
        t: common_vendor.p({
          type: "hand-down-filled",
          size: "18",
          color: "#3498db"
        })
      } : {
        v: common_vendor.o(navigateToDiscoverOpportunities),
        w: common_vendor.p({
          title: "暂无收藏商机",
          description: "快去发现并收藏感兴趣的商机吧"
        })
      }, {
        x: currentTab.value === 1,
        y: refreshing.value,
        z: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c9d235a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-collection/my-collection.js.map
