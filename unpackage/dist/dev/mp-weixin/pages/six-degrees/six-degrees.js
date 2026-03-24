"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + AvatarLongPressMenu + AddCircleConfirmPopup + InviteCircleConfirmPopup + SmartGuidePopup)();
}
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const AddCircleConfirmPopup = () => "../../components/AddCircleConfirmPopup.js";
const InviteCircleConfirmPopup = () => "../../components/InviteCircleConfirmPopup.js";
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const _sfc_main = {
  __name: "six-degrees",
  setup(__props) {
    const smartGuidePopupRef = common_vendor.ref(null);
    const avatarMenuRef = common_vendor.ref(null);
    const addCirclePopup = common_vendor.ref(null);
    const invitePopupRef = common_vendor.ref(null);
    const searchKeyword = common_vendor.ref("");
    const recommendUsers = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    const isFirstShow = common_vendor.ref(true);
    const tiers = [
      {
        id: 1,
        count: 1,
        price: 1,
        benefit: "基础推荐",
        hot: false
      },
      {
        id: 2,
        count: 6,
        price: 5,
        benefit: "加送1位",
        hot: true
      },
      {
        id: 3,
        count: 15,
        price: 10,
        benefit: "买10送5",
        hot: false
      }
    ];
    const selectedTier = common_vendor.ref(tiers[1]);
    const handleAvatarClick = async (user) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const menuUserData = {
        id: user.id,
        name: user.nickname || "商友",
        avatar: user.avatar || "/static/icon/default-avatar.png",
        isEnterpriseSource: false,
        // 推荐页目前以个人为主，如有企业推荐可动态判断
        isIdVerified: user.idCert === 1
      };
      avatarMenuRef.value.open(menuUserData);
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      switch (type) {
        case "viewCard":
          if (user.isEnterpriseSource) {
            common_vendor.index.navigateTo({
              url: `/packages/enterprise-card/enterprise-card?id=${user.id}`
            });
          } else {
            navigateToBusinessCard(user);
          }
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
    const navigateToBusinessCard = (user) => {
      const avatarUrl = user.avatar || "/static/icon/default-avatar.png";
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(avatarUrl)}`
      });
    };
    const fetchRecommendUsers = async (isRefresh = false) => {
      if (!isRefresh) {
        common_vendor.index.showLoading({
          title: "AI匹配中..."
        });
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/random-recommend", {
        method: "GET"
      });
      if (!isRefresh) {
        common_vendor.index.hideLoading();
      }
      if (!error && data) {
        const getFirstItem = (value) => {
          if (!value)
            return "";
          if (Array.isArray(value) && value.length > 0) {
            return value[0];
          }
          if (typeof value === "string" && value.includes(",")) {
            return value.split(",")[0].trim();
          }
          return value;
        };
        recommendUsers.value = data.map((user) => {
          const tags = [];
          if (user.classmateFlag)
            tags.push("同学");
          if (user.peerFlag)
            tags.push("同行");
          if (user.fellowTownspeopleFlag)
            tags.push("同乡");
          if (user.friendParentFlag)
            tags.push("同圈");
          if (tags.length === 0)
            tags.push("深度契合");
          const org = getFirstItem(user.professionalTitle);
          const pos = getFirstItem(user.positionTitle);
          let combinedTitle = "暂未设置社会职务";
          if (org && pos) {
            combinedTitle = `${org} | ${pos}`;
          } else if (org || pos) {
            combinedTitle = org || pos;
          }
          return {
            ...user,
            matchTags: tags,
            companyName: getFirstItem(user.companyName) || "暂未设置公司",
            school: getFirstItem(user.school) || "暂未设置学校",
            positionTitle: getFirstItem(user.positionTitle) || "",
            professionalTitle: getFirstItem(user.professionalTitle) || "暂未设置社会职务",
            combinedTitle
          };
        });
      }
    };
    const handleConsumeZhimi = async () => {
      const canProceed = await utils_user.checkLoginGuard(`开启扩展人脉需完善资料并消耗 ${selectedTier.value.price} 智米，是否继续？`);
      if (!canProceed)
        return;
      common_vendor.index.showModal({
        title: "确认兑换",
        content: `将消耗 ${selectedTier.value.price} 智米开启深度人脉推荐？`,
        confirmColor: "#FF6F00",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在开启..."
            });
            const {
              error
            } = await utils_request.request(
              `/app-api/member/user/add-recommend-view-count?viewCount=${selectedTier.value.count}`,
              {
                method: "POST"
              }
            );
            common_vendor.index.hideLoading();
            if (!error) {
              common_vendor.index.showToast({
                title: "开启成功",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.navigateTo({
                  url: "/packages/recommend-list/recommend-list"
                });
              }, 800);
            }
          }
        }
      });
    };
    const handleSearch = () => {
      common_vendor.index.navigateTo({
        url: "/pages/general-search/general-search?keyword=" + encodeURIComponent(searchKeyword.value)
      });
    };
    const goToShakePage = () => {
      common_vendor.index.navigateTo({
        url: "/packages/location/location?autoShake=true"
      });
    };
    const goToCustomVisitPage = async () => {
      const canProceed = await utils_user.checkLoginGuard("使用自定义访友搜索需完善资料，是否前往？");
      if (canProceed) {
        common_vendor.index.navigateTo({
          url: "/pages/relation/relation"
        });
      }
    };
    const viewUserDetail = async (user) => {
      const canProceed = await utils_user.checkLoginGuard();
      if (canProceed) {
        const defaultAvatar = "/static/icon/default-avatar.png";
        const name = user.nickname || "匿名用户";
        const avatarUrl = user.avatar || defaultAvatar;
        common_vendor.index.navigateTo({
          url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`
        });
      }
    };
    const onPullDownRefresh = async () => {
      refreshing.value = true;
      await Promise.all([
        fetchRecommendUsers(true)
        // 这里不需要特意 updateCurrentUserInfo，
        // 因为下面的 canShowProfileRemind 内部会进行逻辑判断
      ]);
      refreshing.value = false;
      const shouldShow = await utils_user.canShowProfileRemind();
      if (shouldShow) {
        setTimeout(() => {
          var _a;
          (_a = smartGuidePopupRef.value) == null ? void 0 : _a.open();
        }, 500);
      }
    };
    common_vendor.onShow(async () => {
      if (isFirstShow.value || recommendUsers.value.length === 0) {
        common_vendor.index.__f__("log", "at pages/six-degrees/six-degrees.vue:443", "首次加载或列表为空，执行刷新");
        await fetchRecommendUsers();
        refreshing.value = false;
        isFirstShow.value = false;
      } else {
        common_vendor.index.__f__("log", "at pages/six-degrees/six-degrees.vue:448", "从其他页面返回，保持当前列表不刷新");
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        b: common_vendor.o(handleSearch),
        c: searchKeyword.value,
        d: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        e: common_vendor.o(handleSearch),
        f: common_vendor.o(goToShakePage),
        g: common_vendor.o(goToCustomVisitPage),
        h: common_vendor.f(recommendUsers.value, (user, index, i0) => {
          return common_vendor.e({
            a: user.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => handleAvatarClick(user), user.id),
            c: common_vendor.t(user.nickname),
            d: user.idCert === 1
          }, user.idCert === 1 ? {} : {}, {
            e: common_vendor.t(user.combinedTitle),
            f: common_vendor.t(user.companyName || "暂未设置公司"),
            g: common_vendor.t(user.school || "暂未设置学校"),
            h: common_vendor.t(user.locationAddressStr || "暂未设置商务/办公地"),
            i: user.id,
            j: common_vendor.o(($event) => viewUserDetail(user), user.id)
          });
        }),
        i: recommendUsers.value.length === 0
      }, recommendUsers.value.length === 0 ? {} : {}, {
        j: common_vendor.f(tiers, (tier, k0, i0) => {
          return common_vendor.e({
            a: tier.hot
          }, tier.hot ? {} : {}, {
            b: common_vendor.t(tier.count),
            c: common_vendor.t(tier.price),
            d: common_vendor.t(tier.benefit),
            e: tier.id,
            f: selectedTier.value.id === tier.id ? 1 : "",
            g: common_vendor.o(($event) => selectedTier.value = tier, tier.id)
          });
        }),
        k: common_vendor.o(handleConsumeZhimi),
        l: common_vendor.o(onPullDownRefresh),
        m: refreshing.value,
        n: common_vendor.sr(avatarMenuRef, "132afe13-1", {
          "k": "avatarMenuRef"
        }),
        o: common_vendor.o(handleMenuAction),
        p: common_vendor.sr(addCirclePopup, "132afe13-2", {
          "k": "addCirclePopup"
        }),
        q: common_vendor.sr(invitePopupRef, "132afe13-3", {
          "k": "invitePopupRef"
        }),
        r: common_vendor.sr(smartGuidePopupRef, "132afe13-4", {
          "k": "smartGuidePopupRef"
        }),
        s: common_vendor.p({
          scenario: 3
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-132afe13"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/six-degrees/six-degrees.js.map
