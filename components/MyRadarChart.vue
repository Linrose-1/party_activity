<template>
	<view class="chart-container">
		<canvas type="2d" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }" :canvas-id="canvasId"
			:id="canvasId">
		</canvas>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch,
		getCurrentInstance,
		computed
	} from 'vue';

	const props = defineProps({
		categories: {
			type: Array,
			required: true
		},

		// 【新】支持多组数据：[{ name: '我的', data: [8,9,7,6], color: '#FF7D00' }, ...]
		datasets: {
			type: Array,
			default: () => []
		},

		// 【旧】兼容单组数据（如果传了这个，会被转化为 datasets 的一项）
		seriesData: {
			type: Array,
			default: () => []
		},

		maxVal: {
			type: Number,
			default: 10
		},
		themeColor: {
			type: String,
			default: '#FF7D00'
		}, // 默认颜色
	});

	const canvasId = ref(`radar-chart-${Math.random().toString(36).substr(2)}`);
	const canvasWidth = ref(300);
	const canvasHeight = ref(300);
	const instance = getCurrentInstance();
	let chartCtx = null;

	// 统一数据源：将单组/多组数据统一格式化
	const formattedDatasets = computed(() => {
		// 优先使用 datasets
		if (props.datasets && props.datasets.length > 0) {
			return props.datasets.map((set, index) => ({
				name: set.name || `数据${index + 1}`,
				data: set.data || [],
				// 如果没传颜色，第一组用主题色，第二组用蓝色，之后随机或默认灰
				color: set.color || (index === 0 ? props.themeColor : '#1890FF')
			}));
		}
		// 降级使用 seriesData
		if (props.seriesData && props.seriesData.length > 0) {
			return [{
				name: '数据',
				data: props.seriesData,
				color: props.themeColor
			}];
		}
		return [];
	});

	const hexToRgba = (hex, opacity) => {
		// 简单容错：如果是 rgb/rgba 格式直接返回
		if (hex.startsWith('rgb')) return hex;

		// 处理简写 #FFF
		let fullHex = hex;
		if (hex.length === 4) {
			fullHex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
		}

		const bigint = parseInt(fullHex.slice(1), 16);
		const r = (bigint >> 16) & 255;
		const g = (bigint >> 8) & 255;
		const b = bigint & 255;
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	};

	const drawChart = (ctx, width, height) => {
		if (!ctx) return;
		const datasets = formattedDatasets.value;
		if (props.categories.length === 0 || datasets.length === 0) return;

		const center = {
			x: width / 2,
			y: height / 2
		};
		const radius = Math.min(width, height) / 2 * 0.55;
		const sides = props.categories.length;
		const angleStep = (2 * Math.PI) / sides;

		// 1. 清空画布
		ctx.clearRect(0, 0, width, height);

		// 2. 绘制多边形网格 (保持不变)
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

		// 3. 绘制轴线和标签 (保持不变)
		ctx.beginPath();
		ctx.font = '12px sans-serif';
		ctx.fillStyle = '#666666';
		ctx.textBaseline = 'middle';
		for (let i = 0; i < sides; i++) {
			const angle = angleStep * i - Math.PI / 2;
			const x = center.x + radius * Math.cos(angle);
			const y = center.y + radius * Math.sin(angle);
			ctx.moveTo(center.x, center.y);
			ctx.lineTo(x, y);

			const cos = Math.cos(angle);
			if (Math.abs(cos) < 0.1) ctx.textAlign = 'center';
			else if (cos > 0) ctx.textAlign = 'left';
			else ctx.textAlign = 'right';

			const textPadding = 10;
			const textX = center.x + (radius + textPadding) * Math.cos(angle);
			const textY = center.y + (radius + textPadding) * Math.sin(angle);
			ctx.fillText(props.categories[i], textX, textY);
		}
		ctx.strokeStyle = '#EFEFEF';
		ctx.stroke();

		// 【核心修改】循环绘制多组数据
		datasets.forEach(dataset => {
			if (!dataset.data || dataset.data.length === 0) return;

			// 4.1 绘制区域
			ctx.beginPath();
			dataset.data.forEach((value, i) => {
				const pointRadius = (value / props.maxVal) * radius;
				const x = center.x + pointRadius * Math.cos(angleStep * i - Math.PI / 2);
				const y = center.y + pointRadius * Math.sin(angleStep * i - Math.PI / 2);
				i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
			});
			ctx.closePath();
			ctx.fillStyle = hexToRgba(dataset.color, 0.2); // 填充半透明
			ctx.fill();
			ctx.strokeStyle = dataset.color;
			ctx.lineWidth = 2;
			ctx.stroke();

			// 4.2 绘制数据点
			dataset.data.forEach((value, i) => {
				const pointRadius = (value / props.maxVal) * radius;
				const x = center.x + pointRadius * Math.cos(angleStep * i - Math.PI / 2);
				const y = center.y + pointRadius * Math.sin(angleStep * i - Math.PI / 2);
				ctx.beginPath();
				ctx.arc(x, y, 3, 0, 2 * Math.PI);
				ctx.fillStyle = dataset.color; // 点也是实心色
				ctx.fill();
			});
		});
	};

	onMounted(() => {
		const query = uni.createSelectorQuery().in(instance);
		query.select(`#${canvasId.value}`)
			.fields({
				node: true,
				size: true
			})
			.exec((res) => {
				if (!res || !res[0] || !res[0].node) return;
				const canvas = res[0].node;
				const ctx = canvas.getContext('2d');

				const dpr = uni.getSystemInfoSync().pixelRatio;
				canvas.width = res[0].width * dpr;
				canvas.height = res[0].height * dpr;
				ctx.scale(dpr, dpr);

				canvasWidth.value = res[0].width;
				canvasHeight.value = res[0].height;

				chartCtx = ctx;
				drawChart(chartCtx, canvasWidth.value, canvasHeight.value);
			});
	});

	// 监听数据变化 (datasets 和 seriesData 都要监听)
	watch([() => props.datasets, () => props.seriesData], () => {
		if (chartCtx) {
			drawChart(chartCtx, canvasWidth.value, canvasHeight.value);
		}
	}, {
		deep: true
	});
</script>

<style lang="scss" scoped>
	.chart-container {
		width: 100%;
		height: 100%;
	}
</style>