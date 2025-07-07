import { SETTINGS_GROUP_SWITCH } from '@/constants/string';
import CreateGroupModal from '@/features/settings/components/CreateGroupModal';
import JoinGroupModal from '@/features/settings/components/JoinGroupModal';
import { GroupSwitchModal } from '@/features/settings/components/GroupSwitchModal';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSettingsViewModel } from '../viewmodel/useSettingsViewModel';

export default function SettingsScreen() {
    const {
        groups,
        currentGroupName,
        activeGroupId,
        loading,
        switchGroup,
        user,
        userLogout,
        loadUserGroups,
        fetchGroups,
        leaveCurrentGroup,
        deleteGroup,
    } = useSettingsViewModel();

    const [modalVisible, setModalVisible] = useState(false);
    const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
    const [joinGroupModalVisible, setJoinGroupModalVisible] = useState(false);

    // 頁面進入時重新獲取群組資料
    useFocusEffect(
        useCallback(() => {
            fetchGroups()
        }, [fetchGroups])
    );

    // 點選上傳頭像
    const handleAvatarPress = () => {
        // TODO: 打開圖片選擇器，選完上傳至 server/firebase
        // 這裡先留 TODO
    };

    // 點選添加群組
    const handleAddGroup = () => {
        setCreateGroupModalVisible(true);
    };

    // 點選加入現有群組
    const handleJoinGroup = () => {
        setJoinGroupModalVisible(true);
    };

    // 渲染個人資料區塊
    const renderUserProfileSection = () => (
        <View className="bg-white mx-4 mt-6 rounded-2xl shadow-md">
            <View className="p-4 flex-row items-center">
                <TouchableOpacity onPress={handleAvatarPress}>
                    <Image
                        source={
                            user?.avatarUrl
                                ? { uri: user.avatarUrl }
                                : require('../../../../assets/images/avatar-default.png') // 預設頭像圖
                        }
                        className="w-16 h-16 rounded-full border border-gray-300"
                    />
                </TouchableOpacity>
                <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold">{user?.displayName || ''}</Text>
                    <Text className="text-gray-500 text-xs">{user?.email}</Text>
                    <Text className="text-gray-700 text-sm mt-1">
                        {SETTINGS_GROUP_SWITCH.CURRENT_GROUP_INFO}
                        {currentGroupName || '尚未選擇群組'}
                    </Text>
                </View>
            </View>
            
            {/* 退出群組按鈕 - 只有在有 activeGroupId 時才顯示 */}
            {activeGroupId && (
                <View className="border-t border-gray-100">
                    <TouchableOpacity
                        className="px-4 py-2 active:bg-gray-50"
                        onPress={leaveCurrentGroup}
                    >
                        <Text className="text-center font-medium text-orange-600">
                            退出當前群組
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    // 渲染切換群組卡片
    const renderGroupSwitchCard = () => (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl shadow-md active:scale-95"
            onPress={() => setModalVisible(true)}
            style={{ transform: [{ scale: 1 }] }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View>
                        <Text className="text-base font-semibold text-gray-800">{SETTINGS_GROUP_SWITCH.SWITCH_GROUP_TITLE}</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm font-medium mr-2">{groups.length} {SETTINGS_GROUP_SWITCH.GROUPS_COUNT}</Text>
                    <Text className="text-gray-400">›</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // 渲染添加群組卡片
    const renderAddGroupCard = () => (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl shadow-md active:scale-95"
            onPress={handleAddGroup}
            style={{ transform: [{ scale: 1 }] }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View>
                        <Text className="text-base font-semibold text-gray-800">{SETTINGS_GROUP_SWITCH.ADD_GROUP_TITLE}</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm mr-2">{SETTINGS_GROUP_SWITCH.ADD_GROUP_BUTTON}</Text>
                    <Text className="text-gray-400">›</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // 渲染加入群組卡片
    const renderJoinGroupCard = () => (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl shadow-md active:scale-95"
            onPress={handleJoinGroup}
            style={{ transform: [{ scale: 1 }] }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View>
                        <Text className="text-base font-semibold text-gray-800">{SETTINGS_GROUP_SWITCH.JOIN_GROUP_TITLE}</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm mr-2">{SETTINGS_GROUP_SWITCH.JOIN_GROUP_BUTTON}</Text>
                    <Text className="text-gray-400">›</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // 渲染退出群組卡片
    const renderLeaveGroupCard = () => (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl shadow-md border border-orange-100 active:scale-95"
            onPress={leaveCurrentGroup}
            style={{ transform: [{ scale: 1 }] }}
            disabled={!activeGroupId}
        >
            <View className="flex-row items-center justify-center">
                <Text className="text-orange-600 font-semibold text-base">
                    {activeGroupId ? '退出當前群組' : '無群組可退出'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // 渲染登出區塊
    const renderLogoutSection = () => (
        <View className="mt-auto mb-8 mx-4">
            <TouchableOpacity
                className="bg-white p-4 rounded-2xl shadow-md border border-red-100 active:scale-95"
                onPress={userLogout}
                style={{ transform: [{ scale: 1 }] }}
            >
                <View className="flex-row items-center justify-center">
                    <Text className="text-red-600 font-semibold text-base">{SETTINGS_GROUP_SWITCH.LOGOUT_TITLE}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const handleGroupModalSuccess = () => {
        // 重新載入群組資料
        loadUserGroups()
        // 或者調用 ViewModel 的刷新方法
        // refreshData()
    }

    // 處理刪除群組
    const handleDeleteGroup = useCallback(async (groupId: string) => {
        await deleteGroup(groupId, () => setModalVisible(false))
    }, [deleteGroup])

    return (
        <View className="flex-1 bg-gray-100">
            {/* --- 個人資料區塊 --- */}
            {renderUserProfileSection()}

            {/* --- 設定選項區塊 --- */}
            <View className="flex-col gap-3 mt-8 mx-4">
                {/* 切換群組卡片 */}
                {renderGroupSwitchCard()}

                {/* 添加群組卡片 */}
                {renderAddGroupCard()}

                {/* 加入群組卡片 */}
                {renderJoinGroupCard()}
            </View>

            {/* --- 登出區塊（固定在底部） --- */}
            {renderLogoutSection()}

            {/* --- 群組切換 Modal --- */}
            <GroupSwitchModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                groups={groups}
                activeGroupId={activeGroupId || ''}
                onGroupSelect={switchGroup}
                isLoading={loading}
                onGroupDelete={handleDeleteGroup}
            />

            {/* --- 建立群組 Modal --- */}
            <CreateGroupModal
                visible={createGroupModalVisible}
                onClose={() => setCreateGroupModalVisible(false)}
                onSuccess={handleGroupModalSuccess}
            />

            {/* --- 加入群組 Modal --- */}
            <JoinGroupModal
                visible={joinGroupModalVisible}
                onClose={() => setJoinGroupModalVisible(false)}
                onSuccess={handleGroupModalSuccess}
            />
        </View>
    );
}