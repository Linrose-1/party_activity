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
    // --- 身份核心信息 ---
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
    title: {
      type: String,
      default: "首席运营官"
    },
    era: {
      type: String,
      default: ""
    },
    // 年代
    // --- 职业与社会信息 ---
    companyName: {
      type: String,
      default: "高伙猩球"
    },
    positionTitle: {
      type: String,
      default: "总裁"
    },
    // 职务
    industry: {
      type: String,
      default: "互联网"
    },
    // 行业
    professionalTitle: {
      type: String,
      default: ""
    },
    // 社会职务
    // --- 资源信息 ---
    haveResources: {
      type: String,
      default: ""
    },
    // 我有资源
    needResources: {
      type: String,
      default: ""
    },
    // 我需资源
    // --- 个人展示信息 ---
    signature: {
      type: String,
      default: ""
    },
    // 个性签名
    personalBio: {
      type: String,
      default: ""
    },
    // 个人简介
    // --- 联系方式 ---
    contactInfo: {
      type: Array,
      default: () => [
        {
          icon: "phone-filled",
          label: "手机",
          value: "18888888888"
        },
        {
          icon: "email-filled",
          label: "邮箱",
          value: "ZHANGSAN@foxmail.com"
        },
        {
          icon: "location-filled",
          label: "地址",
          value: "广东省广州市天河区珠江新城"
        }
      ]
    },
    // --- 二维码与邀请码 ---
    shardCode: {
      type: String,
      default: ""
    },
    showUserQrCode: {
      type: Boolean,
      default: true
    },
    userWeChatQrCodeUrl: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=user-wechat"
    },
    // --- 平台信息 ---
    platformQrCodeUrl: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info"
    },
    logoUrl: {
      type: String,
      default: "https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png"
    },
    dynamicQrCodeUrl: {
      type: String,
      default: ""
      // 默认是空字符串
    },
    // --- 以下为旧版兼容，新版已不再直接使用 ---
    department: {
      type: String,
      default: ""
    },
    fullCompanyName: {
      type: String,
      default: ""
    }
  },
  emits: ["goToOpportunities"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const professionalTitles = common_vendor.computed(() => {
      return props.professionalTitle ? props.professionalTitle.split(",").filter((item) => item.trim()) : [];
    });
    const careerGroups = common_vendor.computed(() => {
      const companies = props.companyName ? props.companyName.split(",") : [];
      const positions = props.positionTitle ? props.positionTitle.split(",") : [];
      const industries = props.industry ? props.industry.split(",") : [];
      const maxLength = Math.max(companies.length, positions.length, industries.length);
      const groups = [];
      for (let i = 0; i < maxLength; i++) {
        groups.push({
          company: (companies[i] || "未填写").trim(),
          position: (positions[i] || "未填写").trim(),
          industry: (industries[i] || "未填写").trim()
        });
      }
      return groups;
    });
    const copyShardCode = () => {
      if (!props.shardCode)
        return;
      common_vendor.index.setClipboardData({
        data: props.shardCode,
        success: () => common_vendor.index.showToast({
          title: "邀请码已复制",
          icon: "success"
        }),
        fail: () => common_vendor.index.showToast({
          title: "复制失败",
          icon: "none"
        })
      });
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.avatar,
        b: common_vendor.o(($event) => previewImage(__props.avatar)),
        c: common_vendor.t(__props.name),
        d: common_vendor.t(__props.pinyinName),
        e: common_vendor.t(__props.title),
        f: common_vendor.p({
          type: "calendar-filled",
          size: "18",
          color: "#888"
        }),
        g: common_vendor.t(__props.era || "未设置"),
        h: common_vendor.f(__props.contactInfo, (item, index, i0) => {
          return {
            a: "0262bca8-1-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "18",
              color: "#888"
            }),
            c: common_vendor.t(item.label),
            d: common_vendor.t(item.value),
            e: index
          };
        }),
        i: professionalTitles.value.length > 0
      }, professionalTitles.value.length > 0 ? {
        j: common_vendor.p({
          type: "staff-filled",
          size: "18",
          color: "#C9A063"
        }),
        k: common_vendor.f(professionalTitles.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        })
      } : {}, {
        l: careerGroups.value.length > 0
      }, careerGroups.value.length > 0 ? {
        m: common_vendor.p({
          type: "flag-filled",
          size: "18",
          color: "#F78C2F"
        }),
        n: common_vendor.f(careerGroups.value, (group, index, i0) => {
          return {
            a: common_vendor.t(group.company),
            b: common_vendor.t(group.position),
            c: common_vendor.t(group.industry),
            d: index
          };
        })
      } : {}, {
        o: __props.haveResources || __props.needResources
      }, __props.haveResources || __props.needResources ? common_vendor.e({
        p: __props.haveResources
      }, __props.haveResources ? {
        q: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#28a745"
        }),
        r: common_vendor.t(__props.haveResources)
      } : {}, {
        s: __props.needResources
      }, __props.needResources ? {
        t: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: "#007bff"
        }),
        v: common_vendor.t(__props.needResources)
      } : {}) : {}, {
        w: __props.signature || __props.personalBio
      }, __props.signature || __props.personalBio ? common_vendor.e({
        x: __props.signature
      }, __props.signature ? {
        y: common_vendor.t(__props.signature)
      } : {}, {
        z: __props.personalBio
      }, __props.personalBio ? {
        A: common_vendor.t(__props.personalBio)
      } : {}) : {}, {
        B: common_vendor.p({
          type: "pyq",
          size: "18",
          color: "#FF6A00"
        }),
        C: common_vendor.p({
          type: "right",
          size: "16",
          color: "#bbb"
        }),
        D: common_vendor.o(($event) => _ctx.$emit("goToOpportunities")),
        E: __props.showUserQrCode
      }, __props.showUserQrCode ? {
        F: __props.userWeChatQrCodeUrl,
        G: common_vendor.o(($event) => previewImage(__props.userWeChatQrCodeUrl))
      } : {}, {
        H: __props.shardCode
      }, __props.shardCode ? {
        I: common_vendor.t(__props.shardCode),
        J: common_vendor.p({
          type: "paperclip",
          size: "16",
          color: "#F78C2F"
        }),
        K: common_vendor.o(copyShardCode)
      } : {}, {
        L: __props.dynamicQrCodeUrl || __props.platformQrCodeUrl,
        M: common_vendor.o(($event) => previewImage(__props.platformQrCodeUrl)),
        N: __props.logoUrl
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0262bca8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MyCard.js.map
