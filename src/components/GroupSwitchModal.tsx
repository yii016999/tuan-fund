import { GroupBrief } from '@/features/settings/model/Group';
import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface GroupSwitchModalProps {
    visible: boolean;                   // 是否顯示
    onClose: () => void;                // 關閉
    groups: GroupBrief[];               // 群組列表
    activeGroupId: string;              // 當前選中的群組 id
    onGroupSelect: (groupId: string, groupName: string) => void;
}

export function GroupSwitchModal({
    visible,
    onClose,
    groups,
    activeGroupId,
    onGroupSelect,
}: GroupSwitchModalProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white p-6 rounded-2xl w-80 max-h-96">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold">選擇群組</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-gray-400 text-2xl">×</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={groups}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="py-3 px-2 rounded-xl active:bg-gray-50"
                                onPress={() => {
                                    onGroupSelect(item.id, item.name);
                                    onClose();
                                }}
                                disabled={item.id === activeGroupId}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <Text className={`flex-1 ${item.id === activeGroupId
                                            ? 'font-bold text-blue-600'
                                            : 'text-gray-800'
                                            }`}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    {item.id === activeGroupId && (
                                        <View className="w-3 h-3 rounded-full bg-blue-500 ml-2" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}