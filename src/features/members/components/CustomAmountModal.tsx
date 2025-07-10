import { COMMON, MEMBERS } from '@/constants/string';
import React, { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CustomAmountModalProps {
    visible: boolean;                       // 是否顯示
    onClose: () => void;                    // 關閉
    onConfirm: (amount: string) => void;    // 確認
    memberName: string;                     // 成員名稱
    defaultAmount: number;                  // 預設金額
    initialAmount?: string;                 // 初始金額
}

export default function CustomAmountModal(props: CustomAmountModalProps) {
    const { visible, onClose, onConfirm, memberName, defaultAmount, initialAmount = '' } = props;
    const [customAmount, setCustomAmount] = useState(initialAmount);

    // 當 Modal 開啟時重置輸入值
    useEffect(() => {
        if (visible) {
            setCustomAmount(initialAmount);
        }
    }, [visible, initialAmount]);

    const handleConfirm = () => {
        onConfirm(customAmount);
        onClose();
    };

    const handleCancel = () => {
        setCustomAmount(initialAmount); // 重置為初始值
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"  // 改為淡入淡出
            transparent
        >
            <View className="flex-1 bg-black/30 justify-center items-center">
                <View className="bg-white rounded-lg p-6 w-4/5 max-w-sm">
                    {/* 標題 */}
                    <View className="mb-4 mb-6">
                        <Text className="text-lg font-semibold text-center">{MEMBERS.SET_PAYMENT_AMOUNT}</Text>
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
                            onChangeText={setCustomAmount}
                            placeholder={`${COMMON.INPUT} ${COMMON.MONEY_SIGN}`}
                            keyboardType="numeric"
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                            autoFocus
                        />

                        {/* 按鈕區域 */}
                        <View className="flex-row justify-end gap-2">
                            <TouchableOpacity
                                onPress={handleCancel}
                                className="bg-gray-500 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white">{COMMON.CANCEL}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                className="bg-blue-500 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white">{COMMON.CONFIRM}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}; 