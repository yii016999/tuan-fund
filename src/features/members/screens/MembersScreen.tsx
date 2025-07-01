import { useMembersViewModel } from "@/features/members/viewModel/useMembersViewModel"
import { useAuthStore } from "@/store/useAuthStore"
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native"

export default function MembersScreen() {
  const activeGroupId = useAuthStore((s) => s.activeGroupId)
  const { members, loading, error } = useMembersViewModel(activeGroupId ?? "")

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>載入成員中...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 px-4 pt-8 bg-white">
      <Text className="text-xl font-bold mb-4">成員列表</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-4">
            {item.avatarUrl && (
              <Image source={{ uri: item.avatarUrl }} className="w-10 h-10 rounded-full mr-3" />
            )}
            <View>
              <Text className="text-base font-medium">{item.displayName}</Text>
              <Text className="text-xs text-gray-500">{item.email}</Text>
            </View>
            {item.role === "admin" && (
              <Text className="ml-3 text-blue-600 text-xs font-bold">管理員</Text>
            )}
          </View>
        )}
      />
    </View>
  )
}