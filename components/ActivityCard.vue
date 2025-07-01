<template>
  <view class="activity-card">
    <!-- 将点击事件的参数传入 -->
    <view @click="detailActivity(activity.id)">
      <!-- 绑定正确的图片字段 -->
      <image :src="activity.coverImageUrl" class="activity-image" mode="aspectFill" />
      <!-- 绑定正确的标题字段 -->
      <text class="activity-title">{{ activity.activityTitle }}</text>
      
      <view class="activity-info">
        <uni-icons type="calendar" size="16" color="#FF6B00" />
        <!-- 使用格式化后的日期 -->
        <text>{{ formattedDate }}</text>
      </view>
      
      <view class="activity-info">
        <uni-icons type="map-pin" size="16" color="#FF6B00" />
        <!-- 绑定正确的地点字段 (locationAddress) -->
        <text>{{ activity.locationAddress || '线上活动' }}</text>
      </view>
      
      <view class="activity-stats">
        <view class="participants">
          <!-- 绑定正确的报名人数(joinCount)和总名额(totalSlots) -->
          {{ activity.joinCount || 0 }}/{{ activity.totalSlots || '不限' }} 人参与
        </view>
      </view>
      
      <view class="activity-tags">
        <!-- 后端返回的 tags 是一个数组，可以直接使用 -->
        <view v-for="(tag, index) in activity.tags" :key="index" class="tag">
          {{ tag }}
        </view>
      </view>
     
    </view>
    
    <view class="activity-footer">
      <view class="organizer">
        <uni-icons type="person" size="16" color="#FF6B00" />
        <!-- 绑定正确的组织者字段 (organizerUnitName) -->
        <text>{{ activity.organizerUnitName || '主办方' }}</text>
      </view>
      <view class="action-buttons">
        <!-- 【修改】添加 :disabled="loading" 防止重复点击 -->
        <button class="btn btn-favorite" @click.stop="toggleFavorite" :disabled="loading">
          <uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="16" color="#FF6B00" />
          <text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </button>
        <button class="btn btn-primary" @click.stop="registerActivity(activity.id)">报名</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';
// 【新增】导入你的请求工具
import request from '../utils/request.js'; 

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

// 【修改】定义 emits，用于通知父组件刷新列表
const emit = defineEmits(['refreshList']);

// 根据 props.activity.followFlag 初始化 isFavorite 的状态
const isFavorite = ref(props.activity.followFlag === 1);

// 【新增】添加一个加载状态，防止用户在请求期间重复点击
const loading = ref(false);

const formattedDate = computed(() => {
	if (!props.activity.startDatetime) {
		return '时间待定';
	}
	const date = new Date(props.activity.startDatetime);
	const Y = date.getFullYear();
	const M = (date.getMonth() + 1).toString().padStart(2, '0');
	const D = date.getDate().toString().padStart(2, '0');
	const h = date.getHours().toString().padStart(2, '0');
	const m = date.getMinutes().toString().padStart(2, '0');
	return `${Y}-${M}-${D} ${h}:${m}`;
});

// 【修改】重写 toggleFavorite 函数，使其成为一个异步函数来处理 API 请求
const toggleFavorite = async () => {
  // 如果正在请求中，则直接返回
  if (loading.value) {
    return;
  }
  loading.value = true;

  // 从本地存储获取用户ID
  const userId = uni.getStorageSync('userId');
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    loading.value = false;
    return;
  }
  
  // 根据当前收藏状态决定调用哪个接口
  const isCurrentlyFavorite = isFavorite.value;
  const endpoint = isCurrentlyFavorite ? '/app-api/member/follow/del' : '/app-api/member/follow/add';
  const successMessage = isCurrentlyFavorite ? '已取消收藏' : '收藏成功';

  // 构造请求体
  const payload = {
    userId: userId,
    targetId: props.activity.id,
    targetType: "activity" // 固定为 activity
  };

  try {
    const result = await request(endpoint, {
      method: 'POST',
      data: payload
    });

    if (result && !result.error) {
      // API 调用成功
      uni.showToast({
        title: successMessage,
        icon: 'success'
      });
      // 发送事件通知父组件刷新列表
      emit('refreshList');
    } else {
      // API 调用失败，显示错误信息
      uni.showToast({
        title: result.error || '操作失败，请重试',
        icon: 'none'
      });
    }
  } catch (error) {
    // 网络或其他异常
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none'
    });
  } finally {
    // 无论成功或失败，最后都将加载状态设为 false
    // 注意：因为父组件会刷新，此处的 loading 状态会自动重置，但这样做更健壮
    loading.value = false;
  }
};


const registerActivity = (activityId) => {
  uni.navigateTo({
    url:`/pages/active-enroll/active-enroll?id=${activityId}`
  })
};

const detailActivity = (activityId) => {
  console.log('准备跳转到详情页，活动ID:', activityId); // 增加一个打印，方便调试
  uni.navigateTo({
    // 关键在这里：将 activityId 拼接到 url 的查询参数中
    url: `/pages/active-detail/active-detail?id=${activityId}` 
  });
};
</script>

<style lang="scss" scoped>
/* 您的样式代码保持不变 */
.activity-card {
  background: white;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
  padding: 32rpx;
  margin: 32rpx auto;
  position: relative;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: 320rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.activity-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: #1c1e21;
  display: block;
}

.activity-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  color: #606770;
  font-size: 28rpx;
  
  text {
    margin-left: 16rpx;
  }
}

.activity-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  font-size: 26rpx;
  color: #65676b;
}

.participants {
  background: #f0f2f5;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.activity-tags {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
}

.tag {
  background: #fff0e5;
  color: #FF6B00;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: 2rpx solid #ffdcc7;
}

/* 底部区域样式 */
.activity-footer {
  display: flex;
  justify-content: space-between; /* 左右两端对齐 */
  align-items: center; /* 垂直居中 */
  margin-top: 30rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f2f5; /* 添加分割线 */
}

.organizer {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #606770;
  
  text {
    margin-left: 10rpx;
  }
}

/* 按钮区域样式 */
.action-buttons {
  display: flex;
  gap: 24rpx; /* 恢复按钮间距 */
}

/* 基础按钮样式 */
.btn {
  padding: 8rpx 36rpx;
  border-radius: 12rpx;
  font-weight: 500;
  font-size: 28rpx;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  
  text {
    margin-left: 10rpx;
  }
}

/* 主要按钮样式 (报名按钮) */
.btn-primary {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  
  &:active {
    opacity: 0.9;
    transform: translateY(-4rpx);
  }
}

/* 收藏按钮样式 */
.btn-favorite {
  background: #ffe7d8;
  color: #FF6B00;
  
  &:active {
    opacity: 0.9;
    transform: translateY(-4rpx);
  }
}
</style>