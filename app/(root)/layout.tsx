"use client"

import SidebarComponent from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { Toaster } from 'sonner'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
    <div className="h-screen flex flex-col">
      <Topbar />
      <section className="flex flex-1">
          <SidebarComponent className="w-0 md:w-64" />

        <main className="flex-1 flex justify-center md:justify-start items-start md:p-4">
          {children}
          <Toaster />
        </main>
      </section>
    </div>
    </SessionProvider>
  )
}

export default RootLayout
