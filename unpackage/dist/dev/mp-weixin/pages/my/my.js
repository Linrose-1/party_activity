"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "my",
  setup(__props) {
    const accountList = common_vendor.ref([
      { value: 266, label: "我的贡分" },
      { value: 15, label: "我的活动" },
      { value: 15, label: "我的商机" },
      { value: 0, label: "我的智米" }
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onEdit),
        b: common_vendor.o(onViewAll),
        c: common_vendor.f(accountList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: item.label
          };
        }),
        d: common_vendor.o(onViewDetail),
        e: common_vendor.o(($event) => copyToClipboard("138138")),
        f: common_vendor.o(saveQrcode),
        g: common_vendor.o(shareQrcode),
        h: common_vendor.f(featureList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: item.name,
            e: common_vendor.o(($event) => navigateToFeature(item.path), item.name)
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
