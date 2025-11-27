<template>
	<view class="page-container">
		<!-- 状态显示区域 -->
		<view v-if="isLoading" class="status-view loading-view">
			<uni-load-more status="loading" :contentText="{ contentrefresh: initialStatusText }"></uni-load-more>
		</view>
		<view v-else-if="errorMsg" class="status-view error-view">
			<uni-icons type="closeempty" size="50" color="#e43d33"></uni-icons>
			<text class="error-text">{{ errorMsg }}</text>
		</view>

		<!-- 表单内容区域 -->
		<template v-else>
			<view class="form-card">
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

			<button class="save-btn" @click="submitForm" :loading="isSaving">
				{{ isSaving ? '保存中...' : '保存设置' }}
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
		isMergeBusinessFriend: 0, // 默认 0 (不融合)
	});

	const isLoading = ref(true);
	const isSaving = ref(false);
	const errorMsg = ref('');
	const initialStatusText = ref('正在检查权限...');

	// --- 生命周期 ---
	onLoad(async () => {
		uni.setNavigationBarTitle({
			title: '首页定制'
		});

		// 现在的逻辑非常简单：直接加载用户的定制信息即可
		// 因为支付确认流程已经前置到了首页
		try {
			await fetchCustomizationData();
		} catch (e) {
			errorMsg.value = e.message || '页面加载失败';
		} finally {
			isLoading.value = false;
		}
	});

	// --- 核心业务函数 ---
	const handlePayment = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/pay-business-friend-auth', {
			method: 'POST',
		});

		if (error) {
			errorMsg.value = error;
			isLoading.value = false; // 停止加载，显示错误
			return false; // 返回失败
		}

		uni.showToast({
			title: '权限开通成功！',
			icon: 'success'
		});
		return true; // 返回成功
	};

	const fetchCustomizationData = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET',
		});

		if (error) {
			throw new Error(error); // 抛出错误，由 onLoad 的 catch 块统一处理
		}

		if (data) {
			form.homeTitle = data.homeTitle || '';
			form.homeSlogan = data.homeSlogan || '';
			form.isMergeBusinessFriend = data.isMergeBusinessFriend || 0;
		}
	};

	const onMergeSwitchChange = (e) => {
		form.isMergeBusinessFriend = e.detail.value ? 1 : 0;
	};

	const submitForm = async () => {
		if (isSaving.value) return;
		isSaving.value = true;
		uni.showLoading({
			title: '正在保存...'
		});

		try {
			// 定义两个请求任务
			const tasks = [];

			// 1. 调用 update 接口修改标题和口号
			// 注意：这里不再传 isMergeBusinessFriend，因为它由专用接口处理
			const updateTask = request('/app-api/member/user/update', {
				method: 'PUT',
				data: {
					homeTitle: form.homeTitle,
					homeSlogan: form.homeSlogan,
				}
			});
			tasks.push(updateTask);

			// 2. 调用 edit-business-friend-auth 接口修改融合权限
			// 注意：根据文档，isMergeBusinessFriend 是 Query 参数
			// 所以 URL 要拼接为 /.../edit-business-friend-auth?isMergeBusinessFriend=1
			const authUrl =
				`/app-api/member/user/edit-business-friend-auth?isMergeBusinessFriend=${form.isMergeBusinessFriend}`;
			const authTask = request(authUrl, {
				method: 'POST'
			});
			tasks.push(authTask);

			// 3. 并行执行所有请求
			const results = await Promise.all(tasks);

			// 4. 检查结果
			// results[0] 是 update 的结果, results[1] 是 auth 的结果
			const updateRes = results[0];
			const authRes = results[1];

			// 只要有一个失败，就视为保存不完全成功（或者你可以根据业务决定只要其中一个成功也行）
			if (updateRes.error || authRes.error) {
				// 拼接错误信息
				const errorMsg = (updateRes.error || '') + (authRes.error ? (' ' + authRes.error) : '');
				throw new Error(errorMsg || '部分设置保存失败');
			}

			// 5. 全部成功
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
			uni.$emit('userInfoChanged'); // 通知其他页面更新
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);

		} catch (err) {
			console.error('保存设置失败:', err);
			uni.showToast({
				title: typeof err === 'string' ? err : (err.message || '保存失败'),
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

	.error-view {
		color: #e43d33;

		.error-text {
			margin-top: 20rpx;
			font-size: 30rpx;
		}
	}

	.form-card {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
	}

	.switch-container {
		display: flex;
		align-items: center;
	}

	.switch-labels {
		margin-left: 20rpx;

		.label-text {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
		}

		.label-hint {
			display: block;
			font-size: 24rpx;
			color: #999;
			margin-top: 5rpx;
		}
	}

	.save-btn {
		margin-top: 60rpx;
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		color: white;
		background: linear-gradient(to right, #FF8C00, #FF6B00);

		&::after {
			border: none;
		}
	}
</style>