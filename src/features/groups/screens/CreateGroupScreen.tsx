import { APP_ROUTES, TAB_ROUTES } from '@/constants/routes'
import { GROUP_TYPES, GroupType } from '@/constants/types'
import { useCreateGroupViewModel } from '@/features/groups/viewModel/useCreateGroupViewModel'
import { AppStackParamList } from '@/navigation/types'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useState } from 'react'
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native'

export default function CreateGroupScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()

    const [name, setName] = useState('')
    const [type, setType] = useState<GroupType>(GROUP_TYPES.LONG_TERM)
    const [description, setDescription] = useState('')

    const { createGroup, isLoading, error } = useCreateGroupViewModel()

    const handleCreateGroup = async () => {
        const success = await createGroup(name, type, description)
        if (success) {
            navigation.replace(APP_ROUTES.TABS, {
                screen: TAB_ROUTES.GROUPS,
            })
        }
    }
    return (
        <View className="flex-1 p-4 bg-white">
            <Text className="text-2xl font-bold mb-4">建立群組</Text>

            <Text className="text-base mb-1">群組名稱</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="請輸入群組名稱"
                className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
            />

            <Text className="text-base mb-1">群組類型</Text>
            <View className="flex-row mb-4">
                <Button
                    title="長期型"
                    color={type === GROUP_TYPES.LONG_TERM ? '#007AFF' : '#ccc'}
                    onPress={() => setType(GROUP_TYPES.LONG_TERM)}
                />
                <View className="w-4" />
                <Button
                    title="一次性"
                    color={type === GROUP_TYPES.ONE_TIME ? '#007AFF' : '#ccc'}
                    onPress={() => setType(GROUP_TYPES.ONE_TIME)}
                />
            </View>

            <Text className="text-base mb-1">群組描述</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="可填寫這個群組的用途"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-4 py-2 mb-6 text-base"
            />

            {!!error && <Text className="text-red-500 mb-4">{error}</Text>}
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <Button
                    title="建立群組"
                    onPress={handleCreateGroup}
                />
            )}
        </View>
    )
}