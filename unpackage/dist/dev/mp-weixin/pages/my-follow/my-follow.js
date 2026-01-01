"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _component_AvatarActionPopup = common_vendor.resolveComponent("AvatarActionPopup");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2 + _easycom_uni_load_more2 + _component_AvatarActionPopup)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + _easycom_uni_load_more + AddCircleConfirmPopup)();
}
const AddCircleConfirmPopup = () => "../../components/AddCircleConfirmPopup.js";
const pageSize = 15;
const _sfc_main = {
  __name: "my-follow",
  setup(__props) {
    const followedUsers = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    const refreshing = common_vendor.ref(false);
    const userId = common_vendor.ref(null);
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["我关注的", "关注我的"]);
    const avatarPopupRef = common_vendor.ref(null);
    const addCirclePopupRef = common_vendor.ref(null);
    common_vendor.onLoad(() => {
      userId.value = common_vendor.index.getStorageSync("userId");
      if (!userId.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      getFollowedUsers(true);
    });
    const switchTab = (e) => {
      if (currentTab.value === e.currentIndex)
        return;
      currentTab.value = e.currentIndex;
      getFollowedUsers(true);
    };
    const getFollowedUsers = async (isRefresh = false) => {
      if (loadingStatus.value === "loading" || loadingStatus.value === "noMore" && !isRefresh) {
        if (isRefresh)
          refreshing.value = false;
        return;
      }
      if (isRefresh) {
        pageNo.value = 1;
        followedUsers.value = [];
        loadingStatus.value = "more";
      }
      loadingStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize,
        userId: userId.value,
        targetType: "user",
        followType: currentTab.value
      };
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/follow/page", {
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/my-follow/my-follow.vue:145", "关注的商友", data);
        if (!error && data) {
          const validUsers = (data.list || []).filter((item) => item.userRespVO);
          validUsers.forEach((item) => {
            item.userRespVO.nickname = item.userRespVO.nickname || "匿名用户";
          });
          followedUsers.value.push(...validUsers);
          pageNo.value++;
          loadingStatus.value = (data.list || []).length < pageSize ? "noMore" : "more";
        } else {
          loadingStatus.value = "noMore";
          common_vendor.index.showToast({
            title: error || "加载失败",
            icon: "none"
          });
        }
      } catch (err) {
        loadingStatus.value = "noMore";
        common_vendor.index.showToast({
          title: "网络请求异常",
          icon: "none"
        });
      } finally {
        if (isRefresh) {
          refreshing.value = false;
        }
      }
    };
    const handleAvatarClick = (user) => {
      if (avatarPopupRef.value) {
        avatarPopupRef.value.open(user);
      }
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      switch (type) {
        case "viewCard":
          viewUserDetail(user);
          break;
        case "addCircle":
          if (addCirclePopupRef.value) {
            addCirclePopupRef.value.open(user);
          } else {
            handleApplyCircle(user);
          }
          break;
        case "comment":
          common_vendor.index.showToast({
            title: "点评功能开发中",
            icon: "none"
          });
          break;
      }
    };
    const handleApplyCircle = (targetUser) => {
      common_vendor.index.showModal({
        title: "申请入圈",
        content: `确定申请加入 ${targetUser.nickname} 的圈子吗？`,
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "申请中..."
            });
            const {
              error
            } = await utils_request.request(`/app-api/member/user/friend/apply/${targetUser.id}`, {
              method: "POST"
            });
            common_vendor.index.hideLoading();
            if (!error)
              common_vendor.index.showToast({
                title: "申请已发送",
                icon: "success"
              });
            else
              common_vendor.index.showToast({
                title: error || "失败",
                icon: "none"
              });
          }
        }
      });
    };
    const cancelFollow = async (followId) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消关注该商友吗？",
        success: async (res) => {
          if (res.confirm) {
            const {
              error
            } = await utils_request.request("/app-api/member/follow/del", {
              method: "POST",
              data: {
                targetId: followId,
                userId: userId.value,
                targetType: "post_user"
                // 同样需要传入 targetType
              }
            });
            if (!error) {
              common_vendor.index.showToast({
                title: "已取消关注",
                icon: "success"
              });
              const index = followedUsers.value.findIndex((item) => item.id === followId);
              if (index !== -1) {
                followedUsers.value.splice(index, 1);
              }
            } else {
              common_vendor.index.showToast({
                title: error || "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      return `${Y}-${M}-${D}`;
    };
    const onRefresh = () => {
      refreshing.value = true;
      getFollowedUsers(true);
    };
    const loadMore = () => {
      getFollowedUsers(false);
    };
    const viewUserDetail = (user) => {
      if (!user || !user.id) {
        common_vendor.index.showToast({
          title: "无法获取用户信息",
          icon: "none"
        });
        return;
      }
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar || "")}`;
      common_vendor.index.__f__("log", "at pages/my-follow/my-follow.vue:329", "跳转到名片页（标准流程），URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    };
    const goToDiscover = () => {
      common_vendor.index.switchTab({
        url: "/pages/location/location"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(switchTab),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabs.value,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: followedUsers.value.length > 0
      }, followedUsers.value.length > 0 ? {
        d: common_vendor.f(followedUsers.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.userRespVO.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => handleAvatarClick(item.userRespVO), item.id),
            c: common_vendor.t(item.userRespVO.nickname),
            d: item.userRespVO.companyName
          }, item.userRespVO.companyName ? {
            e: "653bbb27-1-" + i0,
            f: common_vendor.p({
              type: "flag",
              size: "14",
              color: "#888"
            }),
            g: common_vendor.t(item.userRespVO.companyName)
          } : {}, {
            h: common_vendor.t(formatTimestamp(item.createTime))
          }, currentTab.value === 0 ? {
            i: common_vendor.o(($event) => cancelFollow(item.id), item.id)
          } : {}, {
            j: item.id,
            k: common_vendor.o(($event) => viewUserDetail(item.userRespVO), item.id)
          });
        }),
        e: currentTab.value === 0
      } : {}, {
        f: followedUsers.value.length > 0 || loadingStatus.value === "loading"
      }, followedUsers.value.length > 0 || loadingStatus.value === "loading" ? {
        g: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        h: loadingStatus.value === "noMore" && followedUsers.value.length === 0
      }, loadingStatus.value === "noMore" && followedUsers.value.length === 0 ? {
        i: common_vendor.p({
          type: "person-filled",
          size: "60",
          color: "#e0e0e0"
        }),
        j: common_vendor.o(goToDiscover)
      } : {}, {
        k: refreshing.value,
        l: common_vendor.o(onRefresh),
        m: common_vendor.o(loadMore),
        n: common_vendor.sr(avatarPopupRef, "653bbb27-4", {
          "k": "avatarPopupRef"
        }),
        o: common_vendor.o(handleMenuAction),
        p: common_vendor.sr(addCirclePopupRef, "653bbb27-5", {
          "k": "addCirclePopupRef"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-653bbb27"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-follow/my-follow.js.map
