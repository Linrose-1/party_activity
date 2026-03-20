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
    const storeDetail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const isActionInProgress = common_vendor.ref(false);
    common_vendor.ref(common_vendor.index.getStorageSync("userId"));
    const viewerList = common_vendor.ref([]);
    const viewerTotal = common_vendor.ref(0);
    const commentPreviewList = common_vendor.ref([]);
    const commentTotal = common_vendor.ref(0);
    const storeActivityPreviewList = common_vendor.ref([]);
    const storeActivityTotal = common_vendor.ref(0);
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
    const mapMarkers = common_vendor.computed(() => {
      if (!storeDetail.value || !storeDetail.value.latitude || !storeDetail.value.longitude)
        return [];
      return [{
        id: 1,
        latitude: storeDetail.value.latitude,
        longitude: storeDetail.value.longitude,
        title: storeDetail.value.storeName,
        iconPath: "/static/icon/map-pin.png",
        width: 32,
        height: 32
      }];
    });
    const formattedOperatingHours = common_vendor.computed(() => {
      const defaultResult = {
        regular: [],
        special: []
      };
      if (!storeDetail.value || !storeDetail.value.operatingHours)
        return defaultResult;
      try {
        const hoursData = JSON.parse(storeDetail.value.operatingHours);
        const businessHours = hoursData.business_hours;
        if (!businessHours || !businessHours.regular)
          return defaultResult;
        const dailySegments = businessHours.regular.filter(
          (item) => item.date === "周一" && item.is_open
        );
        const regular = dailySegments.map((s) => ({
          label: s.description && s.description !== "周一" ? s.description : "营业时段",
          time: s.open + " - " + s.close
        }));
        const special = (businessHours.special_dates || []).map((item) => ({
          date: item.date,
          description: item.description,
          status: item.is_open ? item.open + " - " + item.close : "休息"
        }));
        return {
          regular,
          special
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at packages/shop-detail/shop-detail.vue:373", "[营业时间] 解析失败:", error);
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
      if (!storeId.value) {
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
        common_vendor.index.__f__("error", "at packages/shop-detail/shop-detail.vue:417", "[详情] 获取失败:", error);
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      storeDetail.value = data;
      common_vendor.index.__f__("log", "at packages/shop-detail/shop-detail.vue:426", "[详情] 数据:", storeDetail.value);
      if (data.checkContribution === 1) {
        setTimeout(() => {
          if (pointsPopup.value) {
            pointsPopup.value.show("查看聚店详情", 10);
          }
        }, 500);
      }
      getViewerList(storeId.value);
      getCommentPreview();
      getStoreActivityPreview();
    });
    const getViewerList = async (id) => {
      const {
        data
      } = await utils_request.request("/app-api/member/target-view/page", {
        method: "GET",
        data: {
          targetId: id,
          targetType: "store",
          pageNo: 1,
          pageSize: 7
        }
      });
      if (data) {
        viewerList.value = data.list || [];
        viewerTotal.value = data.total || 0;
      }
    };
    const getCommentPreview = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/comment/select-type-target-id", {
        method: "GET",
        data: {
          targetId: storeId.value,
          targetType: "store"
        }
      });
      if (data && Array.isArray(data)) {
        commentTotal.value = data.length;
        commentPreviewList.value = data.slice(0, 2);
      }
    };
    const getStoreActivityPreview = async () => {
      if (!storeId.value)
        return;
      const {
        data
      } = await utils_request.request("/app-api/member/activity/store-list", {
        method: "GET",
        data: {
          storeId: storeId.value,
          pageNo: 1,
          pageSize: 2
        }
      });
      if (data) {
        storeActivityTotal.value = data.total || 0;
        storeActivityPreviewList.value = data.list || [];
      }
    };
    const formatActivityTime = (timestamp) => {
      if (!timestamp)
        return "时间待定";
      const d = new Date(timestamp);
      const Y = d.getFullYear();
      const M = (d.getMonth() + 1).toString().padStart(2, "0");
      const D = d.getDate().toString().padStart(2, "0");
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      return Y + "-" + M + "-" + D + " " + h + ":" + m;
    };
    const getStatusText = (status) => {
      const map = {
        0: "已取消",
        1: "未开始",
        2: "报名中",
        3: "即将开始",
        4: "进行中",
        5: "已结束",
        6: "待退款"
      };
      return map[status] || "未知";
    };
    const getStatusColor = (status) => {
      const map = {
        0: "#909399",
        1: "#f9ae3d",
        2: "#4cd964",
        3: "#007aff",
        4: "#dd524d",
        5: "#8f8f94",
        6: "#e6a23c"
      };
      return map[status] || "#909399";
    };
    const goToStoreActivityList = () => {
      common_vendor.index.navigateTo({
        url: "/packages/store-activity-list/store-activity-list?storeId=" + storeId.value + "&storeName=" + encodeURIComponent(storeDetail.value ? storeDetail.value.storeName : "")
      });
    };
    common_vendor.onShow(() => {
      if (storeId.value) {
        getCommentPreview();
      }
    });
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
        const {
          error
        } = await utils_request.request("/app-api/member/like-action/add", {
          method: "POST",
          data: {
            targetId: storeId.value,
            targetType: "store",
            action: apiAction
          }
        });
        if (error)
          throw new Error(error);
        common_vendor.index.$emit("storeInteractionChanged", {
          id: storeId.value,
          type: "action",
          userLikeStr: storeDetail.value.userLikeStr,
          likesCount: storeDetail.value.likesCount,
          dislikesCount: storeDetail.value.dislikesCount
        });
      } catch (e) {
        storeDetail.value.userLikeStr = originalAction;
        storeDetail.value.likesCount = originalLikes;
        storeDetail.value.dislikesCount = originalDislikes;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      } finally {
        isActionInProgress.value = false;
      }
    };
    const openMap = () => {
      if (!storeDetail.value)
        return;
      common_vendor.index.openLocation({
        latitude: storeDetail.value.latitude,
        longitude: storeDetail.value.longitude,
        name: storeDetail.value.storeName,
        address: storeDetail.value.fullAddress,
        fail: () => common_vendor.index.showToast({
          title: "无法打开地图",
          icon: "none"
        })
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
        fail: () => common_vendor.index.showToast({
          title: "拨打电话失败",
          icon: "none"
        })
      });
    };
    const previewImage = (urls, current) => {
      if (!urls || urls.length === 0)
        return;
      const finalUrls = Array.isArray(urls) ? urls : [urls];
      const idx = current || 0;
      common_vendor.index.previewImage({
        urls: finalUrls,
        current: finalUrls[idx]
      });
    };
    const goToTraceList = () => {
      const hasSilent = storeDetail.value.hasSilentLoginUser || 0;
      common_vendor.index.navigateTo({
        url: `/packages/user-view-trace/user-view-trace?id=${storeDetail.value.id}&type=store&hasSilent=${hasSilent}`
      });
    };
    const goToCommentPage = () => {
      common_vendor.index.navigateTo({
        url: "/packages/comment-page/comment-page?id=" + storeId.value + "&type=store"
      });
    };
    common_vendor.onShareAppMessage(() => {
      if (!storeDetail.value)
        return {};
      return {
        title: storeDetail.value.storeName + " - 聚店推荐",
        path: "/packages/shop-detail/shop-detail?id=" + storeDetail.value.id,
        imageUrl: coverImages.value[0] || ""
      };
    });
    common_vendor.onShareTimeline(() => {
      if (!storeDetail.value)
        return {};
      return {
        title: storeDetail.value.storeName + " - 聚店推荐",
        query: "id=" + storeDetail.value.id,
        imageUrl: coverImages.value[0] || ""
      };
    });
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
      } : {}, {
        d: common_vendor.t(storeDetail.value.storeName),
        e: storeDetail.value.distance !== null
      }, storeDetail.value.distance !== null ? {
        f: common_vendor.p({
          type: "paperplane-filled",
          color: "#fff",
          size: "16"
        }),
        g: common_vendor.t(storeDetail.value.distance)
      } : {}, {
        h: storeDetail.value.tags && storeDetail.value.tags.length > 0
      }, storeDetail.value.tags && storeDetail.value.tags.length > 0 ? {
        i: common_vendor.f(storeDetail.value.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        j: common_vendor.t(storeDetail.value.storeDescription || "暂无简介"),
        k: common_vendor.t(storeDetail.value.fullAddress || "暂无地址信息"),
        l: formattedOperatingHours.value.regular.length > 0
      }, formattedOperatingHours.value.regular.length > 0 ? common_vendor.e({
        m: common_vendor.f(formattedOperatingHours.value.regular, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.time),
            c: index
          };
        }),
        n: formattedOperatingHours.value.special.length > 0
      }, formattedOperatingHours.value.special.length > 0 ? {
        o: common_vendor.f(formattedOperatingHours.value.special, (item, index, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.description),
            c: common_vendor.t(item.status),
            d: index
          };
        })
      } : {}) : {}, {
        p: storeDetail.value.contactPhone
      }, storeDetail.value.contactPhone ? {
        q: common_vendor.t(storeDetail.value.contactPhone),
        r: common_vendor.p({
          type: "phone-filled",
          size: "20",
          color: "#FF6B00"
        }),
        s: common_vendor.o(callPhone)
      } : {}, {
        t: storeDetail.value.contactWechatQrCodeUrl
      }, storeDetail.value.contactWechatQrCodeUrl ? {
        v: storeDetail.value.contactWechatQrCodeUrl,
        w: common_vendor.o(($event) => previewImage([storeDetail.value.contactWechatQrCodeUrl], 0))
      } : {}, {
        x: storeDetail.value.averageConsumptionRange
      }, storeDetail.value.averageConsumptionRange ? {
        y: common_vendor.t(storeDetail.value.averageConsumptionRange)
      } : {}, {
        z: storeDetail.value.latitude && storeDetail.value.longitude
      }, storeDetail.value.latitude && storeDetail.value.longitude ? {
        A: storeDetail.value.latitude,
        B: storeDetail.value.longitude,
        C: mapMarkers.value
      } : {
        D: common_vendor.p({
          type: "map-pin-ellipse",
          size: "40",
          color: "#ccc"
        })
      }, {
        E: common_vendor.o(openMap),
        F: storeDetail.value && storeDetail.value.isReadTrace === 1 && (viewerTotal.value > 0 || storeDetail.value.hasSilentLoginUser === 1)
      }, storeDetail.value && storeDetail.value.isReadTrace === 1 && (viewerTotal.value > 0 || storeDetail.value.hasSilentLoginUser === 1) ? common_vendor.e({
        G: storeDetail.value.targetViewNum > 0
      }, storeDetail.value.targetViewNum > 0 ? {
        H: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#333"
        }),
        I: common_vendor.t(storeDetail.value.targetViewNum)
      } : {}, {
        J: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        K: common_vendor.f(viewerList.value, (item, k0, i0) => {
          var _a;
          return {
            a: ((_a = item.memberUser) == null ? void 0 : _a.avatar) || "/static/icon/default-avatar.png",
            b: item.id
          };
        }),
        L: storeDetail.value.hasSilentLoginUser === 1
      }, storeDetail.value.hasSilentLoginUser === 1 ? {} : {}, {
        M: viewerTotal.value > 7
      }, viewerTotal.value > 7 ? {} : {}, {
        N: common_vendor.o(goToTraceList)
      }) : {}, {
        O: commentTotal.value > 0
      }, commentTotal.value > 0 ? {
        P: common_vendor.t(commentTotal.value)
      } : {}, {
        Q: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        R: commentPreviewList.value.length > 0
      }, commentPreviewList.value.length > 0 ? {
        S: common_vendor.f(commentPreviewList.value, (c, k0, i0) => {
          return {
            a: common_vendor.t(c.anonymous === 1 ? "匿名商友" : c.memberUserBaseVO && c.memberUserBaseVO.nickname ? c.memberUserBaseVO.nickname : "商友"),
            b: common_vendor.t(c.content),
            c: c.id
          };
        })
      } : {
        T: common_vendor.p({
          type: "chatbubble",
          size: "18",
          color: "#ccc"
        })
      }, {
        U: common_vendor.o(goToCommentPage),
        V: storeActivityTotal.value > 0
      }, storeActivityTotal.value > 0 ? {
        W: common_vendor.t(storeActivityTotal.value),
        X: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        Y: common_vendor.f(storeActivityPreviewList.value, (item, k0, i0) => {
          return {
            a: item.coverImageUrl || item.activityCoverImageUrl || "/static/icon/default-activity.png",
            b: common_vendor.t(item.activityTitle),
            c: common_vendor.t(formatActivityTime(item.startDatetime)),
            d: common_vendor.t(item.statusStr || getStatusText(item.status)),
            e: getStatusColor(item.status),
            f: item.id
          };
        }),
        Z: common_vendor.o(goToStoreActivityList)
      } : {}, {
        aa: common_vendor.p({
          type: storeDetail.value.userLikeStr === "like" ? "hand-up-filled" : "hand-up",
          size: "22",
          color: storeDetail.value.userLikeStr === "like" ? "#FF6B00" : "#666"
        }),
        ab: common_vendor.t(storeDetail.value.likesCount || 0),
        ac: storeDetail.value.userLikeStr === "like" ? 1 : "",
        ad: common_vendor.o(($event) => toggleAction("like")),
        ae: common_vendor.p({
          type: storeDetail.value.userLikeStr === "dislike" ? "hand-down-filled" : "hand-down",
          size: "22",
          color: storeDetail.value.userLikeStr === "dislike" ? "#3498db" : "#666"
        }),
        af: common_vendor.t(storeDetail.value.dislikesCount || 0),
        ag: storeDetail.value.userLikeStr === "dislike" ? 1 : "",
        ah: common_vendor.o(($event) => toggleAction("dislike")),
        ai: common_vendor.p({
          type: "map-filled",
          color: "#FF6B00",
          size: "20"
        }),
        aj: common_vendor.o((...args) => common_vendor.unref(openNavigation) && common_vendor.unref(openNavigation)(...args)),
        ak: common_vendor.p({
          type: "phone-filled",
          color: "#fff",
          size: "20"
        }),
        al: common_vendor.o(callPhone),
        am: common_vendor.sr(pointsPopup, "4c71c098-12", {
          "k": "pointsPopup"
        })
      }) : {
        an: common_vendor.p({
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
