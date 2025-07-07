import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
    showBorder?: boolean;
}
// 專門給全螢幕的modal使用的header
export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, showBorder = true }) => {
    return (
        <View className={`flex-row items-center mb-4 relative ${showBorder ? 'border-b border-gray-200 pb-4' : ''}`}>
            {/* 左上叉叉 */}
            <TouchableOpacity onPress={onClose}>
                <Text className="text-gray-400 text-4xl px-2">×</Text>
            </TouchableOpacity>
            
            {/* 標題絕對置中 */}
            <View className="absolute inset-0 items-center justify-center">
                <Text className="text-lg font-bold">{title}</Text>
            </View>
        </View>
    );
};
