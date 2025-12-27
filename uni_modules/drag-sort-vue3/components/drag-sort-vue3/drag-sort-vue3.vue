<template>
	<view class="drag-container" :style="{ height: containerHeight + 'px' }">
		<movable-area class="drag-area" :style="{ height: containerHeight + 'px' }">
			<movable-view v-for="(item, index) in currentList" :key="item.id" :x="item.x" :y="item.y" direction="all"
				:z-index="item.zIndex" :disabled="!isDragging && item.zIndex === 1" class="drag-item"
				:style="{ width: itemWidth + 'px', height: itemHeight + 'px' }" @change="onChange($event, index)"
				@touchstart="onTouchStart(index)" @touchend="onTouchEnd">

				<!-- 插槽：让父组件决定显示什么 -->
				<view class="item-inner">
					<slot :item="item.data" :index="index"></slot>
				</view>

			</movable-view>
		</movable-area>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		onMounted,
		nextTick
	} from 'vue';

	const props = defineProps({
		list: {
			type: Array,
			default: () => []
		},
		columns: {
			type: Number,
			default: 3
		},
		itemHeightRpx: {
			type: Number,
			default: 230
		}
	});

	const emits = defineEmits(['change']);

	const currentList = ref([]);
	const containerHeight = ref(0);
	const itemWidth = ref(0);
	const itemHeight = ref(0);

	const isDragging = ref(false);
	const draggingIndex = ref(-1);

	const systemInfo = uni.getSystemInfoSync();
	const screenWidth = systemInfo.windowWidth;

	// 计算布局尺寸
	const calculateLayout = () => {
		// 假设页面左右 padding 各 30rpx (父容器 padding: 30rpx) -> 60rpx
		// 这里给个兜底，如果没有获取到宽度，默认给一个值
		const containerWidth = screenWidth - uni.upx2px(60);

		itemWidth.value = containerWidth / props.columns;
		itemHeight.value = uni.upx2px(props.itemHeightRpx);

		// console.log('✅ [DragSort] 布局计算完成: W=', itemWidth.value, 'H=', itemHeight.value);
	};

	onMounted(() => {
		calculateLayout();
		// 挂载时如果已有数据，尝试初始化
		if (props.list.length > 0) {
			initData();
		}
	});

	// 监听数据变化
	watch(() => props.list, (val) => {
		// console.log('✅ [DragSort] 接收到新数据，长度:', val ? val.length : 0);
		if (!isDragging.value) {
			initData();
		}
	}, {
		deep: true,
		immediate: true
	});

	const getPosition = (index) => {
		const row = Math.floor(index / props.columns);
		const col = index % props.columns;
		return {
			x: col * itemWidth.value,
			y: row * itemHeight.value
		};
	};

	const initData = () => {
		// 【修复点】如果宽度还没算出来，强制算一次
		if (itemWidth.value === 0) {
			calculateLayout();
		}

		// 如果还是0，说明环境有问题，但不能崩，给个默认值防止卡死
		if (itemWidth.value === 0) itemWidth.value = 100;

		const list = props.list.map((item, index) => {
			const pos = getPosition(index);
			return {
				// 优先用 item.id，没有则生成
				id: item.id || ('item_' + index + '_' + Date.now()),
				data: item,
				x: pos.x,
				y: pos.y,
				zIndex: 1
			};
		});

		currentList.value = list;
		updateContainerHeight();
	};

	const updateContainerHeight = () => {
		const count = currentList.value.length;
		// 只要有数据或者是添加按钮在外面，给一个最小高度
		const rows = Math.ceil(count / props.columns) || 0;
		containerHeight.value = rows * itemHeight.value;
		// console.log('✅ [DragSort] 容器高度更新:', containerHeight.value);
	};

	// --- 触摸事件 ---
	const onTouchStart = (index) => {
		isDragging.value = true;
		draggingIndex.value = index;
		currentList.value[index].zIndex = 99;
	};

	const onChange = (e, index) => {
		if (!isDragging.value || index !== draggingIndex.value) return;
		const x = e.detail.x;
		const y = e.detail.y;
		const centerX = x + itemWidth.value / 2;
		const centerY = y + itemHeight.value / 2;
		const col = Math.floor(centerX / itemWidth.value);
		const row = Math.floor(centerY / itemHeight.value);
		let targetIndex = row * props.columns + col;

		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex >= currentList.value.length) targetIndex = currentList.value.length - 1;

		if (targetIndex !== draggingIndex.value) {
			const mover = currentList.value[draggingIndex.value];
			currentList.value.splice(draggingIndex.value, 1);
			currentList.value.splice(targetIndex, 0, mover);

			currentList.value.forEach((item, idx) => {
				if (idx !== targetIndex) {
					const pos = getPosition(idx);
					item.x = pos.x;
					item.y = pos.y;
				}
			});
			draggingIndex.value = targetIndex;
		}
	};

	const onTouchEnd = () => {
		isDragging.value = false;
		if (draggingIndex.value !== -1) {
			const item = currentList.value[draggingIndex.value];
			item.zIndex = 1;
			const pos = getPosition(draggingIndex.value);
			nextTick(() => {
				item.x = pos.x;
				item.y = pos.y;
			});
			const sortedData = currentList.value.map(item => item.data);
			emits('change', sortedData);
		}
		draggingIndex.value = -1;
	};
</script>

<style scoped>
	.drag-container {
		width: 100%;
		position: relative;
	}

	.drag-area {
		width: 100%;
	}

	.drag-item {
		position: absolute;
		z-index: 1;
	}

	.item-inner {
		width: 100%;
		height: 100%;
		padding: 10rpx;
		box-sizing: border-box;
	}
</style>