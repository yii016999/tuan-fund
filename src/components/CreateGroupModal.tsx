import { GROUP_TYPES, GroupType } from '@/constants/types';
import { useCreateGroupViewModel } from '@/features/groups/viewModel/useCreateGroupViewModel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    initialTab?: 'create' | 'join'; // 新增初始分頁參數
}

// 標題列組件
function Header(props: { onClose: () => void; activeTab: 'create' | 'join'; onTabChange: (tab: 'create' | 'join') => void }) {
    return (
        <View className="mb-6">
            {/* 關閉按鈕和標題 */}
            <View className="flex-row items-center mb-6 relative">
                <TouchableOpacity onPress={props.onClose}>
                    <Text className="text-gray-400 text-4xl px-2">×</Text>
                </TouchableOpacity>
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-lg font-bold">群組管理</Text>
                </View>
            </View>

            {/* 分頁切換 */}
            <View className="flex-row border-b border-gray-200">
                <TouchableOpacity
                    className="flex-1 pb-3"
                    onPress={() => props.onTabChange('create')}
                >
                    <View className="items-center">
                        <Text className={`font-semibold text-base ${props.activeTab === 'create' ? 'text-blue-600' : 'text-gray-500'}`}>
                            建立群組
                        </Text>
                        {props.activeTab === 'create' && (
                            <View className="mt-2 w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/25" />
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 pb-3"
                    onPress={() => props.onTabChange('join')}
                >
                    <View className="items-center">
                        <Text className={`font-semibold text-base ${props.activeTab === 'join' ? 'text-blue-600' : 'text-gray-500'}`}>
                            加入群組
                        </Text>
                        {props.activeTab === 'join' && (
                            <View className="mt-2 w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/25" />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}


export default function CreateGroupModal({ visible, onClose, initialTab = 'create' }: CreateGroupModalProps) {
    // 建立群組相關 state
    const [name, setName] = useState('')
    const [type, setType] = useState<GroupType>(GROUP_TYPES.LONG_TERM)
    const [description, setDescription] = useState('')

    // 加入群組相關 state
    const [joinCode, setJoinCode] = useState('')
    const [isJoining, setIsJoining] = useState(false)
    const [joinError, setJoinError] = useState('')

    // 分頁 state
    const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialTab)

    const { createGroup, isLoading, error } = useCreateGroupViewModel()

    // 當 modal 打開時重置 activeTab
    useEffect(() => {
        if (visible) {
            setActiveTab(initialTab)
        }
    }, [visible, initialTab])

    const handleCreateGroup = async () => {
        const success = await createGroup(name, type, description)
        if (success) {
            onClose()
            // 清空表單
            setName('')
            setDescription('')
            setType(GROUP_TYPES.LONG_TERM)
        }
    }

    const handleJoinGroup = async () => {
        if (!joinCode.trim()) {
            setJoinError('請輸入邀請碼')
            return
        }

        setIsJoining(true)
        setJoinError('')

        try {
            // TODO: 實現加入群組的邏輯
            // await joinGroupByCode(joinCode)
            console.log('加入群組:', joinCode)

            // 模擬 API 呼叫
            await new Promise(resolve => setTimeout(resolve, 1000))

            onClose()
            setJoinCode('')
        } catch (err) {
            setJoinError('加入群組失敗，請檢查邀請碼是否正確')
        } finally {
            setIsJoining(false)
        }
    }

    // 建立群組分頁內容
    const renderCreateTab = () => (
        <View className="flex-1">
            <Text className="text-base mb-1 font-medium">群組名稱</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="請輸入群組名稱"
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
            />

            <Text className="text-base mb-3 font-medium">群組類型</Text>
            <View className="flex-row mb-6 bg-gray-50 rounded-lg">
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-md ${type === GROUP_TYPES.LONG_TERM
                        ? 'bg-blue-500'
                        : 'bg-transparent'
                        }`}
                    onPress={() => setType(GROUP_TYPES.LONG_TERM)}
                >
                    <Text
                        className={`text-center font-medium ${type === GROUP_TYPES.LONG_TERM ? 'text-white' : 'text-gray-700'}`}>
                        長期型
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`flex-1 py-3 rounded-md ${type === GROUP_TYPES.ONE_TIME
                        ? 'bg-blue-500'
                        : 'bg-transparent'
                        }`}
                    onPress={() => setType(GROUP_TYPES.ONE_TIME)}
                >
                    <Text
                        className={`text-center font-medium ${type === GROUP_TYPES.ONE_TIME ? 'text-white' : 'text-gray-700'}`}>
                        一次性
                    </Text>
                </TouchableOpacity>
            </View>

            <Text className="text-base mb-1 font-medium">群組描述</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="可填寫這個群組的用途"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
                textAlignVertical="top"
            />

            {!!error && (
                <View className="bg-red-50 p-3 rounded-lg mb-4">
                    <Text className="text-red-600 text-center">{error}</Text>
                </View>
            )}

            {/* 按鈕區域 */}
            <View className="mt-auto">
                {isLoading ? (
                    <View className="py-4">
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : (
                    <TouchableOpacity
                        className="bg-blue-500 py-4 rounded-lg shadow-sm"
                        onPress={handleCreateGroup}
                        disabled={!name.trim()}
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            建立群組
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )

    // 加入群組分頁內容
    const renderJoinTab = () => (
        <View className="flex-1">
            <Text className="text-base mb-1 font-medium">邀請碼</Text>
            <TextInput
                value={joinCode}
                onChangeText={(text) => {
                    setJoinCode(text)
                    setJoinError('')
                }}
                placeholder="請輸入群組邀請碼"
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                autoCapitalize="characters"
            />

            <View className="bg-gray-50 p-4 rounded-lg mb-6">
                <Text className="text-gray-600 text-sm leading-5">
                    💡 邀請碼通常由群組管理員提供，格式為 6-8 位英數字組合。輸入後即可加入對應的群組。
                </Text>
            </View>

            {!!joinError && (
                <View className="bg-red-50 p-3 rounded-lg mb-4">
                    <Text className="text-red-600 text-center">{joinError}</Text>
                </View>
            )}

            {/* 按鈕區域 */}
            <View className="mt-auto">
                {isJoining ? (
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
                            加入群組
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            {/* 黑色遮罩 */}
            <View className="flex-1 bg-black/30">
                {/* 主內容區 */}
                <View className="bg-white pt-5 pb-6 px-4 w-full shadow-lg flex-1">
                    {/* 標題列和分頁切換 */}
                    <Header onClose={onClose} activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* 分頁內容 */}
                    {activeTab === 'create' ? renderCreateTab() : renderJoinTab()}
                </View>
            </View>
        </Modal>
    )
}