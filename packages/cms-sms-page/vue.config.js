const { DefinePlugin } = require('webpack')

// vue.config.js
const isDev = process.env.NODE_ENV === 'development'

const activityPath = process.env.WX_MP ? 'cms-activities' : 'tcb-cms-activities'

module.exports = {
  publicPath: isDev ? '/' : `/${activityPath}/`,
  css: {
    extract: false,
  },
  // 打包时不生成.map文件
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        WX_MP: JSON.stringify(process.env.WX_MP),
      }),
    ],
  },
}
