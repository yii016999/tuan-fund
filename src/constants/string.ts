export const COMMON = {
    ZH_TW: 'zh-TW',
    LOADING: '載入中...',
}

export const TAB_NAVIGATOR = {
    HOME: '首頁',
    RECORDS: '記錄',
    TRANSACTION: '記帳',
    MEMBERS: '成員',
    SETTINGS: '設定',
}

export const REGISTER = {
    TITLE: '註冊',
    DISPLAY_NAME: '暱稱',
    USERNAME: '帳號',
    PASSWORD: '密碼',
    REGISTER: '註冊',
    RETURN_TO_LOGIN: '返回登入',
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
