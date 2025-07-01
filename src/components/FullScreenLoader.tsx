import { ActivityIndicator, Modal, View } from 'react-native'

interface FullScreenLoaderProps {
    visible: boolean
}

export default function FullScreenLoader(props: FullScreenLoaderProps) {
    return (
        <>
            <Modal visible={props.visible} transparent animationType="fade">
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </Modal>
        </>
    )
}