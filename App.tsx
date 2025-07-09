import '@/config/firebase';
import RootNavigator from '@/navigation/RootNavigator';
import 'react-native-gesture-handler';
import './global.css';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    return (
        <>
            <StatusBar style="dark" />
            <RootNavigator />
        </>
    )
}
