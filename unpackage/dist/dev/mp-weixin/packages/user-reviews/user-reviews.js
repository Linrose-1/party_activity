"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + ScoreForm)();
}
const ScoreForm = () => "../../components/ScoreForm.js";
const _sfc_main = {
  __name: "user-reviews",
  setup(__props) {
    const currentTab = common_vendor.ref(1);
    const targetUserId = common_vendor.ref(null);
    const currentUserId = common_vendor.ref(null);
    const isSubmitting = common_vendor.ref(false);
    const scoreRecordId = common_vendor.ref(null);
    const scores = common_vendor.ref({
      punctuality: 0,
      promiseKeep: 0,
      lawAbiding: 0,
      responsible: 0,
      sincere: 0,
      tolerance: 0,
      altruism: 0,
      empathy: 0,
      focus: 0,
      efficient: 0,
      detailOriented: 0,
      expandVision: 0,
      contribution: 0,
      humility: 0,
      foresight: 0,
      mission: 0
    });
    common_vendor.onLoad((options) => {
      if (options.userId) {
        targetUserId.value = options.userId;
      } else {
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
      currentUserId.value = common_vendor.index.getStorageSync("userId");
    });
    common_vendor.onMounted(async () => {
    });
    const submitScores = async () => {
      if (isSubmitting.value)
        return;
      isSubmitting.value = true;
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      const payload = {
        ...scores.value,
        id: scoreRecordId.value,
        // 如果是新增则为 null
        scorerId: targetUserId.value,
        // 传被评价人的 ID
        userId: currentUserId.value
        // 传自己的 ID
      };
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user-scores/saveOrUpdate", {
          method: "POST",
          data: payload
        });
        common_vendor.index.hideLoading();
        if (error) {
          common_vendor.index.showToast({
            title: error.msg || "提交失败",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: "评价成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === 0
      }, currentTab.value === 0 ? {} : {}, {
        b: currentTab.value === 0 ? 1 : "",
        c: common_vendor.o(($event) => currentTab.value = 0),
        d: currentTab.value === 1
      }, currentTab.value === 1 ? {} : {}, {
        e: currentTab.value === 1 ? 1 : "",
        f: common_vendor.o(($event) => currentTab.value = 1),
        g: currentTab.value === 0
      }, currentTab.value === 0 ? {} : {}, {
        h: currentTab.value === 1
      }, currentTab.value === 1 ? {
        i: common_vendor.p({
          type: "info-filled",
          size: "16",
          color: "#FF8C00"
        }),
        j: common_vendor.o(($event) => scores.value = $event),
        k: common_vendor.p({
          modelValue: scores.value
        }),
        l: common_vendor.t(isSubmitting.value ? "提交中..." : "提交评价"),
        m: isSubmitting.value,
        n: common_vendor.o(submitScores)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-91a56258"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/user-reviews/user-reviews.js.map
