import { GroupService } from "@/features/settings/services/GroupService"
import { useEffect, useState } from "react"
import { MemberModel } from "../model/MemberModel"

export function useMembersViewModel(groupId: string) {
  const [members, setMembers] = useState<MemberModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    GroupService.getGroupMembers(groupId)
      .then(setMembers)
      .catch(e => setError(e.message ?? "資料讀取錯誤"))
      .finally(() => setLoading(false))
  }, [groupId])

  return { members, loading, error }
}