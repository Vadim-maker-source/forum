"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { getCurrentUser } from "./actions";
import { PostType } from "@prisma/client";

export async function createPostAction(params: {
  type: "TEXT" | "MEDIA" | "POLL";
  text?: string;
  medias?: string[];
  pollOptions?: string[];
  header?: string;
  cate?: string;
}) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Не авторизован");

  const { type, text, medias = [], pollOptions = [], header, cate } = params;

  if (type === "TEXT" && !text?.trim()) {
    throw new Error("Текст обязателен для текстового поста");
  }

  if (type === "POLL") {
    if (!text?.trim()) throw new Error("Текст обязателен для опроса");
    if (pollOptions.length < 2) throw new Error("Минимум 2 варианта");
    if (pollOptions.length > 7) throw new Error("Максимум 7 вариантов");
  }

  const post = await prisma.post.create({
    data: {
      userId: me.id,
      type: type as PostType,
      text: text || null,
      header: header,
      postTheme: cate,
      medias,
      ...(type === "POLL"
        ? {
            pollOptions: {
              create: pollOptions.map((p) => ({ text: p })),
            },
          }
        : {}),
    },
    include: { pollOptions: true, user: { select: { id: true, name: true } } },
  });

  revalidatePath("/");
  return post;
}

export async function votePollOption(optionId: number, vote: boolean) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Не авторизован");

  if (vote) {
    // ставим голос
    await prisma.pollVote.upsert({
      where: { optionId_userId: { optionId, userId: me.id } },
      update: {},
      create: { optionId, userId: me.id },
    });
  } else {
    // убираем голос
    await prisma.pollVote.deleteMany({
      where: { optionId, userId: me.id },
    });
  }

  // возвращаем обновлённый вариант с подсчётом голосов
  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    include: { votes: true },
  });

  return {
    id: option!.id,
    text: option!.text,
    votes: option!.votes.length,
    votedByMe: option!.votes.some((v) => v.userId === me.id),
  };
}

export async function getUserPosts(userId: number) {
  const me = await getCurrentUser();

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      pollOptions: {
        include: { votes: true },
      },
      reactions: true,
    },
  });

  // приводим pollOptions к удобному виду
  return posts.map((p) => ({
    ...p,
    pollOptions: p.pollOptions.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o.votes.length,
      votedByMe: me ? o.votes.some((v) => v.userId === me.id) : false,
    })),
  }));
}