"use strict";
const common_vendor = require("../common/vendor.js");
const utils_qrcode = require("../utils/qrcode.js");
const _sfc_main = {
  __name: "ShareQrCode",
  props: {
    path: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: "您的专属邀请码"
    },
    params: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const qrBase64 = common_vendor.ref("");
    common_vendor.onMounted(async () => {
      qrBase64.value = await utils_qrcode.generatePromotionQrCode(props.path, props.params);
    });
    const handlePreview = () => {
      if (qrBase64.value) {
        common_vendor.index.previewImage({
          urls: [qrBase64.value]
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: qrBase64.value
      }, qrBase64.value ? {
        b: qrBase64.value,
        c: common_vendor.o(handlePreview),
        d: common_vendor.t(__props.label)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-17f95ddb"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ShareQrCode.js.map
