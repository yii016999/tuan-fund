import { MemberInfo } from '@/features/members/viewModel/useMembersViewModel'
import { FlatList, Image, Text, View } from 'react-native'

interface MembersListProps {
    members: MemberInfo[]
}

// 成員列表
export function MembersList({ members }: MembersListProps) {
    return (
        <View className="flex-1 bg-white px-4 py-4">
            <Text className="text-lg font-bold mb-4">成員列表</Text>
            <FlatList
                data={members}
                keyExtractor={item => item.uid}
                renderItem={({ item }) => (
                    <View className="flex-row items-center mb-2">
                        {item.avatarUrl && (
                            <Image source={{ uri: item.avatarUrl }} className="w-8 h-8 rounded-full mr-2" />
                        )}
                        <Text className="font-medium">{item.displayName}</Text>
                        <Text className="ml-2 text-gray-500 text-xs">{item.email}</Text>
                        {item.role === 'admin' && <Text className="ml-2 text-blue-500 text-xs">(管理員)</Text>}
                    </View>
                )}
            />
        </View>
    )
}