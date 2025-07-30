<template>
	<view class="edit-store-container" v-if="!isLoading">
		<scroll-view scroll-y class="form-scroll-view">
			<!-- 表单区域 -->
			<view class="form-wrapper">

				<!-- 聚店名称 -->
				<view class="form-group">
					<label class="form-label">聚店名称</label>
					<uni-easyinput v-model="form.storeName" placeholder="请输入聚店名称" :inputBorder="false" />
				</view>

				<!-- 聚店封面 -->
				<view class="form-group">
					<label class="form-label">聚店封面</label>
					<view class="image-uploader">
						<image :src="form.storeCoverImageUrl || '/static/images/placeholder-cover.png'" class="preview-image"
							mode="aspectFill" @click="handleImageUpload('cover')"></image>
						<view class="upload-tip">点击图片可更换封面</view>
					</view>
				</view>

				<!-- 聚店地址 -->
				<view class="form-group">
					<label class="form-label">聚店地址</label>
					<view class="location-picker" @click="openMapToChooseLocation">
						<text class="location-text">{{ form.fullAddress || '点击选择位置' }}</text>
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</view>

				<!-- 聚店简介 -->
				<view class="form-group">
					<label class="form-label">聚店简介</label>
					<uni-easyinput type="textarea" v-model="form.storeDescription" placeholder="请输入聚店简介"
						:inputBorder="false" />
				</view>
				
				<!-- 营业时间编辑区域 -->
				<view class="form-group">
					<label class="form-label">营业时间</label>
					<view class="hours-editor">
						<view class="hours-section-title">常规营业</view>
						<view v-for="(day, index) in editableHours.regular" :key="index" class="day-item">
							<text class="day-label">{{ day.label }}</text>
							<view class="day-controls">
								<picker v-if="day.isOpen" mode="time" :value="day.openTime" @change="e => day.openTime = e.detail.value">
									<view class="time-picker">{{ day.openTime }}</view>
								</picker>
								<text v-if="day.isOpen" class="time-separator">-</text>
								<picker v-if="day.isOpen" mode="time" :value="day.closeTime" @change="e => day.closeTime = e.detail.value">
									<view class="time-picker">{{ day.closeTime }}</view>
								</picker>
								<switch :checked="day.isOpen" @change="e => day.isOpen = e.detail.value" color="#FF6B00" style="transform:scale(0.8)" />
							</view>
						</view>
					</view>
					
					<!-- ================== 【新增】特殊营业时间编辑模块 ================== -->
						<view class="hours-editor special-hours-section">
							<view class="hours-section-title">
								<text>特殊营业时间</text>
								<button class="add-btn" size="mini" @click="addSpecialHour">+ 添加</button>
							</view>
							
							<view v-if="editableHours.special.length === 0" class="no-special-hours">
								<text>暂无特殊营业安排</text>
							</view>
					
							<view v-for="(specialDay, index) in editableHours.special" :key="index" class="special-day-item">
								<!-- 第一行：日期、开关、删除按钮 -->
								<view class="special-day-row">
									<picker mode="date" :value="specialDay.date" @change="e => specialDay.date = e.detail.value">
										<view class="date-picker">
											<uni-icons type="calendar-filled" size="16" color="#666"></uni-icons>
											<text>{{ specialDay.date || '选择日期' }}</text>
										</view>
									</picker>
									<view class="special-controls">
										<text class="switch-label">营业</text>
										<switch :checked="specialDay.is_open" @change="e => specialDay.is_open = e.detail.value" color="#FF6B00" style="transform:scale(0.7)" />
										<uni-icons type="trash-filled" size="22" color="#e43d33" @click="removeSpecialHour(index)"></uni-icons>
									</view>
								</view>
								
								<!-- 第二行：时间选择器 (如果营业) -->
								<view v-if="specialDay.is_open" class="special-day-row">
									<picker mode="time" :value="specialDay.open" @change="e => specialDay.open = e.detail.value">
										<view class="time-picker special-time-picker">{{ specialDay.open }}</view>
									</picker>
									<text class="time-separator">-</text>
									<picker mode="time" :value="specialDay.close" @change="e => specialDay.close = e.detail.value">
										<view class="time-picker special-time-picker">{{ specialDay.close }}</view>
									</picker>
								</view>
								
								<!-- 第三行：备注说明 -->
								<view class="special-day-row">
									<uni-easyinput
										v-model="specialDay.description"
										placeholder="备注说明 (如：跨年夜延长)"
										:inputBorder="false"
										class="description-input"
									/>
								</view>
							</view>
						</view>
						<!-- ============================================================= -->
				</view>

				<!-- 聚店电话 -->
				<view class="form-group">
					<label class="form-label">联系电话</label>
					<uni-easyinput type="text" v-model="form.contactPhone" placeholder="请输入联系电话" :inputBorder="false" />
				</view>
				
				<!-- 人均消费 -->
				<view class="form-group">
					<label class="form-label">人均消费</label>
					<uni-easyinput type="text" v-model="form.averageConsumptionRange" placeholder="例如：100-200" :inputBorder="false" />
				</view>

				<!-- 微信二维码 -->
				<view class="form-group">
					<label class="form-label">微信二维码</label>
					<view class="image-uploader">
						<image :src="form.contactWechatQrCodeUrl || '/static/images/placeholder-qr.png'" class="preview-image qr-code"
							mode="aspectFit" @click="handleImageUpload('wechat')"></image>
						<view class="upload-tip">点击图片可更换二维码</view>
					</view>
				</view>
				
			</view>
		</scroll-view>

		<!-- 底部提交按钮 -->
		<view class="action-bar">
			<button class="submit-btn" @click="handleSubmit" :loading="isSubmitting" :disabled="isSubmitting">
				{{ isSubmitting ? '提交中...' : '提交审核' }}
			</button>
		</view>

	</view>
	<!-- 全屏加载状态 -->
	<view v-else class="loading-state">
		<uni-icons type="spinner-cycle" size="30" color="#999"></uni-icons>
		<text>正在加载聚店信息...</text>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	const isLoading = ref(true);
	const isSubmitting = ref(false);

	// 表单主数据模型
	const form = ref({
		id: null,
		storeName: '',
		storeCoverImageUrl: '',
		category: '',
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

	// 用于编辑营业时间的独立、响应式数据结构
	const editableHours = reactive({
		regular: [],
		special: []
	});
	
	// 定义星期顺序和标签，便于渲染
	const weekdays = [
		{ key: 'monday', label: '周一' },
		{ key: 'tuesday', label: '周二' },
		{ key: 'wednesday', label: '周三' },
		{ key: 'thursday', label: '周四' },
		{ key: 'friday', label: '周五' },
		{ key: 'saturday', label: '周六' },
		{ key: 'sunday', label: '周日' },
	];

	/**
	 * 获取聚店详情并填充表单
	 * @param {string} storeId - 聚店ID
	 */
	const getStoreDetails = async (storeId) => {
		isLoading.value = true;
		const { data, error } = await request('/app-api/member/store/findStore', {
			method: 'GET',
			data: { id: storeId }
		});
		
		isLoading.value = false;

		if (error) {
			uni.showToast({ title: `加载失败: ${error}`, icon: 'none' });
			return;
		}

		Object.assign(form.value, data);
		parseOperatingHours(data.operatingHours);
	};
	
	onLoad(async (options) => {
		const storeId = options.id;
		if (!storeId) {
			uni.showToast({ title: '无效的聚店ID', icon: 'error' });
			uni.navigateBack();
			return;
		}
		await getStoreDetails(storeId);
	});
	
	/**
	 * 解析营业时间JSON字符串为UI可用的数据结构
	 * @param {string} jsonString - 后端返回的 operatingHours 字符串
	 */
	const parseOperatingHours = (jsonString) => {
		try {
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
			
			// 【优化】确保 special_dates 数组中的每个对象都包含所有必要的字段
			editableHours.special = (data.special_dates || []).map(d => ({
				date: d.date || '',
				is_open: d.is_open ?? true, // 如果后端没给，默认是营业
				open: d.open || '10:00',
				close: d.close || '22:00',
				description: d.description || ''
			}));
			
		} catch (e) {
			console.error("解析营业时间失败，将使用默认值:", e);
			// 初始化常规时间 (保持不变)
			editableHours.regular = weekdays.map(dayInfo => ({
				key: dayInfo.key,
				label: dayInfo.label,
				isOpen: true,
				openTime: '09:00',
				closeTime: '22:00',
			}));
			// 初始化特殊时间为空数组
			editableHours.special = [];
		}
	};
	
	// 【新增】添加一条特殊营业时间记录
	const addSpecialHour = () => {
	    // 获取 YYYY-MM-DD 格式的今天日期作为默认值
		const today = new Date().toISOString().split('T')[0];
		editableHours.special.push({
			date: today,
			is_open: true,
			open: '10:00',
			close: '22:00',
			description: ''
		});
	};
	
	// 【新增】根据索引删除一条特殊营业时间记录
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
	
	/**
	 * 将UI上的营业时间数据序列化为后端需要的JSON字符串
	 * @returns {string} - 格式化后的JSON字符串
	 */
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

	/**
	 * 处理图片上传（封面或二维码）
	 * @param {'cover' | 'wechat'} type - 上传的图片类型
	 */
	const handleImageUpload = (type) => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const tempFilePath = res.tempFilePaths[0];
				
				uni.showLoading({ title: '上传中...' });
				const { data: fileUrl, error } = await uploadFile(tempFilePath);
				uni.hideLoading();

				if (error) {
					uni.showToast({ title: `上传失败: ${error}`, icon: 'none' });
					return;
				}

				if (type === 'cover') {
					form.value.storeCoverImageUrl = fileUrl;
				} else if (type === 'wechat') {
					form.value.contactWechatQrCodeUrl = fileUrl;
				}
				uni.showToast({ title: '上传成功', icon: 'success' });
			}
		});
	};
	
	/**
	 * 打开地图选择位置
	 */
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			latitude: form.value.latitude,
			longitude: form.value.longitude,
			success: (res) => {
				form.value.fullAddress = res.address;
				form.value.longitude = res.longitude;
				form.value.latitude = res.latitude;
			},
			fail: (err) => {
				if (!err.errMsg.includes('cancel')) {
					uni.showToast({ title: '选择位置失败', icon: 'none' });
				}
			}
		});
	};

	/**
	 * 提交表单
	 */
	const handleSubmit = async () => {
		if (!form.value.storeName.trim()) {
			return uni.showToast({ title: '请输入聚店名称', icon: 'none' });
		}
		if (!form.value.fullAddress) {
			return uni.showToast({ title: '请选择聚店地址', icon: 'none' });
		}
		
		isSubmitting.value = true;
		
		const operatingHoursJson = serializeOperatingHours();
		
		const payload = {
			...form.value,
			operatingHours: operatingHoursJson,
		};
		
		const { error } = await request('/app-api/member/store/update', {
			method: 'POST',
			data: payload
		});
		
		isSubmitting.value = false;

		if (error) {
			uni.showToast({ title: `修改失败: ${error}`, icon: 'none', duration: 2000 });
		} else {
			uni.showToast({ title: '修改成功，等待审核', icon: 'none' });
			
			const pages = getCurrentPages();
			if (pages.length > 1) {
				const prevPage = pages[pages.length - 2];
				if (prevPage && typeof prevPage.handleRefresh === 'function') {
					prevPage.handleRefresh();
				}
			}
			
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	};
</script>

<style lang="scss" scoped>
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