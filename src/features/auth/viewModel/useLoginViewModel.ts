import { REGISTER } from "@/constants/string"
import { useAuthStore } from "@/store/useAuthStore"
import { useState } from "react"
import { loginWithEmail } from "../services/AuthService"

export function useLoginViewModel() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const setUser = useAuthStore((s) => s.setUser)

    // 登入，回傳是否成功
    const handleLogin = async (): Promise<boolean> => {
        setError("")
        try {
            const account = `${username}${REGISTER.MAIL_SUFFIX}`
            const user = await loginWithEmail(account, password)
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
        password,
        setPassword,
        error,
        handleLogin,
    }
}