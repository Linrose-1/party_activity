<template>
	<view class="grid-drag-container" :style="{ height: areaHeight + 'px' }">
		<!-- 调试用：如果能看到红色文字，说明组件渲染了 -->
		<!-- <view v-if="displayList.length === 0" style="color: red; text-align: center;">暂无数据</view> -->

		<movable-area class="drag-area" :style="{ height: areaHeight + 'px' }">
			<movable-view v-for="(item, index) in displayList" :key="item.id" :x="item.x" :y="item.y" direction="all"
				:z-index="item.zIndex" :disabled="!isDragging && item.zIndex === 1" class="drag-item"
				:style="{ width: itemWidth + 'px', height: itemHeight + 'px' }" @change="onChange($event, index)"
				@touchstart="onTouchStart(index)" @touchend="onTouchEnd">
				<view class="item-inner">
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

	// 1. 计算布局尺寸 (核心修复)
	const initLayout = () => {
		const sys = uni.getSystemInfoSync();
		// 假设页面左右Padding各20rpx，这里预留 40rpx 的余量，避免撑爆
		// 如果你的图片贴边显示，请调整这个数值
		const containerWidth = sys.windowWidth - uni.upx2px(40);

		itemWidth.value = containerWidth / props.columns;
		itemHeight.value = uni.upx2px(props.itemHeightRpx);

		console.log('📏 [GridDrag] 尺寸计算:', {
			w: itemWidth.value,
			h: itemHeight.value
		});
	};

	// 2. 初始化数据列表 (转换为带坐标的对象)
	const initList = (originList) => {
		// 确保尺寸已计算
		if (itemWidth.value === 0) initLayout();
		if (!originList || originList.length === 0) {
			displayList.value = [];
			areaHeight.value = 0;
			return;
		}

		console.log('🔄 [GridDrag] 初始化列表, 长度:', originList.length);

		displayList.value = originList.map((item, index) => {
			const {
				x,
				y
			} = getPos(index);
			return {
				// 必须给一个随机ID，防止 Vue 复用导致图片不刷新
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
		// 至少给 1px 高度，或者 rows * height
		areaHeight.value = rows * itemHeight.value;
		console.log('📏 [GridDrag] 容器高度更新:', areaHeight.value);
	};

	onMounted(() => {
		initLayout();
		if (props.list.length > 0) {
			initList(props.list);
		}
	});

	// 深度监听 list 变化
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
		displayList.value[index].zIndex = 99;
	};

	const onChange = (e, index) => {
		if (!isDragging.value || index !== dragIndex.value) return;
		const x = e.detail.x;
		const y = e.detail.y;
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
			nextTick(() => {
				item.x = pos.x;
				item.y = pos.y;
			});
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
		/* 高度由 inline-style 控制 */
	}

	.drag-item {
		position: absolute;
		/* 【关键】确保 movable-view 内部内容能撑开 */
		display: flex;
		flex-direction: column;
	}

	.item-inner {
		/* 【关键】宽高必须 100% */
		width: 100%;
		height: 100%;
		/* 控制间距 */
		padding: 8rpx;
		/* 确保 padding 不会撑大盒子 */
		box-sizing: border-box;
		/* 让内部元素（插槽内容）能撑满 */
		display: flex;
		flex-direction: column;
	}
</style>