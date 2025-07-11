import { AppHeader } from '@/components/AppHeader';
import { COMMON, SETTINGS_GROUP_SWITCH } from '@/constants/string';
import { BILLING_CYCLES, GROUP_TYPES } from '@/constants/types';
import { GroupSettings } from '@/features/settings/model/Group';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

interface GroupSwitchModalProps {
    visible: boolean;                                               // 彈窗開關
    onClose: () => void;                                            // 關閉事件
    groups: GroupSettings[];                                        // 群組資料
    activeGroupId: string;                                          // 當前選中 id
    onGroupSelect: (groupId: string, groupName: string) => void;    // 選擇群組
    isLoading?: boolean;                                            // 是否載入中
    onGroupDelete?: (groupId: string) => Promise<void>
}

interface GroupCardProps {
    group: GroupSettings;
    isActive: boolean;
    onSelect: () => Promise<void>;
    isLoading: boolean;
}

// 單一群組卡片（重新設計）
function GroupCard(props: GroupCardProps) {
    const isLongTerm = props.group.type === GROUP_TYPES.LONG_TERM;
    const typeLabel = isLongTerm ? SETTINGS_GROUP_SWITCH.TYPE_LONG_TERM : SETTINGS_GROUP_SWITCH.TYPE_ONE_TIME;

    // 根據實際 GroupSettings 模型取得繳費資訊
    const paymentAmount = props.group.monthlyAmount || 0;
    const billingCycle = props.group.billingCycle;

    // 週期顯示文字
    const getPeriodText = (cycle: string) => {
        switch (cycle) {
            case BILLING_CYCLES.MONTHLY: return SETTINGS_GROUP_SWITCH.PERIOD_MONTHLY;
            case BILLING_CYCLES.QUARTERLY: return SETTINGS_GROUP_SWITCH.PERIOD_QUARTERLY;
            case BILLING_CYCLES.YEARLY: return SETTINGS_GROUP_SWITCH.PERIOD_YEARLY;
            default: return SETTINGS_GROUP_SWITCH.PERIOD_MONTHLY;
        }
    };

    // 複製邀請碼功能
    const copyInviteCode = async () => {
        if (props.group.inviteCode) {
            try {
                Clipboard.setString(props.group.inviteCode);

                // 顯示 Toast 提示
                if (Platform.OS === COMMON.ANDROID) {
                    ToastAndroid.show(SETTINGS_GROUP_SWITCH.COPY_SUCCESS_MESSAGE, ToastAndroid.SHORT);
                } else {
                    // iOS 使用 Alert
                    Alert.alert('', SETTINGS_GROUP_SWITCH.COPY_SUCCESS_MESSAGE, [{ text: COMMON.CONFIRM }]);
                }
            } catch (error) {
                console.error(SETTINGS_GROUP_SWITCH.COPY_FAILURE, error);
                Alert.alert(COMMON.ERROR, SETTINGS_GROUP_SWITCH.COPY_FAILURE_MESSAGE, [{ text: COMMON.CONFIRM }]);
            }
        }
    };

    return (
        <View
            className={`bg-white rounded-2xl p-4 my-2 mx-2 shadow-lg relative ${props.isActive
                ? 'border-2 border-blue-500 bg-blue-50'
                : 'border border-gray-100'
                }`}
        >
            {/* Loading 遮罩 */}
            {props.isLoading && (
                <View className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center z-10">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            )}

            {/* 點擊區域 */}
            <TouchableOpacity
                onPress={props.onSelect}
                disabled={props.isActive || props.isLoading}
                activeOpacity={0.7}
                className="absolute inset-0 z-5"
            />

            {/* 標題 */}
            <View className="flex-row items-center justify-between mb-3">
                {/* 群組名稱 */}
                <View className="flex-1 flex-row items-center">
                    <Text className="text-lg font-bold text-gray-800 flex-shrink" numberOfLines={1}>
                        {props.group.name}
                    </Text>
                    {/* 類型標籤 */}
                    <View className={`px-2 py-1 rounded-full ml-2 ${isLongTerm
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        <Text className="text-xs font-bold">{typeLabel}</Text>
                    </View>


                </View>

                {/* 繳費資訊 */}
                {isLongTerm && (paymentAmount > 0 || billingCycle || props.group.allowPrepay) && (
                    <View className="flex-row items-center ml-2">
                        <Text className="text-sm font-semibold text-blue-600">
                            {COMMON.MONEY_SIGN}{paymentAmount.toLocaleString()}
                        </Text>
                        <Text className="text-xs text-gray-500 ml-1">
                            {COMMON.SLASH} {billingCycle ? getPeriodText(billingCycle) : SETTINGS_GROUP_SWITCH.PERIOD_MONTHLY}
                        </Text>
                        {props.group.allowPrepay && (
                            <Text className="text-xs text-gray-400 ml-1">
                                {COMMON.DOT} {SETTINGS_GROUP_SWITCH.PREPAY}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* 描述區域 */}
            {props.group.description && (
                <Text className="text-sm text-gray-600 mb-3 leading-5">
                    {props.group.description}
                </Text>
            )}

            {/* 右下 */}
            <View className="flex-row items-center justify-between">
                {/* 邀請碼 */}
                <View className="flex-1" />
                {props.group.inviteCode && (
                    <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500 mr-2">{SETTINGS_GROUP_SWITCH.INVITE_CODE}:</Text>
                        <Text className="text-sm font-mono text-blue-600 font-medium mr-2">
                            {props.group.inviteCode}
                        </Text>

                        {/* 複製按鈕 */}
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation(); // 防止觸發群組選擇
                                copyInviteCode();
                            }}
                            className="bg-gray-500 px-2 py-1 rounded-full"
                        >
                            <Text className="text-xs text-white font-medium">{COMMON.COPY}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

export function GroupSwitchModal(props: GroupSwitchModalProps) {
    const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);

    const handleGroupSelect = async (groupId: string, groupName: string) => {
        setLoadingGroupId(groupId);
        try {
            await props.onGroupSelect(groupId, groupName);
            props.onClose(); // 成功後關閉視窗
        } catch (error) {
            console.error(SETTINGS_GROUP_SWITCH.ERROR_MESSAGE, error);
            // 可以在這裡顯示錯誤訊息
        } finally {
            setLoadingGroupId(null);
        }
    };

    const handleDeleteGroup = async (groupId: string, groupName: string) => {
        Alert.alert(
            '確認刪除群組',
            `您確定要刪除群組「${groupName}」嗎？此操作將：\n\n• 移除所有成員\n• 刪除所有群組資料\n• 無法復原\n\n請謹慎操作。`,
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '確定刪除',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (props.onGroupDelete) {
                                await props.onGroupDelete(groupId)
                            }
                        } catch (error) {
                            Alert.alert('錯誤', error instanceof Error ? error.message : '刪除群組失敗')
                        }
                    }
                }
            ]
        )
    }

    return (
        <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
            {/* 黑色遮罩，內容貼近底部 */}
            <View className="flex-1 bg-black/30">
                {/* 主內容區：最大高度為螢幕92%，圓角、白底、padding */}
                <View
                    className="bg-white pb-6 px-3 w-full shadow-lg flex-1"
                    style={{
                        minHeight: 320,
                    }}
                >
                    <AppHeader
                        title={SETTINGS_GROUP_SWITCH.TITLE_SELECT_GROUP}
                        onBackPress={props.onClose}
                        isBorder={false}
                        showBack={true}
                    />

                    {/* 載入中 */}
                    {props.isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className="text-gray-500 mt-2">{COMMON.LOADING}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={props.groups}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                // 群組卡片 - 恢復原本的完整功能
                                <View key={item.id} className="relative">
                                    <GroupCard
                                        group={item}
                                        isActive={item.id === props.activeGroupId}
                                        onSelect={() => handleGroupSelect(item.id, item.name)}
                                        isLoading={loadingGroupId === item.id}
                                    />

                                    {/* 刪除按鈕 - 只有管理員可以看到 */}
                                    {item.isAdmin && (
                                        <TouchableOpacity
                                            className="absolute right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center z-20"
                                            onPress={() => handleDeleteGroup(item.id, item.name)}
                                        >
                                            <Text className="text-white text-xs font-bold">×</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text className="text-gray-400 text-center py-8">
                                    {SETTINGS_GROUP_SWITCH.NO_GROUP}
                                </Text>
                            }
                            contentContainerStyle={{
                                paddingBottom: 12,
                                paddingTop: 2,
                                flexGrow: 0,
                            }}
                            showsVerticalScrollIndicator={true}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}