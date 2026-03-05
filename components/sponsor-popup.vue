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
							<uni-easyinput type="textarea" v-model="form.introduction" placeholder="请输入800字以内的简介"
								maxlength="800" class="standard-textarea" />
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
									@click="onSponsorTypeChange(1)"><text>💰 现金</text></view>
								<view class="type-item" :class="{ active: form.sponsorType === 2 }"
									@click="onSponsorTypeChange(2)"><text>📦 物品</text></view>
								<view class="type-item" :class="{ active: form.sponsorType === 3 }"
									@click="onSponsorTypeChange(3)"><text>💰+📦 混合</text></view>
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
							<!-- 列表为空时不再显示提示文案，因为切换类型时已自动补一条空行 -->
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
		defineProps,
		defineEmits,
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

	// ==============================================================================
	// 【Bug2 优化】赞助类型切换：切到含物品的类型时，自动补一条空行，无需手动点添加
	// ==============================================================================
	const onSponsorTypeChange = (type) => {
		form.value.sponsorType = type;
		// 切换到需要填物品的类型时（物品/混合），如果 goodsList 为空自动补一条
		if ((type === 2 || type === 3) && goodsList.value.length === 0) {
			goodsList.value = [{
				desc: ''
			}];
		}
	};

	// ==============================================================================
	// 【Bug1 修复】反显逻辑重写
	// 原问题：
	//   1. galleryImageUrls 处理完后被 form.value = newData 覆盖（newData 里还是原始字符串）
	//   2. goodsList 解析完后，form.value = newData 把 goodsDescription 字符串又赋进去了
	// 修复方案：
	//   先赋值 form，再单独对 galleryImageUrls 和 goodsList 做二次修正，保证顺序正确
	// ==============================================================================
	watch(() => props.visible, (val) => {
		if (!val) return;
		
		console.log('赞助商弹窗收到的 data:', JSON.stringify(props.data));

		if (props.data) {
			// ---- 编辑模式 ----
			isEdit.value = true;
			const newData = JSON.parse(JSON.stringify(props.data));

			// 1. 先整体赋值到 form（此时 galleryImageUrls 可能是字符串，goodsDescription 可能是 JSON 字符串）
			form.value = newData;

			// 2. 修正 galleryImageUrls：确保是数组
			if (typeof form.value.galleryImageUrls === 'string') {
				try {
					const parsed = JSON.parse(form.value.galleryImageUrls);
					form.value.galleryImageUrls = Array.isArray(parsed) ? parsed : [];
				} catch (e) {
					form.value.galleryImageUrls = [];
				}
			} else if (!Array.isArray(form.value.galleryImageUrls)) {
				form.value.galleryImageUrls = [];
			}

			// 3. 修正 goodsList：从 goodsDescription 解析物品清单
			const desc = newData.goodsDescription;
			if (desc) {
				try {
					const parsed = JSON.parse(desc);
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
						// 非数组（纯字符串）：作为单条数据
						goodsList.value = [{
							desc: String(desc)
						}];
					}
				} catch (e) {
					// JSON 解析失败：直接当字符串用
					goodsList.value = [{
						desc: String(desc)
					}];
				}
			} else {
				// 无物品数据：根据赞助类型决定是否补一条空行
				goodsList.value = (newData.sponsorType === 2 || newData.sponsorType === 3) ?
					[{
						desc: ''
					}] :
					[];
			}

		} else {
			// ---- 新增模式 ----
			isEdit.value = false;
			form.value = getDefaultForm();
			// 新增默认类型是现金(1)，物品清单初始化为空，切到物品类型时由 onSponsorTypeChange 补行
			goodsList.value = [];
		}
	});

	// ==============================================================================
	// 地点 & 物品清单操作
	// ==============================================================================
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

	// ==============================================================================
	// 弹窗操作
	// ==============================================================================
	const close = () => {
		emit('close');
	};

	const confirm = () => {
		const f = form.value;

		if (!f.sponsorName) return uni.showToast({
			title: '请输入名称',
			icon: 'none'
		});

		if (f.sponsorType === 1 || f.sponsorType === 3) {
			if (!f.cashAmount || !f.perCapitalAmount) {
				return uni.showToast({
					title: '请完善现金信息',
					icon: 'none'
				});
			}
		} else {
			f.cashAmount = null;
			f.perCapitalAmount = null;
		}

		if (f.sponsorType === 2 || f.sponsorType === 3) {
			const validGoods = goodsList.value
				.filter(g => g.desc && g.desc.trim() !== '')
				.map(g => g.desc.trim());
			if (validGoods.length === 0) {
				return uni.showToast({
					title: '请填写赞助物品',
					icon: 'none'
				});
			}
			f.goodsDescription = JSON.stringify(validGoods);
		} else {
			f.goodsDescription = '';
		}

		emit('confirm', JSON.parse(JSON.stringify(f)));
	};

	// ==============================================================================
	// 图片上传
	// ==============================================================================
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
		overflow: hidden;
		min-height: 200rpx;
		display: block;
		position: relative;
		margin-bottom: 20rpx;
	}

	.section-divider {
		height: 1px;
		background-color: #F0F0F0;
		margin: 30rpx 0;
	}
</style>