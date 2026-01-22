"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_datetime_picker2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_datetime_picker + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "smart-rice-records",
  setup(__props) {
    const tabOptions = [
      {
        label: "全部",
        value: "all"
      },
      {
        label: "收入",
        value: "true"
      },
      // addStatus: true
      {
        label: "支出",
        value: "false"
      }
      // addStatus: false
    ];
    const currentTab = common_vendor.ref("all");
    const range = common_vendor.ref([]);
    const recordList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(15);
    const loadingStatus = common_vendor.ref("more");
    const dateRangeText = common_vendor.computed(() => {
      if (range.value && range.value.length === 2) {
        return `${range.value[0]} 至 ${range.value[1]}`;
      }
      return "选择时间范围";
    });
    common_vendor.onMounted(() => {
      loadData(true);
    });
    const loadData = async (isRefresh = false) => {
      if (isRefresh) {
        pageNo.value = 1;
        loadingStatus.value = "loading";
      }
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value
      };
      if (currentTab.value !== "all") {
        params.addStatus = currentTab.value === "true";
      }
      if (range.value && range.value.length === 2) {
        params.createTime = [
          range.value[0] + " 00:00:00",
          range.value[1] + " 23:59:59"
        ];
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/point/record/my-point-list", {
        data: params
      });
      if (error) {
        loadingStatus.value = "more";
        return;
      }
      const list = data.list || [];
      recordList.value = isRefresh ? list : [...recordList.value, ...list];
      loadingStatus.value = recordList.value.length >= data.total ? "noMore" : "more";
    };
    const handleTabChange = (val) => {
      currentTab.value = val;
      loadData(true);
    };
    const handleDateChange = (val) => {
      range.value = val;
      loadData(true);
    };
    const resetDate = () => {
      range.value = [];
      loadData(true);
    };
    common_vendor.onPullDownRefresh(async () => {
      await loadData(true);
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "noMore" || loadingStatus.value === "loading")
        return;
      pageNo.value++;
      loadData(false);
    });
    const formatFullTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabOptions, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.label),
            b: currentTab.value === item.value
          }, currentTab.value === item.value ? {} : {}, {
            c: index,
            d: currentTab.value === item.value ? 1 : "",
            e: common_vendor.o(($event) => handleTabChange(item.value), index)
          });
        }),
        b: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#666"
        }),
        c: common_vendor.t(dateRangeText.value),
        d: common_vendor.p({
          type: "bottom",
          size: "14",
          color: "#999"
        }),
        e: common_vendor.o(handleDateChange),
        f: common_vendor.o(($event) => range.value = $event),
        g: common_vendor.p({
          type: "daterange",
          ["clear-icon"]: true,
          modelValue: range.value
        }),
        h: range.value.length > 0
      }, range.value.length > 0 ? {
        i: common_vendor.o(resetDate)
      } : {}, {
        j: recordList.value.length > 0
      }, recordList.value.length > 0 ? {
        k: common_vendor.f(recordList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.description),
            c: common_vendor.t(formatFullTime(item.createTime)),
            d: common_vendor.t(item.point > 0 ? "+" : ""),
            e: common_vendor.t(item.point),
            f: item.point > 0 ? 1 : "",
            g: item.id
          };
        }),
        l: common_vendor.p({
          status: loadingStatus.value
        })
      } : loadingStatus.value !== "loading" ? {
        n: common_assets._imports_0$5
      } : {}, {
        m: loadingStatus.value !== "loading"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d744250"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/smart-rice-records/smart-rice-records.js.map
