"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_load_more2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_load_more + CircleApplyPopup)();
}
const CircleApplyPopup = () => "../../components/CircleApplyPopup.js";
const _sfc_main = {
  __name: "my-friendInvitation",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "1b49c0b8": themeColor.value
    }));
    const themeColor = common_vendor.ref("#FF6E00");
    const currentTab = common_vendor.ref(0);
    const tabItems = ["我的商友", "我的圈友"];
    const loading = common_vendor.ref(false);
    const friendList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const isFollowActionInProgress = common_vendor.ref(false);
    const searchKey = common_vendor.ref("");
    let searchDebounceTimer = null;
    const userInfo = common_vendor.ref(null);
    const platformInfo = common_vendor.ref({});
    const circleFriendList = common_vendor.ref([]);
    const circlePageNo = common_vendor.ref(1);
    const circleLoadStatus = common_vendor.ref("more");
    const circleSearchKey = common_vendor.ref("");
    const circleAddInitiator = common_vendor.ref(0);
    const newApplyList = common_vendor.ref([]);
    const newApplyCount = common_vendor.ref(0);
    const applyPopupRef = common_vendor.ref(null);
    const openApplyPopup = () => {
      applyPopupRef.value.open(newApplyList.value);
    };
    const handleAuditSuccess = () => {
      getNewApplyList();
      getCircleFriendList(true);
    };
    common_vendor.computed(() => {
      if (!platformInfo.value.name)
        return false;
      if (!userInfo.value)
        return false;
      return userInfo.value.parentName !== "猩聚社";
    });
    const fetchPlatformConfig = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/system/platformConfig/getPlatformConfig");
      if (!error && data) {
        platformInfo.value = data;
      }
    };
    const goToPlatformIntro = () => {
      common_vendor.index.navigateTo({
        url: "/pages/platform-intro/platform-intro"
      });
    };
    const inviteTools = common_vendor.ref([
      {
        name: "注册邀请",
        desc: "注册分享邀请",
        icon: "/static/icon/精准投放.png",
        // 这里复用了"精准投放"的图标，或者你可以换成 /static/icon/invite-register.png
        path: "/pages/index/index"
        // 跳转到注册/登录页
      },
      {
        name: "名片邀请",
        desc: "名片分享邀请",
        icon: "/static/icon/我的名片.png",
        path: "/packages/my-businessCard/my-businessCard"
        // 跳转到名片页
      },
      {
        name: "发贴邀请",
        desc: "商机分享邀友",
        icon: "/static/icon/商机.png",
        path: "/packages/home-opportunitiesPublish/home-opportunitiesPublish"
        // 商机发布页路径
      },
      {
        name: "聚会邀请",
        desc: "聚会分享邀友",
        icon: "/static/icon/聚会.png",
        path: "/packages/active-publish/active-publish"
        //聚会发布页路径
      }
    ]);
    common_vendor.onMounted(() => {
      initializePage();
      getShareUserList(true);
      fetchUserInfo();
    });
    common_vendor.onPullDownRefresh(async () => {
      common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:365", "触发下拉刷新...");
      try {
        if (currentTab.value === 0) {
          await Promise.all([getShareUserList(true), fetchUserInfo()]);
        }
        if (currentTab.value === 1) {
          await Promise.all([
            getCircleFriendList(true),
            getNewApplyList()
            // 刷新圈友时同步刷新申请
          ]);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:379", "下拉刷新时发生错误:", error);
      } finally {
        common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:382", "刷新操作完成，停止动画。");
        common_vendor.index.stopPullDownRefresh();
      }
    });
    common_vendor.onReachBottom(() => {
      if (currentTab.value === 0) {
        if (loadStatus.value === "more" && !loading.value) {
          getShareUserList();
        }
      } else {
        if (circleLoadStatus.value === "more")
          getCircleFriendList();
      }
    });
    const initializePage = async () => {
      await Promise.all([
        getShareUserList(true),
        fetchUserInfo(),
        fetchPlatformConfig(),
        getCircleFriendList(true),
        getNewApplyList()
      ]);
      common_vendor.index.stopPullDownRefresh();
    };
    const handleTabClick = (e) => {
      if (currentTab.value === e.currentIndex)
        return;
      currentTab.value = e.currentIndex;
      common_vendor.index.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
      if (currentTab.value === 0) {
        getShareUserList(true);
        fetchUserInfo();
      } else if (currentTab.value === 1) {
        getCircleFriendList(true);
        getNewApplyList();
      }
    };
    const switchCircleFilter = (type) => {
      if (circleAddInitiator.value === type)
        return;
      circleAddInitiator.value = type;
      getCircleFriendList(true);
    };
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get");
      if (!error) {
        userInfo.value = data;
      }
    };
    const viewParentCard = () => {
      if (!userInfo.value || !userInfo.value.parentId) {
        common_vendor.index.showToast({
          title: "无法获取上级信息",
          icon: "none"
        });
        return;
      }
      if (userInfo.value.parentName === "猩聚社") {
        goToPlatformIntro();
        return;
      }
      const targetId = userInfo.value.parentId;
      const name = userInfo.value.parentName || "邀请人";
      const avatar = userInfo.value.parentAvatar || "";
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${targetId}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&fromShare=1`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const getShareUserList = async (isRefresh = false) => {
      if (loadStatus.value === "loading" || !isRefresh && loadStatus.value === "noMore") {
        return;
      }
      if (isRefresh) {
        pageNo.value = 1;
      }
      loadStatus.value = "loading";
      try {
        const params = {
          pageNo: pageNo.value,
          pageSize: pageSize.value
        };
        if (searchKey.value.trim()) {
          params.searchKey = searchKey.value.trim();
        }
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/share-user-list", {
          data: params
        });
        if (error) {
          throw new Error(error);
        }
        if (data && data.list) {
          const list = data.list || [];
          friendList.value = isRefresh ? list : [...friendList.value, ...list];
          if (friendList.value.length >= data.total) {
            loadStatus.value = "noMore";
          } else {
            loadStatus.value = "more";
          }
          pageNo.value++;
        } else {
          loadStatus.value = "noMore";
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:571", "获取邀请列表失败:", err);
        loadStatus.value = "more";
      }
    };
    const getCircleFriendList = async (isRefresh = false) => {
      if (circleLoadStatus.value === "loading")
        return;
      if (!isRefresh && circleLoadStatus.value === "noMore")
        return;
      if (isRefresh) {
        circlePageNo.value = 1;
        circleLoadStatus.value = "more";
      }
      circleLoadStatus.value = "loading";
      try {
        const params = {
          pageNo: circlePageNo.value,
          pageSize: pageSize.value,
          status: 1,
          // 1: 好友位 (全部圈友)
          addInitiator: circleAddInitiator.value
        };
        if (circleSearchKey.value.trim()) {
          params.searchKey = circleSearchKey.value.trim();
        }
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/friend/list", {
          method: "GET",
          data: params
        });
        if (error)
          throw new Error(error);
        if (data && data.list) {
          const list = data.list;
          circleFriendList.value = isRefresh ? list : [...circleFriendList.value, ...list];
          if (circleFriendList.value.length >= data.total) {
            circleLoadStatus.value = "noMore";
          } else {
            circleLoadStatus.value = "more";
            circlePageNo.value++;
          }
        } else {
          circleLoadStatus.value = "noMore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:624", "获取圈友列表失败:", e);
        circleLoadStatus.value = "more";
      } finally {
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const getNewApplyList = async () => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/friend/list", {
          method: "GET",
          data: {
            pageNo: 1,
            pageSize: 10,
            // 只取前10条展示红点即可，详情在浮层里看
            status: 0
            // 0: 申请中
          }
        });
        if (!error && data) {
          newApplyList.value = data.list;
          newApplyCount.value = data.total;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:651", "获取新申请失败", e);
      }
    };
    common_vendor.watch(searchKey, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          getShareUserList(true);
        }, 500);
      }
    });
    const handleToolClick = (item) => {
      if (item.path) {
        common_vendor.index.navigateTo({
          url: item.path,
          fail: (err) => {
            common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:671", "跳转失败", err);
            common_vendor.index.showToast({
              title: "页面路径未配置",
              icon: "none"
            });
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "功能开发中",
          icon: "none"
        });
      }
    };
    const handleCircleSearch = () => {
      getCircleFriendList(true);
    };
    const confirmDeleteFriend = (friend) => {
      common_vendor.index.showModal({
        title: "解除互圈关系",
        content: `⚠️ 确定要与 ${friend.realName || friend.nickname} 解除互圈吗？

📌 解除后：

• 双方不再显示为圈友

• 将移出彼此的圈友列表`,
        confirmText: "确认解除",
        confirmColor: "#dd524d",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            await deleteFriend(friend);
          }
        }
      });
    };
    const deleteFriend = async (friend) => {
      common_vendor.index.showLoading({
        title: "删除中..."
      });
      try {
        const url = `/app-api/member/user/friend/del`;
        const payload = {
          id: friend.fid
        };
        const {
          error
        } = await utils_request.request(url, {
          method: "POST",
          data: payload
        });
        if (!error) {
          common_vendor.index.showToast({
            title: "解除成功",
            icon: "success"
          });
          circleFriendList.value = circleFriendList.value.filter((item) => item.id !== friend.id);
        } else {
          common_vendor.index.showToast({
            title: error || "删除失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleSearch = () => {
      clearTimeout(searchDebounceTimer);
      getShareUserList(true);
    };
    const handleFollowAction = async (user) => {
      if (isFollowActionInProgress.value)
        return;
      const currentUserId = common_vendor.index.getStorageSync("userId");
      if (!currentUserId) {
        common_vendor.index.showModal({
          title: "需要登录",
          content: "关注功能需要登录后才能使用，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      isFollowActionInProgress.value = true;
      const originalFollowStatus = user.followFlag;
      const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
      const apiUrl = newFollowStatus === 1 ? "/app-api/member/follow/add" : "/app-api/member/follow/del";
      const successMsg = newFollowStatus === 1 ? "关注成功" : "已取消关注";
      user.followFlag = newFollowStatus;
      try {
        const {
          error
        } = await utils_request.request(apiUrl, {
          method: "POST",
          data: {
            userId: currentUserId,
            targetId: user.id,
            targetType: "post_user"
          }
        });
        if (error)
          throw new Error(error);
        common_vendor.index.showToast({
          title: successMsg,
          icon: "success"
        });
      } catch (err) {
        user.followFlag = originalFollowStatus;
        common_vendor.index.showToast({
          title: err.message || "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isFollowActionInProgress.value = false;
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
      const defaultAvatar = "/static/images/default-avatar.png";
      const name = user.nickname || user.realName || "匿名用户";
      const avatarUrl = user.avatar || defaultAvatar;
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}&fromShare=1`;
      common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:880", "从推荐商友页跳转到名片申请页, URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleTabClick),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabItems,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: common_vendor.f(inviteTools.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: index,
            e: common_vendor.o(($event) => handleToolClick(item), index)
          };
        }),
        d: platformInfo.value.name
      }, platformInfo.value.name ? {
        e: platformInfo.value.img,
        f: common_vendor.t(platformInfo.value.name),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        h: common_vendor.o(goToPlatformIntro)
      } : {}, {
        i: userInfo.value && userInfo.value.parentName
      }, userInfo.value && userInfo.value.parentName ? {} : {}, {
        j: userInfo.value && userInfo.value.parentName
      }, userInfo.value && userInfo.value.parentName ? common_vendor.e({
        k: userInfo.value.parentAvatar
      }, userInfo.value.parentAvatar ? {
        l: userInfo.value.parentAvatar
      } : {
        m: common_vendor.t(userInfo.value.parentName.charAt(0))
      }, {
        n: common_vendor.t(userInfo.value.parentName),
        o: userInfo.value.parentName === "猩聚社"
      }, userInfo.value.parentName === "猩聚社" ? {} : {}, {
        p: common_vendor.o(viewParentCard)
      }) : {}, {
        q: userInfo.value && !userInfo.value.parentName
      }, userInfo.value && !userInfo.value.parentName ? {} : {}, {
        r: common_vendor.o(handleSearch),
        s: common_vendor.o(handleSearch),
        t: common_vendor.o(($event) => searchKey.value = $event),
        v: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索商友姓名/昵称/公司,同学/同行/同乡/同圈",
          modelValue: searchKey.value
        }),
        w: common_vendor.f(friendList.value, (friend, k0, i0) => {
          return common_vendor.e({
            a: friend.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(friend.nickname || friend.realName || "匿名用户"),
            c: friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1
          }, friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 ? common_vendor.e({
            d: friend.fellowTownspeopleCityFlag === 1
          }, friend.fellowTownspeopleCityFlag === 1 ? {} : {}, {
            e: friend.peerFlag === 1
          }, friend.peerFlag === 1 ? {} : {}, {
            f: friend.classmateFlag === 1
          }, friend.classmateFlag === 1 ? {} : {}) : {}, {
            g: "a29497fd-3-" + i0,
            h: common_vendor.t(friend.companyName || "暂无公司信息"),
            i: common_vendor.t(friend.followFlag === 1 ? "取关" : "关注"),
            j: friend.followFlag === 1 ? 1 : "",
            k: common_vendor.o(($event) => handleFollowAction(friend), friend.id),
            l: friend.followTime
          }, friend.followTime ? {
            m: common_vendor.t(formatTimestamp(friend.followTime))
          } : {}, {
            n: friend.id,
            o: common_vendor.o(($event) => navigateToBusinessCard(friend), friend.id)
          });
        }),
        x: common_vendor.p({
          type: "briefcase-filled",
          size: "14",
          color: "#888"
        }),
        y: friendList.value.length > 0 || loadStatus.value === "loading"
      }, friendList.value.length > 0 || loadStatus.value === "loading" ? {
        z: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        A: friendList.value.length === 0 && loadStatus.value === "noMore"
      }, friendList.value.length === 0 && loadStatus.value === "noMore" ? {
        B: common_assets._imports_0$4
      } : {}, {
        C: currentTab.value === 0,
        D: common_vendor.o(handleCircleSearch),
        E: common_vendor.o(handleCircleSearch),
        F: common_vendor.o(($event) => circleSearchKey.value = $event),
        G: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索圈友姓名",
          modelValue: circleSearchKey.value
        }),
        H: circleAddInitiator.value === 0 ? 1 : "",
        I: common_vendor.o(($event) => switchCircleFilter(0)),
        J: circleAddInitiator.value === 1 ? 1 : "",
        K: common_vendor.o(($event) => switchCircleFilter(1)),
        L: common_vendor.p({
          type: "personadd-filled",
          size: "24",
          color: "#fff"
        }),
        M: newApplyCount.value > 0
      }, newApplyCount.value > 0 ? {
        N: common_vendor.t(newApplyCount.value)
      } : {}, {
        O: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        P: common_vendor.o(openApplyPopup),
        Q: common_vendor.f(circleFriendList.value, (friend, k0, i0) => {
          return common_vendor.e({
            a: friend.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(friend.realName || friend.nickname || "匿名用户"),
            c: friend.fellowTownspeopleFlag === 1
          }, friend.fellowTownspeopleFlag === 1 ? {} : {}, {
            d: friend.peerFlag === 1
          }, friend.peerFlag === 1 ? {} : {}, {
            e: friend.classmateFlag === 1
          }, friend.classmateFlag === 1 ? {} : {}, {
            f: "a29497fd-8-" + i0,
            g: common_vendor.t(friend.companyName || "暂无公司信息"),
            h: friend.positionTitle
          }, friend.positionTitle ? {
            i: common_vendor.t(friend.positionTitle)
          } : {}, {
            j: "a29497fd-9-" + i0,
            k: common_vendor.o(($event) => confirmDeleteFriend(friend), friend.id),
            l: friend.id,
            m: common_vendor.o(($event) => navigateToBusinessCard(friend), friend.id)
          });
        }),
        R: common_vendor.p({
          type: "briefcase-filled",
          size: "14",
          color: "#888"
        }),
        S: common_vendor.p({
          type: "checkbox-filled",
          size: "20",
          color: "#4cd964"
        }),
        T: circleFriendList.value.length > 0 || circleLoadStatus.value === "loading"
      }, circleFriendList.value.length > 0 || circleLoadStatus.value === "loading" ? {
        U: common_vendor.p({
          status: circleLoadStatus.value
        })
      } : {}, {
        V: circleFriendList.value.length === 0 && circleLoadStatus.value === "noMore"
      }, circleFriendList.value.length === 0 && circleLoadStatus.value === "noMore" ? {
        W: common_assets._imports_1
      } : {}, {
        X: currentTab.value === 1,
        Y: common_vendor.sr(applyPopupRef, "a29497fd-11", {
          "k": "applyPopupRef"
        }),
        Z: common_vendor.o(handleAuditSuccess),
        aa: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a29497fd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-friendInvitation/my-friendInvitation.js.map
