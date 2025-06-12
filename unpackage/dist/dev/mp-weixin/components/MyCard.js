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
    avatar: {
      type: String,
      default: "https://randomuser.me/api/portraits/men/41.jpg"
    },
    name: {
      type: String,
      default: "张明"
    },
    title: {
      type: String,
      default: "市场总监"
    },
    location: {
      type: String,
      default: "北京市朝阳区"
    },
    infoItems: {
      type: Array,
      default: () => [
        {
          icon: "contact",
          label: "职业",
          value: "市场总监"
        },
        {
          icon: "shop",
          label: "公司/机构",
          value: "创新科技有限公司"
        },
        {
          icon: "phone",
          label: "联系方式",
          value: "+86 138 0013 8000"
        },
        {
          icon: "info",
          label: "个人简介",
          value: "拥有10年市场营销经验，专注于品牌策略与数字营销，曾服务多家世界500强企业。"
        }
      ]
    },
    showQrCode: {
      type: Boolean,
      default: true
    },
    qrCodeUrl: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=weixin://dl/business/?t=abcdefghijk"
    },
    inviteCode: {
      type: String,
      default: "INV2023"
      // 新增邀请码属性
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.avatar,
        b: common_vendor.t(__props.name),
        c: common_vendor.t(__props.title),
        d: common_vendor.p({
          type: "location",
          size: "18",
          color: "rgba(255, 255, 255, 0.85)"
        }),
        e: common_vendor.t(__props.location),
        f: common_vendor.f(__props.infoItems, (item, index, i0) => {
          return {
            a: "0262bca8-1-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "22",
              color: "#FF7B00"
            }),
            c: common_vendor.t(item.label),
            d: common_vendor.t(item.value),
            e: index
          };
        }),
        g: __props.inviteCode
      }, __props.inviteCode ? {
        h: common_vendor.p({
          type: "compose",
          size: "22",
          color: "#FF7B00"
        }),
        i: common_vendor.t(__props.inviteCode)
      } : {}, {
        j: __props.showQrCode
      }, __props.showQrCode ? {
        k: __props.qrCodeUrl
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0262bca8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MyCard.js.map
