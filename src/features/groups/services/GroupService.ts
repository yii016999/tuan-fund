// import { auth, db } from '@/config/firebase'
// import { COLLECTIONS } from '@/constants/firestorePaths'
// import { collection, getDocs, query, where } from 'firebase/firestore'
// import { GroupModel } from '../model/Group'

// export async function getUserGroups(): Promise<GroupModel[]> {
//     const userId = auth.currentUser?.uid

//     const q = query(collection(db, COLLECTIONS.GROUPS), where('members', 'array-contains', userId))
//     const snapshot = await getDocs(q)

//     return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//     })) as GroupModel[]
// }