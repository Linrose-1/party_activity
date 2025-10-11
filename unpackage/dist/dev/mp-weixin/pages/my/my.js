"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "my",
  setup(__props) {
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    common_vendor.onLoad(() => {
      getUserInfo();
    });
    common_vendor.onShow(() => {
      checkLoginStatusAndFetchData();
    });
    const userInfo = common_vendor.ref({});
    const isLogin = common_vendor.ref(false);
    const checkLoginStatusAndFetchData = () => {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        isLogin.value = true;
        getUserInfo();
      } else {
        isLogin.value = false;
        userInfo.value = {};
      }
    };
    const getUserInfo = async () => {
      try {
        if (!isLogin.value)
          return;
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        if (!error && data) {
          userInfo.value = data;
          common_vendor.index.__f__("log", "at pages/my/my.vue:200", "getUserInfo userInfo:", userInfo.value);
        } else {
          common_vendor.index.__f__("log", "at pages/my/my.vue:202", "获取用户信息失败:", error);
          isLogin.value = false;
          userInfo.value = {};
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:208", "请求异常:", err);
        isLogin.value = false;
        userInfo.value = {};
      }
    };
    const accountList = common_vendor.computed(() => {
      const user = userInfo.value;
      return [
        {
          value: user.activityCount || 0,
          label: "我的聚会",
          path: "/pages/my-active/my-active"
        },
        {
          value: user.postCount || 0,
          label: "我的商机",
          path: "/pages/my-opportunity/my-opportunity"
        },
        {
          value: user.currExperience || 0,
          label: "我的贡分",
          path: "/packages/my-points/my-points"
        },
        {
          value: user.point || 0,
          label: "我的智米",
          path: "/packages/my-zhimi/my-zhimi"
        },
        {
          value: "--",
          // 或者 '查看'，或其他占位符
          label: "互动信息",
          path: null
          // 使用 null 作为特殊标记
        }
      ];
    });
    const userProfessionalTitleDisplay = common_vendor.computed(() => {
      if (!isLogin.value)
        return "登录后查看";
      const titles = userInfo.value.professionalTitle;
      if (titles) {
        return titles.split(",")[0].trim();
      }
      return "暂未设置商协会职务";
    });
    const userCompanyAndPositionDisplay = common_vendor.computed(() => {
      if (!isLogin.value)
        return "";
      const companies = userInfo.value.companyName;
      const positions = userInfo.value.positionTitle;
      let firstCompany = "";
      if (companies) {
        firstCompany = companies.split(",")[0].trim();
      }
      let firstPosition = "";
      if (positions) {
        firstPosition = positions.split(",")[0].trim();
      }
      if (firstCompany && firstPosition) {
        return `${firstCompany} | ${firstPosition}`;
      }
      return firstCompany || firstPosition || "暂未设置公司和职位";
    });
    const navigateToAccountDetail = (item) => {
      if (item && item.path) {
        common_vendor.index.navigateTo({
          url: item.path
        });
      } else if (item && item.label === "互动信息") {
        common_vendor.index.showToast({
          title: "该功能正在开发中",
          icon: "none"
        });
      }
    };
    const coreFeatures = common_vendor.ref([
      {
        name: "商友邀请",
        desc: "您的商脉金库",
        icon: "../../static/icon/商友邀请.png",
        iconBg: "linear-gradient(135deg, #00DBDE, #FC00FF)",
        path: "/packages/my-friendInvitation/my-friendInvitation"
      },
      {
        name: "数字身份",
        desc: "详细身份信息",
        icon: "../../static/icon/数字身份.png",
        iconBg: "linear-gradient(135deg, #4158D0, #C850C0)",
        key: "digitalIdentity"
      },
      {
        name: "名片分享",
        desc: "您的电子名片",
        icon: "../../static/icon/我的名片.png",
        iconBg: "linear-gradient(135deg, #30CFD0, #330867)",
        path: "/pages/my-businessCard/my-businessCard"
      },
      {
        name: "用户中心",
        desc: "您的用户等级",
        icon: "../../static/icon/会员中心.png",
        iconBg: "linear-gradient(135deg, #FFD700, #FFA500)",
        // key: 'membershipCenter'
        path: "/packages/my-member/my-member"
      },
      {
        name: "精准投放",
        desc: "广告精准触达",
        icon: "../../static/icon/广告投放.png",
        iconBg: "linear-gradient(135deg, #FAD961, #F76B1C)",
        key: "precisionTargeting"
      }
    ]);
    const navigateToCoreFeature = (item) => {
      if (item.key) {
        switch (item.key) {
          case "digitalIdentity":
            if (userInfo.value && userInfo.value.id) {
              common_vendor.index.navigateTo({
                url: `/packages/my-account-informationDetails/my-account-informationDetails?id=${userInfo.value.id}`
              });
            } else {
              common_vendor.index.showToast({
                title: "无法获取用户信息",
                icon: "none"
              });
            }
            return;
          case "precisionTargeting":
          case "membershipCenter":
            common_vendor.index.showToast({
              title: "该功能正在开发中",
              icon: "none"
            });
            return;
        }
      }
      if (item.path) {
        common_vendor.index.navigateTo({
          url: item.path
        });
      }
    };
    const featureList = common_vendor.ref([
      // 第 1 行
      {
        name: "我的商机",
        desc: "查看您发布的商机内容",
        icon: "../../static/icon/商机.png",
        path: "/pages/my-opportunity/my-opportunity"
      },
      {
        name: "我的聚会",
        desc: "已报名/已发布的聚会",
        icon: "../../static/icon/聚会.png",
        path: "/pages/my-active/my-active"
      },
      // 第 2 行
      {
        name: "我的推荐",
        desc: "查看您的推荐聚店信息",
        icon: "../../static/icon/推荐.png",
        path: "/pages/my-shopRecommend/my-shopRecommend"
      },
      {
        name: "我的聚店",
        desc: "查看您的所有聚店信息",
        icon: "../../static/icon/店铺.png",
        path: "/pages/my-shop/my-shop"
      },
      // 第 3 行
      {
        name: "我的收藏",
        desc: "查看您收藏的聚会和商机",
        icon: "../../static/icon/收藏.png",
        path: "/pages/my-collection/my-collection"
      },
      {
        name: "我的关注",
        desc: "查看您关注的商友信息",
        icon: "../../static/icon/加关注.png",
        path: "/pages/my-follow/my-follow"
      },
      // 第 4 行
      {
        name: "我的订单",
        desc: "查看您的所有支付订单信息",
        icon: "../../static/icon/订单.png",
        path: "/pages/my-order/my-order"
      },
      {
        name: "我的评论",
        desc: "查看对您发布的评论信息",
        icon: "../../static/icon/我的评论.png",
        path: null
      },
      // 新增
      // 第 5 行
      {
        name: "精准投放",
        desc: "将商机、聚会、聚店等精准推送",
        icon: "../../static/icon/精准投放.png",
        path: null
      },
      // 新增
      {
        name: "资源匹配",
        desc: "智能匹配供需资源对应的商友",
        icon: "../../static/icon/资源匹配.png",
        path: null
      },
      // 新增
      // 第 6 行
      {
        name: "系统建议",
        desc: "提供您对本平台的建议",
        icon: "../../static/icon/系统建议.png",
        path: "/pages/my-systemSuggestions/my-systemSuggestions"
      },
      {
        name: "用户协议",
        desc: "查看用户协议、隐私协议等",
        icon: "../../static/icon/protocols.png",
        path: "/pages/user-agreement/user-agreement"
      },
      // 单独成行
      {
        name: "平台认证",
        desc: "通过认证，开启更多功能",
        icon: "../../static/icon/平台认证.png",
        path: "/pages/my-auth/my-auth",
        fullWidth: true
      }
      // 新增，带特殊标记
    ]);
    const navigateToFeature = (item) => {
      if (item && item.path) {
        common_vendor.index.navigateTo({
          url: item.path
        });
      } else {
        common_vendor.index.showToast({
          title: "该功能正在开发中",
          icon: "none"
        });
      }
    };
    const onEdit = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-edit/my-edit"
      });
    };
    const onViewAccountDetail = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-edit/my-edit"
      });
    };
    const skipToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/index/index"
        // url: '/pages/login/login'
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLogin.value
      }, isLogin.value ? {
        b: common_vendor.o(onEdit)
      } : {}, {
        c: isLogin.value
      }, isLogin.value ? common_vendor.e({
        d: userInfo.value.avatar || "../../static/images/default-avatar.png",
        e: common_vendor.o(onEdit),
        f: common_vendor.t(userInfo.value.nickname || "未设置昵称"),
        g: userInfo.value.topUpLevel && userInfo.value.topUpLevel.name
      }, userInfo.value.topUpLevel && userInfo.value.topUpLevel.name ? {
        h: common_vendor.t(userInfo.value.topUpLevel.name)
      } : {}, {
        i: userInfo.value.nickname === "微信用户"
      }, userInfo.value.nickname === "微信用户" ? {
        j: common_vendor.o(onEdit)
      } : {}, {
        k: common_vendor.t(userProfessionalTitleDisplay.value),
        l: common_vendor.t(userCompanyAndPositionDisplay.value),
        m: common_vendor.t(userInfo.value.parentName || "无"),
        n: userInfo.value.id
      }, userInfo.value.id ? {
        o: common_vendor.t(userInfo.value.virtualId)
      } : {}, {
        p: common_vendor.o(onViewAccountDetail),
        q: common_vendor.f(accountList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: item.label,
            d: common_vendor.o(($event) => navigateToAccountDetail(item), item.label)
          };
        })
      }) : {
        r: common_vendor.p({
          type: "person-filled",
          size: "30",
          color: "#FF8C00"
        }),
        s: common_vendor.o(skipToLogin)
      }, {
        t: common_vendor.f(coreFeatures.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.icon,
            c: common_vendor.t(item.desc),
            d: item.name,
            e: common_vendor.o(($event) => navigateToCoreFeature(item), item.name)
          };
        }),
        v: common_vendor.f(featureList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: item.name,
            e: item.fullWidth ? 1 : "",
            f: common_vendor.o(($event) => navigateToFeature(item), item.name)
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
