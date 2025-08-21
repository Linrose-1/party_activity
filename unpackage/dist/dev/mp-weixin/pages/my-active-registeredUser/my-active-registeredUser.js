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
const _sfc_main = {
  __name: "my-active-registeredUser",
  setup(__props) {
    const activityInfo = common_vendor.ref(null);
    const userList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const pageNo = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    common_vendor.onLoad((options) => {
      if (options.item) {
        try {
          const itemData = JSON.parse(decodeURIComponent(options.item));
          activityInfo.value = itemData;
          common_vendor.index.setNavigationBarTitle({
            title: "报名用户管理"
          });
          handleRefresh();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/my-active-registeredUser/my-active-registeredUser.vue:109", "解析聚会信息失败", e);
          common_vendor.index.showToast({
            title: "加载聚会信息失败",
            icon: "none"
          });
        }
      }
    });
    const getRegisteredUsers = async () => {
      if (loading.value)
        return;
      if (pageNo.value > 1 && !hasMore.value) {
        return;
      }
      loading.value = true;
      const params = {
        activityId: activityInfo.value.id,
        pageNo: pageNo.value,
        pageSize: pageSize.value
      };
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/activity-join/list", {
        method: "GET",
        data: params
      });
      loading.value = false;
      if (refreshing.value) {
        refreshing.value = false;
      }
      if (error) {
        common_vendor.index.showToast({
          title: error || "加载失败",
          icon: "none"
        });
        return;
      }
      if (data && data.list) {
        const newList = data.list;
        userList.value = pageNo.value === 1 ? newList : [...userList.value, ...newList];
        hasMore.value = userList.value.length < data.total;
        if (hasMore.value) {
          pageNo.value++;
        }
      }
    };
    const onRefresh = () => {
      if (refreshing.value)
        return;
      refreshing.value = true;
      handleRefresh();
    };
    const handleRefresh = () => {
      pageNo.value = 1;
      hasMore.value = true;
      userList.value = [];
      getRegisteredUsers();
    };
    const onReachBottom = () => {
      if (hasMore.value && !loading.value) {
        getRegisteredUsers();
      }
    };
    const handleConfirm = (item) => {
      common_vendor.index.showModal({
        title: "确认收款",
        content: `确定要为用户“${item.memberUser.nickname}”确认报名吗？`,
        confirmColor: "#FF7900",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在提交..."
            });
            const {
              error
            } = await utils_request.request("/app-api/member/activity-join/confirm-user-join", {
              method: "POST",
              data: {
                id: item.id,
                activityId: item.activityId
              }
            });
            common_vendor.index.hideLoading();
            if (error) {
              common_vendor.index.showToast({
                title: error,
                icon: "none"
              });
            } else {
              common_vendor.index.showToast({
                title: "确认成功",
                icon: "success"
              });
              handleRefresh();
            }
          }
        }
      });
    };
    const handleReject = (item) => {
      common_vendor.index.showModal({
        title: `即将驳回用户“${item.memberUser.nickname}”的报名申请。`,
        content: "",
        editable: true,
        placeholderText: "请输入驳回原因（必填）",
        confirmColor: "#FF7900",
        success: async (res) => {
          if (res.confirm) {
            if (!res.content || res.content.trim() === "") {
              common_vendor.index.showToast({
                title: "驳回原因不能为空",
                icon: "none"
              });
              return;
            }
            common_vendor.index.showLoading({
              title: "正在提交..."
            });
            const {
              error
            } = await utils_request.request("/app-api/member/activity-join/reject-user-join", {
              method: "POST",
              data: {
                id: item.id,
                rejectMsg: res.content
              }
            });
            common_vendor.index.hideLoading();
            if (error) {
              common_vendor.index.showToast({
                title: error,
                icon: "none"
              });
            } else {
              common_vendor.index.showToast({
                title: "驳回成功",
                icon: "success"
              });
              handleRefresh();
            }
          }
        }
      });
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "时间待定";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    const getStatusClass = (statusStr) => {
      const classMap = {
        "待确定": "status-pending",
        "已支付": "status-confirmed",
        "已驳回": "status-rejected",
        "替补": "status-substitute",
        "已退款": "status-refunded"
      };
      return classMap[statusStr] || "status-default";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityInfo.value
      }, activityInfo.value ? {
        b: common_vendor.p({
          type: "flag-filled",
          size: "20",
          color: "#FF7900"
        }),
        c: common_vendor.t(activityInfo.value.activityTitle),
        d: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#909399"
        }),
        e: common_vendor.t(formatTime(activityInfo.value.startDatetime)),
        f: common_vendor.p({
          type: "map-pin",
          size: "16",
          color: "#909399"
        }),
        g: common_vendor.t(activityInfo.value.locationAddress || "线上聚会")
      } : {}, {
        h: userList.value.length > 0
      }, userList.value.length > 0 ? {
        i: common_vendor.f(userList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.memberUser.avatar || "/static/default-avatar.png",
            b: common_vendor.t(item.memberUser.nickname || "匿名用户"),
            c: common_vendor.t(formatTime(item.registeredAt)),
            d: common_vendor.t(item.paymentStatusStr),
            e: common_vendor.n(getStatusClass(item.paymentStatusStr)),
            f: item.paymentScreenshotUrl
          }, item.paymentScreenshotUrl ? {
            g: item.paymentScreenshotUrl,
            h: common_vendor.o(($event) => previewImage(item.paymentScreenshotUrl), item.id)
          } : {}, {
            i: item.rejectMsg
          }, item.rejectMsg ? {
            j: "90acde2c-3-" + i0,
            k: common_vendor.p({
              type: "info-filled",
              size: "16",
              color: "#f56c6c"
            }),
            l: common_vendor.t(item.rejectMsg)
          } : {}, {
            m: item.paymentStatusStr === "待确定"
          }, item.paymentStatusStr === "待确定" ? {
            n: common_vendor.o(($event) => handleReject(item), item.id),
            o: common_vendor.o(($event) => handleConfirm(item), item.id)
          } : {}, {
            p: item.id
          });
        })
      } : !loading.value ? {
        k: common_vendor.p({
          type: "staff-filled",
          size: "60",
          color: "#c8c9cc"
        })
      } : {}, {
        j: !loading.value,
        l: loading.value && userList.value.length > 0
      }, loading.value && userList.value.length > 0 ? {
        m: common_vendor.p({
          status: "loading"
        })
      } : {}, {
        n: !hasMore.value && userList.value.length > 0
      }, !hasMore.value && userList.value.length > 0 ? {
        o: common_vendor.p({
          status: "noMore"
        })
      } : {}, {
        p: refreshing.value,
        q: common_vendor.o(onRefresh),
        r: common_vendor.o(onReachBottom)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-90acde2c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-active-registeredUser/my-active-registeredUser.js.map
