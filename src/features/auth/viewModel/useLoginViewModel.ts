import { APP_ROUTES, AUTH_ROUTES } from "@/constants/routes"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "expo-router"
import { useState } from "react"
import { loginWithEmail } from "../services/AuthService"

export function useLoginViewModel() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const setUser = useAuthStore((s) => s.setUser)
    const router = useRouter()

    const handleLogin = async () => {
        setError("")
        try {
            const email = `${username}@tuanfund.com`
            const user = await loginWithEmail(email, password)
            setUser({ uid: user.uid, email: user.email ?? "", displayName: user.displayName ?? "" })
            router.replace(APP_ROUTES.HOME)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const goToRegister = () => {
        router.replace(AUTH_ROUTES.REGISTER)
    }

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        handleLogin,
        goToRegister,
    }
}