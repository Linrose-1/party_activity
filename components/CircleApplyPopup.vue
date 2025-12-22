<template>
	<uni-popup ref="popup" type="bottom" background-color="#f5f7fa" @change="onPopupChange">
		<view class="apply-popup-container">
			<view class="popup-header">
				<text class="title">新的圈友申请 ({{ list.length }})</text>
				<uni-icons type="closeempty" size="24" color="#999" @click="close"></uni-icons>
			</view>

			<scroll-view scroll-y class="apply-list">
				<view v-for="(item, index) in list" :key="item.id" class="apply-card">
					<view class="user-info">
						<image :src="item.avatar || '/static/icon/default-avatar.png'" class="avatar" mode="aspectFill">
						</image>
						<view class="info-content">
							<view class="name-row">
								<text class="name">{{ item.realName || item.nickname }}</text>
								<text class="time">{{ formatTime(item.createTime) }}</text>
							</view>
							<view class="desc">{{ item.companyName || '暂无公司' }} | {{ item.positionTitle || '暂无职位' }}
							</view>

							<!-- 共同点展示 -->
							<view class="common-tags">
								<text v-if="item.fellowTownspeopleFlag === 1" class="tag">同乡</text>
								<text v-if="item.peerFlag === 1" class="tag">同行</text>
								<text v-if="item.classmateFlag === 1" class="tag">同学</text>
							</view>
						</view>
					</view>

					<view class="action-row">
						<button class="btn reject" @click="handleAudit(item, false)">拒绝</button>
						<button class="btn agree" @click="handleAudit(item, true)">同意</button>
					</view>
				</view>

				<view v-if="list.length === 0" class="empty-tip">暂无待处理申请</view>
			</scroll-view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import request from '@/utils/request.js';

	const popup = ref(null);
	const list = ref([]);
	const emit = defineEmits(['refresh']);

	const open = (dataList) => {
		list.value = dataList || [];
		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	// 审批操作
	const handleAudit = async (item, isAgree) => {
		uni.showLoading({
			title: '处理中...'
		});
		try {
			// 真实接口 URL
			const url = `/app-api/member/user/friend/review`;

			// 【关键】参数构造
			// item.fid 来自列表接口返回的 fid (圈友关系ID)
			// 如果后端要求传用户ID，请改回 item.id。通常审核接口是对“关系记录”进行审核，所以是 fid。
			const payload = {
				id: item.fid,
				status: isAgree
			};

			const {
				error
			} = await request(url, {
				method: 'POST',
				data: payload
			});

			if (!error) {
				uni.showToast({
					title: '操作成功',
					icon: 'success'
				});

				// 1. 从列表中移除已处理项
				list.value = list.value.filter(i => i.id !== item.id);

				// 2. 通知父组件刷新外部数据 (红点数、圈友列表)
				// emit('refresh');

				// 3. 【修改】只有当列表清空时，才自动关闭弹窗
				if (list.value.length === 0) {
					// 给用户一点反应时间看到最后一条消失，体验更好
					setTimeout(() => {
						close();
					}, 500);
				}
				// 如果还有数据，什么都不做，让用户继续操作下一条
			} else {
				uni.showToast({
					title: error || '操作失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
			console.error(e);
		} finally {
			uni.hideLoading();
		}
	};

	// 监听弹窗状态变化
	const onPopupChange = (e) => {
		// 当弹窗关闭时 (e.show === false)
		if (!e.show) {
			// 告诉父组件：我关门了，你可以刷新数据了
			emit('refresh');
		}
	};

	const formatTime = (time) => {
		// 简单的时间格式化
		if (!time) return '';
		return new Date(time).toLocaleDateString();
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.apply-popup-container {
		height: 80vh;
		/* 半屏高度 */
		background-color: #f5f7fa;
		border-radius: 24rpx 24rpx 0 0;
		display: flex;
		flex-direction: column;
	}

	.popup-header {
		padding: 30rpx;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 24rpx 24rpx 0 0;
		border-bottom: 1rpx solid #eee;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.apply-list {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;
		overflow-y: auto;
	}

	.apply-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.user-info {
		display: flex;
		margin-bottom: 30rpx;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		border: 1rpx solid #eee;
	}

	.info-content {
		flex: 1;
	}

	.name-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.desc {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.common-tags {
		display: flex;
		gap: 12rpx;
	}

	.tag {
		font-size: 22rpx;
		color: #FF6E00;
		background-color: #fff0e6;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
	}

	.action-row {
		display: flex;
		gap: 20rpx;
	}

	.btn {
		flex: 1;
		height: 70rpx;
		line-height: 70rpx;
		font-size: 28rpx;
		border-radius: 35rpx;

		&::after {
			border: none;
		}
	}

	.reject {
		background-color: #f5f5f5;
		color: #666;
	}

	.agree {
		background: linear-gradient(135deg, #FF6E00, #FF8C00);
		color: #fff;
	}

	.empty-tip {
		text-align: center;
		color: #999;
		padding-top: 100rpx;
	}
</style>