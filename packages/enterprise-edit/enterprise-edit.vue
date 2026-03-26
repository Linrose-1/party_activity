<template>
	<view class="edit-container">
		<!-- 1. 顶部步骤导航 -->
		<view class="step-header">
			<view class="step-nav">
				<view class="nav-item" v-for="(title, index) in stepTitles" :key="index"
					:class="{ active: currentStep >= (index + 1) }" @click="handleStepClick(index + 1)">
					<view class="node-wrap">
						<view class="node">{{ currentStep > (index + 1) ? '✓' : (index + 1) }}</view>
						<view class="line" v-if="index < 3"></view>
					</view>
					<text class="nav-text">{{ title }}</text>
				</view>
			</view>
		</view>

		<view class="form-scroll-view">
			<!-- 步骤1：企业基本信息 -->
			<view v-if="currentStep === 1" class="step-content">
				<view class="section-card">
					<view class="group-title">企业信息</view>
					<uni-forms ref="formStep1" :modelValue="form" :rules="rules" label-position="top"
						label-width="100%">
						<uni-forms-item label="企业LOGO" required>
							<view class="logo-uploader enterprise-logo-style"
								@click="handleImageUpload('enterpriseLogo', 'ent_logo')">
								<image v-if="form.enterpriseLogo" :src="form.enterpriseLogo" mode="aspectFill"
									class="logo-preview" />
								<view v-else class="upload-placeholder">
									<uni-icons type="camera-filled" size="30" color="#FF8600"></uni-icons>
									<text>上传企业LOGO</text>
								</view>
							</view>
							<view class="upload-tip">用于工商资质展示</view>
						</uni-forms-item>
						<uni-forms-item label="企业名称" name="enterpriseName" required>
							<uni-easyinput v-model="form.enterpriseName" placeholder="请与营业执照保持一致" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="统一社会信用代码" name="creditCode" required>
							<uni-easyinput v-model="form.creditCode" placeholder="18位统一社会信用代码" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="企业类型" name="enterpriseType">
							<uni-data-select v-model="form.enterpriseType" :localdata="typeOptions"
								placeholder="请选择企业类型" class="custom-select" />
						</uni-forms-item>
						<uni-forms-item label="法定代表人" name="legalPerson">
							<uni-easyinput v-model="form.legalPerson" placeholder="请输入姓名" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="成立日期" name="establishDate">
							<uni-datetime-picker type="date" v-model="form.establishDate" class="custom-picker" />
						</uni-forms-item>
						<uni-forms-item label="联系电话" name="officePhone">
							<uni-easyinput v-model="form.officePhone" placeholder="例如：021-12345678" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="联系邮箱" name="officialEmail">
							<uni-easyinput v-model="form.officialEmail" placeholder="contact@abc.com"
								:inputBorder="false" class="custom-input" />
						</uni-forms-item>
					</uni-forms>
				</view>
			</view>

			<!-- 步骤2：品牌与展示 -->
			<view v-if="currentStep === 2" class="step-content">
				<view class="section-card">
					<view class="group-title">品牌信息</view>
					<uni-forms label-position="top" label-width="100%">
						<uni-forms-item label="品牌Logo (建议圆形)" required>
							<view class="logo-uploader" @click="handleImageUpload('logoUrl', 'logo')">
								<image v-if="form.logoUrl" :src="form.logoUrl" mode="aspectFill" class="logo-preview" />
								<view v-else class="upload-placeholder">
									<uni-icons type="camera-filled" size="34" color="#FF8600"></uni-icons>
									<text>上传Logo</text>
								</view>
							</view>
						</uni-forms-item>
						<uni-forms-item label="品牌名称" required>
							<uni-easyinput v-model="form.brandName" placeholder="例如：猩聚社" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="品牌标语 (Slogan)">
							<uni-easyinput v-model="form.brandSlogan" placeholder="一句话描述您的品牌" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="品牌背景图 (选传)">
							<view class="bg-uploader" @click="handleImageUpload('backgroundUrl', 'bg')">
								<image v-if="form.backgroundUrl" :src="form.backgroundUrl" mode="aspectFill"
									class="bg-preview" />
								<view v-else class="upload-placeholder">
									<uni-icons type="image" size="30" color="#999"></uni-icons>
									<text>点击上传品牌背景图</text>
								</view>
							</view>
						</uni-forms-item>

						<view class="group-title m-t-30">品牌介绍</view>
						<uni-forms-item label="简短介绍" required>
							<uni-easyinput type="textarea" v-model="form.shortIntro" maxlength="3000"
								placeholder="介绍一下您的企业核心业务和愿景..." class="custom-textarea" />
						</uni-forms-item>
						<uni-forms-item label="所属行业" name="industryFirst">
							<uni-data-picker placeholder="请选择行业" popup-title="请选择行业" :localdata="industryTree"
								:map="{text: 'name', value: 'name'}" v-model="industryLabel"
								@change="onIndustryChange" />
						</uni-forms-item>
					</uni-forms>
				</view>
			</view>

			<!-- 步骤3：联系与入口 -->
			<view v-if="currentStep === 3" class="step-content">
				<view class="section-card">
					<!-- 1. 官方网站 -->
					<view class="group-title">企业官网</view>
					<uni-forms label-position="top" label-width="100%">
						<uni-forms-item label="官方网站链接">
							<uni-easyinput v-model="form.officialWebsite" placeholder="https://www.abc.com"
								:inputBorder="false" class="custom-input" />
						</uni-forms-item>
					</uni-forms>

					<!-- 2. 社交媒体 (微信生态) -->
					<view class="group-title m-t-30">社交媒体</view>
					<view class="social-inner-card">
						<view class="sub-label">微信公众号</view>
						<uni-easyinput v-model="form.wechatMpName" placeholder="名称：ABC科技" class="m-b-10 custom-input-bg"
							:inputBorder="false" />
						<!-- <uni-easyinput v-model="form.wechatMpId" placeholder="ID：ABC_Tech"
							class="m-b-10 custom-input-bg" :inputBorder="false" /> -->
						<view class="qr-upload-box" @click="handleImageUpload('wechatMpQrcode', 'qrcode')">
							<image v-if="form.wechatMpQrcode" :src="form.wechatMpQrcode" mode="aspectFill" />
							<view v-else class="qr-pl">
								<uni-icons type="qrcode" size="24" color="#999"></uni-icons>
								<text>上传公众号二维码</text>
							</view>
						</view>

						<view class="sub-label m-t-30">视频号</view>
						<uni-easyinput v-model="form.videoAccount" placeholder="视频号链接或ID" class="m-b-10 custom-input-bg"
							:inputBorder="false" />
						<view class="qr-upload-box" @click="handleImageUpload('videoAccountQrcode', 'qrcode')">
							<image v-if="form.videoAccountQrcode" :src="form.videoAccountQrcode" mode="aspectFill" />
							<view v-else class="qr-pl">
								<uni-icons type="videocam" size="24" color="#999"></uni-icons>
								<text>上传视频号二维码</text>
							</view>
						</view>
					</view>

					<!-- 3. 联系方式 -->
					<view class="group-title m-t-30">品牌联系</view>
					<uni-forms label-position="top" label-width="100%">
						<uni-forms-item label="客服电话">
							<uni-easyinput v-model="form.customerServicePhone" placeholder="400-123-4567"
								:inputBorder="false" class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="商务合作">
							<uni-easyinput v-model="form.businessCooperation" placeholder="例如：王经理 13800138000"
								:inputBorder="false" class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="售后支持邮箱">
							<uni-easyinput v-model="form.afterSaleEmail" placeholder="service@abc.com"
								:inputBorder="false" class="custom-input" />
						</uni-forms-item>
					</uni-forms>

					<!-- 4. 线上门店 -->
					<view class="group-title m-t-30">线上门店 (快捷入口)</view>
					<view class="store-config-card" v-for="(item, index) in onlineStores" :key="'online-'+index">
						<view class="card-header">
							<text class="store-idx">线上入口 #{{ index + 1 }}</text>
							<view class="delete-btn" @click="onlineStores.splice(index, 1)">
								<uni-icons type="trash-filled" size="18" color="#ff4d4f"></uni-icons>
							</view>
						</view>
						<view class="store-form">
							<uni-data-select v-model="item.platform" :localdata="platformOptions" placeholder="选择平台" />
							<uni-easyinput v-model="item.name" placeholder="店铺显示名称" class="m-t-10 custom-input-bg"
								:inputBorder="false" />
							<uni-easyinput v-model="item.link" placeholder="店铺链接/小程序路径" class="m-t-10 custom-input-bg"
								:inputBorder="false" />
						</view>
					</view>
					<button class="add-btn-outline" @click="onlineStores.push({ platform: '美团', name: '', link: '' })">
						<uni-icons type="plusempty" size="16" color="#FF8600"></uni-icons> 添加线上门店
					</button>

					<!-- 5. 线下门店 -->
					<view class="group-title m-t-40">线下门店 (可选)</view>
					<view class="store-config-card" v-for="(item, index) in offlineStores" :key="'offline-'+index">
						<view class="card-header">
							<text class="store-idx">门店地址 #{{ index + 1 }}</text>
							<view class="delete-btn" @click="offlineStores.splice(index, 1)">
								<uni-icons type="trash-filled" size="18" color="#ff4d4f"></uni-icons>
							</view>
						</view>
						<view class="location-display">
							<text class="loc-name">{{ item.name }}</text>
							<text class="loc-addr">{{ item.address }}</text>
						</view>
					</view>
					<button class="add-btn-outline" @click="handleChooseLocation">
						<uni-icons type="location-filled" size="16" color="#FF8600"></uni-icons> 添加门店地址
					</button>
				</view>
			</view>

			<!-- 步骤4：内容与资产 -->
			<view v-if="currentStep === 4" class="step-content">
				<view class="section-card">
					<view class="group-title">品牌图库 (1-9张)</view>
					<!-- 容器加固，解决下沉问题 -->
					<view class="gallery-wrapper">
						<DragImageUploader v-model="brandImageList" :maxCount="9" @add-image="handleUploadGallery" />
					</view>
					<text class="tip-txt">建议上传：产品实拍、团队合影、办公环境等照片，支持拖拽排序</text>

					<view class="group-title m-t-40">宣传视频与封面</view>
					<!-- 采用商机发布页的“视频预览+封面”布局 -->
					<view class="video-manage-section">
						<!-- 情况A：还未上传视频 -->
						<view class="video-placeholder-btn" v-if="!form.videoUrl" @click="handleVideoUpload">
							<uni-icons type="videocam-filled" size="40" color="#FF8600"></uni-icons>
							<text>点击上传宣传视频</text>
							<text class="sub-tip">支持 mp4/mov，≤100MB</text>
						</view>

						<!-- 情况B：已上传视频，展示预览和封面设置 -->
						<view class="video-active-area" v-else>
							<!-- 左侧视频预览 -->
							<view class="video-preview-wrap">
								<video :src="form.videoUrl" class="video-p" controls></video>
								<view class="del-video-tag" @click="deleteVideo">
									<uni-icons type="trash" size="16" color="#fff"></uni-icons>
									<text>删除视频</text>
								</view>
							</view>

							<!-- 右侧封面上传 -->
							<view class="cover-upload-wrap" @click="handleChooseVideoCover">
								<image v-if="form.videoCoverUrl" :src="form.videoCoverUrl" mode="aspectFill"
									class="cover-img" />
								<view v-else class="cover-pl">
									<uni-icons type="image" size="24" color="#999"></uni-icons>
									<text>设置封面</text>
								</view>
								<view class="cover-tag">视频封面</view>
							</view>
						</view>
					</view>
					<text class="tip-txt m-t-10">设置一个精美的视频封面，能显著提升品牌展示效果</text>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="footer-btns">
			<button v-if="currentStep > 1" class="btn-prev" @click="currentStep--">上一步</button>
			<button class="btn-next" @click="handleStepProcess">
				{{ currentStep === 4 ? (isEditMode ? '提交修改' : '确认发布') : '保存并继续' }}
			</button>
		</view>

		<!-- 成功弹窗 -->
		<uni-popup ref="successPopup" :mask-click="false">
			<view class="success-dialog">
				<view class="icon-circle">✓</view>
				<text class="sd-t">{{ isEditMode ? '修改成功' : '发布成功' }}</text>
				<text class="sd-c">您的企业信息已同步至云端</text>
				<button class="sd-btn-main" @click="goCard">查看名片</button>
				<button class="sd-btn-sub" @click="goList">返回列表</button>
			</view>
		</uni-popup>
	</view>
</template>


<script setup>
	import {
		ref,
		reactive,
		onMounted,
		nextTick
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js';
	import {
		syncUserInfo
	} from '@/utils/user.js';
	// import DragUploader from '@/components/DragUploader.vue'; // 九图组件

	// ==========================================
	// 1. 接口定义 (API)
	// ==========================================
	const Api = {
		/**
		 * 创建企业信息 (首次保存草稿)
		 */
		create: (data) => request('/app-api/member/user-enterprise-info/create', {
			method: 'POST',
			data
		}),
		/**
		 * 更新企业信息 (后续步骤或编辑模式)
		 */
		update: (data) => request('/app-api/member/user-enterprise-info/update', {
			method: 'PUT',
			data
		}),
		/**
		 * 获取指定 ID 的企业详情
		 */
		getDetail: (id) => request('/app-api/member/user-enterprise-info/get', {
			method: 'GET',
			data: {
				id
			}
		}),
		/**
		 * 发布企业信息 (状态由草稿变为已发布)
		 */
		publish: (id) => request(`/app-api/member/user-enterprise-info/post-enterprise/${id}`, {
			method: 'POST'
		}),
		/**
		 * 获取全量行业树数据
		 */
		getIndustry: () => request('/app-api/member/national-industry/tree', {
			method: 'POST'
		}),
		/**
		 * 获取字典数据
		 * @param {String} type - 字典类型
		 */
		getDict: (type) => request('/app-api/system/dict-data/type', {
			method: 'GET',
			data: {
				type
			}
		})
	};

	// ==========================================
	// 2. 页面状态与表单定义
	// ==========================================
	const currentStep = ref(1); // 当前步数 (1-4)
	const stepTitles = ['企业信息', '品牌展示', '联系入口', '内容资产'];
	const enterpriseId = ref(null); // 后端返回的主键 ID
	const isEditMode = ref(false); // 是否是从列表页进入的编辑模式
	const industryTree = ref([]); // 格式化后的行业树
	const industryLabel = ref(''); // 行业选择器显示的文本
	const brandImageList = ref([]); // 品牌图库数组 (九图组件绑定)
	const offlineStores = ref([]); // 线下门店数组
	const onlineStores = ref([]); // 线上门店数组
	const successPopup = ref(null); // 发布成功弹窗引用

	/**
	 * 主表单对象
	 */
	const form = reactive({
		id: null,
		enterpriseName: '',
		enterpriseLogo: '',
		brandName: '',
		creditCode: '',
		enterpriseType: '',
		legalPerson: '',
		establishDate: '',
		officePhone: '',
		officialEmail: '',
		logoUrl: '',
		backgroundUrl: '',
		brandSlogan: '',
		shortIntro: '',
		industryFirst: '',
		industrySecond: '',
		officialWebsite: '',
		wechatMpName: '',
		wechatMpId: '',
		wechatMpQrcode: '',
		videoAccount: '',
		videoAccountQrcode: '',
		customerServicePhone: '',
		businessCooperation: '',
		afterSaleEmail: '',
		brandImages: '', // 存储为逗号隔开字符串
		videoUrl: '',
		offlineStores: '', // 存储为 JSON 字符串
		onlineStores: '', // 存储为 JSON 字符串
		status: 0,
		// 名片配置默认值
		cardMainColor: '#FF8600',
		cardLogoStyle: 0,
		cardShowContact: true,
		cardShowSocial: true,
		cardShowOnlineStore: true,
		cardShowSlogan: true,
		cardShowDetailAddress: true,
		cardShowEstablishDate: true
	});

	// 静态选项配置
	const typeOptions = ref([]); // 企业类型选项
	const platformOptions = ref([]); // 线上门店平台选项
	// const typeOptions = [{
	// 		text: '有限责任公司',
	// 		value: '有限责任公司'
	// 	},
	// 	{
	// 		text: '个体工商户',
	// 		value: '个体工商户'
	// 	}
	// ];

	// const platformOptions = [{
	// 		text: '美团',
	// 		value: '美团'
	// 	},
	// 	{
	// 		text: '大众点评',
	// 		value: '大众点评'
	// 	},
	// 	{
	// 		text: '饿了么',
	// 		value: '饿了么'
	// 	}
	// ];

	// 表单基本验证规则
	const rules = {
		enterpriseName: {
			rules: [{
				required: true,
				errorMessage: '请输入企业名称'
			}]
		},
		creditCode: {
			rules: [{
				required: true,
				errorMessage: '请输入社会信用代码'
			}]
		}
	};

	/**
	 * 【优化后】实名认证检查 (实时接口版)
	 */
	const checkRealName = async () => {
		uni.showLoading({
			title: '验证身份中...',
			mask: true
		});

		// 1. 调用你封装好的同步方法，它会请求 /app-api/member/user/get 并更新缓存
		const userInfo = await syncUserInfo();
		uni.hideLoading();

		// 2. 判定逻辑：如果获取失败（接口挂了）或者 idCert 不等于 1
		if (!userInfo || userInfo.idCert !== 1) {
			uni.showModal({
				title: '实名认证提醒',
				content: '创建企业需要先完成实名认证，是否立即前往？',
				confirmText: '去认证',
				cancelText: '取消',
				confirmColor: '#FF8600',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/packages/my-auth/my-auth'
						});
					}
				}
			});
			return false;
		}

		// 3. 校验通过
		return true;
	};

	// ==========================================
	// 3. 生命周期钩子
	// ==========================================
	onLoad(async (options) => {
		if (!options.id) {
			await checkRealName();
			// 这里不需要 return，让用户继续看表单
		}

		// 如果 URL 携带 id，说明是编辑模式
		if (options.id) {
			isEditMode.value = true;
			enterpriseId.value = options.id;
			await fetchEnterpriseDetail(options.id);
		}
	});

	onMounted(() => {
		// 加载行业树
		fetchIndustryTree();
		// 2. 加载字典数据
		loadAllDicts();
	});

	// ==========================================
	// 4. 业务逻辑方法
	// ==========================================
	/**
	 * 处理顶部步骤条点击
	 * @param {Number} targetStep 目标步骤
	 */
	const handleStepClick = async (targetStep) => {
		// 1. 如果点击的是当前步骤，不操作
		if (targetStep === currentStep.value) return;

		// 2. 新增模式下的安全拦截：如果没有 enterpriseId，不允许跳过第一步
		if (!isEditMode.value && !enterpriseId.value && targetStep > 1) {
			uni.showToast({
				title: '请先填写并保存基本信息',
				icon: 'none'
			});
			return;
		}

		// 3. 切换前自动保存当前步骤已填写的资料（可选，为了体验更好）
		// 如果你觉得没必要每一步都强制点顶部时保存，可以去掉下面的 await 逻辑，直接切换
		try {
			await saveCurrentProgressSilence();
		} catch (e) {
			console.warn('静默保存失败:', e);
		}

		// 4. 执行跳转
		currentStep.value = targetStep;

		// 5. 滚动回顶部
		nextTick(() => {
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 100
			});
		});
	};

	/**
	 * 【助手函数】静默保存当前进度
	 * 逻辑基本复用 handleStepProcess 的前半部分，但不做步骤加法
	 */
	const saveCurrentProgressSilence = async () => {
		if (!isEditMode.value && !checkRealName()) return;

		// 序列化当前已有的列表数据
		form.brandImages = brandImageList.value.join(',');
		form.offlineStores = JSON.stringify(offlineStores.value);
		form.onlineStores = JSON.stringify(onlineStores.value);

		if (isEditMode.value || enterpriseId.value) {
			await Api.update(form);
		} else {
			// 第一步必须填了基本信息才能触发
			if (!form.enterpriseName || !form.creditCode) return;

			const {
				id,
				...createParams
			} = form;
			const res = await Api.create(createParams);
			if (!res.error && res.data) {
				enterpriseId.value = res.data;
				form.id = res.data;
			}
		}
	};

	/**
	 * 加载页面所需的全部字典数据
	 */
	const loadAllDicts = async () => {
		try {
			// 并发请求两个字典
			const [typeRes, platformRes] = await Promise.all([
				Api.getDict('enterprise_type'),
				Api.getDict('online_stores_online')
			]);

			// 映射企业类型
			if (typeRes.data) {
				typeOptions.value = typeRes.data.map(item => ({
					text: item.label, // 显示文字
					value: item.label // 存储值 (保持与之前逻辑一致，存储名称字符串)
				}));
			}

			// 映射线上门店平台
			if (platformRes.data) {
				platformOptions.value = platformRes.data.map(item => ({
					text: item.label,
					value: item.label
				}));
			}

			console.log('✅ 字典数据加载成功');
		} catch (e) {
			console.error('❌ 加载字典失败', e);
		}
	};

	/**
	 * 获取全量行业数据并进行清洗
	 */
	const fetchIndustryTree = async () => {
		const {
			data,
			error
		} = await Api.getIndustry();
		if (data) {
			industryTree.value = processTree(data);
		} else if (error) {
			console.error('获取行业树失败:', error);
		}
	};

	/**
	 * 递归处理行业树：1.解决父子同名 2.每一层级插入“全部分类”
	 */
	const processTree = (tree) => {
		if (!Array.isArray(tree)) return [];
		return tree.map(node => {
			// 处理父子同名冗余逻辑
			if (node.children && node.children.length === 1 && node.children[0].name === node.name) {
				return {
					...node.children[0],
					children: null
				};
			}
			// 如果有子节点，插入“全部分类”选项支持任意层级选择
			if (node.children && node.children.length > 0) {
				const hasVirtual = node.children.some(c => c.name === '全部分类');
				if (!hasVirtual) {
					node.children.unshift({
						id: node.id + '_all',
						name: '全部分类',
						children: null // 叶子节点，点击即选中
					});
				}
				return {
					...node,
					children: processTree(node.children)
				};
			}
			return node;
		});
	};

	/**
	 * 处理行业选择器变更
	 */
	const onIndustryChange = (e) => {
		const nodes = e.detail.value; // 获取选中的路径节点数组
		console.log('📦 原始选择节点:', nodes); // 开启此日志可以观察节点结构
		if (nodes && nodes.length > 0) {
			// 关键：使用 .text 获取名称（对应 map 中的 name）
			const level1Name = nodes[0].text || nodes[0].name;
			const level2Name = nodes[1] ? (nodes[1].text || nodes[1].name) : '';
			// 判断是否选择了我们插入的“全部分类”
			if (level2Name === '全部分类') {
				form.industryFirst = level1Name;
				form.industrySecond = ''; // 如果选的是全部，二级行业留空
				industryLabel.value = level1Name; // 输入框只显示一级
			} else {
				form.industryFirst = level1Name;
				form.industrySecond = level2Name;
				// 输入框显示完整路径
				// industryLabel.value = nodes.map(n => n.text || n.name).join('/');
				industryLabel.value = level2Name || level1Name;
			}
			console.log('✅ 最终存储结果:', form.industryFirst, form.industrySecond);
		}
	};

	/**
	 * 获取详情并填充到表单 (编辑模式反显)
	 */
	const fetchEnterpriseDetail = async (id) => {
		uni.showLoading({
			title: '加载中...'
		});
		const {
			data,
			error
		} = await Api.getDetail(id);
		uni.hideLoading();
		if (!error && data) {
			applyDataToForm(data);
		}
	};

	/**
	 * 将接口数据映射到响应式表单中
	 */
	const applyDataToForm = (data) => {
		Object.assign(form, data);
		// 还原行业显示文本
		if (data.industryFirst) {
			industryLabel.value = data.industrySecond || data.industryFirst;
		}
		// 还原九图组件数组
		if (data.brandImages) {
			brandImageList.value = data.brandImages.split(',').filter(i => i);
		}
		// 还原动态 JSON 列表
		try {
			if (typeof data.onlineStores === 'string') onlineStores.value = JSON.parse(data.onlineStores || '[]');
			else if (Array.isArray(data.onlineStores)) onlineStores.value = data.onlineStores;

			if (typeof data.offlineStores === 'string') offlineStores.value = JSON.parse(data.offlineStores || '[]');
			else if (Array.isArray(data.offlineStores)) offlineStores.value = data.offlineStores;
		} catch (e) {
			console.error('数据格式转换失败:', e);
		}
	};

	/**
	 * 通用图片上传逻辑
	 */
	const handleImageUpload = (field, dir) => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				uni.showLoading({
					title: '上传中...'
				});
				const {
					data,
					error
				} = await uploadFile({
					path: res.tempFilePaths[0]
				}, {
					directory: dir
				});
				uni.hideLoading();
				if (!error) form[field] = data;
			}
		});
	};

	/**
	 * 九图上传逻辑 (添加图片)
	 */
	const handleUploadGallery = () => {
		uni.chooseImage({
			count: 9 - brandImageList.value.length,
			success: async (res) => {
				uni.showLoading({
					title: `正在处理 0/${res.tempFilePaths.length}`,
					mask: true
				});

				const uploadedUrls = [];
				for (let i = 0; i < res.tempFilePaths.length; i++) {
					uni.showLoading({
						title: `上传中 ${i+1}/${res.tempFilePaths.length}`
					});
					const {
						data
					} = await uploadFile({
						path: res.tempFilePaths[i]
					}, {
						directory: 'enterprise_gallery'
					});
					if (data) uploadedUrls.push(data);
				}

				uni.hideLoading();
				// 批量追加到响应式数组，解决 UI 更新不及时导致的“下沉”错觉
				brandImageList.value = [...brandImageList.value, ...uploadedUrls];
			}
		});
	};

	/**
	 * 视频上传逻辑
	 */
	const handleVideoUpload = () => {
		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60, // 企业视频允许长一点，3分钟
			compressed: true,
			success: async (res) => {
				// 校验大小
				if (res.size > 100 * 1024 * 1024) {
					return uni.showToast({
						title: '视频超过100MB，请压缩后上传',
						icon: 'none'
					});
				}

				uni.showLoading({
					title: '视频上传中...',
					mask: true
				});
				const result = await uploadFile({
					path: res.tempFilePath
				}, {
					directory: 'enterprise_video'
				});
				uni.hideLoading();

				if (result.data) {
					form.videoUrl = result.data;
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: result.error || '上传失败',
						icon: 'none'
					});
				}
			},
			fail: (err) => {
				console.log('用户取消视频选择', err);
			}
		});
	};

	// 视频封面上传 (带剪裁逻辑)
	const handleChooseVideoCover = () => {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];
				// #ifdef MP-WEIXIN
				// 微信小程序调用原生剪裁，保持 4:3 比例 (与商机页一致)
				wx.cropImage({
					src: tempFilePath,
					cropScale: '4:3',
					success: (cropRes) => {
						uploadCoverToCloud(cropRes.tempFilePath);
					}
				});
				// #endif
				// #ifndef MP-WEIXIN
				uploadCoverToCloud(tempFilePath);
				// #endif
			}
		});
	};

	const uploadCoverToCloud = async (filePath) => {
		uni.showLoading({
			title: '封面同步中...'
		});
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'enterprise_cover'
		});
		uni.hideLoading();
		if (result.data) {
			form.videoCoverUrl = result.data; // 注意字段名需与后端对应，通常后端存入 businessCoverImageUrl
			uni.showToast({
				title: '封面设置成功',
				icon: 'none'
			});
		}
	};

	// 3. 删除视频
	const deleteVideo = () => {
		uni.showModal({
			title: '提示',
			content: '确定要删除视频吗？',
			confirmColor: '#ff4d4f',
			success: (res) => {
				if (res.confirm) {
					form.videoUrl = '';
					form.videoCoverUrl = '';
				}
			}
		});
	};

	/**
	 * 地理位置选择
	 */
	const handleChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				// res 包含：name(地点名), address(详细地址), latitude, longitude
				offlineStores.value.push({
					name: res.name,
					address: res.address,
					lat: res.latitude,
					lng: res.longitude
				});
			},
			fail: (err) => {
				console.log('用户取消了位置选择');
			}
		});
	};

	/**
	 * 分步提交逻辑 (保存并继续)
	 */
	const handleStepProcess = async () => {
		if (currentStep.value === 1 && !isEditMode.value) {
			const isVerified = await checkRealName();
			if (!isVerified) {
				// 如果没实名，checkRealName 已经弹过窗了，这里直接 return 终止提交逻辑即可
				return;
			}
		}


		// 序列化复杂数据
		form.brandImages = brandImageList.value.join(',');
		form.offlineStores = JSON.stringify(offlineStores.value);
		form.onlineStores = JSON.stringify(onlineStores.value);

		uni.showLoading({
			title: '同步云端...',
			mask: true
		});

		let res;
		// 判断是更新还是创建
		if (isEditMode.value || enterpriseId.value) {
			res = await Api.update(form);
		} else {
			// 创建模式：不传递 id 字段给后端
			const {
				id,
				...createParams
			} = form;
			res = await Api.create(createParams);
			if (!res.error && res.data) {
				enterpriseId.value = res.data;
				form.id = res.data; // 赋值 ID 供后续步骤使用
			}
		}

		uni.hideLoading();
		if (res.error) return uni.showToast({
			title: res.error,
			icon: 'none'
		});

		// 步数流转或最终发布
		if (currentStep.value < 4) {
			currentStep.value++;
			uni.pageScrollTo({
				scrollTop: 0
			});
		} else {
			executeFinalPublish();
		}
	};

	/**
	 * 最终发布流程
	 */
	const executeFinalPublish = async () => {
		uni.showLoading({
			title: '发布中...'
		});
		const {
			error
		} = await Api.publish(enterpriseId.value || form.id);
		uni.hideLoading();
		if (!error) {
			successPopup.value.open();
		} else {
			uni.showToast({
				title: error,
				icon: 'none'
			});
		}
	};

	// ==========================================
	// 5. 导航跳转
	// ==========================================
	const goCard = () => uni.redirectTo({
		url: `/packages/enterprise-card/enterprise-card?id=${enterpriseId.value || form.id}`
	});
	const goList = () => uni.navigateBack();
</script>


<style scoped lang="scss">
	$theme: #FF8600;
	$bg: #F7F8FA;

	.edit-container {
		background-color: $bg;
		min-height: 100vh;
		padding-bottom: 180rpx;
	}

	/* 步骤条美化 */
	.step-header {
		background: #fff;
		padding: 40rpx 30rpx;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	.step-nav {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		cursor: pointer;
		padding: 10rpx 0;

		&:active {
			opacity: 0.7;
			transform: scale(0.95);
		}

		.node-wrap {
			display: flex;
			align-items: center;
			width: 100%;
			justify-content: center;
			position: relative;

			.node {
				width: 44rpx;
				height: 44rpx;
				border-radius: 50%;
				background: #eee;
				color: #999;
				line-height: 44rpx;
				text-align: center;
				font-size: 24rpx;
				font-weight: bold;
				z-index: 2;
			}

			.line {
				position: absolute;
				right: -50%;
				width: 100%;
				height: 4rpx;
				background: #eee;
				z-index: 1;
			}
		}

		.nav-text {
			font-size: 22rpx;
			color: #999;
			margin-top: 12rpx;
		}

		&.active {
			.node {
				background: $theme;
				color: #fff;
			}

			.line {
				background: $theme;
			}

			.nav-text {
				color: $theme;
				font-weight: bold;
			}
		}
	}

	/* 卡片容器 */
	.form-scroll-view {
		padding: 30rpx;
	}

	.section-card {
		background: #fff;
		border-radius: 30rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	.group-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		position: relative;
		padding-left: 20rpx;
		margin-bottom: 30rpx;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 8rpx;
			height: 32rpx;
			background: $theme;
			border-radius: 4rpx;
		}
	}

	/* 输入控件优化 */
	.custom-input,
	.custom-textarea {
		background-color: #F9F9FA !important;
		border-radius: 12rpx;
	}

	::v-deep .uni-easyinput__content {
		background-color: #F9F9FA !important;
		border: none !important;
	}

	/* 行业选择框加固 */
	.industry-picker-box {
		width: 100%;
		min-height: 90rpx;
		background-color: #F9F9FA;
		border-radius: 12rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.label-txt {
			font-size: 28rpx;
			color: #333;
			flex: 1;
		}

		&.is-placeholder .label-txt {
			color: #999;
		}
	}

	/* 上传组件美化 */
	.logo-uploader {
		width: 180rpx;
		height: 180rpx;
		border: 2rpx dashed #ddd;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		overflow: hidden;
	}

	.bg-uploader {
		width: 100%;
		height: 240rpx;
		background: #F9F9FA;
		border: 2rpx dashed #ddd;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.upload-placeholder {
		font-size: 24rpx;
		color: #999;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
	}

	.logo-preview,
	.bg-preview {
		width: 100%;
		height: 100%;
	}

	/* 社交媒体区域 */
	.social-inner-card {
		background: #F9F9FA;
		padding: 30rpx;
		border-radius: 20rpx;
	}

	.sub-label {
		font-size: 26rpx;
		font-weight: bold;
		color: #666;
		margin-bottom: 16rpx;
	}

	.qr-upload-box {
		width: 200rpx;
		height: 200rpx;
		background: #fff;
		border: 2rpx dashed #eee;
		border-radius: 16rpx;
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		image {
			width: 100%;
			height: 100%;
			border-radius: 16rpx;
		}

		.qr-pl {
			display: flex;
			flex-direction: column;
			align-items: center;
			font-size: 20rpx;
			color: #bbb;
			gap: 4rpx;
		}
	}

	.custom-input-bg {
		background-color: #fff !important;
		/* 在灰色底色卡片中，输入框用白色 */
		border-radius: 8rpx;
	}

	.location-display {
		padding: 10rpx 0;

		.loc-name {
			display: block;
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 6rpx;
		}

		.loc-addr {
			display: block;
			font-size: 24rpx;
			color: #999;
			line-height: 1.4;
		}
	}

	.m-b-10 {
		margin-bottom: 10rpx;
	}

	.m-t-20 {
		margin-top: 20rpx;
	}

	.m-t-30 {
		margin-top: 30rpx;
	}

	.m-t-40 {
		margin-top: 40rpx;
	}

	/* 按钮点击反馈 */
	.add-btn-outline:active {
		background-color: #FFF0E5;
		transform: scale(0.98);
	}

	/* 线上门店卡片 */
	.store-config-card {
		background: #fff;
		border: 2rpx solid #F0F0F0;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;

		.card-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20rpx;
			align-items: center;
		}

		.store-idx {
			font-size: 24rpx;
			color: #999;
			font-weight: bold;
		}
	}

	.add-btn-outline {
		background: #FFF9F5;
		border: 2rpx solid $theme;
		color: $theme;
		font-size: 28rpx;
		font-weight: bold;
		border-radius: 50rpx;
		margin-top: 20rpx;
	}

	.gallery-wrapper {
		width: 100%;
		min-height: 240rpx;
		/* 解决下沉：给个保底高度 */
		overflow: visible;
	}

	.video-manage-section {
		width: 100%;
		margin-top: 20rpx;
	}

	.video-placeholder-btn {
		width: 100%;
		height: 280rpx;
		background-color: #F9F9FA;
		border: 2rpx dashed #ddd;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10rpx;

		text {
			font-size: 28rpx;
			color: #333;
		}

		.sub-tip {
			font-size: 22rpx;
			color: #999;
		}
	}

	.video-active-area {
		display: flex;
		gap: 20rpx;
		height: 260rpx;
	}

	.video-preview-wrap {
		flex: 2;
		position: relative;
		background: #000;
		border-radius: 16rpx;
		overflow: hidden;

		.video-p {
			width: 100%;
			height: 100%;
		}

		.del-video-tag {
			position: absolute;
			top: 0;
			left: 0;
			background: rgba(0, 0, 0, 0.5);
			padding: 6rpx 16rpx;
			border-bottom-right-radius: 16rpx;
			display: flex;
			align-items: center;
			gap: 6rpx;

			text {
				font-size: 20rpx;
				color: #fff;
			}
		}
	}

	.cover-upload-wrap {
		flex: 1;
		position: relative;
		background: #F9F9FA;
		border: 2rpx dashed #eee;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		.cover-img {
			width: 100%;
			height: 100%;
		}

		.cover-pl {
			display: flex;
			flex-direction: column;
			align-items: center;
			font-size: 20rpx;
			color: #999;
		}

		.cover-tag {
			position: absolute;
			bottom: 0;
			width: 100%;
			background: rgba($theme, 0.8);
			color: #fff;
			font-size: 18rpx;
			text-align: center;
			padding: 4rpx 0;
		}
	}

	/* 底部按钮 */
	.footer-btns {
		position: fixed;
		bottom: 0;
		width: 100%;
		background: #fff;
		padding: 30rpx 40rpx 50rpx;
		display: flex;
		gap: 24rpx;
		box-sizing: border-box;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.btn-prev {
		flex: 1;
		background: #F5F5F5;
		color: #666;
		border-radius: 50rpx;
		font-weight: bold;
	}

	.btn-next {
		flex: 2;
		background: linear-gradient(135deg, #FF9D4D, $theme);
		color: #fff;
		border-radius: 50rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 16rpx rgba($theme, 0.2);
	}

	/* 成功弹窗 */
	.success-dialog {
		width: 580rpx;
		background: #fff;
		border-radius: 40rpx;
		padding: 80rpx 50rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.icon-circle {
			width: 120rpx;
			height: 120rpx;
			background: $theme;
			color: #fff;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 60rpx;
			margin-bottom: 30rpx;
		}

		.sd-t {
			font-size: 38rpx;
			font-weight: bold;
			color: #333;
		}

		.sd-c {
			font-size: 26rpx;
			color: #999;
			margin: 20rpx 0 60rpx;
		}

		.sd-btn-main {
			width: 100%;
			background: $theme;
			color: #fff;
			height: 90rpx;
			border-radius: 45rpx;
			margin-bottom: 24rpx;
			font-weight: bold;
		}

		.sd-btn-sub {
			width: 100%;
			background: #F5F5F5;
			color: #666;
			height: 90rpx;
			border-radius: 45rpx;
		}
	}

	.tip-txt {
		font-size: 22rpx;
		color: #bbb;
		display: block;
		margin-top: 16rpx;
	}

	.m-t-10 {
		margin-top: 10rpx;
	}

	.m-t-30 {
		margin-top: 30rpx;
	}

	.m-t-40 {
		margin-top: 40rpx;
	}

	.m-b-10 {
		margin-bottom: 10rpx;
	}

	::v-deep .uni-forms-item__label {
		font-weight: bold !important;
		color: #333 !important;
		margin-bottom: 16rpx !important;
	}

	.enterprise-logo-style {
		border-radius: 16rpx !important;
		/* 区别于品牌Logo的圆形 */
		width: 200rpx !important;
		height: 200rpx !important;
		margin: 0 !important;
		/* 不居中，左对齐更符合表单习惯 */
	}

	.upload-tip {
		font-size: 22rpx;
		color: #999;
		margin-top: 10rpx;
	}
</style>