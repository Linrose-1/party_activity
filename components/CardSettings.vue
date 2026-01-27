<!-- components/CardSettings.vue -->
<template>
	<uni-popup ref="popup" type="bottom">
		<view class="s-container">
			<view class="s-header">名片定制面板</view>
			<scroll-view scroll-y class="s-body">
				<view class="s-section">
					<text class="s-label">品牌主色调</text>
					<view class="color-list">
						<view v-for="c in ['#FF8600','#007AFF','#34C759','#FF3B30','#5856D6','#000000']" :key="c"
							:style="{background: c}" class="color-dot" :class="{active: config.cardMainColor === c}"
							@click="config.cardMainColor = c" />
					</view>
				</view>

				<view class="s-section">
					<text class="s-label">Logo 容器形状</text>
					<uni-data-checkbox v-model="config.cardLogoStyle"
						:localdata="[{text:'圆形',value:0},{text:'方形',value:1},{text:'圆角',value:2}]" />
				</view>

				<view class="s-section">
					<text class="s-label">内容模块控制</text>
					<view class="toggle-item" v-for="(label, key) in toggles" :key="key">
						<text>{{ label }}</text>
						<switch :checked="config[key] === 1" @change="e => config[key] = e.detail.value ? 1 : 0"
							color="#FF8600" style="transform: scale(0.7);" />
					</view>
				</view>
			</scroll-view>
			<view class="s-btns">
				<button class="s-btn-apply" @click="apply">应用并保存设置</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		reactive,
		watch
	} from 'vue';
	const props = defineProps({
		modelValue: Object
	});
	const emit = defineEmits(['apply']);
	const popup = ref(null);
	const config = reactive({});
	const toggles = {
		cardShowSlogan: '品牌标语',
		cardShowContact: '联系方式',
		cardShowSocial: '社交媒体',
		cardShowOnlineStore: '线上线下门店',
		cardShowDetailAddress: '显示详细地址'
	};

	watch(() => props.modelValue, (v) => v && Object.assign(config, JSON.parse(JSON.stringify(v))), {
		immediate: true
	});
	const open = () => popup.value.open();
	const apply = () => {
		emit('apply', config);
		popup.value.close();
	};
	defineExpose({
		open
	});
</script>

<style scoped lang="scss">
	.s-container {
		background: #fff;
		border-radius: 40rpx 40rpx 0 0;
		padding: 40rpx;
	}

	.s-header {
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.s-body {
		max-height: 60vh;
	}

	.s-section {
		margin-bottom: 40rpx;
	}

	.s-label {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 20rpx;
		display: block;
	}

	.color-list {
		display: flex;
		gap: 20rpx;

		.color-dot {
			width: 50rpx;
			height: 50rpx;
			border-radius: 50%;

			&.active {
				border: 4rpx solid #333;
				transform: scale(1.1);
			}
		}
	}

	.toggle-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f8f8f8;
		font-size: 28rpx;
	}

	.s-btns {
		margin-top: 40rpx;
		padding-bottom: 40rpx;

		.s-btn-apply {
			background: #333;
			color: #fff;
			border-radius: 50rpx;
			font-weight: bold;
		}
	}
</style>