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

export const COLUMNS = {
    TYPE: 'type',
    AMOUNT: 'amount',
    DATE: 'date',
    DESCRIPTION: 'description',
    GROUP_ID: 'groupId',
    USER_ID: 'userId',
    MEMBER_ID: 'memberId',
    BILLING_MONTH: 'billingMonth',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
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