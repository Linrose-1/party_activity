<template>
	<!-- 遮罩层 -->
	<view class="popup-mask" :class="{ 'visible': visible }" @click.stop="close">
		<!-- 内容层 -->
		<view class="popup-content" :class="{ 'slide-up': visible }" @click.stop>

			<!-- 1. 顶部固定导航栏 -->
			<view class="popup-header">
				<text class="btn-cancel" @click="close">取消</text>
				<text class="title">{{ isEdit ? '编辑赞助商' : '添加赞助商' }}</text>
				<text class="btn-confirm" @click="confirm">确定</text>
			</view>

			<!-- 2. 滚动区域 -->
			<scroll-view scroll-y class="popup-scroll-view">
				<view class="form-wrapper">
					<uni-forms :model="form" label-position="top" label-width="100%">

						<!-- 赞助商名称 -->
						<uni-forms-item label="赞助商名称" required>
							<uni-easyinput v-model="form.sponsorName" placeholder="请输入赞助商名称" class="standard-input" />
						</uni-forms-item>

						<!-- Logo上传 -->
						<uni-forms-item label="品牌Logo" required>
							<view class="upload-box logo-upload" @click="uploadLogo">
								<image v-if="form.logoUrl" :src="form.logoUrl" mode="aspectFit" class="uploaded-img">
								</image>
								<view v-else class="upload-placeholder">
									<uni-icons type="camera-filled" size="28" color="#FF6F00"></uni-icons>
									<text>上传Logo</text>
								</view>
							</view>
						</uni-forms-item>

						<!-- 简介 -->
						<uni-forms-item label="品牌简介" required>
							<uni-easyinput type="textarea" v-model="form.introduction" placeholder="请输入200字以内的简介"
								maxlength="200" class="standard-textarea" />
						</uni-forms-item>

						<!-- 赞助类型 -->
						<uni-forms-item label="赞助类型" required>
							<view class="type-selector">
								<view class="type-item" :class="{ active: form.sponsorType === 1 }"
									@click="form.sponsorType = 1">
									<text>💰 现金赞助</text>
								</view>
								<view class="type-item" :class="{ active: form.sponsorType === 2 }"
									@click="form.sponsorType = 2">
									<text>📦 物品赞助</text>
								</view>
							</view>
						</uni-forms-item>

						<!-- 动态字段：现金 -->
						<template v-if="form.sponsorType === 1">
							<view class="row-inputs">
								<uni-forms-item label="总金额 (元)" required class="half-item">
									<uni-easyinput type="digit" v-model="form.cashAmount" placeholder="0.00"
										class="standard-input" />
								</uni-forms-item>
								<uni-forms-item label="人均金额 (元)" required class="half-item">
									<uni-easyinput type="digit" v-model="form.perCapitalAmount" placeholder="0.00"
										class="standard-input" />
								</uni-forms-item>
							</view>
						</template>

						<!-- 动态字段：物品 -->
						<template v-if="form.sponsorType === 2">
							<uni-forms-item label="物品描述" required>
								<uni-easyinput v-model="form.goodsDescription" placeholder="例如: 矿泉水50箱"
									class="standard-input" />
							</uni-forms-item>
							<uni-forms-item label="物品数量" required>
								<uni-easyinput type="number" v-model="form.goodsNum" placeholder="请输入数量"
									class="standard-input" />
							</uni-forms-item>
						</template>

						<uni-forms-item label="赞助商位置">
							<uni-easyinput v-model="form.location" placeholder="选填，如：A区-01展位" class="standard-input" />
						</uni-forms-item>

						<!-- 品牌图集 (拖拽区域) -->
						<uni-forms-item label="品牌图集 (支持拖拽排序)">
							<view class="gallery-container" :style="{ height: dragAreaHeight + 'px' }">
								<movable-area class="drag-area" :style="{ height: dragAreaHeight + 'px' }">
									<movable-view v-for="(item, index) in dragDisplayList" :key="item.id" :x="item.x"
										:y="item.y" direction="all" :z-index="item.zIndex"
										:disabled="!isDragging && item.zIndex === 1" class="drag-item"
										:style="{ width: dragItemWidth + 'px', height: dragItemHeight + 'px' }"
										@change="onMovableChange($event, index)" @touchstart="onMovableStart(index)"
										@touchend="onMovableEnd">
										<view class="item-inner">
											<view class="img-wrap">
												<image :src="item.data" mode="aspectFill" />
												<view class="del-tag" @click.stop="deleteImage(item.realIndex)">×</view>
											</view>
										</view>
									</movable-view>

									<view v-if="form.galleryImageUrls.length < 9" class="add-btn-slot" :style="{ 
											width: dragItemWidth + 'px', 
											height: dragItemHeight + 'px',
											left: addBtnPos.left + 'px',
											top: addBtnPos.top + 'px'
										}" @click="uploadGallery">
										<view class="item-inner">
											<view class="upload-placeholder small">
												<uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
											</view>
										</view>
									</view>
								</movable-area>
							</view>
						</uni-forms-item>

						<view class="section-divider"></view>

						<!-- 负责人信息：单行布局 -->
						<uni-forms-item label="负责人信息 (选填)">
							<view class="contact-row">
								<!-- 左侧：头像 -->
								<view class="avatar-wrapper" @click="uploadAvatar">
									<image v-if="form.contactAvatar" :src="form.contactAvatar" mode="aspectFill"
										class="avatar-img"></image>
									<view v-else class="avatar-placeholder">
										<uni-icons type="camera-filled" size="20" color="#999"></uni-icons>
									</view>
									<text class="avatar-tip">头像</text>
								</view>

								<!-- 右侧：姓名输入框 -->
								<view class="name-wrapper">
									<uni-easyinput v-model="form.contactName" placeholder="请输入负责人姓名"
										class="standard-input" />
								</view>
							</view>
						</uni-forms-item>

					</uni-forms>
					<view style="height: 60rpx;"></view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		nextTick,
		defineProps,
		defineEmits,
		computed
	} from 'vue';
	import uploadFile from '@/utils/upload.js';

	const props = defineProps({
		visible: {
			type: Boolean,
			default: false
		},
		data: {
			type: Object,
			default: null
		}
	});

	const emit = defineEmits(['close', 'confirm']);

	const isEdit = ref(false);
	const form = ref({});

	// 初始化默认数据
	const getDefaultForm = () => ({
		id: null,
		sponsorName: '',
		location: '',
		logoUrl: '',
		introduction: '',
		galleryImageUrls: [],
		contactName: '',
		contactAvatar: '',
		sponsorType: 1,
		cashAmount: null,
		perCapitalAmount: null,
		goodsDescription: '',
		goodsNum: null,
		displaySort: 0
	});

	watch(() => props.visible, (val) => {
		if (val) {
			if (props.data) {
				isEdit.value = true;
				form.value = JSON.parse(JSON.stringify(props.data));
				if (typeof form.value.galleryImageUrls === 'string') {
					try {
						form.value.galleryImageUrls = JSON.parse(form.value.galleryImageUrls);
					} catch (e) {
						form.value.galleryImageUrls = [];
					}
				} else if (!form.value.galleryImageUrls) {
					form.value.galleryImageUrls = [];
				}
			} else {
				isEdit.value = false;
				form.value = getDefaultForm();
			}
			nextTick(() => initDragList(form.value.galleryImageUrls));
		}
	});

	const close = () => {
		emit('close');
	};

	const confirm = () => {
		const f = form.value;
		if (!f.sponsorName) return uni.showToast({
			title: '请输入赞助商名称',
			icon: 'none'
		});
		// if (!f.logoUrl) return uni.showToast({
		// 	title: '请上传品牌Logo',
		// 	icon: 'none'
		// });
		if (!f.introduction) return uni.showToast({
			title: '请输入品牌简介',
			icon: 'none'
		});

		if (f.sponsorType === 1) {
			if (!f.cashAmount || !f.perCapitalAmount) return uni.showToast({
				title: '请完善金额信息',
				icon: 'none'
			});
		} else {
			if (!f.goodsDescription || !f.goodsNum) return uni.showToast({
				title: '请完善物品信息',
				icon: 'none'
			});
		}

		emit('confirm', JSON.parse(JSON.stringify(f)));
	};

	// --- 图片上传 ---
	const uploadLogo = async () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const result = await uploadFile({
					path: res.tempFilePaths[0]
				}, {
					directory: 'sponsor-logo'
				});
				if (result.data) form.value.logoUrl = result.data;
			}
		});
	};

	const uploadAvatar = async () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const result = await uploadFile({
					path: res.tempFilePaths[0]
				}, {
					directory: 'sponsor-avatar'
				});
				if (result.data) form.value.contactAvatar = result.data;
			}
		});
	};

	const uploadGallery = () => {
		uni.chooseImage({
			count: 9 - form.value.galleryImageUrls.length,
			success: async (res) => {
				uni.showLoading({
					title: '上传中'
				});
				const promises = res.tempFiles.map(f => uploadFile({
					path: f.path
				}, {
					directory: 'sponsor-gallery'
				}));
				const results = await Promise.all(promises);
				uni.hideLoading();
				const urls = results.filter(r => r.data).map(r => r.data);
				form.value.galleryImageUrls.push(...urls);
			}
		});
	};

	const deleteImage = (index) => {
		form.value.galleryImageUrls.splice(index, 1);
	};

	// --- 拖拽逻辑 ---
	const dragDisplayList = ref([]);
	const dragItemWidth = ref(0);
	const dragItemHeight = ref(0);
	const dragAreaHeight = ref(0);
	const isDragging = ref(false);
	const dragIndex = ref(-1);

	const addBtnPos = computed(() => {
		const count = form.value.galleryImageUrls.length;
		if (count >= 9) return {
			left: 0,
			top: 0
		};
		const r = Math.floor(count / 3);
		const c = count % 3;
		return {
			left: c * dragItemWidth.value,
			top: r * dragItemHeight.value
		};
	});

	watch(() => form.value.galleryImageUrls, (newVal) => {
		if (!isDragging.value && props.visible) {
			initDragList(newVal || []);
		}
	}, {
		deep: true
	});

	const initDragList = (list) => {
		const sys = uni.getSystemInfoSync();
		const containerWidth = sys.windowWidth - uni.upx2px(60);
		dragItemWidth.value = containerWidth / 3;
		dragItemHeight.value = dragItemWidth.value;

		dragDisplayList.value = (list || []).map((url, i) => {
			const {
				x,
				y
			} = getPos(i);
			return {
				id: `sp_img_${i}_${Math.random()}`,
				data: url,
				x,
				y,
				zIndex: 1,
				realIndex: i
			};
		});
		updateDragHeight(list.length);
	};

	const getPos = (i) => {
		const r = Math.floor(i / 3);
		const c = i % 3;
		return {
			x: c * dragItemWidth.value,
			y: r * dragItemHeight.value
		};
	};

	const updateDragHeight = (count) => {
		const totalCount = count < 9 ? count + 1 : count;
		const rows = Math.ceil(totalCount / 3);
		dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
	};

	const onMovableStart = (i) => {
		isDragging.value = true;
		dragIndex.value = i;
		dragDisplayList.value[i].zIndex = 99;
	};

	const onMovableChange = (e, i) => {
		if (!isDragging.value || i !== dragIndex.value) return;
		const x = e.detail.x;
		const y = e.detail.y;
		const c = Math.floor((x + dragItemWidth.value / 2) / dragItemWidth.value);
		const r = Math.floor((y + dragItemHeight.value / 2) / dragItemHeight.value);
		let target = r * 3 + c;
		if (target < 0) target = 0;
		if (target >= dragDisplayList.value.length) target = dragDisplayList.value.length - 1;

		if (target !== dragIndex.value) {
			const mover = dragDisplayList.value[dragIndex.value];
			dragDisplayList.value.splice(dragIndex.value, 1);
			dragDisplayList.value.splice(target, 0, mover);
			dragDisplayList.value.forEach((item, idx) => {
				if (idx !== target) {
					const p = getPos(idx);
					item.x = p.x;
					item.y = p.y;
				}
			});
			dragIndex.value = target;
		}
	};

	const onMovableEnd = () => {
		isDragging.value = false;
		if (dragIndex.value !== -1) {
			const item = dragDisplayList.value[dragIndex.value];
			item.zIndex = 1;
			const p = getPos(dragIndex.value);
			nextTick(() => {
				item.x = p.x;
				item.y = p.y;
			});
			form.value.galleryImageUrls = dragDisplayList.value.map(o => o.data);
		}
		dragIndex.value = -1;
	};
</script>

<style lang="scss" scoped>
	/* 遮罩层 */
	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.3s;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		&.visible {
			opacity: 1;
			visibility: visible;
		}
	}

	/* 内容层 */
	.popup-content {
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		height: 85vh;
		display: flex;
		flex-direction: column;
		transform: translateY(100%);
		transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

		&.slide-up {
			transform: translateY(0);
		}
	}

	/* 头部 */
	.popup-header {
		height: 100rpx;
		min-height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.title {
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
		}

		.btn-cancel {
			font-size: 30rpx;
			color: #999;
			padding: 20rpx;
		}

		.btn-confirm {
			font-size: 30rpx;
			color: #FF6F00;
			font-weight: bold;
			padding: 20rpx;
		}
	}

	/* 滚动区 */
	.popup-scroll-view {
		flex: 1;
		height: 0;
		overflow-y: scroll;
	}

	.form-wrapper {
		padding: 30rpx;
	}

	/* ======== 样式精修区 ======== */

	/* 1. 标准输入框样式：淡灰色边框 + 白色背景 */
	.standard-input {
		::v-deep .uni-easyinput__content {
			border: 1px solid #E5E5E5 !important;
			/* 淡灰色边框 */
			border-radius: 8rpx;
			height: 76rpx;
			/* 固定高度，方便对齐 */
			background-color: #fff !important;
			padding-left: 10rpx;
		}
	}

	.standard-textarea {
		::v-deep .uni-easyinput__content {
			border: 1px solid #E5E5E5 !important;
			border-radius: 8rpx;
			background-color: #fff !important;
			padding: 10rpx;
		}
	}

	/* 2. 上传框 */
	.upload-box {
		width: 200rpx;
		height: 200rpx;
		background-color: #FAFAFA;
		border: 1px dashed #E5E5E5;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;

		.uploaded-img {
			width: 100%;
			height: 100%;
		}

		.upload-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10rpx;
			color: #999;
			font-size: 24rpx;
		}
	}

	/* 3. 赞助类型选择 */
	.type-selector {
		display: flex;
		gap: 20rpx;

		.type-item {
			flex: 1;
			height: 76rpx;
			background: #fff;
			border: 1px solid #E5E5E5;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #666;
			font-size: 28rpx;
			transition: all 0.2s;

			&.active {
				background: #FFF6E6;
				border-color: #FF6F00;
				color: #FF6F00;
				font-weight: bold;
			}
		}
	}

	.row-inputs {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;

		.half-item {
			flex: 1;
			width: 0;
		}
	}

	/* 4. 负责人：完全水平对齐布局 */
	.contact-row {
		display: flex;
		align-items: center;
		/* 垂直居中对齐 */
		gap: 24rpx;
		padding-top: 10rpx;
		/* 稍微与标签拉开距离 */
	}

	/* 头像容器 */
	.avatar-wrapper {
		width: 76rpx;
		height: 76rpx;
		/* 与输入框高度严格一致 */
		border-radius: 50%;
		background: #FAFAFA;
		border: 1px dashed #E5E5E5;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
		/* 防止被挤压 */

		.avatar-img {
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}

		/* 悬浮提示文字 */
		.avatar-tip {
			position: absolute;
			bottom: -32rpx;
			font-size: 20rpx;
			color: #999;
			width: 100%;
			text-align: center;
		}
	}

	/* 姓名输入容器 */
	.name-wrapper {
		flex: 1;
		/* 占据剩余宽度 */
	}

	/* 分隔线 */
	.section-divider {
		height: 1px;
		background-color: #F0F0F0;
		margin: 30rpx 0;
	}

	/* 拖拽相关 */
	.gallery-container {
		position: relative;
		width: 100%;
	}

	.drag-area {
		width: 100%;
	}

	.drag-item {
		z-index: 10;
	}

	.item-inner {
		width: 100%;
		height: 100%;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.img-wrap {
		width: 100%;
		height: 100%;
		position: relative;
		border-radius: 8rpx;
		overflow: hidden;
		background: #eee;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.del-tag {
		position: absolute;
		top: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 8rpx;
		z-index: 20;
	}

	.add-btn-slot {
		position: absolute;
		z-index: 5;
	}

	.upload-placeholder.small {
		width: 100%;
		height: 100%;
		background: #FAFAFA;
		border: 1px dashed #E5E5E5;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	::v-deep .uni-forms-item__label {
		font-weight: bold;
		color: #333;
		padding-bottom: 10rpx;
	}
</style>