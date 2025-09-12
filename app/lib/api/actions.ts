"use server";

import { prisma } from "../prisma";
import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { User } from "../types";
import { put } from "@vercel/blob";

// ===== AUTH =====

export async function signUpAction(
  name: string,
  email: string,
  number: string | undefined,
  password: string
) {
  if (!name?.trim()) throw new Error("Укажите имя");
  if (!email?.trim() || !password?.trim()) throw new Error("Email и пароль обязательны");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("Такой пользователь уже есть");

  const hashed = await hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, number: number || null, password: hashed },
    select: { id: true, name: true, email: true, number: true },
  });

  return user;
}

// ===== CURRENT USER =====

export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await getUserById(session.user.id)

  return user;
}

export async function getUserById(id: number) {
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, number: true, bio: true },
  });
}

export type UpdateProfileInput = {
  id: number;
  name?: string;
  bio?: string;
  avatar?: string; // обязательно добавляем сюда
  currentPassword?: string;
  newPassword?: string;
};

export async function updateUserProfile(data: UpdateProfileInput) {
  const { id, name, bio, avatar, currentPassword, newPassword } = data;

  const updateData: any = {};

  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (avatar) updateData.avatar = avatar;

  // логика смены пароля (если нужно)
  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    const isValid = await compare(currentPassword, String(user.password));
    if (!isValid) throw new Error("Неверный текущий пароль");

    updateData.password = await hash(newPassword, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function uploadFile(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  return blob;
}