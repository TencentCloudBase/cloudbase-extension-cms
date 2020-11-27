const InnerDefaultValue: Partial<ITcbCmsConfing> = {
  appName: 'CloudBase',
  cmsTitle: 'CloudBase CMS',
  cmsLogo: './icon.svg',
  cmsDocLink: 'https://docs.cloudbase.net/cms/intro.html',
  cmsHelpLink: 'https://support.qq.com/products/148793',
  officialSiteLink: 'https://cloudbase.net',
}

/**
 * 获取 CMS 配置，适配小程序 OR 腾讯云
 */
export const getCmsConfig = (key: keyof ITcbCmsConfing, defaultValue?: any) => {
  // 获取 CMS 配置
  return window.TcbCmsConfig[key] || defaultValue || InnerDefaultValue[key] || ''
}
