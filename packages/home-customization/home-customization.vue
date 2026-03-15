<template>
	<view class="page-container">
		<!-- 状态显示区域 -->
		<view v-if="isLoading" class="status-view loading-view">
			<uni-load-more status="loading" contentText="正在加载设置..."></uni-load-more>
		</view>
		<view v-else-if="errorMsg" class="status-view error-view">
			<uni-icons type="closeempty" size="50" color="#e43d33"></uni-icons>
			<text class="error-text">{{ errorMsg }}</text>
		</view>

		<!-- 表单内容区域 -->
		<template v-else>
			<view class="form-card">
				<view class="payment-tip" v-if="!isPaidUser">
					<uni-icons type="info" size="14" color="#FF6A00"></uni-icons>
					<text>提示：首次保存定制内容需支付 10 智米</text>
				</view>

				<uni-forms ref="formRef" :modelValue="form" :label-width="100">
					<uni-forms-item label="商友圈标题" name="homeTitle">
						<uni-easyinput v-model="form.homeTitle" placeholder="请输入自定义商友圈标题" />
					</uni-forms-item>

					<uni-forms-item label="商友圈口号" name="homeSlogan">
						<uni-easyinput type="textarea" v-model="form.homeSlogan" placeholder="请输入自定义商友圈口号" />
					</uni-forms-item>

					<uni-forms-item label="商友圈模式" name="isMergeBusinessFriend">
						<view class="switch-container">
							<switch :checked="form.isMergeBusinessFriend === 1" @change="onMergeSwitchChange"
								color="#FF6A00" />
							<view class="switch-labels">
								<text
									class="label-text">{{ form.isMergeBusinessFriend === 1 ? '融合模式' : '非融合模式' }}</text>
								<text
									class="label-hint">{{ form.isMergeBusinessFriend === 1 ? '共享您的商友资源，也将获得平台共享的商友资源' : '您不共享您的商友资源，您也不能获得平台共享的商友资源' }}</text>
							</view>
						</view>
					</uni-forms-item>
				</uni-forms>
			</view>

			<button class="save-btn" @click="handleSaveClick" :loading="isSaving">
				{{ isSaving ? '处理中...' : '保存设置' }}
			</button>
		</template>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	// --- 状态管理 ---
	const formRef = ref(null);
	const form = reactive({
		homeTitle: '',
		homeSlogan: '',
		isMergeBusinessFriend: 0,
	});

	const isLoading = ref(true);
	const isSaving = ref(false);
	const isPaidUser = ref(false); // 标记用户是否已支付过 10 智米
	const errorMsg = ref('');

	// --- 生命周期 ---
	onLoad(async () => {
		uni.setNavigationBarTitle({
			title: '首页定制'
		});
		try {
			await fetchCustomizationData();
		} catch (e) {
			errorMsg.value = e.message || '页面加载失败';
		} finally {
			isLoading.value = false;
		}
	});

	/**
	 * 获取初始数据
	 */
	const fetchCustomizationData = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (error) throw new Error(error);

		if (data) {
			form.homeTitle = data.homeTitle || '';
			form.homeSlogan = data.homeSlogan || '';
			form.isMergeBusinessFriend = data.isMergeBusinessFriend || 0;
			// 重要：记录支付状态。payBusinessFriendAuth 为 1 表示已支付过
			isPaidUser.value = data.payBusinessFriendAuth === 1;
		}
	};

	const onMergeSwitchChange = (e) => {
		form.isMergeBusinessFriend = e.detail.value ? 1 : 0;
	};

	/**
	 * 保存按钮点击入口
	 */
	const handleSaveClick = async () => {
		if (isSaving.value) return;

		// 1. 基础校验
		if (!form.homeTitle.trim()) {
			return uni.showToast({
				title: '请输入标题',
				icon: 'none'
			});
		}

		// 2. 支付拦截逻辑
		if (!isPaidUser.value) {
			uni.showModal({
				title: '确认定制',
				content: '开通首页定制功能需支付 10 智米，是否确认支付并保存设置？',
				confirmText: '确认支付',
				confirmColor: '#FF6A00',
				success: async (res) => {
					if (res.confirm) {
						await executePaymentAndSave();
					}
				}
			});
		} else {
			// 已支付用户直接保存
			await executeSaveProcess();
		}
	};

	/**
	 * 执行支付并保存（针对未支付用户）
	 */
	const executePaymentAndSave = async () => {
		isSaving.value = true;
		uni.showLoading({
			title: '正在支付...'
		});

		try {
			// A. 调用支付接口
			const payRes = await request('/app-api/member/user/pay-business-friend-auth', {
				method: 'POST',
			});

			if (payRes.error) {
				throw new Error(payRes.error || '支付失败，请检查智米余额');
			}

			// B. 支付成功后，标记为已支付，并执行保存流程
			isPaidUser.value = true;
			await executeSaveProcess();

		} catch (err) {
			uni.hideLoading();
			isSaving.value = false;
			uni.showModal({
				title: '支付失败',
				content: err.message || '智米不足或系统异常',
				showCancel: false
			});
		}
	};

	/**
	 * 核心保存逻辑（更新接口）
	 */
	const executeSaveProcess = async () => {
		isSaving.value = true;
		uni.showLoading({
			title: '正在保存设置...'
		});

		try {
			// 1. 更新标题和口号
			const updateTask = request('/app-api/member/user/update', {
				method: 'PUT',
				data: {
					homeTitle: form.homeTitle,
					homeSlogan: form.homeSlogan,
				}
			});

			// 2. 更新融合模式状态
			const authUrl =
				`/app-api/member/user/edit-business-friend-auth?isMergeBusinessFriend=${form.isMergeBusinessFriend}`;
			const authTask = request(authUrl, {
				method: 'POST'
			});

			// 并行处理
			const [updateRes, authRes] = await Promise.all([updateTask, authTask]);

			if (updateRes.error || authRes.error) {
				throw new Error('部分设置保存失败');
			}

			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
			uni.$emit('userInfoChanged');

			setTimeout(() => {
				uni.navigateBack();
			}, 1500);

		} catch (err) {
			uni.showToast({
				title: err.message || '保存失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
			isSaving.value = false;
		}
	};
</script>

<style scoped lang="scss">
	.page-container {
		padding: 30rpx;
		background-color: #f9f9f9;
		min-height: 100vh;
	}

	.status-view {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.form-card {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	.payment-tip {
		background-color: #FFF5EE;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;

		text {
			font-size: 24rpx;
			color: #FF6A00;
			font-weight: 500;
		}
	}

	.switch-container {
		display: flex;
		align-items: center;
	}

	.switch-labels {
		margin-left: 20rpx;
		flex: 1;

		.label-text {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
		}

		.label-hint {
			display: block;
			font-size: 22rpx;
			color: #999;
			margin-top: 5rpx;
			line-height: 1.4;
		}
	}

	.save-btn {
		margin-top: 60rpx;
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: white;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		box-shadow: 0 10rpx 20rpx rgba(255, 107, 0, 0.2);

		&::after {
			border: none;
		}

		&:active {
			opacity: 0.9;
		}
	}

	.error-view {
		color: #e43d33;

		.error-text {
			margin-top: 20rpx;
			font-size: 30rpx;
		}
	}
</style>