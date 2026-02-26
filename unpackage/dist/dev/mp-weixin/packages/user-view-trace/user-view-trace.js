"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
const defaultAvatar = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "user-view-trace",
  setup(__props) {
    const targetId = common_vendor.ref(null);
    const targetType = common_vendor.ref("post");
    const list = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    common_vendor.onLoad((options) => {
      targetId.value = options.id;
      if (options.type) {
        targetType.value = options.type;
      }
      const titleMap = {
        "post": "商机浏览记录",
        "store": "聚店浏览记录",
        "activity": "聚会浏览记录"
      };
      common_vendor.index.setNavigationBarTitle({
        title: titleMap[targetType.value] || "浏览记录"
      });
      loadData(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more")
        loadData();
    });
    const loadData = async (isRefresh = false) => {
      if (isRefresh) {
        pageNo.value = 1;
        list.value = [];
      }
      loadingStatus.value = "loading";
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/target-view/page", {
          method: "GET",
          data: {
            targetId: targetId.value,
            targetType: targetType.value,
            // 动态传入类型 (post/store/activity)
            pageNo: pageNo.value,
            pageSize: 20
          }
        });
        if (!error && data) {
          const newList = data.list || [];
          list.value = isRefresh ? newList : [...list.value, ...newList];
          if (list.value.length >= data.total) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
          }
        } else {
          loadingStatus.value = "more";
          if (error)
            common_vendor.index.showToast({
              title: error,
              icon: "none"
            });
        }
      } catch (e) {
        loadingStatus.value = "more";
        common_vendor.index.__f__("error", "at packages/user-view-trace/user-view-trace.vue:137", "加载留痕数据失败:", e);
      }
    };
    const goCard = (user) => {
      if (!user || !user.id)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname || "")}&avatar=${encodeURIComponent(user.avatar || "")}`
      });
    };
    const getAssociationJob = (user) => {
      if (!user)
        return "暂未填写商协会职务";
      const assocList = (user.associationName || "").split(/[,，]/).filter((s) => s.trim());
      const titleList = (user.professionalTitle || "").split(/[,，]/).filter((s) => s.trim());
      const firstAssoc = assocList[0] || "";
      const firstTitle = titleList[0] || "";
      if (firstAssoc && firstTitle) {
        return `${firstAssoc}·${firstTitle}`;
      } else if (firstAssoc || firstTitle) {
        return firstAssoc || firstTitle;
      }
      return "暂未填写商协会职务";
    };
    const formatTime = (ts) => {
      if (!ts)
        return "";
      const date = new Date(ts);
      const M = date.getMonth() + 1;
      const D = date.getDate();
      const h = date.getHours();
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${M}月${D}日 ${h}:${m}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length > 0
      }, list.value.length > 0 ? {
        b: common_vendor.f(list.value, (item, k0, i0) => {
          var _a, _b, _c;
          return common_vendor.e({
            a: ((_a = item.memberUser) == null ? void 0 : _a.avatar) || defaultAvatar,
            b: common_vendor.t(((_b = item.memberUser) == null ? void 0 : _b.nickname) || "匿名商友"),
            c: common_vendor.t(formatTime(item.createTime)),
            d: "e21cc623-0-" + i0,
            e: common_vendor.t(getAssociationJob(item.memberUser)),
            f: !((_c = item.memberUser) == null ? void 0 : _c.associationName) ? 1 : "",
            g: item.viewCount !== null && item.viewCount !== void 0
          }, item.viewCount !== null && item.viewCount !== void 0 ? {
            h: "e21cc623-1-" + i0,
            i: common_vendor.p({
              type: "eye",
              size: "14",
              color: "#999"
            }),
            j: common_vendor.t(item.viewCount || 1)
          } : {}, {
            k: "e21cc623-2-" + i0,
            l: item.id,
            m: common_vendor.o(($event) => goCard(item.memberUser), item.id)
          });
        }),
        c: common_vendor.p({
          type: "staff",
          size: "14",
          color: "#FF6A00"
        }),
        d: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        })
      } : {}, {
        e: list.value.length === 0 && loadingStatus.value === "noMore"
      }, list.value.length === 0 && loadingStatus.value === "noMore" ? {
        f: common_assets._imports_0$8
      } : {}, {
        g: common_vendor.p({
          status: loadingStatus.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e21cc623"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/user-view-trace/user-view-trace.js.map
