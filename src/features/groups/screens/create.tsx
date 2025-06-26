import ScreenWrapper from '@/components/ScreenWrapper'
import { useCreateGroupViewModel } from '@/features/groups/viewModel/useCreateGroupViewModel'
import { useState } from 'react'
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native'

export default function CreateGroupScreen() {
    const [name, setName] = useState('')
    const [type, setType] = useState<'longterm' | 'one-time'>('longterm')
    const [description, setDescription] = useState('')

    const { createGroup, isLoading, error } = useCreateGroupViewModel()

    return (
        <ScreenWrapper>
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
                        color={type === 'longterm' ? '#007AFF' : '#ccc'}
                        onPress={() => setType('longterm')}
                    />
                    <View className="w-4" />
                    <Button
                        title="一次性"
                        color={type === 'one-time' ? '#007AFF' : '#ccc'}
                        onPress={() => setType('one-time')}
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
                        onPress={() => createGroup(name, type, description)}
                    />
                )}
            </View>
        </ScreenWrapper>
    )
}