<template>
	<view class="score-form">
		<!-- 循环渲染评分大类 -->
		<view class="section-card" v-for="category in scoreCategories" :key="category.title">
			<view class="section-header">
				<text class="section-title">{{ category.title }}</text>
			</view>
			<view class="section-content">
				<view class="score-item" v-for="item in category.items" :key="item.key">
					<text class="item-label">{{ item.label }}</text>
					<!-- 
						使用 :value 和 @change 实现 v-model 的效果 
						uni-rate 的 @change 事件返回 { value: number }
					-->
					<uni-rate :value="scores[item.key]" @change="(e) => onRateChange(item.key, e)" :max="10" :size="18"
						color="#e0e0e0" active-color="#FF8C00" :allow-half="false" :readonly="readonly" />
					<!-- 可选：显示分数值 -->
					<text class="score-text">{{ scores[item.key] }}分</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		toRefs
	} from 'vue';

	const props = defineProps({
		// 分数对象，用于双向绑定
		modelValue: {
			type: Object,
			default: () => ({})
		},
		// 是否只读模式（用于查看他人评分时）
		readonly: {
			type: Boolean,
			default: false
		}
	});

	const emit = defineEmits(['update:modelValue']);

	// 创建一个本地的响应式对象，初始化时拷贝 props
	const scores = ref({
		...props.modelValue
	});

	// 监听 props 变化，同步更新本地 scores (用于回显)
	watch(() => props.modelValue, (newVal) => {
		// 深度合并或覆盖
		Object.assign(scores.value, newVal);
	}, {
		deep: true
	});

	// 评分项结构定义 (这是通用的配置，放在组件里很合适)
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
				},
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

	// 处理评分变化
	const onRateChange = (key, e) => {
		if (props.readonly) return;

		// 更新本地值
		scores.value[key] = e.value;

		// 发出事件，更新父组件的 modelValue
		// 注意：这里需要深拷贝还是直接传引用取决于你的数据流管理，通常直接传对象
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
		padding: 16rpx 0;
	}

	.item-label {
		font-size: 28rpx;
		color: #555;
		width: 100rpx;
		/* 固定宽度对齐 */
	}

	.score-text {
		font-size: 24rpx;
		color: #FF8C00;
		width: 60rpx;
		text-align: right;
		margin-left: 10rpx;
	}
</style>