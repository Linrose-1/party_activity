"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + PointsFeedbackPopup)();
}
const PointsFeedbackPopup = () => "../../components/PointsFeedbackPopup.js";
const _sfc_main = {
  __name: "shop-detail",
  setup(__props) {
    const storeId = common_vendor.ref(null);
    common_vendor.ref(common_vendor.index.getStorageSync("userId"));
    const viewerList = common_vendor.ref([]);
    const viewerTotal = common_vendor.ref(0);
    const storeDetail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const pointsPopup = common_vendor.ref(null);
    const coverImages = common_vendor.computed(() => {
      if (storeDetail.value && Array.isArray(storeDetail.value.storeCoverImageUrls)) {
        return storeDetail.value.storeCoverImageUrls;
      }
      if (storeDetail.value && storeDetail.value.storeCoverImageUrl) {
        return [storeDetail.value.storeCoverImageUrl];
      }
      return [];
    });
    const formattedOperatingHours = common_vendor.computed(() => {
      const defaultResult = {
        regular: [],
        special: []
      };
      if (!storeDetail.value || !storeDetail.value.operatingHours) {
        return defaultResult;
      }
      try {
        const hoursData = JSON.parse(storeDetail.value.operatingHours);
        const businessHours = hoursData.business_hours;
        if (!businessHours || !businessHours.regular)
          return defaultResult;
        const dailySegments = businessHours.regular.filter((item) => item.date === "周一" && item.is_open);
        const regular = dailySegments.map((s) => {
          return {
            // 如果用户填了描述（如“上午”），就显示描述，没填则不显示
            label: s.description && s.description !== "周一" ? s.description : "营业时段",
            time: `${s.open} - ${s.close}`
          };
        });
        const special = (businessHours.special_dates || []).map((item) => {
          return {
            date: item.date,
            description: item.description,
            status: item.is_open ? `${item.open} - ${item.close}` : "休息"
          };
        });
        return {
          regular,
          special
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/shop-detail/shop-detail.vue:328", "解析营业时间失败:", error);
        return {
          regular: [{
            label: "营业时间",
            time: "点击联系商家确认"
          }],
          special: []
        };
      }
    });
    common_vendor.onLoad(async (options) => {
      storeId.value = options.id;
      if (!storeId) {
        common_vendor.index.showToast({
          title: "无效的聚店ID",
          icon: "error"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1e3);
        return;
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/store/findStore", {
        method: "GET",
        data: {
          id: storeId.value
        }
      });
      isLoading.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at packages/shop-detail/shop-detail.vue:365", "获取聚店详情失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      storeDetail.value = data;
      common_vendor.index.__f__("log", "at packages/shop-detail/shop-detail.vue:374", "聚店详情数据:", storeDetail.value);
      if (data.checkContribution === 1) {
        setTimeout(() => {
          if (pointsPopup.value) {
            pointsPopup.value.show("查看聚店详情", 10);
          }
        }, 500);
      }
      getViewerList(storeId);
      getCommentPreview();
    });
    const openMap = () => {
      if (!storeDetail.value)
        return;
      common_vendor.index.openLocation({
        latitude: storeDetail.value.latitude,
        longitude: storeDetail.value.longitude,
        name: storeDetail.value.storeName,
        address: storeDetail.value.fullAddress,
        fail: (err) => {
          common_vendor.index.showToast({
            title: "无法打开地图",
            icon: "none"
          });
        }
      });
    };
    const openNavigation = openMap;
    const callPhone = () => {
      if (!storeDetail.value)
        return;
      const phoneNumber = storeDetail.value.contactPhone;
      if (!phoneNumber) {
        common_vendor.index.showToast({
          title: "该聚店暂无联系电话",
          icon: "none"
        });
        return;
      }
      common_vendor.index.makePhoneCall({
        phoneNumber,
        fail: (err) => {
          common_vendor.index.showToast({
            title: "拨打电话失败",
            icon: "none"
          });
        }
      });
    };
    const previewImage = (urls, current = 0) => {
      if (!urls || urls.length === 0)
        return;
      const finalUrls = Array.isArray(urls) ? urls : [urls];
      common_vendor.index.previewImage({
        urls: finalUrls,
        current: Array.isArray(urls) ? urls[current] : urls
        // 兼容旧的单图预览
      });
    };
    const getViewerList = async (storeId2) => {
      const {
        data
      } = await utils_request.request("/app-api/member/target-view/page", {
        method: "GET",
        data: {
          targetId: storeId2,
          targetType: "store",
          // 【关键】设置为 store
          pageNo: 1,
          pageSize: 7
        }
      });
      if (data) {
        viewerList.value = data.list || [];
        viewerTotal.value = data.total || 0;
      }
    };
    const goToTraceList = () => {
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${storeDetail.value.id}&type=store`
      });
    };
    const commentPreviewList = common_vendor.ref([]);
    const commentTotal = common_vendor.ref(0);
    const getCommentPreview = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/comment/select-type-target-id", {
        method: "GET",
        data: {
          targetId: storeId.value,
          // 或者是 storeId
          targetType: "store"
          // 或者是 'store'
        }
      });
      if (data && Array.isArray(data)) {
        commentTotal.value = data.length;
        commentPreviewList.value = data.slice(0, 2);
      }
    };
    const goToCommentPage = () => {
      common_vendor.index.navigateTo({
        url: `/packages/comment-page/comment-page?id=${storeId.value}&type=store`
      });
    };
    common_vendor.onShareAppMessage(() => {
      if (!storeDetail.value)
        return {};
      return {
        title: storeDetail.value.storeName + " - 聚店推荐",
        path: `/packages/shop-detail/shop-detail?id=${storeDetail.value.id}`,
        imageUrl: coverImages.value[0] || ""
        // 封面图（支持可选）
      };
    });
    common_vendor.onShareTimeline(() => {
      if (!storeDetail.value)
        return {};
      return {
        title: storeDetail.value.storeName + " - 聚店推荐",
        query: `id=${storeDetail.value.id}`,
        imageUrl: coverImages.value[0] || ""
      };
    });
    const isActionInProgress = common_vendor.ref(false);
    const toggleAction = async (clickedAction) => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (isActionInProgress.value)
        return;
      isActionInProgress.value = true;
      const originalAction = storeDetail.value.userLikeStr;
      const originalLikes = storeDetail.value.likesCount || 0;
      const originalDislikes = storeDetail.value.dislikesCount || 0;
      const apiAction = originalAction === clickedAction ? "cancel" : clickedAction;
      if (apiAction === "cancel") {
        storeDetail.value.userLikeStr = null;
        clickedAction === "like" ? storeDetail.value.likesCount-- : storeDetail.value.dislikesCount--;
      } else {
        storeDetail.value.userLikeStr = clickedAction;
        if (clickedAction === "like") {
          storeDetail.value.likesCount++;
          if (originalAction === "dislike")
            storeDetail.value.dislikesCount--;
        } else {
          storeDetail.value.dislikesCount++;
          if (originalAction === "like")
            storeDetail.value.likesCount--;
        }
      }
      try {
        const { error } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: storeId.value,
            targetType: "store",
            // 聚店业务标识
            action: apiAction
          }
        });
        if (!error) {
          common_vendor.index.$emit("storeInteractionChanged", {
            id: storeId.value,
            type: "action",
            userLikeStr: storeDetail.value.userLikeStr,
            likesCount: storeDetail.value.likesCount,
            dislikesCount: storeDetail.value.dislikesCount
          });
        } else {
          throw new Error(error);
        }
      } catch (e) {
        storeDetail.value.userLikeStr = originalAction;
        storeDetail.value.likesCount = originalLikes;
        storeDetail.value.dislikesCount = originalDislikes;
        common_vendor.index.showToast({ title: "操作失败，请重试", icon: "none" });
      } finally {
        isActionInProgress.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: storeDetail.value
      }, storeDetail.value ? common_vendor.e({
        b: coverImages.value.length > 0
      }, coverImages.value.length > 0 ? {
        c: common_vendor.f(coverImages.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(coverImages.value, index), index),
            c: index
          };
        })
      } : {
        d: common_vendor.t(storeDetail.value.storeName)
      }, {
        e: common_vendor.t(storeDetail.value.storeName),
        f: storeDetail.value.distance !== null
      }, storeDetail.value.distance !== null ? {
        g: common_vendor.p({
          type: "paperplane-filled",
          color: "#fff",
          size: "16"
        }),
        h: common_vendor.t(storeDetail.value.distance)
      } : {}, {
        i: storeDetail.value.tags && storeDetail.value.tags.length > 0
      }, storeDetail.value.tags && storeDetail.value.tags.length > 0 ? {
        j: common_vendor.f(storeDetail.value.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        k: common_vendor.t(storeDetail.value.storeDescription || "暂无简介"),
        l: common_vendor.t(storeDetail.value.fullAddress || "暂无地址信息"),
        m: formattedOperatingHours.value.regular.length > 0
      }, formattedOperatingHours.value.regular.length > 0 ? common_vendor.e({
        n: common_vendor.f(formattedOperatingHours.value.regular, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.time),
            c: index
          };
        }),
        o: formattedOperatingHours.value.special.length > 0
      }, formattedOperatingHours.value.special.length > 0 ? {
        p: common_vendor.f(formattedOperatingHours.value.special, (item, index, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.description),
            c: common_vendor.t(item.status),
            d: index
          };
        })
      } : {}) : {}, {
        q: storeDetail.value.contactPhone
      }, storeDetail.value.contactPhone ? {
        r: common_vendor.t(storeDetail.value.contactPhone)
      } : {}, {
        s: storeDetail.value.contactWechatQrCodeUrl
      }, storeDetail.value.contactWechatQrCodeUrl ? {
        t: storeDetail.value.contactWechatQrCodeUrl,
        v: common_vendor.o(($event) => previewImage(storeDetail.value.contactWechatQrCodeUrl))
      } : {}, {
        w: storeDetail.value.averageConsumptionRange
      }, storeDetail.value.averageConsumptionRange ? {
        x: common_vendor.t(storeDetail.value.averageConsumptionRange)
      } : {}, {
        y: common_vendor.p({
          type: "map-pin-ellipse",
          size: "40",
          color: "#ccc"
        }),
        z: common_vendor.o(openMap),
        A: storeDetail.value && storeDetail.value.isReadTrace === 1 && viewerTotal.value > 0
      }, storeDetail.value && storeDetail.value.isReadTrace === 1 && viewerTotal.value > 0 ? common_vendor.e({
        B: common_vendor.t(viewerTotal.value),
        C: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        D: common_vendor.o(goToTraceList),
        E: common_vendor.f(viewerList.value, (item, index, i0) => {
          var _a;
          return {
            a: ((_a = item.memberUser) == null ? void 0 : _a.avatar) || "/static/icon/default-avatar.png",
            b: item.id
          };
        }),
        F: viewerTotal.value > 7
      }, viewerTotal.value > 7 ? {} : {}, {
        G: common_vendor.t(viewerTotal.value),
        H: common_vendor.o(goToTraceList)
      }) : {}, {
        I: commentTotal.value > 0
      }, commentTotal.value > 0 ? {
        J: common_vendor.t(commentTotal.value)
      } : {}, {
        K: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        L: common_vendor.o(goToCommentPage),
        M: commentPreviewList.value.length > 0
      }, commentPreviewList.value.length > 0 ? {
        N: common_vendor.f(commentPreviewList.value, (c, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(c.anonymous === 1 ? "匿名商友" : ((_a = c.memberUserBaseVO) == null ? void 0 : _a.nickname) || "商友"),
            b: common_vendor.t(c.content),
            c: c.id
          };
        }),
        O: common_vendor.o(goToCommentPage)
      } : {
        P: common_vendor.p({
          type: "chatbubble",
          size: "18",
          color: "#ccc"
        }),
        Q: common_vendor.o(goToCommentPage)
      }, {
        R: common_vendor.p({
          type: storeDetail.value.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "22",
          color: storeDetail.value.userLikeStr === "like" ? "#FF6B00" : "#666"
        }),
        S: common_vendor.t(storeDetail.value.likesCount || 0),
        T: storeDetail.value.userLikeStr === "like" ? 1 : "",
        U: common_vendor.o(($event) => toggleAction("like")),
        V: common_vendor.p({
          type: storeDetail.value.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "22",
          color: storeDetail.value.userLikeStr === "dislike" ? "#3498db" : "#666"
        }),
        W: common_vendor.t(storeDetail.value.dislikesCount || 0),
        X: storeDetail.value.userLikeStr === "dislike" ? 1 : "",
        Y: common_vendor.o(($event) => toggleAction("dislike")),
        Z: common_vendor.p({
          type: "map-filled",
          color: "#FF6B00",
          size: "20"
        }),
        aa: common_vendor.o((...args) => common_vendor.unref(openNavigation) && common_vendor.unref(openNavigation)(...args)),
        ab: common_vendor.p({
          type: "phone-filled",
          color: "#fff",
          size: "20"
        }),
        ac: common_vendor.o(callPhone),
        ad: common_vendor.sr(pointsPopup, "4c71c098-9", {
          "k": "pointsPopup"
        })
      }) : {
        ae: common_vendor.p({
          type: "spinner-cycle",
          size: "30",
          color: "#999"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c71c098"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/shop-detail/shop-detail.js.map
