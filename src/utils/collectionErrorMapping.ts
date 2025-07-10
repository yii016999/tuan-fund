import { getDoc, DocumentReference, DocumentSnapshot } from "firebase/firestore";

// 預設錯誤 code/message 對照
const collectionErrorMapping: Record<string, { code: string; message: string }> = {
    users: { code: "user/not-exist", message: "找不到此用戶" },
    groups: { code: "group/not-exist", message: "找不到此群組" },
    memberPayments: { code: "payment/not-exist", message: "找不到成員繳費資料" },
    invites: { code: "invite/not-exist", message: "找不到邀請碼" },
    default: { code: "data/not-exist", message: "找不到資料" }
};

/**
 * 取得 Firestore 文件快照，不存在時自動丟出預設錯誤（根據 collectionName）
 * @param docRef Firestore document reference
 */
export async function getDocOrThrow<T>(
    docRef: DocumentReference<T>
): Promise<DocumentSnapshot<T>> {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        // 自動判斷 collectionName
        const path = docRef.path;  // 例如 users/123
        const collectionName = path.split('/')[0];
        const mapping = collectionErrorMapping[collectionName] || collectionErrorMapping.default;
        throw { code: mapping.code, message: mapping.message };
    }
    return docSnap;
}