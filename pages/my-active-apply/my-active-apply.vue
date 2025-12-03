<template>
  <view class="refund-apply-page">
    <!-- 顶部信息栏 -->
    <view class="info-banner">
      <uni-icons type="info-filled" color="#FF6B00" size="18"></uni-icons>
      <text>您正在为以下聚会申请退款</text>
    </view>
    
    <!-- 聚会信息卡片 -->
    <view class="card activity-card">
      <view class="card-title">退款聚会</view>
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
        <text>请上传微信收款码，以便组织者能准确向您退款。</text>
      </view>
      <view class="file-picker-wrapper">
        <uni-file-picker 
          v-model="qrCodeImage"
          file-mediatype="image"
          mode="grid"
          :limit="1"
          @select="handleImageSelect"
          @delete="handleImageDelete"
          title="点击上传收款码"
        />
      </view>
    </view>
    
    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="handleSubmit" :disabled="!qrCodeUrl">提交申请</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
// 导入我们之前已经熟悉的上传和请求工具
// 路径修正：请确保与您的项目结构一致
import uploadFile from '../../utils/upload.js'; 
import request from '../../utils/request.js';

// --- 数据状态 ---
const fullActivityData = ref(null); 
const activityInfo = ref({});
const qrCodeImage = ref([]); // 仍然需要，用于 uni-file-picker 的 v-model
const qrCodeUrl = ref(''); // 用于存储最终要提交的图片 URL

// --- 页面加载逻辑 ---
onLoad((options) => {
  if (options.item) {
    try {
      const decodedData = decodeURIComponent(options.item);
      const parsedData = JSON.parse(decodedData);
      
      fullActivityData.value = parsedData;
      
      activityInfo.value = {
        id: parsedData.id,
        title: parsedData.activityTitle,
        image: parsedData.coverImageUrl,
        date: formatDateTime(parsedData.startDatetime), 
        fee: parsedData.registrationFee.toFixed(2) 
      };

      // 【核心新增】在获取到聚会信息后，立即检查是否已存在退款信息
      fetchExistingRefundInfo();

    } catch (e) {
      console.error("解析聚会数据失败:", e);
      uni.showToast({ title: '加载聚会信息失败', icon: 'none' });
    }
  } else {
    console.error("未从上个页面接收到聚会信息");
    uni.showToast({ title: '无法获取聚会信息', icon: 'none' });
  }
});

// --- 【核心新增】获取已存在的退款信息 ---
const fetchExistingRefundInfo = async () => {
    // 确保我们有查询所需的 ID
    if (!fullActivityData.value || !fullActivityData.value.memberActivityJoinResp) {
        return;
    }

    const params = {
        activityId: fullActivityData.value.id,
        userId: fullActivityData.value.memberActivityJoinResp.userId,
        pageNo: 1,
        pageSize: 10 // 通常只会有一条记录，10足够
    };

    const result = await request('/app-api/member/activity-join/list', {
        method: 'GET',
        data: params
    });

    if (result.data && result.data.list && result.data.list.length > 0) {
        const existingRecord = result.data.list[0];
        
        // 如果后端返回了收款码 URL，我们就用它来填充页面
        if (existingRecord.refundScreenshotUrl) {
            console.log('发现已存在的收款码:', existingRecord.refundScreenshotUrl);
            
            // 1. 更新我们将要提交的 URL
            qrCodeUrl.value = existingRecord.refundScreenshotUrl;
            
            // 2. 更新用于 uni-file-picker 显示的 v-model
            // uni-file-picker 的 v-model 需要一个特定格式的对象数组
            qrCodeImage.value = [{
                name: 'existing_qrcode.png', // 给个默认文件名
                extname: 'png',
                url: existingRecord.refundScreenshotUrl // 关键是这个 URL
            }];
        }
    }
};

// --- 辅助函数 (无修改) ---
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '时间待定';
  const date = new Date(dateTimeStr);
	const Y = date.getFullYear();
	const M = (date.getMonth() + 1).toString().padStart(2, '0');
	const D = date.getDate().toString().padStart(2, '0');
	const h = date.getHours().toString().padStart(2, '0');
	const m = date.getMinutes().toString().padStart(2, '0');
	return `${Y}-${M}-${D} ${h}:${m}`;
};

// --- 图片处理逻辑 (无修改) ---
const handleImageSelect = async (e) => {
  const tempFilePath = e.tempFiles[0];
  uni.showLoading({ title: '上传中...', mask: true });
  
  const result = await uploadFile(tempFilePath, { directory: 'refund_qrcode' });
  
  uni.hideLoading();

  if (result.data) {
    qrCodeUrl.value = result.data;
    uni.showToast({ title: '上传成功', icon: 'success' });
  } else {
    qrCodeImage.value = [];
    qrCodeUrl.value = '';
    uni.showToast({ title: result.error || '上传失败', icon: 'none' });
  }
};

const handleImageDelete = () => {
  qrCodeImage.value = [];
  qrCodeUrl.value = '';
};

// --- 提交逻辑 (无修改) ---
const handleSubmit = async () => {
  if (!qrCodeUrl.value) {
    uni.showToast({ title: '请先上传收款码', icon: 'none' });
    return;
  }
  
  if (!fullActivityData.value || !fullActivityData.value.memberActivityJoinResp) {
      uni.showToast({ title: '报名信息不完整，无法申请', icon: 'none' });
      return;
  }

  uni.showLoading({ title: '正在提交...' });

  const payload = {
    id: fullActivityData.value.memberActivityJoinResp.id, 
    activityId: fullActivityData.value.id,
    refundScreenshotUrl: qrCodeUrl.value
  };
    
  const submitResult = await request('/app-api/member/activity-join/upload-refund-screenshot-url', {
    method: 'POST',
    data: payload
  });
  
  uni.hideLoading();

  if (submitResult.error) {
    uni.showToast({ title: `申请失败: ${submitResult.error}`, icon: 'none' });
  } else {
    uni.showModal({
      title: '提交成功',
      content: '您的退款申请已提交，请耐心等待组织者处理。',
      showCancel: false,
      success: () => {
        uni.navigateBack();
      }
    });
  }
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