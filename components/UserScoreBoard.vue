<template>
	<view v-if="datasets.length > 0" :class="['score-board-container', showCard ? 'chart-section' : '']">
		<view class="standard-title" v-if="showTitle" style="margin-bottom: 30rpx;">
			<uni-icons type="data-filled" size="16" color="#1890FF"></uni-icons>
			<text>评分统计</text>
		</view>

		<view class="chart-wrapper">
			<MyRadarChart :categories="categories" :datasets="datasets" :maxVal="maxVal" />
		</view>

		<!-- 2. 评分标准卡片 (放在图表下方作为参考) -->
		<view class="standard-card">
			<view class="standard-title">
				<uni-icons type="info-filled" size="16" color="#FF8C00"></uni-icons>
				<text>评分参考</text>
			</view>
			<view class="standard-grid">
				<view class="standard-item level-1">
					<text class="score-range">0-1分</text>
					<text class="score-desc">极差</text>
				</view>
				<view class="standard-item level-2">
					<text class="score-range">2-3分</text>
					<text class="score-desc">较差</text>
				</view>
				<view class="standard-item level-3">
					<text class="score-range">4-5分</text>
					<text class="score-desc">一般</text>
				</view>
				<view class="standard-item level-4">
					<text class="score-range">6-7分</text>
					<text class="score-desc">较好</text>
				</view>
				<view class="standard-item level-5">
					<text class="score-range">8-9分</text>
					<text class="score-desc">优秀</text>
				</view>
				<view class="standard-item level-6">
					<text class="score-range">10分</text>
					<text class="score-desc">杰出</text>
				</view>
			</view>

		</view>

		<!-- 3. 评分维度对比表格 -->
		<view class="score-compare-table">
			<!-- 表头：变为4列 -->
			<view class="table-row header-row">
				<view class="col dim">评分维度</view>
				<view class="col val self">自我</view>
				<view class="col val friend">商友</view> <!-- 新增 -->
				<view class="col val total">综合</view>
			</view>

			<!-- 数据行 -->
			<view class="table-row" v-for="(dim, index) in categories" :key="index">
				<view class="col dim">{{ dim }}</view>
				<view class="col val self">{{ getScoreValue(0, index) }}</view>
				<view class="col val friend">{{ getScoreValue(1, index) }}</view> <!-- 商友 -->
				<view class="col val total">{{ getScoreValue(2, index) }}</view> <!-- 综合索引变为2 -->
			</view>

			<!-- 新增：评分总计行 -->
			<view class="table-row footer-row">
				<view class="col dim">评分总计</view>
				<view class="col val self">{{ getTotalValue(0) }}</view>
				<view class="col val friend">{{ getTotalValue(1) }}</view>
				<view class="col val total">{{ getTotalValue(2) }}</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import MyRadarChart from '@/components/MyRadarChart.vue';

	const props = defineProps({
		// 维度标签
		categories: {
			type: Array,
			default: () => ['基础信用', '协作态度', '专业能力', '精神格局']
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
	});

	// 获取指定数据集的数值用于表格展示
	const getScoreValue = (datasetIndex, dimIndex) => {
		const ds = props.datasets[datasetIndex];
		if (ds && ds.data) {
			const val = ds.data[dimIndex];
			// 核心逻辑：val 为 0、null、undefined 时均显示 '-'
			return (val && val !== 0) ? val : '-';
		}
		return '-';
	};

	/**
	 * 计算几个维度的总分
	 */
	const getTotalValue = (datasetIndex) => {
		const ds = props.datasets[datasetIndex];
		if (ds && ds.data) {
			const sum = ds.data.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
			return sum > 0 ? sum.toFixed(1).replace(/\.0$/, '') : '-';
		}
		return '-';
	};
</script>

<style lang="scss" scoped>
	view,
	text {
		box-sizing: border-box;
	}

	.score-board-container {
		width: 100%;
		overflow: hidden;
	}

	/* 雷达图区域 */
	.chart-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		width: 100%;
	}

	.chart-wrapper {
		width: 100%;
		height: 500rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	.score-compare-table {
		width: 100%;
		margin-top: 30rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.standard-title {
		display: flex;
		align-items: center;
		gap: 8rpx;

		text {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}
	}

	/* 评分标准卡片 */
	.standard-card {
		background: #fdfdfd;
		border-radius: 16rpx;
		padding: 20rpx;
		margin: 20rpx 0;
		border: 1rpx solid #f0f0f0;
	}

	.standard-grid {
		display: flex;
		justify-content: space-between;
		gap: 8rpx;
		margin-top: 16rpx;
	}

	.standard-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 12rpx 0;
		border-radius: 8rpx;
		background-color: #f5f5f5;

		.score-range {
			font-size: 20rpx;
			font-weight: bold;
			margin-bottom: 2rpx;
		}

		.score-desc {
			font-size: 18rpx;
			opacity: 0.9;
		}

		&.level-6 {
			background-color: #FFF0E6;
			color: #FF6A00;
		}

		&.level-5 {
			background-color: #FFF7E6;
			color: #FF9C38;
		}

		&.level-4 {
			background-color: #E8F5E9;
			color: #4CAF50;
		}

		&.level-3 {
			background-color: #E3F2FD;
			color: #2196F3;
		}

		&.level-2 {
			background-color: #FFF3E0;
			color: #FF9800;
		}

		&.level-1 {
			background-color: #FBE9E7;
			color: #FF5722;
		}
	}

	/* 表格样式 */
	.score-compare-table {
		margin-top: 30rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.table-row {
		display: flex;
		border-bottom: 1rpx solid #eee;

		&:last-child {
			border-bottom: none;
		}

		&.header-row {
			background-color: #f9f9f9;
			font-weight: bold;
			color: #333;
		}

		&.footer-row {
			background-color: #fffef9;
			font-weight: bold;
			border-top: 2rpx solid #eee;
		}


		.col {
			flex: 1;
			padding: 20rpx 0;
			text-align: center;
			font-size: 22rpx;

			&.dim {
				flex: 1.5;
				color: #333;
				text-align: left;
				padding-left: 30rpx;
			}

			&.self {
				color: #FF7D00;
			}

			&.friend {
				color: #4CAF50;
			}

			&.total {
				color: #1890FF;
			}
		}
	}
</style>