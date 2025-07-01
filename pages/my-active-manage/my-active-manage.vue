<template>
  <view class="refund-manage-page">
    <!-- 顶部警告栏 -->
    <view class="warning-banner">
      <uni-icons type="info-filled" color="#FF6B00" size="18"></uni-icons>
      <text>{{ bannerText }}</text>
    </view>

    <!-- 活动信息卡片 -->
    <view class="card activity-card">
      <view class="card-title">活动信息</view>
      <view class="activity-details">
        <image :src="activityInfo.image" class="activity-image" mode="aspectFill" />
        <view class="info-text-group">
          <view class="activity-title">{{ activityInfo.title }}</view>
          <view class="info-line">
            <uni-icons type="calendar-filled" color="#999" size="16"></uni-icons>
            <text>{{ activityInfo.date }}</text>
          </view>
          <!-- v-if 仍然保留，作为防止API数据缺失的最后防线 -->
          <view v-if="activityInfo.location" class="info-line">
            <uni-icons type="location-filled" color="#999" size="16"></uni-icons>
            <text>{{ activityInfo.location }}</text>
          </view>
          <view v-if="activityInfo.participants" class="info-line">
            <uni-icons type="staff-filled" color="#999" size="16"></uni-icons>
            <text>{{ activityInfo.participants.current }}人报名</text>
          </view>
        </view>
      </view>
      <view v-if="activityInfo.totalRefundAmount" class="divider"></view>
      <view v-if="activityInfo.totalRefundAmount" class="refund-total">
        <text class="label">需退款总额</text>
        <text class="amount">¥{{ activityInfo.totalRefundAmount }}</text>
      </view>
    </view>
    
    <!-- 选项卡 -->
    <view class="tabs-container">
       <view 
         :class="['tab-item', { 'active': currentTab === 0 }]"
         @click="switchTab(0)"
       >
         待处理
       </view>
       <view
         :class="['tab-item', { 'active': currentTab === 1 }]"
         @click="switchTab(1)"
       >
         已完成
       </view>
    </view>

    <!-- 用户列表 -->
    <scroll-view scroll-y class="list-scroll-view">
      <!-- 待处理列表 -->
      <view v-show="currentTab === 0">
        <view class="list-header">
          <uni-icons type="person-filled" color="#FF6B00" size="20"></uni-icons>
          <text>待退款用户 ({{ pendingUsers.length }}人)</text>
        </view>
        <view v-if="pendingUsers.length > 0" class="list-content">
           <view v-for="user in pendingUsers" :key="user.id" class="card item-card">
            <view class="user-info">
              <image :src="user.avatar" class="avatar" mode="aspectFill" />
              <text class="name">{{ user.name }}</text>
            </view>
            <view class="qr-code-section">
              <view class="section-title">用户收款码</view>
              <image 
                :src="user.qrCodeUrl" 
                class="qr-code-image" 
                mode="aspectFit"
                @click="previewImage(user.qrCodeUrl)"
              />
            </view>
            <view class="proof-section">
              <button class="upload-proof-btn" @click="uploadProof(user)">
                <uni-icons type="plusempty" color="#FF6B00" size="16"></uni-icons>
                上传转账凭证
              </button>
            </view>
          </view>
        </view>
        <view v-else class="list-empty">
          <text>所有用户退款均已处理完毕 🎉</text>
        </view>
      </view>

      <!-- 已完成列表 -->
       <view v-show="currentTab === 1">
        <view class="list-header">
           <uni-icons type="checkbox-filled" color="#4caf50" size="20"></uni-icons>
           <text>已完成退款 ({{ completedUsers.length }}人)</text>
        </view>
         <view v-if="completedUsers.length > 0" class="list-content">
           <view v-for="user in completedUsers" :key="user.id" class="card item-card">
             <view class="user-info">
              <image :src="user.avatar" class="avatar" mode="aspectFill" />
              <text class="name">{{ user.name }}</text>
              <view class="status-badge completed">已完成</view>
            </view>
            <view class="proof-display">
              <view class="section-title">退款凭证</view>
              <image 
                :src="user.refundProofUrl" 
                class="proof-image" 
                mode="aspectFit"
                @click="previewImage(user.refundProofUrl)"
              />
            </view>
          </view>
        </view>
        <view v-else class="list-empty">
          <text>暂无已完成的退款记录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const currentTab = ref(0);
const activityInfo = ref({});
const participantList = ref([]);
const bannerText = ref('');

const pendingUsers = computed(() => 
  participantList.value.filter(u => u.refundStatus === 'pending')
);
const completedUsers = computed(() => 
  participantList.value.filter(u => u.refundStatus === 'completed')
);

onLoad((options) => {
  const activityId = options.id;
  const mode = options.mode;

  // --- 核心修正点在这里 ---
  // 1. 先加载通用的、完整的活动信息
  // API 请求示例: fetchActivityDetails(activityId)
  activityInfo.value = {
      id: activityId,
      title: '宠物爱好者交流聚会',
      image: '../../static/abc.png',
      date: '2023年12月2日 10:00-14:00',
      location: '人民公园草坪区',
      participants: { current: 23, total: 30 },
      totalRefundAmount: '4,554.00'
  };

  // 2. 再根据 mode 加载不同的用户列表和提示文字
  if (mode === 'individual') {
    bannerText.value = '请为提交申请的用户办理退款';
    
    // API 请求示例: fetchRefundApplicants(activityId)
    // 模拟数据：仅加载申请退款的用户
    participantList.value = [
      { id: 201, name: '赵六', avatar: '../../static/avatar4.png', qrCodeUrl: '../../static/qrcode.png', refundProofUrl: null, refundStatus: 'pending' },
      { id: 202, name: '孙七', avatar: '../../static/avatar5.png', qrCodeUrl: '../../static/qrcode.png', refundProofUrl: null, refundStatus: 'pending' },
      // 注意：这里也可以包含已处理的申请，让组织者能在“已完成”tab里看到
      { id: 203, name: '周八', avatar: '../../static/avatar6.png', qrCodeUrl: '../../static/qrcode.png', refundProofUrl: '../../static/proof.png', refundStatus: 'completed' },
    ];

  } else { // mode === 'all'
    bannerText.value = '活动已取消，请为报名用户办理退款';

    // API 请求示例: fetchAllParticipants(activityId)
    // 模拟数据：加载所有报名用户
    participantList.value = [
      { id: 101, name: '张三', avatar: '../../static/avatar1.png', qrCodeUrl: '../../static/qrcode.png', refundProofUrl: null, refundStatus: 'pending' },
      { id: 102, name: '李四', avatar: '../../static/avatar2.png', qrCodeUrl: '../../static/qrcode.png', refundProofUrl: '../../static/proof.png', refundStatus: 'completed' },
      { id: 103, name: '王五', avatar: '../../static/avatar3.png', qrCodeUrl: '../../static/qrcode.png', refundProofUrl: null, refundStatus: 'pending' },
    ];
  }
});

const switchTab = (index) => {
  currentTab.value = index;
}

const previewImage = (url) => {
  if (!url) return;
  uni.previewImage({
    urls: [url],
  });
};

const uploadProof = (user) => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      uni.showLoading({ title: '正在上传' });
      
      setTimeout(() => {
        const targetUser = participantList.value.find(u => u.id === user.id);
        if (targetUser) {
          targetUser.refundProofUrl = tempFilePath;
          targetUser.refundStatus = 'completed';
        }
        uni.hideLoading();
        uni.showToast({
          title: '凭证上传成功',
          icon: 'success'
        });
      }, 1000);
    }
  });
};
</script>

<style lang="scss" scoped>
.refund-manage-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.warning-banner {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: #fffbe6;
  color: #d46b08;
  font-size: 26rpx;
  flex-shrink: 0;
  
  text {
    margin-left: 12rpx;
  }
}

.card {
  background-color: #fff;
  margin: 0 24rpx 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-sizing: border-box;
}

.activity-card {
  margin-top: 24rpx;
  
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

  .activity-details {
    display: flex;
    align-items: flex-start;
  }
  
  .activity-image {
    width: 140rpx;
    height: 140rpx;
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
    margin-bottom: 8rpx;
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
    margin: 24rpx 0;
  }

  .refund-total {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label {
      font-size: 28rpx;
      color: #666;
    }
    .amount {
      font-size: 40rpx;
      font-weight: bold;
      color: #FF6B00;
    }
  }
}

.tabs-container {
  display: flex;
  background-color: #fff;
  margin: 0 24rpx 24rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #666;
    position: relative;
    transition: color 0.3s, font-weight 0.3s;
    
    &.active {
      color: #FF6B00;
      font-weight: 600;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background-color: #FF6B00;
        border-radius: 3rpx;
      }
    }
  }
}

.list-scroll-view {
  flex: 1;
  height: 1px;
}

.list-content {
    padding: 0 24rpx;
    padding-bottom: 24rpx;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 0 8rpx 24rpx 8rpx;
  
  uni-icons {
    margin-right: 12rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.item-card {
  margin: 0 0 24rpx 0;
  padding: 24rpx;

  .user-info {
    display: flex;
    align-items: center;
    padding-bottom: 24rpx;
    margin-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f2f5;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }
    .name {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
    .status-badge {
      margin-left: auto;
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
      &.completed {
        background-color: #e8f5e9;
        color: #4caf50;
      }
    }
  }

  .section-title {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .qr-code-section {
    .qr-code-image {
      width: 200rpx;
      height: 200rpx;
      border-radius: 8rpx;
      background-color: #f5f5f5;
      border: 1rpx solid #eee;
    }
  }

  .proof-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f2f5;
    .upload-proof-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      color: #FF6B00;
      border: 1rpx solid #FF6B00;
      height: 64rpx;
      line-height: 64rpx;
      padding: 0 24rpx;
      font-size: 26rpx;
      border-radius: 32rpx;
      margin: 0;
      &:after { border: none; }
    }
  }
  
  .proof-display {
    .proof-image {
      width: 150rpx;
      height: 150rpx;
      border-radius: 8rpx;
    }
  }
}

.list-empty {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>