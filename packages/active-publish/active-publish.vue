<template>
	<view class="page">
		<!-- ================== 顶部提示区 ================== -->
		<view v-if="!isUserVerified" class="auth-reminder" @click="goToAuthPage">
			<view class="reminder-content">
				<uni-icons type="info-filled" size="18" color="#FF6F00"></uni-icons>
				<text class="reminder-text">为保障活动用户安全，请先进行实名认证</text>
			</view>
			<view class="reminder-action">
				<text>去认证</text>
				<uni-icons type="right" size="12" color="#FF6F00"></uni-icons>
			</view>
		</view>

		<scroll-view scroll-y class="main-scroll">
			<!-- ================== 1. 基本信息表单 ================== -->
			<view class="form-card">
				<view class="card-header">
					<view class="header-line"></view>
					<text class="header-title">基本信息</text>
				</view>

				<uni-forms :label-width="80" label-position="top" class="custom-forms">
					<!-- 聚会名称 -->
					<uni-forms-item label="聚会名称" required>
						<uni-easyinput v-model="form.activityTitle" placeholder="请输入聚会名称" :inputBorder="true"
							primaryColor="#FF6F00" :styles="inputStyles" />
					</uni-forms-item>

					<!-- 聚会类型 -->
					<uni-forms-item label="聚会类型" required>
						<uni-data-select v-model="form.tag" :localdata="tagOptions" placeholder="请选择类型"
							:clear="false"></uni-data-select>
					</uni-forms-item>

					<!-- 聚会封面 (4:3 比例) -->
					<uni-forms-item label="聚会封面">
						<view class="cover-upload-box" @click="uploadCover">
							<image v-if="form.coverImageUrl" :src="form.coverImageUrl" mode="aspectFill"
								class="uploaded-cover"></image>
							<view v-else class="upload-placeholder">
								<view class="icon-circle">
									<uni-icons type="camera-filled" size="32" color="#FF6F00"></uni-icons>
								</view>
								<text class="tip-text">点击上传封面</text>
								<text class="sub-tip">(建议比例4:3)</text>
							</view>
						</view>
					</uni-forms-item>

					<!-- 聚会图集 -->
					<uni-forms-item label="聚会图集">
						<view class="uploader-wrapper">
							<DragImageUploader v-model="form.activityCoverImageUrls" :max-count="9"
								@add-image="handleActivityImagesUpload" />
						</view>
					</uni-forms-item>

					<uni-forms-item label="聚会时间" required>
						<!-- 点击外层打开 -->
						<view class="picker-trigger-box" @click="openPicker">
							<uni-datetime-picker type="datetimerange" v-model="timeRange" rangeSeparator=" 至 "
								@maskClick="closePicker" @change="closePicker" />
						</view>
					</uni-forms-item>

					<uni-forms-item label="报名时间" required>
						<view class="picker-trigger-box" @click="openPicker">
							<uni-datetime-picker type="datetimerange" v-model="enrollTimeRange" rangeSeparator=" 至 "
								@maskClick="closePicker" @change="closePicker" />
						</view>
					</uni-forms-item>

					<!-- 地点选择 (全边框样式) -->
					<uni-forms-item label="聚会地点" required>
						<view @click="openMapToChooseLocation" class="custom-picker-box">
							<view class="picker-content">
								<text v-if="form.locationAddress" class="has-value">{{ form.locationAddress }}</text>
								<text v-else class="placeholder">点击选择位置</text>
							</view>
							<uni-icons type="location" size="20" color="#FF6F00"></uni-icons>
						</view>
					</uni-forms-item>

					<!-- 合作店铺 -->
					<uni-forms-item label="合作聚店">
						<view @click="goToSelectShop" class="custom-picker-box">
							<view class="picker-content">
								<text v-if="associatedStoreName" class="has-value">{{ associatedStoreName }}</text>
								<text v-else class="placeholder">点击选择合作店铺</text>
							</view>
							<uni-icons type="right" size="16" color="#ccc"></uni-icons>
						</view>
					</uni-forms-item>

					<!-- 人数设置 -->
					<view class="row-inputs">
						<uni-forms-item label="人数上限" class="half-item">
							<uni-easyinput type="number" v-model="form.totalSlots" placeholder="0" :inputBorder="true"
								:styles="inputStyles" />
						</uni-forms-item>
						<uni-forms-item label="起聚人数" class="half-item">
							<uni-easyinput type="number" v-model="form.limitSlots" placeholder="0" :inputBorder="true"
								:styles="inputStyles" />
						</uni-forms-item>
					</view>

					<!-- 费用类型 -->
					<uni-forms-item label="报名类型" required>
						<uni-data-checkbox v-model="form.activityFunds" :localdata="enrollmentOptions" mode="tag"
							selectedColor="#FF6F00" selectedTextColor="#FF6F00"></uni-data-checkbox>
					</uni-forms-item>

					<uni-forms-item label="单人费用" v-if="form.activityFunds === 1" required>
						<uni-easyinput type="digit" v-model="form.registrationFee" placeholder="请输入聚会费用(元)"
							:inputBorder="true" :styles="inputStyles">
							<template #right>
								<text style="padding-right: 20rpx; color: #666;">元</text>
							</template>
						</uni-easyinput>
					</uni-forms-item>
				</uni-forms>
			</view>

			<!-- ============ 2. 赞助商管理模块 ============ -->
			<view class="form-card" v-if="form.activityFunds !== 1">
				<view class="section-header" @click="isSponsorExpanded = !isSponsorExpanded">
					<view class="header-left">
						<view class="header-line"></view>
						<text class="header-title">赞助信息</text>
					</view>
					<view class="header-right">
						<text class="status-text">
							{{ sponsorsList.length > 0 ? `已添加 ${sponsorsList.length} 位` : '暂无赞助商' }}
						</text>
						<uni-icons :type="isSponsorExpanded ? 'top' : 'bottom'" size="14" color="#999"></uni-icons>
					</view>
				</view>

				<view v-if="isSponsorExpanded" class="sponsor-content">
					<view v-for="(item, index) in sponsorsList" :key="index" class="sponsor-card">
						<image :src="item.logoUrl" mode="aspectFill" class="sponsor-logo-mini"></image>
						<view class="sponsor-info-mini">
							<text class="s-name">{{ item.sponsorName }}</text>
							<view class="s-tag-wrap">
								<text
									class="s-tag">{{ item.sponsorType === 1 ? '现金' : (item.sponsorType === 2 ? '物品' : '混合') }}</text>
								<text class="s-desc-text">
									{{ item.sponsorType === 1 ? `￥${item.cashAmount}` : item.goodsDescription }}
								</text>
							</view>
						</view>
						<view class="sponsor-actions">
							<view class="icon-btn edit" @click.stop="handleEditSponsor(index)">
								<uni-icons type="compose" size="18" color="#FF6F00"></uni-icons>
							</view>
							<view class="icon-btn del" @click.stop="handleDeleteSponsor(index)">
								<uni-icons type="trash" size="18" color="#ff4d4f"></uni-icons>
							</view>
						</view>
					</view>

					<view class="add-dashed-btn" @click="handleAddSponsor">
						<uni-icons type="plusempty" size="16" color="#FF6F00"></uni-icons>
						<text>添加赞助商</text>
					</view>
				</view>
			</view>

			<!-- ============ 3. 聚会详情与环节 ============ -->
			<view class="form-card">
				<view class="card-header">
					<view class="header-line"></view>
					<text class="header-title">聚会详情</text>
				</view>

				<uni-forms :label-width="80" label-position="top">
					<uni-forms-item label="聚会介绍" required>
						<uni-easyinput type="textarea" autoHeight v-model="form.activityDescription"
							placeholder="请输入聚会详细介绍，让大家更了解活动内容~" :inputBorder="true" :styles="inputStyles" />
					</uni-forms-item>
				</uni-forms>

				<!-- 聚会环节 Label -->
				<view class="subsection-title">聚会环节</view>

				<view v-for="(item, index) in form.activitySessions" :key="index" class="session-card">
					<view class="session-header">
						<text class="session-index">环节 {{ index + 1 }}</text>
						<view class="session-del" @click="removeAgenda(index)">
							<uni-icons type="trash" size="16" color="#999"></uni-icons>
						</view>
					</view>
					<view class="session-inputs">
						<uni-easyinput v-model="item.sessionTitle" placeholder="请输入环节标题" :inputBorder="true"
							class="mb-20" :styles="inputStyles" />
						<uni-easyinput v-model="item.sessionDescription" placeholder="请输入环节描述" :inputBorder="true"
							:styles="inputStyles" />
					</view>
				</view>

				<view class="add-dashed-btn" @click="addAgenda">
					<uni-icons type="plusempty" size="16" color="#FF6F00"></uni-icons>
					<text>添加聚会环节</text>
				</view>
			</view>

			<!-- ============ 4. 组织者信息 ============ -->
			<view class="form-card">
				<view class="card-header">
					<view class="header-line"></view>
					<text class="header-title">组织者信息</text>
				</view>
				<uni-forms :label-width="80" label-position="top">
					<uni-forms-item label="组织者" required>
						<uni-easyinput v-model="form.organizerUnitName" placeholder="请输入组织者名称" :inputBorder="true"
							:styles="inputStyles" />
					</uni-forms-item>
					<uni-forms-item label="联系电话" required>
						<uni-easyinput type="number" v-model="form.organizerContactPhone" placeholder="请输入联系电话"
							:inputBorder="true" :styles="inputStyles" />
					</uni-forms-item>
					<uni-forms-item label="收款码" v-if="form.activityFunds === 1" required>
						<view class="qrcode-upload-box" @click="uploadCode">
							<image v-if="form.organizerPaymentQrCodeUrl" :src="form.organizerPaymentQrCodeUrl"
								mode="aspectFit" class="uploaded-qr"></image>
							<view v-else class="upload-placeholder">
								<uni-icons type="scan" size="28" color="#ccc"></uni-icons>
								<text class="tip-text">上传收款码</text>
							</view>
						</view>
					</uni-forms-item>
				</uni-forms>
			</view>

			<view class="form-bottom">
				<text>— 到底啦，请发起聚会吧 —</text>
			</view>
			<view style="height: 140rpx;"></view>
		</scroll-view>

		<!-- ============ 底部操作栏 ============ -->
		<view class="action-bar" :class="{ 'hidden': isPickerOpen }">
			<view v-if="mode === 'create'" class="action-btn save-btn" @click="saveDraft">
				<uni-icons type="download" size="16" color="#666"></uni-icons>
				<text>存草稿</text>
			</view>
			<view class="action-btn publish-btn" :class="{ 
			        'disabled': isPublishing || (mode === 'create' && isQuotaLoaded && remainingQuota <= 0) 
			    }" @click="handlePublishClick">
				<!-- 按钮文案逻辑：
			         1. 处理中 -> 处理中...
			         2. 编辑模式 -> 保存修改
			         3. 创建模式且次数不足 -> 发起聚会 (灰色)
			         4. 创建模式且次数充足 -> 发起聚会 (余X次)
			    -->
				<text v-if="isPublishing">处理中...</text>
				<text v-else-if="mode === 'edit'">保存修改</text>
				<text v-else>
					发起聚会
				</text>
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
		onShow,
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
	const mode = ref('create'); // 页面模式: 'create' | 'edit'
	const editActivityId = ref(null); // 编辑模式下的ID
	const remainingQuota = ref(0); // 剩余聚会发布次数
	const isQuotaLoaded = ref(false); // 标记是否已检查额度

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

	const isPickerOpen = ref(false);
	const inputStyles = ref({
		color: '#333',
		borderColor: '#dcdfe6'
	});

	// 处理打开
	const openPicker = () => {
		isPickerOpen.value = true;
	};

	// 处理关闭 (无论是选完还是取消)
	const closePicker = () => {
		// 加个微小的延时，防止闪烁
		setTimeout(() => {
			isPickerOpen.value = false;
		}, 100);
	};

	// ==============================================================================
	// 3. 生命周期 (Lifecycle Hooks)
	// ==============================================================================
	onMounted(() => {
		checkUserVerificationStatus();
		getActiveType();
		// initDragLayout();
	});

	onShow(() => {
		if (uni.getStorageSync('token')) {
			checkPublishQuota();
		}
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

	// 监听时间变化，选完了就恢复层级
	watch([timeRange, enrollTimeRange], () => {
		isPickerOpen.value = false;
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
					cropScale: '4:3', // 【关键】设置裁剪比例为 4:3
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
			sizeType: ['original', 'compressed'], // 建议加上这个
			sourceType: ['album', 'camera'], // 建议加上这个
			success: async (res) => {
				// 1. 显示加载提示，mask=true 防止用户在上传时误触其他按钮
				uni.showLoading({
					title: '正在上传...',
					mask: true
				});

				try {
					// 2. 并发上传所有选中的图片
					// 注意：这里我们假设 res.tempFiles 是正确的文件数组
					const uploadPromises = res.tempFiles.map(file => uploadFile({
						path: file.path // 适配你的 uploadFile 接口参数格式
					}, {
						directory: 'gallery'
					}));

					const results = await Promise.all(uploadPromises);

					// 3. 提取成功的 URL
					const successfulUrls = results
						.filter(res => res.data) // 过滤掉失败的
						.map(res => res.data); // 提取 URL

					// 4. 将新图片追加到表单数据中
					if (successfulUrls.length > 0) {
						form.value.activityCoverImageUrls.push(...successfulUrls);
					}

					// 可选：如果部分失败，提示一下
					if (successfulUrls.length < res.tempFiles.length) {
						uni.showToast({
							title: '部分图片上传失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('上传异常:', error);
					uni.showToast({
						title: '上传出错',
						icon: 'none'
					});
				} finally {
					// 5. 无论成功失败，一定要隐藏 Loading
					uni.hideLoading();
				}
			},
			fail: (err) => {
				// 用户取消选择通常不需要提示错误
				if (err.errMsg.indexOf('cancel') === -1) {
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			}
		});
	};

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

	// 获取聚会发布剩余次数 (rightsType = 3)
	const checkPublishQuota = async () => {
		try {
			const {
				data
			} = await request('/app-api/member/top-up-level-rights/get-remaining', {
				method: 'GET',
				data: {
					rightsType: 3
				}
			});

			// 【核心修改】只看 data，不管 error
			// 1. 如果 data 是数字 (比如 15，或者 0)，直接赋值
			if (typeof data === 'number') {
				remainingQuota.value = data;
			}
			// 2. 如果 data 是 null (接口500报错)，或者 undefined，强制设为 0
			else {
				console.log('接口返回 null，视为次数已用完');
				remainingQuota.value = 0;
			}

			// 【关键】标记为已加载，这样 template 里的 :class 判断才会生效 (按钮变灰)
			isQuotaLoaded.value = true;

		} catch (e) {
			console.error('获取权益网络异常', e);
			// 网络异常时不标记 loaded，保持按钮原样，或者提示网络错误
		}
	};

	const showQuotaExceededModal = () => {
		uni.showModal({
			title: '额度已用完',
			content: '您本月的聚会发布次数已耗尽。升级会员可获取更多额度。',
			confirmText: '升级会员',
			cancelText: '取消',
			confirmColor: '#FF6B00',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: '/pages/recharge/recharge?type=membership'
					});
				}
			}
		});
	};

	const handlePublishClick = () => {
		// 1. 额度检查拦截
		// 如果是编辑模式(mode='edit')，通常不扣次数（视业务而定），如果是创建模式才检查
		if (mode.value === 'create' && isQuotaLoaded.value && remainingQuota.value == 0) {
			showQuotaExceededModal();
			return;
		}

		// 2. 额度充足或编辑模式，走原有逻辑
		publish();
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
</script>

<style lang="scss" scoped>
	/* 定义主题变量 */
	$theme-color: #FF6F00;
	$bg-color: #f5f7fa;
	$card-bg: #ffffff;
	$border-color: #e5e5e5;
	$text-main: #333333;
	$text-sub: #666666;
	$input-border: #dcdfe6;

	.page {
		background-color: $bg-color;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-scroll {
		flex: 1;
		height: 0;
	}

	/* 卡片通用样式 */
	.form-card {
		background: $card-bg;
		margin: 24rpx;
		padding: 32rpx;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.header-line {
		width: 8rpx;
		height: 32rpx;
		background: linear-gradient(to bottom, $theme-color, lighten($theme-color, 20%));
		border-radius: 4rpx;
		margin-right: 16rpx;
	}

	.header-title {
		font-size: 32rpx;
		font-weight: bold;
		color: $text-main;
	}

	/* 顶部实名认证提示 */
	.auth-reminder {
		margin: 24rpx 24rpx 0;
		padding: 20rpx 24rpx;
		background: #FFF8E1;
		/* 浅橙色背景 */
		border-radius: 16rpx;
		border: 1px solid #FFE0B2;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.reminder-content {
			display: flex;
			align-items: center;
			gap: 12rpx;
		}

		.reminder-text {
			font-size: 26rpx;
			color: #FF8F00;
		}

		.reminder-action {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: $theme-color;
			font-weight: bold;
		}
	}

	/* 表单样式优化 */
	:deep(.uni-forms-item__label) {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
		padding-bottom: 12rpx;
	}

	:deep(.uni-data-checklist .checklist-group .checklist-box.is--tag.is-checked) {
		border-color: $theme-color !important;
		background-color: rgba($theme-color, 0.1) !important;
		color: $theme-color !important;
	}

	/* 封面上传框 (4:3 比例) */
	.cover-upload-box {
		width: 100%;
		aspect-ratio: 5 / 4;
		/* 核心比例 */
		background-color: #fafafa;
		border: 2rpx dashed $input-border;
		border-radius: 16rpx;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: border-color 0.3s;

		&:active {
			border-color: $theme-color;
			background-color: #fffaf5;
		}

		.uploaded-cover {
			width: 100%;
			height: 100%;
		}

		.upload-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #999;
		}

		.icon-circle {
			width: 80rpx;
			height: 80rpx;
			background: #fff;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 16rpx;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
		}

		.tip-text {
			font-size: 28rpx;
			color: #666;
			font-weight: 500;
		}

		.sub-tip {
			font-size: 22rpx;
			color: #bbb;
			margin-top: 6rpx;
		}
	}

	.uploader-wrapper {
		width: 100%;
		min-height: 200rpx;
		/* 给一个最小高度，防止未加载时完全坍塌 */
		overflow: hidden;
		/* 触发 BFC，清除浮动，防止子元素外溢 */
		display: block;
		/* 确保是块级元素 */
		/* 如果 DragImageUploader 内部有 transform 动画，可能需要加这个 */
		position: relative;
		z-index: 1;
	}

	/* 自定义选择框 (模仿输入框外观) */
	.custom-picker-box {
		width: 100%;
		height: 72rpx;
		/* 与 uni-easyinput 高度对齐 */
		border: 1px solid $input-border;
		border-radius: 8rpx;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
		box-sizing: border-box;

		&:active {
			border-color: $theme-color;
		}

		.picker-content {
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.has-value {
			font-size: 28rpx;
			color: $text-main;
		}

		.placeholder {
			font-size: 28rpx;
			color: #999;
			/* 占位符颜色 */
		}
	}

	/* 时间选择器触发框 */
	.picker-trigger-box {
		position: relative;

		/* 让 uni-datetime-picker 撑开容器，并通过 deep 样式美化 */
		:deep(.uni-date-x--border) {
			border: 1px solid $input-border !important;
			border-radius: 8rpx !important;
			height: 72rpx !important;
			box-sizing: border-box;
		}

		/* 隐藏原组件图标，使用自定义图标定位 */
		:deep(.uni-date__icon-clear) {
			right: 50rpx;
		}

		.picker-icon {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
		}
	}

	/* 布局辅助 */
	.row-inputs {
		display: flex;
		gap: 24rpx;

		.half-item {
			flex: 1;
			/* 解决 flex 子元素宽度溢出 */
			min-width: 0;
		}
	}

	.mb-20 {
		margin-bottom: 20rpx;
	}

	/* 赞助商模块 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 10rpx;

		.header-left {
			display: flex;
			align-items: center;
		}

		.header-right {
			display: flex;
			align-items: center;
			gap: 8rpx;
			font-size: 24rpx;
			color: #999;
		}
	}

	.sponsor-content {
		margin-top: 20rpx;
	}

	.sponsor-card {
		background: #f9f9f9;
		padding: 24rpx;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		border: 1px solid #eee;

		.sponsor-logo-mini {
			width: 88rpx;
			height: 88rpx;
			border-radius: 12rpx;
			margin-right: 24rpx;
			background: #e0e0e0;
			border: 1px solid #eee;
		}

		.sponsor-info-mini {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 8rpx;
		}

		.s-name {
			font-size: 28rpx;
			font-weight: bold;
			color: $text-main;
		}

		.s-tag-wrap {
			display: flex;
			align-items: center;
			gap: 10rpx;
		}

		.s-tag {
			font-size: 20rpx;
			color: $theme-color;
			background: rgba($theme-color, 0.1);
			padding: 2rpx 10rpx;
			border-radius: 8rpx;
		}

		.s-desc-text {
			font-size: 24rpx;
			color: $text-sub;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 300rpx;
		}

		.sponsor-actions {
			display: flex;
			gap: 16rpx;
		}

		.icon-btn {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #fff;
			border-radius: 50%;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			&:active {
				background: #f0f0f0;
			}
		}
	}

	/* 虚线添加按钮 */
	.add-dashed-btn {
		width: 100%;
		height: 88rpx;
		border: 2rpx dashed $theme-color;
		border-radius: 16rpx;
		background: rgba($theme-color, 0.02);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		font-size: 28rpx;
		color: $theme-color;
		font-weight: 500;
		margin-top: 10rpx;

		&:active {
			background: rgba($theme-color, 0.08);
		}
	}

	/* 聚会环节 */
	.subsection-title {
		font-size: 30rpx;
		font-weight: bold;
		color: $text-main;
		margin: 20rpx 0;
		padding-left: 10rpx;
		border-left: 6rpx solid $theme-color;
	}

	.session-card {
		background: #f9f9f9;
		padding: 24rpx;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		border: 1px solid #eee;

		.session-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;

			.session-index {
				font-size: 26rpx;
				font-weight: bold;
				color: $theme-color;
				background: #fff;
				padding: 4rpx 16rpx;
				border-radius: 20rpx;
				box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
			}

			.session-del {
				padding: 10rpx;
			}
		}
	}

	/* 二维码上传 */
	.qrcode-upload-box {
		width: 200rpx;
		height: 200rpx;
		border: 2rpx dashed $input-border;
		border-radius: 12rpx;
		background: #fafafa;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		.uploaded-qr {
			width: 100%;
			height: 100%;
		}

		.upload-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;
			color: #ccc;
		}

		.tip-text {
			font-size: 22rpx;
		}
	}

	.form-bottom {
		text-align: center;
		padding: 50rpx 0;
		color: #ccc;
		font-size: 24rpx;
	}

	/* 底部操作栏 */
	.action-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		background: rgba(255, 255, 255, 0.98);
		padding: 20rpx 32rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		display: flex;
		gap: 24rpx;
		z-index: 99;
		transition: opacity 0.2s;
		box-sizing: border-box;

		&.hidden {
			transform: translateY(100%);
			/* 移出屏幕 */
		}

		.action-btn {
			height: 88rpx;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			font-weight: 600;
		}

		.save-btn {
			flex: 1;
			background: #f5f5f5;
			color: $text-sub;
			gap: 10rpx;
			border: 1px solid #eee;

			&:active {
				background: #eeeeee;
			}
		}

		.publish-btn {
			flex: 2;
			background: linear-gradient(135deg, lighten($theme-color, 5%), darken($theme-color, 5%));
			color: #fff;
			box-shadow: 0 8rpx 20rpx rgba($theme-color, 0.3);

			&:active {
				opacity: 0.9;
			}

			&.disabled {
				background: #e0e0e0;
				/* 灰色背景 */
				color: #999;
				box-shadow: none;
				/* pointer-events: none; <--- 同样建议去掉这行，允许点击出弹窗提示 */
			}
		}
	}

	/* 强制提升 Picker 弹窗层级，无视父级限制 */
	:deep(.uni-datetime-picker--popup),
	:deep(.uni-date-range-popup) {
		z-index: 99999 !important;
		position: fixed !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
	}

	/* 强制提升遮罩层级 */
	:deep(.uni-mask),
	:deep(.uni-date-mask) {
		z-index: 99998 !important;
	}

	/* 确保底部栏层级正常，不要太高 */
	.action-bar {
		z-index: 99;
	}
</style>