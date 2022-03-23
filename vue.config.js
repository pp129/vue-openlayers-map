const path = require('path')

module.exports = {
  // 修改默认的入口
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  productionSourceMap: false,
  devServer: {
    hotOnly: true,
    open: true,
    proxy: {
      '/arcgis': {
        target: 'http://172.16.28.120:6080/arcgis/rest/services/tx/NAServer/Route/solve',
        changeOrigin: true
      },
      '/route': {
        target: 'http://172.16.28.74:9999/route',
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    // vue默认@指向src目录，这里要修正为examples，另外新增一个~指向packages
    config.resolve.alias
      .set('@', path.resolve('examples'))
      .set('~', path.resolve('packages'))
    // lib目录是组件库最终打包好存放的地方，不需要eslint检查
    // examples/docs是存放md文档的地方，也不需要eslint检查
    config.module
      .rule('eslint')
      .exclude.add(path.resolve('lib'))
      .end()
      .exclude.add(path.resolve('examples/docs'))
      .end()
    // packages和examples目录需要加入编译
    config.module
      .rule('js')
      .include.add(/packages/)
      .end()
      .include.add(/examples/)
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        // 修改它的选项...
        return options
      })
  }
}
