"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput)();
}
const _sfc_main = {
  __name: "active-enroll",
  setup(__props) {
    const currentStep = common_vendor.ref(1);
    const isDragging = common_vendor.ref(false);
    const screenshot = common_vendor.ref(null);
    const formData = common_vendor.reactive({
      name: "",
      phone: "",
      company: ""
    });
    const currentDate = (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).replace(/\//g, "-");
    const canSubmitStep1 = common_vendor.computed(() => {
      return formData.name.trim() && /^1[3-9]\d{9}$/.test(formData.phone);
    });
    const confirmSignup = () => {
      if (!canSubmitStep1.value) {
        if (!formData.name.trim()) {
          common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
          common_vendor.index.showToast({ title: "请输入有效的手机号", icon: "none" });
          return;
        }
      }
      currentStep.value = 2;
    };
    const chooseImage = () => {
      const mockImages = [
        "https://img.alicdn.com/imgextra/i1/6000000007751/O1CN01v7zfb41cDU2kq1elG_!!6000000007751-0-tps-248-248.jpg",
        // Add more mock images if desired
        "https://via.placeholder.com/300/FF6E00/FFFFFF?text=Mock+Payment"
      ];
      screenshot.value = mockImages[Math.floor(Math.random() * mockImages.length)];
    };
    const onDrop = (e) => {
      e.preventDefault();
      isDragging.value = false;
      chooseImage();
    };
    const submitForm = () => {
      if (!screenshot.value) {
        common_vendor.index.showToast({ title: "请上传付款截图", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中...", mask: true });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        currentStep.value = 3;
        common_vendor.index.showToast({ title: "提交成功", icon: "success" });
      }, 1500);
    };
    const generateTicketNumber = () => {
      const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      const randomNumbers = Math.floor(1e5 + Math.random() * 9e5);
      return `TK${randomLetter}${randomNumbers}`;
    };
    const backToHome = () => {
      common_vendor.index.showToast({ title: "返回首页", icon: "success" });
      setTimeout(() => {
        currentStep.value = 1;
        formData.name = "";
        formData.phone = "";
        formData.company = "";
        screenshot.value = null;
      }, 1500);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentStep.value >= 1 ? 1 : "",
        b: currentStep.value >= 2 ? 1 : "",
        c: currentStep.value >= 3 ? 1 : "",
        d: common_vendor.p({
          type: "person",
          size: "18",
          color: "#FF6E00"
        }),
        e: currentStep.value === 1
      }, currentStep.value === 1 ? {
        f: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#FF6E00"
        }),
        g: common_vendor.o(($event) => formData.name = $event),
        h: common_vendor.p({
          type: "text",
          placeholder: "请输入您的姓名",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.name
        }),
        i: common_vendor.o(($event) => formData.phone = $event),
        j: common_vendor.p({
          type: "tel",
          placeholder: "请输入手机号",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.phone
        }),
        k: common_vendor.o(($event) => formData.company = $event),
        l: common_vendor.p({
          type: "text",
          placeholder: "请输入单位或学校名称",
          styles: {
            borderColor: "#eee",
            borderRadius: "12rpx"
          },
          modelValue: formData.company
        }),
        m: !canSubmitStep1.value ? 1 : "",
        n: common_vendor.o(confirmSignup)
      } : {}, {
        o: currentStep.value === 2
      }, currentStep.value === 2 ? common_vendor.e({
        p: common_vendor.p({
          type: "shop",
          size: "18",
          color: "#FF6E00"
        }),
        q: common_vendor.p({
          type: "image",
          size: "18",
          color: "#FF6E00"
        }),
        r: !screenshot.value
      }, !screenshot.value ? {
        s: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#FF6E00"
        })
      } : {
        t: screenshot.value
      }, {
        v: isDragging.value ? 1 : "",
        w: common_vendor.o(($event) => isDragging.value = true),
        x: common_vendor.o(($event) => isDragging.value = false),
        y: common_vendor.o(onDrop),
        z: common_vendor.o(chooseImage),
        A: !screenshot.value ? 1 : "",
        B: common_vendor.o(submitForm)
      }) : {}, {
        C: currentStep.value === 3
      }, currentStep.value === 3 ? {
        D: common_vendor.t(formData.phone),
        E: common_vendor.t(generateTicketNumber()),
        F: common_vendor.t(common_vendor.unref(currentDate)),
        G: common_vendor.o(backToHome)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d315542e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-enroll/active-enroll.js.map
