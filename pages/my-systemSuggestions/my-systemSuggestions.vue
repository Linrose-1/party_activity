<!-- pages/suggestion/suggestion.vue -->
<template>
	<view class="page-container">
		<!-- 核心表单卡片 -->
		<view class="card">
			<view class="card-header">
				<uni-icons type="paperplane-filled" size="24" :color="themeColor"></uni-icons>
				<text class="card-title">{{ isEditMode ? '修改您的建议' : '提交您的建议' }}</text>
			</view>

			<!-- 建议标题输入 -->
			<view class="form-item">
				<text class="label">建议标题</text>
				<input class="input-field" v-model.trim="suggestion.title" placeholder="一句话概括您的建议" maxlength="30" />
			</view>

			<!-- 建议正文内容 -->
			<view class="form-item">
				<text class="label">建议内容</text>
				<textarea class="textarea-field" v-model.trim="suggestion.content"
					placeholder="请详细描述您的建议或发现的问题，帮助我们更好地改进系统~" maxlength="500" />
				<view class="char-counter">{{ suggestion.content.length }}/500</view>
			</view>

			<!-- 图片上传模块 -->
			<view class="form-item">
				<text class="label">相关图片 (可选)</text>
				<view class="image-preview">
					<!-- 循环显示已上传的图片列表 -->
					<view v-for="(imgUrl, index) in suggestion.images" :key="index" class="image-wrapper">
						<image :src="imgUrl" mode="aspectFill" class="preview-img" @click.stop="previewImage(index)" />
						<view class="delete-image-btn" @click.stop="deleteImage(index)">×</view>
					</view>
					<!-- 未达到上限9张时展示添加按钮 -->
					<view class="add-img-placeholder" @click="handleChooseImage" v-if="suggestion.images.length < 9">
						<uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
						<text>添加图片</text>
					</view>
				</view>
				<text class="hint">最多可上传9张图片</text>
			</view>
		</view>

		<!-- 奖励提示说明区 -->
		<view class="tips-section">
			<uni-icons type="notification-filled" size="18" :color="themeColor"></uni-icons>
			<text class="tips-text">您的每一条优质建议，都将有机会获得贡献分奖励！</text>
		</view>

		<!-- 底部提交按钮 -->
		<button class="submit-button" @click="handleSubmit" :loading="isLoading" :disabled="isButtonDisabled">
			{{ submitText }}
		</button>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js'; // 导入通用上传方法

	// --- 1. 配置项 ---
	const themeColor = '#FE6A00'; // 页面主题橙色

	// --- 2. 响应式状态 ---
	const suggestion = reactive({
		title: '',
		content: '',
		images: [] // 已上传成功的图片URL数组
	});

	const isEditMode = ref(false); // 标记是否为编辑模式
	const suggestionId = ref(0); // 当前编辑的建议记录ID
	const isLoading = ref(false); // 按钮加载状态

	// --- 3. 计算属性 ---
	/**
	 * @description 判断按钮是否禁用：标题/内容为空或正在请求中
	 */
	const isButtonDisabled = computed(() => {
		return !suggestion.title || !suggestion.content || isLoading.value;
	});

	/**
	 * @description 动态生成提交按钮显示的文本
	 */
	const submitText = computed(() => {
		if (isLoading.value) return '正在处理...';
		return isEditMode.value ? '保存修改' : '立即提交';
	});

	// --- 4. 生命周期 ---
	/**
	 * @description 页面载入时执行
	 * @param {Object} options 路由参数，含 id 则进入编辑模式
	 */
	onLoad((options) => {
		if (options.id) {
			isEditMode.value = true;
			suggestionId.value = options.id;
			// 动态修改标题
			uni.setNavigationBarTitle({
				title: '修改建议'
			});
			// 获取详情进行数据反显
			fetchDetail(options.id);
		}
	});

	// --- 5. 核心业务方法 ---

	/**
	 * [方法] 获取系统建议详情并还原至表单
	 * @param {Number|String} id 记录ID
	 */
	const fetchDetail = async (id) => {
		uni.showLoading({
			title: '加载资料中...',
			mask: true
		});
		try {
			const {
				data,
				error
			} = await request('/app-api/member/suggestion/get', {
				method: 'GET',
				data: {
					id
				}
			});
			if (!error && data) {
				suggestion.title = data.title;
				suggestion.content = data.content;
				// 处理图片反显：字符串转数组并清洗空值
				suggestion.images = data.img ? data.img.split(',').filter(Boolean) : [];
			}
		} catch (e) {
			console.error('详情拉取异常:', e);
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * [方法] 选择并批量上传图片
	 */
	const handleChooseImage = () => {
		uni.chooseImage({
			count: 9 - suggestion.images.length, // 动态剩余张数
			sourceType: ['album', 'camera'],
			success: async (res) => {
				// 校验图片大小，限制5MB以内
				const validFiles = res.tempFiles.filter(file => file.size <= 5 * 1024 * 1024);
				if (res.tempFiles.length > validFiles.length) {
					uni.showToast({
						title: '部分文件过大(>5MB)，已自动忽略',
						icon: 'none'
					});
				}
				if (validFiles.length === 0) return;

				uni.showLoading({
					title: `同步中(0/${validFiles.length})`,
					mask: true
				});

				// 使用 Promise.all 并行执行多个上传任务，提升效率
				const uploadPromises = validFiles.map(file => uploadFile(file, {
					directory: 'suggestion'
				}));
				const results = await Promise.all(uploadPromises);

				uni.hideLoading();

				const successfulUrls = [];
				results.forEach(result => {
					if (result.data) {
						successfulUrls.push(result.data);
					} else {
						console.error('上传器内部报错:', result.error);
					}
				});

				// 将成功拿到的URL追加到响应式列表
				suggestion.images.push(...successfulUrls);

				if (successfulUrls.length < validFiles.length) {
					uni.showToast({
						title: '部分图片由于网络原因失败',
						icon: 'none'
					});
				}
			},
		});
	};

	/**
	 * [方法] 删除已选择的图片
	 * @param {Number} index 索引
	 */
	const deleteImage = (index) => {
		uni.showModal({
			title: '操作提示',
			content: '确定要从建议中移除此图片吗？',
			success: (res) => {
				if (res.confirm) {
					suggestion.images.splice(index, 1);
				}
			}
		});
	};

	/**
	 * [方法] 调起全屏图片预览
	 * @param {Number} index 当前索引
	 */
	const previewImage = (index) => {
		uni.previewImage({
			urls: suggestion.images,
			current: index
		});
	};

	/**
	 * [方法] 执行最终的提交动作
	 */
	const handleSubmit = async () => {
		// 二次防空校验
		if (!suggestion.title.trim()) return uni.showToast({
			title: '标题不能为空',
			icon: 'none'
		});
		if (!suggestion.content.trim()) return uni.showToast({
			title: '内容不能为空',
			icon: 'none'
		});

		isLoading.value = true;

		try {
			// 组装提交给后端的 Payload
			const postData = {
				id: isEditMode.value ? suggestionId.value : 0, // 编辑模式传原ID，新建传0
				title: suggestion.title,
				content: suggestion.content,
				img: suggestion.images.join(',') // 将图片数组转换回逗号分隔的字符串
			};

			// 动态分流接口与请求方法
			const apiPath = isEditMode.value ? '/app-api/member/suggestion/update' :
				'/app-api/member/suggestion/create';
			const apiMethod = isEditMode.value ? 'PUT' : 'POST';

			const {
				error
			} = await request(apiPath, {
				method: apiMethod,
				data: postData
			});

			if (error) {
				uni.showToast({
					title: `操作失败: ${error}`,
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: isEditMode.value ? '资料已更新' : '提交成功，感谢共建！',
					icon: 'success'
				});

				// 成功后延迟返回，确保用户看到提示。返回列表会自动触发列表的 onShow 刷新。
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		} catch (e) {
			uni.showToast({
				title: '网络连接异常，请重试',
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
		}
	};
</script>

<style lang="scss" scoped>
	/* 页面基础容器 */
	.page-container {
		padding: 32rpx;
		background-color: #f7f8fa;
		min-height: 100vh;
	}

	/* 表单背景卡片 */
	.card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		align-items: center;
		padding-bottom: 24rpx;
		margin-bottom: 30rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.card-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #303133;
		margin-left: 16rpx;
	}

	/* 表单项布局 */
	.form-item {
		margin-bottom: 40rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.label {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 16rpx;
		display: block;
	}

	/* 输入框样式 */
	.input-field {
		height: 96rpx;
		line-height: 96rpx;
		font-size: 28rpx;
		padding: 0 24rpx;
		background-color: #f5f7fa;
		border-radius: 16rpx;
	}

	.textarea-field {
		width: 100%;
		height: 320rpx;
		font-size: 28rpx;
		padding: 24rpx;
		background-color: #f5f7fa;
		border-radius: 16rpx;
		box-sizing: border-box;
		line-height: 1.6;
	}

	.char-counter {
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	/* 底部奖励提示条 */
	.tips-section {
		display: flex;
		align-items: center;
		padding: 24rpx 30rpx;
		background-color: #fff8f2;
		border-radius: 16rpx;
		margin-top: 40rpx;
	}

	.tips-text {
		color: v-bind(themeColor);
		font-size: 26rpx;
		margin-left: 16rpx;
		font-weight: 500;
	}

	/* 提交按钮美化 */
	.submit-button {
		margin-top: 60rpx;
		background-color: v-bind(themeColor);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 50rpx;
		height: 100rpx;
		line-height: 100rpx;
		box-shadow: 0 8rpx 20rpx rgba(254, 106, 0, 0.2);
		transition: transform 0.2s, opacity 0.3s;

		&[disabled] {
			background-color: #fabba0;
			color: #ffffff;
			opacity: 0.6;
			box-shadow: none;
		}

		&:active {
			transform: scale(0.98);
		}

		&::after {
			border: none;
		}
	}

	/* 图片九图网格布局样式 */
	.image-preview {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-top: 10rpx;
	}

	.image-wrapper {
		position: relative;
		width: 154rpx; // 适配常规屏幕宽度的3列排布
		height: 154rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #eee;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.delete-image-btn {
		position: absolute;
		top: 0;
		right: 0;
		width: 44rpx;
		height: 44rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border-bottom-left-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		z-index: 10;
	}

	.add-img-placeholder {
		width: 154rpx;
		height: 154rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999;
		background-color: #fafafa;
		font-size: 22rpx;
	}

	.hint {
		font-size: 22rpx;
		color: #BBB;
		margin-top: 12rpx;
		display: block;
	}
</style>