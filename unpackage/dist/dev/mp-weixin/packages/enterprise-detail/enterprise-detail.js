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
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "enterprise-detail",
  setup(__props) {
    const ent = common_vendor.ref(null);
    const showFullCreditCode = common_vendor.ref(false);
    const showAllStores = common_vendor.ref(false);
    const currentQrUrl = common_vendor.ref("");
    const currentQrTitle = common_vendor.ref("");
    const qrPopup = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.id) {
        fetchEnterpriseDetail(options.id);
      }
    });
    const fetchEnterpriseDetail = async (id) => {
      common_vendor.index.showLoading({
        title: "加载中"
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-enterprise-info/get", {
        method: "GET",
        data: {
          id
        }
      });
      common_vendor.index.hideLoading();
      if (!error) {
        ent.value = data;
      }
    };
    const brandImageList = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.brandImages) ? ent.value.brandImages.split(",") : [];
    });
    const onlineStores = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.onlineStores) ? JSON.parse(ent.value.onlineStores) : [];
    });
    const parsedTags = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.tags) ? JSON.parse(ent.value.tags) : [];
    });
    const maskCreditCode = (code, showFull) => {
      if (!code)
        return "";
      if (showFull)
        return code;
      return code.substring(0, 8) + "******" + code.substring(code.length - 4);
    };
    const formatDate = (ts) => {
      if (!ts || ts === 0)
        return "待完善";
      const d = new Date(ts);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };
    const makePhoneCall = (num) => {
      if (!num)
        return;
      common_vendor.index.makePhoneCall({
        phoneNumber: num
      });
    };
    const getStoreIcon = (platform) => {
      const map = {
        "美团": "🟡",
        "大众点评": "🔴",
        "饿了么": "🔵"
      };
      return map[platform] || "🏪";
    };
    const openQrPopup = (url, title) => {
      if (!url)
        return common_vendor.index.showToast({
          title: "暂无二维码",
          icon: "none"
        });
      currentQrUrl.value = url;
      currentQrTitle.value = title;
      qrPopup.value.open();
    };
    const closeQrPopup = () => qrPopup.value.close();
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: brandImageList.value,
        current: index
      });
    };
    const openStoreLink = (link) => {
      if (!link)
        return;
      common_vendor.index.setClipboardData({
        data: link,
        success: () => common_vendor.index.showToast({
          title: "链接已复制，请在浏览器打开"
        })
      });
    };
    const goToCard = () => {
      common_vendor.index.navigateTo({
        url: `/pages/enterprise/card?id=${ent.value.id}`
      });
    };
    const saveQrImage = () => {
      common_vendor.index.downloadFile({
        url: currentQrUrl.value,
        success: (res) => {
          common_vendor.index.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => common_vendor.index.showToast({
              title: "已保存至相册"
            })
          });
        }
      });
    };
    const offlineStores = common_vendor.computed(() => {
      var _a;
      if (!((_a = ent.value) == null ? void 0 : _a.offlineStores))
        return [];
      try {
        const data = typeof ent.value.offlineStores === "string" ? JSON.parse(ent.value.offlineStores) : ent.value.offlineStores;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    });
    const openMap = (store) => {
      if (!store.lat || !store.lng) {
        return common_vendor.index.showToast({
          title: "暂无位置坐标",
          icon: "none"
        });
      }
      common_vendor.index.openLocation({
        latitude: Number(store.lat),
        longitude: Number(store.lng),
        name: store.name,
        address: store.address,
        success: () => {
          common_vendor.index.__f__("log", "at packages/enterprise-detail/enterprise-detail.vue:351", "成功调起地图导航");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at packages/enterprise-detail/enterprise-detail.vue:354", "打开地图失败", err);
          common_vendor.index.showToast({
            title: "无法打开地图",
            icon: "none"
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: ent.value
      }, ent.value ? common_vendor.e({
        b: ent.value.backgroundUrl
      }, ent.value.backgroundUrl ? {
        c: ent.value.backgroundUrl
      } : {}, {
        d: ent.value.logoUrl,
        e: common_vendor.t(ent.value.enterpriseName),
        f: ent.value.brandSlogan
      }, ent.value.brandSlogan ? {
        g: common_vendor.t(ent.value.brandSlogan)
      } : {}, {
        h: common_vendor.o(($event) => _ctx.toggleSection("basic")),
        i: common_vendor.t(ent.value.enterpriseType || "暂无数据"),
        j: common_vendor.t(maskCreditCode(ent.value.creditCode, showFullCreditCode.value)),
        k: common_vendor.p({
          type: showFullCreditCode.value ? "eye-slash" : "eye",
          size: "16",
          color: "#999"
        }),
        l: common_vendor.o(($event) => showFullCreditCode.value = !showFullCreditCode.value),
        m: common_vendor.t(ent.value.legalPerson || "暂无数据"),
        n: common_vendor.t(formatDate(ent.value.establishDate)),
        o: common_vendor.t(ent.value.officePhone || "暂无数据"),
        p: common_vendor.o(($event) => makePhoneCall(ent.value.officePhone)),
        q: common_vendor.t(ent.value.officialEmail || "暂无数据"),
        r: common_vendor.t(ent.value.shortIntro || "暂无简短介绍"),
        s: ent.value.coreValue
      }, ent.value.coreValue ? {
        t: common_vendor.t(ent.value.coreValue)
      } : {}, {
        v: common_vendor.t(ent.value.industryFirst),
        w: common_vendor.t(ent.value.industrySecond ? " > " + ent.value.industrySecond : ""),
        x: parsedTags.value.length
      }, parsedTags.value.length ? {
        y: common_vendor.f(parsedTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        z: ent.value.officialWebsite
      }, ent.value.officialWebsite ? {
        A: common_vendor.t(ent.value.officialWebsite)
      } : {}, {
        B: ent.value.wechatMpName
      }, ent.value.wechatMpName ? {
        C: common_vendor.t(ent.value.wechatMpName),
        D: common_vendor.t(ent.value.wechatMpId),
        E: common_vendor.o(($event) => openQrPopup(ent.value.wechatMpQrcode, ent.value.wechatMpName))
      } : {}, {
        F: ent.value.videoAccount
      }, ent.value.videoAccount ? {
        G: common_vendor.t(ent.value.videoAccount),
        H: common_vendor.o(($event) => openQrPopup(ent.value.videoAccountQrcode, "视频号"))
      } : {}, {
        I: common_vendor.t(ent.value.customerServicePhone),
        J: common_vendor.o(($event) => makePhoneCall(ent.value.customerServicePhone)),
        K: common_vendor.t(ent.value.businessCooperation),
        L: common_vendor.t(ent.value.afterSaleEmail),
        M: onlineStores.value.length
      }, onlineStores.value.length ? common_vendor.e({
        N: common_vendor.t(onlineStores.value.length),
        O: common_vendor.f(onlineStores.value, (store, index, i0) => {
          return {
            a: common_vendor.t(getStoreIcon(store.platform)),
            b: common_vendor.t(store.name),
            c: common_vendor.t(store.platform),
            d: common_vendor.o(($event) => openStoreLink(store.link), index),
            e: index,
            f: index < 3 || showAllStores.value
          };
        }),
        P: onlineStores.value.length > 3
      }, onlineStores.value.length > 3 ? {
        Q: common_vendor.t(showAllStores.value ? "收起全部" : "展开全部"),
        R: common_vendor.o(($event) => showAllStores.value = !showAllStores.value)
      } : {}) : {}, {
        S: offlineStores.value.length
      }, offlineStores.value.length ? {
        T: common_vendor.t(offlineStores.value.length),
        U: common_vendor.f(offlineStores.value, (store, index, i0) => {
          return {
            a: "9f5eb755-1-" + i0,
            b: common_vendor.t(store.name),
            c: common_vendor.t(store.address),
            d: common_vendor.o(($event) => openMap(store), "off-" + index),
            e: "off-" + index
          };
        }),
        V: common_vendor.p({
          type: "location-filled",
          size: "24",
          color: "#FF8600"
        })
      } : {}, {
        W: common_vendor.f(brandImageList.value, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImage(index), index)
          };
        }),
        X: common_vendor.o(($event) => previewImage(0)),
        Y: ent.value.videoUrl
      }, ent.value.videoUrl ? {
        Z: ent.value.videoUrl
      } : {}, {
        aa: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: "#fff"
        }),
        ab: common_vendor.o(goToCard),
        ac: common_vendor.t(currentQrTitle.value),
        ad: currentQrUrl.value,
        ae: common_vendor.o(saveQrImage),
        af: common_vendor.o(closeQrPopup),
        ag: common_vendor.sr(qrPopup, "9f5eb755-3", {
          "k": "qrPopup"
        }),
        ah: common_vendor.p({
          type: "center"
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9f5eb755"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-detail/enterprise-detail.js.map
