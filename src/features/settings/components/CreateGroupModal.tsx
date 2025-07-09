import { ModalHeader } from '@/components/ModalHeader';
import { SETTINGS_CREATE_GROUP } from '@/constants/string';
import { BILLING_CYCLES, BillingCycle, GROUP_TYPES, GroupType } from '@/constants/types';
import { useSettingsViewModel } from '@/features/settings/viewmodel/useSettingsViewModel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateGroupModal({ visible, onClose, onSuccess }: CreateGroupModalProps) {
    // 建立群組相關 state
    const [name, setName] = useState('')
    const [type, setType] = useState<GroupType>(GROUP_TYPES.LONG_TERM)
    const [description, setDescription] = useState('')
    const [monthlyAmount, setMonthlyAmount] = useState('')
    const [allowPrepay, setAllowPrepay] = useState(false)
    const [enableMonthlyPayment, setEnableMonthlyPayment] = useState(false)
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(BILLING_CYCLES.MONTHLY)
    const [enableCustomAmount, setEnableCustomAmount] = useState(false)

    const { createGroup, isCreatingGroup, createGroupError } = useSettingsViewModel()

    // 當 modal 關閉時清空表單
    useEffect(() => {
        if (!visible) {
            setName('')
            setDescription('')
            setType(GROUP_TYPES.LONG_TERM)
            setEnableMonthlyPayment(false)
            setBillingCycle(BILLING_CYCLES.MONTHLY)
            setMonthlyAmount('')
            setAllowPrepay(false)
            setEnableCustomAmount(false)
        }
    }, [visible])

    const handleCreateGroup = async () => {
        const success = await createGroup(
            name,
            type,
            description,
            type === GROUP_TYPES.LONG_TERM && enableMonthlyPayment ? {
                monthlyAmount: parseInt(monthlyAmount) || 0,
                billingCycle,
                allowPrepay,
                enableCustomAmount
            } : undefined
        )

        if (success) {
            onClose()
            onSuccess?.()
        }
    }

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
                            className={`w-5 h-5 bg-white rounded-full mt-0.5 ${enableMonthlyPayment ? 'ml-6' : 'ml-0.5'}`}
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

                        <View className='mb-4'>
                            <Text className="text-sm mb-2 font-medium text-gray-700">{SETTINGS_CREATE_GROUP.BILLING_CYCLE}</Text>
                            <View className="flex-row flex-wrap">
                                {renderBillingCycleOptions()}
                            </View>
                        </View>

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
                                    className={`w-5 h-5 bg-white rounded-full mt-0.5 ${allowPrepay ? 'ml-6' : 'ml-0.5'}`}
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

                        {/* 客製化金額開關 */}
                        <View className="flex-row items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
                            <View className="flex-1">
                                <Text className="font-medium text-gray-800 mb-1">{SETTINGS_CREATE_GROUP.ENABLE_CUSTOM_AMOUNT}</Text>
                                <Text className="text-sm text-gray-600">{SETTINGS_CREATE_GROUP.ENABLE_CUSTOM_AMOUNT_INFO}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setEnableCustomAmount(!enableCustomAmount)}
                                className={`w-12 h-6 rounded-full ${enableCustomAmount ? 'bg-blue-500' : 'bg-gray-300'}`}
                            >
                                <View
                                    className={`w-5 h-5 bg-white rounded-full mt-0.5 ${enableCustomAmount ? 'ml-6' : 'ml-0.5'}`}
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

                        <View className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                            <Text className="text-sm text-blue-800 font-medium mb-2">
                                {SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_ENABLED}
                            </Text>
                            <Text className="text-xs text-blue-700 leading-4">
                                {enableCustomAmount
                                    ? `${SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_NOTICE} ${SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_NOTICE_INFO} $${monthlyAmount || 0}\n${SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_NOTICE_INFO_INFO}`
                                    : `${SETTINGS_CREATE_GROUP.FIXED_PAYMENT_SYSTEM_NOTICE} $${monthlyAmount || 0}`
                                }
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
                    className={`text-sm ${billingCycle === value ? 'text-white' : 'text-gray-700'}`}
                >
                    {labels[value]}
                </Text>
            </TouchableOpacity>
        ));
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-black/30">
                <View className="bg-white pt-5 pb-6 px-4 w-full shadow-lg flex-1">
                    <ModalHeader
                        title={SETTINGS_CREATE_GROUP.TITLE_CREATE_GROUP}
                        onClose={onClose}
                        showBorder={false}
                    />

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
                                    className={`flex-1 py-3 rounded-md ${type === GROUP_TYPES.LONG_TERM ? 'bg-blue-500' : 'bg-transparent'}`}
                                    onPress={() => setType(GROUP_TYPES.LONG_TERM)}
                                >
                                    <Text className={`text-center font-medium ${type === GROUP_TYPES.LONG_TERM ? 'text-white' : 'text-gray-700'}`}>
                                        {SETTINGS_CREATE_GROUP.TYPE_LONG_TERM}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-1 py-3 rounded-md ${type === GROUP_TYPES.ONE_TIME ? 'bg-blue-500' : 'bg-transparent'}`}
                                    onPress={() => setType(GROUP_TYPES.ONE_TIME)}
                                >
                                    <Text className={`text-center font-medium ${type === GROUP_TYPES.ONE_TIME ? 'text-white' : 'text-gray-700'}`}>
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

                            {renderPaymentSettings()}

                            {!!createGroupError && (
                                <View className="bg-red-50 p-3 rounded-lg mb-4">
                                    <Text className="text-red-600 text-center">{createGroupError}</Text>
                                </View>
                            )}

                            <View className="h-4" />
                        </ScrollView>

                        {/* 按鈕區域 */}
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
                </View>
            </View>
        </Modal>
    )
}