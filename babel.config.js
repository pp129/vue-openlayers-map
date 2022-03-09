const BABEL_PLUGINS = []
const REMOVE_CONSOLE = true
if (process.env.NODE_ENV === 'production' && REMOVE_CONSOLE) {
  BABEL_PLUGINS.push(['transform-remove-console', { exclude: ['error', 'warn'] }])
  BABEL_PLUGINS.push('transform-remove-debugger')
}
module.exports = {
  plugins: BABEL_PLUGINS,
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
