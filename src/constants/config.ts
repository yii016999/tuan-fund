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
  
  // 刪除相關常數
  DELETE: {
    BATCH_SIZE: 100, // 批次刪除大小
    RETRY_COUNT: 3,  // 重試次數
  },
} as const

/** 驗證相關常數 */
export const VALIDATION = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
  PREPAYMENT_DATE_PATTERN: /^\d{6}$/,
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
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  // 組件特定樣式
  RECORD_ITEM: {
    MARGIN_HORIZONTAL: 16,
    MARGIN_BOTTOM: 12,
    PADDING: 16,
    ICON_SIZE: 16,
    ICON_CONTAINER_SIZE: 32,
  },
} as const

/** 顏色相關常數 */
export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
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
  // 語意化顏色
  INCOME: '#10B981',
  EXPENSE: '#EF4444',
  CALENDAR: {
    TODAY: '#EF4444',
    SELECTED: '#3B82F6',
    SELECTED_END: '#10B981',
    RANGE: '#E5E7EB',
    RANGE_TEXT: '#374151',
    DISABLED: '#d3d3d3',
  },
} as const 