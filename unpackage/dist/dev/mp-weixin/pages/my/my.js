"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "my",
  setup(__props) {
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    const userInfo = common_vendor.ref({});
    const getUserInfo = async () => {
      const result = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
        // 请求方式
        // data: postData
      });
      common_vendor.index.__f__("log", "at pages/my/my.vue:125", "getUserInfo result:", result);
      userInfo.value = result.data;
      common_vendor.index.__f__("log", "at pages/my/my.vue:128", "getUserInfo userInfo:", userInfo.value);
      if (result.error) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:131", "请求失败:", result.error);
      }
    };
    const accountList = common_vendor.ref([
      {
        value: 266,
        label: "我的贡分"
      },
      {
        value: 15,
        label: "我的活动"
      },
      {
        value: 15,
        label: "我的商机"
      },
      {
        value: 0,
        label: "我的智米"
      }
    ]);
    const featureList = common_vendor.ref([
      {
        name: "我的活动",
        desc: "已报名/已发布的活动",
        icon: "../../static/icon/活动.png",
        path: "/pages/my-active/my-active"
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
        name: "用户协议",
        desc: "查看用户协议、隐私协议等",
        icon: "../../static/icon/protocols.png",
        path: "/pages/user-agreement/user-agreement"
      }
      // {
      //   name: '设置', 
      //   desc: '设置您的功能、退出登录等', 
      //   icon: '../../static/icon/设置.png',
      //   path: '/pages/my-setting/my-setting' 
      // }
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
      common_vendor.index.showToast({
        title: "查看账户详情",
        icon: "none"
      });
      common_vendor.index.navigateTo({
        url: "/pages/my-account/my-account"
      });
    };
    const copyToClipboard = (text) => {
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
    const saveQrcode = () => {
      common_vendor.index.showToast({
        title: "二维码已保存",
        icon: "none"
      });
    };
    const shareQrcode = () => {
      common_vendor.index.showToast({
        title: "二维码已分享",
        icon: "none"
      });
    };
    const onViewDetail = () => {
      common_vendor.index.showToast({
        title: "查看名片详情",
        icon: "none"
      });
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
      return {
        a: common_vendor.t(userInfo.value.nickname),
        b: common_vendor.o(onEdit),
        c: common_vendor.o(onViewAll),
        d: common_vendor.f(accountList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: item.label
          };
        }),
        e: common_vendor.o(onViewDetail),
        f: common_vendor.o(($event) => copyToClipboard("138138")),
        g: common_vendor.o(saveQrcode),
        h: common_vendor.o(shareQrcode),
        i: common_vendor.f(featureList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: item.name,
            e: common_vendor.o(($event) => navigateToFeature(item.path), item.name)
          };
        }),
        j: common_vendor.o(skipToLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
