import { ERROR_CODE } from "@/constants/string"

export interface AppError {
    code: string         // 例如: 'auth/invalid-email' 或 'network/timeout'
    message: string      // 給用戶看的訊息，建議不要直接用 Firebase 原文
    rawMessage?: any     // 原始錯誤(方便 debug)
}

export function mapFirebaseError(error: any): AppError {
    switch (error.code) {
        // User/Auth
        case ERROR_CODE.INVALID_EMAIL:
        case ERROR_CODE.ACCOUNT_ABNORMAL:
            return { code: error.code, message: '帳號異常，請聯絡客服', rawMessage: error }
        case ERROR_CODE.WRONG_PASSWORD:
            return { code: error.code, message: '密碼錯誤', rawMessage: error }
        case ERROR_CODE.USER_NOT_FOUND:
            return { code: error.code, message: '找不到此用戶', rawMessage: error }
        // Storage
        case ERROR_CODE.STORAGE_QUOTA_EXCEEDED:
            return { code: error.code, message: '空間額度已滿，請聯絡客服', rawMessage: error }
        // Firestore
        case ERROR_CODE.FIRESTORE_PERMISSION_DENIED:
            return { code: error.code, message: '您沒有權限操作此資料', rawMessage: error }

        // Member
        case ERROR_CODE.MEMBER_NOT_EXIST:
            return { code: error.code, message: error.message, rawMessage: error }
        case 'member/no-permission':
            return { code: error.code, message: error.message, rawMessage: error }
        case 'member/cannot-remove-self':
            return { code: error.code, message: error.message, rawMessage: error }
        case 'member/not-in-group':
            return { code: error.code, message: error.message, rawMessage: error }
        case 'member/admin-must-transfer':
            return { code: error.code, message: error.message, rawMessage: error }

        // Default：所有沒列出的都丟 generic 錯誤
        default:
            return {
                code: 'general/abnormal',
                message: '系統異常，請稍後再試或聯絡客服',
                rawMessage: error
            }
    }
}