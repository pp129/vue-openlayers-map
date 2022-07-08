// .vuepress/config.js
module.exports = {
  title: 'vue-openlayers-map',
  description: 'vue-openlayers-map',
  base: '/vue-openlayers-map/', // 这个路径名称就是你刚才所配置的项目名！！！，斜杠不能漏！！！⚠️
  theme: "reco",
  themeConfig: {
    repo: 'https://github.com/pp129/vue-openlayers-map',
    sidebar: 'auto',
    displayAllHeaders: true,
    lastUpdated: 'Last Updated', // string | boolean
    nav: [
      { text: 'Home', link: '/' },
      { text: '开发文档', link: '/DEV.html' }
    ]
  }
}
