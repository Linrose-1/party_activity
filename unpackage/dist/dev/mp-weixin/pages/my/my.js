"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
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
      getUserInfo();
    });
    const userInfo = common_vendor.ref({});
    const getUserInfo = async () => {
      try {
        const result = await utils_request.request("/app-api/member/user/get", {
          method: "GET"
        });
        if (result) {
          userInfo.value = result.data;
          common_vendor.index.__f__("log", "at pages/my/my.vue:142", "getUserInfo userInfo:", userInfo.value);
        } else {
          common_vendor.index.__f__("log", "at pages/my/my.vue:144", "请求业务失败:", result.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:147", "请求失败:", error);
      }
    };
    const accountList = common_vendor.computed(() => {
      const user = userInfo.value;
      return [
        {
          // API返回的是 currExperience，代表当前贡分
          value: user.currExperience || 0,
          label: "我的贡分"
        },
        {
          value: user.activityCount || 0,
          label: "我的活动"
        },
        {
          value: user.postCount || 0,
          label: "我的商机"
        },
        {
          value: user.point || 0,
          label: "我的智米"
        }
      ];
    });
    const userTitleAndCompany = common_vendor.computed(() => {
      const title = userInfo.value.professionalTitle;
      const company = userInfo.value.companyName;
      if (title && company) {
        return `${title} | ${company}`;
      }
      return title || company || "暂未设置职位和公司";
    });
    const featureList = common_vendor.ref([
      {
        name: "我的活动",
        desc: "已报名/已发布的活动",
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
        common_vendor.index.showToast({ title: "没有可复制的内容", icon: "none" });
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
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatar || "../../static/images/default-avatar.png",
        b: common_vendor.t(userInfo.value.nickname),
        c: userInfo.value.topUpLevel && userInfo.value.topUpLevel.name
      }, userInfo.value.topUpLevel && userInfo.value.topUpLevel.name ? {
        d: common_vendor.t(userInfo.value.topUpLevel.name)
      } : {}, {
        e: common_vendor.t(userTitleAndCompany.value),
        f: common_vendor.t(userInfo.value.parentName || "无"),
        g: common_vendor.o(onEdit),
        h: common_vendor.o(onViewAll),
        i: common_vendor.f(accountList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: item.label
          };
        }),
        j: userInfo.value.avatar || "../../static/images/default-avatar.png",
        k: common_vendor.t(userInfo.value.realName || userInfo.value.nickname),
        l: userInfo.value.topUpLevel && userInfo.value.topUpLevel.name
      }, userInfo.value.topUpLevel && userInfo.value.topUpLevel.name ? {
        m: common_vendor.t(userInfo.value.topUpLevel.name)
      } : {}, {
        n: userInfo.value.professionalTitle
      }, userInfo.value.professionalTitle ? {
        o: common_vendor.t(userInfo.value.professionalTitle)
      } : {}, {
        p: userInfo.value.companyName
      }, userInfo.value.companyName ? {
        q: common_vendor.t(userInfo.value.companyName)
      } : {}, {
        r: common_vendor.t(userInfo.value.shardCode || "暂无"),
        s: common_vendor.o(($event) => copyToClipboard(userInfo.value.shardCode)),
        t: userInfo.value.wechatQrCodeUrl || "../../static/images/default-qrcode.png",
        v: common_vendor.o(onViewDetail),
        w: common_vendor.f(featureList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: item.name,
            e: common_vendor.o(($event) => navigateToFeature(item.path), item.name)
          };
        }),
        x: common_vendor.o(skipToLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
