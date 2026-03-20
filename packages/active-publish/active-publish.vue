<template>
	<view class="page">
		<!-- ================== 顶部提示区 ================== -->
		<!-- 未实名时显示：有免实名次数提示剩余机会，无次数时变红警告 -->
		<view v-if="!isUserVerified" class="auth-reminder"
			:class="{ 'auth-reminder--warn': isQuotaLoaded && remainingQuota <= 0 }" @click="goToAuthPage">
			<view class="reminder-content">
				<uni-icons type="info-filled" size="18"
					:color="isQuotaLoaded && remainingQuota <= 0 ? '#D32F2F' : '#FF6F00'"></uni-icons>
				<text class="reminder-text" :class="{ 'reminder-text--warn': isQuotaLoaded && remainingQuota <= 0 }">
					{{ isQuotaLoaded && remainingQuota <= 0
						? '免实名次数已用完，继续发布请先完成实名认证'
						: '尚未实名认证，建议完成认证保障活动安全' }}
				</text>
			</view>
			<view class="reminder-action">
				<text>去认证</text>
				<uni-icons type="right" size="12"
					:color="isQuotaLoaded && remainingQuota <= 0 ? '#D32F2F' : '#FF6F00'"></uni-icons>
			</view>
		</view>

		<view class="main-scroll">
			<!-- ================== 1. 基本信息表单 ================== -->
			<view class="form-card">
				<view class="card-header">
					<view class="header-line"></view>
					<text class="header-title">基本信息</text>
				</view>

				<uni-forms :label-width="80" label-position="top" class="custom-forms">
					<!-- 聚会名称 -->
					<uni-forms-item label="聚会主题" required>
						<uni-easyinput v-model="form.activityTitle" placeholder="请输入聚会主题" :inputBorder="true"
							primaryColor="#FF6F00" :styles="inputStyles" :cursorSpacing="30" :adjustPosition="true" />
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

					<!-- 【优化1】聚会时间：监听用户主动修改 -->
					<uni-forms-item label="聚会时间" required>
						<view class="picker-trigger-box" @click="openPicker">
							<uni-datetime-picker type="datetimerange" v-model="timeRange" rangeSeparator=" 至 "
								@maskClick="closePicker" @change="onTimeRangeChange" />
						</view>

						<view class="time-preview-box" v-if="timeRange && timeRange.length === 2">
							<uni-icons type="calendar-filled" size="14" color="#FF6F00"></uni-icons>
							<text class="time-text">{{ timeRange[0] }} 至 {{ timeRange[1] }}</text>
						</view>
					</uni-forms-item>

					<!-- 【优化1】报名时间：监听用户主动修改 -->
					<uni-forms-item label="报名时间" required>
						<view class="picker-trigger-box" @click="openPicker">
							<uni-datetime-picker type="datetimerange" v-model="enrollTimeRange" rangeSeparator=" 至 "
								@maskClick="closePicker" @change="onEnrollTimeRangeChange" />
						</view>

						<view class="time-preview-box" v-if="enrollTimeRange && enrollTimeRange.length === 2">
							<uni-icons type="time-filled" size="14" color="#FF6F00"></uni-icons>
							<text class="time-text">{{ enrollTimeRange[0] }} 至 {{ enrollTimeRange[1] }}</text>
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

					<uni-forms-item label="单人费用" v-if="[1, 3].includes(form.activityFunds)" required>
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
			<view class="form-card" v-if="[2, 3].includes(form.activityFunds)">
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
						<uni-easyinput type="textarea" autoHeight v-model="form.activityDescription" maxlength="2000"
							placeholder="请输入聚会详细介绍，让大家更了解活动内容~" :inputBorder="true" :styles="inputStyles"
							:cursor-spacing="50" :adjust-position="true" />
					</uni-forms-item>
				</uni-forms>

				<view class="subsection-title">聚会环节</view>

				<view v-for="(item, index) in form.activitySessions" :key="item._id || index" class="session-card">
					<view class="session-header">
						<text class="session-index">环节 {{ index + 1 }}</text>
						<view class="session-del" @click="removeAgenda(index)">
							<uni-icons type="trash" size="16" color="#999"></uni-icons>
						</view>
					</view>
					<view class="session-inputs">
						<view class="native-input-wrapper mb-20">
							<input v-model="item.sessionTitle" placeholder="请输入环节标题" class="native-input"
								placeholder-class="input-placeholder" maxlength="200" />
						</view>
						<view class="native-input-wrapper">
							<textarea v-model="item.sessionDescription" placeholder="请输入环节描述" class="native-textarea"
								placeholder-class="input-placeholder" auto-height maxlength="800" :cursor-spacing="40"
								:adjust-position="true" />
						</view>
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
					<uni-forms-item label="收款码" v-if="[1, 3].includes(form.activityFunds)" required>
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
		</view>

		<!-- ============ 底部操作栏 ============ -->
		<view class="action-bar" :class="{ 'hidden': isPickerOpen }">
			<view v-if="mode === 'create'" class="action-btn save-btn" @click="saveDraft">
				<uni-icons type="download" size="16" color="#666"></uni-icons>
				<text>存草稿</text>
			</view>
			<view class="action-btn publish-btn" :class="{ 
			        'disabled': isPublishing || (mode === 'create' && isQuotaLoaded && remainingQuota <= 0) 
			    }" @click="handlePublishClick">
				<text v-if="isPublishing">处理中...</text>
				<text v-else-if="mode === 'edit'">保存修改</text>
				<text v-else>发起聚会</text>
			</view>
		</view>

		<!-- ============ 弹窗组件：赞助商编辑 ============ -->
		<sponsor-popup v-show="showSponsorPopup" :visible="showSponsorPopup" :data="currentSponsorData"
			@close="showSponsorPopup = false" @confirm="handleSponsorSave">
		</sponsor-popup>

		<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />

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
		nextTick,
		computed
	} from 'vue';
	import {
		onShow,
		onLoad,
		onReady,
		onUnload,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js';
	import {
		getInviteCode,
		isScenario3User
	} from '@/utils/user.js';
	import SponsorPopup from '@/components/sponsor-popup.vue';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';

	// ==============================================================================
	// 2. 状态定义 (State Definitions)
	// ==============================================================================

	const autoSaveTimer = ref(null);
	const lastAutoSaveTime = ref('');

	const DRAFT_STORAGE_KEY = 'activity_draft';
	const isUserVerified = ref(true);
	const isPublishing = ref(false);
	const mode = ref('create');
	const editActivityId = ref(null);
	const remainingQuota = ref(0);
	const isQuotaLoaded = ref(false);

	const smartGuidePopupRef = ref(null);

	const timeRange = ref([]);
	const enrollTimeRange = ref([]);
	const associatedStoreName = ref('');
	const tagOptions = ref([]);
	const enrollmentOptions = ref([{
			text: 'AA/付费',
			value: 1
		},
		{
			text: '赞助/免费',
			value: 2
		},
		{
			text: 'AA+赞助',
			value: 3
		}
	]);

	// 【优化1】标记用户是否手动选择过时间，初始化默认时间不算"已选"
	const isTimeRangeUserSelected = ref(false);
	const isEnrollTimeRangeUserSelected = ref(false);

	const form = ref({
		activityTitle: '',
		activityDescription: '',
		totalSlots: null,
		limitSlots: null,
		activityFunds: 1,
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
			_id: Date.now(),
			sessionTitle: '环节标题',
			sessionDescription: '环节描述'
		}]
	});

	const isSponsorExpanded = ref(false);
	const showSponsorPopup = ref(false);
	const sponsorsList = ref([]);
	const deletedSponsorIds = ref([]);
	const currentSponsorIndex = ref(-1);
	const currentSponsorData = ref(null);

	const isPickerOpen = ref(false);
	const inputStyles = ref({
		color: '#333',
		borderColor: '#dcdfe6',
		disableColor: '#f5f7fa'
	});

	const openPicker = () => {
		isPickerOpen.value = true;
	};
	const closePicker = () => {
		setTimeout(() => {
			isPickerOpen.value = false;
		}, 100);
	};

	// 【优化1】用户主动选择时间后，标记为已选，并关闭 picker
	const onTimeRangeChange = () => {
		isTimeRangeUserSelected.value = true;
		closePicker();
	};
	const onEnrollTimeRangeChange = () => {
		isEnrollTimeRangeUserSelected.value = true;
		closePicker();
	};

	// ==============================================================================
	// 3. 生命周期 (Lifecycle Hooks)
	// ==============================================================================
	onMounted(() => {
		checkUserVerificationStatus();
		getActiveType();
	});

	onShow(() => {
		if (uni.getStorageSync('token')) {
			checkPublishQuota();
		}
	});

	onLoad(async (options) => {
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
			const hasDraft = loadDraft();
			if (!hasDraft) initDefaultTimes();
		}

		if (options && options.storeId && options.storeName) {
			form.value.associatedStoreId = options.storeId;
			associatedStoreName.value = decodeURIComponent(options.storeName);
		}

		uni.$on('shopSelected', (shop) => {
			form.value.associatedStoreId = shop.id;
			associatedStoreName.value = shop.storeName;
		});
	});

	onReady(() => {
		// 页面加载完了，用户可以开始写内容了，此时弹出引导
		if (isScenario3User()) {
			smartGuidePopupRef.value?.open();
		}
	});

	onUnload(() => {
		uni.$off('shopSelected');
		if (autoSaveTimer.value) clearTimeout(autoSaveTimer.value);
	});

	watch([timeRange, enrollTimeRange], () => {
		isPickerOpen.value = false;
	});

	// 监听所有关键数据，自动保存草稿
	watch(
		[form, timeRange, enrollTimeRange, sponsorsList, associatedStoreName],
		() => {
			triggerAutoSave();
		}, {
			deep: true
		}
	);

	// ==============================================================================
	// 4. 工具与辅助方法 (Utils & Helpers)
	// ==============================================================================

	// 自动保存方法（复用 saveDraft 的逻辑，但不弹 Toast）
	const autoSaveDraft = () => {
		if (mode.value !== 'create') return; // 编辑模式不自动保存草稿

		const draft = {
			form: form.value,
			timeRange: timeRange.value,
			enrollTimeRange: enrollTimeRange.value,
			associatedStoreName: associatedStoreName.value,
			sponsorsList: sponsorsList.value,
			savedAt: Date.now()
		};
		uni.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(draft));

		const now = new Date();
		const pad = n => n.toString().padStart(2, '0');
		lastAutoSaveTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	};

	// 防抖自动保存（3秒无操作后触发）
	const triggerAutoSave = () => {
		if (mode.value !== 'create') return;
		if (autoSaveTimer.value) clearTimeout(autoSaveTimer.value);
		autoSaveTimer.value = setTimeout(() => {
			autoSaveDraft();
		}, 500);
	};

	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const d = new Date(Number(ts));
		const pad = (n) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	};

	const initDefaultTimes = () => {
		const now = new Date();
		const day =
			`${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;
		enrollTimeRange.value = [`${day} 09:00:00`, `${day} 18:00:00`];
		timeRange.value = [`${day} 19:00:00`, `${day} 21:00:00`];
		// 默认时间不算用户手动选择
		isTimeRangeUserSelected.value = false;
		isEnrollTimeRangeUserSelected.value = false;
	};

	/**
	 * 检查实名认证状态
	 * 调用 /app-api/member/user/get 获取最新数据，避免缓存过期问题
	 * 同时顺手更新本地缓存，保持数据一致
	 * idCert: 1 = 已实名，0 = 未认证
	 */
	const checkUserVerificationStatus = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/get', {
				method: 'GET'
			});
			if (!error && data) {
				// 更新本地缓存，保持数据最新
				uni.setStorageSync('userInfo', JSON.stringify(data));
				isUserVerified.value = data.idCert === 1;
			} else {
				// 接口失败时降级读缓存
				const cached = uni.getStorageSync('userInfo');
				if (cached) {
					try {
						isUserVerified.value = JSON.parse(cached).idCert === 1;
					} catch (e) {
						isUserVerified.value = true;
					}
				} else {
					isUserVerified.value = true; // 完全无数据时不拦截
				}
			}
		} catch (e) {
			console.error('获取用户实名状态失败:', e);
			isUserVerified.value = true; // 网络异常时不拦截，让后端兜底
		}
	};

	// 【Bug1】跳转实名认证页
	const goToAuthPage = () => {
		uni.navigateTo({
			url: '/packages/my-auth/my-auth'
		});
	};

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

	const uploadCover = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];
				// #ifdef MP-WEIXIN
				wx.cropImage({
					src: tempFilePath,
					cropScale: '4:3',
					success: (cropRes) => {
						processUpload(cropRes.tempFilePath);
					},
					fail: (err) => {
						console.log('用户取消裁剪或失败:', err);
					}
				});
				// #endif
				// #ifndef MP-WEIXIN
				processUpload(tempFilePath);
				// #endif
			}
		});
	};

	const processUpload = async (filePath) => {
		uni.showLoading({
			title: '上传中...'
		});
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'cover'
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
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				uni.showLoading({
					title: '正在上传...',
					mask: true
				});
				try {
					const uploadPromises = res.tempFiles.map(file => uploadFile({
						path: file.path
					}, {
						directory: 'gallery'
					}));
					const results = await Promise.all(uploadPromises);
					const successfulUrls = results.filter(res => res.data).map(res => res.data);
					if (successfulUrls.length > 0) {
						form.value.activityCoverImageUrls.push(...successfulUrls);
					}
					if (successfulUrls.length < res.tempFiles.length) {
						uni.showToast({
							title: '部分图片上传失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: '上传出错',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			fail: (err) => {
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

	const addAgenda = () => {
		form.value.activitySessions.push({
			_id: Date.now() + Math.random(),
			sessionTitle: '',
			sessionDescription: ''
		});
	};
	const removeAgenda = (i) => form.value.activitySessions.splice(i, 1);

	// ==============================================================================
	// 6. 赞助商管理逻辑 (Sponsor Logic)
	// ==============================================================================

	const handleAddSponsor = () => {
		currentSponsorIndex.value = -1;
		currentSponsorData.value = null;
		showSponsorPopup.value = true;
	};

	const handleEditSponsor = (index) => {
		currentSponsorIndex.value = index;
		currentSponsorData.value = sponsorsList.value[index];
		nextTick(() => {
			showSponsorPopup.value = true;
		});
	};

	const handleDeleteSponsor = (index) => {
		uni.showModal({
			title: '提示',
			content: '确定移除该赞助商吗？',
			success: (res) => {
				if (res.confirm) {
					const item = sponsorsList.value[index];
					if (item.id) deletedSponsorIds.value.push(item.id);
					sponsorsList.value.splice(index, 1);
				}
			}
		});
	};

	const handleSponsorSave = (data) => {
		if (currentSponsorIndex.value === -1) {
			sponsorsList.value.push(data);
		} else {
			sponsorsList.value.splice(currentSponsorIndex.value, 1, data);
		}
		showSponsorPopup.value = false;
	};

	const syncSponsorsInline = async (activityId) => {
		const userId = uni.getStorageSync('userId');
		for (const id of deletedSponsorIds.value) {
			await request(`/app-api/member/sponsor/delete?id=${id}`, {
				method: 'DELETE'
			});
		}
		sponsorsList.value.forEach((item, index) => item.displaySort = index);
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
				if (d.sponsorsList) sponsorsList.value = d.sponsorsList;
				// 草稿恢复的时间视为已选（用户之前填过）
				isTimeRangeUserSelected.value = !!(d.timeRange && d.timeRange.length);
				isEnrollTimeRangeUserSelected.value = !!(d.enrollTimeRange && d.enrollTimeRange.length);
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

		if (dictRes && !dictRes.error && dictRes.data) {
			tagOptions.value = dictRes.data.map(item => ({
				value: item.value,
				text: item.label
			}));
		}

		if (detailRes.error || !detailRes.data) {
			uni.showToast({
				title: '加载活动详情失败',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
			return;
		}

		const data = detailRes.data;
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
		form.value.activityCoverImageUrls = (data.activityCoverImageUrls && data.activityCoverImageUrls.length >
				0) ?
			data.activityCoverImageUrls : [];

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

		if (data.startDatetime && data.endDatetime) {
			timeRange.value = [formatTimestamp(data.startDatetime), formatTimestamp(data.endDatetime)];
		}
		if (data.registrationStartDatetime && data.registrationEndDatetime) {
			enrollTimeRange.value = [formatTimestamp(data.registrationStartDatetime), formatTimestamp(data
				.registrationEndDatetime)];
		}
		// 编辑模式回显的时间视为已选
		isTimeRangeUserSelected.value = true;
		isEnrollTimeRangeUserSelected.value = true;

		if (data.memberStoreRespVO) {
			form.value.associatedStoreId = data.memberStoreRespVO.id;
			associatedStoreName.value = data.memberStoreRespVO.storeName;
		}

		if (data.memberActivitySessionList && data.memberActivitySessionList.length > 0) {
			form.value.activitySessions = data.memberActivitySessionList.map(item => ({
				_id: item.id,
				sessionTitle: item.sessionTitle,
				sessionDescription: item.sessionDescription
			}));
		}

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
					gallery = [];
				}
				return {
					...item,
					galleryImageUrls: gallery
				};
			});
		} else {
			sponsorsList.value = [];
		}
	};

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
			remainingQuota.value = typeof data === 'number' ? data : 0;
			isQuotaLoaded.value = true;
		} catch (e) {
			console.error('获取权益网络异常', e);
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
						url: '/packages/recharge/recharge?type=membership'
					});
				}
			}
		});
	};

	const handlePublishClick = () => {
		uni.hideKeyboard(); // 发起前主动收起键盘，防止弹窗错位
		if (mode.value === 'create' && isQuotaLoaded.value && remainingQuota.value == 0) {
			showQuotaExceededModal();
			return;
		}
		publish();
	};

	// --- 7.3 发布/保存流程 ---
	const publish = async () => {
		if (isPublishing.value) return;

		if (!form.value.activityTitle) return uni.showToast({
			title: '标题必填',
			icon: 'none'
		});
		if (!form.value.tag) return uni.showToast({
			title: '类型必选',
			icon: 'none'
		});
		if (!form.value.locationAddress) return uni.showToast({
			title: '地点必填',
			icon: 'none'
		});

		const needsFee = [1, 3].includes(form.value.activityFunds);
		if (needsFee) {
			if (!form.value.registrationFee) return uni.showToast({
				title: '请输入单人费用',
				icon: 'none'
			});
			if (!form.value.organizerPaymentQrCodeUrl) return uni.showToast({
				title: '请上传收款码',
				icon: 'none'
			});
		}

		// 【优化1】判断用户是否手动选择过时间
		if (!isTimeRangeUserSelected.value) {
			uni.showModal({
				title: '请确认聚会时间',
				content: '检测到您使用的是系统默认时间，请先手动选择实际的聚会时间后再发布。',
				showCancel: false,
				confirmText: '去选择'
			});
			return;
		}
		if (!isEnrollTimeRangeUserSelected.value) {
			uni.showModal({
				title: '请确认报名时间',
				content: '检测到您使用的是系统默认时间，请先手动选择实际的报名时间后再发布。',
				showCancel: false,
				confirmText: '去选择'
			});
			return;
		}
		if (!timeRange.value.length || !enrollTimeRange.value.length) {
			return uni.showToast({
				title: '时间必填',
				icon: 'none'
			});
		}

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
			delete payload.companyName;
			delete payload.companyLogo;
			if (payload.activityFunds === 2) {
				delete payload.registrationFee;
				delete payload.organizerPaymentQrCodeUrl;
			}

			let finalActivityId = null;

			if (mode.value === 'edit') {
				payload.id = editActivityId.value;
				const res = await request('/app-api/member/activity/edit', {
					method: 'POST',
					data: payload
				});
				if (res.error) throw new Error(
					typeof res.error === 'object' ? (res.error.msg || res.error.message || JSON.stringify(
						res.error)) : res.error
				);
				finalActivityId = editActivityId.value;
			} else {
				const res = await request('/app-api/member/activity/create', {
					method: 'POST',
					data: payload
				});
				if (res.error) throw new Error(
					typeof res.error === 'object' ? (res.error.msg || res.error.message || JSON.stringify(
						res.error)) : res.error
				);
				finalActivityId = res.data;
			}

			if (finalActivityId) {
				await syncSponsorsInline(finalActivityId);
			}

			if (mode.value === 'create') uni.removeStorageSync(DRAFT_STORAGE_KEY);

			// 发送全局信号，通知列表页数据变了
			uni.$emit('refreshActivityList');

			uni.showModal({
				title: '成功',
				content: '发布完成',
				showCancel: false,
				success: () => uni.navigateBack({
					delta: 1
				})
			});

		} catch (e) {
			console.error('发布失败:', e);

			const errMsg = e.message || String(e) || '系统异常，请稍后重试';

			// 所有后端错误统一用 showModal 完整展示，不截断、不做关键词分流
			// 如果是实名相关错误，增加"去认证"按钮；否则只有"我知道了"
			const isAuthError = errMsg.includes('实名') || errMsg.includes('认证') || errMsg.includes('idCert');
			uni.showModal({
				title: isAuthError ? '需要实名认证' : '发布失败',
				content: errMsg,
				confirmText: isAuthError ? '去认证' : '我知道了',
				showCancel: isAuthError,
				cancelText: '稍后再说',
				confirmColor: '#FF6F00',
				success: (res) => {
					if (isAuthError && res.confirm) {
						uni.navigateTo({
							url: '/packages/my-auth/my-auth'
						});
					}
				}
			});
		} finally {
			isPublishing.value = false;
			uni.hideLoading();
		}
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF6F00;
	$bg-color: #f5f7fa;
	$card-bg: #ffffff;
	$border-color: #e5e5e5;
	$text-main: #333333;
	$text-sub: #666666;
	$input-border: #dcdfe6;

	/* 优化：主滚动容器底部间距，确保不被操作栏遮挡 */
	.main-scroll {
		padding-bottom: 200rpx; // 增加间距
	}

	/* 优化：表单项间距，防止键盘弹起时太挤 */
	:deep(.uni-forms-item) {
		margin-bottom: 30rpx !important;
	}

	/* 解决 textarea 在某些机型下的层级穿透问题 */
	.native-textarea {
		width: 100%;
		font-size: 14px;
		color: #333;
		padding: 10px 0;
		min-height: 80rpx;
		line-height: 1.5;
		z-index: 1;
	}

	.page {
		min-height: 100vh;
		background-color: $bg-color;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.main-content {
		padding-bottom: 120rpx;
	}

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

	.auth-reminder {
		margin: 24rpx 24rpx 0;
		padding: 20rpx 24rpx;
		background: #FFF8E1;
		border-radius: 16rpx;
		border: 1px solid #FFE0B2;
		display: flex;
		justify-content: space-between;
		align-items: center;

		// 次数用完时变红色警告样式
		&--warn {
			background: #FFF1F0;
			border-color: #FFCCC7;
		}

		.reminder-content {
			display: flex;
			align-items: center;
			gap: 12rpx;
		}

		.reminder-text {
			font-size: 26rpx;
			color: #FF8F00;

			&--warn {
				color: #D32F2F;
			}
		}

		.reminder-action {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: $theme-color;
			font-weight: bold;
		}
	}

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

	.cover-upload-box {
		width: 100%;
		aspect-ratio: 5 / 4;
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
		overflow: hidden;
		display: block;
		position: relative;
		z-index: 1;
	}

	.custom-picker-box {
		width: 100%;
		height: 72rpx;
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
		}
	}

	.picker-trigger-box {
		position: relative;

		:deep(.uni-date-x--border) {
			border: 1px solid $input-border !important;
			border-radius: 8rpx !important;
			height: 72rpx !important;
			box-sizing: border-box;
		}

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

	.time-preview-box {
		margin-top: 16rpx;
		background-color: #FFF5EE;
		border-radius: 12rpx;
		padding: 12rpx 20rpx;
		display: flex;
		align-items: center;
		border: 1rpx solid rgba(255, 111, 0, 0.1);

		.time-text {
			font-size: 24rpx;
			color: #FF6F00;
			margin-left: 10rpx;
			font-weight: 500;
			line-height: 1.4;
		}
	}

	.row-inputs {
		display: flex;
		gap: 24rpx;

		.half-item {
			flex: 1;
			min-width: 0;
		}
	}

	.mb-20 {
		margin-bottom: 20rpx;
	}

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

	.subsection-title {
		font-size: 30rpx;
		font-weight: bold;
		color: $text-main;
		margin: 20rpx 0;
		padding-left: 10rpx;
		border-left: 6rpx solid $theme-color;
	}

	.native-input-wrapper {
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		padding: 0 10px;
		background-color: #fff;
	}

	.native-input {
		height: 36px;
		font-size: 14px;
		color: #333;
		width: 100%;
	}

	// .native-textarea {
	// 	width: 100%;
	// 	font-size: 14px;
	// 	color: #333;
	// 	padding: 10px 0;
	// 	min-height: 40px;
	// 	line-height: 1.5;
	// }

	::v-deep .input-placeholder {
		color: #999;
		font-size: 14px;
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
				color: #999;
				box-shadow: none;
			}
		}
	}

	:deep(.uni-datetime-picker--popup),
	:deep(.uni-date-range-popup) {
		z-index: 99999 !important;
		position: fixed !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
	}

	:deep(.uni-mask),
	:deep(.uni-date-mask) {
		z-index: 99998 !important;
	}

	.action-bar {
		z-index: 99;
	}
</style>