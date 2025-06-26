import { useState } from 'react'
import { GroupModel } from '../model/Group'
import { getUserGroups } from '../services/GroupService'

export function useGroupViewModel() {
    const [groups, setGroups] = useState<GroupModel[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchGroups = async () => {
        setIsLoading(true)
        const result = await getUserGroups()
        setGroups(result)
        setIsLoading(false)
    }

    return {
        groups,
        isLoading,
        fetchGroups
    }
}