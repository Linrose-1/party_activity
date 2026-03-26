<template>
	<view class="container" v-if="detail">
		<!-- 1. 顶部状态栏 -->
		<view class="status-header">
			<view class="status-icon">
				<uni-icons :type="isPaid ? 'checkbox-filled' : 'info-filled'" size="50"
					:color="isPaid ? '#4cd964' : '#ff9800'"></uni-icons>
			</view>
			<text class="status-text">{{ statusText }}</text>
			<text class="status-sub" v-if="!isPaid">请尽快完成支付</text>
		</view>

		<!-- 2. 驳回信息 (仅当被驳回时显示) -->
		<view class="reject-card" v-if="detail.status === 4 && detail.errMsg">
			<uni-icons type="info-filled" color="#ff4d4f" size="18"></uni-icons>
			<text class="reject-text">驳回原因：{{ detail.errMsg }}</text>
		</view>

		<!-- 3. 核心信息卡片 -->
		<view class="info-card">
			<view class="section-title">订单信息</view>

			<view class="info-row">
				<text class="label">订单编号</text>
				<text class="value copy-text" @click="copyText(detail.orderNo)">
					{{ detail.orderNo || '生成中...' }} <uni-icons type="paperclip" size="14" color="#999"></uni-icons>
				</text>
			</view>

			<view class="info-row">
				<text class="label">创建时间</text>
				<text class="value">{{ formatTime(detail.createTime) }}</text>
			</view>

			<!-- 【新增】支付时间：如果有值则显示 -->
			<view class="info-row" v-if="detail.payTime">
				<text class="label">支付时间</text>
				<text class="value">{{ formatTime(detail.payTime) }}</text>
			</view>

			<view class="divider"></view>

			<view class="section-title">商品信息</view>

			<view class="info-row">
				<text class="label">商品名称</text>
				<text class="value bold">{{ productName }}</text>
			</view>

			<view class="info-row">
				<text class="label">商品描述</text>
				<text class="value">{{ detail.remark || productName }}</text>
			</view>

			<!-- 【新增】会员有效期：如果有值则显示 -->
			<view class="info-row" v-if="detail.expirationTime">
				<text class="label">会员有效期至</text>
				<text class="value highlight-time">{{ formatTime(detail.expirationTime) }}</text>
			</view>

			<view class="info-row">
				<text class="label">支付方式</text>
				<text class="value">微信支付</text>
			</view>

			<view class="info-row" v-if="detail.imageUrls">
				<text class="label">支付凭证</text>
				<image :src="detail.imageUrls" mode="aspectFit" class="proof-img"
					@click="previewImage(detail.imageUrls)"></image>
			</view>

			<view class="divider"></view>

			<view class="info-row amount-row">
				<text class="label">支付金额</text>
				<text class="amount">¥{{ detail.amount }}</text>
			</view>
		</view>

		<!-- 4. 底部客服/操作栏 -->
		<view class="footer-area">
			<view class="contact-btn" @click="handleContact">
				<uni-icons type="headphones" size="20" color="#666"></uni-icons>
				<text>如需帮助，请联系客服</text>
			</view>

			<!-- 如果未支付，显示去支付按钮 -->
			<button v-if="!isPaid" class="pay-btn" @click="handleRepay" :loading="isPaying">
				立即支付
			</button>
		</view>
	</view>

	<!-- 加载中或错误状态 -->
	<view class="loading-container" v-else>
		<uni-load-more status="loading" v-if="isLoading" />
		<view class="error-box" v-else-if="loadError">
			<text>订单加载失败</text>
			<button size="mini" @click="fetchDetail">重试</button>
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

	const detail = ref(null);
	const isLoading = ref(true);
	const loadError = ref(false);
	const isPaying = ref(false);
	const orderId = ref(null);

	onLoad((options) => {
		if (options.id) {
			orderId.value = options.id;
			fetchDetail();
		} else {
			loadError.value = true;
			isLoading.value = false;
		}
	});

	// --- 计算属性 ---
	const isPaid = computed(() => {
		return detail.value && detail.value.payStatus === 1;
	});

	const statusText = computed(() => {
		if (!detail.value) return '';
		if (detail.value.status === 4) return '已驳回'; // 优先显示驳回
		if (detail.value.payStatus === 1) return '支付成功';
		return '待支付';
	});

	const productName = computed(() => {
		if (!detail.value) return '';
		// 结合之前的列表页逻辑，payType: 2 为会员，其他为智米
		return detail.value.payType === 2 ? '会员开通' : '智米充值';
	});

	// --- 数据获取 ---
	const fetchDetail = async () => {
		isLoading.value = true;
		loadError.value = false;

		try {
			// 使用 app-api 路径，参数为 id
			const {
				data,
				error
			} = await request('/app-api/member/user-post-pay-record/get', {
				method: 'GET',
				data: {
					id: orderId.value
				}
			});

			if (error) throw new Error(error);

			detail.value = data;
			// 调试日志，查看新字段是否返回
			console.log('订单详情数据:', data);
		} catch (e) {
			console.error('获取详情失败', e);
			loadError.value = true;
		} finally {
			isLoading.value = false;
		}
	};

	// --- 交互逻辑 ---
	const formatTime = (ts) => {
		if (!ts) return '-';
		const date = new Date(ts);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	const copyText = (text) => {
		if (!text) return;
		uni.setClipboardData({
			data: text,
			success: () => uni.showToast({
				title: '已复制',
				icon: 'none'
			})
		});
	};

	const previewImage = (url) => {
		uni.previewImage({
			urls: [url]
		});
	};

	const handleContact = () => {
		uni.showModal({
			title: '联系客服',
			content: '请拨打客服热线：400-XXX-XXXX',
			confirmText: '呼叫',
			success: (res) => {
				if (res.confirm) {
					uni.makePhoneCall({
						phoneNumber: '4001234567'
					}); // 替换真实号码
				}
			}
		});
	};

	// 复用列表页的支付逻辑
	const handleRepay = async () => {
		if (!detail.value.orderNo) return;
		isPaying.value = true;

		try {
			const {
				data: payParams,
				error
			} = await request('/app-api/member/user-post-pay-record/pay', {
				method: 'POST',
				data: {
					orderNo: detail.value.orderNo
				}
			});

			if (error) throw new Error(error);

			await new Promise((resolve, reject) => {
				uni.requestPayment({
					provider: 'weixin',
					...payParams,
					success: resolve,
					fail: (err) => {
						if (err.errMsg.includes('cancel')) reject(new Error('取消支付'));
						else reject(new Error('支付失败'));
					}
				});
			});

			uni.showToast({
				title: '支付成功',
				icon: 'success'
			});
			fetchDetail(); // 刷新详情

		} catch (e) {
			if (e.message !== '取消支付') {
				uni.showToast({
					title: e.message || '支付异常',
					icon: 'none'
				});
			}
		} finally {
			isPaying.value = false;
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
		/* 为底部按钮留空 */
	}

	/* 1. 状态头部 */
	.status-header {
		background-color: #fff;
		padding: 60rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}

	.status-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-top: 20rpx;
	}

	.status-sub {
		font-size: 26rpx;
		color: #999;
		margin-top: 10rpx;
	}

	/* 驳回卡片 */
	.reject-card {
		background-color: #fff1f0;
		border: 1rpx solid #ffa39e;
		margin: 20rpx;
		padding: 20rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.reject-text {
		color: #ff4d4f;
		font-size: 26rpx;
	}

	/* 3. 信息卡片通用样式 */
	.info-card {
		background-color: #fff;
		margin: 20rpx;
		padding: 30rpx;
		border-radius: 16rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 24rpx;
		border-left: 8rpx solid #FF6E00;
		padding-left: 16rpx;
		line-height: 1;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 24rpx;
		font-size: 28rpx;
		line-height: 1.5;

		.label {
			color: #999;
			flex-shrink: 0;
			margin-right: 20rpx;
		}

		.value {
			color: #333;
			text-align: right;
			word-break: break-all;

			&.bold {
				font-weight: bold;
			}
		}

		/* 高亮会员到期时间 */
		.highlight-time {
			color: #FF6E00;
			font-weight: 500;
		}

		.copy-text {
			display: flex;
			align-items: center;
			gap: 8rpx;
		}

		.proof-img {
			width: 120rpx;
			height: 120rpx;
			border-radius: 8rpx;
			border: 1rpx solid #eee;
		}
	}

	.divider {
		height: 1rpx;
		background-color: #eee;
		margin: 30rpx 0;
	}

	.amount-row {
		margin-top: 10rpx;
		align-items: center;

		.amount {
			font-size: 40rpx;
			color: #FF6E00;
			font-weight: bold;
		}
	}

	/* 4. 底部区域 */
	.footer-area {
		margin: 40rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.contact-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		padding: 20rpx;
		color: #666;
		font-size: 26rpx;
		background-color: #fff;
		border-radius: 40rpx;
	}

	.pay-btn {
		width: 100%;
		background: linear-gradient(135deg, #FF8C00 0%, #FF6E00 100%);
		color: #fff;
		border-radius: 44rpx;
		font-size: 32rpx;
		height: 88rpx;
		line-height: 88rpx;

		&::after {
			border: none;
		}
	}

	.loading-container {
		display: flex;
		justify-content: center;
		padding-top: 200rpx;
	}

	.error-box {
		text-align: center;
		color: #999;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
</style>