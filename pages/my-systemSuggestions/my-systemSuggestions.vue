<!-- pages/suggestion/suggestion.vue -->
<template>
	<view class="page-container">
		<view class="card">
			<view class="card-header">
				<uni-icons type="paperplane-filled" size="24" :color="themeColor"></uni-icons>
				<text class="card-title">提交您的建议</text>
			</view>

			<!-- 标题 -->
			<view class="form-item">
				<text class="label">建议标题</text>
				<input class="input-field" v-model.trim="suggestion.title" placeholder="一句话概括您的建议"
					maxlength="30" />
			</view>

			<!-- 内容 -->
			<view class="form-item">
				<text class="label">建议内容</text>
				<textarea class="textarea-field" v-model.trim="suggestion.content"
					placeholder="请详细描述您的建议或发现的问题，帮助我们更好地改进系统~" maxlength="500" />
				<view class="char-counter">{{ suggestion.content.length }}/500</view>
			</view>
			
			<!-- ==================== 【新增】图片上传模块 ==================== -->
			<view class="form-item">
				<text class="label">相关图片 (可选)</text>
				<view class="image-preview">
					<!-- 循环显示已上传的图片 -->
					<view v-for="(imgUrl, index) in suggestion.images" :key="index" class="image-wrapper">
						<image :src="imgUrl" mode="aspectFill" class="preview-img" @click.stop="previewImage(index)" />
						<view class="delete-image-btn" @click.stop="deleteImage(index)">×</view>
					</view>
					<!-- 图片数量未满9张时，显示上传按钮 -->
					<view class="add-img-placeholder" @click="handleChooseImage" v-if="suggestion.images.length < 9">
						<uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
						<text>添加图片</text>
					</view>
				</view>
				<text class="hint">最多可上传9张图片</text>
			</view>
			<!-- ======================================================== -->

		</view>

		<view class="tips-section">
			<uni-icons type="notification-filled" size="18" :color="themeColor"></uni-icons>
			<text class="tips-text">您的每一条优质建议，都将有机会获得贡献分奖励！</text>
		</view>

		<button class="submit-button" @click="handleSubmit" :loading="isLoading" :disabled="isButtonDisabled">
			{{ isLoading ? '正在提交...' : '立即提交' }}
		</button>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import request from '@/utils/request.js';
// 【新增】导入您项目中封装好的 uploadFile 方法
import uploadFile from '@/utils/upload.js'; // 请确认路径是否为 uploadFile.js 或 upload.js

const themeColor = '#FE6A00';

// 【修改】在 reactive 对象中增加 images 数组
const suggestion = reactive({
	title: '',
	content: '',
	images: [] // 用于存储上传成功的图片URL
});

const isLoading = ref(false);

const isButtonDisabled = computed(() => {
	return !suggestion.title || !suggestion.content || isLoading.value;
});

// ==================== 【新增】图片处理相关函数 ====================
const handleChooseImage = () => {
	uni.chooseImage({
		count: 9 - suggestion.images.length, // 动态计算可选数量
		sourceType: ['album', 'camera'],
		success: async (res) => {
			// 为了更好的用户体验，我们先过滤掉过大的文件
			const validFiles = res.tempFiles.filter(file => file.size <= 5 * 1024 * 1024);
			if (res.tempFiles.length > validFiles.length) {
				uni.showToast({ title: '部分文件过大(>5MB)，已忽略', icon: 'none' });
			}
			if (validFiles.length === 0) return;
			
			uni.showLoading({ title: `正在上传 ${validFiles.length} 张图片...`, mask: true });
			
			// 使用 Promise.all 并行上传
			const uploadPromises = validFiles.map(file => uploadFile(file, { directory: 'suggestion' }));
			const results = await Promise.all(uploadPromises);
			
			uni.hideLoading();

			const successfulUrls = [];
			results.forEach(result => {
				if (result.data) {
					successfulUrls.push(result.data);
				} else {
					console.error('图片上传失败:', result.error);
				}
			});

			suggestion.images.push(...successfulUrls);

			if (successfulUrls.length < validFiles.length) {
				uni.showToast({ title: `${validFiles.length - successfulUrls.length} 张图片上传失败`, icon: 'none' });
			}
		},
	});
};

const deleteImage = (index) => {
	uni.showModal({
		title: '提示',
		content: '确定要删除这张图片吗？',
		success: (res) => {
			if (res.confirm) {
				suggestion.images.splice(index, 1);
			}
		}
	});
};

const previewImage = (index) => {
	uni.previewImage({
		urls: suggestion.images,
		current: index
	});
};
// ===============================================================

const handleSubmit = async () => {
	if (!suggestion.title) {
		uni.showToast({ title: '请输入建议标题', icon: 'none' });
		return;
	}
	if (!suggestion.content) {
		uni.showToast({ title: '请输入建议内容', icon: 'none' });
		return;
	}

	isLoading.value = true;

	try {
		// 【修改】构建发送给后端的数据
		const postData = {
			id: 0, // 根据接口文档，创建时 id 传 0
			title: suggestion.title,
			content: suggestion.content,
			img: suggestion.images.join(',') // 将图片数组用逗号拼接成字符串
		};

		const { data, error } = await request('/app-api/member/suggestion/create', {
			method: 'POST',
			data: postData // 发送构建好的数据
		});
		
		if (error) {
			uni.showToast({ title: `提交失败: ${typeof error === 'object' ? error.msg : error}`, icon: 'none' });
		} else {
			uni.showToast({ title: '感谢您的建议！', icon: 'success' });
			
			// 清空表单
			suggestion.title = '';
			suggestion.content = '';
			suggestion.images = []; // 【新增】清空图片
			
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	} catch (e) {
		uni.showToast({ title: '提交失败，请稍后再试', icon: 'none' });
	} finally {
		isLoading.value = false;
	}
};
</script>

<style lang="scss" scoped>
	// ... 原有样式保持不变 ...
	.page-container {
		padding: 32rpx;
		background-color: #f7f8fa;
		min-height: 100vh;
	}

	.card {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		align-items: center;
		padding-bottom: 24rpx;
		margin-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.card-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #303133;
		margin-left: 16rpx;
	}

	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.label {
		font-size: 30rpx;
		color: #606266;
		margin-bottom: 16rpx;
		display: block;
	}

	.input-field {
		height: 90rpx;
		line-height: 90rpx;
		font-size: 28rpx;
		padding: 0 24rpx;
		background-color: #f5f7fa;
		border-radius: 12rpx;
	}

	.textarea-field {
		width: 100%;
		height: 300rpx;
		font-size: 28rpx;
		padding: 24rpx;
		background-color: #f5f7fa;
		border-radius: 12rpx;
		box-sizing: border-box;
		line-height: 1.6;
	}

	.char-counter {
		text-align: right;
		font-size: 24rpx;
		color: #909399;
		margin-top: 10rpx;
	}

	.tips-section {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background-color: #fff8f2;
		border-radius: 16rpx;
		margin-top: 40rpx;
	}

	.tips-text {
		color: v-bind(themeColor);
		font-size: 26rpx;
		margin-left: 16rpx;
	}

	.submit-button {
		margin-top: 60rpx;
		background-color: v-bind(themeColor);
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 50rpx;
		height: 96rpx;
		line-height: 96rpx;
		transition: opacity 0.3s;

		&[disabled] {
			background-color: #fabba0;
			color: #ffffff;
			opacity: 0.7;
		}

		&::after {
			border: none;
		}
	}
	
	/* ==================== 【新增】图片上传相关样式 ==================== */
	/* (直接从商机发布页复制并稍作调整) */
	.hint {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
		display: block;
	}
	
	.image-preview {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 10rpx;
	}

	.image-wrapper {
		position: relative;
		width: 150rpx;
		height: 150rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.delete-image-btn {
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 0 12rpx 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		z-index: 10;
	}

	.delete-image-btn:active {
		background-color: rgba(0, 0, 0, 0.7);
	}

	.add-img-placeholder {
		width: 150rpx;
		height: 150rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 24rpx;
		transition: border-color 0.2s ease, color 0.2s ease;
	}
	
	.add-img-placeholder:active {
		border-color: v-bind(themeColor);
		color: v-bind(themeColor);
	}
</style>