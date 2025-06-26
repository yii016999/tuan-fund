export const ROOT_ROUTES = {
  AUTH: 'Auth',
  APP: 'App',
} as const

export const AUTH_ROUTES = {
  LOGIN: 'Auth/Login',
  REGISTER: 'Auth/Register',
} as const

export const TAB_ROUTES = {
  HOME: 'Home',
  GROUPS: 'Groups',
  MEMBERS: 'Members',
} as const

export const APP_ROUTES = {
  TABS: 'App/Tabs',
} as const