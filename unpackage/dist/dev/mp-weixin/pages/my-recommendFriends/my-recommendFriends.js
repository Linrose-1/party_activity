"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  __name: "my-recommendFriends",
  setup(__props) {
    const friendList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const isFollowActionInProgress = common_vendor.ref(false);
    const getShareUserList = async (isRefresh = false) => {
      if (loadStatus.value === "loading")
        return;
      if (!isRefresh && loadStatus.value === "noMore")
        return;
      if (isRefresh) {
        pageNo.value = 1;
        friendList.value = [];
        loadStatus.value = "more";
      }
      loadStatus.value = "loading";
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/share-user-list", {
        method: "GET",
        data: {
          pageNo: pageNo.value,
          pageSize: pageSize.value
        }
      });
      if (isRefresh) {
        common_vendor.index.stopPullDownRefresh();
      }
      if (error) {
        loadStatus.value = "more";
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      if (data && data.list) {
        const list = data.list || [];
        friendList.value = isRefresh ? list : [...friendList.value, ...list];
        total.value = data.total;
        if (friendList.value.length >= total.value) {
          loadStatus.value = "noMore";
        } else {
          loadStatus.value = "more";
          pageNo.value++;
        }
      } else {
        loadStatus.value = "noMore";
      }
    };
    const handleImageError = (item) => {
      item.avatar = "/static/images/default-avatar.png";
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
      common_vendor.index.__f__("log", "at pages/my-recommendFriends/my-recommendFriends.vue:212", "从推荐商友页跳转到名片申请页, URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    common_vendor.onLoad(() => {
      common_vendor.index.showLoading({
        title: "正在加载..."
      });
      getShareUserList(true).finally(() => {
        common_vendor.index.hideLoading();
      });
    });
    common_vendor.onPullDownRefresh(() => {
      getShareUserList(true);
    });
    common_vendor.onReachBottom(() => {
      getShareUserList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(friendList.value, (friend, k0, i0) => {
          return {
            a: friend.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => handleImageError(friend), friend.id),
            c: common_vendor.t(friend.nickname || friend.realName || "匿名用户"),
            d: "41a0c04c-0-" + i0,
            e: common_vendor.t(friend.companyName || "暂无公司信息"),
            f: "41a0c04c-1-" + i0,
            g: common_vendor.t(friend.professionalTitle || "暂无职位"),
            h: common_vendor.t(friend.followFlag === 1 ? "取关" : "关注"),
            i: friend.followFlag === 1 ? 1 : "",
            j: common_vendor.o(($event) => handleFollowAction(friend), friend.id),
            k: friend.id,
            l: common_vendor.o(($event) => navigateToBusinessCard(friend), friend.id)
          };
        }),
        b: common_vendor.p({
          type: "briefcase-filled",
          size: "14",
          color: "#888"
        }),
        c: common_vendor.p({
          type: "person-filled",
          size: "14",
          color: "#888"
        }),
        d: friendList.value.length > 0 || loadStatus.value === "loading"
      }, friendList.value.length > 0 || loadStatus.value === "loading" ? {
        e: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        f: friendList.value.length === 0 && loadStatus.value === "noMore"
      }, friendList.value.length === 0 && loadStatus.value === "noMore" ? {
        g: common_assets._imports_0$1
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41a0c04c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-recommendFriends/my-recommendFriends.js.map
