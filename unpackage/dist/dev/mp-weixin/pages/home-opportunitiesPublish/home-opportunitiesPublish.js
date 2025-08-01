"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const _sfc_main = {
  __name: "home-opportunitiesPublish",
  setup(__props) {
    const title = common_vendor.ref("商机标题");
    const content = common_vendor.ref("商机内容商机内容商机内容商机内容商机内容商机内容商机内容商机内容商机内容");
    const topic = common_vendor.ref("普通商机");
    const tags = common_vendor.ref([]);
    const tagInput = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const showProfile = common_vendor.ref(true);
    const allowComments = common_vendor.ref(true);
    function topicChange(e) {
      topic.value = e.detail.value;
    }
    function addTag() {
      let val = tagInput.value.trim();
      if (!val)
        return common_vendor.index.showToast({
          title: "请输入标签",
          icon: "none"
        });
      if (tags.value.length >= 5)
        return common_vendor.index.showToast({
          title: "最多添加5个标签",
          icon: "none"
        });
      if (!val.startsWith("#"))
        val = "#" + val;
      if (tags.value.includes(val))
        return common_vendor.index.showToast({
          title: "标签已存在",
          icon: "none"
        });
      tags.value.push(val);
      tagInput.value = "";
    }
    function removeTag(index) {
      tags.value.splice(index, 1);
    }
    async function handleChooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - images.value.length,
        sourceType: ["album", "camera"],
        success: async (res) => {
          const filesToUpload = res.tempFiles;
          const validFiles = filesToUpload.filter((file) => {
            if (file.size > 5 * 1024 * 1024) {
              common_vendor.index.showToast({
                title: `文件 ${file.name || ""} 过大，已忽略`,
                icon: "none"
              });
              return false;
            }
            return true;
          });
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
          let failedCount = 0;
          results.forEach((result) => {
            if (result.data) {
              successfulUrls.push(result.data);
            } else {
              failedCount++;
              common_vendor.index.__f__("error", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:175", "上传失败:", result.error);
            }
          });
          images.value = images.value.concat(successfulUrls);
          if (failedCount > 0) {
            common_vendor.index.showToast({
              title: `${failedCount} 张图片上传失败`,
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
          if (file.size > 5 * 1024 * 1024) {
            return common_vendor.index.showToast({
              title: "文件大小不能超过5MB",
              icon: "none"
            });
          }
          common_vendor.index.showLoading({
            title: "正在替换...",
            mask: true
          });
          const result = await utils_upload.uploadFile(file, {
            directory: "post"
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            images.value[index] = result.data;
            common_vendor.index.showToast({
              title: "图片已替换",
              icon: "none"
            });
          } else {
            common_vendor.index.showToast({
              title: result.error,
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
            images.value.splice(index, 1);
          }
        }
      });
    }
    function submitPost() {
      if (!title.value.trim() || title.value.length > 50)
        return common_vendor.index.showToast({
          title: "请检查标题",
          icon: "none"
        });
      if (!content.value.trim() || content.value.length < 20)
        return common_vendor.index.showToast({
          title: "内容不能少于20字",
          icon: "none"
        });
      if (!topic.value)
        return common_vendor.index.showToast({
          title: "请选择一个专题",
          icon: "none"
        });
      const postData = {
        userId: 247,
        postTitle: title.value,
        postType: topic.value === "普通商机" ? "0" : "1",
        postContent: content.value,
        postImg: images.value.join(","),
        postedAt: (/* @__PURE__ */ new Date()).toISOString(),
        commentFlag: allowComments.value,
        cardFlag: showProfile.value,
        tags: tags.value,
        status: "active"
      };
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:281", "--- 准备提交到后端的帖子数据 (图片已是URL) ---", postData);
      createOpportunities(postData);
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
        common_vendor.index.showToast({
          title: "发布成功！",
          icon: "success"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      } else {
        common_vendor.index.showToast({
          title: result.error || "发布失败",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: title.value,
        b: common_vendor.o(($event) => title.value = $event.detail.value),
        c: content.value,
        d: common_vendor.o(($event) => content.value = $event.detail.value),
        e: topic.value === "普通商机",
        f: topic.value === "创业猎伙",
        g: common_vendor.o(topicChange),
        h: common_vendor.f(tags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTag(index), index),
            c: index
          };
        }),
        i: tagInput.value,
        j: common_vendor.o(($event) => tagInput.value = $event.detail.value),
        k: common_vendor.o(addTag),
        l: common_vendor.f(images.value, (img, i, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => replaceImage(i), i),
            c: common_vendor.o(($event) => deleteImage(i), i),
            d: i
          };
        }),
        m: images.value.length < 9
      }, images.value.length < 9 ? {
        n: common_vendor.o(handleChooseImage)
      } : {}, {
        o: showProfile.value,
        p: common_vendor.o((e) => showProfile.value = e.detail.value),
        q: allowComments.value,
        r: common_vendor.o((e) => allowComments.value = e.detail.value),
        s: common_vendor.o(submitPost)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-90e28424"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-opportunitiesPublish/home-opportunitiesPublish.js.map
