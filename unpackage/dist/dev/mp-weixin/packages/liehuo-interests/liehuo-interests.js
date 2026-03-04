"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const defaultAvatar = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "liehuo-interests",
  setup(__props) {
    const isLoading = common_vendor.ref(true);
    const postId = common_vendor.ref(null);
    const postTitle = common_vendor.ref("");
    const rawList = common_vendor.ref([]);
    const readIds = common_vendor.ref(/* @__PURE__ */ new Set());
    const filterTabs = [
      {
        label: "全部",
        value: "all"
      },
      {
        label: "今日",
        value: "today"
      },
      {
        label: "未读",
        value: "unread"
      }
    ];
    const activeFilter = common_vendor.ref("all");
    const interestList = common_vendor.computed(() => {
      return rawList.value.map((item) => {
        const user = item.memberUser || {};
        return {
          id: item.id,
          userId: item.userId,
          nickname: user.nickname || "匿名用户",
          avatar: user.avatar || defaultAvatar,
          mobile: user.mobile || "",
          createTime: item.createTime,
          timeLabel: formatTime(item.createTime),
          isToday: isToday(item.createTime),
          isRead: readIds.value.has(item.id)
        };
      });
    });
    const unreadCount = common_vendor.computed(() => interestList.value.filter((i) => !i.isRead).length);
    const filteredList = common_vendor.computed(() => {
      switch (activeFilter.value) {
        case "today":
          return interestList.value.filter((i) => i.isToday);
        case "unread":
          return interestList.value.filter((i) => !i.isRead);
        default:
          return interestList.value;
      }
    });
    common_vendor.onLoad(async (options) => {
      if (!options || !options.id) {
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
        return;
      }
      postId.value = options.id;
      loadReadIds();
      await fetchDetail();
    });
    const fetchDetail = async () => {
      isLoading.value = true;
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/business-opportunities/get", {
          method: "GET",
          data: {
            id: postId.value
          }
        });
        if (error || !data) {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
          return;
        }
        postTitle.value = data.postTitle || "";
        const list = Array.isArray(data.targetInterests) ? data.targetInterests : [];
        rawList.value = list.sort((a, b) => b.createTime - a.createTime);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/liehuo-interests/liehuo-interests.vue:208", "获取猎伙互动信息失败:", e);
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const loadReadIds = () => {
      try {
        const key = `liehuo_read_${postId.value}`;
        const saved = common_vendor.index.getStorageSync(key);
        if (saved) {
          readIds.value = new Set(JSON.parse(saved));
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/liehuo-interests/liehuo-interests.vue:229", "读取已读记录失败:", e);
      }
    };
    const markAsRead = (id) => {
      if (readIds.value.has(id))
        return;
      readIds.value.add(id);
      try {
        const key = `liehuo_read_${postId.value}`;
        common_vendor.index.setStorageSync(key, JSON.stringify([...readIds.value]));
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/liehuo-interests/liehuo-interests.vue:244", "保存已读记录失败:", e);
      }
    };
    const handleCardClick = (item) => {
      markAsRead(item.id);
    };
    const viewBusinessCard = (item) => {
      markAsRead(item.id);
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${item.userId}&name=${encodeURIComponent(item.nickname)}&avatar=${encodeURIComponent(item.avatar)}`
      });
    };
    const copyContact = (item) => {
      if (!item.mobile) {
        common_vendor.index.showToast({
          title: "该用户暂未留下联系方式",
          icon: "none"
        });
        return;
      }
      markAsRead(item.id);
      common_vendor.index.setClipboardData({
        data: item.mobile,
        success: () => {
          common_vendor.index.showToast({
            title: "联系方式已复制",
            icon: "success"
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "复制失败，请手动记录",
            icon: "none"
          });
        }
      });
    };
    const formatTime = (ts) => {
      if (!ts)
        return "";
      const now = Date.now();
      const diff = now - ts;
      const min = Math.floor(diff / 6e4);
      const hour = Math.floor(diff / 36e5);
      if (min < 1)
        return "刚刚";
      if (min < 60)
        return `${min}分钟前`;
      if (hour < 24)
        return `${hour}小时前`;
      const d = new Date(ts);
      const M = (d.getMonth() + 1).toString().padStart(2, "0");
      const D = d.getDate().toString().padStart(2, "0");
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      return `${M}-${D} ${h}:${m}`;
    };
    const isToday = (ts) => {
      if (!ts)
        return false;
      const d = new Date(ts);
      const now = /* @__PURE__ */ new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: postTitle.value
      }, postTitle.value ? {
        b: common_vendor.t(postTitle.value)
      } : {}, {
        c: interestList.value.length > 0
      }, interestList.value.length > 0 ? {
        d: common_vendor.t(interestList.value.length)
      } : {}, {
        e: common_vendor.f(filterTabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.label),
            b: tab.value === "unread" && unreadCount.value > 0
          }, tab.value === "unread" && unreadCount.value > 0 ? {
            c: common_vendor.t(unreadCount.value)
          } : {}, {
            d: tab.value,
            e: activeFilter.value === tab.value ? 1 : "",
            f: common_vendor.o(($event) => activeFilter.value = tab.value, tab.value)
          });
        }),
        f: isLoading.value
      }, isLoading.value ? {
        g: common_vendor.p({
          type: "spinner-cycle",
          size: "32",
          color: "#FF6A00"
        })
      } : filteredList.value.length === 0 ? {
        i: common_vendor.t(activeFilter.value === "unread" ? "暂无未读意向" : "暂无感兴趣的商友")
      } : {
        j: common_vendor.f(filteredList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: !item.isRead
          }, !item.isRead ? {} : {}, {
            b: item.avatar || defaultAvatar,
            c: common_vendor.t(item.nickname),
            d: !item.isRead
          }, !item.isRead ? {} : {}, {
            e: "12158089-1-" + i0,
            f: common_vendor.t(item.timeLabel),
            g: "12158089-2-" + i0,
            h: common_vendor.o(($event) => viewBusinessCard(item), item.id),
            i: "12158089-3-" + i0,
            j: common_vendor.p({
              type: "phone-filled",
              size: "16",
              color: item.mobile ? "#fff" : "#ccc"
            }),
            k: common_vendor.t(item.mobile ? "联系" : "未留"),
            l: !item.mobile ? 1 : "",
            m: common_vendor.o(($event) => copyContact(item), item.id),
            n: common_vendor.o(() => {
            }, item.id),
            o: item.id,
            p: !item.isRead ? 1 : "",
            q: common_vendor.o(($event) => handleCardClick(item), item.id)
          });
        }),
        k: common_vendor.p({
          type: "time",
          size: "12",
          color: "#bbb"
        }),
        l: common_vendor.p({
          type: "contact",
          size: "16",
          color: "#FF6A00"
        })
      }, {
        h: filteredList.value.length === 0
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12158089"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/liehuo-interests/liehuo-interests.js.map
