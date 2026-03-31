"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "FeatureRankingPopup",
  setup(__props, { expose: __expose }) {
    const popup = common_vendor.ref(null);
    const htmlContent = common_vendor.ref("");
    const open = async (isAuto = false) => {
      common_vendor.index.__f__("log", "at components/FeatureRankingPopup.vue:38", "组件 open 方法被调用, isAuto:", isAuto);
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/config/featureRanking", {
          method: "GET"
        });
        if (error) {
          common_vendor.index.__f__("warn", "at components/FeatureRankingPopup.vue:49", "后端返回错误，静默不弹窗:", error);
          return;
        }
        if (!data) {
          common_vendor.index.__f__("warn", "at components/FeatureRankingPopup.vue:54", "榜单内容为空");
          return;
        }
        htmlContent.value = data;
        if (popup.value) {
          popup.value.open();
          if (isAuto) {
            const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
            common_vendor.index.setStorageSync("last_seen_feature_ranking", today);
            common_vendor.index.__f__("log", "at components/FeatureRankingPopup.vue:68", "已记录今日已看状态");
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/FeatureRankingPopup.vue:72", "弹窗内部逻辑崩溃:", e);
      }
    };
    const close = () => {
      popup.value.close();
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(close),
        b: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#fff"
        }),
        c: htmlContent.value,
        d: common_vendor.o(close),
        e: common_vendor.sr(popup, "315692cf-0", {
          "k": "popup"
        }),
        f: common_vendor.p({
          type: "center",
          ["mask-click"]: true
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-315692cf"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/FeatureRankingPopup.js.map
