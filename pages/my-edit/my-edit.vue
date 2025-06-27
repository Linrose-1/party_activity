<template>
	<view class="container">
		<view class="form-section">
			<view class="section-header">
				<text class="section-title">编辑资料</text>
			</view>
			<uni-forms-item label="头像" name="avatar" required>
				<button class="upload-btn" @click="chooseAvatar">上传头像</button>
				<image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
			</uni-forms-item>

			<view class="form-content">
				<uni-forms ref="formRef" :modelValue="form" :rules="rules">
					<uni-forms-item label="真实姓名" name="name" required>
						<uni-easyinput v-model="form.name" placeholder="请输入真实姓名" />
					</uni-forms-item>

					<uni-forms-item label="性别" name="gender" required>
						<uni-data-select v-model="form.gender" :localdata="genderOptions" />
					</uni-forms-item>

					<uni-forms-item label="出生日期" name="birth">
						<uni-datetime-picker type="date" v-model="form.birth" />
					</uni-forms-item>

					<uni-forms-item label="所在地" name="location">
						<!-- <uni-easyinput v-model="form.location" placeholder="请输入所在地" /> -->
						<view class="uni-list-cell-db">
							<view @click="openMapToChooseLocation" class="uni-input">
								<text v-if="form.location">{{ form.location }}</text>
								<text v-else class="placeholder">点击选择位置</text>
								<text class="arrow">></text>
							</view>
						</view>
					</uni-forms-item>

					<uni-forms-item label="职业" name="job" required>
						<uni-easyinput v-model="form.job" placeholder="请输入职业" />
					</uni-forms-item>

					<uni-forms-item label="公司/机构" name="company" required>
						<uni-easyinput v-model="form.company" placeholder="请输入公司或机构名称" />
					</uni-forms-item>

					<uni-forms-item label="手机号码" name="phone" required>
						<view class="phone-input">
							<picker mode="selector" :range="phoneCodes" :value="codeIndex" @change="onCodeChange">
								<view class="code-picker">{{ phoneCodes[codeIndex] }}</view>
							</picker>

							<uni-easyinput class="phone-text" v-model="form.phone" placeholder="请输入手机号码" />
						</view>
					</uni-forms-item>

					<uni-forms-item label="微信二维码" name="wechatQr">
						<button class="upload-btn" @click="chooseImage">上传二维码</button>
						<image v-if="form.wechatQr" :src="form.wechatQr" class="qr-img" mode="aspectFit" />
					</uni-forms-item>

					<uni-forms-item label="个人简介" name="intro">
						<uni-easyinput type="textarea" v-model="form.intro" placeholder="介绍一下自己..." />
					</uni-forms-item>

					<uni-forms-item label="邀请码" name="inviteCode">
						<uni-easyinput v-model="form.inviteCode" placeholder="填写对方的邀请码（可选）" />
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
		onMounted
	} from 'vue';
	import request from '../../utils/request.js'; // 假设你的请求封装是正确的

	onMounted(() => {
		getUserInfo();
	});

	// formRef 用于表单验证
	const formRef = ref(null);

	// 1. 修改 form 的字段名以匹配接口返回的字段
	const form = ref({
		avatar: '',
		realName: '', // name -> realName
		sex: '', // gender -> sex
		birth: '', // 该字段接口没有，暂时保留
		locationAddress: '', // location -> locationAddress
		professionalTitle: '', // job -> professionalTitle
		companyName: '', // company -> companyName
		mobile: '', // phone -> mobile
		wechatQrCodeUrl: '', // wechatQr -> wechatQrCodeUrl
		personalBio: '', // intro -> personalBio
		inviteCode: '', // 该字段接口没有，暂时保留
		latitude: '', // 地图选择后赋值
		longitude: '' // 地图选择后赋值
	});

	// 2. 修改 rules 中的字段名以匹配 form 的新字段名
	const rules = {
		avatar: {
			required: true,
			errorMessage: '请上传头像'
		},
		realName: { // name -> realName
			required: true,
			errorMessage: '请输入真实姓名'
		},
		sex: { // gender -> sex
			required: true,
			errorMessage: '请选择性别'
		},
		professionalTitle: { // job -> professionalTitle
			required: true,
			errorMessage: '请输入职业'
		},
		companyName: { // company -> companyName
			required: true,
			errorMessage: '请输入公司/机构名称'
		},
		mobile: [{ // phone -> mobile
				required: true,
				errorMessage: '请输入手机号码'
			},
			{
				pattern: /^1[3-9]\d{9}$/,
				errorMessage: '请输入有效的手机号'
			},
		],
	};

	// 3. 【重要建议】修改 genderOptions 的 value，使其与接口返回的数字类型(sex)匹配
	// 接口文档中 sex 是 integer 类型，示例中是 2。这样可以直接赋值，无需转换。
	const genderOptions = [{
			value: 1, // 'male' -> 1
			text: '男'
		},
		{
			value: 2, // 'female' -> 2
			text: '女'
		},
		// 你可以根据实际情况保留或删除“其他”
		// {
		// 	value: 0, // 'other' -> 0 (通常 0 代表未知)
		// 	text: '其他'
		// },
	];

	// --- 以下是你的其他函数，基本保持不变 ---

	function chooseAvatar() {
		uni.chooseImage({
			count: 1,
			success: res => {
				// 注意：这里得到的是临时路径，实际开发中需要先上传到服务器获取真实URL
				form.value.avatar = res.tempFilePaths[0];
			}
		});
	}


	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				// 将选择的地址和经纬度赋值给 form
				form.value.locationAddress = res.address || res.name;
				form.value.latitude = res.latitude;
				form.value.longitude = res.longitude;
				console.log(res)
			},
			fail: (err) => {
				if (!err.errMsg.includes('cancel')) {
					uni.showToast({
						title: '选择位置失败',
						icon: 'none'
					});
				}
			}
		});
	};


	const phoneCodes = ['+86', '+852', '+853', '+886'];
	const codeIndex = ref(0);

	function chooseImage() {
		uni.chooseImage({
			count: 1,
			success: res => {
				// 注意：这里得到的是临时路径，实际开发中需要先上传到服务器获取真实URL
				form.value.wechatQrCodeUrl = res.tempFilePaths[0];
			}
		});
	}

	function submitForm() {
		formRef.value.validate().then(() => {
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
			// 在这里可以调用更新用户信息的接口
			console.log('准备提交的表单数据:', form.value)
		}).catch(err => {
			console.log('验证失败：', err);
		});
	}

	function onCodeChange(e) {
		codeIndex.value = e.detail.value;
	}


	// 4. 实现 getUserInfo 函数的数据赋值逻辑
	const getUserInfo = async () => {
		try {
			const result = await request('/app-api/member/user/get', {
				method: 'GET',
			});
			console.log('getUserInfo result:', result);

			if (result && result.data) {
				const userInfo = result.data;
				// 将接口返回的数据赋值给 form 中对应的字段
				form.value.avatar = userInfo.avatar;
				form.value.realName = userInfo.realName;
				form.value.sex = userInfo.sex;
				form.value.locationAddress = userInfo.locationAddress;
				form.value.professionalTitle = userInfo.professionalTitle;
				form.value.companyName = userInfo.companyName;
				form.value.mobile = userInfo.mobile;
				form.value.wechatQrCodeUrl = userInfo.wechatQrCodeUrl;
				form.value.personalBio = userInfo.personalBio;
				form.value.latitude = userInfo.latitude;
				form.value.longitude = userInfo.longitude;

				// 注意：birth 和 inviteCode 接口没有返回，所以不会被覆盖，保留为空
			} else {
				// 处理请求成功但没有数据的情况
				console.log('未能获取到用户信息:', result ? result.msg : '无返回数据');
			}
		} catch (error) {
			console.log('请求失败:', error);
			uni.showToast({
				title: '获取信息失败',
				icon: 'error'
			})
		}
	};
</script>

<style scoped lang="scss">
	.container {
		padding: 30rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.form-content {
		margin-top: 20rpx;
	}

	.uni-list-cell-db {
		margin-left: 10rpx;
		padding: 20rpx;
		margin: 10rpx 0;
		border: #ffe1d2 solid 1rpx;
		min-width: 500rpx;

		.uni-input {
			margin-left: 10rpx;
			font-size: 28rpx;
			display: flex; // 使用flex布局
			justify-content: space-between; // 两端对齐
			align-items: center; // 垂直居中


			.placeholder {
				color: #939393;
			}

			.arrow {
				color: #999;
				font-size: 32rpx;
			}
		}
	}

	.phone-input {
		display: flex;
		align-items: center;
	}

	.code-picker {
		padding: 20rpx;
		background: #f0f0f0;
		border-radius: 12rpx;
		margin-right: 20rpx;
	}

	.phone-text {
		flex: 1;
	}

	.upload-btn {
		padding: 20rpx;
		background-color: #f5f5f5;
		border-radius: 12rpx;
		text-align: center;
		font-size: 28rpx;
	}

	.qr-img {
		width: 200rpx;
		height: 200rpx;
		margin-top: 20rpx;
		border-radius: 20rpx;
	}

	.save-btn {
		margin-top: 40rpx;
		width: 100%;
		padding: 10rpx;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
		border-radius: 20rpx;
		font-size: 30rpx;
	}

	.avatar-img {
		width: 160rpx;
		height: 160rpx;
		margin-top: 20rpx;
		border-radius: 80rpx;
		object-fit: cover;
	}
</style>