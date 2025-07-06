import CreateGroupModal from '@/features/settings/components/CreateGroupModal';
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
    } = useSettingsViewModel();

    const [modalVisible, setModalVisible] = useState(false);
    const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
    const [initialTab, setInitialTab] = useState<'create' | 'join'>('create');

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
        setInitialTab('create');
        setCreateGroupModalVisible(true);
    };

    // 點選加入現有群組
    const handleJoinGroup = () => {
        setInitialTab('join');
        setCreateGroupModalVisible(true);
    };

    // 渲染個人資料區塊
    const renderUserProfileSection = () => (
        <View className="bg-white mx-4 mt-6 p-4 rounded-2xl flex-row items-center shadow-md">
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
                <Text className="text-lg font-bold">{user?.displayName || '(未命名)'}</Text>
                <Text className="text-gray-500 text-xs">{user?.email}</Text>
                <Text className="text-gray-700 text-sm mt-1">目前群組：{currentGroupName || '(無)'}</Text>
            </View>
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
                        <Text className="text-base font-semibold text-gray-800">切換主頁群組</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm font-medium mr-2">{groups.length} 個群組</Text>
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
                        <Text className="text-base font-semibold text-gray-800">建立新群組</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm mr-2">新增</Text>
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
                        <Text className="text-base font-semibold text-gray-800">加入現有群組</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 text-sm mr-2">加入</Text>
                    <Text className="text-gray-400">›</Text>
                </View>
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
                    <Text className="text-red-600 font-semibold text-base">登出帳戶</Text>
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
            />

            {/* --- 建立群組 Modal --- */}
            <CreateGroupModal
                visible={createGroupModalVisible}
                onClose={() => setCreateGroupModalVisible(false)}
                onSuccess={handleGroupModalSuccess}
                initialTab={initialTab}
            />
        </View>
    );
}