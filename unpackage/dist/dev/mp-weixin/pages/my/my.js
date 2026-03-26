"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_notice_bar2 = common_vendor.resolveComponent("uni-notice-bar");
  (_easycom_uni_icons2 + _easycom_uni_notice_bar2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_notice_bar = () => "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_notice_bar)();
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
    const creditScore = common_vendor.ref(null);
    const isAccountVisible = common_vendor.ref(common_vendor.index.getStorageSync("isAccountVisible") || false);
    const toggleAccountVisible = () => {
      isAccountVisible.value = !isAccountVisible.value;
      common_vendor.index.setStorageSync("isAccountVisible", isAccountVisible.value);
    };
    const unreadData = common_vendor.ref({
      total: 0,
      // 总未读
      interaction: 0,
      // 社交互动总数 (点评+猎伙+商机)
      activity: 0,
      // 聚会评论未读
      business: 0,
      // 商机评论未读
      store: 0
      // 聚店评论未读
    });
    const fetchUnreadCount = async () => {
      if (!isLogin.value)
        return;
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/unread-count", {
          method: "GET"
        });
        if (!error && data) {
          unreadData.value = {
            total: data.totalUnreadCount || 0,
            // 核心：这里的 interactionCount 对应“社交互动”
            interaction: data.interactionCount || 0,
            activity: data.activityUnreadCount || 0,
            business: data.businessOpportunitiesUnreadCount || 0,
            store: data.storeUnreadCount || 0
          };
          if (data.totalUnreadCount > 0) {
            common_vendor.index.showTabBarRedDot({
              index: 4
            });
          } else {
            common_vendor.index.hideTabBarRedDot({
              index: 4
            });
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:240", "获取未读数失败", e);
      }
    };
    const checkLoginStatusAndFetchData = () => {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        isLogin.value = true;
        getUserInfo();
        fetchUnreadCount();
      } else {
        isLogin.value = false;
        userInfo.value = {};
        unreadData.value = {
          total: 0,
          post: 0,
          activity: 0,
          store: 0
        };
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
          common_vendor.index.__f__("log", "at pages/my/my.vue:279", "getUserInfo userInfo:", userInfo.value);
          getCreditScore();
        } else {
          common_vendor.index.__f__("log", "at pages/my/my.vue:283", "获取用户信息失败:", error);
          isLogin.value = false;
          userInfo.value = {};
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:289", "请求异常:", err);
        isLogin.value = false;
        userInfo.value = {};
      }
    };
    const getCreditScore = async () => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/credit-score", {
          method: "GET"
        });
        if (!error && data) {
          creditScore.value = data.totalScore || null;
          common_vendor.index.__f__("log", "at pages/my/my.vue:306", "getCreditScore:", creditScore.value);
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:309", "获取信用分失败:", err);
      }
    };
    const accountList = common_vendor.computed(() => {
      const user = userInfo.value;
      return [
        // {
        // 	value: user.activityCount || 0,
        // 	label: '我的聚会',
        // 	path: '/packages/my-active/my-active'
        // },
        // {
        // 	value: user.postCount || 0,
        // 	label: '我的商机',
        // 	path: '/packages/my-opportunity/my-opportunity'
        // },
        {
          value: user.shareCount || 0,
          label: "我的商友",
          path: "/packages/my-shareList/my-shareList"
        },
        {
          value: user.friendCount || 0,
          label: "我的圈友",
          path: "/packages/my-circleList/my-circleList"
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
          value: creditScore.value !== null ? creditScore.value : "--",
          label: "猩球信用",
          path: "/packages/credit-score/credit-score"
        }
      ];
    });
    const userProfessionalTitleDisplay = common_vendor.computed(() => {
      if (!isLogin.value)
        return "登录后查看";
      const info = userInfo.value || {};
      const getFirst = (str) => {
        if (!str || typeof str !== "string")
          return "";
        const parts = str.split(",");
        return parts[0] ? parts[0].trim() : "";
      };
      const firstAssoc = getFirst(info.associationName);
      const firstTitle = getFirst(info.professionalTitle);
      if (firstAssoc && firstTitle) {
        return `${firstAssoc}${firstTitle}`;
      } else if (firstAssoc || firstTitle) {
        return firstAssoc || firstTitle;
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
    const navigateToAccountDetail = async (item) => {
      if (!await utils_user.checkLoginGuard())
        return;
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
        name: "社交互动",
        desc: "您的互动信息",
        icon: "../../static/icon/社交互动.png",
        iconBg: "linear-gradient(135deg, #4158D0, #C850C0)",
        // key: 'membershipCenter'
        path: "/packages/social-interaction/social-interaction"
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
        name: "名片分享",
        desc: "连接精英商友",
        icon: "../../static/icon/名片.png",
        iconBg: "linear-gradient(135deg, #30CFD0, #330867)",
        path: "/packages/my-businessCard/my-businessCard"
      },
      {
        name: "猩球榜单",
        desc: "猩球贡献榜单",
        icon: "../../static/icon/榜单.png",
        iconBg: "linear-gradient(135deg, #30CFD0, #330867)",
        // key: 'membershipCenter'
        path: "/packages/contribution-ranking/contribution-ranking"
      }
      // {
      // 	name: '精准投放',
      // 	desc: '广告精准触达',
      // 	icon: '../../static/icon/广告投放.png',
      // 	iconBg: 'linear-gradient(135deg, #FAD961, #F76B1C)',
      // 	key: 'precisionTargeting'
      // }
    ]);
    const navigateToCoreFeature = async (item) => {
      if (!await utils_user.checkLoginGuard())
        return;
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
      // {
      // 	name: '我的商友',
      // 	desc: '查看我邀请的商友列表',
      // 	icon: '../../static/icon/商友邀请.png', // 建议换一个列表图标
      // 	path: '/packages/my-shareList/my-shareList',
      // 	highlight: true
      // },
      // {
      // 	name: '我的圈友',
      // 	desc: '管理您的互圈人脉',
      // 	icon: '../../static/icon/社交互动.png', // 建议换一个圈子图标
      // 	path: '/packages/my-circleList/my-circleList',
      // 	highlight: true
      // },
      {
        name: "我的聚会",
        desc: "管理您的聚会资源",
        icon: "../../static/icon/聚会.png",
        path: "/packages/my-active/my-active",
        highlight: true
      },
      {
        name: "我的商机",
        desc: "管理您的商机帖子",
        icon: "../../static/icon/商机S.png",
        path: "/packages/my-opportunity/my-opportunity",
        highlight: true
      },
      // 第 2 行
      {
        name: "我的收藏",
        desc: "查看商机聚会收藏",
        icon: "../../static/icon/收藏.png",
        path: "/packages/my-collection/my-collection"
      },
      {
        name: "我的关注",
        desc: "查看商友互关信息",
        icon: "../../static/icon/加关注.png",
        path: "/pages/my-follow/my-follow"
      },
      // 第 3 行
      {
        name: "推荐聚店",
        desc: "管理您的推荐聚店",
        icon: "../../static/icon/推荐.png",
        path: "/pages/my-shopRecommend/my-shopRecommend"
      },
      {
        name: "自荐聚店",
        desc: "管理您的自荐聚店",
        icon: "../../static/icon/店铺.png",
        path: "/pages/my-shop/my-shop"
      },
      // 第 4 行
      {
        name: "我的订单",
        desc: "查看您的订单信息",
        icon: "../../static/icon/订单.png",
        path: "/pages/my-order/my-order"
      },
      {
        name: "我的企业",
        desc: "查看您的企业信息",
        icon: "../../static/icon/认证企业.png",
        path: "/packages/enterprise-list/enterprise-list",
        highlight: true
      },
      {
        name: "时空共享",
        desc: "一键共享创业驿站",
        icon: "../../static/icon/时空共享.png",
        path: null
      },
      // 新增
      {
        name: "评论中心",
        desc: "管理所有评论信息 ",
        icon: "../../static/icon/我的评论.png",
        path: "/packages/comment-center/comment-center",
        highlight: true
      },
      // 新增
      // 第 5 行
      // {
      // 	name: '邀请注册',
      // 	desc: '连接全球精英商友',
      // 	icon: '../../static/icon/精准投放.png',
      // 	path: '/pages/index/index'
      // }, // 新增
      {
        name: "资源匹配",
        desc: "即时匹配供需资源",
        icon: "../../static/icon/资源匹配.png",
        path: "/packages/resource-match/resource-match",
        highlight: true
      },
      // 新增
      {
        name: "智能营销",
        desc: "IP&品牌智能传播",
        icon: "../../static/icon/广告投放2.0.png",
        path: null
      },
      // 第 6 行
      {
        name: "系统共建",
        desc: "共建系统共享价值",
        icon: "../../static/icon/系统建议.png",
        path: "/packages/my-systemConstruction/my-systemConstruction",
        highlight: true
      },
      {
        name: "用户协议",
        desc: "查看平台用户协议",
        icon: "../../static/icon/protocols.png",
        path: "/pages/user-agreement/user-agreement"
      },
      {
        name: "平台客服",
        desc: "联系我们，获得平台助力",
        icon: "../../static/icon/customer-service.png",
        // 假设您有一个客服图标
        path: "/packages/ContactService/ContactService",
        // key: 'customerService', // 定义一个唯一的 key
        // phone: '18024545855', // 【请在这里替换成您的真实客服电话】
        fullWidth: true
      },
      // 单独成行
      {
        name: "平台认证",
        desc: "通过认证解锁更多功能",
        icon: "../../static/icon/平台认证.png",
        path: "/packages/my-auth/my-auth",
        fullWidth: true
      }
      // 新增，带特殊标记
    ]);
    const navigateToFeature = async (item) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (item && item.key === "customerService") {
        if (!item.phone) {
          common_vendor.index.showToast({
            title: "客服电话未设置",
            icon: "none"
          });
          return;
        }
        common_vendor.index.makePhoneCall({
          phoneNumber: item.phone,
          success: () => {
            common_vendor.index.__f__("log", "at pages/my/my.vue:666", "拨打电话成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/my/my.vue:669", "拨打电话失败:", err);
          }
        });
        return;
      }
      if (item && item.path) {
        common_vendor.index.navigateTo({
          url: item.path
        });
      } else {
        common_vendor.index.showToast({
          title: "稍后解锁，敬请期待",
          icon: "none"
        });
      }
    };
    const onEdit = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        // url: '/packages/my-edit/my-edit'
        url: `/packages/my-account-informationDetails/my-account-informationDetails?id=${userInfo.value.id}`
      });
    };
    const onViewAccountDetail = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      common_vendor.index.navigateTo({
        url: "/packages/my-edit/my-edit"
      });
    };
    const handleLoginClick = async () => {
      const isLoggedIn = await utils_user.checkLoginGuard();
      if (isLoggedIn) {
        common_vendor.index.showToast({
          title: "欢迎回来",
          icon: "success"
        });
        isLogin.value = true;
        getUserInfo();
      }
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const goToMemberRecharge = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-member/my-member"
        // 对应“用户中心”路径
      });
    };
    return (_ctx, _cache) => {
      var _a, _b;
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
        i: userInfo.value.level && userInfo.value.level.name
      }, userInfo.value.level && userInfo.value.level.name ? {
        j: common_vendor.t(userInfo.value.level.name)
      } : {}, {
        k: userInfo.value.nickname === "微信用户"
      }, userInfo.value.nickname === "微信用户" ? {
        l: common_vendor.o(onEdit)
      } : {}, {
        m: common_vendor.t(userProfessionalTitleDisplay.value),
        n: common_vendor.t(userCompanyAndPositionDisplay.value),
        o: common_vendor.t(userInfo.value.parentName || "无"),
        p: common_vendor.p({
          type: isAccountVisible.value ? "eye-filled" : "eye-slash-filled",
          size: "18",
          color: "rgba(255, 255, 255, 0.7)"
        }),
        q: common_vendor.t(isAccountVisible.value ? "已显" : "已隐"),
        r: common_vendor.o(toggleAccountVisible),
        s: userInfo.value.id
      }, userInfo.value.id ? {
        t: common_vendor.t(userInfo.value.countryStr ? userInfo.value.countryStr + " · " : ""),
        v: common_vendor.t(userInfo.value.virtualId)
      } : {}, {
        w: common_vendor.o(onViewAccountDetail),
        x: common_vendor.f(accountList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(isAccountVisible.value ? item.value : "--"),
            b: common_vendor.t(item.label),
            c: item.label,
            d: common_vendor.o(($event) => navigateToAccountDetail(item), item.label)
          };
        })
      }) : {
        y: common_vendor.p({
          type: "person-filled",
          size: "30",
          color: "#FF8C00"
        }),
        z: common_vendor.o(handleLoginClick)
      }, {
        A: isLogin.value && userInfo.value && userInfo.value.topUpLevel && userInfo.value.topUpLevel.isExpirySoon
      }, isLogin.value && userInfo.value && userInfo.value.topUpLevel && userInfo.value.topUpLevel.isExpirySoon ? {
        B: common_vendor.o(goToMemberRecharge),
        C: common_vendor.p({
          ["show-icon"]: true,
          scrollable: true,
          speed: 50,
          color: "#FF770F",
          ["background-color"]: "#FFF9F5",
          text: `温馨提示：您的会员将于 ${formatDate((_a = userInfo.value.topUpLevel) == null ? void 0 : _a.expirationTime)} 到期，距离到期还有 ${(_b = userInfo.value.topUpLevel) == null ? void 0 : _b.daysUntilExpiry} 天，可以到用户中心进行会员续期充值或者升级会员`
        })
      } : {}, {
        D: common_vendor.f(coreFeatures.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: item.icon,
            c: item.name === "社交互动" && unreadData.value.interaction > 0
          }, item.name === "社交互动" && unreadData.value.interaction > 0 ? {
            d: common_vendor.t(unreadData.value.interaction > 99 ? "99+" : unreadData.value.interaction)
          } : {}, {
            e: common_vendor.t(item.desc),
            f: item.name,
            g: common_vendor.o(($event) => navigateToCoreFeature(item), item.name)
          });
        }),
        E: common_vendor.f(featureList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.icon,
            b: item.name === "评论中心" && unreadData.value.activity + unreadData.value.business + unreadData.value.store > 0
          }, item.name === "评论中心" && unreadData.value.activity + unreadData.value.business + unreadData.value.store > 0 ? {
            c: common_vendor.t(unreadData.value.activity + unreadData.value.business + unreadData.value.store > 99 ? "99+" : unreadData.value.activity + unreadData.value.business + unreadData.value.store)
          } : {}, {
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.desc),
            f: item.name,
            g: item.fullWidth ? 1 : "",
            h: item.highlight ? 1 : "",
            i: common_vendor.o(($event) => navigateToFeature(item), item.name)
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
