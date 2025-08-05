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
      const { data, error } = await utils_request.request("/app-api/member/user/share-user-list", {
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
        common_vendor.index.showToast({ title: error, icon: "none" });
        return;
      }
      if (data && data.list) {
        friendList.value.push(...data.list);
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
    common_vendor.onLoad(() => {
      common_vendor.index.showLoading({ title: "正在加载..." });
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
            h: friend.id
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
