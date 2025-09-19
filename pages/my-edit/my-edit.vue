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
					<uni-forms-item label="出生年代" name="era">
						<uni-data-select v-model="form.era" :localdata="eraOptions" placeholder="请选择出生年代" />
					</uni-forms-item>

					<!-- 地区选择器 -->
					<uni-forms-item label="常住地" name="locationAddress"><uni-data-picker placeholder="请选择常住地"
							popup-title="请选择省市区" :localdata="areaTree" :map="{text: 'name', value: 'id'}"
							v-model="form.locationAddress" /></uni-forms-item>
					<uni-forms-item label="出生地" name="birthplace"><uni-data-picker placeholder="请选择出生地"
							popup-title="请选择省市区" :localdata="areaTree" :map="{text: 'name', value: 'id'}"
							v-model="form.birthplace" /></uni-forms-item>

					<!-- 更多简单输入项 -->
					<uni-forms-item label="籍贯" name="nativePlace">
						<uni-data-picker placeholder="请选择籍贯" popup-title="请选择省市区" :localdata="areaTree"
							:map="{text: 'name', value: 'id'}" v-model="form.nativePlace" />
					</uni-forms-item>
					<view class="dynamic-section">
						<view class="dynamic-header">
							<text class="dynamic-label">商会/协会与职务</text>
							<button v-if="professionsList.length < 3" class="add-btn-small" @click="addProfession">
								<uni-icons type="plusempty" size="14" color="#007bff"></uni-icons>
								添加
							</button>
						</view>
						<view v-for="(profession, index) in professionsList" :key="index" class="dynamic-item">
							<uni-easyinput v-model="professionsList[index]" placeholder="示例：XXX商会/会长，XXX协会/理事" />
							<button v-if="professionsList.length > 1" class="remove-btn-small"
								@click="removeProfession(index)">×</button>
						</view>
					</view>
					<view class="dynamic-section">
						<view class="dynamic-header">
							<text class="dynamic-label">公司/机构与行业</text>
							<button v-if="companyAndIndustryList.length < 3" class="add-btn-small" @click="addCompany">
								<uni-icons type="plusempty" size="14" color="#007bff"></uni-icons>
								添加
							</button>
						</view>
						<view v-for="(company, index) in companyAndIndustryList" :key="index" class="dynamic-group">
							<view class="group-header">
								<text class="group-title">第 {{ index + 1 }} 组</text>
								<button v-if="companyAndIndustryList.length > 1" class="remove-btn"
									@click="removeCompany(index)">删除</button>
							</view>
							<!-- 【样式修复关键】uni-forms-item 放在循环内，并使用动态 name -->
							<uni-forms-item :label="`行业`" :name="`industry_${index}`">
								<uni-data-picker class="dynamic-picker" placeholder="请选择所在行业" popup-title="请选择行业"
									:localdata="industryTree" :map="{text: 'name', value: 'name'}"
									v-model="company.industryName" />
							</uni-forms-item>
							<uni-forms-item :label="`公司`" :name="`company_${index}`">
								<uni-easyinput v-model="company.name" placeholder="请输入公司或机构名称" />
							</uni-forms-item>
						</view>
					</view>
					<view class="dynamic-section">
						<view class="dynamic-header">
							<text class="dynamic-label">毕业学校</text>
							<button v-if="schoolsList.length < 6" class="add-btn-small" @click="addSchool">
								<uni-icons type="plusempty" size="14" color="#007bff"></uni-icons>
								添加
							</button>
						</view>
						<view v-for="(school, index) in schoolsList" :key="index" class="dynamic-item">
							<uni-easyinput v-model="schoolsList[index]" placeholder="可以多填,用以查同学会" />
							<button v-if="schoolsList.length > 1" class="remove-btn-small"
								@click="removeSchool(index)">×</button>
						</view>
					</view>
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
					<uni-forms-item label="爱好" name="hobby">
						<uni-data-checkbox v-model="selectedHobbies" :localdata="hobbyOptions" multiple
							@change="onHobbyChange" />
						<!-- 当“其他”被选中时，显示输入框 -->
						<uni-easyinput v-if="isOtherHobbySelected" v-model="otherHobbyText" placeholder="请输入您的其他爱好"
							class="other-hobby-input" />
					</uni-forms-item>
					<uni-forms-item label="个性签名&理念" name="signature">
						<uni-easyinput v-model="form.signature" placeholder="设置一个独特的个性签名吧" />
					</uni-forms-item>
					<uni-forms-item label="个人简介&资源" name="personalBio"><uni-easyinput type="textarea"
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


		<view class="form-section">
			<view class="section-header"><text class="section-title">实名认证</text></view>
			<view class="form-content">
				<!-- 如果用户已实名 (我们通过 idCard 字段判断) -->
				<view v-if="form.idCard" class="auth-info">
					<view class="auth-item">
						<text class="auth-label">真实姓名</text>
						<text class="auth-value">{{ maskedName }}</text>
					</view>
					<view class="auth-item">
						<text class="auth-label">身份证号</text>
						<text class="auth-value">{{ maskedIdCard }}</text>
					</view>
					<view class="auth-status">
						<uni-icons type="checkbox-filled" color="#00C777" size="18"></uni-icons>
						<text>已认证</text>
					</view>
				</view>

				<!-- 如果用户未实名 -->
				<view v-else>
					<button class="auth-btn" @click="goToAuthPage">去认证</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
		watch
	} from 'vue';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	// --- 1. 响应式状态定义 ---

	/**
	 * @description 创建一个通用的侦听器来处理输入限制
	 * @param {Ref<Array<string>|Array<object>|string>} target - 要侦听的目标 ref
	 * @param {string|null} key - 如果目标是对象数组，则指定要检查的属性名
	 */
	const watchAndSanitize = (target, key = null) => {
		watch(target, (newValue) => {
			if (Array.isArray(newValue)) {
				newValue.forEach((item, index) => {
					if (key && typeof item === 'object') {
						// 处理对象数组，如 companyAndIndustryList
						if (item[key] && typeof item[key] === 'string' && item[key].includes(',')) {
							target.value[index][key] = item[key].replace(/,/g, '');
						}
					} else if (typeof item === 'string' && item.includes(',')) {
						// 处理字符串数组，如 professionsList, schoolsList
						target.value[index] = item.replace(/,/g, '');
					}
				});
			} else if (typeof newValue === 'string' && newValue.includes(',')) {
				// 处理单个字符串，如 otherHobbyText
				target.value = newValue.replace(/,/g, '');
			}
		}, {
			deep: true
		}); // 使用 deep: true 来侦听对象数组内部属性的变化
	};

	// 应用侦听器到所有需要限制的字段
	watchAndSanitize(professionsList);
	watchAndSanitize(schoolsList);
	watchAndSanitize(companyAndIndustryList, 'name'); // 只限制公司名称字段
	watchAndSanitize(otherHobbyText);

	const formRef = ref(null);
	const form = ref({
		nickname: '',
		avatar: '',
		realName: '',
		sex: null,
		birthday: '',
		locationAddress: null, // 将存储ID数组用于反显，或单个ID用于提交
		birthplace: null, // 将存储ID数组用于反显，或单个ID用于提交
		professionalTitle: '',
		industry: '',
		companyName: '',
		school: '',
		mobile: '',
		contactEmail: '',
		wechatQrCodeUrl: '',
		hobby: '',
		personalBio: '',
		idCard: '',
		cardName: '',
		era: null, // 出生年代
		nativePlace: null, //  籍贯 (与地区同构)
		signature: '', // 个性签名
	});

	// 数据源
	const areaTree = ref([]);
	const industryTree = ref([]);
	const professionOptions = ref([]);
	const hobbyOptions = ref([]);

	const eraOptions = [{
			value: '50/60',
			text: '50/60'
		},
		{
			value: '70/80',
			text: '70/80'
		},
		{
			value: '90/00',
			text: '90/00'
		},
		{
			value: '不问年代',
			text: '不问年代'
		},
	];

	//  爱好-多选
	const selectedHobbies = ref([]);
	const otherHobbyText = ref('');
	const isOtherHobbySelected = computed(() => selectedHobbies.value.includes('其他'));
	const professionsList = ref(['']); // 职业列表
	const schoolsList = ref(['']); // 学校列表
	// 动态公司/行业列表
	const companyAndIndustryList = ref([{
		name: '',
		industryName: ''
	}]);

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
		getDictData: (type) => request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: {
				type
			}
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
			getIndustryTreeData(),
			getProfessionData(),
			getHobbyData()
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

	/**
	 * @description 当行业选择器值变化时，手动更新 companyAndIndustryList
	 * @param {object} event - uni-data-picker 派发的事件对象
	 * @param {number} index - 当前操作的是第几个公司/行业组
	 */
	const onIndustryChange = (event, index) => {
		// event.detail.value 是一个数组，每个元素是 { text, value }
		// 我们只需要每个元素的 value (即 id)
		const pathIds = event.detail.value.map(item => item.value);

		console.log(`第 ${index + 1} 组行业已选择，路径ID数组:`, pathIds);

		// 手动将获取到的路径ID数组赋值给响应式数据
		companyAndIndustryList.value[index].industry = pathIds;
	};

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
			['locationAddress', 'birthplace', 'nativePlace'].forEach(key => {
				if (userInfo[key]) {
					const targetId = parseInt(userInfo[key], 10);
					const path = findPathById(areaTree.value, targetId);
					if (path) form.value[key] = path;
				}
			});
			// if (userInfo.locationAddress) {
			// 	const targetId = parseInt(userInfo.locationAddress, 10); // 字符串ID转为数字
			// 	const path = findPathById(areaTree.value, targetId);
			// 	if (path) form.value.locationAddress = path; // 赋ID数组给v-model
			// }
			// if (userInfo.birthplace) {
			// 	const targetId = parseInt(userInfo.birthplace, 10); // 字符串ID转为数字
			// 	const path = findPathById(areaTree.value, targetId);
			// 	if (path) form.value.birthplace = path; // 赋ID数组给v-model
			// }

			// 爱好反显
			if (userInfo.hobby) {
				const hobbies = userInfo.hobby.split(',');
				const predefinedHobbies = hobbies.filter(h => hobbyOptions.value.some(opt => opt.value === h));
				const otherHobbies = hobbies.filter(h => !hobbyOptions.value.some(opt => opt.value === h));
				selectedHobbies.value = [...predefinedHobbies];
				if (otherHobbies.length > 0) {
					selectedHobbies.value.push('其他');
					otherHobbyText.value = otherHobbies.join(',');
				}
			}

			// 职业反显 (修改点2)
			if (userInfo.professionalTitle) {
				professionsList.value = userInfo.professionalTitle.split(',');
			} else {
				professionsList.value = ['']; // 保证至少有一个空输入框
			}

			// 学校反显 (修改点1)
			if (userInfo.school) {
				schoolsList.value = userInfo.school.split(',');
			} else {
				schoolsList.value = ['']; // 保证至少有一个空输入框
			}

			// 公司/行业反显 (修改点6)
			if (userInfo.companyName && userInfo.industry) {
				const companyNames = userInfo.companyName.split(',');
				const industryNames = userInfo.industry.split(',');

				companyAndIndustryList.value = companyNames.map((name, index) => ({
					name: name || '',
					industryName: industryNames[index] || '' // 直接赋值中文字符串
				}));
			} else {
				companyAndIndustryList.value = [{
					name: '',
					industryName: ''
				}];
			}

			// 【关键】处理生日回显：时间戳 -> YYYY-MM-DD
			if (userInfo.birthday && typeof userInfo.birthday === 'number') {
				const date = new Date(userInfo.birthday);
				form.value.birthday =
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			}
		}
	};

	// 两个计算属性用于信息脱敏
	const maskedName = computed(() => {
		// 直接返回后端提供的已脱敏的 cardName
		return form.value.cardName || '信息已隐藏';
	});

	const maskedIdCard = computed(() => {
		// 直接返回后端提供的已脱敏的 idCard
		return form.value.idCard || '信息已隐藏';
	});

	// 获取职业数据
	const getProfessionData = async () => {
		const {
			data,
			error
		} = await Api.getDictData('professional_list');
		if (!error && data) {
			professionOptions.value = data.map(item => ({
				text: item.label,
				value: item.value
			}));
		}
	};

	// 获取爱好数据
	const getHobbyData = async () => {
		const {
			data,
			error
		} = await Api.getDictData('hobby_list');
		if (!error && data) {
			hobbyOptions.value = data.map(item => ({
				text: item.label,
				value: item.label // value 直接使用中文标签
			}));
			hobbyOptions.value.push({
				text: '其他',
				value: '其他'
			});
		}
	};


	// --- 5. 用户交互方法 ---

	// 爱好变化时处理
	const onHobbyChange = (e) => {
		// 如果“其他”被取消选中，清空自定义输入
		if (!e.detail.value.includes('其他')) {
			otherHobbyText.value = '';
		}
	};

	// 动态增删公司/行业
	const addCompany = () => {
		if (companyAndIndustryList.value.length < 6) {
			companyAndIndustryList.value.push({
				name: '',
				industry: null
			});
		}
	};

	const addProfession = () => {
		if (professionsList.value.length < 3) professionsList.value.push('');
	};
	const removeProfession = (index) => {
		professionsList.value.splice(index, 1);
	};

	const addSchool = () => {
		if (schoolsList.value.length < 6) schoolsList.value.push('');
	};
	const removeSchool = (index) => {
		schoolsList.value.splice(index, 1);
	};
	const removeCompany = (index) => {
		companyAndIndustryList.value.splice(index, 1);
	};

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

			//处理地区提交：ID数组 -> 最后一个ID
			// if (Array.isArray(payload.locationAddress) && payload.locationAddress.length > 0) {
			// 	payload.locationAddress = payload.locationAddress[payload.locationAddress.length - 1];
			// }
			// if (Array.isArray(payload.birthplace) && payload.birthplace.length > 0) {
			// 	payload.birthplace = payload.birthplace[payload.birthplace.length - 1];
			// }
			['locationAddress', 'birthplace', 'nativePlace'].forEach(key => {
				if (Array.isArray(payload[key]) && payload[key].length > 0) {
					payload[key] = payload[key][payload[key].length - 1];
				}
			});

			// 爱好提交 
			let finalHobbies = selectedHobbies.value.filter(h => h !== '其他');
			if (isOtherHobbySelected.value && otherHobbyText.value.trim()) {
				finalHobbies.push(otherHobbyText.value.trim());
			}
			payload.hobby = finalHobbies.join(',');

			payload.professionalTitle = professionsList.value.map(p => p.trim()).filter(p => p).join(',');
			payload.school = schoolsList.value.map(s => s.trim()).filter(s => s).join(',');
			payload.companyName = companyAndIndustryList.value
				.map(item => (item.name || '').trim())
				.filter(name => name)
				.join(',');

			payload.industry = companyAndIndustryList.value
				.map(item => (item.industryName || '').trim()) // 直接使用 industryName
				.join(',');

			// 处理生日提交：YYYY-MM-DD -> 时间戳
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

	// 跳转到实名认证页面的方法
	const goToAuthPage = () => {
		uni.navigateTo({
			url: '/pages/my-auth/my-auth'
		});
	};
</script>

<style scoped lang="scss">
	/* --- 1. 页面基础与布局 --- */
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

	/* --- 2. 【【【核心修复】】】表单项通用布局 --- */

	// 统一所有表单项的布局和标签样式
	::v-deep .uni-forms-item {
		display: flex;
		align-items: center; // 垂直居中对齐
		margin-bottom: 20rpx;

		.uni-forms-item__label {
			width: 160rpx !important;
			font-size: 28rpx;
			color: #333;
			flex-shrink: 0; // 防止标签被压缩
			padding-right: 20rpx; // 标签和内容之间的距离
			box-sizing: border-box;
		}

		.uni-forms-item__content {
			flex: 1; // 内容区占据所有剩余空间
			min-width: 0; // 允许内容区在flex布局中被压缩，防止溢出
		}
	}

	// 让内容区里的组件（输入框、选择器）真正撑满
	::v-deep .uni-easyinput,
	::v-deep .uni-data-select,
	::v-deep .uni-datetime-picker,
	::v-deep .uni-data-picker {
		width: 100% !important;
	}

	/* --- 3. 【【【核心修复】】】 DataPicker 文本溢出终极解决方案 --- */
	::v-deep .uni-data-picker .uni-data-tree-input {
		display: flex !important;
		align-items: center;
		width: 100% !important;
		height: 36px; // 与 easyinput 保持一致
		border: 1px solid #e5e5e5;
		border-radius: 4px;
		padding: 0 10px;
		box-sizing: border-box;
		overflow: hidden;

		.input-value {
			flex: 1;
			min-width: 0; // 关键！
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}


	/* --- 4. 动态增删区块样式 (布局重构) --- */

	.dynamic-section {
		// 动态区块现在是一个独立的视觉单元
		margin-top: 40rpx;
		margin-bottom: 20rpx;
		padding-top: 30rpx;
		border-top: 1px solid #f0f0f0;
	}

	.dynamic-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.dynamic-label {
		// 大标题，如“职业”、“毕业学校”
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.add-btn-small {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		height: 50rpx;
		line-height: 50rpx;
		padding: 0 20rpx;
		margin: 0;
		background-color: #f0f7ff;
		color: #007bff;
		border: 1px solid #d2e7ff;

		&::after {
			border: none;
		}

		uni-icons {
			margin-right: 8rpx;
		}
	}

	// 单行动态项 (用于职业、学校) - 【布局重构】
	.dynamic-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		gap: 20rpx;

		.uni-easyinput {
			flex: 1;
		}
	}

	.remove-btn-small {
		width: 50rpx;
		height: 50rpx;
		line-height: 50rpx;
		padding: 0;
		margin: 0;
		border-radius: 50%;
		background-color: #fef0f0;
		color: #f56c6c;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
		flex-shrink: 0;

		&::after {
			border: none;
		}
	}

	// 多行动态组 (用于公司/行业) - 【布局重构】
	.dynamic-group {
		background-color: #f9f9f9;
		padding: 30rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		border: 1px solid #eee;
		// 【关键】移除了所有 margin-left

		.group-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
		}

		.group-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #555;
		}

		.remove-btn {
			font-size: 24rpx;
			height: 50rpx;
			line-height: 50rpx;
			padding: 0 20rpx;
			margin: 0;
			background-color: #fef0f0;
			color: #f56c6c;
			border: 1px solid #fde2e2;

			&::after {
				border: none;
			}
		}

		// 组内的表单项会自动继承第2部分的通用样式，无需特殊处理
	}


	/* --- 5. 其他组件与通用样式 (保持不变) --- */
	.avatar-uploader,
	.qr-uploader {
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

	.phone-text ::v-deep .uni-easyinput__content-input {
		color: #999 !important;
	}

	.other-hobby-input {
		margin-top: 20rpx;
	}


	/* --- 6. 底部按钮与认证区 (保持不变) --- */
	.save-btn,
	.label-btn,
	.auth-btn {
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
		background: linear-gradient(to right, #007bff, #0056b3);
	}

	.auth-btn {
		background: linear-gradient(to right, #00C777, #00A362);
	}

	.auth-info {
		font-size: 28rpx;
		color: #666;

		.auth-item {
			display: flex;
			justify-content: space-between;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			.auth-label {
				color: #333;
			}

			.auth-value {
				font-weight: bold;
			}
		}

		.auth-status {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			padding-top: 20rpx;
			color: #00C777;
			font-size: 26rpx;

			uni-icons {
				margin-right: 8rpx;
			}
		}
	}
</style>