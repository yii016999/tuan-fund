import { SETTINGS_CREATE_GROUP } from '@/constants/string';
import { BILLING_CYCLES, BillingCycle, GROUP_TYPES, GroupType } from '@/constants/types';
import { useSettingsViewModel } from '@/features/settings/viewmodel/useSettingsViewModel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;  // 新增成功回調
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
                    <Text className="text-lg font-bold">{SETTINGS_CREATE_GROUP.TITLE}</Text>
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


export default function CreateGroupModal({ visible, onClose, onSuccess, initialTab = 'create' }: CreateGroupModalProps) {
    // 建立群組相關 state
    const [name, setName] = useState('')
    const [type, setType] = useState<GroupType>(GROUP_TYPES.LONG_TERM)
    const [description, setDescription] = useState('')

    // 新增：繳費金額設定
    const [monthlyAmount, setMonthlyAmount] = useState('')
    const [allowPrepay, setAllowPrepay] = useState(false)

    // 加入群組相關 state
    const [joinCode, setJoinCode] = useState('')
    const [isJoining, setIsJoining] = useState(false)
    const [joinError, setJoinError] = useState('')

    // 是否開啟月繳制度
    const [enableMonthlyPayment, setEnableMonthlyPayment] = useState(false)
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(BILLING_CYCLES.MONTHLY)

    // 分頁 state
    const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialTab)

    const { createGroup, isCreatingGroup, createGroupError } = useSettingsViewModel()

    // 當 modal 打開時重置 activeTab
    useEffect(() => {
        if (visible) {
            setActiveTab(initialTab)
        }
    }, [visible, initialTab])

    // 當 modal 關閉時清空表單
    useEffect(() => {
        if (!visible) {
            // 清空建立群組表單
            setName('')
            setDescription('')
            setType(GROUP_TYPES.LONG_TERM)
            setEnableMonthlyPayment(false)
            setBillingCycle(BILLING_CYCLES.MONTHLY)
            // 新增：清空繳費相關設定
            setMonthlyAmount('')
            setAllowPrepay(false)

            // 清空加入群組表單
            setJoinCode('')
            setJoinError('')
        }
    }, [visible])

    const handleCreateGroup = async () => {
        // 修正：直接傳遞各個參數，讓 createGroup 函數處理
        const success = await createGroup(
            name,
            type,
            description,
            // 繳費相關參數
            type === GROUP_TYPES.LONG_TERM && enableMonthlyPayment ? {
                monthlyAmount: parseInt(monthlyAmount) || 0,
                billingCycle,
                allowPrepay
            } : undefined
        )

        if (success) {
            // 清空表單
            setName('')
            setDescription('')
            setType(GROUP_TYPES.LONG_TERM)
            setEnableMonthlyPayment(false)
            setMonthlyAmount('')
            setAllowPrepay(false)

            // 關閉 modal
            onClose()

            // 通知父組件刷新資料
            onSuccess?.()
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

            // 通知父組件刷新資料
            onSuccess?.()
        } catch (err) {
            setJoinError('加入群組失敗，請檢查邀請碼是否正確')
        } finally {
            setIsJoining(false)
        }
    }

    // 建立群組分頁內容
    const renderCreateTab = () => (
        <View className="flex-1">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
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

                {/* 循環繳費制度設定組件 */}
                {renderPaymentSettings()}

                {!!createGroupError && (
                    <View className="bg-red-50 p-3 rounded-lg mb-4">
                        <Text className="text-red-600 text-center">{createGroupError}</Text>
                    </View>
                )}

                {/* 在 ScrollView 底部增加一些 padding */}
                <View className="h-4" />
            </ScrollView>

            {/* 按鈕區域 - 固定在底部 */}
            <View className="pt-4 border-t border-gray-100">
                {isCreatingGroup ? (
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
                    💡 邀請碼由群組管理員提供，格式為 6-8 位英數字組合。
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

    // 循環繳費制度設定組件
    const renderPaymentSettings = () => {
        if (type !== GROUP_TYPES.LONG_TERM) return null;

        return (
            <View className="mb-6">
                {/* 啟用循環繳費開關 */}
                <View className="flex-row items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                    <View className="flex-1">
                        <Text className="font-medium text-gray-800 mb-1">啟用固定繳費制度</Text>
                        <Text className="text-sm text-gray-600">是否需固定繳費</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setEnableMonthlyPayment(!enableMonthlyPayment)}
                        className={`w-12 h-6 rounded-full ${enableMonthlyPayment ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <View
                            className={`w-5 h-5 bg-white rounded-full mt-0.5 ${enableMonthlyPayment ? 'ml-6' : 'ml-0.5'
                                }`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                                elevation: 2,
                            }}
                        />
                    </TouchableOpacity>
                </View>

                {/* 繳費制度詳細設定 */}
                {enableMonthlyPayment && (
                    <View className="ml-4 space-y-4">
                        {/* 新增：繳費金額設定 */}
                        <View className='mb-4'>
                            <Text className="text-sm mb-2 font-medium text-gray-700">繳費金額</Text>
                            <TextInput
                                value={monthlyAmount}
                                onChangeText={setMonthlyAmount}
                                placeholder="請輸入繳費金額"
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                            />
                        </View>

                        {/* 繳費週期選擇 */}
                        <View className='mb-4'>
                            <Text className="text-sm mb-2 font-medium text-gray-700">繳費週期</Text>
                            <View className="flex-row flex-wrap">
                                {renderBillingCycleOptions()}
                            </View>
                        </View>

                        {/* 新增：是否允許預繳 */}
                        <View className="flex-row items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
                            <View className="flex-1">
                                <Text className="font-medium text-gray-800 mb-1">允許預繳</Text>
                                <Text className="text-sm text-gray-600">成員可提前繳費</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setAllowPrepay(!allowPrepay)}
                                className={`w-12 h-6 rounded-full ${allowPrepay ? 'bg-blue-500' : 'bg-gray-300'}`}
                            >
                                <View
                                    className={`w-5 h-5 bg-white rounded-full mt-0.5 ${allowPrepay ? 'ml-6' : 'ml-0.5'
                                        }`}
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 2,
                                        elevation: 2,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* 制度說明 */}
                        <View className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                            <Text className="text-sm text-blue-800 font-medium mb-2">
                                💡 固定繳費制度已啟用
                            </Text>
                            <Text className="text-xs text-blue-700 leading-4">
                                每位成員需要按照設定的週期繳費 ${monthlyAmount || 0}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    // 繳費週期選項組件
    const renderBillingCycleOptions = () => {
        const labels = {
            [BILLING_CYCLES.MONTHLY]: '月繳',
            [BILLING_CYCLES.QUARTERLY]: '季繳',
            [BILLING_CYCLES.YEARLY]: '年繳',
        };

        return Object.entries(BILLING_CYCLES).map(([key, value]) => (
            <TouchableOpacity
                key={key}
                onPress={() => setBillingCycle(value)}
                className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${billingCycle === value
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                    }`}
            >
                <Text
                    className={`text-sm ${billingCycle === value ? 'text-white' : 'text-gray-700'
                        }`}
                >
                    {labels[value]}
                </Text>
            </TouchableOpacity>
        ));
    };

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