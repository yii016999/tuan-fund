import { COMMON, TRANSACTION } from '@/constants/string'
import { MEMBER_ROLES, PREPAYMENT_START_TYPES, PrepaymentStartType, RECORD_TRANSACTION_TYPES, RecordTransactionType } from '@/constants/types'
import { mapFirebaseError } from '@/utils/firebaseErrorMapper'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { Alert } from 'react-native'
import { useAuthStore } from '../../../store/useAuthStore'
import { MemberService } from '../../members/services/MemberService'
import { CreateTransactionInput, TransactionError } from '../model/Transaction'
import { TransactionService } from '../services/TransactionService'
import { UI } from '@/constants/config'
import { useDebounce } from '@/hooks/useDebounce'

// 狀態介面
interface TransactionState {
  activeTab: RecordTransactionType
  amount: string
  selectedDate: string
  title: string
  description: string
  titleFocus: boolean
  amountFocus: boolean
  isLoading: boolean
  isAdmin: boolean
  roleLoading: boolean
  isPrepayment: boolean
  allowPrepayment: boolean
  prepaymentMonths: number
  prepaymentStartType: PrepaymentStartType
  prepaymentCustomDate: string
  showDatePicker: boolean
}

// 動作類型
type TransactionAction =
  | { type: 'SET_ACTIVE_TAB'; payload: RecordTransactionType }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_TITLE_FOCUS'; payload: boolean }
  | { type: 'SET_AMOUNT_FOCUS'; payload: boolean }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_IS_ADMIN'; payload: boolean }
  | { type: 'SET_ROLE_LOADING'; payload: boolean }
  | { type: 'SET_IS_PREPAYMENT'; payload: boolean }
  | { type: 'SET_ALLOW_PREPAYMENT'; payload: boolean }
  | { type: 'SET_PREPAYMENT_MONTHS'; payload: number }
  | { type: 'SET_PREPAYMENT_START_TYPE'; payload: PrepaymentStartType }
  | { type: 'SET_PREPAYMENT_CUSTOM_DATE'; payload: string }
  | { type: 'SET_SHOW_DATE_PICKER'; payload: boolean }
  | { type: 'RESET_FORM' }

// 初始狀態
const initialState: TransactionState = {
  activeTab: RECORD_TRANSACTION_TYPES.INCOME,
  amount: '0',
  selectedDate: new Date().toISOString().split('T')[0],
  title: '',
  description: '',
  titleFocus: false,
  amountFocus: false,
  isLoading: false,
  isAdmin: false,
  roleLoading: true,
  isPrepayment: false,
  allowPrepayment: false,
  prepaymentMonths: 0,
  prepaymentStartType: PREPAYMENT_START_TYPES.CURRENT,
  prepaymentCustomDate: '',
  showDatePicker: false,
}

// Reducer
const transactionReducer = (state: TransactionState, action: TransactionAction): TransactionState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    case 'SET_TITLE':
      return { ...state, title: action.payload }
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload }
    case 'SET_TITLE_FOCUS':
      return { ...state, titleFocus: action.payload }
    case 'SET_AMOUNT_FOCUS':
      return { ...state, amountFocus: action.payload }
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_IS_ADMIN':
      return { ...state, isAdmin: action.payload }
    case 'SET_ROLE_LOADING':
      return { ...state, roleLoading: action.payload }
    case 'SET_IS_PREPAYMENT':
      return { ...state, isPrepayment: action.payload }
    case 'SET_ALLOW_PREPAYMENT':
      return { ...state, allowPrepayment: action.payload }
    case 'SET_PREPAYMENT_MONTHS':
      return { ...state, prepaymentMonths: action.payload }
    case 'SET_PREPAYMENT_START_TYPE':
      return { ...state, prepaymentStartType: action.payload }
    case 'SET_PREPAYMENT_CUSTOM_DATE':
      return { ...state, prepaymentCustomDate: action.payload }
    case 'SET_SHOW_DATE_PICKER':
      return { ...state, showDatePicker: action.payload }
    case 'RESET_FORM':
      return {
        ...initialState,
        isAdmin: state.isAdmin,
        roleLoading: state.roleLoading,
        allowPrepayment: state.allowPrepayment,
        selectedDate: new Date().toISOString().split('T')[0],
      }
    default:
      return state
  }
}

export const useAddViewModel = () => {
  const [state, dispatch] = useReducer(transactionReducer, initialState)
  const { user, activeGroupId } = useAuthStore()

  // 使用自定義防抖 hook
  const debounce = useDebounce(UI.DEBOUNCE_DELAY)

  // 日期格式轉換函數
  const formatDateToYYYYMM = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${year}${month}`
  }

  // 獲取用戶角色
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.uid || !activeGroupId) {
        dispatch({ type: 'SET_IS_ADMIN', payload: false })
        dispatch({ type: 'SET_ROLE_LOADING', payload: false })
        return
      }

      try {
        const userRole = await MemberService.getCurrentUserRole(activeGroupId, user.uid)
        dispatch({ type: 'SET_IS_ADMIN', payload: userRole === MEMBER_ROLES.ADMIN })
      } catch (error) {
        console.error('Error fetching user role:', error)
        dispatch({ type: 'SET_IS_ADMIN', payload: false })
      } finally {
        dispatch({ type: 'SET_ROLE_LOADING', payload: false })
      }
    }

    fetchUserRole()
  }, [user?.uid, activeGroupId])

  // 如果用戶不是管理員，確保預設為收入
  useEffect(() => {
    if (!state.roleLoading && !state.isAdmin && state.activeTab === RECORD_TRANSACTION_TYPES.EXPENSE) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: RECORD_TRANSACTION_TYPES.INCOME })
    }
  }, [state.roleLoading, state.isAdmin, state.activeTab])

  // 檢查群組是否允許預繳
  useEffect(() => {
    const checkPrepayment = async () => {
      if (activeGroupId) {
        const canPrepay = await TransactionService.checkAllowPrepayment(activeGroupId)
        dispatch({ type: 'SET_ALLOW_PREPAYMENT', payload: canPrepay })
      }
    }

    checkPrepayment()
  }, [activeGroupId])

  // 計算預繳月份數（使用防抖）
  useEffect(() => {
    if (state.isPrepayment && state.allowPrepayment && state.activeTab === RECORD_TRANSACTION_TYPES.INCOME) {
      const calculateMonths = async () => {
        if (activeGroupId && user?.uid) {
          const amountValue = parseInt(state.amount.replace(/,/g, '')) || 0
          const months = TransactionService.calculatePrepaymentMonths(amountValue, 0, UI.DEFAULT_GROUP_MONTHLY_AMOUNT)
          dispatch({ type: 'SET_PREPAYMENT_MONTHS', payload: months })
        }
      }

      // 使用新的防抖 hook
      debounce(calculateMonths)
    } else {
      dispatch({ type: 'SET_PREPAYMENT_MONTHS', payload: 0 })
    }
  }, [state.isPrepayment, state.amount, state.allowPrepayment, state.activeTab, activeGroupId, user?.uid, debounce])

  // 計算樣式
  const themeColor = useMemo(() => {
    return state.activeTab === RECORD_TRANSACTION_TYPES.INCOME ? '#10B981' : '#EF4444'
  }, [state.activeTab])

  const titleInputStyle = useMemo(() =>
    `py-4 px-4 border-2 rounded-lg bg-white text-lg ${state.titleFocus ? 'border-blue-400' : 'border-gray-300'}`
    , [state.titleFocus])

  const amountInputStyle = useMemo(() =>
    `text-2xl font-bold text-left pl-4 pr-12 py-4 border-2 rounded-lg bg-white ${state.amountFocus ? 'border-blue-400' : 'border-gray-300'}`
    , [state.amountFocus])

  const expenseButtonStyle = useMemo(() =>
    `flex-1 py-4 px-4 ${state.activeTab === RECORD_TRANSACTION_TYPES.EXPENSE ? 'bg-red-400' : 'bg-white'}`
    , [state.activeTab])

  const incomeButtonStyle = useMemo(() =>
    `flex-1 py-4 px-4 ${state.activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'bg-emerald-400' : 'bg-white'}`
    , [state.activeTab])

  const submitButtonStyle = useMemo(() =>
    `py-4 rounded-lg ${state.activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'bg-emerald-400' : 'bg-red-400'}`
    , [state.activeTab])

  const markedDates = useMemo(() => ({
    [state.selectedDate]: {
      selected: true,
      selectedColor: themeColor,
      selectedTextColor: 'white'
    }
  }), [state.selectedDate, themeColor])

  // Helper functions
  const formatAmount = (value: string) => {
    const number = value.replace(/,/g, '')
    if (number === '' || isNaN(Number(number))) return '0'
    return Number(number).toLocaleString()
  }

  // Event handlers
  const handleAmountFocus = useCallback(() => {
    dispatch({ type: 'SET_AMOUNT_FOCUS', payload: true })
    if (state.amount === '0') {
      dispatch({ type: 'SET_AMOUNT', payload: '' })
    }
  }, [state.amount])

  const handleAmountBlur = useCallback(() => {
    dispatch({ type: 'SET_AMOUNT_FOCUS', payload: false })
    if (state.amount === '' || state.amount.replace(/,/g, '') === '0') {
      dispatch({ type: 'SET_AMOUNT', payload: '0' })
    }
  }, [state.amount])

  const handleTitleFocus = useCallback(() => {
    dispatch({ type: 'SET_TITLE_FOCUS', payload: true })
  }, [])

  const handleTitleBlur = useCallback(() => {
    dispatch({ type: 'SET_TITLE_FOCUS', payload: false })
  }, [])

  const handleExpensePress = useCallback(() => {
    if (state.isAdmin) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: RECORD_TRANSACTION_TYPES.EXPENSE })
    }
  }, [state.isAdmin])

  const handleIncomePress = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: RECORD_TRANSACTION_TYPES.INCOME })
  }, [])

  const handleDateSelect = useCallback((day: any) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: day.dateString })
  }, [])

  const handleAmountChange = useCallback((value: string) => {
    const cleanValue = value.replace(/,/g, '')
    if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
      dispatch({ type: 'SET_AMOUNT', payload: formatAmount(cleanValue) })
    }
  }, [])

  const setTitle = useCallback((title: string) => {
    dispatch({ type: 'SET_TITLE', payload: title })
  }, [])

  const setDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description })
  }, [])

  const setIsPrepayment = useCallback((isPrepayment: boolean) => {
    dispatch({ type: 'SET_IS_PREPAYMENT', payload: isPrepayment })
  }, [])

  const setPrepaymentStartType = useCallback((type: PrepaymentStartType) => {
    dispatch({ type: 'SET_PREPAYMENT_START_TYPE', payload: type })
  }, [])

  const setPrepaymentCustomDate = useCallback((date: string) => {
    dispatch({ type: 'SET_PREPAYMENT_CUSTOM_DATE', payload: date })
  }, [])

  const setShowDatePicker = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_DATE_PICKER', payload: show })
  }, [])

  const showCustomDatePicker = useCallback(() => {
    dispatch({ type: 'SET_SHOW_DATE_PICKER', payload: true })
  }, [])

  const handleDatePickerConfirm = useCallback((date: Date) => {
    const formattedDate = formatDateToYYYYMM(date)
    dispatch({ type: 'SET_PREPAYMENT_CUSTOM_DATE', payload: formattedDate })
    dispatch({ type: 'SET_SHOW_DATE_PICKER', payload: false })
  }, [])

  const handleDatePickerCancel = useCallback(() => {
    dispatch({ type: 'SET_SHOW_DATE_PICKER', payload: false })
  }, [])

  // Business logic
  const handleSubmit = useCallback(async () => {
    const amountValue = state.amount.replace(/,/g, '')

    if (amountValue === '0' || amountValue === '') {
      Alert.alert(COMMON.ERROR, TRANSACTION.ERROR_PLEASE_INPUT_VALID_AMOUNT)
      return
    }

    if (!state.title.trim()) {
      Alert.alert(COMMON.ERROR, TRANSACTION.ERROR_PLEASE_INPUT_ITEM_TITLE)
      return
    }

    if (!user?.uid || !activeGroupId) {
      Alert.alert(COMMON.ERROR, TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION)
      return
    }

    if (state.isPrepayment && state.prepaymentStartType === PREPAYMENT_START_TYPES.CUSTOM && !state.prepaymentCustomDate) {
      Alert.alert(COMMON.ERROR, '請設定預繳開始月份')
      return
    }

    dispatch({ type: 'SET_IS_LOADING', payload: true })

    try {
      const transactionData: CreateTransactionInput = {
        type: state.activeTab,
        amount: parseInt(amountValue),
        date: state.selectedDate,
        title: state.title.trim(),
        description: state.description.trim() || undefined,
        isPrepayment: state.isPrepayment,
        prepaymentStartType: state.isPrepayment ? state.prepaymentStartType : undefined,
        prepaymentCustomDate: state.isPrepayment && state.prepaymentStartType === PREPAYMENT_START_TYPES.CUSTOM ? state.prepaymentCustomDate : undefined,
      }

      await TransactionService.create(activeGroupId, user.uid, transactionData)

      // 重置表單
      dispatch({ type: 'RESET_FORM' })

      Alert.alert(COMMON.SUCCESS, `${state.activeTab === RECORD_TRANSACTION_TYPES.INCOME ? TRANSACTION.INCOME : TRANSACTION.EXPENSE} ${COMMON.ADD_SUCCESS}`)
    } catch (error) {
      let errorMessage: string = TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION

      if (error instanceof TransactionError) {
        errorMessage = error.message
      } else {
        const mappedError = mapFirebaseError(error)
        errorMessage = mappedError.message
      }

      Alert.alert(COMMON.ERROR, errorMessage)
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false })
    }
  }, [state, user, activeGroupId])

  return {
    // States
    activeTab: state.activeTab,
    amount: state.amount,
    selectedDate: state.selectedDate,
    title: state.title,
    description: state.description,
    titleFocus: state.titleFocus,
    amountFocus: state.amountFocus,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    roleLoading: state.roleLoading,
    isPrepayment: state.isPrepayment,
    allowPrepayment: state.allowPrepayment,
    prepaymentMonths: state.prepaymentMonths,
    prepaymentStartType: state.prepaymentStartType,
    prepaymentCustomDate: state.prepaymentCustomDate,
    showDatePicker: state.showDatePicker,

    // Computed
    themeColor,
    titleInputStyle,
    amountInputStyle,
    expenseButtonStyle,
    incomeButtonStyle,
    submitButtonStyle,
    markedDates,

    // Actions
    setTitle,
    setDescription,
    setIsPrepayment,
    setPrepaymentStartType,
    setPrepaymentCustomDate,
    setShowDatePicker,
    handleAmountFocus,
    handleAmountBlur,
    handleTitleFocus,
    handleTitleBlur,
    handleExpensePress,
    handleIncomePress,
    handleDateSelect,
    handleAmountChange,
    showCustomDatePicker,
    handleDatePickerConfirm,
    handleDatePickerCancel,
    handleSubmit,
  }
} 