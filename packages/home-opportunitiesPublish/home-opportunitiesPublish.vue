<template>
	<view class="page">
		<!-- 内容卡片 -->
		<view class="form-container">
			<view class="form-card">
				<view class="form-group">
					<view class="form-label">标题</view>
					<input v-model="form.title" class="form-input" placeholder="请输入标题（最多100字）" maxlength="100" />
				</view>

				<view class="form-group">
					<view class="form-label">内容</view>
					<!-- placeholder 已绑定到计算属性 -->
					<textarea v-model="form.content" class="form-textarea" :placeholder="contentPlaceholder"
						maxlength="5000" />
				</view>

				<view class="form-card">
					<!-- 1. 发布身份选择：增加 :disabled="isEditMode" -->
					<view class="form-group">
						<view class="form-label">发布身份</view>
						<radio-group @change="handleIdentityChange" class="radio-group-container">
							<label class="radio-item">
								<radio value="0" :checked="form.isEnterprise === 0" :disabled="isEditMode"
									color="#FF6A00" />
								<text :style="{color: isEditMode ? '#999' : '#333'}">个人身份</text>
							</label>
							<label class="radio-item">
								<radio value="1" :checked="form.isEnterprise === 1" :disabled="isEditMode"
									color="#FF6A00" />
								<text :style="{color: isEditMode ? '#999' : '#333'}">企业/品牌身份</text>
							</label>
						</radio-group>
					</view>

					<!-- 2. 企业下拉选择：增加 :disabled="isEditMode" -->
					<view class="form-group" v-if="form.isEnterprise === 1">
						<view class="form-label">选择发布企业</view>
						<view class="enterprise-selector-wrap">
							<uni-data-select v-model="form.userEnterpriseId" :localdata="myEnterprises"
								:disabled="isEditMode" placeholder="请选择名下的企业"></uni-data-select>
						</view>
						<!-- 编辑模式下隐藏"去创建"的提示，防止干扰 -->
						<view class="no-enterprise-tip" v-if="myEnterprises.length === 0 && !isEditMode"
							@click="goToCreateEnterprise">
							<text>检测到您尚未创建已发布的企业，点击去创建 ></text>
						</view>
					</view>
				</view>

				<view class="form-group">
					<view class="form-label">选择分类</view>
					<radio-group @change="topicChange" class="radio-group-container"
						style="flex-direction: column; gap: 20rpx;">
						<view class="radio-two-in-line">
							<label class="radio-item-inline">
								<radio value="商机分享" :checked="form.topic === '商机分享'" :disabled="isEditMode"
									color="#FF6A00" />
								<text :style="{color: isEditMode ? '#999' : '#333'}">商机分享</text>
							</label>
							<label class="radio-item-inline">
								<radio value="创业猎伙" :checked="form.topic === '创业猎伙'" :disabled="isEditMode"
									color="#FF6A00" />
								<text :style="{color: isEditMode ? '#999' : '#333'}">创业猎伙🔥</text>
							</label>
						</view>
						<label class="radio-item">
							<radio value="商机分享+创业猎伙" :checked="form.topic === '商机分享+创业猎伙'" :disabled="isEditMode"
								color="#FF6A00" />
							<text :style="{color: isEditMode ? '#999' : '#333'}">商机分享+创业猎伙🔥</text>
						</label>
					</radio-group>
					<!-- 编辑模式下的温馨提示 -->
					<view v-if="isEditMode" class="hint" style="margin-top: 8rpx; color: #BBB;">
						注：商机发布后不可更改分类
					</view>
				</view>

				<!-- ===== 猎伙专属字段（仅在选择"创业猎伙"或"商机分享+创业猎伙"时显示）===== -->
				<view v-if="form.topic === '创业猎伙' || form.topic === '商机分享+创业猎伙'" class="liehuoFields-card">

					<!-- 猎伙类型（多选） -->
					<view class="form-group">
						<view class="form-label">猎伙类型 <text class="required-star">*</text></view>
						<view class="checkbox-group-container-vertical">
							<label v-for="item in partnerTypeOptions" :key="item.value" class="checkbox-item-new"
								@click="togglePartnerType(item.value)">
								<view class="checkbox-left">
									<view class="custom-checkbox"
										:class="{ 'checked': form.partnerTypes.includes(item.value) }">
										<text v-if="form.partnerTypes.includes(item.value)" class="check-icon">✓</text>
									</view>
								</view>
								<view class="checkbox-right">
									<text class="checkbox-label-main">{{ item.label }}</text>
									<text class="checkbox-label-sub">({{ item.desc }})</text>
								</view>
							</label>
						</view>
						<!-- 选中「其他合作」(value='4') 时显示自定义输入框 -->
						<view v-if="form.partnerTypes.includes('4')" class="other-type-input-wrap animate-fade">
							<input v-model="form.partnerTypeOther" class="other-type-input"
								placeholder="请输入您的精准需求（最多20字）" maxlength="40" />
						</view>
					</view>

					<!-- 紧急程度（单选） -->
					<view class="form-group">
						<view class="form-label">紧急程度 <text class="required-star">*</text></view>
						<view class="urgency-group">
							<view v-for="item in urgentLevelOptions" :key="item.value" class="urgency-tag"
								:class="['urgency-' + item.colorKey, { 'urgency-selected': form.urgentLevel === item.value }]"
								@click="form.urgentLevel = item.value">
								{{ item.label }}
							</view>
						</view>
					</view>

					<!-- 预期投入（选填） -->
					<view class="form-group">
						<view class="form-label">预期投入 <text class="hint-inline">（选填）</text></view>
						<view class="investment-fields">
							<view class="investment-row">
								<text class="investment-key">资金范围</text>
								<input v-model="form.investmentFund" class="investment-input" placeholder="如：10w~50w" />
							</view>
							<view class="investment-row">
								<text class="investment-key">资源类型</text>
								<input v-model="form.investmentResource" class="investment-input"
									placeholder="如：供应链/渠道资源" />
							</view>
							<view class="investment-row">
								<text class="investment-key">股权比例</text>
								<input v-model="form.investmentEquity" class="investment-input"
									placeholder="如：10%~30%" />
							</view>
						</view>
					</view>

					<!-- 是否使用智米发布（仅在非编辑模式下、且通过智米渠道时展示） -->
					<view class="form-group" v-if="!isEditMode && usePointForPublish">
						<view class="point-publish-tip">
							<text class="point-tip-icon">💡</text>
							<text class="point-tip-text">本次将消耗 20 智米发布猎伙</text>
						</view>
					</view>

				</view>
				<!-- ===== 猎伙专属字段 结束 ===== -->

				<view class="form-group">
					<view class="form-label">添加标签</view>
					<!-- v-for 循环 form.tags -->
					<view class="tags-container">
						<view v-for="(tag, index) in form.tags" :key="index" class="tag">
							{{ tag }}
							<text class="tag-remove" @click="removeTag(index)">×</text>
						</view>
					</view>

					<scroll-view class="tag-suggestions-scroll" scroll-x="true" v-if="tagSuggestions.length > 0">
						<view class="suggestion-tag" v-for="(suggestion, index) in tagSuggestions" :key="index"
							@click="selectSuggestion(suggestion)">
							{{ suggestion }}
						</view>
					</scroll-view>

					<!-- v-model 绑定到 form.tagInput -->
					<view class="tag-input-container">
						<input v-model="form.tagInput" class="tag-input" placeholder="输入标签（如,合作/需求/经验/创业灵感...）" />
						<button class="add-tag-btn" @click="handleAddTagManually">添加</button>
					</view>
					<text class="hint">添加精准标签让更多人发现您的商机</text>
				</view>

				<view class="form-group">
					<view class="form-label">上传图片或者视频</view>
					<!-- Case 1: 还未选择任何媒体 -->
					<view class="media-selector" v-if="form.images.length === 0 && !form.postVideo">
						<view class="selector-btn" @click="handleChooseImage">
							<uni-icons type="image-filled" size="30" color="#4CAF50"></uni-icons>
							<text>发布图片</text>
						</view>
						<view class="selector-btn" @click="handleChooseVideo">
							<uni-icons type="videocam-filled" size="30" color="#2196F3"></uni-icons>
							<text>发布视频</text>
						</view>
					</view>

					<!-- Case 2: 图片区域 -->
					<view v-if="form.mediaType === 'image' && form.images.length > 0" class="image-preview-area">
						<DragImageUploader v-model="form.images" :max-count="9" @add-image="handleChooseImage" />
					</view>

					<!-- Case 3: 已经选择了视频 -->
					<view v-if="form.mediaType === 'video' && form.postVideo" class="video-section">
						<!-- 视频预览 -->
						<view class="video-preview-wrapper">
							<video :src="form.postVideo" class="preview-video" controls object-fit="contain"></video>
							<!-- 删除按钮：加 .stop 阻止冒泡 -->
							<cover-view class="delete-video-btn" @click.stop="deleteVideo">×</cover-view>
						</view>

						<!-- 封面上传 -->
						<view class="video-cover-wrapper" @click="handleChooseVideoCover">
							<image v-if="form.businessCoverImageUrl" :src="form.businessCoverImageUrl" mode="aspectFill"
								class="cover-image" />
							<view v-else class="add-cover-placeholder">
								<uni-icons type="image" size="24" color="#999"></uni-icons>
								<text>上传封面</text>
							</view>
							<view class="cover-tag">视频封面</view>
						</view>
					</view>

					<!-- 提示文案 -->
					<text class="hint">{{ form.mediaType === 'image' ? '最多可上传9张图片' : '仅支持上传一个视频' }}</text>
					<view class="hint">为了适应分享封面，首张图片建议使用4:3画幅比例上传，可使用相册自带的画幅剪切工具调整图片尺寸</view>
				</view>
			</view>

			<view class="form-card">
				<text class="section-title">其他设置</text>
				<view class="setting-item">
					<text class="setting-label">允许他人查看我的名片</text>
					<switch :checked="form.showProfile" @change="e => form.showProfile = e.detail.value"
						color="#FF6A00" />
				</view>

				<!-- 阅读留痕设置 -->
				<view class="setting-item">
					<view class="setting-label-group">
						<text class="setting-label">开启阅读留痕</text>
						<text class="setting-desc">其他商友点击详情页阅读之后会留下头像，方便发现与匹配对贴子感兴趣的商友</text>
					</view>
					<switch :checked="form.isReadTrace === 1" @change="e => form.isReadTrace = e.detail.value ? 1 : 0"
						color="#FF6A00" />
				</view>
			</view>

			<button class="submit-btn"
				:class="{ 'disabled-btn': isQuotaLoaded && currentRemainingQuota <= 0 && !isEditMode }"
				@click="handleSubmitClick">
				{{ isEditMode ? '提交修改' : '发布帖子' }}
			</button>
		</view>
	</view>

	<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />
</template>

<script setup>
	import {
		ref,
		reactive,
		watch,
		nextTick,
		onMounted,
		computed
	} from 'vue';
	import {
		onLoad,
		onReady,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';
	import {
		getInviteCode,
		getCachedUserInfo,
		isScenario3User,
		canShowProfileRemind
	} from '../../utils/user.js';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';

	// --- 统一使用 reactive 管理所有表单状态 ---
	const form = reactive({
		id: null,
		title: '',
		content: '',
		topic: '商机分享',
		tags: [],
		tagInput: '',
		mediaType: 'image',
		images: [],
		postVideo: '',
		businessCoverImageUrl: '',
		showProfile: true,
		isReadTrace: 1,
		isEnterprise: 0, // 0-个人, 1-企业
		userEnterpriseId: null, // 企业主键ID
		// ===== 猎伙专属字段 =====
		partnerTypes: [], // 猎伙类型（多选），提交时转为逗号分隔字符串
		partnerTypeOther: '', // 「其他」类型的自定义文本
		urgentLevel: 1, // 紧急程度：1-普通 2-紧急 3-特急
		investmentFund: '', // 预期投入-资金范围
		investmentResource: '', // 预期投入-资源类型
		investmentEquity: '', // 预期投入-股权比例
	});

	const smartGuidePopupRef = ref(null);

	const isEditMode = ref(false); // 标记是否为编辑模式
	let hasCheckedDraft = false; // 草稿检查锁

	const myEnterprises = ref([]); // 存储我的企业列表
	const tagSuggestions = ref([]); // 用于存储从API获取的标签建议
	let tagSearchTimer = null; // 用于输入防抖

	const quotaBusiness = ref(0); // 商机剩余次数
	const quotaPartner = ref(0); // 猎伙剩余次数
	const isQuotaLoaded = ref(false);

	// 是否使用智米发布（由权限弹窗流程设置）
	const usePointForPublish = ref(false);

	// ===== 猎伙类型选项配置 =====
	const partnerTypeOptions = [{
			value: '1',
			label: '求贤若渴',
			desc: '猎头、招聘人才'
		},
		{
			value: '2',
			label: '产品众筹',
			desc: '前沿产品众筹意向'
		},
		{
			value: '3',
			label: '项目合作',
			desc: '启动项目寻找合伙'
		},
		{
			value: '5', // 新增一个值
			label: '寻找资源',
			desc: '寻找项目缺失资源'
		},
		{
			value: '4', // 保持 4 为其他合作
			label: '其他合作',
			desc: '精准自定义合作'
		},
	];

	// ===== 紧急程度选项配置 =====
	const urgentLevelOptions = [{
			value: 1,
			label: '普通',
			colorKey: 'normal'
		},
		{
			value: 2,
			label: '紧急',
			colorKey: 'urgent'
		},
		{
			value: 3,
			label: '特急',
			colorKey: 'super'
		},
	];

	// --- 计算属性 ---

	/** 根据当前分类返回 textarea 的 placeholder */
	const contentPlaceholder = computed(() => {
		if (form.topic === '创业猎伙' || form.topic === '商机分享+创业猎伙') {
			return '发布寻找创业项目合伙人需求或商业机会。';
		}
		return '描述您的项目/商机、需求/经验分享。';
	});

	/** 根据当前选中的 topic 返回对应的剩余发布额度 */
	const currentRemainingQuota = computed(() => {
		if (form.topic === '创业猎伙' || form.topic === '商机分享+创业猎伙') {
			return quotaPartner.value;
		}
		return quotaBusiness.value;
	});

	// --- 生命周期钩子 ---
	onLoad(async (options) => {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showModal({
				title: '请先登录',
				content: '发布商机需要登录后才能操作',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/index/index'
						});
					} else {
						uni.navigateBack();
					}
				}
			});
			return;
		}

		if (options.id) {
			isEditMode.value = true;
			form.id = options.id;
			uni.setNavigationBarTitle({
				title: '编辑商机'
			});
			fetchOpportunityDetail(options.id);
		} else {
			checkDraft();
		}

		if (uni.getStorageSync('token')) {
			checkPublishQuota();
			fetchMyEnterprises();
		}

		uni.showShareMenu({
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	onReady(async () => {
		// 页面加载完了，用户可以开始写内容了，此时弹出引导
		const shouldShow = await canShowProfileRemind();
		if (shouldShow) {
			smartGuidePopupRef.value?.open();
		}
	});

	// --- 草稿功能 ---
	const DRAFT_KEY = 'post_draft_v2';
	let debounceTimer = null;

	/** 监听表单变化，自动保存草稿（防抖1.5s） */
	watch(form, (newValue) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			saveDraft(newValue);
		}, 1500);
	}, {
		deep: true
	});

	/** 保存草稿到本地缓存 */
	const saveDraft = (data) => {
		if (data.title || data.content || data.tags.length > 0 || data.images.length > 0) {
			uni.setStorageSync(DRAFT_KEY, JSON.stringify(data));
			console.log('📝 草稿已自动保存');
		}
	};

	/** 检查是否有本地草稿，有则弹窗询问是否恢复 */
	const checkDraft = () => {
		const draft = uni.getStorageSync(DRAFT_KEY);
		if (draft) {
			hasCheckedDraft = true;
			uni.showModal({
				title: '发现未完成的草稿',
				content: '是否恢复上次编辑的内容？',
				confirmText: '恢复',
				cancelText: '放弃',
				success: (res) => {
					if (res.confirm) {
						const draftData = JSON.parse(draft);
						Object.assign(form, draftData);
					} else {
						uni.removeStorageSync(DRAFT_KEY);
					}
				}
			});
		}
	};

	/** 清除本地草稿 */
	const clearDraft = () => {
		uni.removeStorageSync(DRAFT_KEY);
		console.log('🧹 草稿已清除');
	};

	/**
	 * 获取商机详情并还原到表单（编辑模式使用）
	 * @param {string|number} id - 商机ID
	 */
	const fetchOpportunityDetail = async (id) => {
		uni.showLoading({
			title: '正在获取内容...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/business-opportunities/get', {
			method: 'GET',
			data: {
				id
			}
		});
		uni.hideLoading();

		if (!error && data) {
			form.title = data.postTitle;
			form.content = data.postContent;
			form.topic = data.postType == 1 ? '创业猎伙' : (data.postType == 2 ? '商机分享+创业猎伙' : '商机分享');
			form.tags = data.tags || [];
			form.showProfile = data.cardFlag;
			form.isReadTrace = data.isReadTrace;
			form.isEnterprise = data.isEnterprise;
			form.userEnterpriseId = data.userEnterpriseId;

			// 还原猎伙专属字段
			if (data.postType == 1) {
				// partnerTypes 接口返回逗号字符串，还原为数组
				// 预设值：'1'求贤 '2'找合伙人 '3'寻资源 '4'其他；其余视为自定义文本
				const PRESET_TYPES = ['1', '2', '3', '4'];
				if (data.partnerTypes) {
					const allTypes = data.partnerTypes.split(',').filter(v => v);
					const customTypes = allTypes.filter(v => !PRESET_TYPES.includes(v));
					const presetTypes = allTypes.filter(v => PRESET_TYPES.includes(v));
					if (customTypes.length > 0) {
						if (!presetTypes.includes('4')) presetTypes.push('4');
						form.partnerTypeOther = customTypes.join('、');
					}
					form.partnerTypes = presetTypes;
				} else {
					form.partnerTypes = [];
				}
				form.urgentLevel = data.urgentLevel || 1;
				// expectedInvestment 为 JSON 字符串，还原各子字段
				if (data.expectedInvestment) {
					try {
						const inv = JSON.parse(data.expectedInvestment);
						form.investmentFund = inv['资金范围'] || '';
						form.investmentResource = inv['资源类型'] || '';
						form.investmentEquity = inv['股权比例'] || '';
					} catch (e) {
						console.error('解析 expectedInvestment 失败:', e);
					}
				}
			}

			// 还原媒体
			if (data.postVideo) {
				form.mediaType = 'video';
				form.postVideo = data.postVideo;
				form.businessCoverImageUrl = data.businessCoverImageUrl;
			} else {
				form.mediaType = 'image';
				form.images = data.postImg ? data.postImg.split(',').filter(s => s) : [];
			}
		}
	};

	/**
	 * 获取商机/猎伙发布剩余次数
	 * rightsType: 1-商机, 2-猎伙
	 */
	const checkPublishQuota = async () => {
		try {
			const [res1, res2] = await Promise.all([
				request('/app-api/member/top-up-level-rights/get-remaining', {
					method: 'GET',
					data: {
						rightsType: 1
					}
				}),
				request('/app-api/member/top-up-level-rights/get-remaining', {
					method: 'GET',
					data: {
						rightsType: 2
					}
				})
			]);
			quotaBusiness.value = (typeof res1.data === 'number') ? res1.data : 0;
			quotaPartner.value = (typeof res2.data === 'number') ? res2.data : 0;
			isQuotaLoaded.value = true;
			console.log(`权益加载完成: 商机=${quotaBusiness.value}, 猎伙=${quotaPartner.value}`);
		} catch (e) {
			console.error('获取权益失败', e);
		}
	};

	// ===== 猎伙权限 & 智米流程 =====

	/**
	 * 检查用户是否有发布猎伙的权限（白银会员及以上，topUpLevelId >= 3）
	 * @returns {boolean}
	 */
	const hasLiehuoPermission = () => {
		const userInfo = getCachedUserInfo();
		return userInfo && (userInfo.topUpLevelId >= 3);
	};

	/**
	 * 获取当前用户智米余额
	 * @returns {Promise<number>} 智米余额
	 */
	const fetchPointBalance = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/point-record/get-balance', {
			method: 'GET'
		});
		if (!error && typeof data === 'number') return data;
		return 0;
	};

	/**
	 * 弹出升级会员引导弹窗（无权限时使用）
	 * 提供「消耗智米发布」和「立即升级」两个选项
	 */
	const showUpgradeModal = () => {
		uni.showModal({
			title: '🚀 解锁高级招募功能',
			content: '升级为「白银会员」，即可发布猎伙，精准招募：核心合伙人、关键人才、稀缺资源',
			cancelText: '消耗智米发布',
			confirmText: '立即升级',
			confirmColor: '#FF6A00',
			success: async (res) => {
				if (res.confirm) {
					// 跳转到会员升级页
					uni.navigateTo({
						url: '/packages/recharge/recharge?type=membership'
					});
				} else {
					// 用户选择消耗智米发布，进入智米支付流程
					await handlePointPublishFlow();
				}
			}
		});
	};

	/**
	 * 智米支付流程：
	 * 余额 >= 20 → 二次确认后继续发布
	 * 余额 < 20  → 弹出充值引导
	 */
	const handlePointPublishFlow = async () => {
		uni.showLoading({
			title: '查询智米余额...',
			mask: true
		});
		const balance = await fetchPointBalance();
		uni.hideLoading();

		const REQUIRED_POINTS = 20;

		if (balance >= REQUIRED_POINTS) {
			// 余额充足，二次确认
			uni.showModal({
				title: '确认消耗智米',
				content: `发布猎伙需要消耗 ${REQUIRED_POINTS} 智米，当前余额：${balance} 智米。是否继续？`,
				cancelText: '取消',
				confirmText: '确认发布',
				confirmColor: '#FF6A00',
				success: (res) => {
					if (res.confirm) {
						// 标记使用智米发布，进入正常发布流程
						usePointForPublish.value = true;
						submitPost();
					}
				}
			});
		} else {
			// 余额不足，引导充值
			uni.showModal({
				title: '💰 智米不足',
				content: `发布猎伙需要消耗 ${REQUIRED_POINTS} 智米。\n当前余额：${balance} 智米\n\n请充值后再发布，让优质机会不被错过。`,
				cancelText: '取消',
				confirmText: '立即充值',
				confirmColor: '#FF6A00',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/packages/recharge/recharge?type=point'
						});
					}
				}
			});
		}
	};

	// ===== 表单交互函数 =====

	/**
	 * 切换商机分类，并在切换到猎伙时做权限检查（非编辑模式）
	 */
	function topicChange(e) {
		const newTopic = e.detail.value;

		// 编辑模式不允许切换，直接返回
		if (isEditMode.value) return;

		// 如果切换到商机分享或"商机分享+创业猎伙"，直接设置并重置智米标记
		if (newTopic !== '创业猎伙' && newTopic !== '商机分享+创业猎伙') {
			form.topic = newTopic;
			usePointForPublish.value = false;
			return;
		}

		// 切换到"创业猎伙"或"商机分享+创业猎伙"时检查权限
		if (hasLiehuoPermission()) {
			// 有权限，直接切换
			form.topic = newTopic;
		} else {
			// 无权限，先切换 UI（让用户看到选中效果），再弹引导弹窗
			form.topic = newTopic;
			showUpgradeModal();
		}
	}

	/**
	 * 切换猎伙类型（多选）
	 * @param {string} value - 选项值
	 */
	function togglePartnerType(value) {
		const idx = form.partnerTypes.indexOf(value);
		if (idx === -1) {
			form.partnerTypes.push(value);
		} else {
			form.partnerTypes.splice(idx, 1);
			if (value === '4') form.partnerTypeOther = '';
		}
	}

	/**
	 * 处理点击建议标签的函数
	 * @param {string} tagName - 被点击的建议标签名
	 */
	function selectSuggestion(tagName) {
		if (!tagName) return;
		let val = tagName.trim();
		if (!val.startsWith('#')) val = '#' + val;

		if (form.tags.length >= 5) return uni.showToast({
			title: '最多添加5个标签',
			icon: 'none'
		});
		if (form.tags.includes(val)) return uni.showToast({
			title: '标签已存在',
			icon: 'none'
		});

		form.tags.push(val);
		form.tagInput = '';
		tagSuggestions.value = [];
	}

	/** 手动添加标签 */
	function handleAddTagManually() {
		let val = form.tagInput.trim();
		if (!val) return uni.showToast({
			title: '请输入标签',
			icon: 'none'
		});
		if (!val.startsWith('#')) val = '#' + val;

		if (form.tags.length >= 5) return uni.showToast({
			title: '最多添加5个标签',
			icon: 'none'
		});
		if (form.tags.includes(val)) return uni.showToast({
			title: '标签已存在',
			icon: 'none'
		});

		form.tags.push(val);
		logTagSearch(val, 1);
		form.tagInput = '';
		tagSuggestions.value = [];
	}

	/**
	 * 静默记录标签搜索历史
	 * @param {string} name - 标签名
	 * @param {number} type - 类型（1: 商机）
	 */
	async function logTagSearch(name, type) {
		const tagName = name.startsWith('#') ? name.substring(1) : name;
		try {
			await request('/app-api/member/tags-search-history/create', {
				method: 'POST',
				data: {
					id: 0,
					name: tagName,
					type: type
				}
			});
			console.log(`标签历史 "${tagName}" 已记录`);
		} catch (error) {
			console.error('记录标签历史失败:', error);
		}
	}

	/** 监听标签输入框的变化，触发防抖模糊搜索 */
	watch(() => form.tagInput, (newValue) => {
		clearTimeout(tagSearchTimer);
		if (newValue && newValue.trim()) {
			tagSearchTimer = setTimeout(() => {
				fetchTagSuggestions(newValue.trim());
			}, 300);
		} else {
			tagSuggestions.value = [];
		}
	});

	/**
	 * 从API获取标签建议
	 * @param {string} keyword - 用户输入的关键词
	 */
	async function fetchTagSuggestions(keyword) {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/tags-search-history/page', {
				method: 'GET',
				data: {
					pageNo: 1,
					pageSize: 20,
					name: keyword,
					type: 1
				}
			});
			if (error || !data || !data.list) {
				tagSuggestions.value = [];
				return;
			}
			const suggestions = data.list.map(item => item.name);
			tagSuggestions.value = [...new Set(suggestions)];
		} catch (e) {
			console.error('获取标签建议失败:', e);
			tagSuggestions.value = [];
		}
	}

	/** 删除指定标签 */
	function removeTag(index) {
		form.tags.splice(index, 1);
	}

	// --- 图片处理函数 ---

	/** 选择并上传图片（最多9张，单张限5MB） */
	async function handleChooseImage() {
		if (form.mediaType !== 'image') form.mediaType = 'image';

		uni.chooseImage({
			count: 9 - form.images.length,
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const validFiles = res.tempFiles.filter(file => file.size <= 5 * 1024 * 1024);
				if (res.tempFiles.length > validFiles.length) {
					uni.showToast({
						title: '部分文件过大(>5MB)，已忽略',
						icon: 'none'
					});
				}
				if (validFiles.length === 0) return;

				uni.showLoading({
					title: `正在上传...`,
					mask: true
				});
				const uploadPromises = validFiles.map(file => uploadFile(file, {
					directory: 'post'
				}));
				const results = await Promise.all(uploadPromises);
				uni.hideLoading();

				const successfulUrls = [];
				results.forEach(result => {
					if (result.data) successfulUrls.push(result.data);
					else console.error('上传失败:', result.error);
				});

				form.images.push(...successfulUrls);

				if (successfulUrls.length < validFiles.length) {
					uni.showToast({
						title: '部分图片上传失败',
						icon: 'none'
					});
				}
			},
		});
	}

	/** 预览指定索引的图片 */
	const previewImage = (index) => {
		console.log('当前点击的图片:', form.images[index]);
		if (!form.images || form.images.length === 0) return;
		uni.previewImage({
			urls: form.images,
			current: index,
			loop: true
		});
	};

	/** 替换指定位置的图片 */
	function replaceImage(index) {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const file = res.tempFiles[0];
				if (file.size > 5 * 1024 * 1024) return uni.showToast({
					title: '文件大小不能超过5MB',
					icon: 'none'
				});

				uni.showLoading({
					title: '正在替换...',
					mask: true
				});
				const result = await uploadFile(file, {
					directory: 'post'
				});
				uni.hideLoading();

				if (result.data) {
					form.images[index] = result.data;
					uni.showToast({
						title: '图片已替换',
						icon: 'none'
					});
				} else {
					uni.showToast({
						title: result.error || '替换失败',
						icon: 'error'
					});
				}
			},
		});
	}

	// --- 视频处理函数 ---

	/** 选择并上传视频（限60秒，限50MB） */
	async function handleChooseVideo() {
		if (form.images.length > 0) form.images = [];

		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60,
			compressed: true,
			success: async (res) => {
				form.mediaType = 'video';
				const videoFile = {
					path: res.tempFilePath,
					size: res.size
				};

				if (videoFile.size > 50 * 1024 * 1024) {
					form.mediaType = '';
					return uni.showToast({
						title: '视频超过50MB',
						icon: 'none'
					});
				}

				uni.showLoading({
					title: '视频上传中...',
					mask: true
				});
				const result = await uploadFile(videoFile, {
					directory: 'post_videos'
				});
				uni.hideLoading();

				if (result.data) {
					form.postVideo = result.data;
					uni.showToast({
						title: '视频上传成功',
						icon: 'success'
					});
				} else {
					form.mediaType = '';
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					});
				}
			},
			fail: (err) => {
				console.log('取消选择视频');
			}
		});
	}

	/** 删除已选视频（需二次确认） */
	function deleteVideo() {
		uni.showModal({
			title: '提示',
			content: '确定要删除这个视频吗？',
			success: (res) => {
				if (res.confirm) {
					form.postVideo = '';
					form.businessCoverImageUrl = '';
					if (form.images.length === 0) form.mediaType = '';
				}
			}
		});
	}

	/** 选择视频封面图片并裁剪上传 */
	const handleChooseVideoCover = async () => {
		uni.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFiles[0].tempFilePath;

				// #ifdef MP-WEIXIN
				wx.cropImage({
					src: tempFilePath,
					cropScale: '4:3',
					success: (cropRes) => {
						console.log('裁剪成功:', cropRes.tempFilePath);
						uploadCoverToCloud(cropRes.tempFilePath);
					},
					fail: (err) => {
						console.log('用户取消裁剪或失败:', err);
					}
				});
				// #endif

				// #ifndef MP-WEIXIN
				uploadCoverToCloud(tempFilePath);
				// #endif
			}
		});
	};

	/**
	 * 上传视频封面到云存储
	 * @param {string} filePath - 本地文件路径
	 */
	const uploadCoverToCloud = async (filePath) => {
		uni.showLoading({
			title: '上传中...'
		});
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'post_covers'
		});
		uni.hideLoading();

		if (result.data) {
			form.businessCoverImageUrl = result.data;
			uni.showToast({
				title: '封面设置成功',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: '上传失败',
				icon: 'none'
			});
		}
	};

	/** 弹出发布额度不足弹窗，并引导升级会员 */
	const showQuotaExceededModal = () => {
		const typeName = form.topic === '创业猎伙' ? '创业猎伙' : '商机发布';
		uni.showModal({
			title: '发布额度不足',
			content: `您本月的【${typeName}】发布次数已耗尽，升级会员可获取更多额度。`,
			cancelText: '取消',
			confirmText: '升级会员',
			confirmColor: '#FF6A00',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: '/packages/recharge/recharge?type=membership'
					});
				}
			}
		});
	};

	/**
	 * 点击发布按钮的入口
	 * 先检查额度，再做猎伙权限校验，最后进入表单校验与提交
	 */
	const handleSubmitClick = () => {
		// 1. 额度检查
		if (isQuotaLoaded.value && currentRemainingQuota.value == 0) {
			showQuotaExceededModal();
			return;
		}

		// 2. 猎伙权限检查（非编辑模式、非已通过智米授权）
		if (form.topic === '创业猎伙' && !isEditMode.value && !usePointForPublish.value) {
			if (!hasLiehuoPermission()) {
				showUpgradeModal();
				return;
			}
		}

		// 3. 进入表单校验与提交
		submitPost();
	};

	/**
	 * 获取我名下的企业列表（过滤草稿状态）
	 */
	const fetchMyEnterprises = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user-enterprise-info/my-list', {
			method: 'GET'
		});
		if (!error && data && data.list) {
			myEnterprises.value = data.list
				.filter(item => item.status !== 0)
				.map(item => ({
					text: item.enterpriseName,
					value: item.id
				}));
			console.log('✅ 可用发布身份企业数:', myEnterprises.value.length);
		}
	};

	/**
	 * 切换发布身份（个人/企业）
	 */
	const handleIdentityChange = (e) => {
		const val = Number(e.detail.value);
		form.isEnterprise = val;
		if (val === 0) {
			form.userEnterpriseId = null;
		} else if (myEnterprises.value.length === 1) {
			// 只有一家企业时自动选中
			form.userEnterpriseId = myEnterprises.value[0].value;
		}
	};

	/** 跳转到企业创建页 */
	const goToCreateEnterprise = () => {
		uni.navigateTo({
			url: '/packages/enterprise-list/enterprise-list'
		});
	};

	/**
	 * 表单校验 & 提交（创建/编辑均通过此入口）
	 */
	function submitPost() {
		// 额度二次校验
		if (isQuotaLoaded.value && currentRemainingQuota.value == 0) {
			showQuotaExceededModal();
			return;
		}

		// 基础字段校验
		if (!form.title.trim() || form.title.length > 100) return uni.showToast({
			title: '标题不能为空且不能超过100字',
			icon: 'none'
		});
		if (form.content.length > 5000) return uni.showToast({
			title: '内容不能超过5000字',
			icon: 'none'
		});
		if (!form.topic) return uni.showToast({
			title: '请选择一个专题',
			icon: 'none'
		});
		if (form.isEnterprise === 1 && !form.userEnterpriseId) return uni.showToast({
			title: '请选择要发布的身份企业',
			icon: 'none'
		});

		// 猎伙专属字段校验
		if (form.topic === '创业猎伙') {
			if (form.partnerTypes.length === 0) return uni.showToast({
				title: '请选择至少一个猎伙类型',
				icon: 'none'
			});
			if (form.partnerTypes.includes('4') && !form.partnerTypeOther.trim()) return uni.showToast({
				title: '请填写「其他」类型的具体内容',
				icon: 'none'
			});
			if (!form.urgentLevel) return uni.showToast({
				title: '请选择紧急程度',
				icon: 'none'
			});
		}

		// 构建预期投入 JSON（仅在有内容时拼入）
		let expectedInvestment = '';
		if (form.topic === '创业猎伙' || form.topic === '商机分享+创业猎伙') {
			const inv = {};
			if (form.investmentFund.trim()) inv['资金范围'] = form.investmentFund.trim();
			if (form.investmentResource.trim()) inv['资源类型'] = form.investmentResource.trim();
			if (form.investmentEquity.trim()) inv['股权比例'] = form.investmentEquity.trim();
			if (Object.keys(inv).length > 0) expectedInvestment = JSON.stringify(inv);
		}

		const postData = {
			id: form.id,
			userId: uni.getStorageSync('userId') || 0,
			postTitle: form.title,
			postType: form.topic === '商机分享' ? '0' : (form.topic === '商机分享+创业猎伙' ? '2' : '1'),
			postContent: form.content,
			postImg: form.mediaType === 'image' ? form.images.join(',') : '',
			postVideo: form.mediaType === 'video' ? form.postVideo : '',
			businessCoverImageUrl: form.mediaType === 'video' ? form.businessCoverImageUrl : '',
			postedAt: new Date().toISOString(),
			commentFlag: 1,
			cardFlag: form.showProfile,
			isReadTrace: form.isReadTrace,
			isEnterprise: form.isEnterprise,
			userEnterpriseId: form.userEnterpriseId || 0,
			tags: form.tags,
			status: 'active',
			// ===== 猎伙专属字段（非猎伙时不传或传空）=====
			...(form.topic === '创业猎伙' || form.topic === '商机分享+创业猎伙' ? {
				// 「其他」(value='4') 替换为用户自定义文本
				partnerTypes: form.partnerTypes
					.map(v => (v === '4' && form.partnerTypeOther.trim()) ? form.partnerTypeOther.trim() : v)
					.join(','),
				urgentLevel: form.urgentLevel,
				expectedInvestment: expectedInvestment,
				usePointForPublish: usePointForPublish.value,
			} : {})
		};

		uni.showModal({
			title: isEditMode.value ? '确认修改' : '确认发布',
			content: '请确认您填写的内容无误。',
			success: (res) => {
				if (res.confirm) {
					if (isEditMode.value) {
						performUpdate(postData);
					} else {
						createOpportunities(postData);
					}
				}
			}
		});
	}

	/**
	 * 调用创建接口发布商机/猎伙
	 * @param {object} postData - 请求体数据
	 */
	const createOpportunities = async (postData) => {
		uni.showLoading({
			title: '正在发布...',
			mask: true
		});
		const result = await request('/app-api/member/business-opportunities/create', {
			method: 'POST',
			data: postData
		});
		uni.hideLoading();

		if (result.data !== null) {
			clearDraft();
			usePointForPublish.value = false; // 重置智米标记
			uni.showModal({
				title: '发布成功',
				content: '可在【我的】-【我的商机】中查看您发布的商机。',
				showCancel: false,
				confirmText: '知道了',
				success: (res) => {
					if (res.confirm) uni.navigateBack();
				}
			});
		} else {
			uni.showToast({
				title: result.error || '发布失败',
				icon: 'none'
			});
		}
	};

	/**
	 * 调用更新接口修改商机/猎伙
	 * @param {object} postData - 请求体数据
	 */
	const performUpdate = async (postData) => {
		uni.showLoading({
			title: '正在保存修改...',
			mask: true
		});
		const result = await request('/app-api/member/business-opportunities/update', {
			method: 'PUT',
			data: postData
		});
		uni.hideLoading();

		if (!result.error) {
			clearDraft();
			uni.showToast({
				title: '修改成功',
				icon: 'success'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		} else {
			uni.showToast({
				title: result.error || '保存失败',
				icon: 'none'
			});
		}
	};

	/** 分享给好友 */
	onShareAppMessage(() => {
		const inviteCode = getInviteCode();
		let sharePath = '/packages/home-opportunitiesPublish/home-opportunitiesPublish';
		if (inviteCode) sharePath += `?inviteCode=${inviteCode}`;
		return {
			title: '发现一个好商机，快来发布你的商业需求！',
			path: sharePath,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	/** 分享到朋友圈 */
	onShareTimeline(() => {
		const inviteCode = getInviteCode();
		return {
			title: '发现一个好商机，快来发布你的商业需求！',
			query: inviteCode ? `inviteCode=${inviteCode}` : '',
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});
</script>

<style scoped>
	.page {
		padding: 20rpx;
		background-color: #f9f9f9;
	}

	.header {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		padding: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.header-title {
		font-size: 36rpx;
		font-weight: bold;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 50%;
		width: 50rpx;
		height: 50rpx;
		font-size: 28rpx;
		color: white;
		text-align: center;
	}

	.form-container {}

	.form-card {
		background: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.form-group {
		margin-bottom: 30rpx;
	}

	.form-label {
		font-size: 28rpx;
		font-weight: 700;
		margin-top: 10rpx;
		display: block;
		color: #666;
		margin-bottom: 10rpx;
	}

	.form-input,
	.form-textarea {
		width: 95%;
		border: 1rpx solid #e0e0e0;
		border-radius: 12rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 10rpx;
	}

	.form-textarea {
		min-height: 180rpx;
	}

	.hint {
		font-size: 24rpx;
		color: #999;
	}

	.hint-inline {
		font-size: 24rpx;
		color: #999;
		font-weight: normal;
	}

	.required-star {
		color: #FF6A00;
		font-size: 28rpx;
		margin-left: 4rpx;
	}

	/* ==================== 单选框组 ==================== */
	.radio-group-container {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 40rpx;
		margin-top: 10rpx;
	}

	.radio-item {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
	}

	.radio-item text {
		margin-left: 10rpx;
		white-space: nowrap;
	}

	/* 两列布局的单选框 */
	.radio-two-in-line {
		display: flex;
		gap: 40rpx;
		align-items: flex-start;
	}

	.radio-item-inline {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
		flex: 1;
	}

	.radio-item-inline text {
		margin-left: 10rpx;
		white-space: nowrap;
	}

	/* ==================== 猎伙专属字段卡片 ==================== */
	.liehuoFields-card {
		background: #fff8f3;
		border: 1rpx solid #ffe0c8;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 30rpx;
	}

	/* ===== 猎伙类型：新版两行布局 ===== */
	.checkbox-group-container-vertical {
		display: grid;
		grid-template-columns: 1fr 1fr;
		/* 保持双列，如果内容太挤可改为 1fr */
		gap: 24rpx;
		margin-top: 10rpx;
	}

	.checkbox-item-new {
		display: flex;
		align-items: flex-start;
		/* 顶部对齐，适合多行文本 */
		gap: 16rpx;
		background: #fff;
		padding: 16rpx;
		border-radius: 12rpx;
		border: 1rpx solid #f0f0f0;
	}

	.checkbox-right {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.checkbox-label-main {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.checkbox-label-sub {
		font-size: 20rpx;
		color: #999;
		margin-top: 4rpx;
	}

	/* 覆盖之前可能存在的 simple 布局 */
	.checkbox-group-container {
		display: none;
		/* 如果不删旧的，可以给个不同类名 */
	}

	/* ===== 「其他」自定义输入框 ===== */
	.other-type-input-wrap {
		margin-top: 16rpx;
		background: #fff;
		border: 1rpx solid #ffd0a8;
		border-radius: 12rpx;
		padding: 4rpx 16rpx;
	}

	.other-type-input {
		width: 100%;
		height: 72rpx;
		font-size: 28rpx;
		color: #333;
		background: transparent;
	}

	/* ===== 紧急程度标签 ===== */
	.urgency-group {
		display: flex;
		gap: 20rpx;
		margin-top: 10rpx;
		flex-wrap: wrap;
	}

	.urgency-tag {
		padding: 10rpx 32rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;
	}

	/* 普通 - 绿色 */
	.urgency-normal {
		background: #E8F5E9;
		/* 极浅绿色 */
		color: #4CAF50;
		/* 绿色文字 */
		border-color: #C8E6C9;
	}

	.urgency-normal.urgency-selected {
		background: #4CAF50;
		/* 深绿色 */
		color: #fff;
		/* 白色文字 */
		border-color: #4CAF50;
		font-weight: bold;
	}

	/* 紧急 - 橙色 */
	.urgency-urgent {
		background: #fff3e0;
		color: #FF8C00;
		border-color: #ffd180;
	}

	.urgency-urgent.urgency-selected {
		background: #FF8C00;
		color: #fff;
		border-color: #FF8C00;
		font-weight: bold;
	}

	/* 特急 - 红色 */
	.urgency-super {
		background: #fff0f0;
		color: #FF3B30;
		border-color: #ffb3b0;
	}

	.urgency-super.urgency-selected {
		background: #FF3B30;
		color: #fff;
		border-color: #FF3B30;
		font-weight: bold;
	}

	/* ===== 预期投入 ===== */
	.investment-fields {
		background: #fff;
		border-radius: 12rpx;
		border: 1rpx solid #ffe0c8;
		overflow: hidden;
		margin-top: 10rpx;
	}

	.investment-row {
		display: flex;
		align-items: center;
		padding: 18rpx 20rpx;
		border-bottom: 1rpx solid #f5f0eb;
	}

	.investment-row:last-child {
		border-bottom: none;
	}

	.investment-key {
		width: 140rpx;
		font-size: 26rpx;
		color: #555;
		flex-shrink: 0;
	}

	.investment-input {
		flex: 1;
		font-size: 26rpx;
		color: #333;
		border: none;
		background: transparent;
	}

	/* ===== 智米发布提示条 ===== */
	.point-publish-tip {
		display: flex;
		align-items: center;
		background: #fff3cd;
		border-radius: 10rpx;
		padding: 14rpx 20rpx;
		gap: 10rpx;
	}

	.point-tip-icon {
		font-size: 28rpx;
	}

	.point-tip-text {
		font-size: 26rpx;
		color: #856404;
	}

	/* ==================== 标签区域 ==================== */
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin: 10rpx 0;
	}

	.tag {
		background: #fff0e6;
		color: #FF6A00;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
	}

	.tag-remove {
		margin-left: 8rpx;
		font-size: 24rpx;
		color: #888;
	}

	.tag-input-container {
		display: flex;
		margin-top: 10rpx;
	}

	.tag-input {
		flex: 1;
		border: 1rpx solid #e0e0e0;
		border-top-left-radius: 20rpx;
		border-bottom-left-radius: 20rpx;
		padding: 16rpx;
		font-size: 26rpx;
	}

	.add-tag-btn {
		background: #FF6A00;
		color: white;
		padding: 0 30rpx;
		border-top-right-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
		font-size: 26rpx;
	}

	.tag-suggestions-scroll {
		white-space: nowrap;
		padding: 10rpx 0;
		margin-bottom: 10rpx;
		width: 100%;
	}

	.tag-suggestions-scroll ::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}

	.suggestion-tag {
		display: inline-block;
		background-color: #f0f0f0;
		color: #555;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
		margin-right: 16rpx;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.suggestion-tag:active {
		background-color: #e0e0e0;
	}

	/* ==================== 企业选择 ==================== */
	.identity-hint {
		margin-top: 16rpx;
		font-size: 22rpx;
		color: #999;
		background-color: #f9f9f9;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		line-height: 1.4;
	}

	.enterprise-selector-wrap {
		margin-top: 10rpx;
	}

	.no-enterprise-tip {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #FF6A00;
		text-decoration: underline;
		text-align: center;
	}

	/* ==================== 图片预览 ==================== */
	.image-preview {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
		margin-top: 10rpx;
	}

	.image-wrapper {
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
		aspect-ratio: 1 / 1;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.delete-image-btn {
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 0 12rpx 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		z-index: 10;
	}

	.delete-image-btn:active {
		background-color: rgba(0, 0, 0, 0.7);
	}

	.add-img-placeholder {
		aspect-ratio: 1 / 1;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 24rpx;
	}

	.add-img-placeholder i {
		font-size: 48rpx;
		margin-bottom: 10rpx;
		color: inherit;
	}

	.add-img-placeholder text {
		font-size: 24rpx;
	}

	.add-img-placeholder:active {
		border-color: #FF6A00;
		color: #FF6A00;
	}

	/* ==================== 其他设置 ==================== */
	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.setting-label {
		font-size: 28rpx;
		color: #555;
	}

	.setting-label-group {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding-right: 20rpx;
	}

	.setting-desc {
		font-size: 22rpx;
		color: #999;
		line-height: 1.4;
		margin-top: 4rpx;
	}

	/* ==================== 提交按钮 ==================== */
	.submit-btn {
		background: linear-gradient(to right, #FF6A00, #FF8C37);
		color: white;
		border-radius: 30rpx;
		padding: 14rpx;
		font-size: 30rpx;
		width: 100%;
		text-align: center;
		font-weight: 600;
		margin-top: 20rpx;
		box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.3);
	}

	.submit-btn.disabled-btn {
		background: #ccc;
		color: #fff;
		box-shadow: none;
	}

	/* ==================== 媒体选择器和视频预览 ==================== */
	.media-selector {
		display: flex;
		gap: 30rpx;
		margin-top: 10rpx;
	}

	.selector-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 180rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		color: #666;
		font-size: 26rpx;
		transition: all 0.2s ease;
	}

	.selector-btn:active {
		border-color: #FF6A00;
		color: #FF6A00;
	}

	.selector-btn text {
		margin-top: 10rpx;
	}

	.video-section {
		display: flex;
		gap: 20rpx;
		margin-top: 10rpx;
	}

	.video-preview-wrapper {
		position: relative;
		flex: 2;
		height: 240rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #000;
	}

	.preview-video {
		width: 100%;
		height: 100%;
		display: block;
	}

	.video-cover-wrapper {
		position: relative;
		flex: 1;
		height: 240rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.cover-image {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.add-cover-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
	}

	.add-cover-placeholder text {
		font-size: 22rpx;
		margin-top: 6rpx;
	}

	.cover-tag {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		font-size: 20rpx;
		text-align: center;
		padding: 4rpx 0;
		z-index: 10;
	}

	.delete-video-btn {
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 50rpx;
		height: 50rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 0 12rpx 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		z-index: 10;
	}

	.delete-video-btn:active {
		background-color: rgba(0, 0, 0, 0.7);
	}

	.animate-fade {
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>