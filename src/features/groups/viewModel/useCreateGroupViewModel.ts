import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/constants/firestorePaths';
import { useAuthStore } from '@/store/useAuthStore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';

export function useCreateGroupViewModel() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    // 從 store 中取得使用者資訊
    const user = useAuthStore((s) => s.user)

    const createGroup = async (name: string, type: string, description?: string): Promise<boolean> => {

        if (!name.trim()) {
            setError('請輸入群組名稱')
            return false
        }

        try {
            setIsLoading(true)
            setError('')

            await addDoc(collection(db, COLLECTIONS.GROUPS), {
                name,
                type,
                description: description ?? '',
                createdBy: user?.uid ?? '',
                createdAt: serverTimestamp(),
                members: [user?.uid],
            })

            return true

        } catch (e: any) {
            setError(e.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        createGroup,
        isLoading,
        error,
    }
}