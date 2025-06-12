"use strict";
const common_vendor = require("../../common/vendor.js");
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
    const postDetail = common_vendor.reactive({
      id: 1,
      user: "陈总",
      time: "1小时前",
      content: "我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统。要求具备自然语言处理和机器学习经验，有相关行业解决方案的团队优先。项目周期预计6个月，预算面议。期待与有实力的团队合作，共同打造行业领先的智能客服解决方案。",
      images: [
        "https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图1",
        "https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图2",
        "https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图3",
        "https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图4"
      ],
      tags: ["#技术合作", "#AI开发", "#商务合作", "#智能客服"],
      likes: 24,
      dislikes: 3,
      userAction: null,
      // 'like' or 'dislike'
      saved: false,
      contact: {
        // 模拟联系方式
        phone: "138 **** 5678",
        email: "chenzong@example.com",
        company: "创新科技有限公司",
        address: "上海市浦东新区",
        website: "www.innotech-ai.com"
      }
    });
    const comments = common_vendor.reactive([
      {
        id: 1,
        user: "张经理",
        time: "45分钟前",
        text: "我们团队有5年AI客服系统开发经验，已完成多个金融行业智能客服项目。已私信您联系方式，期待进一步沟通！",
        likes: 5,
        userAction: null,
        contact: { phone: "139 **** 1234", email: "zhang@example.com", company: "智联科技" }
      },
      {
        id: 2,
        user: "王总监",
        time: "30分钟前",
        text: "您好，我们有成熟的NLP技术团队，开发过多个智能客服系统。能否提供更具体的需求文档？谢谢！",
        likes: 2,
        userAction: null,
        contact: { phone: "137 **** 5678", email: "wang@example.com", company: "未来智能" }
      },
      {
        id: 3,
        user: "李技术",
        time: "15分钟前",
        text: "我们专注于AI语音交互系统，有自有专利技术，可以显著提升客服效率。已发送公司介绍到私信，请查收。",
        likes: 1,
        userAction: null,
        contact: { phone: "136 **** 9012", email: "li@example.com", company: "声学智能" }
      },
      {
        id: 4,
        user: "赵总",
        time: "10分钟前",
        text: "我们公司刚完成一个电商智能客服项目，支持多语言处理。已私信您案例演示链接，欢迎查看。",
        likes: 0,
        userAction: null,
        contact: { phone: "135 **** 3456", email: "zhao@example.com", company: "电商通" }
      }
    ]);
    const newCommentText = common_vendor.ref("");
    const showContactModal = common_vendor.ref(false);
    const currentContact = common_vendor.reactive({
      name: "",
      phone: "",
      email: "",
      company: "",
      address: "",
      website: ""
    });
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const showMoreActions = () => {
      common_vendor.index.showActionSheet({
        itemList: ["举报", "分享到..."],
        success: function(res) {
          common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:284", "用户点击了", res.tapIndex);
          if (res.tapIndex === 0) {
            common_vendor.index.showToast({ title: "举报功能待完善", icon: "none" });
          } else if (res.tapIndex === 1) {
            shareOpportunity();
          }
        }
      });
    };
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
    const showContact = (userName, contactInfo) => {
      Object.assign(currentContact, { name: userName, ...contactInfo });
      showContactModal.value = true;
    };
    const closeContact = () => {
      showContactModal.value = false;
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
          contact: { phone: "188 **** 8888", email: "current@example.com" }
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
            common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:424", "选中了第" + (data.tapIndex + 1) + "个按钮，第" + (data.index + 1) + "张图片");
          },
          fail: function(err) {
            common_vendor.index.__f__("log", "at pages/home-commercialDetail/home-commercialDetail.vue:427", err.errMsg);
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "22",
          color: "#FFFFFF"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          type: "more-filled",
          size: "20",
          color: "#FFFFFF"
        }),
        d: common_vendor.o(showMoreActions),
        e: common_vendor.t(postDetail.user.charAt(0)),
        f: common_vendor.o(($event) => showContact(postDetail.user, postDetail.contact)),
        g: common_vendor.t(postDetail.user),
        h: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        i: common_vendor.t(postDetail.time),
        j: common_vendor.t(postDetail.content),
        k: postDetail.images && postDetail.images.length
      }, postDetail.images && postDetail.images.length ? {
        l: common_vendor.f(postDetail.images, (image, imgIndex, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => previewImage(postDetail.images, imgIndex), imgIndex),
            c: imgIndex
          };
        })
      } : {}, {
        m: common_vendor.f(postDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        n: common_vendor.p({
          type: postDetail.userAction === "like" ? "hand-up-filled" : "hand-up",
          size: "18",
          color: postDetail.userAction === "like" ? "#e74c3c" : "#666"
        }),
        o: common_vendor.t(postDetail.likes),
        p: postDetail.userAction === "like" ? 1 : "",
        q: common_vendor.o(($event) => toggleAction(postDetail, "like")),
        r: common_vendor.p({
          type: postDetail.userAction === "dislike" ? "hand-down-filled" : "hand-down",
          size: "18",
          color: postDetail.userAction === "dislike" ? "#3498db" : "#666"
        }),
        s: common_vendor.t(postDetail.dislikes),
        t: postDetail.userAction === "dislike" ? 1 : "",
        v: common_vendor.o(($event) => toggleAction(postDetail, "dislike")),
        w: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        x: common_vendor.o(shareOpportunity),
        y: common_vendor.p({
          type: postDetail.saved ? "star-filled" : "star",
          size: "18",
          color: postDetail.saved ? "#FF6A00" : "#666"
        }),
        z: postDetail.saved ? 1 : "",
        A: common_vendor.o(($event) => toggleBookmark(postDetail)),
        B: common_vendor.p({
          type: "chatbubble-filled",
          size: "20",
          color: "#FF6A00"
        }),
        C: common_vendor.t(comments.length),
        D: common_vendor.f(comments, (comment, k0, i0) => {
          return {
            a: common_vendor.t(comment.user.charAt(0)),
            b: common_vendor.o(($event) => showContact(comment.user, comment.contact), comment.id),
            c: common_vendor.t(comment.user),
            d: common_vendor.t(comment.time),
            e: common_vendor.t(comment.text),
            f: "361e9b2c-8-" + i0,
            g: common_vendor.o(($event) => replyComment(comment), comment.id),
            h: "361e9b2c-9-" + i0,
            i: common_vendor.p({
              type: comment.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "16",
              color: comment.userAction === "like" ? "#e74c3c" : "#666"
            }),
            j: common_vendor.t(comment.likes),
            k: comment.userAction === "like" ? 1 : "",
            l: common_vendor.o(($event) => toggleAction(comment, "like"), comment.id),
            m: comment.id
          };
        }),
        E: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#666"
        }),
        F: comments.length === 0
      }, comments.length === 0 ? {} : {}, {
        G: common_vendor.o(addComment),
        H: newCommentText.value,
        I: common_vendor.o(($event) => newCommentText.value = $event.detail.value),
        J: common_vendor.o(addComment),
        K: common_vendor.t(currentContact.name.charAt(0)),
        L: common_vendor.t(currentContact.name),
        M: currentContact.phone
      }, currentContact.phone ? {
        N: common_vendor.p({
          type: "phone-filled",
          size: "18",
          color: "#FF6A00"
        }),
        O: common_vendor.t(currentContact.phone)
      } : {}, {
        P: currentContact.email
      }, currentContact.email ? {
        Q: common_vendor.p({
          type: "email-filled",
          size: "18",
          color: "#FF6A00"
        }),
        R: common_vendor.t(currentContact.email)
      } : {}, {
        S: currentContact.company
      }, currentContact.company ? {
        T: common_vendor.p({
          type: "paperplane-filled",
          size: "18",
          color: "#FF6A00"
        }),
        U: common_vendor.t(currentContact.company)
      } : {}, {
        V: currentContact.address
      }, currentContact.address ? {
        W: common_vendor.p({
          type: "location-filled",
          size: "18",
          color: "#FF6A00"
        }),
        X: common_vendor.t(currentContact.address)
      } : {}, {
        Y: currentContact.website
      }, currentContact.website ? {
        Z: common_vendor.p({
          type: "link",
          size: "18",
          color: "#FF6A00"
        }),
        aa: common_vendor.t(currentContact.website)
      } : {}, {
        ab: common_vendor.o(closeContact),
        ac: showContactModal.value ? 1 : "",
        ad: common_vendor.o(closeContact)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-361e9b2c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home-commercialDetail/home-commercialDetail.js.map
