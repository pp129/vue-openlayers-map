// .vuepress/config.js
module.exports = {
  head: [
    [
        'link', // 设置 favicon.ico，注意图片放在 public 文件夹下
        { rel: 'icon', href: '/images/hero.png' }
    ]
],
  title: 'vue-openlayers-map',
  description: 'vue-openlayers-map',
  base: '/vue-openlayers-map/', // 这个路径名称就是你刚才所配置的项目名！！！，斜杠不能漏！！！⚠️
  theme: "antdocs",
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
