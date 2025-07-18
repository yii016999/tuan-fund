/** UI 相關常數 */
export const UI = {
  DEBOUNCE_DELAY: 300,
  MODAL_MAX_HEIGHT_RATIO: 0.7,
  PICKER_HEIGHT_RATIO: 0.4,
  MODAL_WIDTH: '90%',
  DESCRIPTION_INPUT_HEIGHT: 88,
  SCROLL_PADDING_BOTTOM: 40,
  DEFAULT_YEAR_RANGE: 3,
  DEFAULT_GROUP_MONTHLY_AMOUNT: 2000,

  // 記錄相關常數
  RECORDS_QUERY_LIMIT: 1000,
  DATE_RANGE_YEARS_LIMIT: 3,
  CALENDAR_FUTURE_YEARS: 1,
  CALENDAR_PAST_YEARS: 5,

  // 預繳相關常數
  PREPAYMENT: {
    YEAR_START_INDEX: 0,
    YEAR_END_INDEX: 4,
    MONTH_START_INDEX: 4,
    MONTH_END_INDEX: 6,
    FIRESTORE_RANGE_SUFFIX: '\uf8ff',
  },

  // 成員相關常數
  MEMBER: {
    AVATAR_SIZE: 48,
    AVATAR_PLACEHOLDER_SIZE: 16,
    MODAL_BORDER_RADIUS: 12,
    MODAL_PADDING: 24,
    PAYMENT_STATUS_ICON_SIZE: 64,
    REFRESH_DEBOUNCE_DELAY: 1000,
  },

  // 時間計算常數
  TIME: {
    MS_PER_DAY: 24 * 60 * 60 * 1000,
    DAYS_PER_WEEK: 7,
    MONTHS_PER_YEAR: 12,
  },

  // 首頁相關常數
  HOME: {
    CHART_HEIGHT_RATIO: 0.45,
    CARD_HEIGHT_RATIO: 0.4,
    SCREEN_PADDING: 16,
    CARD_GAP: 16,
    RECENT_TRANSACTIONS_LIMIT: 5,
    TRANSACTION_QUERY_LIMIT: 50,
    EXPANDED_QUERY_MONTHS: 3,
    CHART_SEGMENTS: 4,
    CHART_DOT_RADIUS: 4,
    CHART_STROKE_WIDTH: 3,
    CHART_MARGIN_LEFT: -32,
    CHART_MARGIN_VERTICAL: 8,
    CHART_BORDER_RADIUS: 16,
    BALANCE_DECIMAL_PLACES: 0,
    EARLIEST_YEAR_FALLBACK: 2020,
    SCREEN_OFFSET: 250,
  },
} as const

/** 驗證相關常數 */
export const VALIDATION = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
  PREPAYMENT_DATE_PATTERN: /^\d{6}$/,

  // 成員相關驗證
  MEMBER: {
    MIN_CUSTOM_AMOUNT: 0,
    MAX_CUSTOM_AMOUNT: 999999,
    MAX_DISPLAY_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
  },
} as const

/** 樣式相關常數 */
export const STYLES = {
  SHADOW: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },

  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    FULL: 9999,
  },

  RECORD_ITEM: {
    MARGIN_HORIZONTAL: 16,
    MARGIN_BOTTOM: 12,
    PADDING: 16,
    ICON_SIZE: 16,
    ICON_CONTAINER_SIZE: 32,
  },

  MEMBER: {
    AVATAR_SIZE: 48,
    AVATAR_PLACEHOLDER_SIZE: 16,
    BADGE_BORDER_RADIUS: 12,
    BUTTON_BORDER_RADIUS: 20,
    MODAL_BORDER_RADIUS: 12,
    MODAL_PADDING: 24,
    PAYMENT_STATUS_ICON_SIZE: 64,
  },

  // 首頁相關樣式
  HOME: {
    CHART_BORDER_RADIUS: 16,
    CARD_BORDER_RADIUS: 12,
    CARD_PADDING: 16,
    NAVIGATION_BUTTON_SIZE: 32,
    BALANCE_ICON_SIZE: 64,
    TRANSACTION_ITEM_PADDING: 8,
  },

  // 交易相關樣式
  TRANSACTION: {
    CALENDAR_SHADOW: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    SWITCH_SHADOW: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    SWITCH_WIDTH: 48,
    SWITCH_HEIGHT: 24,
    SWITCH_THUMB_SIZE: 20,
    RADIO_SIZE: 20,
    RADIO_INNER_SIZE: 8,
  },
} as const

/** 顏色相關常數 */
export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',

  // 收支顏色
  INCOME: '#10B981',
  EXPENSE: '#EF4444',

  // 灰階
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 日曆相關顏色 (重新添加)
  CALENDAR: {
    TODAY: '#EF4444',
    SELECTED: '#3B82F6',
    SELECTED_END: '#10B981',
    RANGE: '#E5E7EB',
    RANGE_TEXT: '#374151',
    DISABLED: '#D1D5DB',
  },

  // 成員相關顏色
  MEMBER: {
    CURRENT_BADGE_BG: '#DBEAFE',
    CURRENT_BADGE_TEXT: '#1D4ED8',
    ADMIN_BADGE_BG: '#FED7AA',
    ADMIN_BADGE_TEXT: '#C2410C',
    PAID_BADGE_BG: '#D1FAE5',
    PAID_BADGE_TEXT: '#065F46',
    UNPAID_BADGE_BG: '#FEE2E2',
    UNPAID_BADGE_TEXT: '#991B1B',
    PAYMENT_STATUS_BG: '#F9FAFB',
    STATISTICS_BG: '#EFF6FF',
  },

  // 首頁相關顏色
  HOME: {
    CHART_LINE: '#3B82F6',
    CHART_BACKGROUND: '#FFFFFF',
    CARD_BACKGROUND: '#FFFFFF',
    CARD_BORDER: '#F3F4F6',
    NAVIGATION_BUTTON_ACTIVE: '#3B82F6',
    NAVIGATION_BUTTON_DISABLED: '#D1D5DB',
    BALANCE_POSITIVE: '#10B981',
    BALANCE_NEGATIVE: '#EF4444',
    PAYMENT_STATUS_PAID: '#10B981',
    PAYMENT_STATUS_UNPAID: '#EF4444',
  },
} as const 