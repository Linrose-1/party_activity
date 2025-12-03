<template>
	<view class="container">
		<!-- 1. Tab 切换 -->
		<view class="tab-container">
			<view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">猩球认证</view>
			<view class="tab-item" :class="{ active: activeTab === 2 }" @click="activeTab = 2">实名认证</view>
		</view>

		<!-- ====================================================== -->
		<!-- ============      猩球认证内容 (Tab 1)      ============ -->
		<!-- ====================================================== -->
		<view v-if="activeTab === 1" class="auth-content">
			<view class="auth-card">
				<!-- 历史记录查询入口 (预留) -->
				<!-- <view class="history-link" @click="queryHistory">
					<uni-icons type="calendar" size="16" color="#007aff"></uni-icons>
					<text>查询历史认证</text>
				</view> -->

				<uni-forms ref="certFormRef" :modelValue="certForm" class="form-content" :label-width="80">
					<!-- 认证类型 -->
					<uni-forms-item label="认证类型" required>
						<uni-data-checkbox v-model="certForm.certType" :localdata="certTypeOptions"></uni-data-checkbox>
					</uni-forms-item>

					<!-- 认证名称 -->
					<uni-forms-item label="认证名称" required>
						<uni-easyinput v-model="certForm.certName" placeholder="请输入企业/组织的全称" />
					</uni-forms-item>

					<!-- 上传资料 -->
					<uni-forms-item label="上传资料" required>
						<view class="image-preview">
							<view v-for="(img, i) in certForm.certImages" :key="i" class="image-wrapper">
								<image :src="img" mode="aspectFill" class="preview-img" @click="replaceCertImage(i)" />
								<view class="delete-image-btn" @click.stop="deleteCertImage(i)">×</view>
							</view>
							<view class="add-img-placeholder" @click="handleChooseCertImage"
								v-if="certForm.certImages.length < 6">
								<uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
								<text>添加图片</text>
							</view>
						</view>
						<view class="cert-remark">{{ certRemark }}</view>
					</uni-forms-item>
				</uni-forms>

				<button class="submit-btn" @click="submitCertForm" :loading="isSubmitting">
					{{ isSubmitting ? '提交中...' : '提交认证' }}
				</button>
			</view>
		</view>

		<!-- ====================================================== -->
		<!-- ============      实名认证内容 (Tab 2)      ============ -->
		<!-- ====================================================== -->
		<view v-if="activeTab === 2" class="auth-content">

			<view class="auth-card">

				<!-- 已认证状态展示 -->
				<view v-if="isRealNameAuth" class="verified-view">
					<uni-icons type="checkbox-filled" size="80" color="#4cd964"></uni-icons>
					<text class="verified-title">已完成实名认证</text>

					<view class="verified-info">
						<view class="info-row">
							<text class="label">真实姓名</text>
							<text class="value">{{ realNameForm.cardName }}</text>
						</view>
						<view class="info-row">
							<text class="label">身份证号</text>
							<text class="value">{{ realNameForm.idCard }}</text>
						</view>
					</view>

					<button class="submit-btn disabled-btn" disabled>已认证</button>
				</view>

				<!-- 未认证状态展示 (表单) -->
				<template v-else>
					<view class="card-header">
						<text class="title">实名认证</text>
						<text class="subtitle">为了保障您的账户安全，请完成实名认证</text>
					</view>

					<uni-forms ref="realNameFormRef" :modelValue="realNameForm" :rules="rules" class="form-content">
						<uni-forms-item label="真实姓名" name="cardName">
							<uni-easyinput v-model="realNameForm.cardName" placeholder="请输入您的真实姓名" />
						</uni-forms-item>
						<uni-forms-item label="身份证号" name="idCard">
							<uni-easyinput v-model="realNameForm.idCard" placeholder="请输入您的身份证号码" />
						</uni-forms-item>
					</uni-forms>

					<button class="submit-btn" @click="submitRealNameForm">立即认证</button>

					<view class="tips">
						<text>信息仅用于实名认证，我们将严格保密，请放心填写。</text>
					</view>
				</template>
			</view>
		</view>

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
	} from '@dcloudio/uni-app'; // 确保引入 onLoad
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js'; // 引入上传工具

	// --- 1. 全局与 Tab 管理 ---
	const activeTab = ref(1); // 默认显示猩球认证

	// --- 2. 猩球认证逻辑 ---
	const certFormRef = ref(null);
	const isSubmitting = ref(false);
	const certForm = reactive({
		certType: 1, // 1: 企业, 2: 其他
		certName: '',
		certImages: [], // 存储上传后的图片URL
	});
	const certTypeOptions = [{
		text: '企业认证',
		value: 1
	}, {
		text: '其他认证',
		value: 2
	}];

	// 动态备注计算属性
	const certRemark = computed(() => {
		if (certForm.certType === 1) {
			return '备注：有效的营业执照+盖公章、有效的品牌注册证书或有效的授权证书';
		}
		return '备注：请选择其他认证资料上传，平台用于认证之后打标签';
	});

	// 图片上传相关方法
	const handleChooseCertImage = async () => {
		if (certForm.certImages.length >= 6) {
			uni.showToast({
				title: '最多上传6张图片',
				icon: 'none'
			});
			return;
		}

		uni.chooseImage({
			count: 6 - certForm.certImages.length,
			sizeType: ['compressed'],
			success: async (res) => {
				uni.showLoading({
					title: '上传中...',
					mask: true
				});
				const uploadPromises = res.tempFiles.map(file => uploadFile(file, {
					directory: 'certification'
				}));
				const results = await Promise.all(uploadPromises);
				uni.hideLoading();

				results.forEach(result => {
					if (result.data) {
						certForm.certImages.push(result.data);
					} else {
						uni.showToast({
							title: '有图片上传失败',
							icon: 'none'
						});
					}
				});
			}
		});
	};

	const deleteCertImage = (index) => {
		certForm.certImages.splice(index, 1);
	};

	const replaceCertImage = (index) => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				uni.showLoading({
					title: '替换中...',
					mask: true
				});
				const result = await uploadFile(res.tempFiles[0], {
					directory: 'certification'
				});
				uni.hideLoading();
				if (result.data) {
					certForm.certImages[index] = result.data;
				} else {
					uni.showToast({
						title: '替换失败',
						icon: 'none'
					});
				}
			}
		});
	};

	// 提交猩球认证表单
	const submitCertForm = async () => {
		if (isSubmitting.value) return;
		// 1. 前端校验
		if (certForm.certName.trim() === '') {
			return uni.showToast({
				title: '请输入认证名称',
				icon: 'none'
			});
		}
		if (certForm.certImages.length === 0) {
			return uni.showToast({
				title: '请至少上传一张认证资料图片',
				icon: 'none'
			});
		}

		isSubmitting.value = true;
		uni.showLoading({
			title: '提交中...',
			mask: true
		});

		try {
			// 2. 构造请求体
			const payload = {
				certType: certForm.certType,
				certName: certForm.certName,
				certSource: certForm.certImages, // 将图片数组转为逗号分隔的字符串
			};

			// 3. 调用接口
			const {
				data,
				error
			} = await request('/app-api/member/user/cert', {
				method: 'POST',
				data: payload,
			});

			if (error) {
				throw new Error(error);
			}

			// 4. 成功处理
			uni.showToast({
				title: '认证资料提交成功！',
				icon: 'success'
			});
			setTimeout(() => {
				uni.navigateBack(); // 成功后返回上一页
			}, 1500);

		} catch (err) {
			uni.showToast({
				title: err.message || '提交失败，请重试',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
			uni.hideLoading();
		}
	};

	// 历史查询占位函数
	const queryHistory = () => {
		uni.showToast({
			title: '历史查询功能待开发',
			icon: 'none'
		});
	};

	// --- 3. 实名认证逻辑 (从您之前的代码迁移过来) ---
	const realNameFormRef = ref(null);
	const realNameForm = ref({
		cardName: '',
		idCard: '',
	});

	// 是否已实名认证的状态
	const isRealNameAuth = ref(false);

	// 加载用户信息
	onLoad(() => {
		fetchUserInfo();
	});

	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (!error && data) {
			// 检查是否已有身份证信息
			if (data.idCard && data.cardName) {
				isRealNameAuth.value = true;
				// 【修改】后端已脱敏，直接赋值
				realNameForm.value.cardName = data.cardName;
				realNameForm.value.idCard = data.idCard;
			}
		}
	};

	const rules = {
		cardName: {
			rules: [{
				required: true,
				errorMessage: '请输入真实姓名'
			}]
		},
		idCard: {
			rules: [{
				required: true,
				errorMessage: '请输入身份证号码'
			}, {
				pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
				errorMessage: '身份证号码格式不正确'
			}]
		},
	};
	const submitRealNameForm = () => {
		realNameFormRef.value.validate().then(async () => {
			uni.showLoading({
				title: '认证中...',
				mask: true
			});
			const {
				data,
				error
			} = await request('/app-api/member/user/bind-user-card', {
				method: 'POST',
				data: realNameForm.value,
			});
			uni.hideLoading();
			if (error) {
				uni.showToast({
					title: error || '认证失败，请重试',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: '实名认证成功！',
					icon: 'success'
				});
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
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.tab-container {
		display: flex;
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		font-size: 30rpx;
		color: #666;
		position: relative;
		transition: color 0.3s, font-weight 0.3s;

		&.active {
			color: #FF6A00;
			font-weight: bold;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 6rpx;
				background-color: #FF6A00;
				border-radius: 3rpx;
			}
		}
	}

	.auth-content {
		width: 100%;
	}

	.history-link {
		position: absolute;
		top: 30rpx;
		right: 30rpx;
		display: flex;
		align-items: center;
		color: #007aff;
		font-size: 26rpx;

		text {
			margin-left: 8rpx;
		}
	}

	.auth-card {
		background-color: #fff;
		padding: 40rpx;
		border-radius: 20rpx;
		position: relative;
		padding-top: 60rpx;
	}

	// 已认证状态样式
	.verified-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
	}

	.verified-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-top: 20rpx;
		margin-bottom: 50rpx;
	}

	.verified-info {
		width: 100%;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		font-size: 28rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.label {
			color: #999;
		}

		.value {
			color: #333;
			font-weight: 500;
		}
	}

	.disabled-btn {
		opacity: 0.6;
		background: #ccc !important;
		/* 覆盖原来的橙色 */
	}

	.card-header {
		text-align: center;
		margin-bottom: 50rpx;
	}

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

	.form-content {
		margin-top: 50rpx;

		::v-deep .uni-forms-item__label {
			width: 180rpx !important;

			white-space: nowrap;
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

	// 图片上传样式 (复用自商机发布页)
	.image-preview {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
		margin-top: 10rpx;
	}

	.image-wrapper {
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
		aspect-ratio: 1 / 1;
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
		z-index: 10;
	}

	.add-img-placeholder {
		aspect-ratio: 1 / 1;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 24rpx;

		text {
			font-size: 24rpx;
		}
	}

	.cert-remark {
		font-size: 24rpx;
		color: #999;
		margin-top: 15rpx;
		line-height: 1.5;
	}
</style>