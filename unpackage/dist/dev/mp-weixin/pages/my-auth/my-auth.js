"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_data_checkbox2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_forms2)();
}
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_data_checkbox + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "my-auth",
  setup(__props) {
    const activeTab = common_vendor.ref(1);
    const certFormRef = common_vendor.ref(null);
    const isSubmitting = common_vendor.ref(false);
    const certForm = common_vendor.reactive({
      certType: 1,
      // 1: 企业, 2: 其他
      certName: "",
      certImages: []
      // 存储上传后的图片URL
    });
    const certTypeOptions = [{
      text: "企业认证",
      value: 1
    }, {
      text: "其他认证",
      value: 2
    }];
    const certRemark = common_vendor.computed(() => {
      if (certForm.certType === 1) {
        return "备注：有效的营业执照+盖公章、有效的品牌注册证书或有效的授权证书";
      }
      return "备注：请选择其他认证资料上传，平台用于认证之后打标签";
    });
    const handleChooseCertImage = async () => {
      if (certForm.certImages.length >= 6) {
        common_vendor.index.showToast({
          title: "最多上传6张图片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: 6 - certForm.certImages.length,
        sizeType: ["compressed"],
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中...",
            mask: true
          });
          const uploadPromises = res.tempFiles.map((file) => utils_upload.uploadFile(file, {
            directory: "certification"
          }));
          const results = await Promise.all(uploadPromises);
          common_vendor.index.hideLoading();
          results.forEach((result) => {
            if (result.data) {
              certForm.certImages.push(result.data);
            } else {
              common_vendor.index.showToast({
                title: "有图片上传失败",
                icon: "none"
              });
            }
          });
        }
      });
    };
    const deleteCertImage = (index) => {
      certForm.certImages.splice(index, 1);
    };
    const replaceCertImage = (index) => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "替换中...",
            mask: true
          });
          const result = await utils_upload.uploadFile(res.tempFiles[0], {
            directory: "certification"
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            certForm.certImages[index] = result.data;
          } else {
            common_vendor.index.showToast({
              title: "替换失败",
              icon: "none"
            });
          }
        }
      });
    };
    const submitCertForm = async () => {
      if (isSubmitting.value)
        return;
      if (certForm.certName.trim() === "") {
        return common_vendor.index.showToast({
          title: "请输入认证名称",
          icon: "none"
        });
      }
      if (certForm.certImages.length === 0) {
        return common_vendor.index.showToast({
          title: "请至少上传一张认证资料图片",
          icon: "none"
        });
      }
      isSubmitting.value = true;
      common_vendor.index.showLoading({
        title: "提交中...",
        mask: true
      });
      try {
        const payload = {
          certType: certForm.certType,
          certName: certForm.certName,
          certSource: certForm.certImages
          // 将图片数组转为逗号分隔的字符串
        };
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/cert", {
          method: "POST",
          data: payload
        });
        if (error) {
          throw new Error(error);
        }
        common_vendor.index.showToast({
          title: "认证资料提交成功！",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (err) {
        common_vendor.index.showToast({
          title: err.message || "提交失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
        common_vendor.index.hideLoading();
      }
    };
    const realNameFormRef = common_vendor.ref(null);
    const realNameForm = common_vendor.ref({
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
          pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          errorMessage: "身份证号码格式不正确"
        }]
      }
    };
    const submitRealNameForm = () => {
      realNameFormRef.value.validate().then(async () => {
        common_vendor.index.showLoading({
          title: "认证中...",
          mask: true
        });
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/bind-user-card", {
          method: "POST",
          data: realNameForm.value
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
        common_vendor.index.__f__("log", "at pages/my-auth/my-auth.vue:311", "表单校验失败：", err);
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === 1 ? 1 : "",
        b: common_vendor.o(($event) => activeTab.value = 1),
        c: activeTab.value === 2 ? 1 : "",
        d: common_vendor.o(($event) => activeTab.value = 2),
        e: activeTab.value === 1
      }, activeTab.value === 1 ? common_vendor.e({
        f: common_vendor.o(($event) => certForm.certType = $event),
        g: common_vendor.p({
          localdata: certTypeOptions,
          modelValue: certForm.certType
        }),
        h: common_vendor.p({
          label: "认证类型",
          required: true
        }),
        i: common_vendor.o(($event) => certForm.certName = $event),
        j: common_vendor.p({
          placeholder: "请输入企业/组织的全称",
          modelValue: certForm.certName
        }),
        k: common_vendor.p({
          label: "认证名称",
          required: true
        }),
        l: common_vendor.f(certForm.certImages, (img, i, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => replaceCertImage(i), i),
            c: common_vendor.o(($event) => deleteCertImage(i), i),
            d: i
          };
        }),
        m: certForm.certImages.length < 6
      }, certForm.certImages.length < 6 ? {
        n: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        o: common_vendor.o(handleChooseCertImage)
      } : {}, {
        p: common_vendor.t(certRemark.value),
        q: common_vendor.p({
          label: "上传资料",
          required: true
        }),
        r: common_vendor.sr(certFormRef, "32098fb6-0", {
          "k": "certFormRef"
        }),
        s: common_vendor.p({
          modelValue: certForm,
          ["label-width"]: 80
        }),
        t: common_vendor.t(isSubmitting.value ? "提交中..." : "提交认证"),
        v: common_vendor.o(submitCertForm),
        w: isSubmitting.value
      }) : {}, {
        x: activeTab.value === 2
      }, activeTab.value === 2 ? {
        y: common_vendor.o(($event) => realNameForm.value.cardName = $event),
        z: common_vendor.p({
          placeholder: "请输入您的真实姓名",
          modelValue: realNameForm.value.cardName
        }),
        A: common_vendor.p({
          label: "真实姓名",
          name: "cardName"
        }),
        B: common_vendor.o(($event) => realNameForm.value.idCard = $event),
        C: common_vendor.p({
          placeholder: "请输入您的身份证号码",
          modelValue: realNameForm.value.idCard
        }),
        D: common_vendor.p({
          label: "身份证号",
          name: "idCard"
        }),
        E: common_vendor.sr(realNameFormRef, "32098fb6-7", {
          "k": "realNameFormRef"
        }),
        F: common_vendor.p({
          modelValue: realNameForm.value,
          rules
        }),
        G: common_vendor.o(submitRealNameForm)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-32098fb6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-auth/my-auth.js.map
