<template>
	<uni-popup ref="popup" type="bottom" :safe-area="false" @change="onPopupChange" :mask-click="false">
		<view class="popup-container">
			<!-- 顶部导航栏 -->
			<view class="popup-header">
				<text class="cancel-btn" @click="close">取消</text>
				<text class="title">添加赞助商</text>
				<text class="confirm-btn" @click="handleConfirm">确定</text>
			</view>

			<scroll-view scroll-y class="popup-content">
				<view class="form-wrapper">
					<!-- 1. 赞助商档案信息 -->
					<view class="section-title">赞助商档案</view>
					<view class="sub-tips">填写品牌基础信息，将收录至您的赞助商库</view>

					<uni-forms ref="formRef" :modelValue="formData" label-position="top" label-width="100%">

						<uni-forms-item label="赞助商名称" required>
							<uni-easyinput v-model="formData.name" placeholder="请输入赞助商/品牌名称" :inputBorder="true" />
						</uni-forms-item>

						<uni-forms-item label="赞助商Logo" required>
							<view class="upload-box logo-upload" @click="uploadLogo">
								<image v-if="formData.logo" :src="formData.logo" mode="aspectFit" class="preview-img" />
								<view v-else class="placeholder">
									<uni-icons type="camera-filled" size="24" color="#ccc" />
									<text>上传Logo</text>
								</view>
							</view>
						</uni-forms-item>

						<uni-forms-item label="赞助商位置">
							<uni-easyinput v-model="formData.location" placeholder="例如：A区-101 (选填)" />
						</uni-forms-item>

						<uni-forms-item label="赞助商介绍 (200字内)" required>
							<uni-easyinput type="textarea" v-model="formData.description" maxlength="200"
								placeholder="请输入简短的品牌介绍" autoHeight />
						</uni-forms-item>

						<uni-forms-item label="品牌图集 (选填，最多9张)">
							<view class="gallery-grid">
								<view class="gallery-item" v-for="(url, index) in formData.gallery" :key="index">
									<image :src="url" mode="aspectFill" @click="previewImage(index)" />
									<view class="del-btn" @click.stop="removeGalleryImage(index)">×</view>
								</view>
								<view class="gallery-item add-btn" v-if="formData.gallery.length < 9"
									@click="uploadGallery">
									<uni-icons type="plusempty" size="30" color="#ccc" />
								</view>
							</view>
						</uni-forms-item>

						<uni-forms-item label="负责人信息 (选填)">
							<view class="contact-row">
								<view class="avatar-upload" @click="uploadAvatar">
									<image v-if="formData.contactAvatar" :src="formData.contactAvatar"
										mode="aspectFill" />
									<text v-else>头像</text>
								</view>
								<view style="flex: 1;">
									<uni-easyinput v-model="formData.contactName" placeholder="负责人姓名" />
								</view>
							</view>
						</uni-forms-item>
					</uni-forms>

					<!-- 分割线 -->
					<view class="divider"></view>

					<!-- 2. 本次赞助的具体业务信息 -->
					<view class="section-title">本次赞助详情</view>
					<view class="sub-tips">填写本次聚会的具体赞助内容</view>

					<uni-forms label-position="top">
						<uni-forms-item label="赞助类型" required>
							<view class="type-selector">
								<view class="type-item" :class="{ active: formData.type === 1 }"
									@click="formData.type = 1">
									<text>💰 现金赞助</text>
								</view>
								<view class="type-item" :class="{ active: formData.type === 2 }"
									@click="formData.type = 2">
									<text>🎁 物品/服务</text>
								</view>
							</view>
						</uni-forms-item>

						<!-- 现金类型表单 -->
						<template v-if="formData.type === 1">
							<uni-forms-item label="赞助总金额 (元)" required>
								<uni-easyinput type="digit" v-model="formData.totalAmount" placeholder="0.00" />
							</uni-forms-item>
							<uni-forms-item label="人均赞助金额 (元) (仅展示用)" required>
								<uni-easyinput type="digit" v-model="formData.perCapitaAmount" placeholder="0.00" />
							</uni-forms-item>
						</template>

						<!-- 物品类型表单 -->
						<template v-if="formData.type === 2">
							<uni-forms-item label="物品描述" required>
								<uni-easyinput v-model="formData.itemDesc" placeholder="例如：矿泉水50箱、伴手礼100份" />
							</uni-forms-item>
							<uni-forms-item label="物品数量">
								<uni-easyinput type="number" v-model="formData.itemNum" placeholder="数量 (选填)" />
							</uni-forms-item>
						</template>
					</uni-forms>

					<!-- 底部留白 -->
					<view style="height: 100rpx;"></view>
				</view>
			</scroll-view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		reactive,
		defineExpose,
		defineEmits
	} from 'vue';
	import uploadFile from '@/utils/uploadFile.js';
	import request from '@/utils/request.js'; // 直接引入 request

	const emit = defineEmits(['success']);
	const popup = ref(null);

	// 表单数据
	const formData = reactive({
		// --- 档案数据 ---
		name: '',
		logo: '',
		location: '',
		description: '',
		gallery: [],
		contactName: '',
		contactAvatar: '',

		// --- 业务数据 ---
		type: 1, // 1:现金, 2:物品
		totalAmount: '',
		perCapitaAmount: '',
		itemDesc: '',
		itemNum: ''
	});

	// 打开弹窗
	const open = () => {
		resetForm();
		popup.value.open();
	};

	// 关闭弹窗
	const close = () => {
		popup.value.close();
	};

	// 监听弹窗状态变化
	const onPopupChange = (e) => {
		// console.log('popup change:', e);
	};

	// 重置表单
	const resetForm = () => {
		Object.assign(formData, {
			name: '',
			logo: '',
			location: '',
			description: '',
			gallery: [],
			contactName: '',
			contactAvatar: '',
			type: 1,
			totalAmount: '',
			perCapitaAmount: '',
			itemDesc: '',
			itemNum: ''
		});
	};

	// --- 图片上传逻辑 ---
	const uploadLogo = () => handleUpload('logo', 'sponsor/logo');
	const uploadAvatar = () => handleUpload('contactAvatar', 'sponsor/avatar');

	const handleUpload = (field, dir) => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				uni.showLoading({
					title: '上传中'
				});
				const {
					data,
					error
				} = await uploadFile(res.tempFiles[0], {
					directory: dir
				});
				uni.hideLoading();
				if (data) {
					formData[field] = data;
				} else {
					uni.showToast({
						title: error || '上传失败',
						icon: 'none'
					});
				}
			}
		});
	};

	const uploadGallery = () => {
		uni.chooseImage({
			count: 9 - formData.gallery.length,
			success: async (res) => {
				uni.showLoading({
					title: '上传中'
				});
				const promises = res.tempFiles.map(f => uploadFile({
					path: f.path
				}, {
					directory: 'sponsor/gallery'
				}));

				try {
					const results = await Promise.all(promises);
					uni.hideLoading();
					results.forEach(r => {
						if (r.data) formData.gallery.push(r.data);
					});
					if (results.some(r => r.error)) {
						uni.showToast({
							title: '部分图片上传失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.hideLoading();
					uni.showToast({
						title: '上传异常',
						icon: 'none'
					});
				}
			}
		});
	};

	const removeGalleryImage = (index) => {
		formData.gallery.splice(index, 1);
	};

	const previewImage = (index) => {
		uni.previewImage({
			urls: formData.gallery,
			current: index
		});
	};

	// --- 提交逻辑 ---
	const handleConfirm = async () => {
		// 1. 本地校验
		if (!formData.name) return toast('请输入赞助商名称');
		if (!formData.logo) return toast('请上传赞助商Logo');
		if (!formData.description) return toast('请输入赞助商介绍');

		if (formData.type === 1) {
			if (!formData.totalAmount) return toast('请输入赞助总金额');
			if (!formData.perCapitaAmount) return toast('请输入人均赞助金额');
		} else {
			if (!formData.itemDesc) return toast('请输入物品描述');
		}

		uni.showLoading({
			title: '保存中',
			mask: true
		});

		try {
			// 2. 调用后端接口创建/保存赞助商档案
			// 直接在这里使用 request 调用接口，不依赖外部 api 文件
			const profileRes = await request('/app-api/member/sponsor/create', {
				method: 'POST',
				data: {
					userId: uni.getStorageSync('userId'),
					sponsorName: formData.name,
					logoUrl: formData.logo,
					introduction: formData.description,
					location: formData.location || '',
					contactName: formData.contactName || '',
					contactAvatar: formData.contactAvatar || '',
					// 数组转JSON字符串
					galleryImageUrls: formData.gallery && formData.gallery.length > 0 ?
						JSON.stringify(formData.gallery) :
						'',
					id: null // 新增
				}
			});

			uni.hideLoading();

			if (profileRes.error) {
				return toast(profileRes.error);
			}

			const sponsorId = profileRes.data; // 获取后端返回的 ID

			// 3. 组装数据传回父组件
			// 我们需要同时返回“档案视图数据”和“业务提交数据”
			const result = {
				// 用于在发布页列表展示的数据
				display: {
					id: sponsorId,
					name: formData.name,
					logo: formData.logo,
					typeText: formData.type === 1 ? `现金 ¥${formData.totalAmount}` : `物品: ${formData.itemDesc}`
				},

				// 用于最终发布聚会时提交到后端的数据
				apiPayload: {
					sponsorId: sponsorId,
					sponsorType: formData.type,
					cashAmount: formData.type === 1 ? Number(formData.totalAmount) : null,
					perCapitalAmount: formData.type === 1 ? Number(formData.perCapitaAmount) : null,
					goodsDescription: formData.type === 2 ? formData.itemDesc : '',
					goodsNum: formData.type === 2 ? Number(formData.itemNum) : null
				}
			};

			emit('success', result);
			close();

		} catch (e) {
			uni.hideLoading();
			console.error(e);
			toast('保存失败，请重试');
		}
	};

	const toast = (msg) => uni.showToast({
		title: msg,
		icon: 'none'
	});

	// 暴露方法给父组件
	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.popup-container {
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		height: 85vh;
		/* 弹窗高度 */
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		background-color: #fff;
		z-index: 10;

		.title {
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
		}

		.cancel-btn {
			color: #999;
			font-size: 28rpx;
			padding: 10rpx;
		}

		.confirm-btn {
			color: #FF6F00;
			font-size: 28rpx;
			font-weight: bold;
			padding: 10rpx;
		}
	}

	.popup-content {
		flex: 1;
		background-color: #f8f8f8;
		height: 0;
		/* 配合 flex:1 确保滚动生效 */
	}

	.form-wrapper {
		padding: 30rpx;
		background-color: #fff;
		min-height: 100%;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		border-left: 8rpx solid #FF6F00;
		padding-left: 16rpx;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
	}

	.sub-tips {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 30rpx;
		padding-left: 24rpx;
	}

	.divider {
		height: 20rpx;
		background: #f8f8f8;
		margin: 40rpx -30rpx;
	}

	/* 图片上传框 */
	.upload-box {
		width: 160rpx;
		height: 160rpx;
		background: #fafafa;
		border: 2rpx dashed #ddd;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		.preview-img {
			width: 100%;
			height: 100%;
		}

		.placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #ccc;
			font-size: 24rpx;
			gap: 6rpx;
		}
	}

	/* 图集网格 */
	.gallery-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		.gallery-item {
			width: 140rpx;
			height: 140rpx;
			position: relative;

			image {
				width: 100%;
				height: 100%;
				border-radius: 8rpx;
				background: #eee;
			}

			.del-btn {
				position: absolute;
				top: -10rpx;
				right: -10rpx;
				background: rgba(0, 0, 0, 0.6);
				color: #fff;
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				text-align: center;
				line-height: 34rpx;
				font-size: 24rpx;
				z-index: 2;
			}
		}

		.add-btn {
			background: #fafafa;
			border: 2rpx dashed #ddd;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	/* 负责人行 */
	.contact-row {
		display: flex;
		align-items: center;
		gap: 24rpx;

		.avatar-upload {
			width: 90rpx;
			height: 90rpx;
			background: #fafafa;
			border-radius: 50%;
			border: 1rpx solid #eee;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 22rpx;
			color: #999;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}
		}
	}

	/* 类型选择器 */
	.type-selector {
		display: flex;
		gap: 30rpx;

		.type-item {
			flex: 1;
			height: 80rpx;
			background: #f5f5f5;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #666;
			font-size: 28rpx;
			font-weight: 500;
			border: 2rpx solid transparent;
			transition: all 0.3s;

			&.active {
				background: #fff5eb;
				color: #FF6F00;
				border-color: #FF6F00;
			}
		}
	}
</style>