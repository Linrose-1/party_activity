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
      // 已上传成功的图片URL数组
    });
    const isEditMode = common_vendor.ref(false);
    const suggestionId = common_vendor.ref(0);
    const isLoading = common_vendor.ref(false);
    const isButtonDisabled = common_vendor.computed(() => {
      return !suggestion.title || !suggestion.content || isLoading.value;
    });
    const submitText = common_vendor.computed(() => {
      if (isLoading.value)
        return "正在处理...";
      return isEditMode.value ? "保存修改" : "立即提交";
    });
    common_vendor.onLoad((options) => {
      if (options.id) {
        isEditMode.value = true;
        suggestionId.value = options.id;
        common_vendor.index.setNavigationBarTitle({
          title: "修改建议"
        });
        fetchDetail(options.id);
      }
    });
    const fetchDetail = async (id) => {
      common_vendor.index.showLoading({
        title: "加载资料中...",
        mask: true
      });
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/suggestion/get", {
          method: "GET",
          data: {
            id
          }
        });
        if (!error && data) {
          suggestion.title = data.title;
          suggestion.content = data.content;
          suggestion.images = data.img ? data.img.split(",").filter(Boolean) : [];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my-systemSuggestions/my-systemSuggestions.vue:145", "详情拉取异常:", e);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleChooseImage = () => {
      common_vendor.index.chooseImage({
        count: 9 - suggestion.images.length,
        // 动态剩余张数
        sourceType: ["album", "camera"],
        success: async (res) => {
          const validFiles = res.tempFiles.filter((file) => file.size <= 5 * 1024 * 1024);
          if (res.tempFiles.length > validFiles.length) {
            common_vendor.index.showToast({
              title: "部分文件过大(>5MB)，已自动忽略",
              icon: "none"
            });
          }
          if (validFiles.length === 0)
            return;
          common_vendor.index.showLoading({
            title: `同步中(0/${validFiles.length})`,
            mask: true
          });
          const uploadPromises = validFiles.map((file) => utils_upload.uploadFile(file, {
            directory: "suggestion"
          }));
          const results = await Promise.all(uploadPromises);
          common_vendor.index.hideLoading();
          const successfulUrls = [];
          results.forEach((result) => {
            if (result.data) {
              successfulUrls.push(result.data);
            } else {
              common_vendor.index.__f__("error", "at pages/my-systemSuggestions/my-systemSuggestions.vue:187", "上传器内部报错:", result.error);
            }
          });
          suggestion.images.push(...successfulUrls);
          if (successfulUrls.length < validFiles.length) {
            common_vendor.index.showToast({
              title: "部分图片由于网络原因失败",
              icon: "none"
            });
          }
        }
      });
    };
    const deleteImage = (index) => {
      common_vendor.index.showModal({
        title: "操作提示",
        content: "确定要从建议中移除此图片吗？",
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
      if (!suggestion.title.trim())
        return common_vendor.index.showToast({
          title: "标题不能为空",
          icon: "none"
        });
      if (!suggestion.content.trim())
        return common_vendor.index.showToast({
          title: "内容不能为空",
          icon: "none"
        });
      isLoading.value = true;
      try {
        const postData = {
          id: isEditMode.value ? suggestionId.value : 0,
          // 编辑模式传原ID，新建传0
          title: suggestion.title,
          content: suggestion.content,
          img: suggestion.images.join(",")
          // 将图片数组转换回逗号分隔的字符串
        };
        const apiPath = isEditMode.value ? "/app-api/member/suggestion/update" : "/app-api/member/suggestion/create";
        const apiMethod = isEditMode.value ? "PUT" : "POST";
        const {
          error
        } = await utils_request.request(apiPath, {
          method: apiMethod,
          data: postData
        });
        if (error) {
          common_vendor.index.showToast({
            title: `操作失败: ${error}`,
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: isEditMode.value ? "资料已更新" : "提交成功，感谢共建！",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络连接异常，请重试",
          icon: "none"
        });
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
        b: common_vendor.t(isEditMode.value ? "修改您的建议" : "提交您的建议"),
        c: suggestion.title,
        d: common_vendor.o(common_vendor.m(($event) => suggestion.title = $event.detail.value, {
          trim: true
        })),
        e: suggestion.content,
        f: common_vendor.o(common_vendor.m(($event) => suggestion.content = $event.detail.value, {
          trim: true
        })),
        g: common_vendor.t(suggestion.content.length),
        h: common_vendor.f(suggestion.images, (imgUrl, index, i0) => {
          return {
            a: imgUrl,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: common_vendor.o(($event) => deleteImage(index), index),
            d: index
          };
        }),
        i: suggestion.images.length < 9
      }, suggestion.images.length < 9 ? {
        j: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        k: common_vendor.o(handleChooseImage)
      } : {}, {
        l: common_vendor.p({
          type: "notification-filled",
          size: "18",
          color: themeColor
        }),
        m: common_vendor.t(submitText.value),
        n: common_vendor.o(handleSubmit),
        o: isLoading.value,
        p: isButtonDisabled.value,
        q: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b548d100"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-systemSuggestions/my-systemSuggestions.js.map
