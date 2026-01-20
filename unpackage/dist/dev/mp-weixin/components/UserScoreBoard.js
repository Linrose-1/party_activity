"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + MyRadarChart)();
}
const MyRadarChart = () => "./MyRadarChart.js";
const _sfc_main = {
  __name: "UserScoreBoard",
  props: {
    // 维度标签
    categories: {
      type: Array,
      default: () => ["基础信用", "协作态度", "专业能力", "精神格局"]
    },
    // 数据集 [{name, data, color}]
    datasets: {
      type: Array,
      default: () => []
    },
    // 最大分值
    maxVal: {
      type: Number,
      default: 10
    },
    // 是否显示外壳样式（背景、阴影、边距）
    showCard: {
      type: Boolean,
      default: true
    },
    // 是否显示组件内部的标题
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  setup(__props) {
    const props = __props;
    const getScoreValue = (datasetIndex, dimIndex) => {
      const ds = props.datasets[datasetIndex];
      if (ds && ds.data) {
        const val = ds.data[dimIndex];
        return val && val !== 0 ? val : "-";
      }
      return "-";
    };
    const getTotalValue = (datasetIndex) => {
      const ds = props.datasets[datasetIndex];
      if (ds && ds.data) {
        const sum = ds.data.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        return sum > 0 ? sum.toFixed(1).replace(/\.0$/, "") : "-";
      }
      return "-";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.datasets.length > 0
      }, __props.datasets.length > 0 ? common_vendor.e({
        b: __props.showTitle
      }, __props.showTitle ? {
        c: common_vendor.p({
          type: "data-filled",
          size: "16",
          color: "#1890FF"
        })
      } : {}, {
        d: common_vendor.p({
          categories: __props.categories,
          datasets: __props.datasets,
          maxVal: __props.maxVal
        }),
        e: common_vendor.p({
          type: "info-filled",
          size: "16",
          color: "#FF8C00"
        }),
        f: common_vendor.f(__props.categories, (dim, index, i0) => {
          return {
            a: common_vendor.t(dim),
            b: common_vendor.t(getScoreValue(0, index)),
            c: common_vendor.t(getScoreValue(1, index)),
            d: common_vendor.t(getScoreValue(2, index)),
            e: index
          };
        }),
        g: common_vendor.t(getTotalValue(0)),
        h: common_vendor.t(getTotalValue(1)),
        i: common_vendor.t(getTotalValue(2)),
        j: common_vendor.n(__props.showCard ? "chart-section" : "")
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ff62e0ca"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/UserScoreBoard.js.map
