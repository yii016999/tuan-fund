import { SETTINGS_CREATE_GROUP } from '@/constants/string';
import { BILLING_CYCLES, BillingCycle, CREATE_GROUP_TAB_TYPES, CreateGroupTabType, GROUP_TYPES, GroupType } from '@/constants/types';
import { useSettingsViewModel } from '@/features/settings/viewmodel/useSettingsViewModel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;  // 新增成功回調
    initialTab?: CreateGroupTabType; // 新增初始分頁參數
}

// 標題列組件
function Header(props: { onClose: () => void; activeTab: CreateGroupTabType; onTabChange: (tab: CreateGroupTabType) => void }) {
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
                    onPress={() => props.onTabChange(CREATE_GROUP_TAB_TYPES.CREATE)}
                >
                    <View className="items-center">
                        <Text className={`font-semibold text-base ${props.activeTab === CREATE_GROUP_TAB_TYPES.CREATE ? 'text-blue-600' : 'text-gray-500'}`}>
                            {SETTINGS_CREATE_GROUP.TITLE_CREATE_GROUP}
                        </Text>
                        {props.activeTab === CREATE_GROUP_TAB_TYPES.CREATE && (
                            <View className="mt-2 w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/25" />
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 pb-3"
                    onPress={() => props.onTabChange(CREATE_GROUP_TAB_TYPES.JOIN)}
                >
                    <View className="items-center">
                        <Text className={`font-semibold text-base ${props.activeTab === CREATE_GROUP_TAB_TYPES.JOIN ? 'text-blue-600' : 'text-gray-500'}`}>
                            {SETTINGS_CREATE_GROUP.TITLE_JOIN_GROUP}
                        </Text>
                        {props.activeTab === CREATE_GROUP_TAB_TYPES.JOIN && (
                            <View className="mt-2 w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/25" />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}


export default function CreateGroupModal({ visible, onClose, onSuccess, initialTab = CREATE_GROUP_TAB_TYPES.CREATE }: CreateGroupModalProps) {
    // 建立群組相關 state
    const [name, setName] = useState('')
    const [type, setType] = useState<GroupType>(GROUP_TYPES.LONG_TERM)
    const [description, setDescription] = useState('')

    // 新增：繳費金額設定
    const [monthlyAmount, setMonthlyAmount] = useState('')
    const [allowPrepay, setAllowPrepay] = useState(false)

    // 加入群組相關 state
    const [joinCode, setJoinCode] = useState('')
    const [joinError, setJoinError] = useState('')

    // 是否開啟月繳制度
    const [enableMonthlyPayment, setEnableMonthlyPayment] = useState(false)
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(BILLING_CYCLES.MONTHLY)

    // 分頁 state
    const [activeTab, setActiveTab] = useState<CreateGroupTabType>(initialTab)

    const { createGroup, isCreatingGroup, createGroupError, joinGroup, isJoiningGroup, joinGroupError } = useSettingsViewModel()

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
                setJoinError(joinGroupError || SETTINGS_CREATE_GROUP.JOIN_GROUP_FAILURE_INFO)
            }
        } catch (err) {
            setJoinError(SETTINGS_CREATE_GROUP.JOIN_GROUP_FAILURE_INFO)
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
                <Text className="text-base mb-1 font-medium">{SETTINGS_CREATE_GROUP.GROUP_NAME}</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={SETTINGS_CREATE_GROUP.GROUP_NAME_NOTICE}
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                />

                <Text className="text-base mb-3 font-medium">{SETTINGS_CREATE_GROUP.GROUP_TYPE}</Text>
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
                            {SETTINGS_CREATE_GROUP.TYPE_LONG_TERM}
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
                            {SETTINGS_CREATE_GROUP.TYPE_ONE_TIME}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-base mb-1 font-medium">{SETTINGS_CREATE_GROUP.GROUP_DESCRIPTION}</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={SETTINGS_CREATE_GROUP.GROUP_DESCRIPTION_NOTICE}
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
                            {SETTINGS_CREATE_GROUP.TITLE_CREATE_GROUP}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )

    // 加入群組分頁內容
    const renderJoinTab = () => (
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
    )

    // 循環繳費制度設定組件
    const renderPaymentSettings = () => {
        if (type !== GROUP_TYPES.LONG_TERM) return null;

        return (
            <View className="mb-6">
                {/* 啟用循環繳費開關 */}
                <View className="flex-row items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                    <View className="flex-1">
                        <Text className="font-medium text-gray-800 mb-1">{SETTINGS_CREATE_GROUP.ENABLE_MONTHLY_PAYMENT}</Text>
                        <Text className="text-sm text-gray-600">{SETTINGS_CREATE_GROUP.ENABLE_MONTHLY_PAYMENT_INFO}</Text>
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
                            <Text className="text-sm mb-2 font-medium text-gray-700">{SETTINGS_CREATE_GROUP.MONTHLY_AMOUNT}</Text>
                            <TextInput
                                value={monthlyAmount}
                                onChangeText={setMonthlyAmount}
                                placeholder={SETTINGS_CREATE_GROUP.MONTHLY_AMOUNT_NOTICE}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                            />
                        </View>

                        {/* 繳費週期選擇 */}
                        <View className='mb-4'>
                            <Text className="text-sm mb-2 font-medium text-gray-700">{SETTINGS_CREATE_GROUP.BILLING_CYCLE}</Text>
                            <View className="flex-row flex-wrap">
                                {renderBillingCycleOptions()}
                            </View>
                        </View>

                        {/* 新增：是否允許預繳 */}
                        <View className="flex-row items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
                            <View className="flex-1">
                                <Text className="font-medium text-gray-800 mb-1">{SETTINGS_CREATE_GROUP.PREPAY}</Text>
                                <Text className="text-sm text-gray-600">{SETTINGS_CREATE_GROUP.PREPAY_NOTICE}</Text>
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
                                {SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_ENABLED}
                            </Text>
                            <Text className="text-xs text-blue-700 leading-4">
                                {SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_NOTICE} ${monthlyAmount || 0}
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
            [BILLING_CYCLES.MONTHLY]: SETTINGS_CREATE_GROUP.PERIOD_MONTHLY,
            [BILLING_CYCLES.QUARTERLY]: SETTINGS_CREATE_GROUP.PERIOD_QUARTERLY,
            [BILLING_CYCLES.YEARLY]: SETTINGS_CREATE_GROUP.PERIOD_YEARLY,
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
                    {activeTab === CREATE_GROUP_TAB_TYPES.CREATE ? renderCreateTab() : renderJoinTab()}
                </View>
            </View>
        </Modal>
    )
}