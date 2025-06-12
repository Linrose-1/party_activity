"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const activeTab = common_vendor.ref("recommend");
    common_vendor.ref("home");
    const posts = common_vendor.reactive([
      {
        id: 1,
        user: "陈总",
        time: "2025-06-15 20:44:34",
        content: "我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统，有意向的可以私信我详谈。",
        tags: ["#技术合作", "#AI开发", "#商务合作"],
        likes: 24,
        dislikes: 3,
        userAction: null,
        // 'like' or 'dislike'
        saved: false
      },
      {
        id: 2,
        user: "李经理",
        time: "2025-06-15 20:44:34",
        content: "刚参加完供应链优化研讨会，获益良多。这次分享几个关于仓储管理的新思路，希望对同行有所帮助。",
        tags: ["#供应链管理", "#仓储物流", "#经验分享"],
        likes: 45,
        dislikes: 2,
        userAction: null,
        saved: false
      },
      {
        id: 3,
        user: "张教授",
        time: "2025-06-15 20:44:34",
        content: "寻找医疗器械领域的投资机会，特别关注创新型医疗设备和AI辅助诊断方向，欢迎推荐优质项目。",
        tags: ["#投资合作", "#医疗健康", "#项目对接"],
        likes: 32,
        dislikes: 5,
        userAction: null,
        saved: false
      }
    ]);
    const toggleAction = (post, action) => {
      if (post.userAction === action) {
        post.userAction = null;
        if (action === "like") {
          post.likes--;
        } else {
          post.dislikes--;
        }
      } else {
        const prevAction = post.userAction;
        post.userAction = action;
        if (action === "like") {
          post.likes++;
          if (prevAction === "dislike") {
            post.dislikes--;
          }
        } else {
          post.dislikes++;
          if (prevAction === "like") {
            post.likes--;
          }
        }
      }
    };
    const sharePost = (post) => {
      common_vendor.index.showToast({
        title: "分享功能即将上线",
        icon: "none"
      });
    };
    const postNew = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-opportunitiesPublish/home-opportunitiesPublish"
      });
    };
    const skipApplicationBusinessCard = () => {
      common_vendor.index.navigateTo({
        url: "/pages/applicationBusinessCard/applicationBusinessCard"
      });
    };
    const skipCommercialDetail = () => {
      common_vendor.index.navigateTo({
        url: "/pages/home-commercialDetail/home-commercialDetail"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: activeTab.value === "recommend" ? 1 : "",
        b: common_vendor.o(($event) => activeTab.value = "recommend"),
        c: activeTab.value === "nearby" ? 1 : "",
        d: common_vendor.o(($event) => activeTab.value = "nearby"),
        e: activeTab.value === "follow" ? 1 : "",
        f: common_vendor.o(($event) => activeTab.value = "follow"),
        g: common_vendor.o(postNew),
        h: common_vendor.f(posts, (post, index, i0) => {
          return {
            a: common_vendor.t(post.user.charAt(0)),
            b: common_vendor.o(skipApplicationBusinessCard, index),
            c: common_vendor.t(post.user),
            d: common_vendor.t(post.time),
            e: common_vendor.t(post.content),
            f: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            g: common_vendor.t(post.likes),
            h: common_vendor.t(post.dislikes),
            i: common_vendor.n(post.userAction === "like" ? "fas fa-thumbs-up" : "far fa-thumbs-up"),
            j: post.userAction === "like" ? 1 : "",
            k: common_vendor.o(($event) => toggleAction(post, "like"), index),
            l: common_vendor.n(post.userAction === "dislike" ? "fas fa-thumbs-down" : "far fa-thumbs-down"),
            m: post.userAction === "dislike" ? 1 : "",
            n: common_vendor.o(($event) => toggleAction(post, "dislike"), index),
            o: common_vendor.n(post.saved ? "fas fa-bookmark" : "far fa-bookmark"),
            p: post.saved ? 1 : "",
            q: common_vendor.o(($event) => post.saved = !post.saved, index),
            r: common_vendor.o(($event) => sharePost(), index),
            s: index,
            t: common_vendor.o(skipCommercialDetail, index)
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
