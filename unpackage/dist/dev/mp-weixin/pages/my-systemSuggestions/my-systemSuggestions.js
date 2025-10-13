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
const themeColor = "#FE6A00";
const _sfc_main = {
  __name: "my-systemSuggestions",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "4caf15f4": themeColor
    }));
    const suggestion = common_vendor.reactive({
      title: "",
      content: "",
      images: []
      // 用于存储上传成功的图片URL
    });
    const isLoading = common_vendor.ref(false);
    const isButtonDisabled = common_vendor.computed(() => {
      return !suggestion.title || !suggestion.content || isLoading.value;
    });
    const handleChooseImage = () => {
      common_vendor.index.chooseImage({
        count: 9 - suggestion.images.length,
        // 动态计算可选数量
        sourceType: ["album", "camera"],
        success: async (res) => {
          const validFiles = res.tempFiles.filter((file) => file.size <= 5 * 1024 * 1024);
          if (res.tempFiles.length > validFiles.length) {
            common_vendor.index.showToast({ title: "部分文件过大(>5MB)，已忽略", icon: "none" });
          }
          if (validFiles.length === 0)
            return;
          common_vendor.index.showLoading({ title: `正在上传 ${validFiles.length} 张图片...`, mask: true });
          const uploadPromises = validFiles.map((file) => utils_upload.uploadFile(file, { directory: "suggestion" }));
          const results = await Promise.all(uploadPromises);
          common_vendor.index.hideLoading();
          const successfulUrls = [];
          results.forEach((result) => {
            if (result.data) {
              successfulUrls.push(result.data);
            } else {
              common_vendor.index.__f__("error", "at pages/my-systemSuggestions/my-systemSuggestions.vue:104", "图片上传失败:", result.error);
            }
          });
          suggestion.images.push(...successfulUrls);
          if (successfulUrls.length < validFiles.length) {
            common_vendor.index.showToast({ title: `${validFiles.length - successfulUrls.length} 张图片上传失败`, icon: "none" });
          }
        }
      });
    };
    const deleteImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            suggestion.images.splice(index, 1);
          }
        }
      });
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: suggestion.images,
        current: index
      });
    };
    const handleSubmit = async () => {
      if (!suggestion.title) {
        common_vendor.index.showToast({ title: "请输入建议标题", icon: "none" });
        return;
      }
      if (!suggestion.content) {
        common_vendor.index.showToast({ title: "请输入建议内容", icon: "none" });
        return;
      }
      isLoading.value = true;
      try {
        const postData = {
          id: 0,
          // 根据接口文档，创建时 id 传 0
          title: suggestion.title,
          content: suggestion.content,
          img: suggestion.images.join(",")
          // 将图片数组用逗号拼接成字符串
        };
        const { data, error } = await utils_request.request("/app-api/member/suggestion/create", {
          method: "POST",
          data: postData
          // 发送构建好的数据
        });
        if (error) {
          common_vendor.index.showToast({ title: `提交失败: ${typeof error === "object" ? error.msg : error}`, icon: "none" });
        } else {
          common_vendor.index.showToast({ title: "感谢您的建议！", icon: "success" });
          suggestion.title = "";
          suggestion.content = "";
          suggestion.images = [];
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "提交失败，请稍后再试", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "paperplane-filled",
          size: "24",
          color: themeColor
        }),
        b: suggestion.title,
        c: common_vendor.o(common_vendor.m(($event) => suggestion.title = $event.detail.value, {
          trim: true
        })),
        d: suggestion.content,
        e: common_vendor.o(common_vendor.m(($event) => suggestion.content = $event.detail.value, {
          trim: true
        })),
        f: common_vendor.t(suggestion.content.length),
        g: common_vendor.f(suggestion.images, (imgUrl, index, i0) => {
          return {
            a: imgUrl,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: common_vendor.o(($event) => deleteImage(index), index),
            d: index
          };
        }),
        h: suggestion.images.length < 9
      }, suggestion.images.length < 9 ? {
        i: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        j: common_vendor.o(handleChooseImage)
      } : {}, {
        k: common_vendor.p({
          type: "notification-filled",
          size: "18",
          color: themeColor
        }),
        l: common_vendor.t(isLoading.value ? "正在提交..." : "立即提交"),
        m: common_vendor.o(handleSubmit),
        n: isLoading.value,
        o: isButtonDisabled.value,
        p: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b548d100"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-systemSuggestions/my-systemSuggestions.js.map
