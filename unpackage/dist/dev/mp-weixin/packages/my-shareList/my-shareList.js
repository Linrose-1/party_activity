"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_load_more + AvatarLongPressMenu)();
}
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const _sfc_main = {
  __name: "my-shareList",
  setup(__props) {
    const friendList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const totalCount = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const searchKey = common_vendor.ref("");
    const isFollowProcessing = common_vendor.ref(false);
    let searchDebounceTimer = null;
    const avatarMenuRef = common_vendor.ref(null);
    const fetchList = async (isRefresh = false) => {
      if (loadStatus.value === "loading" || !isRefresh && loadStatus.value === "noMore")
        return;
      if (isRefresh) {
        pageNo.value = 1;
      }
      loadStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize: 10
      };
      const trimmedKey = searchKey.value ? searchKey.value.trim() : "";
      if (trimmedKey !== "") {
        params.searchKey = trimmedKey;
      }
      try {
        common_vendor.index.__f__("log", "at packages/my-shareList/my-shareList.vue:126", "--- 发起请求，参数为：", params);
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/share-user-list", {
          method: "GET",
          data: params
        });
        if (!error && data) {
          const list = data.list || [];
          friendList.value = isRefresh ? list : [...friendList.value, ...list];
          totalCount.value = data.total || 0;
          if (friendList.value.length >= totalCount.value) {
            loadStatus.value = "noMore";
          } else {
            loadStatus.value = "more";
            pageNo.value++;
          }
        } else {
          loadStatus.value = "noMore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-shareList/my-shareList.vue:152", "请求异常:", e);
        loadStatus.value = "more";
      } finally {
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleFollowAction = async (user) => {
      if (isFollowProcessing.value)
        return;
      const isAdding = user.followFlag !== 1;
      isFollowProcessing.value = true;
      const originalStatus = user.followFlag;
      user.followFlag = isAdding ? 1 : 0;
      try {
        const {
          error
        } = await utils_request.request(isAdding ? "/app-api/member/follow/add" : "/app-api/member/follow/del", {
          method: "POST",
          data: {
            targetId: user.id,
            targetType: "post_user"
          }
        });
        if (error) {
          user.followFlag = originalStatus;
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: isAdding ? "关注成功" : "已取消关注",
            icon: "none"
          });
        }
      } catch (e) {
        user.followFlag = originalStatus;
      } finally {
        isFollowProcessing.value = false;
      }
    };
    const handleAvatarClick = async (friend) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const userParams = {
        id: friend.id,
        name: friend.nickname || friend.realName || "商友",
        avatar: friend.avatar || "",
        // 如果是从企业列表点开，可传 true，商友列表通常为个人
        isEnterpriseSource: false
      };
      avatarMenuRef.value.open(userParams);
    };
    const handleSearch = () => fetchList(true);
    const navigateToBusinessCard = (user) => common_vendor.index.navigateTo({
      url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname || user.realName)}&avatar=${encodeURIComponent(user.avatar || "")}&fromShare=1`
    });
    const formatTimestamp = (ts) => {
      if (!ts)
        return "";
      const d = new Date(Number(ts));
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    };
    common_vendor.watch(searchKey, () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => fetchList(true), 500);
    });
    common_vendor.onMounted(() => fetchList(true));
    common_vendor.onPullDownRefresh(() => fetchList(true));
    common_vendor.onReachBottom(() => fetchList());
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: common_vendor.o(handleSearch),
        c: common_vendor.o(($event) => searchKey.value = $event),
        d: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索姓名/公司/学校...",
          modelValue: searchKey.value
        }),
        e: common_vendor.t(totalCount.value),
        f: common_vendor.f(friendList.value, (friend, k0, i0) => {
          return common_vendor.e({
            a: friend.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => handleAvatarClick(friend), friend.id),
            c: common_vendor.t(friend.nickname || friend.realName || "匿名商友"),
            d: friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1
          }, friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1 ? common_vendor.e({
            e: friend.friendParentFlag === 1
          }, friend.friendParentFlag === 1 ? {} : {}, {
            f: friend.fellowTownspeopleCityFlag === 1
          }, friend.fellowTownspeopleCityFlag === 1 ? {} : {}, {
            g: friend.peerFlag === 1
          }, friend.peerFlag === 1 ? {} : {}, {
            h: friend.classmateFlag === 1
          }, friend.classmateFlag === 1 ? {} : {}) : {}, {
            i: "d52d6798-1-" + i0,
            j: common_vendor.t(friend.companyName || "暂未设置公司信息"),
            k: friend.followTime
          }, friend.followTime ? {
            l: common_vendor.t(formatTimestamp(friend.followTime))
          } : {}, {
            m: common_vendor.t(friend.followFlag === 1 ? "已关注" : "+ 关注"),
            n: friend.followFlag === 1 ? 1 : "",
            o: common_vendor.o(($event) => handleFollowAction(friend), friend.id),
            p: friend.id,
            q: common_vendor.o(($event) => navigateToBusinessCard(friend), friend.id)
          });
        }),
        g: common_vendor.p({
          type: "briefcase",
          size: "14",
          color: "#888"
        }),
        h: friendList.value.length > 0 || loadStatus.value === "loading"
      }, friendList.value.length > 0 || loadStatus.value === "loading" ? {
        i: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        j: friendList.value.length === 0 && loadStatus.value === "noMore"
      }, friendList.value.length === 0 && loadStatus.value === "noMore" ? {
        k: common_assets._imports_0$11
      } : {}, {
        l: common_vendor.sr(avatarMenuRef, "d52d6798-3", {
          "k": "avatarMenuRef"
        }),
        m: common_vendor.o(_ctx.handleMenuAction)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d52d6798"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-shareList/my-shareList.js.map
