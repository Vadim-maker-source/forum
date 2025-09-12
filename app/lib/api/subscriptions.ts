'use server'

import { prisma } from "../prisma";
import { User } from "../types";

export async function followUser(followerId: number, followingId: number) {
    if (followerId === followingId) throw new Error("Нельзя подписаться на себя");
  
    return prisma.subscription.create({
      data: {
        followerId,
        followingId,
      },
    });
  }
  
  // Отписаться от пользователя
  export async function unfollowUser(followerId: number, followingId: number) {
    return prisma.subscription.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  }
  
  // Проверить, подписан ли текущий пользователь на другого
  export async function isSubscribed(followerId: number, followingId: number) {
    try {
      const sub = await prisma.subscription.findUnique({
        where: {
          followerId_followingId: {
            followerId: Number(followerId),
            followingId: Number(followingId),
          },
        },
      });
      return !!sub;
    } catch (e) {
      console.error("Prisma isSubscribed error:", e);
      return false;
    }
  }
  
  // Получить всех подписчиков пользователя
  export async function getFollowers(userId: number) {
    return prisma.subscription.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
  }
  
  export async function getFollowers2(userId: number): Promise<User[]> {
    const subs = await prisma.subscription.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
  
    return subs.map((s) => ({
      ...s.follower,
    }));
  }
  
  // Получить всех, на кого подписан пользователь
  export async function getFollowing(userId: number) {
    return prisma.subscription.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
  }

  export async function getFollowing2(userId: number) {
    const subs = await prisma.subscription.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
  
    return subs.map((s) => s.following);
  }