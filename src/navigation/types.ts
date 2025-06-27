import { APP_ROUTES, AUTH_ROUTES, GROUPS_ROUTES, ROOT_ROUTES, TAB_ROUTES } from '@/constants/routes'
import { NavigatorScreenParams } from '@react-navigation/native'

export type RootStackParamList = {
    [ROOT_ROUTES.AUTH]: undefined
    [ROOT_ROUTES.APP]: undefined
}

export type AuthParamList = {
    [AUTH_ROUTES.LOGIN]: undefined
    [AUTH_ROUTES.REGISTER]: undefined
}

export type AppStackParamList = {
    // 傳遞指定要到Tab的哪個畫面
    [APP_ROUTES.TABS]: NavigatorScreenParams<TabParamList>
}

export type TabParamList = {
    [TAB_ROUTES.HOME]: undefined
    [TAB_ROUTES.GROUPS]: undefined
    [TAB_ROUTES.MEMBERS]: NavigatorScreenParams<MembersStackParamList>
}

export type GroupsStackParamList = {
    [GROUPS_ROUTES.LIST]: undefined
    [GROUPS_ROUTES.CREATE]: undefined
    [GROUPS_ROUTES.DETAIL]: { groupId: string }
}

export type MembersStackParamList = {
    // [MEMBERS_ROUTES.MEMBERS]: undefined
}
