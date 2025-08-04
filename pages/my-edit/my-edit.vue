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
					<!-- ... 头像到出生日期部分无变化, 但v-model已能正确回显 ... -->
					<uni-forms-item label="头像" name="avatar">
						<view class="avatar-uploader">
							<image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
							<button class="upload-btn" @click="chooseAvatar">
								{{ form.avatar ? '更换头像' : '上传头像' }}
							</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="用户昵称" name="nickname">
						<uni-easyinput v-model="form.nickname" placeholder="请输入用户昵称" />
					</uni-forms-item>
					<uni-forms-item label="真实姓名" name="realName">
						<uni-easyinput v-model="form.realName" placeholder="请输入真实姓名" />
					</uni-forms-item>
					<uni-forms-item label="性别" name="sex">
						<uni-data-select v-model="form.sex" :localdata="genderOptions" placeholder="请选择性别" />
					</uni-forms-item>

					<!-- 【修改】出生日期 v-model="form.birthday" 将能正确回显 -->
					<uni-forms-item label="出生日期" name="birthday">
						<uni-datetime-picker type="date" :end="today" return-type="string" v-model="form.birthday" />
					</uni-forms-item>

					<!-- 【修改】常住地 v-model="form.locationAddress" 将能正确回显ID对应的地区名 -->
					<uni-forms-item label="常住地" name="locationAddress">
						<uni-data-picker 
							placeholder="请选择常住地" 
							popup-title="请选择省市区" 
							:localdata="areaTree"
							:map="{text: 'name', value: 'id'}"
							v-model="form.locationAddress" 
						/>
					</uni-forms-item>

					<!-- 【修改】出生地 v-model="form.residence" 将能正确回显ID对应的地区名 -->
					<uni-forms-item label="出生地" name="residence">
						<uni-data-picker 
							placeholder="请选择出生地" 
							popup-title="请选择省市区" 
							:localdata="areaTree"
							:map="{text: 'name', value: 'id'}"
							v-model="form.residence" 
						/>
					</uni-forms-item>
					
					<uni-forms-item label="籍贯" name="nativePlace">
						<uni-easyinput v-model="form.nativePlace" placeholder="请输入籍贯" />
					</uni-forms-item>
					<uni-forms-item label="职业" name="professionalTitle">
						<uni-easyinput v-model="form.professionalTitle" placeholder="请输入职业" />
					</uni-forms-item>
					
					<!-- 【核心修改】行业改为 uni-data-picker，并绑定 industryId -->
					<uni-forms-item label="行业" name="industryId">
						<uni-data-picker 
							placeholder="请选择所在行业" 
							popup-title="请选择行业" 
							:localdata="industryTree"
							:map="{text: 'name', value: 'id'}"
							v-model="form.industry" 
						/>
					</uni-forms-item>

					<!-- ... 其他表单项无变化 ... -->
					<uni-forms-item label="公司/机构" name="companyName">
						<uni-easyinput v-model="form.companyName" placeholder="请输入公司或机构名称" />
					</uni-forms-item>
					<uni-forms-item label="毕业学校" name="school">
						<uni-easyinput v-model="form.school" placeholder="请输入毕业学校" />
					</uni-forms-item>
					<uni-forms-item label="手机号码" name="mobile">
						<uni-easyinput class="phone-text" v-model="form.mobile" :disabled="true" />
					</uni-forms-item>
					<uni-forms-item label="邮箱" name="contactEmail">
						<uni-easyinput class="phone-text" v-model="form.contactEmail"/>
					</uni-forms-item>
					<uni-forms-item label="微信二维码" name="wechatQrCodeUrl">
						<view class="qr-uploader">
							<image v-if="form.wechatQrCodeUrl" :src="form.wechatQrCodeUrl" class="qr-img" mode="aspectFit" @click="previewImage(form.wechatQrCodeUrl)"/>
							<button class="upload-btn" @click="chooseWechatQr">
								{{ form.wechatQrCodeUrl ? '更换二维码' : '上传二维码' }}
							</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="爱好" name="hobby">
						<uni-easyinput v-model="form.hobby" placeholder="请输入爱好" />
					</uni-forms-item>
					<uni-forms-item label="个人简介" name="personalBio">
						<uni-easyinput type="textarea" v-model="form.personalBio" placeholder="介绍一下自己..." />
					</uni-forms-item>
				</uni-forms>
				<button class="save-btn" @click="submitForm">保存资料</button>
			</view>
		</view>

		<!-- 数字标签编辑区域 (无变化) -->
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
	import uploadFile from '../../utils/upload.js';

	// --- 封装 API 调用 ---
	const AreaApi = {
		getAreaTree: () => request('/app-api/system/area/tree', { method: 'GET' })
	};
	
	// 【新增】封装行业接口
	const IndustryApi = {
		getIndustryTree: () => request('/app-api/member/national-industry/tree', { method: 'POST' })
	};

	// --- 生命周期 ---
	onMounted(async () => {
		uni.showLoading({ title: '加载中...' });
		// 【修改】并行获取用户信息、地区数据和行业数据
		await Promise.all([
			getUserInfo(),
			getAreaTreeData(),
			getIndustryTreeData() // 新增
		]);
		uni.hideLoading();
	});

	// --- 表单状态管理 ---
	const formRef = ref(null);
	const form = ref({
		nickname: '',
		avatar: '',
		realName: '',
		sex: null,
		birthday: '',
		locationAddress: null, // 【修正】存储常住地ID，初始为null
		residence: null,       // 【修正】存储出生地ID，初始为null
		nativePlace: '',
		professionalTitle: '',
		industry: null,      // 【核心修改】新增行业ID字段
		companyName: '',
		school: '',
		mobile: '',
		contactEmail: '',
		wechatQrCodeUrl: '',
		hobby: '',
		personalBio: '',
	});

	// 【新增】用于存储行业树数据的 ref
	const industryTree = ref([]);
	const areaTree = ref([]); // 地区树 ref

	const rules = { // 校验规则无变化
		nickname: { rules: [{ required: true, errorMessage: '请输入用户昵称' }] },
		avatar: { rules: [{ required: true, errorMessage: '请上传头像' }] },
		sex: { rules: [{ type: 'number', required: true, errorMessage: '请选择性别' }] },
	};
	const genderOptions = [{ value: 1, text: '男' }, { value: 2, text: '女' }];
	const today = computed(() => {
		const date = new Date();
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	});

	// --- 数据获取方法 ---
	const getAreaTreeData = async () => {
		const { data, error } = await AreaApi.getAreaTree();
		if (error) {
			console.error('获取地区树失败:', error);
			uni.showToast({ title: '地区数据加载失败', icon: 'none' });
		} else {
			areaTree.value = data;
		}
	};
	
	// 【新增】获取行业树数据的方法
	const getIndustryTreeData = async () => {
		const { data, error } = await IndustryApi.getIndustryTree();
		if (error) {
			console.error('获取行业树失败:', error);
			uni.showToast({ title: '行业数据加载失败', icon: 'none' });
		} else {
			industryTree.value = data;
		}
	};
	
	const getUserInfo = async () => {
		const { data: userInfo, error } = await request('/app-api/member/user/get', { method: 'GET' });
		if (userInfo) {
			// 【修改】使用更健壮的方式填充表单，确保字段存在再赋值
			// 这就是实现“回显”的关键一步
			Object.keys(form.value).forEach(key => {
				if (userInfo[key] !== undefined && userInfo[key] !== null) {
					form.value[key] = userInfo[key];
				}
			});
		} else {
			uni.showToast({ title: error || '获取用户信息失败', icon: 'none' });
		}
	};

	// --- 上传与提交逻辑 (无变化) ---
	const handleImageUpload = (field, directory) => {
		uni.chooseImage({
			count: 1,
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const file = res.tempFiles[0];
				if (file.size > 5 * 1024 * 1024) {
					return uni.showToast({ title: '文件大小不能超过5MB', icon: 'none' });
				}
				uni.showLoading({ title: '上传中...', mask: true });
				const result = await uploadFile(file, { directory: directory });
				uni.hideLoading();
				if (result.data) {
					form.value[field] = result.data;
				} else {
					uni.showToast({ title: result.error || '上传失败', icon: 'none' });
				}
			}
		});
	};
	
	function chooseAvatar() { handleImageUpload('avatar', 'avatar'); }
	function chooseWechatQr() { handleImageUpload('wechatQrCodeUrl', 'qrcode'); }
	const previewImage = (url) => { uni.previewImage({ urls: [url] }); };

	const submitForm = () => {
		formRef.value.validate().then(async () => {
			uni.showLoading({ title: '正在保存...' });
			
			// 【注意】提交的 form.value 对象已包含正确的ID字段
			const result = await request('/app-api/member/user/update', {
				method: 'PUT',
				data: form.value
			});
			uni.hideLoading();
			if (result.data !== null) {
				uni.showToast({ title: '保存成功', icon: 'success' });
				setTimeout(() => uni.navigateBack(), 1500);
			} else {
				uni.showToast({ title: result.error || '保存失败', icon: 'none' });
			}
		}).catch(err => {
			console.log('表单验证失败：', err);
		});
	};

	const goToLabelEditPage = () => {
		uni.navigateTo({
			url: '/pages/my-edit-label/my-edit-label'
		});
	};
</script>

<style scoped lang="scss">
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