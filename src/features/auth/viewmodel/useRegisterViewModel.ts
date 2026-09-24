import { useAuthStore } from "@/store/useAuthStore"
import { useState } from "react"
import { registerWithEmail } from "../services/AuthService"

// ViewModel 層負責與 UI 進行交互
export function useRegisterViewModel() {
    const [username, setUsername] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const setUser = useAuthStore((s) => s.setUser)

    // async 是用來定義一個非同步函式的關鍵字，await 是用來等待一個非同步函式執行完成
    const handleRegister = async (): Promise<boolean> => {
        try {
            setError("")
            // 註冊帳號
            const user = await registerWithEmail(username, password, displayName)
            // 註冊成功後存入 store
            setUser({ uid: user.uid, email: user.email ?? "", displayName: user.displayName ?? "", avatarUrl: user.avatarUrl ?? "" })
            return true
        } catch (err: any) {
            setError(err.message)
            return false
        }
    }

    return {
        username,
        setUsername,
        displayName,
        setDisplayName,
        password,
        setPassword,
        error,
        handleRegister,
    }
}