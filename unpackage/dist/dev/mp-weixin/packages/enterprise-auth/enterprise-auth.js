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
  __name: "enterprise-auth",
  setup(__props) {
    const enterpriseId = common_vendor.ref(null);
    const enterpriseName = common_vendor.ref("");
    const certImages = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.enterpriseId) {
        enterpriseId.value = options.enterpriseId;
        enterpriseName.value = decodeURIComponent(options.enterpriseName || "");
      } else {
        common_vendor.index.showToast({
          title: "参数缺失",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    const handleChooseImage = () => {
      common_vendor.index.chooseImage({
        count: 6 - certImages.value.length,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "正在上传材料..."
          });
          const uploadedList = [];
          for (let path of res.tempFilePaths) {
            const result = await utils_upload.uploadFile({
              path
            }, {
              directory: "enterprise_cert"
            });
            if (result.data)
              uploadedList.push(result.data);
          }
          common_vendor.index.hideLoading();
          certImages.value = [...certImages.value, ...uploadedList];
        }
      });
    };
    const handleDelete = (index) => {
      certImages.value.splice(index, 1);
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: certImages.value,
        current: index
      });
    };
    const handleSubmit = async () => {
      if (certImages.value.length === 0) {
        return common_vendor.index.showToast({
          title: "请至少上传一张证明材料",
          icon: "none"
        });
      }
      loading.value = true;
      common_vendor.index.showLoading({
        title: "正在提交审核",
        mask: true
      });
      const payload = {
        certName: enterpriseName.value,
        certSource: certImages.value,
        // 后端要求 Array<String>
        certType: 2,
        // 固定：2 代表企业认证
        userEnterpriseId: Number(enterpriseId.value)
      };
      try {
        const {
          error
        } = await utils_request.request("/app-api/member/user-enterprise-info/submit-review-enterprise", {
          method: "POST",
          data: payload
        });
        common_vendor.index.hideLoading();
        loading.value = false;
        if (!error) {
          common_vendor.index.showModal({
            title: "申请已提交",
            content: "您的认证申请已进入审核队列，请耐心等待 1-3 个工作日。",
            showCancel: false,
            confirmColor: "#FF8600",
            success: () => {
              common_vendor.index.navigateBack();
            }
          });
        } else {
          common_vendor.index.showToast({
            title: error,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        loading.value = false;
        common_vendor.index.showToast({
          title: "提交失败，请检查网络",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "vip-filled",
          size: "30",
          color: "#FF8600"
        }),
        b: common_vendor.t(enterpriseName.value || "数据读取中..."),
        c: common_vendor.f(certImages.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: common_vendor.o(($event) => handleDelete(index), index),
            d: index
          };
        }),
        d: certImages.value.length < 6
      }, certImages.value.length < 6 ? {
        e: common_vendor.p({
          type: "camera-filled",
          size: "32",
          color: "#ccc"
        }),
        f: common_vendor.o(handleChooseImage)
      } : {}, {
        g: common_vendor.t(loading.value ? "正在提交申请..." : "立即提交认证"),
        h: loading.value,
        i: common_vendor.o(handleSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c22bdff0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-auth/enterprise-auth.js.map
