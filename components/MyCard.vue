<template>
  <view class="name-card">
    <view class="card-top">
      <view class="avatar">
        <image :src="avatar" mode="aspectFill" />
      </view>
      <view class="user-name">{{ name }}</view>
      <view class="user-title">{{ title }}</view>
      <view class="user-company">
        <uni-icons type="location" size="18" color="rgba(255, 255, 255, 0.85)" />
        <text>{{ location }}</text>
      </view>
    </view>
    
    <view class="card-content">
      <view class="info-item" v-for="(item, index) in infoItems" :key="index">
        <view class="info-icon">
          <uni-icons :type="item.icon" size="22" color="#FF7B00" />
        </view>
        <view class="info-content">
          <view class="info-label">{{ item.label }}</view>
          <view class="info-value">{{ item.value }}</view>
        </view>
      </view>
      
      <!-- 新增邀请码部分 -->
      <view class="invite-code" v-if="inviteCode">
        <view class="invite-icon">
          <uni-icons type="compose" size="22" color="#FF7B00" />
        </view>
        <view class="invite-content">
          <view class="info-label">邀请码</view>
          <view class="info-value">{{ inviteCode }}</view>
        </view>
      </view>
      
      <view class="qr-section" v-if="showQrCode">
        <view class="qr-title">我的微信二维码</view>
        <view class="qr-code">
          <image :src="qrCodeUrl" mode="aspectFill" />
        </view>
        <view class="qr-hint">扫码添加我的微信</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  avatar: {
    type: String,
    default: 'https://randomuser.me/api/portraits/men/41.jpg'
  },
  name: {
    type: String,
    default: '张明'
  },
  title: {
    type: String,
    default: '市场总监'
  },
  location: {
    type: String,
    default: '北京市朝阳区'
  },
  infoItems: {
    type: Array,
    default: () => [
      {
        icon: 'contact',
        label: '职业',
        value: '市场总监'
      },
      {
        icon: 'shop',
        label: '公司/机构',
        value: '创新科技有限公司'
      },
      {
        icon: 'phone',
        label: '联系方式',
        value: '+86 138 0013 8000'
      },
      {
        icon: 'info',
        label: '个人简介',
        value: '拥有10年市场营销经验，专注于品牌策略与数字营销，曾服务多家世界500强企业。'
      }
    ]
  },
  showQrCode: {
    type: Boolean,
    default: true
  },
  qrCodeUrl: {
    type: String,
    default: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=weixin://dl/business/?t=abcdefghijk'
  },
  inviteCode: {
    type: String,
    default: 'INV2023'  // 新增邀请码属性
  }
});
</script>

<style lang="scss" scoped>
/* 名片卡片 */
.name-card {
  background: white;
  border-radius: 50rpx;
  overflow: hidden;
  box-shadow: 0 30rpx 70rpx rgba(0, 0, 0, 0.15);
  position: relative;
  margin-bottom: 60rpx;
  width: 100%;
  max-width: 1000rpx;
  animation: fadeInUp 0.6s ease-out;
}

.card-top {
  background: linear-gradient(135deg, #FF7B00, #FF5E00);
  padding: 80rpx 60rpx 200rpx;
  position: relative;
  text-align: center;
}

.avatar {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #ffb347, #ffcc33);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.4);
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.2);
  
  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-name {
  font-size: 52rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 8rpx rgba(0,0,0,0.2);
}

.user-title {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10rpx;
}

.user-company {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    margin-left: 10rpx;
  }
}

.card-content {
  background: white;
  padding: 160rpx 60rpx 80rpx;
  margin-top: -140rpx;
  border-radius: 50rpx 50rpx 0 0;
  position: relative;
  z-index: 2;
}

.info-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
  animation: fadeInUp 0.5s ease-out;
  animation-fill-mode: both;
  
  &:last-child {
    border-bottom: none;
  }
}

/* 新增邀请码样式 */
.invite-code {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
  animation: fadeInUp 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: 0.5s;
  
  .invite-icon {
    width: 100rpx;
    height: 100rpx;
    background: rgba(255, 123, 0, 0.1);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
  }
  
  .invite-content {
    flex: 1;
    
    .info-label {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    .info-value {
      font-size: 34rpx;
      font-weight: 500;
      color: #333;
    }
  }
}

.info-icon {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 123, 0, 0.1);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.info-value {
  font-size: 34rpx;
  font-weight: 500;
  color: #333;
}

.qr-section {
  text-align: center;
  padding: 60rpx 0 40rpx;
  border-top: 2rpx solid #f0f0f0;
  margin-top: 40rpx;
}

.qr-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #444;
  margin-bottom: 30rpx;
}

.qr-code {
  width: 320rpx;
  height: 320rpx;
  background: #f8f8f8;
  border-radius: 30rpx;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #999;
  overflow: hidden;
  border: 2rpx solid #eee;
  
  image {
    max-width: 100%;
    max-height: 100%;
  }
}

.qr-hint {
  font-size: 28rpx;
  color: #777;
  margin-top: 30rpx;
}

/* 动画效果 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.info-item:nth-child(1) { animation-delay: 0.1s; }
.info-item:nth-child(2) { animation-delay: 0.2s; }
.info-item:nth-child(3) { animation-delay: 0.3s; }
.info-item:nth-child(4) { animation-delay: 0.4s; }

/* 响应式设计 */
@media (max-width: 480px) {
  .card-top {
    padding: 60rpx 40rpx 160rpx;
  }
  
  .avatar {
    width: 180rpx;
    height: 180rpx;
  }
  
  .user-name {
    font-size: 44rpx;
  }
  
  .card-content {
    padding: 140rpx 40rpx 60rpx;
  }
}
</style>