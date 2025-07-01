import { GROUP_TYPES } from '@/constants/types';
import { GroupModel } from '@/features/settings/model/Group';
import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface GroupSwitchModalProps {
    visible: boolean;                                          // 彈窗開關
    onClose: () => void;                                       // 關閉事件
    groups: GroupModel[];                                      // 群組資料
    activeGroupId: string;                                     // 當前選中 id
    onGroupSelect: (groupId: string, groupName: string) => void; // 選擇群組
    onViewDetail: (groupId: string) => void;                   // 查看詳細
}

interface GroupCardProps {
    group: GroupModel;
    isActive: boolean;
    onSelect: () => void;
    onViewDetail: () => void;
}

// 單一群組卡片（名稱、性質標籤、描述、兩顆按鈕）
function GroupCard(props: GroupCardProps) {
    const typeLabel =
        props.group.type === GROUP_TYPES.LONG_TERM ? '長期型' : '一次性';
    const typeColor =
        props.group.type === GROUP_TYPES.LONG_TERM
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700';

    return (
        <View className={`bg-white rounded-2xl p-4 mb-4 mx-2 shadow ${props.isActive
            ? 'border-2 border-blue-500'
            : 'border border-gray-100'
            }`}>
            {/* 名稱 + 性質 */}
            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-base font-semibold flex-1" numberOfLines={1}>
                    {props.group.name}
                </Text>
                <View className={`px-2 py-0.5 rounded-xl ml-2 ${typeColor}`}>
                    <Text className="text-xs font-bold">{typeLabel}</Text>
                </View>
            </View>
            {/* 描述（可選） */}
            {props.group.description ? (
                <Text className="text-xs text-gray-600 mb-3">
                    {props.group.description}
                </Text>
            ) : null}
            {/* 按鈕區 */}
            <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                    className="mr-2 px-3 py-1 rounded-xl border border-gray-300"
                    onPress={props.onViewDetail}
                >
                    <Text className="text-sm text-blue-500">查看詳細</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`px-3 py-1 rounded-xl ${props.isActive ? 'bg-gray-300' : 'bg-blue-500'}`}
                    onPress={props.onSelect}
                    disabled={props.isActive}
                >
                    <Text className={`text-sm ${props.isActive ? 'text-gray-400' : 'text-white'}`}>
                        {props.isActive ? '目前' : '選擇'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// 標題列 (左上叉叉，選擇群組標題置中)
function Header(props: GroupSwitchModalProps) {
    return (
        <View className="flex-row items-center mb-4 relative">
            {/* 左上叉叉 */}
            <TouchableOpacity onPress={props.onClose}>
                <Text className="text-gray-400 text-4xl px-2">×</Text>
            </TouchableOpacity>
            {/* 標題絕對置中 */}
            <View className="absolute inset-0 items-center justify-center">
                <Text className="text-lg font-bold">選擇群組</Text>
            </View>
        </View>
    );
}

export function GroupSwitchModal(props: GroupSwitchModalProps) {
    return (
        <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
            {/* 黑色遮罩，內容貼近底部 */}
            <View className="flex-1 bg-black/30">
                {/* 主內容區：最大高度為螢幕92%，圓角、白底、padding */}
                <View
                    className="bg-white pt-5 pb-6 px-3 w-full shadow-lg flex-1"
                    style={{
                        minHeight: 320,
                    }}
                >
                    {/* 標題列 */}
                    <Header {...props} />
                    {/* scrollable 群組清單，內容少時自然收縮，多時scroll */}
                    <FlatList
                        data={props.groups}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            // 群組卡片
                            <GroupCard
                                group={item}
                                isActive={item.id === props.activeGroupId}
                                onSelect={() => {
                                    props.onGroupSelect(item.id, item.name);
                                    props.onClose();
                                }}
                                onViewDetail={() => props.onViewDetail(item.id)}
                            />
                        )}
                        ListEmptyComponent={
                            <Text className="text-gray-400 text-center py-8">
                                暫無可選群組
                            </Text>
                        }
                        contentContainerStyle={{
                            paddingBottom: 12,
                            paddingTop: 2,
                            flexGrow: 0, // 內容區少時不會被強制拉高
                        }}
                        showsVerticalScrollIndicator={true}
                    />
                </View>
            </View>
        </Modal >
    );
}
