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
        p: common_vendor.p({
          type: "phone-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        q: common_vendor.t(ent.value.customerServicePhone || "暂无"),
        r: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        s: common_vendor.o(($event) => makePhoneCall(ent.value.customerServicePhone)),
        t: common_vendor.p({
          type: "email-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        v: common_vendor.t(ent.value.officialEmail || "暂无"),
        w: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#ccc"
        }),
        x: common_vendor.o(($event) => copyText(ent.value.officialEmail, "邮箱已复制")),
        y: common_vendor.p({
          type: "auth-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        z: common_vendor.t(ent.value.businessCooperation || "暂无"),
        A: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#ccc"
        }),
        B: common_vendor.o(($event) => copyText(ent.value.businessCooperation, "内容已复制")),
        C: ent.value.officialWebsite
      }, ent.value.officialWebsite ? {
        D: common_vendor.p({
          type: "paperplane-filled",
          size: "20",
          color: ent.value.cardMainColor
        }),
        E: common_vendor.t(ent.value.officialWebsite),
        F: common_vendor.p({
          type: "link",
          size: "16",
          color: "#ccc"
        }),
        G: common_vendor.o(($event) => copyText(ent.value.officialWebsite, "链接已复制"))
      } : {}, {
        H: ent.value.wechatMpName
      }, ent.value.wechatMpName ? {
        I: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#fff"
        }),
        J: common_vendor.t(ent.value.wechatMpName),
        K: ent.value.cardMainColor,
        L: ent.value.cardMainColor,
        M: common_vendor.o(($event) => showQr(ent.value.wechatMpQrcode, ent.value.wechatMpName))
      } : {}, {
        N: ent.value.videoAccount
      }, ent.value.videoAccount ? {
        O: common_vendor.p({
          type: "videocam-filled",
          size: "30",
          color: "#fff"
        }),
        P: ent.value.cardMainColor,
        Q: ent.value.cardMainColor,
        R: common_vendor.o(($event) => showQr(ent.value.videoAccountQrcode, "官方视频号"))
      } : {}, {
        S: onlineStores.value.length
      }, onlineStores.value.length ? {
        T: common_vendor.f(onlineStores.value, (s, i, i0) => {
          return {
            a: common_vendor.t(s.platform),
            b: common_vendor.t(s.name),
            c: i,
            d: common_vendor.o(($event) => copyText(s.link, "链接已复制"), i)
          };
        })
      } : {}, {
        U: common_vendor.f(offlineStores.value, (addr, i, i0) => {
          return {
            a: "0bda02ee-11-" + i0,
            b: common_vendor.t(addr.name),
            c: common_vendor.t(addr.address),
            d: "0bda02ee-12-" + i0,
            e: "addr" + i,
            f: common_vendor.o(($event) => openMap(addr), "addr" + i)
          };
        }),
        V: common_vendor.p({
          type: "location-filled",
          size: "18",
          color: "#666"
        }),
        W: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        X: ent.value.videoUrl
      }, ent.value.videoUrl ? {
        Y: ent.value.videoUrl
      } : {}, {
        Z: brandImageList.value.length
      }, brandImageList.value.length ? {
        aa: common_vendor.f(brandImageList.value, (img, i, i0) => {
          return {
            a: i,
            b: img,
            c: common_vendor.o(($event) => previewImage(i), i)
          };
        })
      } : {}, {
        ab: common_vendor.p({
          type: "gear",
          size: "24",
          color: "#666"
        }),
        ac: common_vendor.o(openSettings),
        ad: common_vendor.p({
          type: "redo-filled",
          size: "20",
          color: "#fff"
        }),
        ae: ent.value.cardMainColor,
        af: common_vendor.t(currentQrTitle.value),
        ag: currentQrUrl.value,
        ah: common_vendor.o(previewQrSingle),
        ai: common_vendor.o(($event) => qrPopup.value.close()),
        aj: common_vendor.sr(qrPopup, "0bda02ee-15", {
          "k": "qrPopup"
        }),
        ak: common_vendor.p({
          type: "center"
        }),
        al: common_vendor.sr(settingsRef, "0bda02ee-16", {
          "k": "settingsRef"
        }),
        am: common_vendor.o(handleApplySettings),
        an: common_vendor.o(($event) => ent.value = $event),
        ao: common_vendor.p({
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
