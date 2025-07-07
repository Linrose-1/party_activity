<template>
  <view class="container">
    <view class="card-header">
      <view class="header-title">我的个人名片</view>
      <view class="header-subtitle">专业形象，随时分享</view>
    </view>
    
    <!-- 
      - 使用 v-if="userInfo" 确保在数据加载完成后再渲染名片组件
      - 动态绑定从 API 获取的数据到 MyCard 组件的 props
    -->
    <MyCard 
      v-if="userInfo"
      :avatar="userInfo.avatar"
      :name="userInfo.realName || userInfo.nickname"
      :title="userInfo.professionalTitle"
      :location="userInfo.locationAddress"
      :infoItems="formattedInfoItems"
      :inviteCode="userInfo.shardCode"
      :qrCodeUrl="userInfo.wechatQrCodeUrl"
      :showQrCode="!!userInfo.wechatQrCodeUrl"
    />
	
	  <view class="edit-hint" v-if="userInfo">
		  名片信息可在 <text @click="goToEdit" class="edit-link">个人资料</text> 中编辑
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
import { ref, computed, onMounted } from 'vue';
// 导入名片组件
import MyCard from '../../components/MyCard.vue'; // ‼️ 请确保此路径正确
// 导入您的请求方法
import request from '../../utils/request.js'; // ‼️ 请确保此路径正确

// --- 1. 定义状态来存储用户信息 ---
const userInfo = ref(null); // 初始化为 null，表示数据还未加载

// --- 2. 使用 onMounted 生命周期钩子来获取数据 ---
onMounted(() => {
  fetchUserInfo();
});

// --- 3. 封装获取用户信息的函数 ---
const fetchUserInfo = async () => {
  // 添加加载提示，提升用户体验
  uni.showLoading({ title: '加载中...' });
  const { data, error } = await request('/app-api/member/user/get', { method: 'GET' });
  uni.hideLoading();

  if (error) {
    uni.showToast({ title: `加载失败: ${error}`, icon: 'none' });
    return;
  }
  
  // 将获取到的数据赋值给 userInfo
  userInfo.value = data;
};

// --- 4. 使用 computed 属性将 API 数据格式化为组件需要的格式 ---
const formattedInfoItems = computed(() => {
  // 如果 userInfo 还未加载，返回空数组，防止报错
  if (!userInfo.value) {
    return [];
  }
  
  // 将 API 数据映射到 infoItems 数组结构
  return [
    {
      icon: 'staff',
      label: '职业',
      value: userInfo.value.professionalTitle || '未设置'
    },
    {
      icon: 'shop',
      label: '公司/机构',
      value: userInfo.value.companyName || '未设置'
    },
    {
      icon: 'phone',
      label: '联系方式',
      value: userInfo.value.mobile || '未设置'
    },
    {
      icon: 'email',
      label: '邮箱',
      value: userInfo.value.contactEmail || '未设置'
    },
    {
      icon: 'info',
      label: '个人简介',
      value: userInfo.value.personalBio || '暂无简介'
    }
  ];
});


// 分享名片功能
const shareCard = () => {
  if (!userInfo.value) {
    uni.showToast({ title: '请等待信息加载完成', icon: 'none' });
    return;
  }
  // TODO: 后续可以实现更复杂的分享逻辑，如生成海报
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession', // 分享到微信好友
    type: 0, // 分享图文
    href: 'https://example.com/card/' + userInfo.value.id, // 分享的链接，最好替换成真实地址
    title: `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`,
    summary: `我正在使用XXX，这是我的名片，请惠存。`,
    imageUrl: userInfo.value.avatar, // 分享的缩略图
    success: function (res) {
      uni.showToast({ title: '分享成功', icon: 'success' });
    },
    fail: function (err) {
      console.error('分享失败:', JSON.stringify(err));
      uni.showToast({ title: '分享失败', icon: 'none' });
    }
  });
};

// 跳转到编辑页
const goToEdit = () => {
  uni.navigateTo({
    url: '/pages/my-edit/my-edit' // 请确保这个路径是您的编辑资料页面路径
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
  justify-content: flex-start; /* 改为从顶部开始，而不是居中 */
  padding-top: 80rpx; /* 增加顶部内边距给标题留出空间 */
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

/* 操作按钮 */
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
  
  /* 解决小程序button默认样式问题 */
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
</style>