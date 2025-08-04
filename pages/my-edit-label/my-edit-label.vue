<template>
	<view class="container">
		<view class="page-header">
			<text class="page-title">我的数字标签</text>
			<text class="page-subtitle">请对自己以下维度的表现进行1-10分评估</text>
		</view>

		<!-- 评分区域 -->
		<view class="score-sections">
			<view class="section-card" v-for="category in scoreCategories" :key="category.title">
				<view class="section-header">
					<text class="section-title">{{ category.title }}</text>
				</view>
				<view class="section-content">
					<view class="score-item" v-for="item in category.items" :key="item.key">
						<text class="item-label">{{ item.label }}</text>
						<!-- v-model="scores[item.key]" 将自动显示从接口获取的分数 -->
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
			<button class="submit-btn" :disabled="isSubmitting" @click="submitScores">
				{{ isSubmitting ? '保存中...' : '保存评分' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request.js';

// 【修改】完善评分API的封装
const ScoreApi = {
  /**
   * 保存或更新用户评分
   * @param {object} scoreData
   */
  saveOrUpdate: (scoreData) => {
    // 假设接口是 /saveOrUpdate，请根据实际情况修改
    return request('/app-api/member/user-scores/saveOrUpdate', {
      method: 'POST',
      data: scoreData
    });
  },
  /**
   * 获取用户评分
   * @param {string|number} userId
   */
  getMyScores: (userId) => {
    return request('/app-api/member/user-scores/getInfo', {
      method: 'GET',
      data: { userId: userId }
    });
  }
};

// 评分项结构定义 (无变化)
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

// 存储所有评分项的分数 (无变化)
const scores = ref({
  punctuality: 0, promiseKeep: 0, lawAbiding: 0, responsible: 0,
  sincere: 0, tolerance: 0, altruism: 0, empathy: 0,
  focus: 0, efficient: 0, detailOriented: 0, expandVision: 0,
  contribution: 0, humility: 0, foresight: 0, mission: 0
});

const scoreRecordId = ref(null); // 存储已有评分记录的ID
const isSubmitting = ref(false); // 防止重复提交

/**
 * 【核心修改】页面加载时，获取用户ID并拉取已有评分
 */
onMounted(async () => {
  const userInfo = uni.getStorageSync('userInfo');
  const userId = uni.getStorageSync('userId');

  if (!userId) {
    uni.showToast({ title: '无法获取用户信息，请重新登录', icon: 'none' });
    return;
  }
  
  uni.showLoading({ title: '正在加载评分...' });
  const { data: userScores, error } = await ScoreApi.getMyScores(userId);
  uni.hideLoading();

  if (error) {
    // 接口报错，不影响用户进行首次评分
    console.warn('获取已有评分失败:', error);
    return;
  }

  if (userScores) {
    // 如果成功获取到数据，则填充表单
    console.log('成功获取到已有评分:', userScores);
    scoreRecordId.value = userScores.id; // 保存记录ID，用于更新
    // 遍历 scores.value 的所有 key，并用返回的数据填充
    Object.keys(scores.value).forEach(key => {
      if (userScores[key] !== undefined && userScores[key] !== null) {
        scores.value[key] = userScores[key];
      }
    });
  } else {
    // 接口成功，但data为null，说明是新用户，第一次评分
    console.log('用户尚未评分，将使用默认值。');
  }
});

/**
 * 【修改】提交评分的方法
 */
const submitScores = async () => {
  if (isSubmitting.value) return;
  
  const userInfo = uni.getStorageSync('userInfo');
  const userId = uni.getStorageSync('userId');

  if (!userId) {
    uni.showToast({ title: '无法获取用户信息，请重新登录', icon: 'none' });
    return;
  }
  
  isSubmitting.value = true;
  uni.showLoading({ title: '正在保存...' });

  const payload = {
    ...scores.value,
    id: scoreRecordId.value, // 如果是首次评分，id为null
    userId: userId,
    scorerId: userId
  };

  // 【注意】请确保保存接口的地址是正确的
  const { data: newRecord, error } = await ScoreApi.saveOrUpdate(payload);
  
  uni.hideLoading();
  isSubmitting.value = false;

  if (error) {
    console.error('评分保存失败:', error);
    uni.showToast({ title: `保存失败: ${error}`, icon: 'none' });
    return;
  }

  uni.showToast({ title: '保存成功！', icon: 'success' });
  
  // 接口文档未明确指出保存接口是否返回新的ID，如果返回，可以更新
  if (newRecord && newRecord.id) {
	  scoreRecordId.value = newRecord.id;
  }
  
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style scoped lang="scss">
/* 样式无变化，保持原样 */
.container {
	background-color: #f9f9f9;
	min-height: 100vh;
	padding: 30rpx 30rpx 140rpx;
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
	&[disabled] {
		opacity: 0.6;
	}
	&::after {
		border: none;
	}
}
</style>