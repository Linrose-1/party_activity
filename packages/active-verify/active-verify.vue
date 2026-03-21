<template>
	<view class="verify-page user-select-text" v-if="activityInfo && participantInfo">
		<view class="header-status">
			<uni-icons type="info-filled" size="20" color="#FF62B1"></uni-icons>
			<text>请核对商友报名信息并确认到场</text>
		</view>

		<!-- 1. 聚会信息卡片 -->
		<view class="info-card">
			<view class="section-title">待核销聚会</view>
			<view class="activity-box">
				<image :src="activityInfo.coverImageUrl" mode="aspectFill" class="cover" />
				<view class="details">
					<text class="title">{{ activityInfo.activityTitle }}</text>
					<text class="time">{{ formattedActivityTime }}</text>
				</view>
			</view>
		</view>

		<!-- 2. 商友信息卡片 -->
		<view class="info-card">
			<view class="section-title">报名商友信息</view>
			<view class="user-box">
				<image :src="participantInfo.memberUser.avatar" mode="aspectFill" class="avatar" />
				<view class="user-meta">
					<text class="name">{{ participantInfo.userName || participantInfo.memberUser.nickname }}</text>
					<text class="phone">{{ participantInfo.userPhone }}</text>
					<text class="company">{{ participantInfo.contactAddress || '未填写公司' }}</text>
				</view>
			</view>

			<view class="status-row">
				<text class="label">报名状态</text>
				<text class="status-val" :class="participantInfo.paymentStatus === '2' ? 'success' : 'warn'">
					{{ participantInfo.paymentStatusStr }}
				</text>
			</view>
			<view class="status-row">
				<text class="label">是否核销</text>
				<text class="status-val">{{ participantInfo.isVerified === 1 ? '✅ 已核销' : '❌ 未核销' }}</text>
			</view>
		</view>

		<!-- 3. 操作按钮 -->
		<view class="action-footer">
			<button class="btn-cancel" @click="goBack">取消</button>
			<button class="btn-confirm" :disabled="isVerifying || participantInfo.isVerified === 1"
				@click="handleConfirmVerify">
				{{ participantInfo.isVerified === 1 ? '此码已核销' : '确认核销签到' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const activityId = ref(null);
	const joinUserId = ref(null);
	const activityInfo = ref(null);
	const participantInfo = ref(null);
	const isVerifying = ref(false);

	onLoad(async (options) => {
		// 解析 Scene 参数 (a=activityId, u=joinUserId)
		if (options.scene) {
			const scene = decodeURIComponent(options.scene);
			const params = {};
			scene.split('&').forEach(v => {
				const [key, val] = v.split('=');
				params[key] = val;
			});
			activityId.value = params.a;
			joinUserId.value = params.u;
		} else {
			activityId.value = options.activityId;
			joinUserId.value = options.joinUserId;
		}

		if (!activityId.value || !joinUserId.value) {
			uni.showModal({
				title: '参数错误',
				content: '无法识别核销信息',
				showCancel: false
			});
			return;
		}

		loadData();
	});

	const loadData = async () => {
		uni.showLoading({
			title: '信息获取中...'
		});

		// 并发获取：聚会详情 + 该用户的报名记录
		const [actRes, joinRes] = await Promise.all([
			request('/app-api/member/activity/get', {
				method: 'GET',
				data: {
					id: activityId.value
				}
			}),
			request('/app-api/member/activity-join/list', {
				method: 'GET',
				data: {
					activityId: activityId.value,
					userId: joinUserId.value,
					pageNo: 1,
					pageSize: 1
				}
			})
		]);

		uni.hideLoading();

		if (actRes.data) activityInfo.value = actRes.data;
		if (joinRes.data?.list?.length > 0) {
			participantInfo.value = joinRes.data.list[0];
		} else {
			uni.showModal({
				title: '提示',
				content: '未查询到该用户的报名记录',
				showCancel: false
			});
		}
	};

	const formattedActivityTime = computed(() => {
		if (!activityInfo.value) return '';
		const d = new Date(activityInfo.value.startDatetime);
		return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
	});

	/**
	 * 确认核销操作
	 */
	const handleConfirmVerify = async () => {
		uni.showModal({
			title: '确认核销',
			content: `确认已核对商友【${participantInfo.value.userName}】身份并签到？`,
			success: async (res) => {
				if (!res.confirm) return;

				isVerifying.value = true;
				const result = await request('/app-api/member/activity/verify', {
					method: 'POST',
					data: {
						activityId: Number(activityId.value),
						joinUserId: Number(joinUserId.value)
					}
				});
				isVerifying.value = false;

				if (!result.error) {
					uni.showToast({
						title: '核销成功',
						icon: 'success'
					});
					setTimeout(() => loadData(), 1000); // 刷新当前页状态
				} else {
					// 详细显示你列出的错误原因
					const errMsg = result.error.msg || result.error || '核销失败';
					uni.showModal({
						title: '核销失败',
						content: errMsg,
						showCancel: false,
						confirmColor: '#FF62B1'
					});
				}
			}
		});
	};

	const goBack = () => uni.navigateBack();
</script>

<style lang="scss" scoped>
	$theme: #FF62B1;

	.verify-page {
		min-height: 100vh;
		background: #f8f8f8;
		padding: 30rpx;
	}

	.header-status {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 30rpx;
		font-size: 26rpx;
		color: #666;
	}

	.info-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
		padding-bottom: 10rpx;
	}

	.activity-box {
		display: flex;
		gap: 20rpx;

		.cover {
			width: 120rpx;
			height: 120rpx;
			border-radius: 12rpx;
		}

		.title {
			font-weight: bold;
			font-size: 30rpx;
			display: block;
		}

		.time {
			font-size: 24rpx;
			color: $theme;
			margin-top: 10rpx;
		}
	}

	.user-box {
		display: flex;
		align-items: center;
		gap: 30rpx;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f9f9f9;

		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}

		.name {
			font-size: 32rpx;
			font-weight: bold;
			display: block;
		}

		.phone {
			font-size: 24rpx;
			color: #666;
		}

		.company {
			font-size: 22rpx;
			color: #999;
		}
	}

	.status-row {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		font-size: 28rpx;

		.label {
			color: #666;
		}

		.status-val {
			font-weight: bold;
		}

		.success {
			color: #52c41a;
		}

		.warn {
			color: #ff4d4f;
		}
	}

	.action-footer {
		position: fixed;
		bottom: 50rpx;
		left: 30rpx;
		right: 30rpx;
		display: flex;
		gap: 20rpx;
	}

	.btn-cancel {
		flex: 1;
		border-radius: 50rpx;
		font-size: 30rpx;
		background: #eee;
	}

	.btn-confirm {
		flex: 2;
		border-radius: 50rpx;
		font-size: 30rpx;
		background: $theme;
		color: #fff;
		border: none;

		&[disabled] {
			background: #ccc;
		}
	}
</style>