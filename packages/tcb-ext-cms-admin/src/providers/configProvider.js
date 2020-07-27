import axios from 'axios'

let config

export async function getConfig() {
  if (config) {
    return config
  }

  // TODO: 不同的云接入地址
  try {
    const res = await axios.get('config.json')
    config = (res && res.data) || {}
  } catch (error) {
    console.log('Load Config File Error', error.message)
    config = JSON.parse(process.env.REACT_APP_TCB_CMS_CONFIG)
  }

  window.cmsEnvConfig = config

  return config
}
