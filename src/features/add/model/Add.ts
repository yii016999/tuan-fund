export interface Add {
  id?: string
  type: 'income' | 'expense'
  amount: number
  date: string
  title: string
  description?: string
  groupId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface AddModel {
  type: 'income' | 'expense'
  amount: number
  date: string
  title: string
  description?: string
} 