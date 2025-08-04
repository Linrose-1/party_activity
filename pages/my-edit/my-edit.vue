<template>
	<view class="container">
		<!-- 基本资料表单 -->
		<view class="form-section">
			<view class="section-header">
				<text class="section-title">编辑基本资料</text>
			</view>

			<!-- 表单内容 -->
			<view class="form-content">
				<uni-forms ref="formRef" :modelValue="form" :rules="rules">
					<!-- 头像上传 (无变化) -->
					<uni-forms-item label="头像" name="avatar">
						<view class="avatar-uploader">
							<image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
							<button class="upload-btn" @click="chooseAvatar">
								{{ form.avatar ? '更换头像' : '上传头像' }}
							</button>
						</view>
					</uni-forms-item>

					<!-- 用户昵称 (无变化) -->
					<uni-forms-item label="用户昵称" name="nickname">
						<uni-easyinput v-model="form.nickname" placeholder="请输入用户昵称" />
					</uni-forms-item>

					<!-- 真实姓名 (无变化) -->
					<uni-forms-item label="真实姓名" name="realName">
						<uni-easyinput v-model="form.realName" placeholder="请输入真实姓名" />
					</uni-forms-item>

					<!-- 性别 (无变化) -->
					<uni-forms-item label="性别" name="sex">
						<uni-data-select v-model="form.sex" :localdata="genderOptions" placeholder="请选择性别" />
					</uni-forms-item>

					<!-- 出生日期 (无变化) -->
					<uni-forms-item label="出生日期" name="birthday">
						<uni-datetime-picker type="date" :end="today" return-type="string" v-model="form.birthday" />
					</uni-forms-item>

					<!-- 【修改】1. 常住地 (替换原来的“所在地”) -->
					<uni-forms-item label="常住地" name="locationAddress">
						<uni-data-picker 
							placeholder="请选择常住地" 
							popup-title="请选择省市区" 
							:localdata="areaTree"
							:map="{text: 'name', value: 'id'}"
							v-model="form.locationAddress"
						/>
					</uni-forms-item>

					<!-- 【新增】1. 出生地 -->
					<uni-forms-item label="出生地" name="residence">
						<uni-data-picker 
							placeholder="请选择出生地" 
							popup-title="请选择省市区" 
							:localdata="areaTree"
							:map="{text: 'name', value: 'id'}"
							v-model="form.residence"
						/>
					</uni-forms-item>
					
					<!-- 【新增】2. 籍贯 -->
					<uni-forms-item label="籍贯" name="nativePlace">
						<uni-easyinput v-model="form.nativePlace" placeholder="请输入籍贯" />
					</uni-forms-item>

					<!-- 职业 (无变化) -->
					<uni-forms-item label="职业" name="professionalTitle">
						<uni-easyinput v-model="form.professionalTitle" placeholder="请输入职业" />
					</uni-forms-item>
					
					<!-- 【新增】2. 行业 -->
					<uni-forms-item label="行业" name="industry">
						<uni-easyinput v-model="form.industry" placeholder="请输入行业" />
					</uni-forms-item>

					<!-- 公司/机构 (无变化) -->
					<uni-forms-item label="公司/机构" name="companyName">
						<uni-easyinput v-model="form.companyName" placeholder="请输入公司或机构名称" />
					</uni-forms-item>
					
					<!-- 【新增】2. 毕业学校 -->
					<uni-forms-item label="毕业学校" name="school">
						<uni-easyinput v-model="form.school" placeholder="请输入毕业学校" />
					</uni-forms-item>

					<!-- 手机号码 (无变化) -->
					<uni-forms-item label="手机号码" name="mobile">
						<uni-easyinput class="phone-text" v-model="form.mobile" :disabled="true" />
					</uni-forms-item>
					
					<!-- 邮箱 (无变化) -->
					<uni-forms-item label="邮箱" name="contactEmail">
						<uni-easyinput class="phone-text" v-model="form.contactEmail"/>
					</uni-forms-item>

					<!-- 微信二维码 (无变化) -->
					<uni-forms-item label="微信二维码" name="wechatQrCodeUrl">
						<view class="qr-uploader">
							<image v-if="form.wechatQrCodeUrl" :src="form.wechatQrCodeUrl" class="qr-img" mode="aspectFit" @click="previewImage(form.wechatQrCodeUrl)"/>
							<button class="upload-btn" @click="chooseWechatQr">
								{{ form.wechatQrCodeUrl ? '更换二维码' : '上传二维码' }}
							</button>
						</view>
					</uni-forms-item>
					
					<!-- 【新增】2. 爱好 -->
					<uni-forms-item label="爱好" name="hobby">
						<uni-easyinput v-model="form.hobby" placeholder="请输入爱好" />
					</uni-forms-item>

					<!-- 个人简介 (无变化) -->
					<uni-forms-item label="个人简介" name="personalBio">
						<uni-easyinput type="textarea" v-model="form.personalBio" placeholder="介绍一下自己..." />
					</uni-forms-item>

				</uni-forms>
				<button class="save-btn" @click="submitForm">保存资料</button>
			</view>
		</view>

		<!-- 【新增】4. 数字标签编辑区域 -->
		<view class="form-section digital-label-section">
			<view class="section-header">
				<text class="section-title">数字标签</text>
			</view>
			<view class="form-content">
				<button class="label-btn" @click="goToLabelEditPage">编辑数字标签</button>
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
	import uploadFile from '../../utils/upload.js'; // 假设您的上传工具路径正确

	// --- 【新增】1. 封装地区接口 ---
	const AreaApi = {
		/**
		 * 获取地区树
		 */
		getAreaTree: () => {
			return request('/app-api/system/area/tree', {
				method: 'GET'
			});
		}
	};
	
	onMounted(async () => {
		// 并行获取用户信息和地区数据，提升加载速度
		uni.showLoading({ title: '加载中...' });
		await Promise.all([
			getUserInfo(),
			getAreaTreeData() // 【新增】调用获取地区数据的方法
		]);
		uni.hideLoading();
	});

	const formRef = ref(null);

	// --- 【修改】1,2,3. 更新表单数据结构 ---
	const form = ref({
		nickname: '',
		avatar: '',
		realName: '',
		sex: null,
		birthday: '',
		locationAddress: '', // 用于【常住地】, 存储最终的地区ID
		residence: '',       // 【新增】用于【出生地】, 存储最终的地区ID
		nativePlace: '',     // 【新增】籍贯
		professionalTitle: '',
		industry: '',        // 【新增】行业
		companyName: '',
		school: '',          // 【新增】毕业学校
		mobile: '',
		contactEmail:'',
		wechatQrCodeUrl: '',
		hobby: '',           // 【新增】爱好
		personalBio: '',
		// 【移除】latitude 和 longitude 字段
	});

	// 【新增】1. 用于存储地区树数据的 ref
	const areaTree = ref([]);

	const rules = {
		nickname: { rules: [{ required: true, errorMessage: '请输入用户昵称' }] },
		avatar: { rules: [{ required: true, errorMessage: '请上传头像' }] },
		sex: { rules: [{ type: 'number', required: true, errorMessage: '请选择性别' }] },
	};

	const genderOptions = [{ value: 1, text: '男' }, { value: 2, text: '女' }];
	
	const today = computed(() => {
		const date = new Date();
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	});
	
	// --- 【新增】1. 获取地区树数据的方法 ---
	const getAreaTreeData = async () => {
		const { data, error } = await AreaApi.getAreaTree();
		if (error) {
			console.error('获取地区树失败:', error);
			uni.showToast({ title: '地区数据加载失败', icon: 'none' });
			return;
		}
		areaTree.value = data;
	};
	
	
	// --- 图片上传处理器 (无变化) ---
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
				
				const result = await uploadFile(file, { directory: directory });
				
				uni.hideLoading();
				
				if (result.data) {
					form.value[field] = result.data;
					uni.showToast({ title: '上传成功', icon: 'none' });
				} else {
					console.error("上传失败:", result.error);
					uni.showToast({ title: result.error || '上传失败', icon: 'none' });
				}
			}
		});
	};
	
	function chooseAvatar() {
		handleImageUpload('avatar', 'avatar');
	}
	
	function chooseWechatQr() {
		handleImageUpload('wechatQrCodeUrl', 'qrcode');
	}

	// --- 获取用户信息 (无变化) ---
	const getUserInfo = async () => {
		const { data: userInfo, error } = await request('/app-api/member/user/get', { method: 'GET' });
		if (userInfo) {
			Object.keys(form.value).forEach(key => {
				if (userInfo[key] !== undefined && userInfo[key] !== null) {
					form.value[key] = userInfo[key];
				}
			});
		} else {
			uni.showToast({ title: error || '获取用户信息失败', icon: 'none' });
		}
	};
		
	// --- 【移除】openMapToChooseLocation 方法 ---

	const previewImage = (url) => {
		uni.previewImage({ urls: [url] });
	}

	// --- 提交表单 (逻辑无变化, 但提交的数据已更新) ---
	const submitForm = () => {
		formRef.value.validate().then(async () => {
			uni.showLoading({ title: '正在保存...' });
			
			const result = await request('/app-api/member/user/update', {
				method: 'PUT',
				data: form.value
			});

			uni.hideLoading();

			if (result.data !== null) {
				uni.showToast({ title: '保存成功', icon: 'success' });
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} else {
				uni.showToast({ title: result.error || '保存失败', icon: 'none' });
			}
			
		}).catch(err => {
			console.log('表单验证失败：', err);
		});
	}

	// --- 【新增】4. 跳转到数字标签编辑页 ---
	const goToLabelEditPage = () => {
		uni.navigateTo({
			url: '/pages/my-edit-label/my-edit-label' // 请确保这个路径是您项目中正确的路径
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
	margin-bottom: 20rpx;
}

.section-header {
	// 复用此样式
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

// 【新增】为 uni-data-picker 覆盖部分样式以对齐
::v-deep .uni-data-tree-input {
	font-size: 28rpx !important;
}

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
	&::after { border: none; }
}

.phone-text {
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
	&::after { border: none; }
}

/* --- 【新增】数字标签区域的样式 --- */
.digital-label-section {
	// 可以添加特定样式，或复用 form-section
}

.label-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(to right, #007bff, #0056b3);
	color: #fff;
	border: 1px solid #ddd;
	border-radius: 40rpx;
	font-size: 30rpx;
	&::after { border: none; }
}
</style>