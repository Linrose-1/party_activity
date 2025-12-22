<template>
	<view class="container">
		<rich-text :nodes="content"></rich-text>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';

	const content = ref('');

	onLoad((options) => {
		// 内容通过 URL 参数传递可能会超长，建议通过事件总线、全局变量或重新请求接口获取
		// 这里假设通过全局缓存传递，或者重新调用接口
		// 简单起见，我们重新调用接口获取（保证数据最新）
		fetchPlatformInfo();
	});

	import request from '@/utils/request.js';
	const fetchPlatformInfo = async () => {
		const {
			data
		} = await request('/app-api/system/platformConfig/getPlatformConfig');
		if (data) {
			content.value = data.content || '';
			uni.setNavigationBarTitle({
				title: data.name || '平台介绍'
			});
		}
	};
</script>

<style scoped>
	.container {
		padding: 30rpx;
		background-color: #fff;
		min-height: 100vh;
	}
</style>