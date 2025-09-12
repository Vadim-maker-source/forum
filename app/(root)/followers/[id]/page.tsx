'use client'

import { getCurrentUser, getUserById } from '@/app/lib/api/actions'
import { getFollowers2 } from '@/app/lib/api/subscriptions'
import { User } from '@/app/lib/types'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const Followers = () => {
  const params = useParams()
  const userId = Number(params.id)
  const [followers, setFollowers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [author, setAuthor] = useState<User | null>(null)

  useEffect(() => {
    ;(async () => {
      const users = await getFollowers2(userId)
      setFollowers(users)
    })()
  }, [userId])

  useEffect(() => {
    ;(async () => {
      const currUser = await getCurrentUser()
      setCurrentUser(currUser)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const u = await getUserById(userId)
      setAuthor(u as unknown as User)
    })()
  }, [userId])

  return (
    <div className="p-4 w-full">
      <h2 className="font-bold text-xl mb-4">
        {currentUser?.id === userId
          ? 'Ваши подписчики'
          : `Подписчики пользователя ${author?.name}`}
      </h2>

      {followers.length === 0 ? (
        <p className="text-gray-500">Подписчиков пока нет</p>
      ) : (
        <ul className="space-y-3">
          {followers.map((follower) => (
            <li
              key={follower.id}
              className="flex items-center gap-3 border-b pb-2"
            >
              <Image
                src={follower.avatar || '/file.svg'}
                alt={follower.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <Link
                  href={`/profile/${follower.id}`}
                  className="font-semibold hover:underline"
                >
                  {follower.name}
                </Link>
                <p className="text-sm text-gray-500">{follower.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Followers
