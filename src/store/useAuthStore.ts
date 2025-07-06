import { create } from 'zustand'

interface AuthUser {
  uid: string              // 使用者 id 
  email: string            // 使用者 email
  displayName: string      // 使用者名稱
  avatarUrl: string        // 使用者頭像
}

interface AuthState {
  user: AuthUser | null               // 使用者資訊
  activeGroupId: string | null        // 使用者活躍群組
  joinedGroupIds: string[]            // 使用者加入的群組
  setUser: (user: AuthUser) => void   // 設定使用者資訊
  setActiveGroupId: (groupId: string | null) => void // 設定使用者活躍群組
  logout: () => void                  // 登出使用者
  setJoinedGroupIds: (groupIds: string[]) => void
}

// 當做 Firebase 登入的時候，signInWithEmailAndPassword 回傳 Firebase 的使用者物件 (userCredential.user)
// 但使用者資訊不會自動儲存在 React App 中，也不會自動共享給其他頁面，因此需要儲存使用者資訊，這就是 useAuthStore 的作用
// useAuthStore 是一個 Zustand 的 store，它會儲存使用者資訊，並提供 setUser 和 logout 方法來更新使用者資訊
// 這樣一來，我們就可以在任何地方取得使用者資訊，並在需要時更新使用者資訊
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeGroupId: null,
  joinedGroupIds: [],
  setUser: (user) => set({ user }),
  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
  logout: () => {
    set({
      user: null,
      activeGroupId: null,
      joinedGroupIds: [],
    })
  },
  setJoinedGroupIds: (groupIds: string[]) => {
    set({ joinedGroupIds: groupIds })
  },
}))