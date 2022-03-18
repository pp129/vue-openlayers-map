import VOverview from './Overview.vue'

function install (app) {
  if (install.installed) {
    return
  }

  install.installed = true

  app.component(VOverview.name, VOverview)
}

export default install

export {
  install,
  VOverview
}
