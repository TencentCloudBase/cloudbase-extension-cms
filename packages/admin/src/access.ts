// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser }) {
  const { currentUser } = initialState || {}

  console.log('Access', currentUser)

  const { username, isAdmin = false, isProjectAdmin = false, accessibleService, _id } =
    currentUser || {}

  const canProjectAdmin = isAdmin || isProjectAdmin

  const canContent =
    canProjectAdmin || accessibleService?.includes('*') || accessibleService?.includes('content')

  const canSchema =
    canProjectAdmin || accessibleService?.includes('*') || accessibleService?.includes('schema')

  const canWebhook =
    canProjectAdmin || accessibleService?.includes('*') || accessibleService?.includes('webhook')

  return {
    isAdmin,
    canWebhook,
    canContent,
    canSchema,
    canProjectAdmin,
    isLogin: Boolean(username || _id),
  }
}
