"use strict";
const common_vendor = require("../../common/vendor.js");
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
  __name: "experience-records",
  setup(__props) {
    const tabOptions = [
      {
        label: "全部",
        value: ""
      },
      {
        label: "累计贡分",
        value: "0"
      },
      {
        label: "可用贡分",
        value: "1"
      }
    ];
    const recordList = common_vendor.ref([]);
    const loadingStatus = common_vendor.ref("more");
    const dateRange = common_vendor.ref([]);
    const queryParams = common_vendor.ref({
      pageNo: 1,
      pageSize: 15,
      type: ""
      // 0 累计, 1 当前
    });
    const dateRangeText = common_vendor.computed(() => {
      return dateRange.value.length === 2 ? `${dateRange.value[0]} 至 ${dateRange.value[1]}` : "按时间筛选";
    });
    common_vendor.onMounted(() => loadData(true));
    common_vendor.onPullDownRefresh(() => loadData(true));
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "noMore")
        return;
      queryParams.value.pageNo++;
      loadData(false);
    });
    const loadData = async (isRefresh = false) => {
      if (isRefresh) {
        queryParams.value.pageNo = 1;
        loadingStatus.value = "loading";
      }
      const sendData = {
        ...queryParams.value
      };
      if (dateRange.value.length === 2) {
        sendData.createTime = [dateRange.value[0] + " 00:00:00", dateRange.value[1] + " 23:59:59"];
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/experience-record/my-experience-list", {
        data: sendData
      });
      common_vendor.index.stopPullDownRefresh();
      if (error)
        return;
      recordList.value = isRefresh ? data.list : [...recordList.value, ...data.list];
      loadingStatus.value = recordList.value.length >= data.total ? "noMore" : "more";
    };
    const handleTabChange = (val) => {
      queryParams.value.type = val;
      loadData(true);
    };
    const handleDateChange = (val) => {
      dateRange.value = val;
      loadData(true);
    };
    const resetFilter = () => {
      dateRange.value = [];
      loadData(true);
    };
    const formatFullTime = (ts) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabOptions, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.label),
            b: queryParams.value.type === item.value
          }, queryParams.value.type === item.value ? {} : {}, {
            c: index,
            d: queryParams.value.type === item.value ? 1 : "",
            e: common_vendor.o(($event) => handleTabChange(item.value), index)
          });
        }),
        b: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#666"
        }),
        c: common_vendor.t(dateRangeText.value),
        d: common_vendor.o(handleDateChange),
        e: common_vendor.o(($event) => dateRange.value = $event),
        f: common_vendor.p({
          type: "daterange",
          modelValue: dateRange.value
        }),
        g: dateRange.value.length
      }, dateRange.value.length ? {
        h: common_vendor.o(resetFilter)
      } : {}, {
        i: recordList.value.length > 0
      }, recordList.value.length > 0 ? {
        j: common_vendor.f(recordList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.experience > 0 ? "+" : ""),
            c: common_vendor.t(item.experience),
            d: item.experience > 0 ? 1 : "",
            e: common_vendor.t(item.description),
            f: common_vendor.t(formatFullTime(item.createTime)),
            g: index
          };
        }),
        k: common_vendor.p({
          status: loadingStatus.value
        })
      } : loadingStatus.value !== "loading" ? {} : {}, {
        l: loadingStatus.value !== "loading"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-32cf1b5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/experience-records/experience-records.js.map
