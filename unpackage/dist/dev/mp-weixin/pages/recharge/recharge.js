"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "recharge",
  setup(__props) {
    const currentTab = common_vendor.ref(1);
    const isPaying = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const zhimiOptions = [10, 20, 50, 100, 500];
    const selectedZhimiIndex = common_vendor.ref(0);
    const customAmount = common_vendor.ref("");
    const memberLevels = common_vendor.ref([]);
    const selectedLevelNum = common_vendor.ref(null);
    const currentMemberLevelName = common_vendor.ref("加载中...");
    const payAmount = common_vendor.computed(() => {
      if (currentTab.value === 1) {
        if (customAmount.value) {
          return parseFloat(customAmount.value).toFixed(2);
        }
        if (selectedZhimiIndex.value !== -1) {
          return zhimiOptions[selectedZhimiIndex.value].toFixed(2);
        }
        return "0.00";
      } else {
        const level = memberLevels.value.find((item) => item.level === selectedLevelNum.value);
        return level ? Number(level.priceDifference).toFixed(2) : "0.00";
      }
    });
    common_vendor.onLoad((options) => {
      if (options.type === "membership") {
        currentTab.value = 2;
      }
    });
    common_vendor.onMounted(async () => {
      await fetchUserInfo();
      fetchMemberLevels();
    });
    const switchTab = (index) => {
      currentTab.value = index;
      if (index === 1) {
        customAmount.value = "";
        selectedZhimiIndex.value = 0;
      }
    };
    const selectZhimiOption = (index) => {
      selectedZhimiIndex.value = index;
      customAmount.value = "";
    };
    const onCustomInput = () => {
      if (customAmount.value) {
        selectedZhimiIndex.value = -1;
      }
    };
    const selectMemberLevel = (level) => {
      if (level.isChoice === 0) {
        common_vendor.index.showToast({
          title: "该等级不可选",
          icon: "none"
        });
        return;
      }
      selectedLevelNum.value = level.level;
    };
    const fetchUserInfo = async () => {
      var _a;
      const {
        data
      } = await utils_request.request("/app-api/member/user/get");
      if (data) {
        userInfo.value = data;
        currentMemberLevelName.value = ((_a = data.topUpLevel) == null ? void 0 : _a.name) || data.topUpLevelName || "普通用户";
      }
    };
    const fetchMemberLevels = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/top-up-level/list");
      if (!error && data) {
        const sortedList = data.sort((a, b) => a.level - b.level);
        memberLevels.value = sortedList;
        const firstChoice = sortedList.find((item) => item.isChoice === 1);
        if (firstChoice) {
          selectedLevelNum.value = firstChoice.level;
        }
      }
    };
    const goToMemberDetails = () => {
      common_vendor.index.navigateTo({
        url: `/pages/my-memberDetails/my-memberDetails?level=${selectedLevelNum.value || 1}`
      });
    };
    const createOrder = async () => {
      const selectedLevelObj = memberLevels.value.find((l) => l.level === selectedLevelNum.value);
      let payload = {
        userId: userInfo.value.id,
        payType: currentTab.value,
        remark: currentTab.value === 2 ? `购买会员:${selectedLevelObj == null ? void 0 : selectedLevelObj.name}` : "充值智米"
      };
      if (currentTab.value === 2) {
        payload.levelId = selectedLevelObj.id || selectedLevelObj.level;
      } else {
        payload.amount = parseFloat(payAmount.value);
      }
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:285", "1. 开始创建订单, 参数:", payload);
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-post-pay-record/create", {
        method: "POST",
        data: payload
      });
      if (error)
        throw new Error(error);
      return data;
    };
    const getPayParams = async (orderNo) => {
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:300", "正在获取支付签名，订单号:", orderNo);
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-post-pay-record/pay", {
        method: "POST",
        data: {
          orderNo: orderNo.orderNo
        }
      });
      if (error)
        throw new Error(error);
      return data;
    };
    const requestWxPayment = (params) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.requestPayment({
          provider: "weixin",
          ...params,
          success: (res) => resolve(res),
          fail: (err) => {
            if (err.errMsg.includes("cancel")) {
              reject(new Error("用户取消支付"));
            } else {
              reject(new Error("支付失败，请重试"));
            }
          }
        });
      });
    };
    const getButtonText = () => {
      if (isPaying.value)
        return "处理中...";
      if (currentTab.value === 2) {
        const selectedLevel = memberLevels.value.find((l) => l.level === selectedLevelNum.value);
        if (selectedLevel && selectedLevel.isExchange === 1) {
          return "确认置换";
        }
      }
      return "立即支付";
    };
    const handleExchange = async () => {
      const selectedLevelObj = memberLevels.value.find((l) => l.level === selectedLevelNum.value);
      if (!selectedLevelObj)
        return;
      common_vendor.index.showModal({
        title: "确认置换",
        content: `您当前的剩余价值足以覆盖目标等级，确认免费置换为【${selectedLevelObj.name}】吗？`,
        success: async (res) => {
          if (res.confirm) {
            isPaying.value = true;
            common_vendor.index.showLoading({
              title: "置换中..."
            });
            try {
              const {
                error
              } = await utils_request.request("/app-api/member/top-up-level/exchange-top-up-level", {
                method: "POST",
                // 假设是 POST，或者是 PUT？通常操作类用 POST
                data: {
                  topUpLevelId: selectedLevelObj.id
                  // 传 id
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
                  title: "置换成功",
                  icon: "success"
                });
                await fetchUserInfo();
                await fetchMemberLevels();
                setTimeout(() => common_vendor.index.navigateBack(), 1500);
              }
            } catch (e) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "网络异常",
                icon: "none"
              });
            } finally {
              isPaying.value = false;
            }
          }
        }
      });
    };
    const handleButtonClick = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      if (currentTab.value === 2) {
        const selectedLevel = memberLevels.value.find((l) => l.level === selectedLevelNum.value);
        if (selectedLevel && selectedLevel.isExchange === 1) {
          handleExchange();
          return;
        }
      }
      handleRecharge();
    };
    const handleRecharge = async () => {
      if (!await utils_user.checkLoginGuard())
        return;
      const amount = parseFloat(payAmount.value);
      if (amount < 0) {
        return common_vendor.index.showToast({
          title: "支付金额异常",
          icon: "none"
        });
      }
      if (currentTab.value === 1 && amount < 1) {
        return common_vendor.index.showToast({
          title: "智米最小充值 1 元",
          icon: "none"
        });
      }
      isPaying.value = true;
      common_vendor.index.showLoading({
        title: "正在创建订单...",
        mask: true
      });
      try {
        const orderNo = await createOrder();
        common_vendor.index.showLoading({
          title: "请求支付中..."
        });
        const payParams = await getPayParams(orderNo);
        await requestWxPayment(payParams);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        const msg = error.message || "支付异常";
        if (msg === "用户取消支付") {
          common_vendor.index.showToast({
            title: "已取消支付",
            icon: "none"
          });
        } else {
          common_vendor.index.showModal({
            title: "支付失败",
            content: msg,
            showCancel: false
          });
        }
      } finally {
        isPaying.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === 1
      }, currentTab.value === 1 ? {} : {}, {
        b: currentTab.value === 1 ? 1 : "",
        c: common_vendor.o(($event) => switchTab(1)),
        d: currentTab.value === 2
      }, currentTab.value === 2 ? {} : {}, {
        e: currentTab.value === 2 ? 1 : "",
        f: common_vendor.o(($event) => switchTab(2)),
        g: currentTab.value === 1
      }, currentTab.value === 1 ? {
        h: common_vendor.f(zhimiOptions, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: common_vendor.t(item),
            c: index,
            d: selectedZhimiIndex.value === index ? 1 : "",
            e: common_vendor.o(($event) => selectZhimiOption(index), index)
          };
        }),
        i: common_vendor.o([($event) => customAmount.value = $event.detail.value, onCustomInput]),
        j: customAmount.value
      } : {}, {
        k: currentTab.value === 2
      }, currentTab.value === 2 ? {
        l: common_vendor.t(currentMemberLevelName.value),
        m: common_vendor.p({
          type: "right",
          size: "12",
          color: "#FF6E00"
        }),
        n: common_vendor.o(goToMemberDetails),
        o: common_vendor.f(memberLevels.value, (level, index, i0) => {
          return common_vendor.e({
            a: level.isChoice === 0
          }, level.isChoice === 0 ? {} : {}, {
            b: common_vendor.t(level.name),
            c: common_vendor.t(level.duration || "永久"),
            d: common_vendor.t(level.price),
            e: level.isExchange === 1
          }, level.isExchange === 1 ? {} : {
            f: common_vendor.t(level.priceDifference)
          }, {
            g: selectedLevelNum.value === level.level
          }, selectedLevelNum.value === level.level ? {} : {}, {
            h: level.level,
            i: selectedLevelNum.value === level.level ? 1 : "",
            j: level.isChoice === 0 ? 1 : "",
            k: common_vendor.o(($event) => selectMemberLevel(level), level.level)
          });
        }),
        p: common_vendor.p({
          type: "info",
          size: "14",
          color: "#999"
        })
      } : {}, {
        q: common_vendor.t(payAmount.value),
        r: common_vendor.t(getButtonText()),
        s: common_vendor.o(handleButtonClick),
        t: isPaying.value || currentTab.value === 1 && parseFloat(payAmount.value) <= 0,
        v: isPaying.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2984a38c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map
