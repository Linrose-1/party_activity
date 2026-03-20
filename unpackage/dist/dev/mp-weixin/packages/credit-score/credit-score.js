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
    const dimensions = [
      {
        key: "contributionScore",
        label: "贡分权重",
        icon: "medal-filled",
        max: 300,
        url: "/packages/getPoints/getPoints",
        // 贡分页面，自行替换
        tip: "获取贡分"
      },
      {
        key: "pointScore",
        label: "智米权重",
        icon: "vip-filled",
        max: 200,
        url: "/packages/my-zhimi/my-zhimi",
        // 智米页面，自行替换
        tip: "获取智米"
      },
      {
        key: "interactionScore",
        label: "商友赞踩",
        icon: "chat-filled",
        max: 200,
        // url: '/packages/user-reviews/user-reviews', 
        url: null,
        tip: "查看说明",
        infoText: "该评分为商友赞踩统计映射"
        // ✨ 说明文字
      },
      {
        key: "digitalIdentityScore",
        label: "数字评价",
        icon: "person-filled",
        max: 100,
        url: "/packages/my-edit/my-edit?currentTab=1",
        tip: "前往评价"
      },
      {
        key: "basicInfoScore",
        label: "基础信息",
        icon: "info-filled",
        max: 150,
        url: "/packages/my-edit/my-edit",
        // 编辑资料页面，自行替换
        tip: "前往完善"
      },
      {
        key: "realNameAuthScore",
        label: "实名认证",
        icon: "auth-filled",
        max: 50,
        url: "/packages/my-auth/my-auth",
        // 实名认证页面，自行替换
        tip: "前往认证"
      }
    ];
    const activeTipKey = common_vendor.ref("");
    const handleDimensionClick = (dim) => {
      if (!dim.url && dim.infoText) {
        activeTipKey.value = activeTipKey.value === dim.key ? "" : dim.key;
      } else if (dim.url) {
        activeTipKey.value = "";
        common_vendor.index.navigateTo({
          url: dim.url
        });
      }
    };
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
          type: "hand-up-filled",
          size: "16",
          color: "#FF8300"
        }),
        g: common_vendor.f(dimensions, (dim, k0, i0) => {
          return common_vendor.e({
            a: "d495462d-1-" + i0,
            b: common_vendor.p({
              type: dim.icon,
              size: "20",
              color: "#FF8300"
            }),
            c: common_vendor.t(dim.label),
            d: common_vendor.t(scoreData.value[dim.key]),
            e: common_vendor.t(dim.max),
            f: common_vendor.t(dim.tip),
            g: "d495462d-2-" + i0,
            h: common_vendor.p({
              type: dim.infoText ? "info" : "right",
              size: "14",
              color: "#FF8300"
            }),
            i: scoreData.value[dim.key] / dim.max * 100 + "%",
            j: dim.infoText && activeTipKey.value === dim.key
          }, dim.infoText && activeTipKey.value === dim.key ? {
            k: "d495462d-3-" + i0,
            l: common_vendor.p({
              type: "info-filled",
              size: "14",
              color: "#FF8300"
            }),
            m: common_vendor.t(dim.infoText),
            n: common_vendor.o(() => {
            }, dim.key)
          } : {}, {
            o: dim.key,
            p: common_vendor.o(($event) => handleDimensionClick(dim), dim.key)
          });
        }),
        h: common_vendor.f(rules, (rule, index, i0) => {
          return {
            a: common_vendor.t(rule.icon),
            b: common_vendor.t(rule.name),
            c: common_vendor.t(rule.range),
            d: index,
            e: scoreData.value.creditLevel === rule.name ? 1 : ""
          };
        }),
        i: common_vendor.o(closeRules),
        j: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        k: common_vendor.o(closeRules),
        l: common_vendor.sr(rulesPopup, "d495462d-4", {
          "k": "rulesPopup"
        }),
        m: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#ffffff"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d495462d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/credit-score/credit-score.js.map
