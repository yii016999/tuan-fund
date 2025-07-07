/** Common */
export const COMMON = {
    ZH_TW: 'zh-TW',
    ANDROID: 'android',
    IOS: 'ios',
    COPY: '複製',
    CONFIRM: '確認',
    ERROR: '錯誤',
    LOADING: '載入中...',
    SUCCESS: '成功',
    DOT: '•',
    SLASH: '/',
    COLON: ':',
    MONEY_SIGN: '$',
    OK_SIGN: '✓',
    NOT_OK_SIGN: '✗',
    INCOME_SIGN: '+',
    EXPENSE_SIGN: '-',
    DASH: '-',
    DAYS: '天',
    MONTHS: '個月',
    YEARS: '年',
    CANCEL: '取消',
    QUESTION: '嗎',
    QUESTION_MARK: '？',
    ADD_SUCCESS: '新增成功',
}

/** App */
export const APP = {
    SLUG: 'tuanfund',
    NAME: '團體記帳',
}

/** TabNavigator */
export const TAB_NAVIGATOR = {
    HOME: '首頁',
    RECORDS: '記錄',
    TRANSACTION: '群組記帳',
    MEMBERS: '成員',
    SETTINGS: '設定',
}

/** Login */
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

/** Register */
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

/** Home */
export const HOME = {
    TITLE: '首頁',
    LOADING_ERROR: '載入失敗：',
    REFRESH: '重試',
    NO_DATA: '暫無數據',
    BALANCE_CHART_TITLE: '年度餘額趨勢',
}

/** Record */
export const RECORD = {
    TITLE: '記錄',
    CANCEL: '取消',
    DELETE: '刪除',
    SUCCESS: '成功',
    FAILURE: '失敗',
    PAYMENT: '繳費',
    DELETE_CONFIRM: '確認刪除',
    INCOME: '收入：',
    EXPENSE: '支出：',
    RECORDS_COUNT: '共',
    RECORDS_COUNT_INFO: '筆記錄',
    DATE_RANGE: '查詢範圍',
    GROUP_RECORDS: '群組收支',
    MEMBER_RECORDS: '個人繳費',
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

/** Transaction */
export const TRANSACTION = {
    TITLE: '群組記帳',
    INCOME: '收入',
    EXPENSE: '支出',
    PAYMENT_DESCRIPTION: '繳費',
    ADD_INCOME: '新增收入',
    ADD_EXPENSE: '新增支出',
    INCOME_OR_EXPENSE: '收入或支出',
    ITEM_TITLE: '項目標題',
    ITEM_TITLE_PLACEHOLDER: 'ex.某某款項...',
    AMOUNT: '金額',
    DESCRIPTION: '備註 (選填)',
    DESCRIPTION_PLACEHOLDER: '輸入備註',
    ERROR_MESSAGE_CREATE_TRANSACTION: '新增交易失敗',
    ERROR_PLEASE_INPUT_VALID_AMOUNT: '請輸入有效金額',
    ERROR_PLEASE_INPUT_ITEM_TITLE: '請輸入項目標題',
}

/** Members */
export const MEMBERS = {
    TITLE: '成員',
    CURRENT_MEMBER: '我',
    ADMIN: '管理員',
    JOINED_AT: '加入時間：',
    REMOVE: '移除',
    PAYMENT_STATUS: '繳費狀態',
    PAID: '已繳費',
    UNPAID: '未繳費',
    CURRENT_MONTH_AMOUNT: '本月金額：',
    LATEST_PAYMENT_DATE: '最近繳費：',
    STATISTICS: '統計資料',
    TOTAL_PAID_AMOUNT: '累計金額：',
    TOTAL_PAYMENT_COUNT: '繳費次數：',
    TIMES: '次',
    REFRESH: '更新',
    CONFIRM_REMOVE_MEMBER: '確認移除成員',
    CONFIRM_REMOVE_MEMBER_MESSAGE: '確定要移除',
    MEMBERS_COUNT: '群組成員',
    NO_MEMBERS: '目前沒有成員',
    GROUP_ERROR: '群組不存在',
    MEMBER_ERROR: '成員不存在',
    ERROR_LOADING_MEMBERS: '載入成員列表失敗',
    ERROR_FETCHING_MEMBERS: '載入成員資料失敗：',
    ERROR_FETCHING_MEMBER_DETAILS: '載入成員詳細資料失敗：',
    ERROR_FETCHING_PAYMENT_STATUS: '載入成員繳費狀態失敗：',
    ERROR_FETCHING_STATISTICS: '載入成員統計資料失敗：',
    ERROR_REMOVING_MEMBER: '移除成員失敗：',
    ERROR_FETCHING_INVITE_CODE: '載入群組邀請碼失敗：',
    ERROR_FETCHING_USER_ROLE: '載入使用者權限失敗：',
    NO_PERMISSION_REMOVE_MEMBER: '沒有權限移除成員',
    ERROR_REMOVING_SELF: '不能移除自己',
    SUCCESS_REMOVE_MEMBER: '成員已被移除',
    ERROR_REMOVING_MEMBER_INFO: '移除成員失敗，請稍後再試',
    INVITE_CODE_TITLE: '邀請碼',
    INVITE_CODE_MESSAGE: '群組邀請碼：',
    INVITE_CODE_INFO: '知道了',
}

/** Settings */
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
    CURRENT_GROUP_INFO: '目前群組：',
    COPY_INVITE_CODE: '複製邀請碼',
    COPY_FAILURE: '複製失敗',
    NO_GROUP: '暫無可選群組',
    COPY_SUCCESS_MESSAGE: '已將邀請碼複製到剪貼簿中',
    COPY_FAILURE_MESSAGE: '複製失敗，請稍後再試',
    SWITCH_GROUP_TITLE: '切換主頁群組',
    JOIN_GROUP_TITLE: '加入現有群組',
    ERROR_MESSAGE: '切換群組失敗',
    GROUPS_COUNT: '個群組',
    ADD_GROUP_TITLE: '建立新群組',
    ADD_GROUP_BUTTON: '新增',
    JOIN_GROUP_BUTTON: '加入',
    LOGOUT_TITLE: '登出帳戶',
    ERROR_MESSAGE_CREATE_GROUP: '建立群組失敗',
    ERROR_MESSAGE_JOIN_GROUP: '加入群組失敗',
    ERROR_MESSAGE_JOIN_GROUP_INFO: '加入群組失敗，請檢查邀請碼是否正確',
    ERROR_MESSAGE_JOIN_GROUP_ALREADY_JOINED: '您已經是此群組的成員',
}

/** BalanceChart */
export const BALANCE_CHART = {
    TITLE: '年度餘額趨勢',
    CURRENT_BALANCE: '當前餘額:',
}

/** PaymentStatusCard */
export const PAYMENT_STATUS_CARD = {
    TITLE: '本期繳費狀態',
    PAID: '已繳費',
    UNPAID: '未繳費',
}

/** TransactionOverviewCard */
export const TRANSACTION_OVERVIEW_CARD = {
    TITLE: '收支總覽',
    MONTHLY_INCOME: '本月收入',
    MONTHLY_EXPENSE: '本月支出',
}

/** CreateGroup */
export const SETTINGS_CREATE_GROUP = {
    TITLE: '建立群組',
    TITLE_CREATE_GROUP: '建立群組',
    TITLE_JOIN_GROUP: '加入群組',
    TITLE_GROUP_MEMBERS: '群組成員',
    GROUP_TYPE: '群組類型',
    GROUP_NAME: '群組名稱',
    GROUP_NAME_NOTICE: '請輸入群組名稱',
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
    ENABLE_MONTHLY_PAYMENT: '啟用固定繳費制度',
    ENABLE_MONTHLY_PAYMENT_INFO: '是否需固定繳費',
    MONTHLY_AMOUNT: '繳費金額',
    MONTHLY_AMOUNT_NOTICE: '請輸入繳費金額',
    BILLING_CYCLE: '繳費週期',
    BILLING_CYCLE_NOTICE: '請選擇繳費週期',
    PREPAY_NOTICE: '成員可提前繳費',
    FIXED_PAYMENT_SYSTEM_ENABLED: '💡 固定繳費制度已啟用',
    FIXED_PAYMENT_SYSTEM_NOTICE: '每位成員需要按照設定的週期繳費',
    JOIN_GROUP_NOTICE: '請輸入群組邀請碼',
    JOIN_GROUP_NOTICE_INFO: '💡 邀請碼由群組管理員提供，格式為 6-8 位英數字組合。',
    GROUP_DESCRIPTION: '群組描述',
    GROUP_DESCRIPTION_NOTICE: '可填寫這個群組的用途',
    CREATE_GROUP_SUCCESS: '群組已建立',
    CREATE_GROUP_FAILURE: '建立群組失敗',
    JOIN_GROUP_SUCCESS: '群組已加入',
    JOIN_GROUP_FAILURE: '加入群組失敗',
    JOIN_GROUP_FAILURE_INFO: '加入群組失敗，請檢查邀請碼是否正確',
}

/** NoGroupSelected */
export const SETTINGS_NO_GROUP_SELECTED = {
    TITLE: '請先選擇群組',
    MESSAGE: '請先至「設定」切換主頁群組中選擇一個群組',
    NO_GROUP_TITLE: '沒有加入群組',
    NO_GROUP_MESSAGE: '請先至「設定」建立或加入一個群組',
}
