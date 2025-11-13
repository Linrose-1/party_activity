<template>
	<view class="page-container">
		<view class="tabs-container">
			<uni-segmented-control :current="currentTab" :values="tabItems" @clickItem="handleTabClick"
				style-type="button" active-color="#FF6B00" />
		</view>


		<view class="content-area">
			<view v-show="currentTab === 0">
				<!-- 基本资料表单 -->
				<view class="form-section">

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
							<uni-forms-item label="性别" name="sex"><uni-data-select v-model="form.sex"
									:localdata="genderOptions" placeholder="请选择性别" /></uni-forms-item>
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
									<button v-if="professionsList.length < 3" class="add-btn-small"
										@click="addProfession">
										<uni-icons type="plusempty" size="14" color="#007bff"></uni-icons>
										添加
									</button>
								</view>
								<view v-for="(profession, index) in professionsList" :key="index" class="dynamic-item">
									<uni-easyinput v-model="professionsList[index]"
										placeholder="示例：XXX商会/会长，XXX协会/理事" />
									<button v-if="professionsList.length > 1" class="remove-btn-small"
										@click="removeProfession(index)">×</button>
								</view>
							</view>
							<view class="dynamic-section">
								<view class="dynamic-header">
									<text class="dynamic-label">公司/机构与行业</text>
									<button v-if="companyAndIndustryList.length < 3" class="add-btn-small"
										@click="addCompany">
										<uni-icons type="plusempty" size="14" color="#007bff"></uni-icons>
										添加
									</button>
								</view>
								<view v-for="(company, index) in companyAndIndustryList" :key="index"
									class="dynamic-group">
									<view class="group-header">
										<text class="group-title">第 {{ index + 1 }} 组</text>
										<button v-if="companyAndIndustryList.length > 1" class="remove-btn"
											@click="removeCompany(index)">删除</button>
									</view>
									<!-- 【样式修复关键】uni-forms-item 放在循环内，并使用动态 name -->
									<uni-forms-item :label="`行业`" :name="`industry_${index}`">
										<uni-data-picker class="dynamic-picker" placeholder="请选择所在行业"
											popup-title="请选择行业" :localdata="industryTree"
											:map="{text: 'name', value: 'name'}" v-model="company.industryName" />
									</uni-forms-item>
									<uni-forms-item :label="`公司`" :name="`company_${index}`">
										<uni-easyinput v-model="company.name" placeholder="请输入公司或机构名称" />
									</uni-forms-item>
									<uni-forms-item :label="`职务`" :name="`position_${index}`">
										<uni-easyinput v-model="company.positionTitle" placeholder="请输入您的职务" />
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
							<uni-forms-item label="手机号码" name="mobile"><uni-easyinput class="phone-text"
									v-model="form.mobile" :disabled="true" /></uni-forms-item>
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
								<uni-easyinput v-if="isOtherHobbySelected" v-model="otherHobbyText"
									placeholder="请输入您的其他爱好" class="other-hobby-input" />
							</uni-forms-item>
							<uni-forms-item label="个性签名" name="signature">
								<uni-easyinput v-model="form.signature" placeholder="设置一个独特的个性签名吧" />
							</uni-forms-item>
							<uni-forms-item label="个人简介" name="personalBio"><uni-easyinput type="textarea"
									v-model="form.personalBio" placeholder="介绍一下自己..." /></uni-forms-item>

							<!-- 我有资源 -->
							<uni-forms-item label="我有资源" name="haveResources">
								<uni-easyinput type="textarea" v-model="form.haveResources" placeholder="用来智能匹配商友资源" />
							</uni-forms-item>

							<!-- 我需资源 -->
							<uni-forms-item label="我需资源" name="needResources">
								<uni-easyinput type="textarea" v-model="form.needResources" placeholder="用来智能匹配商友资源" />
							</uni-forms-item>
						</uni-forms>

						<button class="save-btn" @click="submitForm">保存资料</button>
					</view>
				</view>
			</view>

			<view v-show="currentTab === 1">
				<view class="form-section digital-label-section">
					<view class="section-header">
						<text class="section-title">什么是数字标签？</text>
					</view>
					<view class="label-info-card">
						<p class="info-text">数字标签是您在平台上的个性化身份标识，它们能帮助其他商友快速了解您的专业领域、资源优势和合作需求。</p>
						<p class="info-text">通过精心设置您的数字标签，您可以：</p>
						<ul class="info-list">
							<li><uni-icons type="checkmarkempty" color="#00C777"></uni-icons> 提高个人辨识度</li>
							<li><uni-icons type="checkmarkempty" color="#00C777"></uni-icons> 吸引潜在的合作伙伴</li>
							<li><uni-icons type="checkmarkempty" color="#00C777"></uni-icons> 获得更精准的资源匹配</li>
						</ul>
						<button class="label-btn" @click="goToLabelEditPage">
							<uni-icons type="compose" color="#fff" size="20" style="margin-right: 10rpx;"></uni-icons>
							前往编辑数字标签
						</button>
					</view>
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
	import {
		onBackPress
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	// --- 1. 响应式状态定义 ---
	const currentTab = ref(0);
	const tabItems = ['普通资料', '数字标签'];
	const initialDataState = ref('');

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
		signature: '', // 个性签名
		haveResources: '', // 我有资源
		needResources: '' // 我需资源
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
		industryName: '',
		positionTitle: ''
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
		autoPostToCircle: () => request('/app-api/member/business-opportunities/autoOpportunities', {
			method: 'POST'
		})
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

	onBackPress((options) => {
		// 检查是否是从代码层面调用的返回 (例如保存成功后的跳转)
		// 如果是，则直接允许返回，不弹出任何提示
		if (options.from === 'navigateBack') {
			return false;
		}

		// 对于用户手动触发的返回（物理键或左上角按钮），统一弹出提示
		uni.showModal({
			title: '提示',
			content: '若有更改资料，请记得保存',
			confirmText: '确认退出',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					// 用户确认退出，手动执行返回操作
					uni.navigateBack();
				}
				// 如果用户点击“取消”，则 success 回调结束，什么也不做，页面保持不变
			}
		});

		// 【关键】必须返回 true 来阻止默认的返回行为。
		// 因为 uni.showModal 是异步的，我们不能等待它的结果。
		// 我们在这里阻止默认行为，然后在 modal 的回调中自己决定是否要调用 uni.navigateBack()。
		return true;
	});

	// --- 页面切换方法 ---
	const handleTabClick = (e) => {
		currentTab.value = e.currentIndex;
	};



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

	/**
	 * @description 预处理行业树数据，解决“父子同名”导致的无限循环问题
	 * @param {Array} tree - 原始行业树
	 * @returns {Array} - 处理后的行业树
	 */
	const processIndustryTree = (tree) => {
		if (!Array.isArray(tree)) return [];

		// 使用 map 创建一个新数组，避免直接修改原始数据
		return tree.map(node => {
			// 检查当前节点是否满足“父子同名且只有一个子节点”的条件
			if (
				node.children &&
				node.children.length === 1 &&
				node.children[0].name === node.name
			) {
				// 如果满足条件，用子节点替换父节点
				// 【重要】替换后，需要将这个“新父节点”的 children 设置为 null，因为它就是最终的叶子节点
				return {
					...node.children[0],
					children: null
				};
			} else if (node.children) {
				// 如果不满足条件，但有子节点，则递归处理它的子节点
				return {
					...node,
					children: processIndustryTree(node.children)
				};
			}

			// 如果没有子节点，直接返回原节点
			return node;
		});
	};

	const getIndustryTreeData = async () => {
		const {
			data,
			error
		} = await Api.getIndustryTree();
		if (error) {
			console.error('获取行业树失败:', error);
		} else {
			// 在将数据赋值给 industryTree.value 之前，先进行预处理
			industryTree.value = processIndustryTree(data || []);
			console.log("处理后的行业树:", industryTree.value);
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

			// 公司/行业/职务 反显
			if (userInfo.companyName || userInfo.industry || userInfo.positionTitle) {
				const companyNames = (userInfo.companyName || '').split(',');
				const industryNames = (userInfo.industry || '').split(',');
				const positionTitles = (userInfo.positionTitle || '').split(',');

				// 以最长的数组为基准进行映射，避免数据丢失
				const maxLength = Math.max(companyNames.length, industryNames.length, positionTitles.length);
				const newList = [];
				for (let i = 0; i < maxLength; i++) {
					// 确保即使某个字段为空也能正确映射
					if (companyNames[i] || industryNames[i] || positionTitles[i]) {
						newList.push({
							name: companyNames[i] || '',
							industryName: industryNames[i] || '',
							positionTitle: positionTitles[i] || ''
						});
					}
				}
				companyAndIndustryList.value = newList.length > 0 ? newList : [{
					name: '',
					industryName: '',
					positionTitle: ''
				}];

			} else {
				companyAndIndustryList.value = [{
					name: '',
					industryName: '',
					positionTitle: ''
				}];
			}

			// 【关键】处理生日回显：时间戳 -> YYYY-MM-DD
			if (userInfo.birthday && typeof userInfo.birthday === 'number') {
				const date = new Date(userInfo.birthday);
				form.value.birthday =
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			}

			// 在所有数据填充完毕后，记录初始状态
			initialDataState.value = JSON.stringify({
				form: form.value,
				professionsList: professionsList.value,
				schoolsList: schoolsList.value,
				companyAndIndustryList: companyAndIndustryList.value,
				selectedHobbies: selectedHobbies.value,
				otherHobbyText: otherHobbyText.value
			});
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
		if (companyAndIndustryList.value.length < 3) {
			companyAndIndustryList.value.push({
				name: '',
				industryName: '',
				positionTitle: ''
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

			payload.positionTitle = companyAndIndustryList.value
				.map(item => (item.positionTitle || '').trim())
				.filter(title => title)
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
				// 保存成功后，更新初始状态为当前状态
				// initialDataState.value = JSON.stringify({
				// 	form: form.value,
				// 	professionsList: professionsList.value,
				// 	schoolsList: schoolsList.value,
				// 	companyAndIndustryList: companyAndIndustryList.value,
				// 	selectedHobbies: selectedHobbies.value,
				// 	otherHobbyText: otherHobbyText.value
				// });

				// uni.showToast({
				// 	title: '保存成功',
				// 	icon: 'success'
				// });
				// setTimeout(() => uni.navigateBack(), 1500);
				// ==================== 【核心修改区域】 ====================
				// 1. 先提示保存成功
				uni.showToast({
					title: '资料保存成功',
					icon: 'success'
				});

				// 2. 移除原来的自动返回逻辑
				// setTimeout(() => uni.navigateBack(), 1500);

				// 3. 延迟一小段时间后，弹出新的引导弹窗
				setTimeout(() => {
					uni.showModal({
						title: '发布到商友圈',
						content: '您的资料已完善，是否发布一条商机到商友圈，让更多商友看到您？',
						confirmText: '立即发布',
						cancelText: '暂不发布',
						success: (res) => {
							if (res.confirm) {
								// 用户选择“是”，调用自动发圈函数
								handleAutoPost();
							} else if (res.cancel) {
								// 用户选择“否”，则返回上一页
								uni.navigateBack();
							}
						}
					});
				}, 800); // 延迟800毫秒，确保用户看到了“保存成功”的提示
				// =========================================================
			}
		}).catch(err => {
			console.log('表单验证失败：', err);
		});
	};

	/**
	 * 处理自动发圈的函数
	 */
	const handleAutoPost = async () => {
		uni.showLoading({
			title: '正在发布...'
		});

		const {
			data,
			error
		} = await Api.autoPostToCircle();

		uni.hideLoading();

		if (error) {
			// 【核心】如果后端返回错误（例如已发布过），将错误信息展示给用户
			uni.showModal({
				title: '发布失败',
				content: typeof error === 'object' ? error.msg : error,
				showCancel: false, // 只显示确认按钮
				confirmText: '知道了'
			});
		} else {
			// 发布成功
			uni.showToast({
				title: '已成功发布到商友圈',
				icon: 'success'
			});
			// 延迟1.5秒后跳转到商友圈（首页）
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/home/home' // 【重要】首页是Tab页，必须用 switchTab
				});
			}, 1500);
		}
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
	.page-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f9f9f9;
	}

	.tabs-container {
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #eee;
		flex-shrink: 0;
	}

	.content-area {
		padding: 20rpx 30rpx 40rpx;
		flex: 1;
		overflow-y: auto;
	}

	/* --- 2. 表单通用样式 --- */
	.form-section {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
	}

	.section-header {
		.section-title {
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 30rpx;
			display: block;
		}
	}

	/* --- 3. uni-forms 组件深度样式修复 --- */

	/* 统一所有表单项的标签与内容布局 */
	::v-deep .uni-forms-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.uni-forms-item__label {
			width: 160rpx !important;
			font-size: 28rpx;
			color: #333;
			flex-shrink: 0;
			padding-right: 20rpx;
			box-sizing: border-box;
		}

		.uni-forms-item__content {
			flex: 1;
			min-width: 0;
		}
	}

	/* 强制内容区组件撑满 */
	::v-deep .uni-easyinput,
	::v-deep .uni-data-select,
	::v-deep .uni-datetime-picker,
	::v-deep .uni-data-picker {
		width: 100% !important;
	}

	/* 禁用状态的手机号输入框样式 */
	.phone-text ::v-deep .uni-easyinput__content-input {
		color: #999 !important;
	}

	/* 修复 uni-data-picker 文本溢出问题 */
	::v-deep .uni-data-picker .uni-data-tree-input {
		display: flex !important;
		align-items: center;
		width: 100% !important;
		height: 36px;
		border: 1px solid #e5e5e5;
		border-radius: 4px;
		padding: 0 10px;
		box-sizing: border-box;
		overflow: hidden;

		.input-value {
			flex: 1;
			min-width: 0;
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	/* --- 4. 特定表单项样式 (头像、二维码、爱好) --- */
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
		height: 60rpx;
		line-height: 60rpx;
		margin: 0;
		padding: 0 30rpx;
		background-color: #f5f5f5;
		color: #333;
		font-size: 26rpx;

		&::after {
			border: none;
		}
	}

	.other-hobby-input {
		margin-top: 20rpx;
	}

	/* --- 5. 动态增删区块样式 --- */
	.dynamic-section {
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
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	/* 动态项 - 单行 (职业、学校) */
	.dynamic-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 20rpx;

		.uni-easyinput {
			flex: 1;
		}
	}

	/* 动态项 - 分组 (公司/行业) */
	.dynamic-group {
		margin-bottom: 20rpx;
		padding: 30rpx;
		background-color: #f9f9f9;
		border: 1px solid #eee;
		border-radius: 12rpx;

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
	}

	/* 动态项 - 添加/删除按钮 */
	.add-btn-small {
		display: flex;
		align-items: center;
		height: 50rpx;
		line-height: 50rpx;
		margin: 0;
		padding: 0 20rpx;
		background-color: #f0f7ff;
		color: #007bff;
		font-size: 24rpx;
		border: 1px solid #d2e7ff;

		&::after {
			border: none;
		}

		uni-icons {
			margin-right: 8rpx;
		}
	}

	.remove-btn-small {
		width: 50rpx;
		height: 50rpx;
		line-height: 50rpx;
		margin: 0;
		padding: 0;
		background-color: #fef0f0;
		color: #f56c6c;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
		border-radius: 50%;
		flex-shrink: 0;

		&::after {
			border: none;
		}
	}

	.remove-btn {
		height: 50rpx;
		line-height: 50rpx;
		margin: 0;
		padding: 0 20rpx;
		background-color: #fef0f0;
		color: #f56c6c;
		font-size: 24rpx;
		border: 1px solid #fde2e2;

		&::after {
			border: none;
		}
	}

	/* --- 6. 数字标签页面样式 --- */
	.digital-label-section {
		/* 继承 .form-section 的基础样式 */
	}

	.label-info-card {
		.info-text {
			font-size: 28rpx;
			color: #666;
			line-height: 1.7;
			margin-bottom: 20rpx;
		}

		.info-list {
			list-style: none;
			padding-left: 0;
			margin: 30rpx 0;

			li {
				display: flex;
				align-items: center;
				margin-bottom: 15rpx;
				font-size: 28rpx;
				color: #333;

				.uni-icons {
					margin-right: 15rpx;
				}
			}
		}
	}

	/* --- 7. 页面底部操作按钮 --- */
	.save-btn,
	.label-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		color: white;
		border: none;

		&::after {
			border: none;
		}
	}

	.save-btn {
		margin-top: 40rpx;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
	}

	.label-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 50rpx;
		background: linear-gradient(to right, #007bff, #0056b3);
	}
</style>