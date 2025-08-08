"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MyRadarChart",
  props: {
    categories: { type: Array, required: true },
    seriesData: { type: Array, required: true },
    maxVal: { type: Number, default: 10 },
    themeColor: { type: String, default: "#FF7D00" }
  },
  setup(__props) {
    const props = __props;
    const canvasId = common_vendor.ref(`radar-chart-${Math.random().toString(36).substr(2)}`);
    const canvasWidth = common_vendor.ref(300);
    const canvasHeight = common_vendor.ref(300);
    const instance = common_vendor.getCurrentInstance();
    const drawChart = (ctx, width, height) => {
      if (!ctx)
        return;
      if (props.categories.length === 0 || props.seriesData.length === 0)
        return;
      const center = { x: width / 2, y: height / 2 };
      const radius = Math.min(width, height) / 2 * 0.55;
      const sides = props.categories.length;
      const angleStep = 2 * Math.PI / sides;
      ctx.clearRect(0, 0, width, height);
      for (let i = 4; i > 0; i--) {
        ctx.beginPath();
        const currentRadius = radius * (i / 4);
        for (let j = 0; j < sides; j++) {
          const x = center.x + currentRadius * Math.cos(angleStep * j - Math.PI / 2);
          const y = center.y + currentRadius * Math.sin(angleStep * j - Math.PI / 2);
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "#F7F7F7" : "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = "#EFEFEF";
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#666666";
      ctx.textBaseline = "middle";
      for (let i = 0; i < sides; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x, y);
        const cos = Math.cos(angle);
        if (Math.abs(cos) < 0.1) {
          ctx.textAlign = "center";
        } else if (cos > 0) {
          ctx.textAlign = "left";
        } else {
          ctx.textAlign = "right";
        }
        const textPadding = 10;
        const textX = center.x + (radius + textPadding) * Math.cos(angle);
        const textY = center.y + (radius + textPadding) * Math.sin(angle);
        ctx.fillText(props.categories[i], textX, textY);
      }
      ctx.strokeStyle = "#EFEFEF";
      ctx.stroke();
      ctx.beginPath();
      props.seriesData.forEach((value, i) => {
        const pointRadius = value / props.maxVal * radius;
        const x = center.x + pointRadius * Math.cos(angleStep * i - Math.PI / 2);
        const y = center.y + pointRadius * Math.sin(angleStep * i - Math.PI / 2);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = hexToRgba(props.themeColor, 0.2);
      ctx.fill();
      ctx.strokeStyle = props.themeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      props.seriesData.forEach((value, i) => {
        const pointRadius = value / props.maxVal * radius;
        const x = center.x + pointRadius * Math.cos(angleStep * i - Math.PI / 2);
        const y = center.y + pointRadius * Math.sin(angleStep * i - Math.PI / 2);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = props.themeColor;
        ctx.fill();
      });
    };
    const hexToRgba = (hex, opacity) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = bigint >> 16 & 255;
      const g = bigint >> 8 & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    let chartCtx = null;
    common_vendor.onMounted(() => {
      const query = common_vendor.index.createSelectorQuery().in(instance);
      query.select(`#${canvasId.value}`).fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          common_vendor.index.__f__("error", "at components/MyRadarChart.vue:140", "无法获取Canvas节点");
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = common_vendor.index.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        canvasWidth.value = res[0].width;
        canvasHeight.value = res[0].height;
        chartCtx = ctx;
        drawChart(chartCtx, canvasWidth.value, canvasHeight.value);
      });
    });
    common_vendor.watch(() => props.seriesData, () => {
      if (chartCtx) {
        drawChart(chartCtx, canvasWidth.value, canvasHeight.value);
      }
    }, { deep: true });
    return (_ctx, _cache) => {
      return {
        a: canvasWidth.value + "px",
        b: canvasHeight.value + "px",
        c: canvasId.value,
        d: canvasId.value
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8df059ca"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MyRadarChart.js.map
