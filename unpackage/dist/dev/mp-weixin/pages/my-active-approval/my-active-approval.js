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
  __name: "my-active-approval",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const activityInfo = common_vendor.ref({});
    const refundList = common_vendor.ref([]);
    const pendingUsers = common_vendor.computed(
      () => refundList.value.filter((u) => u.refundStatus === "pending")
    );
    const completedUsers = common_vendor.computed(
      () => refundList.value.filter((u) => u.refundStatus === "completed")
    );
    common_vendor.onLoad((options) => {
      const activityId = options.id;
      activityInfo.value = {
        id: activityId,
        title: "宠物爱好者交流聚会",
        image: "../../static/abc.png",
        date: "2023年12月2日 10:00-14:00"
      };
      refundList.value = [
        {
          id: 201,
          name: "赵六",
          avatar: "../../static/avatar4.png",
          qrCodeUrl: "../../static/qrcode.png",
          refundProofUrl: null,
          refundStatus: "pending"
          // 状态：待处理
        },
        {
          id: 202,
          name: "孙七",
          avatar: "../../static/avatar5.png",
          qrCodeUrl: "../../static/qrcode.png",
          refundProofUrl: null,
          refundStatus: "pending"
        },
        {
          id: 203,
          name: "周八",
          avatar: "../../static/avatar6.png",
          qrCodeUrl: "../../static/qrcode.png",
          refundProofUrl: "../../static/proof.png",
          refundStatus: "completed"
          // 状态：已完成
        }
      ];
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
      common_vendor.index.__f__("log", "at pages/my-active-approval/my-active-approval.vue:171", "✅✅✅ [SMOKE TEST] uploadProof function has been TRIGGERED! ✅✅✅");
      common_vendor.index.__f__("log", "at pages/my-active-approval/my-active-approval.vue:172", "User object received:", user);
      common_vendor.index.showModal({
        title: "测试",
        content: "您点击了上传按钮，函数已成功触发！",
        showCancel: false
      });
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          common_vendor.index.__f__("log", "at pages/my-active-approval/my-active-approval.vue:186", "【调试信息】 uni.chooseImage 返回的原始 res 对象是：", res);
          let tempFilePath = "";
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            tempFilePath = res.tempFilePaths[0];
          } else if (res.tempFiles && res.tempFiles.length > 0 && res.tempFiles[0].path) {
            tempFilePath = res.tempFiles[0].path;
          }
          if (!tempFilePath) {
            common_vendor.index.showToast({
              title: "未能获取到图片文件，请重试",
              icon: "none",
              duration: 3e3
            });
            common_vendor.index.__f__("error", "at pages/my-active-approval/my-active-approval.vue:205", "【严重错误】 无法从 chooseImage 的返回值中提取任何有效路径!", res);
            return;
          }
          common_vendor.index.__f__("log", "at pages/my-active-approval/my-active-approval.vue:209", "【最终提取路径】", tempFilePath);
          common_vendor.index.showLoading({
            title: "凭证上传中...",
            mask: true
          });
          try {
            const uploadResult = await utils_upload.uploadFile({
              path: tempFilePath
            }, {
              directory: "refund-proof"
            });
            if (uploadResult.error) {
              const errorMsg = typeof uploadResult.error === "object" ? uploadResult.error.msg : uploadResult.error;
              throw new Error(errorMsg || "上传失败");
            }
            const proofUrlFromServer = uploadResult.data;
            const confirmResult = await utils_request.request("/app-api/member/activity/confirm-refund", {
              method: "POST",
              data: {
                activityId: activityInfo.value.id,
                applyUserId: user.id,
                refundProofUrl: proofUrlFromServer
              }
            });
            if (confirmResult.error) {
              const errorMsg = typeof confirmResult.error === "object" ? confirmResult.error.msg : confirmResult.error;
              throw new Error(errorMsg || "确认退款失败");
            }
            common_vendor.index.hideLoading();
            const targetUser = refundList.value.find((u) => u.id === user.id);
            if (targetUser) {
              targetUser.refundProofUrl = proofUrlFromServer;
              targetUser.refundStatus = "completed";
            }
            common_vendor.index.showToast({
              title: "操作成功",
              icon: "success"
            });
          } catch (err) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: err.message || "操作失败，请重试",
              icon: "none",
              duration: 3e3
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/my-active-approval/my-active-approval.vue:273", "【调试信息】 uni.chooseImage 的 fail 回调触发！", err);
          if (err.errMsg && !err.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "选择图片失败",
              icon: "none"
            });
          }
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
        b: activityInfo.value.image,
        c: common_vendor.t(activityInfo.value.title),
        d: common_vendor.p({
          type: "calendar-filled",
          color: "#999",
          size: "16"
        }),
        e: common_vendor.t(activityInfo.value.date),
        f: common_vendor.n({
          "active": currentTab.value === 0
        }),
        g: common_vendor.o(($event) => switchTab(0)),
        h: common_vendor.n({
          "active": currentTab.value === 1
        }),
        i: common_vendor.o(($event) => switchTab(1)),
        j: common_vendor.p({
          type: "person-filled",
          color: "#FF6B00",
          size: "20"
        }),
        k: common_vendor.t(pendingUsers.value.length),
        l: pendingUsers.value.length > 0
      }, pendingUsers.value.length > 0 ? {
        m: common_vendor.f(pendingUsers.value, (user, k0, i0) => {
          return {
            a: user.avatar,
            b: common_vendor.t(user.name),
            c: user.qrCodeUrl,
            d: common_vendor.o(($event) => previewImage(user.qrCodeUrl), user.id),
            e: "163cd54b-3-" + i0,
            f: common_vendor.o(($event) => uploadProof(user), user.id),
            g: user.id
          };
        }),
        n: common_vendor.p({
          type: "plusempty",
          color: "#FF6B00",
          size: "16"
        })
      } : {}, {
        o: currentTab.value === 0,
        p: common_vendor.p({
          type: "checkbox-filled",
          color: "#4caf50",
          size: "20"
        }),
        q: common_vendor.t(completedUsers.value.length),
        r: completedUsers.value.length > 0
      }, completedUsers.value.length > 0 ? {
        s: common_vendor.f(completedUsers.value, (user, k0, i0) => {
          return {
            a: user.avatar,
            b: common_vendor.t(user.name),
            c: user.refundProofUrl,
            d: common_vendor.o(($event) => previewImage(user.refundProofUrl), user.id),
            e: user.id
          };
        })
      } : {}, {
        t: currentTab.value === 1
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-163cd54b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active-approval/my-active-approval.js.map
