'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'merchant' | 'user' | null

interface UserContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole
    if (savedRole) {
      setUserRoleState(savedRole)
    }
  }, [])

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role)
    if (role) {
      localStorage.setItem('userRole', role)
    } else {
      localStorage.removeItem('userRole')
    }
  }

  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)

  return (
    <UserContext.Provider
      value={{
        userRole,
        setUserRole,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
