export const COMMON = {
    ZH_TW: 'zh-TW',
    ANDROID: 'android',
    IOS: 'ios',
    COPY: '複製',
    CONFIRM: '確認',
    ERROR: '錯誤',
    LOADING: '載入中...',
    DOT: '•',
    SLASH: '/',
    COLON: ':',
    MONEY_SIGN: '$',
}

export const APP = {
    SLUG: 'tuanfund',
    NAME: '團體記帳',
}

export const TAB_NAVIGATOR = {
    HOME: '首頁',
    RECORDS: '記錄',
    TRANSACTION: '群組記帳',
    MEMBERS: '成員',
    SETTINGS: '設定',
}

export const LOGIN = {
    WELCOME: '歡迎回來',
    WELCOME_MESSAGE: '請登入您的帳號',
    LOGIN: '登入',
    REGISTER: '註冊',
    USERNAME: '帳號',
    PASSWORD: '密碼',
    USERNAME_PLACEHOLDER: '請輸入您的帳號',
    PASSWORD_PLACEHOLDER: '請輸入您的密碼',
    CREATE_ACCOUNT: '建立新帳號',
}

export const LOGIN_MESSAGES = {
    USER_NOT_EXIST: '使用者不存在',
}

export const REGISTER = {
    TITLE: '註冊',
    DISPLAY_NAME: '暱稱',
    USERNAME: '帳號',
    PASSWORD: '密碼',
    REGISTER: '註冊',
    RETURN_TO_LOGIN: '返回登入',
    MAIL_SUFFIX: '@tuanfund.com',
    CREATE_ACCOUNT: '建立新帳號',
    DISPLAY_INFO: '請填寫您的資料',
    DISPLAY_NAME_PLACEHOLDER: '請輸入您的暱稱',
    USERNAME_PLACEHOLDER: '請輸入您的帳號',
    PASSWORD_PLACEHOLDER: '請輸入您的密碼',
    PASSWORD_CONFIRM_PLACEHOLDER: '請再次輸入您的密碼',
}

export const RECORD = {
    TITLE: '記錄',
    CANCEL: '取消',
    DELETE: '刪除',
    SUCCESS: '成功',
    FAILURE: '失敗',
    DELETE_CONFIRM: '確認刪除',
    INCOME: '收入：',
    EXPENSE: '支出：',
    INCOME_SIGN: '+',
    EXPENSE_SIGN: '-',
    DATE_RANGE: '查詢範圍',
    GROUP_RECORDS: '群組收支',
    MEMBER_RECORDS: '個人繳費',
}

export const RECORD_MESSAGES = {
    DELETE_ALERT: (title: string) => `確定要刪除「${title}」嗎？此操作無法復原。`,
    DELETE_SUCCESS: '記錄已刪除',
    DELETE_FAILURE: '刪除失敗，請稍後再試',
    NO_RECORD: '暫無群組收支記錄',
    NO_GROUP: '請先選擇群組',
    NO_RECORD_SELECTED: '目前沒有群組收支記錄，請至記錄中選擇群組',
    NO_GROUP_SELECTED: '目前沒有群組資料，請至設定中選擇群組',
    NO_MEMBER_RECORD: '暫無個人繳費記錄',
    NO_MEMBER_RECORD_SELECTED: '目前沒有個人繳費記錄，新增收入記錄時會自動創建繳費記錄',
}

export const SETTINGS_GROUP_SWITCH = {
    TITLE: '選擇群組',
    TITLE_SELECT_GROUP: '選擇群組',
    TITLE_GROUP_MEMBERS: '群組成員',
    TYPE_LONG_TERM: '長期型',
    TYPE_ONE_TIME: '一次性',
    PERIOD_MONTHLY: '月繳',
    PERIOD_QUARTERLY: '季繳',
    PERIOD_YEARLY: '年繳',
    PREPAY: '可預繳',
    INVITE_CODE: '邀請碼',
    CURRENT_GROUP: '目前群組',
    COPY_INVITE_CODE: '複製邀請碼',
    COPY_FAILURE: '複製失敗',
    NO_GROUP: '暫無可選群組',
}

export const SETTINGS_GROUP_SWITCH_MESSAGES = {
    COPY_SUCCESS: '已將邀請碼複製到剪貼簿中',
    COPY_FAILURE: '複製失敗，請稍後再試',
    ERROR: '切換群組失敗',
}

export const SETTINGS_CREATE_GROUP = {
    TITLE: '建立群組',
    TITLE_CREATE_GROUP: '建立群組',
    TITLE_GROUP_MEMBERS: '群組成員',
    TYPE_LONG_TERM: '長期型',
    TYPE_ONE_TIME: '一次性',
    PERIOD_MONTHLY: '月繳',
    PERIOD_QUARTERLY: '季繳',
    PERIOD_YEARLY: '年繳',
    PREPAY: '可預繳',
    INVITE_CODE: '邀請碼',
    CURRENT_GROUP: '目前群組',
    COPY_INVITE_CODE: '複製邀請碼',
    COPY_FAILURE: '複製失敗',
    NO_GROUP: '暫無可選群組',
}

export const SETTINGS_NO_GROUP_SELECTED = {
    TITLE: '請先選擇群組',
    MESSAGE: '請先至「設定」切換主頁群組中選擇一個群組',
}
