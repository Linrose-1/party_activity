<template>
	<view class="score-form">
		<!-- 循环渲染评分大类 -->
		<view class="section-card" v-for="category in scoreCategories" :key="category.title">
			<view class="section-header">
				<text class="section-title">{{ category.title }}</text>
			</view>
			<view class="section-content">
				<view class="score-item" v-for="item in category.items" :key="item.key"
					:class="{ 'is-invalid': invalidKeys.includes(item.key) }">

					<view class="item-left">
						<text class="item-label">{{ item.label }}</text>
						<!-- 新增：未填提示，只在校验失败且分值为0时显示 -->
						<text v-if="invalidKeys.includes(item.key)" class="invalid-tip">待评分</text>
					</view>

					<!--
						使用 :value 和 @change 实现 v-model 的效果（原有代码，未修改）
						uni-rate 的 @change 事件返回 { value: number }
					-->
					<uni-rate :value="scores[item.key]" @change="(e) => onRateChange(item.key, e)" :max="10" :size="18"
						color="#e0e0e0" active-color="#FF8C00" :allow-half="false" :readonly="readonly" />

					<!-- 分值显示：0分时显示"-"提示未填 -->
					<text class="score-text" :class="{ 'empty-score': scores[item.key] === 0 }">
						{{ scores[item.key] === 0 ? '-' : scores[item.key] + '分' }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch
	} from 'vue';

	const props = defineProps({
		// 分数对象，用于双向绑定（原有，未修改）
		modelValue: {
			type: Object,
			default: () => ({})
		},
		// 是否只读模式（原有，未修改）
		readonly: {
			type: Boolean,
			default: false
		},
		// 新增：校验失败时需要高亮的 key 列表，由父页面传入
		invalidKeys: {
			type: Array,
			default: () => []
		}
	});

	const emit = defineEmits(['update:modelValue']);

	// 创建本地响应式对象，初始化时拷贝 props（原有代码，未修改）
	const scores = ref({
		...props.modelValue
	});

	// 监听 props 变化，同步更新本地 scores（原有代码，未修改）
	watch(() => props.modelValue, (newVal) => {
		Object.assign(scores.value, newVal);
	}, {
		deep: true
	});

	// 评分项结构定义（原有代码，完全未修改）
	const scoreCategories = [{
			title: '基础信用',
			items: [{
					label: '守时',
					key: 'punctuality'
				},
				{
					label: '守诺',
					key: 'promiseKeep'
				},
				{
					label: '守法',
					key: 'lawAbiding'
				},
				{
					label: '尽责',
					key: 'responsible'
				}
			]
		},
		{
			title: '协作态度',
			items: [{
					label: '真诚',
					key: 'sincere'
				},
				{
					label: '包容',
					key: 'tolerance'
				},
				{
					label: '利他',
					key: 'altruism'
				},
				{
					label: '共情',
					key: 'empathy'
				}
			]
		},
		{
			title: '专业能力',
			items: [{
					label: '专注',
					key: 'focus'
				},
				{
					label: '高效',
					key: 'efficient'
				},
				{
					label: '细致',
					key: 'detailOriented'
				},
				{
					label: '拓局',
					key: 'expandVision'
				}
			]
		},
		{
			title: '精神格局',
			items: [{
					label: '贡献',
					key: 'contribution'
				},
				{
					label: '谦逊',
					key: 'humility'
				},
				{
					label: '远见',
					key: 'foresight'
				},
				{
					label: '使命',
					key: 'mission'
				}
			]
		}
	];

	// 处理评分变化（原有代码，未修改）
	const onRateChange = (key, e) => {
		if (props.readonly) return;
		scores.value[key] = e.value;
		emit('update:modelValue', {
			...scores.value
		});
	};
</script>

<style scoped lang="scss">
	.section-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.section-header {
		padding-bottom: 20rpx;
		border-bottom: 1px solid #f0f0f0;
		margin-bottom: 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
	}

	.score-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 12rpx;
		border-radius: 10rpx;
		transition: background-color 0.2s;

		/* 新增：校验失败时高亮该行 */
		&.is-invalid {
			background-color: #FFF5F0;
			border: 1rpx solid #FFCCB0;
		}
	}

	/* 新增：左侧标签和提示文字竖排 */
	.item-left {
		display: flex;
		flex-direction: column;
		width: 100rpx;
	}

	.item-label {
		font-size: 28rpx;
		color: #555;
	}

	/* 新增：未填提示文字，红色小字 */
	.invalid-tip {
		font-size: 20rpx;
		color: #FF5722;
		margin-top: 4rpx;
	}

	.score-text {
		font-size: 24rpx;
		color: #FF8C00;
		width: 60rpx;
		text-align: right;
		margin-left: 10rpx;

		/* 新增：0分（未填）时显示灰色占位 */
		&.empty-score {
			color: #ccc;
		}
	}
</style>