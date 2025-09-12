"use server";

import { prisma } from "../prisma";

export async function searchPosts(query: string) {
  if (!query.trim()) return [];
  return prisma.post.findMany({
    where: { header: { contains: query, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    include: { user: true, pollOptions: true, reactions: true },
    take: 30,
  });
}

export async function searchUsers(query: string) {
  if (!query.trim()) return [];
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, avatar: true, bio: true },
    take: 30,
  });
}
