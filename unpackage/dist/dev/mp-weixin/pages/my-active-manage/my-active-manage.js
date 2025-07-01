"use strict";
const common_vendor = require("../../common/vendor.js");
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
    const participantList = common_vendor.ref([]);
    const bannerText = common_vendor.ref("");
    const pendingUsers = common_vendor.computed(
      () => participantList.value.filter((u) => u.refundStatus === "pending")
    );
    const completedUsers = common_vendor.computed(
      () => participantList.value.filter((u) => u.refundStatus === "completed")
    );
    common_vendor.onLoad((options) => {
      const activityId = options.id;
      const mode = options.mode;
      activityInfo.value = {
        id: activityId,
        title: "宠物爱好者交流聚会",
        image: "../../static/abc.png",
        date: "2023年12月2日 10:00-14:00",
        location: "人民公园草坪区",
        participants: { current: 23, total: 30 },
        totalRefundAmount: "4,554.00"
      };
      if (mode === "individual") {
        bannerText.value = "请为提交申请的用户办理退款";
        participantList.value = [
          { id: 201, name: "赵六", avatar: "../../static/avatar4.png", qrCodeUrl: "../../static/qrcode.png", refundProofUrl: null, refundStatus: "pending" },
          { id: 202, name: "孙七", avatar: "../../static/avatar5.png", qrCodeUrl: "../../static/qrcode.png", refundProofUrl: null, refundStatus: "pending" },
          // 注意：这里也可以包含已处理的申请，让组织者能在“已完成”tab里看到
          { id: 203, name: "周八", avatar: "../../static/avatar6.png", qrCodeUrl: "../../static/qrcode.png", refundProofUrl: "../../static/proof.png", refundStatus: "completed" }
        ];
      } else {
        bannerText.value = "活动已取消，请为报名用户办理退款";
        participantList.value = [
          { id: 101, name: "张三", avatar: "../../static/avatar1.png", qrCodeUrl: "../../static/qrcode.png", refundProofUrl: null, refundStatus: "pending" },
          { id: 102, name: "李四", avatar: "../../static/avatar2.png", qrCodeUrl: "../../static/qrcode.png", refundProofUrl: "../../static/proof.png", refundStatus: "completed" },
          { id: 103, name: "王五", avatar: "../../static/avatar3.png", qrCodeUrl: "../../static/qrcode.png", refundProofUrl: null, refundStatus: "pending" }
        ];
      }
    });
    const switchTab = (index) => {
      currentTab.value = index;
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url]
      });
    };
    const uploadProof = (user) => {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "正在上传" });
          setTimeout(() => {
            const targetUser = participantList.value.find((u) => u.id === user.id);
            if (targetUser) {
              targetUser.refundProofUrl = tempFilePath;
              targetUser.refundStatus = "completed";
            }
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "凭证上传成功",
              icon: "success"
            });
          }, 1e3);
        }
      });
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
        p: common_vendor.n({
          "active": currentTab.value === 0
        }),
        q: common_vendor.o(($event) => switchTab(0)),
        r: common_vendor.n({
          "active": currentTab.value === 1
        }),
        s: common_vendor.o(($event) => switchTab(1)),
        t: common_vendor.p({
          type: "person-filled",
          color: "#FF6B00",
          size: "20"
        }),
        v: common_vendor.t(pendingUsers.value.length),
        w: pendingUsers.value.length > 0
      }, pendingUsers.value.length > 0 ? {
        x: common_vendor.f(pendingUsers.value, (user, k0, i0) => {
          return {
            a: user.avatar,
            b: common_vendor.t(user.name),
            c: user.qrCodeUrl,
            d: common_vendor.o(($event) => previewImage(user.qrCodeUrl), user.id),
            e: "c2678471-5-" + i0,
            f: common_vendor.o(($event) => uploadProof(user), user.id),
            g: user.id
          };
        }),
        y: common_vendor.p({
          type: "plusempty",
          color: "#FF6B00",
          size: "16"
        })
      } : {}, {
        z: currentTab.value === 0,
        A: common_vendor.p({
          type: "checkbox-filled",
          color: "#4caf50",
          size: "20"
        }),
        B: common_vendor.t(completedUsers.value.length),
        C: completedUsers.value.length > 0
      }, completedUsers.value.length > 0 ? {
        D: common_vendor.f(completedUsers.value, (user, k0, i0) => {
          return {
            a: user.avatar,
            b: common_vendor.t(user.name),
            c: user.refundProofUrl,
            d: common_vendor.o(($event) => previewImage(user.refundProofUrl), user.id),
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
