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
    const loggedInUserId = common_vendor.ref(null);
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
    const isActionInProgress = common_vendor.ref(false);
    const location = common_vendor.reactive({
      longitude: "",
      latitude: ""
    });
    common_vendor.onMounted(() => {
      loggedInUserId.value = common_vendor.index.getStorageSync("userId");
      common_vendor.index.__f__("log", "at pages/home/home.vue:194", "当前列表页登录用户ID:", loggedInUserId.value);
      getBusinessOpportunitiesList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        getBusinessOpportunitiesList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:205", "用户触发了下拉刷新");
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
        if (result && result.error && result.error.includes("未登录")) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none",
            duration: 1500
          });
          common_vendor.index.stopPullDownRefresh();
          setTimeout(() => {
            common_vendor.index.navigateTo({
              url: "/pages/index/index"
            });
          }, 1500);
          return;
        }
        if (result && !result.error && result.data && result.data.list) {
          const apiData = result.data;
          const mappedData = apiData.list.map((item) => ({
            id: item.id,
            content: item.postContent,
            title: item.postTitle,
            images: item.postImg ? String(item.postImg).split(",").filter((img) => img) : [],
            tags: item.tags ? Array.isArray(item.tags) ? item.tags : String(item.tags).split(
              ","
            ).filter((tag) => tag) : [],
            likes: item.likesCount || 0,
            // 确保是数字
            dislikes: item.dislikesCount || 0,
            // 确保是数字
            userAction: item.userLikeStr || null,
            isSaved: item.followFlag === 1,
            isFollowedUser: item.followUserFlag === 1,
            time: formatTimestamp(item.createTime),
            user: {
              id: item.memberUser.id,
              name: item.memberUser.nickname || "匿名用户",
              avatar: item.memberUser.avatar
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
          loadingStatus.value = "noMore";
          const errorMsg = result && result.error ? result.error.message : "加载失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:312", "getBusinessOpportunitiesList error:", error);
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: "网络请求异常",
          icon: "none"
        });
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
      common_vendor.index.showLoading({
        title: "正在定位..."
      });
      common_vendor.index.getLocation({
        type: "wgs84",
        success: (res) => {
          location.longitude = res.longitude.toString();
          location.latitude = res.latitude.toString();
          getBusinessOpportunitiesList(true);
        },
        fail: (err) => {
          getBusinessOpportunitiesList(true);
        },
        complete: () => common_vendor.index.hideLoading()
      });
    };
    const toggleAction = async (post, clickedAction) => {
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      const originalAction = post.userAction;
      const originalLikes = post.likes;
      const originalDislikes = post.dislikes;
      if (post.userAction === clickedAction) {
        post.userAction = null;
        if (clickedAction === "like")
          post.likes--;
        else
          post.dislikes--;
      } else {
        post.userAction = clickedAction;
        if (clickedAction === "like") {
          post.likes++;
          if (originalAction === "dislike")
            post.dislikes--;
        } else {
          post.dislikes++;
          if (originalAction === "like")
            post.likes--;
        }
      }
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: post.id,
          targetType: "post",
          action: post.userAction
          // 发送更新后的action ('like', 'dislike' 或 null)
        };
        const result = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: requestData
        });
        if (result && result.error) {
          post.userAction = originalAction;
          post.likes = originalLikes;
          post.dislikes = originalDislikes;
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        post.userAction = originalAction;
        post.likes = originalLikes;
        post.dislikes = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const toggleSave = async (post) => {
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      const originalStatus = post.isSaved;
      post.isSaved = !originalStatus;
      const apiUrl = post.isSaved ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: post.id,
          targetType: "post"
        };
        const result = await utils_request.request(apiUrl, {
          method: "POST",
          data: requestData
        });
        if (result && result.error) {
          post.isSaved = originalStatus;
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: post.isSaved ? "已收藏" : "已取消收藏",
            icon: "none"
          });
        }
      } catch (error) {
        post.isSaved = originalStatus;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const toggleFollow = async (post) => {
      if (isActionInProgress.value)
        return;
      if (!loggedInUserId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      isActionInProgress.value = true;
      const originalStatus = post.isFollowedUser;
      post.isFollowedUser = !originalStatus;
      const apiUrl = post.isFollowedUser ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const requestData = {
          userId: loggedInUserId.value,
          targetId: post.user.id,
          targetType: "post_user"
        };
        const result = await utils_request.request(apiUrl, {
          method: "POST",
          data: requestData
        });
        if (result && result.error) {
          post.isFollowedUser = originalStatus;
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: post.isFollowedUser ? "已关注" : "已取消关注",
            icon: "none"
          });
        }
      } catch (error) {
        post.isFollowedUser = originalStatus;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const postNew = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    const goToLogin = () => {
      common_vendor.index.showToast({
        title: "正在前往登录页...",
        icon: "none"
      });
    };
    const goToMembership = () => {
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
    const skipApplicationBusinessCard = (userId) => {
      common_vendor.index.navigateTo({
        url: `/pages/applicationBusinessCard/applicationBusinessCard?id=${userId}`
      });
    };
    const skipCommercialDetail = (postId) => {
      common_vendor.index.navigateTo({
        url: `/pages/home-commercialDetail/home-commercialDetail?id=${postId}`
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
            a: post.user.avatar,
            b: common_vendor.o(($event) => skipApplicationBusinessCard(post.user.id), post.id),
            c: common_vendor.t(post.user.name),
            d: common_vendor.t(post.time),
            e: loggedInUserId.value !== post.user.id
          }, loggedInUserId.value !== post.user.id ? {
            f: common_vendor.t(post.isFollowedUser ? "已关注" : "关注"),
            g: post.isFollowedUser ? 1 : "",
            h: common_vendor.o(($event) => toggleFollow(post), post.id)
          } : {}, isLogin.value && hasPaidMembership.value ? common_vendor.e({
            i: common_vendor.t(post.title),
            j: post.images && post.images.length
          }, post.images && post.images.length ? {
            k: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: imgIndex
              };
            })
          } : {}, {
            l: post.tags && post.tags.length
          }, post.tags && post.tags.length ? {
            m: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, {
            n: "07e72d3c-2-" + i0,
            o: common_vendor.p({
              type: "hand-up-filled",
              size: "18",
              color: "#e74c3c"
            }),
            p: common_vendor.t(post.likes),
            q: "07e72d3c-3-" + i0,
            r: common_vendor.p({
              type: "hand-down-filled",
              size: "18",
              color: "#3498db"
            }),
            s: common_vendor.t(post.dislikes),
            t: "07e72d3c-4-" + i0,
            v: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            w: post.userAction === "like" ? 1 : "",
            x: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            y: "07e72d3c-5-" + i0,
            z: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            A: post.userAction === "dislike" ? 1 : "",
            B: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            C: "07e72d3c-6-" + i0,
            D: common_vendor.p({
              type: post.isSaved ? "star-filled" : "star",
              size: "20",
              color: post.isSaved ? "#FF6A00" : "#666"
            }),
            E: common_vendor.t(post.isSaved ? "已收藏" : "收藏"),
            F: post.isSaved ? 1 : "",
            G: common_vendor.o(($event) => toggleSave(post), post.id)
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
