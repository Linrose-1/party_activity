<template>
	<view class="page">
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
				<uni-forms-item label="聚会封面" required>
					<view class="cover-upload" @click="uploadCover">
						<image v-if="form.coverImageUrl" :src="form.coverImageUrl" mode="aspectFill"></image>
						<text v-else>点击上传封面图片</text>
					</view>
				</uni-forms-item>

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

				<uni-forms-item label="合作聚店" required :label-width="80">
					<view class="uni-list-cell-db">
						<view @click="goToSelectShop" class="uni-input">
							<text v-if="associatedStoreName">{{ associatedStoreName }}</text>
							<text v-else class="placeholder">点击选择合作店铺</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-forms-item>

				<!-- totalSlots -->
				<uni-forms-item label="人数上限" required>
					<uni-easyinput type="number" v-model="form.totalSlots" placeholder="超过人数上限,不能报名" />
				</uni-forms-item>

				<uni-forms-item label="起聚人数" required>
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
				<uni-forms-item label="收款码" required>
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
			<view class="action-btn save-btn" @click="saveDraft">保存草稿</view>
			<!-- 【优化】动态绑定 class 和文本内容 -->
			<view class="action-btn publish-btn" :class="{ 'disabled': isPublishing }" @click="publish">
				{{ isPublishing ? '发布中...' : '发起聚会' }}
			</view>
		</view>
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
		onUnload
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	onMounted(() => {
		getActiveType();
	});

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

	// 监听店铺选择结果
	onLoad(() => {
		// 1. 尝试从本地存储加载草稿数据
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
				// 如果没有草稿，设置一些默认值
				timeRange.value = ['2025-01-01 14:00:00', '2025-01-01 17:00:00'];
				enrollTimeRange.value = ['2025-01-01 14:00:00', '2025-01-01 17:00:00'];
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
	});

	onUnload(() => {
		uni.$off('shopSelected');
	});

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
				icon: 'success' // 使用成功图标
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
		if (!form.value.coverImageUrl) {
			uni.showToast({
				title: '请上传聚会封面',
				icon: 'none'
			});
			return;
		}
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
		if (!form.value.totalSlots || form.value.totalSlots <= 0) {
			uni.showToast({
				title: '请输入正确的总名额',
				icon: 'none'
			});
			return;
		}
		if (!form.value.limitSlots || form.value.limitSlots <= 0) {
			uni.showToast({
				title: '请输入正确的最低起聚名额',
				icon: 'none'
			});
			return;
		}
		// 【新增】逻辑验证：最低名额不能大于总名额
		if (parseInt(form.value.limitSlots) > parseInt(form.value.totalSlots)) {
			uni.showToast({
				title: '最低起聚名额不能大于总名额',
				icon: 'none'
			});
			return;
		}
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
		if (!form.value.organizerPaymentQrCodeUrl) {
			uni.showToast({
				title: '请上传收款码',
				icon: 'none'
			});
			return;
		}
		if (!form.value.associatedStoreId) {
			uni.showToast({
				title: '请选择合作店铺',
				icon: 'none'
			});
			return;
		}

		isPublishing.value = true;
		uni.showLoading({
			title: '正在处理...',
			mask: true
		});

		try {
			// --- 构建最终提交给后端的 payload (这部分逻辑保持不变) ---
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

			console.log('发布聚会 - 最终Payload:', payload);

			const success = await createActive(payload);

			if (success) {
				uni.removeStorageSync(DRAFT_STORAGE_KEY);
				console.log('聚会发布成功，草稿已清除。');
				uni.switchTab({
					url: '/pages/active/active'
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
			uni.showToast({
				title: '聚会发布成功！',
				icon: 'success'
			});
			return true; // 返回 true 表示成功
		}
		// 如果请求失败或后端返回了业务错误
		else {
			console.log('请求失败:', result.error);
			// 【修正 Bug 1】显示后端返回的错误信息，并给用户足够的时间阅读
			uni.showToast({
				title: result.error || '发布失败，请检查填写内容', // 优先使用后端返回的错误
				icon: 'none',
				duration: 3000 // 延长提示时间
			});
			return false; // 返回 false 表示失败
		}
	};
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
	
	.form-bottom{
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

	/* 【新增】这个类用于在 picker 打开时降低操作栏的层级 */
	.action-bar.z-index-low {
		z-index: 1;
		/* 或者 z-index: auto; */
	}

	.action-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
		/* 让按钮在视觉和行为上都真正被禁用 */
	}
</style>