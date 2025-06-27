"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const isLogin = common_vendor.ref(true);
    const member = common_vendor.ref("白银");
    const hasPaidMembership = common_vendor.computed(() => {
      const paidLevels = ["青铜", "白银", "黄金", "黑钻"];
      return paidLevels.includes(member.value);
    });
    const postList = common_vendor.ref([]);
    const activeTab = common_vendor.ref(1);
    const searchQuery = common_vendor.ref("");
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const loadingStatus = common_vendor.ref("more");
    const location = common_vendor.reactive({
      longitude: "",
      latitude: ""
    });
    common_vendor.onMounted(() => {
      getBusinessOpportunitiesList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        getBusinessOpportunitiesList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      getBusinessOpportunitiesList(true);
    });
    function formatTimestamp(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    }
    const getBusinessOpportunitiesList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading")
        return;
      loadingStatus.value = "loading";
      if (isRefresh) {
        pageNo.value = 1;
        postList.value = [];
        loadingStatus.value = "more";
      }
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        tabIndex: activeTab.value
      };
      if (searchQuery.value) {
        params.searchKey = searchQuery.value;
      }
      if (activeTab.value === 2 && location.longitude && location.latitude) {
        params.longitude = location.longitude;
        params.latitude = location.latitude;
      }
      try {
        const result = await utils_request.request("/app-api/member/business-opportunities/list", {
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/home/home.vue:258", "getBusinessOpportunitiesList:", result);
        if (result && !result.error && result.data && result.data.list) {
          const apiData = result.data;
          const mappedData = apiData.list.map((item) => ({
            id: item.id,
            content: item.postContent,
            // 修正：处理 postImg 可能为 null 的情况，并支持逗号分隔
            images: item.postImg ? String(item.postImg).split(",").filter((img) => img) : [],
            // 修正：处理 tags 可能为 null 的情况
            tags: item.tags ? String(item.tags).split(",").filter((tag) => tag) : [],
            likes: item.likesCount,
            dislikes: item.dislikesCount,
            userAction: item.userLikeStr || null,
            isSaved: item.followFlag === 1,
            isFollowedUser: item.followUserFlag === 1,
            // 修正：使用 formatTimestamp 函数格式化时间
            time: formatTimestamp(item.createTime),
            user: {
              id: item.userId,
              // 使用 contactPerson 作为用户名
              name: item.contactPerson || "匿名用户",
              avatar: ""
            }
          }));
          postList.value = [...postList.value, ...mappedData];
          if (postList.value.length >= apiData.total) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
          }
        } else {
          loadingStatus.value = "more";
          const errorMsg = result && result.error ? result.error.message : "加载失败";
          common_vendor.index.showToast({ title: errorMsg, icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:306", "getBusinessOpportunitiesList error:", error);
        loadingStatus.value = "more";
        common_vendor.index.showToast({ title: "网络请求异常", icon: "none" });
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleSearch = () => {
      getBusinessOpportunitiesList(true);
    };
    const handleTabClick = (tabIndex) => {
      if (activeTab.value === tabIndex)
        return;
      activeTab.value = tabIndex;
      if (tabIndex === 2) {
        common_vendor.index.getSetting({
          success: (res) => {
            if (res.authSetting["scope.userLocation"]) {
              getLocationAndFetchData();
            } else {
              common_vendor.index.authorize({
                scope: "scope.userLocation",
                success: () => getLocationAndFetchData(),
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
          }
        });
      } else {
        getBusinessOpportunitiesList(true);
      }
    };
    const getLocationAndFetchData = () => {
      common_vendor.index.showLoading({ title: "正在定位..." });
      common_vendor.index.getLocation({
        type: "wgs84",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/home/home.vue:370", "用户位置信息:", res);
          location.longitude = res.longitude.toString();
          location.latitude = res.latitude.toString();
          getBusinessOpportunitiesList(true);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/home.vue:378", "获取位置失败", err);
          common_vendor.index.showToast({ title: "获取位置失败", icon: "none" });
          getBusinessOpportunitiesList(true);
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    };
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
      post.isSaved = !post.isSaved;
      common_vendor.index.showToast({
        title: post.isSaved ? "已收藏" : "已取消收藏",
        icon: "none"
      });
    };
    const toggleFollow = (post) => {
      post.isFollowedUser = !post.isFollowedUser;
      common_vendor.index.showToast({
        title: post.isFollowedUser ? "已关注" : "已取消关注",
        icon: "none"
      });
    };
    const sharePost = (post) => {
      common_vendor.index.showToast({ title: "分享功能即将上线", icon: "none" });
    };
    const postNew = () => {
      common_vendor.index.navigateTo({ url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish" });
    };
    const goToLogin = () => {
      common_vendor.index.showToast({ title: "正在前往登录页...", icon: "none" });
    };
    const goToMembership = () => {
      common_vendor.index.showToast({ title: "正在前往会员中心...", icon: "none" });
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
      common_vendor.index.navigateTo({ url: "/pages/applicationBusinessCard/applicationBusinessCard" });
    };
    const skipCommercialDetail = (postId) => {
      common_vendor.index.navigateTo({ url: `/pages/home-commercialDetail/home-commercialDetail?id=${postId}` });
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
        f: activeTab.value === 1 ? 1 : "",
        g: common_vendor.o(($event) => handleTabClick(1)),
        h: activeTab.value === 2 ? 1 : "",
        i: common_vendor.o(($event) => handleTabClick(2)),
        j: activeTab.value === 3 ? 1 : "",
        k: common_vendor.o(($event) => handleTabClick(3)),
        l: activeTab.value === 4 ? 1 : "",
        m: common_vendor.o(($event) => handleTabClick(4)),
        n: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FFFFFF"
        }),
        o: common_vendor.o(postNew),
        p: common_vendor.f(postList.value, (post, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(post.user.name.charAt(0)),
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.user.name),
            d: common_vendor.t(post.time),
            e: common_vendor.t(post.isFollowedUser ? "已关注" : "关注"),
            f: post.isFollowedUser ? 1 : "",
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
            k: post.tags && post.tags.length
          }, post.tags && post.tags.length ? {
            l: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, {
            m: "07e72d3c-2-" + i0,
            n: common_vendor.p({
              type: "hand-up-filled",
              size: "18",
              color: "#e74c3c"
            }),
            o: common_vendor.t(post.likes),
            p: "07e72d3c-3-" + i0,
            q: common_vendor.p({
              type: "hand-down-filled",
              size: "18",
              color: "#3498db"
            }),
            r: common_vendor.t(post.dislikes),
            s: "07e72d3c-4-" + i0,
            t: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            v: post.userAction === "like" ? 1 : "",
            w: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            x: "07e72d3c-5-" + i0,
            y: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            z: post.userAction === "dislike" ? 1 : "",
            A: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            B: "07e72d3c-6-" + i0,
            C: common_vendor.p({
              type: post.isSaved ? "star-filled" : "star",
              size: "20",
              color: post.isSaved ? "#FF6A00" : "#666"
            }),
            D: post.isSaved ? 1 : "",
            E: common_vendor.o(($event) => toggleSave(post), post.id),
            F: "07e72d3c-7-" + i0,
            G: common_vendor.p({
              type: "redo",
              size: "20",
              color: "#666"
            }),
            H: common_vendor.o(($event) => sharePost(), post.id)
          }) : isLogin.value && !hasPaidMembership.value ? {
            I: common_vendor.o(goToMembership, post.id)
          } : {
            J: common_vendor.o(goToLogin, post.id)
          }, {
            K: post.id,
            L: common_vendor.o(($event) => handlePostClick(post), post.id)
          });
        }),
        q: isLogin.value && hasPaidMembership.value,
        r: isLogin.value && !hasPaidMembership.value,
        s: postList.value.length === 0 && loadingStatus.value === "noMore"
      }, postList.value.length === 0 && loadingStatus.value === "noMore" ? {} : loadingStatus.value === "loading" ? {
        v: common_vendor.p({
          status: "loading",
          ["contentText.loading"]: "正在加载..."
        })
      } : loadingStatus.value === "noMore" ? {
        x: common_vendor.p({
          status: "noMore",
          ["contentText.noMore"]: "暂无更多内容"
        })
      } : {}, {
        t: loadingStatus.value === "loading",
        w: loadingStatus.value === "noMore"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
