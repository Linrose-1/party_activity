"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "home-commercialDetail",
  setup(__props) {
    const isLoading = common_vendor.ref(true);
    const postId = common_vendor.ref(null);
    const postDetail = common_vendor.reactive({
      id: null,
      user: "",
      // 用户名先置空
      userId: null,
      time: "",
      content: "",
      images: [],
      tags: [],
      likes: 0,
      dislikes: 0,
      userAction: null,
      saved: false
    });
    function formatTimestamp(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    }
    common_vendor.onLoad((options) => {
      if (options && options.id) {
        postId.value = options.id;
        getBusinessOpportunitiesDetail();
      } else {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:160", "未接收到商机ID");
        common_vendor.index.showToast({ title: "加载失败，无效的商机", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    const getBusinessOpportunitiesDetail = async () => {
      isLoading.value = true;
      try {
        const result = await utils_request.request("/app-api/member/business-opportunities/get", {
          method: "GET",
          data: { id: postId.value }
        });
        common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:175", "getBusinessOpportunitiesDetail result:", result);
        if (result && !result.error && result.data) {
          const item = result.data;
          postDetail.id = item.id;
          postDetail.content = item.postContent;
          postDetail.images = item.postImg ? String(item.postImg).split(",").filter((img) => img) : [];
          try {
            const parsedTags = JSON.parse(item.tags || "[]");
            postDetail.tags = Array.isArray(parsedTags) ? parsedTags : item.tags ? String(item.tags).split(",") : [];
          } catch (e) {
            postDetail.tags = item.tags ? String(item.tags).split(",") : [];
          }
          postDetail.likes = item.likesCount || 0;
          postDetail.dislikes = item.dislikesCount || 0;
          postDetail.userAction = item.userLikeStr || null;
          postDetail.saved = item.followFlag === 1;
          postDetail.time = formatTimestamp(item.createTime);
          postDetail.user = item.contactPerson || "匿名用户";
          postDetail.userId = item.userId;
        } else {
          const errorMsg = result && result.error ? result.error.message : "获取详情失败";
          common_vendor.index.showToast({ title: errorMsg, icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home-commercialDetail/home-commercialDetail.vue:229", "获取商机详情失败:", error);
        common_vendor.index.showToast({ title: "网络请求异常", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const comments = common_vendor.reactive([
      {
        id: 1,
        user: "张经理",
        time: "45分钟前",
        text: "我们团队有5年AI客服系统开发经验，已完成多个金融行业智能客服项目。已私信您联系方式，期待进一步沟通！",
        likes: 5,
        userAction: null,
        contact: {
          phone: "139 **** 1234",
          email: "zhang@example.com",
          company: "智联科技"
        }
      },
      {
        id: 2,
        user: "王总监",
        time: "30分钟前",
        text: "您好，我们有成熟的NLP技术团队，开发过多个智能客服系统。能否提供更具体的需求文档？谢谢！",
        likes: 2,
        userAction: null,
        contact: {
          phone: "137 **** 5678",
          email: "wang@example.com",
          company: "未来智能"
        }
      },
      {
        id: 3,
        user: "李技术",
        time: "15分钟前",
        text: "我们专注于AI语音交互系统，有自有专利技术，可以显著提升客服效率。已发送公司介绍到私信，请查收。",
        likes: 1,
        userAction: null,
        contact: {
          phone: "136 **** 9012",
          email: "li@example.com",
          company: "声学智能"
        }
      },
      {
        id: 4,
        user: "赵总",
        time: "10分钟前",
        text: "我们公司刚完成一个电商智能客服项目，支持多语言处理。已私信您案例演示链接，欢迎查看。",
        likes: 0,
        userAction: null,
        contact: {
          phone: "135 **** 3456",
          email: "zhao@example.com",
          company: "电商通"
        }
      }
    ]);
    const newCommentText = common_vendor.ref("");
    const toggleAction = (item, action) => {
      if (item.userAction === action) {
        item.userAction = null;
        if (action === "like") {
          item.likes--;
        } else {
          item.dislikes--;
        }
      } else {
        const prevAction = item.userAction;
        item.userAction = action;
        if (action === "like") {
          item.likes++;
          if (prevAction === "dislike") {
            item.dislikes--;
          }
        } else {
          item.dislikes++;
          if (prevAction === "like") {
            item.likes--;
          }
        }
      }
    };
    const toggleBookmark = (post) => {
      post.saved = !post.saved;
      common_vendor.index.showToast({
        title: post.saved ? "已收藏" : "已取消收藏",
        icon: "none"
      });
    };
    const shareOpportunity = () => {
      common_vendor.index.showToast({
        title: "分享功能即将上线",
        icon: "none"
      });
    };
    const replyComment = (comment) => {
      common_vendor.index.showToast({
        title: `回复 ${comment.user}: 功能待完善`,
        icon: "none"
      });
      newCommentText.value = `@${comment.user} `;
    };
    const addComment = () => {
      const text = newCommentText.value.trim();
      if (text) {
        const newId = comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;
        comments.unshift({
          id: newId,
          user: "当前用户",
          // 实际应为登录用户
          time: "刚刚",
          text,
          likes: 0,
          userAction: null,
          contact: {
            phone: "188 **** 8888",
            email: "current@example.com"
          }
          // 模拟当前用户联系方式
        });
        newCommentText.value = "";
        common_vendor.index.showToast({
          title: "评论成功",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
      }
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current],
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function(data) {
            common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:434", "选中了第" + (data.tapIndex + 1) + "个按钮，第" + (data.index + 1) + "张图片");
          },
          fail: function(err) {
            common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:437", err.errMsg);
          }
        }
      });
    };
    const navigateToBusinessCard = (userId) => {
      if (!userId) {
        common_vendor.index.__f__("warn", "at pages/home-commercialDetail/home-commercialDetail.vue:449", "navigateToBusinessCard: userId is missing.");
        common_vendor.index.showToast({
          title: "无法查看该用户主页",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/applicationBusinessCard/applicationBusinessCard?userId=${userId}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(postDetail.user.charAt(0)),
        b: common_vendor.o(($event) => navigateToBusinessCard(postDetail.userId)),
        c: common_vendor.t(postDetail.user),
        d: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        e: common_vendor.t(postDetail.time),
        f: common_vendor.t(postDetail.content),
        g: postDetail.images && postDetail.images.length
      }, postDetail.images && postDetail.images.length ? {
        h: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex),
            c: imgIndex
          };
        })
      } : {}, {
        i: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        j: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        k: common_vendor.t(postDetail.likes),
        l: postDetail.userAction === "like" ? 1 : "",
        m: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        n: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        o: common_vendor.t(postDetail.dislikes),
        p: postDetail.userAction === "dislike" ? 1 : "",
        q: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        r: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        s: common_vendor.o(shareOpportunity),
        t: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        v: postDetail.saved ? 1 : "",
        w: common_vendor.o(($event) => toggleBookmark(postDetail)),
        x: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        y: common_vendor.t(comments.length),
        z: common_vendor.f(comments, (comment, k0, i0) => {
          return {
            a: common_vendor.t(comment.user.charAt(0)),
            b: common_vendor.o(($event) => navigateToBusinessCard(comment.userId), comment.id),
            c: common_vendor.t(comment.user),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.text),
            f: "361e9b2c-6-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: comment.id
          };
        }),
        A: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        B: comments.length === 0
      }, comments.length === 0 ? {} : {}, {
        C: common_vendor.o(addComment),
        D: newCommentText.value,
        E: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        F: common_vendor.o(addComment)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-361e9b2c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-commercialDetail/home-commercialDetail.js.map
