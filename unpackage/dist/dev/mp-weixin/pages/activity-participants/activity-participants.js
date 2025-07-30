"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_load_more2 + _easycom_uni_icons2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "activity-participants",
  setup(__props) {
    const activityId = common_vendor.ref(null);
    const participantList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(15);
    const total = common_vendor.ref(0);
    const loadingStatus = common_vendor.ref("more");
    const isEmpty = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.id) {
        activityId.value = options.id;
        common_vendor.index.setNavigationBarTitle({
          title: "报名用户"
        });
        getParticipantList(true);
      }
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        getParticipantList();
      }
    });
    const getParticipantList = async (isFirstLoad = false) => {
      if (loadingStatus.value === "loading")
        return;
      loadingStatus.value = "loading";
      if (isFirstLoad) {
        pageNo.value = 1;
        participantList.value = [];
        isEmpty.value = false;
      }
      const { data, error } = await utils_request.request("/app-api/member/activity-join/list", {
        method: "GET",
        data: {
          activityId: activityId.value,
          pageNo: pageNo.value,
          pageSize: pageSize.value
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/activity-participants/activity-participants.vue:73", "获取报名用户列表失败:", error);
        loadingStatus.value = "more";
        return;
      }
      if (data && data.list) {
        participantList.value = [...participantList.value, ...data.list];
        total.value = data.total;
        if (participantList.value.length >= total.value) {
          loadingStatus.value = "noMore";
        } else {
          loadingStatus.value = "more";
          pageNo.value++;
        }
        if (isFirstLoad && data.list.length === 0) {
          isEmpty.value = true;
        }
      } else {
        loadingStatus.value = "noMore";
        if (isFirstLoad) {
          isEmpty.value = true;
        }
      }
    };
    const formatJoinTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const M = date.getMonth() + 1;
      const D = date.getDate();
      return `${M}月${D}日`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(participantList.value, (item, k0, i0) => {
          return {
            a: item.memberUser.avatar,
            b: common_vendor.t(item.memberUser.nickname || "匿名用户"),
            c: common_vendor.t(formatJoinTime(item.createTime)),
            d: item.id
          };
        }),
        b: common_vendor.p({
          status: loadingStatus.value
        }),
        c: isEmpty.value
      }, isEmpty.value ? {
        d: common_vendor.p({
          type: "staff-filled",
          size: "60",
          color: "#ccc"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d6800723"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activity-participants/activity-participants.js.map
