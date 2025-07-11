import { AppHeader } from '@/components/AppHeader';
import { SETTINGS_CREATE_GROUP } from '@/constants/string';
import { useSettingsViewModel } from '@/features/settings/viewmodel/useSettingsViewModel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface JoinGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function JoinGroupModal({ visible, onClose, onSuccess }: JoinGroupModalProps) {
    const [joinCode, setJoinCode] = useState('')
    const [joinError, setJoinError] = useState('')

    const { joinGroup, isJoiningGroup, joinGroupError } = useSettingsViewModel()

    // 當 modal 關閉時清空表單
    useEffect(() => {
        if (!visible) {
            setJoinCode('')
            setJoinError('')
        }
    }, [visible])

    const handleJoinGroup = async () => {
        if (!joinCode.trim()) {
            setJoinError(SETTINGS_CREATE_GROUP.JOIN_GROUP_NOTICE)
            return
        }

        setJoinError('')

        try {
            const success = await joinGroup(joinCode.trim())

            if (success) {
                // 清空表單
                setJoinCode('')

                // 關閉 modal
                onClose()

                // 通知父組件刷新資料
                onSuccess?.()
            } else {
                // 錯誤訊息已經在 ViewModel 中設定
                setJoinError(joinGroupError || SETTINGS_CREATE_GROUP.JOIN_GROUP_FAILURE)
            }
        } catch (err) {
            setJoinError(SETTINGS_CREATE_GROUP.JOIN_GROUP_FAILURE)
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            {/* 黑色遮罩 */}
            <View className="flex-1 bg-black/30">
                {/* 主內容區 */}
                <View className="bg-white pb-6 px-4 w-full shadow-lg flex-1">
                    <AppHeader
                        title={SETTINGS_CREATE_GROUP.TITLE_JOIN_GROUP}
                        onBackPress={onClose}
                        isBorder={false}
                        showBack={true}
                    />

                    <View className="flex-1">
                        <Text className="text-base mb-1 font-medium">{SETTINGS_CREATE_GROUP.INVITE_CODE}</Text>
                        <TextInput
                            value={joinCode}
                            onChangeText={(text) => {
                                setJoinCode(text)
                                setJoinError('')
                            }}
                            placeholder={SETTINGS_CREATE_GROUP.JOIN_GROUP_NOTICE}
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                            autoCapitalize="characters"
                            maxLength={6}
                        />

                        <View className="bg-gray-50 p-4 rounded-lg mb-6">
                            <Text className="text-gray-600 text-sm leading-5">
                                {SETTINGS_CREATE_GROUP.JOIN_GROUP_NOTICE_INFO}
                            </Text>
                        </View>

                        {/* 顯示加入群組的錯誤訊息 */}
                        {(!!joinError || !!joinGroupError) && (
                            <View className="bg-red-50 p-3 rounded-lg mb-4">
                                <Text className="text-red-600 text-center">{joinError || joinGroupError}</Text>
                            </View>
                        )}

                        {/* 按鈕區域 */}
                        <View className="mt-auto">
                            {isJoiningGroup ? (
                                <View className="py-4">
                                    <ActivityIndicator size="large" color="#007AFF" />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    className="bg-green-500 py-4 rounded-lg shadow-sm"
                                    onPress={handleJoinGroup}
                                    disabled={!joinCode.trim()}
                                >
                                    <Text className="text-white text-center font-semibold text-base">
                                        {SETTINGS_CREATE_GROUP.TITLE_JOIN_GROUP}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
} 