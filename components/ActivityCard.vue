<template>
  <view class="activity-card">
    <view @click="detailActivity()">
      <image :src="activity.image" class="activity-image" mode="aspectFill" />
      <text class="activity-title">{{ activity.title }}</text>
      
      <view class="activity-info">
        <uni-icons type="calendar" size="16" color="#FF6B00" />
        <text>{{ activity.date }}</text>
      </view>
      
      <view class="activity-info">
        <uni-icons type="map-pin" size="16" color="#FF6B00" />
        <text>{{ activity.location }}</text>
      </view>
      
      <view class="activity-stats">
        <view class="participants">{{ activity.participants.current }}/{{ activity.participants.total }} 人参与</view>
      </view>
      
      <view class="activity-tags">
        <view v-for="(tag, index) in activity.tags" :key="index" class="tag">
          {{ tag }}
        </view>
      </view>
    </view>
    
    <view class="activity-footer">
      <view class="organizer">
        <uni-icons type="person" size="16" color="#FF6B00" />
        <text>{{ activity.organizer }}</text>
      </view>
      <view class="action-buttons">
        <button class="btn btn-favorite" @click.stop="toggleFavorite">
          <uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="16" color="#FF6B00" />
          <text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </button>
        <button class="btn btn-primary" @click.stop="registerActivity">报名</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['favorite']);

const isFavorite = ref(false);

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  emit('favorite', isFavorite.value);
};

const registerActivity = () => {
  uni.navigateTo({
    url:'/pages/active-enroll/active-enroll'
  })
};

// 活动详情
const detailActivity = () => {
  uni.navigateTo({
    url: '/pages/active-detail/active-detail'
  });
};
</script>

<style lang="scss" scoped>
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