"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_segmented_control2 + _easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "my-friendInvitation",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "1b49c0b8": themeColor.value
    }));
    const themeColor = common_vendor.ref("#FF6E00");
    const currentTab = common_vendor.ref(0);
    const tabItems = ["我的邀请人", "我邀请的人"];
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
        path: "/pages/my-businessCard/my-businessCard"
        // 跳转到名片页
      },
      {
        name: "发贴邀请",
        desc: "商机分享邀友",
        icon: "/static/icon/商机.png",
        path: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
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
      common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:176", "触发下拉刷新...");
      try {
        if (currentTab.value === 1) {
          await getShareUserList(true);
        } else {
          await fetchUserInfo();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:187", "下拉刷新时发生错误:", error);
      } finally {
        common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:190", "刷新操作完成，停止动画。");
        common_vendor.index.stopPullDownRefresh();
      }
    });
    common_vendor.onReachBottom(() => {
      if (currentTab.value === 1 && loadStatus.value === "more" && !loading.value) {
        common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:197", "触底加载更多...");
        getShareUserList();
      }
    });
    const initializePage = async () => {
      const fetchListPromise = getShareUserList(true);
      const fetchInfoPromise = fetchUserInfo();
      await Promise.all([fetchListPromise, fetchInfoPromise]);
      common_vendor.index.stopPullDownRefresh();
    };
    const handleTabClick = (e) => {
      currentTab.value = e.currentIndex;
      common_vendor.index.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
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
        common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:301", "获取邀请列表失败:", err);
        loadStatus.value = "more";
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
            common_vendor.index.__f__("error", "at packages/my-friendInvitation/my-friendInvitation.vue:323", "跳转失败", err);
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
      const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}&fromShare=1`;
      common_vendor.index.__f__("log", "at packages/my-friendInvitation/my-friendInvitation.vue:466", "从推荐商友页跳转到名片申请页, URL:", url);
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
        c: common_vendor.o(handleSearch),
        d: common_vendor.o(handleSearch),
        e: common_vendor.o(($event) => searchKey.value = $event),
        f: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索昵称或姓名",
          modelValue: searchKey.value
        }),
        g: common_vendor.f(friendList.value, (friend, k0, i0) => {
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
            g: "a29497fd-2-" + i0,
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
        h: common_vendor.p({
          type: "briefcase-filled",
          size: "14",
          color: "#888"
        }),
        i: friendList.value.length > 0 || loadStatus.value === "loading"
      }, friendList.value.length > 0 || loadStatus.value === "loading" ? {
        j: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        k: friendList.value.length === 0 && loadStatus.value === "noMore"
      }, friendList.value.length === 0 && loadStatus.value === "noMore" ? {
        l: common_assets._imports_0$3
      } : {}, {
        m: currentTab.value === 1,
        n: userInfo.value && userInfo.value.parentName
      }, userInfo.value && userInfo.value.parentName ? common_vendor.e({
        o: userInfo.value.parentAvatar
      }, userInfo.value.parentAvatar ? {
        p: userInfo.value.parentAvatar
      } : {
        q: common_vendor.t(userInfo.value.parentName.charAt(0))
      }, {
        r: common_vendor.t(userInfo.value.parentName)
      }) : {
        s: common_assets._imports_1
      }, {
        t: common_vendor.f(inviteTools.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: index,
            e: common_vendor.o(($event) => handleToolClick(item), index)
          };
        }),
        v: currentTab.value === 0,
        w: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a29497fd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-friendInvitation/my-friendInvitation.js.map
