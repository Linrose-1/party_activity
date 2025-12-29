"use strict";
const common_vendor = require("../common/vendor.js");
const utils_upload = require("../utils/upload.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_icons2 + _easycom_uni_forms2 + _easycom_uni_popup2)();
}
const _easycom_uni_easyinput = () => "../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms = () => "../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_icons + _easycom_uni_forms + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "SponsorFormPopup",
  emits: ["success"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const popup = common_vendor.ref(null);
    const formData = common_vendor.reactive({
      // --- 档案数据 ---
      name: "",
      logo: "",
      location: "",
      description: "",
      gallery: [],
      contactName: "",
      contactAvatar: "",
      // --- 业务数据 ---
      type: 1,
      // 1:现金, 2:物品
      totalAmount: "",
      perCapitaAmount: "",
      itemDesc: "",
      itemNum: ""
    });
    const open = () => {
      resetForm();
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    const onPopupChange = (e) => {
    };
    const resetForm = () => {
      Object.assign(formData, {
        name: "",
        logo: "",
        location: "",
        description: "",
        gallery: [],
        contactName: "",
        contactAvatar: "",
        type: 1,
        totalAmount: "",
        perCapitaAmount: "",
        itemDesc: "",
        itemNum: ""
      });
    };
    const uploadLogo = () => handleUpload("logo", "sponsor/logo");
    const uploadAvatar = () => handleUpload("contactAvatar", "sponsor/avatar");
    const handleUpload = (field, dir) => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中"
          });
          const {
            data,
            error
          } = await utils_upload.uploadFile(res.tempFiles[0], {
            directory: dir
          });
          common_vendor.index.hideLoading();
          if (data) {
            formData[field] = data;
          } else {
            common_vendor.index.showToast({
              title: error || "上传失败",
              icon: "none"
            });
          }
        }
      });
    };
    const uploadGallery = () => {
      common_vendor.index.chooseImage({
        count: 9 - formData.gallery.length,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中"
          });
          const promises = res.tempFiles.map((f) => utils_upload.uploadFile({
            path: f.path
          }, {
            directory: "sponsor/gallery"
          }));
          try {
            const results = await Promise.all(promises);
            common_vendor.index.hideLoading();
            results.forEach((r) => {
              if (r.data)
                formData.gallery.push(r.data);
            });
            if (results.some((r) => r.error)) {
              common_vendor.index.showToast({
                title: "部分图片上传失败",
                icon: "none"
              });
            }
          } catch (e) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "上传异常",
              icon: "none"
            });
          }
        }
      });
    };
    const removeGalleryImage = (index) => {
      formData.gallery.splice(index, 1);
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: formData.gallery,
        current: index
      });
    };
    const handleConfirm = async () => {
      if (!formData.name)
        return toast("请输入赞助商名称");
      if (!formData.description)
        return toast("请输入赞助商介绍");
      if (formData.type === 1) {
        if (!formData.totalAmount)
          return toast("请输入赞助总金额");
        if (!formData.perCapitaAmount)
          return toast("请输入人均赞助金额");
      } else {
        if (!formData.itemDesc)
          return toast("请输入物品描述");
      }
      common_vendor.index.showLoading({
        title: "保存中",
        mask: true
      });
      try {
        const profileRes = await utils_request.request("/app-api/member/sponsor/create", {
          method: "POST",
          data: {
            userId: common_vendor.index.getStorageSync("userId"),
            sponsorName: formData.name,
            logoUrl: formData.logo,
            introduction: formData.description,
            location: formData.location || "",
            contactName: formData.contactName || "",
            contactAvatar: formData.contactAvatar || "",
            // 数组转JSON字符串
            galleryImageUrls: formData.gallery && formData.gallery.length > 0 ? JSON.stringify(formData.gallery) : "",
            id: null
            // 新增
          }
        });
        common_vendor.index.hideLoading();
        if (profileRes.error) {
          return toast(profileRes.error);
        }
        const sponsorId = profileRes.data;
        const result = {
          // 用于在发布页列表展示的数据
          display: {
            id: sponsorId,
            name: formData.name,
            logo: formData.logo,
            typeText: formData.type === 1 ? `现金 ¥${formData.totalAmount}` : `物品: ${formData.itemDesc}`
          },
          // 用于最终发布聚会时提交到后端的数据
          apiPayload: {
            sponsorId,
            sponsorType: formData.type,
            cashAmount: formData.type === 1 ? Number(formData.totalAmount) : null,
            perCapitalAmount: formData.type === 1 ? Number(formData.perCapitaAmount) : null,
            goodsDescription: formData.type === 2 ? formData.itemDesc : "",
            goodsNum: formData.type === 2 ? Number(formData.itemNum) : null
          }
        };
        emit("success", result);
        close();
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at components/SponsorFormPopup.vue:337", e);
        toast("保存失败，请重试");
      }
    };
    const toast = (msg) => common_vendor.index.showToast({
      title: msg,
      icon: "none"
    });
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(close),
        b: common_vendor.o(handleConfirm),
        c: common_vendor.o(($event) => formData.name = $event),
        d: common_vendor.p({
          placeholder: "请输入赞助商/品牌名称",
          inputBorder: true,
          modelValue: formData.name
        }),
        e: common_vendor.p({
          label: "赞助商名称",
          required: true
        }),
        f: formData.logo
      }, formData.logo ? {
        g: formData.logo
      } : {
        h: common_vendor.p({
          type: "camera-filled",
          size: "24",
          color: "#ccc"
        })
      }, {
        i: common_vendor.o(uploadLogo),
        j: common_vendor.p({
          label: "赞助商Logo",
          required: true
        }),
        k: common_vendor.o(($event) => formData.location = $event),
        l: common_vendor.p({
          placeholder: "例如：A区-101 (选填)",
          modelValue: formData.location
        }),
        m: common_vendor.p({
          label: "赞助商位置"
        }),
        n: common_vendor.o(($event) => formData.description = $event),
        o: common_vendor.p({
          type: "textarea",
          maxlength: "200",
          placeholder: "请输入简短的品牌介绍",
          autoHeight: true,
          modelValue: formData.description
        }),
        p: common_vendor.p({
          label: "赞助商介绍 (200字内)",
          required: true
        }),
        q: common_vendor.f(formData.gallery, (url, index, i0) => {
          return {
            a: url,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: common_vendor.o(($event) => removeGalleryImage(index), index),
            d: index
          };
        }),
        r: formData.gallery.length < 9
      }, formData.gallery.length < 9 ? {
        s: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#ccc"
        }),
        t: common_vendor.o(uploadGallery)
      } : {}, {
        v: common_vendor.p({
          label: "品牌图集 (选填，最多9张)"
        }),
        w: formData.contactAvatar
      }, formData.contactAvatar ? {
        x: formData.contactAvatar
      } : {}, {
        y: common_vendor.o(uploadAvatar),
        z: common_vendor.o(($event) => formData.contactName = $event),
        A: common_vendor.p({
          placeholder: "负责人姓名",
          modelValue: formData.contactName
        }),
        B: common_vendor.p({
          label: "负责人信息 (选填)"
        }),
        C: common_vendor.sr("formRef", "3ac56187-1,3ac56187-0"),
        D: common_vendor.p({
          modelValue: formData,
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        E: formData.type === 1 ? 1 : "",
        F: common_vendor.o(($event) => formData.type = 1),
        G: formData.type === 2 ? 1 : "",
        H: common_vendor.o(($event) => formData.type = 2),
        I: common_vendor.p({
          label: "赞助类型",
          required: true
        }),
        J: formData.type === 1
      }, formData.type === 1 ? {
        K: common_vendor.o(($event) => formData.totalAmount = $event),
        L: common_vendor.p({
          type: "digit",
          placeholder: "0.00",
          modelValue: formData.totalAmount
        }),
        M: common_vendor.p({
          label: "赞助总金额 (元)",
          required: true
        }),
        N: common_vendor.o(($event) => formData.perCapitaAmount = $event),
        O: common_vendor.p({
          type: "digit",
          placeholder: "0.00",
          modelValue: formData.perCapitaAmount
        }),
        P: common_vendor.p({
          label: "人均赞助金额 (元) (仅展示用)",
          required: true
        })
      } : {}, {
        Q: formData.type === 2
      }, formData.type === 2 ? {
        R: common_vendor.o(($event) => formData.itemDesc = $event),
        S: common_vendor.p({
          placeholder: "例如：矿泉水50箱、伴手礼100份",
          modelValue: formData.itemDesc
        }),
        T: common_vendor.p({
          label: "物品描述",
          required: true
        }),
        U: common_vendor.o(($event) => formData.itemNum = $event),
        V: common_vendor.p({
          type: "number",
          placeholder: "数量 (选填)",
          modelValue: formData.itemNum
        }),
        W: common_vendor.p({
          label: "物品数量"
        })
      } : {}, {
        X: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        Y: common_vendor.sr(popup, "3ac56187-0", {
          "k": "popup"
        }),
        Z: common_vendor.o(onPopupChange),
        aa: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false,
          ["mask-click"]: false
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3ac56187"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/SponsorFormPopup.js.map
