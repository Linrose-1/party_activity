"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "my-active-manage",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const activityInfo = common_vendor.ref({});
    const fullActivityData = common_vendor.ref(null);
    const participantList = common_vendor.ref([]);
    const bannerText = common_vendor.ref("");
    const pageMode = common_vendor.ref("individual");
    const pendingUsers = common_vendor.computed(
      () => participantList.value.filter((u) => u.paymentStatus === "3")
    );
    const completedUsers = common_vendor.computed(
      () => participantList.value.filter((u) => u.paymentStatus === "6")
    );
    common_vendor.onLoad((options) => {
      if (options.item) {
        try {
          const decodedData = decodeURIComponent(options.item);
          const parsedData = JSON.parse(decodedData);
          fullActivityData.value = parsedData;
          activityInfo.value = {
            id: parsedData.id,
            title: parsedData.activityTitle,
            image: parsedData.coverImageUrl,
            date: formatDateTime(parsedData.startDatetime),
            location: parsedData.locationAddress || "线上聚会",
            participants: { current: parsedData.joinCount || 0 },
            totalRefundAmount: null
          };
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/my-active-manage/my-active-manage.vue:156", "解析聚会数据失败:", e);
          return;
        }
      }
      pageMode.value = options.mode || "individual";
      bannerText.value = pageMode.value === "individual" ? "请为提交申请的用户办理退款" : "聚会已取消，请为所有报名用户办理退款";
      fetchRefundList();
    });
    const fetchRefundList = async () => {
      if (!fullActivityData.value)
        return;
      common_vendor.index.showLoading({ title: "加载中..." });
      const statusToFetch = currentTab.value === 0 ? "3" : "6";
      const params = {
        activityId: fullActivityData.value.id,
        paymentStatus: statusToFetch,
        pageNo: 1,
        pageSize: 100
      };
      try {
        const result = await utils_request.request("/app-api/member/activity-join/list", {
          method: "GET",
          data: params
        });
        participantList.value = result.data ? result.data.list || [] : [];
      } catch (error) {
        common_vendor.index.showToast({ title: "加载列表失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const uploadProof = (user) => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "正在上传并确认..." });
          try {
            const uploadResult = await utils_upload.uploadFile(tempFilePath, { directory: "refund_proof" });
            if (uploadResult.error) {
              throw new Error(`上传失败: ${uploadResult.error}`);
            }
            const proofUrl = uploadResult.data;
            const payload = {
              id: user.id,
              // 报名记录的唯一标识符
              refundConfirmScreenshotUrl: proofUrl
              // 上传后的凭证URL
            };
            common_vendor.index.__f__("log", "at pages/my-active-manage/my-active-manage.vue:227", "确认退款接口请求体:", payload);
            const confirmResult = await utils_request.request("/app-api/member/activity-join/confirm-join-user-refund", {
              method: "POST",
              data: payload
            });
            if (confirmResult.error) {
              throw new Error(`确认失败: ${confirmResult.error}`);
            }
            common_vendor.index.showToast({ title: "操作成功", icon: "success" });
            fetchRefundList();
          } catch (error) {
            common_vendor.index.showToast({ title: error.message || "操作失败", icon: "none", duration: 2e3 });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    };
    const switchTab = (index) => {
      if (currentTab.value === index)
        return;
      currentTab.value = index;
      fetchRefundList();
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({ urls: [url] });
    };
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr)
        return "时间待定";
      const date = new Date(dateTimeStr);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      return `${Y}-${M}-${D}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "info-filled",
          color: "#FF6B00",
          size: "18"
        }),
        b: common_vendor.t(bannerText.value),
        c: activityInfo.value.image,
        d: common_vendor.t(activityInfo.value.title),
        e: common_vendor.p({
          type: "calendar-filled",
          color: "#999",
          size: "16"
        }),
        f: common_vendor.t(activityInfo.value.date),
        g: activityInfo.value.location
      }, activityInfo.value.location ? {
        h: common_vendor.p({
          type: "location-filled",
          color: "#999",
          size: "16"
        }),
        i: common_vendor.t(activityInfo.value.location)
      } : {}, {
        j: activityInfo.value.participants
      }, activityInfo.value.participants ? {
        k: common_vendor.p({
          type: "staff-filled",
          color: "#999",
          size: "16"
        }),
        l: common_vendor.t(activityInfo.value.participants.current)
      } : {}, {
        m: activityInfo.value.totalRefundAmount
      }, activityInfo.value.totalRefundAmount ? {} : {}, {
        n: activityInfo.value.totalRefundAmount
      }, activityInfo.value.totalRefundAmount ? {
        o: common_vendor.t(activityInfo.value.totalRefundAmount)
      } : {}, {
        p: pendingUsers.value.length > 0
      }, pendingUsers.value.length > 0 ? {
        q: common_vendor.t(pendingUsers.value.length)
      } : {}, {
        r: common_vendor.n({
          "active": currentTab.value === 0
        }),
        s: common_vendor.o(($event) => switchTab(0)),
        t: completedUsers.value.length > 0
      }, completedUsers.value.length > 0 ? {
        v: common_vendor.t(completedUsers.value.length)
      } : {}, {
        w: common_vendor.n({
          "active": currentTab.value === 1
        }),
        x: common_vendor.o(($event) => switchTab(1)),
        y: pendingUsers.value.length > 0
      }, pendingUsers.value.length > 0 ? {
        z: common_vendor.f(pendingUsers.value, (user, k0, i0) => {
          var _a, _b;
          return {
            a: ((_a = user.memberUser) == null ? void 0 : _a.avatar) || "../../static/avatar-placeholder.png",
            b: common_vendor.t(((_b = user.memberUser) == null ? void 0 : _b.nickname) || "未知用户"),
            c: user.refundScreenshotUrl,
            d: common_vendor.o(($event) => previewImage(user.refundScreenshotUrl), user.id),
            e: "c2678471-4-" + i0,
            f: common_vendor.o(($event) => uploadProof(user), user.id),
            g: user.id
          };
        }),
        A: common_vendor.p({
          type: "plusempty",
          color: "#FF6B00",
          size: "16"
        })
      } : {}, {
        B: currentTab.value === 0,
        C: completedUsers.value.length > 0
      }, completedUsers.value.length > 0 ? {
        D: common_vendor.f(completedUsers.value, (user, k0, i0) => {
          var _a, _b;
          return {
            a: ((_a = user.memberUser) == null ? void 0 : _a.avatar) || "../../static/avatar-placeholder.png",
            b: common_vendor.t(((_b = user.memberUser) == null ? void 0 : _b.nickname) || "未知用户"),
            c: user.refundConfirmScreenshotUrl,
            d: common_vendor.o(($event) => previewImage(user.refundConfirmScreenshotUrl), user.id),
            e: user.id
          };
        })
      } : {}, {
        E: currentTab.value === 1
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c2678471"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active-manage/my-active-manage.js.map
