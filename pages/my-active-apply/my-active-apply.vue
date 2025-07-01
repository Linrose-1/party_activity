<template>
  <view class="refund-apply-page">
    <!-- 顶部信息栏 -->
    <view class="info-banner">
      <uni-icons type="info-filled" color="#FF6B00" size="18"></uni-icons>
      <text>您正在为以下活动申请退款</text>
    </view>
    
    <!-- 活动信息卡片 -->
    <view class="card activity-card">
      <view class="card-title">退款活动</view>
      <view class="activity-details">
        <image :src="activityInfo.image" class="activity-image" mode="aspectFill" />
        <view class="info-text-group">
          <view class="activity-title">{{ activityInfo.title }}</view>
          <view class="info-line">
            <uni-icons type="calendar-filled" color="#999" size="16"></uni-icons>
            <text>{{ activityInfo.date }}</text>
          </view>
        </view>
      </view>
      <view class="divider"></view>
      <view class="refund-amount">
        <text class="label">退款金额</text>
        <text class="amount">¥{{ activityInfo.fee }}</text>
      </view>
    </view>
    
    <!-- 上传收款码卡片 -->
    <view class="card upload-card">
      <view class="card-title">上传收款码</view>
      <view class="upload-notice">
        <text>请上传微信或支付宝收款码，以便组织者能准确向您退款。</text>
      </view>
      <view class="file-picker-wrapper">
        <uni-file-picker 
          v-model="qrCodeImage"
          file-mediatype="image"
          mode="grid"
          :limit="1"
          @select="handleImageSelect"
          title="点击上传收款码"
        />
      </view>
    </view>
    
    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="handleSubmit" :disabled="!qrCodeImage || qrCodeImage.length === 0">提交申请</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const activityInfo = ref({});
const qrCodeImage = ref([]); // uni-file-picker v-model绑定的是数组

onLoad((options) => {
  const activityId = options.id;
  // TODO: 实际项目中，应根据 activityId 从服务器获取活动信息
  // 这里使用模拟数据
  activityInfo.value = {
    id: activityId,
    title: '城市摄影行走 - 发现老街角的故事',
    image: '../../static/abc.png', // 增加了图片字段
    date: '2023年12月10日 14:00-17:00',
    fee: '99.00'
  };
});

const handleImageSelect = (e) => {
  console.log('选择了图片:', e.tempFiles);
};

const handleSubmit = () => {
  if (!qrCodeImage.value || qrCodeImage.value.length === 0) {
    uni.showToast({
      title: '请上传收款码',
      icon: 'none'
    });
    return;
  }
  
  // TODO: 实际项目中，这里会将图片上传到服务器，并将图片URL和退款申请信息提交
  console.log('提交的图片信息:', qrCodeImage.value[0]);

  uni.showLoading({
    title: '正在提交...'
  });

  setTimeout(() => {
    uni.hideLoading();
    uni.showModal({
      title: '提交成功',
      content: '您的退款申请已提交，请耐心等待组织者处理。',
      showCancel: false,
      success: () => {
        // 返回上一页并可能需要刷新上一页的状态
        uni.navigateBack();
      }
    });
  }, 1500);
};
</script>

<style lang="scss" scoped>
.refund-apply-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 160rpx; // 为底部按钮留出空间
  box-sizing: border-box;
}

.info-banner {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fffbe6;
  color: #d46b08;
  font-size: 26rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  
  text {
    margin-left: 12rpx;
  }
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1c1e21;
  position: relative;
  padding-left: 24rpx;
  margin-bottom: 24rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 32rpx;
    background-color: #FF6B00;
    border-radius: 4rpx;
  }
}

.activity-card {
  .activity-details {
    display: flex;
    align-items: flex-start;
  }
  
  .activity-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .info-text-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  
  .activity-title {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .info-line {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #666;
    text {
      margin-left: 12rpx;
    }
  }

  .divider {
    height: 1rpx;
    background-color: #f0f2f5;
    margin: 32rpx 0;
  }

  .refund-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label {
      font-size: 28rpx;
      color: #666;
    }
    .amount {
      font-size: 44rpx;
      font-weight: bold;
      color: #FF6B00;
    }
  }
}

.upload-card {
  .upload-notice {
    font-size: 26rpx;
    color: #999;
    line-height: 1.6;
    margin-bottom: 32rpx;
  }
  
  .file-picker-wrapper {
    // 覆盖组件内部样式以达到更好效果
    :deep(.uni-file-picker__container) {
      justify-content: center;
    }
    :deep(.file-picker__box) {
       width: 350rpx;
       height: 350rpx;
       border-radius: 16rpx;
    }
    :deep(.file-picker__box-content) {
      border-radius: 16rpx;
    }
  }
}


.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.submit-btn {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  height: 88rpx;
  line-height: 88rpx;
  border: none;

  &::after {
    border: none;
  }
  
  &[disabled] {
    background: #fabca0;
    color: #fff;
    opacity: 0.8;
  }
}
</style>