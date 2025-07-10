
export interface AppError {
    code: string         // 例如: 'auth/invalid-email' 或 'network/timeout'
    message: string      // 給用戶看的訊息，建議不要直接用 Firebase 原文
    rawMessage?: any     // 原始錯誤(方便 debug)
}

export function mapFirebaseError(error: any): AppError {
    switch (error.code) {
        // User/Auth
        case 'auth/invalid-email':
        case 'user/account-abnormal':
            return { code: error.code, message: '帳號異常，請聯絡客服', rawMessage: error }
        case 'auth/wrong-password':
            return { code: error.code, message: '密碼錯誤', rawMessage: error }
        case 'auth/user-not-found':
            return { code: error.code, message: '找不到此用戶', rawMessage: error }
        // Storage
        case 'storage/quota-exceeded':
            return { code: error.code, message: '空間額度已滿，請聯絡客服', rawMessage: error }
        // Firestore
        case 'firestore/permission-denied':
            return { code: error.code, message: '您沒有權限操作此資料', rawMessage: error }
        // ...其他常見錯誤

        // Default：所有沒列出的都丟 generic 錯誤
        default:
            return {
                code: 'general/abnormal',
                message: '系統異常，請稍後再試或聯絡客服',
                rawMessage: error
            }
    }
}