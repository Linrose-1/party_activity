<template>
	<view class="store-item">
		<view class="store-content">
			<view class="store-header">
				<view class="store-name">
					<uni-icons :type="store.icon" size="20" color="#FF6B00"></uni-icons>
					<text>{{ store.storeName }}</text>
				</view>
				<view class="distance" v-if="formattedDistance">
					<uni-icons type="location-filled" size="16" color="#FF6B00"></uni-icons>
					<text>{{ formattedDistance }}</text>
				</view>
			</view>
			<view class="store-desc">
				{{ store.storeDescription }}
			</view>
			<view class="store-footer">
				<view class="store-tags">
					<view class="store-tag" v-for="tag in store.tags" :key="tag">{{ tag }}</view>
				</view>
				<button class="nav-btn" @click.stop="handleCardClick">
					<uni-icons type="map-filled" size="16" color="#fff"></uni-icons>
					<!-- 【可选建议】您也可以通过 props 让按钮的文字可配置，比如 '查看' 或 '修改' -->
					<text>聚店详情</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		defineProps,
		defineEmits,
		computed
	} from 'vue';

	const props = defineProps({
		store: {
			type: Object,
			required: true,
		},
	});
	
	const emit = defineEmits(['click-card']);

	const formattedDistance = computed(() => {
		// 1. 检查API返回的 distance 是否是一个有效的数字
		if (typeof props.store.distance !== 'number') {
			// 如果不是数字（比如是 null 或 undefined），则不显示距离
			return null;
		}

		// 2. 使用 Math.floor() 去掉小数部分，得到整数
		const distanceAsInteger = Math.floor(props.store.distance);

		// 3. 拼接单位 "km" 并返回最终的字符串
		return `${distanceAsInteger}km`;
	});

	const handleCardClick = () => {
			// 不再执行 uni.navigateTo，而是触发 click-card 事件
			// 并将 store 对象作为参数传递给父组件
			emit('click-card', props.store);
		};

</script>

<style lang="scss" scoped>
	/* Scoped styles 意味着它们只适用于此组件 */
	:root {
		--primary: #FF6B00;
		--primary-light: #FF8A33;
		--light-bg: #f8f8f8;
		--dark-text: #333;
		--gray-text: #666;
		--light-text: #999;
		--border: #eee;
		--weui-BG-0: #ededed;
		--weui-BG-1: #f7f7f7;
	}

	.store-item {
		background: white;
		border-radius: 12px;
		margin-bottom: 15px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.store-item:active {
		transform: scale(0.98);
	}

	.store-content {
		padding: 15px;
	}

	.store-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.store-name {
		font-size: 18px;
		font-weight: 600;
		color: var(--dark-text);
		display: flex;
		align-items: center;
	}

	.store-name .uni-icons {
		margin-right: 8px;
	}

	.distance {
		color: var(--primary);
		font-size: 14px;
		display: flex;
		align-items: center;
		font-weight: 500;
	}

	.distance .uni-icons {
		margin-right: 4px;
	}

	.store-desc {
		font-size: 14px;
		color: var(--gray-text);
		margin-bottom: 15px;
		line-height: 1.5;
		/* 对于 uni-app 中的多行省略号，使用 text-overflow: ellipsis 配合 -webkit-line-clamp */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.store-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 10px;
		border-top: 1px dashed #ffe8d9;
	}

	.store-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.store-tag {
		background: #fff5ec;
		color: var(--primary);
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.nav-btn {
		background: var(--primary);
		color: white;
		border: none;
		padding: 6px 18px;
		border-radius: 16px;
		font-size: 14px;
		display: flex;
		align-items: center;
		cursor: pointer;
		transition: all 0.3s;
		font-weight: 500;
		line-height: 1;
		/* 调整按钮行高 */
		margin: 0;
		/* 重置按钮默认边距 */
	}

	.nav-btn::after {
		border: none;
		/* 移除 uni-app 按钮默认边框 */
	}

	.nav-btn .uni-icons {
		margin-right: 5px;
	}
</style>