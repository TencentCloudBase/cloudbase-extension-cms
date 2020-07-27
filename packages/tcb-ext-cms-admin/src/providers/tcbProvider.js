import { getConfig } from './configProvider'

let app

export async function getApp() {
  if (!app) {
    const config = await getConfig()
    app = window.tcb.init({
      env: config.envId
    })
    window.app = app
  }

  return app
}
