"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "home-opportunitiesPublish",
  setup(__props) {
    const title = common_vendor.ref("");
    const content = common_vendor.ref("");
    const tags = common_vendor.ref([]);
    const tagInput = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const showProfile = common_vendor.ref(true);
    const allowComments = common_vendor.ref(true);
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
        count: 6 - images.value.length,
        success: (res) => {
          images.value = images.value.concat(res.tempFilePaths);
        }
      });
    }
    function submitPost() {
      if (!title.value)
        return common_vendor.index.showToast({ title: "请输入标题", icon: "none" });
      if (title.value.length > 50)
        return common_vendor.index.showToast({ title: "标题不能超过50字", icon: "none" });
      if (!content.value || content.value.length < 20)
        return common_vendor.index.showToast({ title: "内容不能少于20字", icon: "none" });
      if (tags.value.length === 0)
        return common_vendor.index.showToast({ title: "请至少添加一个标签", icon: "none" });
      common_vendor.index.showToast({
        title: "发布成功",
        icon: "success"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: title.value,
        b: common_vendor.o(($event) => title.value = $event.detail.value),
        c: content.value,
        d: common_vendor.o(($event) => content.value = $event.detail.value),
        e: common_vendor.f(tags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTag(index), index),
            c: index
          };
        }),
        f: tagInput.value,
        g: common_vendor.o(($event) => tagInput.value = $event.detail.value),
        h: common_vendor.o(addTag),
        i: common_vendor.f(images.value, (img, i, i0) => {
          return {
            a: i,
            b: img
          };
        }),
        j: common_vendor.o(handleChooseImage),
        k: images.value.length >= 6,
        l: showProfile.value,
        m: common_vendor.o((e) => showProfile.value = e.detail.value),
        n: allowComments.value,
        o: common_vendor.o((e) => allowComments.value = e.detail.value),
        p: common_vendor.o(submitPost)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-90e28424"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-opportunitiesPublish/home-opportunitiesPublish.js.map
