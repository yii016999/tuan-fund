export const COLLECTIONS = {
    USERS: 'users',
    GROUPS: 'groups',
    PAYMENTS: 'groupPayments',
    MEMBERS: 'members',
}

export const DOCUMENTS = {
    TRANSACTIONS: 'transactions',
    MEMBER_PAYMENTS: 'memberPayments',
    GROUP_PAYMENT: 'groupPayment',
}

export const GROUP_ROLE_FIELD = (userId: string) => `roles.${userId}`
export const GROUP_JOINED_AT_FIELD = (userId: string) => `memberJoinedAt.${userId}`

export const COLUMNS = {
    TYPE: 'type',
    AMOUNT: 'amount',
    DATE: 'date',
    JOINED_AT: 'joinedAt',
    ROLE: 'role',
    DESCRIPTION: 'description',
    GROUP_ID: 'groupId',
    USER_ID: 'userId',
    MEMBER_ID: 'memberId',
    PAYMENT_DATE: 'paymentDate',
    BILLING_MONTH: 'billingMonth',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    INVITE_CODE: 'inviteCode',
}

export const DATE = {
  START_OF_MONTH: '01',
  END_OF_MONTH: '31',
}

export const QUERIES = {
    WHERE: 'where',
    EQUALS: '==',
    AND: 'and',
    OR: 'or',
    NOT: 'not',
    IN: 'in',
    NOT_IN: 'notIn',
    ASC: 'asc',
    DESC: 'desc',
    SLASH: '/',
    GREATER_THAN_OR_EQUAL_TO: '>=',
    LESS_THAN_OR_EQUAL_TO: '<=',
}