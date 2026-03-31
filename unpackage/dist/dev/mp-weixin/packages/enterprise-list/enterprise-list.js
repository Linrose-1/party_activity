"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
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
    common_vendor.onShow(() => {
      fetchEnterpriseList(true, false);
    });
    common_vendor.onPullDownRefresh(() => {
      fetchEnterpriseList(true, true);
    });
    common_vendor.onReachBottom(() => {
      if (loadStatus.value === "noMore" || loadStatus.value === "loading")
        return;
      pageNo.value++;
      fetchEnterpriseList(false, false);
    });
    const fetchEnterpriseList = async (isRefresh = false, showFullLoading = true) => {
      if (isRefresh) {
        pageNo.value = 1;
        if (showFullLoading)
          loadStatus.value = "loading";
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user-enterprise-info/page", {
          method: "GET",
          data: {
            pageNo: pageNo.value,
            pageSize,
            userId: common_vendor.index.getStorageSync("userId")
            // 绑定当前登录人
          }
        });
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
        if (error) {
          loadStatus.value = "more";
          return;
        }
        const newList = data.list || [];
        list.value = isRefresh ? newList : [...list.value, ...newList];
        total.value = data.total;
        loadStatus.value = list.value.length >= data.total ? "noMore" : "more";
      } catch (e) {
        loadStatus.value = "more";
        common_vendor.index.__f__("error", "at packages/enterprise-list/enterprise-list.vue:205", "获取列表异常:", e);
      }
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
        label: "未知",
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
        url: `/packages/enterprise-card/enterprise-card?id=${id}`
      });
    };
    const handleGoAuth = (item) => {
      if (item.status === 3) {
        return common_vendor.index.showToast({
          title: "该企业已通过认证",
          icon: "success"
        });
      }
      if (item.status === 2) {
        return common_vendor.index.showToast({
          title: "认证审核中，请耐心等待",
          icon: "none"
        });
      }
      if (item.status === 0) {
        return common_vendor.index.showModal({
          title: "提示",
          content: "当前为草稿，请先完成信息发布",
          confirmText: "去编辑",
          success: (res) => {
            if (res.confirm)
              goToEdit(item.id);
          }
        });
      }
      common_vendor.index.navigateTo({
        url: `/packages/enterprise-auth/enterprise-auth?enterpriseId=${item.id}&enterpriseName=${encodeURIComponent(item.enterpriseName)}`
      });
    };
    const handleDelete = (item) => {
      common_vendor.index.showModal({
        title: "确定要删除吗？",
        content: `删除后"${item.enterpriseName}"的主页及名片将立即失效。`,
        confirmText: "确认删除",
        confirmColor: "#FF4D4F",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "处理中...",
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
              fetchEnterpriseList(true, false);
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
    common_vendor.onShareAppMessage(() => {
      const inviteCode = utils_user.getInviteCode();
      let sharePath = "/packages/enterprise-list/enterprise-list";
      if (inviteCode) {
        sharePath += `?inviteCode=${inviteCode}`;
      }
      common_vendor.index.__f__("log", "at packages/enterprise-list/enterprise-list.vue:385", "🚀 [企业列表] 发起分享，路径:", sharePath);
      return {
        title: "开启您的商业版图，创建企业展示品牌实力！🏢",
        path: sharePath,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
    common_vendor.onShareTimeline(() => {
      const inviteCode = utils_user.getInviteCode();
      let queryString = "";
      if (inviteCode) {
        queryString = `inviteCode=${inviteCode}`;
      }
      return {
        title: "猩聚社：创建企业名片，让更多商友发现合作机会",
        query: queryString,
        imageUrl: "https://img.gofor.club/logo_share.jpg"
      };
    });
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
            i: common_vendor.t(formatDate(item.createTime)),
            j: common_vendor.o(($event) => goDetail(item.id), item.id),
            k: item.status === 0
          }, item.status === 0 ? {
            l: "378d963d-2-" + i0,
            m: common_vendor.p({
              type: "info-filled",
              size: "14",
              color: "#FF7919"
            }),
            n: common_vendor.o(($event) => goToEdit(item.id), item.id)
          } : {}, {
            o: item.status === 4
          }, item.status === 4 ? {
            p: "378d963d-3-" + i0,
            q: common_vendor.p({
              type: "clear",
              size: "14",
              color: "#F44336"
            }),
            r: common_vendor.t(item.statusDesc || "资料不符合规范，请重新上传"),
            s: "378d963d-4-" + i0,
            t: common_vendor.p({
              type: "right",
              size: "12",
              color: "#F44336"
            }),
            v: common_vendor.o(($event) => handleGoAuth(item), item.id)
          } : {}, {
            w: "378d963d-5-" + i0,
            x: common_vendor.o(($event) => goDetail(item.id), item.id),
            y: "378d963d-6-" + i0,
            z: common_vendor.o(($event) => goCard(item.id), item.id),
            A: "378d963d-7-" + i0,
            B: common_vendor.o(($event) => handleGoAuth(item), item.id),
            C: "378d963d-8-" + i0,
            D: common_vendor.o(($event) => handleDelete(item), item.id),
            E: item.id
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
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/enterprise-list/enterprise-list.js.map
