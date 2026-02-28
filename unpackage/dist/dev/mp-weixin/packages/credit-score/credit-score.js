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
  __name: "credit-score",
  setup(__props) {
    const rulesPopup = common_vendor.ref(null);
    const scoreData = common_vendor.ref({
      totalScore: 0,
      contributionScore: 0,
      pointScore: 0,
      interactionScore: 0,
      digitalIdentityScore: 0,
      basicInfoScore: 0,
      realNameAuthScore: 0,
      creditLevel: ""
    });
    const rules = [
      {
        name: "钻级猩友",
        icon: "💎",
        range: "900-1000"
      },
      {
        name: "金级猩友",
        icon: "🥇",
        range: "800-899"
      },
      {
        name: "银级猩友",
        icon: "🥈",
        range: "700-799"
      },
      {
        name: "铜级猩友",
        icon: "🥉",
        range: "600-699"
      },
      {
        name: "铁级猩友",
        icon: "🔘",
        range: "300-599"
      },
      {
        name: "普级猩友",
        icon: "⭐️",
        range: "<300"
      }
    ];
    const showRules = () => {
      rulesPopup.value.open();
    };
    const closeRules = () => {
      rulesPopup.value.close();
    };
    const getLevelIcon = (level) => {
      const rule = rules.find((r) => r.name === level);
      return rule ? rule.icon : "⭐";
    };
    const fetchCreditScore = async () => {
      common_vendor.index.showLoading({
        title: "计算中..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/credit-score", {
        method: "GET"
      });
      common_vendor.index.hideLoading();
      if (!error && data) {
        scoreData.value = data;
      }
    };
    common_vendor.onMounted(() => {
      fetchCreditScore();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(scoreData.value.totalScore || 0),
        b: common_vendor.o(showRules),
        c: common_vendor.t(getLevelIcon(scoreData.value.creditLevel)),
        d: common_vendor.t(scoreData.value.creditLevel || "待提升"),
        e: common_vendor.o(showRules),
        f: common_vendor.p({
          type: "medal-filled",
          size: "20",
          color: "#FF8300"
        }),
        g: common_vendor.t(scoreData.value.contributionScore),
        h: scoreData.value.contributionScore / 300 * 100 + "%",
        i: common_vendor.p({
          type: "vip-filled",
          size: "20",
          color: "#FF8300"
        }),
        j: common_vendor.t(scoreData.value.pointScore),
        k: scoreData.value.pointScore / 200 * 100 + "%",
        l: common_vendor.p({
          type: "chat-filled",
          size: "20",
          color: "#FF8300"
        }),
        m: common_vendor.t(scoreData.value.interactionScore),
        n: scoreData.value.interactionScore / 200 * 100 + "%",
        o: common_vendor.p({
          type: "person-filled",
          size: "20",
          color: "#FF8300"
        }),
        p: common_vendor.t(scoreData.value.digitalIdentityScore),
        q: scoreData.value.digitalIdentityScore / 100 * 100 + "%",
        r: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#FF8400"
        }),
        s: common_vendor.t(scoreData.value.basicInfoScore),
        t: scoreData.value.basicInfoScore / 150 * 100 + "%",
        v: common_vendor.p({
          type: "auth-filled",
          size: "20",
          color: "#FF8400"
        }),
        w: common_vendor.t(scoreData.value.realNameAuthScore),
        x: scoreData.value.realNameAuthScore / 50 * 100 + "%",
        y: common_vendor.f(rules, (rule, index, i0) => {
          return {
            a: common_vendor.t(rule.icon),
            b: common_vendor.t(rule.name),
            c: common_vendor.t(rule.range),
            d: index,
            e: scoreData.value.creditLevel === rule.name ? 1 : ""
          };
        }),
        z: common_vendor.o(closeRules),
        A: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        B: common_vendor.o(closeRules),
        C: common_vendor.sr(rulesPopup, "d495462d-6", {
          "k": "rulesPopup"
        }),
        D: common_vendor.p({
          type: "bottom",
          ["background-color"]: "transparent"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d495462d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/credit-score/credit-score.js.map
