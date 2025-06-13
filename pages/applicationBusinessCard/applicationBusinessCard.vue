<template>
    <view class="business-card-apply-page">
        
        <view class="container">
            <!-- 申请卡片 -->
            <view class="application-card">
                <view class="target-user">
                    <view class="target-avatar">{{ contactName.charAt(0) }}</view>
                    <view class="target-name">{{ contactName }}</view>
                    <view class="target-title">{{ contactCompany }}</view>
                </view>
                
                <view class="description">
                    您正在申请查看<span class="highlight">{{ contactName }}</span>的联系方式。请选择一种方式支付查看费用：
                </view>
                
                <view class="cost-section">
                    <view class="cost-title">选择支付方式</view>
                    
                    <view class="cost-options">
                        <view 
                            class="cost-option" 
                            :class="{selected: selectedOption === 'contribution'}" 
                            @click="selectOption('contribution')"
                        >
                            <view class="currency-icon">
                                <i class="fas fa-coins"></i>
                            </view>
                            <view class="cost-amount">10</view>
                            <view class="cost-label">贡分</view>
                        </view>
                        
                        <view 
                            class="cost-option" 
                            :class="{selected: selectedOption === 'wisdom'}" 
                            @click="selectOption('wisdom')"
                        >
                            <view class="currency-icon">
                                <i class="fas fa-gem"></i>
                            </view>
                            <view class="cost-amount">1</view>
                            <view class="cost-label">智米</view>
                        </view>
                    </view>
                    
                    <view class="user-balance">
                        <view class="balance-item">
                            <view>我的贡分</view>
                            <view 
                                class="balance-value" 
                                :class="{ 'insufficient-value': userPoints.contribution < 10 && selectedOption === 'contribution' }"
                            >
                                {{ userPoints.contribution }}
                            </view>
                        </view>
                        
                        <view class="balance-item">
                            <view>我的智米</view>
                            <view 
                                class="balance-value" 
                                :class="{ 'insufficient-value': userPoints.wisdom < 1 && selectedOption === 'wisdom' }"
                            >
                                {{ userPoints.wisdom }}
                            </view>
                        </view>
                    </view>
                    
                    <view class="insufficient" v-if="showInsufficient">
                        <i class="fas fa-exclamation-circle"></i> 您的积分不足，请先获取更多积分
                    </view>
                </view>
                
                <view class="action-buttons">
                    <button class="btn btn-primary" @click="exchangePoints">
                        确认兑换
                    </button>
                    
                    <button class="btn btn-secondary" @click="goToEarnPoints">
                        获取更多积分
                    </button>
                </view>
                
                <view class="success-message" v-if="showSuccess">
                    <i class="fas fa-check-circle"></i> 兑换成功！即将为您展示对方名片...
                </view>
            </view>
            
            <!-- 提示信息 -->
            <view class="info-card">
                <!-- 优化：添加图标和类名，标题内容居中 -->
                <h1 class="info-card-title">
                    <i class="fas fa-info-circle"></i> 为什么需要支付积分？
                </h1>
                <p>为了维护平台的商业环境和用户隐私，查看他人联系方式需要消耗积分。这有助于：</p>
                <ul>
                    <li>确保联系请求的严肃性</li>
                    <li>保护用户免受骚扰</li>
                    <li>维护高质量商业环境</li>
                    <li>激励用户贡献高质量内容</li>
                </ul>
            </view>
        </view>
        
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue'; // Uni-app环境通常全局有uni对象

// 当前用户积分数据
const userPoints = reactive({
    contribution: 11,  // 贡分
    wisdom: 0         // 智米
});

// 目标联系人信息 (只需保留用到的，移除了邮箱、地址、网址，因为它们只在已移除的弹窗中使用)
const contactName = ref('陈总');
const contactCompany = ref('创新科技有限公司');

// 状态管理
const selectedOption = ref('contribution');
const showInsufficient = ref(false);
const showSuccess = ref(false);
// showContactModal 变量不再需要，因为它相关的弹窗已移除

// 选择支付方式
const selectOption = (option) => {
    selectedOption.value = option;
    showInsufficient.value = false; // 切换选项时隐藏积分不足提示
};

// 兑换积分
const exchangePoints = () => {
    let sufficient = false;
    if (selectedOption.value === 'contribution') {
        if (userPoints.contribution >= 10) {
            userPoints.contribution -= 10;
            sufficient = true;
        }
    } else if (selectedOption.value === 'wisdom') {
        if (userPoints.wisdom >= 1) {
            userPoints.wisdom -= 1;
            sufficient = true;
        }
    }

    if (sufficient) {
        showSuccess.value = true;
        showInsufficient.value = false;
        uni.showToast({
            title: '兑换成功！',
            icon: 'success',
            duration: 2000
        });
        
        // 2秒后跳转到我的名片页面
        setTimeout(() => {
            showSuccess.value = false;
            uni.navigateTo({
                url: '/pages/my-businessCard/my-businessCard' // 兑换成功后跳转到的页面
            });
        }, 2000);
    } else {
        showInsufficient.value = true;
        uni.showToast({
            title: '积分不足，请先获取更多积分',
            icon: 'error', // 可以在uni-app中使用'none'并自定义图标
            duration: 2000
        });
    }
};

// 关闭联系方式弹窗 (此函数不再被调用，但如果将来有其他弹窗逻辑，可以保留此模式)
// const closeContact = () => {
//     showContactModal.value = false;
// };

// 返回上一页 (此函数在模板中未被使用，但通常一个完整的页面会有返回按钮)
const goBack = () => {
    uni.navigateBack({
        delta: 1 // 返回上一级页面
    });
};

// 前往赚取积分页面
const goToEarnPoints = () => {
    uni.navigateTo({
        url: '/pages/my-account/my-account' // 假设赚取积分页面路径为 /pages/earn-points/earn-points
    });
};
</script>

<style scoped>
/* 页面根容器样式，模拟 body 的布局和最大宽度 */
.business-card-apply-page {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #333;
    line-height: 1.6;
    max-width: 750rpx; /* uni-app 推荐使用 rpx */
    margin: 0 auto; /* 页面内容居中 */
    position: relative;
    min-height: 100vh; /* 确保页面至少占满视口高度 */
    display: flex; /* 使用 flex 布局，使顶部导航和内容可以分开管理 */
    flex-direction: column;
}

.container {
    padding: 40rpx; /* 转换为 rpx */
    padding-bottom: 160rpx; /* 为底部导航栏留出空间，转换为 rpx */
    flex: 1; /* 容器占据剩余垂直空间 */
    overflow-y: auto; /* 允许内容垂直滚动 */
    -webkit-overflow-scrolling: touch; /* 提升 iOS 滚动流畅度 */
}

/* 顶部导航 */
.header {
    background: linear-gradient(135deg, #FF6A00, #FF8C00);
    color: white;
    padding: 36rpx 40rpx; /* 转换为 rpx */
    position: sticky; /* 吸顶效果 */
    top: 0;
    z-index: 100;
    box-shadow: 0 6rpx 24rpx rgba(255, 106, 0, 0.3); /* 转换为 rpx */
    display: flex;
    align-items: center;
    border-bottom-left-radius: 30rpx; /* 转换为 rpx */
    border-bottom-right-radius: 30rpx; /* 转换为 rpx */
}

.header .back-btn {
    font-size: 44rpx; /* 转换为 rpx */
    margin-right: 30rpx; /* 转换为 rpx */
    /* cursor: pointer; 在小程序中不适用 */
    width: 72rpx; /* 转换为 rpx */
    height: 72rpx; /* 转换为 rpx */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.header .back-btn:active { /* 在小程序中使用 :active 模拟 :hover */
    background: rgba(255, 255, 255, 0.2);
}

.header h1 {
    font-size: 40rpx; /* 转换为 rpx */
    font-weight: 600;
    flex-grow: 1;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2); /* 转换为 rpx */
}

/* 申请卡片 */
.application-card {
    background: white;
    border-radius: 40rpx; /* 转换为 rpx */
    margin: 50rpx 0; /* 转换为 rpx */
    padding: 60rpx; /* 转换为 rpx */
    box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.1); /* 转换为 rpx */
    border: 2rpx solid #eee; /* 转换为 rpx */
    position: relative;
    overflow: hidden;
    text-align: center;
}

.application-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10rpx; /* 转换为 rpx */
    background: linear-gradient(to right, #FF6A00, #FF8C00);
}

.target-user {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx; /* 转换为 rpx */
}

.target-avatar {
    width: 180rpx; /* 转换为 rpx */
    height: 180rpx; /* 转换为 rpx */
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6A00, #FF8C00);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 72rpx; /* 转换为 rpx */
    margin-bottom: 30rpx; /* 转换为 rpx */
    border: 6rpx solid white; /* 转换为 rpx */
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2); /* 转换为 rpx */
}

.target-name {
    font-size: 48rpx; /* 转换为 rpx */
    font-weight: 700;
    color: #333;
}

.target-title {
    font-size: 32rpx; /* 转换为 rpx */
    color: #666;
    margin-top: 10rpx; /* 转换为 rpx */
}

.description {
    font-size: 32rpx; /* 转换为 rpx */
    color: #555;
    margin: 40rpx 0; /* 转换为 rpx */
    line-height: 1.7;
    padding: 0 20rpx; /* 转换为 rpx */
}

.highlight {
    color: #FF6A00;
    font-weight: bold;
}

.cost-section {
    background: #fff8f3;
    border-radius: 30rpx; /* 转换为 rpx */
    padding: 40rpx; /* 转换为 rpx */
    margin: 50rpx 0; /* 转换为 rpx */
    border: 2rpx solid #ffe8d9; /* 转换为 rpx */
}

.cost-title {
    font-size: 36rpx; /* 转换为 rpx */
    font-weight: 600;
    color: #FF6A00;
    margin-bottom: 40rpx; /* 转换为 rpx */
    text-align: center;
}

.cost-options {
    display: flex;
    justify-content: center;
    gap: 40rpx; /* 转换为 rpx */
    margin-bottom: 20rpx; /* 转换为 rpx */
}

.cost-option {
    flex: 1;
    max-width: 300rpx; /* 转换为 rpx */
    border: 4rpx solid #e0e0e0; /* 转换为 rpx */
    border-radius: 30rpx; /* 转换为 rpx */
    padding: 30rpx; /* 转换为 rpx */
    text-align: center;
    /* cursor: pointer; */
    transition: all 0.3s;
    position: relative;
    background: white;
}

.cost-option.selected {
    border-color: #FF6A00;
    background: #fff8f3;
    box-shadow: 0 10rpx 30rpx rgba(255, 106, 0, 0.15); /* 转换为 rpx */
}

.cost-option.selected::after {
    content: '✓';
    position: absolute;
    top: -20rpx; /* 转换为 rpx */
    right: -20rpx; /* 转换为 rpx */
    width: 50rpx; /* 转换为 rpx */
    height: 50rpx; /* 转换为 rpx */
    background: #FF6A00;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 32rpx; /* 转换为 rpx */
}

.currency-icon {
    font-size: 56rpx; /* 转换为 rpx */
    color: #FF8C00;
    margin-bottom: 20rpx; /* 转换为 rpx */
}

.cost-amount {
    font-size: 40rpx; /* 转换为 rpx */
    font-weight: 700;
    color: #333;
    margin-bottom: 10rpx; /* 转换为 rpx */
}

.cost-label {
    font-size: 28rpx; /* 转换为 rpx */
    color: #777;
}

.user-balance {
    display: flex;
    justify-content: center;
    gap: 60rpx; /* 转换为 rpx */
    margin: 40rpx 0; /* 转换为 rpx */
    padding: 30rpx; /* 转换为 rpx */
    background: #f8f9fa;
    border-radius: 24rpx; /* 转换为 rpx */
    font-size: 30rpx; /* 转换为 rpx */
}

.balance-item {
    text-align: center;
}

.balance-value {
    font-weight: 700;
    font-size: 36rpx; /* 转换为 rpx */
    color: #FF6A00;
    margin-top: 10rpx; /* 转换为 rpx */
}

.insufficient-value {
    color: #e53935;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 30rpx; /* 转换为 rpx */
    margin-top: 40rpx; /* 转换为 rpx */
}

.btn {
    padding: 32rpx; /* 转换为 rpx */
    border-radius: 24rpx; /* 转换为 rpx */
    font-size: 34rpx; /* 转换为 rpx */
    font-weight: 600;
    /* cursor: pointer; */
    transition: all 0.3s;
    text-align: center;
    border: none;
    /* 针对 uni-app 按钮默认样式进行重置 */
    -webkit-appearance: none;
    background-color: transparent;
    line-height: 1; /* 消除默认 button 的行高影响 */
}
/* 移除小程序按钮的默认边框 */
.btn::after {
    border: none;
}

.btn-primary {
    background: linear-gradient(135deg, #FF6A00, #FF8C00);
    color: white;
    box-shadow: 0 10rpx 30rpx rgba(255, 106, 0, 0.3); /* 转换为 rpx */
}

.btn-primary:active { /* 在小程序中使用 :active 模拟 :hover */
    background: linear-gradient(135deg, #e05a00, #e07a00);
    transform: translateY(-4rpx); /* 转换为 rpx */
    box-shadow: 0 14rpx 36rpx rgba(255, 106, 0, 0.4); /* 转换为 rpx */
}

.btn-secondary {
    background: #f0f0f0;
    color: #666;
}

.btn-secondary:active { /* 在小程序中使用 :active 模拟 :hover */
    background: #e0e0e0;
}

.insufficient {
    color: #e53935;
    font-size: 28rpx; /* 转换为 rpx */
    margin-top: 20rpx; /* 转换为 rpx */
    text-align: center;
    display: flex; /* 使用 flex 布局图标和文字 */
    align-items: center;
    justify-content: center;
    gap: 10rpx; /* 转换为 rpx */
}

.success-message {
    background: #4caf50;
    color: white;
    padding: 30rpx; /* 转换为 rpx */
    border-radius: 24rpx; /* 转换为 rpx */
    margin-top: 40rpx; /* 转换为 rpx */
    text-align: center;
    animation: fadeIn 0.5s;
    display: flex; /* 使用 flex 布局图标和文字 */
    align-items: center;
    justify-content: center;
    gap: 10rpx; /* 转换为 rpx */
    font-size: 32rpx; /* 转换为 rpx */
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20rpx); } /* 转换为 rpx */
    to { opacity: 1; transform: translateY(0); }
}

/* 联系方式弹窗 */
.contact-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none; /* 默认不响应事件 */
    transition: opacity 0.3s;
}

.contact-modal.active {
    opacity: 1;
    pointer-events: all; /* 激活时响应事件 */
}

.contact-card {
    background: white;
    border-radius: 40rpx; /* 转换为 rpx */
    width: 85%;
    max-width: 640rpx; /* 转换为 rpx */
    padding: 60rpx; /* 转换为 rpx */
    text-align: center;
    transform: translateY(60rpx); /* 转换为 rpx */
    transition: transform 0.4s;
    box-shadow: 0 30rpx 80rpx rgba(0,0,0,0.3); /* 转换为 rpx */
    position: relative;
    overflow: hidden;
}

.contact-modal.active .contact-card {
    transform: translateY(0);
}

.contact-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10rpx; /* 转换为 rpx */
    background: linear-gradient(to right, #4CAF50, #2E7D32);
}

.contact-avatar {
    width: 180rpx; /* 转换为 rpx */
    height: 180rpx; /* 转换为 rpx */
    border-radius: 50%;
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 72rpx; /* 转换为 rpx */
    margin: 0 auto 40rpx; /* 转换为 rpx */
    border: 6rpx solid white; /* 转换为 rpx */
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2); /* 转换为 rpx */
}

.contact-name {
    font-size: 44rpx; /* 转换为 rpx */
    font-weight: 700;
    margin-bottom: 50rpx; /* 转换为 rpx */
    color: #333;
}

.contact-info {
    background: #f1f8e9;
    border-radius: 30rpx; /* 转换为 rpx */
    padding: 40rpx; /* 转换为 rpx */
    margin: 40rpx 0; /* 转换为 rpx */
    text-align: left;
    border: 2rpx solid #dcedc8; /* 转换为 rpx */
}

.contact-info p {
    margin: 28rpx 0; /* 转换为 rpx */
    display: flex;
    align-items: center;
    font-size: 30rpx; /* 转换为 rpx */
}

.contact-info i {
    margin-right: 24rpx; /* 转换为 rpx */
    color: #4CAF50;
    width: 48rpx; /* 转换为 rpx */
    font-size: 36rpx; /* 转换为 rpx */
    text-align: center;
}

.close-btn {
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 50rpx; /* 转换为 rpx */
    padding: 28rpx 50rpx; /* 转换为 rpx */
    width: 100%;
    font-weight: 600;
    /* cursor: pointer; */
    margin-top: 20rpx; /* 转换为 rpx */
    font-size: 32rpx; /* 转换为 rpx */
    box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.4); /* 转换为 rpx */
    transition: background 0.3s;

    /* 针对 uni-app 按钮默认样式进行重置 */
    -webkit-appearance: none;
    background-color: transparent;
    line-height: 1; /* 消除默认 button 的行高影响 */
}
/* 移除小程序按钮的默认边框 */
.close-btn::after {
    border: none;
}

.close-btn:active { /* 在小程序中使用 :active 模拟 :hover */
    background: #388E3C;
}

/* 底部导航 */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%; /* 居中显示 */
    transform: translateX(-50%); /* 居中显示 */
    width: 100%; /* 确保占据100%宽度，以便 max-width 生效 */
    background: white;
    display: flex;
    justify-content: space-around;
    padding: 24rpx 0; /* 转换为 rpx */
    /* 适配底部安全区域 (例如 iPhone 刘海屏) */
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
    border-top: 2rpx solid #e0e0e0; /* 转换为 rpx */
    box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.05); /* 转换为 rpx */
    max-width: 750rpx; /* 与页面内容最大宽度保持一致 */
    z-index: 100;
    border-top-left-radius: 40rpx; /* 转换为 rpx */
    border-top-right-radius: 40rpx; /* 转换为 rpx */
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 24rpx; /* 转换为 rpx */
    color: #888;
    /* cursor: pointer; */
    padding: 10rpx 30rpx; /* 转换为 rpx */
    border-radius: 30rpx; /* 转换为 rpx */
    transition: all 0.3s;
}

.nav-item.active {
    color: #FF6A00;
    background: rgba(255, 106, 0, 0.08);
}

.nav-item i {
    font-size: 44rpx; /* 转换为 rpx */
    margin-bottom: 10rpx; /* 转换为 rpx */
}

.nav-item span {
    font-weight: 500;
}

/* 提示卡片 */
/* 提示卡片 */
.info-card {
    background: white;
    border-radius: 40rpx; /* 统一为 40rpx，与申请卡片保持一致 */
    padding: 50rpx; /* 增加内边距，提供更多呼吸空间 */
    margin-top: 50rpx; /* 调整顶部外边距，与申请卡片保持一致 */
    box-shadow: 0 15rpx 50rpx rgba(0,0,0,0.08); /* 略微增强阴影，增加层次感 */
    border: 2rpx solid #f0f0f0; /* 更柔和的边框颜色 */
    position: relative; /* 为伪元素（如顶部线条）定位做准备 */
    overflow: hidden; /* 确保内容在圆角内 */
}

/* 可以在顶部添加一条装饰线，与申请卡片形成视觉呼应 */
.info-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8rpx; /* 装饰线的高度 */
    background: linear-gradient(to right, #4CAF50, #8BC34A); /* 使用绿色渐变，代表信息、成功 */
    border-top-left-radius: 40rpx; /* 匹配父元素的圆角 */
    border-top-right-radius: 40rpx; /* 匹配父元素的圆角 */
}

.info-card-title { /* 使用新的类名来控制标题样式 */
    font-size: 42rpx; /* 标题字号略微加大，更醒目 */
    font-weight: 700;
    color: #333; /* 标题颜色改为深色，增加对比度 */
    margin-bottom: 40rpx; /* 增加标题下方间距 */
    display: flex;
    align-items: center;
    justify-content: center; /* 标题内容居中显示 */
    text-align: center; /* 确保文本本身也居中 */
}

.info-card-title i { /* 图标样式 */
    margin-right: 20rpx;
    font-size: 48rpx; /* 图标字号加大 */
    color: #4CAF50; /* 图标颜色使用绿色，代表信息、提示 */
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1); /* 给图标添加细微阴影 */
}

.info-card p {
    font-size: 30rpx; /* 正文字号略微加大，提高可读性 */
    color: #666; /* 颜色略微变浅，更柔和 */
    margin-bottom: 25rpx; /* 调整段落下方间距 */
    line-height: 1.7; /* 增加行高，提升阅读舒适度 */
    text-align: justify; /* 文本两端对齐，使段落更规整 */
}

.info-card ul {
    padding-left: 60rpx; /* 增加列表左侧内边距，提供更多缩进 */
    margin-top: 30rpx; /* 增加列表上方间距 */
    list-style: none; /* 移除默认的列表圆点 */
}

.info-card li {
    position: relative; /* 为自定义列表圆点定位做准备 */
    font-size: 30rpx; /* 列表项字号与正文一致 */
    color: #666; /* 列表项颜色与正文一致 */
    margin-bottom: 20rpx; /* 增加列表项之间间距 */
    line-height: 1.6;
    padding-left: 40rpx; /* 为自定义圆点留出空间 */
}

.info-card li::before {
    content: '\2022'; /* 使用 Unicode 圆点作为自定义圆点 */
    font-size: 36rpx; /* 圆点字号 */
    color: #4CAF50; /* 圆点颜色使用绿色 */
    position: absolute;
    left: 0;
    top: 0rpx; /* 调整圆点垂直对齐 */
    line-height: 1.6; /* 继承行高，使圆点与文本基线对齐 */
    font-weight: bold;
}
</style>