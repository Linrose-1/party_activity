"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "home-customization",
  setup(__props) {
    const formRef = common_vendor.ref(null);
    const form = common_vendor.reactive({
      homeTitle: "",
      homeSlogan: "",
      isMergeBusinessFriend: 0
      // 默认 0 (不融合)
    });
    const isLoading = common_vendor.ref(true);
    const isSaving = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const initialStatusText = common_vendor.ref("正在检查权限...");
    common_vendor.onLoad(async () => {
      common_vendor.index.setNavigationBarTitle({
        title: "首页定制"
      });
      try {
        await fetchCustomizationData();
      } catch (e) {
        errorMsg.value = e.message || "页面加载失败";
      } finally {
        isLoading.value = false;
      }
    });
    const fetchCustomizationData = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error) {
        throw new Error(error);
      }
      if (data) {
        form.homeTitle = data.homeTitle || "";
        form.homeSlogan = data.homeSlogan || "";
        form.isMergeBusinessFriend = data.isMergeBusinessFriend || 0;
      }
    };
    const onMergeSwitchChange = (e) => {
      form.isMergeBusinessFriend = e.detail.value ? 1 : 0;
    };
    const submitForm = async () => {
      if (isSaving.value)
        return;
      isSaving.value = true;
      common_vendor.index.showLoading({
        title: "正在保存..."
      });
      try {
        const tasks = [];
        const updateTask = utils_request.request("/app-api/member/user/update", {
          method: "PUT",
          data: {
            homeTitle: form.homeTitle,
            homeSlogan: form.homeSlogan
          }
        });
        tasks.push(updateTask);
        const authUrl = `/app-api/member/user/edit-business-friend-auth?isMergeBusinessFriend=${form.isMergeBusinessFriend}`;
        const authTask = utils_request.request(authUrl, {
          method: "POST"
        });
        tasks.push(authTask);
        const results = await Promise.all(tasks);
        const updateRes = results[0];
        const authRes = results[1];
        if (updateRes.error || authRes.error) {
          const errorMsg2 = (updateRes.error || "") + (authRes.error ? " " + authRes.error : "");
          throw new Error(errorMsg2 || "部分设置保存失败");
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        common_vendor.index.$emit("userInfoChanged");
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/home-customization/home-customization.vue:189", "保存设置失败:", err);
        common_vendor.index.showToast({
          title: typeof err === "string" ? err : err.message || "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
        isSaving.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {
        b: common_vendor.p({
          status: "loading",
          contentText: {
            contentrefresh: initialStatusText.value
          }
        })
      } : errorMsg.value ? {
        d: common_vendor.p({
          type: "closeempty",
          size: "50",
          color: "#e43d33"
        }),
        e: common_vendor.t(errorMsg.value)
      } : {
        f: common_vendor.o(($event) => form.homeTitle = $event),
        g: common_vendor.p({
          placeholder: "请输入自定义商友圈标题",
          modelValue: form.homeTitle
        }),
        h: common_vendor.p({
          label: "商友圈标题",
          name: "homeTitle"
        }),
        i: common_vendor.o(($event) => form.homeSlogan = $event),
        j: common_vendor.p({
          type: "textarea",
          placeholder: "请输入自定义商友圈口号",
          modelValue: form.homeSlogan
        }),
        k: common_vendor.p({
          label: "商友圈口号",
          name: "homeSlogan"
        }),
        l: form.isMergeBusinessFriend === 1,
        m: common_vendor.o(onMergeSwitchChange),
        n: common_vendor.t(form.isMergeBusinessFriend === 1 ? "融合模式" : "非融合模式"),
        o: common_vendor.t(form.isMergeBusinessFriend === 1 ? "共享您的商友资源，也将获得平台共享的商友资源" : "您不共享您的商友资源，您也不能获得平台共享的商友资源"),
        p: common_vendor.p({
          label: "商友圈模式",
          name: "isMergeBusinessFriend"
        }),
        q: common_vendor.sr(formRef, "9b385765-2", {
          "k": "formRef"
        }),
        r: common_vendor.p({
          modelValue: form,
          ["label-width"]: 100
        }),
        s: common_vendor.t(isSaving.value ? "保存中..." : "保存设置"),
        t: common_vendor.o(submitForm),
        v: isSaving.value
      }, {
        c: errorMsg.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9b385765"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/home-customization/home-customization.js.map
