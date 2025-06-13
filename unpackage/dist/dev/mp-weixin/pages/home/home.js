"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const FETCH_LOCATION_MIN_INTERVAL = 5e3;
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const activeTab = common_vendor.ref("recommend");
    const recommendPosts = common_vendor.reactive([
      {
        id: 1,
        user: "陈总",
        time: "2025-06-15 20:44:34",
        content: "我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统，有意向的可以私信我详谈。",
        images: [
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png"
        ],
        tags: ["#技术合作", "#AI开发", "#商务合作"],
        likes: 24,
        dislikes: 3,
        userAction: null,
        // 'like' or 'dislike'
        saved: false
      },
      {
        id: 2,
        user: "李经理",
        time: "2025-06-15 20:44:34",
        content: "刚参加完供应链优化研讨会，获益良多。这次分享几个关于仓储管理的新思路，希望对同行有所帮助。",
        images: [
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png"
        ],
        tags: ["#供应链管理", "#仓储物流", "#经验分享"],
        likes: 45,
        dislikes: 2,
        userAction: null,
        saved: false
      },
      {
        id: 3,
        user: "张教授",
        time: "2025-06-15 20:44:34",
        content: "寻找医疗器械领域的投资机会，特别关注创新型医疗设备和AI辅助诊断方向，欢迎推荐优质项目。",
        images: [
          "../../static/abc.png",
          "../../static/abc.png"
        ],
        tags: ["#投资合作", "#医疗健康", "#项目对接"],
        likes: 32,
        dislikes: 5,
        userAction: null,
        saved: false
      }
    ]);
    const nearbyPosts = common_vendor.reactive([
      {
        id: 4,
        user: "王老板",
        time: "2025-06-15 18:00:00",
        content: "我在XX商圈新开了一家智能咖啡馆，提供共享办公空间和优质咖啡，欢迎附近的朋友来体验！",
        images: [
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png",
          "../../static/abc.png"
        ],
        tags: ["#本地商机", "#餐饮", "#共享空间"],
        likes: 12,
        dislikes: 1,
        userAction: null,
        saved: false
      },
      {
        id: 5,
        user: "赵律师",
        time: "2025-06-15 15:30:00",
        content: "提供企业法律咨询服务，尤其擅长合同纠纷和知识产权保护，欢迎同城企业咨询。",
        images: [],
        // 无图片
        tags: ["#法律服务", "#企业咨询", "#同城服务"],
        likes: 8,
        dislikes: 0,
        userAction: null,
        saved: false
      }
    ]);
    const followPosts = common_vendor.reactive([
      {
        id: 6,
        user: "A股大V",
        time: "2025-06-15 10:00:00",
        content: "分享近期对新能源汽车板块的看法，认为下半年仍有较大增长潜力，欢迎交流。",
        images: [
          "../../static/abc.png"
        ],
        tags: ["#股市分析", "#新能源", "#投资"],
        likes: 100,
        dislikes: 10,
        userAction: null,
        saved: false
      },
      {
        id: 7,
        user: "跨境电商专家",
        time: "2025-06-14 22:00:00",
        content: "针对东南亚跨境电商市场进行深度解析，欢迎寻找合作伙伴或想进入该市场的同行交流。",
        images: [
          "../../static/abc.png",
          "../../static/abc.png"
        ],
        tags: ["#跨境电商", "#东南亚市场", "#国际贸易"],
        likes: 78,
        dislikes: 5,
        userAction: null,
        saved: false
      }
    ]);
    const displayedPosts = common_vendor.computed(() => {
      switch (activeTab.value) {
        case "recommend":
          return recommendPosts;
        case "nearby":
          return nearbyPosts;
        case "follow":
          return followPosts;
        default:
          return [];
      }
    });
    const toggleAction = (post, action) => {
      if (post.userAction === action) {
        post.userAction = null;
        if (action === "like") {
          post.likes--;
        } else {
          post.dislikes--;
        }
      } else {
        const prevAction = post.userAction;
        post.userAction = action;
        if (action === "like") {
          post.likes++;
          if (prevAction === "dislike") {
            post.dislikes--;
          }
        } else {
          post.dislikes++;
          if (prevAction === "like") {
            post.likes--;
          }
        }
      }
    };
    const toggleSave = (post) => {
      post.saved = !post.saved;
      common_vendor.index.showToast({
        title: post.saved ? "已收藏" : "已取消收藏",
        icon: "none"
      });
    };
    const sharePost = (post) => {
      common_vendor.index.showToast({
        title: "分享功能即将上线",
        icon: "none"
      });
    };
    const postNew = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    const skipApplicationBusinessCard = () => {
      common_vendor.index.navigateTo({
        url: "/pages/applicationBusinessCard/applicationBusinessCard"
      });
    };
    const skipCommercialDetail = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-commercialDetail/home-commercialDetail"
      });
    };
    let lastLocationFetchTimestamp = 0;
    const handleTabClick = (tabName) => {
      if (tabName === "nearby") {
        common_vendor.index.getSetting({
          success: (res) => {
            if (res.authSetting["scope.userLocation"]) {
              tryGetLocationAndSwitchTab(tabName);
            } else {
              common_vendor.index.authorize({
                scope: "scope.userLocation",
                success: () => {
                  tryGetLocationAndSwitchTab(tabName);
                },
                fail: () => {
                  common_vendor.index.showModal({
                    title: "温馨提示",
                    content: "您已拒绝获取位置信息，无法查看附近商机。请在设置中开启位置权限。",
                    showCancel: false,
                    confirmText: "我知道了"
                  });
                }
              });
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/home/home.vue:426", "获取用户设置失败", err);
            common_vendor.index.showToast({
              title: "检查权限失败",
              icon: "none"
            });
          }
        });
      } else {
        activeTab.value = tabName;
      }
    };
    const tryGetLocationAndSwitchTab = (tabName) => {
      const currentTime = Date.now();
      if (currentTime - lastLocationFetchTimestamp < FETCH_LOCATION_MIN_INTERVAL) {
        common_vendor.index.__f__("log", "at pages/home/home.vue:450", "短时间内重复点击“附近”tab，跳过 uni.getLocation 调用，直接切换tab。");
        activeTab.value = tabName;
        common_vendor.index.showToast({
          title: "位置信息已是最新",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      common_vendor.index.getLocation({
        type: "wgs84",
        // 使用WGS84坐标系，适用于地图展示
        success: (res) => {
          const latitude = res.latitude;
          const longitude = res.longitude;
          common_vendor.index.__f__("log", "at pages/home/home.vue:465", "用户位置信息:", { latitude, longitude });
          common_vendor.index.showToast({
            title: "位置获取成功",
            icon: "success",
            duration: 1e3
          });
          activeTab.value = tabName;
          lastLocationFetchTimestamp = currentTime;
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/home.vue:475", "获取位置失败", err);
          let errorMessage = "获取位置失败，无法查看附近商机。";
          if (err.errMsg.includes("频繁调用") || err.errMsg.includes("frequent call")) {
            errorMessage = "您点击太快啦，请稍后再试。";
          } else if (err.errMsg.includes("denied") || err.errMsg.includes("not authorized")) {
            errorMessage = "您已拒绝获取位置信息，无法查看附近商机。请检查系统设置。";
          }
          common_vendor.index.showModal({
            title: "温馨提示",
            content: errorMessage,
            showCancel: false,
            confirmText: "我知道了"
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "20",
          color: "#FF6A00"
        }),
        b: activeTab.value === "recommend" ? 1 : "",
        c: common_vendor.o(($event) => handleTabClick("recommend")),
        d: activeTab.value === "nearby" ? 1 : "",
        e: common_vendor.o(($event) => handleTabClick("nearby")),
        f: activeTab.value === "follow" ? 1 : "",
        g: common_vendor.o(($event) => handleTabClick("follow")),
        h: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FFFFFF"
        }),
        i: common_vendor.o(postNew),
        j: common_vendor.f(displayedPosts.value, (post, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(post.user.charAt(0)),
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.user),
            d: common_vendor.t(post.time),
            e: common_vendor.t(post.content),
            f: post.images && post.images.length
          }, post.images && post.images.length ? {
            g: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: imgIndex
              };
            })
          } : {}, {
            h: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            i: "07e72d3c-2-" + i0,
            j: common_vendor.t(post.likes),
            k: "07e72d3c-3-" + i0,
            l: common_vendor.t(post.dislikes),
            m: "07e72d3c-4-" + i0,
            n: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            o: post.userAction === "like" ? 1 : "",
            p: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            q: "07e72d3c-5-" + i0,
            r: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            s: post.userAction === "dislike" ? 1 : "",
            t: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            v: "07e72d3c-6-" + i0,
            w: common_vendor.p({
              type: post.saved ? "star-filled" : "star",
              size: "20",
              color: post.saved ? "#FF6A00" : "#666"
            }),
            x: post.saved ? 1 : "",
            y: common_vendor.o(($event) => toggleSave(post), post.id),
            z: "07e72d3c-7-" + i0,
            A: common_vendor.o(($event) => sharePost(), post.id),
            B: post.id,
            C: common_vendor.o(skipCommercialDetail, post.id)
          });
        }),
        k: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#e74c3c"
        }),
        l: common_vendor.p({
          type: "hand-down-filled",
          size: "18",
          color: "#3498db"
        }),
        m: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#666"
        }),
        n: displayedPosts.value.length === 0
      }, displayedPosts.value.length === 0 ? {} : {}, {
        o: displayedPosts.value.length > 0
      }, displayedPosts.value.length > 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
