<template>
  <view class="container">
    <!-- 修正点 1: 新增的悬浮分享按钮 -->
    <view class="share-fab" @click="openSharePopup">
      <uni-icons type="undo-filled" size="24" color="#fff"></uni-icons>
    </view>

    <view class="card-header">
      <view class="header-title">我的个人名片</view>
      <view class="header-subtitle">专业形象，随时分享</view>
    </view>
    
    <MyCard
      v-if="userInfo"
      :avatar="userInfo.avatar"
      :name="userInfo.realName || userInfo.nickname"
      :pinyin-name="userInfo.topUpLevel?.name"
      :title="userInfo.level?.name"
      :company-name="userInfo.companyName"
      department=""
      :full-company-name="userInfo.professionalTitle"
      :contact-info="formattedContactInfo"
      :show-user-qr-code="!!userInfo.wechatQrCodeUrl"
      :user-we-chat-qr-code-url="userInfo.wechatQrCodeUrl"
      platform-qr-code-url="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info"
      logo-url="https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png"
    />
	
	  <view class="edit-hint" v-if="userInfo">
		  名片信息可在 <text @click="goToEdit" class="edit-link">个人资料</text> 中编辑
	  </view>
    
    <!-- 修正点 1: 移除了底部的旧分享按钮 -->
    <!-- <view class="action-buttons">...</view> -->

    <!-- 修正点 3: 新增的分享引导弹出层 -->
    <uni-popup ref="sharePopup" type="bottom" background-color="#fff">
      <view class="share-popup-content">
        <view class="share-title">分享至</view>
        <view class="share-options">
          <button class="share-option" open-type="share">
            <!-- <image src="/static/images/wechat-friend.png" class="share-icon" /> -->
            <text>微信好友</text>
          </button>
          <view class="share-option" @click="guideShareToMoments">
            <!-- <image src="/static/images/wechat-moments.png" class="share-icon" /> -->
            <text>朋友圈</text>
          </view>
        </view>
        <view class="share-cancel" @click="closeSharePopup">取消</view>
      </view>
    </uni-popup>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'; // 修正点 2: 导入分享钩子
import MyCard from '../../components/MyCard.vue';
import request from '../../utils/request.js';

const userInfo = ref(null);
const sharePopup = ref(null); // 修正点 3: 用于控制分享弹窗

onMounted(() => {
  fetchUserInfo();
});

const fetchUserInfo = async () => {
  uni.showLoading({ title: '加载中...' });
  const { data, error } = await request('/app-api/member/user/get', { method: 'GET' });
  uni.hideLoading();

  if (error) {
    uni.showToast({ title: `加载失败: ${error}`, icon: 'none' });
    return;
  }
  
  userInfo.value = data;
};

const formattedContactInfo = computed(() => {
  if (!userInfo.value) return [];
  return [
    { icon: 'phone-filled', value: userInfo.value.mobile || '未设置手机' },
    { icon: 'email-filled', value: userInfo.value.contactEmail || '未设置邮箱' },
    { icon: 'location-filled', value: userInfo.value.locationAddress || '未设置地址' }
  ];
});

const goToEdit = () => {
  uni.navigateTo({ url: '/pages/my-edit/my-edit' });
};

// --- 修正点 2: 使用小程序原生分享 ---

// 1. 监听用户点击右上角菜单“转发”按钮，或<button open-type="share">
onShareAppMessage((res) => {
  console.log('触发了分享给好友', res);
  if (!userInfo.value) {
    return {
      title: '快来看看我的专业电子名片！',
    };
  }
  // 返回自定义分享内容
  return {
    title: `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`,
    path: `/pages/my-businessCard/my-businessCard?id=${userInfo.value.id}`, // 必须是小程序内的页面路径，带上参数
    imageUrl: userInfo.value.avatar, // 自定义分享图片
  };
});

// 2. 监听用户点击右上角菜单“分享到朋友圈”按钮
onShareTimeline(() => {
  console.log('触发了分享到朋友圈');
  if (!userInfo.value) {
    return {
      title: '快来看看我的专业电子名片！',
    };
  }
  // 返回自定义分享内容
  return {
    title: `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`,
    query: `id=${userInfo.value.id}`, // 分享到朋友圈的参数
    imageUrl: userInfo.value.avatar,
  };
});

// --- 修正点 3: 分享弹窗和引导逻辑 ---

// 打开分享弹窗
const openSharePopup = () => {
  if (!userInfo.value) {
    uni.showToast({ title: '信息加载中，请稍候', icon: 'none' });
    return;
  }
  sharePopup.value.open();
};

// 关闭分享弹窗
const closeSharePopup = () => {
  sharePopup.value.close();
};

// 引导用户分享到朋友圈
const guideShareToMoments = () => {
  closeSharePopup(); // 先关闭弹窗
  uni.showToast({
    title: '请点击右上角「...」，然后选择「分享到朋友圈」',
    icon: 'none',
    duration: 3000,
  });
};
</script>

<style lang="scss" scoped>
/* 样式部分保持不变 */
.container {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #333;
  line-height: 1.6;
  padding: 40rpx 30rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 80rpx;
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
    font-size: 32rpx;
    color: #777;
  }
}

.edit-hint {
  color: #888;
  font-size: 28rpx;
  margin-top: 40rpx;
  .edit-link {
    color: #007aff;
    text-decoration: underline;
    font-weight: bold;
    margin: 0 8rpx;
  }
}

.action-buttons {
  display: flex;
  gap: 30rpx;
  margin-top: 40rpx;
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
  
  &::after {
    border: none;
  }
  
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

.share-fab {
  position: fixed;
  top: 180rpx; /* 可根据需要调整，避开导航栏 */
  right: 30rpx;
  width: 90rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
  z-index: 99;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

/* --- 新增样式：分享弹窗内容 --- */
.share-popup-content {
  padding: 30rpx;
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
}

.share-title {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
}

.share-options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40rpx;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 去除button默认样式 */
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1.5;
  &::after {
    border: none;
  }

  .share-icon {
    width: 100rpx;
    height: 100rpx;
    margin-bottom: 20rpx;
  }

  text {
    font-size: 26rpx;
    color: #333;
  }
}

.share-cancel {
  width: 100%;
  padding: 25rpx 0;
  text-align: center;
  font-size: 32rpx;
  color: #666;
  background-color: #f7f7f7;
  border-radius: 12rpx;
}
</style>