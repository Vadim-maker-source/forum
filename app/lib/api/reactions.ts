"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { getCurrentUser } from "./actions";
import { BASE_REACTIONS } from "../constants";

// Базовые реакций (для UI по умолчанию)


/**
 * ОДНА реакция пользователя на пост.
 * Логика:
 * - если у пользователя уже есть реакция на пост:
 *   - и она совпадает с текущей emoji -> удалить (toggle off)
 *   - и она другая -> заменить на новую emoji
 * - если реакции не было -> создать
 */
export async function addReaction(postId: number, emoji: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Unauthorized");

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId: { postId, userId: me.id } },
  });

  if (existing) {
    if (existing.emoji === emoji) {
      // снимаем реакцию
      await prisma.reaction.delete({
        where: { postId_userId: { postId, userId: me.id } },
      });
    } else {
      // меняем на другую
      await prisma.reaction.update({
        where: { postId_userId: { postId, userId: me.id } },
        data: { emoji },
      });
    }
  } else {
    await prisma.reaction.create({
      data: { postId, userId: me.id, emoji },
    });
  }

  revalidatePath(`/posts/${postId}`);
}

export async function removeReaction(postId: number) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Unauthorized");

  await prisma.reaction.deleteMany({
    where: { postId, userId: me.id },
  });

  revalidatePath(`/posts/${postId}`);
}

/** Аггрегируем реакции поста для UI */
export async function getReactionsForPost(postId: number) {
  const me = await getCurrentUser();

  // Вытащим все реакции поста
  const reacts = await prisma.reaction.findMany({
    where: { postId },
    select: { emoji: true, userId: true },
  });

  // Сгруппируем по emoji
  const counts = new Map<string, number>();
  for (const r of reacts) counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);

  const my = reacts.find((r) => r.userId === (me?.id ?? -1));

  // Гарантируем базовые эмодзи присутствуют в списке
  for (const e of BASE_REACTIONS) if (!counts.has(e)) counts.set(e, 0);

  return Array.from(counts.entries()).map(([emoji, count]) => ({
    emoji,
    count,
    reacted: my?.emoji === emoji,
  }));
}
