<template>
	<view class="page-container">
		<!-- 顶部 Tab -->
		<view class="tabs-wrapper">
			<uni-segmented-control :current="currentTab" :values="tabItems" @clickItem="handleTabClick"
				style-type="text" active-color="#FF8700" class="custom-tabs" />
			<!-- <view class="tab-line" :style="{ left: currentTab === 0 ? '25%' : '75%' }"></view> -->
		</view>

		<view class="content-area">
			<!-- Tab 0: 普通资料 -->
			<view v-show="currentTab === 0">
				<uni-forms ref="formRef" :modelValue="form" :rules="rules" label-width="85px" label-position="top">

					<!-- 模块：头像与基础信息 -->
					<view class="form-card avatar-card">
						<uni-forms-item name="avatar" class="avatar-form-item">
							<view class="avatar-uploader-center" @click="chooseAvatar">
								<view class="avatar-box">
									<image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
									<image v-else src="/static/images/default-avatar.png" class="avatar-img placeholder"
										mode="aspectFill" />
									<view class="camera-icon">
										<uni-icons type="camera-filled" size="18" color="#fff"></uni-icons>
									</view>
								</view>
								<text class="upload-text">{{ form.avatar ? '点击更换头像' : '上传头像' }}</text>
							</view>
						</uni-forms-item>
					</view>

					<view class="form-card">
						<view class="card-title">基础信息</view>
						<uni-forms-item label="用户昵称" name="nickname">
							<uni-easyinput v-model="form.nickname" placeholder="请输入用户昵称" />
						</uni-forms-item>
						<uni-forms-item label="真实姓名" name="realName">
							<uni-easyinput v-model="form.realName" placeholder="请输入真实姓名" :disabled="true" />
						</uni-forms-item>
						<uni-forms-item label="性别" name="sex">
							<uni-data-select v-model="form.sex" :localdata="genderOptions" placeholder="请选择性别"
								:clear="false" />
						</uni-forms-item>
						<uni-forms-item label="出生年代" name="era">
							<uni-data-select v-model="form.era" :localdata="eraOptions" placeholder="请选择出生年代"
								:clear="false" />
						</uni-forms-item>
					</view>

					<!-- 模块：联系与认证 -->
					<view class="form-card">
						<view class="card-title">联系与认证</view>
						<uni-forms-item label="手机号码" name="mobile">
							<uni-easyinput class="phone-text" v-model="form.mobile" :disabled="true" />
						</uni-forms-item>
						<uni-forms-item label="常用邮箱" name="contactEmail">
							<uni-easyinput v-model="form.contactEmail" placeholder="请输入邮箱" />
						</uni-forms-item>

						<uni-forms-item label="微信二维码" name="wechatQrCodeUrl" label-position="top">
							<view class="qr-uploader-centered" @click="chooseWechatQr">
								<view class="qr-box">
									<!-- 有图片时显示大图 -->
									<image v-if="form.wechatQrCodeUrl" :src="form.wechatQrCodeUrl" class="qr-img-large"
										mode="aspectFill" @click.stop="previewImage(form.wechatQrCodeUrl)" />

									<!-- 无图片时显示占位符 -->
									<view v-else class="qr-placeholder-large">
										<uni-icons type="scan" size="32" color="#ccc"></uni-icons>
										<text class="placeholder-text">上传二维码</text>
									</view>
								</view>
								<!-- 底部提示文字 -->
								<view class="upload-action">
									<uni-icons type="camera" size="16" color="#FF8700"
										style="margin-right: 4rpx;"></uni-icons>
									<text class="action-text">{{ form.wechatQrCodeUrl ? '点击更换' : '点击上传' }}</text>
								</view>
							</view>
						</uni-forms-item>

						<!-- <uni-forms-item label="企业号认证" name="enterpriseIdCert">
							<view class="switch-row">
								<text class="switch-status">{{ form.enterpriseIdCert === 1 ? '已开启' : '未开启' }}</text>
								<switch :checked="form.enterpriseIdCert === 1" @change="onEnterpriseSwitchChange"
									color="#FF8700" style="transform:scale(0.8)" />
							</view>
						</uni-forms-item> -->
					</view>

					<!-- 模块：地域信息 -->
					<view class="form-card">
						<view class="card-title">地域分布</view>
						<uni-forms-item label="商务/办公地" name="locationAddress">
							<uni-data-picker placeholder="请选择商务/办公地" popup-title="请选择省市区" :localdata="areaTree"
								:map="{text: 'name', value: 'id'}" v-model="form.locationAddress" />
						</uni-forms-item>
						<!-- <uni-forms-item label="出生地" name="birthplace">
							<uni-data-picker placeholder="请选择出生地" popup-title="请选择省市区" :localdata="areaTree"
								:map="{text: 'name', value: 'id'}" v-model="form.birthplace" />
						</uni-forms-item> -->
						<uni-forms-item label="籍贯/出生地" name="nativePlace">
							<uni-data-picker placeholder="请选择籍贯/出生地" popup-title="请选择省市区" :localdata="areaTree"
								:map="{text: 'name', value: 'id'}" v-model="form.nativePlace" />
						</uni-forms-item>
					</view>

					<!-- 模块：职业背景 (动态) -->
					<view class="form-card">
						<view class="card-header-row">
							<view class="card-title">商会/协会与职务</view>
							<view v-if="professionsList.length < 3" class="add-text-btn" @click="addProfession">
								<uni-icons type="plusempty" size="14" color="#FF8700"></uni-icons> 添加
							</view>
						</view>

						<view v-for="(profession, index) in professionsList" :key="index" class="dynamic-row-item">
							<uni-easyinput v-model="professionsList[index]" placeholder="示例：XXX商会/会长"
								:inputBorder="false" />
							<view v-if="professionsList.length > 1" class="delete-icon"
								@click="removeProfession(index)">
								<uni-icons type="trash" size="18" color="#999"></uni-icons>
							</view>
						</view>
					</view>

					<view class="form-card">
						<view class="card-header-row">
							<view class="card-title">公司/机构与行业</view>
							<view v-if="companyAndIndustryList.length < 3" class="add-text-btn" @click="addCompany">
								<uni-icons type="plusempty" size="14" color="#FF8700"></uni-icons> 添加
							</view>
						</view>

						<view v-for="(company, index) in companyAndIndustryList" :key="index"
							class="dynamic-block-item">
							<view class="block-header">
								<text class="block-index">#{{ index + 1 }}</text>
								<view v-if="companyAndIndustryList.length > 1" class="delete-text"
									@click="removeCompany(index)">删除</view>
							</view>

							<uni-forms-item :label="`所在行业`" :name="`industry_${index}`" label-width="70px">
								<uni-data-picker class="simple-picker" placeholder="请选择行业" popup-title="请选择行业"
									:localdata="industryTree" :map="{text: 'name', value: 'name'}"
									v-model="company.industryName" @change="(e) => onIndustryChangeWithAll(e, index)" />
							</uni-forms-item>
							<view class="divider"></view>
							<uni-forms-item :label="`公司名称`" :name="`company_${index}`" label-width="70px">
								<uni-easyinput v-model="company.name" placeholder="请输入公司名称" />
							</uni-forms-item>
							<view class="divider"></view>
							<uni-forms-item :label="`担任职务`" :name="`position_${index}`" label-width="70px">
								<uni-easyinput v-model="company.positionTitle" placeholder="请输入您的职务" />
							</uni-forms-item>
						</view>
					</view>

					<!-- 模块：教育背景 (动态) -->
					<view class="form-card">
						<view class="card-header-row">
							<view class="card-title">毕业学校</view>
							<view v-if="schoolsList.length < 6" class="add-text-btn" @click="addSchool">
								<uni-icons type="plusempty" size="14" color="#FF8700"></uni-icons> 添加
							</view>
						</view>

						<view v-for="(school, index) in schoolsList" :key="index" class="dynamic-row-item">
							<uni-easyinput v-model="schoolsList[index]" placeholder="请输入学校名称" />
							<view v-if="schoolsList.length > 1" class="delete-icon" @click="removeSchool(index)">
								<uni-icons type="trash" size="18" color="#999"></uni-icons>
							</view>
						</view>
					</view>

					<!-- 模块：个性化信息 -->
					<view class="form-card">
						<view class="card-title">个性化信息</view>
						<uni-forms-item label="个人爱好" name="hobby" label-position="top">
							<view class="checkbox-group-wrapper">
								<uni-data-checkbox v-model="selectedHobbies" :localdata="hobbyOptions" multiple
									@change="onHobbyChange" selectedColor="#FF8700" selectedTextColor="#FF8700" />
							</view>
							<uni-easyinput v-if="isOtherHobbySelected" v-model="otherHobbyText" placeholder="请输入您的其他爱好"
								class="other-hobby-input"
								style="background:#f9f9f9; padding:0 20rpx; border-radius:10rpx; margin-top:20rpx;" />
						</uni-forms-item>

						<uni-forms-item label="个性签名" name="signature" label-position="top">
							<uni-easyinput v-model="form.signature" placeholder="设置一个独特的个性签名吧" type="textarea"
								autoHeight class="textarea-bg" />
						</uni-forms-item>

						<uni-forms-item label="个人简介" name="personalBio" label-position="top">
							<uni-easyinput v-model="form.personalBio" placeholder="介绍一下自己..." type="textarea" autoHeight
								class="textarea-bg" />
						</uni-forms-item>
					</view>

					<!-- 模块：资源供需 -->
					<view class="form-card">
						<view class="card-title">资源供需</view>
						<uni-forms-item label="我有资源" name="haveResources" label-position="top">
							<uni-easyinput v-model="form.haveResources" placeholder="用来智能匹配商友资源" type="textarea"
								autoHeight class="textarea-bg" />
						</uni-forms-item>

						<uni-forms-item label="我需资源" name="needResources" label-position="top">
							<uni-easyinput v-model="form.needResources" placeholder="用来智能匹配商友资源" type="textarea"
								autoHeight class="textarea-bg" />
						</uni-forms-item>
					</view>

				</uni-forms>

				<button class="save-btn" @click="submitForm">保存资料</button>
				<view class="bottom-spacer"></view>
			</view>

			<!-- Tab 1: 数字标签 (保持原有逻辑，优化UI) -->
			<view v-if="currentTab === 1">
				<view class="form-card info-card">
					<view class="info-header">
						<text class="info-title">什么是数字标签？</text>
						<uni-icons type="info" size="24" color="#FF8700"></uni-icons>
					</view>
					<view class="info-body">
						<text class="info-desc">数字标签是您在平台上的个性化身份标识，它们能帮助其他商友快速了解您的基础信用、协作态度、专业能力、精神格局等不同维度的深度信息。</text>
						<view class="benefit-list">
							<view class="benefit-item">
								<view class="check-circle"><uni-icons type="checkmarkempty" size="14"
										color="#fff"></uni-icons></view>
								<text>提高个人辨识度</text>
							</view>
							<view class="benefit-item">
								<view class="check-circle"><uni-icons type="checkmarkempty" size="14"
										color="#fff"></uni-icons></view>
								<text>吸引潜在的合作伙伴</text>
							</view>
							<view class="benefit-item">
								<view class="check-circle"><uni-icons type="checkmarkempty" size="14"
										color="#fff"></uni-icons></view>
								<text>获得更精准的资源匹配</text>
							</view>
						</view>
					</view>
					<button class="label-btn" @click="goToLabelEditPage">
						<uni-icons type="compose" color="#fff" size="18" style="margin-right: 12rpx;"></uni-icons>
						前往编辑数字标签（自我评分）
					</button>
				</view>

				<UserScoreBoard :datasets="radarDatasets" :showTitle="true" />
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

	import UserScoreBoard from '@/components/UserScoreBoard.vue';

	// --- 1. 响应式状态定义 ---
	const currentTab = ref(0);
	const tabItems = ['基本信息', '数字标签'];
	const initialDataState = ref('');
	const userId = ref(uni.getStorageSync('userId'));
	// --- 草稿缓存相关变量 ---
	const DRAFT_KEY = 'user_profile_draft_v3'; // 换个新 Key，防止旧缓存干扰
	const isDataLoaded = ref(false); // 【关键】标记后端数据是否已填充完毕
	let draftTimer = null; // 防抖定时器

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
		needResources: '', // 我需资源
		enterpriseIdCert: 0,
	});

	// 数据源
	const areaTree = ref([]);
	const industryTree = ref([]);
	const professionOptions = ref([]);
	const hobbyOptions = ref([]);
	const radarDatasets = ref([]);

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

	// --- 自动保存逻辑 ---
	// 1. 创建一个计算属性，聚合所有需要保存的数据
	// 这样做的目的是为了让 watch 能绝对稳定地监听这些数据的变化
	const dataSnapshot = computed(() => {
		return {
			// 解构 form 的内容，确保深层变化能被感知
			...form.value,
			// 包含动态数组
			professionsList: professionsList.value,
			schoolsList: schoolsList.value,
			companyAndIndustryList: companyAndIndustryList.value,
			selectedHobbies: selectedHobbies.value,
			otherHobbyText: otherHobbyText.value
		};
	});

	// 2. 监听这个快照的变化
	watch(dataSnapshot, (newVal) => {
		// A. 如果后端数据还没加载完，绝对不要保存
		if (!isDataLoaded.value) {
			return;
		}

		// B. 防抖处理：停止输入 1 秒后才执行保存
		clearTimeout(draftTimer);
		draftTimer = setTimeout(() => {
			const draftData = {
				...newVal, // 直接使用计算属性的值
				timestamp: Date.now()
			};

			// C. 执行保存
			try {
				uni.setStorageSync(DRAFT_KEY, JSON.stringify(draftData));
				console.log('✅ [自动保存] 资料已写入缓存', new Date().toLocaleTimeString());
			} catch (e) {
				console.error('保存缓存失败', e);
			}
		}, 1000); // 1秒防抖
	}, {
		deep: true
	});


	// 应用侦听器到所有需要限制的字段
	watchAndSanitize(professionsList);
	watchAndSanitize(schoolsList);
	watchAndSanitize(companyAndIndustryList, 'name'); // 只限制公司名称字段
	watchAndSanitize(otherHobbyText);


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
		}),
		getStatistics: (userId, type) => request('/app-api/member/user-scores/complexStatistics', {
			method: 'GET',
			data: {
				userId,
				type
			}
		}),
	};


	// --- 3. 生命周期钩子 ---

	onMounted(async () => {
		uni.showLoading({
			title: '加载基础数据...'
		});
		if (!userId.value) {
			userId.value = uni.getStorageSync('userId');
		}
		// 确保数据源先加载
		await Promise.all([
			getAreaTreeData(),
			getIndustryTreeData(),
			getProfessionData(),
			getHobbyData(),
			fetchRadarStatistics()
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

	/**
	 * @description 处理企业号开关状态变化
	 * @param {object} e - switch 组件派发的事件对象
	 */
	const onEnterpriseSwitchChange = (e) => {
		// e.detail.value 是一个布尔值 (true/false)
		// 我们需要将其转换为数字 1 或 0
		form.value.enterpriseIdCert = e.detail.value ? 1 : 0;
	};



	// --- 4. 数据获取与处理方法 ---
	// 获取并计算雷达图数据
	const fetchRadarStatistics = async () => {
		try {
			// 1. 并发请求：0=自评，1=商友，3=综合
			const [selfRes, friendRes, complexRes] = await Promise.all([
				Api.getStatistics(userId.value, 0),
				Api.getStatistics(userId.value, 1),
				Api.getStatistics(userId.value, 3)
			]);

			const newDatasets = [];

			// 2. 索引 0：固定为 自我评价
			newDatasets.push({
				name: '自我评价',
				data: (!selfRes.error && selfRes.data) ? [selfRes.data.avg1 || 0, selfRes.data.avg2 || 0,
					selfRes.data.avg3 || 0, selfRes.data.avg4 || 0
				] : [0, 0, 0, 0],
				color: '#FF7D00'
			});

			// 3. 索引 1：固定为 商友评价 (必须占住第2位)
			newDatasets.push({
				name: '商友评价',
				data: (!friendRes.error && friendRes.data) ? [friendRes.data.avg1 || 0, friendRes.data
					.avg2 || 0, friendRes.data.avg3 || 0, friendRes.data.avg4 || 0
				] : [0, 0, 0, 0],
				color: '#4CAF50'
			});

			// 4. 索引 2：固定为 综合评价 (必须占住第3位)
			newDatasets.push({
				name: '综合评价',
				data: (!complexRes.error && complexRes.data) ? [complexRes.data.avg1 || 0, complexRes.data
					.avg2 || 0, complexRes.data.avg3 || 0, complexRes.data.avg4 || 0
				] : [0, 0, 0, 0],
				color: '#1890FF'
			});

			// 5. 赋值
			radarDatasets.value = newDatasets;
			console.log('✅ 统计数据加载完毕，索引已固定：[0]自我, [1]商友, [2]综合');

		} catch (e) {
			console.error('获取统计数据异常', e);
		}
	};
	// const fetchRadarStatistics = async () => {
	// 	try {
	// 		// 并发请求：0=自评，3=综合
	// 		const [selfRes, friendRes,complexRes] = await Promise.all([
	// 			Api.getStatistics(userId.value, 0), // 自评
	// 			Api.getStatistics(userId.value, 1), // 商友
	// 			Api.getStatistics(userId.value, 3) // 综合
	// 		]);

	// 		const newDatasets = [];

	// 		// 组装自我评价数据
	// 		if (!selfRes.error && selfRes.data) {
	// 			newDatasets.push({
	// 				name: '自我评价',
	// 				data: [
	// 					selfRes.data.avg1 || 0,
	// 					selfRes.data.avg2 || 0,
	// 					selfRes.data.avg3 || 0,
	// 					selfRes.data.avg4 || 0
	// 				],
	// 				color: '#FF7D00'
	// 			});
	// 		}

	// 		if (!friendRes.error && friendRes.data) {
	// 			newDatasets.push({
	// 				name: '商友评价',
	// 				data: [
	// 					friendRes.data.avg1 || 0,
	// 					friendRes.data.avg2 || 0,
	// 					friendRes.data.avg3 || 0,
	// 					friendRes.data.avg4 || 0
	// 				],
	// 				color: '#4CAF50'
	// 			});
	// 		}

	// 		// 组装综合评价数据
	// 		if (!complexRes.error && complexRes.data) {
	// 			newDatasets.push({
	// 				name: '综合评价',
	// 				data: [
	// 					complexRes.data.avg1 || 0,
	// 					complexRes.data.avg2 || 0,
	// 					complexRes.data.avg3 || 0,
	// 					complexRes.data.avg4 || 0
	// 				],
	// 				color: '#1890FF'
	// 			});
	// 		}

	// 		radarDatasets.value = newDatasets;
	// 	} catch (e) {
	// 		console.error('获取统计数据失败', e);
	// 	}
	// };

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

		return tree.map(node => {
			if (node.children && node.children.length === 1 && node.children[0].name === node.name) {
				return {
					...node.children[0],
					children: null
				};
			}

			if (node.children && node.children.length > 0) {
				const hasAllNode = node.children.some(c => c.name === '全部分类');
				if (!hasAllNode) {
					node.children.unshift({
						id: node.id + '_all',
						name: '全部分类',
						text: '全部分类', // 同时显式定义 text 属性
						children: null
					});
				}
				return {
					...node,
					children: processIndustryTree(node.children)
				};
			}
			return node;
		});
	};

	/**
	 * @description 处理行业选择，兼容“全部分类”逻辑
	 */
	const onIndustryChangeWithAll = (event, index) => {
		const nodes = event.detail.value; // 获取选中的路径节点数组
		if (!nodes || nodes.length === 0) return;

		const lastNode = nodes[nodes.length - 1];
		// 关键：由于配置了 map，组件内部可能会将 name 转换为 text
		const lastNodeText = lastNode.text || lastNode.name;

		let finalIndustryName = '';

		if (lastNodeText === '全部分类') {
			// 如果选的是“全部分类”，则取其父级的名称
			// 逻辑：如果路径是 [制造业, 全部分类]，结果就是 "制造业"
			const parentNode = nodes[nodes.length - 2];
			finalIndustryName = parentNode ? (parentNode.text || parentNode.name) : '';
		} else {
			// 如果选的是正常的末级分类，拼接完整路径
			finalIndustryName = nodes.map(n => n.text || n.name).join('/');
		}

		// 强制更新对应索引的数据，确保响应式
		companyAndIndustryList.value[index].industryName = finalIndustryName;

		// 调试打印，现在应该能看到正确的值了
		console.log(`第 ${index + 1} 组行业选择完毕:`, finalIndustryName);
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

			// 处理生日回显：时间戳 -> YYYY-MM-DD
			if (userInfo.birthday && typeof userInfo.birthday === 'number') {
				const date = new Date(userInfo.birthday);
				form.value.birthday =
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			}

			// 在所有数据填充完毕后，记录初始状态
			// initialDataState.value = JSON.stringify({
			// 	form: form.value,
			// 	professionsList: professionsList.value,
			// 	schoolsList: schoolsList.value,
			// 	companyAndIndustryList: companyAndIndustryList.value,
			// 	selectedHobbies: selectedHobbies.value,
			// 	otherHobbyText: otherHobbyText.value
			// });
		}

		// ============================================
		// 【关键点 1】后端数据填充完毕，允许 Watch 工作
		// ============================================
		// 使用 nextTick 确保 Vue 完成了上面的数据更新，再开启标志位
		// 这样避免 "填充后端数据" 这个动作本身触发了 "保存草稿"
		setTimeout(() => {
			// 1. 先开启标志位，允许后续的修改触发保存
			isDataLoaded.value = true;
			console.log('✅ [系统状态] 数据初始化完成，开始监听修改...');

			// 2. 检查是否有旧草稿需要恢复
			// 注意：这里调用后，如果用户点恢复，会触发上面的 watch 再保存一次，这是正常的
			checkAndRestoreDraft();
		}, 500);
	};

	const checkAndRestoreDraft = () => {
		const draftStr = uni.getStorageSync(DRAFT_KEY);
		if (!draftStr) {
			console.log('📭 [缓存检查] 无本地草稿');
			return;
		}

		uni.showModal({
			title: '恢复编辑',
			content: '检测到您有上次未保存的资料，是否恢复？',
			confirmText: '恢复',
			cancelText: '放弃',
			success: (res) => {
				if (res.confirm) {
					try {
						const draft = JSON.parse(draftStr);
						// 恢复数据
						Object.assign(form.value, draft.form || draft); // 兼容一下结构

						// 恢复数组
						if (draft.professionsList) professionsList.value = draft.professionsList;
						if (draft.schoolsList) schoolsList.value = draft.schoolsList;
						if (draft.companyAndIndustryList) companyAndIndustryList.value = draft
							.companyAndIndustryList;
						if (draft.selectedHobbies) selectedHobbies.value = draft.selectedHobbies;
						if (draft.otherHobbyText) otherHobbyText.value = draft.otherHobbyText;

						uni.showToast({
							title: '已恢复',
							icon: 'none'
						});
					} catch (e) {
						uni.removeStorageSync(DRAFT_KEY);
					}
				} else if (res.cancel) {
					uni.removeStorageSync(DRAFT_KEY);
				}
			}
		});
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


	// --- 微信二维码上传逻辑 (含裁剪) ---

	// 1. 选择图片并触发裁剪
	const chooseWechatQr = () => {
		uni.chooseImage({
			count: 1,
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];

				// #ifdef MP-WEIXIN
				// 微信小程序端：调用原生裁剪，比例 1:1 (正方形)
				wx.cropImage({
					src: tempFilePath,
					cropScale: '1:1',
					success: (cropRes) => {
						console.log('二维码裁剪成功');
						uploadQrCode(cropRes.tempFilePath);
					},
					fail: (err) => {
						console.log('取消裁剪或失败:', err);
					}
				});
				// #endif

				// #ifndef MP-WEIXIN
				// 非小程序端直接上传
				uploadQrCode(tempFilePath);
				// #endif
			}
		});
	};

	// 2. 上传裁剪后的图片
	const uploadQrCode = async (filePath) => {
		uni.showLoading({
			title: '上传中...',
			mask: true
		});

		// 调用封装好的 uploadFile 工具
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'qrcode'
		});

		uni.hideLoading();

		if (result.data) {
			form.value.wechatQrCodeUrl = result.data;
			uni.showToast({
				title: '二维码上传成功',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: result.error || '上传失败',
				icon: 'none'
			});
		}
	};

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
				uni.removeStorageSync(DRAFT_KEY);
				console.log('🧹 [提交成功] 草稿已清除');

				uni.showToast({
					title: '资料保存成功',
					icon: 'success'
				});

				// 3. 延迟一小段时间后，弹出新的引导弹窗
				setTimeout(() => {
					uni.showModal({
						title: '发布到商友圈',
						content: '您的资料已更新，发布名片问候语到商友圈的“商友连接”模块，让商友们更快看见您！',
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
	/* --- 全局容器与变量 --- */
	$theme-color: #FF8700;
	$bg-color: #f5f6fa;
	$card-bg: #ffffff;
	$text-main: #333333;
	$text-sub: #999999;
	$border-color: #eeeeee;

	.page-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: $bg-color;
	}

	/* --- Tab 样式优化 --- */
	.tabs-wrapper {
		background-color: $card-bg;
		padding: 10rpx 0;
		position: sticky;
		top: 0;
		z-index: 99;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.03);
	}

	/* 去除 uni-segmented-control 的默认边框，使用下划线风格 */
	::v-deep .custom-tabs {
		width: 60%;
		margin: 0 auto;

		.segmented-control__item--text {
			font-size: 30rpx;
			font-weight: 500;
			color: $text-sub;
		}

		.segmented-control__item--button--active {
			background: none;

			.segmented-control__text {
				color: $theme-color !important;
				font-weight: bold;
				font-size: 32rpx;
			}
		}
	}

	.tab-line {
		width: 60rpx;
		height: 6rpx;
		background-color: $theme-color;
		border-radius: 6rpx;
		position: absolute;
		bottom: 0;
		transform: translateX(-50%);
		transition: left 0.3s ease;
	}


	.content-area {
		padding: 30rpx;
		flex: 1;
	}

	/* --- 通用卡片样式 --- */
	.form-card {
		background-color: $card-bg;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 700;
		color: $text-main;
		margin-bottom: 30rpx;
		position: relative;
		padding-left: 20rpx;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 8rpx;
			height: 32rpx;
			background: linear-gradient(to bottom, $theme-color, #ffb347);
			border-radius: 4rpx;
		}
	}

	.card-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;

		.card-title {
			margin-bottom: 0;
		}
	}

	.divider {
		height: 1rpx;
		background-color: #f9f9f9;
		margin: 0 20rpx;
	}

	/* --- 头像区域 --- */
	.avatar-card {
		display: flex;
		justify-content: center;
		padding: 40rpx 30rpx;
		background: linear-gradient(to bottom, #fff, #fff);
	}

	.avatar-form-item {
		margin-bottom: 0;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.avatar-uploader-center {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.avatar-box {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		margin-bottom: 20rpx;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 8rpx 20rpx rgba(255, 135, 0, 0.2);
	}

	.camera-icon {
		position: absolute;
		bottom: 0;
		right: 0;
		background-color: $theme-color;
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4rpx solid #fff;
	}

	.upload-text {
		font-size: 26rpx;
		color: $text-sub;
	}

	/* --- 表单项优化 --- */
	::v-deep .uni-forms-item {
		border-bottom: 1rpx solid #f8f8f8;
		padding-bottom: 10rpx;
		margin-bottom: 24rpx;

		/* 去除最后一个的边框 */
		&:last-child {
			border-bottom: none;
			margin-bottom: 0;
			padding-bottom: 0;
		}

		&__label {
			font-size: 28rpx;
			color: #666;
			height: auto;
			padding-top: 10rpx;
		}

		/* 顶部对齐模式 */
		&--top {
			.uni-forms-item__label {
				margin-bottom: 16rpx;
			}
		}
	}

	/* 优化输入框 */
	::v-deep .uni-easyinput__content {
		background-color: transparent !important;
		min-height: 60rpx;
	}

	::v-deep .uni-easyinput__content-input {
		font-size: 28rpx;
		color: $text-main;
		text-align: left;
		/* 右对齐输入看起来更整洁 */
	}

	/* 优化选择器 */
	::v-deep .uni-data-tree-input,
	::v-deep .uni-stat__select {
		background-color: transparent !important;
		padding-right: 0;

		.input-value {
			text-align: right;
			color: $text-main;
		}

		.uni-icons {
			color: #ccc !important;
		}
	}

	/* 文本域背景 */
	.textarea-bg {
		::v-deep .uni-easyinput__content {
			background-color: #f9f9f9 !important;
			border-radius: 12rpx;
			padding: 20rpx;
			text-align: left;
			/* 文本域左对齐 */
		}

		::v-deep .uni-easyinput__content-textarea {
			text-align: left;
			min-height: 160rpx;
		}
	}

	/* --- 动态列表样式 (职业、学校) --- */
	.add-text-btn {
		font-size: 26rpx;
		color: $theme-color;
		display: flex;
		align-items: center;
		background-color: rgba(255, 135, 0, 0.1);
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
	}

	.dynamic-row-item {
		display: flex;
		align-items: center;
		background-color: #f9f9f9;
		padding: 0 20rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		height: 80rpx;

		::v-deep .uni-easyinput__content-input {
			text-align: left;
		}

		.delete-icon {
			padding: 20rpx;
			margin-right: -20rpx;
		}
	}

	/* --- 动态块样式 (公司/行业) --- */
	.dynamic-block-item {
		background-color: #fbfbfb;
		border: 1rpx solid #f0f0f0;
		border-radius: 16rpx;
		padding: 20rpx 30rpx;
		margin-bottom: 30rpx;
		position: relative;

		.block-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;

			.block-index {
				font-size: 24rpx;
				color: #fff;
				background-color: #ccc;
				padding: 2rpx 12rpx;
				border-radius: 8rpx;
			}

			.delete-text {
				font-size: 24rpx;
				color: #ff4d4f;
			}
		}

		/* 块内的输入框强制左对齐，且去除底部边框 */
		::v-deep .uni-forms-item {
			border-bottom: none;
			margin-bottom: 0;

			&__label {
				font-size: 26rpx;
			}
		}

		::v-deep .input-value,
		::v-deep .uni-easyinput__content-input {
			text-align: left;
			font-size: 28rpx;
		}
	}

	/* --- 新版居中大二维码样式 --- */
	.qr-uploader-centered {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		background-color: #fcfcfc;
		border-radius: 16rpx;
		border: 1rpx dashed #eee;
	}

	.qr-box {
		width: 300rpx;
		/* 增大尺寸 */
		height: 300rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		margin-bottom: 20rpx;
		border: 1rpx solid #f0f0f0;
	}

	.qr-img-large {
		width: 100%;
		height: 100%;
	}

	.qr-placeholder-large {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.placeholder-text {
		font-size: 24rpx;
		color: #ccc;
		margin-top: 10rpx;
	}

	.upload-action {
		display: flex;
		align-items: center;
		background-color: rgba(255, 135, 0, 0.08);
		/* 淡橙色背景 */
		padding: 8rpx 24rpx;
		border-radius: 30rpx;
	}

	.action-text {
		font-size: 26rpx;
		color: #FF8700;
		/* 主题色 */
		font-weight: 500;
	}

	/* --- 底部按钮 --- */
	.save-btn {
		background: linear-gradient(135deg, #FF9A44, $theme-color);
		color: white;
		border-radius: 50rpx;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		font-weight: bold;
		box-shadow: 0 10rpx 20rpx rgba(255, 135, 0, 0.3);
		margin-top: 40rpx;

		&:active {
			transform: scale(0.98);
		}

		&::after {
			border: none;
		}
	}

	.bottom-spacer {
		height: 60rpx;
	}


	/* --- 数字标签页样式 --- */
	.info-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 40rpx;
		text-align: center;
	}

	.info-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		gap: 16rpx;
	}

	.info-title {
		font-size: 36rpx;
		font-weight: bold;
		color: $text-main;
	}

	.info-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 40rpx;
		display: block;
		text-align: left;
	}

	.benefit-list {
		width: 100%;
		margin-bottom: 50rpx;
	}

	.benefit-item {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
		background-color: #fff9f0;
		padding: 20rpx 30rpx;
		border-radius: 16rpx;

		.check-circle {
			width: 36rpx;
			height: 36rpx;
			border-radius: 50%;
			background-color: $theme-color;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 20rpx;
		}

		text {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
		}
	}

	.label-btn {
		width: 100%;
		background: #333;
		/* 黑色背景，突出高级感 */
		color: #fff;
		border-radius: 50rpx;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&::after {
			border: none;
		}
	}
</style>