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
       */
      saveOrUpdate: (scoreData) => {
        return utils_request.request("/app-api/member/user-scores/saveOrUpdate", {
          method: "POST",
          data: scoreData
        });
      },
      /**
       * 获取用户评分
       * @param {Number|String} userId - 当前登录用户ID
       * @param {Number|String} scorerId - 被评分/查看的用户ID
       */
      getInfo: (userId, scorerId) => {
        return utils_request.request("/app-api/member/user-scores/getInfo", {
          method: "GET",
          data: {
            userId,
            scorerId
          }
        });
      }
    };
    const currentUserId = common_vendor.ref(null);
    const targetUserId = common_vendor.ref(null);
    const isSelf = common_vendor.ref(false);
    const scoreRecordId = common_vendor.ref(null);
    const isSubmitting = common_vendor.ref(false);
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
      currentUserId.value = common_vendor.index.getStorageSync("userId");
      if (options.id) {
        targetUserId.value = options.id;
      } else {
        targetUserId.value = currentUserId.value;
      }
      common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:147", "查看用户id:", targetUserId);
      isSelf.value = String(targetUserId.value) === String(currentUserId.value);
      common_vendor.index.setNavigationBarTitle({
        title: isSelf.value ? "数字标签(自我评价)" : "商友评分"
      });
    });
    common_vendor.onMounted(() => {
      fetchScores();
    });
    const fetchScores = async () => {
      scoreRecordId.value = null;
      Object.keys(scores.value).forEach((key) => {
        scores.value[key] = 0;
      });
      if (!currentUserId.value || !targetUserId.value) {
        common_vendor.index.__f__("error", "at pages/my-edit-label/my-edit-label.vue:178", "缺少 ID 信息:", {
          me: currentUserId.value,
          target: targetUserId.value
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        const me = String(currentUserId.value);
        const target = String(targetUserId.value);
        common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:194", `🚀 发起请求 -> userId(我): ${me}, scorerId(目标): ${target}`);
        const {
          data,
          error
        } = await ScoreApi.getInfo(me, target);
        if (!error && data) {
          common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:202", "✅ 接口返回数据:", data);
          if (String(data.scorerId) !== target) {
            common_vendor.index.__f__("warn", "at pages/my-edit-label/my-edit-label.vue:207", "⚠️ 后端返回的被评分人 ID 与请求不符，可能不存在历史评分");
            return;
          }
          scoreRecordId.value = data.id;
          Object.keys(scores.value).forEach((key) => {
            if (data[key] !== void 0 && data[key] !== null) {
              scores.value[key] = data[key];
            }
          });
        } else {
          common_vendor.index.__f__("log", "at pages/my-edit-label/my-edit-label.vue:219", "💡 未找到该评价记录，显示默认分");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my-edit-label/my-edit-label.vue:222", "[Fetch Error]", e);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const submitScores = async () => {
      if (isSubmitting.value)
        return;
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
        // 记录ID (新增为null)
        scorerId: targetUserId.value,
        // 被评分人
        userId: currentUserId.value
        // 评分人 (操作者)
      };
      const {
        data: newRecord,
        error
      } = await ScoreApi.saveOrUpdate(payload);
      common_vendor.index.hideLoading();
      isSubmitting.value = false;
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-edit-label/my-edit-label.vue:270", "评分保存失败:", error);
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
        a: common_vendor.t(isSelf.value ? "数字标签（自我评价）" : "给商友评分"),
        b: common_vendor.t(isSelf.value ? "请对自己以下维度的表现进行1-10分评估" : "请对TA以下维度的表现进行1-10分评估"),
        c: common_vendor.p({
          type: "info-filled",
          size: "16",
          color: "#FF8C00"
        }),
        d: common_vendor.o(($event) => scores.value = $event),
        e: common_vendor.p({
          modelValue: scores.value
        }),
        f: common_vendor.t(isSubmitting.value ? "保存中..." : "保存评分"),
        g: isSubmitting.value,
        h: common_vendor.o(submitScores)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-03f92355"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-edit-label/my-edit-label.js.map
