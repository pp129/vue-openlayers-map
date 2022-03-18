import VOverlay from '~/VOverlay/index.vue'

function install (app) {
  if (install.installed) {
    return
  }

  install.installed = true

  app.component(VOverlay.name, VOverlay)
}

export default install

export {
  install,
  VOverlay
}
