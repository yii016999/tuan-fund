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

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'unlimited'
export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const

export type MemberRole = 'admin' | 'member'
export const MEMBER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type RecordType = 'group-transaction' | 'member-payment'
export const RECORD_TYPES = {
  GROUP_TRANSACTION: 'group-transaction',
  MEMBER_PAYMENT: 'member-payment',
} as const

export type RecordTabType = 'group' | 'member'
export const RECORD_TAB_TYPES = {
  GROUP: 'group',
  MEMBER: 'member',
} as const

export type RecordTransactionType = 'income' | 'expense'
export const RECORD_TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export type RecordStatus = 'paid' | 'pending' | 'overdue'
export const RECORD_STATUSES = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const

export type RecordPermission = 'canEdit' | 'canDelete'
export const RECORD_PERMISSIONS = {
  CAN_EDIT: 'canEdit',
  CAN_DELETE: 'canDelete',
} as const

export type CreateGroupTabType = 'create' | 'join'
export const CREATE_GROUP_TAB_TYPES = {
  CREATE: 'create',
  JOIN: 'join',
} as const