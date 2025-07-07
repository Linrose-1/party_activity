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
const pageSize = 15;
const _sfc_main = {
  __name: "my-follow",
  setup(__props) {
    const followedUsers = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    const refreshing = common_vendor.ref(false);
    const userId = common_vendor.ref(null);
    common_vendor.onLoad(() => {
      userId.value = common_vendor.index.getStorageSync("userId");
      if (!userId.value) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      getFollowedUsers(true);
    });
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
        targetType: "user"
        // 【关键】指定目标类型为用户
      };
      try {
        const { data, error } = await utils_request.request("/app-api/member/follow/page", {
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/my-follow/my-follow.vue:117", "关注的商友", data);
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
          common_vendor.index.showToast({ title: error || "加载失败", icon: "none" });
        }
      } catch (err) {
        loadingStatus.value = "noMore";
        common_vendor.index.showToast({ title: "网络请求异常", icon: "none" });
      } finally {
        if (isRefresh) {
          refreshing.value = false;
        }
      }
    };
    const cancelFollow = async (followId) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消关注该商友吗？",
        success: async (res) => {
          if (res.confirm) {
            const { error } = await utils_request.request("/app-api/member/follow/del", {
              method: "POST",
              data: {
                targetId: followId,
                userId: userId.value,
                targetType: "post_user"
                // 同样需要传入 targetType
              }
            });
            if (!error) {
              common_vendor.index.showToast({ title: "已取消关注", icon: "success" });
              const index = followedUsers.value.findIndex((item) => item.id === followId);
              if (index !== -1) {
                followedUsers.value.splice(index, 1);
              }
            } else {
              common_vendor.index.showToast({ title: error || "操作失败", icon: "none" });
            }
          }
        }
      });
    };
    const onRefresh = () => {
      refreshing.value = true;
      getFollowedUsers(true);
    };
    const loadMore = () => {
      getFollowedUsers(false);
    };
    const viewUserDetail = (targetUserId) => {
      common_vendor.index.navigateTo({
        url: `/pages/user-profile/index?id=${targetUserId}`
      });
    };
    const goToDiscover = () => {
      common_vendor.index.switchTab({
        url: "/pages/location/location"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: followedUsers.value.length > 0
      }, followedUsers.value.length > 0 ? {
        b: common_vendor.f(followedUsers.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.userRespVO.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(item.userRespVO.nickname),
            c: item.userRespVO.companyName
          }, item.userRespVO.companyName ? {
            d: "653bbb27-0-" + i0,
            e: common_vendor.p({
              type: "flag",
              size: "14",
              color: "#888"
            }),
            f: common_vendor.t(item.userRespVO.companyName)
          } : {}, {
            g: common_vendor.o(($event) => cancelFollow(item.id), item.id),
            h: item.id,
            i: common_vendor.o(($event) => viewUserDetail(item.userRespVO.id), item.id)
          });
        })
      } : {}, {
        c: followedUsers.value.length > 0 || loadingStatus.value === "loading"
      }, followedUsers.value.length > 0 || loadingStatus.value === "loading" ? {
        d: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        e: loadingStatus.value === "noMore" && followedUsers.value.length === 0
      }, loadingStatus.value === "noMore" && followedUsers.value.length === 0 ? {
        f: common_vendor.p({
          type: "person-filled",
          size: "60",
          color: "#e0e0e0"
        }),
        g: common_vendor.o(goToDiscover)
      } : {}, {
        h: refreshing.value,
        i: common_vendor.o(onRefresh),
        j: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-653bbb27"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-follow/my-follow.js.map
