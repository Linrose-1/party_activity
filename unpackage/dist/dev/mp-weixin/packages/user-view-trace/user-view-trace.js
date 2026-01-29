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
  __name: "user-view-trace",
  setup(__props) {
    const postId = common_vendor.ref(null);
    const list = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    common_vendor.onLoad((options) => {
      postId.value = options.id;
      loadData(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more")
        loadData();
    });
    const loadData = async (isRefresh = false) => {
      if (isRefresh)
        pageNo.value = 1;
      loadingStatus.value = "loading";
      const {
        data
      } = await utils_request.request("/app-api/member/business-opportunities-view/page", {
        method: "GET",
        data: {
          businessOpportunitiesId: postId.value,
          pageNo: pageNo.value,
          pageSize: 20
        }
      });
      if (data) {
        const newList = data.list || [];
        list.value = isRefresh ? newList : [...list.value, ...newList];
        loadingStatus.value = list.value.length >= data.total ? "noMore" : "more";
        pageNo.value++;
      }
    };
    const goCard = (user) => {
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`
      });
    };
    const formatTime = (ts) => {
      const date = new Date(ts);
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: item.memberUser.avatar,
            b: common_vendor.t(item.memberUser.nickname),
            c: common_vendor.t(formatTime(item.createTime)),
            d: common_vendor.t(item.viewCount),
            e: "e21cc623-0-" + i0,
            f: item.id,
            g: common_vendor.o(($event) => goCard(item.memberUser), item.id)
          };
        }),
        b: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        c: common_vendor.p({
          status: loadingStatus.value
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e21cc623"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/user-view-trace/user-view-trace.js.map
