"use server";

import { prisma } from "../prisma";
import { getCurrentUser } from "./actions";

// Добавить комментарий
export async function addComment(postId: number, text: string, media?: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Не авторизован");

  return prisma.comment.create({
    data: {
      postId,
      userId: me.id,
      text,
      media,
    },
    include: { user: true },
  });
}

// Получить комментарии поста
export async function getComments(postId: number) {
  return prisma.comment.findMany({
    where: { postId, parentId: null },
    include: { user: true, replies: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });
}

// Добавить ответ
export async function addReply(parentId: number, text: string, media?: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Не авторизован");

  const parent = await prisma.comment.findUnique({ where: { id: parentId } });
  if (!parent) throw new Error("Комментарий не найден");

  return prisma.comment.create({
    data: {
      postId: parent.postId,
      userId: me.id,
      text,
      media,
      parentId,
    },
    include: { user: true },
  });
}

// Получить ответы
export async function getReplies(parentId: number) {
  return prisma.comment.findMany({
    where: { parentId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}
