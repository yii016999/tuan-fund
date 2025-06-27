import { create } from 'zustand'

interface AuthUser {
  uid: string
  email: string
  displayName: string
}

interface AuthState {
  user: AuthUser | null
  activeGroupId: string | null
  setUser: (user: AuthUser) => void
  setActiveGroupId: (groupId: string | null) => void
  logout: () => void
}

// 當做 Firebase 登入的時候，signInWithEmailAndPassword 回傳 Firebase 的使用者物件 (userCredential.user)
// 但使用者資訊不會自動儲存在 React App 中，也不會自動共享給其他頁面，因此需要儲存使用者資訊，這就是 useAuthStore 的作用
// useAuthStore 是一個 Zustand 的 store，它會儲存使用者資訊，並提供 setUser 和 logout 方法來更新使用者資訊
// 這樣一來，我們就可以在任何地方取得使用者資訊，並在需要時更新使用者資訊
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeGroupId: null,
  setUser: (user) => set({ user }),
  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
  logout: () => set({ user: null, activeGroupId: null }),
}))