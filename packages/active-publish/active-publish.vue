<template>
	<view class="page">
		<!-- ================== 顶部提示区 ================== -->
		<!-- 实名认证提示 -->
		<view v-if="!isUserVerified" class="auth-reminder" @click="goToAuthPage">
			<uni-icons type="info-filled" size="18" color="#e6a23c"></uni-icons>
			<text class="reminder-text">为保障活动用户安全，请先进行实名认证，点击前往</text>
			<text class="reminder-arrow">›</text>
		</view>

		<!-- ================== 1. 基本信息表单 ================== -->
		<view class="form-section">
			<view class="section-title">基本信息</view>
			<uni-forms :label-width="80" label-position="top">
				<!-- 聚会名称 -->
				<uni-forms-item label="聚会名称" required>
					<uni-easyinput v-model="form.activityTitle" placeholder="请输入聚会名称" />
				</uni-forms-item>

				<!-- 聚会类型 -->
				<uni-forms-item label="聚会类型" required>
					<uni-data-select v-model="form.tag" :localdata="tagOptions" placeholder="请选择类型"></uni-data-select>
				</uni-forms-item>

				<!-- 聚会封面 -->
				<uni-forms-item label="聚会封面">
					<view class="cover-upload" @click="uploadCover">
						<image v-if="form.coverImageUrl" :src="form.coverImageUrl" mode="aspectFill"></image>
						<text v-else>点击上传封面 (5:4或4:3)</text>
					</view>
				</uni-forms-item>

				<!-- 聚会图集 (支持拖拽排序) -->
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
										<image :src="item.data" mode="aspectFill" class="preview-image"
											@click.stop="previewActivityImage(item.realIndex)" />
										<view class="delete-btn" @click.stop="deleteActivityImage(item.realIndex)">×
										</view>
									</view>
								</view>
							</movable-view>
						</movable-area>
					</view>
					<!-- 添加图片按钮 -->
					<view class="add-btn-wrapper" v-if="form.activityCoverImageUrls.length < 9"
						@click="handleActivityImagesUpload">
						<view class="add-placeholder">
							<uni-icons type="plusempty" size="30" color="#ccc"></uni-icons>
							<text>添加</text>
						</view>
					</view>
				</uni-forms-item>

				<!-- 时间选择 -->
				<uni-forms-item label="聚会时间" required>
					<view @click="isPickerOpen = true">
						<uni-datetime-picker type="datetimerange" v-model="timeRange" rangeSeparator="至"
							@change="isPickerOpen = false" @maskClick="isPickerOpen = false" />
					</view>
				</uni-forms-item>

				<uni-forms-item label="报名时间" required>
					<view @click="isPickerOpen = true">
						<uni-datetime-picker type="datetimerange" v-model="enrollTimeRange" rangeSeparator="至"
							@change="isPickerOpen = false" @maskClick="isPickerOpen = false" />
					</view>
				</uni-forms-item>

				<!-- 地点选择 -->
				<uni-forms-item label="聚会地点" required>
					<view class="uni-list-cell-db">
						<view @click="openMapToChooseLocation" class="uni-input">
							<text v-if="form.locationAddress">{{ form.locationAddress }}</text>
							<text v-else class="placeholder">点击选择位置</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-forms-item>

				<!-- 合作店铺 -->
				<uni-forms-item label="合作聚店" :label-width="80">
					<view class="uni-list-cell-db">
						<view @click="goToSelectShop" class="uni-input">
							<text v-if="associatedStoreName">{{ associatedStoreName }}</text>
							<text v-else class="placeholder">点击选择合作店铺</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-forms-item>

				<!-- 人数设置 -->
				<uni-forms-item label="人数上限">
					<uni-easyinput type="number" v-model="form.totalSlots" placeholder="超过人数上限,不能报名" />
				</uni-forms-item>

				<uni-forms-item label="起聚人数">
					<uni-easyinput type="number" v-model="form.limitSlots" placeholder="不达起聚人数,聚会取消" />
				</uni-forms-item>

				<!-- 费用类型 -->
				<uni-forms-item label="报名类型" required>
					<uni-data-checkbox v-model="form.activityFunds" :localdata="enrollmentOptions"
						mode="button"></uni-data-checkbox>
				</uni-forms-item>

				<uni-forms-item label="单人费用" v-if="form.activityFunds === 1" required>
					<uni-easyinput type="digit" v-model="form.registrationFee" placeholder="请输入聚会费用(元)" />
				</uni-forms-item>
			</uni-forms>
		</view>

		<!-- ============ 2. 赞助商管理模块 ============ -->
		<view class="form-section">
			<!-- 头部：标题与折叠状态 -->
			<view class="section-header" @click="isSponsorExpanded = !isSponsorExpanded">
				<view class="section-title" style="margin-bottom:0; border:none;">赞助信息</view>
				<view class="header-right">
					<text class="status-text">
						{{ sponsorsList.length > 0 ? `已添加 ${sponsorsList.length} 位` : '暂无赞助商' }}
					</text>
					<uni-icons :type="isSponsorExpanded ? 'top' : 'bottom'" size="16" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 展开的内容：赞助商列表 -->
			<view v-if="isSponsorExpanded" class="sponsor-content">
				<view v-for="(item, index) in sponsorsList" :key="index" class="sponsor-card">
					<image :src="item.logoUrl" mode="aspectFill" class="sponsor-logo-mini"></image>
					<view class="sponsor-info-mini">
						<text class="s-name">{{ item.sponsorName }}</text>
						<text class="s-desc">
							{{ item.sponsorType === 1 ? `现金 ￥${item.cashAmount}` : `物品: ${item.goodsDescription}` }}
						</text>
					</view>
					<view class="sponsor-actions">
						<view class="action-icon edit" @click.stop="handleEditSponsor(index)">
							<uni-icons type="compose" size="20" color="#FF6F00"></uni-icons>
						</view>
						<view class="action-icon del" @click.stop="handleDeleteSponsor(index)">
							<uni-icons type="trash" size="20" color="#dd524d"></uni-icons>
						</view>
					</view>
				</view>

				<!-- 添加赞助商按钮 -->
				<view class="add-sponsor-btn" @click="handleAddSponsor">
					<uni-icons type="plusempty" size="18" color="#FF6F00"></uni-icons>
					<text>添加赞助商</text>
				</view>
			</view>
		</view>

		<!-- ============ 3. 聚会详情与环节 ============ -->
		<view class="form-section">
			<view class="section-title">聚会详情</view>

			<uni-forms :label-width="80" label-position="top">
				<uni-forms-item label="聚会介绍" required :label-width="80">
					<uni-easyinput type="textarea" autoHeight v-model="form.activityDescription"
						placeholder="请输入聚会详细介绍" />
				</uni-forms-item>
			</uni-forms>

			<!-- 动态环节列表 -->
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

		<!-- ============ 4. 组织者信息 ============ -->
		<view class="form-section">
			<view class="section-title">组织者信息</view>
			<uni-forms :label-width="80" label-position="top">
				<uni-forms-item label="组织者" required>
					<uni-easyinput v-model="form.organizerUnitName" placeholder="请输入组织者名称" />
				</uni-forms-item>
				<uni-forms-item label="联系电话" required>
					<uni-easyinput type="number" v-model="form.organizerContactPhone" placeholder="请输入联系电话" />
				</uni-forms-item>
				<uni-forms-item label="收款码" v-if="form.activityFunds === 1" :required="true">
					<view class="cover-upload" @click="uploadCode">
						<image v-if="form.organizerPaymentQrCodeUrl" :src="form.organizerPaymentQrCodeUrl"
							mode="aspectFit"></image>
						<text v-else>点击上传收款码</text>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="form-bottom">到底啦，请发起聚会吧！</view>

		<!-- ============ 底部操作栏 ============ -->
		<!-- z-index-low 用于解决被时间选择器遮挡的问题 -->
		<view class="action-bar" :class="{ 'z-index-low': isPickerOpen }">
			<view v-if="mode === 'create'" class="action-btn save-btn" @click="saveDraft">保存草稿</view>
			<view class="action-btn publish-btn" :class="{ 'disabled': isPublishing }" @click="publish">
				{{ isPublishing ? '处理中...' : (mode === 'edit' ? '保存修改' : '发起聚会') }}
			</view>
		</view>

		<!-- ============ 弹窗组件：赞助商编辑 ============ -->
		<sponsor-popup :visible="showSponsorPopup" :data="currentSponsorData" @close="showSponsorPopup = false"
			@confirm="handleSponsorSave"></sponsor-popup>

	</view>
</template>

<script setup>
	// ==============================================================================
	// 1. 引入依赖 (Imports)
	// ==============================================================================
	import {
		ref,
		onMounted,
		watch,
		nextTick
	} from 'vue';
	import {
		onLoad,
		onUnload,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js';
	import {
		getInviteCode
	} from '@/utils/user.js';
	import SponsorPopup from '@/components/sponsor-popup.vue';

	// ==============================================================================
	// 2. 状态定义 (State Definitions)
	// ==============================================================================

	// --- 基础配置与UI状态 ---
	const DRAFT_STORAGE_KEY = 'activity_draft'; // 草稿箱Key
	const isUserVerified = ref(true); // 实名认证状态
	const isPublishing = ref(false); // 发布按钮防抖/加载状态
	const isPickerOpen = ref(false); // 时间选择器打开状态(用于控制底部栏层级)
	const mode = ref('create'); // 页面模式: 'create' | 'edit'
	const editActivityId = ref(null); // 编辑模式下的ID

	// --- 表单数据模型 ---
	const timeRange = ref([]); // 聚会时间范围 [开始, 结束]
	const enrollTimeRange = ref([]); // 报名时间范围 [开始, 结束]
	const associatedStoreName = ref(''); // 选中的店铺名称(用于展示)
	const tagOptions = ref([]); // 聚会类型字典
	const enrollmentOptions = ref([ // 报名类型选项
		{
			text: 'AA/付费',
			value: 1
		},
		{
			text: '赞助/免费',
			value: 2
		}
	]);

	const form = ref({
		activityTitle: '',
		activityDescription: '',
		totalSlots: null,
		limitSlots: null,
		activityFunds: 1, // 1: AA, 2: 赞助
		registrationFee: null,
		locationAddress: '',
		latitude: null,
		longitude: null,
		coverImageUrl: '',
		activityCoverImageUrls: [],
		organizerUnitName: '',
		organizerContactPhone: '',
		organizerPaymentQrCodeUrl: '',
		associatedStoreId: null,
		tag: '',
		activitySessions: [{
			sessionTitle: '环节标题',
			sessionDescription: '环节描述'
		}]
	});

	// --- 赞助商模块状态 ---
	const isSponsorExpanded = ref(false); // 折叠面板展开状态
	const showSponsorPopup = ref(false); // 弹窗显示状态
	const sponsorsList = ref([]); // 赞助商列表数据
	const deletedSponsorIds = ref([]); // 待删除的赞助商ID集合
	const currentSponsorIndex = ref(-1); // 当前正在编辑的索引
	const currentSponsorData = ref(null); // 传递给弹窗的编辑数据

	// --- 拖拽排序状态 ---
	const dragDisplayList = ref([]); // 拖拽显示列表
	const dragItemWidth = ref(0); // 拖拽项宽度
	const dragItemHeight = ref(0); // 拖拽项高度
	const dragAreaHeight = ref(0); // 拖拽区域总高度
	const isDragging = ref(false); // 是否正在拖拽
	const dragIndex = ref(-1); // 当前拖拽的索引

	// ==============================================================================
	// 3. 生命周期 (Lifecycle Hooks)
	// ==============================================================================
	onMounted(() => {
		checkUserVerificationStatus();
		getActiveType();
		initDragLayout();
	});

	onLoad(async (options) => {
		// 1. 判断模式 (编辑 vs 创建)
		if (options && options.mode === 'edit' && options.id) {
			mode.value = 'edit';
			editActivityId.value = options.id;
			uni.setNavigationBarTitle({
				title: '编辑聚会'
			});
			await loadActivityDetailForEdit(options.id);
		} else {
			mode.value = 'create';
			uni.setNavigationBarTitle({
				title: '发起聚会'
			});
			// 尝试加载草稿，没有草稿则初始化默认时间
			const hasDraft = loadDraft();
			if (!hasDraft) initDefaultTimes();
		}

		// 2. 处理店铺选择回调参数
		if (options && options.storeId && options.storeName) {
			form.value.associatedStoreId = options.storeId;
			associatedStoreName.value = decodeURIComponent(options.storeName);
		}

		// 3. 监听全局事件
		uni.$on('shopSelected', (shop) => {
			form.value.associatedStoreId = shop.id;
			associatedStoreName.value = shop.storeName;
		});
	});

	onUnload(() => {
		uni.$off('shopSelected');
	});

	// ==============================================================================
	// 4. 工具与辅助方法 (Utils & Helpers)
	// ==============================================================================

	// 时间戳格式化
	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const d = new Date(Number(ts));
		const pad = (n) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	};

	// 初始化默认时间 (今天)
	const initDefaultTimes = () => {
		const now = new Date();
		const day =
			`${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;
		enrollTimeRange.value = [`${day} 09:00:00`, `${day} 18:00:00`];
		timeRange.value = [`${day} 19:00:00`, `${day} 21:00:00`];
	};

	// 检查实名认证 (占位)
	const checkUserVerificationStatus = async () => {
		/*...*/
	};

	// 获取聚会类型字典
	const getActiveType = async () => {
		const res = await request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: {
				type: "member_activity_category "
			}
		});
		if (res.data) tagOptions.value = res.data.map(i => ({
			value: i.value,
			text: i.label
		}));
	};

	// ==============================================================================
	// 5. 交互事件处理 (UI Handlers)
	// ==============================================================================

	// --- 5.1 地图与店铺 ---
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				form.value.locationAddress = res.address;
				form.value.latitude = res.latitude;
				form.value.longitude = res.longitude;
			}
		});
	};

	const goToSelectShop = () => uni.navigateTo({
		url: '/pages/shop-list/shop-list'
	});

	// --- 5.2 图片上传与处理 ---
	const uploadCover = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];

				// #ifdef MP-WEIXIN
				// 微信小程序端：调用原生裁剪接口
				wx.cropImage({
					src: tempFilePath, // 图片路径
					cropScale: '5:4', // 【关键】设置裁剪比例为 5:4
					success: (cropRes) => {
						console.log('裁剪成功:', cropRes.tempFilePath);
						// 将裁剪后的图片上传到服务器
						processUpload(cropRes.tempFilePath);
					},
					fail: (err) => {
						console.log('用户取消裁剪或失败:', err);
						// 可选：如果用户取消裁剪，是否允许直接上传原图？
						// 如果强制要求，这里什么都不做。
						// 如果允许降级，可以调用 processUpload(tempFilePath);
					}
				});
				// #endif

				// #ifndef MP-WEIXIN
				// 非微信小程序端（如H5/App）：直接上传，或需要引入第三方裁剪插件
				// 暂时直接上传原图
				processUpload(tempFilePath);
				// #endif
			}
		});
	};

	// 抽离上传逻辑，方便复用
	const processUpload = async (filePath) => {
		uni.showLoading({
			title: '上传中...'
		});

		// 调用你项目封装好的 uploadFile 工具
		// 注意：根据你的 upload.js 实现，入参可能是一个文件对象或路径
		// 这里假设 uploadFile 需要的是 { path: ... } 格式的对象
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'cover' // 上传目录
		});

		uni.hideLoading();

		if (result.data) {
			form.value.coverImageUrl = result.data;
			uni.showToast({
				title: '封面已设置',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: '上传失败',
				icon: 'none'
			});
		}
	};

	const handleActivityImagesUpload = () => {
		uni.chooseImage({
			count: 9 - form.value.activityCoverImageUrls.length,
			success: async (res) => {
				const list = await Promise.all(res.tempFiles.map(f => uploadFile({
					path: f.path
				}, {
					directory: 'gallery'
				})));
				form.value.activityCoverImageUrls.push(...list.filter(r => r.data).map(r => r.data));
			}
		});
	};

	const deleteActivityImage = (i) => form.value.activityCoverImageUrls.splice(i, 1);

	const previewActivityImage = (i) => uni.previewImage({
		urls: form.value.activityCoverImageUrls,
		current: i
	});

	const uploadCode = async () => {
		uni.chooseImage({
			success: async (res) => {
				const r = await uploadFile({
					path: res.tempFilePaths[0]
				}, {
					directory: 'qrcode'
				});
				if (r.data) form.value.organizerPaymentQrCodeUrl = r.data;
			}
		});
	};

	// --- 5.3 环节管理 ---
	const addAgenda = () => form.value.activitySessions.push({
		sessionTitle: '',
		sessionDescription: ''
	});
	const removeAgenda = (i) => form.value.activitySessions.splice(i, 1);

	// ==============================================================================
	// 6. 赞助商管理逻辑 (Sponsor Logic)
	// ==============================================================================

	// 打开添加弹窗
	const handleAddSponsor = () => {
		currentSponsorIndex.value = -1;
		currentSponsorData.value = null;
		showSponsorPopup.value = true;
	};

	// 打开编辑弹窗
	const handleEditSponsor = (index) => {
		currentSponsorIndex.value = index;
		currentSponsorData.value = sponsorsList.value[index];
		showSponsorPopup.value = true;
	};

	// 删除赞助商
	const handleDeleteSponsor = (index) => {
		uni.showModal({
			title: '提示',
			content: '确定移除该赞助商吗？',
			success: (res) => {
				if (res.confirm) {
					const item = sponsorsList.value[index];
					// 如果该赞助商有ID (说明是后端已存的)，记录到删除队列以便提交时删除
					if (item.id) {
						deletedSponsorIds.value.push(item.id);
					}
					sponsorsList.value.splice(index, 1);
				}
			}
		});
	};

	// 弹窗确认回调
	const handleSponsorSave = (data) => {
		if (currentSponsorIndex.value === -1) {
			sponsorsList.value.push(data); // 新增
		} else {
			sponsorsList.value.splice(currentSponsorIndex.value, 1, data); // 更新
		}
		showSponsorPopup.value = false;
	};

	// 后端同步逻辑 (在发布/保存时调用)
	const syncSponsorsInline = async (activityId) => {
		console.log('开始同步赞助商:', activityId);
		const userId = uni.getStorageSync('userId');

		// A. 执行删除
		for (const id of deletedSponsorIds.value) {
			await request(`/app-api/member/sponsor/delete?id=${id}`, {
				method: 'DELETE'
			});
		}

		// B. 执行新增或更新
		sponsorsList.value.forEach((item, index) => item.displaySort = index); // 更新排序

		for (const item of sponsorsList.value) {
			const sponsorPayload = {
				...item,
				userId: userId,
				activityId: activityId,
				galleryImageUrls: JSON.stringify(item.galleryImageUrls || [])
			};

			if (item.id) {
				await request('/app-api/member/sponsor-activity-record/update-in-activity', {
					method: 'PUT',
					data: sponsorPayload
				});
			} else {
				await request('/app-api/member/sponsor-activity-record/create-in-activity', {
					method: 'POST',
					data: sponsorPayload
				});
			}
		}
	};

	// ==============================================================================
	// 7. 核心业务逻辑 (Core Business Logic)
	// ==============================================================================

	// --- 7.1 草稿箱 ---
	const loadDraft = () => {
		try {
			const str = uni.getStorageSync(DRAFT_STORAGE_KEY);
			if (str) {
				const d = JSON.parse(str);
				form.value = d.form || form.value;
				if (!form.value.activityCoverImageUrls) form.value.activityCoverImageUrls = [];
				timeRange.value = d.timeRange || [];
				enrollTimeRange.value = d.enrollTimeRange || [];
				associatedStoreName.value = d.associatedStoreName || '';
				// 恢复赞助商
				if (d.sponsorsList) sponsorsList.value = d.sponsorsList;
				uni.showToast({
					title: '已恢复草稿',
					icon: 'none'
				});
				return true;
			}
		} catch (e) {}
		return false;
	};

	const saveDraft = () => {
		const draft = {
			form: form.value,
			timeRange: timeRange.value,
			enrollTimeRange: enrollTimeRange.value,
			associatedStoreName: associatedStoreName.value,
			sponsorsList: sponsorsList.value
		};
		uni.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draft));
		uni.showToast({
			title: '草稿已保存',
			icon: 'none'
		});
	};

	// --- 7.2 编辑模式回显 ---
	const loadActivityDetailForEdit = async (id) => {
		uni.showLoading({
			title: '加载中...'
		});

		// 并发请求：详情 + 字典
		const [detailRes, dictRes] = await Promise.all([
			request('/app-api/member/activity/get', {
				method: 'GET',
				data: {
					id
				}
			}),
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

		// 1. 处理字典
		if (dictRes && !dictRes.error && dictRes.data) {
			tagOptions.value = dictRes.data.map(item => ({
				value: item.value,
				text: item.label
			}));
		}

		// 2. 处理详情
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

		// 回显基础字段
		form.value.activityTitle = data.activityTitle;
		form.value.activityDescription = data.activityDescription;
		form.value.totalSlots = data.totalSlots;
		form.value.limitSlots = data.limitSlots;
		form.value.activityFunds = data.activityFunds;
		form.value.registrationFee = data.registrationFee;
		form.value.locationAddress = data.locationAddress;
		form.value.latitude = data.latitude;
		form.value.longitude = data.longitude;
		form.value.coverImageUrl = data.coverImageUrl;
		form.value.organizerUnitName = data.organizerUnitName;
		form.value.organizerContactPhone = data.organizerContactPhone;
		form.value.organizerPaymentQrCodeUrl = data.organizerPaymentQrCodeUrl;

		// 回显图集
		form.value.activityCoverImageUrls = (data.activityCoverImageUrls && data.activityCoverImageUrls.length >
				0) ?
			data.activityCoverImageUrls : [];

		// 回显Tag
		let matchedValue = '';
		if (data.category) {
			const targetVal = String(data.category);
			const foundOption = tagOptions.value.find(opt => String(opt.value) === targetVal);
			if (foundOption) matchedValue = foundOption.value;
		}
		if (!matchedValue && data.tags && data.tags.length > 0) {
			const tagName = data.tags[0];
			const foundOption = tagOptions.value.find(opt => opt.text === tagName);
			if (foundOption) matchedValue = foundOption.value;
		}
		form.value.tag = matchedValue;

		// 回显时间
		if (data.startDatetime && data.endDatetime) {
			timeRange.value = [formatTimestamp(data.startDatetime), formatTimestamp(data.endDatetime)];
		}
		if (data.registrationStartDatetime && data.registrationEndDatetime) {
			enrollTimeRange.value = [formatTimestamp(data.registrationStartDatetime), formatTimestamp(data
				.registrationEndDatetime)];
		}

		// 回显店铺
		if (data.memberStoreRespVO) {
			form.value.associatedStoreId = data.memberStoreRespVO.id;
			associatedStoreName.value = data.memberStoreRespVO.storeName;
		}

		// 回显环节
		if (data.memberActivitySessionList && data.memberActivitySessionList.length > 0) {
			form.value.activitySessions = data.memberActivitySessionList.map(item => ({
				id: item.id,
				sessionTitle: item.sessionTitle,
				sessionDescription: item.sessionDescription
			}));
		}

		// 回显赞助商
		if (data.memberSponsorList && data.memberSponsorList.length > 0) {
			sponsorsList.value = data.memberSponsorList.map(item => {
				let gallery = [];
				try {
					if (item.galleryImageUrls && typeof item.galleryImageUrls === 'string') {
						gallery = JSON.parse(item.galleryImageUrls);
					} else if (Array.isArray(item.galleryImageUrls)) {
						gallery = item.galleryImageUrls;
					}
				} catch (e) {
					console.error('解析赞助商图集失败:', e);
					gallery = [];
				}
				return {
					...item,
					galleryImageUrls: gallery
				};
			});
			console.log('赞助商回显完成:', sponsorsList.value);
		} else {
			sponsorsList.value = [];
		}
	};

	// --- 7.3 发布/保存流程 ---
	const publish = async () => {
		if (isPublishing.value) return;

		// 简单校验
		if (!form.value.activityTitle) return uni.showToast({
			title: '标题必填',
			icon: 'none'
		});
		if (!form.value.tag) return uni.showToast({
			title: '类型必选',
			icon: 'none'
		});
		if (!timeRange.value.length || !enrollTimeRange.value.length) return uni.showToast({
			title: '时间必填',
			icon: 'none'
		});
		if (!form.value.locationAddress) return uni.showToast({
			title: '地点必填',
			icon: 'none'
		});

		uni.showModal({
			title: '确认发布',
			content: '确认内容无误？',
			success: (res) => {
				if (res.confirm) processPublishing();
			}
		});
	};

	const processPublishing = async () => {
		isPublishing.value = true;
		uni.showLoading({
			title: '处理中...',
			mask: true
		});

		try {
			// 1. 准备数据
			const payload = JSON.parse(JSON.stringify(form.value));
			payload.startDatetime = new Date(timeRange.value[0]).getTime();
			payload.endDatetime = new Date(timeRange.value[1]).getTime();
			payload.registrationStartDatetime = new Date(enrollTimeRange.value[0]).getTime();
			payload.registrationEndDatetime = new Date(enrollTimeRange.value[1]).getTime();

			const tagObj = tagOptions.value.find(o => o.value == payload.tag);
			payload.category = payload.tag;
			payload.tags = tagObj ? [tagObj.text] : [payload.tag];
			delete payload.tag;

			payload.activitySessions = payload.activitySessions.map((s, i) => ({
				...s,
				sessionOrder: i + 1
			}));

			// 清理旧字段
			delete payload.companyName;
			delete payload.companyLogo;
			if (payload.activityFunds === 2) delete payload.registrationFee;

			let finalActivityId = null;

			// 2. 提交主活动信息
			if (mode.value === 'edit') {
				payload.id = editActivityId.value;
				const res = await request('/app-api/member/activity/edit', {
					method: 'POST',
					data: payload
				});
				if (res.error) throw new Error(res.error.msg || '修改失败');
				finalActivityId = editActivityId.value;
			} else {
				const res = await request('/app-api/member/activity/create', {
					method: 'POST',
					data: payload
				});
				if (res.error) throw new Error(res.error.msg || '创建失败');
				finalActivityId = res.data;
			}

			// 3. 同步赞助商
			if (finalActivityId) {
				await syncSponsorsInline(finalActivityId);
			}

			// 4. 完成
			if (mode.value === 'create') uni.removeStorageSync(DRAFT_STORAGE_KEY);
			uni.showModal({
				title: '成功',
				content: '发布完成',
				showCancel: false,
				success: () => uni.navigateBack({
					delta: 1
				})
			});

		} catch (e) {
			console.error(e);
			uni.showToast({
				title: e.message || '系统异常',
				icon: 'none'
			});
		} finally {
			isPublishing.value = false;
			uni.hideLoading();
		}
	};

	// ==============================================================================
	// 8. 拖拽排序实现 (Drag & Drop Implementation)
	// ==============================================================================
	watch(() => form.value.activityCoverImageUrls, (val) => {
		if (!isDragging.value) {
			dragDisplayList.value = (val || []).map((u, i) => {
				const r = Math.floor(i / 3),
					c = i % 3;
				return {
					id: `pg_${i}`,
					data: u,
					x: c * dragItemWidth.value,
					y: r * dragItemHeight.value,
					zIndex: 1,
					realIndex: i
				};
			});
			dragAreaHeight.value = Math.ceil((val || []).length / 3) * dragItemHeight.value;
		}
	}, {
		deep: true
	});

	const initDragLayout = () => {
		const sys = uni.getSystemInfoSync();
		dragItemWidth.value = (sys.windowWidth - uni.upx2px(100)) / 3;
		dragItemHeight.value = uni.upx2px(210);
	};

	const onMovableStart = (i) => {
		isDragging.value = true;
		dragIndex.value = i;
		dragDisplayList.value[i].zIndex = 99;
	};

	const onMovableChange = (e, i) => {
		if (!isDragging.value || i !== dragIndex.value) return;
		const x = e.detail.x;
		const y = e.detail.y;
		const c = Math.floor((x + dragItemWidth.value / 2) / dragItemWidth.value);
		const r = Math.floor((y + dragItemHeight.value / 2) / dragItemHeight.value);
		let target = r * 3 + c;
		if (target < 0) target = 0;
		if (target >= dragDisplayList.value.length) target = dragDisplayList.value.length - 1;
		if (target !== dragIndex.value) {
			const m = dragDisplayList.value[dragIndex.value];
			dragDisplayList.value.splice(dragIndex.value, 1);
			dragDisplayList.value.splice(target, 0, m);
			dragDisplayList.value.forEach((item, idx) => {
				if (idx !== target) {
					const nr = Math.floor(idx / 3),
						nc = idx % 3;
					item.x = nc * dragItemWidth.value;
					item.y = nr * dragItemHeight.value;
				}
			});
			dragIndex.value = target;
		}
	};

	const onMovableEnd = () => {
		isDragging.value = false;
		if (dragIndex.value !== -1) {
			const item = dragDisplayList.value[dragIndex.value];
			item.zIndex = 1;
			const r = Math.floor(dragIndex.value / 3),
				c = dragIndex.value % 3;
			nextTick(() => {
				item.x = c * dragItemWidth.value;
				item.y = r * dragItemHeight.value;
			});
			form.value.activityCoverImageUrls = dragDisplayList.value.map(o => o.data);
		}
		dragIndex.value = -1;
	};
</script>

<style lang="scss" scoped>
	/* ============ 页面容器与全局 ============ */
	.page {
		background-color: #f8f8f8;
		padding-bottom: 200rpx;
		/* 底部留白，防止内容被底部栏遮挡 */
	}

	.form-section {
		background: #fff;
		margin: 20rpx;
		padding: 30rpx;
		border-radius: 20rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #FF6F00;
		margin-bottom: 20rpx;
		border-left: 10rpx solid #FF6F00;
		padding-left: 20rpx;
	}

	/* ============ 顶部实名认证提示 ============ */
	.auth-reminder {
		display: flex;
		align-items: center;
		padding: 20rpx;
		margin: 20rpx;
		background: #fdf6ec;
		border-radius: 12rpx;
		color: #e6a23c;

		.reminder-text {
			flex: 1;
			margin: 0 10rpx;
		}
	}

	/* ============ 上传组件通用样式 ============ */
	.cover-upload {
		border: 2rpx dashed #ccc;
		border-radius: 16rpx;
		background-color: #fafafa;
		color: #999;
		width: 100%;
		aspect-ratio: 5 / 4;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.add-btn-wrapper {
		width: 33.33%;
		height: 210rpx;
		padding: 8rpx;
		display: inline-block;
		box-sizing: border-box;
		vertical-align: top;
	}

	.add-placeholder {
		width: 100%;
		height: 100%;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	/* ============ 赞助商模块样式 ============ */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 20rpx;
	}

	.header-right {
		font-size: 26rpx;
		color: #999;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.sponsor-card {
		display: flex;
		align-items: center;
		background: #f9f9f9;
		padding: 20rpx;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
	}

	.sponsor-logo-mini {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		background: #eee;
	}

	.sponsor-info-mini {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.s-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.s-desc {
		font-size: 24rpx;
		color: #666;
		margin-top: 6rpx;
	}

	.sponsor-actions {
		display: flex;
		gap: 20rpx;
	}

	.action-icon {
		padding: 10rpx;
	}

	.add-sponsor-btn {
		border: 2rpx dashed #FF6F00;
		color: #FF6F00;
		padding: 20rpx;
		text-align: center;
		border-radius: 12rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
	}

	/* ============ 底部操作栏 ============ */
	.action-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		display: flex;
		background-color: #fff;
		padding: 20rpx 0;
		z-index: 99;

		/* 当时间选择器打开时降低层级 */
		&.z-index-low {
			z-index: 1;
		}
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

	.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	/* ============ 拖拽通用样式 ============ */
	.image-drag-container {
		width: 100%;
		position: relative;
		margin-top: 10rpx;
		min-height: 200rpx;
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
		width: 100%;
		height: 100%;
	}

	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 20;
		border-radius: 0 0 0 10rpx;
	}

	/* ============ 其他辅助样式 ============ */
	.uni-list-cell-db {
		border: #e2e2e2 solid 1rpx;
		border-radius: 10rpx;
		padding: 20rpx;

		.uni-input {
			display: flex;
			justify-content: space-between;
			color: #333;

			.placeholder {
				color: #999;
			}

			.arrow {
				color: #999;
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

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		position: relative;
		margin-bottom: 20rpx;
		padding: 20rpx;
		background: #f9f9f9;
		border-radius: 10rpx;

		.uni-icons {
			position: absolute;
			right: 20rpx;
			top: 20rpx;
		}
	}
</style>