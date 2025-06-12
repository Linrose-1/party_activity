<template>
  <div class="container">
    <div class="header">
      <h1>科技创新体验营活动报名</h1>
    </div>

    <!-- 步骤指示器 -->
    <div class="step-indicator">
      <div class="step" :class="{ active: currentStep >= 1 }">
        <div class="step-circle">1</div>
        <div class="step-text">填写信息</div>
      </div>
      <div class="step" :class="{ active: currentStep >= 2 }">
        <div class="step-circle">2</div>
        <div class="step-text">支付费用</div>
      </div>
      <div class="step" :class="{ active: currentStep >= 3 }">
        <div class="step-circle">3</div>
        <div class="step-text">完成报名</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <!-- Uni-icons and Uni-easyinput are Uni-UI components.
             In a real Uni-app project, they are typically auto-imported or globally registered.
             For a standalone .vue file in a browser, ensure uni-ui.js is loaded globally. -->
        <uni-icons type="person" size="18" color="#FF6E00"></uni-icons>
        <span>组织者信息</span>
      </div>
      <div class="info-box">
        <div><strong>姓名：</strong> 张经理</div>
        <div><strong>单位：</strong> 创新科技活动策划部</div>
        <div><strong>电话：</strong> 021-68881234</div>
        <div><strong>活动时间：</strong> 2023年12月15日 14:00-17:00</div>
        <div><strong>活动地点：</strong> 科技创新大厦3楼会议厅</div>
      </div>
    </div>

    <!-- 第一步：填写信息 -->
    <div class="section" v-if="currentStep === 1">
      <div class="section-title">
        <uni-icons type="compose" size="18" color="#FF6E00"></uni-icons>
        <span>填写报名信息</span>
      </div>

      <div class="input-item">
        <label for="name">姓名</label>
        <uni-easyinput
          type="text"
          v-model="formData.name"
          placeholder="请输入您的姓名"
          :styles="{ borderColor: '#eee', borderRadius: '12rpx' }"
        ></uni-easyinput>
      </div>

      <div class="input-item">
        <label for="phone">手机号</label>
        <uni-easyinput
          type="tel"
          v-model="formData.phone"
          placeholder="请输入手机号"
          :styles="{ borderColor: '#eee', borderRadius: '12rpx' }"
        ></uni-easyinput>
      </div>

      <div class="input-item">
        <label for="company">单位/学校</label>
        <uni-easyinput
          type="text"
          v-model="formData.company"
          placeholder="请输入单位或学校名称"
          :styles="{ borderColor: '#eee', borderRadius: '12rpx' }"
        ></uni-easyinput>
      </div>

      <button
        class="btn"
        :class="{ 'btn-disabled': !canSubmitStep1 }"
        @click="confirmSignup"
      >
        下一步：支付报名费
      </button>
    </div>

    <!-- 第二步：支付费用 -->
    <div class="section" v-if="currentStep === 2">
      <div class="section-title">
        <uni-icons type="shop" size="18" color="#FF6E00"></uni-icons>
        <span>支付报名费用 <span class="price-tag">¥100.00</span></span>
      </div>

      <div class="qr-code">
        <img
          src="https://img.alicdn.com/imgextra/i1/6000000007751/O1CN01v7zfb41cDU2kq1elG_!!6000000007751-0-tps-248-248.jpg"
          alt="微信支付二维码"
        />
        <div class="qr-note">请使用微信扫码完成支付</div>
      </div>

      <div class="section-title">
        <uni-icons type="image" size="18" color="#FF6E00"></uni-icons>
        <span>上传付款凭证</span>
      </div>

      <div
        class="upload-box"
        :class="{ active: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop="onDrop"
        @click="chooseImage"
      >
        <div v-if="!screenshot">
          <div class="upload-icon">
            <uni-icons type="plus" size="24" color="#FF6E00"></uni-icons>
          </div>
          <div class="upload-text">点击或拖拽上传付款截图</div>
          <div
            class="upload-text"
            style="font-size: 24rpx; margin-top: 10rpx"
          >
            支持JPG、PNG格式，小于5MB
          </div>
        </div>
        <img v-else :src="screenshot" class="preview-image" alt="付款截图" />
      </div>

      <button
        class="btn"
        :class="{ 'btn-disabled': !screenshot }"
        @click="submitForm"
      >
        提交报名信息
      </button>
    </div>

    <!-- 第三步：完成报名 -->
    <div v-if="currentStep === 3">
      <div class="success-message">
        <div class="success-icon">🎉</div>
        <div>恭喜您报名成功！</div>
        <div style="font-size: 28rpx; color: #666; margin-top: 30rpx">
          我们已发送确认短信至您的手机
        </div>
        <div style="font-size: 28rpx; color: #FF6E00; margin-top: 10rpx">
          {{ formData.phone }}
        </div>
      </div>

      <div class="section">
        <div class="info-box">
          <div><strong>活动名称：</strong> 科技创新体验营</div>
          <div><strong>报名编号：</strong> {{ generateTicketNumber() }}</div>
          <div><strong>报名时间：</strong> {{ currentDate }}</div>
          <div><strong>温馨提示：</strong> 请于活动开始前15分钟携带本页面截图签到</div>
        </div>
      </div>

      <button class="btn" @click="backToHome" style="margin: 30rpx">
        返回首页
      </button>
    </div>

    <div class="footer">
      <p>创新科技活动策划部 © 2023 版权所有</p>
      <p>客服电话: 021-68881234 | 服务时间: 9:00-18:00</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'; // ref, computed, reactive are typically auto-imported in <script setup> but explicitly listing them is good practice for clarity.
// In a real Uni-app project, uni-ui components might be globally registered or imported as:
// import { UniEasyinput, UniIcons } from '@dcloudio/uni-ui';
// However, given the original CDN usage, they are assumed to be globally available.

const currentStep = ref(1);
const isDragging = ref(false);
const screenshot = ref(null);

const formData = reactive({
  name: '',
  phone: '',
  company: '',
});

// 获取当前日期
const currentDate = new Date().toLocaleString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).replace(/\//g, '-');

// 检查第一步是否可以提交
const canSubmitStep1 = computed(() => {
  return formData.name.trim() && /^1[3-9]\d{9}$/.test(formData.phone);
});

// 确认报名（进入支付步骤）
const confirmSignup = () => {
  if (!canSubmitStep1.value) {
    if (!formData.name.trim()) {
      uni.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      uni.showToast({ title: '请输入有效的手机号', icon: 'none' });
      return;
    }
  }
  currentStep.value = 2;
};

// 选择图片（Uni-app环境下应使用uni.chooseImage API）
const chooseImage = () => {
  // 这里为演示目的使用模拟方法
  // 在实际Uni-app项目中，应使用uni.chooseImage API:
  // uni.chooseImage({
  //   count: 1, // 最多可以选择的图片张数
  //   sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
  //   sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
  //   success: function (res) {
  //     screenshot.value = res.tempFilePaths[0]; // tempFilePath可以作为img标签的src属性显示图片
  //   }
  // });
  const mockImages = [
    'https://img.alicdn.com/imgextra/i1/6000000007751/O1CN01v7zfb41cDU2kq1elG_!!6000000007751-0-tps-248-248.jpg',
    // Add more mock images if desired
    'https://via.placeholder.com/300/FF6E00/FFFFFF?text=Mock+Payment'
  ];
  screenshot.value = mockImages[Math.floor(Math.random() * mockImages.length)];
};

// 拖拽事件
const onDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  // In a real application, you'd handle file drop here:
  // const files = e.dataTransfer.files;
  // if (files.length > 0) {
  //   const file = files[0];
  //   // Validate file type and size
  //   if (file.type.startsWith('image/')) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       screenshot.value = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     uni.showToast({ title: '请拖拽图片文件', icon: 'none' });
  //   }
  // }
  chooseImage(); // Using mock image for simplicity
};

// 提交表单
const submitForm = () => {
  if (!screenshot.value) {
    uni.showToast({ title: '请上传付款截图', icon: 'none' });
    return;
  }
  // Simulate API call
  uni.showLoading({ title: '提交中...', mask: true });
  setTimeout(() => {
    uni.hideLoading();
    currentStep.value = 3;
    uni.showToast({ title: '提交成功', icon: 'success' });
  }, 1500);
};

// 生成票号
const generateTicketNumber = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  return `TK${randomLetter}${randomNumbers}`;
};

// 返回首页
const backToHome = () => {
  uni.showToast({ title: '返回首页', icon: 'success' });
  // 实际项目中应使用uni.navigateBack或uni.switchTab跳转
  setTimeout(() => {
    currentStep.value = 1;
    formData.name = '';
    formData.phone = '';
    formData.company = '';
    screenshot.value = null;
  }, 1500);
};
</script>

<style scoped>
/* Scoped styles ensure these styles only apply to this component */
/* * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
} */
body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  padding: 20rpx; /* Uni-app uses rpx, for web you might prefer px/rem/vw */
}
.container {
  max-width: 500px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}
.header {
  text-align: center;
  background: linear-gradient(135deg, #ff6e00 0%, #ff8e3d 100%);
  color: white;
  padding: 40rpx 0;
  margin-bottom: 20rpx;
}
.header h1 {
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 1rpx;
}
.section {
  margin-bottom: 40rpx;
  padding: 0 30rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6e00;
  border-left: 8rpx solid #ff6e00;
  padding-left: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}
.section-title .icon {
  margin-right: 10rpx;
  font-size: 36rpx;
}
.info-box {
  background: #fff8f2;
  border: 1rpx solid #ffd9c4;
  padding: 25rpx 30rpx;
  border-radius: 12rpx;
  line-height: 1.6;
  font-size: 28rpx;
}
.info-box div {
  margin: 15rpx 0;
}
label {
  display: block;
  margin: 20rpx 0 10rpx;
  font-weight: bold;
  font-size: 28rpx;
}
.input-item {
  margin-bottom: 30rpx;
}
.btn {
  padding: 10rpx;
  background: linear-gradient(135deg, #ff6e00 0%, #ff8e3d 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  margin: 20rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(255, 110, 0, 0.2);
}
.btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 6rpx rgba(255, 110, 0, 0.2);
}
.btn-disabled {
  background: #ccc;
  box-shadow: none;
  opacity: 0.7;
  cursor: not-allowed;
}
.qr-code {
  text-align: center;
  margin: 30rpx 0;
  padding: 20rpx;
  background: #fff8f2;
  border-radius: 16rpx;
}
.qr-code img {
  width: 300rpx;
  height: 300rpx;
  border-radius: 16rpx;
  border: 1rpx solid #eee;
  background: white;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.qr-note {
  color: #ff6e00;
  font-size: 26rpx;
  margin-top: 20rpx;
  font-weight: bold;
}
.price-tag {
  background: #ff6e00;
  color: white;
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  display: inline-block;
  margin-left: 20rpx;
}
.success-message {
  text-align: center;
  color: #4caf50;
  font-size: 36rpx;
  font-weight: bold;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.success-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
  animation: bounce 0.8s ease-in-out;
}
.upload-box {
  background: #f8f8f8;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  margin: 30rpx 0;
  transition: all 0.3s;
  cursor: pointer;
}
.upload-box.active {
  border-color: #ff6e00;
  background: #fff8f2;
}
.upload-icon {
  font-size: 60rpx;
  color: #ff6e00;
  margin-bottom: 20rpx;
}
.upload-text {
  color: #666;
  font-size: 26rpx;
}
.preview-image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 16rpx;
  margin: 0 auto;
  display: block;
  border: 1rpx solid #eee;
  object-fit: cover; /* Ensure image covers the area */
}
.step-indicator {
  display: flex;
  justify-content: center;
  margin: 30rpx 0;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200rpx;
  position: relative;
}
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 30rpx;
  right: -60rpx;
  width: 120rpx;
  height: 4rpx;
  background: #ddd;
  z-index: 1; /* Ensure line is behind circle */
}
.step.active:not(:last-child)::after {
  background: #ff6e00;
}
.step-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #ddd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
  z-index: 2;
}
.step.active .step-circle {
  background: #ff6e00;
}
.step-text {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}
.step.active .step-text {
  color: #ff6e00;
  font-weight: bold;
}
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30rpx);
  }
  60% {
    transform: translateY(-15rpx);
  }
}
.footer {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
  border-top: 1rpx solid #eee;
  margin-top: 30rpx;
}
</style>