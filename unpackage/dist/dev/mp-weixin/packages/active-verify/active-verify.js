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
      common_vendor.index.__f__("log", "at packages/active-verify/active-verify.vue:77", "📥 [核销页收到参数]:", options);
      if (options.activityId && options.joinUserId) {
        activityId.value = options.activityId;
        joinUserId.value = options.joinUserId;
      } else if (options.scene) {
        const scene = decodeURIComponent(options.scene);
        const params = {};
        scene.split("&").forEach((v) => {
          const [key, val] = v.split("=");
          params[key] = val;
        });
        activityId.value = params.a || params.activityId;
        joinUserId.value = params.u || params.joinUserId;
      }
      if (!activityId.value || !joinUserId.value) {
        common_vendor.index.showModal({
          title: "识别失败",
          content: "核销凭证数据丢失，请重新扫码",
          showCancel: false,
          success: () => common_vendor.index.navigateBack()
        });
        return;
      }
      loadData();
    });
    const loadData = async () => {
      common_vendor.index.showLoading({
        title: "拉取核销资料..."
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
            activityId: String(activityId.value),
            userId: String(joinUserId.value),
            pageNo: 1,
            pageSize: 1
          }
        })
      ]);
      common_vendor.index.hideLoading();
      if (actRes.data)
        activityInfo.value = actRes.data;
      if (joinRes.data && joinRes.data.list && joinRes.data.list.length > 0) {
        participantInfo.value = joinRes.data.list[0];
        common_vendor.index.__f__("log", "at packages/active-verify/active-verify.vue:140", "✅ 获取到报名商友信息:", participantInfo.value);
      } else {
        common_vendor.index.showModal({
          title: "无法核销",
          content: "未查询到该用户的报名记录，请核实该商友是否已在此聚会报名。",
          showCancel: false
        });
      }
    };
    const formattedActivityTime = common_vendor.computed(() => {
      if (!activityInfo.value)
        return "";
      const d = new Date(activityInfo.value.startDatetime);
      const pad = (n) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    });
    const handleConfirmVerify = async () => {
      const showName = participantInfo.value.memberUser.realName || participantInfo.value.memberUser.nickname || "商友";
      common_vendor.index.showModal({
        title: "身份核对确认",
        content: `已确认商友【${showName}】到场？
核销后将无法撤回。`,
        confirmColor: "#FF62B1",
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
            setTimeout(() => loadData(), 800);
          } else {
            const errMsg = typeof result.error === "object" ? result.error.msg || "核销请求失败" : result.error;
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
        g: common_vendor.t(participantInfo.value.memberUser.realName || participantInfo.value.memberUser.nickname),
        h: common_vendor.t(participantInfo.value.memberUser.mobile),
        i: common_vendor.t(participantInfo.value.paymentStatusStr),
        j: common_vendor.n(participantInfo.value.paymentStatus === "2" ? "success" : "warn"),
        k: common_vendor.t(participantInfo.value.isVerified === 1 ? "✅ 已核销" : "❌ 未核销"),
        l: common_vendor.n(participantInfo.value.isVerified === 1 ? "success" : "warn"),
        m: common_vendor.o(goBack),
        n: common_vendor.t(participantInfo.value.isVerified === 1 ? "此码已完成核销" : "确认核销签到"),
        o: isVerifying.value || participantInfo.value.isVerified === 1,
        p: common_vendor.o(handleConfirmVerify)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2d1f06c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/active-verify/active-verify.js.map
