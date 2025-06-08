"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setError("Firebase not configured. Please add Firebase environment variables.")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError("Authentication error occurred")
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase not configured")
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: "select_account",
      })
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw new Error("فشل في تسجيل الدخول بـ Google")
    }
  }

  const signInWithFacebook = async () => {
    if (!auth) {
      throw new Error("Firebase not configured")
    }

    try {
      const provider = new FacebookAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Facebook sign in error:", error)
      throw new Error("فشل في تسجيل الدخول بـ Facebook")
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase not configured")
    }

    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw new Error("فشل في تسجيل الخروج")
    }
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
