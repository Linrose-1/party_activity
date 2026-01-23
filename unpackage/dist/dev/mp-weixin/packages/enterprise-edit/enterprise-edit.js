"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_forms2 + _easycom_uni_icons2 + _easycom_uni_data_picker2 + _easycom_DragImageUploader2 + _easycom_uni_popup2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_DragImageUploader = () => "../../components/DragImageUploader/DragImageUploader.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_forms + _easycom_uni_icons + _easycom_uni_data_picker + _easycom_DragImageUploader + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "enterprise-edit",
  setup(__props) {
    const Api = {
      /**
       * 创建企业信息 (首次保存草稿)
       */
      create: (data) => utils_request.request("/app-api/member/user-enterprise-info/create", {
        method: "POST",
        data
      }),
      /**
       * 更新企业信息 (后续步骤或编辑模式)
       */
      update: (data) => utils_request.request("/app-api/member/user-enterprise-info/update", {
        method: "PUT",
        data
      }),
      /**
       * 获取指定 ID 的企业详情
       */
      getDetail: (id) => utils_request.request("/app-api/member/user-enterprise-info/get", {
        method: "GET",
        data: {
          id
        }
      }),
      /**
       * 发布企业信息 (状态由草稿变为已发布)
       */
      publish: (id) => utils_request.request(`/app-api/member/user-enterprise-info/post-enterprise/${id}`, {
        method: "POST"
      }),
      /**
       * 获取全量行业树数据
       */
      getIndustry: () => utils_request.request("/app-api/member/national-industry/tree", {
        method: "POST"
      })
    };
    const currentStep = common_vendor.ref(1);
    const stepTitles = ["基本信息", "品牌展示", "联系入口", "内容资产"];
    const enterpriseId = common_vendor.ref(null);
    const isEditMode = common_vendor.ref(false);
    const industryTree = common_vendor.ref([]);
    const industryLabel = common_vendor.ref("");
    const brandImageList = common_vendor.ref([]);
    const offlineStores = common_vendor.ref([]);
    const onlineStores = common_vendor.ref([]);
    const successPopup = common_vendor.ref(null);
    const form = common_vendor.reactive({
      id: null,
      enterpriseName: "",
      creditCode: "",
      enterpriseType: "",
      legalPerson: "",
      establishDate: "",
      officePhone: "",
      officialEmail: "",
      logoUrl: "",
      backgroundUrl: "",
      brandSlogan: "",
      shortIntro: "",
      industryFirst: "",
      industrySecond: "",
      officialWebsite: "",
      wechatMpName: "",
      wechatMpId: "",
      wechatMpQrcode: "",
      videoAccount: "",
      videoAccountQrcode: "",
      customerServicePhone: "",
      businessCooperation: "",
      afterSaleEmail: "",
      brandImages: "",
      // 存储为逗号隔开字符串
      videoUrl: "",
      offlineStores: "",
      // 存储为 JSON 字符串
      onlineStores: "",
      // 存储为 JSON 字符串
      status: 0,
      // 名片配置默认值
      cardMainColor: "#FF8600",
      cardLogoStyle: 0,
      cardShowContact: true,
      cardShowSocial: true,
      cardShowOnlineStore: true,
      cardShowSlogan: true,
      cardShowDetailAddress: true,
      cardShowEstablishDate: true
    });
    const typeOptions = [
      {
        text: "有限责任公司",
        value: "有限责任公司"
      },
      {
        text: "个体工商户",
        value: "个体工商户"
      }
    ];
    const platformOptions = [
      {
        text: "美团",
        value: "美团"
      },
      {
        text: "大众点评",
        value: "大众点评"
      },
      {
        text: "饿了么",
        value: "饿了么"
      }
    ];
    const rules = {
      enterpriseName: {
        rules: [{
          required: true,
          errorMessage: "请输入企业名称"
        }]
      },
      creditCode: {
        rules: [{
          required: true,
          errorMessage: "请输入社会信用代码"
        }]
      }
    };
    common_vendor.onLoad(async (options) => {
      if (options.id) {
        isEditMode.value = true;
        enterpriseId.value = options.id;
        await fetchEnterpriseDetail(options.id);
      }
    });
    common_vendor.onMounted(() => {
      fetchIndustryTree();
    });
    const fetchIndustryTree = async () => {
      const {
        data,
        error
      } = await Api.getIndustry();
      if (data) {
        industryTree.value = processTree(data);
      } else if (error) {
        common_vendor.index.__f__("error", "at packages/enterprise-edit/enterprise-edit.vue:451", "获取行业树失败:", error);
      }
    };
    const processTree = (tree) => {
      if (!Array.isArray(tree))
        return [];
      return tree.map((node) => {
        if (node.children && node.children.length === 1 && node.children[0].name === node.name) {
          return {
            ...node.children[0],
            children: null
          };
        }
        if (node.children && node.children.length > 0) {
          const hasVirtual = node.children.some((c) => c.name === "全部分类");
          if (!hasVirtual) {
            node.children.unshift({
              id: node.id + "_all",
              name: "全部分类",
              children: null
              // 叶子节点，点击即选中
            });
          }
          return {
            ...node,
            children: processTree(node.children)
          };
        }
        return node;
      });
    };
    const onIndustryChange = (e) => {
      const nodes = e.detail.value;
      common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:492", "📦 原始选择节点:", nodes);
      if (nodes && nodes.length > 0) {
        const level1Name = nodes[0].text || nodes[0].name;
        const level2Name = nodes[1] ? nodes[1].text || nodes[1].name : "";
        if (level2Name === "全部分类") {
          form.industryFirst = level1Name;
          form.industrySecond = "";
          industryLabel.value = level1Name;
        } else {
          form.industryFirst = level1Name;
          form.industrySecond = level2Name;
          industryLabel.value = nodes.map((n) => n.text || n.name).join("/");
        }
        common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:508", "✅ 最终存储结果:", form.industryFirst, form.industrySecond);
      }
    };
    const fetchEnterpriseDetail = async (id) => {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      const {
        data,
        error
      } = await Api.getDetail(id);
      common_vendor.index.hideLoading();
      if (!error && data) {
        applyDataToForm(data);
      }
    };
    const applyDataToForm = (data) => {
      Object.assign(form, data);
      if (data.industryFirst) {
        industryLabel.value = data.industryFirst + (data.industrySecond ? `/${data.industrySecond}` : "");
      }
      if (data.brandImages) {
        brandImageList.value = data.brandImages.split(",").filter((i) => i);
      }
      try {
        if (typeof data.onlineStores === "string")
          onlineStores.value = JSON.parse(data.onlineStores || "[]");
        else if (Array.isArray(data.onlineStores))
          onlineStores.value = data.onlineStores;
        if (typeof data.offlineStores === "string")
          offlineStores.value = JSON.parse(data.offlineStores || "[]");
        else if (Array.isArray(data.offlineStores))
          offlineStores.value = data.offlineStores;
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/enterprise-edit/enterprise-edit.vue:550", "数据格式转换失败:", e);
      }
    };
    const handleImageUpload = (field, dir) => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const {
            data,
            error
          } = await utils_upload.uploadFile({
            path: res.tempFilePaths[0]
          }, {
            directory: dir
          });
          common_vendor.index.hideLoading();
          if (!error)
            form[field] = data;
        }
      });
    };
    const handleUploadGallery = () => {
      common_vendor.index.chooseImage({
        count: 9 - brandImageList.value.length,
        success: async (res) => {
          common_vendor.index.showLoading({
            title: `正在处理 0/${res.tempFilePaths.length}`,
            mask: true
          });
          const uploadedUrls = [];
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            common_vendor.index.showLoading({
              title: `上传中 ${i + 1}/${res.tempFilePaths.length}`
            });
            const {
              data
            } = await utils_upload.uploadFile({
              path: res.tempFilePaths[i]
            }, {
              directory: "enterprise_gallery"
            });
            if (data)
              uploadedUrls.push(data);
          }
          common_vendor.index.hideLoading();
          brandImageList.value = [...brandImageList.value, ...uploadedUrls];
        }
      });
    };
    const handleVideoUpload = () => {
      common_vendor.index.chooseVideo({
        sourceType: ["album", "camera"],
        maxDuration: 60,
        // 企业视频允许长一点，3分钟
        compressed: true,
        success: async (res) => {
          if (res.size > 100 * 1024 * 1024) {
            return common_vendor.index.showToast({
              title: "视频超过100MB，请压缩后上传",
              icon: "none"
            });
          }
          common_vendor.index.showLoading({
            title: "视频上传中...",
            mask: true
          });
          const result = await utils_upload.uploadFile({
            path: res.tempFilePath
          }, {
            directory: "enterprise_video"
          });
          common_vendor.index.hideLoading();
          if (result.data) {
            form.videoUrl = result.data;
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: result.error || "上传失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:654", "用户取消视频选择", err);
        }
      });
    };
    const handleChooseVideoCover = () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.wx$1.cropImage({
            src: tempFilePath,
            cropScale: "4:3",
            success: (cropRes) => {
              uploadCoverToCloud(cropRes.tempFilePath);
            }
          });
        }
      });
    };
    const uploadCoverToCloud = async (filePath) => {
      common_vendor.index.showLoading({
        title: "封面同步中..."
      });
      const result = await utils_upload.uploadFile({
        path: filePath
      }, {
        directory: "enterprise_cover"
      });
      common_vendor.index.hideLoading();
      if (result.data) {
        form.videoCoverUrl = result.data;
        common_vendor.index.showToast({
          title: "封面设置成功",
          icon: "none"
        });
      }
    };
    const deleteVideo = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除视频吗？",
        confirmColor: "#ff4d4f",
        success: (res) => {
          if (res.confirm) {
            form.videoUrl = "";
            form.videoCoverUrl = "";
          }
        }
      });
    };
    const handleChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          offlineStores.value.push({
            name: res.name,
            address: res.address,
            lat: res.latitude,
            lng: res.longitude
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:731", "用户取消了位置选择");
        }
      });
    };
    const handleStepProcess = async () => {
      form.brandImages = brandImageList.value.join(",");
      form.offlineStores = JSON.stringify(offlineStores.value);
      form.onlineStores = JSON.stringify(onlineStores.value);
      common_vendor.index.showLoading({
        title: "同步云端...",
        mask: true
      });
      let res;
      if (isEditMode.value || enterpriseId.value) {
        res = await Api.update(form);
      } else {
        const {
          id,
          ...createParams
        } = form;
        res = await Api.create(createParams);
        if (!res.error && res.data) {
          enterpriseId.value = res.data;
          form.id = res.data;
        }
      }
      common_vendor.index.hideLoading();
      if (res.error)
        return common_vendor.index.showToast({
          title: res.error,
          icon: "none"
        });
      if (currentStep.value < 4) {
        currentStep.value++;
        common_vendor.index.pageScrollTo({
          scrollTop: 0
        });
      } else {
        executeFinalPublish();
      }
    };
    const executeFinalPublish = async () => {
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      const {
        error
      } = await Api.publish(enterpriseId.value || form.id);
      common_vendor.index.hideLoading();
      if (!error) {
        successPopup.value.open();
      } else {
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
      }
    };
    const goCard = () => common_vendor.index.redirectTo({
      url: `/pages/enterprise/card?id=${enterpriseId.value || form.id}`
    });
    const goList = () => common_vendor.index.navigateBack();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(stepTitles, (title, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(currentStep.value > index + 1 ? "✓" : index + 1),
            b: index < 3
          }, index < 3 ? {} : {}, {
            c: common_vendor.t(title),
            d: index,
            e: currentStep.value >= index + 1 ? 1 : ""
          });
        }),
        b: currentStep.value === 1
      }, currentStep.value === 1 ? {
        c: common_vendor.o(($event) => form.enterpriseName = $event),
        d: common_vendor.p({
          placeholder: "请与营业执照保持一致",
          inputBorder: false,
          modelValue: form.enterpriseName
        }),
        e: common_vendor.p({
          label: "企业名称",
          name: "enterpriseName",
          required: true
        }),
        f: common_vendor.o(($event) => form.creditCode = $event),
        g: common_vendor.p({
          placeholder: "18位统一社会信用代码",
          inputBorder: false,
          modelValue: form.creditCode
        }),
        h: common_vendor.p({
          label: "统一社会信用代码",
          name: "creditCode",
          required: true
        }),
        i: common_vendor.o(($event) => form.enterpriseType = $event),
        j: common_vendor.p({
          localdata: typeOptions,
          placeholder: "请选择企业类型",
          modelValue: form.enterpriseType
        }),
        k: common_vendor.p({
          label: "企业类型",
          name: "enterpriseType"
        }),
        l: common_vendor.o(($event) => form.legalPerson = $event),
        m: common_vendor.p({
          placeholder: "请输入姓名",
          inputBorder: false,
          modelValue: form.legalPerson
        }),
        n: common_vendor.p({
          label: "法定代表人",
          name: "legalPerson"
        }),
        o: common_vendor.o(($event) => form.establishDate = $event),
        p: common_vendor.p({
          type: "date",
          modelValue: form.establishDate
        }),
        q: common_vendor.p({
          label: "成立日期",
          name: "establishDate"
        }),
        r: common_vendor.o(($event) => form.officePhone = $event),
        s: common_vendor.p({
          placeholder: "例如：021-12345678",
          inputBorder: false,
          modelValue: form.officePhone
        }),
        t: common_vendor.p({
          label: "办公电话",
          name: "officePhone"
        }),
        v: common_vendor.o(($event) => form.officialEmail = $event),
        w: common_vendor.p({
          placeholder: "contact@abc.com",
          inputBorder: false,
          modelValue: form.officialEmail
        }),
        x: common_vendor.p({
          label: "官方邮箱",
          name: "officialEmail"
        }),
        y: common_vendor.sr("formStep1", "657c9911-0"),
        z: common_vendor.p({
          modelValue: form,
          rules,
          ["label-position"]: "top",
          ["label-width"]: "100%"
        })
      } : {}, {
        A: currentStep.value === 2
      }, currentStep.value === 2 ? common_vendor.e({
        B: form.logoUrl
      }, form.logoUrl ? {
        C: form.logoUrl
      } : {
        D: common_vendor.p({
          type: "camera-filled",
          size: "34",
          color: "#FF8600"
        })
      }, {
        E: common_vendor.o(($event) => handleImageUpload("logoUrl", "logo")),
        F: common_vendor.p({
          label: "品牌Logo (建议圆形)",
          required: true
        }),
        G: common_vendor.o(($event) => form.brandSlogan = $event),
        H: common_vendor.p({
          placeholder: "一句话描述您的品牌",
          inputBorder: false,
          modelValue: form.brandSlogan
        }),
        I: common_vendor.p({
          label: "品牌标语 (Slogan)"
        }),
        J: form.backgroundUrl
      }, form.backgroundUrl ? {
        K: form.backgroundUrl
      } : {
        L: common_vendor.p({
          type: "image",
          size: "30",
          color: "#999"
        })
      }, {
        M: common_vendor.o(($event) => handleImageUpload("backgroundUrl", "bg")),
        N: common_vendor.p({
          label: "品牌背景图 (选传)"
        }),
        O: common_vendor.o(($event) => form.shortIntro = $event),
        P: common_vendor.p({
          type: "textarea",
          maxlength: "150",
          placeholder: "介绍一下您的企业核心业务和愿景...",
          modelValue: form.shortIntro
        }),
        Q: common_vendor.p({
          label: "简短介绍 (150字内)",
          required: true
        }),
        R: common_vendor.o(onIndustryChange),
        S: common_vendor.o(($event) => industryLabel.value = $event),
        T: common_vendor.p({
          placeholder: "请选择行业",
          ["popup-title"]: "请选择行业",
          localdata: industryTree.value,
          map: {
            text: "name",
            value: "name"
          },
          modelValue: industryLabel.value
        }),
        U: common_vendor.p({
          label: "所属行业",
          name: "industryFirst"
        }),
        V: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        })
      }) : {}, {
        W: currentStep.value === 3
      }, currentStep.value === 3 ? common_vendor.e({
        X: common_vendor.o(($event) => form.officialWebsite = $event),
        Y: common_vendor.p({
          placeholder: "https://www.abc.com",
          inputBorder: false,
          modelValue: form.officialWebsite
        }),
        Z: common_vendor.p({
          label: "官方网站链接"
        }),
        aa: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        ab: common_vendor.o(($event) => form.wechatMpName = $event),
        ac: common_vendor.p({
          placeholder: "名称：ABC科技",
          inputBorder: false,
          modelValue: form.wechatMpName
        }),
        ad: common_vendor.o(($event) => form.wechatMpId = $event),
        ae: common_vendor.p({
          placeholder: "ID：ABC_Tech",
          inputBorder: false,
          modelValue: form.wechatMpId
        }),
        af: form.wechatMpQrcode
      }, form.wechatMpQrcode ? {
        ag: form.wechatMpQrcode
      } : {
        ah: common_vendor.p({
          type: "qrcode",
          size: "24",
          color: "#999"
        })
      }, {
        ai: common_vendor.o(($event) => handleImageUpload("wechatMpQrcode", "qrcode")),
        aj: common_vendor.o(($event) => form.videoAccount = $event),
        ak: common_vendor.p({
          placeholder: "视频号链接或ID",
          inputBorder: false,
          modelValue: form.videoAccount
        }),
        al: form.videoAccountQrcode
      }, form.videoAccountQrcode ? {
        am: form.videoAccountQrcode
      } : {
        an: common_vendor.p({
          type: "videocam",
          size: "24",
          color: "#999"
        })
      }, {
        ao: common_vendor.o(($event) => handleImageUpload("videoAccountQrcode", "qrcode")),
        ap: common_vendor.o(($event) => form.customerServicePhone = $event),
        aq: common_vendor.p({
          placeholder: "400-123-4567",
          inputBorder: false,
          modelValue: form.customerServicePhone
        }),
        ar: common_vendor.p({
          label: "客服电话"
        }),
        as: common_vendor.o(($event) => form.businessCooperation = $event),
        at: common_vendor.p({
          placeholder: "例如：王经理 13800138000",
          inputBorder: false,
          modelValue: form.businessCooperation
        }),
        av: common_vendor.p({
          label: "商务合作"
        }),
        aw: common_vendor.o(($event) => form.afterSaleEmail = $event),
        ax: common_vendor.p({
          placeholder: "service@abc.com",
          inputBorder: false,
          modelValue: form.afterSaleEmail
        }),
        ay: common_vendor.p({
          label: "售后支持邮箱"
        }),
        az: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        aA: common_vendor.f(onlineStores.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "657c9911-41-" + i0,
            c: common_vendor.o(($event) => onlineStores.value.splice(index, 1), "online-" + index),
            d: "657c9911-42-" + i0,
            e: common_vendor.o(($event) => item.platform = $event, "online-" + index),
            f: common_vendor.p({
              localdata: platformOptions,
              placeholder: "选择平台",
              modelValue: item.platform
            }),
            g: "657c9911-43-" + i0,
            h: common_vendor.o(($event) => item.name = $event, "online-" + index),
            i: common_vendor.p({
              placeholder: "店铺显示名称",
              inputBorder: false,
              modelValue: item.name
            }),
            j: "657c9911-44-" + i0,
            k: common_vendor.o(($event) => item.link = $event, "online-" + index),
            l: common_vendor.p({
              placeholder: "店铺链接/小程序路径",
              inputBorder: false,
              modelValue: item.link
            }),
            m: "online-" + index
          };
        }),
        aB: common_vendor.p({
          type: "trash-filled",
          size: "18",
          color: "#ff4d4f"
        }),
        aC: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#FF8600"
        }),
        aD: common_vendor.o(($event) => onlineStores.value.push({
          platform: "美团",
          name: "",
          link: ""
        })),
        aE: common_vendor.f(offlineStores.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "657c9911-46-" + i0,
            c: common_vendor.o(($event) => offlineStores.value.splice(index, 1), "offline-" + index),
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.address),
            f: "offline-" + index
          };
        }),
        aF: common_vendor.p({
          type: "trash-filled",
          size: "18",
          color: "#ff4d4f"
        }),
        aG: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#FF8600"
        }),
        aH: common_vendor.o(handleChooseLocation)
      }) : {}, {
        aI: currentStep.value === 4
      }, currentStep.value === 4 ? common_vendor.e({
        aJ: common_vendor.o(handleUploadGallery),
        aK: common_vendor.o(($event) => brandImageList.value = $event),
        aL: common_vendor.p({
          maxCount: 9,
          modelValue: brandImageList.value
        }),
        aM: !form.videoUrl
      }, !form.videoUrl ? {
        aN: common_vendor.p({
          type: "videocam-filled",
          size: "40",
          color: "#FF8600"
        }),
        aO: common_vendor.o(handleVideoUpload)
      } : common_vendor.e({
        aP: form.videoUrl,
        aQ: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#fff"
        }),
        aR: common_vendor.o(deleteVideo),
        aS: form.videoCoverUrl
      }, form.videoCoverUrl ? {
        aT: form.videoCoverUrl
      } : {
        aU: common_vendor.p({
          type: "image",
          size: "24",
          color: "#999"
        })
      }, {
        aV: common_vendor.o(handleChooseVideoCover)
      })) : {}, {
        aW: currentStep.value > 1
      }, currentStep.value > 1 ? {
        aX: common_vendor.o(($event) => currentStep.value--)
      } : {}, {
        aY: common_vendor.t(currentStep.value === 4 ? isEditMode.value ? "提交修改" : "确认发布" : "保存并继续"),
        aZ: common_vendor.o(handleStepProcess),
        ba: common_vendor.t(isEditMode.value ? "修改成功" : "发布成功"),
        bb: common_vendor.o(goCard),
        bc: common_vendor.o(goList),
        bd: common_vendor.sr(successPopup, "657c9911-52", {
          "k": "successPopup"
        }),
        be: common_vendor.p({
          ["mask-click"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-657c9911"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-edit/enterprise-edit.js.map
