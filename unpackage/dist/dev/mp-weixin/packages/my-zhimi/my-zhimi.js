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
  __name: "my-zhimi",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const recentRecords = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      fetchUserInfo();
      fetchRecentRecords();
    });
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get");
      if (!error)
        userInfo.value = data;
    };
    const fetchRecentRecords = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/point/record/my-point-list", {
        data: {
          pageNo: 1,
          pageSize: 5
        }
      });
      if (!error && data) {
        recentRecords.value = data.list;
      }
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const goToAllRecords = () => {
      common_vendor.index.navigateTo({
        url: "/packages/smart-rice-records/smart-rice-records"
      });
    };
    const handleExchangeSmartRice = () => {
      common_vendor.index.showToast({
        title: "兑换功能正在开发中",
        icon: "none"
      });
    };
    const handleRechargeSmartRice = () => {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "wallet-filled",
          size: "22",
          color: "#FF6F00"
        }),
        c: common_vendor.t(userInfo.value.point || 0),
        d: common_vendor.t(userInfo.value.totalPoint || 0),
        e: common_vendor.o(handleExchangeSmartRice),
        f: common_vendor.o(handleRechargeSmartRice),
        g: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        h: common_vendor.o(goToAllRecords),
        i: recentRecords.value.length > 0
      }, recentRecords.value.length > 0 ? {
        j: common_vendor.f(recentRecords.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(formatDate(item.createTime)),
            c: common_vendor.t(item.point > 0 ? "+" : ""),
            d: common_vendor.t(item.point),
            e: item.point > 0 ? 1 : "",
            f: item.id
          };
        })
      } : {}) : {
        k: common_vendor.p({
          status: "loading",
          contentText: "加载中..."
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7da666c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-zhimi/my-zhimi.js.map
