import { auth, db } from "@/config/firebase"
import { COLLECTIONS } from "@/constants/firestorePaths"
import { REGISTER } from "@/constants/string"
import { getDocOrThrow } from "@/utils/collectionErrorMapping"
import { mapFirebaseError } from "@/utils/firebaseErrorMapper"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, DocumentReference, serverTimestamp, setDoc, Timestamp } from "firebase/firestore"
import { User } from "../model/User"

// Service 層負責與 Firebase 進行交互

// 註冊
export async function registerWithEmail(username: string, password: string, displayName: string): Promise<User> {
    try {
        const account = `${username}${REGISTER.MAIL_SUFFIX}`
        const name = displayName.trim()
        const result = await createUserWithEmailAndPassword(auth, account, password)

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
    } catch (error: any) {
        throw mapFirebaseError(error)
    }
}

// 登入
export async function loginWithEmail(email: string, password: string): Promise<User> {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const uid = result.user.uid;

        const docRef = doc(db, COLLECTIONS.USERS, uid) as DocumentReference<User>;
        const docSnap = await getDocOrThrow<User>(docRef);
        
        const userData = docSnap.data() as User;
        return userData;
    } catch (error: any) {
        throw mapFirebaseError(error);
    }
}
// 登出
export async function logout(): Promise<void> {
    try {
        await signOut(auth)
    } catch (error: any) {
        throw mapFirebaseError(error)
    }
}