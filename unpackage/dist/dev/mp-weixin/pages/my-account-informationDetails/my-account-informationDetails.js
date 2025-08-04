"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_qiun_data_charts2 = common_vendor.resolveComponent("qiun-data-charts");
  (_easycom_uni_icons2 + _easycom_qiun_data_charts2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_qiun_data_charts = () => "../../uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_qiun_data_charts)();
}
const themeColor = "#FF7800";
const _sfc_main = {
  __name: "my-account-informationDetails",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const chartData = common_vendor.ref({});
    const chartOptions = common_vendor.reactive({
      color: [themeColor],
      padding: [5, 5, 5, 5],
      legend: { show: false },
      extra: {
        radar: {
          max: 10,
          labelColor: "#666666",
          gridColor: "#e6e6e6",
          border: true
        }
      }
    });
    const canRenderChart = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.user) {
        try {
          const userData = JSON.parse(decodeURIComponent(options.user));
          userInfo.value = userData;
          common_vendor.index.setNavigationBarTitle({
            title: `${userData.nickname || "用户"}的详情`
          });
          if (userData.id) {
            fetchScoreStatistics(userData.id);
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/my-account-informationDetails/my-account-informationDetails.vue:157", "解析用户信息失败", e);
          common_vendor.index.showToast({ title: "加载用户信息失败", icon: "none" });
        }
      } else {
        common_vendor.index.showToast({ title: "缺少用户信息", icon: "none", duration: 2e3 });
        setTimeout(() => common_vendor.index.navigateBack(), 2e3);
      }
    });
    const fetchScoreStatistics = async (userId) => {
      const { data, error } = await utils_request.request("/app-api/member/user-scores/complexStatistics", {
        method: "GET",
        data: { userId, type: 0 }
      });
      const defaultScores = { avg1: 0, avg2: 0, avg3: 0, avg4: 0 };
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-account-informationDetails/my-account-informationDetails.vue:176", "获取评分统计失败:", error);
        drawChart(defaultScores);
        return;
      }
      drawChart(data || defaultScores);
    };
    const drawChart = (scores) => {
      chartData.value = {
        categories: ["基础信用", "协助态度", "专业能力", "精神格局"],
        series: [{
          name: "自我评价",
          data: [
            scores.avg1 || 0,
            scores.avg2 || 0,
            scores.avg3 || 0,
            scores.avg4 || 0
          ]
        }]
      };
      common_vendor.nextTick$1(() => {
        canRenderChart.value = true;
      });
    };
    const formatSex = (sex) => {
      if (sex === 1)
        return "男";
      if (sex === 2)
        return "女";
      return "未设置";
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({ urls: [url] });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "person-filled",
          size: "24",
          color: themeColor
        }),
        c: userInfo.value.avatar || "/static/default-avatar.png",
        d: common_vendor.t(userInfo.value.nickname || "未填写"),
        e: common_vendor.t(userInfo.value.realName || "未填写"),
        f: common_vendor.t(formatSex(userInfo.value.sex)),
        g: common_vendor.t(userInfo.value.birthday || "未填写"),
        h: common_vendor.t(userInfo.value.areaName || "未填写"),
        i: common_vendor.t(userInfo.value.residenceName || "未填写"),
        j: common_vendor.t(userInfo.value.nativePlace || "未填写"),
        k: common_vendor.p({
          type: "flag-filled",
          size: "24",
          color: themeColor
        }),
        l: common_vendor.t(userInfo.value.industryName || "未填写"),
        m: common_vendor.t(userInfo.value.professionalTitle || "未填写"),
        n: common_vendor.t(userInfo.value.companyName || "未填写"),
        o: common_vendor.t(userInfo.value.school || "未填写"),
        p: common_vendor.t(userInfo.value.contactEmail || "未填写"),
        q: common_vendor.t(userInfo.value.hobby || "未填写"),
        r: common_vendor.t(userInfo.value.personalBio || "这位朋友很酷，什么也没留下。"),
        s: userInfo.value.wechatQrCodeUrl
      }, userInfo.value.wechatQrCodeUrl ? {
        t: userInfo.value.wechatQrCodeUrl,
        v: common_vendor.o(($event) => previewImage(userInfo.value.wechatQrCodeUrl))
      } : {}, {
        w: common_vendor.p({
          type: "map-filled",
          size: "24",
          color: themeColor
        }),
        x: canRenderChart.value
      }, canRenderChart.value ? {
        y: common_vendor.p({
          type: "radar",
          opts: chartOptions,
          ["chart-data"]: chartData.value,
          ["canvas-id"]: "userRadarChart",
          canvas2d: true
        })
      } : {}, {
        z: canRenderChart.value
      }, canRenderChart.value ? {
        A: common_vendor.f(chartData.value.categories, (item, index, i0) => {
          return {
            a: chartOptions.color[index] || "#999",
            b: common_vendor.t(item),
            c: common_vendor.t(chartData.value.series[0].data[index]),
            d: index
          };
        })
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-11b8a53c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-account-informationDetails/my-account-informationDetails.js.map
