"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_rate2 = common_vendor.resolveComponent("uni-rate");
  _easycom_uni_rate2();
}
const _easycom_uni_rate = () => "../../uni_modules/uni-rate/components/uni-rate/uni-rate.js";
if (!Math) {
  _easycom_uni_rate();
}
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
          data: { userId }
        });
      }
    };
    const scoreCategories = common_vendor.ref([
      {
        title: "基础信用",
        items: [
          { label: "守时", key: "punctuality" },
          { label: "守诺", key: "promiseKeep" },
          { label: "守法", key: "lawAbiding" },
          { label: "尽责", key: "responsible" }
        ]
      },
      {
        title: "协助态度",
        items: [
          { label: "真诚", key: "sincere" },
          { label: "包容", key: "tolerance" },
          { label: "利他", key: "altruism" },
          { label: "共情", key: "empathy" }
        ]
      },
      {
        title: "专业能力",
        items: [
          { label: "专注", key: "focus" },
          { label: "高效", key: "efficient" },
          { label: "细致", key: "detailOriented" },
          { label: "拓局", key: "expandVision" }
        ]
      },
      {
        title: "精神格局",
        items: [
          { label: "贡献", key: "contribution" },
          { label: "谦逊", key: "humility" },
          { label: "远见", key: "foresight" },
          { label: "使命", key: "mission" }
        ]
      }
    ]);
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
        common_vendor.index.showToast({ title: "无法获取用户信息，请重新登录", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "正在加载评分..." });
      const { data: userScores, error } = await ScoreApi.getMyScores(userId);
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.__f__("warn", "at pages/my-edit-label/my-edit-label.vue:138", "获取已有评分失败:", error);
        return;
      }
      if (userScores) {
        common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:144", "成功获取到已有评分:", userScores);
        scoreRecordId.value = userScores.id;
        Object.keys(scores.value).forEach((key) => {
          if (userScores[key] !== void 0 && userScores[key] !== null) {
            scores.value[key] = userScores[key];
          }
        });
      } else {
        common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:154", "用户尚未评分，将使用默认值。");
      }
    });
    const submitScores = async () => {
      if (isSubmitting.value)
        return;
      common_vendor.index.getStorageSync("userInfo");
      const userId = common_vendor.index.getStorageSync("userId");
      if (!userId) {
        common_vendor.index.showToast({ title: "无法获取用户信息，请重新登录", icon: "none" });
        return;
      }
      isSubmitting.value = true;
      common_vendor.index.showLoading({ title: "正在保存..." });
      const payload = {
        ...scores.value,
        id: scoreRecordId.value,
        // 如果是首次评分，id为null
        userId,
        scorerId: userId
      };
      const { data: newRecord, error } = await ScoreApi.saveOrUpdate(payload);
      common_vendor.index.hideLoading();
      isSubmitting.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit-label/my-edit-label.vue:189", "评分保存失败:", error);
        common_vendor.index.showToast({ title: `保存失败: ${error}`, icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "保存成功！", icon: "success" });
      if (newRecord && newRecord.id) {
        scoreRecordId.value = newRecord.id;
      }
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(scoreCategories.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.title),
            b: common_vendor.f(category.items, (item, k1, i1) => {
              return {
                a: common_vendor.t(item.label),
                b: "03f92355-0-" + i0 + "-" + i1,
                c: common_vendor.o(($event) => scores.value[item.key] = $event, item.key),
                d: common_vendor.p({
                  max: 10,
                  size: 22,
                  color: "#c0c0c0",
                  ["active-color"]: "#FF8C00",
                  ["allow-half"]: false,
                  modelValue: scores.value[item.key]
                }),
                e: item.key
              };
            }),
            c: category.title
          };
        }),
        b: common_vendor.t(isSubmitting.value ? "保存中..." : "保存评分"),
        c: isSubmitting.value,
        d: common_vendor.o(submitScores)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-03f92355"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit-label/my-edit-label.js.map
