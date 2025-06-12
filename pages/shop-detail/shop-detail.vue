<template>
    <view class="store-detail-page">
        
        <!-- 内容区域 -->
        <view class="content-scroll">
            <!-- 商店封面图 -->
            <view class="store-cover">
                <!-- 实际项目中可在此处放置图片，例如 <img src="/static/store-cover.jpg" alt="门店封面"> -->
                <view class="cover-overlay">
                    <view class="store-name">蓝调酒吧</view>
                    <view class="distance"><i class="fas fa-location-arrow"></i> 0.8km</view>
                </view>
            </view>
            
            <!-- 商店基本信息 -->
            <view class="store-info">
                <view class="store-tags">
                    <view class="store-tag">鸡尾酒</view>
                    <view class="store-tag">爵士乐</view>
                    <view class="store-tag">聚会</view>
                    <view class="store-tag">威士忌</view>
                    <view class="store-tag">精酿啤酒</view>
                </view>
                
                <view class="store-desc">
                    爵士乐主题酒吧，提供各类特色鸡尾酒和精酿啤酒，环境优雅舒适，每晚有现场爵士乐队表演。适合朋友聚会、情侣约会和小型派对。我们精选世界各地优质酒品，搭配精致小食，为您打造完美的夜晚体验。
                </view>
            </view>
            
            <!-- 详情卡片 - 基本信息 -->
            <view class="detail-card">
                <view class="card-title">基本信息</view>
                
                <view class="info-item">
                    <view class="info-content">
                        <view class="info-title">📍地址</view>
                        <view class="info-text">朝阳区三里屯路18号院2号楼1层101</view>
                    </view>
                </view>
                
                <view class="info-item">
                    <view class="info-content">
                        <view class="info-title">🕒营业时间</view>
                        <view class="hours-item">
                            <view class="hours-day">周一至周四</view>
                            <view class="hours-time">18:00 - 02:00</view>
                        </view>
                        <view class="hours-item">
                            <view class="hours-day">周五至周六</view>
                            <view class="hours-time">18:00 - 04:00</view>
                        </view>
                        <view class="hours-item">
                            <view class="hours-day">周日</view>
                            <view class="hours-time">18:00 - 01:00</view>
                        </view>
                    </view>
                </view>
                
                <view class="info-item">
                    <view class="info-content">
                        <view class="info-title">📱电话</view>
                        <view class="info-text">010-8765-4321</view>
                    </view>
                </view>

                <view class="info-item">
                    <view class="info-content">
                        <view class="info-title">💬微信</view>
                        <img class="wechat-qr" src="https://cdn.jsdelivr.net/gh/zjcqoo/weui-app@master/static/images/wechat.png" alt="微信二维码" />
                    </view>
                </view>
                
                <view class="info-item">
                    <view class="info-content">
                        <view class="info-title">💰人均消费</view>
                        <view class="info-text">¥120 - ¥200</view>
                    </view>
                </view>
                
                <view class="map-preview" @click="openMap">
                    <i class="fas fa-map-marked-alt" style="font-size: 80rpx; opacity: 0.3;"></i>
                    <view class="map-overlay">点击查看地图位置</view>
                </view>
            </view>
            
        </view>
        
        <!-- 底部操作栏 -->
        <view class="action-bar">
            <button class="nav-btn" @click="openNavigation">
                <i class="fas fa-map-marker-alt"></i> 导航
            </button>
            <button class="primary-btn" @click="callPhone">
                <i class="fas fa-phone-alt"></i> 电话预订
            </button>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
// Uni-app项目通常全局拥有uni对象，无需额外导入

// 特色推荐数据
const featuredItems = ref([
    {
        id: 1,
        name: "蓝色夏威夷",
        desc: "经典热带鸡尾酒，混合朗姆酒和蓝柑橘酒",
        price: "68"
    },
    {
        id: 2,
        name: "威士忌酸",
        desc: "波本威士忌搭配柠檬汁和糖浆",
        price: "78"
    },
    {
        id: 3,
        name: "精酿啤酒套餐",
        desc: "三款特色精酿啤酒组合",
        price: "128"
    },
    {
        id: 4,
        name: "爵士之夜套餐",
        desc: "鸡尾酒两杯+小食拼盘",
        price: "198"
    }
]);

// 返回上一页
const handleBack = () => {
    // uni.navigateBack() 用于返回上一页，通常在Uni-app中使用
    uni.navigateBack();
};

// 分享功能
const handleShare = () => {
    // uni.share() 用于分享，根据平台配置
    uni.share({
        provider: 'weixin', // 示例：微信分享
        scene: 'WXSceneSession', // 示例：分享到会话
        type: 0, // 文本类型
        title: '蓝调酒吧',
        href: 'https://example.com/shop/1', // 分享的链接
        success: function (res) {
            console.log('分享成功:', res);
            uni.showToast({ title: '分享成功', icon: 'success' });
        },
        fail: function (err) {
            console.log('分享失败:', err);
            uni.showToast({ title: '分享失败', icon: 'none' });
        }
    });
};

// 打开地图
const openMap = () => {
    // uni.openLocation() 用于打开地图应用并显示指定位置
    uni.openLocation({
        latitude: 39.908823, // 纬度
        longitude: 116.397470, // 经度
        name: '蓝调酒吧', // 地点名称
        address: '朝阳区三里屯路18号院2号楼1层101', // 详细地址
        success: function () {
            console.log('打开地图成功');
        },
        fail: function (err) {
            console.log('打开地图失败:', err);
            uni.showToast({ title: '无法打开地图', icon: 'none' });
        }
    });
};

// 打开导航 (功能与 openMap 类似，uni.openLocation 实际会引导至地图应用进行导航)
const openNavigation = () => {
    uni.openLocation({
        latitude: 39.908823,
        longitude: 116.397470,
        name: '蓝调酒吧',
        address: '朝阳区三里屯路18号院2号楼1层101',
        success: function () {
            console.log('打开导航成功');
        },
        fail: function (err) {
            console.log('打开导航失败:', err);
            uni.showToast({ title: '无法打开导航', icon: 'none' });
        }
    });
};

// 拨打电话
const callPhone = () => {
    // uni.makePhoneCall() 用于拨打电话
    uni.makePhoneCall({
        phoneNumber: '01087654321', // 电话号码
        success: function () {
            console.log('拨打电话成功');
        },
        fail: function (err) {
            console.log('拨打电话失败:', err);
            uni.showToast({ title: '拨打电话失败', icon: 'none' });
        }
    });
};

// 查看商品详情
const viewItemDetail = (item) => {
    // uni.navigateTo() 用于页面跳转，这里跳转到商品详情页
    uni.navigateTo({
        url: `/pages/product/detail?id=${item.id}`, // 假设商品详情页路径为 /pages/product/detail
        success: function() {
            console.log(`查看 ${item.name} 详情`);
        }
    });
};
</script>

<style scoped>
/* 定义 CSS 变量 (在实际 Uni-app 项目中，这些变量通常定义在 App.vue 或全局 CSS 文件中) */
:root {
    --primary: #FF6B00;
    --primary-light: #FF8A33;
    --primary-lightest: #fff5ec;
    --light-bg: #f8f8f8;
    --dark-text: #333;
    --gray-text: #666;
    --light-text: #999;
    --border: #eee;
    --weui-BG-0: #ededed;
    --weui-BG-1: #f7f7f7;
}


/* 页面根容器样式，模拟 body/html 的高度和布局 */
.store-detail-page {
    background-color: white;
    color: var(--dark-text);
    line-height: 1.6;
    font-size: 32rpx; /* Uni-app 推荐使用 rpx */
    height: 100vh; /* 确保页面占满视口高度 */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 防止页面滚动条出现，由 content-scroll 控制 */
}

/* 顶部导航栏 */
.navbar {
    background: white;
    padding: 0 30rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    position: relative;
    z-index: 100;
    box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}

.back-btn, .action-btn {
    font-size: 40rpx;
    color: var(--dark-text);
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s;
    /* cursor: pointer; 在H5有效，小程序无此概念 */
}
.back-btn { margin-right: 30rpx; }
.action-btn { margin-left: 30rpx; }

.back-btn:active, .action-btn:active {
    background-color: var(--weui-BG-0);
}

.navbar-title {
    font-size: 36rpx;
    font-weight: 600;
    color: var(--dark-text);
    flex: 1;
    text-align: center; /* 居中标题 */
    position: absolute; /* 使标题居中不被按钮影响 */
    left: 50%;
    transform: translateX(-50%);
    width: 300rpx; /* 限制宽度防止过长 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 商店封面图 */
.store-cover {
    height: 480rpx;
    position: relative;
    overflow: hidden;
    background: linear-gradient(45deg, #2c3e50, #4a6491); /* 示例背景，可替换为图片 */
}

.store-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
}

.cover-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 40rpx 30rpx;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.store-name {
    font-size: 48rpx;
    font-weight: 700;
    letter-spacing: 1rpx;
}

.distance {
    background: rgba(255,255,255,0.2);
    padding: 12rpx 24rpx;
    border-radius: 32rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    backdrop-filter: blur(4px); /* 磨砂效果 */
}

.distance i {
    margin-right: 10rpx;
}

/* 商店基本信息 */
.store-info {
    padding: 40rpx 30rpx;
    border-bottom: 16rpx solid var(--weui-BG-0);
}

.store-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 40rpx;
}

.store-tag {
    background: var(--primary-lightest);
    color: var(--primary);
    padding: 12rpx 28rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
    font-weight: 500;
}

.store-desc {
    font-size: 30rpx;
    color: var(--gray-text);
    line-height: 1.7;
}

/* 详情卡片 */
.detail-card {
    background: white;
    border-bottom: 16rpx solid var(--weui-BG-0);
    padding: 40rpx 30rpx;
}

.detail-card:last-of-type {
    border-bottom: none; /* 最后一个卡片下方无需分割线 */
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); /* 适配底部安全区域 */
}

.card-title {
    font-size: 36rpx;
    font-weight: 600;
    /* margin-bottom: 16rpx; */
    position: relative;
    padding-left: 24rpx;
    display: flex;
    align-items: center;
}

.card-title::before {
    content: "";
    position: absolute;
    left: 0;
    top: 12rpx; /* 根据字体大小和行高调整 */
    width: 8rpx;
    height: 36rpx;
    background: var(--primary);
    border-radius: 4rpx;
}

.info-item {
    display: flex;
    padding: 28rpx 0;
    border-bottom: 1px solid var(--border);
	margin-left: 5rpx;
}

.info-item:last-child {
    border-bottom: none;
}

.info-icon {
    width: 48rpx; /* 固定宽度，确保图标对齐 */
    color: var(--primary);
    font-size: 36rpx;
    margin-right: 24rpx;
    display: flex;
    align-items: flex-start; /* 图标顶部对齐文字 */
    justify-content: center;
}

.info-content {
    flex: 1; /* 占据剩余空间 */
}

.info-title {
    font-weight: 500;
    margin-bottom: 8rpx;
    color: var(--dark-text);
}

.info-text {
    color: var(--gray-text);
    font-size: 30rpx;
    line-height: 1.6;
}

.hours-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    font-size: 30rpx; /* 统一文字大小 */
}

.hours-item:last-child {
    margin-bottom: 0;
}

.hours-day {
    color: var(--gray-text);
}

.hours-time {
    font-weight: 500;
    color: var(--dark-text);
}

/* 特色推荐 */
.featured-items {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    margin-top: 20rpx;
}

.featured-item {
    width: calc(50% - 12rpx); /* 两列布局 */
    border: 1px solid var(--border);
    border-radius: 24rpx;
    overflow: hidden;
    transition: all 0.3s;
}

.featured-item:active {
    transform: scale(0.98);
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.featured-image {
    height: 240rpx;
    background: var(--weui-BG-0);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--light-text);
    font-size: 60rpx; /* 图标大小 */
}

.featured-content {
    padding: 24rpx;
}

.featured-name {
    font-weight: 600;
    margin-bottom: 12rpx;
    font-size: 32rpx;
}

.featured-desc {
    color: var(--gray-text);
    font-size: 26rpx;
    line-height: 1.5;
    min-height: 78rpx; /* 确保描述行高一致 */
}

.featured-price {
    color: var(--primary);
    font-weight: 600;
    margin-top: 16rpx;
    font-size: 30rpx;
}

/* 底部操作栏 */
.action-bar {
    background: white;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); /* 适配底部安全区域 */
    display: flex;
    gap: 20rpx;
    border-top: 1px solid var(--border);
    position: sticky; /* Sticky 或 fixed 根据实际需求选择 */
    bottom: 0;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.nav-btn, .primary-btn {
    border-radius: 50rpx;
    padding: 0; /* 按钮内部无需额外padding */
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    /* cursor: pointer; */
    transition: all 0.3s;
    flex: 1;
    height: 100rpx;
    line-height: 1; /* 消除默认button的line-height影响 */
}

.nav-btn {
    background: white;
    color: var(--primary);
    border: 1px solid var(--primary);
}

.nav-btn i, .primary-btn i {
    margin-right: 16rpx;
}

.nav-btn:active {
    background: var(--primary-lightest);
    transform: scale(0.98);
}

.primary-btn {
    background: var(--primary);
    color: white;
    border: none;
}

.primary-btn:active {
    background: var(--primary-light);
    transform: scale(0.98);
}

/* 滚动区域 */
.content-scroll {
    flex: 1; /* 占据剩余垂直空间 */
    overflow-y: auto; /* 允许内容滚动 */
    -webkit-overflow-scrolling: touch; /* 提高iOS设备滚动流畅度 */
    scroll-behavior: smooth;
}

/* 地图预览 */
.map-preview {
    height: 360rpx;
    background: var(--weui-BG-0);
    border-radius: 24rpx;
    margin-top: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--light-text);
    position: relative;
    overflow: hidden;
    /* cursor: pointer; */
}

.map-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30rpx;
    background: rgba(0,0,0,0.6);
    color: white;
    text-align: center;
    font-size: 30rpx;
}

/* 微信二维码 */
.wechat-qr {
    width: 200rpx;
    height: 200rpx;
    margin-top: 10rpx;
    display: block; /* 确保图片独占一行 */
}
</style>