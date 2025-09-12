export type User = {
    id: number
    name: string
    email: string
    password?: string
    number?: string | null
    bio?: string | null
    avatar?: string | null
    createdAt?: Date
  }