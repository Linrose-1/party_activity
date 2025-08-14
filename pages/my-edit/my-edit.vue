<template>
	<view class="container">
		<!-- 基本资料表单 -->
		<view class="form-section">
			<view class="section-header">
				<text class="section-title">编辑基本资料</text>
			</view>

			<view class="form-content">
				<uni-forms ref="formRef" :modelValue="form" :rules="rules">
					<!-- 头像 -->
					<uni-forms-item label="头像" name="avatar">
						<view class="avatar-uploader">
							<image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
							<button class="upload-btn"
								@click="chooseAvatar">{{ form.avatar ? '更换头像' : '上传头像' }}</button>
						</view>
					</uni-forms-item>

					<!-- 其他简单输入项 -->
					<uni-forms-item label="用户昵称" name="nickname"><uni-easyinput v-model="form.nickname"
							placeholder="请输入用户昵称" /></uni-forms-item>
					<uni-forms-item label="真实姓名" name="realName"><uni-easyinput v-model="form.realName"
							placeholder="请输入真实姓名" /></uni-forms-item>
					<uni-forms-item label="性别" name="sex"><uni-data-select v-model="form.sex" :localdata="genderOptions"
							placeholder="请选择性别" /></uni-forms-item>
					<uni-forms-item label="出生日期" name="birthday"><uni-datetime-picker type="date" :end="today"
							return-type="string" v-model="form.birthday" /></uni-forms-item>

					<!-- 地区选择器 -->
					<uni-forms-item label="常住地" name="locationAddress"><uni-data-picker placeholder="请选择常住地"
							popup-title="请选择省市区" :localdata="areaTree" :map="{text: 'name', value: 'id'}"
							v-model="form.locationAddress" /></uni-forms-item>
					<uni-forms-item label="出生地" name="birthplace"><uni-data-picker placeholder="请选择出生地"
							popup-title="请选择省市区" :localdata="areaTree" :map="{text: 'name', value: 'id'}"
							v-model="form.birthplace" /></uni-forms-item>

					<!-- 更多简单输入项 -->
					<uni-forms-item label="籍贯" name="nativePlace"><uni-easyinput v-model="form.nativePlace"
							placeholder="请输入籍贯" /></uni-forms-item>
					<uni-forms-item label="职业" name="professionalTitle"><uni-easyinput v-model="form.professionalTitle"
							placeholder="请输入职业" /></uni-forms-item>
					<uni-forms-item label="行业" name="industryId"><uni-data-picker class="industry-picker"
							placeholder="请选择所在行业" popup-title="请选择行业" :localdata="industryTree"
							:map="{text: 'name', value: 'id'}" v-model="form.industry" /></uni-forms-item>
					<uni-forms-item label="公司/机构" name="companyName"><uni-easyinput v-model="form.companyName"
							placeholder="请输入公司或机构名称" /></uni-forms-item>
					<uni-forms-item label="毕业学校" name="school"><uni-easyinput v-model="form.school"
							placeholder="请输入毕业学校" /></uni-forms-item>
					<uni-forms-item label="手机号码" name="mobile"><uni-easyinput class="phone-text" v-model="form.mobile"
							:disabled="true" /></uni-forms-item>
					<uni-forms-item label="邮箱" name="contactEmail"><uni-easyinput v-model="form.contactEmail"
							placeholder="请输入邮箱" /></uni-forms-item>

					<!-- 微信二维码 -->
					<uni-forms-item label="微信二维码" name="wechatQrCodeUrl">
						<view class="qr-uploader">
							<image v-if="form.wechatQrCodeUrl" :src="form.wechatQrCodeUrl" class="qr-img"
								mode="aspectFit" @click="previewImage(form.wechatQrCodeUrl)" />
							<button class="upload-btn"
								@click="chooseWechatQr">{{ form.wechatQrCodeUrl ? '更换二维码' : '上传二维码' }}</button>
						</view>
					</uni-forms-item>

					<!-- 爱好和简介 -->
					<uni-forms-item label="爱好" name="hobby"><uni-easyinput v-model="form.hobby"
							placeholder="请输入爱好" /></uni-forms-item>
					<uni-forms-item label="个人简介" name="personalBio"><uni-easyinput type="textarea"
							v-model="form.personalBio" placeholder="介绍一下自己..." /></uni-forms-item>
				</uni-forms>

				<button class="save-btn" @click="submitForm">保存资料</button>
			</view>
		</view>

		<!-- 数字标签 -->
		<view class="form-section digital-label-section">
			<view class="section-header"><text class="section-title">数字标签</text></view>
			<view class="form-content"><button class="label-btn" @click="goToLabelEditPage">编辑数字标签</button></view>
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

	// --- 1. 响应式状态定义 ---

	const formRef = ref(null);
	const form = ref({
		nickname: '',
		avatar: '',
		realName: '',
		sex: null,
		birthday: '',
		locationAddress: null, // 将存储ID数组用于反显，或单个ID用于提交
		birthplace: null, // 将存储ID数组用于反显，或单个ID用于提交
		nativePlace: '',
		professionalTitle: '',
		industry: null,
		companyName: '',
		school: '',
		mobile: '',
		contactEmail: '',
		wechatQrCodeUrl: '',
		hobby: '',
		personalBio: '',
	});

	// 数据源
	const areaTree = ref([]);
	const industryTree = ref([]);

	// 静态选项和计算属性
	const genderOptions = [{
		value: 1,
		text: '男'
	}, {
		value: 2,
		text: '女'
	}];
	const today = computed(() => {
		const date = new Date();
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	});

	// 表单校验规则
	const rules = {
		nickname: {
			rules: [{
				required: true,
				errorMessage: '请输入用户昵称'
			}]
		},
		avatar: {
			rules: [{
				required: true,
				errorMessage: '请上传头像'
			}]
		},
		sex: {
			rules: [{
				type: 'number',
				required: true,
				errorMessage: '请选择性别'
			}]
		},
	};


	// --- 2. API 封装 ---

	const Api = {
		getAreaTree: () => request('/app-api/system/area/tree', {
			method: 'GET'
		}),
		getIndustryTree: () => request('/app-api/member/national-industry/tree', {
			method: 'POST'
		}),
		getUserInfo: () => request('/app-api/member/user/get', {
			method: 'GET'
		}),
		updateUser: (data) => request('/app-api/member/user/update', {
			method: 'PUT',
			data
		}),
	};


	// --- 3. 生命周期钩子 ---

	onMounted(async () => {
		uni.showLoading({
			title: '加载基础数据...'
		});
		// 确保数据源先加载
		await Promise.all([
			getAreaTreeData(),
			getIndustryTreeData()
		]);
		// 再获取用户信息并填充
		await fetchUserInfoAndPopulateForm();
		uni.hideLoading();
	});


	// --- 4. 数据获取与处理方法 ---

	const getAreaTreeData = async () => {
		const {
			data,
			error
		} = await Api.getAreaTree();
		if (error) {
			console.error('获取地区树失败:', error);
		} else {
			areaTree.value = data || [];
		}
	};

	const getIndustryTreeData = async () => {
		const {
			data,
			error
		} = await Api.getIndustryTree();
		if (error) {
			console.error('获取行业树失败:', error);
		} else {
			industryTree.value = data || [];
		}
	};

	/**
	 * 根据叶子ID查找完整路径ID数组 (核心工具)
	 * @param {Array} tree - 树
	 * @param {number} targetId - 目标ID
	 * @returns {Array|null}
	 */
	function findPathById(tree, targetId) {
		for (const node of tree) {
			if (node.id === targetId) return [node.id];
			if (node.children && node.children.length > 0) {
				const path = findPathById(node.children, targetId);
				if (path) return [node.id, ...path];
			}
		}
		return null;
	}

	const fetchUserInfoAndPopulateForm = async () => {
		const {
			data: userInfo,
			error
		} = await Api.getUserInfo();
		if (error) {
			return uni.showToast({
				title: error || '获取用户信息失败',
				icon: 'none'
			});
		}
		if (userInfo) {
			// 填充所有普通字段
			Object.keys(form.value).forEach(key => {
				if (userInfo[key] !== undefined && userInfo[key] !== null) {
					form.value[key] = userInfo[key];
				}
			});

			// 【关键】处理地区反显
			if (userInfo.locationAddress) {
				const targetId = parseInt(userInfo.locationAddress, 10); // 字符串ID转为数字
				const path = findPathById(areaTree.value, targetId);
				if (path) form.value.locationAddress = path; // 赋ID数组给v-model
			}
			if (userInfo.birthplace) {
				const targetId = parseInt(userInfo.birthplace, 10); // 字符串ID转为数字
				const path = findPathById(areaTree.value, targetId);
				if (path) form.value.birthplace = path; // 赋ID数组给v-model
			}

			// 【关键】处理生日回显：时间戳 -> YYYY-MM-DD
			if (userInfo.birthday && typeof userInfo.birthday === 'number') {
				const date = new Date(userInfo.birthday);
				form.value.birthday =
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			}
		}
	};


	// --- 5. 用户交互方法 ---

	const chooseAvatar = () => {
		uni.chooseImage({
			count: 1,
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];
				// #ifdef MP-WEIXIN
				wx.cropImage({
					src: tempFilePath,
					cropScale: '1:1',
					success: (cropRes) => uploadAvatar(cropRes.tempFilePath),
					fail: (err) => console.log('用户取消裁剪或裁剪失败:', err),
				});
				// #endif
				// #ifndef MP-WEIXIN
				uploadAvatar(tempFilePath);
				// #endif
			}
		});
	};

	const uploadAvatar = async (filePath) => {
		uni.showLoading({
			title: '上传中...',
			mask: true
		});
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'avatar'
		});
		uni.hideLoading();
		if (result.data) {
			form.value.avatar = result.data;
			uni.showToast({
				title: '头像更新成功',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: result.error || '上传失败',
				icon: 'none'
			});
		}
	};


	function chooseWechatQr() {
		handleImageUpload('wechatQrCodeUrl', 'qrcode');
	}

	const handleImageUpload = (field, directory) => {
		uni.chooseImage({
			count: 1,
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const file = res.tempFiles[0];
				if (file.size > 5 * 1024 * 1024) {
					return uni.showToast({
						title: '文件大小不能超过5MB',
						icon: 'none'
					});
				}
				uni.showLoading({
					title: '上传中...',
					mask: true
				});
				const result = await uploadFile(file, {
					directory
				});
				uni.hideLoading();
				if (result.data) {
					form.value[field] = result.data;
				} else {
					uni.showToast({
						title: result.error || '上传失败',
						icon: 'none'
					});
				}
			}
		});
	};

	const previewImage = (url) => {
		uni.previewImage({
			urls: [url]
		});
	};

	const submitForm = () => {
		formRef.value.validate().then(async () => {
			uni.showLoading({
				title: '正在保存...'
			});

			// 准备提交给后端的数据
			const payload = {
				...form.value
			};

			// 【关键】处理地区提交：ID数组 -> 最后一个ID
			if (Array.isArray(payload.locationAddress) && payload.locationAddress.length > 0) {
				payload.locationAddress = payload.locationAddress[payload.locationAddress.length - 1];
			}
			if (Array.isArray(payload.birthplace) && payload.birthplace.length > 0) {
				payload.birthplace = payload.birthplace[payload.birthplace.length - 1];
			}

			// 【关键】处理生日提交：YYYY-MM-DD -> 时间戳
			if (payload.birthday && typeof payload.birthday === 'string') {
				const dateStr = payload.birthday.replace(/-/g, '/');
				payload.birthday = new Date(dateStr).getTime();
			}

			const {
				error
			} = await Api.updateUser(payload);
			uni.hideLoading();

			if (error) {
				uni.showToast({
					title: error || '保存失败',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				setTimeout(() => uni.navigateBack(), 1500);
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

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		display: block;
	}

	// --- 表单项样式修正 ---

	// 1. 通用表单项样式
	::v-deep .uni-forms-item {
		margin-bottom: 20rpx;
		/* 让label和内容区在垂直方向上顶部对齐，以适应多行内容 */
		align-items: flex-start;

		.uni-forms-item__label {
			width: 180rpx !important;
			font-size: 28rpx;
			color: #333;
			/* 给label一个上边距，使其与多行文本的顶部在视觉上更协调 */
			padding-top: 10rpx;
		}
	}

	// 2. 修正 data-picker 的基础字体大小
	::v-deep .uni-data-tree-input {
		font-size: 28rpx !important;
	}

	/* 1. 限制选择器组件本身的最大宽度为100% */
	::v-deep .industry-picker {
	  width: 450rpx !important;
	  box-sizing: border-box; /* 确保 padding 不会撑大宽度 */
	}
	
	/* 2. 深入组件内部，控制显示文本的区域 */
	::v-deep .industry-picker .uni-data-tree-input {
	  /* 同样限制宽度，并设置自动换行和美化样式 */
	  width: 450rpx !important;
	  white-space: normal !important; /* 允许换行 */
	  height: auto !important;        /* 高度自适应 */
	  line-height: 1.5;              /* 舒适的行高 */
	  
	  /* 增加内边距，让文本不贴着边框，看起来更像输入框 */
	  padding-top: 10rpx;
	  padding-bottom: 10rpx;
	  box-sizing: border-box;
	}
	
	/* 3. （可选，但推荐）如果希望文本最多显示两行，然后出现省略号 */
	/* 如果不需要省略号，可以注释或删除下面这段 */
	::v-deep .industry-picker .uni-data-tree-input .input-value {
	  display: -webkit-box;
	  -webkit-line-clamp: 2; /* 最多显示2行 */
	  -webkit-box-orient: vertical;
	  overflow: hidden;
	  text-overflow: ellipsis;
	  white-space: normal !important; /* 必须再次声明以覆盖内联样式 */
	}







	// --- 其他组件样式 ---

	// 上传区域
	.avatar-uploader,
	.qr-uploader {
		display: flex;
		align-items: center;
		gap: 30rpx;
	}

	.avatar-img,
	.qr-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
	}

	.avatar-img {
		border-radius: 50%;
	}

	.qr-img {
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

	// 特殊输入框样式
	.phone-text ::v-deep .uni-easyinput__content-input {
		color: #999 !important;
	}

	// 按钮样式
	.save-btn,
	.label-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		border: none;
		color: white;

		&::after {
			border: none;
		}
	}

	.save-btn {
		margin-top: 40rpx;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
	}

	.label-btn {
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
		background: linear-gradient(to right, #007bff, #0056b3);
	}

	.digital-label-section {
		/* 可根据需要为数字标签区域添加特定样式 */
	}
</style>