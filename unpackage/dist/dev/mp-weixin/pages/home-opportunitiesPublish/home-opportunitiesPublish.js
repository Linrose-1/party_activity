"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "home-opportunitiesPublish",
  setup(__props) {
    const title = common_vendor.ref("");
    const content = common_vendor.ref("");
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
        return common_vendor.index.showToast({ title: "请输入标签", icon: "none" });
      if (tags.value.length >= 5)
        return common_vendor.index.showToast({ title: "最多添加5个标签", icon: "none" });
      if (!val.startsWith("#"))
        val = "#" + val;
      if (tags.value.includes(val))
        return common_vendor.index.showToast({ title: "标签已存在", icon: "none" });
      tags.value.push(val);
      tagInput.value = "";
    }
    function removeTag(index) {
      tags.value.splice(index, 1);
    }
    function handleChooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - images.value.length,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          images.value = images.value.concat(res.tempFilePaths);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:126", "取消选择图片", err);
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
            common_vendor.index.showToast({ title: "图片已删除", icon: "none" });
          }
        }
      });
    }
    function replaceImage(index) {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          images.value[index] = res.tempFilePaths[0];
          common_vendor.index.showToast({ title: "图片已替换", icon: "none" });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:154", "取消替换图片", err);
        }
      });
    }
    function submitPost() {
      if (!title.value.trim())
        return common_vendor.index.showToast({ title: "请输入帖子标题", icon: "none" });
      if (title.value.length > 50)
        return common_vendor.index.showToast({ title: "标题不能超过50字", icon: "none" });
      if (!content.value.trim() || content.value.length < 20)
        return common_vendor.index.showToast({ title: "内容不能少于20字", icon: "none" });
      if (!topic.value)
        return common_vendor.index.showToast({ title: "请选择一个专题", icon: "none" });
      if (tags.value.length === 0)
        return common_vendor.index.showToast({ title: "请至少添加一个标签", icon: "none" });
      const postData = {
        title: title.value,
        content: content.value,
        topic: topic.value,
        tags: tags.value,
        images: images.value,
        settings: {
          showProfile: showProfile.value,
          allowComments: allowComments.value
        }
      };
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:182", "--- 准备发布的帖子表单数据 ---");
      common_vendor.index.__f__("log", "at pages/home-opportunitiesPublish/home-opportunitiesPublish.vue:183", postData);
      common_vendor.index.showToast({
        title: "发布成功",
        icon: "success"
      });
    }
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
