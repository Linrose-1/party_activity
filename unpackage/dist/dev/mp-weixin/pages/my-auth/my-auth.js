"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "my-auth",
  setup(__props) {
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({
      cardName: "",
      idCard: ""
    });
    const rules = {
      cardName: {
        rules: [{
          required: true,
          errorMessage: "请输入真实姓名"
        }]
      },
      idCard: {
        rules: [{
          required: true,
          errorMessage: "请输入身份证号码"
        }, {
          // 使用正则表达式校验18位身份证号码格式
          pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          errorMessage: "身份证号码格式不正确"
        }]
      }
    };
    const submitForm = () => {
      formRef.value.validate().then(async () => {
        common_vendor.index.showLoading({
          title: "认证中...",
          mask: true
        });
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/bind-user-card", {
          method: "POST",
          data: form.value
          // 直接将表单数据作为请求体
        });
        common_vendor.index.hideLoading();
        if (error) {
          common_vendor.index.showToast({
            title: error || "认证失败，请重试",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: "实名认证成功！",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/my-auth/my-auth.vue:101", "表单校验失败：", err);
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => form.value.cardName = $event),
        b: common_vendor.p({
          placeholder: "请输入您的真实姓名",
          modelValue: form.value.cardName
        }),
        c: common_vendor.p({
          label: "真实姓名",
          name: "cardName"
        }),
        d: common_vendor.o(($event) => form.value.idCard = $event),
        e: common_vendor.p({
          placeholder: "请输入您的身份证号码",
          modelValue: form.value.idCard
        }),
        f: common_vendor.p({
          label: "身份证号",
          name: "idCard"
        }),
        g: common_vendor.sr(formRef, "32098fb6-0", {
          "k": "formRef"
        }),
        h: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        i: common_vendor.o(submitForm)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-32098fb6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-auth/my-auth.js.map
