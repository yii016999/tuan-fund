import { COMMON, TRANSACTION } from '@/constants/string'
import { MEMBER_ROLES, RECORD_TRANSACTION_TYPES, RecordTransactionType } from '@/constants/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { useAuthStore } from '../../../store/useAuthStore'
import { CreateTransactionInput } from '../model/Transaction'
import { AddService } from '../services/TransactionService'
import { MemberService } from '../../members/services/MemberService'

export const useAddViewModel = () => {
  const [activeTab, setActiveTab] = useState<RecordTransactionType>(RECORD_TRANSACTION_TYPES.INCOME)
  const [amount, setAmount] = useState('0')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleFocus, setTitleFocus] = useState(false)
  const [amountFocus, setAmountFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(true)
  const [isPrepayment, setIsPrepayment] = useState(false)
  const [allowPrepayment, setAllowPrepayment] = useState(false)
  const [prepaymentMonths, setPrepaymentMonths] = useState(0)

  const { user, activeGroupId } = useAuthStore()

  // 獲取用戶角色
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.uid || !activeGroupId) {
        setIsAdmin(false)
        setRoleLoading(false)
        return
      }

      try {
        const userRole = await MemberService.getCurrentUserRole(activeGroupId, user.uid)
        setIsAdmin(userRole === MEMBER_ROLES.ADMIN)
      } catch (error) {
        console.error('Error fetching user role:', error)
        setIsAdmin(false)
      } finally {
        setRoleLoading(false)
      }
    }

    fetchUserRole()
  }, [user?.uid, activeGroupId])

  // 如果用戶不是管理員，確保預設為收入
  useEffect(() => {
    if (!roleLoading && !isAdmin && activeTab === RECORD_TRANSACTION_TYPES.EXPENSE) {
      setActiveTab(RECORD_TRANSACTION_TYPES.INCOME)
    }
  }, [roleLoading, isAdmin, activeTab])

  // 檢查群組是否允許預繳
  useEffect(() => {
    const checkPrepayment = async () => {
      if (activeGroupId) {
        const canPrepay = await AddService.checkAllowPrepayment(activeGroupId)
        setAllowPrepayment(canPrepay)
      }
    }
    
    checkPrepayment()
  }, [activeGroupId])

  // 計算預繳月份數
  useEffect(() => {
    if (isPrepayment && allowPrepayment && activeTab === RECORD_TRANSACTION_TYPES.INCOME) {
      const calculateMonths = async () => {
        if (activeGroupId && user?.uid) {
          const amountValue = parseInt(amount.replace(/,/g, '')) || 0
          const currentMonth = new Date().toISOString().slice(0, 7)
          
          // 這裡需要獲取當月已繳費總額和群組月繳金額
          // 暫時簡化處理
          const months = AddService.calculatePrepaymentMonths(amountValue, 0, 2000) // 需要實際獲取數據
          setPrepaymentMonths(months)
        }
      }
      
      calculateMonths()
    } else {
      setPrepaymentMonths(0)
    }
  }, [isPrepayment, amount, allowPrepayment, activeTab, activeGroupId, user?.uid])

  const themeColor = useMemo(() => {
    return activeTab === RECORD_TRANSACTION_TYPES.INCOME ? '#10B981' : '#EF4444'
  }, [activeTab])

  const titleInputStyle = useMemo(() =>
    `py-4 px-4 border-2 rounded-lg bg-white text-lg ${titleFocus ? 'border-blue-400' : 'border-gray-300'
    }`
    , [titleFocus])

  const amountInputStyle = useMemo(() =>
    `text-2xl font-bold text-left pl-4 pr-12 py-4 border-2 rounded-lg bg-white ${amountFocus ? 'border-blue-400' : 'border-gray-300'
    }`
    , [amountFocus])

  const expenseButtonStyle = useMemo(() =>
    `flex-1 py-4 px-4 ${activeTab === RECORD_TRANSACTION_TYPES.EXPENSE ? 'bg-red-400' : 'bg-white'}`
    , [activeTab])

  const incomeButtonStyle = useMemo(() =>
    `flex-1 py-4 px-4 ${activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'bg-emerald-400' : 'bg-white'}`
    , [activeTab])

  const submitButtonStyle = useMemo(() =>
    `py-4 rounded-lg ${activeTab === RECORD_TRANSACTION_TYPES.INCOME ? 'bg-emerald-400' : 'bg-red-400'}`
    , [activeTab])

  const markedDates = useMemo(() => ({
    [selectedDate]: {
      selected: true,
      selectedColor: themeColor,
      selectedTextColor: 'white'
    }
  }), [selectedDate, themeColor])

  // Helper functions
  const formatAmount = (value: string) => {
    const number = value.replace(/,/g, '')
    if (number === '' || isNaN(Number(number))) return '0'
    return Number(number).toLocaleString()
  }

  // Event handlers
  const handleAmountFocus = useCallback(() => {
    setAmountFocus(true)
    if (amount === '0') {
      setAmount('')
    }
  }, [amount])

  const handleAmountBlur = useCallback(() => {
    setAmountFocus(false)
    if (amount === '' || amount.replace(/,/g, '') === '0') {
      setAmount('0')
    }
  }, [amount])

  const handleTitleFocus = useCallback(() => {
    setTitleFocus(true)
  }, [])

  const handleTitleBlur = useCallback(() => {
    setTitleFocus(false)
  }, [])

  const handleExpensePress = useCallback(() => {
    if (isAdmin) {
      setActiveTab(RECORD_TRANSACTION_TYPES.EXPENSE)
    }
  }, [isAdmin])

  const handleIncomePress = useCallback(() => {
    setActiveTab(RECORD_TRANSACTION_TYPES.INCOME)
  }, [])

  const handleDateSelect = useCallback((day: any) => {
    setSelectedDate(day.dateString)
  }, [])

  const handleAmountChange = useCallback((value: string) => {
    const cleanValue = value.replace(/,/g, '')
    if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
      setAmount(formatAmount(cleanValue))
    }
  }, [])

  // Business logic
  const handleSubmit = useCallback(async () => {
    const amountValue = amount.replace(/,/g, '')

    if (amountValue === '0' || amountValue === '') {
      Alert.alert(COMMON.ERROR, TRANSACTION.ERROR_PLEASE_INPUT_VALID_AMOUNT)
      return
    }

    if (!title.trim()) {
      Alert.alert(COMMON.ERROR, TRANSACTION.ERROR_PLEASE_INPUT_ITEM_TITLE)
      return
    }

    if (!user?.uid || !activeGroupId) {
      Alert.alert(COMMON.ERROR, TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION)
      return
    }

    setIsLoading(true)

    try {
      const transactionData: CreateTransactionInput = {
        type: activeTab,
        amount: parseInt(amountValue),
        date: selectedDate,
        title: title.trim(),
        description: description.trim() || undefined,
        isPrepayment: isPrepayment, // 添加預繳標記
      }

      await AddService.create(
        activeGroupId,
        user.uid,
        transactionData
      )

      // Reset form
      setAmount('0')
      setTitle('')
      setDescription('')
      setSelectedDate(new Date().toISOString().split('T')[0])

      Alert.alert(COMMON.SUCCESS, `${activeTab === RECORD_TRANSACTION_TYPES.INCOME ? TRANSACTION.INCOME : TRANSACTION.EXPENSE} ${COMMON.ADD_SUCCESS}`)
    } catch (error) {
      Alert.alert(COMMON.ERROR, error instanceof Error ? error.message : TRANSACTION.ERROR_MESSAGE_CREATE_TRANSACTION)
    } finally {
      setIsLoading(false)
    }
  }, [amount, title, description, selectedDate, activeTab, user, activeGroupId, isPrepayment])

  return {
    // States
    activeTab,
    amount,
    selectedDate,
    title,
    description,
    titleFocus,
    amountFocus,
    isLoading,
    isAdmin,
    roleLoading,
    isPrepayment,
    setIsPrepayment,
    allowPrepayment,
    prepaymentMonths,

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
    handleAmountFocus,
    handleAmountBlur,
    handleTitleFocus,
    handleTitleBlur,
    handleExpensePress,
    handleIncomePress,
    handleDateSelect,
    handleAmountChange,
    handleSubmit,
  }
} 