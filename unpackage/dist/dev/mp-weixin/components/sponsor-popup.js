"use strict";
const common_vendor = require("../common/vendor.js");
const utils_upload = require("../utils/upload.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_icons2 + _easycom_DragImageUploader2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_DragImageUploader = () => "./DragImageUploader/DragImageUploader.js";
const _easycom_uni_forms = () => "../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_icons + _easycom_DragImageUploader + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "sponsor-popup",
  props: {
    visible: Boolean,
    data: Object
  },
  emits: ["close", "confirm"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const getDefaultForm = () => ({
      id: null,
      sponsorName: "",
      location: "",
      logoUrl: "",
      introduction: "",
      galleryImageUrls: [],
      contactName: "",
      contactAvatar: "",
      sponsorType: 1,
      cashAmount: null,
      perCapitalAmount: null,
      goodsDescription: "",
      displaySort: 0
    });
    const isEdit = common_vendor.ref(false);
    const form = common_vendor.ref(getDefaultForm());
    const goodsList = common_vendor.ref([]);
    common_vendor.watch(() => props.visible, (val) => {
      if (val) {
        if (props.data) {
          isEdit.value = true;
          const newData = JSON.parse(JSON.stringify(props.data));
          if (typeof newData.galleryImageUrls === "string") {
            try {
              newData.galleryImageUrls = JSON.parse(newData.galleryImageUrls);
            } catch (e) {
              newData.galleryImageUrls = [];
            }
          } else if (!Array.isArray(newData.galleryImageUrls)) {
            newData.galleryImageUrls = [];
          }
          if (newData.goodsDescription) {
            try {
              const parsed = JSON.parse(newData.goodsDescription);
              if (Array.isArray(parsed)) {
                goodsList.value = parsed.map((i) => {
                  if (typeof i === "string")
                    return {
                      desc: i
                    };
                  if (i.name)
                    return {
                      desc: i.name + (i.count ? ` ${i.count}` : "")
                    };
                  return {
                    desc: i.desc || ""
                  };
                });
              } else {
                goodsList.value = [{
                  desc: newData.goodsDescription
                }];
              }
            } catch (e) {
              goodsList.value = [{
                desc: newData.goodsDescription
              }];
            }
          } else {
            goodsList.value = [{
              desc: ""
            }];
          }
          form.value = newData;
        } else {
          isEdit.value = false;
          form.value = getDefaultForm();
          goodsList.value = [{
            desc: ""
          }];
        }
      }
    });
    const chooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          form.value.location = res.name || res.address;
        }
      });
    };
    const addGoodsItem = () => {
      goodsList.value.push({
        desc: ""
      });
    };
    const removeGoodsItem = (index) => {
      goodsList.value.splice(index, 1);
    };
    const close = () => {
      emit("close");
    };
    const confirm = () => {
      const f = form.value;
      if (!f.sponsorName)
        return common_vendor.index.showToast({
          title: "请输入名称",
          icon: "none"
        });
      if (!f.introduction)
        return common_vendor.index.showToast({
          title: "请输入简介",
          icon: "none"
        });
      if (f.sponsorType === 1 || f.sponsorType === 3) {
        if (!f.cashAmount || !f.perCapitalAmount)
          return common_vendor.index.showToast({
            title: "请完善现金信息",
            icon: "none"
          });
      } else {
        f.cashAmount = null;
        f.perCapitalAmount = null;
      }
      if (f.sponsorType === 2 || f.sponsorType === 3) {
        const validGoods = goodsList.value.filter((g) => g.desc && g.desc.trim() !== "").map((g) => g.desc);
        if (validGoods.length === 0)
          return common_vendor.index.showToast({
            title: "请填写赞助物品",
            icon: "none"
          });
        f.goodsDescription = JSON.stringify(validGoods);
      } else {
        f.goodsDescription = "";
      }
      emit("confirm", JSON.parse(JSON.stringify(f)));
    };
    const uploadLogo = async () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const r = await utils_upload.uploadFile({
            path: res.tempFilePaths[0]
          }, {
            directory: "sponsor-logo"
          });
          if (r.data)
            form.value.logoUrl = r.data;
        }
      });
    };
    const uploadAvatar = async () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const r = await utils_upload.uploadFile({
            path: res.tempFilePaths[0]
          }, {
            directory: "sponsor-avatar"
          });
          if (r.data)
            form.value.contactAvatar = r.data;
        }
      });
    };
    const uploadGallery = () => {
      if (!form.value.galleryImageUrls)
        form.value.galleryImageUrls = [];
      common_vendor.index.chooseImage({
        count: 9 - form.value.galleryImageUrls.length,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const ps = res.tempFiles.map((f) => utils_upload.uploadFile({
            path: f.path
          }, {
            directory: "sponsor-gallery"
          }));
          const rs = await Promise.all(ps);
          common_vendor.index.hideLoading();
          const successUrls = rs.filter((r) => r.data).map((r) => r.data);
          form.value.galleryImageUrls.push(...successUrls);
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(close),
        b: common_vendor.t(isEdit.value ? "编辑赞助商" : "添加赞助商"),
        c: common_vendor.o(confirm),
        d: common_vendor.o(($event) => form.value.sponsorName = $event),
        e: common_vendor.p({
          placeholder: "请输入赞助商名称",
          modelValue: form.value.sponsorName
        }),
        f: common_vendor.p({
          label: "赞助商名称",
          required: true
        }),
        g: form.value.logoUrl
      }, form.value.logoUrl ? {
        h: form.value.logoUrl
      } : {
        i: common_vendor.p({
          type: "camera-filled",
          size: "28",
          color: "#FF6F00"
        })
      }, {
        j: common_vendor.o(uploadLogo),
        k: common_vendor.p({
          label: "品牌Logo",
          required: true
        }),
        l: common_vendor.o(($event) => form.value.introduction = $event),
        m: common_vendor.p({
          type: "textarea",
          placeholder: "请输入200字以内的简介",
          maxlength: "200",
          modelValue: form.value.introduction
        }),
        n: common_vendor.p({
          label: "品牌简介",
          required: true
        }),
        o: common_vendor.t(form.value.location || "点击选择位置"),
        p: !form.value.location ? 1 : "",
        q: common_vendor.p({
          type: "location",
          size: "20",
          color: "#FF6F00"
        }),
        r: common_vendor.o(chooseLocation),
        s: common_vendor.p({
          label: "赞助商位置"
        }),
        t: form.value.sponsorType === 1 ? 1 : "",
        v: common_vendor.o(($event) => form.value.sponsorType = 1),
        w: form.value.sponsorType === 2 ? 1 : "",
        x: common_vendor.o(($event) => form.value.sponsorType = 2),
        y: form.value.sponsorType === 3 ? 1 : "",
        z: common_vendor.o(($event) => form.value.sponsorType = 3),
        A: common_vendor.p({
          label: "赞助类型",
          required: true
        }),
        B: form.value.sponsorType === 1 || form.value.sponsorType === 3
      }, form.value.sponsorType === 1 || form.value.sponsorType === 3 ? {
        C: common_vendor.o(($event) => form.value.cashAmount = $event),
        D: common_vendor.p({
          type: "digit",
          placeholder: "0.00",
          modelValue: form.value.cashAmount
        }),
        E: common_vendor.p({
          label: "总金额 (元)",
          required: true
        }),
        F: common_vendor.o(($event) => form.value.perCapitalAmount = $event),
        G: common_vendor.p({
          type: "digit",
          placeholder: "0.00",
          modelValue: form.value.perCapitalAmount
        }),
        H: common_vendor.p({
          label: "人均金额 (元)",
          required: true
        })
      } : {}, {
        I: form.value.sponsorType === 2 || form.value.sponsorType === 3
      }, form.value.sponsorType === 2 || form.value.sponsorType === 3 ? common_vendor.e({
        J: common_vendor.p({
          type: "plusempty",
          size: "12",
          color: "#FF6F00"
        }),
        K: common_vendor.o(addGoodsItem),
        L: common_vendor.f(goodsList.value, (item, index, i0) => {
          return {
            a: "4df7dc31-15-" + i0 + ",4df7dc31-0",
            b: common_vendor.o(($event) => item.desc = $event, index),
            c: common_vendor.p({
              placeholder: "请输入物品描述 (如: 矿泉水50箱)",
              modelValue: item.desc
            }),
            d: "4df7dc31-16-" + i0 + ",4df7dc31-0",
            e: common_vendor.o(($event) => removeGoodsItem(index), index),
            f: index
          };
        }),
        M: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ff4d4f"
        }),
        N: goodsList.value.length === 0
      }, goodsList.value.length === 0 ? {} : {}) : {}, {
        O: common_vendor.o(uploadGallery),
        P: common_vendor.o(($event) => form.value.galleryImageUrls = $event),
        Q: common_vendor.p({
          ["max-count"]: 9,
          modelValue: form.value.galleryImageUrls
        }),
        R: common_vendor.p({
          label: "品牌图集"
        }),
        S: form.value.contactAvatar
      }, form.value.contactAvatar ? {
        T: form.value.contactAvatar
      } : {
        U: common_vendor.p({
          type: "camera-filled",
          size: "20",
          color: "#999"
        })
      }, {
        V: common_vendor.o(uploadAvatar),
        W: common_vendor.o(($event) => form.value.contactName = $event),
        X: common_vendor.p({
          placeholder: "请输入负责人姓名",
          modelValue: form.value.contactName
        }),
        Y: common_vendor.p({
          label: "负责人信息 (选填)"
        }),
        Z: common_vendor.p({
          model: form.value,
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        aa: __props.visible ? 1 : "",
        ab: common_vendor.o(() => {
        }),
        ac: __props.visible ? 1 : "",
        ad: common_vendor.o(close)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4df7dc31"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/sponsor-popup.js.map
