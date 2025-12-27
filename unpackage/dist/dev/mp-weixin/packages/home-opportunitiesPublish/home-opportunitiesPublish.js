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
const dragColumns = 3;
const dragItemHeightRpx = 230;
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
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:244", "📝 草稿已自动保存");
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
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:270", "🧹 草稿已清除");
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
        common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:358", `标签历史 "${tagName}" 已记录`);
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:360", "记录标签历史失败:", error);
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
        common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:409", "获取标签建议失败:", e);
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
              common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:474", "上传失败:", result.error);
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
    const previewImage = (index) => {
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:490", "当前点击的图片:", form.images[index]);
      if (!form.images || form.images.length === 0)
        return;
      common_vendor.index.previewImage({
        urls: form.images,
        // 预览所有图片
        current: index,
        // 当前显示的图片索引
        loop: true
        // 是否循环预览
      });
    };
    async function handleChooseVideo() {
      form.mediaType = "video";
      form.images = [];
      initDragList([]);
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
            common_vendor.index.__f__("error", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:589", "选择视频失败:", err);
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
            form.mediaType = "";
            form.businessCoverImageUrl = "";
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
            cropScale: "5:4",
            // 【关键】强制 5:4 比例
            success: (cropRes) => {
              common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:625", "裁剪成功:", cropRes.tempFilePath);
              uploadCoverToCloud(cropRes.tempFilePath);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:629", "用户取消裁剪或失败:", err);
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
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:753", `[商机发布页] 分享给好友，获取到邀请码: ${inviteCode}`);
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
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:769", "[商机发布页] 分享给好友的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:779", `[商机发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      const shareContent = {
        title: "发现一个好商机，快来发布你的商业需求！",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
      common_vendor.index.__f__("log", "at packages/home-opportunitiesPublish/home-opportunitiesPublish.vue:794", "[商机发布页] 分享到朋友圈的内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    const deleteImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除？",
        success: (res) => {
          if (res.confirm) {
            form.images.splice(index, 1);
            initDragList(form.images);
            if (form.images.length === 0) {
              form.mediaType = "";
            }
          }
        }
      });
    };
    const dragDisplayList = common_vendor.ref([]);
    const dragItemWidth = common_vendor.ref(0);
    const dragItemHeight = common_vendor.ref(0);
    const dragAreaHeight = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const dragIndex = common_vendor.ref(-1);
    const initDragLayout = () => {
      const sys = common_vendor.index.getSystemInfoSync();
      const containerWidth = sys.windowWidth - common_vendor.index.upx2px(100);
      dragItemWidth.value = containerWidth / dragColumns;
      dragItemHeight.value = common_vendor.index.upx2px(dragItemHeightRpx);
    };
    common_vendor.watch(() => form.images, (newVal) => {
      if (!isDragging.value) {
        initDragList(newVal);
      }
    }, {
      deep: true
    });
    common_vendor.onMounted(() => {
      initDragLayout();
      if (form.images.length > 0)
        initDragList(form.images);
    });
    const initDragList = (originList) => {
      if (!originList)
        return;
      if (dragItemWidth.value === 0)
        initDragLayout();
      dragDisplayList.value = originList.map((url, index) => {
        const {
          x,
          y
        } = getPos(index);
        return {
          id: `img_${index}_${Math.random()}`,
          // 唯一KEY
          data: url,
          x,
          y,
          zIndex: 1,
          realIndex: index
        };
      });
      updateDragHeight();
    };
    const getPos = (index) => {
      const row = Math.floor(index / dragColumns);
      const col = index % dragColumns;
      return {
        x: col * dragItemWidth.value,
        y: row * dragItemHeight.value
      };
    };
    const updateDragHeight = () => {
      const count = dragDisplayList.value.length;
      const rows = Math.ceil(count / dragColumns);
      dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
    };
    const onMovableStart = (index) => {
      isDragging.value = true;
      dragIndex.value = index;
      dragDisplayList.value[index].zIndex = 99;
    };
    const onMovableChange = (e, index) => {
      if (!isDragging.value || index !== dragIndex.value)
        return;
      const x = e.detail.x;
      const y = e.detail.y;
      const centerX = x + dragItemWidth.value / 2;
      const centerY = y + dragItemHeight.value / 2;
      const col = Math.floor(centerX / dragItemWidth.value);
      const row = Math.floor(centerY / dragItemHeight.value);
      let targetIndex = row * dragColumns + col;
      if (targetIndex < 0)
        targetIndex = 0;
      if (targetIndex >= dragDisplayList.value.length)
        targetIndex = dragDisplayList.value.length - 1;
      if (targetIndex !== dragIndex.value) {
        const mover = dragDisplayList.value[dragIndex.value];
        dragDisplayList.value.splice(dragIndex.value, 1);
        dragDisplayList.value.splice(targetIndex, 0, mover);
        dragDisplayList.value.forEach((item, idx) => {
          if (idx !== targetIndex) {
            const pos = getPos(idx);
            item.x = pos.x;
            item.y = pos.y;
          }
        });
        dragIndex.value = targetIndex;
      }
    };
    const onMovableEnd = () => {
      isDragging.value = false;
      if (dragIndex.value !== -1) {
        const item = dragDisplayList.value[dragIndex.value];
        item.zIndex = 1;
        const pos = getPos(dragIndex.value);
        common_vendor.nextTick$1(() => {
          item.x = pos.x;
          item.y = pos.y;
        });
        const sortedUrls = dragDisplayList.value.map((wrapper) => wrapper.data);
        form.images = sortedUrls;
      }
      dragIndex.value = -1;
    };
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
        t: common_vendor.f(dragDisplayList.value, (item, index, i0) => {
          return {
            a: item.data,
            b: common_vendor.o(($event) => previewImage(item.realIndex), item.id),
            c: common_vendor.o(($event) => deleteImage(item.realIndex), item.id),
            d: item.id,
            e: item.x,
            f: item.y,
            g: item.zIndex,
            h: !isDragging.value && item.zIndex === 1,
            i: common_vendor.o(($event) => onMovableChange($event, index), item.id),
            j: common_vendor.o(($event) => onMovableStart(index), item.id),
            k: common_vendor.o(onMovableEnd, item.id)
          };
        }),
        v: dragItemWidth.value + "px",
        w: dragItemHeight.value + "px",
        x: dragAreaHeight.value + "px",
        y: dragAreaHeight.value + "px",
        z: form.mediaType === "image" && form.images.length > 0 && form.images.length < 9
      }, form.mediaType === "image" && form.images.length > 0 && form.images.length < 9 ? {
        A: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        B: common_vendor.o(handleChooseImage)
      } : {}, {
        C: form.images.length === 0 ? 1 : "",
        D: form.mediaType === "video" && form.postVideo
      }, form.mediaType === "video" && form.postVideo ? common_vendor.e({
        E: form.postVideo,
        F: common_vendor.o(deleteVideo),
        G: form.businessCoverImageUrl
      }, form.businessCoverImageUrl ? {
        H: form.businessCoverImageUrl
      } : {
        I: common_vendor.p({
          type: "image",
          size: "24",
          color: "#999"
        })
      }, {
        J: common_vendor.o(handleChooseVideoCover)
      }) : {}, {
        K: common_vendor.t(form.mediaType === "image" ? "最多可上传9张图片" : "仅支持上传一个视频"),
        L: form.showProfile,
        M: common_vendor.o((e) => form.showProfile = e.detail.value),
        N: common_vendor.o(submitPost)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4f014bb0"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/home-opportunitiesPublish/home-opportunitiesPublish.js.map
