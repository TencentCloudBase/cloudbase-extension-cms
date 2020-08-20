import component from './zh-CN/component'
import globalHeader from './zh-CN/globalHeader'
import menu from './zh-CN/menu'
import pwa from './zh-CN/pwa'
import settingDrawer from './zh-CN/settingDrawer'
import settings from './zh-CN/settings'
import project from './zh-CN/project'
import schema from './zh-CN/schema'
import content from './zh-CN/content'

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'layout.global.error.stack': '错误堆栈',
  'layout.global.error.title': '出错了，可点击右下角进行反馈',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...project,
  ...schema,
  ...content,
}
