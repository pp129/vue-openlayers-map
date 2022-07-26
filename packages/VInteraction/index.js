import VDraw from '~/VInteraction/Draw/index'
import VMeasure from '~/VInteraction/Measure/index'

function install (app) {
  if (install.installed) {
    return
  }

  install.installed = true
  app.component(VDraw.name, VDraw)
  app.component(VMeasure.name, VMeasure)
}

export default install

export {
  install,
  VDraw,
  VMeasure
}
