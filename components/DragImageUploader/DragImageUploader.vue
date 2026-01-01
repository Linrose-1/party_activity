<template>
	<view class="drag-uploader-wrap" :style="{ minHeight: dragAreaHeight + 'px' }">
		<!-- 拖拽区域容器 -->
		<view class="drag-container" :style="{ height: dragAreaHeight + 'px' }">
			<movable-area class="drag-area" :style="{ height: dragAreaHeight + 'px' }">
				<!-- 循环渲染拖拽项 -->
				<movable-view v-for="(item, index) in dragDisplayList" :key="item.id" :x="item.x" :y="item.y"
					direction="all" :z-index="item.zIndex" :disabled="!isDragging && item.zIndex === 1"
					class="drag-item" :style="{ width: dragItemWidth + 'px', height: dragItemHeight + 'px' }"
					@change="onMovableChange($event, index)" @touchstart="onMovableStart(index)"
					@touchend="onMovableEnd">
					<view class="item-inner">
						<view class="image-wrapper-drag">
							<image :src="item.data" mode="aspectFill" class="preview-img"
								@click.stop="previewImage(item.realIndex)" />
							<view class="delete-btn" @click.stop="deleteImage(item.realIndex)">×</view>
						</view>
					</view>
				</movable-view>
			</movable-area>
		</view>

		<!-- 添加按钮 (定位在流式布局的正确位置) -->
		<!-- 注意：由于 movable-view 是绝对定位，添加按钮需要模拟位置或独立存在 -->
		<!-- 这里为了保持原逻辑的视觉效果，我们使用一个不可见的占位 grid 来计算"添加按钮"应该出现的位置 -->
		<!-- 但原逻辑中，添加按钮是绝对定位或者跟在拖拽项后面的。 -->
		<!-- 为了简化封装，这里采用：添加按钮作为 absolute 定位渲染，根据列表长度计算坐标 -->

		<view class="add-btn-absolute" v-if="list.length < maxCount" :style="{ 
				width: dragItemWidth + 'px', 
				height: dragItemHeight + 'px',
				left: addBtnPos.x + 'px',
				top: addBtnPos.y + 'px'
			}" @click="handleAdd">
			<view class="item-inner">
				<view class="add-img-placeholder">
					<uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
					<text>添加</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		nextTick,
		onMounted,
		computed
	} from 'vue';

	// --- Props & Emits ---
	const props = defineProps({
		// 双向绑定的图片数组
		modelValue: {
			type: Array,
			default: () => []
		},
		// 最大数量
		maxCount: {
			type: Number,
			default: 9
		},
		// 列数
		columns: {
			type: Number,
			default: 3
		}
	});

	const emit = defineEmits(['update:modelValue', 'add-image']);

	// --- 状态 ---
	const list = computed(() => props.modelValue); // 方便引用的简写
	const dragDisplayList = ref([]);
	const dragItemWidth = ref(0);
	const dragItemHeight = ref(0);
	const dragAreaHeight = ref(0);
	const isDragging = ref(false);
	const dragIndex = ref(-1);
	const dragItemHeightRpx = 230; // 对应 CSS 中的高度

	// --- 计算添加按钮的位置 ---
	const addBtnPos = computed(() => {
		const index = list.value.length;
		return getPos(index);
	});

	// --- 初始化与监听 ---
	onMounted(() => {
		initDragLayout();
		if (list.value.length > 0) {
			initDragList(list.value);
		}
	});

	// 监听外部数据变化 (例如父组件上传成功后)
	watch(() => props.modelValue, (newVal) => {
		// 只有在非拖拽状态下才重置列表，防止冲突
		if (!isDragging.value) {
			initDragList(newVal);
		}
	}, {
		deep: true
	});

	// --- 核心逻辑 ---

	// 1. 初始化尺寸
	const initDragLayout = () => {
		const sys = uni.getSystemInfoSync();
		// 计算容器宽度：屏幕宽度 - 左右 padding (假设父容器有 padding，这里需减去父容器的 padding)
		// 这里建议减去大概的值，或者通过 uni.createSelectorQuery 获取实际宽度更精准
		// 为保持原逻辑一致，沿用原算法：windowWidth - 100rpx
		const containerWidth = sys.windowWidth - uni.upx2px(100);

		dragItemWidth.value = containerWidth / props.columns;
		dragItemHeight.value = uni.upx2px(dragItemHeightRpx);
	};

	// 2. 初始化列表
	const initDragList = (originList) => {
		if (!dragItemWidth.value) initDragLayout();

		dragDisplayList.value = originList.map((url, index) => {
			const {
				x,
				y
			} = getPos(index);
			return {
				id: `img_${index}_${Math.random()}`, // 唯一KEY
				data: url,
				x,
				y,
				zIndex: 1,
				realIndex: index
			};
		});
		updateDragHeight();
	};

	// 获取坐标
	const getPos = (index) => {
		const row = Math.floor(index / props.columns);
		const col = index % props.columns;
		return {
			x: col * dragItemWidth.value,
			y: row * dragItemHeight.value
		};
	};

	// 更新总高度
	const updateDragHeight = () => {
		// 总数量 = 图片数量 + 1个添加按钮 (如果没满)
		let count = list.value.length;
		if (count < props.maxCount) count++;

		const rows = Math.ceil(count / props.columns);
		dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
	};

	// --- 交互事件 ---

	const handleAdd = () => {
		emit('add-image');
	};

	const deleteImage = (index) => {
		uni.showModal({
			title: '提示',
			content: '确定删除？',
			success: (res) => {
				if (res.confirm) {
					const newList = [...props.modelValue];
					newList.splice(index, 1);
					emit('update:modelValue', newList);
					// 视图更新会通过 watch 触发 initDragList
				}
			}
		});
	};

	const previewImage = (index) => {
		uni.previewImage({
			urls: props.modelValue,
			current: index,
			loop: true
		});
	};

	// --- 拖拽事件 ---
	const onMovableStart = (index) => {
		isDragging.value = true;
		dragIndex.value = index;
		// 提升层级
		if (dragDisplayList.value[index]) {
			dragDisplayList.value[index].zIndex = 99;
		}
	};

	const onMovableChange = (e, index) => {
		if (!isDragging.value || index !== dragIndex.value) return;

		const x = e.detail.x;
		const y = e.detail.y;

		const centerX = x + dragItemWidth.value / 2;
		const centerY = y + dragItemHeight.value / 2;

		const col = Math.floor(centerX / dragItemWidth.value);
		const row = Math.floor(centerY / dragItemHeight.value);
		let targetIndex = row * props.columns + col;

		// 边界检查
		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex >= dragDisplayList.value.length) targetIndex = dragDisplayList.value.length - 1;

		if (targetIndex !== dragIndex.value) {
			const mover = dragDisplayList.value[dragIndex.value];
			const listCopy = [...dragDisplayList.value];

			listCopy.splice(dragIndex.value, 1);
			listCopy.splice(targetIndex, 0, mover);

			// 更新所有项的坐标（除了正在拖拽的这个，它的坐标由手势控制）
			listCopy.forEach((item, idx) => {
				if (idx !== targetIndex) { // 不修改当前拖拽项的 x,y，防止抖动
					const pos = getPos(idx);
					item.x = pos.x;
					item.y = pos.y;
				}
				item.realIndex = idx; // 更新真实索引
			});

			dragDisplayList.value = listCopy;
			dragIndex.value = targetIndex;
		}
	};

	const onMovableEnd = () => {
		isDragging.value = false;
		if (dragIndex.value !== -1) {
			const item = dragDisplayList.value[dragIndex.value];
			if (item) {
				item.zIndex = 1;
				const pos = getPos(dragIndex.value);
				// 归位
				nextTick(() => {
					item.x = pos.x;
					item.y = pos.y;
				});
			}

			// *** 关键：拖拽结束后，同步新的顺序给父组件 ***
			const sortedUrls = dragDisplayList.value.map(wrapper => wrapper.data);
			emit('update:modelValue', sortedUrls);
		}
		dragIndex.value = -1;
	};
</script>

<style scoped>
	.drag-uploader-wrap {
		position: relative;
		width: 100%;
	}

	.drag-container {
		width: 100%;
		position: relative;
	}

	.drag-area {
		width: 100%;
	}

	.drag-item {
		/* movable-view 默认是 absolute */
		z-index: 10;
	}

	/* 绝对定位的添加按钮 */
	.add-btn-absolute {
		position: absolute;
		z-index: 5;
		/* 比默认图片的1高，比拖拽中的99低 */
		transition: all 0.2s;
		/* 让它在列表变化时平滑移动 */
	}

	.item-inner {
		width: 100%;
		height: 100%;
		padding: 12rpx;
		/* 间距 */
		box-sizing: border-box;
		display: block;
	}

	.image-wrapper-drag {
		width: 100%;
		height: 100%;
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		text-align: center;
		line-height: 40rpx;
		font-size: 32rpx;
		z-index: 20;
		border-bottom-left-radius: 12rpx;
	}

	.add-img-placeholder {
		width: 100%;
		height: 100%;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999;
		background-color: #fff;
	}
</style>