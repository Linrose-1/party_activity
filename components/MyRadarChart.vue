<!-- components/MyRadarChart.vue -->
<template>
	<view class="chart-container">
		<!-- 【核心修正1】: 添加 type="2d" 来启用新的 Canvas 2D 接口 -->
		<canvas 
			type="2d"
			:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
			:canvas-id="canvasId"
			:id="canvasId">
		</canvas>
	</view>
</template>

<script setup>
// 【核心修正2】: 导入 getCurrentInstance
import { ref, onMounted, watch, getCurrentInstance } from 'vue';

const props = defineProps({
	categories: { type: Array, required: true },
	seriesData: { type: Array, required: true },
	maxVal: { type: Number, default: 10 },
	themeColor: { type: String, default: '#FF7D00' },
});

// 使用随机字符串确保 canvas-id 在页面上是唯一的
const canvasId = ref(`radar-chart-${Math.random().toString(36).substr(2)}`);
const canvasWidth = ref(300);
const canvasHeight = ref(300);

// 【核心修正3】: 获取当前组件实例
const instance = getCurrentInstance();

// 核心绘制函数
const drawChart = (ctx, width, height) => {
	if (!ctx) return;
	if (props.categories.length === 0 || props.seriesData.length === 0) return;

	const center = { x: width / 2, y: height / 2 };
	// 使用您觉得合适的半径，0.65 是个不错的选择
	const radius = Math.min(width, height) / 2 * 0.55; 
	const sides = props.categories.length;
	const angleStep = (2 * Math.PI) / sides;

	// 1. 清空画布
	ctx.clearRect(0, 0, width, height);

	// 2. 绘制多边形网格背景 (此部分代码正确，无需改动)
	for (let i = 4; i > 0; i--) {
		ctx.beginPath();
		const currentRadius = radius * (i / 4);
		for (let j = 0; j < sides; j++) {
			const x = center.x + currentRadius * Math.cos(angleStep * j - Math.PI / 2);
			const y = center.y + currentRadius * Math.sin(angleStep * j - Math.PI / 2);
			j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.fillStyle = i % 2 === 0 ? '#F7F7F7' : '#FFFFFF';
		ctx.fill();
		ctx.strokeStyle = '#EFEFEF';
		ctx.stroke();
	}
	
	// 3. 绘制从中心到顶点的连线和文字标签
	ctx.beginPath();
	ctx.font = '12px sans-serif';
	ctx.fillStyle = '#666666';
	ctx.textBaseline = 'middle'; // 垂直方向始终居中
	for (let i = 0; i < sides; i++) {
		const angle = angleStep * i - Math.PI / 2;
		const x = center.x + radius * Math.cos(angle);
		const y = center.y + radius * Math.sin(angle);
		ctx.moveTo(center.x, center.y);
		ctx.lineTo(x, y);

		// 【核心修正】根据角度动态设置文本水平对齐方式
		const cos = Math.cos(angle);
		if (Math.abs(cos) < 0.1) {
			// 顶部或底部标签，居中对齐
			ctx.textAlign = 'center';
		} else if (cos > 0) {
			// 右侧标签，左对齐
			ctx.textAlign = 'left';
		} else {
			// 左侧标签，右对齐
			ctx.textAlign = 'right';
		}
		
		// 设置一个合适的间距
        const textPadding = 10;
		const textX = center.x + (radius + textPadding) * Math.cos(angle);
		const textY = center.y + (radius + textPadding) * Math.sin(angle);
		ctx.fillText(props.categories[i], textX, textY);
	}
	ctx.strokeStyle = '#EFEFEF';
	ctx.stroke();

	// 4. 绘制数据区域 (此部分代码正确，无需改动)
	ctx.beginPath();
	props.seriesData.forEach((value, i) => {
		const pointRadius = (value / props.maxVal) * radius;
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
	
	// 5. 绘制数据点 (此部分代码正确，无需改动)
	props.seriesData.forEach((value, i) => {
		const pointRadius = (value / props.maxVal) * radius;
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
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// 【核心修正4】: onMounted 的逻辑重构
let chartCtx = null; // 把上下文保存起来，以便 watch 中使用
onMounted(() => {
	const query = uni.createSelectorQuery().in(instance); // 使用 instance 替代 this
	query.select(`#${canvasId.value}`)
		.fields({ node: true, size: true })
		.exec((res) => {
			if (!res || !res[0] || !res[0].node) {
				console.error('无法获取Canvas节点');
				return;
			}
			const canvas = res[0].node;
			const ctx = canvas.getContext('2d');
			
			// 处理高清屏适配
			const dpr = uni.getSystemInfoSync().pixelRatio;
			canvas.width = res[0].width * dpr;
			canvas.height = res[0].height * dpr;
			ctx.scale(dpr, dpr);

			canvasWidth.value = res[0].width;
			canvasHeight.value = res[0].height;
			
			chartCtx = ctx; // 保存上下文
			drawChart(chartCtx, canvasWidth.value, canvasHeight.value); // 初始绘制
		});
});

// 【核心修正5】: watch 的逻辑调整
watch(() => props.seriesData, () => {
    // 确保上下文已经准备好再绘制
	if (chartCtx) {
		drawChart(chartCtx, canvasWidth.value, canvasHeight.value);
	}
}, { deep: true });

</script>

<style lang="scss" scoped>
.chart-container {
	width: 100%;
	height: 100%;
}
</style>