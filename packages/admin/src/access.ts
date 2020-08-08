// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
    const { currentUser } = initialState || {}

    return {
        isLogin: currentUser?.access,
        canAdmin: currentUser && currentUser.access === 'admin',
    }
}
