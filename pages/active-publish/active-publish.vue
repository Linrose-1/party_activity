<template>
	<view class="page">
		<!-- 表单内容 -->
		<view class="form-section">
			<view class="section-title">基本信息</view>

			<uni-forms>
				<!-- activityTitle -->
				<uni-forms-item label="活动标题" required>
					<uni-easyinput v-model="form.activityTitle" placeholder="请输入活动标题" />
				</uni-forms-item>

				<!-- tags (原 activityType) -->
				<uni-forms-item label="活动类型" required>
					<uni-data-select v-model="form.tag" :localdata="tagOptions" placeholder="请选择活动类型"></uni-data-select>
				</uni-forms-item>

				<!-- coverImageUrl -->
				<uni-forms-item label="活动封面" required>
					<view class="cover-upload" @click="uploadCover">
						<image v-if="form.coverImageUrl" :src="form.coverImageUrl" mode="aspectFill"></image>
						<text v-else>点击上传封面图片</text>
					</view>
				</uni-forms-item>

				<!-- startDatetime & endDatetime (由 time 数组驱动) -->
				<uni-forms-item label="活动时间" required>
					<uni-datetime-picker type="datetimerange" v-model="timeRange" rangeSeparator="至" />
				</uni-forms-item>

				<!-- registrationStartDatetime & registrationEndDatetime (由 enrollTime 数组驱动) -->
				<uni-forms-item label="报名时间" required>
					<uni-datetime-picker type="datetimerange" v-model="enrollTimeRange" rangeSeparator="至" />
				</uni-forms-item>

				<!-- locationAddress, longitude, latitude -->
				<uni-forms-item label="活动地点" required>
					<view class="uni-list-cell-db">
						<view @click="openMapToChooseLocation" class="uni-input">
							<text v-if="form.locationAddress">{{ form.locationAddress }}</text>
							<text v-else class="placeholder">点击选择位置</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-forms-item>

				<!-- totalSlots -->
				<uni-forms-item label="总名额" required>
					<uni-easyinput type="number" v-model="form.totalSlots" placeholder="请输入活动总名额" />
				</uni-forms-item>

				<!-- activityFunds -->
				<uni-forms-item label="报名类型" required>
					<uni-data-checkbox v-model="form.activityFunds" :localdata="enrollmentOptions"
						mode="button"></uni-data-checkbox>
				</uni-forms-item>

				<!-- registrationFee (当 activityFunds 为 1 'AA') -->
				<uni-forms-item label="预报名费用 (元)" v-if="form.activityFunds === 1" required>
					<uni-easyinput type="digit" v-model="form.registrationFee" placeholder="请输入预报名费用" />
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
			<view class="section-title">活动详情</view>
			<!-- activityDescription -->
			<uni-forms-item label="活动介绍" required>
				<uni-easyinput type="textarea" autoHeight v-model="form.activityDescription" placeholder="请输入活动详细介绍" />
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
				<uni-icons type="plusempty" /><text>添加活动环节</text>
			</view>
		</view>

		<view class="form-section">
			<view class="section-title">组织者信息</view>

			<uni-forms>
				<!-- organizerUnitName -->
				<uni-forms-item label="组织单位" required>
					<uni-easyinput v-model="form.organizerUnitName" placeholder="请输入组织单位名称" />
				</uni-forms-item>

				<!-- organizerContactPhone -->
				<uni-forms-item label="联系电话" required>
					<uni-easyinput type="number" v-model="form.organizerContactPhone" placeholder="请输入联系电话" />
				</uni-forms-item>

				<!-- organizerPaymentQrCodeUrl -->
				<uni-forms-item label="收款码上传">
					<view class="cover-upload" @click="uploadCode">
						<image v-if="form.organizerPaymentQrCodeUrl" :src="form.organizerPaymentQrCodeUrl"
							mode="aspectFit"></image>
						<text v-else>点击上传收款码图片</text>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="form-section">
			<view class="section-title">商圈信息</view>
			<!-- associatedStoreId -->
			<uni-forms-item label="合作店铺" required>
				<view class="uni-list-cell-db">
					<view @click="goToSelectShop" class="uni-input">
						<text v-if="associatedStoreName">{{ associatedStoreName }}</text>
						<text v-else class="placeholder">点击选择合作店铺</text>
						<text class="arrow">></text>
					</view>
				</view>
			</uni-forms-item>
		</view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<view class="action-btn save-btn" @click="saveDraft">保存草稿</view>
			<view class="action-btn publish-btn" @click="publish">发布活动</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onLoad,
		onUnload
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	onMounted(() => {
		getActiveType();
	});

	// 用于UI组件绑定的时间范围数组
	const timeRange = ref(['2025-07-19 14:00:00', '2025-07-19 17:00:00']);
	const enrollTimeRange = ref(['2025-07-15 14:00:00', '2025-07-18 17:00:00']);

	// 用于显示合作店铺名称，不提交给后端
	const associatedStoreName = ref('');

	// 表单数据模型，字段名与后端API完全对应
	const form = ref({
		activityTitle: '互联网创业者交流会',
		activityDescription: '本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。...',
		totalSlots: 50,
		activityFunds: 1, // 1: AA, 2: 赞助
		registrationFee: 100,
		companyName: '',
		companyLogo: '',
		locationAddress: '', // 由地图选择填充
		latitude: null, // 由地图选择填充
		longitude: null, // 由地图选择填充
		coverImageUrl: '',
		organizerUnitName: '创新科技活动策划部',
		organizerContactPhone: '021-68881234',
		organizerPaymentQrCodeUrl: '',
		associatedStoreId: null, // 由店铺选择页面填充
		tag: '交流会', // 这是UI选择的单值，提交时会放入`tags`数组
		activitySessions: [{
				sessionTitle: '主题演讲',
				sessionDescription: '行业大咖分享创业经验'
			},
			{
				sessionTitle: '圆桌论坛',
				sessionDescription: '创业者互动讨论'
			},
			{
				sessionTitle: '自由交流',
				sessionDescription: '拓展人脉资源'
			}
		],
	});

	// 活动类型/标签选项
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
	function uploadCover() {
		uni.chooseImage({
			count: 1,
			success: res => form.value.coverImageUrl = res.tempFilePaths[0]
		});
	}

	function uploadCode() {
		uni.chooseImage({
			count: 1,
			success: res => form.value.organizerPaymentQrCodeUrl = res.tempFilePaths[0]
		});
	}

	function uploadSponsorLogo() {
		uni.chooseImage({
			count: 1,
			success: res => form.value.companyLogo = res.tempFilePaths[0]
		});
	}

	// 动态增删活动环节
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
		uni.$on('shopSelected', (shop) => {
			// **重要**: shop-list 页面需要返回一个包含 id 和 storeName 的对象
			console.log('接收到选择的店铺信息:', shop);
			form.value.associatedStoreId = shop.id;
			associatedStoreName.value = shop.storeName;
		});
	});

	onUnload(() => {
		uni.$off('shopSelected');
	});

	function saveDraft() {
		uni.showToast({
			title: '活动已保存为草稿',
			icon: 'none'
		});
		createActive()
		console.log('保存草稿:', form.value);

	}

	function publish() {
		// --- 表单验证 (使用新字段) ---
		if (!form.value.activityTitle) {
			uni.showToast({
				title: '请输入活动标题',
				icon: 'none'
			});
			return;
		}
		if (!form.value.tag) {
			uni.showToast({
				title: '请选择活动类型',
				icon: 'none'
			});
			return;
		}
		if (!form.value.coverImageUrl) {
			uni.showToast({
				title: '请上传活动封面',
				icon: 'none'
			});
			return;
		}
		if (!timeRange.value || timeRange.value.length !== 2) {
			uni.showToast({
				title: '请选择活动时间',
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
				title: '请选择活动地点',
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
				title: '请输入活动介绍',
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
		if (!form.value.associatedStoreId) {
			uni.showToast({
				title: '请选择合作店铺',
				icon: 'none'
			});
			return;
		}

		// --- 构建最终提交给后端的 payload ---
		const payload = JSON.parse(JSON.stringify(form.value));

		// 1. 【修改】处理时间范围，转换为毫秒时间戳
		// 使用 new Date(...).getTime() 将日期字符串转换为毫秒时间戳
		payload.startDatetime = new Date(timeRange.value[0]).getTime();
		payload.endDatetime = new Date(timeRange.value[1]).getTime();
		payload.registrationStartDatetime = new Date(enrollTimeRange.value[0]).getTime();
		payload.registrationEndDatetime = new Date(enrollTimeRange.value[1]).getTime();

		// 2. 【修改】处理活动类型 (category) 和标签 (tags)
		// 首先从 tagOptions 中找到当前选中的项
		const selectedTagOption = tagOptions.value.find(option => option.value === payload.tag);
		if (selectedTagOption) {
			// 【新增】将选中项的 value 赋值给 category
			payload.category = selectedTagOption.value;
			// 【修改】将选中项的 text 赋值给 tags 数组
			payload.tags = [selectedTagOption.text];
		} else {
			// 如果出于某种原因找不到，做一个降级处理，虽然在正常流程下不太可能发生
			payload.category = payload.tag;
			payload.tags = [payload.tag];
		}
		// 删除临时的 tag 字段，因为它已经被处理成 category 和 tags
		delete payload.tag;

		// 3. 处理活动环节，添加 sessionOrder
		payload.activitySessions = payload.activitySessions.map((session, index) => ({
			...session,
			sessionOrder: index + 1 // 顺序从1开始
		}));

		// 4. 清理AA或赞助模式下的多余字段
		if (payload.activityFunds === 1) { // AA 模式
			delete payload.companyName;
			delete payload.companyLogo;
		} else { // 赞助模式
			delete payload.registrationFee;
		}

		uni.showToast({
			title: '活动发布成功！',
			icon: 'success'
		});

		// 最终打印完全符合后端接口要求的 payload
		console.log('发布活动 - 最终Payload:', payload);

		// 在这里可以发起网络请求，将 payload 发送给后端
		// uni.request({ url: 'YOUR_API_ENDPOINT', method: 'POST', data: payload, ... })
		createActive(payload)
	}

	const createActive = async (payload) => {
		console.log("payload", payload)
		// 调用封装的请求方法
		const result = await request('/app-api/member/activity/create', {
			method: 'POST', // 请求方式
			data: payload
		});
		// 如果请求成功，打印返回的数据
		console.log('createActive result:', result);
		// 如果请求失败，打印错误信息
		if (result.error) {
			console.log('请求失败:', result.error);
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
		border: #ffe1d2 solid 1rpx;
		min-width: 500rpx;

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
</style>