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
  (_easycom_uni_icons + _easycom_uni_load_more + AvatarLongPressMenu)();
}
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const defaultAvatar = "https://img.gofor.club/mmexport1759211962539.jpg";
const _sfc_main = {
  __name: "contribution-ranking",
  setup(__props) {
    const rankingList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const menuRef = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      fetchRanking();
    });
    common_vendor.onPullDownRefresh(async () => {
      await fetchRanking();
      common_vendor.index.stopPullDownRefresh();
    });
    const fetchRanking = async () => {
      loading.value = true;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/contribution-ranking", {
        method: "GET"
      });
      loading.value = false;
      if (!error && data) {
        rankingList.value = data;
      } else if (error) {
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
      }
    };
    const topThree = common_vendor.computed(() => {
      return rankingList.value.slice(0, 3);
    });
    const others = common_vendor.computed(() => {
      return rankingList.value.slice(3);
    });
    const goCard = (user) => {
      const name = user.realName || user.nickname;
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(user.avatar)}`
      });
    };
    const handleAvatarClick = (user) => {
      menuRef.value.open({
        id: user.id,
        name: user.realName || user.nickname,
        avatar: user.avatar,
        managerId: user.id
      });
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      if (type === "viewCard")
        goCard(user);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: topThree.value.length > 0
      }, topThree.value.length > 0 ? common_vendor.e({
        b: topThree.value[1]
      }, topThree.value[1] ? {
        c: topThree.value[1].avatar || defaultAvatar,
        d: common_vendor.t(topThree.value[1].realName || topThree.value[1].nickname),
        e: common_vendor.t(topThree.value[1].experience),
        f: common_vendor.o(($event) => goCard(topThree.value[1]))
      } : {}, {
        g: topThree.value[0]
      }, topThree.value[0] ? {
        h: topThree.value[0].avatar || defaultAvatar,
        i: common_vendor.p({
          type: "vip-filled",
          size: "18",
          color: "#fff"
        }),
        j: common_vendor.t(topThree.value[0].realName || topThree.value[0].nickname),
        k: common_vendor.t(topThree.value[0].experience),
        l: common_vendor.o(($event) => goCard(topThree.value[0]))
      } : {}, {
        m: topThree.value[2]
      }, topThree.value[2] ? {
        n: topThree.value[2].avatar || defaultAvatar,
        o: common_vendor.t(topThree.value[2].realName || topThree.value[2].nickname),
        p: common_vendor.t(topThree.value[2].experience),
        q: common_vendor.o(($event) => goCard(topThree.value[2]))
      } : {}) : {}, {
        r: loading.value
      }, loading.value ? {
        s: common_vendor.p({
          status: "loading"
        })
      } : {
        t: common_vendor.f(others.value, (user, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 4),
            b: user.avatar || defaultAvatar,
            c: common_vendor.o(($event) => handleAvatarClick(user), user.id),
            d: common_vendor.t(user.realName || user.nickname),
            e: user.topUpLevelName
          }, user.topUpLevelName ? {
            f: common_vendor.t(user.topUpLevelName)
          } : {}, {
            g: common_vendor.t(user.positionTitle || "精英商友"),
            h: common_vendor.t(user.companyName || "平台建设者"),
            i: common_vendor.t(user.experience),
            j: user.id,
            k: common_vendor.o(($event) => goCard(user), user.id)
          });
        })
      }, {
        v: common_vendor.sr(menuRef, "3c4f4856-2", {
          "k": "menuRef"
        }),
        w: common_vendor.o(handleMenuAction)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3c4f4856"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/contribution-ranking/contribution-ranking.js.map
