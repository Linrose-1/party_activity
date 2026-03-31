"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup + CardSettings)();
}
const CardSettings = () => "../../components/CardSettings.js";
const _sfc_main = {
  __name: "enterprise-card",
  setup(__props) {
    const ent = common_vendor.ref(null);
    const settingsRef = common_vendor.ref(null);
    const qrPopup = common_vendor.ref(null);
    const currentQrUrl = common_vendor.ref("");
    const currentQrTitle = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      if (options.id)
        fetchDetail(options.id);
    });
    const fetchDetail = async (id) => {
      const {
        data
      } = await utils_request.request("/app-api/member/user-enterprise-info/get", {
        method: "GET",
        data: {
          id
        }
      });
      if (data)
        ent.value = data;
    };
    const brandImageList = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.brandImages) ? ent.value.brandImages.split(",").filter((i) => i) : [];
    });
    const onlineStores = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.onlineStores) ? JSON.parse(ent.value.onlineStores) : [];
    });
    const offlineStores = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.offlineStores) ? JSON.parse(ent.value.offlineStores) : [];
    });
    common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.tags) ? JSON.parse(ent.value.tags) : [];
    });
    const makePhoneCall = (num) => {
      if (!num)
        return common_vendor.index.showToast({
          title: "暂无电话信息",
          icon: "none"
        });
      common_vendor.index.makePhoneCall({
        phoneNumber: num
      });
    };
    const copyText = (text, msg) => {
      if (!text)
        return;
      common_vendor.index.setClipboardData({
        data: text,
        success: () => common_vendor.index.showToast({
          title: msg
        })
      });
    };
    const openSettings = () => settingsRef.value.open();
    const previewImage = (index) => common_vendor.index.previewImage({
      urls: brandImageList.value,
      current: index
    });
    const showQr = (url, title) => {
      if (!url)
        return common_vendor.index.showToast({
          title: "未上传二维码",
          icon: "none"
        });
      currentQrUrl.value = url;
      currentQrTitle.value = title;
      qrPopup.value.open();
    };
    const previewQrSingle = () => {
      if (!currentQrUrl.value)
        return;
      common_vendor.index.previewImage({
        urls: [currentQrUrl.value],
        current: 0
      });
    };
    const openMap = (item) => {
      if (!item.lat || !item.lng)
        return common_vendor.index.showToast({
          title: "坐标信息缺失",
          icon: "none"
        });
      common_vendor.index.openLocation({
        latitude: Number(item.lat),
        longitude: Number(item.lng),
        name: item.name,
        address: item.address
      });
    };
    const handleApplySettings = async (newConfig) => {
      common_vendor.index.showLoading({
        title: "正在同步配置..."
      });
      const payload = {
        id: ent.value.id,
        userId: ent.value.userId,
        cardMainColor: newConfig.cardMainColor,
        cardLogoStyle: newConfig.cardLogoStyle,
        // 强制转换为 Boolean，确保后端接收正确
        cardShowContact: !!newConfig.cardShowContact,
        cardShowSocial: !!newConfig.cardShowSocial,
        cardShowOnlineStore: !!newConfig.cardShowOnlineStore,
        cardShowSlogan: !!newConfig.cardShowSlogan,
        cardShowDetailAddress: !!newConfig.cardShowDetailAddress,
        cardShowEstablishDate: !!newConfig.cardShowEstablishDate
      };
      const {
        error
      } = await utils_request.request("/app-api/member/user-enterprise-info/update-card", {
        method: "PUT",
        data: payload
      });
      common_vendor.index.hideLoading();
      if (!error) {
        ent.value = {
          ...ent.value,
          ...payload
        };
        common_vendor.index.showToast({
          title: "名片定制已生效",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: "保存失败: " + error,
          icon: "none"
        });
      }
    };
    common_vendor.onShareAppMessage(() => ({
      title: `您好！这是${ent.value.enterpriseName}的官方名片`,
      path: `/packages/enterprise-card/enterprise-card?id=${ent.value.id}`,
      imageUrl: ent.value.logoUrl
    }));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: ent.value
      }, ent.value ? common_vendor.e({
        b: ent.value.backgroundUrl || "/static/images/default-bg.jpg",
        c: ent.value.enterpriseLogo || ent.value.logoUrl,
        d: common_vendor.n("logo-style-" + ent.value.cardLogoStyle),
        e: common_vendor.t(ent.value.enterpriseName),
        f: ent.value.cardShowSlogan
      }, ent.value.cardShowSlogan ? {
        g: common_vendor.t(ent.value.brandSlogan || "追求卓越，创造价值")
      } : {}, {
        h: common_vendor.t(ent.value.industryFirst),
        i: ent.value.enterpriseType
      }, ent.value.enterpriseType ? {
        j: common_vendor.t(ent.value.enterpriseType)
      } : {}, {
        k: ent.value.cardMainColor,
        l: ent.value.logoUrl,
        m: common_vendor.t(ent.value.brandName || "未设置品牌名"),
        n: common_vendor.t(ent.value.shortIntro || "暂无详细介绍"),
        o: ent.value.coreValue
      }, ent.value.coreValue ? {
        p: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: ent.value.cardMainColor
        }),
        q: common_vendor.t(ent.value.coreValue)
      } : {}, {
        r: ent.value.cardShowContact
      }, ent.value.cardShowContact ? common_vendor.e({
        s: common_vendor.p({
          type: "phone-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        t: common_vendor.t(ent.value.customerServicePhone || "暂无"),
        v: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        w: common_vendor.o(($event) => makePhoneCall(ent.value.customerServicePhone)),
        x: common_vendor.p({
          type: "email-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        y: common_vendor.t(ent.value.officialEmail || "暂无"),
        z: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#ccc"
        }),
        A: common_vendor.o(($event) => copyText(ent.value.officialEmail, "邮箱已复制")),
        B: common_vendor.p({
          type: "auth-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        C: common_vendor.t(ent.value.businessCooperation || "暂无"),
        D: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#ccc"
        }),
        E: common_vendor.o(($event) => copyText(ent.value.businessCooperation, "内容已复制")),
        F: ent.value.officialWebsite
      }, ent.value.officialWebsite ? {
        G: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        H: common_vendor.t(ent.value.officialWebsite),
        I: common_vendor.p({
          type: "link",
          size: "16",
          color: "#ccc"
        }),
        J: common_vendor.o(($event) => copyText(ent.value.officialWebsite, "链接已复制"))
      } : {}) : {}, {
        K: ent.value.cardShowSocial
      }, ent.value.cardShowSocial ? common_vendor.e({
        L: ent.value.wechatMpName
      }, ent.value.wechatMpName ? {
        M: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#fff"
        }),
        N: common_vendor.t(ent.value.wechatMpName),
        O: ent.value.cardMainColor,
        P: ent.value.cardMainColor,
        Q: common_vendor.o(($event) => showQr(ent.value.wechatMpQrcode, ent.value.wechatMpName))
      } : {}, {
        R: ent.value.videoAccount
      }, ent.value.videoAccount ? {
        S: common_vendor.p({
          type: "videocam-filled",
          size: "30",
          color: "#fff"
        }),
        T: ent.value.cardMainColor,
        U: ent.value.cardMainColor,
        V: common_vendor.o(($event) => showQr(ent.value.videoAccountQrcode, "官方视频号"))
      } : {}) : {}, {
        W: ent.value.cardShowOnlineStore
      }, ent.value.cardShowOnlineStore ? common_vendor.e({
        X: onlineStores.value.length
      }, onlineStores.value.length ? {
        Y: common_vendor.f(onlineStores.value, (s, i, i0) => {
          return {
            a: common_vendor.t(s.platform),
            b: common_vendor.t(s.name),
            c: i,
            d: common_vendor.o(($event) => copyText(s.link, "链接已复制"), i)
          };
        })
      } : {}, {
        Z: common_vendor.f(offlineStores.value, (addr, i, i0) => {
          return {
            a: "0bda02ee-11-" + i0,
            b: common_vendor.t(addr.name),
            c: common_vendor.t(addr.address),
            d: "0bda02ee-12-" + i0,
            e: "addr" + i,
            f: common_vendor.o(($event) => openMap(addr), "addr" + i)
          };
        }),
        aa: common_vendor.p({
          type: "location-filled",
          size: "18",
          color: "#666"
        }),
        ab: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        })
      }) : {}, {
        ac: ent.value.videoUrl
      }, ent.value.videoUrl ? {
        ad: ent.value.videoUrl
      } : {}, {
        ae: brandImageList.value.length
      }, brandImageList.value.length ? {
        af: common_vendor.f(brandImageList.value, (img, i, i0) => {
          return {
            a: i,
            b: img,
            c: common_vendor.o(($event) => previewImage(i), i)
          };
        })
      } : {}, {
        ag: common_vendor.p({
          type: "gear",
          size: "24",
          color: "#666"
        }),
        ah: common_vendor.o(openSettings),
        ai: common_vendor.p({
          type: "redo-filled",
          size: "20",
          color: "#fff"
        }),
        aj: ent.value.cardMainColor,
        ak: common_vendor.t(currentQrTitle.value),
        al: currentQrUrl.value,
        am: common_vendor.o(previewQrSingle),
        an: common_vendor.o(($event) => qrPopup.value.close()),
        ao: common_vendor.sr(qrPopup, "0bda02ee-15", {
          "k": "qrPopup"
        }),
        ap: common_vendor.p({
          type: "center"
        }),
        aq: common_vendor.sr(settingsRef, "0bda02ee-16", {
          "k": "settingsRef"
        }),
        ar: common_vendor.o(handleApplySettings),
        as: common_vendor.o(($event) => ent.value = $event),
        at: common_vendor.p({
          modelValue: ent.value
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0bda02ee"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-card/enterprise-card.js.map
