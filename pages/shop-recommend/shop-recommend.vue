<template>
	<view class="container">
		<!-- 表单容器 -->
		<view class="form-container">
			<form @submit.prevent="handleSubmit">
				<!-- 店铺名称 -->
				<view class="form-group">
					<uni-label>聚店名称</uni-label>
					<uni-easyinput type="text" v-model="form.name" placeholder="请输入聚店名称" :inputBorder="false"
						required />
				</view>

				<!-- 店铺地址 -->
				<view class="form-group">
					<uni-label>聚店地址</uni-label>
					<view class="uni-list-cell-db">
						<view @click="openMapToChooseLocation" class="uni-input">
							<!-- 显示选择结果 -->
							<text
								v-if="selectedLocationInfo">{{ selectedLocationInfo.address || selectedLocationInfo.name }}</text>
							<text v-else class="placeholder">点击选择位置</text>
							<text class="arrow">></text>
						</view>
					</view>
					<!-- <uni-easyinput 
            type="text" 
            v-model="form.address" 
            placeholder="请输入详细地址" 
            :inputBorder="false"
            required
          /> -->
				</view>

				<!-- 推荐理由 -->
				<view class="form-group">
					<uni-label>推荐理由</uni-label>
					<uni-easyinput type="textarea" v-model="form.reason" placeholder="请输入推荐理由，如特色服务、环境氛围等"
						:inputBorder="false" required />
				</view>

				<!-- 提交按钮 -->
				<button form-type="submit" class="submit-btn">
					<uni-icons type="paperplane" size="16" color="#fff"></uni-icons>
					提交推荐
				</button>
			</form>
		</view>

		<!-- 页脚 -->
		<view class="footer">
			感谢你的推荐，审核通过后将展示在首页
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import request from '../../utils/request.js';

	// 表单数据，移除了 address 字段，因为它由 selectedLocationInfo 管理
	const form = ref({
		name: '',
		reason: ''
	})

	// 用于存储地图选择结果的响应式变量
	const selectedLocationInfo = ref(null);

	/**
	 * 提交表单的核心处理函数
	 */
	const handleSubmit = async () => {
		// 1. 完善的表单校验
		if (!form.value.name.trim()) {
			uni.showToast({
				title: '请输入聚店名称',
				icon: 'none'
			});
			return;
		}
		if (!selectedLocationInfo.value) {
			uni.showToast({
				title: '请选择聚店地址',
				icon: 'none'
			});
			return;
		}
		if (!form.value.reason.trim()) {
			uni.showToast({
				title: '请输入推荐理由',
				icon: 'none'
			});
			return;
		}

		// 2. 显示加载提示，防止用户重复提交
		uni.showLoading({
			title: '正在提交...'
		});

		// 3. 调用接口方法
		const result = await storeRecommend();
		
		// 4. 隐藏加载提示
		uni.hideLoading();

		// 5. 根据接口返回结果进行反馈
		if (result.error) {
			// 如果请求失败，显示后端返回的错误信息
			uni.showToast({
				title: result.error,
				icon: 'none',
				duration: 2000
			});
		} else {
			// 如果请求成功，给出成功提示
			uni.showToast({
				title: '推荐成功，感谢您的分享！',
				icon: 'success'
			});

			// 清空表单数据和地图选择结果
			form.value.name = '';
			form.value.reason = '';
			selectedLocationInfo.value = null;
			
			// （可选）提交成功后延时1.5秒自动返回上一页
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	};

	/**
	 * 调用创建店铺推荐的后端接口
	 * 直接从 ref 获取最新数据，无需传参
	 */
	const storeRecommend = async () => {
		// 调用封装的请求方法
		const result = await request('/app-api/member/store-recommend/create', {
			method: 'POST', // 请求方式
			data: {
				// 将页面数据映射到接口参数
				storeName: form.value.name,
				fullAddress: selectedLocationInfo.value.address,
				recommendText: form.value.reason,
				longitude: selectedLocationInfo.value.longitude,
				latitude: selectedLocationInfo.value.latitude,
			}
		});
		// 返回请求结果，供 handleSubmit 使用
		return result;
	};

	/**
	 * 打开地图让用户选择位置
	 */
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log('选择位置成功:', res);
				// 将选择结果保存到 selectedLocationInfo
				selectedLocationInfo.value = {
					name: res.name,
					address: res.address,
					latitude: res.latitude,
					longitude: res.longitude
				};
				// 注意：这里不再需要手动给 form.address 赋值
			},
			fail: (err) => {
				console.log('选择位置失败:', err);
				if (!err.errMsg.includes('cancel')) {
					uni.showToast({
						title: '选择位置失败',
						icon: 'none'
					});
				}
			}
		});
	}

	// 页面加载时执行
	onLoad(() => {
		// 可以在这里初始化数据
	})
</script>

<style lang="scss">
	/* 使用 SCSS 变量 */
	$primary: #FF6B00;
	$primary-light: #FF8A33;
	$light-bg: #f8f8f8;
	$dark-text: #333;
	$gray-text: #666;
	$border: #eee;

	.container {
		background-color: $light-bg;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.form-container {
		padding: 20rpx;
		background: white;
		margin: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.form-group {
		margin-bottom: 20rpx;

		// 自定义 uni-easyinput 样式
		:deep(.uni-easyinput) {
			border: 1rpx solid $border;
			border-radius: 8rpx;
			padding: 10rpx;
			margin: 10rpx 0;

			&.is-input-border {
				border: 1rpx solid $border;
			}
		}
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


			.placeholder {
				color: #939393;
				font-size: 24rpx;
			}
		}
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		background: $primary;
		color: white;
		padding: 10rpx;
		font-size: 32rpx;
		border: none;
		border-radius: 8rpx;
		transition: background 0.3s;

		&:active {
			background: $primary-light;
		}
	}

	.footer {
		text-align: center;
		color: $gray-text;
		font-size: 26rpx;
		margin-top: 40rpx;
		padding: 0 20rpx;
		color: #717171;
	}

	// 自定义导航栏样式
	:deep(.uni-nav-bar) {
		.uni-nav-bar--fixed {
			background-color: white;
			border-bottom: 1rpx solid $border;
		}

		.uni-nav-bar-text {
			font-weight: bold;
			font-size: 18rpx;
		}
	}
</style>