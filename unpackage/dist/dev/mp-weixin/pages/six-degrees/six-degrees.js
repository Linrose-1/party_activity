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
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "six-degrees",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const recommendUsers = common_vendor.ref([]);
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
    const fetchRecommendUsers = async () => {
      common_vendor.index.showLoading({
        title: "AI匹配中..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/random-recommend", {
        method: "GET"
      });
      common_vendor.index.hideLoading();
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
            tags.push("同校校友");
          if (user.peerFlag)
            tags.push("行业同行");
          if (user.fellowTownspeopleFlag)
            tags.push("家乡同乡");
          if (tags.length === 0)
            tags.push("深度契合");
          return {
            ...user,
            matchTags: tags,
            companyName: getFirstItem(user.companyName) || "保密",
            school: getFirstItem(user.school) || "优秀院校",
            positionTitle: getFirstItem(user.positionTitle) || "",
            professionalTitle: getFirstItem(user.professionalTitle) || "精英商友"
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
    common_vendor.onShow(() => {
      fetchRecommendUsers();
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
            b: common_vendor.t(user.nickname),
            c: user.isComplete
          }, user.isComplete ? {} : {}, {
            d: common_vendor.t(user.professionalTitle || "暂未设置社会职务"),
            e: common_vendor.t(user.companyName || "保密"),
            f: common_vendor.t(user.school || "优秀院校"),
            g: common_vendor.f(user.matchTags, (tag, idx, i1) => {
              return {
                a: common_vendor.t(tag),
                b: idx
              };
            }),
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
        k: common_vendor.o(handleConsumeZhimi)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-132afe13"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/six-degrees/six-degrees.js.map
