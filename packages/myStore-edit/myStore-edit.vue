<template>
	<view class="page-container" v-if="!isLoading">
		<scroll-view scroll-y class="content-scroll">
			<view class="content-wrapper">

				<!-- 卡片 1: 基础信息 -->
				<view class="card-box">
					<view class="card-header">基础信息</view>

					<view class="field-item">
						<text class="field-label required">聚店名称</text>
						<view class="input-wrapper">
							<uni-easyinput v-model="form.storeName" placeholder="请输入聚店名称" :inputBorder="false"
								:styles="{backgroundColor: 'transparent'}"
								placeholderStyle="color:#bbb;font-size:28rpx;" />
						</view>
					</view>

					<view class="field-item">
						<text class="field-label required">聚店类别</text>
						<picker mode="selector" :range="categoryOptions"
							:value="categoryOptions.indexOf(categoryMap[form.category])" @change="handleCategoryChange">
							<view class="picker-wrapper">
								<text :class="['picker-text', form.category ? 'is-value' : 'is-placeholder']">
									{{ categoryMap[form.category] || '请选择聚店类别' }}
								</text>
								<uni-icons type="right" size="14" color="#ccc"></uni-icons>
							</view>
						</picker>
					</view>
				</view>

				<!-- 卡片 2: 封面图 (拖拽区域) -->
				<view class="card-box">
					<view class="card-header">
						<text>聚店图集</text>
						<text class="sub-header">最多9张，长按拖拽排序</text>
					</view>

					<view class="uploader-wrapper">
						<DragImageUploader v-model="coverImages" :max-count="9" @add-image="handleCoverImageUpload" />
					</view>

					<view class="form-tip">
						<uni-icons type="info" size="14" color="#FF9800"></uni-icons>
						建议首图使用4:3 比例，将作为分享封面展示。
					</view>
				</view>

				<!-- 卡片 3: 地址与简介 -->
				<view class="card-box">
					<view class="field-item">
						<text class="field-label required">聚店地址</text>
						<view class="picker-wrapper location-btn" @click="openMapToChooseLocation">
							<view class="location-content">
								<uni-icons type="location-filled" size="18" color="#FF6B00"
									style="margin-right: 8rpx;"></uni-icons>
								<text :class="['picker-text', form.fullAddress ? 'is-value' : 'is-placeholder']">
									{{ form.fullAddress || '点击在地图上选择' }}
								</text>
							</view>
							<uni-icons type="right" size="14" color="#ccc"></uni-icons>
						</view>
					</view>

					<view class="field-item no-border">
						<text class="field-label">聚店简介</text>
						<view class="textarea-wrapper">
							<uni-easyinput type="textarea" v-model="form.storeDescription"
								placeholder="请简要介绍您的店铺特色、服务内容等..." :inputBorder="false"
								:styles="{backgroundColor: 'transparent'}"
								placeholderStyle="color:#bbb;font-size:28rpx;" />
						</view>
					</view>
				</view>

				<!-- 卡片 4: 营业时间 -->
				<view class="card-box">
					<view class="card-header">营业时间</view>

					<!-- 常规时间 -->
					<view class="hours-group">
						<view v-for="(day, index) in editableHours.regular" :key="index" class="hour-row">
							<text class="week-label">{{ day.label }}</text>
							<view class="hour-controls">
								<template v-if="day.isOpen">
									<picker mode="time" :value="day.openTime"
										@change="e => day.openTime = e.detail.value">
										<view class="time-pill">{{ day.openTime }}</view>
									</picker>
									<text class="to-text">至</text>
									<picker mode="time" :value="day.closeTime"
										@change="e => day.closeTime = e.detail.value">
										<view class="time-pill">{{ day.closeTime }}</view>
									</picker>
								</template>
								<text v-else class="closed-text">休息</text>
								<switch :checked="day.isOpen" @change="e => day.isOpen = e.detail.value" color="#FF6B00"
									style="transform:scale(0.7); margin-left: 10rpx;" />
							</view>
						</view>
					</view>

					<!-- 特殊时间 -->
					<view class="special-hours-group">
						<view class="special-header">
							<text>特殊日期安排</text>
							<view class="add-special-btn" @click="addSpecialHour">
								<uni-icons type="plusempty" size="12" color="#FF6B00"></uni-icons> 添加
							</view>
						</view>

						<view v-if="editableHours.special.length === 0" class="empty-special">
							暂无特殊安排
						</view>

						<view v-for="(specialDay, index) in editableHours.special" :key="index" class="special-item">
							<view class="special-top">
								<picker mode="date" :value="specialDay.date"
									@change="e => specialDay.date = e.detail.value">
									<view class="date-pill">
										<uni-icons type="calendar" size="14" color="#666"></uni-icons>
										{{ specialDay.date || '选择日期' }}
									</view>
								</picker>
								<view class="special-actions">
									<text style="font-size: 24rpx; color: #666; margin-right: 10rpx;">营业</text>
									<switch :checked="specialDay.is_open"
										@change="e => specialDay.is_open = e.detail.value" color="#FF6B00"
										style="transform:scale(0.6)" />
									<view class="del-special" @click="removeSpecialHour(index)">
										<uni-icons type="trash" size="16" color="#999"></uni-icons>
									</view>
								</view>
							</view>

							<view v-if="specialDay.is_open" class="special-time-row">
								<picker mode="time" :value="specialDay.open"
									@change="e => specialDay.open = e.detail.value">
									<view class="time-pill small">{{ specialDay.open }}</view>
								</picker>
								<text class="to-text">-</text>
								<picker mode="time" :value="specialDay.close"
									@change="e => specialDay.close = e.detail.value">
									<view class="time-pill small">{{ specialDay.close }}</view>
								</picker>
								<input class="special-note" v-model="specialDay.description" placeholder="备注: 如节日" />
							</view>
						</view>
					</view>
				</view>

				<!-- 卡片 5: 其他信息 -->
				<view class="card-box">
					<view class="card-header">其他设置</view>

					<view class="field-item">
						<text class="field-label">联系电话</text>
						<view class="input-wrapper">
							<uni-easyinput type="number" v-model="form.contactPhone" placeholder="请输入电话"
								:inputBorder="false" :styles="{backgroundColor: 'transparent'}" />
						</view>
					</view>

					<view class="field-item">
						<text class="field-label">人均消费</text>
						<view class="input-wrapper">
							<uni-easyinput type="text" v-model="form.averageConsumptionRange" placeholder="如: 100-200"
								:inputBorder="false" :styles="{backgroundColor: 'transparent'}" />
						</view>
					</view>

					<view class="field-item no-border">
						<text class="field-label">微信二维码</text>
						<view class="qr-upload-area" @click="handleImageUpload('wechat')">
							<image v-if="form.contactWechatQrCodeUrl" :src="form.contactWechatQrCodeUrl"
								class="qr-preview" mode="aspectFit"></image>
							<view v-else class="qr-placeholder">
								<uni-icons type="scan" size="30" color="#ccc"></uni-icons>
								<text>点击上传</text>
							</view>
						</view>
					</view>
				</view>

				<view class="bottom-spacer"></view>
			</view>
		</scroll-view>

		<!-- 底部按钮 -->
		<view class="footer-bar">
			<button class="main-btn" @click="handleSubmit" :loading="isSubmitting" :disabled="isSubmitting">
				{{ isSubmitting ? '正在提交...' : (form.id ? '保存修改' : '自荐聚店') }}
			</button>
		</view>
	</view>

	<!-- 加载动画 -->
	<view v-else class="page-loading">
		<uni-icons type="spinner-cycle" size="40" color="#ccc" class="spin-icon"></uni-icons>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		watch,
		nextTick
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
		storeCoverImageUrls: '',
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

	// 一个专门用于UI绑定的图片数组
	const coverImages = ref([]);

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

	// onLoad 逻辑调整
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
		if (!error) {
			Object.assign(form.value, data);
			parseOperatingHours(data.operatingHours);

			// 从新的 storeCoverImageUrls 字段解析图片
			if (data.storeCoverImageUrls && Array.isArray(data.storeCoverImageUrls)) {
				coverImages.value = data.storeCoverImageUrls;
			}
		}

		// Object.assign(form.value, data);
		// parseOperatingHours(data.operatingHours);
	};

	// 此函数现在能处理空数据，用于新建初始化
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

	// 封面图上传相关函数
	const handleCoverImageUpload = () => {
		// 检查数量是否已满
		if (coverImages.value.length >= 9) return;

		uni.chooseImage({
			count: 9 - coverImages.value.length,
			success: async (res) => {
				uni.showLoading({
					title: '上传中...'
				});

				const uploadPromises = res.tempFiles.map(file => uploadFile(file, {
					directory: 'store-cover'
				}));
				const results = await Promise.all(uploadPromises);

				uni.hideLoading();

				const successfulUrls = results.filter(r => r.data).map(r => r.data);

				// 直接 push 到数组，组件会自动响应
				coverImages.value.push(...successfulUrls);

				if (results.some(r => r.error)) {
					uni.showToast({
						title: '部分上传失败',
						icon: 'none'
					});
				}
			}
		});
	};

	// const deleteCoverImage = (index) => {
	// 	coverImages.value.splice(index, 1);
	// };

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

	//提交逻辑调整
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
		if (coverImages.value.length === 0) {
			return uni.showToast({
				title: '请至少上传一张聚店封面',
				icon: 'none'
			});
		}


		isSubmitting.value = true;

		// 准备要提交的数据
		const payload = {
			...form.value,
			storeCoverImageUrls: coverImages.value,
			operatingHours: serializeOperatingHours(),
		};
		// payload.storeCoverImageUrl = coverImages.value[0];

		// 根据 form.id 是否存在，决定调用哪个接口
		const isUpdate = !!form.value.id;
		const apiUrl = isUpdate ? '/app-api/member/store/update' : '/app-api/member/store/create';
		const successMsg = isUpdate ? '修改成功，等待审核' : '申请成功，等待审核';
		const errorMsgPrefix = isUpdate ? '修改失败: ' : '申请失败: ';

		//如果是新建，确保不提交 id 字段
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

	/* ========================================  图片拖拽移动编辑 ======================================== */

	// // --- 拖拽排序逻辑 (从发布页复制过来的) ---
	// const dragDisplayList = ref([]);
	// const dragItemWidth = ref(0);
	// const dragItemHeight = ref(0);
	// const dragAreaHeight = ref(0);
	// const isDragging = ref(false);
	// const dragIndex = ref(-1);
	// const dragColumns = 3;
	// const dragItemHeightRpx = 210; // 可以微调高度

	// // 1. 初始化尺寸
	// const initDragLayout = () => {
	// 	const sys = uni.getSystemInfoSync();
	// 	// 假设左右 padding 各 20rpx + form-group margin 20rpx -> 总共约 80rpx
	// 	// 这里的减数要根据你的页面实际 padding 来定，宁大勿小
	// 	const containerWidth = sys.windowWidth - uni.upx2px(100);

	// 	dragItemWidth.value = containerWidth / dragColumns;
	// 	dragItemHeight.value = uni.upx2px(dragItemHeightRpx);
	// };

	// // 2. 初始化列表 (监听 coverImages)
	// watch(() => coverImages.value, (newVal) => {
	// 	if (!isDragging.value) {
	// 		initDragList(newVal);
	// 	}
	// }, {
	// 	deep: true
	// });

	// // 在 onLoad 或 onMounted 里初始化一次
	// // 注意：如果你的图片是异步获取的(编辑模式)，getStoreDetails 赋值后 watch 会自动触发
	// // 但如果是新建模式，可能需要手动调一次 initDragLayout
	// // 建议在 onLoad 结束时调用一下 initDragLayout()

	// const initDragList = (originList) => {
	// 	if (!originList || originList.length === 0) {
	// 		dragDisplayList.value = [];
	// 		dragAreaHeight.value = 0; // 确保没图片时高度为0
	// 		return;
	// 	}
	// 	if (dragItemWidth.value === 0) initDragLayout();

	// 	dragDisplayList.value = originList.map((url, index) => {
	// 		const {
	// 			x,
	// 			y
	// 		} = getPos(index);
	// 		return {
	// 			id: `img_${index}_${Math.random()}`,
	// 			data: url,
	// 			x,
	// 			y,
	// 			zIndex: 1,
	// 			realIndex: index
	// 		};
	// 	});
	// 	updateDragHeight();
	// };

	// const getPos = (index) => {
	// 	const row = Math.floor(index / dragColumns);
	// 	const col = index % dragColumns;
	// 	return {
	// 		x: col * dragItemWidth.value,
	// 		y: row * dragItemHeight.value
	// 	};
	// };

	// const updateDragHeight = () => {
	// 	const count = dragDisplayList.value.length;
	// 	const rows = Math.ceil(count / dragColumns);
	// 	dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
	// };

	// // --- 拖拽事件 ---
	// const onMovableStart = (index) => {
	// 	isDragging.value = true;
	// 	dragIndex.value = index;
	// 	dragDisplayList.value[index].zIndex = 99;
	// };

	// const onMovableChange = (e, index) => {
	// 	if (!isDragging.value || index !== dragIndex.value) return;
	// 	const x = e.detail.x;
	// 	const y = e.detail.y;

	// 	const centerX = x + dragItemWidth.value / 2;
	// 	const centerY = y + dragItemHeight.value / 2;
	// 	const col = Math.floor(centerX / dragItemWidth.value);
	// 	const row = Math.floor(centerY / dragItemHeight.value);
	// 	let targetIndex = row * dragColumns + col;

	// 	if (targetIndex < 0) targetIndex = 0;
	// 	if (targetIndex >= dragDisplayList.value.length) targetIndex = dragDisplayList.value.length - 1;

	// 	if (targetIndex !== dragIndex.value) {
	// 		const mover = dragDisplayList.value[dragIndex.value];
	// 		dragDisplayList.value.splice(dragIndex.value, 1);
	// 		dragDisplayList.value.splice(targetIndex, 0, mover);

	// 		dragDisplayList.value.forEach((item, idx) => {
	// 			if (idx !== targetIndex) {
	// 				const pos = getPos(idx);
	// 				item.x = pos.x;
	// 				item.y = pos.y;
	// 			}
	// 		});
	// 		dragIndex.value = targetIndex;
	// 	}
	// };

	// const onMovableEnd = () => {
	// 	isDragging.value = false;
	// 	if (dragIndex.value !== -1) {
	// 		const item = dragDisplayList.value[dragIndex.value];
	// 		item.zIndex = 1;
	// 		const pos = getPos(dragIndex.value);
	// 		nextTick(() => {
	// 			item.x = pos.x;
	// 			item.y = pos.y;
	// 		});

	// 		// 同步回 coverImages
	// 		const sortedUrls = dragDisplayList.value.map(wrapper => wrapper.data);
	// 		coverImages.value = sortedUrls;
	// 	}
	// 	dragIndex.value = -1;
	// };

	// // 补充预览方法
	// const previewCoverImage = (index) => {
	// 	uni.previewImage({
	// 		urls: coverImages.value,
	// 		current: index
	// 	});
	// };
</script>


<style lang="scss" scoped>
	/* 全局颜色变量 */
	$primary-color: #FF6B00;
	$bg-color: #f5f7fa;
	$card-bg: #ffffff;
	$text-main: #333333;
	$text-sub: #666666;
	$text-placeholder: #bbbbbb;
	$border-color: #f0f0f0;
	$input-bg: #f9f9f9;

	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $bg-color;
	}

	.content-scroll {
		flex: 1;
		height: 0;
	}

	.content-wrapper {
		padding: 24rpx;
	}

	/* 通用卡片样式 */
	.card-box {
		background-color: $card-bg;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
		position: relative;
		/* 建立层叠上下文 */
		z-index: 1;
	}

	.card-header {
		font-size: 32rpx;
		font-weight: 700;
		color: $text-main;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.sub-header {
			font-size: 24rpx;
			color: $text-placeholder;
			font-weight: normal;
		}
	}

	.uploader-wrapper {
		width: 100%;
		min-height: 200rpx;
		/* 最小高度，防止未加载时完全塌陷 */
		overflow: hidden;
		/* 触发 BFC，清除浮动，防止子元素外溢 */
		display: block;
		position: relative;
		z-index: 1;
		margin-bottom: 20rpx;
		/* 与下方的提示语拉开间距 */
	}

	/* 表单项样式 */
	.field-item {
		margin-bottom: 30rpx;

		&.no-border {
			margin-bottom: 0;
		}
	}

	.field-label {
		display: block;
		font-size: 28rpx;
		color: $text-main;
		font-weight: 500;
		margin-bottom: 16rpx;

		&.required::after {
			content: '*';
			color: #ff4d4f;
			margin-left: 4rpx;
		}
	}

	/* 输入框容器（胶囊风格） */
	.input-wrapper {
		background-color: $input-bg;
		border-radius: 12rpx;
		padding: 4rpx 20rpx;
		border: 2rpx solid transparent;
		transition: border-color 0.3s;

		&:focus-within {
			border-color: rgba($primary-color, 0.3);
			background-color: #fff;
		}
	}

	/* 选择器容器 */
	.picker-wrapper {
		background-color: $input-bg;
		border-radius: 12rpx;
		padding: 24rpx 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		&.location-btn:active {
			background-color: #f0f0f0;
		}
	}

	.picker-text {
		font-size: 28rpx;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		&.is-value {
			color: $text-main;
		}

		&.is-placeholder {
			color: $text-placeholder;
		}
	}

	.location-content {
		display: flex;
		align-items: center;
		flex: 1;
		overflow: hidden;
	}

	.textarea-wrapper {
		background-color: $input-bg;
		border-radius: 12rpx;
		padding: 20rpx;
		min-height: 180rpx;
	}

	/* ---------------- 拖拽区域优化 ---------------- */
	// .drag-wrapper-box {
	// 	width: 100%;
	// 	position: relative;
	// 	overflow: hidden;
	// 	/* 关键：防止遮挡上方元素 */
	// 	/* background: #fafafa; 可选调试背景 */
	// }

	// .drag-area {
	// 	width: 100%;
	// }

	// .drag-item {
	// 	/* z-index: 10; movable-view 默认 */
	// }

	// .item-inner {
	// 	width: 100%;
	// 	height: 100%;
	// 	padding: 10rpx;
	// 	box-sizing: border-box;
	// 	display: block;
	// }

	// .image-box {
	// 	width: 100%;
	// 	height: 100%;
	// 	position: relative;
	// 	border-radius: 12rpx;
	// 	overflow: hidden;
	// 	background-color: #f0f0f0;
	// }

	// .img-content {
	// 	position: absolute;
	// 	top: 0;
	// 	left: 0;
	// 	width: 100%;
	// 	height: 100%;
	// 	display: block;
	// }

	// .del-btn {
	// 	position: absolute;
	// 	top: 0;
	// 	right: 0;
	// 	width: 44rpx;
	// 	height: 44rpx;
	// 	background-color: rgba(0, 0, 0, 0.5);
	// 	border-bottom-left-radius: 12rpx;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// 	z-index: 2;
	// }

	// .add-btn-container {
	// 	width: 33.33%;
	// 	height: 210rpx;
	// 	padding: 10rpx;
	// 	box-sizing: border-box;
	// 	display: inline-block;
	// 	vertical-align: top;
	// }

	// .add-box {
	// 	width: 100%;
	// 	height: 100%;
	// 	border: 2rpx dashed #ddd;
	// 	border-radius: 12rpx;
	// 	display: flex;
	// 	flex-direction: column;
	// 	align-items: center;
	// 	justify-content: center;
	// 	color: $text-placeholder;
	// 	font-size: 24rpx;
	// 	background-color: #fafafa;

	// 	text {
	// 		margin-top: 10rpx;
	// 	}
	// }

	.form-tip {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #FF9800;
		background-color: #fff7e6;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		line-height: 1.4;
	}

	/* ---------------- 营业时间 ---------------- */
	.hour-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f9f9f9;

		&:last-child {
			border-bottom: none;
		}
	}

	.week-label {
		font-size: 28rpx;
		color: $text-main;
		width: 80rpx;
	}

	.hour-controls {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: flex-end;
	}

	.time-pill {
		background-color: $input-bg;
		padding: 6rpx 20rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: $text-main;
		min-width: 90rpx;
		text-align: center;
	}

	.to-text {
		color: #ccc;
		margin: 0 10rpx;
	}

	.closed-text {
		color: $text-placeholder;
		font-size: 26rpx;
		margin-right: 10rpx;
	}

	/* 特殊营业时间 */
	.special-hours-group {
		margin-top: 30rpx;
		border-top: 2rpx dashed #eee;
		padding-top: 20rpx;
	}

	.special-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		color: $text-main;
		margin-bottom: 20rpx;
	}

	.add-special-btn {
		color: $primary-color;
		display: flex;
		align-items: center;
		font-size: 26rpx;
		padding: 6rpx 16rpx;
		background-color: rgba($primary-color, 0.1);
		border-radius: 30rpx;
	}

	.empty-special {
		text-align: center;
		color: #ccc;
		font-size: 24rpx;
		padding: 20rpx 0;
	}

	.special-item {
		background-color: #f9f9f9;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 16rpx;
	}

	.special-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.date-pill {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 26rpx;
		color: $text-main;
		background: #fff;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		border: 1rpx solid #eee;
	}

	.special-actions {
		display: flex;
		align-items: center;
	}

	.del-special {
		margin-left: 20rpx;
		padding: 10rpx;
	}

	.special-time-row {
		display: flex;
		align-items: center;
	}

	.time-pill.small {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		background: #fff;
		border: 1rpx solid #eee;
	}

	.special-note {
		flex: 1;
		font-size: 24rpx;
		background: #fff;
		margin-left: 16rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		border: 1rpx solid #eee;
	}

	/* 二维码上传 */
	.qr-upload-area {
		width: 100%;
		height: 300rpx;
		border: 2rpx dashed #ddd;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $input-bg;
		overflow: hidden;
	}

	.qr-preview {
		width: 100%;
		height: 100%;
	}

	.qr-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 26rpx;

		text {
			margin-top: 10rpx;
		}
	}

	.bottom-spacer {
		height: 120rpx;
	}

	/* 底部悬浮 */
	.footer-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		box-sizing: border-box;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.main-btn {
		background: linear-gradient(135deg, #FF8C37, #FF6B00);
		color: #fff;
		border-radius: 50rpx;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 32rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 20rpx rgba(255, 106, 0, 0.3);

		&::after {
			border: none;
		}

		&:active {
			opacity: 0.9;
		}

		&[disabled] {
			background: #ccc;
			box-shadow: none;
			color: #fff;
		}
	}

	.page-loading {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
	}

	.spin-icon {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>