"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "home-commercialDetail",
  setup(__props) {
    const likeCount = common_vendor.ref(24);
    const dislikeCount = common_vendor.ref(3);
    const newComment = common_vendor.ref("");
    const contactName = common_vendor.ref("");
    const showModal = common_vendor.ref(false);
    const tags = ["技术合作", "AI开发", "商务合作", "智能客服"];
    const comments = common_vendor.ref([
      { name: "张经理", time: "45分钟前", text: "我们团队有5年AI客服系统开发经验……", likes: 5 },
      { name: "王总监", time: "30分钟前", text: "我们有成熟的NLP技术团队……", likes: 2 },
      { name: "李技术", time: "15分钟前", text: "我们专注语音交互系统，有专利技术……", likes: 1 },
      { name: "赵总", time: "10分钟前", text: "刚完成一个电商客服项目，支持多语言。", likes: 0 }
    ]);
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function showContact(name) {
      contactName.value = name;
      showModal.value = true;
    }
    function closeContact() {
      showModal.value = false;
    }
    function addComment() {
      if (!newComment.value.trim())
        return;
      comments.value.unshift({
        name: "新用户",
        time: "刚刚",
        text: newComment.value,
        likes: 0
      });
      newComment.value = "";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(($event) => showContact("陈总")),
        c: common_vendor.f(tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        d: common_vendor.t(likeCount.value),
        e: common_vendor.o(($event) => likeCount.value++),
        f: common_vendor.t(dislikeCount.value),
        g: common_vendor.o(($event) => dislikeCount.value++),
        h: common_vendor.t(comments.value.length),
        i: common_vendor.f(comments.value, (comment, index, i0) => {
          return {
            a: common_vendor.t(comment.name.charAt(0)),
            b: common_vendor.o(($event) => showContact(comment.name), index),
            c: common_vendor.t(comment.name),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.text),
            f: common_vendor.t(comment.likes),
            g: common_vendor.o(($event) => comment.likes++, index),
            h: index
          };
        }),
        j: newComment.value,
        k: common_vendor.o(($event) => newComment.value = $event.detail.value),
        l: common_vendor.o(addComment),
        m: showModal.value
      }, showModal.value ? {
        n: common_vendor.t(contactName.value.charAt(0)),
        o: common_vendor.t(contactName.value),
        p: common_vendor.t(contactName.value.toLowerCase()),
        q: common_vendor.o(closeContact),
        r: common_vendor.o(closeContact)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-361e9b2c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-commercialDetail/home-commercialDetail.js.map
