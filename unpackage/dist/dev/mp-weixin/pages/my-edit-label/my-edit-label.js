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
  __name: "my-edit-label",
  setup(__props) {
    const ScoreApi = {
      /**
       * 保存或更新用户评分
       * @param {object} scoreData
       */
      saveOrUpdate: (scoreData) => {
        return utils_request.request("/app-api/member/user-scores/saveOrUpdate", {
          method: "POST",
          data: scoreData
        });
      },
      /**
       * 获取用户评分
       * @param {string|number} userId
       */
      getMyScores: (userId) => {
        return utils_request.request("/app-api/member/user-scores/getInfo", {
          method: "GET",
          data: {
            userId
          }
        });
      }
    };
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
    const scoreRecordId = common_vendor.ref(null);
    const isSubmitting = common_vendor.ref(false);
    common_vendor.onMounted(async () => {
      common_vendor.index.getStorageSync("userInfo");
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.showToast({
          title: "无法获取用户信息，请重新登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在加载评分..."
      });
      const {
        data: userScores,
        error
      } = await ScoreApi.getMyScores(userId);
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.__f__("warn", "at pages/my-edit-label/my-edit-label.vue:247", "获取已有评分失败:", error);
        return;
      }
      if (userScores) {
        common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:253", "成功获取到已有评分:", userScores);
        scoreRecordId.value = userScores.id;
        Object.keys(scores.value).forEach((key) => {
          if (userScores[key] !== void 0 && userScores[key] !== null) {
            scores.value[key] = userScores[key];
          }
        });
      } else {
        common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:263", "用户尚未评分，将使用默认值。");
      }
    });
    const submitScores = async () => {
      if (isSubmitting.value)
        return;
      common_vendor.index.getStorageSync("userInfo");
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.showToast({
          title: "无法获取用户信息，请重新登录",
          icon: "none"
        });
        return;
      }
      isSubmitting.value = true;
      common_vendor.index.showLoading({
        title: "正在保存..."
      });
      const payload = {
        ...scores.value,
        id: scoreRecordId.value,
        // 如果是首次评分，id为null
        userId,
        scorerId: userId
      };
      const {
        data: newRecord,
        error
      } = await ScoreApi.saveOrUpdate(payload);
      common_vendor.index.hideLoading();
      isSubmitting.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit-label/my-edit-label.vue:306", "评分保存失败:", error);
        common_vendor.index.showToast({
          title: `保存失败: ${error}`,
          icon: "none"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "保存成功！",
        icon: "success"
      });
      if (newRecord && newRecord.id) {
        scoreRecordId.value = newRecord.id;
      }
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "info-filled",
          size: "16",
          color: "#FF8C00"
        }),
        b: common_vendor.o(($event) => scores.value = $event),
        c: common_vendor.p({
          modelValue: scores.value
        }),
        d: common_vendor.t(isSubmitting.value ? "保存中..." : "保存评分"),
        e: isSubmitting.value,
        f: common_vendor.o(submitScores)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-03f92355"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit-label/my-edit-label.js.map
