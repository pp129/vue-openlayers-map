// .vuepress/config.js
module.exports = {
  head: [
    [
        'link', // 设置 favicon.ico，注意图片放在 public 文件夹下
        { rel: 'icon', href: '/images/hero.png' }
    ]
],
  title: 'v-ol-map',
  description: 'v-ol-map',
  base: '/vue-openlayers-map/', // 这个路径名称就是你刚才所配置的项目名！！！，斜杠不能漏！！！⚠️
  theme: "antdocs",
  themeConfig: {
    repo: 'https://github.com/pp129/vue-openlayers-map',
    displayAllHeaders: true,
    lastUpdated: 'Last Updated', // string | boolean
    sidebar: {
        '/components/': [
            'MAP',
            {
                title: '图层',
                collapsable: false,
                children: [
                    'TILE',
                    'VECTOR',
                    'IMAGE',
                    'HEATMAP',
                    'CLUSTER',
                    'GRAPHIC',
                    'ROUTE',
                    'ECHARTS',
                ]
            },
            'OVERLAY',
            'OVERVIEW',
            'PATH',
            'DRAW',
            'MEASURE'
        ]
    },
    nav: [
      { text: '介绍', link: '/' },
      { text: '安装与使用', link: '/DEV.html' },
      { text: '组件', link: '/components/MAP' },
    ]
  }
}
