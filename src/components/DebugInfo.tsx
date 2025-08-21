import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';

interface DebugInfoProps {
  visible?: boolean;
}

export default function DebugInfo({ visible = false }: DebugInfoProps) {
  const { user, activeGroupId, joinedGroupIds } = useAuthStore();

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 50,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      borderRadius: 8,
      maxWidth: 300,
      zIndex: 9999,
    }}>
      <ScrollView>
        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
          🔍 Debug Info
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          User: {user?.uid ? '✅' : '❌'}
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          ActiveGroup: {activeGroupId ? '✅' : '❌'}
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          JoinedGroups: {joinedGroupIds.length}
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          ActiveGroupId: {activeGroupId || 'null'}
        </Text>
      </ScrollView>
    </View>
  );
}
