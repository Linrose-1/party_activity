"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const pageSize = 10;
const _sfc_main = {
  __name: "participant-detail",
  setup(__props) {
    const activityId = common_vendor.ref("");
    const organizerId = common_vendor.ref("");
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    common_vendor.onLoad((options) => {
      if (options.id) {
        activityId.value = options.id;
        organizerId.value = common_vendor.index.getStorageSync("userId");
        loadData(true);
      } else {
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    const loadData = async (isRefresh = false) => {
      if (loadingStatus.value === "loading")
        return;
      if (!isRefresh && loadingStatus.value === "noMore")
        return;
      loadingStatus.value = "loading";
      if (isRefresh) {
        pageNo.value = 1;
        list.value = [];
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/participant-detail", {
          method: "GET",
          data: {
            activityId: activityId.value,
            // organizerId: organizerId.value,
            pageNo: pageNo.value,
            pageSize
          }
        });
        if (!error && data) {
          const newList = data.list || [];
          list.value = isRefresh ? newList : [...list.value, ...newList];
          total.value = data.total || 0;
          if (list.value.length >= total.value) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
            if (list.value.length < 12) {
              common_vendor.index.__f__("log", "at packages/participant-detail/participant-detail.vue:140", "数据量较少，自动加载下一页...");
              setTimeout(() => {
                loadMore();
              }, 200);
            }
          }
        } else {
          loadingStatus.value = "more";
          common_vendor.index.showToast({
            title: error || "加载失败",
            icon: "none"
          });
        }
      } catch (e) {
        loadingStatus.value = "more";
        common_vendor.index.__f__("error", "at packages/participant-detail/participant-detail.vue:156", e);
      }
      common_vendor.index.__f__("log", "at packages/participant-detail/participant-detail.vue:159", `加载完成: 当前数量=${list.value.length}, 总数=${total.value}, 状态=${loadingStatus.value}`);
    };
    const loadMore = () => {
      loadData(false);
    };
    const getGenderText = (sex) => {
      if (sex === 1)
        return "男";
      if (sex === 2)
        return "女";
      return "未知";
    };
    const handleExport = () => {
      if (list.value.length === 0)
        return;
      common_vendor.index.showModal({
        title: "导出到邮箱",
        content: "",
        editable: true,
        // 显示输入框
        placeholderText: "请输入接收邮箱地址",
        confirmText: "发送",
        success: async (res) => {
          if (res.confirm) {
            const email = res.content.trim();
            if (!validateEmail(email)) {
              common_vendor.index.showToast({
                title: "邮箱格式不正确",
                icon: "none"
              });
              return;
            }
            await sendExportRequest(email);
          }
        }
      });
    };
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };
    const sendExportRequest = async (email) => {
      common_vendor.index.showLoading({
        title: "文件生成中...",
        mask: true
      });
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/export-to-email", {
          method: "POST",
          data: {
            activityId: activityId.value,
            email
          }
        });
        common_vendor.index.hideLoading();
        if (!error && data === true) {
          common_vendor.index.showModal({
            title: "发送成功",
            content: "参会者清单已发送到您的邮箱，请查收。",
            showCancel: false,
            confirmText: "知道了"
          });
        } else {
          common_vendor.index.showToast({
            title: error || "发送失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "info",
          size: "14",
          color: "#909399"
        }),
        b: common_vendor.f(list.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.realName || "-"),
            b: common_vendor.t(item.nickname || "-"),
            c: common_vendor.t(getGenderText(item.sex)),
            d: common_vendor.t(item.mobile || "-"),
            e: index,
            f: index % 2 === 1 ? 1 : ""
          };
        }),
        c: list.value.length > 0 || loadingStatus.value === "loading"
      }, list.value.length > 0 || loadingStatus.value === "loading" ? {
        d: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        e: list.value.length === 0 && loadingStatus.value === "noMore"
      }, list.value.length === 0 && loadingStatus.value === "noMore" ? {
        f: common_vendor.p({
          type: "staff",
          size: "50",
          color: "#ccc"
        })
      } : {}, {
        g: common_vendor.o(loadMore),
        h: common_vendor.p({
          type: "email-filled",
          size: "18",
          color: "#fff"
        }),
        i: common_vendor.o(handleExport),
        j: list.value.length === 0
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c2f43f13"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/participant-detail/participant-detail.js.map
