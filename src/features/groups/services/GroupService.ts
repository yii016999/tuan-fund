import { auth, db } from '@/config/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { GroupModel } from '../model/Group'

export async function getUserGroups(): Promise<GroupModel[]> {
    const userId = auth.currentUser?.uid

    const q = query(collection(db, 'groups'), where('members', 'array-contains', userId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GroupModel[]
}