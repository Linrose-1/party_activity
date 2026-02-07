<template>
	<view class="business-card-container">
		<!-- 名片正面 - 全新模块化布局 -->
		<view class="card-front">
			<!-- 1. 顶部：身份核心区 -->
			<view class="header-section">
				<view class="avatar" @click="previewImage(avatar)">
					<image :src="avatar" mode="aspectFill" show-menu-by-longpress />
				</view>
				<view class="identity">
					<view class="name-line">
						<text class="name" selectable>{{ name }}</text>
						<!-- <text class="pinyin">{{ pinyinName }}</text> -->
					</view>
					<view class="tags-line">
						<text class="tag-style pinyin-tag" v-if="pinyinName">{{ pinyinName }}</text>
						<text class="tag-style title-tag" v-if="title">{{ title }}</text>
					</view>
				</view>
			</view>

			<!-- 2. 基础资料区-->
			<view class="section-block basic-info-section">
				<!-- ==================== 备注名模块 ==================== -->
				<!-- 只在查看他人名片时显示 -->
				<view v-if="!isViewingOwnCard" class="info-item remark-item" @click="$emit('editRemark')">
					<uni-icons type="compose" size="18" color="#888" />
					<text class="info-label">备注名：</text>

					<!-- 如果有备注名，则显示备注名 -->
					<text v-if="remarkName" class="info-value remark-value">{{ remarkName }}</text>

					<!-- 如果没有备注名，则显示占位提示 -->
					<text v-else class="info-value placeholder-value">请输入商友的备忘名称或备注</text>

					<!-- 添加一个向右的箭头，暗示可点击 -->
					<uni-icons type="right" size="16" color="#bbb" class="remark-arrow"></uni-icons>
				</view>
				<!-- ========================================================== -->
				<view class="info-item">
					<uni-icons type="calendar-filled" size="18" color="#888" />
					<text class="info-label">年代：</text>
					<text class="info-value era-value">{{ era || '未设置' }}</text>
				</view>
				<view class="info-item" v-for="(item, index) in contactInfo" :key="index">
					<uni-icons :type="item.icon" size="18" color="#888" />
					<text class="info-label">{{ item.label }}：</text>
					<text class="info-value" selectable>{{ item.value }}</text>
				</view>
			</view>

			<!-- 3. 社会职务区 -->
			<view class="section-block professional-section" v-if="socialGroups.length > 0">
				<view class="section-title">
					<uni-icons type="staff-filled" size="18" color="#C9A063"></uni-icons>
					<text>组织/机构/职务</text>
				</view>

				<view class="social-group" v-for="(group, index) in socialGroups" :key="index">
					<view class="social-row">
						<text class="social-label">组织：</text>
						<text class="social-value" selectable>{{ group.association }}</text>
					</view>
					<view class="social-row">
						<text class="social-label">职务：</text>
						<text class="social-value" selectable>{{ group.title }}</text>
					</view>
					<!-- 分割线：如果是多组，在组之间加个微弱的分割 -->
					<view v-if="index < socialGroups.length - 1" class="group-divider"></view>
				</view>
			</view>

			<!-- 4. 职业信息区  -->
			<view class="section-block career-section" v-if="careerGroups.length > 0">
				<view class="section-title">
					<uni-icons type="flag-filled" size="18" color="#F78C2F"></uni-icons>
					<text>职业信息</text>
				</view>
				<view class="career-group" v-for="(group, index) in careerGroups" :key="index">
					<view class="career-item">
						<text class="career-label">公司：</text>
						<text class="career-value" selectable>{{ group.company }}</text>
					</view>
					<view class="career-item">
						<text class="career-label">职务：</text>
						<text class="career-value" selectable>{{ group.position }}</text>
					</view>
					<view class="career-item">
						<text class="career-label">行业：</text>
						<text class="career-value" selectable>{{ group.industry }}</text>
					</view>
				</view>
			</view>

			<!-- 5. 资源对接区 -->
			<view class="section-block resource-section" v-if="haveResources || needResources">
				<view v-if="haveResources" class="resource-item">
					<view class="resource-title have-title">
						<uni-icons type="hand-up-filled" size="18" color="#28a745"></uni-icons>
						<text>我有资源</text>
					</view>
					<view class="resource-content select-text">{{ haveResources }}</view>
				</view>
				<view v-if="needResources" class="resource-item">
					<view class="resource-title need-title">
						<uni-icons type="paperplane-filled" size="18" color="#007bff"></uni-icons>
						<text>我需资源</text>
					</view>
					<view class="resource-content select-text">{{ needResources }}</view>
				</view>
			</view>

			<!-- 6. 个人展示区 -->
			<view class="section-block personal-bio-section" v-if="signature || personalBio">
				<view v-if="signature" class="signature-item">
					<text class="quote-start">“</text>
					<text class="signature-text" selectable>{{ signature }}</text>
					<text class="quote-end">”</text>
				</view>
				<view v-if="personalBio" class="bio-item">
					<view class="bio-title">个人简介</view>
					<view class="bio-content select-text">{{ personalBio }}</view>
				</view>
			</view>

			<!-- ==================== 商友圈模块 ==================== -->
			<view class="section-block user-opportunities-section" @click="$emit('goToOpportunities')">
				<view class="section-title">
					<uni-icons type="pyq" size="18" color="#FF6A00"></uni-icons>
					<text>TA的商友圈</text>
				</view>
				<view class="section-content">
					<text class="content-text">查看TA发布的所有商机</text>
					<uni-icons type="right" size="16" color="#bbb"></uni-icons>
				</view>
			</view>

			<!-- ==================== 猩友评价模块 ==================== -->
			<view class="section-block score-statistics-section" v-if="radarDatasets && radarDatasets.length > 0">
				<view class="section-title">
					<uni-icons type="star-filled" size="18" color="#FF8500"></uni-icons>
					<text>{{ isViewingOwnCard ? '我的猩友评价' : 'TA的猩友评价' }}</text>
				</view>

				<UserScoreBoard :datasets="radarDatasets" :showCard="false" :showTitle="false" />

				<!-- 雷达图容器 -->
				<!-- <view class="chart-wrapper">
					<MyRadarChart :categories="['基础信用', '协作态度', '专业能力', '精神格局']" :datasets="radarDatasets" />
				</view> -->

				<!-- 维度得分对比表 -->
				<!-- <view class="score-compare-table">
					<view class="table-row header-row">
						<view class="col dim">维度</view>
						<view class="col val self">自我</view>
						<view class="col val total">综合</view>
					</view>
					<view class="table-row" v-for="(dim, index) in ['基础信用', '协作态度', '专业能力', '精神格局']" :key="index">
						<view class="col dim">{{ dim }}</view>
						<view class="col val self">{{ getScoreValue(0, index) }}</view>
						<view class="col val total">{{ getScoreValue(1, index) }}</view>
					</view>
				</view> -->
			</view>

			<!-- 7. 用户个人微信二维码 -->
			<view class="user-qr-section" v-if="showUserQrCode">
				<view class="qr-title">我的微信二维码</view>
				<view class="qr-code-box" @click="previewImage(userWeChatQrCodeUrl)">
					<image :src="userWeChatQrCodeUrl" mode="aspectFit" show-menu-by-longpress />
				</view>
				<view class="qr-hint">扫码或长按识别添加微信</view>
			</view>

			<!-- 8. 邀请码  -->
			<view v-if="shardCode" class="shard-code-section" @click="copyShardCode">
				<view class="shard-code-value">
					<text>邀请码：</text>
					<text class="code">{{ shardCode }}</text>
				</view>
				<view class="copy-action">
					<uni-icons type="paperclip" size="16" color="#F78C2F"></uni-icons>
					<text>点击复制</text>
				</view>
			</view>

			<!-- 9. 底部 Slogan  -->
			<view class="value-slogan">
				<view class="line"></view>
				<text>价值连接·生态共创</text>
				<view class="line"></view>
			</view>
		</view>

		<!-- 名片背面 - 品牌/平台信息  -->
		<view class="card-back">
			<view class="slogan-primary">连接全球精英商友</view>
			<view class="slogan-secondary">GO FOR PARTNERS • GO FOR FUTURE</view>
			<view class="platform-qr-code" @click="previewImage(dynamicQrCodeUrl || platformQrCodeUrl)">
				<!-- <image :src="platformQrCodeUrl" mode="aspectFit" show-menu-by-longpress /> -->
				<image :src="dynamicQrCodeUrl || platformQrCodeUrl" mode="aspectFit" show-menu-by-longpress />
			</view>
			<!-- 平台二维码下方的提示文字 -->
			<view class="qr-hint-back">扫码或长按识别加入平台</view>
			<!-- <view class="logo">
				<image :src="logoUrl" mode="aspectFit" />
				<image :src="platformQrCodeUrl" mode="aspectFit" />
			</view> -->
		</view>
	</view>
</template>

<script setup>
	import {
		computed
	} from 'vue';
	// import MyRadarChart from '@/components/MyRadarChart.vue';
	import UserScoreBoard from '@/components/UserScoreBoard.vue';

	const emit = defineEmits(['goToOpportunities']);
	const props = defineProps({
		// --- 身份核心信息 ---
		avatar: {
			type: String,
			default: 'https://randomuser.me/api/portraits/men/41.jpg'
		},
		name: {
			type: String,
			default: '张三'
		},
		remarkName: {
			type: String,
			default: ''
		}, // 备注名
		isViewingOwnCard: {
			type: Boolean,
			default: false
		}, // 是否在看自己的名片
		pinyinName: {
			type: String,
			default: 'ZHANG SAN'
		},
		title: {
			type: String,
			default: '首席运营官'
		},
		era: {
			type: String,
			default: ''
		}, // 年代

		// --- 职业与社会信息 ---
		companyName: {
			type: String,
			default: '高伙猩球'
		},
		positionTitle: {
			type: String,
			default: '总裁'
		}, // 职务
		industry: {
			type: String,
			default: '未填写'
		}, // 行业
		professionalTitle: {
			type: String,
			default: ''
		}, // 社会职务
		associationName: {
			type: String,
			default: ''
		},

		// --- 资源信息 ---
		haveResources: {
			type: String,
			default: ''
		}, // 我有资源
		needResources: {
			type: String,
			default: ''
		}, // 我需资源

		// --- 个人展示信息 ---
		signature: {
			type: String,
			default: ''
		}, // 个性签名
		personalBio: {
			type: String,
			default: ''
		}, // 个人简介

		// --- 联系方式 ---
		contactInfo: {
			type: Array,
			default: () => [{
					icon: 'phone-filled',
					label: '手机',
					value: '18888888888'
				},
				{
					icon: 'email-filled',
					label: '邮箱',
					value: 'ZHANGSAN@foxmail.com'
				},
				{
					icon: 'location-filled',
					label: '地址',
					value: '广东省广州市天河区珠江新城'
				}
			]
		},

		// --- 二维码与邀请码 ---
		shardCode: {
			type: String,
			default: ''
		},
		showUserQrCode: {
			type: Boolean,
			default: true
		},
		userWeChatQrCodeUrl: {
			type: String,
			default: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=user-wechat'
		},

		// --- 平台信息 ---
		platformQrCodeUrl: {
			type: String,
			default: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info'
		},
		logoUrl: {
			type: String,
			default: 'https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png'
		},

		dynamicQrCodeUrl: {
			type: String,
			default: '' // 默认是空字符串
		},

		// --- 以下为旧版兼容，新版已不再直接使用 ---
		department: {
			type: String,
			default: ''
		},
		fullCompanyName: {
			type: String,
			default: ''
		},
		radarDatasets: {
			type: Array,
			default: () => []
		}
	});

	// 计算属性，处理多项社会职务
	const professionalTitles = computed(() => {
		return props.professionalTitle ? props.professionalTitle.split(',').filter(item => item.trim()) : [];
	});

	// 辅助函数：从 datasets 中提取分值
	const getScoreValue = (datasetIndex, dimIndex) => {
		const ds = props.radarDatasets[datasetIndex];
		if (ds && ds.data) {
			const val = ds.data[dimIndex];
			return val !== undefined ? val : '-';
		}
		return '-';
	};

	// 计算属性，处理职业信息分组
	const careerGroups = computed(() => {
		const companies = props.companyName ? props.companyName.split(',') : [];
		const positions = props.positionTitle ? props.positionTitle.split(',') : [];
		const industries = props.industry ? props.industry.split(',') : [];

		const maxLength = Math.max(companies.length, positions.length, industries.length);
		const groups = [];

		for (let i = 0; i < maxLength; i++) {
			groups.push({
				company: (companies[i] || '未填写').trim(),
				position: (positions[i] || '未填写').trim(),
				industry: (industries[i] || '未填写').trim(),
			});
		}

		return groups;
	});

	const socialGroups = computed(() => {
		// 将“组织机构”和“社会职务”按逗号拆分
		const associations = props.associationName ? props.associationName.split(',') : [];
		const titles = props.professionalTitle ? props.professionalTitle.split(',') : [];

		const maxLength = Math.max(associations.length, titles.length);
		const groups = [];

		for (let i = 0; i < maxLength; i++) {
			const assoc = (associations[i] || '').trim();
			const title = (titles[i] || '').trim();

			// 只有当组织或职务至少有一个不为空时才添加
			if (assoc || title) {
				groups.push({
					association: assoc || '未填写组织',
					title: title || '未填写职务'
				});
			}
		}
		return groups;
	});


	const copyShardCode = () => {
		if (!props.shardCode) return;
		uni.setClipboardData({
			data: props.shardCode,
			success: () => uni.showToast({
				title: '邀请码已复制',
				icon: 'success'
			}),
			fail: () => uni.showToast({
				title: '复制失败',
				icon: 'none'
			})
		});
	};

	// 预览图片方法
	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url],
			current: url
		});
	};
</script>

<style lang="scss" scoped>
	.business-card-container {
		width: 100%;
		min-width: 80vw;
		margin: 30rpx auto;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
		border-radius: 20rpx;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background-color: #f9f9f9;
	}

	.select-text {
		user-select: text;
		-webkit-user-select: text;
		/* Safari/Chrome */
		cursor: text;
	}

	// ===================================
	// 名片正面样式 (全新布局)
	// ===================================
	.card-front {
		background: linear-gradient(to bottom, #ffffff, #fdfdfd);
		padding: 40rpx;
	}

	// 1. 顶部身份核心区
	.header-section {
		display: flex;
		align-items: center;
		margin-bottom: 50rpx;

		.avatar {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-right: 30rpx;
			flex-shrink: 0;
			border: 6rpx solid #fff;
			box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);

			image {
				width: 100%;
				height: 100%;
			}
		}

		.identity {
			display: flex;
			flex-direction: column;
			justify-content: center;
			/* 垂直居中 */

			.name-line {
				margin-bottom: 16rpx;
				/* 增加一点与下方标签的距离 */
			}

			.name {
				font-size: 48rpx;
				font-weight: bold;
				color: #2c3e50;
				line-height: 1.2;
			}

			/* 标签行容器 */
			.tags-line {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				/* 防止内容过长溢出 */
				gap: 16rpx;
				/* 标签之间的间距 */
			}

			/* 通用标签样式 */
			.tag-style {
				font-size: 24rpx;
				padding: 6rpx 16rpx;
				border-radius: 8rpx;
				line-height: 1;
				display: inline-block;
			}

			/* 拼音标签样式 */
			.pinyin-tag {
				background-color: #f0f2f5;
				/* 浅灰色背景 */
				color: #909399;
				/* 深灰色文字 */
				text-transform: uppercase;
				/* 自动转大写 */
				font-weight: 500;
			}

			/* 头衔标签样式 */
			.title-tag {
				background-color: #fff7e6;
				/* 浅橙色背景，呼应主色调 */
				color: #fa8c16;
				/* 橙色文字 */
				border: 1rpx solid #ffd591;
				/* 可选：加个细边框增加精致感 */
				font-weight: 500;
			}
		}
	}

	// 通用模块样式
	.section-block {
		background-color: #ffffff;
		border: 1rpx solid #f0f0f0;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	// 2. 基础资料区
	.basic-info-section {
		display: flex;
		flex-direction: column;
		gap: 25rpx;

		.info-item {
			display: flex;
			align-items: center;
			font-size: 28rpx;
		}

		.info-label {
			color: #888;
			margin-left: 20rpx;
			flex-shrink: 0;
		}

		.info-value {
			color: #333;
			word-break: break-all;
		}

		.era-value {
			background-color: #ecf0f1;
			color: #7f8c8d;
			font-size: 26rpx;
			padding: 4rpx 16rpx;
			border-radius: 8rpx;
		}

		.remark-item {
			cursor: pointer;
			transition: background-color 0.2s;
			padding: 15rpx 10rpx;
			/* 增加内边距，扩大点击区域 */
			margin: -15rpx -10rpx;
			/* 负 margin 平衡内边距，保持布局 */
			border-radius: 8rpx;
			position: relative;
			/* 为箭头定位 */
		}

		.remark-item:active {
			background-color: #f9f9f9;
		}

		.remark-value {
			font-weight: 500;
		}

		.placeholder-value {
			color: #999;
			font-style: italic;
			flex: 1;
			/* 让占位符撑满，将箭头推到最右边 */
		}

		.remark-arrow {
			margin-left: auto;
			/* 自动推到最右边 */
		}
	}


	// 3. 社会职务区 (突出)
	.professional-section {
		background: linear-gradient(135deg, #FFFBF5, #FFF3E6);
		border: 1px solid #FDE4C9;

		.section-title {
			display: flex;
			align-items: center;
			font-size: 30rpx;
			font-weight: 600;
			color: #A37E4A;
			margin-bottom: 25rpx;

			text {
				margin-left: 15rpx;
			}
		}

		.tag-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
		}

		.tag {
			background-color: #fff;
			border: 1rpx solid #FADDC2;
			color: #BF915B;
			font-size: 26rpx;
			padding: 8rpx 20rpx;
			border-radius: 30rpx;
		}

		.social-group {
			padding: 10rpx 0;

			.social-row {
				display: flex;
				font-size: 28rpx;
				margin-bottom: 8rpx;
				line-height: 1.4;
			}

			.social-label {
				color: #A37E4A; // 使用更深一点的金色
				width: 100rpx;
				flex-shrink: 0;
				font-size: 26rpx;
			}

			.social-value {
				color: #333;
				font-weight: 500;
				word-break: break-all;
			}

			.group-divider {
				height: 1rpx;
				background-color: rgba(201, 160, 99, 0.1);
				margin: 15rpx 0;
			}
		}
	}

	// 4. 职业信息区 (分组)
	.career-section {
		.section-title {
			display: flex;
			align-items: center;
			font-size: 30rpx;
			font-weight: 600;
			color: #F78C2F;
			margin-bottom: 25rpx;

			text {
				margin-left: 15rpx;
			}
		}

		.career-group {
			padding: 25rpx;
			border: 1rpx solid #f5f5f5;
			border-radius: 12rpx;
			background-color: #fafafa;

			&:not(:last-child) {
				margin-bottom: 25rpx;
			}
		}

		.career-item {
			display: flex;
			font-size: 28rpx;

			&:not(:last-child) {
				margin-bottom: 15rpx;
			}
		}

		.career-label {
			color: #888;
			width: 120rpx; // 固定标签宽度，使其对齐
			flex-shrink: 0;
		}

		.career-value {
			color: #333;
			font-weight: 500;
			word-break: break-all;
		}
	}


	// --- 其他模块样式保持不变，但为了完整性，在此全部提供 ---

	// 5. 资源对接区
	.resource-section {
		.resource-item:not(:last-child) {
			margin-bottom: 30rpx;
			padding-bottom: 30rpx;
			border-bottom: 1rpx dashed #eee;
		}

		.resource-title {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			font-weight: 600;
			margin-bottom: 15rpx;

			text {
				margin-left: 15rpx;
			}

			&.have-title {
				color: #28a745;
			}

			&.need-title {
				color: #007bff;
			}
		}

		.resource-content {
			font-size: 28rpx;
			color: #555;
			line-height: 1.6;
			white-space: pre-wrap; // 支持换行
		}
	}

	// 6. 个人展示区
	.personal-bio-section {
		.signature-item {
			font-style: italic;
			color: #777;
			margin-bottom: 30rpx;
			padding-bottom: 30rpx;
			border-bottom: 1rpx dashed #eee;
			position: relative;
			padding: 0 20rpx;

			.signature-text {
				font-size: 28rpx;
			}

			.quote-start,
			.quote-end {
				font-size: 40rpx;
				color: #F78C2F;
				position: absolute;
			}

			.quote-start {
				top: -10rpx;
				left: -10rpx;
			}

			.quote-end {
				bottom: -10rpx;
				right: -10rpx;
			}
		}

		.bio-item {
			.bio-title {
				font-size: 28rpx;
				font-weight: 600;
				color: #555;
				margin-bottom: 15rpx;
			}

			.bio-content {
				font-size: 28rpx;
				color: #555;
				line-height: 1.6;
			}
		}
	}

	/* 商友圈模块样式 */
	.user-opportunities-section {
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.user-opportunities-section:active {
		background-color: #f9f9f9;
	}

	.user-opportunities-section .section-title {
		display: flex;
		align-items: center;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		/* 主色调 */
	}

	.user-opportunities-section .section-title text {
		margin-left: 15rpx;
	}

	.user-opportunities-section .section-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20rpx;
	}

	.user-opportunities-section .content-text {
		font-size: 28rpx;
		color: #666;
	}


	// 7. 用户二维码
	.user-qr-section {
		text-align: center;
		padding: 40rpx 0;

		.qr-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #444;
			margin-bottom: 30rpx;
		}

		.qr-code-box {
			width: 280rpx;
			height: 280rpx;
			margin: 0 auto;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.qr-hint {
			font-size: 26rpx;
			color: #777;
			margin-top: 30rpx;
		}
	}

	.shard-code-section,
	.value-slogan {
		// ... (这些样式保持不变)
	}

	.shard-code-section {
		margin-top: 40rpx;
		padding: 20rpx 30rpx;
		background-color: #fff8f2;
		border: 1rpx solid #ffe8d1;
		border-radius: 16rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;

		&:active {
			background-color: #fff0e0;
		}

		.shard-code-value {
			font-size: 30rpx;
			color: #555;

			.code {
				font-size: 32rpx;
				font-weight: bold;
				color: #F78C2F;
				margin-left: 10rpx;
				letter-spacing: 2rpx;
			}
		}

		.copy-action {
			display: flex;
			align-items: center;
			color: #F78C2F;
			font-size: 26rpx;

			.uni-icons {
				margin-right: 8rpx;
			}
		}
	}

	.value-slogan {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 60rpx;
		padding-top: 40rpx;
		border-top: 1rpx solid #f0f0f0;

		.line {
			width: 60rpx;
			height: 4rpx;
			background-color: #F78C2F;
			margin: 0 20rpx;
		}

		text {
			font-size: 30rpx;
			font-weight: 500;
			color: #F78C2F;
		}
	}

	.chart-wrapper {
		width: 100%;
		height: 450rpx; // 稍微调小一点，适合名片布局
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.score-compare-table {
		margin-top: 20rpx;
		border: 1rpx solid #f0f0f0;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.table-row {
		display: flex;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}

		&.header-row {
			background-color: #fafafa;
			font-weight: bold;
		}

		.col {
			flex: 1;
			padding: 12rpx 0;
			text-align: center;
			font-size: 22rpx;
			color: #666;

			&.dim {
				flex: 1.5;
				text-align: left;
				padding-left: 20rpx;
				color: #333;
			}

			&.self {
				color: #FF7D00;
			}

			&.total {
				color: #1890FF;
			}
		}
	}

	// ===================================
	// 名片背面样式 (优化渐变)
	// ===================================
	.card-back {
		background: linear-gradient(135deg, #F9A825, #F78C2F);
		color: white;
		padding: 60rpx 40rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;

		.slogan-primary {
			font-size: 44rpx;
			font-weight: bold;
			letter-spacing: 2rpx;
			margin-bottom: 15rpx;
		}

		.slogan-secondary {
			font-size: 24rpx;
			opacity: 0.9;
			letter-spacing: 1rpx;
			margin-bottom: 40rpx;
		}

		.platform-qr-code {
			width: 280rpx;
			height: 280rpx;
			background-color: white;
			padding: 20rpx;
			border-radius: 20rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		// 新增样式
		.qr-hint-back {
			font-size: 26rpx;
			color: rgba(255, 255, 255, 0.9);
			margin-top: 30rpx;
			margin-bottom: 40rpx;
		}

		.logo {
			width: 250rpx;
			height: 80rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>