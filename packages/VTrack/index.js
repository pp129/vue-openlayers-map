import VTrack from '~/VTrack/index.vue'

function install (app) {
  if (install.installed) {
    return
  }

  install.installed = true

  app.component(VTrack.name, VTrack)
}

export default install

export {
  install,
  VTrack
}
