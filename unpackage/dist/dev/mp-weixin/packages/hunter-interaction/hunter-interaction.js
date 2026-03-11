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
const defaultAvatar = "/static/images/default-avatar.png";
const _sfc_main = {
  __name: "hunter-interaction",
  setup(__props) {
    const interactionList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loadingStatus = common_vendor.ref("more");
    const avatarMenuRef = common_vendor.ref(null);
    const addCirclePopup = common_vendor.ref(null);
    const invitePopupRef = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      fetchInteractions(true);
    });
    common_vendor.onPullDownRefresh(() => {
      fetchInteractions(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        fetchInteractions();
      }
    });
    const fetchInteractions = async (isRefresh = false) => {
      if (isRefresh) {
        pageNo.value = 1;
        loadingStatus.value = "loading";
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/target-interest/my-business-opportunities-interests", {
          method: "GET",
          data: {
            pageNo: pageNo.value,
            pageSize: pageSize.value
          }
        });
        if (!error && data) {
          const list = data.list || [];
          interactionList.value = isRefresh ? list : [...interactionList.value, ...list];
          total.value = data.total || 0;
          if (interactionList.value.length >= total.value) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/hunter-interaction/hunter-interaction.vue:141", "获取互动列表失败", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleAvatarClick = async (user) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const menuUser = {
        id: user.id,
        name: user.nickname || user.realName || "商友",
        avatar: user.avatar || defaultAvatar,
        isEnterpriseSource: user.enterpriseIdCert === 1,
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
          viewUserCard(user);
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
    const viewUserCard = (user) => {
      const id = user.userId || user.id;
      const name = user.nickname || user.name || "商友";
      const avatar = user.avatar || defaultAvatar;
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&fromShare=1`
      });
    };
    const goToPostDetail = (postId) => {
      common_vendor.index.navigateTo({
        url: `/packages/home-commercialDetail/home-commercialDetail?id=${postId}`
      });
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(total.value),
        b: common_vendor.f(interactionList.value, (item, index, i0) => {
          var _a;
          return common_vendor.e({
            a: item.memberUser.avatar || defaultAvatar,
            b: item.memberUser.enterpriseIdCert === 1
          }, item.memberUser.enterpriseIdCert === 1 ? {
            c: common_assets._imports_0
          } : {}, {
            d: common_vendor.o(($event) => handleAvatarClick(item.memberUser), item.id),
            e: common_vendor.t(item.memberUser.nickname || "商友"),
            f: item.memberUser.idCert === 1
          }, item.memberUser.idCert === 1 ? {} : {}, {
            g: common_vendor.t(formatTime(item.createTime)),
            h: common_vendor.t(((_a = item.businessOpportunity) == null ? void 0 : _a.postTitle) || "内容已删除"),
            i: "d063ca4b-0-" + i0,
            j: common_vendor.o(($event) => goToPostDetail(item.targetId), item.id),
            k: item.id
          });
        }),
        c: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        d: common_vendor.p({
          status: loadingStatus.value
        }),
        e: interactionList.value.length === 0 && loadingStatus.value === "noMore"
      }, interactionList.value.length === 0 && loadingStatus.value === "noMore" ? {
        f: common_vendor.p({
          type: "info",
          size: "60",
          color: "#eee"
        })
      } : {}, {
        g: common_vendor.sr(avatarMenuRef, "d063ca4b-3", {
          "k": "avatarMenuRef"
        }),
        h: common_vendor.o(handleMenuAction),
        i: common_vendor.sr(addCirclePopup, "d063ca4b-4", {
          "k": "addCirclePopup"
        }),
        j: common_vendor.sr(invitePopupRef, "d063ca4b-5", {
          "k": "invitePopupRef"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d063ca4b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/hunter-interaction/hunter-interaction.js.map
