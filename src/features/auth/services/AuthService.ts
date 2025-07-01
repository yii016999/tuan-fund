import { auth, db } from "@/config/firebase"
import { COLLECTIONS } from "@/constants/firestorePaths"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore"
import { UserModel } from "../model/User"

// Service 層負責與 Firebase 進行交互

// 註冊
export async function registerWithEmail(username: string, password: string, displayName: string): Promise<UserModel> {
    const email = `${username}@tuanfund.com`
    const name = displayName.trim()
    const result = await createUserWithEmailAndPassword(auth, email, password)

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
export async function loginWithEmail(email: string, password: string): Promise<UserModel> {
    const result = await signInWithEmailAndPassword(auth, email, password)

    const uid = result.user.uid
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid))

    if (!docSnap.exists()) {
        throw new Error('使用者資料不存在')
    }

    return docSnap.data() as UserModel
}

// 登出
export async function logout(): Promise<void> {
    await signOut(auth)
}