interface DateRangeSelectorProps {
  startDate: Date
  endDate: Date
  onDateRangeChange: (startDate: Date, endDate: Date) => void
  disabled?: boolean
} 