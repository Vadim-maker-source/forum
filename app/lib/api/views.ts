"use server";

import { prisma } from "../prisma";
import { getCurrentUser } from "./actions";

export async function addProfileView(posterUserId: number) {
  const me = await getCurrentUser();
  if (!me) return null;
  if (me.id === posterUserId) return null; // не считаем свой профиль

  // проверим, был ли просмотр
  const existing = await prisma.view.findFirst({
    where: { viewerId: me.id, posterUserId },
  });

  if (!existing) {
    await prisma.view.create({
      data: { viewerId: me.id, posterUserId },
    });
  }

  return true;
}

export async function getRecommendedPosts(limit = 3, theme?: string) {
  const me = await getCurrentUser();
  if (!me) return [];

  let whereClause: any = {};
  
  if (theme) {
    whereClause.postTheme = theme;
  }
  
  const subs = await prisma.subscription.findMany({
    where: { followerId: me.id },
    select: { followingId: true },
  });

  let userIds: number[] = [];

  if (subs.length > 0) {
    userIds = subs.map((s) => s.followingId);
  } else {
    const views = await prisma.view.findMany({
      where: { viewerId: me.id },
      select: { posterUserId: true },
    });

    if (views.length > 0) {
      userIds = Array.from(new Set(views.map((v) => v.posterUserId)));
    }
  }

  if (userIds.length > 0) {
    whereClause.userId = { in: userIds };
  } else {
    whereClause.userId = { not: me.id };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      pollOptions: true,
      reactions: true,
    },
    take: limit,
  });

  return posts;
}