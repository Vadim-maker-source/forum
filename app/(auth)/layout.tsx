"use client"

import { SessionProvider } from 'next-auth/react'
import React, { useState, useEffect } from 'react'

const backgroundImages = [
  "/images/food-w.jpg",
  "/images/IT-w.jpg", 
  "/images/games-w.jpg",
  "/images/trips-w.jpg",
  "/images/music-w.jpg",
  "/images/movies-w.jpg",
  "/images/plants-w.jpg",
]

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentBackground, setCurrentBackground] = useState("")

  useEffect(() => {
    // Выбираем случайное изображение при монтировании компонента
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setCurrentBackground(backgroundImages[randomIndex])
  }, [])

  return (
    <SessionProvider>
      <div className="relative h-screen w-full">
        {/* Затемненный фон */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentBackground})` }}
        />
        
        {/* Затемняющий оверлей */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        
        {/* Контент поверх затемненного фона */}
        <div className="relative z-10 h-full w-full flex items-center sm:p-7">
          {children}
        </div>
      </div>
    </SessionProvider>
  )
}

export default AuthLayout