<template>
  <view class="page">
    <!-- 表单内容 -->
    <view class="form-section">
      <view class="section-title">基本信息</view>

      <uni-forms>
        <uni-forms-item label="活动标题" required>
          <uni-easyinput v-model="form.title" placeholder="请输入活动标题" />
        </uni-forms-item>

        <!-- 新增的活动类型选择 -->
        <uni-forms-item label="活动类型" required>
          <uni-data-select
            v-model="form.activityType"
            :localdata="activityTypeOptions"
            placeholder="请选择活动类型"
          ></uni-data-select>
        </uni-forms-item>
        <!-- 新增部分结束 -->

        <uni-forms-item label="活动封面" required>
          <view class="cover-upload" @click="uploadCover">
              <image v-if="form.cover" :src="form.cover" mode="aspectFill"></image>
              <text v-else>点击上传封面图片</text>
            </view>
        </uni-forms-item>

        <uni-forms-item label="活动时间" required>
          <uni-datetime-picker type="datetimerange" v-model="form.time" rangeSeparator="至" />
        </uni-forms-item>
		
		<uni-forms-item label="报名时间" required>
		  <uni-datetime-picker type="datetimerange" v-model="form.enrollTime" rangeSeparator="至" />
		</uni-forms-item>

        <uni-forms-item label="活动地点" required>
		  <view class="uni-list-cell-db">
		  	<view @click="openMapToChooseLocation" class="uni-input">
		  		<!-- 显示选择结果 -->
		  		<text v-if="selectedLocationInfo">{{ selectedLocationInfo.address || selectedLocationInfo.name }}</text>
		  		<text v-else class="placeholder">点击选择位置</text>
		  		<text class="arrow">></text>
		  	</view>
		  </view>
        </uni-forms-item>

        <uni-forms-item label="总名额" required>
          <uni-easyinput type="number" v-model="form.capacity" placeholder="请输入活动总名额" />
        </uni-forms-item>

        <!-- 修改报名费用部分 -->
        <uni-forms-item label="报名类型" required>
            <uni-data-checkbox
                v-model="form.enrollmentType"
                :localdata="enrollmentOptions"
                mode="button"
            ></uni-data-checkbox>
        </uni-forms-item>

        <!-- AA模式下的预报名费用 -->
        <uni-forms-item label="预报名费用 (元)" v-if="form.enrollmentType === 'aa'" required>
            <uni-easyinput type="digit" v-model="form.aaFee" placeholder="请输入预报名费用" />
        </uni-forms-item>

        <!-- 赞助模式下的公司信息 -->
        <template v-if="form.enrollmentType === 'sponsor'">
            <uni-forms-item label="公司名称" required>
                <uni-easyinput v-model="form.sponsorName" placeholder="请输入赞助公司名称" />
            </uni-forms-item>
            <uni-forms-item label="公司Logo" required>
                <view class="cover-upload" @click="uploadSponsorLogo">
                    <image v-if="form.sponsorLogo" :src="form.sponsorLogo" mode="aspectFit"></image>
                    <text v-else>点击上传公司Logo图片</text>
                </view>
            </uni-forms-item>
        </template>
        <!-- 修改报名费用部分 结束 -->

      </uni-forms>
    </view>

    <view class="form-section">
      <view class="section-title">活动详情</view>
      <uni-forms-item label="活动介绍" required>
        <uni-easyinput type="textarea" autoHeight v-model="form.description" placeholder="请输入活动详细介绍" />
      </uni-forms-item>

      <view v-for="(item, index) in form.agenda" :key="index" class="activity-item">
        <view class="input-group">
          <uni-easyinput v-model="item.title" placeholder="环节标题" />
          <uni-easyinput v-model="item.desc" placeholder="环节描述" />
          <uni-icons type="close" @click="removeAgenda(index)" />
        </view>
      </view>

      <view class="add-btn" @click="addAgenda">
        <uni-icons type="plusempty" /><text>添加活动环节</text>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">组织者信息</view>

      <uni-forms>
        <uni-forms-item label="组织者姓名" required>
          <uni-easyinput v-model="form.organizer" placeholder="请输入组织者姓名" />
        </uni-forms-item>

        <uni-forms-item label="组织单位" required>
          <uni-easyinput v-model="form.organization" placeholder="请输入组织单位名称" />
        </uni-forms-item>

        <uni-forms-item label="联系电话" required>
          <uni-easyinput type="number" v-model="form.phone" placeholder="请输入联系电话" />
        </uni-forms-item>

        <uni-forms-item label="收款码上传">
          <view class="cover-upload" @click="uploadCode">
              <image v-if="form.qrcode" :src="form.qrcode" mode="aspectFit"></image>
              <text v-else>点击上传收款码图片</text>
            </view>
        </uni-forms-item>
      </uni-forms>
    </view>
	
	<view class="form-section">
	  <view class="section-title">商圈信息</view>
	  <view style="font-size: 32rpx;color:darkgray;margin-bottom: 10rpx;">
	  	请选择聚店:
	  </view>
	
	  <!-- 搜索输入框 -->
	  <view class="search-bar">
	    <uni-easyinput
	      v-model="searchKeyword"
	      placeholder="搜索店铺名称"
	      @input="filterShops"
	    />
	  </view>
	  
	  <!-- 显示搜索结果 -->
	  <view class="shop-list" v-if="searchKeyword && filteredShops.length > 0">
	    <view
	      v-for="shop in filteredShops"
	      :key="shop.id"
	      class="shop-item"
	      :class="{ 'selected': form.businessName === shop.name }"
	      @click="selectShop(shop)"
	    >
	      {{ shop.name }} ({{ shop.address }})
	    </view>
	  </view>
	  <view v-else-if="searchKeyword && filteredShops.length === 0" class="selected-shop">
	    未找到相关店铺。
	  </view>
	
	  <!-- 显示已选店铺 -->
	  <view class="selected-shop" v-if="form.businessName">
	    当前选择店铺：{{ form.businessName }}
	  </view>
	</view>


    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn save-btn" @click="saveDraft">保存草稿</view>
      <view class="action-btn publish-btn" @click="publish">发布活动</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const form = ref({
  title: '互联网创业者交流会',
  activityType: '交流会', // 新增：活动类型字段，并设置默认值
  cover: '',
  enrollTime: ['2025-06-15 14:00:00', '2025-06-15 17:00:00'],
  time: ['2025-06-15 14:00:00', '2025-06-15 17:00:00'],
  location: '上海市浦东新区张江高科技园区',
  capacity: 50,
  enrollmentType: 'aa', 
  aaFee: 100, 
  sponsorLogo: '', 
  sponsorName: '', 
  description: `本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。...`,
  agenda: [
    { title: '主题演讲', desc: '行业大咖分享创业经验' },
    { title: '圆桌论坛', desc: '创业者互动讨论' },
    { title: '自由交流', desc: '拓展人脉资源' }
  ],
  organizer: '张经理',
  organization: '创新科技活动策划部',
  phone: '021-68881234',
  qrcode: '',
  businessName: '创客空间咖啡厅',
  businessAddress: '张江高科技园区88号',
  businessPhone: '021-68881234',
  businessHours: '09:00-22:00 (每日营业)'
})

// 新增：活动类型选项
// 注意：“全部类型”通常用于列表筛选，在创建表单中一般不提供，因此这里未包含
const activityTypeOptions = ref([
    { value: '交流会', text: '交流会' },
    { value: '沙龙', text: '沙龙' },
    { value: '峰会', text: '峰会' },
    { value: '分享会', text: '分享会' },
    { value: '创业猎伙', text: '创业猎伙' },
    { value: '其他', text: '其他' }
]);

// 报名类型选项
const enrollmentOptions = ref([
    { text: 'AA', value: 'aa' },
    { text: '赞助', value: 'sponsor' }
]);

const selectedLocationInfo = ref(null); // 用于存储地图选择结果
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log('选择位置成功:', res);
				selectedLocationInfo.value = {
					name: res.name,
					address: res.address,
					latitude: res.latitude,
					longitude: res.longitude
				};
                // 同时更新 form.location 以便验证和提交
                form.value.location = res.address || res.name;
			},
			fail: (err) => {
				console.log('选择位置失败:', err);
				if (err.errMsg.includes('cancel')) {
					// 用户取消了选择
				} else {
					uni.showToast({
						title: '选择位置失败',
						icon: 'none'
					});
				}
			}
		});
	}

function goBack() {
  uni.navigateBack()
}

function uploadCover() {
  uni.chooseImage({ count: 1, success: res => form.value.cover = res.tempFilePaths[0] })
}

function uploadCode() {
  uni.chooseImage({ count: 1, success: res => form.value.qrcode = res.tempFilePaths[0] })
}

// 新增：上传公司Logo的方法
function uploadSponsorLogo() {
    uni.chooseImage({ count: 1, success: res => form.value.sponsorLogo = res.tempFilePaths[0] })
}

function addAgenda() {
  form.value.agenda.push({ title: '', desc: '' })
}

function removeAgenda(index) {
  form.value.agenda.splice(index, 1)
}

function saveDraft() {
  uni.showToast({ title: '活动已保存为草稿', icon: 'none' })
  // 实际保存逻辑
  console.log('保存草稿:', form.value);
}

function publish() {
  // 验证表单数据
  // 简单验证示例：
  if (!form.value.title) {
    uni.showToast({ title: '请输入活动标题', icon: 'none' }); return;
  }
  // 新增：验证活动类型
  if (!form.value.activityType) {
    uni.showToast({ title: '请选择活动类型', icon: 'none' }); return;
  }
  if (!form.value.cover) {
    uni.showToast({ title: '请上传活动封面', icon: 'none' }); return;
  }
  if (!form.value.time || form.value.time.length !== 2) {
    uni.showToast({ title: '请选择活动时间', icon: 'none' }); return;
  }
  if (!form.value.enrollTime || form.value.enrollTime.length !== 2) {
    uni.showToast({ title: '请选择报名时间', icon: 'none' }); return;
  }
  if (!form.value.location) {
    uni.showToast({ title: '请选择活动地点', icon: 'none' }); return;
  }
  if (!form.value.capacity || form.value.capacity <= 0) {
    uni.showToast({ title: '请输入正确的总名额', icon: 'none' }); return;
  }
  
  if (form.value.enrollmentType === 'aa') {
      if (form.value.aaFee === null || form.value.aaFee < 0) {
          uni.showToast({ title: '请输入正确的预报名费用', icon: 'none' }); return;
      }
  } else if (form.value.enrollmentType === 'sponsor') {
      if (!form.value.sponsorName) {
          uni.showToast({ title: '请输入公司名称', icon: 'none' }); return;
      }
      if (!form.value.sponsorLogo) {
          uni.showToast({ title: '请上传公司Logo', icon: 'none' }); return;
      }
  }

  if (!form.value.description) {
    uni.showToast({ title: '请输入活动介绍', icon: 'none' }); return;
  }
  if (!form.value.organizer) {
    uni.showToast({ title: '请输入组织者姓名', icon: 'none' }); return;
  }
  if (!form.value.organization) {
    uni.showToast({ title: '请输入组织单位', icon: 'none' }); return;
  }
  if (!form.value.phone) {
    uni.showToast({ title: '请输入联系电话', icon: 'none' }); return;
  }
  // 可以添加更复杂的电话号码格式验证

  uni.showToast({ title: '活动发布成功！', icon: 'success' })
  console.log('发布活动:', form.value);
  // 可在此处提交表单并跳转页面
}

const searchKeyword = ref('')
const filteredShops = ref([])

// 模拟店铺数据
const allShops = ref([
  { id: 1, name: '创客空间咖啡厅', address: '张江高科技园区88号' },
  { id: 2, name: '创业孵化园会议中心', address: '浦东新区XX路123号' },
  { id: 3, name: '数字未来展厅', address: '杨浦区YY路456号' },
  { id: 4, name: '科技创新中心', address: '徐汇区ZZ路789号' }
]);

function filterShops() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) {
    filteredShops.value = [];
    return;
  }
  filteredShops.value = allShops.value.filter(shop =>
    shop.name.toLowerCase().includes(keyword) || shop.address.toLowerCase().includes(keyword)
  );
}


function selectShop(shop) {
  form.value.businessName = shop.name;
  // 如果需要，也可以把其他店铺信息保存到 form 中
  form.value.businessAddress = shop.address;

  uni.showToast({ title: `已选择：${shop.name}`, icon: 'none' });
  // 清空搜索结果，只显示已选择的
  filteredShops.value = [];
  searchKeyword.value = shop.name; // 将搜索框内容设置为已选店铺名称
}

</script>

<style lang="scss" scoped>
.page {
  background-color: #f8f8f8;
  padding-bottom: 160rpx;
}
.top-nav {
  background-color: #FF6F00;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  font-size: 32rpx;
}
.page-title {
  flex: 1;
  text-align: center;
  font-weight: bold;
}
.form-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6F00;
  margin-bottom: 20rpx;
  border-left: 10rpx solid #FF6F00;
  padding-left: 20rpx;
}

.uni-list-cell-db {
			margin-left: 10rpx;
			padding: 20rpx;
			margin: 10rpx 0;
			border: #ffe1d2 solid 1rpx;
			min-width: 500rpx;

			.uni-input {
				margin-left: 10rpx;
				font-size: 28rpx;
				display: flex; // 使用flex布局
				justify-content: space-between; // 两端对齐
				align-items: center; // 垂直居中
				
				
				.placeholder{
					color: #939393;
				}

				.arrow {
					color: #999;
					font-size: 32rpx;
				}
			}
		}


.cover-upload {
  border: 2rpx dashed #ccc;
  border-radius: 16rpx;
  background-color: #fafafa;
  color: #999;
  
  width: 100%; 
  height: 200rpx; 

  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  
  overflow: hidden; 
  
  cursor: pointer;

  text {
    font-size: 28rpx;
  }

  image {
    width: 100%; 
    height: 100%; 
  }
}
.activity-item {
  margin: 20rpx 0;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  position: relative; // 为内部的绝对定位提供上下文
  .uni-icons {
    position: absolute; // 让图标浮动在输入框组的右侧
    right: 20rpx; // 调整位置
    top: 50%; // 垂直居中
    transform: translateY(-50%);
    color: #999;
    font-size: 40rpx !important; // 根据需要调整图标大小
  }
  // 调整每个 easyinput 的样式，让它们不会被图标覆盖
  uni-easyinput {
    // 增加右侧内边距，为图标留出空间
    ::v-deep .uni-easyinput__content {
      padding-right: 60rpx; // 留出足够空间，避免与图标重叠
    }
  }
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF6F00;
  font-weight: bold;
  margin-top: 20rpx;
  gap: 10rpx;
}
.action-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  // box-shadow: 0 -5rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}
.action-btn {
  flex: 1;
  margin:  10rpx;
  padding: 24rpx;
  text-align: center;
  border-radius: 16rpx;
  font-weight: bold;
  font-size: 28rpx;
}
.save-btn {
  background-color: #f0f0f0;
  color: #666;
}
.publish-btn {
  background-color: #FF6F00;
  color: #fff;
}

.search-bar {
  margin-bottom: 20rpx;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-height: 300rpx; /* 设置最大高度并允许滚动 */
  overflow-y: auto;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 10rpx;
  margin-bottom: 20rpx;
}

.shop-item {
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 16rpx;
  font-size: 28rpx;
  cursor: pointer;
  &:active {
    background-color: #e0e0e0; // 点击时的反馈
  }
}

.shop-item.selected {
  background-color: #FF6F00;
  color: #fff;
  font-weight: bold;
}

.selected-shop {
  margin-top: 20rpx;
  color: #666;
  font-size: 26rpx;
}

/* 修复 uni-data-select 样式可能不一致的问题 */
::v-deep .uni-select {
    // border: none !important;
    font-size: 28rpx !important;
}
::v-deep .uni-select__input-text {
    color: #333;
}
::v-deep .uni-select__input-placeholder {
    color: #939393;
}

</style>