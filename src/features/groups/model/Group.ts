export interface GroupModel {
  id: string
  name: string
  type: 'long-term' | 'one-time'
  members: string[]
  createdAt?: any
}