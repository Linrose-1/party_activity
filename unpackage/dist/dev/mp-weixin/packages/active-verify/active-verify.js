"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "active-verify",
  setup(__props) {
    const activityId = common_vendor.ref(null);
    const joinUserId = common_vendor.ref(null);
    const activityInfo = common_vendor.ref(null);
    const participantInfo = common_vendor.ref(null);
    const isVerifying = common_vendor.ref(false);
    common_vendor.onLoad(async (options) => {
      if (options.scene) {
        const scene = decodeURIComponent(options.scene);
        const params = {};
        scene.split("&").forEach((v) => {
          const [key, val] = v.split("=");
          params[key] = val;
        });
        activityId.value = params.a;
        joinUserId.value = params.u;
      } else {
        activityId.value = options.activityId;
        joinUserId.value = options.joinUserId;
      }
      if (!activityId.value || !joinUserId.value) {
        common_vendor.index.showModal({
          title: "参数错误",
          content: "无法识别核销信息",
          showCancel: false
        });
        return;
      }
      loadData();
    });
    const loadData = async () => {
      var _a, _b;
      common_vendor.index.showLoading({
        title: "信息获取中..."
      });
      const [actRes, joinRes] = await Promise.all([
        utils_request.request("/app-api/member/activity/get", {
          method: "GET",
          data: {
            id: activityId.value
          }
        }),
        utils_request.request("/app-api/member/activity-join/list", {
          method: "GET",
          data: {
            activityId: activityId.value,
            userId: joinUserId.value,
            pageNo: 1,
            pageSize: 1
          }
        })
      ]);
      common_vendor.index.hideLoading();
      if (actRes.data)
        activityInfo.value = actRes.data;
      if (((_b = (_a = joinRes.data) == null ? void 0 : _a.list) == null ? void 0 : _b.length) > 0) {
        participantInfo.value = joinRes.data.list[0];
      } else {
        common_vendor.index.showModal({
          title: "提示",
          content: "未查询到该用户的报名记录",
          showCancel: false
        });
      }
    };
    const formattedActivityTime = common_vendor.computed(() => {
      if (!activityInfo.value)
        return "";
      const d = new Date(activityInfo.value.startDatetime);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    });
    const handleConfirmVerify = async () => {
      common_vendor.index.showModal({
        title: "确认核销",
        content: `确认已核对商友【${participantInfo.value.userName}】身份并签到？`,
        success: async (res) => {
          if (!res.confirm)
            return;
          isVerifying.value = true;
          const result = await utils_request.request("/app-api/member/activity/verify", {
            method: "POST",
            data: {
              activityId: Number(activityId.value),
              joinUserId: Number(joinUserId.value)
            }
          });
          isVerifying.value = false;
          if (!result.error) {
            common_vendor.index.showToast({
              title: "核销成功",
              icon: "success"
            });
            setTimeout(() => loadData(), 1e3);
          } else {
            const errMsg = result.error.msg || result.error || "核销失败";
            common_vendor.index.showModal({
              title: "核销失败",
              content: errMsg,
              showCancel: false,
              confirmColor: "#FF62B1"
            });
          }
        }
      });
    };
    const goBack = () => common_vendor.index.navigateBack();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityInfo.value && participantInfo.value
      }, activityInfo.value && participantInfo.value ? {
        b: common_vendor.p({
          type: "info-filled",
          size: "20",
          color: "#FF62B1"
        }),
        c: activityInfo.value.coverImageUrl,
        d: common_vendor.t(activityInfo.value.activityTitle),
        e: common_vendor.t(formattedActivityTime.value),
        f: participantInfo.value.memberUser.avatar,
        g: common_vendor.t(participantInfo.value.userName || participantInfo.value.memberUser.nickname),
        h: common_vendor.t(participantInfo.value.userPhone),
        i: common_vendor.t(participantInfo.value.contactAddress || "未填写公司"),
        j: common_vendor.t(participantInfo.value.paymentStatusStr),
        k: common_vendor.n(participantInfo.value.paymentStatus === "2" ? "success" : "warn"),
        l: common_vendor.t(participantInfo.value.isVerified === 1 ? "✅ 已核销" : "❌ 未核销"),
        m: common_vendor.o(goBack),
        n: common_vendor.t(participantInfo.value.isVerified === 1 ? "此码已核销" : "确认核销签到"),
        o: isVerifying.value || participantInfo.value.isVerified === 1,
        p: common_vendor.o(handleConfirmVerify)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2d1f06c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-verify/active-verify.js.map
