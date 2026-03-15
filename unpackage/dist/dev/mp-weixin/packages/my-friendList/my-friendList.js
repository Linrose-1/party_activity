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
  (_easycom_uni_icons + _easycom_uni_load_more + AvatarLongPressMenu)();
}
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const themeColor = "#FF6A00";
const defaultAvatar = "https://img.gofor.club/mmexport1759211962539.jpg";
const pageSize = 15;
const _sfc_main = {
  __name: "my-friendList",
  setup(__props) {
    const ownerInfo = common_vendor.reactive({
      id: null,
      name: "",
      avatar: "",
      topUpLevelName: ""
    });
    const friendList = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const pageNo = common_vendor.ref(1);
    const searchKey = common_vendor.ref("");
    const loadingStatus = common_vendor.ref("more");
    const menuRef = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at packages/my-friendList/my-friendList.vue:120", "options", options);
      if (options.userId) {
        ownerInfo.id = options.userId;
        ownerInfo.name = decodeURIComponent(options.userName || "");
        ownerInfo.avatar = decodeURIComponent(options.avatar || "");
        common_vendor.index.setNavigationBarTitle({
          title: `${ownerInfo.name}的圈友`
        });
        fetchFriendList(true);
      }
    });
    common_vendor.onPullDownRefresh(() => fetchFriendList(true));
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "noMore" || loadingStatus.value === "loading")
        return;
      pageNo.value++;
      fetchFriendList(false);
    });
    const fetchFriendList = async (isRefresh = false) => {
      if (isRefresh) {
        pageNo.value = 1;
        loadingStatus.value = "loading";
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/friend/my-friend-list", {
        method: "GET",
        data: {
          userId: ownerInfo.id,
          searchKey: searchKey.value,
          pageNo: pageNo.value,
          pageSize,
          status: 1
          // 只查正式好友位
        }
      });
      if (isRefresh)
        common_vendor.index.stopPullDownRefresh();
      if (error) {
        loadingStatus.value = "more";
        return;
      }
      const list = data.list || [];
      friendList.value = isRefresh ? list : [...friendList.value, ...list];
      total.value = data.total || 0;
      loadingStatus.value = friendList.value.length >= data.total ? "noMore" : "more";
    };
    const handleSearch = () => fetchFriendList(true);
    const handleUserClick = (user) => {
      const menuUser = {
        id: user.id,
        name: user.realName || user.nickname,
        avatar: user.avatar,
        managerId: user.id
        // 用于判断是否本人
      };
      menuRef.value.open(menuUser);
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      if (type === "viewCard") {
        common_vendor.index.navigateTo({
          url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}&friendOwnerUserId=${ownerInfo.id}`
        });
      } else if (type === "viewPath") {
        common_vendor.index.navigateTo({
          url: `/packages/relationship-path/relationship-path?targetUserId=${user.id}&name=${encodeURIComponent(user.name)}`
        });
      }
    };
    const getFirstItem = (str, fallback) => {
      if (!str)
        return fallback;
      return str.split(",")[0].trim();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: ownerInfo.avatar || defaultAvatar,
        b: common_vendor.t(ownerInfo.name || "商友"),
        c: common_vendor.t(total.value),
        d: common_vendor.t(ownerInfo.topUpLevelName || "精英商友"),
        e: themeColor,
        f: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        g: common_vendor.o(handleSearch),
        h: searchKey.value,
        i: common_vendor.o(($event) => searchKey.value = $event.detail.value),
        j: common_vendor.o(handleSearch),
        k: friendList.value.length > 0
      }, friendList.value.length > 0 ? {
        l: common_vendor.f(friendList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.avatar || defaultAvatar,
            b: common_vendor.o(($event) => handleUserClick(item), item.id),
            c: common_vendor.t(item.realName || item.nickname),
            d: item.fellowTownspeopleFlag === 1
          }, item.fellowTownspeopleFlag === 1 ? {} : {}, {
            e: item.peerFlag === 1
          }, item.peerFlag === 1 ? {} : {}, {
            f: item.classmateFlag === 1
          }, item.classmateFlag === 1 ? {} : {}, {
            g: common_vendor.t(getFirstItem(item.positionTitle, "精英商友")),
            h: common_vendor.t(getFirstItem(item.companyName, "暂无公司信息")),
            i: "f2cf60c6-1-" + i0,
            j: item.id,
            k: common_vendor.o(($event) => handleUserClick(item), item.id)
          });
        }),
        m: common_vendor.p({
          type: "right",
          size: "16",
          color: "#eee"
        }),
        n: common_vendor.p({
          status: loadingStatus.value
        })
      } : loadingStatus.value !== "loading" ? {
        p: common_assets._imports_0$8
      } : {}, {
        o: loadingStatus.value !== "loading",
        q: common_vendor.sr(menuRef, "f2cf60c6-3", {
          "k": "menuRef"
        }),
        r: common_vendor.o(handleMenuAction)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f2cf60c6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-friendList/my-friendList.js.map
