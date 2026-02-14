"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "credit-score",
  setup(__props) {
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
        name: "钻石商友",
        icon: "💎",
        range: "900-1000"
      },
      {
        name: "金牌商友",
        icon: "🥇",
        range: "800-899"
      },
      {
        name: "银牌商友",
        icon: "🥈",
        range: "700-799"
      },
      {
        name: "铜牌商友",
        icon: "🥉",
        range: "600-699"
      },
      {
        name: "优质商友",
        icon: "⭐",
        range: "500-599"
      },
      {
        name: "待提升",
        icon: "⚠️",
        range: "<500"
      }
    ];
    const getLevelIcon = (level) => {
      const rule = rules.find((r) => r.name === level);
      return rule ? rule.icon : "⚠️";
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
        b: common_vendor.t(getLevelIcon(scoreData.value.creditLevel)),
        c: common_vendor.t(scoreData.value.creditLevel || "待提升"),
        d: common_vendor.p({
          type: "medal-filled",
          size: "20",
          color: "#FF8300"
        }),
        e: common_vendor.t(scoreData.value.contributionScore),
        f: scoreData.value.contributionScore / 300 * 100 + "%",
        g: common_vendor.p({
          type: "coin-filled",
          size: "20",
          color: "#FF8300"
        }),
        h: common_vendor.t(scoreData.value.pointScore),
        i: scoreData.value.pointScore / 200 * 100 + "%",
        j: common_vendor.p({
          type: "chat-filled",
          size: "20",
          color: "#FF8300"
        }),
        k: common_vendor.t(scoreData.value.interactionScore),
        l: scoreData.value.interactionScore / 200 * 100 + "%",
        m: common_vendor.p({
          type: "person-filled",
          size: "20",
          color: "#FF8300"
        }),
        n: common_vendor.t(scoreData.value.digitalIdentityScore),
        o: scoreData.value.digitalIdentityScore / 100 * 100 + "%",
        p: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#FF8400"
        }),
        q: common_vendor.t(scoreData.value.basicInfoScore),
        r: scoreData.value.basicInfoScore / 150 * 100 + "%",
        s: common_vendor.p({
          type: "auth-filled",
          size: "20",
          color: "#FF8400"
        }),
        t: common_vendor.t(scoreData.value.realNameAuthScore),
        v: scoreData.value.realNameAuthScore / 50 * 100 + "%",
        w: common_vendor.f(rules, (rule, index, i0) => {
          return {
            a: common_vendor.t(rule.icon),
            b: common_vendor.t(rule.name),
            c: common_vendor.t(rule.range),
            d: index,
            e: scoreData.value.creditLevel === rule.name ? 1 : ""
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d495462d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/credit-score/credit-score.js.map
