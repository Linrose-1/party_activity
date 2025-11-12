"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
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
const defaultAvatarUrl = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const loggedInUserId = common_vendor.ref(null);
    const isLogin = common_vendor.ref(false);
    const member = common_vendor.ref("白银");
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
    const isInitialLoad = common_vendor.ref(true);
    const hasPaidMembership = common_vendor.computed(() => {
      const paidLevels = ["青铜", "白银", "黄金", "黑钻"];
      return paidLevels.includes(member.value);
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:216", "首页 onMounted: 开始监听 postUpdated 事件");
      common_vendor.index.$on("postUpdated", handlePostUpdate);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:221", "首页 onUnmounted: 移除 postUpdated 事件监听");
      common_vendor.index.$off("postUpdated", handlePostUpdate);
    });
    common_vendor.onShow(() => {
      const currentUserId = common_vendor.index.getStorageSync("userId");
      const currentUserIsLogin = !!currentUserId;
      if (isInitialLoad.value || isLogin.value !== currentUserIsLogin || postList.value.length === 0) {
        common_vendor.index.__f__("log", "at pages/home/home.vue:235", "触发刷新: 首次加载或登录状态变更");
        loggedInUserId.value = currentUserId;
        isLogin.value = currentUserIsLogin;
        getBusinessOpportunitiesList(true);
        isInitialLoad.value = false;
      } else {
        common_vendor.index.__f__("log", "at pages/home/home.vue:247", "从详情页返回，不刷新列表，保持滚动位置。");
      }
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        getBusinessOpportunitiesList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      getBusinessOpportunitiesList(true);
    });
    common_vendor.onShareAppMessage(() => {
      const sharerId = common_vendor.index.getStorageSync("userId");
      const inviteCode = utils_user.getInviteCode();
      const params = [];
      if (sharerId)
        params.push(`sharerId=${sharerId}`);
      if (inviteCode)
        params.push(`inviteCode=${inviteCode}`);
      const sharePath = `/pages/home/home${params.length > 0 ? "?" + params.join("&") : ""}`;
      return {
        title: "发现了一个每天都想打开的商友社交小工具！点戳进入☞☞",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    common_vendor.onShareTimeline(() => {
      const sharerId = common_vendor.index.getStorageSync("userId");
      const inviteCode = utils_user.getInviteCode();
      const params = [];
      if (sharerId)
        params.push(`sharerId=${sharerId}`);
      if (inviteCode)
        params.push(`inviteCode=${inviteCode}`);
      const queryString = params.join("&");
      return {
        title: "发现了一个每天都想打开的商友社交小工具！点戳进入☞☞",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    const handlePostUpdate = () => {
      common_vendor.index.__f__("log", "at pages/home/home.vue:309", "接收到 postUpdated 通知，强制刷新首页列表...");
      getBusinessOpportunitiesList(true);
    };
    const getBusinessOpportunitiesList = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" && !isRefresh)
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
      if (searchQuery.value)
        params.searchKey = searchQuery.value;
      if (activeTab.value === 2 && location.longitude && location.latitude) {
        params.longitude = location.longitude;
        params.latitude = location.latitude;
      }
      try {
        const {
          data: apiData,
          error
        } = await utils_request.request("/app-api/member/business-opportunities/list", {
          method: "GET",
          data: params
        });
        if (error || !apiData || !apiData.list) {
          loadingStatus.value = error ? "more" : "noMore";
          if (error)
            common_vendor.index.showToast({
              title: `加载失败: ${error}`,
              icon: "none"
            });
          if (isRefresh)
            postList.value = [];
          return;
        }
        const mappedData = apiData.list.map((item) => {
          var _a, _b, _c;
          const plainText = (item.postContent || "").replace(/<[^>]+>/g, "").trim();
          const isTruncated = plainText.length > 100;
          const displayContent = isTruncated ? plainText.substring(0, 100) : plainText;
          return {
            id: item.id,
            title: item.postTitle,
            // 【修改】使用新的内容变量
            fullContent: plainText,
            // 完整纯文本内容，为长按复制做准备
            displayContent,
            // 用于显示的内容
            isTruncated,
            // 是否被截断的标志
            // ==================== 【核心修改点】 ====================
            // 1. 检查并赋值 postVideo 字段
            video: item.postVideo || "",
            // 2. 将 postImg 的处理结果赋值给 images 字段
            images: item.postImg ? String(item.postImg).split(",").filter((img) => img) : [],
            // =======================================================
            tags: item.tags ? Array.isArray(item.tags) ? item.tags : String(item.tags).split(",").filter((tag) => tag) : [],
            likes: item.likesCount || 0,
            dislikes: item.dislikesCount || 0,
            commonCount: item.commonCount || 0,
            userAction: item.userLikeStr || null,
            isSaved: item.followFlag === 1,
            isFollowedUser: item.followUserFlag === 1,
            time: formatTimestamp(item.createTime),
            user: {
              id: ((_a = item.memberUser) == null ? void 0 : _a.id) || item.userId,
              name: ((_b = item.memberUser) == null ? void 0 : _b.nickname) || "匿名用户",
              avatar: ((_c = item.memberUser) == null ? void 0 : _c.avatar) || defaultAvatarUrl
            }
          };
        });
        postList.value = isRefresh ? mappedData : [...postList.value, ...mappedData];
        if (postList.value.length >= apiData.total) {
          loadingStatus.value = "noMore";
        } else {
          loadingStatus.value = "more";
          pageNo.value++;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:403", "getBusinessOpportunitiesList 逻辑异常:", err);
        loadingStatus.value = "more";
        common_vendor.index.showToast({
          title: "页面逻辑异常，请稍后重试",
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
        checkAndGetLocation();
      } else {
        getBusinessOpportunitiesList(true);
      }
    };
    const checkAndGetLocation = () => {
      common_vendor.index.getSetting({
        success: (res) => {
          if (res.authSetting["scope.userLocation"]) {
            getLocationAndFetchData();
          } else {
            common_vendor.index.authorize({
              scope: "scope.userLocation",
              success: () => getLocationAndFetchData(),
              fail: () => common_vendor.index.showModal({
                title: "温馨提示",
                content: "您已拒绝获取位置信息，无法查看附近商机。请在设置中开启位置权限。",
                showCancel: false,
                confirmText: "我知道了"
              })
            });
          }
        }
      });
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
        },
        complete: () => {
          common_vendor.index.hideLoading();
          getBusinessOpportunitiesList(true);
        }
      });
    };
    const toggleAction = async (post, clickedAction) => {
      if (isActionInProgress.value || !isLogin.value)
        return;
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
        if (clickedAction === "like") {
          post.likes++;
          if (originalAction === "dislike")
            post.dislikes--;
        } else {
          post.dislikes++;
          if (originalAction === "like")
            post.likes--;
        }
        post.userAction = clickedAction;
      }
      try {
        let apiActionToSend;
        if (originalAction === clickedAction) {
          apiActionToSend = "cancel";
        } else {
          apiActionToSend = clickedAction;
        }
        const {
          error
        } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: post.id,
            targetType: "post",
            action: apiActionToSend
            // 【关键】使用新的变量
          }
        });
        if (error) {
          post.userAction = originalAction;
          post.likes = originalLikes;
          post.dislikes = originalDislikes;
          common_vendor.index.showToast({
            title: `操作失败: ${error}`,
            icon: "none"
          });
        }
      } catch (err) {
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
    const toggleGenericFollow = async (post, type, targetId, statusKey, successMsg, failureMsg) => {
      if (isActionInProgress.value || !isLogin.value)
        return;
      isActionInProgress.value = true;
      const originalStatus = post[statusKey];
      post[statusKey] = !originalStatus;
      const apiUrl = post[statusKey] ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      try {
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            targetId,
            targetType: type
          }
        });
        if (error) {
          post[statusKey] = originalStatus;
          common_vendor.index.showToast({
            title: failureMsg,
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: post[statusKey] ? successMsg.add : successMsg.remove,
            icon: "none"
          });
        }
      } catch (err) {
        post[statusKey] = originalStatus;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const toggleSave = (post) => {
      toggleGenericFollow(
        post,
        "post",
        post.id,
        "isSaved",
        {
          add: "已收藏",
          remove: "已取消收藏"
        },
        "收藏失败"
      );
    };
    const toggleFollow = (post) => {
      toggleGenericFollow(
        post,
        "post_user",
        post.user.id,
        "isFollowedUser",
        {
          add: "已关注",
          remove: "已取消关注"
        },
        "关注失败"
      );
    };
    const deletePost = (postToDelete) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "您确定要删除这条商机吗？删除后将无法恢复。",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            const {
              error
            } = await utils_request.request("/app-api/member/business-opportunities/delete", {
              method: "POST",
              data: {
                id: postToDelete.id
              }
            });
            common_vendor.index.hideLoading();
            if (error) {
              common_vendor.index.showToast({
                title: `删除失败: ${error}`,
                icon: "none"
              });
              return;
            }
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            const index = postList.value.findIndex((p) => p.id === postToDelete.id);
            if (index !== -1) {
              postList.value.splice(index, 1);
            }
          }
        }
      });
    };
    const handlePostClick = (post) => {
      if (!isLogin.value) {
        goToLogin();
      } else if (!hasPaidMembership.value) {
        goToMembership();
      } else {
        skipCommercialDetail(post.id);
      }
    };
    const navigateToComments = (post) => {
      if (!isLogin.value) {
        goToLogin();
      } else if (!hasPaidMembership.value) {
        goToMembership();
      } else {
        common_vendor.index.navigateTo({
          url: `/packages/home-commercialDetail/home-commercialDetail?id=${post.id}&scrollTo=comments`
        });
      }
    };
    const navigateToBusinessCard = (user) => {
      if (!user || !user.id) {
        common_vendor.index.showToast({
          title: "无法查看该用户主页",
          icon: "none"
        });
        return;
      }
      const avatarUrl = user.avatar || defaultAvatarUrl;
      const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const postNew = () => common_vendor.index.navigateTo({
      url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
    });
    const goToLogin = () => common_vendor.index.navigateTo({
      url: "/pages/index/index"
    });
    const goToMembership = () => common_vendor.index.showToast({
      title: "正在前往会员中心...",
      icon: "none"
    });
    const skipCommercialDetail = (postId) => common_vendor.index.navigateTo({
      url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
    });
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    const copyMenu = common_vendor.reactive({
      show: false,
      text: ""
      // 准备要复制的文本
    });
    const handleLongPress = (textToCopy) => {
      if (!textToCopy)
        return;
      copyMenu.text = textToCopy;
      copyMenu.show = true;
    };
    const executeCopy = () => {
      if (!copyMenu.text)
        return;
      common_vendor.index.setClipboardData({
        data: copyMenu.text,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制",
            icon: "none"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/home.vue:751", "setClipboardData failed:", err);
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        },
        complete: () => {
          copyMenu.show = false;
          copyMenu.text = "";
        }
      });
    };
    const hideCopyMenu = () => {
      copyMenu.show = false;
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
            b: common_vendor.o(($event) => navigateToBusinessCard(post.user), post.id),
            c: common_vendor.t(post.user.name),
            d: common_vendor.t(post.time),
            e: isLogin.value && loggedInUserId.value !== post.user.id
          }, isLogin.value && loggedInUserId.value !== post.user.id ? {
            f: common_vendor.t(post.isFollowedUser ? "已关注" : "关注"),
            g: post.isFollowedUser ? 1 : "",
            h: common_vendor.o(($event) => toggleFollow(post), post.id)
          } : {}, {
            i: common_vendor.t(post.title),
            j: common_vendor.o(($event) => handleLongPress(post.title), post.id),
            k: post.displayContent
          }, post.displayContent ? common_vendor.e({
            l: common_vendor.t(post.displayContent),
            m: post.isTruncated
          }, post.isTruncated ? {
            n: common_vendor.o(($event) => handlePostClick(post), post.id)
          } : {}, {
            o: common_vendor.o(($event) => handleLongPress(post.fullContent), post.id)
          }) : {}, {
            p: post.video
          }, post.video ? {
            q: "video-" + post.id,
            r: post.video,
            s: common_vendor.o(() => {
            }, post.id)
          } : post.images && post.images.length > 0 ? {
            v: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: imgIndex
              };
            })
          } : {}, {
            t: post.images && post.images.length > 0,
            w: post.tags && post.tags.length
          }, post.tags && post.tags.length ? {
            x: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, isLogin.value ? common_vendor.e({
            y: "07e72d3c-2-" + i0,
            z: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            A: common_vendor.t(post.likes),
            B: post.userAction === "like" ? 1 : "",
            C: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            D: "07e72d3c-3-" + i0,
            E: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            F: common_vendor.t(post.dislikes),
            G: post.userAction === "dislike" ? 1 : "",
            H: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            I: "07e72d3c-4-" + i0,
            J: common_vendor.p({
              type: "chatbubble",
              size: "20",
              color: "#666"
            }),
            K: common_vendor.t(post.commonCount),
            L: common_vendor.o(($event) => navigateToComments(post), post.id),
            M: "07e72d3c-5-" + i0,
            N: common_vendor.p({
              type: post.isSaved ? "star-filled" : "star",
              size: "20",
              color: post.isSaved ? "#FF6A00" : "#666"
            }),
            O: common_vendor.t(post.isSaved ? "已收藏" : "收藏"),
            P: post.isSaved ? 1 : "",
            Q: common_vendor.o(($event) => toggleSave(post), post.id),
            R: isLogin.value && loggedInUserId.value === post.user.id
          }, isLogin.value && loggedInUserId.value === post.user.id ? {
            S: "07e72d3c-6-" + i0,
            T: common_vendor.p({
              type: "trash",
              size: "20",
              color: "#e74c3c"
            }),
            U: common_vendor.o(($event) => deletePost(post), post.id)
          } : {}) : {}, {
            V: post.id,
            W: common_vendor.o(($event) => handlePostClick(post), post.id)
          });
        }),
        q: isLogin.value,
        r: !isLogin.value && postList.value.length === 0
      }, !isLogin.value && postList.value.length === 0 ? {
        s: common_vendor.o(goToLogin)
      } : isLogin.value && postList.value.length === 0 && loadingStatus.value === "noMore" ? {} : loadingStatus.value === "loading" ? {
        w: common_vendor.p({
          status: "loading",
          ["contentText.loading"]: "正在加载..."
        })
      } : loadingStatus.value === "noMore" ? {
        y: common_vendor.p({
          status: "noMore",
          ["contentText.noMore"]: "暂无更多内容"
        })
      } : {}, {
        t: isLogin.value && postList.value.length === 0 && loadingStatus.value === "noMore",
        v: loadingStatus.value === "loading",
        x: loadingStatus.value === "noMore",
        z: copyMenu.show
      }, copyMenu.show ? {
        A: common_vendor.o(executeCopy),
        B: common_vendor.o(() => {
        }),
        C: common_vendor.o(hideCopyMenu)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
