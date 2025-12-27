<template>
	<view class="grid-drag-container" :style="{ height: areaHeight + 'px' }">
		<movable-area class="drag-area" :style="{ height: areaHeight + 'px' }">
			<movable-view v-for="(item, index) in displayList" :key="item.id" :x="item.x" :y="item.y" direction="all"
				:z-index="item.zIndex" :disabled="!isDragging && item.zIndex === 1" class="drag-item"
				:style="{ width: itemWidth + 'px', height: itemHeight + 'px' }" @change="onChange($event, index)"
				@touchstart="onTouchStart(index)" @touchend="onTouchEnd">
				<view class="item-inner">
					<!-- 插槽：将 item.data (URL) 和 index 传给父组件 -->
					<slot name="default" :item="item.data" :index="index"></slot>
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

	const displayList = ref([]);
	const itemWidth = ref(0);
	const itemHeight = ref(0);
	const areaHeight = ref(0);
	const isDragging = ref(false);
	const dragIndex = ref(-1);

	// 1. 计算布局尺寸
	const initLayout = () => {
		const sys = uni.getSystemInfoSync();
		// 假设页面左右Padding各20rpx，总共40rpx。
		// 这里减去 60rpx 留一点余量，防止计算误差导致换行错位
		const containerWidth = sys.windowWidth - uni.upx2px(60);

		itemWidth.value = containerWidth / props.columns;
		itemHeight.value = uni.upx2px(props.itemHeightRpx);

		// console.log('📏 [GridDrag] 尺寸:', itemWidth.value, itemHeight.value);
	};

	// 2. 初始化数据列表
	const initList = (originList) => {
		if (itemWidth.value === 0) initLayout();
		if (!originList || originList.length === 0) {
			displayList.value = [];
			areaHeight.value = 0;
			return;
		}

		displayList.value = originList.map((item, index) => {
			const {
				x,
				y
			} = getPos(index);
			return {
				// 生成唯一ID，避免 Vue 复用导致闪烁
				id: `item_${index}_${Math.random().toString(36).substr(2)}`,
				data: item,
				x,
				y,
				zIndex: 1,
				realIndex: index
			};
		});

		updateAreaHeight();
	};

	// 3. 计算坐标
	const getPos = (index) => {
		const row = Math.floor(index / props.columns);
		const col = index % props.columns;
		return {
			x: col * itemWidth.value,
			y: row * itemHeight.value
		};
	};

	// 4. 更新总高度
	const updateAreaHeight = () => {
		const count = displayList.value.length;
		const rows = Math.ceil(count / props.columns);
		// 至少给1行的高度，防止容器塌陷
		areaHeight.value = (rows || 1) * itemHeight.value;
	};

	onMounted(() => {
		initLayout();
		if (props.list.length > 0) {
			initList(props.list);
		}
	});

	// 监听数据变化
	watch(() => props.list, (newVal) => {
		if (!isDragging.value) {
			initList(newVal);
		}
	}, {
		deep: true,
		immediate: true
	});

	// --- 触摸事件 ---
	const onTouchStart = (index) => {
		isDragging.value = true;
		dragIndex.value = index;
		displayList.value[index].zIndex = 99; // 浮起
	};

	const onChange = (e, index) => {
		if (!isDragging.value || index !== dragIndex.value) return;
		const x = e.detail.x;
		const y = e.detail.y;

		// 计算中心点
		const centerX = x + itemWidth.value / 2;
		const centerY = y + itemHeight.value / 2;

		const col = Math.floor(centerX / itemWidth.value);
		const row = Math.floor(centerY / itemHeight.value);
		let targetIndex = row * props.columns + col;

		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex >= displayList.value.length) targetIndex = displayList.value.length - 1;

		if (targetIndex !== dragIndex.value) {
			const mover = displayList.value[dragIndex.value];
			displayList.value.splice(dragIndex.value, 1);
			displayList.value.splice(targetIndex, 0, mover);

			// 重新计算除当前拖动项以外的所有项的坐标
			displayList.value.forEach((item, idx) => {
				if (idx !== targetIndex) {
					const pos = getPos(idx);
					item.x = pos.x;
					item.y = pos.y;
				}
			});
			dragIndex.value = targetIndex;
		}
	};

	const onTouchEnd = () => {
		isDragging.value = false;
		if (dragIndex.value !== -1) {
			const item = displayList.value[dragIndex.value];
			item.zIndex = 1;
			const pos = getPos(dragIndex.value);
			// 强制归位
			nextTick(() => {
				item.x = pos.x;
				item.y = pos.y;
			});
			// 抛出排序后的数据
			const sortedData = displayList.value.map(wrapper => wrapper.data);
			emits('change', sortedData);
		}
		dragIndex.value = -1;
	};
</script>

<style scoped>
	.grid-drag-container {
		width: 100%;
		position: relative;
	}

	.drag-area {
		width: 100%;
	}

	.drag-item {
		/* 注意：movable-view 不需要 absolute，它自带定位机制 */
		/* 这里只控制 z-index，背景色等用于调试 */
		z-index: 10;
	}

	.item-inner {
		width: 100%;
		height: 100%;
		/* 核心：利用 padding 制造格子之间的间距 */
		padding: 10rpx;
		box-sizing: border-box;
		display: block;
	}
</style>