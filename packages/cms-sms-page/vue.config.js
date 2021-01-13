// vue.config.js
const isDev = process.env.NODE_ENV === "development";

module.exports = {
  publicPath: isDev ? "/" : "/cms-activities/",
  css: {
    extract: false,
  },
  // 打包时不生成.map文件
  productionSourceMap: false,
};
