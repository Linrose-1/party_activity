"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "MyCard",
  props: {
    // --- 顶部个人信息 ---
    avatar: {
      type: String,
      default: "https://randomuser.me/api/portraits/men/41.jpg"
    },
    name: {
      type: String,
      default: "张三"
    },
    pinyinName: {
      type: String,
      default: "ZHANG SAN"
    },
    groupName: {
      type: String,
      default: "伙猩人"
    },
    title: {
      type: String,
      default: "首席运营官"
    },
    // --- 公司与联系方式 ---
    companyName: {
      type: String,
      default: "高伙猩球"
    },
    department: {
      type: String,
      default: "数字化运营中心"
    },
    fullCompanyName: {
      type: String,
      default: "广东智米云科技有限公司"
    },
    contactInfo: {
      type: Array,
      default: () => [
        { icon: "phone-filled", value: "18888888888" },
        { icon: "email-filled", value: "ZHANGSAN@foxmail.com" },
        { icon: "location-filled", value: "广东省广州市天河区珠江新城潭村路328号二楼" }
      ]
    },
    // --- 用户个人二维码 ---
    showUserQrCode: {
      type: Boolean,
      default: true
    },
    userWeChatQrCodeUrl: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=user-wechat"
    },
    // --- 底部平台信息 ---
    platformQrCodeUrl: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info"
    },
    logoUrl: {
      type: String,
      default: "https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png"
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.avatar,
        b: common_vendor.t(__props.name),
        c: common_vendor.t(__props.pinyinName),
        d: common_vendor.t(__props.title),
        e: common_vendor.t(__props.companyName),
        f: __props.department
      }, __props.department ? {
        g: common_vendor.t(__props.department)
      } : {}, {
        h: common_vendor.t(__props.fullCompanyName),
        i: common_vendor.f(__props.contactInfo, (item, index, i0) => {
          return {
            a: "0262bca8-0-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "18",
              color: "#FF7B00"
            }),
            c: common_vendor.t(item.value),
            d: index
          };
        }),
        j: __props.showUserQrCode
      }, __props.showUserQrCode ? {
        k: __props.userWeChatQrCodeUrl
      } : {}, {
        l: __props.platformQrCodeUrl,
        m: __props.logoUrl
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0262bca8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MyCard.js.map
