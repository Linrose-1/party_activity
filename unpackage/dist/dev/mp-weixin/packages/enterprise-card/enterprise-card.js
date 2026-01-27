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
        title: "保存中"
      });
      const {
        error
      } = await utils_request.request("/app-api/member/user-enterprise-info/update-card", {
        method: "PUT",
        data: {
          id: ent.value.id,
          userId: ent.value.userId,
          ...newConfig
        }
      });
      common_vendor.index.hideLoading();
      if (!error) {
        ent.value = {
          ...ent.value,
          ...newConfig
        };
        common_vendor.index.showToast({
          title: "设置成功"
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
        c: ent.value.logoUrl,
        d: common_vendor.n("logo-style-" + ent.value.cardLogoStyle),
        e: common_vendor.t(ent.value.enterpriseName),
        f: ent.value.cardShowSlogan === 1
      }, ent.value.cardShowSlogan === 1 ? {
        g: common_vendor.t(ent.value.brandSlogan || "追求卓越，创造价值")
      } : {}, {
        h: common_vendor.t(ent.value.industryFirst),
        i: ent.value.enterpriseType
      }, ent.value.enterpriseType ? {
        j: common_vendor.t(ent.value.enterpriseType)
      } : {}, {
        k: ent.value.cardMainColor,
        l: common_vendor.t(ent.value.shortIntro || "暂无详细介绍"),
        m: ent.value.coreValue
      }, ent.value.coreValue ? {
        n: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: ent.value.cardMainColor
        }),
        o: common_vendor.t(ent.value.coreValue)
      } : {}, {
        p: ent.value.cardShowContact === 1
      }, ent.value.cardShowContact === 1 ? common_vendor.e({
        q: common_vendor.p({
          type: "phone-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        r: common_vendor.t(ent.value.customerServicePhone || "暂无"),
        s: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        t: common_vendor.o(($event) => makePhoneCall(ent.value.customerServicePhone)),
        v: common_vendor.p({
          type: "email-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        w: common_vendor.t(ent.value.officialEmail || "暂无"),
        x: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#ccc"
        }),
        y: common_vendor.o(($event) => copyText(ent.value.officialEmail, "邮箱已复制")),
        z: common_vendor.p({
          type: "auth-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        A: common_vendor.t(ent.value.businessCooperation || "暂无"),
        B: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#ccc"
        }),
        C: common_vendor.o(($event) => copyText(ent.value.businessCooperation, "内容已复制")),
        D: ent.value.officialWebsite
      }, ent.value.officialWebsite ? {
        E: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        F: common_vendor.t(ent.value.officialWebsite),
        G: common_vendor.p({
          type: "link",
          size: "16",
          color: "#ccc"
        }),
        H: common_vendor.o(($event) => copyText(ent.value.officialWebsite, "链接已复制"))
      } : {}) : {}, {
        I: ent.value.cardShowSocial === 1 && (ent.value.wechatMpName || ent.value.videoAccount)
      }, ent.value.cardShowSocial === 1 && (ent.value.wechatMpName || ent.value.videoAccount) ? common_vendor.e({
        J: ent.value.wechatMpName
      }, ent.value.wechatMpName ? {
        K: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#fff"
        }),
        L: common_vendor.t(ent.value.wechatMpName),
        M: ent.value.cardMainColor,
        N: ent.value.cardMainColor,
        O: common_vendor.o(($event) => showQr(ent.value.wechatMpQrcode, ent.value.wechatMpName))
      } : {}, {
        P: ent.value.videoAccount
      }, ent.value.videoAccount ? {
        Q: common_vendor.p({
          type: "videocam-filled",
          size: "30",
          color: "#fff"
        }),
        R: ent.value.cardMainColor,
        S: ent.value.cardMainColor,
        T: common_vendor.o(($event) => showQr(ent.value.videoAccountQrcode, "官方视频号"))
      } : {}) : {}, {
        U: ent.value.cardShowOnlineStore === 1 && (onlineStores.value.length || offlineStores.value.length)
      }, ent.value.cardShowOnlineStore === 1 && (onlineStores.value.length || offlineStores.value.length) ? common_vendor.e({
        V: onlineStores.value.length
      }, onlineStores.value.length ? {
        W: common_vendor.f(onlineStores.value, (s, i, i0) => {
          return {
            a: common_vendor.t(s.platform),
            b: common_vendor.t(s.name),
            c: i,
            d: common_vendor.o(($event) => copyText(s.link, "链接已复制"), i)
          };
        })
      } : {}, {
        X: common_vendor.f(offlineStores.value, (addr, i, i0) => {
          return {
            a: "0bda02ee-11-" + i0,
            b: common_vendor.t(addr.name),
            c: common_vendor.t(addr.address),
            d: "0bda02ee-12-" + i0,
            e: "addr" + i,
            f: common_vendor.o(($event) => openMap(addr), "addr" + i)
          };
        }),
        Y: common_vendor.p({
          type: "location-filled",
          size: "18",
          color: "#666"
        }),
        Z: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        })
      }) : {}, {
        aa: ent.value.videoUrl
      }, ent.value.videoUrl ? {
        ab: ent.value.videoUrl
      } : {}, {
        ac: brandImageList.value.length
      }, brandImageList.value.length ? {
        ad: common_vendor.f(brandImageList.value, (img, i, i0) => {
          return {
            a: i,
            b: img,
            c: common_vendor.o(($event) => previewImage(i), i)
          };
        })
      } : {}, {
        ae: common_vendor.p({
          type: "gear",
          size: "24",
          color: "#666"
        }),
        af: common_vendor.o(openSettings),
        ag: common_vendor.p({
          type: "redo-filled",
          size: "20",
          color: "#fff"
        }),
        ah: ent.value.cardMainColor,
        ai: common_vendor.t(currentQrTitle.value),
        aj: currentQrUrl.value,
        ak: common_vendor.o(previewQrSingle),
        al: common_vendor.o(($event) => qrPopup.value.close()),
        am: common_vendor.sr(qrPopup, "0bda02ee-15", {
          "k": "qrPopup"
        }),
        an: common_vendor.p({
          type: "center"
        }),
        ao: common_vendor.sr(settingsRef, "0bda02ee-16", {
          "k": "settingsRef"
        }),
        ap: common_vendor.o(handleApplySettings),
        aq: common_vendor.o(($event) => ent.value = $event),
        ar: common_vendor.p({
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
