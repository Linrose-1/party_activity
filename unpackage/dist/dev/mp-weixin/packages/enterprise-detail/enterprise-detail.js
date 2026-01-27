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
    const industryText = common_vendor.computed(() => {
      if (!ent.value)
        return "";
      return ent.value.industryFirst + (ent.value.industrySecond ? ` > ${ent.value.industrySecond}` : "");
    });
    const brandImageList = common_vendor.computed(() => {
      var _a;
      return ((_a = ent.value) == null ? void 0 : _a.brandImages) ? ent.value.brandImages.split(",").filter((i) => i) : [];
    });
    const onlineStores = common_vendor.computed(() => {
      var _a;
      if (!((_a = ent.value) == null ? void 0 : _a.onlineStores))
        return [];
      try {
        const data = typeof ent.value.onlineStores === "string" ? JSON.parse(ent.value.onlineStores) : ent.value.onlineStores;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    });
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
    const parsedTags = common_vendor.computed(() => {
      var _a;
      if (!((_a = ent.value) == null ? void 0 : _a.tags))
        return [];
      try {
        const data = typeof ent.value.tags === "string" ? JSON.parse(ent.value.tags) : ent.value.tags;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    });
    const maskedCreditCode = common_vendor.computed(() => {
      var _a;
      const code = (_a = ent.value) == null ? void 0 : _a.creditCode;
      if (!code)
        return "暂无数据";
      if (showFullCreditCode.value)
        return code;
      return code.substring(0, 8) + "******" + code.substring(code.length - 4);
    });
    const formatEstablishDate = common_vendor.computed(() => {
      var _a;
      const ts = (_a = ent.value) == null ? void 0 : _a.establishDate;
      if (!ts || ts === 0)
        return "待完善";
      const d = new Date(ts);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    });
    const toggleCreditCode = () => {
      showFullCreditCode.value = !showFullCreditCode.value;
    };
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
        url: `/packages/enterprise-card/enterprise-card?id=${ent.value.id}`
      });
    };
    const previewQrSingle = () => {
      if (!currentQrUrl.value)
        return;
      common_vendor.index.previewImage({
        urls: [currentQrUrl.value]
      });
    };
    const saveQrImage = () => {
      common_vendor.index.showLoading({
        title: "正在保存"
      });
      common_vendor.index.downloadFile({
        url: currentQrUrl.value,
        success: (res) => {
          common_vendor.index.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => common_vendor.index.showToast({
              title: "已保存至相册"
            }),
            fail: () => common_vendor.index.showToast({
              title: "保存失败",
              icon: "none"
            })
          });
        },
        complete: () => common_vendor.index.hideLoading()
      });
    };
    const openMap = (store) => {
      if (!store.lat || !store.lng)
        return common_vendor.index.showToast({
          title: "坐标缺失",
          icon: "none"
        });
      common_vendor.index.openLocation({
        latitude: Number(store.lat),
        longitude: Number(store.lng),
        name: store.name,
        address: store.address
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
        h: common_vendor.t(ent.value.enterpriseType || "暂无数据"),
        i: common_vendor.t(maskedCreditCode.value),
        j: common_vendor.p({
          type: showFullCreditCode.value ? "eye-slash" : "eye",
          size: "16",
          color: "#999"
        }),
        k: common_vendor.o(toggleCreditCode),
        l: common_vendor.t(ent.value.legalPerson || "暂无数据"),
        m: common_vendor.t(formatEstablishDate.value),
        n: common_vendor.t(ent.value.officePhone || "暂无数据"),
        o: common_vendor.o(($event) => makePhoneCall(ent.value.officePhone)),
        p: common_vendor.t(ent.value.officialEmail || "暂无数据"),
        q: common_vendor.t(ent.value.shortIntro || "暂无详细介绍"),
        r: ent.value.coreValue
      }, ent.value.coreValue ? {
        s: common_vendor.t(ent.value.coreValue)
      } : {}, {
        t: common_vendor.t(industryText.value),
        v: parsedTags.value.length
      }, parsedTags.value.length ? {
        w: common_vendor.f(parsedTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        x: ent.value.officialWebsite
      }, ent.value.officialWebsite ? {
        y: common_vendor.t(ent.value.officialWebsite),
        z: common_vendor.o(($event) => openStoreLink(ent.value.officialWebsite))
      } : {}, {
        A: ent.value.wechatMpName
      }, ent.value.wechatMpName ? {
        B: common_vendor.t(ent.value.wechatMpName),
        C: common_vendor.o(($event) => openQrPopup(ent.value.wechatMpQrcode, ent.value.wechatMpName))
      } : {}, {
        D: ent.value.videoAccount
      }, ent.value.videoAccount ? {
        E: common_vendor.t(ent.value.videoAccount),
        F: common_vendor.o(($event) => openQrPopup(ent.value.videoAccountQrcode, "官方视频号"))
      } : {}, {
        G: common_vendor.t(ent.value.customerServicePhone || "暂无数据"),
        H: common_vendor.o(($event) => makePhoneCall(ent.value.customerServicePhone)),
        I: common_vendor.t(ent.value.businessCooperation || "暂无数据"),
        J: common_vendor.t(ent.value.afterSaleEmail || "暂无数据"),
        K: onlineStores.value.length
      }, onlineStores.value.length ? common_vendor.e({
        L: common_vendor.t(onlineStores.value.length),
        M: common_vendor.f(onlineStores.value, (store, index, i0) => {
          return {
            a: common_vendor.t(getStoreIcon(store.platform)),
            b: common_vendor.t(store.name),
            c: common_vendor.t(store.platform),
            d: common_vendor.o(($event) => openStoreLink(store.link), index),
            e: index,
            f: index < 3 || showAllStores.value
          };
        }),
        N: onlineStores.value.length > 3
      }, onlineStores.value.length > 3 ? {
        O: common_vendor.t(showAllStores.value ? "收起全部" : "展开全部"),
        P: common_vendor.o(($event) => showAllStores.value = !showAllStores.value)
      } : {}) : {}, {
        Q: offlineStores.value.length
      }, offlineStores.value.length ? {
        R: common_vendor.t(offlineStores.value.length),
        S: common_vendor.f(offlineStores.value, (store, index, i0) => {
          return {
            a: "9f5eb755-1-" + i0,
            b: common_vendor.t(store.name),
            c: common_vendor.t(store.address),
            d: common_vendor.o(($event) => openMap(store), "off-" + index),
            e: "off-" + index
          };
        }),
        T: common_vendor.p({
          type: "location-filled",
          size: "24",
          color: "#FF8600"
        })
      } : {}, {
        U: common_vendor.f(brandImageList.value, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImage(index), index)
          };
        }),
        V: common_vendor.o(($event) => previewImage(0)),
        W: ent.value.videoUrl
      }, ent.value.videoUrl ? {
        X: ent.value.videoUrl
      } : {}, {
        Y: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: "#fff"
        }),
        Z: common_vendor.o(goToCard),
        aa: common_vendor.t(currentQrTitle.value),
        ab: currentQrUrl.value,
        ac: common_vendor.o(previewQrSingle),
        ad: common_vendor.o(saveQrImage),
        ae: common_vendor.o(closeQrPopup),
        af: common_vendor.sr(qrPopup, "9f5eb755-3", {
          "k": "qrPopup"
        }),
        ag: common_vendor.p({
          type: "center"
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9f5eb755"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-detail/enterprise-detail.js.map
