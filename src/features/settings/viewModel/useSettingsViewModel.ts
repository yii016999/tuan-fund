import { auth } from '@/config/firebase'
import { COMMON, SETTINGS, SETTINGS_GROUP_SWITCH } from '@/constants/string'
import { GroupType } from '@/constants/types'
import { AuthParamList } from '@/navigation/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { MemberService } from '../../members/services/MemberService'
import { GroupSettings } from '../model/Group'
import { GroupService } from '../services/GroupService'

const db = getFirestore()

interface MonthlyPaymentSettings {
    enabled: boolean;
}

export function useSettingsViewModel() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthParamList>>()
    const { user, logout, activeGroupId, setActiveGroupId } = useAuthStore()
    const [groups, setGroups] = useState<GroupSettings[]>([])
    const [currentGroupName, setCurrentGroupName] = useState('')
    const [loading, setLoading] = useState(true)
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)
    const [createGroupError, setCreateGroupError] = useState('')
    const [isJoiningGroup, setIsJoiningGroup] = useState(false)
    const [joinGroupError, setJoinGroupError] = useState('')

    // 統一使用 GroupService.getGroupsByUserId 獲取完整群組資訊
    const fetchGroups = useCallback(async () => {
        if (!user?.uid) return
        setLoading(true)
        try {
            const userGroups = await GroupService.getGroupsByUserId(user.uid)
            setGroups(userGroups)

            // 設定當前群組名稱
            const activeGroup = userGroups.find(g => g.id === activeGroupId)
            if (activeGroup) {
                setCurrentGroupName(activeGroup.name)
            }
        } catch (error) {
            console.error('Error fetching groups:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.uid, activeGroupId])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    // 切換群組
    const switchGroup = async (groupId: string, groupName: string) => {
        if (!user?.uid) return

        try {
            await GroupService.updateUserActiveGroup(user.uid, groupId)

            // 更新本地狀態
            setActiveGroupId(groupId)
            setCurrentGroupName(groupName)

            // 同步到 AuthStore
            const authStore = useAuthStore.getState()
            authStore.setActiveGroupId(groupId)

            // 重新獲取群組資料以確保資料同步
            await fetchGroups()

            const userGroups = await GroupService.getGroupsByUserId(user.uid)
            authStore.setJoinedGroupIds(userGroups.map(g => g.id))

        } catch (error) {
            console.error('Error switching group:', error)
            throw error
        }
    }

    // 創建群組功能
    const createGroup = async (name: string, type: GroupType, description?: string, monthlyPaymentSettings?: any) => {
        if (!user?.uid) return false

        setIsCreatingGroup(true)
        setCreateGroupError('')

        try {
            const groupId = await GroupService.createGroup(user.uid, name, type, description, monthlyPaymentSettings)

            // 立即更新本地狀態
            setActiveGroupId(groupId)
            setCurrentGroupName(name)

            // 同步到 AuthStore
            const authStore = useAuthStore.getState()
            authStore.setActiveGroupId(groupId)

            // 重新載入群組資料
            await fetchGroups()

            // 同步 joinedGroupIds
            const userGroups = await GroupService.getGroupsByUserId(user.uid)
            authStore.setJoinedGroupIds(userGroups.map(g => g.id))

            return true
        } catch (error) {
            setCreateGroupError(error instanceof Error ? error.message : SETTINGS_GROUP_SWITCH.ERROR_MESSAGE_CREATE_GROUP)
            return false
        } finally {
            setIsCreatingGroup(false)
        }
    }

    // 登出功能
    const userLogout = async () => {
        try {
            // 先清理本地狀態
            setGroups([])
            setCurrentGroupName('')
            setActiveGroupId(null)

            // 登出 Firebase
            await signOut(auth);

            // 清理 store 狀態
            logout();

        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    // 載入使用者加入的群組（現在統一使用 fetchGroups）
    const loadUserGroups = useCallback(async () => {
        await fetchGroups()
    }, [fetchGroups])

    // 加入群組功能
    const joinGroup = async (inviteCode: string) => {
        if (!user?.uid) return false

        setIsJoiningGroup(true)
        setJoinGroupError('')

        try {
            const result = await GroupService.joinGroupByCode(user.uid, inviteCode)

            if (result.success && result.groupId && result.groupName) {
                // 更新本地狀態
                setActiveGroupId(result.groupId)
                setCurrentGroupName(result.groupName)

                // 同步到 AuthStore
                const authStore = useAuthStore.getState()
                authStore.setActiveGroupId(result.groupId)

                // 重新載入群組資料
                await fetchGroups()

                // 同步 joinedGroupIds
                const userGroups = await GroupService.getGroupsByUserId(user.uid)
                authStore.setJoinedGroupIds(userGroups.map(g => g.id))

                return true
            } else {
                setJoinGroupError(result.error || SETTINGS_GROUP_SWITCH.ERROR_MESSAGE_JOIN_GROUP)
                return false
            }
        } catch (error) {
            setJoinGroupError(error instanceof Error ? error.message : SETTINGS_GROUP_SWITCH.ERROR_MESSAGE_JOIN_GROUP)
            return false
        } finally {
            setIsJoiningGroup(false)
        }
    }

    // 退出當前群組
    const leaveCurrentGroup = useCallback(async () => {
        if (!user?.uid || !activeGroupId) {
            Alert.alert('錯誤', '無法退出群組')
            return
        }

        // 確認對話框
        Alert.alert(
            SETTINGS.LEAVE_GROUP_TITLE,
            SETTINGS.LEAVE_GROUP_MESSAGE,
            [
                {
                    text: COMMON.CANCEL,
                    style: 'cancel'
                },
                {
                    text: COMMON.CONFIRM,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true)
                            await MemberService.leaveGroup(activeGroupId, user.uid)

                            // 重新載入用戶群組資料
                            await loadUserGroups()
                            
                            // 重新獲取群組列表
                            await fetchGroups()

                            // 獲取最新的群組資訊
                            const userGroups = await GroupService.getGroupsByUserId(user.uid)
                            const authStore = useAuthStore.getState()
                            
                            // 更新 joinedGroupIds
                            authStore.setJoinedGroupIds(userGroups.map(g => g.id))
                            
                            // 檢查是否還有其他群組
                            if (userGroups.length === 0) {
                                // 沒有群組了，清空 activeGroupId
                                setActiveGroupId(null)
                                authStore.setActiveGroupId(null)
                            } else {
                                // 還有其他群組，切換到第一個群組
                                const firstGroup = userGroups[0]
                                setActiveGroupId(firstGroup.id)
                                authStore.setActiveGroupId(firstGroup.id)
                                setCurrentGroupName(firstGroup.name)
                            }

                            Alert.alert(COMMON.SUCCESS, SETTINGS.LEAVE_GROUP_SUCCESS)
                        } catch (error) {
                            console.error('Error leaving group:', error)
                            Alert.alert(COMMON.ERROR, error instanceof Error ? error.message : SETTINGS.LEAVE_GROUP_FAILURE_INFO)
                        } finally {
                            setLoading(false)
                        }
                    }
                }
            ]
        )
    }, [user?.uid, activeGroupId, loadUserGroups, fetchGroups])

    // 刪除群組
    const deleteGroup = useCallback(async (groupId: string, onModalClose?: () => void) => {
        if (!user?.uid) return

        setLoading(true)
        try {
            await GroupService.deleteGroup(groupId, user.uid)
            
            // 重新載入群組資料
            await fetchGroups()
            
            // 重新載入用戶群組資料
            await loadUserGroups()
            
            // 獲取最新的群組資訊
            const userGroups = await GroupService.getGroupsByUserId(user.uid)
            const authStore = useAuthStore.getState()
            
            // 更新 joinedGroupIds
            authStore.setJoinedGroupIds(userGroups.map(g => g.id))
            
            // 如果刪除的是當前活躍的群組，需要處理 activeGroupId
            if (activeGroupId === groupId) {
                if (userGroups.length === 0) {
                    // 沒有群組了，清空 activeGroupId
                    setActiveGroupId(null)
                    authStore.setActiveGroupId(null)
                    setCurrentGroupName('')
                } else {
                    // 還有其他群組，切換到第一個群組
                    const firstGroup = userGroups[0]
                    setActiveGroupId(firstGroup.id)
                    authStore.setActiveGroupId(firstGroup.id)
                    setCurrentGroupName(firstGroup.name)
                }
            }
            
            // 如果沒有群組了，自動關閉 modal
            if (userGroups.length === 0 && onModalClose) {
                onModalClose()
            }
            
            Alert.alert('成功', '群組已成功刪除')
        } catch (error) {
            console.error('Error deleting group:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [user?.uid, fetchGroups, loadUserGroups, activeGroupId])

    return {
        groups,
        currentGroupName,
        activeGroupId,
        loading,
        switchGroup,
        user,
        userLogout,
        createGroup,
        isCreatingGroup,
        createGroupError,
        loadUserGroups,
        fetchGroups,
        joinGroup,
        isJoiningGroup,
        joinGroupError,
        leaveCurrentGroup,
        deleteGroup,
    }
}