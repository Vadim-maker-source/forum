"use client"

import { SessionProvider } from 'next-auth/react'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <div>{children}</div>
    </SessionProvider>
  )
}

export default AuthLayout