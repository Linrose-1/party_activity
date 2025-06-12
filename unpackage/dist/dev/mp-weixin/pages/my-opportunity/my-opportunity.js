"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_empty_state = common_vendor.resolveComponent("empty-state");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_nav_bar2 + _easycom_uni_icons2 + _component_empty_state + _easycom_uni_load_more2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "my-opportunity",
  setup(__props) {
    const refreshing = common_vendor.ref(false);
    const loadStatus = common_vendor.ref("more");
    const myOpportunities = common_vendor.ref([
      {
        id: 1,
        content: "寻找AI技术合作伙伴，共同开发智能客服系统，有意向请联系详谈",
        tags: ["技术合作", "AI开发", "商务合作"],
        time: "2023-11-15 14:30:00",
        likes: 24,
        comments: 8,
        views: 156,
        contactCount: 5
      },
      {
        id: 2,
        content: "优质供应链资源对接，主要提供电子产品原材料，寻求长期合作伙伴",
        tags: ["供应链", "电子元件", "长期合作"],
        time: "2023-10-20 09:15:00",
        likes: 18,
        comments: 12,
        views: 210,
        contactCount: 7
      },
      {
        id: 3,
        content: "招募线上教育课程讲师，要求有五年以上教学经验，科目不限",
        tags: ["教育", "讲师", "兼职"],
        time: "2023-12-01 10:00:00",
        likes: 30,
        comments: 5,
        views: 180,
        contactCount: 10
      },
      {
        id: 4,
        content: "寻求本地农产品电商平台合作，共同拓展市场，提供优质有机蔬菜",
        tags: ["农产品", "电商", "合作"],
        time: "2023-11-28 16:45:00",
        likes: 15,
        comments: 3,
        views: 90,
        contactCount: 2
      },
      {
        id: 5,
        content: "招聘前端开发工程师，熟悉Vue.js和Uniapp，有小程序开发经验优先",
        tags: ["招聘", "前端", "软件开发"],
        time: "2023-12-05 11:20:00",
        likes: 40,
        comments: 15,
        views: 250,
        contactCount: 8
      }
    ]);
    const handleBack = () => {
      common_vendor.index.navigateBack();
    };
    const formatTime = (timeStr) => {
      return timeStr.slice(0, 16);
    };
    const viewDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/business/detail?id=${item.id}&from=mine`
      });
    };
    const showDeleteConfirm = (item) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条商机吗？删除后不可恢复",
        confirmColor: "#FF6B00",
        success: (res) => {
          if (res.confirm) {
            deleteOpportunity(item.id);
          }
        }
      });
    };
    const deleteOpportunity = (id) => {
      const initialLength = myOpportunities.value.length;
      myOpportunities.value = myOpportunities.value.filter((item) => item.id !== id);
      if (myOpportunities.value.length < initialLength) {
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } else {
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    };
    const navigateToPost = () => {
      common_vendor.index.navigateTo({
        url: "/pages/business/post"
      });
    };
    const onRefresh = () => {
      refreshing.value = true;
      loadStatus.value = "more";
      setTimeout(() => {
        myOpportunities.value = mockOpportunityData(5);
        refreshing.value = false;
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      }, 1e3);
    };
    const loadMore = () => {
      if (loadStatus.value === "loading" || loadStatus.value === "noMore")
        return;
      loadStatus.value = "loading";
      setTimeout(() => {
        const newData = mockOpportunityData(3);
        if (myOpportunities.value.length < 20) {
          myOpportunities.value.push(...newData);
          loadStatus.value = "more";
        } else {
          loadStatus.value = "noMore";
        }
      }, 1500);
    };
    const mockOpportunityData = (count) => {
      const baseId = myOpportunities.value.length > 0 ? myOpportunities.value[myOpportunities.value.length - 1].id + 1 : 1;
      return [...Array(count)].map((_, i) => ({
        id: baseId + i,
        content: `这是新加载的商机内容 ${baseId + i}，寻求合作伙伴共同开发项目，欢迎咨询！`,
        tags: ["新标签", "合作", `主题${i + 1}`],
        time: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 300),
        contactCount: Math.floor(Math.random() * 10)
      }));
    };
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleBack),
        b: common_vendor.p({
          ["left-icon"]: "arrowleft",
          title: "我的商机",
          border: false
        }),
        c: myOpportunities.value.length > 0
      }, myOpportunities.value.length > 0 ? {
        d: common_vendor.f(myOpportunities.value, (item, index, i0) => {
          return {
            a: common_vendor.t(formatTime(item.time)),
            b: common_vendor.t(item.content),
            c: common_vendor.o(($event) => viewDetail(item), item.id),
            d: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            e: "481e0091-1-" + i0,
            f: common_vendor.t(item.likes),
            g: "481e0091-2-" + i0,
            h: common_vendor.t(item.comments),
            i: "481e0091-3-" + i0,
            j: common_vendor.t(item.views),
            k: common_vendor.o(($event) => showDeleteConfirm(item), item.id),
            l: item.id
          };
        }),
        e: common_vendor.p({
          type: "hand-up",
          size: "16",
          color: "#999"
        }),
        f: common_vendor.p({
          type: "chat",
          size: "16",
          color: "#999"
        }),
        g: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#999"
        })
      } : {
        h: common_vendor.o(navigateToPost),
        i: common_vendor.p({
          title: "暂无发布的商机",
          description: "发布您的第一条商机信息，寻找合作伙伴"
        })
      }, {
        j: common_vendor.p({
          status: loadStatus.value,
          ["content-text"]: {
            contentdown: "上拉加载更多",
            contentrefresh: "正在加载...",
            contentnomore: "没有更多了"
          }
        }),
        k: refreshing.value,
        l: common_vendor.o(onRefresh),
        m: common_vendor.o(loadMore),
        n: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        o: common_vendor.o(navigateToPost)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-481e0091"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-opportunity/my-opportunity.js.map
