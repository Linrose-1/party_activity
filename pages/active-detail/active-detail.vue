<template>
	<!-- 使用 v-if 确保在数据加载完成后再渲染主要内容，避免闪烁和错误 -->
	<view v-if="activityDetail" class="page">

		<!-- 活动封面 -->
		<!-- 【修改】动态绑定封面图片和标题 -->
		<view class="event-cover" :style="{ backgroundImage: `url(${activityDetail.coverImageUrl})` }">
			<!-- 【修改】动态绑定活动标签 -->
			<text class="event-cover-text">{{ activityDetail.tags.join(' · ') }}</text>
		</view>

		<!-- 【新增】活动状态显示 -->
		<view v-if="statusInfo.text" class="status-banner" :style="{ backgroundColor: statusInfo.color }">
			{{ statusInfo.text }}
		</view>

		<!-- 【新增】最低起聚名额提示 -->
		<view v-if="showLimitSlotsTip" class="limit-slots-tip">
			<uni-icons type="info-filled" color="#e6a23c" size="16" style="margin-right: 10rpx;"></uni-icons>
			当前报名人数未达到最低起聚名额 ({{ activityDetail.limitSlots }}人)，活动可能被取消。
		</view>

		<!-- 活动信息 -->
		<view class="event-header">
			<!-- 【修改】动态绑定活动标题 -->
			<text class="event-title">{{ activityDetail.activityTitle }}</text>
			<view class="event-meta">
				<uni-icons type="calendar" size="18" color="#FF6B00" />
				<!-- 【修改】动态绑定格式化后的活动时间 -->
				<text>{{ formattedActivityTime }}</text>
			</view>
			<view class="event-meta">
				<uni-icons type="location" size="18" color="#FF6B00" />
				<!-- 【修改】动态绑定活动地点 -->
				<text>{{ activityDetail.locationAddress }}</text>
			</view>
			<view class="event-stats">
				<view class="stat-item">
					<!-- 【修改】动态绑定已报名人数 -->
					<view class="stat-value">{{ activityDetail.joinCount || 0 }}</view>
					<view class="stat-label">已报名</view>
				</view>
				<view class="stat-item">
					<!-- 【修改】动态绑定总名额 -->
					<view class="stat-value">{{ activityDetail.totalSlots }}</view>
					<view class="stat-label">总名额</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">
						<!-- 【修改】根据 activityFunds 判断显示费用还是免费 -->
						<text v-if="activityDetail.activityFunds === 1">¥{{ activityDetail.registrationFee }}</text>
						<text v-else-if="activityDetail.activityFunds === 2">免费</text>
					</view>
					<view class="stat-label">报名费</view>
				</view>
			</view>
		</view>

		<!-- 活动介绍 -->
		<view class="event-content">
			<view class="section-title">活动介绍</view>
			<!-- 【修改】动态绑定活动介绍 -->
			<view class="event-description">{{ activityDetail.activityDescription }}</view>

			<text class="section-title">活动内容</text>
			<!-- 【修改】动态绑定活动环节 -->
			<view class="activity-grid">
				<view class="activity-item" v-for="item in activityDetail.memberActivitySessionList" :key="item.id">
					<view class="activity-title">{{ item.sessionTitle }}</view>
					<view class="activity-desc">{{ item.sessionDescription }}</view>
				</view>
			</view>
		</view>

		<!-- 主办方 -->
		<view class="organizer-section">
			<view class="organizer-title">活动组织者</view>
			<view class="organizer-info">
				<view class="organizer-avatar">
					<!-- <uni-icons type="person-filled" size="24" color="#fff" /> -->
					<img :src="activityDetail.memberUser.avatar" alt="" class="organizer-avatar"/>
				</view>
				<view>
					<!-- 【修改】动态绑定组织者单位 -->
					<view class="organizer-name">{{ activityDetail.memberUser.nickname }}</view>
					<!-- 【修改】动态绑定组织者联系电话 -->
					<view class="organizer-company">联系电话: {{ activityDetail.organizerContactPhone }}</view>
				</view>
			</view>
		</view>

		<!-- 商圈信息 -->
		<!-- 【修改】使用 v-if 判断是否存在关联聚店信息 -->
		<view v-if="activityDetail.memberStoreRespVO" class="business-section">
			<view class="business-title">活动聚店</view>
			<view class="business-info">
				<view class="business-logo">
					<!-- 【修改】可以使用聚店的封面图 -->
					<image v-if="activityDetail.memberStoreRespVO.storeCoverImageUrl"
						:src="activityDetail.memberStoreRespVO.storeCoverImageUrl" class="store-logo-image" />
					<uni-icons v-else type="shop-filled" size="24" color="#fff" />
				</view>
				<view class="business-details">
					<!-- 【修改】动态绑定聚店信息 -->
					<text class="business-name">{{ activityDetail.memberStoreRespVO.storeName }}</text>
					<view class="business-meta">
						<view style="font-size: 25rpx;margin: 10rpx 0;">📍
							{{ activityDetail.memberStoreRespVO.fullAddress }}
						</view>
						<view style="font-size: 25rpx;margin: 10rpx 0;">📞
							{{ activityDetail.memberStoreRespVO.contactPhone }}
						</view>
						<view style="font-size: 25rpx;margin: 10rpx 0;">🕒
							{{ activityDetail.memberStoreRespVO.operatingHours || '暂无营业时间' }}
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 活动贡分（暂时写死，如果后端有返回则替换） -->
		<view class="organizer-section">
			<view class="organizer-title">活动贡分</view>
			<view class="organizer-info">
				<view class="organizer-name">参与本次活动，活动结束可以获得<span style="color: #ff6b00;">10</span>贡分</view>
			</view>
		</view>

		<!-- 参与用户头像组（保持不变，等待独立接口） -->
		<view class="participants-section">
			<view class="participants-header">
				<view class="participants-title">参与用户</view>
				<view class="view-all-link" @click="viewAllUsers">查看全部 ></view>
			</view>
			<view class="participants-body">
				<view class="avatar-group">
					<image v-for="(avatar, index) in avatars" :key="index" :src="avatar" class="avatar-item" />
					<view class="avatar-item more-avatars">+28</view>
				</view>
				<text class="total-registered-info">
					<text class="registered-count">32</text> 人已报名
				</text>
			</view>
		</view>

		<!-- 【修改】根据 activityFunds 判断是否显示赞助商信息 -->
		<view class="sponsor-section" v-if="activityDetail.activityFunds === 2">
			<view class="section-title">赞助单位</view>
			<view class="sponsor-info">
				<!-- 【修改】动态绑定公司Logo和名称 -->
				<image :src="activityDetail.companyLogo" class="sponsor-logo"></image>
				<view class="sponsor-details">
					<view class="sponsor-name">{{ activityDetail.companyName }}</view>
					<view class="sponsor-description">感谢{{ activityDetail.companyName }}对本次活动的大力支持！</view>
				</view>
			</view>
		</view>

		<!-- 【修改】动态绑定报名截止时间 -->
		<view style="margin: 20rpx auto; flex: 1; text-align: center;">
		  报名时间：
		  <span style="color: #ff1a3c;">
		    {{ formattedRegistrationTimes.start }} - {{ formattedRegistrationTimes.end }}
		  </span>
		</view>


		<!-- 操作栏 -->
		<view class="action-bar">
			<view class="action-btn share-btn" @click="share">
				<text> 🔗分享</text>
			</view>
			<view class="action-btn register-btn" :class="{ 'disabled': !isRegistrationActive }"
				:disabled="!isRegistrationActive" @click="register">
				<text> ➕立即报名</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed // 【新增】导入 computed
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import request from '../../utils/request.js';

	const activityId = ref(null);
	// 【新增】创建一个 ref 来存储整个活动详情对象
	const activityDetail = ref(null);

	onLoad((options) => {
		if (options.id) {
			activityId.value = options.id;
			// 【修改】在拿到 ID 后直接调用数据获取函数
			getActiveDetail();
		} else {
			console.error('未接收到活动ID！');
			uni.showToast({
				title: '加载活动详情失败，缺少ID',
				icon: 'none'
			});
		}
	});
	const isRegistrationActive = computed(() => {
		// 如果活动详情还没加载出来，则默认不可报名
		if (!activityDetail.value) {
			return false;
		}
		// 只有当 status 为 2 (报名中) 时，才返回 true
		return activityDetail.value.status === 2;
	});

	// 模拟参与用户头像
	const avatars = [
		'https://randomuser.me/api/portraits/women/1.jpg',
		'https://randomuser.me/api/portraits/men/2.jpg',
		'https://randomuser.me/api/portraits/women/3.jpg',
		'https://randomuser.me/api/portraits/men/4.jpg'
	]

	// 【新增】计算属性，用于格式化时间
	const formatDateTime = (timestamp) => {
		if (!timestamp) return '时间待定';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	};

	// 【新增】用于活动时间的计算属性
	const formattedActivityTime = computed(() => {
		if (!activityDetail.value) return '';
		const start = formatDateTime(activityDetail.value.startDatetime);
		const end = formatDateTime(activityDetail.value.endDatetime);
		return `${start} 至 ${end}`;
	});

	// 【新增】用于报名截止时间的计算属性
	const formattedRegistrationEndTime = computed(() => {
		if (!activityDetail.value) return '';
		return formatDateTime(activityDetail.value.registrationEndDatetime);
	});
	const formattedRegistrationTimes = computed(() => {
		if (!activityDetail.value) return {
			start: '',
			end: ''
		};
	
		return {
			start: formatDateTime(activityDetail.value.registrationStartDatetime),
			end: formatDateTime(activityDetail.value.registrationEndDatetime)
		};
	});


	// 【新增】用于活动状态显示的计算属性
	const statusInfo = computed(() => {
		if (!activityDetail.value) return {
			text: '',
			color: ''
		};
		const statusMap = {
			0: {
				text: '活动已取消',
				color: '#909399'
			},
			1: {
				text: '活动未开始',
				color: '#f9ae3d'
			},
			2: {
				text: '正在报名中',
				color: '#4cd964'
			},
			3: {
				text: '活动即将开始',
				color: '#007aff'
			},
			4: {
				text: '活动进行中',
				color: '#dd524d'
			},
			5: {
				text: '活动已结束',
				color: '#8f8f94'
			},
			6: {
				text: '活动待退款',
				color: '#e6a23c'
			},
		};
		return statusMap[activityDetail.value.status] || {
			text: '状态未知',
			color: '#909399'
		};
	});

	// 【新增】用于判断是否显示“起聚名额”提示的计算属性
	const showLimitSlotsTip = computed(() => {
		if (!activityDetail.value) return false;
		// 只有在“未开始”或“报名中”且报名人数少于最低名额时显示
		const relevantStatus = [1, 2].includes(activityDetail.value.status);
		const notEnoughPeople = (activityDetail.value.joinCount || 0) < activityDetail.value.limitSlots;
		return relevantStatus && notEnoughPeople;
	});

	const getActiveDetail = async () => {
		if (!activityId.value) return; // 确保有 ID 才请求
		const result = await request('/app-api/member/activity/get', {
			method: 'GET',
			data: {
				id: activityId.value
			}
		});
		if (result && !result.error) {
			// 【修改】将获取到的数据赋值给 activityDetail
			activityDetail.value = result.data;
			console.log('getActiveDetail result:', activityDetail.value);
		} else {
			console.log('请求失败:', result ? result.error : '无返回结果');
		}
	};

	function share() {
		uni.showToast({
			title: '已分享到微信朋友圈',
			icon: 'none'
		})
	}

	function register() {
		if (!isRegistrationActive.value) {
			uni.showToast({
				title: '当前非报名时间',
				icon: 'none'
			});
			return; // 阻止跳转
		}
		uni.navigateTo({
			url: `/pages/active-enroll/active-enroll?id=${activityId.value}`
		})
	}

	function viewAllUsers() {
		uni.showToast({
			title: '查看全部参与用户',
			icon: 'none'
		})
	}
</script>

<style lang="scss" scoped>
	.page {
		padding-bottom: 120rpx;
		background-color: #f8f8f8;
	}

	// 【新增】活动状态和提示的样式
	.status-banner {
		color: #fff;
		padding: 10rpx 30rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: bold;
	}

	.limit-slots-tip {
		background-color: #fdf6ec;
		color: #e6a23c;
		padding: 20rpx 30rpx;
		font-size: 26rpx;
		display: flex;
		align-items: center;
	}

	.store-logo-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.top-nav {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		color: white;
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		font-size: 32rpx;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.page-title {
		flex: 1;
		text-align: center;
		font-weight: bold;
	}

	.event-cover {
		height: 400rpx;
		background: linear-gradient(45deg, #ff9a9e, #fad0c4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		padding: 20rpx;
	}

	.event-header,
	.event-content,
	.organizer-section,
	.business-section,
	.participants-section,
	.sponsor-section {
		/* 添加 sponsor-section */
		background: #fff;
		margin: 30rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.participants-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10rpx;

		.view-all-link {
			font-size: 24rpx;
			color: #3a7bd5;
			cursor: pointer;
		}
	}

	.event-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.event-meta {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		margin: 10rpx;
		gap: 10rpx;
	}

	.event-stats {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
	}

	.stat-item {
		flex: 1;
		text-align: center;
	}

	.stat-value {
		font-size: 32rpx;
		color: #FF6B00;
		font-weight: bold;
	}

	.stat-label {
		font-size: 24rpx;
		color: #888;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin: 30rpx 0 20rpx;
		/* 可以根据需要调整 */
		border-left: 10rpx solid #FF6B00;
		padding-left: 20rpx;
	}

	/* 新增：如果 section-title 在新区块内，去除顶部 margin */
	.sponsor-section .section-title {
		margin-top: 0;
	}


	.event-description {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		margin-bottom: 20rpx;
	}

	.activity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30rpx;
		margin-top: 20rpx;
	}

	.activity-item {
		background: #f9f9f9;
		border-radius: 20rpx;
		padding: 30rpx;
		text-align: center;
	}

	.activity-icon {
		width: 80rpx;
		height: 80rpx;
		background: #FF6B00;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20rpx;
	}

	.activity-title {
		color: #FF6B00;
		font-weight: bold;
		font-size: 32rpx;
		margin-bottom: 10rpx;
	}

	.activity-desc {
		font-size: 24rpx;
		color: #666;
	}

	.organizer-title,
	.business-title,
	.participants-title,
	.sponsor-title {
		/* 添加 sponsor-title */
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.organizer-info,
	.business-info,
	.participants-body,
	.sponsor-info {
		/* 添加 sponsor-info */
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.organizer-avatar,
	.business-logo {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(45deg, #ffb347, #ffcc33);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 新增：赞助商Logo样式 */
	.sponsor-logo {
		width: 120rpx;
		/* 根据实际Logo大小调整 */
		height: 120rpx;
		border-radius: 10rpx;
		/* 方形或圆角矩形，更适合公司Logo */
		object-fit: contain;
		/* 保持图片比例并完整显示 */
		background-color: #f0f0f0;
		border: 1rpx solid #eee;
	}

	.organizer-name,
	.business-name,
	.sponsor-name {
		/* 添加 sponsor-name */
		font-weight: bold;
		font-size: 28rpx;
	}

	.organizer-company,
	.business-meta text,
	.sponsor-description {
		/* 添加 sponsor-description */
		font-size: 24rpx;
		color: #666;
	}

	.avatar-group {
		display: flex;
		position: relative;
	}

	.avatar-item {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
		object-fit: cover;
		margin-left: -20rpx;
		background: #f0f0f0;
	}

	.more-avatars {
		background: #FF6B00;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.total-registered-info {
		font-size: 26rpx;
		color: #666;
	}

	.registered-count {
		color: #FF6B00;
		font-weight: bold;
	}

	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		display: flex;
		padding: 20rpx;
		box-shadow: 0 -5rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		padding: 24rpx;
		margin: 0 10rpx;
		text-align: center;
		border-radius: 16rpx;
		font-weight: bold;
	}

	.share-btn {
		background: #f0f0f0;
		color: #333;
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: #fff;
	}

	.register-btn.disabled {
		background: #c8c9cc;
		/* 灰色背景 */
		color: #fff;
		pointer-events: none;
		/* 禁用所有鼠标事件 */
	}
</style>