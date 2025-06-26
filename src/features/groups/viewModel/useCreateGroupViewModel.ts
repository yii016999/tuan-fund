import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/useAuthStore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useState } from 'react'

export function useCreateGroupViewModel() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    // 從 store 中取得使用者資訊
    const user = useAuthStore((s) => s.user)

    const createGroup = async (name: string, type: string, description?: string) => {

        if (!name.trim()) {
            setError('請輸入群組名稱')
            return
        }

        try {
            setIsLoading(true)
            setError('')

            await addDoc(collection(db, 'groups'), {
                name,
                type,
                description: description ?? '',
                createdBy: user?.uid ?? '',
                createdAt: serverTimestamp(),
                members: [user?.uid],
            })

            router.replace('/groups')
        } catch (e: any) {
            setError(e.message)
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