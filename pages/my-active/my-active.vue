<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <uni-nav-bar 
      left-icon="arrowleft" 
      title="我的活动" 
      :border="false"
      @clickLeft="handleBack"
    />
    
    <!-- 分段器 -->
    <view class="segmented-container">
      <uni-segmented-control 
        :current="currentTab" 
        :values="tabs" 
        @clickItem="switchTab"
        style-type="button"
        active-color="#FF6B00"
      />
    </view>
    
    <!-- 我的报名活动 -->
    <scroll-view 
      v-show="currentTab === 0" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section-header">
        <uni-icons type="ticket" size="20" color="#FF6B00" />
        <text class="section-title">我报名的活动</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-if="enrolledActivities.length > 0" class="activity-list">
        <view 
          v-for="(item, index) in enrolledActivities" 
          :key="index"
          class="activity-item"
          @click="handleActivityClick(item)"
        >
          <image class="activity-image" :src="item.image" mode="aspectFill" />
          
          <view class="activity-content">
            <view class="activity-header">
              <text class="activity-title">{{ item.title }}</text>
              <view :class="['status-tag', item.status]">
                {{ getStatusText(item.status) }}
              </view>
            </view>
            
            <view class="activity-info">
              <uni-icons type="calendar" size="16" color="#999" />
              <text class="info-text">{{ item.date }}</text>
            </view>
            
            <view class="activity-info">
              <uni-icons type="map-pin" size="16" color="#999" />
              <text class="info-text">{{ item.location }}</text>
            </view>
            
            <view class="activity-footer">
              <view class="participants">
                <uni-icons type="people" size="16" color="#999" />
                <text>{{ item.participants.current }}/{{ item.participants.total }}人</text>
              </view>
              
              <view class="action-buttons">
                <button 
                  v-if="item.status === 'enrolled'" 
                  class="btn btn-cancel" 
                  @click.stop="cancelEnroll(item)"
                >
                  取消报名
                </button>
                <button class="btn btn-detail" @click.stop="viewDetail(item)">
                  查看详情
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-state 
        v-else 
        title="暂无报名活动" 
        description="快去发现并报名感兴趣的活动吧"
      >
        <button class="primary-btn" @click="navigateToDiscover">去发现</button>
      </empty-state>
      
      <uni-load-more 
        :status="loadStatus" 
        :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多了'
        }" 
        @clickLoadMore="loadMore"
      />
    </scroll-view>
    
    <!-- 我的发布活动 -->
    <scroll-view 
      v-show="currentTab === 1" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section-header">
        <uni-icons type="sound" size="20" color="#FF6B00" />
        <text class="section-title">我发布的活动</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-if="publishedActivities.length > 0" class="activity-list">
        <view 
          v-for="(item, index) in publishedActivities" 
          :key="index"
          class="activity-item"
          @click="handleActivityClick(item)"
        >
          <image class="activity-image" :src="item.image" mode="aspectFill" />
          
          <view class="activity-content">
            <view class="activity-header">
              <text class="activity-title">{{ item.title }}</text>
              <view :class="['status-tag', item.status]">
                {{ getStatusText(item.status) }}
              </view>
            </view>
            
            <view class="activity-info">
              <uni-icons type="calendar" size="16" color="#999" />
              <text class="info-text">{{ item.date }}</text>
            </view>
            
            <view class="activity-info">
              <uni-icons type="map-pin" size="16" color="#999" />
              <text class="info-text">{{ item.location }}</text>
            </view>
            
            <view class="activity-footer">
              <view class="participants">
                <uni-icons type="people" size="16" color="#999" />
                <text>{{ item.participants.current }}/{{ item.participants.total }}人</text>
              </view>
              
              <view class="action-buttons">
                <button 
                  class="btn btn-manage" 
                  @click.stop="manageActivity(item)"
                >
                  {{ item.status === 'ended' ? '数据统计' : '管理' }}
                </button>
                <button class="btn btn-detail" @click.stop="viewDetail(item)">
                  查看详情
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-state 
        v-else 
        title="暂无发布活动" 
        description="创建一个活动，邀请大家参与吧"
      >
        <button class="primary-btn" @click="navigateToCreate">创建活动</button>
      </empty-state>
      
      <uni-load-more 
        :status="loadStatus" 
        :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多了'
        }" 
        @clickLoadMore="loadMore"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'

// 状态
const currentTab = ref(0)
const tabs = ref(['我的报名', '我的发布'])
const refreshing = ref(false)
const loadStatus = ref('more')

// 模拟数据
const enrolledActivities = ref([
  {
    id: 1,
    title: '周末户外登山活动 - 挑战青龙山',
    image: '/static/activity1.jpg',
    date: '2023年11月25日 08:00-17:00',
    location: '青龙山国家森林公园',
    participants: {
      current: 28,
      total: 50
    },
    organizer: '户外探险俱乐部',
    status: 'enrolled',
    tags: ['户外', '运动']
  },
  // 更多数据...
])

const publishedActivities = ref([
  {
    id: 4,
    title: '宠物爱好者交流聚会',
    image: '/static/activity4.jpg',
    date: '2023年12月2日 10:00-14:00',
    location: '人民公园草坪区',
    participants: {
      current: 23,
      total: 30
    },
    organizer: '我',
    status: 'ongoing',
    tags: ['宠物', '社交']
  },
  // 更多数据...
])

// 方法
const switchTab = (e) => { // 将参数命名为 e，表示事件对象
  // uni-segmented-control 的 clickItem 事件会返回一个包含 currentIndex 的事件对象
  currentTab.value = e.currentIndex // 正确地获取索引
  loadStatus.value = 'more' // 切换Tab时重置加载状态，这是个好习惯
  // 你可能还需要根据新的 currentTab 重新加载数据
  // 例如：fetchData(currentTab.value)
}

const handleBack = () => {
  uni.navigateBack()
}

const getStatusText = (status) => {
  const statusMap = {
    enrolled: '已报名',
    pending: '待审核',
    ended: '已结束',
    ongoing: '进行中',
    upcoming: '未开始'
  }
  return statusMap[status] || ''
}

const handleActivityClick = (item) => {
  uni.navigateTo({
    url: `/pages/activity/detail?id=${item.id}`
  })
}

const viewDetail = (item) => {
  uni.navigateTo({
    url: `/pages/activity/detail?id=${item.id}`
  })
}

const cancelEnroll = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消报名此活动吗？',
    success: (res) => {
      if (res.confirm) {
        enrolledActivities.value = enrolledActivities.value.filter(act => act.id !== item.id)
        uni.showToast({
          title: '已取消报名',
          icon: 'success'
        })
      }
    }
  })
}

const manageActivity = (item) => {
  if (item.status === 'ended') {
    uni.navigateTo({
      url: `/pages/activity/stats?id=${item.id}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/activity/manage?id=${item.id}`
    })
  }
}

const navigateToDiscover = () => {
  uni.switchTab({
    url: '/pages/discover/index'
  })
}

const navigateToCreate = () => {
  uni.navigateTo({
    url: '/pages/activity/create'
  })
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  }, 1000)
}

const loadMore = () => {
  if (loadStatus.value !== 'more') return
  
  loadStatus.value = 'loading'
  setTimeout(() => {
    // 模拟加载更多数据
    if (currentTab.value === 0) {
      enrolledActivities.value.push(...mockEnrolledData())
    } else {
      publishedActivities.value.push(...mockPublishedData())
    }
    loadStatus.value = 'noMore'
  }, 1500)
}

onReachBottom(() => {
  loadMore()
})

// 模拟数据方法
const mockEnrolledData = () => [...Array(2)].map((_, i) => ({
  id: enrolledActivities.value.length + i + 1,
  title: `新活动 ${enrolledActivities.value.length + i + 1}`,
  image: `/static/activity${(enrolledActivities.value.length + i) % 6 + 1}.jpg`,
  date: '2023年12月' + (15 + i) + '日',
  location: '活动地点' + (enrolledActivities.value.length + i),
  participants: {
    current: Math.floor(Math.random() * 50),
    total: 50
  },
  organizer: '组织者' + (enrolledActivities.value.length + i),
  status: ['enrolled', 'pending', 'ended'][Math.floor(Math.random() * 3)],
  tags: ['标签1', '标签2']
}))

const mockPublishedData = () => [...Array(2)].map((_, i) => ({
  id: publishedActivities.value.length + i + 1,
  title: `新发布活动 ${publishedActivities.value.length + i + 1}`,
  image: `/static/activity${(publishedActivities.value.length + i) % 6 + 1}.jpg`,
  date: '2023年12月' + (20 + i) + '日',
  location: '发布地点' + (publishedActivities.value.length + i),
  participants: {
    current: Math.floor(Math.random() * 100),
    total: 100
  },
  organizer: '我',
  status: ['ongoing', 'upcoming', 'ended'][Math.floor(Math.random() * 3)],
  tags: ['发布标签1', '发布标签2']
}))

onLoad(() => {
  // 可以在这里加载真实数据
})
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.segmented-container {
  padding: 20rpx 24rpx;
  background-color: #fff;
}

.content-scroll {
  flex: 1;
  height: 1px; // 修复scroll-view高度问题
  padding: 0 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-left: 12rpx;
    color: #1c1e21;
  }
}

.activity-list {
  margin-bottom: 40rpx;
}

.activity-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  
  &:active {
    opacity: 0.9;
  }
}

.activity-image {
  width: 100%;
  height: 300rpx;
}

.activity-content {
  padding: 24rpx;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.activity-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1c1e21;
  flex: 1;
  margin-right: 20rpx;

  // 手动写入多行文本溢出样式
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; // 指定显示两行
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.status-tag {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  
  &.enrolled, &.ongoing {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  &.pending, &.upcoming {
    background-color: #fff3e0;
    color: #ff9800;
  }
  
  &.ended {
    background-color: #f5f5f5;
    color: #9e9e9e;
  }
}

.activity-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #666;
  
  .info-text {
    margin-left: 8rpx;
  }
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f2f5;
}

.participants {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  
  text {
    margin-left: 8rpx;
  }
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn {
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  
  &-detail {
    background-color: #f0f2f5;
    color: #606770;
  }
  
  &-manage {
    background-color: #e3f2fd;
    color: #2196f3;
  }
  
  &-cancel {
    background-color: #ffebee;
    color: #f44336;
  }
}

.primary-btn {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  border: none;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-top: 24rpx;
}

// 空状态组件样式
.empty-state {
  text-align: center;
  padding: 80rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  margin-top: 40rpx;
  
  .empty-icon {
    font-size: 120rpx;
    color: #e0e0e0;
    margin-bottom: 24rpx;
  }
  
  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
}
</style>