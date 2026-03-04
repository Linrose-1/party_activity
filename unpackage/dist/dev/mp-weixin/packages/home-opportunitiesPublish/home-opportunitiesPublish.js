"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  (_easycom_uni_data_select2 + _easycom_uni_icons2 + _easycom_DragImageUploader2)();
}
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_DragImageUploader = () => "../../components/DragImageUploader/DragImageUploader.js";
if (!Math) {
  (_easycom_uni_data_select + _easycom_uni_icons + _easycom_DragImageUploader)();
}
const DRAFT_KEY = "post_draft_v2";
const _sfc_main = {
  __name: "home-opportunitiesPublish",
  setup(__props) {
    const form = common_vendor.reactive({
      id: null,
      title: "",
      content: "",
      topic: "商机分享",
      tags: [],
      tagInput: "",
      mediaType: "image",
      images: [],
      postVideo: "",
      businessCoverImageUrl: "",
      showProfile: true,
      isReadTrace: 1,
      isEnterprise: 0,
      // 0-个人, 1-企业
      userEnterpriseId: null,
      // 企业主键ID
      // ===== 猎伙专属字段 =====
      partnerTypes: [],
      // 猎伙类型（多选），提交时转为逗号分隔字符串
      urgentLevel: 1,
      // 紧急程度：1-普通 2-紧急 3-特急
      investmentFund: "",
      // 预期投入-资金范围
      investmentResource: "",
      // 预期投入-资源类型
      investmentEquity: ""
      // 预期投入-股权比例
    });
    const isEditMode = common_vendor.ref(false);
    const myEnterprises = common_vendor.ref([]);
    const tagSuggestions = common_vendor.ref([]);
    let tagSearchTimer = null;
    const quotaBusiness = common_vendor.ref(0);
    const quotaPartner = common_vendor.ref(0);
    const isQuotaLoaded = common_vendor.ref(false);
    const usePointForPublish = common_vendor.ref(false);
    const partnerTypeOptions = [
      {
        value: "1",
        label: "求贤"
      },
      {
        value: "2",
        label: "找合伙人"
      },
      {
        value: "3",
        label: "寻资源"
      },
      {
        value: "4",
        label: "其他"
      }
    ];
    const urgentLevelOptions = [
      {
        value: 1,
        label: "普通",
        colorKey: "normal"
      },
      {
        value: 2,
        label: "紧急",
        colorKey: "urgent"
      },
      {
        value: 3,
        label: "特急",
        colorKey: "super"
      }
    ];
    const contentPlaceholder = common_vendor.computed(() => {
      if (form.topic === "创业猎伙") {
        return "发布寻找创业项目合伙人需求。";
      }
      return "描述您的项目/商机、需求/经验分享。";
    });
    const currentRemainingQuota = common_vendor.computed(() => {
      if (form.topic === "创业猎伙") {
        return quotaPartner.value;
      }
      return quotaBusiness.value;
    });
    common_vendor.onLoad(async (options) => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "发布商机需要登录后才能操作",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/index/index"
              });
            } else {
              common_vendor.index.navigateBack();
            }
          }
        });
        return;
      }
      if (options.id) {
        isEditMode.value = true;
        form.id = options.id;
        common_vendor.index.setNavigationBarTitle({
          title: "编辑商机"
        });
        fetchOpportunityDetail(options.id);
      } else {
        checkDraft();
      }
      if (common_vendor.index.getStorageSync("token")) {
        checkPublishQuota();
        fetchMyEnterprises();
      }
      common_vendor.index.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
      });
    });
    let debounceTimer = null;
    common_vendor.watch(form, (newValue) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        saveDraft(newValue);
      }, 1500);
    }, {
      deep: true
    });
    const saveDraft = (data) => {
      if (data.title || data.content || data.tags.length > 0 || data.images.length > 0) {
        common_vendor.index.setStorageSync(DRAFT_KEY, JSON.stringify(data));
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:407", "📝 草稿已自动保存");
      }
    };
    const checkDraft = () => {
      const draft = common_vendor.index.getStorageSync(DRAFT_KEY);
      if (draft) {
        common_vendor.index.showModal({
          title: "发现未完成的草稿",
          content: "是否恢复上次编辑的内容？",
          confirmText: "恢复",
          cancelText: "放弃",
          success: (res) => {
            if (res.confirm) {
              const draftData = JSON.parse(draft);
              Object.assign(form, draftData);
            } else {
              common_vendor.index.removeStorageSync(DRAFT_KEY);
            }
          }
        });
      }
    };
    const clearDraft = () => {
      common_vendor.index.removeStorageSync(DRAFT_KEY);
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:436", "🧹 草稿已清除");
    };
    const fetchOpportunityDetail = async (id) => {
      common_vendor.index.showLoading({
        title: "正在获取内容..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/business-opportunities/get", {
        method: "GET",
        data: {
          id
        }
      });
      common_vendor.index.hideLoading();
      if (!error && data) {
        form.title = data.postTitle;
        form.content = data.postContent;
        form.topic = data.postType == 1 ? "创业猎伙" : "商机分享";
        form.tags = data.tags || [];
        form.showProfile = data.cardFlag;
        form.isReadTrace = data.isReadTrace;
        form.isEnterprise = data.isEnterprise;
        form.userEnterpriseId = data.userEnterpriseId;
        if (data.postType == 1) {
          form.partnerTypes = data.partnerTypes ? data.partnerTypes.split(",").filter((v) => v) : [];
          form.urgentLevel = data.urgentLevel || 1;
          if (data.expectedInvestment) {
            try {
              const inv = JSON.parse(data.expectedInvestment);
              form.investmentFund = inv["资金范围"] || "";
              form.investmentResource = inv["资源类型"] || "";
              form.investmentEquity = inv["股权比例"] || "";
            } catch (e) {
              common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:483", "解析 expectedInvestment 失败:", e);
            }
          }
        }
        if (data.postVideo) {
          form.mediaType = "video";
          form.postVideo = data.postVideo;
          form.businessCoverImageUrl = data.businessCoverImageUrl;
        } else {
          form.mediaType = "image";
          form.images = data.postImg ? data.postImg.split(",").filter((s) => s) : [];
        }
      }
    };
    const checkPublishQuota = async () => {
      try {
        const [res1, res2] = await Promise.all([
          utils_request.request("/app-api/member/top-up-level-rights/get-remaining", {
            method: "GET",
            data: {
              rightsType: 1
            }
          }),
          utils_request.request("/app-api/member/top-up-level-rights/get-remaining", {
            method: "GET",
            data: {
              rightsType: 2
            }
          })
        ]);
        quotaBusiness.value = typeof res1.data === "number" ? res1.data : 0;
        quotaPartner.value = typeof res2.data === "number" ? res2.data : 0;
        isQuotaLoaded.value = true;
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:523", `权益加载完成: 商机=${quotaBusiness.value}, 猎伙=${quotaPartner.value}`);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:525", "获取权益失败", e);
      }
    };
    const hasLiehuoPermission = () => {
      const userInfo = utils_user.getCachedUserInfo();
      return userInfo && userInfo.topUpLevelId >= 3;
    };
    const fetchPointBalance = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/point-record/get-balance", {
        method: "GET"
      });
      if (!error && typeof data === "number")
        return data;
      return 0;
    };
    const showUpgradeModal = () => {
      common_vendor.index.showModal({
        title: "🚀 解锁高级招募功能",
        content: "升级为「白银会员」，即可发布猎伙，精准招募：核心合伙人、关键人才、稀缺资源",
        cancelText: "消耗智米发布",
        confirmText: "立即升级",
        confirmColor: "#FF6A00",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/packages/recharge/recharge?type=membership"
            });
          } else {
            await handlePointPublishFlow();
          }
        }
      });
    };
    const handlePointPublishFlow = async () => {
      common_vendor.index.showLoading({
        title: "查询智米余额...",
        mask: true
      });
      const balance = await fetchPointBalance();
      common_vendor.index.hideLoading();
      const REQUIRED_POINTS = 20;
      if (balance >= REQUIRED_POINTS) {
        common_vendor.index.showModal({
          title: "确认消耗智米",
          content: `发布猎伙需要消耗 ${REQUIRED_POINTS} 智米，当前余额：${balance} 智米。是否继续？`,
          cancelText: "取消",
          confirmText: "确认发布",
          confirmColor: "#FF6A00",
          success: (res) => {
            if (res.confirm) {
              usePointForPublish.value = true;
              submitPost();
            }
          }
        });
      } else {
        common_vendor.index.showModal({
          title: "💰 智米不足",
          content: `发布猎伙需要消耗 ${REQUIRED_POINTS} 智米。
当前余额：${balance} 智米

请充值后再发布，让优质机会不被错过。`,
          cancelText: "取消",
          confirmText: "立即充值",
          confirmColor: "#FF6A00",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/packages/recharge/recharge?type=point"
              });
            }
          }
        });
      }
    };
    function topicChange(e) {
      const newTopic = e.detail.value;
      if (isEditMode.value)
        return;
      if (newTopic !== "创业猎伙") {
        form.topic = newTopic;
        usePointForPublish.value = false;
        return;
      }
      if (hasLiehuoPermission()) {
        form.topic = newTopic;
      } else {
        form.topic = newTopic;
        showUpgradeModal();
      }
    }
    function togglePartnerType(value) {
      const idx = form.partnerTypes.indexOf(value);
      if (idx === -1) {
        form.partnerTypes.push(value);
      } else {
        form.partnerTypes.splice(idx, 1);
      }
    }
    function selectSuggestion(tagName) {
      if (!tagName)
        return;
      let val = tagName.trim();
      if (!val.startsWith("#"))
        val = "#" + val;
      if (form.tags.length >= 5)
        return common_vendor.index.showToast({
          title: "最多添加5个标签",
          icon: "none"
        });
      if (form.tags.includes(val))
        return common_vendor.index.showToast({
          title: "标签已存在",
          icon: "none"
        });
      form.tags.push(val);
      form.tagInput = "";
      tagSuggestions.value = [];
    }
    function handleAddTagManually() {
      let val = form.tagInput.trim();
      if (!val)
        return common_vendor.index.showToast({
          title: "请输入标签",
          icon: "none"
        });
      if (!val.startsWith("#"))
        val = "#" + val;
      if (form.tags.length >= 5)
        return common_vendor.index.showToast({
          title: "最多添加5个标签",
          icon: "none"
        });
      if (form.tags.includes(val))
        return common_vendor.index.showToast({
          title: "标签已存在",
          icon: "none"
        });
      form.tags.push(val);
      logTagSearch(val, 1);
      form.tagInput = "";
      tagSuggestions.value = [];
    }
    async function logTagSearch(name, type) {
      const tagName = name.startsWith("#") ? name.substring(1) : name;
      try {
        await utils_request.request("/app-api/member/tags-search-history/create", {
          method: "POST",
          data: {
            id: 0,
            name: tagName,
            type
          }
        });
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:735", `标签历史 "${tagName}" 已记录`);
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:737", "记录标签历史失败:", error);
      }
    }
    common_vendor.watch(() => form.tagInput, (newValue) => {
      clearTimeout(tagSearchTimer);
      if (newValue && newValue.trim()) {
        tagSearchTimer = setTimeout(() => {
          fetchTagSuggestions(newValue.trim());
        }, 300);
      } else {
        tagSuggestions.value = [];
      }
    });
    async function fetchTagSuggestions(keyword) {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/tags-search-history/page", {
          method: "GET",
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
        const suggestions = data.list.map((item) => item.name);
        tagSuggestions.value = [...new Set(suggestions)];
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:778", "获取标签建议失败:", e);
        tagSuggestions.value = [];
      }
    }
    function removeTag(index) {
      form.tags.splice(index, 1);
    }
    async function handleChooseImage() {
      if (form.mediaType !== "image")
        form.mediaType = "image";
      common_vendor.index.chooseImage({
        count: 9 - form.images.length,
        sourceType: ["album", "camera"],
        success: async (res) => {
          const validFiles = res.tempFiles.filter((file) => file.size <= 5 * 1024 * 1024);
          if (res.tempFiles.length > validFiles.length) {
            common_vendor.index.showToast({
              title: "部分文件过大(>5MB)，已忽略",
              icon: "none"
            });
          }
          if (validFiles.length === 0)
            return;
          common_vendor.index.showLoading({
            title: `正在上传...`,
            mask: true
          });
          const uploadPromises = validFiles.map((file) => utils_upload.uploadFile(file, {
            directory: "post"
          }));
          const results = await Promise.all(uploadPromises);
          common_vendor.index.hideLoading();
          const successfulUrls = [];
          results.forEach((result) => {
            if (result.data)
              successfulUrls.push(result.data);
            else
              common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:820", "上传失败:", result.error);
          });
          form.images.push(...successfulUrls);
          if (successfulUrls.length < validFiles.length) {
            common_vendor.index.showToast({
              title: "部分图片上传失败",
              icon: "none"
            });
          }
        }
      });
    }
    async function handleChooseVideo() {
      if (form.images.length > 0)
        form.images = [];
      common_vendor.index.chooseVideo({
        sourceType: ["album", "camera"],
        maxDuration: 60,
        compressed: true,
        success: async (res) => {
          form.mediaType = "video";
          const videoFile = {
            path: res.tempFilePath,
            size: res.size
          };
          if (videoFile.size > 50 * 1024 * 1024) {
            form.mediaType = "";
            return common_vendor.index.showToast({
              title: "视频超过50MB",
              icon: "none"
            });
          }
          common_vendor.index.showLoading({
            title: "视频上传中...",
            mask: true
          });
          const result = await utils_upload.uploadFile(videoFile, {
            directory: "post_videos"
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            form.postVideo = result.data;
            common_vendor.index.showToast({
              title: "视频上传成功",
              icon: "success"
            });
          } else {
            form.mediaType = "";
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:931", "取消选择视频");
        }
      });
    }
    function deleteVideo() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这个视频吗？",
        success: (res) => {
          if (res.confirm) {
            form.postVideo = "";
            form.businessCoverImageUrl = "";
            if (form.images.length === 0)
              form.mediaType = "";
          }
        }
      });
    }
    const handleChooseVideoCover = async () => {
      common_vendor.index.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFiles[0].tempFilePath;
          common_vendor.wx$1.cropImage({
            src: tempFilePath,
            cropScale: "4:3",
            success: (cropRes) => {
              common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:965", "裁剪成功:", cropRes.tempFilePath);
              uploadCoverToCloud(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:969", "用户取消裁剪或失败:", err);
            }
          });
        }
      });
    };
    const uploadCoverToCloud = async (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
        directory: "post_covers"
      });
      common_vendor.index.hideLoading();
      if (result.data) {
        form.businessCoverImageUrl = result.data;
        common_vendor.index.showToast({
          title: "封面设置成功",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
      }
    };
    const showQuotaExceededModal = () => {
      const typeName = form.topic === "创业猎伙" ? "创业猎伙" : "商机发布";
      common_vendor.index.showModal({
        title: "发布额度不足",
        content: `您本月的【${typeName}】发布次数已耗尽，升级会员可获取更多额度。`,
        cancelText: "取消",
        confirmText: "升级会员",
        confirmColor: "#FF6A00",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/packages/recharge/recharge?type=membership"
            });
          }
        }
      });
    };
    const handleSubmitClick = () => {
      if (isQuotaLoaded.value && currentRemainingQuota.value == 0) {
        showQuotaExceededModal();
        return;
      }
      if (form.topic === "创业猎伙" && !isEditMode.value && !usePointForPublish.value) {
        if (!hasLiehuoPermission()) {
          showUpgradeModal();
          return;
        }
      }
      submitPost();
    };
    const fetchMyEnterprises = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-enterprise-info/my-list", {
        method: "GET"
      });
      if (!error && data && data.list) {
        myEnterprises.value = data.list.filter((item) => item.status !== 0).map((item) => ({
          text: item.enterpriseName,
          value: item.id
        }));
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:1069", "✅ 可用发布身份企业数:", myEnterprises.value.length);
      }
    };
    const handleIdentityChange = (e) => {
      const val = Number(e.detail.value);
      form.isEnterprise = val;
      if (val === 0) {
        form.userEnterpriseId = null;
      } else if (myEnterprises.value.length === 1) {
        form.userEnterpriseId = myEnterprises.value[0].value;
      }
    };
    const goToCreateEnterprise = () => {
      common_vendor.index.navigateTo({
        url: "/packages/enterprise-list/enterprise-list"
      });
    };
    function submitPost() {
      if (isQuotaLoaded.value && currentRemainingQuota.value == 0) {
        showQuotaExceededModal();
        return;
      }
      if (!form.title.trim() || form.title.length > 100)
        return common_vendor.index.showToast({
          title: "标题不能为空且不能超过100字",
          icon: "none"
        });
      if (form.content.length > 5e3)
        return common_vendor.index.showToast({
          title: "内容不能超过5000字",
          icon: "none"
        });
      if (!form.topic)
        return common_vendor.index.showToast({
          title: "请选择一个专题",
          icon: "none"
        });
      if (form.isEnterprise === 1 && !form.userEnterpriseId)
        return common_vendor.index.showToast({
          title: "请选择要发布的身份企业",
          icon: "none"
        });
      if (form.topic === "创业猎伙") {
        if (form.partnerTypes.length === 0)
          return common_vendor.index.showToast({
            title: "请选择至少一个猎伙类型",
            icon: "none"
          });
        if (!form.urgentLevel)
          return common_vendor.index.showToast({
            title: "请选择紧急程度",
            icon: "none"
          });
      }
      let expectedInvestment = "";
      if (form.topic === "创业猎伙") {
        const inv = {};
        if (form.investmentFund.trim())
          inv["资金范围"] = form.investmentFund.trim();
        if (form.investmentResource.trim())
          inv["资源类型"] = form.investmentResource.trim();
        if (form.investmentEquity.trim())
          inv["股权比例"] = form.investmentEquity.trim();
        if (Object.keys(inv).length > 0)
          expectedInvestment = JSON.stringify(inv);
      }
      const postData = {
        id: form.id,
        userId: common_vendor.index.getStorageSync("userId") || 0,
        postTitle: form.title,
        postType: form.topic === "商机分享" ? "0" : "1",
        postContent: form.content,
        postImg: form.mediaType === "image" ? form.images.join(",") : "",
        postVideo: form.mediaType === "video" ? form.postVideo : "",
        businessCoverImageUrl: form.mediaType === "video" ? form.businessCoverImageUrl : "",
        postedAt: (/* @__PURE__ */ new Date()).toISOString(),
        commentFlag: 1,
        cardFlag: form.showProfile,
        isReadTrace: form.isReadTrace,
        isEnterprise: form.isEnterprise,
        userEnterpriseId: form.userEnterpriseId || 0,
        tags: form.tags,
        status: "active",
        // ===== 猎伙专属字段（非猎伙时不传或传空）=====
        ...form.topic === "创业猎伙" && {
          partnerTypes: form.partnerTypes.join(","),
          urgentLevel: form.urgentLevel,
          expectedInvestment,
          usePointForPublish: usePointForPublish.value
        }
      };
      common_vendor.index.showModal({
        title: isEditMode.value ? "确认修改" : "确认发布",
        content: "请确认您填写的内容无误。",
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
    const createOpportunities = async (postData) => {
      common_vendor.index.showLoading({
        title: "正在发布...",
        mask: true
      });
      const result = await utils_request.request("/app-api/member/business-opportunities/create", {
        method: "POST",
        data: postData
      });
      common_vendor.index.hideLoading();
      if (result.data !== null) {
        clearDraft();
        usePointForPublish.value = false;
        common_vendor.index.showModal({
          title: "发布成功",
          content: "可在【我的】-【我的商机】中查看您发布的商机。",
          showCancel: false,
          confirmText: "知道了",
          success: (res) => {
            if (res.confirm)
              common_vendor.index.navigateBack();
          }
        });
      } else {
        common_vendor.index.showToast({
          title: result.error || "发布失败",
          icon: "none"
        });
      }
    };
    const performUpdate = async (postData) => {
      common_vendor.index.showLoading({
        title: "正在保存修改...",
        mask: true
      });
      const result = await utils_request.request("/app-api/member/business-opportunities/update", {
        method: "PUT",
        data: postData
      });
      common_vendor.index.hideLoading();
      if (!result.error) {
        clearDraft();
        common_vendor.index.showToast({
          title: "修改成功",
          icon: "success"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      } else {
        common_vendor.index.showToast({
          title: result.error || "保存失败",
          icon: "none"
        });
      }
    };
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      let sharePath = "/packages/home-opportunitiesPublish/home-opportunitiesPublish";
      if (inviteCode)
        sharePath += `?inviteCode=${inviteCode}`;
      return {
        title: "发现一个好商机，快来发布你的商业需求！",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      return {
        title: "发现一个好商机，快来发布你的商业需求！",
        query: inviteCode ? `inviteCode=${inviteCode}` : "",
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.title,
        b: common_vendor.o(($event) => form.title = $event.detail.value),
        c: contentPlaceholder.value,
        d: form.content,
        e: common_vendor.o(($event) => form.content = $event.detail.value),
        f: form.isEnterprise === 0,
        g: isEditMode.value,
        h: isEditMode.value ? "#999" : "#333",
        i: form.isEnterprise === 1,
        j: isEditMode.value,
        k: isEditMode.value ? "#999" : "#333",
        l: common_vendor.o(handleIdentityChange),
        m: form.isEnterprise === 1
      }, form.isEnterprise === 1 ? common_vendor.e({
        n: common_vendor.o(($event) => form.userEnterpriseId = $event),
        o: common_vendor.p({
          localdata: myEnterprises.value,
          disabled: isEditMode.value,
          placeholder: "请选择名下的企业",
          modelValue: form.userEnterpriseId
        }),
        p: myEnterprises.value.length === 0 && !isEditMode.value
      }, myEnterprises.value.length === 0 && !isEditMode.value ? {
        q: common_vendor.o(goToCreateEnterprise)
      } : {}) : {}, {
        r: form.topic === "商机分享",
        s: isEditMode.value,
        t: isEditMode.value ? "#999" : "#333",
        v: form.topic === "创业猎伙",
        w: isEditMode.value,
        x: isEditMode.value ? "#999" : "#333",
        y: common_vendor.o(topicChange),
        z: isEditMode.value
      }, isEditMode.value ? {} : {}, {
        A: form.topic === "创业猎伙"
      }, form.topic === "创业猎伙" ? common_vendor.e({
        B: common_vendor.f(partnerTypeOptions, (item, k0, i0) => {
          return common_vendor.e({
            a: form.partnerTypes.includes(item.value)
          }, form.partnerTypes.includes(item.value) ? {} : {}, {
            b: form.partnerTypes.includes(item.value) ? 1 : "",
            c: common_vendor.t(item.label),
            d: item.value,
            e: common_vendor.o(($event) => togglePartnerType(item.value), item.value)
          });
        }),
        C: common_vendor.f(urgentLevelOptions, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: common_vendor.n("urgency-" + item.colorKey),
            d: common_vendor.n({
              "urgency-selected": form.urgentLevel === item.value
            }),
            e: common_vendor.o(($event) => form.urgentLevel = item.value, item.value)
          };
        }),
        D: form.investmentFund,
        E: common_vendor.o(($event) => form.investmentFund = $event.detail.value),
        F: form.investmentResource,
        G: common_vendor.o(($event) => form.investmentResource = $event.detail.value),
        H: form.investmentEquity,
        I: common_vendor.o(($event) => form.investmentEquity = $event.detail.value),
        J: !isEditMode.value && usePointForPublish.value
      }, !isEditMode.value && usePointForPublish.value ? {} : {}) : {}, {
        K: common_vendor.f(form.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTag(index), index),
            c: index
          };
        }),
        L: tagSuggestions.value.length > 0
      }, tagSuggestions.value.length > 0 ? {
        M: common_vendor.f(tagSuggestions.value, (suggestion, index, i0) => {
          return {
            a: common_vendor.t(suggestion),
            b: index,
            c: common_vendor.o(($event) => selectSuggestion(suggestion), index)
          };
        })
      } : {}, {
        N: form.tagInput,
        O: common_vendor.o(($event) => form.tagInput = $event.detail.value),
        P: common_vendor.o(handleAddTagManually),
        Q: form.images.length === 0 && !form.postVideo
      }, form.images.length === 0 && !form.postVideo ? {
        R: common_vendor.p({
          type: "image-filled",
          size: "30",
          color: "#4CAF50"
        }),
        S: common_vendor.o(handleChooseImage),
        T: common_vendor.p({
          type: "videocam-filled",
          size: "30",
          color: "#2196F3"
        }),
        U: common_vendor.o(handleChooseVideo)
      } : {}, {
        V: form.mediaType === "image" && form.images.length > 0
      }, form.mediaType === "image" && form.images.length > 0 ? {
        W: common_vendor.o(handleChooseImage),
        X: common_vendor.o(($event) => form.images = $event),
        Y: common_vendor.p({
          ["max-count"]: 9,
          modelValue: form.images
        })
      } : {}, {
        Z: form.mediaType === "video" && form.postVideo
      }, form.mediaType === "video" && form.postVideo ? common_vendor.e({
        aa: form.postVideo,
        ab: common_vendor.o(deleteVideo),
        ac: form.businessCoverImageUrl
      }, form.businessCoverImageUrl ? {
        ad: form.businessCoverImageUrl
      } : {
        ae: common_vendor.p({
          type: "image",
          size: "24",
          color: "#999"
        })
      }, {
        af: common_vendor.o(handleChooseVideoCover)
      }) : {}, {
        ag: common_vendor.t(form.mediaType === "image" ? "最多可上传9张图片" : "仅支持上传一个视频"),
        ah: form.showProfile,
        ai: common_vendor.o((e) => form.showProfile = e.detail.value),
        aj: form.isReadTrace === 1,
        ak: common_vendor.o((e) => form.isReadTrace = e.detail.value ? 1 : 0),
        al: common_vendor.t(isEditMode.value ? "提交修改" : "发布帖子"),
        am: isQuotaLoaded.value && currentRemainingQuota.value <= 0 && !isEditMode.value ? 1 : "",
        an: common_vendor.o(handleSubmitClick)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4f014bb0"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/home-opportunitiesPublish/home-opportunitiesPublish.js.map
