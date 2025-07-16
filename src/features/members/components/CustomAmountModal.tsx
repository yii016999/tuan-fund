import { COMMON, MEMBERS } from '@/constants/string'
import { COLORS, STYLES, UI, VALIDATION } from '@/constants/config'
import React, { useCallback, useEffect, useState } from 'react'
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface CustomAmountModalProps {
    visible: boolean
    onClose: () => void
    onConfirm: (amount: string) => void
    memberName: string
    defaultAmount: number
    initialAmount?: string
}

const CustomAmountModal = React.memo<CustomAmountModalProps>(({
    visible,
    onClose,
    onConfirm,
    memberName,
    defaultAmount,
    initialAmount = ''
}) => {
    const [customAmount, setCustomAmount] = useState(initialAmount)

    // 當 Modal 開啟時重置輸入值
    useEffect(() => {
        if (visible) {
            setCustomAmount(initialAmount)
        }
    }, [visible, initialAmount])

    const handleConfirm = useCallback(() => {
        // 驗證金額
        const amount = parseInt(customAmount) || 0
        if (amount < VALIDATION.MEMBER.MIN_CUSTOM_AMOUNT || amount > VALIDATION.MEMBER.MAX_CUSTOM_AMOUNT) {
            return
        }

        onConfirm(customAmount)
    }, [customAmount, onConfirm])

    const handleCancel = useCallback(() => {
        setCustomAmount(initialAmount)
        onClose()
    }, [initialAmount, onClose])

    const handleAmountChange = useCallback((text: string) => {
        // 只允許數字輸入
        const numericValue = text.replace(/[^0-9]/g, '')
        setCustomAmount(numericValue)
    }, [])

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View
                    className="bg-white w-4/5 max-w-sm"
                    style={{
                        borderRadius: STYLES.MEMBER.MODAL_BORDER_RADIUS,
                        padding: STYLES.MEMBER.MODAL_PADDING,
                        ...STYLES.SHADOW,
                    }}
                >
                    {/* 標題 */}
                    <View style={{ marginBottom: STYLES.SPACING.LG }}>
                        <Text className="text-lg font-semibold text-center">
                            {MEMBERS.SET_PAYMENT_AMOUNT}
                        </Text>
                    </View>

                    {/* 內容區域 */}
                    <View>
                        <Text className="text-gray-700 mb-2">
                            {MEMBERS.MEMBER_INFO} {memberName}
                        </Text>
                        <Text className="text-sm text-gray-600 mb-4">
                            {MEMBERS.DEFAULT_AMOUNT_INFO} {COMMON.MONEY_SIGN} {defaultAmount}
                        </Text>

                        <TextInput
                            value={customAmount}
                            onChangeText={handleAmountChange}
                            placeholder={`${COMMON.INPUT} ${COMMON.MONEY_SIGN}`}
                            keyboardType="numeric"
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                            autoFocus
                            maxLength={6}
                            style={{
                                borderRadius: STYLES.BORDER_RADIUS.MEDIUM,
                                fontSize: 16,
                            }}
                        />

                        {/* 按鈕區域 */}
                        <View className="flex-row justify-end gap-2">
                            <TouchableOpacity
                                onPress={handleCancel}
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: COLORS.GRAY[500] }}
                                activeOpacity={0.7}
                            >
                                <Text className="text-white">{COMMON.CANCEL}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: COLORS.PRIMARY }}
                                activeOpacity={0.7}
                            >
                                <Text className="text-white">{COMMON.CONFIRM}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
})

CustomAmountModal.displayName = 'CustomAmountModal'

export default CustomAmountModal 