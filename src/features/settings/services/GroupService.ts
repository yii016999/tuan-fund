import { COLLECTIONS } from '@/constants/firestorePaths'
import { MEMBER_ROLES, MemberRole } from '@/constants/types'
import { MemberModel } from '@/features/members/model/MemberModel'
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from 'firebase/firestore'
import type { GroupBrief } from '../model/Group'

const db = getFirestore()

export const GroupService = {
  // 查詢所有 user 加入的群組
  async getGroupsByUserId(userId: string): Promise<GroupBrief[]> {
    const qs = await getDocs(collection(db, COLLECTIONS.GROUPS))
    const result: GroupBrief[] = []
    qs.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.members?.includes(userId)) {
        result.push({ id: docSnap.id, name: data.name, type: data.type })
      }
    })
    return result
  },

  // 取得某個群組名稱
  async getGroupName(groupId: string): Promise<string | undefined> {
    const ref = doc(db, COLLECTIONS.GROUPS, groupId)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as any).name : undefined
  },

  // 設定 user 的活躍群組
  async updateUserActiveGroup(userId: string, groupId: string) {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), { activeGroupId: groupId })
  },

  // 取得某群組的所有成員詳細資料
  async getGroupMembers(groupId: string): Promise<MemberModel[]> {
    // 查詢 group 拿 member id 與 role
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId)
    const groupSnap = await getDoc(groupRef)
    if (!groupSnap.exists()) return []

    const data = groupSnap.data()
    const memberIds: string[] = data.members ?? []
    const roles: Record<string, string> = data.roles ?? {}

    // 批次查詢所有 user 資料
    const memberDocs = await Promise.all(
      memberIds.map((uid) => getDoc(doc(db, COLLECTIONS.USERS, uid)))
    )

    // 組裝資料
    const members: MemberModel[] = memberDocs.map((snap) => {
      const user = snap.data()
      return {
        uid: snap.id,
        displayName: user?.displayName ?? "",
        email: user?.email ?? "",
        avatarUrl: user?.avatarUrl ?? "",
        role: (roles[snap.id] as MemberRole) ?? MEMBER_ROLES.MEMBER,
        joinedAt: data.createdAt,
      }
    })

    return members
  },
}