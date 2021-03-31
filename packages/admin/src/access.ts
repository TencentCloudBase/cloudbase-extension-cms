export default function access(initialState: { currentUser?: CurrentUser }) {
  const { currentUser } = initialState || {}

  console.log('currentUser', currentUser)

  const { username, isAdmin = false, isProjectAdmin = false, accessibleService, _id } =
    currentUser || {}

  // 是否能够访问服务
  const isServiceAccessible = (service: string) =>
    canProjectAdmin || accessibleService?.includes('*') || accessibleService?.includes(service)

  const canProjectAdmin = isAdmin || isProjectAdmin

  const canContent = isServiceAccessible('content')

  const canSchema = isServiceAccessible('schema')

  const canWebhook = isServiceAccessible('webhook')

  const canOperation = isServiceAccessible('operation')

  return {
    isAdmin,
    canWebhook,
    canContent,
    canSchema,
    canOperation,
    canProjectAdmin,
    isLogin: Boolean(username || _id),
  }
}
