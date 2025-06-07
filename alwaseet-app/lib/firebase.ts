import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase-config"
import type { User, Ad, HandToHand, News, CreateAdData, CreateHandToHandData, CreateNewsData } from "@/types"

// Helper function to convert Firestore data
const convertTimestamp = (data: any) => {
  const converted = { ...data }
  if (converted.createdAt?.toDate) {
    converted.createdAt = converted.createdAt.toDate()
  }
  if (converted.expiryDate?.toDate) {
    converted.expiryDate = converted.expiryDate.toDate()
  }
  if (converted.premiumExpiryDate?.toDate) {
    converted.premiumExpiryDate = converted.premiumExpiryDate.toDate()
  }
  return converted
}

// Users
export async function getUsers(): Promise<User[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as User[]
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const docRef = doc(db, "users", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamp(docSnap.data()),
      } as User
    }
    return null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  try {
    const docRef = doc(db, "users", id)
    await updateDoc(docRef, data)
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Ads
export async function getAds(): Promise<Ad[]> {
  try {
    const q = query(collection(db, "ads"), where("isActive", "==", true), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as Ad[]
  } catch (error) {
    console.error("Error getting ads:", error)
    return []
  }
}

export async function getAdById(id: string): Promise<Ad | null> {
  try {
    const docRef = doc(db, "ads", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      // Increment views
      await updateDoc(docRef, {
        views: increment(1),
      })

      return {
        id: docSnap.id,
        ...convertTimestamp(docSnap.data()),
      } as Ad
    }
    return null
  } catch (error) {
    console.error("Error getting ad:", error)
    return null
  }
}

export async function createAd(data: CreateAdData, user: User): Promise<string> {
  try {
    const adData = {
      ...data,
      isActive: true,
      isVerified: false,
      views: 0,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      expiryDate: Timestamp.fromDate(new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000)),
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "ads"), adData)

    // Update user ads count
    await updateDoc(doc(db, "users", user.id), {
      adsCount: increment(1),
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating ad:", error)
    throw error
  }
}

export async function getUserAds(userId: string): Promise<Ad[]> {
  try {
    const q = query(collection(db, "ads"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as Ad[]
  } catch (error) {
    console.error("Error getting user ads:", error)
    return []
  }
}

// Hand to Hand
export async function getHandToHandRequests(): Promise<HandToHand[]> {
  try {
    const q = query(collection(db, "handToHand"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as HandToHand[]
  } catch (error) {
    console.error("Error getting hand to hand requests:", error)
    return []
  }
}

export async function createHandToHandRequest(data: CreateHandToHandData, user: User): Promise<string> {
  try {
    const requestData = {
      ...data,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "handToHand"), requestData)
    return docRef.id
  } catch (error) {
    console.error("Error creating hand to hand request:", error)
    throw error
  }
}

// News
export async function getNews(): Promise<News[]> {
  try {
    const q = query(collection(db, "news"), where("isActive", "==", true), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as News[]
  } catch (error) {
    console.error("Error getting news:", error)
    return []
  }
}

export async function createNews(data: CreateNewsData, author: string): Promise<string> {
  try {
    const newsData = {
      ...data,
      author,
      isActive: true,
      views: 0,
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "news"), newsData)
    return docRef.id
  } catch (error) {
    console.error("Error creating news:", error)
    throw error
  }
}

// Admin functions
export async function updateAdStatus(adId: string, isActive: boolean): Promise<void> {
  try {
    const docRef = doc(db, "ads", adId)
    await updateDoc(docRef, { isActive })
  } catch (error) {
    console.error("Error updating ad status:", error)
    throw error
  }
}

export async function verifyAd(adId: string): Promise<void> {
  try {
    const docRef = doc(db, "ads", adId)
    await updateDoc(docRef, { isVerified: true })
  } catch (error) {
    console.error("Error verifying ad:", error)
    throw error
  }
}

export async function deleteAd(adId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "ads", adId))
  } catch (error) {
    console.error("Error deleting ad:", error)
    throw error
  }
}
