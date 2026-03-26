"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_upload = require("../../utils/upload.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_DragImageUploader2 = common_vendor.resolveComponent("DragImageUploader");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_forms2 + _easycom_uni_data_picker2 + _easycom_DragImageUploader2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_DragImageUploader = () => "../../components/DragImageUploader/DragImageUploader.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_forms + _easycom_uni_data_picker + _easycom_DragImageUploader + _easycom_uni_popup)();
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
      }),
      /**
       * 获取字典数据
       * @param {String} type - 字典类型
       */
      getDict: (type) => utils_request.request("/app-api/system/dict-data/type", {
        method: "GET",
        data: {
          type
        }
      })
    };
    const currentStep = common_vendor.ref(1);
    const stepTitles = ["企业信息", "品牌展示", "联系入口", "内容资产"];
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
      enterpriseLogo: "",
      brandName: "",
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
    const typeOptions = common_vendor.ref([]);
    const platformOptions = common_vendor.ref([]);
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
    const checkRealName = async () => {
      common_vendor.index.showLoading({
        title: "验证身份中...",
        mask: true
      });
      const userInfo = await utils_user.syncUserInfo();
      common_vendor.index.hideLoading();
      if (!userInfo || userInfo.idCert !== 1) {
        common_vendor.index.showModal({
          title: "实名认证提醒",
          content: "创建企业需要先完成实名认证，是否立即前往？",
          confirmText: "去认证",
          cancelText: "取消",
          confirmColor: "#FF8600",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/packages/my-auth/my-auth"
              });
            }
          }
        });
        return false;
      }
      return true;
    };
    common_vendor.onLoad(async (options) => {
      if (!options.id) {
        await checkRealName();
      }
      if (options.id) {
        isEditMode.value = true;
        enterpriseId.value = options.id;
        await fetchEnterpriseDetail(options.id);
      }
    });
    common_vendor.onMounted(() => {
      fetchIndustryTree();
      loadAllDicts();
    });
    const handleStepClick = async (targetStep) => {
      if (targetStep === currentStep.value)
        return;
      if (!isEditMode.value && !enterpriseId.value && targetStep > 1) {
        common_vendor.index.showToast({
          title: "请先填写并保存基本信息",
          icon: "none"
        });
        return;
      }
      try {
        await saveCurrentProgressSilence();
      } catch (e) {
        common_vendor.index.__f__("warn", "at packages/enterprise-edit/enterprise-edit.vue:537", "静默保存失败:", e);
      }
      currentStep.value = targetStep;
      common_vendor.nextTick$1(() => {
        common_vendor.index.pageScrollTo({
          scrollTop: 0,
          duration: 100
        });
      });
    };
    const saveCurrentProgressSilence = async () => {
      if (!isEditMode.value && !checkRealName())
        return;
      form.brandImages = brandImageList.value.join(",");
      form.offlineStores = JSON.stringify(offlineStores.value);
      form.onlineStores = JSON.stringify(onlineStores.value);
      if (isEditMode.value || enterpriseId.value) {
        await Api.update(form);
      } else {
        if (!form.enterpriseName || !form.creditCode)
          return;
        const {
          id,
          ...createParams
        } = form;
        const res = await Api.create(createParams);
        if (!res.error && res.data) {
          enterpriseId.value = res.data;
          form.id = res.data;
        }
      }
    };
    const loadAllDicts = async () => {
      try {
        const [typeRes, platformRes] = await Promise.all([
          Api.getDict("enterprise_type"),
          Api.getDict("online_stores_online")
        ]);
        if (typeRes.data) {
          typeOptions.value = typeRes.data.map((item) => ({
            text: item.label,
            // 显示文字
            value: item.label
            // 存储值 (保持与之前逻辑一致，存储名称字符串)
          }));
        }
        if (platformRes.data) {
          platformOptions.value = platformRes.data.map((item) => ({
            text: item.label,
            value: item.label
          }));
        }
        common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:609", "✅ 字典数据加载成功");
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/enterprise-edit/enterprise-edit.vue:611", "❌ 加载字典失败", e);
      }
    };
    const fetchIndustryTree = async () => {
      const {
        data,
        error
      } = await Api.getIndustry();
      if (data) {
        industryTree.value = processTree(data);
      } else if (error) {
        common_vendor.index.__f__("error", "at packages/enterprise-edit/enterprise-edit.vue:626", "获取行业树失败:", error);
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
      common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:667", "📦 原始选择节点:", nodes);
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
          industryLabel.value = level2Name || level1Name;
        }
        common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:684", "✅ 最终存储结果:", form.industryFirst, form.industrySecond);
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
        industryLabel.value = data.industrySecond || data.industryFirst;
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
        common_vendor.index.__f__("error", "at packages/enterprise-edit/enterprise-edit.vue:726", "数据格式转换失败:", e);
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
          common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:830", "用户取消视频选择", err);
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
          common_vendor.index.__f__("log", "at packages/enterprise-edit/enterprise-edit.vue:907", "用户取消了位置选择");
        }
      });
    };
    const handleStepProcess = async () => {
      if (currentStep.value === 1 && !isEditMode.value) {
        const isVerified = await checkRealName();
        if (!isVerified) {
          return;
        }
      }
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
      url: `/packages/enterprise-card/enterprise-card?id=${enterpriseId.value || form.id}`
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
            e: currentStep.value >= index + 1 ? 1 : "",
            f: common_vendor.o(($event) => handleStepClick(index + 1), index)
          });
        }),
        b: currentStep.value === 1
      }, currentStep.value === 1 ? common_vendor.e({
        c: form.enterpriseLogo
      }, form.enterpriseLogo ? {
        d: form.enterpriseLogo
      } : {
        e: common_vendor.p({
          type: "camera-filled",
          size: "30",
          color: "#FF8600"
        })
      }, {
        f: common_vendor.o(($event) => handleImageUpload("enterpriseLogo", "ent_logo")),
        g: common_vendor.p({
          label: "企业LOGO",
          required: true
        }),
        h: common_vendor.o(($event) => form.enterpriseName = $event),
        i: common_vendor.p({
          placeholder: "请与营业执照保持一致",
          inputBorder: false,
          modelValue: form.enterpriseName
        }),
        j: common_vendor.p({
          label: "企业名称",
          name: "enterpriseName",
          required: true
        }),
        k: common_vendor.o(($event) => form.creditCode = $event),
        l: common_vendor.p({
          placeholder: "18位统一社会信用代码",
          inputBorder: false,
          modelValue: form.creditCode
        }),
        m: common_vendor.p({
          label: "统一社会信用代码",
          name: "creditCode",
          required: true
        }),
        n: common_vendor.o(($event) => form.enterpriseType = $event),
        o: common_vendor.p({
          localdata: typeOptions.value,
          placeholder: "请选择企业类型",
          modelValue: form.enterpriseType
        }),
        p: common_vendor.p({
          label: "企业类型",
          name: "enterpriseType"
        }),
        q: common_vendor.o(($event) => form.legalPerson = $event),
        r: common_vendor.p({
          placeholder: "请输入姓名",
          inputBorder: false,
          modelValue: form.legalPerson
        }),
        s: common_vendor.p({
          label: "法定代表人",
          name: "legalPerson"
        }),
        t: common_vendor.o(($event) => form.establishDate = $event),
        v: common_vendor.p({
          type: "date",
          modelValue: form.establishDate
        }),
        w: common_vendor.p({
          label: "成立日期",
          name: "establishDate"
        }),
        x: common_vendor.o(($event) => form.officePhone = $event),
        y: common_vendor.p({
          placeholder: "例如：021-12345678",
          inputBorder: false,
          modelValue: form.officePhone
        }),
        z: common_vendor.p({
          label: "联系电话",
          name: "officePhone"
        }),
        A: common_vendor.o(($event) => form.officialEmail = $event),
        B: common_vendor.p({
          placeholder: "contact@abc.com",
          inputBorder: false,
          modelValue: form.officialEmail
        }),
        C: common_vendor.p({
          label: "联系邮箱",
          name: "officialEmail"
        }),
        D: common_vendor.sr("formStep1", "657c9911-0"),
        E: common_vendor.p({
          modelValue: form,
          rules,
          ["label-position"]: "top",
          ["label-width"]: "100%"
        })
      }) : {}, {
        F: currentStep.value === 2
      }, currentStep.value === 2 ? common_vendor.e({
        G: form.logoUrl
      }, form.logoUrl ? {
        H: form.logoUrl
      } : {
        I: common_vendor.p({
          type: "camera-filled",
          size: "34",
          color: "#FF8600"
        })
      }, {
        J: common_vendor.o(($event) => handleImageUpload("logoUrl", "logo")),
        K: common_vendor.p({
          label: "品牌Logo (建议圆形)",
          required: true
        }),
        L: common_vendor.o(($event) => form.brandName = $event),
        M: common_vendor.p({
          placeholder: "例如：猩聚社",
          inputBorder: false,
          modelValue: form.brandName
        }),
        N: common_vendor.p({
          label: "品牌名称",
          required: true
        }),
        O: common_vendor.o(($event) => form.brandSlogan = $event),
        P: common_vendor.p({
          placeholder: "一句话描述您的品牌",
          inputBorder: false,
          modelValue: form.brandSlogan
        }),
        Q: common_vendor.p({
          label: "品牌标语 (Slogan)"
        }),
        R: form.backgroundUrl
      }, form.backgroundUrl ? {
        S: form.backgroundUrl
      } : {
        T: common_vendor.p({
          type: "image",
          size: "30",
          color: "#999"
        })
      }, {
        U: common_vendor.o(($event) => handleImageUpload("backgroundUrl", "bg")),
        V: common_vendor.p({
          label: "品牌背景图 (选传)"
        }),
        W: common_vendor.o(($event) => form.shortIntro = $event),
        X: common_vendor.p({
          type: "textarea",
          maxlength: "3000",
          placeholder: "介绍一下您的企业核心业务和愿景...",
          modelValue: form.shortIntro
        }),
        Y: common_vendor.p({
          label: "简短介绍",
          required: true
        }),
        Z: common_vendor.o(onIndustryChange),
        aa: common_vendor.o(($event) => industryLabel.value = $event),
        ab: common_vendor.p({
          placeholder: "请选择行业",
          ["popup-title"]: "请选择行业",
          localdata: industryTree.value,
          map: {
            text: "name",
            value: "name"
          },
          modelValue: industryLabel.value
        }),
        ac: common_vendor.p({
          label: "所属行业",
          name: "industryFirst"
        }),
        ad: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        })
      }) : {}, {
        ae: currentStep.value === 3
      }, currentStep.value === 3 ? common_vendor.e({
        af: common_vendor.o(($event) => form.officialWebsite = $event),
        ag: common_vendor.p({
          placeholder: "https://www.abc.com",
          inputBorder: false,
          modelValue: form.officialWebsite
        }),
        ah: common_vendor.p({
          label: "官方网站链接"
        }),
        ai: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        aj: common_vendor.o(($event) => form.wechatMpName = $event),
        ak: common_vendor.p({
          placeholder: "名称：ABC科技",
          inputBorder: false,
          modelValue: form.wechatMpName
        }),
        al: form.wechatMpQrcode
      }, form.wechatMpQrcode ? {
        am: form.wechatMpQrcode
      } : {
        an: common_vendor.p({
          type: "qrcode",
          size: "24",
          color: "#999"
        })
      }, {
        ao: common_vendor.o(($event) => handleImageUpload("wechatMpQrcode", "qrcode")),
        ap: common_vendor.o(($event) => form.videoAccount = $event),
        aq: common_vendor.p({
          placeholder: "视频号链接或ID",
          inputBorder: false,
          modelValue: form.videoAccount
        }),
        ar: form.videoAccountQrcode
      }, form.videoAccountQrcode ? {
        as: form.videoAccountQrcode
      } : {
        at: common_vendor.p({
          type: "videocam",
          size: "24",
          color: "#999"
        })
      }, {
        av: common_vendor.o(($event) => handleImageUpload("videoAccountQrcode", "qrcode")),
        aw: common_vendor.o(($event) => form.customerServicePhone = $event),
        ax: common_vendor.p({
          placeholder: "400-123-4567",
          inputBorder: false,
          modelValue: form.customerServicePhone
        }),
        ay: common_vendor.p({
          label: "客服电话"
        }),
        az: common_vendor.o(($event) => form.businessCooperation = $event),
        aA: common_vendor.p({
          placeholder: "例如：王经理 13800138000",
          inputBorder: false,
          modelValue: form.businessCooperation
        }),
        aB: common_vendor.p({
          label: "商务合作"
        }),
        aC: common_vendor.o(($event) => form.afterSaleEmail = $event),
        aD: common_vendor.p({
          placeholder: "service@abc.com",
          inputBorder: false,
          modelValue: form.afterSaleEmail
        }),
        aE: common_vendor.p({
          label: "售后支持邮箱"
        }),
        aF: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100%"
        }),
        aG: common_vendor.f(onlineStores.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "657c9911-44-" + i0,
            c: common_vendor.o(($event) => onlineStores.value.splice(index, 1), "online-" + index),
            d: "657c9911-45-" + i0,
            e: common_vendor.o(($event) => item.platform = $event, "online-" + index),
            f: common_vendor.p({
              localdata: platformOptions.value,
              placeholder: "选择平台",
              modelValue: item.platform
            }),
            g: "657c9911-46-" + i0,
            h: common_vendor.o(($event) => item.name = $event, "online-" + index),
            i: common_vendor.p({
              placeholder: "店铺显示名称",
              inputBorder: false,
              modelValue: item.name
            }),
            j: "657c9911-47-" + i0,
            k: common_vendor.o(($event) => item.link = $event, "online-" + index),
            l: common_vendor.p({
              placeholder: "店铺链接/小程序路径",
              inputBorder: false,
              modelValue: item.link
            }),
            m: "online-" + index
          };
        }),
        aH: common_vendor.p({
          type: "trash-filled",
          size: "18",
          color: "#ff4d4f"
        }),
        aI: common_vendor.p({
          type: "plusempty",
          size: "16",
          color: "#FF8600"
        }),
        aJ: common_vendor.o(($event) => onlineStores.value.push({
          platform: "美团",
          name: "",
          link: ""
        })),
        aK: common_vendor.f(offlineStores.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "657c9911-49-" + i0,
            c: common_vendor.o(($event) => offlineStores.value.splice(index, 1), "offline-" + index),
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.address),
            f: "offline-" + index
          };
        }),
        aL: common_vendor.p({
          type: "trash-filled",
          size: "18",
          color: "#ff4d4f"
        }),
        aM: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#FF8600"
        }),
        aN: common_vendor.o(handleChooseLocation)
      }) : {}, {
        aO: currentStep.value === 4
      }, currentStep.value === 4 ? common_vendor.e({
        aP: common_vendor.o(handleUploadGallery),
        aQ: common_vendor.o(($event) => brandImageList.value = $event),
        aR: common_vendor.p({
          maxCount: 9,
          modelValue: brandImageList.value
        }),
        aS: !form.videoUrl
      }, !form.videoUrl ? {
        aT: common_vendor.p({
          type: "videocam-filled",
          size: "40",
          color: "#FF8600"
        }),
        aU: common_vendor.o(handleVideoUpload)
      } : common_vendor.e({
        aV: form.videoUrl,
        aW: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#fff"
        }),
        aX: common_vendor.o(deleteVideo),
        aY: form.videoCoverUrl
      }, form.videoCoverUrl ? {
        aZ: form.videoCoverUrl
      } : {
        ba: common_vendor.p({
          type: "image",
          size: "24",
          color: "#999"
        })
      }, {
        bb: common_vendor.o(handleChooseVideoCover)
      })) : {}, {
        bc: currentStep.value > 1
      }, currentStep.value > 1 ? {
        bd: common_vendor.o(($event) => currentStep.value--)
      } : {}, {
        be: common_vendor.t(currentStep.value === 4 ? isEditMode.value ? "提交修改" : "确认发布" : "保存并继续"),
        bf: common_vendor.o(handleStepProcess),
        bg: common_vendor.t(isEditMode.value ? "修改成功" : "发布成功"),
        bh: common_vendor.o(goCard),
        bi: common_vendor.o(goList),
        bj: common_vendor.sr(successPopup, "657c9911-55", {
          "k": "successPopup"
        }),
        bk: common_vendor.p({
          ["mask-click"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-657c9911"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-edit/enterprise-edit.js.map
