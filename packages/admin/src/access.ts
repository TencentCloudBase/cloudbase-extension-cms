// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser }) {
    const { currentUser } = initialState || {}

    console.log(currentUser)

    const { username, isAdmin = false, isProjectAdmin = false, accessibleService } =
        currentUser || {}

    const canProjectAdmin = isAdmin || isProjectAdmin

    const canContent =
        canProjectAdmin ||
        accessibleService?.includes('*') ||
        accessibleService?.includes('content')

    const canSchema =
        canProjectAdmin || accessibleService?.includes('*') || accessibleService?.includes('schema')

    const canWebhook =
        canProjectAdmin ||
        accessibleService?.includes('*') ||
        accessibleService?.includes('webhook')

    return {
        isAdmin,
        canWebhook,
        canContent,
        canSchema,
        canProjectAdmin,
        isLogin: Boolean(username),
    }
}
