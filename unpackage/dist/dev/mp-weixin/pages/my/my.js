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
          common_vendor.index.__f__("log", "at pages/my/my.vue:190", "getUserInfo userInfo:", userInfo.value);
        } else {
          common_vendor.index.__f__("log", "at pages/my/my.vue:192", "获取用户信息失败:", error);
          isLogin.value = false;
          userInfo.value = {};
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:198", "请求异常:", err);
        isLogin.value = false;
        userInfo.value = {};
      }
    };
    const accountList = common_vendor.computed(() => {
      const user = userInfo.value;
      return [
        {
          value: user.currExperience || 0,
          label: "我的贡分",
          path: "/pages/my-account/my-account"
        },
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
          value: user.point || 0,
          label: "我的智米",
          path: "/pages/my-account/my-account"
        }
      ];
    });
    const userTitleAndCompany = common_vendor.computed(() => {
      if (!isLogin.value)
        return "登录后查看";
      const title = userInfo.value.professionalTitle;
      const company = userInfo.value.companyName;
      if (title && company) {
        return `${title} | ${company}`;
      }
      return title || company || "暂未设置职位和公司";
    });
    const navigateToAccountDetail = (item) => {
      if (item && item.path) {
        common_vendor.index.navigateTo({
          url: item.path
        });
      }
    };
    const featureList = common_vendor.ref([
      {
        name: "我的订单",
        desc: "查看您的所有支付订单",
        icon: "../../static/icon/订单.png",
        path: "/pages/my-order/my-order"
      },
      {
        name: "我的聚会",
        desc: "已报名/已发布的聚会",
        icon: "../../static/icon/活动.png",
        path: "/pages/my-active/my-active"
      },
      {
        name: "我的关注",
        desc: "查看您关注的商友",
        icon: "../../static/icon/加关注.png",
        path: "/pages/my-follow/my-follow"
      },
      {
        name: "我的商机",
        desc: "查看您发布的商机",
        icon: "../../static/icon/商机.png",
        path: "/pages/my-opportunity/my-opportunity"
      },
      {
        name: "我的收藏",
        desc: "收藏的活动和商机",
        icon: "../../static/icon/收藏.png",
        path: "/pages/my-collection/my-collection"
      },
      {
        name: "我的推荐",
        desc: "查看您的推荐店铺",
        icon: "../../static/icon/推荐.png",
        path: "/pages/my-shopRecommend/my-shopRecommend"
      },
      {
        name: "我的聚店",
        desc: "查看您的聚店信息",
        icon: "../../static/icon/店铺.png",
        path: "/pages/my-shop/my-shop"
      },
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
      }
    ]);
    const navigateToFeature = (path) => {
      common_vendor.index.navigateTo({
        url: path
      });
    };
    const onEdit = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-edit/my-edit"
      });
    };
    const onViewAll = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-account/my-account"
      });
    };
    const copyToClipboard = (text) => {
      if (!text) {
        common_vendor.index.showToast({
          title: "没有可复制的内容",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: text,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制",
            icon: "none"
          });
        }
      });
    };
    const onViewDetail = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-businessCard/my-businessCard"
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
      }, isLogin.value ? common_vendor.e({
        b: userInfo.value.avatar || "../../static/images/default-avatar.png",
        c: common_vendor.t(userInfo.value.nickname || "未设置昵称"),
        d: userInfo.value.topUpLevel && userInfo.value.topUpLevel.name
      }, userInfo.value.topUpLevel && userInfo.value.topUpLevel.name ? {
        e: common_vendor.t(userInfo.value.topUpLevel.name)
      } : {}, {
        f: common_vendor.t(userTitleAndCompany.value),
        g: common_vendor.t(userInfo.value.parentName || "无"),
        h: common_vendor.o(onEdit),
        i: common_vendor.o(onEdit),
        j: userInfo.value.id
      }, userInfo.value.id ? {
        k: common_vendor.t(userInfo.value.virtualId)
      } : {}) : {
        l: common_vendor.p({
          type: "person-filled",
          size: "30",
          color: "#FF8C00"
        }),
        m: common_vendor.o(skipToLogin)
      }, {
        n: common_vendor.o(onViewAll),
        o: common_vendor.f(accountList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: item.label,
            d: common_vendor.o(($event) => navigateToAccountDetail(item), item.label)
          };
        }),
        p: common_vendor.o(onViewDetail),
        q: userInfo.value.wechatQrCodeUrl || "../../static/images/default-qrcode.png",
        r: common_vendor.o(onViewDetail),
        s: common_vendor.t(userInfo.value.shardCode || "暂无"),
        t: common_vendor.o(($event) => copyToClipboard(userInfo.value.shardCode)),
        v: common_vendor.f(featureList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: item.name,
            e: common_vendor.o(($event) => navigateToFeature(item.path), item.name)
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
