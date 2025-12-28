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

			<uni-forms :label-width="80" label-position="top">
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

				<uni-forms-item label="聚会图集">
					<view class="image-drag-container"
						:style="{ height: dragAreaHeight > 0 ? dragAreaHeight + 'px' : '0px' }">
						<movable-area class="drag-area" :style="{ height: dragAreaHeight + 'px' }">
							<movable-view v-for="(item, index) in dragDisplayList" :key="item.id" :x="item.x"
								:y="item.y" direction="all" :z-index="item.zIndex"
								:disabled="!isDragging && item.zIndex === 1" class="drag-item"
								:style="{ width: dragItemWidth + 'px', height: dragItemHeight + 'px' }"
								@change="onMovableChange($event, index)" @touchstart="onMovableStart(index)"
								@touchend="onMovableEnd">
								<view class="item-inner">
									<view class="image-wrapper-drag">
										<!-- item.data 存的就是图片URL -->
										<image :src="item.data" mode="aspectFill" class="preview-image"
											@click.stop="previewActivityImage(item.realIndex)" />
										<!-- 删除按钮 -->
										<view class="delete-btn" @click.stop="deleteActivityImage(item.realIndex)">×
										</view>
									</view>
								</view>
							</movable-view>
						</movable-area>
					</view>
					<!-- 添加按钮 -->
					<view class="add-btn-wrapper" v-if="form.activityCoverImageUrls.length < 9"
						@click="handleActivityImagesUpload">
						<view class="add-placeholder">
							<uni-icons type="plusempty" size="30" color="#ccc"></uni-icons>
							<text>添加</text>
						</view>
					</view>
				</uni-forms-item>
				<view class="tips">聚会图集将在详情页顶部轮播展示，建议上传现场环境、往期精彩瞬间等。</view>

				<!-- 聚会时间选择器 -->
				<uni-forms-item label="聚会时间" required>
					<!-- 用一个 view 包裹并监听点击事件来打开 picker -->
					<view @click="isPickerOpen = true">
						<uni-datetime-picker type="datetimerange" v-model="timeRange" rangeSeparator="至"
							@change="isPickerOpen = false" @maskClick="isPickerOpen = false" />
					</view>
				</uni-forms-item>


				<!-- 报名时间选择器 -->
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


		<!-- 底部操作栏 -->
		<view class="action-bar" :class="{ 'z-index-low': isPickerOpen }">
			<!-- 编辑模式下通常不需要存草稿，可以隐藏或保留 -->
			<view v-if="mode === 'create'" class="action-btn save-btn" @click="saveDraft">保存草稿</view>

			<view class="action-btn publish-btn" :class="{ 'disabled': isPublishing }" @click="publish">
				{{ isPublishing ? '处理中...' : (mode === 'edit' ? '保存修改' : '发起聚会') }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
		watch,
		nextTick
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

	// --- 【1】统一的时间格式化工具 (放在最前面，防止找不到) ---
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(Number(timestamp));
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	// --- 【2】初始化默认时间 (仅用于创建模式) ---
	const initDefaultTimes = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const todayStr = `${year}-${month}-${day}`;

		// 默认时间设置
		enrollTimeRange.value = [`${todayStr} 09:00:00`, `${todayStr} 18:00:00`];
		timeRange.value = [`${todayStr} 19:00:00`, `${todayStr} 21:00:00`];
		console.log('已初始化默认时间:', todayStr);
	};

	// --- 【3】加载草稿 (仅用于创建模式) ---
	const loadDraft = () => {
		try {
			const draftDataString = uni.getStorageSync(DRAFT_STORAGE_KEY);
			if (draftDataString) {
				const parsedDraft = JSON.parse(draftDataString);
				if (!parsedDraft.form.activityCoverImageUrls) {
					parsedDraft.form.activityCoverImageUrls = [];
				}
				form.value = parsedDraft.form;
				timeRange.value = parsedDraft.timeRange;
				enrollTimeRange.value = parsedDraft.enrollTimeRange;
				associatedStoreName.value = parsedDraft.associatedStoreName;
				uni.showToast({
					title: '已恢复上次草稿',
					icon: 'none'
				});
				return true; // 找到了草稿
			}
		} catch (error) {
			console.error("加载草稿失败:", error);
			uni.removeStorageSync(DRAFT_STORAGE_KEY);
		}
		return false; // 没找到草稿
	};

	onMounted(() => {
		checkUserVerificationStatus();
		getActiveType();
		initDragLayout();
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
		activityCoverImageUrls: [],
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
			text: 'AA/付费',
			value: 1
		},
		{
			text: '赞助/免费',
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
		uni.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFiles[0].tempFilePath;

				// 【核心】调用微信原生图片裁剪接口
				// 注意：仅微信小程序支持，App/H5 需要降级处理
				// #ifdef MP-WEIXIN
				wx.cropImage({
					src: tempFilePath, // 图片路径
					cropScale: '5:4', // 裁剪比例
					success: (cropRes) => {
						console.log('裁剪成功:', cropRes.tempFilePath);
						// 使用裁剪后的图片进行上传
						uploadFileToCloud(cropRes.tempFilePath, 'coverImageUrl', 'activity-cover');
					},
					fail: (err) => {
						console.log('用户取消裁剪或不支持:', err);
						// 如果用户取消裁剪，是否允许直接上传原图？建议允许，或者提示
						// 这里选择直接上传原图作为降级
						uploadFileToCloud(tempFilePath, 'coverImageUrl', 'activity-cover');
					}
				});
				// #endif

				// #ifndef MP-WEIXIN
				// 非微信小程序环境，直接上传
				uploadFileToCloud(tempFilePath, 'coverImageUrl', 'activity-cover');
				// #endif
			}
		});
	}

	// 图集上传 (多图)
	const handleActivityImagesUpload = () => {
		uni.chooseImage({
			count: 9 - form.value.activityCoverImageUrls.length,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				uni.showLoading({
					title: '上传中...'
				});

				const uploadPromises = res.tempFiles.map(file => uploadFile({
					path: file.path
				}, {
					directory: 'activity-gallery'
				}));

				try {
					const results = await Promise.all(uploadPromises);
					uni.hideLoading();

					const successfulUrls = results.filter(r => r.data).map(r => r.data);
					if (successfulUrls.length > 0) {
						form.value.activityCoverImageUrls.push(...successfulUrls);
					}

					if (results.some(r => r.error)) {
						uni.showToast({
							title: '部分图片上传失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error("上传异常:", error);
					uni.showToast({
						title: '上传出错',
						icon: 'none'
					});
				}
			}
		});
	};

	// 删除图集图片
	const deleteActivityImage = (index) => {
		form.value.activityCoverImageUrls.splice(index, 1);
	};

	// 预览图集图片
	const previewActivityImage = (index) => {
		uni.previewImage({
			urls: form.value.activityCoverImageUrls,
			current: index
		});
	};


	// 抽离上传逻辑
	const uploadFileToCloud = async (filePath, field, directory) => {
		uni.showLoading({
			title: '上传中...',
			mask: true
		});

		// 构造一个符合 uploadFile 函数要求的 file 对象结构
		// 因为你的 uploadFile.js 可能期待的是一个 file 对象或者路径
		// 这里假设 uploadFile.js 接受 { path: ... }
		const result = await uploadFile({
			path: filePath
		}, {
			directory: directory
		});

		uni.hideLoading();

		if (result.data) {
			form.value[field] = result.data;
			uni.showToast({
				title: '上传成功',
				icon: 'none'
			});
		} else {
			uni.showToast({
				title: result.error || '上传失败',
				icon: 'none'
			});
		}
	};

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
		// 1. 判断是否为【编辑模式】
		if (options && options.mode === 'edit' && options.id) {
			console.log("进入编辑模式");
			mode.value = 'edit';
			editActivityId.value = options.id;
			uni.setNavigationBarTitle({
				title: '编辑聚会'
			});

			// 编辑模式下：只加载详情，**绝对不要**去加载草稿或设置默认时间
			await loadActivityDetailForEdit(options.id);
		}
		// 2. 否则为【创建模式】
		else {
			console.log("进入创建模式");
			mode.value = 'create';
			uni.setNavigationBarTitle({
				title: '发起聚会'
			});

			// 创建模式下：先看有没有草稿，没有草稿才设置默认时间
			const hasDraft = loadDraft();
			if (!hasDraft) {
				initDefaultTimes();
			}
		}

		// 3. 处理从店铺列表跳转过来的参数 (通用逻辑)
		if (options && options.storeId && options.storeName) {
			form.value.associatedStoreId = options.storeId;
			associatedStoreName.value = decodeURIComponent(options.storeName);
			uni.showToast({
				title: `已选择聚店: ${associatedStoreName.value}`,
				icon: 'none'
			});
		}

		// 4. 监听店铺选择事件
		uni.$on('shopSelected', (shop) => {
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

	// --- 加载详情并回显数据 ---
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
		// 回显封面
		form.value.coverImageUrl = data.coverImageUrl;
		// 回显图集 (如果后端返回了该字段)
		if (data.activityCoverImageUrls && data.activityCoverImageUrls.length > 0) {
			form.value.activityCoverImageUrls = data.activityCoverImageUrls;
		} else {
			form.value.activityCoverImageUrls = []; // 【关键修复】兜底为空数组
		}
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
		// 使用 formatTimestamp 工具函数将后端时间戳转为组件需要的字符串格式
		if (data.startDatetime && data.endDatetime) {
			timeRange.value = [
				formatTimestamp(data.startDatetime),
				formatTimestamp(data.endDatetime)
			];
		}

		if (data.registrationStartDatetime && data.registrationEndDatetime) {
			enrollTimeRange.value = [
				formatTimestamp(data.registrationStartDatetime),
				formatTimestamp(data.registrationEndDatetime)
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
	// const formatDateForPicker = (timestamp) => {
	// 	const date = new Date(timestamp);
	// 	const Y = date.getFullYear();
	// 	const M = (date.getMonth() + 1).toString().padStart(2, '0');
	// 	const D = date.getDate().toString().padStart(2, '0');
	// 	const h = date.getHours().toString().padStart(2, '0');
	// 	const m = date.getMinutes().toString().padStart(2, '0');
	// 	const s = date.getSeconds().toString().padStart(2, '0');
	// 	return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	// };

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
			payload.activityCoverImageUrls = form.value.activityCoverImageUrls;
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



	/* ==================== 拖拽排序逻辑 (新增) ==================== */
	const dragDisplayList = ref([]);
	const dragItemWidth = ref(0);
	const dragItemHeight = ref(0);
	const dragAreaHeight = ref(0);
	const isDragging = ref(false);
	const dragIndex = ref(-1);
	const dragColumns = 3;
	const dragItemHeightRpx = 210;

	// 1. 初始化尺寸
	const initDragLayout = () => {
		const sys = uni.getSystemInfoSync();
		// 假设左右 padding 各 20rpx + margin，估算减去 100rpx
		const containerWidth = sys.windowWidth - uni.upx2px(100);
		dragItemWidth.value = containerWidth / dragColumns;
		dragItemHeight.value = uni.upx2px(dragItemHeightRpx);
	};

	// 2. 监听数组变化，自动同步到拖拽列表
	watch(() => form.value.activityCoverImageUrls, (newVal) => {
		if (!isDragging.value) {
			initDragList(newVal || []);
		}
	}, {
		deep: true
	});

	// 3. 初始化列表
	const initDragList = (originList) => {
		if (!originList) {
			dragDisplayList.value = [];
			dragAreaHeight.value = 0;
			return;
		}
		if (dragItemWidth.value === 0) initDragLayout();

		dragDisplayList.value = originList.map((url, index) => {
			const {
				x,
				y
			} = getPos(index);
			return {
				id: `img_${index}_${Math.random()}`,
				data: url,
				x,
				y,
				zIndex: 1,
				realIndex: index
			};
		});
		updateDragHeight();
	};

	const getPos = (index) => {
		const row = Math.floor(index / dragColumns);
		const col = index % dragColumns;
		return {
			x: col * dragItemWidth.value,
			y: row * dragItemHeight.value
		};
	};

	const updateDragHeight = () => {
		const count = dragDisplayList.value.length;
		const rows = Math.ceil(count / dragColumns);
		dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
	};

	// --- 拖拽事件 ---
	const onMovableStart = (index) => {
		isDragging.value = true;
		dragIndex.value = index;
		dragDisplayList.value[index].zIndex = 99;
	};

	const onMovableChange = (e, index) => {
		if (!isDragging.value || index !== dragIndex.value) return;
		const x = e.detail.x;
		const y = e.detail.y;

		const centerX = x + dragItemWidth.value / 2;
		const centerY = y + dragItemHeight.value / 2;
		const col = Math.floor(centerX / dragItemWidth.value);
		const row = Math.floor(centerY / dragItemHeight.value);
		let targetIndex = row * dragColumns + col;

		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex >= dragDisplayList.value.length) targetIndex = dragDisplayList.value.length - 1;

		if (targetIndex !== dragIndex.value) {
			const mover = dragDisplayList.value[dragIndex.value];
			dragDisplayList.value.splice(dragIndex.value, 1);
			dragDisplayList.value.splice(targetIndex, 0, mover);

			dragDisplayList.value.forEach((item, idx) => {
				if (idx !== targetIndex) {
					const pos = getPos(idx);
					item.x = pos.x;
					item.y = pos.y;
				}
			});
			dragIndex.value = targetIndex;
		}
	};

	const onMovableEnd = () => {
		isDragging.value = false;
		if (dragIndex.value !== -1) {
			const item = dragDisplayList.value[dragIndex.value];
			item.zIndex = 1;
			const pos = getPos(dragIndex.value);
			nextTick(() => {
				item.x = pos.x;
				item.y = pos.y;
			});

			// 同步回源数据
			const sortedUrls = dragDisplayList.value.map(wrapper => wrapper.data);
			form.value.activityCoverImageUrls = sortedUrls;
		}
		dragIndex.value = -1;
	};
	/* ============================================================ */
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
		aspect-ratio: 5 / 4;
		height: auto;
		/* 移除固定高度 */

		display: flex;
		align-items: center;
		/* 垂直居中 */
		justify-content: center;
		/* 水平居中 */

		overflow: hidden;

		cursor: pointer;

		position: relative;
		/* 加上定位 */

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

	/* ==================== 拖拽排序相关样式 ==================== */
	.image-drag-container {
		width: 100%;
		position: relative;
		overflow: hidden;
		margin-top: 10rpx;
		z-index: 1;
		/* 防止遮挡 */
	}

	.drag-area {
		width: 100%;
	}

	.drag-item {
		z-index: 10;
	}

	.item-inner {
		width: 100%;
		height: 100%;
		padding: 8rpx;
		box-sizing: border-box;
		display: block;
	}

	.image-wrapper-drag {
		width: 100%;
		height: 100%;
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	.preview-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		border-radius: 0 0 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		z-index: 20;
	}

	/* 添加按钮样式 */
	.add-btn-wrapper {
		width: 33.33%;
		height: 210rpx;
		padding: 8rpx;
		box-sizing: border-box;
		display: inline-block;
		vertical-align: top;
	}

	.add-placeholder {
		width: 100%;
		height: 100%;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		/* 垂直排列图标和文字 */
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
		color: #999;
	}

	.add-placeholder text {
		margin-top: 10rpx;
		font-size: 24rpx;
	}
</style>