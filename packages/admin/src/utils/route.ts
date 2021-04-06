import { getState } from 'concent'
import { history } from 'umi'
import { parse } from 'querystring'

const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/

export const isUrl = (path: string): boolean => reg.test(path)

/**
 * 获取 query 参数
 */
export const getPageQuery = (): Record<string, string> => {
  const { href } = window.location
  const qsIndex = href.indexOf('?')
  const sharpIndex = href.indexOf('#')

  if (qsIndex !== -1) {
    if (qsIndex > sharpIndex) {
      return parse(href.split('?')[1]) as Record<string, string>
    }

    return parse(href.slice(qsIndex + 1, sharpIndex)) as Record<string, string>
  }

  return {}
}

/**
 * 从 url 中获取项目 id
 */
export const getProjectId = () => {
  // 全局 state
  const state: any = getState()
  // page query
  const query = getPageQuery()

  return query?.pid || state?.global?.currentProject?._id || ''
}

/**
 * 跳转到项目某个路径
 */
export const redirectTo = (
  pathname: string,
  options: {
    projectId?: string
    query?: Record<string, string>
  } = {}
) => {
  const pageQuery = getPageQuery()
  const { projectId, query } = options
  const pid: string = projectId || (pageQuery?.pid as string) || ''

  const path = pathname[0] === '/' ? pathname.slice(1) : pathname

  history.push({
    pathname: `/project/${path}`,
    query: {
      pid,
      ...query,
    },
  })
}
