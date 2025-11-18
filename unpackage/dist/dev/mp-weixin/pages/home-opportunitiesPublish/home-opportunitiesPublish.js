"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const DRAFT_KEY = "post_draft_v2";
const _sfc_main = {
  __name: "home-opportunitiesPublish",
  setup(__props) {
    const form = common_vendor.reactive({
      title: "",
      content: "",
      topic: "普通商机",
      tags: [],
      tagInput: "",
      mediaType: "image",
      images: [],
      postVideo: "",
      showProfile: true
    });
    const tagSuggestions = common_vendor.ref([]);
    let tagSearchTimer = null;
    const contentPlaceholder = common_vendor.computed(() => {
      if (form.topic === "创业猎伙") {
        return "发布寻找创业项目合伙人需求。";
      }
      return "描述您的项目/商机、需求/经验分享。";
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
        common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:195", "📝 草稿已自动保存");
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
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:221", "🧹 草稿已清除");
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
        common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:334", `标签历史 "${tagName}" 已记录`);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:336", "记录标签历史失败:", error);
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
        common_vendor.index.__f__("error", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:385", "获取标签建议失败:", e);
        tagSuggestions.value = [];
      }
    }
    function removeTag(index) {
      form.tags.splice(index, 1);
    }
    async function handleChooseImage() {
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
            title: `正在上传 ${validFiles.length} 张图片...`,
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
              common_vendor.index.__f__("error", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:450", "上传失败:", result.error);
          });
          form.images.push(...successfulUrls);
          if (successfulUrls.length < validFiles.length) {
            common_vendor.index.showToast({
              title: `${validFiles.length - successfulUrls.length} 张图片上传失败`,
              icon: "none"
            });
          }
        }
      });
    }
    function replaceImage(index) {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const file = res.tempFiles[0];
          if (file.size > 5 * 1024 * 1024)
            return common_vendor.index.showToast({
              title: "文件大小不能超过5MB",
              icon: "none"
            });
          common_vendor.index.showLoading({
            title: "正在替换...",
            mask: true
          });
          const result = await utils_upload.uploadFile(file, {
            directory: "post"
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            form.images[index] = result.data;
            common_vendor.index.showToast({
              title: "图片已替换",
              icon: "none"
            });
          } else {
            common_vendor.index.showToast({
              title: result.error || "替换失败",
              icon: "error"
            });
          }
        }
      });
    }
    function deleteImage(index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            form.images.splice(index, 1);
          }
        }
      });
    }
    async function handleChooseVideo() {
      form.mediaType = "video";
      common_vendor.index.chooseVideo({
        sourceType: ["album", "camera"],
        maxDuration: 60,
        // 限制最长60秒
        compressed: true,
        // 建议压缩
        success: async (res) => {
          const videoFile = {
            path: res.tempFilePath,
            size: res.size,
            name: res.tempFilePath.substring(res.tempFilePath.lastIndexOf("/") + 1)
          };
          if (videoFile.size > 50 * 1024 * 1024) {
            return common_vendor.index.showToast({
              title: "视频大小不能超过50MB",
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
            common_vendor.index.showToast({
              title: result.error || "视频上传失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          if (err.errMsg.indexOf("cancel") === -1) {
            common_vendor.index.__f__("error", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:563", "选择视频失败:", err);
          }
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
          }
        }
      });
    }
    function submitPost() {
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
        postType: form.topic === "普通商机" ? "0" : "1",
        postContent: form.content,
        postImg: form.mediaType === "image" ? form.images.join(",") : "",
        postVideo: form.mediaType === "video" ? form.postVideo : "",
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
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:659", `[商机发布页] 分享给好友，获取到邀请码: ${inviteCode}`);
      let sharePath = "/pages/home-opportunitiesPublish/home-opportunitiesPublish";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个好商机，快来发布你的商业需求！",
        path: sharePath,
        // 建议使用一个固定的、吸引人的分享图片
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:675", "[商机发布页] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:685", `[商机发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个好商机，快来发布你的商业需求！",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:700", "[商机发布页] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.title,
        b: common_vendor.o(($event) => form.title = $event.detail.value),
        c: contentPlaceholder.value,
        d: form.content,
        e: common_vendor.o(($event) => form.content = $event.detail.value),
        f: form.topic === "普通商机",
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
      } : form.mediaType === "image" ? common_vendor.e({
        v: common_vendor.f(form.images, (img, i, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => replaceImage(i), i),
            c: common_vendor.o(($event) => deleteImage(i), i),
            d: i
          };
        }),
        w: form.images.length < 9
      }, form.images.length < 9 ? {
        x: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        y: common_vendor.o(handleChooseImage)
      } : {}) : form.mediaType === "video" && form.postVideo ? {
        A: form.postVideo,
        B: common_vendor.o(deleteVideo)
      } : {}, {
        t: form.mediaType === "image",
        z: form.mediaType === "video" && form.postVideo,
        C: common_vendor.t(form.mediaType === "image" ? "最多可上传9张图片" : "仅支持上传一个视频"),
        D: form.showProfile,
        E: common_vendor.o((e) => form.showProfile = e.detail.value),
        F: common_vendor.o(submitPost)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-90e28424"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-opportunitiesPublish/home-opportunitiesPublish.js.map
