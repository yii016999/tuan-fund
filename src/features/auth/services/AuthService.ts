import { auth, db } from "@/config/firebase"
import { COLLECTIONS } from "@/constants/firestorePaths"
import { LOGIN_MESSAGES, REGISTER } from "@/constants/string"
import { useAuthStore } from "@/store/useAuthStore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore"
import { User } from "../model/User"

// Service 層負責與 Firebase 進行交互

// 註冊
export async function registerWithEmail(username: string, password: string, displayName: string): Promise<User> {
    const account = `${username}${REGISTER.MAIL_SUFFIX}`
    const name = displayName.trim()
    const result = await createUserWithEmailAndPassword(auth, account, password)

    // 註冊成功後建立 Firestore 使用者資料
    await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
        uid: result.user.uid,
        displayName: name,
        joinedGroupIds: [],
        createdAt: serverTimestamp(),
    })

    return {
        uid: result.user.uid,
        displayName: name,
        email: result.user.email ?? "",
        joinedGroupIds: [],
        createdAt: serverTimestamp() as Timestamp,
    }
}

// 登入
export async function loginWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password)

    const uid = result.user.uid
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid))

    if (!docSnap.exists()) {
        throw new Error(LOGIN_MESSAGES.USER_NOT_EXIST)
    }

    const userData = docSnap.data() as User

    // 同步到 AuthStore
    const authStore = useAuthStore.getState()
    authStore.setJoinedGroupIds(userData.joinedGroupIds || [])
    authStore.setActiveGroupId(userData.activeGroupId || '')

    return userData
}

// 登出
export async function logout(): Promise<void> {
    await signOut(auth)
}