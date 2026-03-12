"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + UserScoreBoard)();
}
const UserScoreBoard = () => "./UserScoreBoard.js";
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
    remarkName: {
      type: String,
      default: ""
    },
    // 备注名
    isViewingOwnCard: {
      type: Boolean,
      default: false
    },
    // 是否在看自己的名片
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
      default: "未填写"
    },
    // 行业
    professionalTitle: {
      type: String,
      default: ""
    },
    // 社会职务
    associationName: {
      type: String,
      default: ""
    },
    companyList: {
      type: Array,
      default: () => []
    },
    associationList: {
      type: Array,
      default: () => []
    },
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
    totalScore: {
      type: [Number, String],
      default: 0
    },
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
          label: "商域",
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
    creditLevel: {
      type: String,
      default: ""
    },
    // --- 以下为旧版兼容，新版已不再直接使用 ---
    department: {
      type: String,
      default: ""
    },
    fullCompanyName: {
      type: String,
      default: ""
    },
    radarDatasets: {
      type: Array,
      default: () => []
    }
  },
  emits: ["goToOpportunities"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    common_vendor.computed(() => {
      return props.professionalTitle ? props.professionalTitle.split(",").filter((item) => item.trim()) : [];
    });
    common_vendor.computed(() => {
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
    common_vendor.computed(() => {
      const associations = props.associationName ? props.associationName.split(",") : [];
      const titles = props.professionalTitle ? props.professionalTitle.split(",") : [];
      const maxLength = Math.max(associations.length, titles.length);
      const groups = [];
      for (let i = 0; i < maxLength; i++) {
        const assoc = (associations[i] || "").trim();
        const title = (titles[i] || "").trim();
        if (assoc || title) {
          groups.push({
            association: assoc || "未填写组织",
            title: title || "未填写职务"
          });
        }
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
        d: __props.pinyinName
      }, __props.pinyinName ? {
        e: common_vendor.t(__props.pinyinName)
      } : {}, {
        f: __props.title
      }, __props.title ? {
        g: common_vendor.t(__props.title)
      } : {}, {
        h: __props.creditLevel
      }, __props.creditLevel ? {
        i: common_vendor.t(__props.creditLevel),
        j: common_vendor.o(($event) => _ctx.$emit("goToCredit"))
      } : {}, {
        k: __props.totalScore
      }, __props.totalScore ? {
        l: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#FF8400"
        }),
        m: common_vendor.t(__props.totalScore)
      } : {}, {
        n: !__props.isViewingOwnCard
      }, !__props.isViewingOwnCard ? common_vendor.e({
        o: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#888"
        }),
        p: __props.remarkName
      }, __props.remarkName ? {
        q: common_vendor.t(__props.remarkName)
      } : {}, {
        r: common_vendor.p({
          type: "right",
          size: "16",
          color: "#bbb"
        }),
        s: common_vendor.o(($event) => _ctx.$emit("editRemark"))
      }) : {}, {
        t: common_vendor.p({
          type: "calendar-filled",
          size: "18",
          color: "#888"
        }),
        v: common_vendor.t(__props.era || "未设置"),
        w: common_vendor.f(__props.contactInfo, (item, index, i0) => {
          return {
            a: "0262bca8-4-" + i0,
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
        x: __props.associationList && __props.associationList.length > 0
      }, __props.associationList && __props.associationList.length > 0 ? {
        y: common_vendor.p({
          type: "staff-filled",
          size: "18",
          color: "#C9A063"
        }),
        z: common_vendor.f(__props.associationList, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name || "未填写"),
            b: common_vendor.t(item.title || "未填写"),
            c: index < __props.associationList.length - 1
          }, index < __props.associationList.length - 1 ? {} : {}, {
            d: index
          });
        })
      } : {}, {
        A: __props.companyList && __props.companyList.length > 0
      }, __props.companyList && __props.companyList.length > 0 ? {
        B: common_vendor.p({
          type: "flag-filled",
          size: "18",
          color: "#F78C2F"
        }),
        C: common_vendor.f(__props.companyList, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name || "未填写"),
            b: common_vendor.t(item.position || "未填写"),
            c: common_vendor.t(item.industry || "未填写"),
            d: index < __props.companyList.length - 1
          }, index < __props.companyList.length - 1 ? {} : {}, {
            e: index
          });
        })
      } : {}, {
        D: __props.haveResources || __props.needResources
      }, __props.haveResources || __props.needResources ? common_vendor.e({
        E: __props.haveResources
      }, __props.haveResources ? {
        F: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#28a745"
        }),
        G: common_vendor.t(__props.haveResources)
      } : {}, {
        H: __props.needResources
      }, __props.needResources ? {
        I: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: "#007bff"
        }),
        J: common_vendor.t(__props.needResources)
      } : {}) : {}, {
        K: __props.signature || __props.personalBio
      }, __props.signature || __props.personalBio ? common_vendor.e({
        L: __props.signature
      }, __props.signature ? {
        M: common_vendor.t(__props.signature)
      } : {}, {
        N: __props.personalBio
      }, __props.personalBio ? {
        O: common_vendor.t(__props.personalBio)
      } : {}) : {}, {
        P: common_vendor.p({
          type: "pyq",
          size: "18",
          color: "#FF6A00"
        }),
        Q: common_vendor.o(($event) => _ctx.$emit("goToOpportunities")),
        R: __props.radarDatasets && __props.radarDatasets.length > 0
      }, __props.radarDatasets && __props.radarDatasets.length > 0 ? {
        S: common_vendor.p({
          type: "star-filled",
          size: "18",
          color: "#FF8500"
        }),
        T: common_vendor.t(__props.isViewingOwnCard ? "我的猩友评价" : "TA的猩友评价"),
        U: common_vendor.p({
          datasets: __props.radarDatasets,
          showCard: false,
          showTitle: false
        })
      } : {}, {
        V: __props.showUserQrCode
      }, __props.showUserQrCode ? {
        W: __props.userWeChatQrCodeUrl,
        X: common_vendor.o(($event) => previewImage(__props.userWeChatQrCodeUrl))
      } : {}, {
        Y: __props.shardCode
      }, __props.shardCode ? {
        Z: common_vendor.t(__props.shardCode),
        aa: common_vendor.p({
          type: "paperclip",
          size: "16",
          color: "#F78C2F"
        }),
        ab: common_vendor.o(copyShardCode)
      } : {}, {
        ac: __props.dynamicQrCodeUrl || __props.platformQrCodeUrl,
        ad: common_vendor.o(($event) => previewImage(__props.dynamicQrCodeUrl || __props.platformQrCodeUrl))
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0262bca8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MyCard.js.map
