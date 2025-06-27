import { ActivityIndicator, Modal, StatusBar, View } from 'react-native'

type Props = {
    visible: boolean
}

export default function FullScreenLoader({ visible }: Props) {
    return (
        <>
            <Modal visible={visible} transparent animationType="fade">
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </Modal>
        </>
    )
}