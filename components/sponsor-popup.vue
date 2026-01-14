<template>
	<view class="popup-mask" :class="{ 'visible': visible }" @click.stop="close">
		<view class="popup-content" :class="{ 'slide-up': visible }" @click.stop>

			<view class="popup-header">
				<text class="btn-cancel" @click="close">取消</text>
				<text class="title">{{ isEdit ? '编辑赞助商' : '添加赞助商' }}</text>
				<text class="btn-confirm" @click="confirm">确定</text>
			</view>

			<scroll-view scroll-y class="popup-scroll-view">
				<view class="form-wrapper">
					<uni-forms :model="form" label-position="top" label-width="100%">

						<uni-forms-item label="赞助商名称" required>
							<uni-easyinput v-model="form.sponsorName" placeholder="请输入赞助商名称" class="standard-input" />
						</uni-forms-item>

						<uni-forms-item label="品牌Logo">
							<view class="upload-box logo-upload" @click="uploadLogo">
								<image v-if="form.logoUrl" :src="form.logoUrl" mode="aspectFit" class="uploaded-img">
								</image>
								<view v-else class="upload-placeholder">
									<uni-icons type="camera-filled" size="28" color="#FF6F00"></uni-icons>
									<text>上传Logo</text>
								</view>
							</view>
						</uni-forms-item>

						<uni-forms-item label="品牌简介">
							<uni-easyinput type="textarea" v-model="form.introduction" placeholder="请输入200字以内的简介"
								maxlength="200" class="standard-textarea" />
						</uni-forms-item>

						<uni-forms-item label="赞助商位置">
							<view class="location-select" @click="chooseLocation">
								<view class="loc-text" :class="{ empty: !form.location }">
									{{ form.location || '点击选择位置' }}
								</view>
								<uni-icons type="location" size="20" color="#FF6F00"></uni-icons>
							</view>
						</uni-forms-item>

						<uni-forms-item label="赞助类型" required>
							<view class="type-selector">
								<view class="type-item" :class="{ active: form.sponsorType === 1 }"
									@click="form.sponsorType = 1"><text>💰 现金</text></view>
								<view class="type-item" :class="{ active: form.sponsorType === 2 }"
									@click="form.sponsorType = 2"><text>📦 物品</text></view>
								<view class="type-item" :class="{ active: form.sponsorType === 3 }"
									@click="form.sponsorType = 3"><text>💰+📦 混合</text></view>
							</view>
						</uni-forms-item>

						<template v-if="form.sponsorType === 1 || form.sponsorType === 3">
							<view class="section-subtitle">现金赞助信息</view>
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

						<template v-if="form.sponsorType === 2 || form.sponsorType === 3">
							<view class="section-subtitle"
								style="display: flex; justify-content: space-between; align-items: center;">
								<text>物品赞助清单</text>
								<view class="add-goods-btn" @click="addGoodsItem">
									<uni-icons type="plusempty" size="12" color="#FF6F00"></uni-icons> 添加
								</view>
							</view>

							<view v-for="(item, index) in goodsList" :key="index" class="goods-row">
								<view class="goods-input-wrapper full">
									<uni-easyinput v-model="item.desc" placeholder="请输入物品描述 (如: 矿泉水50箱)"
										class="standard-input" />
								</view>
								<view class="goods-del" @click="removeGoodsItem(index)">
									<uni-icons type="trash" size="18" color="#ff4d4f"></uni-icons>
								</view>
							</view>
							<view v-if="goodsList.length === 0" class="empty-goods-tip">暂无物品，请点击添加</view>
						</template>

						<uni-forms-item label="品牌图集">
							<view class="uploader-wrap">
								<DragImageUploader v-model="form.galleryImageUrls" :max-count="9"
									@add-image="uploadGallery" />
							</view>
						</uni-forms-item>

						<view class="section-divider"></view>

						<uni-forms-item label="负责人信息 (选填)">
							<view class="contact-row">
								<view class="avatar-wrapper" @click="uploadAvatar">
									<image v-if="form.contactAvatar" :src="form.contactAvatar" mode="aspectFill"
										class="avatar-img"></image>
									<view v-else class="avatar-placeholder"><uni-icons type="camera-filled" size="20"
											color="#999"></uni-icons></view>
									<text class="avatar-tip">头像</text>
								</view>
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
		visible: Boolean,
		data: Object
	});
	const emit = defineEmits(['close', 'confirm']);

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
		displaySort: 0
	});

	const isEdit = ref(false);
	const form = ref(getDefaultForm());
	const goodsList = ref([]);

	watch(() => props.visible, (val) => {
		if (val) {
			if (props.data) {
				isEdit.value = true;
				const newData = JSON.parse(JSON.stringify(props.data));

				if (typeof newData.galleryImageUrls === 'string') {
					try {
						newData.galleryImageUrls = JSON.parse(newData.galleryImageUrls);
					} catch (e) {
						newData.galleryImageUrls = [];
					}
				} else if (!Array.isArray(newData.galleryImageUrls)) {
					newData.galleryImageUrls = [];
				}

				if (newData.goodsDescription) {
					try {
						const parsed = JSON.parse(newData.goodsDescription);
						if (Array.isArray(parsed)) {
							goodsList.value = parsed.map(i => {
								if (typeof i === 'string') return {
									desc: i
								};
								if (i.name) return {
									desc: i.name + (i.count ? ` ${i.count}` : '')
								};
								return {
									desc: i.desc || ''
								};
							});
						} else {
							goodsList.value = [{
								desc: newData.goodsDescription
							}];
						}
					} catch (e) {
						goodsList.value = [{
							desc: newData.goodsDescription
						}];
					}
				} else {
					goodsList.value = [{
						desc: ''
					}];
				}
				form.value = newData;
			} else {
				isEdit.value = false;
				form.value = getDefaultForm();
				goodsList.value = [{
					desc: ''
				}];
			}
			// nextTick(() => initDragList(form.value.galleryImageUrls));
		}
	});

	const chooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				form.value.location = res.name || res.address;
			}
		});
	};

	const addGoodsItem = () => {
		goodsList.value.push({
			desc: ''
		});
	};
	const removeGoodsItem = (index) => {
		goodsList.value.splice(index, 1);
	};

	const close = () => {
		emit('close');
	};

	const confirm = () => {
		const f = form.value;
		if (!f.sponsorName) return uni.showToast({
			title: '请输入名称',
			icon: 'none'
		});
		// if (!f.logoUrl) return uni.showToast({
		// 	title: '请上传Logo',
		// 	icon: 'none'
		// });
		// if (!f.introduction) return uni.showToast({
		// 	title: '请输入简介',
		// 	icon: 'none'
		// });

		if (f.sponsorType === 1 || f.sponsorType === 3) {
			if (!f.cashAmount || !f.perCapitalAmount) return uni.showToast({
				title: '请完善现金信息',
				icon: 'none'
			});
		} else {
			f.cashAmount = null;
			f.perCapitalAmount = null;
		}

		if (f.sponsorType === 2 || f.sponsorType === 3) {
			const validGoods = goodsList.value.filter(g => g.desc && g.desc.trim() !== '').map(g => g.desc);
			if (validGoods.length === 0) return uni.showToast({
				title: '请填写赞助物品',
				icon: 'none'
			});
			f.goodsDescription = JSON.stringify(validGoods);
		} else {
			f.goodsDescription = '';
		}

		emit('confirm', JSON.parse(JSON.stringify(f)));
	};

	const uploadLogo = async () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const r = await uploadFile({
					path: res.tempFilePaths[0]
				}, {
					directory: 'sponsor-logo'
				});
				if (r.data) form.value.logoUrl = r.data;
			}
		});
	};
	const uploadAvatar = async () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const r = await uploadFile({
					path: res.tempFilePaths[0]
				}, {
					directory: 'sponsor-avatar'
				});
				if (r.data) form.value.contactAvatar = r.data;
			}
		});
	};
	const uploadGallery = () => {
		// 确保数组存在
		if (!form.value.galleryImageUrls) form.value.galleryImageUrls = [];

		uni.chooseImage({
			count: 9 - form.value.galleryImageUrls.length,
			success: async (res) => {
				uni.showLoading({
					title: '上传中...'
				});

				const ps = res.tempFiles.map(f => uploadFile({
					path: f.path
				}, {
					directory: 'sponsor-gallery'
				}));
				const rs = await Promise.all(ps);

				uni.hideLoading();

				const successUrls = rs.filter(r => r.data).map(r => r.data);
				form.value.galleryImageUrls.push(...successUrls);
			}
		});
	};
	// const deleteImage = (i) => {
	// 	if (form.value.galleryImageUrls) form.value.galleryImageUrls.splice(i, 1);
	// };

	// const dragDisplayList = ref([]);
	// const dragItemWidth = ref(0);
	// const dragItemHeight = ref(0);
	// const dragAreaHeight = ref(0);
	// const isDragging = ref(false);
	// const dragIndex = ref(-1);
	// const addBtnPos = computed(() => {
	// 	const c = (form.value.galleryImageUrls || []).length;
	// 	if (c >= 9) return {
	// 		left: 0,
	// 		top: 0
	// 	};
	// 	const r = Math.floor(c / 3),
	// 		col = c % 3;
	// 	return {
	// 		left: col * dragItemWidth.value,
	// 		top: r * dragItemHeight.value
	// 	};
	// });
	// watch(() => form.value.galleryImageUrls, (v) => {
	// 	if (!isDragging.value && props.visible) initDragList(v || []);
	// }, {
	// 	deep: true
	// });
	// const initDragList = (l) => {
	// 	const sys = uni.getSystemInfoSync();
	// 	const w = sys.windowWidth - uni.upx2px(60);
	// 	dragItemWidth.value = w / 3;
	// 	dragItemHeight.value = dragItemWidth.value;
	// 	dragDisplayList.value = (l || []).map((u, i) => {
	// 		const {
	// 			x,
	// 			y
	// 		} = getPos(i);
	// 		return {
	// 			id: `sp_${i}_${Math.random()}`,
	// 			data: u,
	// 			x,
	// 			y,
	// 			zIndex: 1,
	// 			realIndex: i
	// 		}
	// 	});
	// 	updateDragHeight(l ? l.length : 0);
	// };
	// const getPos = (i) => {
	// 	const r = Math.floor(i / 3),
	// 		c = i % 3;
	// 	return {
	// 		x: c * dragItemWidth.value,
	// 		y: r * dragItemHeight.value
	// 	};
	// };
	// const updateDragHeight = (c) => {
	// 	const t = c < 9 ? c + 1 : c;
	// 	dragAreaHeight.value = Math.ceil(t / 3) * dragItemHeight.value;
	// };
	// const onMovableStart = (i) => {
	// 	isDragging.value = true;
	// 	dragIndex.value = i;
	// 	dragDisplayList.value[i].zIndex = 99;
	// };
	// const onMovableChange = (e, i) => {
	// 	if (!isDragging.value || i !== dragIndex.value) return;
	// 	const x = e.detail.x,
	// 		y = e.detail.y,
	// 		c = Math.floor((x + dragItemWidth.value / 2) / dragItemWidth.value),
	// 		r = Math.floor((y + dragItemHeight.value / 2) / dragItemHeight.value);
	// 	let t = r * 3 + c;
	// 	if (t < 0) t = 0;
	// 	if (t >= dragDisplayList.value.length) t = dragDisplayList.value.length - 1;
	// 	if (t !== dragIndex.value) {
	// 		const m = dragDisplayList.value[dragIndex.value];
	// 		dragDisplayList.value.splice(dragIndex.value, 1);
	// 		dragDisplayList.value.splice(t, 0, m);
	// 		dragDisplayList.value.forEach((o, k) => {
	// 			if (k !== t) {
	// 				const p = getPos(k);
	// 				o.x = p.x;
	// 				o.y = p.y;
	// 			}
	// 		});
	// 		dragIndex.value = t;
	// 	}
	// };
	// const onMovableEnd = () => {
	// 	isDragging.value = false;
	// 	if (dragIndex.value !== -1) {
	// 		const o = dragDisplayList.value[dragIndex.value];
	// 		o.zIndex = 1;
	// 		const p = getPos(dragIndex.value);
	// 		nextTick(() => {
	// 			o.x = p.x;
	// 			o.y = p.y;
	// 		});
	// 		form.value.galleryImageUrls = dragDisplayList.value.map(x => x.data);
	// 	}
	// 	dragIndex.value = -1;
	// };
</script>

<style lang="scss" scoped>
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

	.popup-scroll-view {
		flex: 1;
		height: 0;
		overflow-y: scroll;
	}

	.form-wrapper {
		padding: 30rpx;
	}

	.standard-input {
		:deep(.uni-easyinput__content) {
			border: 1px solid #DCDFE6 !important;
			border-radius: 8rpx;
			height: 76rpx;
			background-color: #fff !important;
			padding-left: 10rpx;
		}
	}

	.standard-textarea {
		:deep(.uni-easyinput__content) {
			border: 1px solid #DCDFE6 !important;
			border-radius: 8rpx;
			background-color: #fff !important;
			padding: 10rpx;
		}
	}

	.location-select {
		height: 76rpx;
		border: 1px solid #DCDFE6;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
		background: #fff;

		.loc-text {
			font-size: 28rpx;
			color: #333;
			flex: 1;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.loc-text.empty {
			color: #999;
		}
	}

	.type-selector {
		display: flex;
		gap: 20rpx;

		.type-item {
			flex: 1;
			height: 76rpx;
			background: #fff;
			border: 1px solid #DCDFE6;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #666;
			font-size: 26rpx;

			&.active {
				background: #FFF6E6;
				border-color: #FF6F00;
				color: #FF6F00;
				font-weight: bold;
			}
		}
	}

	.section-subtitle {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin: 30rpx 0 20rpx;
	}

	.add-goods-btn {
		font-size: 24rpx;
		color: #FF6F00;
		border: 1rpx solid #FF6F00;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.goods-row {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
		align-items: center;

		.goods-input-wrapper {
			&.full {
				flex: 1;
			}
		}

		.goods-del {
			padding: 10rpx;
		}
	}

	.empty-goods-tip {
		text-align: center;
		color: #ccc;
		font-size: 24rpx;
		padding: 20rpx;
		background: #f9f9f9;
		border-radius: 8rpx;
	}

	.upload-box {
		width: 200rpx;
		height: 200rpx;
		background-color: #FAFAFA;
		border: 1px dashed #DCDFE6;
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

	.row-inputs {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;

		.half-item {
			flex: 1;
			width: 0;
		}
	}

	.contact-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
		margin-top: 8rpx;
	}

	.avatar-wrapper {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		background: #FAFAFA;
		border: 1px dashed #DCDFE6;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;

		.avatar-img {
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}

		.avatar-tip {
			position: absolute;
			bottom: -32rpx;
			font-size: 20rpx;
			color: #999;
			width: 100%;
			text-align: center;
		}
	}

	.name-wrapper {
		flex: 1;
	}

	.uploader-wrap {
		width: 100%;
		/* 关键：触发 BFC，清除子元素浮动造成的塌陷 */
		overflow: hidden;
		/* 关键：给一个最小高度，防止没图片时完全缩在一起 */
		min-height: 200rpx;
		/* 确保它是块级元素 */
		display: block;
		position: relative;
		/* 稍微给点下边距，防止贴得太紧 */
		margin-bottom: 20rpx;
	}

	.section-divider {
		height: 1px;
		background-color: #F0F0F0;
		margin: 30rpx 0;
	}

	// .gallery-container {
	// 	position: relative;
	// 	width: 100%;
	// }

	// .drag-area {
	// 	width: 100%;
	// }

	// .drag-item {
	// 	z-index: 10;
	// }

	// .item-inner {
	// 	width: 100%;
	// 	height: 100%;
	// 	padding: 10rpx;
	// 	box-sizing: border-box;
	// }

	// .img-wrap {
	// 	width: 100%;
	// 	height: 100%;
	// 	position: relative;
	// 	border-radius: 8rpx;
	// 	overflow: hidden;
	// 	background: #eee;

	// 	image {
	// 		width: 100%;
	// 		height: 100%;
	// 	}
	// }

	// .del-tag {
	// 	position: absolute;
	// 	top: 0;
	// 	right: 0;
	// 	width: 40rpx;
	// 	height: 40rpx;
	// 	background: rgba(0, 0, 0, 0.5);
	// 	color: #fff;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// 	border-bottom-left-radius: 8rpx;
	// 	z-index: 20;
	// }

	// .add-btn-slot {
	// 	position: absolute;
	// 	z-index: 5;
	// }

	// .upload-placeholder.small {
	// 	width: 100%;
	// 	height: 100%;
	// 	background: #FAFAFA;
	// 	border: 1px dashed #DCDFE6;
	// 	border-radius: 8rpx;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// }

	// :deep(.uni-forms-item__label) {
	// 	font-weight: bold;
	// 	color: #333;
	// 	padding-bottom: 10rpx;
	// }
</style>