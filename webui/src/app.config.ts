export default defineAppConfig({
  pages: [
    "pages/browse/index", // 浏览页
    "pages/tags/index", // 标签页
    "pages/profile/index", // 我的页
  ],

  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#65320708",
    navigationBarTitleText: "词摘",
    navigationBarTextStyle: "black",
    backgroundColor: "#65320708",
  },
  tabBar: {
    color: "#999",
    selectedColor: "#8b7355",
    backgroundColor: "#fff",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/browse/index",
        text: "浏览",
        iconPath: "assets/icons/boxsearch.png",
        selectedIconPath: "assets/icons/boxsearch-active.png",
      },
      {
        pagePath: "pages/tags/index",
        text: "标签",
        iconPath: "assets/icons/tag.png",
        selectedIconPath: "assets/icons/tag-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/icons/me.png",
        selectedIconPath: "assets/icons/me-active.png",
      },
    ],
  },
});
