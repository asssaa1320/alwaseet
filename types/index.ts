export interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
  isPremium: boolean
  premiumExpiryDate?: Date
  adsCount: number
  createdAt: Date
}

export interface News {
  id: string
  author: string
  title: string
  content: string
  imageUrl?: string
  isActive: boolean
  views: number
  createdAt: Date
}

export interface HandToHand {
  id: string
  type: "buyer" | "seller"
  accountType?: string
  accountUrl?: string
  description?: string
  maxFollowers?: number
  minFollowers?: number
  price?: number
  maxPrice?: number
  phoneNumber: string
  userId: string
  userName: string
  userEmail: string
  createdAt: Date
}

export interface Ad {
  id: string
  title: string
  description: string
  price: number
  currency: string
  duration: number
  expiryDate: Date
  imageUrl: string
  isActive: boolean
  isVerified: boolean
  views: number
  phoneNumber: string
  userId: string
  userName: string
  userEmail: string
  accountType: string
  createdAt: Date
}

export interface Admin {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

export interface CreateAdData {
  title: string
  description: string
  price: number
  currency: string
  duration: number
  imageUrl: string
  phoneNumber: string
  accountType: string
}

export interface CreateHandToHandData {
  type: "buyer" | "seller"
  accountType?: string
  accountUrl?: string
  description?: string
  maxFollowers?: number
  minFollowers?: number
  price?: number
  maxPrice?: number
  phoneNumber: string
}

export interface CreateNewsData {
  title: string
  content: string
  imageUrl?: string
}
