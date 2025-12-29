"use strict";
const common_vendor = require("../common/vendor.js");
const utils_upload = require("../utils/upload.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_icons2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms = () => "../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_icons + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "sponsor-popup",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  emits: ["close", "confirm"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isEdit = common_vendor.ref(false);
    const form = common_vendor.ref({});
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
      goodsNum: null,
      displaySort: 0
    });
    common_vendor.watch(() => props.visible, (val) => {
      if (val) {
        if (props.data) {
          isEdit.value = true;
          form.value = JSON.parse(JSON.stringify(props.data));
          if (typeof form.value.galleryImageUrls === "string") {
            try {
              form.value.galleryImageUrls = JSON.parse(form.value.galleryImageUrls);
            } catch (e) {
              form.value.galleryImageUrls = [];
            }
          } else if (!form.value.galleryImageUrls) {
            form.value.galleryImageUrls = [];
          }
        } else {
          isEdit.value = false;
          form.value = getDefaultForm();
        }
        common_vendor.nextTick$1(() => initDragList(form.value.galleryImageUrls));
      }
    });
    const close = () => {
      emit("close");
    };
    const confirm = () => {
      const f = form.value;
      if (!f.sponsorName)
        return common_vendor.index.showToast({
          title: "请输入赞助商名称",
          icon: "none"
        });
      if (!f.introduction)
        return common_vendor.index.showToast({
          title: "请输入品牌简介",
          icon: "none"
        });
      if (f.sponsorType === 1) {
        if (!f.cashAmount || !f.perCapitalAmount)
          return common_vendor.index.showToast({
            title: "请完善金额信息",
            icon: "none"
          });
      } else {
        if (!f.goodsDescription || !f.goodsNum)
          return common_vendor.index.showToast({
            title: "请完善物品信息",
            icon: "none"
          });
      }
      emit("confirm", JSON.parse(JSON.stringify(f)));
    };
    const uploadLogo = async () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const result = await utils_upload.uploadFile({
            path: res.tempFilePaths[0]
          }, {
            directory: "sponsor-logo"
          });
          if (result.data)
            form.value.logoUrl = result.data;
        }
      });
    };
    const uploadAvatar = async () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const result = await utils_upload.uploadFile({
            path: res.tempFilePaths[0]
          }, {
            directory: "sponsor-avatar"
          });
          if (result.data)
            form.value.contactAvatar = result.data;
        }
      });
    };
    const uploadGallery = () => {
      common_vendor.index.chooseImage({
        count: 9 - form.value.galleryImageUrls.length,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中"
          });
          const promises = res.tempFiles.map((f) => utils_upload.uploadFile({
            path: f.path
          }, {
            directory: "sponsor-gallery"
          }));
          const results = await Promise.all(promises);
          common_vendor.index.hideLoading();
          const urls = results.filter((r) => r.data).map((r) => r.data);
          form.value.galleryImageUrls.push(...urls);
        }
      });
    };
    const deleteImage = (index) => {
      form.value.galleryImageUrls.splice(index, 1);
    };
    const dragDisplayList = common_vendor.ref([]);
    const dragItemWidth = common_vendor.ref(0);
    const dragItemHeight = common_vendor.ref(0);
    const dragAreaHeight = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const dragIndex = common_vendor.ref(-1);
    const addBtnPos = common_vendor.computed(() => {
      const count = form.value.galleryImageUrls.length;
      if (count >= 9)
        return {
          left: 0,
          top: 0
        };
      const r = Math.floor(count / 3);
      const c = count % 3;
      return {
        left: c * dragItemWidth.value,
        top: r * dragItemHeight.value
      };
    });
    common_vendor.watch(() => form.value.galleryImageUrls, (newVal) => {
      if (!isDragging.value && props.visible) {
        initDragList(newVal || []);
      }
    }, {
      deep: true
    });
    const initDragList = (list) => {
      const sys = common_vendor.index.getSystemInfoSync();
      const containerWidth = sys.windowWidth - common_vendor.index.upx2px(60);
      dragItemWidth.value = containerWidth / 3;
      dragItemHeight.value = dragItemWidth.value;
      dragDisplayList.value = (list || []).map((url, i) => {
        const {
          x,
          y
        } = getPos(i);
        return {
          id: `sp_img_${i}_${Math.random()}`,
          data: url,
          x,
          y,
          zIndex: 1,
          realIndex: i
        };
      });
      updateDragHeight(list.length);
    };
    const getPos = (i) => {
      const r = Math.floor(i / 3);
      const c = i % 3;
      return {
        x: c * dragItemWidth.value,
        y: r * dragItemHeight.value
      };
    };
    const updateDragHeight = (count) => {
      const totalCount = count < 9 ? count + 1 : count;
      const rows = Math.ceil(totalCount / 3);
      dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
    };
    const onMovableStart = (i) => {
      isDragging.value = true;
      dragIndex.value = i;
      dragDisplayList.value[i].zIndex = 99;
    };
    const onMovableChange = (e, i) => {
      if (!isDragging.value || i !== dragIndex.value)
        return;
      const x = e.detail.x;
      const y = e.detail.y;
      const c = Math.floor((x + dragItemWidth.value / 2) / dragItemWidth.value);
      const r = Math.floor((y + dragItemHeight.value / 2) / dragItemHeight.value);
      let target = r * 3 + c;
      if (target < 0)
        target = 0;
      if (target >= dragDisplayList.value.length)
        target = dragDisplayList.value.length - 1;
      if (target !== dragIndex.value) {
        const mover = dragDisplayList.value[dragIndex.value];
        dragDisplayList.value.splice(dragIndex.value, 1);
        dragDisplayList.value.splice(target, 0, mover);
        dragDisplayList.value.forEach((item, idx) => {
          if (idx !== target) {
            const p = getPos(idx);
            item.x = p.x;
            item.y = p.y;
          }
        });
        dragIndex.value = target;
      }
    };
    const onMovableEnd = () => {
      isDragging.value = false;
      if (dragIndex.value !== -1) {
        const item = dragDisplayList.value[dragIndex.value];
        item.zIndex = 1;
        const p = getPos(dragIndex.value);
        common_vendor.nextTick$1(() => {
          item.x = p.x;
          item.y = p.y;
        });
        form.value.galleryImageUrls = dragDisplayList.value.map((o) => o.data);
      }
      dragIndex.value = -1;
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
        o: form.value.sponsorType === 1 ? 1 : "",
        p: common_vendor.o(($event) => form.value.sponsorType = 1),
        q: form.value.sponsorType === 2 ? 1 : "",
        r: common_vendor.o(($event) => form.value.sponsorType = 2),
        s: common_vendor.p({
          label: "赞助类型",
          required: true
        }),
        t: form.value.sponsorType === 1
      }, form.value.sponsorType === 1 ? {
        v: common_vendor.o(($event) => form.value.cashAmount = $event),
        w: common_vendor.p({
          type: "digit",
          placeholder: "0.00",
          modelValue: form.value.cashAmount
        }),
        x: common_vendor.p({
          label: "总金额 (元)",
          required: true
        }),
        y: common_vendor.o(($event) => form.value.perCapitalAmount = $event),
        z: common_vendor.p({
          type: "digit",
          placeholder: "0.00",
          modelValue: form.value.perCapitalAmount
        }),
        A: common_vendor.p({
          label: "人均金额 (元)",
          required: true
        })
      } : {}, {
        B: form.value.sponsorType === 2
      }, form.value.sponsorType === 2 ? {
        C: common_vendor.o(($event) => form.value.goodsDescription = $event),
        D: common_vendor.p({
          placeholder: "例如: 矿泉水50箱",
          modelValue: form.value.goodsDescription
        }),
        E: common_vendor.p({
          label: "物品描述",
          required: true
        }),
        F: common_vendor.o(($event) => form.value.goodsNum = $event),
        G: common_vendor.p({
          type: "number",
          placeholder: "请输入数量",
          modelValue: form.value.goodsNum
        }),
        H: common_vendor.p({
          label: "物品数量",
          required: true
        })
      } : {}, {
        I: common_vendor.o(($event) => form.value.location = $event),
        J: common_vendor.p({
          placeholder: "选填，如：A区-01展位",
          modelValue: form.value.location
        }),
        K: common_vendor.p({
          label: "赞助商位置"
        }),
        L: common_vendor.f(dragDisplayList.value, (item, index, i0) => {
          return {
            a: item.data,
            b: common_vendor.o(($event) => deleteImage(item.realIndex), item.id),
            c: item.id,
            d: item.x,
            e: item.y,
            f: item.zIndex,
            g: !isDragging.value && item.zIndex === 1,
            h: common_vendor.o(($event) => onMovableChange($event, index), item.id),
            i: common_vendor.o(($event) => onMovableStart(index), item.id),
            j: common_vendor.o(onMovableEnd, item.id)
          };
        }),
        M: dragItemWidth.value + "px",
        N: dragItemHeight.value + "px",
        O: form.value.galleryImageUrls.length < 9
      }, form.value.galleryImageUrls.length < 9 ? {
        P: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        Q: dragItemWidth.value + "px",
        R: dragItemHeight.value + "px",
        S: addBtnPos.value.left + "px",
        T: addBtnPos.value.top + "px",
        U: common_vendor.o(uploadGallery)
      } : {}, {
        V: dragAreaHeight.value + "px",
        W: dragAreaHeight.value + "px",
        X: common_vendor.p({
          label: "品牌图集 (支持拖拽排序)"
        }),
        Y: form.value.contactAvatar
      }, form.value.contactAvatar ? {
        Z: form.value.contactAvatar
      } : {
        aa: common_vendor.p({
          type: "camera-filled",
          size: "20",
          color: "#999"
        })
      }, {
        ab: common_vendor.o(uploadAvatar),
        ac: common_vendor.o(($event) => form.value.contactName = $event),
        ad: common_vendor.p({
          placeholder: "请输入负责人姓名",
          modelValue: form.value.contactName
        }),
        ae: common_vendor.p({
          label: "负责人信息 (选填)"
        }),
        af: common_vendor.p({
          model: form.value,
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        ag: __props.visible ? 1 : "",
        ah: common_vendor.o(() => {
        }),
        ai: __props.visible ? 1 : "",
        aj: common_vendor.o(close)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4df7dc31"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/sponsor-popup.js.map
