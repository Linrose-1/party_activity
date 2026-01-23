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
  __name: "enterprise-list",
  setup(__props) {
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const pageNo = common_vendor.ref(1);
    const loadStatus = common_vendor.ref("more");
    common_vendor.onMounted(() => {
      fetchEnterpriseList(true);
    });
    common_vendor.onPullDownRefresh(() => {
      fetchEnterpriseList(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadStatus.value === "noMore" || loadStatus.value === "loading")
        return;
      pageNo.value++;
      fetchEnterpriseList(false);
    });
    const fetchEnterpriseList = async (isRefresh = false) => {
      if (isRefresh) {
        pageNo.value = 1;
        loadStatus.value = "loading";
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-enterprise-info/page", {
        method: "GET",
        data: {
          pageNo: pageNo.value,
          pageSize,
          userId: common_vendor.index.getStorageSync("userId")
        }
      });
      if (isRefresh)
        common_vendor.index.stopPullDownRefresh();
      if (error) {
        loadStatus.value = "more";
        common_vendor.index.showToast({
          title: error,
          icon: "none"
        });
        return;
      }
      const newList = data.list || [];
      list.value = isRefresh ? newList : [...list.value, ...newList];
      total.value = data.total;
      loadStatus.value = list.value.length >= data.total ? "noMore" : "more";
    };
    const getStatusConfig = (status) => {
      const configs = {
        0: {
          label: "📝 草稿",
          class: "status-0"
        },
        1: {
          label: "✅ 已发布",
          class: "status-1"
        },
        2: {
          label: "⏳ 审核中",
          class: "status-2"
        },
        3: {
          label: "⭐ 已认证",
          class: "status-3"
        },
        4: {
          label: "🔒 认证失败",
          class: "status-4"
        }
      };
      return configs[status] || {
        label: "未知状态",
        class: ""
      };
    };
    const getDefaultIcon = (type) => {
      if (type == null ? void 0 : type.includes("餐饮"))
        return "🏭";
      if (type == null ? void 0 : type.includes("科技"))
        return "🏢";
      return "🏪";
    };
    const formatDate = (ts) => {
      if (!ts)
        return "-";
      const d = new Date(ts);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    };
    const truncateName = (name) => {
      if (!name)
        return "";
      return name.length > 12 ? name.substring(0, 12) + "..." : name;
    };
    const goToEdit = (id = "") => {
      common_vendor.index.navigateTo({
        url: `/packages/enterprise-edit/enterprise-edit?id=${id}`
      });
    };
    const goDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/packages/enterprise-detail/enterprise-detail?id=${id}`
      });
    };
    const goCard = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/enterprise/card?id=${id}`
        // 路径请按实际项目调整
      });
    };
    const handleGoAuth = (item) => {
      if (item.status === 3) {
        return common_vendor.index.showToast({
          title: "该企业已通过认证",
          icon: "success"
        });
      }
      common_vendor.index.showToast({
        title: "认证模块正在对接中...",
        icon: "none"
      });
    };
    const handleDelete = (item) => {
      common_vendor.index.showModal({
        title: "确定要删除吗？",
        content: `删除后"${item.enterpriseName}"的主页及名片将立即失效，且数据不可找回。`,
        confirmText: "确认删除",
        confirmColor: "#FF4D4F",
        cancelText: "我再想想",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在处理...",
              mask: true
            });
            const {
              error
            } = await utils_request.request(`/app-api/member/user-enterprise-info/delete?id=${item.id}`, {
              method: "DELETE"
            });
            common_vendor.index.hideLoading();
            if (!error) {
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              fetchEnterpriseList(true);
            } else {
              common_vendor.index.showToast({
                title: error,
                icon: "none"
              });
            }
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "plusempty",
          size: "20",
          color: "#fff"
        }),
        b: common_vendor.o(($event) => goToEdit("")),
        c: total.value > 0
      }, total.value > 0 ? {
        d: common_vendor.t(total.value)
      } : {}, {
        e: list.value.length > 0
      }, list.value.length > 0 ? {
        f: common_vendor.f(list.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "378d963d-1-" + i0,
            b: common_vendor.o(($event) => goToEdit(item.id), item.id),
            c: item.logoUrl
          }, item.logoUrl ? {
            d: item.logoUrl
          } : {
            e: common_vendor.t(getDefaultIcon(item.enterpriseType))
          }, {
            f: common_vendor.t(truncateName(item.enterpriseName)),
            g: common_vendor.t(getStatusConfig(item.status).label),
            h: common_vendor.n("status-" + item.status),
            i: common_vendor.t(item.enterpriseId || "系统分配中..."),
            j: common_vendor.t(formatDate(item.createTime)),
            k: common_vendor.o(($event) => goDetail(item.id), item.id),
            l: item.status === 0
          }, item.status === 0 ? {
            m: "378d963d-2-" + i0,
            n: common_vendor.p({
              type: "info-filled",
              size: "14",
              color: "#FF7919"
            }),
            o: common_vendor.o(($event) => goToEdit(item.id), item.id)
          } : {}, {
            p: "378d963d-3-" + i0,
            q: common_vendor.o(($event) => goDetail(item.id), item.id),
            r: "378d963d-4-" + i0,
            s: common_vendor.o(($event) => goCard(item.id), item.id),
            t: "378d963d-5-" + i0,
            v: common_vendor.o(($event) => handleGoAuth(item), item.id),
            w: "378d963d-6-" + i0,
            x: common_vendor.o(($event) => handleDelete(item), item.id),
            y: item.id
          });
        }),
        g: common_vendor.p({
          type: "compose",
          size: "14",
          color: "#999"
        }),
        h: common_vendor.p({
          type: "info",
          size: "16",
          color: "#666"
        }),
        i: common_vendor.p({
          type: "contact",
          size: "16",
          color: "#666"
        }),
        j: common_vendor.p({
          type: "auth",
          size: "16",
          color: "#666"
        }),
        k: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#FF4D4F"
        }),
        l: common_vendor.p({
          status: loadStatus.value,
          color: "#999"
        })
      } : loadStatus.value !== "loading" ? {
        n: common_vendor.o(($event) => goToEdit(""))
      } : {}, {
        m: loadStatus.value !== "loading"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-378d963d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-list/enterprise-list.js.map
