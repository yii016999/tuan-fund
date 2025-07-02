import { auth } from '@/config/firebase'
import { COLLECTIONS } from '@/constants/firestorePaths'
import { AUTH_ROUTES } from '@/constants/routes'
import { AuthParamList } from '@/navigation/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { signOut } from 'firebase/auth'
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { GroupModel } from '../model/Group'

const db = getFirestore()

export function useSettingsViewModel() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthParamList>>()
    const { user, logout, activeGroupId, setActiveGroupId } = useAuthStore()
    const [groups, setGroups] = useState<GroupModel[]>([])
    const [currentGroupName, setCurrentGroupName] = useState('')
    const [loading, setLoading] = useState(true)

    // 取得所有使用者有加入的群組
    const fetchGroups = useCallback(async () => {
        if (!user?.uid) return
        setLoading(true)
        try {
            // 取得所有群組
            const qs = await getDocs(collection(db, COLLECTIONS.GROUPS))
            const myGroups: GroupModel[] = []
            // 取得所有群組後，過濾出使用者有加入的群組
            qs.forEach((docSnap) => {
                const data = docSnap.data()
                if (data.members?.includes(user.uid)) {
                    myGroups.push({ id: docSnap.id, name: data.name, type: data.type, members: data.members, createdBy: data.createdBy })
                    if (docSnap.id === activeGroupId) setCurrentGroupName(data.name)
                }
            })
            // 設定群組列表
            setGroups(myGroups)
            setLoading(false)
        } catch (e) {
            console.error('取得群組失敗', e)
        }
    }, [user?.uid, activeGroupId])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    // 切換群組
    const switchGroup = useCallback(async (groupId: string, groupName: string) => {
        try {
            if (user?.uid) {
                // 先更新 Firestore 中使用者的 activeGroupId
                await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
                    activeGroupId: groupId
                })

                // 更新本地 store
                setActiveGroupId(groupId)
                setCurrentGroupName(groupName)
            }
        } catch (e) {
            console.error('切換群組失敗', e)
        }
    }, [setActiveGroupId, user?.uid])

    // 登出功能
    const userLogout = async () => {
        try {
            await signOut(auth);
            // 使用 store 中定義的 logout 方法清除狀態
            logout();
            // 重置導航堆疊到登入畫面
            navigation.reset({
                routes: [{ name: AUTH_ROUTES.LOGIN }]
            });
        } catch (error) {
            console.error('登出錯誤:', error);
            throw error;
        }
    };

    return {
        groups,
        currentGroupName,
        activeGroupId,
        loading,
        switchGroup,
        user,
        userLogout,
    }
}