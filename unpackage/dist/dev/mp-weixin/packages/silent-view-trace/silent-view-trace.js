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
const defaultSilentAvatar = "https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png";
const _sfc_main = {
  __name: "silent-view-trace",
  setup(__props) {
    const targetId = common_vendor.ref(null);
    const targetType = common_vendor.ref("post");
    const list = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    common_vendor.onLoad((options) => {
      targetId.value = options.id;
      targetType.value = options.type || "post";
      common_vendor.index.setNavigationBarTitle({
        title: "潜在商友列表"
      });
      loadData(true);
    });
    const loadData = async (isRefresh = false) => {
      var _a, _b, _c;
      if (isRefresh) {
        pageNo.value = 1;
        list.value = [];
      }
      loadingStatus.value = "loading";
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/target-view/silent-login-page", {
          method: "GET",
          data: {
            targetId: targetId.value,
            targetType: targetType.value,
            pageNo: pageNo.value,
            pageSize: 20
          }
        });
        common_vendor.index.__f__("log", "at packages/silent-view-trace/silent-view-trace.vue:86", "------------------------------------");
        common_vendor.index.__f__("log", "at packages/silent-view-trace/silent-view-trace.vue:87", "📁 静默用户接口请求参数:", {
          targetId: targetId.value,
          targetType: targetType.value
        });
        common_vendor.index.__f__("log", "at packages/silent-view-trace/silent-view-trace.vue:91", "✅ 静默用户接口返回原始数据:", data);
        if (data && data.list) {
          common_vendor.index.__f__("log", "at packages/silent-view-trace/silent-view-trace.vue:93", "👤 第一位用户信息详情 (memberUser):", (_a = data.list[0]) == null ? void 0 : _a.memberUser);
          common_vendor.index.__f__("log", "at packages/silent-view-trace/silent-view-trace.vue:94", "🤝 第一位邀请人信息详情 (parentUser):", (_c = (_b = data.list[0]) == null ? void 0 : _b.memberUser) == null ? void 0 : _c.parentUser);
        }
        common_vendor.index.__f__("log", "at packages/silent-view-trace/silent-view-trace.vue:96", "------------------------------------");
        if (!error && data) {
          const newList = data.list || [];
          list.value = isRefresh ? newList : [...list.value, ...newList];
          loadingStatus.value = list.value.length >= data.total ? "noMore" : "more";
          pageNo.value++;
        } else {
          loadingStatus.value = "noMore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/silent-view-trace/silent-view-trace.vue:107", "加载异常:", e);
        loadingStatus.value = "more";
      }
    };
    const formatTime = (ts) => {
      if (!ts)
        return "";
      const date = new Date(Number(ts) || ts);
      const Y = date.getFullYear();
      const M = String(date.getMonth() + 1).padStart(2, "0");
      const D = String(date.getDate()).padStart(2, "0");
      const h = date.getHours();
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length > 0
      }, list.value.length > 0 ? {
        b: common_vendor.f(list.value, (item, k0, i0) => {
          var _a, _b, _c;
          return common_vendor.e({
            a: ((_a = item.memberUser) == null ? void 0 : _a.avatar) || defaultSilentAvatar,
            b: common_vendor.t(item.memberUser.nickname || "商友"),
            c: common_vendor.t(formatTime(item.memberUser.createTime)),
            d: (_b = item.memberUser) == null ? void 0 : _b.parentUser
          }, ((_c = item.memberUser) == null ? void 0 : _c.parentUser) ? {
            e: item.memberUser.parentUser.avatar,
            f: common_vendor.t(item.memberUser.parentUser.nickname || "系统推荐")
          } : {}, {
            g: item.viewCount
          }, item.viewCount ? {
            h: "217e72b8-0-" + i0,
            i: common_vendor.p({
              type: "eye",
              size: "14",
              color: "#999"
            }),
            j: common_vendor.t(item.viewCount)
          } : {}, {
            k: item.id
          });
        })
      } : {}, {
        c: common_vendor.p({
          status: loadingStatus.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-217e72b8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/silent-view-trace/silent-view-trace.js.map
