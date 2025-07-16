/** UI 相關常數 */
export const UI = {
  DEBOUNCE_DELAY: 300,
  MODAL_MAX_HEIGHT_RATIO: 0.7,
  PICKER_HEIGHT_RATIO: 0.4,
  MODAL_WIDTH: '90%',
  DESCRIPTION_INPUT_HEIGHT: 88,
  SCROLL_PADDING_BOTTOM: 40,
  DEFAULT_YEAR_RANGE: 3,
  DEFAULT_GROUP_MONTHLY_AMOUNT: 2000, // 群組預設月繳金額
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
} as const 