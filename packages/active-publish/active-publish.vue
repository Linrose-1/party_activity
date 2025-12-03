<template>
	<view class="page">
		<!-- 实名认证引导提示 -->
		<view v-if="!isUserVerified" class="auth-reminder" @click="goToAuthPage">
			<uni-icons type="info-filled" size="18" color="#e6a23c"></uni-icons>
			<text class="reminder-text">为保障活动用户安全，请先进行实名认证，点击前往</text>
			<text class="reminder-arrow">›</text>
		</view>

		<!-- 表单内容 -->
		<view class="form-section">
			<view class="section-title">基本信息</view>

			<uni-forms :label-width="80">
				<!-- activityTitle -->
				<uni-forms-item label="聚会主题" required>
					<uni-easyinput v-model="form.activityTitle" placeholder="请输入聚会主题" />
				</uni-forms-item>

				<!-- tags (原 activityType) -->
				<uni-forms-item label="聚会类型" required>
					<uni-data-select v-model="form.tag" :localdata="tagOptions" placeholder="请选择聚会类型"></uni-data-select>
				</uni-forms-item>

				<!-- coverImageUrl -->
				<uni-forms-item label="聚会封面">
					<view class="cover-upload" @click="uploadCover">
						<image v-if="form.coverImageUrl" :src="form.coverImageUrl" mode="aspectFill"></image>
						<text v-else>点击上传封面图片</text>
					</view>
				</uni-forms-item>
				<view class="tips">
					请使用5:4或4:3画幅比例上传图片，可使用相册自带的画幅剪切工具调整图片尺寸
				</view>

				<!-- 【修改】聚会时间选择器 -->
				<uni-forms-item label="聚会时间" required>
					<!-- 用一个 view 包裹并监听点击事件来打开 picker -->
					<view @click="isPickerOpen = true">
						<uni-datetime-picker type="datetimerange" v-model="timeRange" rangeSeparator="至"
							@change="isPickerOpen = false" @maskClick="isPickerOpen = false" />
					</view>
				</uni-forms-item>


				<!-- 【修改】报名时间选择器 -->
				<uni-forms-item label="报名时间" required>
					<!-- 同样用 view 包裹 -->
					<view @click="isPickerOpen = true">
						<uni-datetime-picker type="datetimerange" v-model="enrollTimeRange" rangeSeparator="至"
							@change="isPickerOpen = false" @maskClick="isPickerOpen = false" />
					</view>
				</uni-forms-item>

				<!-- locationAddress, longitude, latitude -->
				<uni-forms-item label="聚会地点" required>
					<view class="uni-list-cell-db">
						<view @click="openMapToChooseLocation" class="uni-input">
							<text v-if="form.locationAddress">{{ form.locationAddress }}</text>
							<text v-else class="placeholder">点击选择位置</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-forms-item>

				<uni-forms-item label="合作聚店" :label-width="80">
					<view class="uni-list-cell-db">
						<view @click="goToSelectShop" class="uni-input">
							<text v-if="associatedStoreName">{{ associatedStoreName }}</text>
							<text v-else class="placeholder">点击选择合作店铺</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-forms-item>

				<!-- totalSlots -->
				<uni-forms-item label="人数上限">
					<uni-easyinput type="number" v-model="form.totalSlots" placeholder="超过人数上限,不能报名" />
				</uni-forms-item>

				<uni-forms-item label="起聚人数">
					<uni-easyinput type="number" v-model="form.limitSlots" placeholder="不达起聚人数,聚会取消" />
				</uni-forms-item>

				<!-- activityFunds -->
				<uni-forms-item label="报名类型" required>
					<uni-data-checkbox v-model="form.activityFunds" :localdata="enrollmentOptions"
						mode="button"></uni-data-checkbox>
				</uni-forms-item>

				<!-- registrationFee (当 activityFunds 为 1 'AA') -->
				<uni-forms-item label="单人费用" v-if="form.activityFunds === 1" required>
					<uni-easyinput type="digit" v-model="form.registrationFee" placeholder="请输入聚会费用(元)" />
				</uni-forms-item>

				<!-- companyName & companyLogo (当 activityFunds 为 2 '赞助') -->
				<template v-if="form.activityFunds === 2">
					<uni-forms-item label="公司名称" required>
						<uni-easyinput v-model="form.companyName" placeholder="请输入赞助公司名称" />
					</uni-forms-item>
					<uni-forms-item label="公司Logo" required>
						<view class="cover-upload" @click="uploadSponsorLogo">
							<image v-if="form.companyLogo" :src="form.companyLogo" mode="aspectFit"></image>
							<text v-else>点击上传公司Logo图片</text>
						</view>
					</uni-forms-item>
				</template>

			</uni-forms>
		</view>

		<view class="form-section">
			<view class="section-title">聚会详情</view>
			<!-- activityDescription -->
			<uni-forms-item label="聚会介绍" required :label-width="80">
				<uni-easyinput type="textarea" autoHeight v-model="form.activityDescription" placeholder="请输入聚会详细介绍" />
			</uni-forms-item>

			<!-- activitySessions -->
			<view v-for="(item, index) in form.activitySessions" :key="index" class="activity-item">
				<view class="input-group">
					<uni-easyinput v-model="item.sessionTitle" placeholder="环节标题" />
					<uni-easyinput v-model="item.sessionDescription" placeholder="环节描述" />
					<uni-icons type="close" @click="removeAgenda(index)" />
				</view>
			</view>

			<view class="add-btn" @click="addAgenda">
				<uni-icons type="plusempty" color="red" /><text>添加聚会环节</text>
			</view>
		</view>

		<view class="form-section">
			<view class="section-title">组织者信息</view>

			<uni-forms :label-width="80">
				<!-- organizerUnitName -->
				<uni-forms-item label="组织者" required>
					<uni-easyinput v-model="form.organizerUnitName" placeholder="请输入组织者名称" />
				</uni-forms-item>

				<!-- organizerContactPhone -->
				<uni-forms-item label="联系电话" required>
					<uni-easyinput type="number" v-model="form.organizerContactPhone" placeholder="请输入联系电话" />
				</uni-forms-item>

				<!-- organizerPaymentQrCodeUrl -->
				<uni-forms-item label="收款码" v-if="form.activityFunds === 1" :required="true">
					<view class="cover-upload" @click="uploadCode">
						<image v-if="form.organizerPaymentQrCodeUrl" :src="form.organizerPaymentQrCodeUrl"
							mode="aspectFit"></image>
						<text v-else>点击上传收款码图片</text>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="form-bottom">
			到底啦，请发起聚会吧！
		</view>

		<!-- <view class="form-section">
			<view class="section-title">商圈信息</view>
			<uni-forms-item label="合作聚店" required :label-width="80">
				<view class="uni-list-cell-db">
					<view @click="goToSelectShop" class="uni-input">
						<text v-if="associatedStoreName">{{ associatedStoreName }}</text>
						<text v-else class="placeholder">点击选择合作店铺</text>
						<text class="arrow">></text>
					</view>
				</view>
			</uni-forms-item>
		</view> -->

		<!-- 底部操作栏 -->
		<view class="action-bar" :class="{ 'z-index-low': isPickerOpen }">
			<!-- 编辑模式下通常不需要存草稿，可以隐藏或保留 -->
			<view v-if="mode === 'create'" class="action-btn save-btn" @click="saveDraft">保存草稿</view>

			<view class="action-btn publish-btn" :class="{ 'disabled': isPublishing }" @click="publish">
				{{ isPublishing ? '处理中...' : (mode === 'edit' ? '保存修改' : '发起聚会') }}
			</view>
		</view>
		<!-- <view class="action-bar" :class="{ 'z-index-low': isPickerOpen }">
			<view class="action-btn save-btn" @click="saveDraft">保存草稿</view>
			<view class="action-btn publish-btn" :class="{ 'disabled': isPublishing }" @click="publish">
				{{ isPublishing ? '发布中...' : '发起聚会' }}
			</view>
		</view> -->
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		onLoad,
		onUnload,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';
	import {
		getInviteCode
	} from '../../utils/user.js';

	const isUserVerified = ref(true);

	onMounted(() => {
		checkUserVerificationStatus();
		getActiveType();
	});

	// 检查用户实名认证状态的函数
	const checkUserVerificationStatus = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (!error && data) {
			// 如果 idCard 字段为空或 null，则视为未实名
			isUserVerified.value = !!data.idCard;
			console.log('用户实名状态:', isUserVerified.value);
		} else {
			// 获取用户信息失败，也按未认证处理，并给出提示
			isUserVerified.value = false;
			console.log('获取用户信息失败，无法确认实名状态。');
		}
	};

	// 跳转到实名认证页面的函数
	const goToAuthPage = () => {
		uni.navigateTo({
			url: '/pages/my-auth/my-auth'
		});
	};

	// 防止重复提交
	const isPublishing = ref(false);

	// 定义一个用于本地存储草稿的唯一键
	const DRAFT_STORAGE_KEY = 'activity_draft';

	const isPickerOpen = ref(false);

	// 用于UI组件绑定的时间范围数组
	const timeRange = ref([]);
	const enrollTimeRange = ref([]);

	// 用于显示合作店铺名称，不提交给后端
	const associatedStoreName = ref('');

	const mode = ref('create'); // 默认为创建模式 'create' | 'edit'
	const editActivityId = ref(null); // 编辑时的活动ID

	// 表单数据模型，字段名与后端API完全对应
	const form = ref({
		activityTitle: '',
		activityDescription: '',
		totalSlots: null,
		limitSlots: null,
		activityFunds: 1, // 1: AA, 2: 赞助
		registrationFee: null,
		companyName: '',
		companyLogo: '',
		locationAddress: '', // 由地图选择填充
		latitude: null, // 由地图选择填充
		longitude: null, // 由地图选择填充
		coverImageUrl: '',
		organizerUnitName: '',
		organizerContactPhone: '',
		organizerPaymentQrCodeUrl: '',
		associatedStoreId: null, // 由店铺选择页面填充
		tag: '', // 这是UI选择的单值，提交时会放入`tags`数组
		activitySessions: [{
			sessionTitle: '环节标题',
			sessionDescription: '环节描述'
		}],
	});

	// 聚会类型/标签选项
	const tagOptions = ref([]); // 初始化为空数组

	const getActiveType = async () => {
		// 调用封装的请求方法
		const result = await request('/app-api/system/dict-data/type', {
			method: 'GET', // 请求方式
			data: {
				type: "member_activity_category "
			}
		});
		// 如果请求成功，打印返回的数据
		console.log('getActiveType result:', result);
		tagOptions.value = result.data.map(item => ({
			value: item.value, // 使用后端返回的value
			text: item.label // 使用后端返回的label
		}));
		console.log('tagOptions updated:', tagOptions.value);
		// 如果请求失败，打印错误信息
		if (result.error) {
			console.log('请求失败:', result.error);
		}
	};

	// 报名类型选项，值与后端定义一致
	const enrollmentOptions = ref([{
			text: 'AA',
			value: 1
		},
		{
			text: '赞助',
			value: 2
		}
	]);

	// 地图选择位置
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				form.value.locationAddress = res.address || res.name;
				form.value.latitude = res.latitude;
				form.value.longitude = res.longitude;
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

	// 上传函数，更新对应字段
	const handleImageUpload = (field, directory) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const file = res.tempFiles[0];
				const maxSize = 5 * 1024 * 1024; // 5MB
				if (file.size > maxSize) {
					return uni.showToast({
						title: '文件大小不能超过5MB',
						icon: 'none'
					});
				}

				uni.showLoading({
					title: '上传中...',
					mask: true
				});

				// 【关键】直接调用导入的 uploadFile 工具函数
				const result = await uploadFile(file, {
					directory: directory
				});

				uni.hideLoading();

				if (result.data) {
					// 动态地更新 form 对象中指定的字段为返回的 URL
					form.value[field] = result.data;
					uni.showToast({
						title: '上传成功',
						icon: 'none'
					});
				} else {
					console.error("上传失败:", result.error);
					uni.showToast({
						title: result.error || '上传失败',
						icon: 'none'
					});
				}
			}
		});
	};

	function uploadCover() {
		handleImageUpload('coverImageUrl', 'activity-cover');
	}

	function uploadSponsorLogo() {
		handleImageUpload('companyLogo', 'sponsor-logo');
	}

	function uploadCode() {
		handleImageUpload('organizerPaymentQrCodeUrl', 'payment-qrcode');
	}

	// 动态增删聚会环节
	function addAgenda() {
		form.value.activitySessions.push({
			sessionTitle: '',
			sessionDescription: ''
		});
	}

	function removeAgenda(index) {
		form.value.activitySessions.splice(index, 1);
	}

	// 跳转到店铺选择页面
	function goToSelectShop() {
		uni.navigateTo({
			url: '/pages/shop-list/shop-list'
		});
	}

	onLoad(async (options) => {
		// 1. 检查是否有模式参数
		if (options && options.mode === 'edit' && options.id) {
			mode.value = 'edit';
			editActivityId.value = options.id;
			uni.setNavigationBarTitle({
				title: '编辑聚会'
			});

			// 加载详情数据进行回显
			await loadActivityDetailForEdit(options.id);
		} else {
			mode.value = 'create';
			uni.setNavigationBarTitle({
				title: '发起聚会'
			});
			// 只有在创建模式下才尝试加载草稿 (原有逻辑放这里)
			loadDraft();
		}

		// 1. 检查 onLoad 的 options 中是否存在从聚店卡片传来的 storeId 和 storeName
		if (options && options.storeId && options.storeName) {
			console.log('从聚店页跳转而来，自动填充聚店信息...');

			// 2. 将获取到的值直接填充到表单数据中
			form.value.associatedStoreId = options.storeId;
			// 使用 decodeURIComponent 对店名进行解码，还原为原始文本
			associatedStoreName.value = decodeURIComponent(options.storeName);

			uni.showToast({
				title: `已选择聚店: ${associatedStoreName.value}`,
				icon: 'none'
			});
		}
		// 2. 尝试从本地存储加载草稿数据
		try {
			const draftDataString = uni.getStorageSync(DRAFT_STORAGE_KEY);
			if (draftDataString) {
				const parsedDraft = JSON.parse(draftDataString);

				// 2. 将草稿数据赋值给页面的 ref 变量
				form.value = parsedDraft.form;
				timeRange.value = parsedDraft.timeRange;
				enrollTimeRange.value = parsedDraft.enrollTimeRange;
				associatedStoreName.value = parsedDraft.associatedStoreName;

				uni.showToast({
					title: '已成功加载草稿',
					icon: 'none'
				});
				console.log('草稿已加载:', parsedDraft);
			} else {
				const now = new Date();
				const year = now.getFullYear();
				const month = (now.getMonth() + 1).toString().padStart(2, '0');
				const day = now.getDate().toString().padStart(2, '0');
				const todayStr = `${year}-${month}-${day}`;

				// 默认报名时间为当天 09:00 至 18:00
				enrollTimeRange.value = [`${todayStr} 09:00:00`, `${todayStr} 18:00:00`];
				// 默认聚会时间为当天 19:00 至 21:00
				timeRange.value = [`${todayStr} 19:00:00`, `${todayStr} 21:00:00`];
			}
		} catch (error) {
			console.error("加载草稿失败:", error);
			uni.removeStorageSync(DRAFT_STORAGE_KEY); // 如果解析失败，清除损坏的草稿
		}

		// 3. 监听店铺选择结果 (保持不变)
		uni.$on('shopSelected', (shop) => {
			console.log('接收到选择的店铺信息:', shop);
			form.value.associatedStoreId = shop.id;
			associatedStoreName.value = shop.storeName;
		});

		uni.showShareMenu({
			withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	onUnload(() => {
		uni.$off('shopSelected');
	});

	// 【加载草稿的函数
	const loadDraft = () => {
		try {
			const draftDataString = uni.getStorageSync(DRAFT_STORAGE_KEY);
			if (draftDataString) {
				const parsedDraft = JSON.parse(draftDataString);

				// 将草稿数据赋值给页面的 ref 变量
				form.value = parsedDraft.form;
				timeRange.value = parsedDraft.timeRange;
				enrollTimeRange.value = parsedDraft.enrollTimeRange;
				associatedStoreName.value = parsedDraft.associatedStoreName;

				uni.showToast({
					title: '已恢复上次草稿',
					icon: 'none'
				});
				console.log('草稿已加载:', parsedDraft);
			} else {
				// 如果没有草稿，初始化默认时间
				const now = new Date();
				const year = now.getFullYear();
				const month = (now.getMonth() + 1).toString().padStart(2, '0');
				const day = now.getDate().toString().padStart(2, '0');
				const todayStr = `${year}-${month}-${day}`;

				enrollTimeRange.value = [`${todayStr} 09:00:00`, `${todayStr} 18:00:00`];
				timeRange.value = [`${todayStr} 19:00:00`, `${todayStr} 21:00:00`];
			}
		} catch (error) {
			console.error("加载草稿失败:", error);
			uni.removeStorageSync(DRAFT_STORAGE_KEY);
		}
	};

	// --- 【新增】加载详情并回显数据 ---
	const loadActivityDetailForEdit = async (id) => {
		uni.showLoading({
			title: '加载中...'
		});
		const [detailRes, dictRes] = await Promise.all([
			request('/app-api/member/activity/get', {
				method: 'GET',
				data: {
					id
				}
			}),
			// 如果 tagOptions 已经有值，就不必请求了，直接返回 null 占位
			tagOptions.value.length === 0 ?
			request('/app-api/system/dict-data/type', {
				method: 'GET',
				data: {
					type: "member_activity_category "
				}
			}) :
			Promise.resolve(null)
		]);

		uni.hideLoading();

		// --- 处理字典数据 (如果发起了请求) ---
		if (dictRes && !dictRes.error && dictRes.data) {
			tagOptions.value = dictRes.data.map(item => ({
				value: item.value,
				text: item.label
			}));
		}

		// --- 处理详情数据 ---
		if (detailRes.error || !detailRes.data) {
			uni.showToast({
				title: '加载活动详情失败',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
			return;
		}

		const data = detailRes.data;
		console.log('获取详情用于编辑:', data);


		// === 数据映射 (将详情数据映射回 form) ===

		// 1. 基础字段直接映射
		form.value.activityTitle = data.activityTitle;
		form.value.activityDescription = data.activityDescription;
		form.value.totalSlots = data.totalSlots;
		form.value.limitSlots = data.limitSlots;
		form.value.activityFunds = data.activityFunds;
		form.value.registrationFee = data.registrationFee;
		form.value.companyName = data.companyName;
		form.value.companyLogo = data.companyLogo;
		form.value.locationAddress = data.locationAddress;
		form.value.latitude = data.latitude;
		form.value.longitude = data.longitude;
		form.value.coverImageUrl = data.coverImageUrl;
		form.value.organizerUnitName = data.organizerUnitName;
		form.value.organizerContactPhone = data.organizerContactPhone;
		form.value.organizerPaymentQrCodeUrl = data.organizerPaymentQrCodeUrl;

		let matchedValue = '';

		// 策略A：通过 category (ID) 匹配
		if (data.category) {
			// 将后端返回的 category 转为字符串，以防类型不一致
			const targetVal = String(data.category);
			// 在选项中查找对应的 value
			const foundOption = tagOptions.value.find(opt => String(opt.value) === targetVal);
			if (foundOption) {
				matchedValue = foundOption.value;
			}
		}

		// 策略B：如果策略A失败，尝试通过 tags (中文名称) 匹配
		if (!matchedValue && data.tags && data.tags.length > 0) {
			const tagName = data.tags[0];
			const foundOption = tagOptions.value.find(opt => opt.text === tagName);
			if (foundOption) {
				matchedValue = foundOption.value;
			}
		}

		// 赋值
		form.value.tag = matchedValue;

		// 3. 特殊字段处理：时间范围
		// 需要将时间戳转回 'YYYY-MM-DD HH:mm:ss' 格式供 picker 显示
		if (data.startDatetime && data.endDatetime) {
			timeRange.value = [
				formatDateForPicker(data.startDatetime),
				formatDateForPicker(data.endDatetime)
			];
		}
		if (data.registrationStartDatetime && data.registrationEndDatetime) {
			enrollTimeRange.value = [
				formatDateForPicker(data.registrationStartDatetime),
				formatDateForPicker(data.registrationEndDatetime)
			];
		}

		// 4. 特殊字段处理：店铺
		if (data.memberStoreRespVO) {
			form.value.associatedStoreId = data.memberStoreRespVO.id;
			associatedStoreName.value = data.memberStoreRespVO.storeName;
		}

		// 5. 特殊字段处理：活动环节
		// 注意：编辑时环节带有 ID，保留 ID 可以让后端知道是更新旧环节
		if (data.memberActivitySessionList && data.memberActivitySessionList.length > 0) {
			form.value.activitySessions = data.memberActivitySessionList.map(item => ({
				id: item.id, // 关键：保留ID
				sessionTitle: item.sessionTitle,
				sessionDescription: item.sessionDescription
			}));
		}
	};

	// 辅助函数：时间戳转格式化字符串
	const formatDateForPicker = (timestamp) => {
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	function saveDraft() {
		// 1. 将所有需要保存的数据打包成一个对象
		const draftData = {
			form: form.value,
			timeRange: timeRange.value,
			enrollTimeRange: enrollTimeRange.value,
			associatedStoreName: associatedStoreName.value
		};

		try {
			// 2. 将对象转换为 JSON 字符串并存入本地存储
			uni.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
			uni.showToast({
				title: '聚会已保存为草稿',
				icon: 'none'
			});
			console.log('草稿已保存:', draftData);
		} catch (e) {
			uni.showToast({
				title: '草稿保存失败',
				icon: 'none'
			});
			console.error("保存草稿到本地存储失败:", e);
		}

		// 注意：保存草稿通常不应该调用创建接口，所以注释或移除了 createActive()
		// createActive() 
	}

	async function publish() {
		if (isPublishing.value) return; // 防重触

		//【节流】
		if (isPublishing.value) {
			uni.showToast({
				title: '正在发布中，请稍候...',
				icon: 'none'
			});
			return;
		}

		// --- 表单验证 (使用新字段) ---
		if (!form.value.activityTitle) {
			uni.showToast({
				title: '请输入聚会标题',
				icon: 'none'
			});
			return;
		}
		if (!form.value.tag) {
			uni.showToast({
				title: '请选择聚会类型',
				icon: 'none'
			});
			return;
		}
		// if (!form.value.coverImageUrl) {
		// 	uni.showToast({
		// 		title: '请上传聚会封面',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }
		if (!timeRange.value || timeRange.value.length !== 2) {
			uni.showToast({
				title: '请选择聚会时间',
				icon: 'none'
			});
			return;
		}
		if (!enrollTimeRange.value || enrollTimeRange.value.length !== 2) {
			uni.showToast({
				title: '请选择报名时间',
				icon: 'none'
			});
			return;
		}
		if (!form.value.locationAddress) {
			uni.showToast({
				title: '请选择聚会地点',
				icon: 'none'
			});
			return;
		}
		// if (!form.value.totalSlots || form.value.totalSlots <= 0) {
		// 	uni.showToast({
		// 		title: '请输入正确的总名额',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }
		// if (!form.value.limitSlots || form.value.limitSlots <= 0) {
		// 	uni.showToast({
		// 		title: '请输入正确的最低起聚名额',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }
		// 【新增】逻辑验证：最低名额不能大于总名额
		// if (parseInt(form.value.limitSlots) > parseInt(form.value.totalSlots)) {
		// 	uni.showToast({
		// 		title: '最低起聚名额不能大于总名额',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }
		if (form.value.activityFunds === 1) { // AA
			if (form.value.registrationFee === null || form.value.registrationFee < 0) {
				uni.showToast({
					title: '请输入正确的预报名费用',
					icon: 'none'
				});
				return;
			}
		} else if (form.value.activityFunds === 2) { // 赞助
			if (!form.value.companyName) {
				uni.showToast({
					title: '请输入公司名称',
					icon: 'none'
				});
				return;
			}
			if (!form.value.companyLogo) {
				uni.showToast({
					title: '请上传公司Logo',
					icon: 'none'
				});
				return;
			}
		}
		if (!form.value.activityDescription) {
			uni.showToast({
				title: '请输入聚会介绍',
				icon: 'none'
			});
			return;
		}
		if (!form.value.organizerUnitName) {
			uni.showToast({
				title: '请输入组织单位',
				icon: 'none'
			});
			return;
		}
		if (!form.value.organizerContactPhone) {
			uni.showToast({
				title: '请输入联系电话',
				icon: 'none'
			});
			return;
		}
		if (form.value.activityFunds === 1 && !form.value.organizerPaymentQrCodeUrl) {
			uni.showToast({
				title: 'AA制聚会请上传收款码',
				icon: 'none'
			});
			return;
		}

		// if (!form.value.associatedStoreId) {
		// 	uni.showToast({
		// 		title: '请选择合作店铺',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

		uni.showModal({
			title: '确认发布',
			content: '请确认您填写的内容无误。',
			success: async (res) => {
				if (res.confirm) {
					// 用户确认后才执行真正的发布逻辑
					await processPublishing();
				}
			}
		});

	}

	async function processPublishing() {

		isPublishing.value = true;
		uni.showLoading({
			title: '正在处理...',
			mask: true
		});

		try {
			// --- 构建最终提交给后端的 payload ---
			const payload = JSON.parse(JSON.stringify(form.value));
			payload.startDatetime = new Date(timeRange.value[0]).getTime();
			payload.endDatetime = new Date(timeRange.value[1]).getTime();
			payload.registrationStartDatetime = new Date(enrollTimeRange.value[0]).getTime();
			payload.registrationEndDatetime = new Date(enrollTimeRange.value[1]).getTime();
			const selectedTagOption = tagOptions.value.find(option => option.value === payload.tag);
			if (selectedTagOption) {
				payload.category = selectedTagOption.value;
				payload.tags = [selectedTagOption.text];
			} else {
				payload.category = payload.tag;
				payload.tags = [payload.tag];
			}
			delete payload.tag;
			payload.activitySessions = payload.activitySessions.map((session, index) => ({
				...session,
				sessionOrder: index + 1
			}));
			if (payload.activityFunds === 1) {
				delete payload.companyName;
				delete payload.companyLogo;
			} else {
				delete payload.registrationFee;
			}

			let result;
			if (mode.value === 'edit') {
				// 编辑模式：添加 ID，调用编辑接口
				payload.id = editActivityId.value;
				// 如果有 organizerId 也可以加上，不过后端通常从 token 获取

				console.log('编辑提交 Payload:', payload);
				result = await editActive(payload);
			} else {
				// 创建模式
				console.log('创建提交 Payload:', payload);
				result = await createActive(payload);
			}

			// console.log('发布聚会 - 最终Payload:', payload);
			// const {
			// 	success,
			// 	error
			// } = await createActive(payload);

			if (result.success) {
				// uni.removeStorageSync(DRAFT_STORAGE_KEY);
				// console.log('聚会发布成功，草稿已清除。');
				// uni.showModal({
				// 	title: '发布成功',
				// 	content: '可在【我的】-【我的聚会】中查看您发布的聚会。',
				// 	showCancel: false,
				// 	confirmText: '知道了',
				// 	success: (modalRes) => {
				// 		if (modalRes.confirm) {
				// 			uni.switchTab({
				// 				url: '/pages/active/active'
				// 			});
				// 		}
				// 	}
				// });
				if (mode.value === 'create') uni.removeStorageSync(DRAFT_STORAGE_KEY);
				uni.showModal({
					title: mode.value === 'edit' ? '修改成功' : '发布成功',
					content: mode.value === 'edit' ? '聚会信息已更新。' : '可在【我的】-【我的聚会】中查看。',
					showCancel: false,
					confirmText: '知道了',
					success: (modalRes) => {
						if (modalRes.confirm) {
							// 返回上一页（通常是列表页），并通知刷新
							uni.navigateBack({
								delta: 1
							});
						}
					}
				});
			} else {
				const error = result.error;
				if (typeof error === 'object' && error !== null && error.code === 453) {
					// 453 错误码：未实名认证
					uni.hideLoading();
					saveDraft();
					uni.showModal({
						title: '认证提醒',
						content: error.msg || '发布聚会需要先完成实名认证，是否现在就去认证？您的聚会信息已为您保存为草稿。', // 使用 error.msg
						confirmText: '去认证',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/my-auth/my-auth'
								});
							}
						}
					});
					isPublishing.value = false;
					return;
				}

				// 其他错误 (error 是字符串)
				uni.showToast({
					title: typeof error === 'string' ? error : (error.msg || '发布失败'),
					icon: 'none',
					duration: 3000
				});
			}
			// 如果 success 为 false，createActive 内部已处理错误提示，
			// finally 块会重置 isPublishing 状态，允许用户重新提交。

		} catch (e) {
			// 捕获网络请求或代码执行中可能出现的预料之外的错误
			console.error("发布流程中发生未知错误:", e);
			uni.showToast({
				title: '操作失败，请检查网络',
				icon: 'none'
			});
		} finally {
			// 【修正点1 和 2】无论成功、失败还是异常，最后都必须执行这里的代码
			isPublishing.value = false;
			uni.hideLoading();
		}
	}

	const createActive = async (payload) => {
		console.log("payload", payload);
		const result = await request('/app-api/member/activity/create', {
			method: 'POST',
			data: payload
		});

		// 如果请求成功且后端没有返回业务错误
		if (result && !result.error) {
			console.log('createActive result:', result);
			// 【修改】这里不再显示 Toast，只返回结果
			return {
				success: true,
				error: null
			};
		}
		// 如果请求失败或后端返回了业务错误
		else {
			console.log('请求失败:', result.error);
			// 【修改】这里不再显示 Toast，只返回结果
			return {
				success: false,
				error: result.error
			};
		}
	};

	// --- 新增 editActive 接口调用 ---
	const editActive = async (payload) => {
		const result = await request('/app-api/member/activity/edit', {
			method: 'POST',
			data: payload
		});

		if (result && !result.error) {
			return {
				success: true,
				error: null
			};
		} else {
			return {
				success: false,
				error: result.error
			};
		}
	};

	/**
	 * @description 监听用户点击“分享给好友”
	 */
	onShareAppMessage(() => {
		// 1. 获取当前用户的邀请码
		const inviteCode = getInviteCode();
		console.log(`[活动发布页] 分享给好友，获取到邀请码: ${inviteCode}`);

		// 2. 构建分享路径，并附带邀请码参数
		let sharePath = '/packages/active-publish/active-publish'; // 指向当前页面
		if (inviteCode) {
			sharePath += `?inviteCode=${inviteCode}`;
		}

		// 3. 定义分享内容
		const shareContent = {
			title: '快来组织一场有趣的聚会吧，链接你的商友！',
			path: sharePath,
			// 建议使用一个固定的、吸引人的分享图片
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};

		console.log('[活动发布页] 分享给好友的内容:', JSON.stringify(shareContent));
		return shareContent;
	});

	/**
	 * @description 监听用户点击“分享到朋友圈”
	 */
	onShareTimeline(() => {
		// 1. 获取当前用户的邀请码
		const inviteCode = getInviteCode();
		console.log(`[活动发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);

		// 2. 构建 query 字符串
		let queryString = '';
		if (inviteCode) {
			queryString = `inviteCode=${inviteCode}`;
		}

		// 3. 定义分享内容
		const shareContent = {
			title: '快来组织一场有趣的聚会吧，链接你的商友！',
			query: queryString,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};

		console.log('[活动发布页] 分享到朋友圈的内容:', JSON.stringify(shareContent));
		return shareContent;
	});
</script>

<style lang="scss" scoped>
	/* 样式部分无需修改，此处省略，请沿用您之前的样式 */
	.page {
		background-color: #f8f8f8;
		padding-bottom: 160rpx;
	}

	.top-nav {
		background-color: #FF6F00;
		color: #fff;
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		position: sticky;
		top: 0;
		z-index: 100;
		font-size: 32rpx;
	}

	.page-title {
		flex: 1;
		text-align: center;
		font-weight: bold;
	}

	.form-section {
		background: #fff;
		margin: 20rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #FF6F00;
		margin-bottom: 20rpx;
		border-left: 10rpx solid #FF6F00;
		padding-left: 20rpx;
	}

	.uni-list-cell-db {
		margin-left: 10rpx;
		padding: 20rpx;
		margin: 10rpx 0;
		border: #e2e2e2 solid 1rpx;
		min-width: 400rpx;
		border-radius: 10rpx;

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


	.cover-upload {
		border: 2rpx dashed #ccc;
		border-radius: 16rpx;
		background-color: #fafafa;
		color: #999;

		width: 100%;
		height: 200rpx;

		display: flex;
		align-items: center;
		/* 垂直居中 */
		justify-content: center;
		/* 水平居中 */

		overflow: hidden;

		cursor: pointer;

		text {
			font-size: 28rpx;
		}

		image {
			width: 100%;
			height: 100%;
		}
	}

	.tips {
		font-size: 24rpx;
		color: #888;
		margin-top: 10rpx;
		line-height: 36rpx;
		margin-bottom: 20rpx;
	}


	.activity-item {
		margin: 20rpx 0;
		background-color: #f9f9f9;
		border-radius: 16rpx;
		padding: 20rpx;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		position: relative; // 为内部的绝对定位提供上下文

		.uni-icons {
			position: absolute; // 让图标浮动在输入框组的右侧
			right: 20rpx; // 调整位置
			top: 50%; // 垂直居中
			transform: translateY(-50%);
			color: #999;
			font-size: 40rpx !important; // 根据需要调整图标大小
		}

		// 调整每个 easyinput 的样式，让它们不会被图标覆盖
		uni-easyinput {

			// 增加右侧内边距，为图标留出空间
			::v-deep .uni-easyinput__content {
				padding-right: 60rpx; // 留出足够空间，避免与图标重叠
			}
		}
	}

	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FF6F00;
		font-weight: bold;
		margin-top: 20rpx;
		gap: 10rpx;
	}

	.form-bottom {
		text-align: center;
		font-size: 24rpx;
		color: #999;
	}

	.action-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		display: flex;
		background-color: #fff;
		padding: 20rpx 0;
		// box-shadow: 0 -5rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
	}

	.action-btn {
		flex: 1;
		margin: 10rpx;
		padding: 24rpx;
		text-align: center;
		border-radius: 16rpx;
		font-weight: bold;
		font-size: 28rpx;
	}

	.save-btn {
		background-color: #f0f0f0;
		color: #666;
	}

	.publish-btn {
		background-color: #FF6F00;
		color: #fff;
	}

	.search-bar {
		margin-bottom: 20rpx;
	}

	.shop-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		max-height: 300rpx;
		/* 设置最大高度并允许滚动 */
		overflow-y: auto;
		border: 1rpx solid #eee;
		border-radius: 10rpx;
		padding: 10rpx;
		margin-bottom: 20rpx;
	}

	.shop-item {
		padding: 20rpx;
		background-color: #f0f0f0;
		border-radius: 16rpx;
		font-size: 28rpx;
		cursor: pointer;

		&:active {
			background-color: #e0e0e0; // 点击时的反馈
		}
	}

	.shop-item.selected {
		background-color: #FF6F00;
		color: #fff;
		font-weight: bold;
	}

	.selected-shop {
		margin-top: 20rpx;
		color: #666;
		font-size: 26rpx;
	}

	/* 修复 uni-data-select 样式可能不一致的问题 */
	::v-deep .uni-select {
		// border: none !important;
		font-size: 28rpx !important;
	}

	::v-deep .uni-select__input-text {
		color: #333;
	}

	::v-deep .uni-select__input-placeholder {
		color: #939393;
	}

	/* 这个类用于在 picker 打开时降低操作栏的层级 */
	.action-bar.z-index-low {
		z-index: 1;
		/* 或者 z-index: auto; */
	}

	.action-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
		/* 让按钮在视觉和行为上都真正被禁用 */
	}

	.auth-reminder {
		display: flex;
		align-items: center;
		padding: 20rpx;
		margin: 20rpx 20rpx 0;
		/* 顶部和左右边距 */
		background-color: #fdf6ec;
		border: 1rpx solid #faecd8;
		border-radius: 12rpx;
		color: #e6a23c;
		font-size: 26rpx;
	}

	.reminder-text {
		flex: 1;
		margin: 0 16rpx;
	}

	.reminder-arrow {
		font-size: 32rpx;
		color: #c0c4cc;
	}
</style>