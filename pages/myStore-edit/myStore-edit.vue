<template>
	<!-- UI 结构完全不用变 -->
	<view class="edit-store-container" v-if="!isLoading">
		<scroll-view scroll-y class="form-scroll-view">
			<view class="form-wrapper">
				<view class="form-group">
					<label class="form-label">聚店名称</label>
					<uni-easyinput v-model="form.storeName" placeholder="请输入聚店名称" :inputBorder="false" />
				</view>

				<!-- 【新增】聚店分类 -->
				<view class="form-group">
					<label class="form-label">聚店类别</label>
					<picker mode="selector" :range="categoryOptions"
						:value="categoryOptions.indexOf(categoryMap[form.category])" @change="handleCategoryChange">
						<view class="location-picker">
							<text class="location-text">{{ categoryMap[form.category] || '请选择聚店类别' }}</text>
							<uni-icons type="right" size="16" color="#999"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-group">
					<label class="form-label">聚店封面</label>
					<view class="image-uploader">
						<image :src="form.storeCoverImageUrl || '/static/images/placeholder-cover.png'"
							class="preview-image" mode="aspectFill" @click="handleImageUpload('cover')"></image>
						<view class="upload-tip">点击图片可更换封面（建议上传横图）</view>
					</view>
				</view>
				<view class="form-group">
					<label class="form-label">聚店地址</label>
					<view class="location-picker" @click="openMapToChooseLocation">
						<text class="location-text">{{ form.fullAddress || '点击选择位置' }}</text>
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</view>
				<view class="form-group">
					<label class="form-label">聚店简介</label>
					<uni-easyinput type="textarea" v-model="form.storeDescription" placeholder="请输入聚店简介"
						:inputBorder="false" />
				</view>
				<view class="form-group">
					<label class="form-label">营业时间</label>
					<view class="hours-editor">
						<view class="hours-section-title">常规营业</view>
						<view v-for="(day, index) in editableHours.regular" :key="index" class="day-item">
							<text class="day-label">{{ day.label }}</text>
							<view class="day-controls">
								<picker v-if="day.isOpen" mode="time" :value="day.openTime"
									@change="e => day.openTime = e.detail.value">
									<view class="time-picker">{{ day.openTime }}</view>
								</picker>
								<text v-if="day.isOpen" class="time-separator">-</text>
								<picker v-if="day.isOpen" mode="time" :value="day.closeTime"
									@change="e => day.closeTime = e.detail.value">
									<view class="time-picker">{{ day.closeTime }}</view>
								</picker>
								<switch :checked="day.isOpen" @change="e => day.isOpen = e.detail.value" color="#FF6B00"
									style="transform:scale(0.8)" />
							</view>
						</view>
					</view>
					<view class="hours-editor special-hours-section">
						<view class="hours-section-title">
							<text>特殊营业时间</text>
							<button class="add-btn" size="mini" @click="addSpecialHour">+ 添加</button>
						</view>
						<view v-if="editableHours.special.length === 0" class="no-special-hours">
							<text>暂无特殊营业安排</text>
						</view>
						<view v-for="(specialDay, index) in editableHours.special" :key="index"
							class="special-day-item">
							<view class="special-day-row">
								<picker mode="date" :value="specialDay.date"
									@change="e => specialDay.date = e.detail.value">
									<view class="date-picker">
										<uni-icons type="calendar-filled" size="16" color="#666"></uni-icons>
										<text>{{ specialDay.date || '选择日期' }}</text>
									</view>
								</picker>
								<view class="special-controls">
									<text class="switch-label">营业</text>
									<switch :checked="specialDay.is_open"
										@change="e => specialDay.is_open = e.detail.value" color="#FF6B00"
										style="transform:scale(0.7)" />
									<uni-icons type="trash-filled" size="22" color="#e43d33"
										@click="removeSpecialHour(index)"></uni-icons>
								</view>
							</view>
							<view v-if="specialDay.is_open" class="special-day-row">
								<picker mode="time" :value="specialDay.open"
									@change="e => specialDay.open = e.detail.value">
									<view class="time-picker special-time-picker">{{ specialDay.open }}</view>
								</picker>
								<text class="time-separator">-</text>
								<picker mode="time" :value="specialDay.close"
									@change="e => specialDay.close = e.detail.value">
									<view class="time-picker special-time-picker">{{ specialDay.close }}</view>
								</picker>
							</view>
							<view class="special-day-row">
								<uni-easyinput v-model="specialDay.description" placeholder="备注说明 (如：跨年夜延长)"
									:inputBorder="false" class="description-input" />
							</view>
						</view>
					</view>
				</view>
				<view class="form-group">
					<label class="form-label">联系电话</label>
					<uni-easyinput type="text" v-model="form.contactPhone" placeholder="请输入联系电话" :inputBorder="false" />
				</view>
				<view class="form-group">
					<label class="form-label">人均消费</label>
					<uni-easyinput type="text" v-model="form.averageConsumptionRange" placeholder="例如：100-200"
						:inputBorder="false" />
				</view>
				<view class="form-group">
					<label class="form-label">微信二维码</label>
					<view class="image-uploader">
						<image :src="form.contactWechatQrCodeUrl || '/static/images/placeholder-qr.png'"
							class="preview-image qr-code" mode="aspectFit" @click="handleImageUpload('wechat')"></image>
						<view class="upload-tip">点击图片可更换二维码</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="action-bar">
			<button class="submit-btn" @click="handleSubmit" :loading="isSubmitting" :disabled="isSubmitting">
				{{ isSubmitting ? '提交中...' : (form.id ? '提交修改' : '申请上榜') }}
			</button>
		</view>
	</view>

	<view v-else class="loading-state">
		<uni-icons type="spinner-cycle" size="30" color="#999"></uni-icons>
		<text>正在加载...</text>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	// 【修改】您的项目可能是 upload.js，请确认文件名
	import uploadFile from '../../utils/upload.js';

	const isLoading = ref(true);
	const isSubmitting = ref(false);

	const form = ref({
		id: null,
		storeName: '',
		storeCoverImageUrl: '',
		category: '', // 默认为空
		fullAddress: '',
		longitude: null,
		latitude: null,
		storeDescription: '',
		operatingHours: '',
		contactPhone: '',
		contactWechatQrCodeUrl: '',
		averageConsumptionRange: '',
		tags: [],
	});

	// 聚店类别选项
	const categoryList = ref([]);
	const categoryOptions = computed(() => categoryList.value.map(item => item.label));
	const categoryMap = computed(() => {
		const map = {};
		categoryList.value.forEach(item => {
			map[item.value] = item.label; // 'bar' -> '酒吧'
		});
		return map;
	});

	// const categoryOptions = ['bar', 'food', 'ktv', 'billiards', 'other'];
	// const categoryMap = {
	// 	'bar': '酒吧',
	// 	'food': '美食',
	// 	'ktv': 'KTV',
	// 	'billiards': '台球',
	// 	'other': '其他'
	// };

	const editableHours = reactive({
		regular: [],
		special: []
	});

	const weekdays = [{
			key: 'monday',
			label: '周一'
		}, {
			key: 'tuesday',
			label: '周二'
		},
		{
			key: 'wednesday',
			label: '周三'
		}, {
			key: 'thursday',
			label: '周四'
		},
		{
			key: 'friday',
			label: '周五'
		}, {
			key: 'saturday',
			label: '周六'
		},
		{
			key: 'sunday',
			label: '周日'
		},
	];

	// 【核心修改】onLoad 逻辑调整
	onLoad(async (options) => {
		await getStoreCategories();
		const storeId = options.id;
		if (storeId) {
			// --- 修改模式 ---
			uni.setNavigationBarTitle({
				title: '修改聚店信息'
			});
			await getStoreDetails(storeId);
		} else {
			// --- 新建模式 ---
			uni.setNavigationBarTitle({
				title: '申请聚店入驻'
			});
			// 初始化一个空的表单，特别是营业时间
			parseOperatingHours(null);
			isLoading.value = false;
		}
	});

	const getStoreCategories = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: {
				type: "member_store_category" // 根据聚店列表页的经验，类型是这个
			}
		});

		if (error) {
			uni.showToast({
				title: '加载聚店类别失败',
				icon: 'none'
			});
			// 即使失败，也给一个空数组，防止页面崩溃
			categoryList.value = [];
			return;
		}

		if (data && Array.isArray(data)) {
			// 将接口返回的数据赋值给 categoryList
			categoryList.value = data;
			console.log('成功获取聚店类别:', categoryList.value);
		}
	};

	const getStoreDetails = async (storeId) => {
		isLoading.value = true;
		const {
			data,
			error
		} = await request('/app-api/member/store/findStore', {
			method: 'GET',
			data: {
				id: storeId
			}
		});

		isLoading.value = false;

		if (error) {
			uni.showToast({
				title: `加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}

		Object.assign(form.value, data);
		parseOperatingHours(data.operatingHours);
	};

	// 【核心修改】此函数现在能处理空数据，用于新建初始化
	const parseOperatingHours = (jsonString) => {
		try {
			// 如果 jsonString 无效或为空，会进入 catch 块
			const data = JSON.parse(jsonString)?.business_hours;
			if (!data || !data.regular) throw new Error("无效的营业时间格式");

			editableHours.regular = weekdays.map(dayInfo => {
				const dayData = data.regular[dayInfo.key];
				return {
					key: dayInfo.key,
					label: dayInfo.label,
					isOpen: dayData?.is_open ?? false,
					openTime: dayData?.open ?? '09:00',
					closeTime: dayData?.close ?? '22:00',
				};
			});

			editableHours.special = (data.special_dates || []).map(d => ({
				date: d.date || '',
				is_open: d.is_open ?? true,
				open: d.open || '10:00',
				close: d.close || '22:00',
				description: d.description || ''
			}));

		} catch (e) {
			// 当新建或解析失败时，提供默认的初始状态
			console.warn("解析营业时间失败或为新建状态，将使用默认值:", e.message);
			editableHours.regular = weekdays.map(dayInfo => ({
				key: dayInfo.key,
				label: dayInfo.label,
				isOpen: true,
				openTime: '09:00',
				closeTime: '22:00',
			}));
			editableHours.special = [];
		}
	};

	const addSpecialHour = () => {
		const today = new Date().toISOString().split('T')[0];
		editableHours.special.push({
			date: today,
			is_open: true,
			open: '10:00',
			close: '22:00',
			description: ''
		});
	};

	const removeSpecialHour = (index) => {
		uni.showModal({
			title: '确认删除',
			content: '您确定要删除这条特殊营业时间吗？',
			success: (res) => {
				if (res.confirm) {
					editableHours.special.splice(index, 1);
				}
			}
		});
	};

	const serializeOperatingHours = () => {
		const regularData = editableHours.regular.reduce((acc, day) => {
			acc[day.key] = {
				open: day.openTime,
				close: day.closeTime,
				is_open: day.isOpen
			};
			return acc;
		}, {});

		const dataToSerialize = {
			business_hours: {
				regular: regularData,
				special_dates: editableHours.special,
				timezone: "Asia/Shanghai"
			}
		};
		return JSON.stringify(dataToSerialize);
	};

	const handleImageUpload = (type) => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const tempFile = res.tempFiles[0];
				if (!tempFile) {
					uni.showToast({
						title: '选择图片失败，请重试',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '上传中...'
				});
				const {
					data: fileUrl,
					error
				} = await uploadFile(tempFile);
				uni.hideLoading();

				if (error) {
					uni.showToast({
						title: `上传失败: ${error}`,
						icon: 'none'
					});
					return;
				}

				if (type === 'cover') {
					form.value.storeCoverImageUrl = fileUrl;
				} else if (type === 'wechat') {
					form.value.contactWechatQrCodeUrl = fileUrl;
				}
				uni.showToast({
					title: '上传成功',
					icon: 'success'
				});
			}
		});
	};

	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			latitude: form.value.latitude,
			longitude: form.value.longitude,
			success: (res) => {
				form.value.fullAddress = res.address;
				form.value.longitude = res.longitude;
				form.value.latitude = res.latitude;
				// 【新增】自动将地图选择的地点名称填入聚店名称
				if (!form.value.storeName) {
					form.value.storeName = res.name;
				}
			}
		});
	};

	const handleCategoryChange = (e) => {
		const selectedIndex = e.detail.value;
		// 根据索引从原始列表中找到对应的项
		const selectedCategory = categoryList.value[selectedIndex];
		if (selectedCategory) {
			// 将 'bar' 这样的 value 赋给 form.category
			form.value.category = selectedCategory.value;
		}
	};

	// 【核心修改】提交逻辑调整
	const handleSubmit = async () => {
		// 表单校验
		if (!form.value.storeName.trim()) return uni.showToast({
			title: '请输入聚店名称',
			icon: 'none'
		});
		if (!form.value.category) return uni.showToast({
			title: '请选择聚店类别',
			icon: 'none'
		});
		if (!form.value.fullAddress) return uni.showToast({
			title: '请选择聚店地址',
			icon: 'none'
		});

		isSubmitting.value = true;

		// 准备要提交的数据
		const payload = {
			...form.value,
			operatingHours: serializeOperatingHours(),
		};

		// 根据 form.id 是否存在，决定调用哪个接口
		const isUpdate = !!form.value.id;
		const apiUrl = isUpdate ? '/app-api/member/store/update' : '/app-api/member/store/create';
		const successMsg = isUpdate ? '修改成功，等待审核' : '申请成功，等待审核';
		const errorMsgPrefix = isUpdate ? '修改失败: ' : '申请失败: ';

		// 【注意】如果是新建，确保不提交 id 字段
		if (!isUpdate) {
			delete payload.id;
		}

		const {
			error
		} = await request(apiUrl, {
			method: 'POST',
			data: payload
		});

		isSubmitting.value = false;

		if (error) {
			uni.showToast({
				title: `${errorMsgPrefix}${error}`,
				icon: 'none',
				duration: 2000
			});
		} else {
			uni.showToast({
				title: successMsg,
				icon: 'success'
			});

			// 尝试刷新上一页的数据
			const pages = getCurrentPages();
			if (pages.length > 1) {
				const prevPage = pages[pages.length - 2];
				if (prevPage && typeof prevPage.handleRefresh === 'function') {
					prevPage.handleRefresh();
				}
			}

			setTimeout(() => uni.navigateBack(), 1500);
		}
	};
</script>


<style lang="scss" scoped>
	/* 您的样式完全不用修改，这里只新增 .location-picker 的样式 */
	.edit-store-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f8f8f8;
	}

	.form-scroll-view {
		flex: 1;
		overflow-y: auto;
	}

	.form-wrapper {
		background-color: #fff;
	}

	.form-group {
		padding: 24rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		margin-left: 20rpx;
		margin-right: 20rpx;

		&:last-child {
			border-bottom: none;
		}
	}

	.form-label {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	:deep(.uni-easyinput__content-input),
	:deep(.uni-easyinput__content-textarea) {
		padding-left: 0 !important;
	}

	.image-uploader {
		.preview-image {
			width: 100%;
			height: 320rpx;
			border-radius: 16rpx;
			background-color: #f0f0f0;

			&.qr-code {
				width: 240rpx;
				height: 240rpx;
			}
		}

		.upload-tip {
			font-size: 24rpx;
			color: #999;
			text-align: center;
			margin-top: 10rpx;
		}
	}

	.location-picker {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background-color: #f7f7f7;
		border-radius: 12rpx;

		.location-text {
			flex: 1;
			color: #333;
			font-size: 28rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.hours-editor {
		padding-top: 20rpx;
	}

	.hours-section-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #666;
		margin-bottom: 20rpx;
	}

	.day-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.day-label {
		font-size: 28rpx;
		color: #333;
	}

	.day-controls {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.time-picker {
		background-color: #fff;
		border: 1rpx solid #e0e0e0;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 26rpx;
	}

	.time-separator {
		color: #999;
	}

	.action-bar {
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		border-top: 1rpx solid #f0f0f0;
	}

	.submit-btn {
		background-color: #FF6B00;
		color: #fff;
		font-size: 32rpx;
		font-weight: 500;
		border-radius: 50rpx;

		&::after {
			border: none;
		}
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		color: #999;
		font-size: 28rpx;

		text {
			margin-top: 10rpx;
		}
	}

	.special-hours-section {
		margin-top: 40rpx;
		border-top: 1rpx solid #f0f0f0;
		padding-top: 20rpx;
	}

	.hours-section-title {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.add-btn {
			background-color: #FF6B00;
			color: white;
			border-radius: 8rpx;
			font-weight: normal;
			line-height: 1.8;
			padding: 0 20rpx;
			margin: 0;
		}
	}

	.no-special-hours {
		text-align: center;
		color: #999;
		font-size: 26rpx;
		padding: 40rpx 0;
	}

	.special-day-item {
		padding: 24rpx 0;
		border-bottom: 1rpx dashed #e0e0e0;

		&:last-child {
			border-bottom: none;
		}
	}

	.special-day-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.date-picker {
		display: flex;
		align-items: center;
		gap: 10rpx;
		background-color: #f7f7f7;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
	}

	.special-controls {
		display: flex;
		align-items: center;
		gap: 20rpx;

		.switch-label {
			font-size: 26rpx;
			color: #666;
		}
	}

	.time-picker.special-time-picker {
		background-color: #f7f7f7;
		border: none;
		flex: 1;
		text-align: center;
	}

	.description-input {
		width: 100%;
		background-color: #f7f7f7;
		border-radius: 8rpx;

		:deep(.uni-easyinput__content-input) {
			padding: 16rpx !important;
		}
	}
</style>