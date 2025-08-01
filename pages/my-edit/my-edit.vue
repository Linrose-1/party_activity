<template>
	<view class="container">
		<view class="form-section">
			<view class="section-header">
				<text class="section-title">编辑资料</text>
			</view>

			<!-- 表单内容 -->
			<view class="form-content">
				<uni-forms ref="formRef" :modelValue="form" :rules="rules">
					<!-- 头像上传 -->
					<uni-forms-item label="头像" name="avatar">
						<view class="avatar-uploader">
							<image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
							<button class="upload-btn" @click="chooseAvatar">
								{{ form.avatar ? '更换头像' : '上传头像' }}
							</button>
						</view>
					</uni-forms-item>

					<!-- 用户昵称 -->
					<uni-forms-item label="用户昵称" name="nickname">
						<uni-easyinput v-model="form.nickname" placeholder="请输入用户昵称" />
					</uni-forms-item>

					<!-- 真实姓名 -->
					<uni-forms-item label="真实姓名" name="realName">
						<uni-easyinput v-model="form.realName" placeholder="请输入真实姓名" />
					</uni-forms-item>

					<!-- 性别 -->
					<uni-forms-item label="性别" name="sex">
						<uni-data-select v-model="form.sex" :localdata="genderOptions" placeholder="请选择性别" />
					</uni-forms-item>

					<!-- 出生日期 -->
					<uni-forms-item label="出生日期" name="birthday">
						<uni-datetime-picker type="date" :end="today" return-type="string" v-model="form.birthday" />
					</uni-forms-item>

					<!-- 所在地 -->
					<uni-forms-item label="所在地" name="locationAddress">
						<view class="location-picker" @click="openMapToChooseLocation">
							<text v-if="form.locationAddress" class="location-text">{{ form.locationAddress }}</text>
							<text v-else class="placeholder">点击选择位置</text>
							<text class="arrow">›</text>
						</view>
					</uni-forms-item>

					<!-- 职业 -->
					<uni-forms-item label="职业" name="professionalTitle">
						<uni-easyinput v-model="form.professionalTitle" placeholder="请输入职业" />
					</uni-forms-item>

					<!-- 公司/机构 -->
					<uni-forms-item label="公司/机构" name="companyName">
						<uni-easyinput v-model="form.companyName" placeholder="请输入公司或机构名称" />
					</uni-forms-item>

					<!-- 手机号码 (设置为只读) -->
					<uni-forms-item label="手机号码" name="mobile">
						<uni-easyinput class="phone-text" v-model="form.mobile" :disabled="true" />
					</uni-forms-item>
					
					<uni-forms-item label="邮箱" name="contactEmail">
						<uni-easyinput class="phone-text" v-model="form.contactEmail"/>
					</uni-forms-item>

					<!-- 微信二维码 -->
					<uni-forms-item label="微信二维码" name="wechatQrCodeUrl">
						<view class="qr-uploader">
							<image v-if="form.wechatQrCodeUrl" :src="form.wechatQrCodeUrl" class="qr-img" mode="aspectFit" @click="previewImage(form.wechatQrCodeUrl)"/>
							<button class="upload-btn" @click="chooseWechatQr">
								{{ form.wechatQrCodeUrl ? '更换二维码' : '上传二维码' }}
							</button>
						</view>
					</uni-forms-item>

					<!-- 个人简介 -->
					<uni-forms-item label="个人简介" name="personalBio">
						<uni-easyinput type="textarea" v-model="form.personalBio" placeholder="介绍一下自己..." />
					</uni-forms-item>

				</uni-forms>
				<button class="save-btn" @click="submitForm">保存资料</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	onMounted(() => {
		getUserInfo();
	});

	const formRef = ref(null);

	const form = ref({
		nickname: '',
		avatar: '',
		realName: '',
		sex: null,
		birthday: '',
		locationAddress: '',
		professionalTitle: '',
		companyName: '',
		mobile: '',
		contactEmail:'',
		wechatQrCodeUrl: '',
		personalBio: '',
		latitude: null,
		longitude: null
	});

	const rules = {
		nickname: { rules: [{ required: true, errorMessage: '请输入用户昵称' }] },
		avatar: { rules: [{ required: true, errorMessage: '请上传头像' }] },
		sex: { rules: [{ type: 'number', required: true, errorMessage: '请选择性别' }] },
	};

	const genderOptions = [{ value: 1, text: '男' }, { value: 2, text: '女' }];
	
	const today = computed(() => {
		const date = new Date();
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	});
	
	
	// --- 【核心修改】统一的图片上传处理器 ---
		/**
		 * 处理单张图片上传的通用函数
		 * @param {string} field - 要更新的 form 字段名, e.g., 'avatar'
		 * @param {string} directory - 上传到服务器的目录, e.g., 'avatar'
		 */
		const handleImageUpload = (field, directory) => {
			uni.chooseImage({
				count: 1,
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const file = res.tempFiles[0];
					
					const maxSize = 5 * 1024 * 1024; // 5MB
					if (file.size > maxSize) {
						return uni.showToast({ title: '文件大小不能超过5MB', icon: 'none' });
					}
					
					uni.showLoading({ title: '上传中...', mask: true });
					
					// 【关键】直接调用导入的 uploadFile 工具函数
					const result = await uploadFile(file, { directory: directory });
					
					uni.hideLoading();
					
					if (result.data) {
						// 动态地更新 form 对象中指定的字段为返回的 URL
						form.value[field] = result.data;
						uni.showToast({ title: '上传成功', icon: 'none' });
					} else {
						console.error("上传失败:", result.error);
						uni.showToast({ title: result.error || '上传失败', icon: 'none' });
					}
				}
			});
		};
	
		// --- 【简化】具体的上传调用 ---
		function chooseAvatar() {
			handleImageUpload('avatar', 'avatar');
		}
	
		function chooseWechatQr() {
			handleImageUpload('wechatQrCodeUrl', 'qrcode');
		}
	

	const getUserInfo = async () => {
		try {
			const result = await request('/app-api/member/user/get', { method: 'GET' });
			if (result.data) {
				const userInfo = result.data;
				Object.keys(form.value).forEach(key => {
					if (userInfo[key] !== undefined && userInfo[key] !== null) {
						form.value[key] = userInfo[key];
					}
				});
			} else {
				uni.showToast({ title: result.msg || '获取用户信息失败', icon: 'none' });
			}
		} catch (error) {
			uni.showToast({ title: '网络错误，请稍后再试', icon: 'error' });
		}
	};
		

	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			latitude: form.value.latitude || undefined,
			longitude: form.value.longitude || undefined,
			success: (res) => {
				form.value.locationAddress = res.address || res.name;
				form.value.latitude = res.latitude;
				form.value.longitude = res.longitude;
			}
		});
	};
	
	const previewImage = (url) => {
		uni.previewImage({ urls: [url] });
	}

	// --- 【核心修改】提交表单 ---
	const submitForm = () => {
			formRef.value.validate().then(async () => {
				uni.showLoading({ title: '正在保存...' });
				
				// 此处逻辑大大简化，因为图片 URL 已经提前获取并存在 form.value 中了
				const result = await request('/app-api/member/user/update', {
					method: 'PUT',
					data: form.value // 直接提交包含图片 URL 的表单数据
				});
	
				uni.hideLoading();
	
				if (result.data !== null) { // 使用 request 工具的返回格式判断
					uni.showToast({ title: '保存成功', icon: 'success' });
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({ title: result.error || '保存失败', icon: 'none' });
				}
				
			}).catch(err => {
				console.log('表单验证失败：', err);
				// uni-forms 会自动弹出第一个错误提示，这里可以只做日志记录或通用提示
			});
		}
</script>

<style scoped lang="scss">
/* 您的样式无需修改，此处省略以保持简洁 */
.container {
	padding: 20rpx 30rpx 40rpx;
	background-color: #f9f9f9;
}

.form-section {
	background-color: #fff;
	padding: 30rpx;
	border-radius: 20rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 30rpx;
	display: block;
}

// 表单项通用样式
::v-deep .uni-forms-item {
	margin-bottom: 20rpx;
	.uni-forms-item__label {
		width: 180rpx !important;
		font-size: 28rpx;
		color: #333;
	}
}

// 头像和二维码上传区域
.avatar-uploader, .qr-uploader {
	display: flex;
	align-items: center;
	gap: 30rpx;
}

.avatar-img {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
}

.qr-img {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
	border: 1px solid #eee;
}

.upload-btn {
	font-size: 26rpx;
	padding: 0 30rpx;
	height: 60rpx;
	line-height: 60rpx;
	background-color: #f5f5f5;
	color: #333;
	margin: 0;
	&::after {
		border: none;
	}
}

// 位置选择器
.location-picker {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid #e5e5e5;
	border-radius: 8rpx;
	padding: 18rpx 20rpx;
	width: 100%;
	box-sizing: border-box;
	.location-text {
		color: #333;
		font-size: 28rpx;
	}
	.placeholder {
		color: #999;
		font-size: 28rpx;
	}
	.arrow {
		color: #999;
		font-size: 32rpx;
	}
}

.phone-text {
	// disabled 状态下的样式
	::v-deep .uni-easyinput__content-input {
		color: #999 !important;
	}
}

.save-btn {
	margin-top: 40rpx;
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: linear-gradient(to right, #FF8C00, #FF6B00);
	color: white;
	border-radius: 44rpx;
	font-size: 32rpx;
	border: none;
	&::after {
		border: none;
	}
}
</style>