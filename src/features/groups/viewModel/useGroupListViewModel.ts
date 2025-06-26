import { useEffect, useState } from 'react'
import { getUserGroups } from '../services/GroupService'
import { GroupModel } from '../model/Group'

export function useGroupListViewModel(userId: string) {
  const [groups, setGroups] = useState<GroupModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserGroups().then(data => {
      setGroups(data)
      setLoading(false)
    })
  }, [userId])

  return { groups, loading }
}