// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
    const { currentUser } = initialState || {}

    console.log(currentUser)

    return {
        isLogin: Boolean(currentUser?.access),
        canAdmin: currentUser && currentUser.access === 'admin',
    }
}
