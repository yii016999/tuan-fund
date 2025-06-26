import { APP_ROUTES, AUTH_ROUTES } from "@/constants/routes"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "expo-router"
import { useState } from "react"
import { registerWithEmail } from "../services/AuthService"

// ViewModel 層負責與 UI 進行交互
export function useRegisterViewModel() {
    const [username, setUsername] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()
    const setUser = useAuthStore((s) => s.setUser)

    // async 是用來定義一個非同步函式的關鍵字，await 是用來等待一個非同步函式執行完成
    const handleRegister = async () => {
        try {
            setError("")
            // 註冊帳號
            const user = await registerWithEmail(username, password, displayName)
            // 註冊成功後存入 store
            setUser({ uid: user.uid, email: user.email ?? "", displayName: user.displayName ?? "" })
            // 導向首頁
            router.replace(APP_ROUTES.HOME)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const goToLogin = () => {
        router.replace(AUTH_ROUTES.LOGIN)
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
        goToLogin,
    }
}