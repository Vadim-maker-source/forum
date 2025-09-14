"use client";

import { getCurrentUser } from "@/app/lib/api/actions";
import { votePollOption } from "@/app/lib/api/posts";
import React, { useEffect, useState } from "react";
import PostReactions from "./PostReactions";
import { Checkbox } from "./ui/checkbox";
import { Loader, Loader2 } from "lucide-react";
import { User } from "@/app/lib/types";
import Link from "next/link";
import Image from "next/image";

type PollOption = { id: number; text: string; votes: number };
type Reaction = { emoji: string; userId: number };
type Post = {
  id: number;
  type: "TEXT" | "MEDIA" | "POLL";
  text?: string | null;
  medias?: string[];
  pollOptions?: PollOption[];
  reactions?: Reaction[];
  user?: User;
  header?: string;
  postTheme?: string
};

export default function PostCard({ post, user }: { post: Post, user: User }) {
  const [pollOptions, setPollOptions] = useState(
    (post.pollOptions || []).map((o) => ({
      id: o.id,
      text: o.text,
      votes: o.votes,
      votedByMe: (o as any).votedByMe ?? false,
    }))
  );
  
  const [voted, setVoted] = useState<Record<number, boolean>>(
    Object.fromEntries((post.pollOptions || []).map((o: any) => [o.id, o.votedByMe]))
  );
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setMe(u);
    })();
  }, []);

  const handleVote = async (optionId: number) => {
    setLoading(true)
    const already = voted[optionId] ?? false;
    const updated = await votePollOption(optionId, !already);
    setPollOptions((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, votes: updated.votes } : o))
    );
    setVoted((prev) => ({ ...prev, [optionId]: !already }));
    setLoading(false)
  };

  const initialReactions =
    (post.reactions || []).length === 0
      ? []
      : Array.from(
          new Map(
            (post.reactions || []).map((r) => [
              r.emoji,
              {
                emoji: r.emoji,
                count: (post.reactions || []).filter((x) => x.emoji === r.emoji).length,
                reacted: !!me && !!(post.reactions || []).find((x) => x.userId === me.id && x.emoji === r.emoji),
              },
            ])
          ).values()
        );

  const renderBadge = (userId: number) => {
      if (userId === 1) {
        return (
          <span className="text-red-700 font-semibold text-md px-1 rounded flex items-center">
            <Image src="/icons/verificated.png" alt="Подтверждён" width={17} height={17} />&nbsp;- Владелец
          </span>
        );
      }
      return null;
    };

  return (
    <div className="border-b p-4 w-80 max-w-135 md:w-full md:max-w-xl bg-white dark:bg-gray-900 transition-colors">
      {/* Заголовок карточки — автор */}
      {post.user && (
        <Link href={`/profile/${user.id}`}>
          <div className="mb-2 flex items-center gap-2">
            <img src={"https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png"} className="w-8 h-8 rounded-full" alt="avatar" />
            <div className="text-md text-gray-600 dark:text-gray-300 flex items-center">{post.user.name}{renderBadge(user.id)}</div>
          </div>
        </Link>
      )}

      {post.type === "TEXT" && (
        <div>
          <p className="text-black dark:text-gray-400 text-lg font-semibold whitespace-pre-wrap">{post.header}</p>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.text}</p>
        </div>
      )}

      {post.type === "POLL" && (
        <>
          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-3 tracking-wide">
            {post.text}
          </p>
          <div className="flex flex-col gap-2">
            {pollOptions.map((option) => (
              <label
                key={option.id}
                className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition
                  ${
                    voted[option.id]
                      ? "bg-orange-100 dark:bg-gray-700 border-orange-500 dark:border-white"
                      : "bg-transparent border-gray-200 dark:border-gray-700"
                  }`}
              >
                <span className="font-medium">{option.text}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{loading ? <Loader2 className="animate-spin size-4" /> : option.votes}</span>
                  <Checkbox
                    checked={voted[option.id] ?? false}
                    onCheckedChange={() => handleVote(option.id)}
                    disabled={loading}
                    className="w-5 h-5 rounded checked:bg-blue-600 dark:accent-white cursor-pointer"
                  />
                </div>
              </label>
            ))}
          </div>
        </>
      )}

      {post.type === "MEDIA" && post.medias && (
        <div className="flex gap-2 overflow-x-auto mt-2">
          {post.medias.map((m, i) => (
            <img
              key={i}
              src={m}
              alt="media"
              className="h-44 w-auto rounded-xl shadow-sm hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      )}

      {me && (
        <div className="mt-3">
          <PostReactions postId={post.id} postAuthorId={Number(post.user?.id)} initial={initialReactions} />
        </div>
      )}
    </div>
  );
}
