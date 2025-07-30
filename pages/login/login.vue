<template>
	<view class="login-page">
		<!-- 顶部区域 - 沿用商机页面的视觉风格 -->
		<view class="header">
			<view class="app-title">欢迎回来</view>
			<view class="app-subtitle">登录猩聚社，连接无限商机</view>
		</view>

		<!-- 登录表单区域 -->
		<view class="login-form-container">
			<view class="form-title">手机号登录</view>

			<!-- 手机号输入框 -->
			<view class="input-group">
				<uni-icons type="person" size="22" color="#999"></uni-icons>
				<input class="input-field" type="number" v-model="mobile" placeholder="请输入手机号" maxlength="11" />
			</view>

			<!-- 密码输入框 -->
			<view class="input-group">
				<uni-icons type="locked" size="22" color="#999"></uni-icons>
				<input class="input-field" type="password" v-model="password" placeholder="请输入密码" />
			</view>

			<!-- 登录按钮 -->
			<button class="login-button" @click="handleLogin" :loading="isLoading" :disabled="isLoading">
				{{ isLoading ? '登录中...' : '立即登录' }}
			</button>

			<!-- 其他操作链接 -->
			<view class="form-links">
				<text class="link-item" @click="goToRegister">注册新账号</text>
				<text class="link-item" @click="goToForgotPassword">忘记密码?</text>
			</view>
		</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	// 引入您封装的 request 工具
	import request from '../../utils/request.js';

	// 定义响应式变量
	const mobile = ref('');
	const password = ref('');
	const isLoading = ref(false);

	/**
	 * @description 处理登录逻辑
	 */
	const handleLogin = async () => {
		// 1. 前端输入验证
		if (!mobile.value) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			});
			return;
		}
		if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(mobile.value)) {
			uni.showToast({
				title: '请输入正确的手机号格式',
				icon: 'none'
			});
			return;
		}
		if (!password.value) {
			uni.showToast({
				title: '请输入密码',
				icon: 'none'
			});
			return;
		}

		// 2. 设置加载状态，防止重复点击
		isLoading.value = true;

		// 3. 准备API请求参数 (仅包含手机号和密码)
		const requestData = {
			mobile: mobile.value,
			password: password.value,
		};

		// 4. 调用API
		try {
			// 使用您封装的 request 工具发起请求
			const { data, error } = await request('/app-api/member/auth/login', {
				method: 'POST',
				data: requestData
			});
			
			// 5. 处理响应
			if (error) {
				// 请求失败（业务错误或网络错误），request 工具已将错误信息标准化
				uni.showToast({
					title: error,
					icon: 'none',
					duration: 2000
				});
			} else {
				// 请求成功
				uni.showToast({
					title: '登录成功！',
					icon: 'success'
				});

				// 存储Token和用户信息到本地存储，供其他页面使用
				uni.setStorageSync('token', data.accessToken);
				uni.setStorageSync('userId', data.userId);
				uni.setStorageSync('refreshToken', data.refreshToken);

				// 登录成功后，延时跳转到主页（例如商机发现页）
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/home/home'
					});
				}, 1500);
			}

		} catch (e) {
			// 兜底的异常处理
			uni.showToast({
				title: '发生未知错误，请稍后重试',
				icon: 'none'
			});
		} finally {
			// 无论成功或失败，最后都结束加载状态
			isLoading.value = false;
		}
	};

	// 跳转到注册页 (占位)
	const goToRegister = () => {
		uni.showToast({
			title: '功能开发中...',
			icon: 'none'
		});
		// 实际跳转逻辑:
		// uni.navigateTo({ url: '/pages/register/register' });
	};

	// 跳转到忘记密码页 (占位)
	const goToForgotPassword = () => {
		uni.showToast({
			title: '功能开发中...',
			icon: 'none'
		});
		// 实际跳转逻辑:
		// uni.navigateTo({ url: '/pages/forgot-password/forgot-password' });
	};
</script>

<style scoped>
	.login-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f7f8fa;
	}

	/* 头部样式 - 复用并微调 */
	.header {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		padding: 80rpx 40rpx 120rpx;
		border-radius: 0 0 60rpx 60rpx;
		text-align: center;
		position: relative;
	}
	
	.header::before {
		content: "";
		position: absolute;
		top: -60rpx;
		left: -80rpx;
		width: 240rpx;
		height: 240rpx;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 50%;
	}
	
	.header::after {
		content: "";
		position: absolute;
		bottom: 20rpx;
		right: -50rpx;
		width: 180rpx;
		height: 180rpx;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
	}

	.app-title {
		font-size: 56rpx;
		font-weight: 700;
		margin-bottom: 16rpx;
	}

	.app-subtitle {
		font-size: 32rpx;
		opacity: 0.9;
	}

	/* 表单容器 */
	.login-form-container {
		background-color: #ffffff;
		margin: -60rpx 40rpx 0;
		padding: 50rpx 40rpx;
		border-radius: 30rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
		position: relative;
		z-index: 10;
	}

	.form-title {
		font-size: 40rpx;
		font-weight: 600;
		color: #333;
		text-align: center;
		margin-bottom: 60rpx;
	}

	/* 输入框组 */
	.input-group {
		display: flex;
		align-items: center;
		border-bottom: 2rpx solid #eee;
		padding: 20rpx 0;
		margin-bottom: 40rpx;
	}

	.input-group uni-icons {
		margin-right: 20rpx;
	}

	.input-field {
		flex: 1;
		font-size: 32rpx;
		color: #333;
		border: none;
		outline: none;
		padding: 10rpx 0;
	}

	/* 登录按钮 */
	.login-button {
		width: 100%;
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		border-radius: 50rpx;
		font-size: 34rpx;
		font-weight: 600;
		padding: 24rpx 0;
		margin-top: 40rpx;
		box-shadow: 0 8rpx 20rpx rgba(255, 106, 0, 0.3);
		transition: all 0.2s ease;
	}
	
	.login-button::after {
		border: none;
	}

	.login-button[disabled] {
		background: #fabca1;
		box-shadow: none;
	}
	
	.login-button:active {
		opacity: 0.9;
		transform: scale(0.98);
	}

	/* 其他链接 */
	.form-links {
		display: flex;
		justify-content: space-between;
		margin-top: 40rpx;
		font-size: 28rpx;
		color: #999;
	}

	.link-item {
		padding: 10rpx;
	}
</style>