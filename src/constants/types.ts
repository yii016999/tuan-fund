export type HeaderBackType = 'arrow' | 'close'
export const HEADER_BACK_TYPES = {
  ARROW: 'arrow',
  CLOSE: 'close',
} as const

export type GroupType = 'long-term' | 'one-time'
export const GROUP_TYPES = {
  LONG_TERM: 'long-term',
  ONE_TIME: 'one-time',
} as const

export type GroupRole = 'admin' | 'member'
export const GROUP_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly'
export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
} as const

export type MemberRole = 'admin' | 'member'
export const MEMBER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const