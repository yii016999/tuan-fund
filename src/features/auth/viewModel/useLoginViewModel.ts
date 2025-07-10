import { REGISTER } from "@/constants/string"
import { useAuthStore } from "@/store/useAuthStore"
import { useState } from "react"
import { loginWithEmail } from "../services/AuthService"

export function useLoginViewModel() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { setUser, setJoinedGroupIds, setActiveGroupId } = useAuthStore()

    const handleLogin = async (): Promise<boolean> => {
        setError("")
        setIsLoading(true)
        try {
            const account = `${username}${REGISTER.MAIL_SUFFIX}`
            const user = await loginWithEmail(account, password)

            // 處理 Store 更新
            setUser({ uid: user.uid, email: user.email ?? "", displayName: user.displayName ?? "", avatarUrl: user.avatarUrl ?? "" })
            setJoinedGroupIds(user.joinedGroupIds || [])
            setActiveGroupId(user.activeGroupId || '')

            return true
        } catch (err: any) {
            setError(err.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        isLoading,
        handleLogin,
    }
}