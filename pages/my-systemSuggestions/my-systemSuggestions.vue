<!-- pages/suggestion/suggestion.vue -->
<template>
	<view class="page-container">
		<view class="card">
			<view class="card-header">
				<uni-icons type="paperplane-filled" size="24" :color="themeColor"></uni-icons>
				<text class="card-title">提交您的建议</text>
			</view>

			<view class="form-item">
				<text class="label">建议标题</text>
				<input class="input-field" v-model.trim="suggestion.title" placeholder="一句话概括您的建议"
					maxlength="30" />
			</view>

			<view class="form-item">
				<text class="label">建议内容</text>
				<textarea class="textarea-field" v-model.trim="suggestion.content"
					placeholder="请详细描述您的建议或发现的问题，帮助我们更好地改进系统~" maxlength="500" />
				<view class="char-counter">{{ suggestion.content.length }}/500</view>
			</view>
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
import request from '@/utils/request.js'; // 导入您封装的 request 方法

const themeColor = '#FE6A00';

// 使用 reactive 创建响应式对象来存储表单数据
const suggestion = reactive({
	title: '',
	content: ''
});

const isLoading = ref(false);

// 计算属性，判断按钮是否应被禁用
const isButtonDisabled = computed(() => {
	return !suggestion.title || !suggestion.content || isLoading.value;
});

// 处理提交逻辑的函数
const handleSubmit = async () => {
	// 1. 基础校验
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
		// 2. 调用您封装的 request 方法来提交数据
		const { data, error } = await request('/app-api/member/suggestion/create', {
			method: 'POST',
			data: {
				title: suggestion.title,
				content: suggestion.content
			}
		});
		
		if (error) {
			// 如果请求封装返回了错误信息
			uni.showToast({ title: error, icon: 'none' });
		} else {
			// 3. 提交成功处理
			uni.showToast({
				title: '感谢您的建议！',
				icon: 'success'
			});
			
			// 清空表单
			suggestion.title = '';
			suggestion.content = '';
			
			// 延迟 1.5 秒后返回上一页
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}

	} catch (e) {
		// 捕获预料之外的错误
		uni.showToast({ title: '提交失败，请稍后再试', icon: 'none' });
	} finally {
		// 4. 无论成功失败，都结束加载状态
		isLoading.value = false;
	}
};
</script>

<style lang="scss" scoped>
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
		box-sizing: border-box; // 确保 padding 不会撑大元素
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
		background-color: #fff8f2; // 主题色的浅色背景
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
			background-color: #fabba0; // 禁用时的颜色
			color: #ffffff;
			opacity: 0.7;
		}

		&::after {
			border: none;
		}
	}
</style>