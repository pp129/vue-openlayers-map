let transformRemoveConsolePlugin = []
const REMOVE_CONSOLE = true
if (process.env.NODE_ENV === 'production' && REMOVE_CONSOLE) {
  transformRemoveConsolePlugin = ['transform-remove-console']
}
module.exports = {
  plugins: [...transformRemoveConsolePlugin],
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
