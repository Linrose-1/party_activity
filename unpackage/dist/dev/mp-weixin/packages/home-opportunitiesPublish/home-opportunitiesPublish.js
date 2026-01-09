"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  (_easycom_uni_icons2 + _easycom_DragImageUploader2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_DragImageUploader = () => "../../components/DragImageUploader/DragImageUploader.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_DragImageUploader)();
}
const DRAFT_KEY = "post_draft_v2";
const _sfc_main = {
  __name: "home-opportunitiesPublish",
  setup(__props) {
    const form = common_vendor.reactive({
      title: "",
      content: "",
      topic: "商机分享",
      tags: [],
      tagInput: "",
      mediaType: "image",
      images: [],
      postVideo: "",
      businessCoverImageUrl: "",
      showProfile: true
    });
    const tagSuggestions = common_vendor.ref([]);
    let tagSearchTimer = null;
    const quotaBusiness = common_vendor.ref(0);
    const quotaPartner = common_vendor.ref(0);
    const isQuotaLoaded = common_vendor.ref(false);
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
    common_vendor.onLoad(() => {
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
      if (common_vendor.index.getStorageSync("token")) {
        checkPublishQuota();
      }
      checkDraft();
      common_vendor.index.showShareMenu({
        withShareTicket: true,
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
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:228", "📝 草稿已自动保存");
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
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:254", "🧹 草稿已清除");
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
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:281", `权益加载完成: 商机=${quotaBusiness.value}, 猎伙=${quotaPartner.value}`);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:284", "获取权益失败", e);
      }
    };
    function topicChange(e) {
      form.topic = e.detail.value;
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
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:373", `标签历史 "${tagName}" 已记录`);
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:375", "记录标签历史失败:", error);
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
            // 只搜索商机相关的历史标签
          }
        });
        if (error || !data || !data.list) {
          tagSuggestions.value = [];
          return;
        }
        const suggestions = data.list.map((item) => item.name);
        tagSuggestions.value = [...new Set(suggestions)];
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:424", "获取标签建议失败:", e);
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
              common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:495", "上传失败:", result.error);
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
      if (form.images.length > 0) {
        form.images = [];
      }
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
          common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:618", "取消选择视频");
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
            if (form.images.length === 0) {
              form.mediaType = "";
            }
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
            // 【关键】强制 4:3 比例
            success: (cropRes) => {
              common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:655", "裁剪成功:", cropRes.tempFilePath);
              uploadCoverToCloud(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:659", "用户取消裁剪或失败:", err);
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
              url: "/pages/recharge/recharge?type=membership"
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
      submitPost();
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
      const postData = {
        userId: common_vendor.index.getStorageSync("userId") || 0,
        // 从缓存获取 userId
        postTitle: form.title,
        postType: form.topic === "商机分享" ? "0" : "1",
        postContent: form.content,
        postImg: form.mediaType === "image" ? form.images.join(",") : "",
        postVideo: form.mediaType === "video" ? form.postVideo : "",
        businessCoverImageUrl: form.mediaType === "video" ? form.businessCoverImageUrl : "",
        postedAt: (/* @__PURE__ */ new Date()).toISOString(),
        commentFlag: 1,
        cardFlag: form.showProfile,
        tags: form.tags,
        status: "active"
      };
      common_vendor.index.showModal({
        title: "确认发布",
        content: "请确认您填写的内容无误。",
        success: (res) => {
          if (res.confirm) {
            createOpportunities(postData);
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
        common_vendor.index.showModal({
          title: "发布成功",
          content: "可在【我的】-【我的商机】中查看您发布的商机。",
          showCancel: false,
          confirmText: "知道了",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateBack();
            }
          }
        });
      } else {
        common_vendor.index.showToast({
          title: result.error || "发布失败",
          icon: "none"
        });
      }
    };
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:816", `[商机发布页] 分享给好友，获取到邀请码: ${inviteCode}`);
      let sharePath = "/packages/home-opportunitiesPublish/home-opportunitiesPublish";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个好商机，快来发布你的商业需求！",
        path: sharePath,
        // 建议使用一个固定的、吸引人的分享图片
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:832", "[商机发布页] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:842", `[商机发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个好商机，快来发布你的商业需求！",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:857", "[商机发布页] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.title,
        b: common_vendor.o(($event) => form.title = $event.detail.value),
        c: contentPlaceholder.value,
        d: form.content,
        e: common_vendor.o(($event) => form.content = $event.detail.value),
        f: form.topic === "商机分享",
        g: form.topic === "创业猎伙",
        h: common_vendor.o(topicChange),
        i: common_vendor.f(form.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTag(index), index),
            c: index
          };
        }),
        j: tagSuggestions.value.length > 0
      }, tagSuggestions.value.length > 0 ? {
        k: common_vendor.f(tagSuggestions.value, (suggestion, index, i0) => {
          return {
            a: common_vendor.t(suggestion),
            b: index,
            c: common_vendor.o(($event) => selectSuggestion(suggestion), index)
          };
        })
      } : {}, {
        l: form.tagInput,
        m: common_vendor.o(($event) => form.tagInput = $event.detail.value),
        n: common_vendor.o(handleAddTagManually),
        o: form.images.length === 0 && !form.postVideo
      }, form.images.length === 0 && !form.postVideo ? {
        p: common_vendor.p({
          type: "image-filled",
          size: "30",
          color: "#4CAF50"
        }),
        q: common_vendor.o(handleChooseImage),
        r: common_vendor.p({
          type: "videocam-filled",
          size: "30",
          color: "#2196F3"
        }),
        s: common_vendor.o(handleChooseVideo)
      } : {}, {
        t: form.mediaType === "image" && form.images.length > 0
      }, form.mediaType === "image" && form.images.length > 0 ? {
        v: common_vendor.o(handleChooseImage),
        w: common_vendor.o(($event) => form.images = $event),
        x: common_vendor.p({
          ["max-count"]: 9,
          modelValue: form.images
        })
      } : {}, {
        y: form.mediaType === "video" && form.postVideo
      }, form.mediaType === "video" && form.postVideo ? common_vendor.e({
        z: form.postVideo,
        A: common_vendor.o(deleteVideo),
        B: form.businessCoverImageUrl
      }, form.businessCoverImageUrl ? {
        C: form.businessCoverImageUrl
      } : {
        D: common_vendor.p({
          type: "image",
          size: "24",
          color: "#999"
        })
      }, {
        E: common_vendor.o(handleChooseVideoCover)
      }) : {}, {
        F: common_vendor.t(form.mediaType === "image" ? "最多可上传9张图片" : "仅支持上传一个视频"),
        G: form.showProfile,
        H: common_vendor.o((e) => form.showProfile = e.detail.value),
        I: isQuotaLoaded.value && currentRemainingQuota.value <= 0 ? 1 : "",
        J: common_vendor.o(handleSubmitClick)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4f014bb0"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/home-opportunitiesPublish/home-opportunitiesPublish.js.map
