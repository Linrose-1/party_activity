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
    common_vendor.onMounted(() => {
      getLogin();
    });
    const isLogin = common_vendor.ref(true);
    const member = common_vendor.ref("白银");
    const hasPaidMembership = common_vendor.computed(() => {
      const paidLevels = ["青铜", "白银", "黄金", "黑钻"];
      return paidLevels.includes(member.value);
    });
    const openId = common_vendor.ref("");
    const sessionKey = common_vendor.ref("");
    const getLogin = () => {
      common_vendor.index.login({
        success(res) {
          common_vendor.index.__f__("log", "at pages/home/home.vue:177", "login", res);
          if (res.code) {
            common_vendor.index.request({
              url: "https://api.weixin.qq.com/sns/jscode2session",
              data: {
                appid: "wx5710552f6a4d9a21",
                secret: "40cd5c7376efe0bd9adf43325aaf1c42",
                js_code: res.code,
                grant_type: "authorization_code"
              },
              success: (response) => {
                common_vendor.index.__f__("log", "at pages/home/home.vue:188", "res", response);
                openId.value = response.data.openid;
                sessionKey.value = response.data.session_key;
              }
            });
          } else {
            common_vendor.index.__f__("log", "at pages/home/home.vue:194", "登录失败！" + res.errMsg);
          }
        }
      });
    };
    const activeTab = common_vendor.ref("recommend");
    const searchQuery = common_vendor.ref("");
    const handleSearch = () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:208", "用户搜索内容:", searchQuery.value);
    };
    const recommendPosts = common_vendor.reactive([{
      id: 1,
      user: "陈总",
      time: "2025-06-15 20:44:34",
      content: "我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统，有意向的可以私信我详谈。",
      images: ["../../static/abc.png", "../../static/abc.png", "../../static/abc.png"],
      tags: ["#技术合作", "#AI开发", "#商务合作"],
      likes: 24,
      dislikes: 3,
      userAction: null,
      saved: false,
      isFollowed: false
    }]);
    const nearbyPosts = common_vendor.reactive([{
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
      saved: false,
      isFollowed: false
    }]);
    const followPosts = common_vendor.reactive([{
      id: 6,
      user: "A股大V",
      time: "2025-06-15 10:00:00",
      content: "分享近期对新能源汽车板块的看法，认为下半年仍有较大增长潜力，欢迎交流。",
      images: ["../../static/abc.png"],
      tags: ["#股市分析", "#新能源", "#投资"],
      likes: 100,
      dislikes: 10,
      userAction: null,
      saved: false,
      isFollowed: false
    }]);
    const huntingPosts = common_vendor.reactive([{
      id: 8,
      user: "猎头-张",
      time: "2025-06-16 09:00:00",
      content: "寻找一位有经验的全栈开发工程师，加入一个快速发展的金融科技初创公司，技术栈要求Vue + Node.js，待遇优厚，有期权激励。",
      images: [],
      tags: ["#人才招聘", "#全栈工程师", "#金融科技"],
      likes: 55,
      dislikes: 1,
      userAction: null,
      saved: false,
      isFollowed: false
    }, {
      id: 9,
      user: "创业者-刘",
      time: "2025-06-16 11:30:00",
      content: "我的新项目是一个基于社区的二手环保交易平台，已完成MVP，寻求一位市场合伙人共同开拓市场。有相关经验的请联系我！",
      images: ["../../static/abc.png"],
      tags: ["#寻找合伙人", "#市场推广", "#环保项目"],
      likes: 68,
      dislikes: 2,
      userAction: null,
      saved: false,
      isFollowed: false
    }]);
    const displayedPosts = common_vendor.computed(() => {
      switch (activeTab.value) {
        case "recommend":
          return recommendPosts;
        case "nearby":
          return nearbyPosts;
        case "follow":
          return followPosts;
        case "hunting":
          return huntingPosts;
        default:
          return [];
      }
    });
    const toggleAction = (post, action) => {
      if (post.userAction === action) {
        post.userAction = null;
        if (action === "like")
          post.likes--;
        else
          post.dislikes--;
      } else {
        const prevAction = post.userAction;
        post.userAction = action;
        if (action === "like") {
          post.likes++;
          if (prevAction === "dislike")
            post.dislikes--;
        } else {
          post.dislikes++;
          if (prevAction === "like")
            post.likes--;
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
    const toggleFollow = (post) => {
      post.isFollowed = !post.isFollowed;
      common_vendor.index.showToast({
        title: post.isFollowed ? "已关注" : "已取消关注",
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
    const goToLogin = () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:365", "触发跳转到登录页面");
      common_vendor.index.showToast({
        title: "正在前往登录页...",
        icon: "none"
      });
    };
    const goToMembership = () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:378", "触发跳转到会员升级页面");
      common_vendor.index.showToast({
        title: "正在前往会员中心...",
        icon: "none"
      });
    };
    const handlePostClick = (post) => {
      if (isLogin.value && hasPaidMembership.value) {
        skipCommercialDetail(post.id);
      } else if (isLogin.value && !hasPaidMembership.value) {
        goToMembership();
      } else {
        goToLogin();
      }
    };
    const skipApplicationBusinessCard = () => {
      common_vendor.index.navigateTo({
        url: "/pages/applicationBusinessCard/applicationBusinessCard"
      });
    };
    const skipCommercialDetail = (postId) => {
      common_vendor.index.navigateTo({
        url: `/pages/home-commercialDetail/home-commercialDetail?id=${postId}`
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
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/home/home.vue:477", "用户位置信息:", res);
          common_vendor.index.showToast({
            title: "位置获取成功",
            icon: "success",
            duration: 1e3
          });
          activeTab.value = tabName;
          lastLocationFetchTimestamp = currentTime;
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/home.vue:487", "获取位置失败", err);
          let errorMessage = "获取位置失败，无法查看附近商机。";
          if (err.errMsg.includes("频繁调用")) {
            errorMessage = "您点击太快啦，请稍后再试。";
          } else if (err.errMsg.includes("denied")) {
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
        b: common_vendor.o(handleSearch),
        c: searchQuery.value,
        d: common_vendor.o(($event) => searchQuery.value = $event.detail.value),
        e: common_vendor.o(handleSearch),
        f: activeTab.value === "recommend" ? 1 : "",
        g: common_vendor.o(($event) => handleTabClick("recommend")),
        h: activeTab.value === "nearby" ? 1 : "",
        i: common_vendor.o(($event) => handleTabClick("nearby")),
        j: activeTab.value === "follow" ? 1 : "",
        k: common_vendor.o(($event) => handleTabClick("follow")),
        l: activeTab.value === "hunting" ? 1 : "",
        m: common_vendor.o(($event) => handleTabClick("hunting")),
        n: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FFFFFF"
        }),
        o: common_vendor.o(postNew),
        p: common_vendor.f(displayedPosts.value, (post, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(post.user.charAt(0)),
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.user),
            d: common_vendor.t(post.time),
            e: common_vendor.t(post.isFollowed ? "已关注" : "关注"),
            f: post.isFollowed ? 1 : "",
            g: common_vendor.o(($event) => toggleFollow(post), post.id)
          }, isLogin.value && hasPaidMembership.value ? common_vendor.e({
            h: common_vendor.t(post.content),
            i: post.images && post.images.length
          }, post.images && post.images.length ? {
            j: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: imgIndex
              };
            })
          } : {}, {
            k: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            l: "07e72d3c-2-" + i0,
            m: common_vendor.p({
              type: "hand-up-filled",
              size: "18",
              color: "#e74c3c"
            }),
            n: common_vendor.t(post.likes),
            o: "07e72d3c-3-" + i0,
            p: common_vendor.p({
              type: "hand-down-filled",
              size: "18",
              color: "#3498db"
            }),
            q: common_vendor.t(post.dislikes),
            r: "07e72d3c-4-" + i0,
            s: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            t: post.userAction === "like" ? 1 : "",
            v: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            w: "07e72d3c-5-" + i0,
            x: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            y: post.userAction === "dislike" ? 1 : "",
            z: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            A: "07e72d3c-6-" + i0,
            B: common_vendor.p({
              type: post.saved ? "star-filled" : "star",
              size: "20",
              color: post.saved ? "#FF6A00" : "#666"
            }),
            C: post.saved ? 1 : "",
            D: common_vendor.o(($event) => toggleSave(post), post.id),
            E: "07e72d3c-7-" + i0,
            F: common_vendor.p({
              type: "redo",
              size: "20",
              color: "#666"
            }),
            G: common_vendor.o(($event) => sharePost(), post.id)
          }) : isLogin.value && !hasPaidMembership.value ? {
            H: common_vendor.o(goToMembership, post.id)
          } : {
            I: common_vendor.o(goToLogin, post.id)
          }, {
            J: post.id,
            K: common_vendor.o(($event) => handlePostClick(post), post.id)
          });
        }),
        q: isLogin.value && hasPaidMembership.value,
        r: isLogin.value && !hasPaidMembership.value,
        s: displayedPosts.value.length === 0
      }, displayedPosts.value.length === 0 ? {} : {}, {
        t: displayedPosts.value.length > 0
      }, displayedPosts.value.length > 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
