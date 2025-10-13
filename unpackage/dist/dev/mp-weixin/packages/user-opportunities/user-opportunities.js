"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "user-opportunities",
  setup(__props) {
    const postList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const targetUserId = common_vendor.ref(null);
    const pageTitle = common_vendor.ref("商友圈");
    const loadStatus = common_vendor.ref("more");
    common_vendor.onLoad((options) => {
      if (options.userId) {
        targetUserId.value = options.userId;
        const userName = decodeURIComponent(options.userName || "Ta");
        pageTitle.value = `${userName}的商友圈`;
        common_vendor.index.setNavigationBarTitle({
          title: pageTitle.value
        });
        getOpportunitiesList(true);
      } else {
        common_vendor.index.showToast({
          title: "缺少用户信息",
          icon: "none"
        });
        loadStatus.value = "noMore";
      }
    });
    common_vendor.onReachBottom(() => {
      if (loadStatus.value === "more") {
        getOpportunitiesList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      getOpportunitiesList(true);
    });
    const getOpportunitiesList = async (isRefresh = false) => {
      if (loadStatus.value === "loading" || loadStatus.value === "noMore" && !isRefresh)
        return;
      if (isRefresh) {
        pageNo.value = 1;
        postList.value = [];
        loadStatus.value = "more";
      }
      loadStatus.value = "loading";
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/business-opportunities/list", {
        method: "GET",
        data: {
          pageNo: pageNo.value,
          pageSize: pageSize.value,
          userId: targetUserId.value
          // 【核心】传入指定的用户ID
        }
      });
      if (isRefresh)
        common_vendor.index.stopPullDownRefresh();
      if (error || !data || !data.list) {
        loadStatus.value = "more";
        return;
      }
      const mappedData = data.list.map((item) => ({
        id: item.id,
        title: item.postTitle,
        contentPreview: generateContentPreview(item.postContent),
        images: item.postImg ? item.postImg.split(",").filter((img) => img) : [],
        time: formatTimestamp(item.createTime)
      }));
      postList.value = isRefresh ? mappedData : [...postList.value, ...mappedData];
      if (postList.value.length >= data.total) {
        loadStatus.value = "noMore";
      } else {
        loadStatus.value = "more";
        pageNo.value++;
      }
    };
    const goToDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/packages/home-commercialDetail/home-commercialDetail?id=${id}`
      });
    };
    const previewImage = (urls, current) => {
      common_vendor.index.previewImage({
        urls,
        current
      });
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      return `${Y}-${M}-${D}`;
    };
    const generateContentPreview = (content) => {
      if (!content)
        return "";
      const plainText = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return plainText.length > 80 ? plainText.substring(0, 80) + "..." : plainText;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(pageTitle.value),
        b: common_vendor.f(postList.value, (post, k0, i0) => {
          return common_vendor.e({
            a: "f3dcc489-0-" + i0,
            b: common_vendor.t(post.time),
            c: common_vendor.t(post.title),
            d: post.contentPreview
          }, post.contentPreview ? {
            e: common_vendor.t(post.contentPreview)
          } : {}, {
            f: post.images && post.images.length > 0
          }, post.images && post.images.length > 0 ? {
            g: common_vendor.f(post.images, (image, imgIndex, i1) => {
              return {
                a: image,
                b: common_vendor.o(($event) => previewImage(post.images, imgIndex), imgIndex),
                c: imgIndex
              };
            }),
            h: post.images.length === 1 ? "widthFix" : "aspectFill",
            i: common_vendor.n("images-count-" + post.images.length)
          } : {}, {
            j: post.id,
            k: common_vendor.o(($event) => goToDetail(post.id), post.id)
          });
        }),
        c: common_vendor.p({
          type: "calendar-filled",
          size: "14",
          color: "#888"
        }),
        d: postList.value.length > 0
      }, postList.value.length > 0 ? {
        e: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        f: postList.value.length === 0 && loadStatus.value === "noMore"
      }, postList.value.length === 0 && loadStatus.value === "noMore" ? {
        g: common_vendor.p({
          type: "list",
          size: "50",
          color: "#e0e0e0"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f3dcc489"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/user-opportunities/user-opportunities.js.map
