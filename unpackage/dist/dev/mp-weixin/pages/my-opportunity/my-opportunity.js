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
  __name: "my-opportunity",
  setup(__props) {
    const myPosts = common_vendor.reactive([
      {
        id: 101,
        // 增加ID以方便删除
        user: "当前用户",
        // 假设这是登录用户
        time: "2025-06-16 10:00:00",
        content: "我司寻求智能家居项目合作，主要方向为AIoT设备连接与数据分析平台。欢迎有相关经验的团队联系，可提供技术方案或产品。",
        images: [
          "https://via.placeholder.com/150/FF6A00/FFFFFF?text=智能家居1",
          "https://via.placeholder.com/150/FF6A00/FFFFFF?text=智能家居2"
        ],
        tags: ["#智能家居", "#AIoT", "#项目合作"],
        likes: 15,
        dislikes: 0,
        userAction: null,
        saved: false
      },
      {
        id: 102,
        user: "当前用户",
        time: "2025-06-15 14:30:00",
        content: "本人有一批高质量二手办公家具转让，适合创业公司或小型办公室，价格优惠，可上门看货。",
        images: [
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具1",
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具2",
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具3",
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具4",
          "https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具5"
        ],
        tags: ["#二手转让", "#办公用品", "#创业福利"],
        likes: 8,
        dislikes: 1,
        userAction: null,
        saved: false
      },
      {
        id: 103,
        user: "当前用户",
        time: "2025-06-14 09:00:00",
        content: "寻找在营销策划、品牌推广方面有独到见解的专家，希望通过线上线下结合的方式提升品牌影响力。",
        images: [],
        // 无图片
        tags: ["#营销策划", "#品牌推广", "#专家合作"],
        likes: 20,
        dislikes: 0,
        userAction: null,
        saved: true
        // 模拟已被收藏
      }
    ]);
    const deleteOpportunity = (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "您确定要删除这条商机吗？删除后将无法恢复。",
        success: (res) => {
          if (res.confirm) {
            const index = myPosts.findIndex((post) => post.id === id);
            if (index !== -1) {
              myPosts.splice(index, 1);
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          }
        }
      });
    };
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
    const toggleSave = (post) => {
      post.saved = !post.saved;
      common_vendor.index.showToast({
        title: post.saved ? "已收藏" : "已取消收藏",
        icon: "none"
      });
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
    const skipCommercialDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}`
        // 实际项目中应传递商机ID
      });
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current: urls[current],
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function(data) {
            common_vendor.index.__f__("log", "at pages/my-opportunity/my-opportunity.vue:303", "选中了第" + (data.tapIndex + 1) + "个按钮，第" + (data.index + 1) + "张图片");
          },
          fail: function(err) {
            common_vendor.index.__f__("log", "at pages/my-opportunity/my-opportunity.vue:306", err.errMsg);
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(myPosts, (post, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(post.user.charAt(0)),
            b: common_vendor.o(skipApplicationBusinessCard, post.id),
            c: common_vendor.t(post.user),
            d: "481e0091-0-" + i0,
            e: common_vendor.t(post.time),
            f: "481e0091-1-" + i0,
            g: common_vendor.o(($event) => deleteOpportunity(post.id), post.id),
            h: common_vendor.t(post.content),
            i: post.images && post.images.length
          }, post.images && post.images.length ? {
            j: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.images, imgIndex), imgIndex),
                c: imgIndex
              };
            })
          } : {}, {
            k: common_vendor.f(post.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            l: "481e0091-2-" + i0,
            m: common_vendor.t(post.likes),
            n: "481e0091-3-" + i0,
            o: common_vendor.t(post.dislikes),
            p: "481e0091-4-" + i0,
            q: common_vendor.p({
              type: post.userAction === "like" ? "hand-up-filled" : "hand-up",
              size: "20",
              color: post.userAction === "like" ? "#e74c3c" : "#666"
            }),
            r: post.userAction === "like" ? 1 : "",
            s: common_vendor.o(($event) => toggleAction(post, "like"), post.id),
            t: "481e0091-5-" + i0,
            v: common_vendor.p({
              type: post.userAction === "dislike" ? "hand-down-filled" : "hand-down",
              size: "20",
              color: post.userAction === "dislike" ? "#3498db" : "#666"
            }),
            w: post.userAction === "dislike" ? 1 : "",
            x: common_vendor.o(($event) => toggleAction(post, "dislike"), post.id),
            y: "481e0091-6-" + i0,
            z: common_vendor.p({
              type: post.saved ? "star-filled" : "star",
              size: "20",
              color: post.saved ? "#FF6A00" : "#666"
            }),
            A: post.saved ? 1 : "",
            B: common_vendor.o(($event) => toggleSave(post), post.id),
            C: "481e0091-7-" + i0,
            D: common_vendor.o(($event) => sharePost(), post.id),
            E: post.id,
            F: common_vendor.o(($event) => skipCommercialDetail(post.id), post.id)
          });
        }),
        b: common_vendor.p({
          type: "redo",
          size: "14",
          color: "#888"
        }),
        c: common_vendor.p({
          type: "close",
          size: "15",
          color: "#FF6A00"
        }),
        d: common_vendor.p({
          type: "hand-up-filled",
          size: "18",
          color: "#e74c3c"
        }),
        e: common_vendor.p({
          type: "hand-down-filled",
          size: "18",
          color: "#3498db"
        }),
        f: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#666"
        }),
        g: myPosts.length === 0
      }, myPosts.length === 0 ? {
        h: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        }),
        i: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#FFFFFF"
        }),
        j: common_vendor.o(postNew)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-481e0091"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-opportunity/my-opportunity.js.map
