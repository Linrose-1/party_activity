<template>
	<view class="verify-page user-select-text" v-if="activityInfo && participantInfo">
		<view class="header-status">
			<uni-icons type="info-filled" size="20" color="#FF62B1"></uni-icons>
			<text>请核对商友报名信息并确认到场</text>
		</view>

		<!-- 1. 待核销聚会信息 -->
		<view class="info-card">
			<view class="section-title">待核销聚会</view>
			<view class="activity-box">
				<image :src="activityInfo.coverImageUrl" mode="aspectFill" class="cover" />
				<view class="details">
					<text class="title">{{ activityInfo.activityTitle }}</text>
					<text class="time">聚会时间：{{ formattedActivityTime }}</text>
				</view>
			</view>
		</view>

		<!-- 2. 报名商友信息 -->
		<view class="info-card">
			<view class="section-title">报名商友资料</view>
			<view class="user-box">
				<image :src="participantInfo.memberUser.avatar" mode="aspectFill" class="avatar" />
				<view class="user-meta">
					<!-- 【优化】显示真实姓名或昵称 -->
					<text
						class="name">{{ participantInfo.memberUser.realName || participantInfo.memberUser.nickname }}</text>
					<!-- 【优化】显示手机号 -->
					<text class="phone">联系电话：{{ participantInfo.memberUser.mobile }}</text>
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
				<!-- 根据 isVerified 判断 -->
				<text class="status-val" :class="participantInfo.isVerified === 1 ? 'success' : 'warn'">
					{{ participantInfo.isVerified === 1 ? '✅ 已核销' : '❌ 未核销' }}
				</text>
			</view>
		</view>

		<!-- 3. 操作按钮 -->
		<view class="action-footer">
			<button class="btn-cancel" @click="goBack">返回</button>
			<button class="btn-confirm" :disabled="isVerifying || participantInfo.isVerified === 1"
				@click="handleConfirmVerify">
				{{ participantInfo.isVerified === 1 ? '此码已完成核销' : '确认核销签到' }}
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
		console.log('📥 [核销页收到参数]:', options);

		// 1. 尝试从普通参数中获取 (activityId / joinUserId)
		if (options.activityId && options.joinUserId) {
			activityId.value = options.activityId;
			joinUserId.value = options.joinUserId;
		}
		// 2. 尝试从 scene 字符串中获取 (兼容扫码直连)
		else if (options.scene) {
			const scene = decodeURIComponent(options.scene);
			const params = {};
			scene.split('&').forEach(v => {
				const [key, val] = v.split('=');
				params[key] = val;
			});
			activityId.value = params.a || params.activityId;
			joinUserId.value = params.u || params.joinUserId;
		}

		// 3. 终极校验
		if (!activityId.value || !joinUserId.value) {
			uni.showModal({
				title: '识别失败',
				content: '核销凭证数据丢失，请重新扫码',
				showCancel: false,
				success: () => uni.navigateBack()
			});
			return;
		}

		loadData();
	});

	const loadData = async () => {
		uni.showLoading({
			title: '拉取核销资料...'
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
					activityId: String(activityId.value),
					userId: String(joinUserId.value),
					pageNo: 1,
					pageSize: 1
				}
			})
		]);

		uni.hideLoading();

		if (actRes.data) activityInfo.value = actRes.data;

		if (joinRes.data && joinRes.data.list && joinRes.data.list.length > 0) {
			participantInfo.value = joinRes.data.list[0];
			console.log('✅ 获取到报名商友信息:', participantInfo.value);
		} else {
			uni.showModal({
				title: '无法核销',
				content: '未查询到该用户的报名记录，请核实该商友是否已在此聚会报名。',
				showCancel: false
			});
		}
	};

	const formattedActivityTime = computed(() => {
		if (!activityInfo.value) return '';
		const d = new Date(activityInfo.value.startDatetime);
		const pad = n => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
	});

	/**
	 * 确认核销操作
	 */
	const handleConfirmVerify = async () => {
		// 【修复】从 memberUser 中正确提取显示名称
		const showName = participantInfo.value.memberUser.realName || participantInfo.value.memberUser.nickname ||
			'商友';

		uni.showModal({
			title: '身份核对确认',
			content: `已确认商友【${showName}】到场？\n核销后将无法撤回。`,
			confirmColor: '#FF62B1',
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
					// 核销成功后延迟刷新页面状态
					setTimeout(() => loadData(), 800);
				} else {
					// 处理业务层返回的错误提示（如：只有组织者能核销、已核销等）
					const errMsg = typeof result.error === 'object' ? (result.error.msg || '核销请求失败') :
						result.error;
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
		padding-bottom: 180rpx;
	}

	.header-status {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 30rpx;
		padding: 20rpx;
		background: rgba($theme, 0.05);
		border-radius: 12rpx;
		font-size: 26rpx;
		color: $theme;
		font-weight: 500;
	}

	.info-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	.section-title {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
		padding-bottom: 12rpx;
		font-weight: bold;
	}

	.activity-box {
		display: flex;
		gap: 24rpx;

		.cover {
			width: 120rpx;
			height: 120rpx;
			border-radius: 12rpx;
			flex-shrink: 0;
		}

		.details {
			flex: 1;

			.title {
				font-weight: bold;
				font-size: 30rpx;
				color: #333;
				display: block;
				margin-bottom: 8rpx;
			}

			.time {
				font-size: 24rpx;
				color: #888;
			}
		}
	}

	.user-box {
		display: flex;
		align-items: center;
		gap: 30rpx;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f9f9f9;

		.avatar {
			width: 110rpx;
			height: 110rpx;
			border-radius: 55rpx;
			border: 4rpx solid rgba($theme, 0.1);
		}

		.user-meta {
			flex: 1;

			.name {
				font-size: 34rpx;
				font-weight: 800;
				color: #333;
				display: block;
				margin-bottom: 10rpx;
			}

			.phone {
				font-size: 26rpx;
				color: #666;
			}
		}
	}

	.status-row {
		display: flex;
		justify-content: space-between;
		padding: 24rpx 0;
		font-size: 28rpx;
		border-bottom: 1rpx solid #fafafa;

		&:last-child {
			border-bottom: none;
		}

		.label {
			color: #888;
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
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 30rpx 40rpx;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.05);
		display: flex;
		gap: 24rpx;
	}

	.btn-cancel {
		flex: 1;
		border-radius: 50rpx;
		font-size: 30rpx;
		background: #f5f5f5;
		color: #666;
		border: none;
	}

	.btn-confirm {
		flex: 2;
		border-radius: 50rpx;
		font-size: 30rpx;
		font-weight: bold;
		background: linear-gradient(to right, $theme, #ff8dc4);
		color: #fff;
		border: none;
		box-shadow: 0 8rpx 20rpx rgba($theme, 0.3);
		transition: opacity 0.2s;

		&:active {
			opacity: 0.8;
		}

		&[disabled] {
			background: #dcdcdc;
			color: #fff;
			box-shadow: none;
		}
	}
</style>