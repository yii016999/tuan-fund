import { APP_ROUTES, AUTH_ROUTES, ROOT_ROUTES, TAB_ROUTES } from '@/constants/routes'

export type RootStackParamList = {
    [ROOT_ROUTES.AUTH]: undefined
    [ROOT_ROUTES.APP]: undefined
}

export type AuthParamList = {
    [AUTH_ROUTES.LOGIN]: undefined
    [AUTH_ROUTES.REGISTER]: undefined
}

export type AppStackParamList = {
    [APP_ROUTES.TABS]: undefined
}

export type TabParamList = {
    [TAB_ROUTES.HOME]: undefined
    [TAB_ROUTES.GROUPS]: undefined
    [TAB_ROUTES.MEMBERS]: undefined
}

