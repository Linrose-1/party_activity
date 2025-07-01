<template>
  <view class="page-container">
    
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
    <view 
      v-show="currentTab === 0" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section-header">
        <text class="section-title">✍️ 我报名的活动</text>
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
                <!-- 根据状态显示不同按钮 -->
                <button 
                  v-if="item.status === 'enrolled'" 
                  class="btn btn-cancel" 
                  @click.stop="cancelEnroll(item)"
                >
                  取消报名
                </button>
                 <button 
                  v-if="item.status === 'refund_pending'" 
                  class="btn btn-refund-apply" 
                  @click.stop="applyForRefund(item)"
                >
                  申请退款
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
      
    </view>
    
    <!-- 我的发布活动 -->
    <view 
      v-show="currentTab === 1" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section-header">
        <text class="section-title">📢 我发布的活动</text>
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
                <!-- 根据状态显示不同按钮 -->
				 <button 
				    v-if="['ongoing', 'upcoming'].includes(item.status) && item.refundRequests > 0"
				    class="btn btn-approval" 
				    @click.stop="manageRefunds(item, 'individual')"
				  >
				    处理申请 <uni-badge class="badge" :text="item.refundRequests" type="error"></uni-badge>
				  </button>
				  
				  <button 
				    v-if="['ongoing', 'upcoming'].includes(item.status)"
				    class="btn btn-cancel" 
				    @click.stop="cancelActivity(item)"
				  >
				    取消活动
				  </button>
				  
				  <!-- [修改] 处理整场活动退款的按钮 -->
				  <button 
				    v-if="item.status === 'canceled'"
				    class="btn btn-refund-manage" 
				    @click.stop="manageRefunds(item, 'all')"
				  >
				    处理退款
				  </button>
                <button 
                  v-if="item.status === 'ended'"
                  class="btn btn-manage" 
                  @click.stop="manageActivity(item)"
                >
                  数据统计
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
      
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 状态
const currentTab = ref(0)
const tabs = ref(['我的报名', '我的发布'])
const refreshing = ref(false)

// 模拟数据 (已更新，包含新状态)
const enrolledActivities = ref([
  {
    id: 1,
    title: '周末户外登山活动 - 挑战青龙山',
    image: '../../static/abc.png',
    date: '2023年11月25日 08:00-17:00',
    location: '青龙山国家森林公园',
    participants: { current: 28, total: 50 },
    status: 'enrolled', // 状态：已报名
  },
  {
    id: 2,
    title: '城市摄影行走 - 发现老街角的故事',
    image: '../../static/abc.png',
    date: '2023年12月10日 14:00-17:00',
    location: '市中心老城区',
    participants: { current: 15, total: 20 },
    status: 'refund_pending', // 状态：待退款
  },
  {
    id: 3,
    title: '社区公益烘焙课程',
    image: '../../static/abc.png',
    date: '2023年10月20日 10:00-12:00',
    location: '幸福社区活动中心',
    participants: { current: 12, total: 12 },
    status: 'ended', // 状态：已结束
  },
])

const publishedActivities = ref([
  {
    id: 4,
    title: '宠物爱好者交流聚会',
    image: '../../static/abc.png',
    date: '2023年12月2日 10:00-14:00',
    location: '人民公园草坪区',
    participants: { current: 23, total: 30 },
    status: 'ongoing', // 状态：进行中
	refundRequests: 2, 
  },
  {
    id: 5,
    title: '周末手工皮具体验课',
    image: '../../static/abc.png',
    date: '2023年12月9日 13:00-16:00',
    location: '创意工坊A座',
    participants: { current: 8, total: 10 },
    status: 'canceled', // 状态：已取消，待处理退款
  },
  {
    id: 6,
    title: '科技新品发布会早鸟票',
    image: '../../static/abc.png',
    date: '2024年1月15日 09:00',
    location: '国际会展中心',
    participants: { current: 95, total: 200 },
    status: 'upcoming', // 状态：未开始
  },
  {
    id: 7,
    title: '秋季音乐节',
    image: '../../static/abc.png',
    date: '2023年09月30日',
    location: '奥林匹克体育中心',
    participants: { current: 5000, total: 5000 },
    status: 'ended', // 状态：已结束
  },
])

// 方法
const switchTab = (e) => {
  currentTab.value = e.currentIndex
}

const getStatusText = (status) => {
  const statusMap = {
    enrolled: '已报名',
    pending: '待审核',
    ended: '已结束',
    ongoing: '进行中',
    upcoming: '未开始',
    refund_pending: '待退款', // 新状态文本
    canceled: '已取消'      // 新状态文本
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

// [修改] 取消报名不再是删除，而是改变状态
const cancelEnroll = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消报名吗？取消后需申请退款。',
    success: (res) => {
      if (res.confirm) {
        // 在真实项目中，这里应该是API调用
        const activity = enrolledActivities.value.find(act => act.id === item.id)
        if (activity) {
          activity.status = 'refund_pending'
        }
        uni.showToast({
          title: '已取消，请申请退款',
          icon: 'none'
        })
      }
    }
  })
}

// [新增] 跳转到退款申请页
const applyForRefund = (item) => {
  uni.navigateTo({
    url: `/pages/my-active-apply/my-active-apply?id=${item.id}`
  })
}

// [新增] 发布者取消活动
const cancelActivity = (item) => {
  uni.showModal({
    title: '警告',
    content: '确定要取消您发布的此活动吗？此操作不可逆，且需要您为所有已报名用户处理退款。',
    confirmColor: '#f44336', // 红色警告
    success: (res) => {
      if (res.confirm) {
        // 在真实项目中，这里应该是API调用
        const activity = publishedActivities.value.find(act => act.id === item.id)
        if (activity) {
          activity.status = 'canceled'
        }
        uni.showToast({
          title: '活动已取消',
          icon: 'none'
        })
      }
    }
  })
}

// [新增] 跳转到退款管理页
const manageRefunds = (item, mode) => {
  uni.navigateTo({
    url: `/pages/my-active-manage/my-active-manage?id=${item.id}&mode=${mode}`
  })
}

// 管理活动（目前用于数据统计）
const manageActivity = (item) => {
  if (item.status === 'ended') {
    uni.navigateTo({
      url: `/pages/activity/stats?id=${item.id}`
    })
  } else {
    // 可以为其他状态定义管理行为
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
  // 模拟网络请求
  setTimeout(() => {
    refreshing.value = false
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  }, 1000)
}

onLoad(() => {
  // 可以在这里从服务器加载真实数据
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
  border-bottom: 1rpx solid #f0f2f5;
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
    color: #1c1e21;
  }
}

.activity-list {
  padding-bottom: 40rpx;
}

.activity-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
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
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.activity-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1c1e21;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  
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
  
  // 新增状态样式
  &.refund_pending, &.canceled {
    background-color: #e3f2fd;
    color: #2196f3;
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
  margin: 0;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  background-color: transparent;
  
  // 消除button默认边框
  &::after {
    border: none;
  }
  
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

  // 新增按钮样式
  &-refund-apply {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  &-refund-manage {
    background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
    color: white;
  }
}

.btn-approval {
  background-color: #e3f2fd;
  color: #2196f3;
  display: flex; // 为了让徽标对齐
  align-items: center;
  .badge {
    margin-left: 8rpx;
  }
}

.primary-btn {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  border: none;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-top: 24rpx;
}

// 空状态组件样式 (假设您有一个名为 empty-state 的组件)
:deep(empty-state) {
  .empty-state-content {
    text-align: center;
    padding: 80rpx 0;
    background-color: #fff;
    border-radius: 16rpx;
    margin-top: 40rpx;
  }
  
  .title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .description {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
}
</style>