<template>
  <view class="container">
    <view class="card-header">
      <view class="header-title">我的个人名片</view>
      <view class="header-subtitle">专业形象，随时分享</view>
    </view>
    
    <MyCard />
	
	<view class="">
		名片信息可在个人资料中编辑
	</view>
    
    <view class="action-buttons">
      <button class="action-btn share-btn" @click="shareCard">
        <uni-icons type="share" size="20" color="#fff" />
        <text>分享名片</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import MyCard from '../../components/MyCard.vue';

// 分享名片功能
const shareCard = () => {
  uni.showToast({
    title: '名片分享功能已激活！',
    icon: 'success'
  });
};
</script>

<style lang="scss" scoped>
/* 单位转换：1px = 2rpx */
.container {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #333;
  line-height: 1.6;
  padding: 40rpx 30rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .header-title {
    font-size: 56rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .header-subtitle {
    color: #777;
    font-size: 32rpx;
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 30rpx;
  margin-top: 60rpx;
  width: 100%;
  max-width: 1000rpx;
}

.action-btn {
  flex: 1;
  padding: 22rpx;
  border-radius: 30rpx;
  font-size: 32rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: white;
  
  text {
    margin-left: 16rpx;
  }
}

.share-btn {
  background: linear-gradient(to right, #3a7bd5, #00d2ff);
  box-shadow: 0 10rpx 30rpx rgba(58, 123, 213, 0.3);
}

.action-btn:active {
  transform: translateY(-6rpx);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.2);
}
</style>