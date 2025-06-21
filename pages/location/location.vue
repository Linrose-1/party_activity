<template>
  <view class="nearby-container">
    <view class="header">
      <view class="tabs-wrapper">
        <uni-segmented-control
          :current="currentTab"
          :values="tabItems"
          style-type="button"
          active-color="#FF6B00"
          @clickItem="handleTabClick"
        />
      </view>
    </view>

    <!-- 2. 主内容区域 -->
    <view class="content-area">
      <!-- 摇一摇界面 (初始状态) -->
      <view v-if="!shaken" class="shake-container">
        <view class="shake-btn" @click="startShake">
          <uni-icons type="hand-up" size="60" color="#FFFFFF" class="shake-icon" />
          <text>摇一摇</text>
        </view>
        <text class="shake-hint">点击按钮或晃动手机，发现附近的活动和商友</text>
      </view>

      <!-- 加载中界面 -->
      <view v-else-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在发现附近内容...</text>
      </view>

      <!-- 结果列表界面 -->
      <view v-else class="list-container fade-in">
        <!-- 活动列表 -->
        <view v-show="currentTab === 0">
          <view class="list-title">
            <uni-icons type="calendar-filled" size="20" color="#FF6B00" />
            <text>附近活动</text>
          </view>
          <!-- 使用 ActivityCard 组件 -->
          <ActivityCard
            v-for="activity in activities"
            :key="activity.id"
            :activity="activity"
            @favorite="handleFavorite"
          />
        </view>

        <!-- 商友列表 -->
        <view v-show="currentTab === 1">
          <view class="list-title">
            <uni-icons type="staff-filled" size="20" color="#FF6B00" />
            <text>附近商友</text>
          </view>
          <view
            v-for="business in businesses"
            :key="business.id"
            class="business-card"
          >
            <image :src="business.avatar" mode="aspectFill" class="business-avatar" />
            <view class="business-info">
              <view class="business-name">
                {{ business.name }} · <text class="distance">{{ business.distance }}</text>
              </view>
			  <view class="card-position"><text class="iconfont">👤</text> {{business.position}}</view>
			  <view class="card-company"><text class="iconfont">🏢</text> {{business.firms}}</view>
              <!-- <view class="business-position">{{ business.position }}</view>
              <view class="business-tags">
                <text v-for="(tag, index) in business.tags" :key="index" class="business-tag">
                  {{ tag }}
                </text>
              </view> -->
            </view>
            <button class="connect-btn">查看</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ActivityCard from '@/components/ActivityCard.vue'; // 引入活动卡片组件

// --- 状态管理 ---
const currentTab = ref(0); // 0: 活动, 1: 商友
const tabItems = ['活动', '商友'];
const shaken = ref(false); // 是否已经摇过
const loading = ref(false); // 是否正在加载
const shakeDebounce = ref(true); // 摇一摇防抖

// --- 数据 ---
// 活动列表数据 (适配 ActivityCard 组件的 prop 结构)
const activities = ref([]);
// 商友列表数据
const businesses = ref([]);

// --- 方法 ---

// 切换标签页
const handleTabClick = (e) => {
  currentTab.value = e.currentIndex;
};

// 开始摇一摇（按钮点击触发）
const startShake = () => {
  triggerShakeSequence();
};

// 摇一摇的核心流程
const triggerShakeSequence = () => {
  if (!shakeDebounce.value) return;
  shakeDebounce.value = false; // 关闭防抖，防止连续触发

  // 新增：先获取位置，成功后再执行后续操作
  getLocationAndProceed();
};


// 新增：获取位置并继续执行后续流程的函数
const getLocationAndProceed = () => {
  uni.getLocation({
    type: 'gcj02', // 推荐使用 gcj02，兼容性更好
    success: (res) => {
      console.log('✅ 获取用户位置成功:');
      console.log(`   - 纬度: ${res.latitude}`);
      console.log(`   - 经度: ${res.longitude}`);
      
      // 位置获取成功，执行真正的摇一摇后续动作
      executeShakeActions();
    },
    fail: (err) => {
      console.error('❌ 获取位置失败:', err);
      // 检查是否是权限被拒绝的问题
      if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied'))) {
        // 引导用户去设置页面开启权限
        uni.showModal({
          title: '需要位置权限',
          content: '我们需要您的位置信息来发现附近的活动和商友，请在设置中打开位置权限。',
          confirmText: '去设置',
          showCancel: true,
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.openSetting(); // 打开小程序的设置界面
            }
          }
        });
      } else {
        // 其他错误，如GPS未开启
        uni.showToast({
          title: '获取位置失败，请检查系统定位服务是否开启',
          icon: 'none'
        });
      }
      // 无论成功失败，最后都要把防抖开关打开，以便用户可以再次尝试
      shakeDebounce.value = true;
    }
  });
};

// 新增：将原有的摇一摇效果和数据加载逻辑封装起来
const executeShakeActions = () => {
  loading.value = true;
  shaken.value = true; // 切换到加载或列表视图

  // 播放震动效果
  uni.vibrateShort();

  // 模拟网络请求
  setTimeout(() => {
    // 加载模拟数据
    loadMockData();
    loading.value = false;
    
    // 1秒后重新开启摇一摇功能
    setTimeout(() => {
        shakeDebounce.value = true;
    }, 1000)

  }, 1500);
};


// 加载模拟数据
const loadMockData = () => {
  // 注意：这里的数据结构已调整，以匹配 ActivityCard 组件的需求
  activities.value = [
    {
      id: 1,
      title: "互联网创业者交流会",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "今天 14:00-16:00",
      location: "创业咖啡厅",
      participants: { current: 32, total: 50 }, // 修改为对象
      tags: ["创业", "交流会"],
      organizer: "创业咖啡厅", // 补充组织者信息
    },
    {
      id: 2,
      title: "2025金融科技峰会",
      image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "明天 09:00-17:00",
      location: "国际会议中心",
      participants: { current: 180, total: 200 },
      tags: ["金融", "科技"],
      organizer: "金融时报",
    },
  ];

  businesses.value = [
    {
      id: 1,
      name: "张明",
      position: "产品总监",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      firms: "创新科技有限公司",
      distance: "120米"
    },
    {
      id: 2,
      name: "李华",
      position: "技术主管",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      firms:"创新科技有限公司",
      distance: "560米"
    },
  ];
};

// 处理收藏事件 (来自 ActivityCard 组件的 emit)
const handleFavorite = (isFavorite) => {
  console.log('收藏状态改变:', isFavorite);
  uni.showToast({
    title: isFavorite ? '收藏成功' : '取消收藏',
    icon: 'none'
  });
};

// --- 生命周期钩子 ---

onMounted(() => {
  // 监听设备晃动
  uni.onAccelerometerChange((res) => {
    // res.x, res.y, res.z 是三轴的加速度
    if (Math.abs(res.x) > 1.5 && Math.abs(res.y) > 1.5) {
      triggerShakeSequence();
    }
  });
});

onUnmounted(() => {
  // 页面卸载时停止监听
  uni.stopAccelerometer();
});
</script>

<style lang="scss" scoped>
.nearby-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 顶部导航 */
.header {
  // background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  background-color: #fff;
  color: white;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  padding-top: var(--status-bar-height); /* 适配刘海屏 */

  .title {
    font-size: 36rpx;
    font-weight: 600;
    text-align: center;
    margin: 10rpx 0 20rpx;
  }
  .tabs-wrapper {
    // width: 80%;
    margin: 0 auto;
	// padding: 20rpx 24rpx;
  }
  
  
}

.content-area {
  padding: 0 32rpx;
}

/* 摇一摇区域 */
.shake-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.shake-btn {
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 44rpx;
  font-weight: bold;
  box-shadow: 0 20rpx 50rpx rgba(255, 107, 0, 0.4);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.5);
  }
}

.shake-icon {
  animation: pulse 2s infinite;
}

.shake-hint {
  margin-top: 60rpx;
  font-size: 28rpx;
  color: #666;
  max-width: 600rpx;
  line-height: 1.6;
}

/* 加载中 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  color: #666;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid #e0e0e0;
  border-top-color: #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
}

/* 列表区域 */
.list-container {
  padding-top: 30rpx;
}

.list-title {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;

  text {
    margin-left: 16rpx;
  }
}

/* 商友卡片样式 (活动卡片样式由组件自身决定) */
.business-card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
  
  .business-avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    margin-right: 30rpx;
    border: 4rpx solid #ff8c00;
  }
  
  .card-position,
  .card-company {
  	font-size: 26rpx;
  	margin-bottom: 5rpx;
  	opacity: 0.95;
  }
  
  .business-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .business-name {
    font-size: 34rpx;
    font-weight: 600;
    margin-bottom: 10rpx;
  }
  
  .distance {
    color: #ff6b00;
    font-weight: normal;
  }
  
  .business-position {
    color: #666;
    margin-bottom: 16rpx;
    font-size: 26rpx;
  }
  
  .business-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  
  .business-tag {
    background: #f0f2f5;
    color: #666;
    padding: 6rpx 20rpx;
    border-radius: 40rpx;
    font-size: 24rpx;
  }
  
  .connect-btn {
    background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
    color: white;
    border: none;
    padding: 0 30rpx;
    border-radius: 40rpx;
    font-weight: 500;
    align-self: center;
    font-size: 26rpx;
    margin-left: 20rpx;
    // 重置button默认样式
    &::after {
      border: none;
    }
  }
}

/* 动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>