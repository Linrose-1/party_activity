"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  (_easycom_uni_icons + _easycom_uni_load_more + AvatarLongPressMenu + AddCircleConfirmPopup + InviteCircleConfirmPopup)();
}
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const AddCircleConfirmPopup = () => "../../components/AddCircleConfirmPopup.js";
const InviteCircleConfirmPopup = () => "../../components/InviteCircleConfirmPopup.js";
const defaultAvatar = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "hunter-interaction",
  setup(__props) {
    const activeTab = common_vendor.ref(0);
    const listData = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadingStatus = common_vendor.ref("more");
    const avatarMenuRef = common_vendor.ref(null);
    const addCirclePopup = common_vendor.ref(null);
    const invitePopupRef = common_vendor.ref(null);
    common_vendor.onShow(() => {
      fetchListData(true);
    });
    common_vendor.onPullDownRefresh(() => {
      fetchListData(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        fetchListData();
      }
    });
    const handleTabChange = (index) => {
      if (activeTab.value === index)
        return;
      activeTab.value = index;
      fetchListData(true);
    };
    const fetchListData = async (isRefresh = false) => {
      if (isRefresh) {
        pageNo.value = 1;
        loadingStatus.value = "loading";
      }
      const apiPath = activeTab.value === 0 ? "/app-api/member/target-interest/my-business-opportunities-interests" : "/app-api/member/target-interest/my-interested-business-opportunities";
      try {
        const {
          data,
          error
        } = await utils_request.request(apiPath, {
          method: "GET",
          data: {
            pageNo: pageNo.value,
            pageSize: pageSize.value
          }
        });
        if (!error && data) {
          const list = data.list || [];
          listData.value = isRefresh ? list : [...listData.value, ...list];
          total.value = data.total || 0;
          if (listData.value.length >= total.value) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/hunter-interaction/hunter-interaction.vue:182", "获取列表失败", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const goToMessage = (item) => {
      var _a;
      const postId = item.targetId;
      const userId = activeTab.value === 0 ? (_a = item.memberUser) == null ? void 0 : _a.id : null;
      if (!postId)
        return common_vendor.index.showToast({
          title: "参数缺失",
          icon: "none"
        });
      common_vendor.index.navigateTo({
        url: `/packages/interaction-message/interaction-message?targetId=${postId}${userId ? "&userId=" + userId : ""}`
      });
    };
    const goToPostDetail = (postId) => {
      common_vendor.index.navigateTo({
        url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
      });
    };
    const handleAvatarClick = async (user) => {
      if (!user)
        return;
      if (!await utils_user.checkLoginGuard())
        return;
      const menuUser = {
        id: user.id,
        name: user.nickname || "商友",
        avatar: user.avatar || defaultAvatar,
        isIdVerified: user.idCert === 1
      };
      avatarMenuRef.value.open(menuUser);
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      switch (type) {
        case "viewCard":
          common_vendor.index.navigateTo({
            url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}&fromShare=1`
          });
          break;
        case "viewPath":
          common_vendor.index.navigateTo({
            url: `/packages/relationship-path/relationship-path?targetUserId=${user.id}&name=${encodeURIComponent(user.name)}`
          });
          break;
        case "addCircle":
          addCirclePopup.value.open(user);
          break;
        case "inviteCircle":
          invitePopupRef.value.open(user);
          break;
        case "comment":
          common_vendor.index.navigateTo({
            url: `/packages/user-reviews/user-reviews?userId=${user.id}`
          });
          break;
      }
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp.replace ? timestamp.replace("T", " ").replace(/-/g, "/") : timestamp);
      const M = date.getMonth() + 1;
      const D = date.getDate();
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${M}月${D}日 ${h}:${m}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === 0 ? 1 : "",
        b: common_vendor.o(($event) => handleTabChange(0)),
        c: activeTab.value === 1 ? 1 : "",
        d: common_vendor.o(($event) => handleTabChange(1)),
        e: common_vendor.f(listData.value, (item, index, i0) => {
          var _a, _b, _c, _d, _e, _f, _g;
          return common_vendor.e({
            a: ((_a = item.memberUser) == null ? void 0 : _a.avatar) || defaultAvatar,
            b: ((_b = item.memberUser) == null ? void 0 : _b.enterpriseIdCert) === 1
          }, ((_c = item.memberUser) == null ? void 0 : _c.enterpriseIdCert) === 1 ? {
            c: common_assets._imports_0
          } : {}, {
            d: common_vendor.o(($event) => handleAvatarClick(item.memberUser), item.id),
            e: common_vendor.t(((_d = item.memberUser) == null ? void 0 : _d.nickname) || "商友"),
            f: ((_e = item.memberUser) == null ? void 0 : _e.idCert) === 1
          }, ((_f = item.memberUser) == null ? void 0 : _f.idCert) === 1 ? {} : {}, {
            g: common_vendor.t(formatTime(item.createTime)),
            h: "d063ca4b-0-" + i0,
            i: item.unreadCommentCount > 0
          }, item.unreadCommentCount > 0 ? {
            j: common_vendor.t(item.unreadCommentCount > 99 ? "99+" : item.unreadCommentCount)
          } : {}, {
            k: common_vendor.o(($event) => goToMessage(item), item.id),
            l: common_vendor.t(((_g = item.businessOpportunity) == null ? void 0 : _g.postTitle) || "内容加载中..."),
            m: "d063ca4b-1-" + i0,
            n: common_vendor.o(($event) => goToPostDetail(item.targetId), item.id),
            o: item.id
          });
        }),
        f: common_vendor.p({
          type: "chat-filled",
          size: "20",
          color: "#FF7901"
        }),
        g: common_vendor.t(activeTab.value === 0 ? "针对您的猎伙：" : "感兴趣的猎伙："),
        h: common_vendor.p({
          type: "right",
          size: "12",
          color: "#999"
        }),
        i: common_vendor.p({
          status: loadingStatus.value
        }),
        j: listData.value.length === 0 && loadingStatus.value === "noMore"
      }, listData.value.length === 0 && loadingStatus.value === "noMore" ? {
        k: common_vendor.p({
          type: "chat-filled",
          size: "60",
          color: "#eee"
        }),
        l: common_vendor.t(activeTab.value === 0 ? "暂无商友表达兴趣，快去发布猎伙吧" : "您还没有对任何猎伙表达过兴趣")
      } : {}, {
        m: common_vendor.sr(avatarMenuRef, "d063ca4b-4", {
          "k": "avatarMenuRef"
        }),
        n: common_vendor.o(handleMenuAction),
        o: common_vendor.sr(addCirclePopup, "d063ca4b-5", {
          "k": "addCirclePopup"
        }),
        p: common_vendor.sr(invitePopupRef, "d063ca4b-6", {
          "k": "invitePopupRef"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d063ca4b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/hunter-interaction/hunter-interaction.js.map
