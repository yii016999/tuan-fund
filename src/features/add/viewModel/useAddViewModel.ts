import { useState, useMemo, useCallback } from 'react'
import { Alert } from 'react-native'
import { AddService } from '../services/AddService'
import { AddData } from '../model/Add'
import { useAuthStore } from '../../../store/useAuthStore'

type TransactionType = 'income' | 'expense'

export const useAddViewModel = () => {
  // States
  const [activeTab, setActiveTab] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('0')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleFocus, setTitleFocus] = useState(false)
  const [amountFocus, setAmountFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Store
  const { user, activeGroupId } = useAuthStore()

  // Computed values
  const themeColor = useMemo(() => {
    return activeTab === 'income' ? '#10B981' : '#EF4444'
  }, [activeTab])

  const titleInputStyle = useMemo(() => 
    `py-4 px-4 border-2 rounded-lg bg-white text-lg ${
      titleFocus ? 'border-blue-400' : 'border-gray-300'
    }`
  , [titleFocus])

  const amountInputStyle = useMemo(() => 
    `text-2xl font-bold text-left pl-4 pr-12 py-4 border-2 rounded-lg bg-white ${
      amountFocus ? 'border-blue-400' : 'border-gray-300'
    }`
  , [amountFocus])

  const expenseButtonStyle = useMemo(() => 
    `flex-1 py-4 px-4 ${activeTab === 'expense' ? 'bg-red-400' : 'bg-white'}`
  , [activeTab])

  const incomeButtonStyle = useMemo(() => 
    `flex-1 py-4 px-4 ${activeTab === 'income' ? 'bg-emerald-400' : 'bg-white'}`
  , [activeTab])

  const submitButtonStyle = useMemo(() => 
    `py-4 rounded-lg ${activeTab === 'income' ? 'bg-emerald-400' : 'bg-red-400'}`
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
    setActiveTab('expense')
  }, [])

  const handleIncomePress = useCallback(() => {
    setActiveTab('income')
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
      Alert.alert('錯誤', '請輸入有效金額')
      return
    }

    if (!title.trim()) {
      Alert.alert('錯誤', '請輸入項目標題')
      return
    }

    if (!user?.uid || !activeGroupId) {
      Alert.alert('錯誤', '用戶或群組資訊不完整')
      return
    }

    setIsLoading(true)

    try {
      const transactionData: AddData = {
        type: activeTab,
        amount: parseInt(amountValue),
        date: selectedDate,
        title: title.trim(),
        description: description.trim() || undefined,
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

      Alert.alert('成功', `${activeTab === 'income' ? '收入' : '支出'}新增成功`)
    } catch (error) {
      Alert.alert('錯誤', error instanceof Error ? error.message : '新增失敗')
    } finally {
      setIsLoading(false)
    }
  }, [amount, title, description, selectedDate, activeTab, user, activeGroupId])

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