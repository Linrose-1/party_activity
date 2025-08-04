<template>
	<view class="container">
		<view class="page-header">
			<text class="page-title">我的数字标签</text>
			<text class="page-subtitle">请对自己以下维度的表现进行1-10分评估</text>
		</view>

		<!-- 评分区域 -->
		<view class="score-sections">
			<!-- 循环渲染每个评分类别 -->
			<view class="section-card" v-for="category in scoreCategories" :key="category.title">
				<view class="section-header">
					<text class="section-title">{{ category.title }}</text>
				</view>
				<view class="section-content">
					<!-- 循环渲染类别下的每个评分项 -->
					<view class="score-item" v-for="item in category.items" :key="item.key">
						<text class="item-label">{{ item.label }}</text>
						<uni-rate 
							v-model="scores[item.key]" 
							:max="10" 
							:size="22"
							color="#c0c0c0"
							active-color="#FF8C00"
							:allow-half="false" 
						/>
					</view>
				</view>
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="footer">
			<button class="submit-btn" @click="submitScores">保存评分</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request.js'; // 确保路径正确

// 封装评分API
const ScoreApi = {
  /**
   * 保存或更新用户评分
   * @param {object} scoreData - 包含评分信息的对象
   */
  saveOrUpdate: (scoreData) => {
    return request('/app-api/member-user-scores/saveOrUpdate', {
      method: 'POST',
      data: scoreData // request 工具会自动处理 JSON 格式
    });
  },
  // TODO: 后续可以增加一个获取已有评分的接口
  // getMyScores: (userId) => { ... }
};

// 1. 定义评分项的结构，方便渲染和管理
const scoreCategories = ref([
  {
    title: '基础信用',
    items: [
      { label: '守时', key: 'punctuality' },
      { label: '守诺', key: 'promiseKeep' },
      { label: '守法', key: 'lawAbiding' },
      { label: '尽责', key: 'responsible' },
    ]
  },
  {
    title: '协助态度',
    items: [
      { label: '真诚', key: 'sincere' },
      { label: '包容', key: 'tolerance' },
      { label: '利他', key: 'altruism' },
      { label: '共情', key: 'empathy' }
    ]
  },
  {
    title: '专业能力',
    items: [
      { label: '专注', key: 'focus' },
      { label: '高效', key: 'efficient' },
      { label: '细致', key: 'detailOriented' },
      { label: '拓局', key: 'expandVision' }
    ]
  },
  {
    title: '精神格局',
    items: [
      { label: '贡献', key: 'contribution' },
      { label: '谦逊', key: 'humility' },
      { label: '远见', key: 'foresight' },
      { label: '使命', key: 'mission' }
    ]
  }
]);

// 2. 创建一个响应式对象来存储所有16个评分项的分数
const scores = ref({
  punctuality: 0,
  promiseKeep: 0,
  lawAbiding: 0,
  responsible: 0,
  sincere: 0,
  tolerance: 0,
  altruism: 0,
  empathy: 0,
  focus: 0,
  efficient: 0,
  detailOriented: 0,
  expandVision: 0,
  contribution: 0,
  humility: 0,
  foresight: 0,
  mission: 0
});

// 用于存储已有评分记录的ID，如果是新增则为null
const scoreRecordId = ref(null);

onMounted(() => {
  // 页面加载时，可以尝试获取已有的评分数据
  // 这里暂时省略，因为接口文档未提供 "get" 方法
  // 如果有 "get" 接口，可以在这里调用，然后填充 scores.value 和 scoreRecordId.value
  console.log("评分页面已加载，等待用户操作。");
});

// 3. 提交评分的方法
const submitScores = async () => {
  // 从本地存储获取当前登录的用户信息
  const userId = uni.getStorageSync('userId'); 
  console.log(userId)

  if (!userId) {
    uni.showToast({
      title: '无法获取用户信息，请重新登录',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({ title: '正在保存...' });

  // 准备要提交到后端的数据
  const payload = {
    ...scores.value,        // 包含所有16个评分项的分数
    id: scoreRecordId.value, // 如果是修改，则传入记录ID；如果是新增，则为 null
    userId: userId,     // 被评分者ID，这里是自己
    scorerId: userId    // 评分者ID，也是自己
  };

  const { data: newRecordId, error } = await ScoreApi.saveOrUpdate(payload);
  
  uni.hideLoading();

  if (error) {
    console.error('评分保存失败:', error);
    uni.showToast({ title: `保存失败: ${error}`, icon: 'none' });
    return;
  }

  // 保存成功
  uni.showToast({ title: '保存成功！', icon: 'success' });
  scoreRecordId.value = newRecordId; // 保存成功后，更新记录ID，下次提交就是修改了

  setTimeout(() => {
    uni.navigateBack(); // 1.5秒后自动返回上一页
  }, 1500);
};

</script>

<style scoped lang="scss">
.container {
	background-color: #f9f9f9;
	min-height: 100vh;
	padding: 30rpx 30rpx 140rpx; // 底部留出按钮空间
	box-sizing: border-box;
}

.page-header {
	margin-bottom: 30rpx;
	.page-title {
		font-size: 44rpx;
		font-weight: bold;
		color: #333;
		display: block;
	}
	.page-subtitle {
		font-size: 28rpx;
		color: #999;
		margin-top: 10rpx;
		display: block;
	}
}

.section-card {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.section-header {
	padding-bottom: 20rpx;
	border-bottom: 1px solid #f0f0f0;
	margin-bottom: 20rpx;
	.section-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
	}
}

.score-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
}

.item-label {
	font-size: 30rpx;
	color: #555;
}

.footer {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 20rpx 30rpx;
	padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	border-top: 1px solid #f0f0f0;
	z-index: 100;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: linear-gradient(to right, #FF8C00, #FF6B00);
	color: white;
	border-radius: 44rpx;
	font-size: 32rpx;
	border: none;
	&::after {
		border: none;
	}
}
</style>