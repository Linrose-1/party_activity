<template>
	<view class="container">
		<view class="auth-card">
			<view class="card-header">
				<text class="title">实名认证</text>
				<text class="subtitle">为了保障您的账户安全，请完成实名认证</text>
			</view>

			<uni-forms ref="formRef" :modelValue="form" :rules="rules" class="form-content">
				<uni-forms-item label="真实姓名" name="cardName">
					<uni-easyinput v-model="form.cardName" placeholder="请输入您的真实姓名" />
				</uni-forms-item>
				<uni-forms-item label="身份证号" name="idCard">
					<uni-easyinput v-model="form.idCard" placeholder="请输入您的身份证号码" />
				</uni-forms-item>
			</uni-forms>

			<button class="submit-btn" @click="submitForm">立即认证</button>

			<view class="tips">
				<text>信息仅用于实名认证，我们将严格保密，请放心填写。</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import request from '../../utils/request.js'; // 引入我们熟悉的 request 工具

	// 表单实例引用
	const formRef = ref(null);

	// 表单数据
	const form = ref({
		cardName: '',
		idCard: '',
	});

	// 表单校验规则
	const rules = {
		cardName: {
			rules: [{
				required: true,
				errorMessage: '请输入真实姓名',
			}],
		},
		idCard: {
			rules: [{
				required: true,
				errorMessage: '请输入身份证号码',
			}, {
				// 使用正则表达式校验18位身份证号码格式
				pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
				errorMessage: '身份证号码格式不正确',
			}],
		},
	};

	// 提交表单的方法
	const submitForm = () => {
		// 调用 uni-forms 的 validate 方法进行校验
		formRef.value.validate().then(async () => {
			uni.showLoading({
				title: '认证中...',
				mask: true
			});

			// 调用我们熟悉的接口文档中的实名认证接口
			const {
				data,
				error
			} = await request('/app-api/member/user/bind-user-card', {
				method: 'POST',
				data: form.value, // 直接将表单数据作为请求体
			});

			uni.hideLoading();

			if (error) {
				// 如果有错误，显示后端返回的错误信息
				uni.showToast({
					title: error || '认证失败，请重试',
					icon: 'none',
				});
			} else {
				// 认证成功
				uni.showToast({
					title: '实名认证成功！',
					icon: 'success',
				});

				// 延迟 1.5 秒后返回上一页
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		}).catch(err => {
			console.log('表单校验失败：', err);
		});
	};
</script>

<style scoped lang="scss">
	.container {
		padding: 40rpx;
		background-color: #f5f5f5;
		height: 100vh;
	}

	.auth-card {
		background-color: #fff;
		padding: 40rpx;
		border-radius: 20rpx;
	}

	.card-header {
		text-align: center;
		margin-bottom: 50rpx;

		.title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
		}

		.subtitle {
			font-size: 26rpx;
			color: #999;
			margin-top: 10rpx;
			display: block;
		}
	}

	.form-content {
		::v-deep .uni-forms-item__label {
			width: 180rpx !important;
		}
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		color: white;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		margin-top: 40rpx;

		&::after {
			border: none;
		}
	}

	.tips {
		margin-top: 30rpx;
		font-size: 24rpx;
		color: #b2b2b2;
		text-align: center;
	}
</style>