<template>
	<view class="login-container">
		<view class="header">
			<!-- 您可以替换成项目的真实Logo -->
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="welcome-text">欢迎来到聚一聚</text>
			<text class="slogan-text">链接商机，共创未来</text>
		</view>

		<view class="form-wrapper">
			<!-- 手机号 -->
			<view class="form-item">
				<uni-icons type="phone-filled" size="22" color="#FF7600"></uni-icons>
				<text class="label">手机号</text>
				<!-- 使用 button 来触发微信手机号授权 -->
				<button v-if="!phoneCode" class="get-phone-btn" open-type="getPhoneNumber"
					@getphonenumber="getPhoneNumber">
					点击获取微信手机号
				</button>
				<text v-else class="input-display">已授权</text>
			</view>

			<!-- 用户名 (微信昵称) -->
			<view class="form-item">
				<uni-icons type="person-filled" size="22" color="#FF7600"></uni-icons>
				<text class="label">用户名</text>
				<button v-if="!userInfo.nickName" class="get-name-btn" @tap="getUserProfile">
					授权获取微信昵称
				</button>
				<view v-else class="user-profile-display">
					<image :src="userInfo.avatarUrl" class="mini-avatar"></image>
					<text class="input-display">{{ userInfo.nickName }}</text>
				</view>
			</view>

			<!-- 真实姓名 -->
			<view class="form-item">
				<uni-icons type="staff-filled" size="22" color="#FF7600"></uni-icons>
				<text class="label">真实姓名</text>
				<input v-model="realName" class="input" type="text" placeholder="请输入您的真实姓名"
					placeholder-class="placeholder" />
			</view>

			<!-- 邀请码 -->
			<view class="form-item">
				<uni-icons type="paperplane-filled" size="22" color="#FF7600"></uni-icons>
				<text class="label">邀请码</text>
				<input v-model="inviteCode" class="input" type="text" placeholder="请输入邀请码 (选填)"
					placeholder-class="placeholder" />
			</view>
		</view>

		<view class="actions-wrapper">
			<view class="agreement-section">
				<checkbox-group @change="agreeChange">
					<label>
						<checkbox :checked="agreed" color="#FF7600" style="transform:scale(0.7)" />
						<text class="agreement-text">我已阅读并同意<text class="link">《用户协议》</text>和<text
								class="link">《隐私政策》</text></text>
					</label>
				</checkbox-group>
			</view>

			<!-- 登录按钮 -->
			<button class="login-btn" :disabled="isLoginDisabled" @tap="handleLogin" @click="Login">
				立即登录
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import request from '../../utils/request.js';

	// --- 状态管理 ---
	const phoneCode = ref('15819823202'); // 用于存储 getPhoneNumber 返回的 code
	const userInfo = ref({}); // 存储微信用户信息
	const realName = ref('buzhidao');
	const inviteCode = ref('15819823202');
	const agreed = ref(false); // 是否同意协议

	// --- 计算属性 ---
	// 控制登录按钮是否可用的计算属性
	const isLoginDisabled = computed(() => {
		return !phoneCode.value || !userInfo.value.nickName || !realName.value || !agreed.value;
	});

	// --- 方法 ---

	/**
	 * @description 获取用户微信绑定的手机号
	 * @param {object} e - 事件对象，包含 code
	 */
	const getPhoneNumber = (e) => {
		if (e.detail.code) {
			console.log('✅ 获取手机号凭证 (code) 成功:', e.detail.code);
			phoneCode.value = e.detail.code;
			uni.showToast({
				title: '手机号授权成功',
				icon: 'none'
			});
		} else {
			console.error('❌ 用户拒绝了手机号授权:', e.detail.errMsg);
			uni.showToast({
				title: '您拒绝了授权',
				icon: 'error'
			});
		}
	};

	/**
	 * @description 获取用户微信昵称和头像
	 */
	const getUserProfile = () => {
		uni.getUserProfile({
			desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，必填
			success: (res) => {
				console.log('✅ 获取用户信息成功:', res.userInfo);
				userInfo.value = res.userInfo;
				uni.showToast({
					title: '昵称授权成功',
					icon: 'none'
				});
			},
			fail: (err) => {
				console.error('❌ 用户拒绝了信息授权:', err);
				uni.showToast({
					title: '您拒绝了授权',
					icon: 'error'
				});
			}
		});
	};

	/**
	 * @description 处理同意协议的 checkbox 变化
	 */
	const agreeChange = (e) => {
		agreed.value = e.detail.value.length > 0;
	};

	/**
	 * @description 处理登录逻辑
	 */
	const handleLogin = () => {
		if (isLoginDisabled.value) {
			uni.showToast({
				title: '请先完善信息并同意协议',
				icon: 'none'
			});
			return;
		}

		uni.showLoading({
			title: '登录中...'
		});

		// 准备提交到后端的数据
		const loginData = {
			phone_code: phoneCode.value,
			nickname: userInfo.value.nickName,
			avatar: userInfo.value.avatarUrl,
			real_name: realName.value,
			invite_code: inviteCode.value
		};

		console.log('🚀 准备提交的登录数据:', loginData);

		// 模拟网络请求
		setTimeout(() => {
			uni.hideLoading();
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			});
			// 登录成功后，跳转到“我的”页面，这里使用 switchTab，因为“我的”通常是 TabBar 页面
			uni.switchTab({
				url: '/pages/profile/profile' // 请确保这个路径是您“我的”页面的正确路径
			});
		}, 1500);
	};


	const Login = async () => {
	  try {
	    // 调用封装的请求方法
	    console.log("params", inviteCode.value, realName.value)
	    const result = await request('/app-api/member/auth/login', {
	      method: 'POST', // 请求方式
	      data: {
	        mobile: inviteCode.value,
	        password: realName.value
	      }
	    });
	    
	    // 如果请求成功，打印返回的数据
	    console.log('Login result:', result);
	
	    // 判断登录是否成功（根据你的返回数据结构，error为null且存在accessToken表示成功）
	    if (!result.error && result.data && result.data.accessToken) {
	      // 存储accessToken
	      uni.setStorageSync('token', result.data.accessToken);
	      
	      // 跳转到首页
	      uni.reLaunch({
	        url: '/pages/home/home'
	      });
	    } else {
	      // 登录失败处理
	      console.log('登录失败:', result.error || '未知错误');
	      // 这里可以添加失败提示，比如toast提示用户
	      uni.showToast({
	        title: '登录失败',
	        icon: 'none'
	      });
	    }
	  } catch (error) {
	    // 捕获异常
	    console.error('登录请求异常:', error);
	    uni.showToast({
	      title: '请求异常，请重试',
	      icon: 'none'
	    });
	  }
	};
</script>

<style lang="scss" scoped>
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		min-height: 100vh;
		background: #f8f9fa;
		padding: 80rpx 50rpx 50rpx;
		box-sizing: border-box;
	}

	.header {
		text-align: center;
		margin-bottom: 60rpx;

		.logo {
			width: 150rpx;
			height: 150rpx;
			border-radius: 50%;
			margin-bottom: 20rpx;
			// 如果没有logo，可以显示一个简单的背景色
			background-color: #eee;
		}

		.welcome-text {
			display: block;
			font-size: 48rpx;
			font-weight: bold;
			color: #333;
		}

		.slogan-text {
			display: block;
			font-size: 28rpx;
			color: #999;
			margin-top: 10rpx;
		}
	}

	.form-wrapper {
		width: 100%;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 20rpx 40rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.form-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.label {
			width: 150rpx;
			font-size: 30rpx;
			color: #333;
			margin-left: 20rpx;
		}

		.input {
			flex: 1;
			font-size: 30rpx;
			color: #333;
		}

		.placeholder {
			color: #ccc;
		}

		.input-display {
			font-size: 30rpx;
			color: #333;
		}

		.get-phone-btn,
		.get-name-btn {
			flex: 1;
			background: none;
			border: none;
			text-align: left;
			padding: 0;
			margin: 0;
			font-size: 30rpx;
			color: #007aff; // 使用蓝色提示可点击
			line-height: 1.5;

			&::after {
				border: none;
			}
		}

		.user-profile-display {
			display: flex;
			align-items: center;

			.mini-avatar {
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				margin-right: 15rpx;
			}
		}
	}

	.actions-wrapper {
		width: 100%;
		margin-top: 60rpx;
	}

	.agreement-section {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 40rpx;

		.agreement-text {
			font-size: 24rpx;
			color: #999;
		}

		.link {
			color: #FF7600;
			text-decoration: underline;
		}
	}

	.login-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
		background: linear-gradient(135deg, #FF8C00, #FF7600);
		box-shadow: 0 10rpx 30rpx rgba(255, 118, 0, 0.3);
		transition: all 0.3s ease;

		&[disabled] {
			background: #fabd8d;
			box-shadow: none;
			color: #fff;
			opacity: 0.8;
		}

		&::after {
			border: none;
		}
	}
</style>