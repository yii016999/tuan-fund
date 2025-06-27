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
  MEMBERS: 'Members',
  GROUPS: 'Groups',
} as const

export const APP_ROUTES = {
  TABS: 'App/Tabs',
} as const

export const GROUPS_ROUTES = {
  LIST: 'GroupList',
  CREATE: 'CreateGroup',
  DETAIL: 'GroupDetail',
} as const

export const MEMBERS_ROUTES = {
} as const