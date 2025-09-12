"use client";

import { useEffect, useState, useTransition } from "react";
import { User } from "@/app/lib/types";
import Image from "next/image";
import { addComment, addReply, getComments } from "@/app/lib/api/Comments";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type CommentProps = {
  postId: number;
  postAuthorId: number;
};

export default function Comments({ postId, postAuthorId }: CommentProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [pending, start] = useTransition();
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const loadComments = async () => {
    const data = await getComments(postId);
    setComments(data);
  };

  useEffect(() => {
    start(loadComments);

    // автообновление каждые 5 секунд
    const interval = setInterval(loadComments, 5000);
    return () => clearInterval(interval);
  }, [postId]);

  const handleAddComment = () =>
    start(async () => {
      if (!newComment.trim()) return;

      if (replyTo) {
        await addReply(replyTo, newComment);
        setReplyTo(null);
      } else {
        await addComment(postId, newComment);
      }

      setNewComment("");
      await loadComments();
    });

  const renderBadge = (userId: number) => {
    if (userId === 1) {
      return (
        <span className="text-red-700 font-semibold text-ьв px-1 rounded flex items-center">
          <Image src="/icons/verificated.png" alt="Подтверждён" width={17} height={17} />&nbsp;- Владелец
        </span>
      );
    }
    if (userId === postAuthorId) {
      return (
        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
          Автор
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full mt-4 space-y-4">
      <h3 className="font-semibold text-lg">Комментарии</h3>

      {/* Список комментариев */}
      <div className="space-y-3 max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
        {comments.map((c) => (
          <div key={c.id} className="border-b pb-2">
            <div className="flex items-center gap-2">
                <Link href={`/profile/${c.userId}`} className="flex items-center">
              <Image
                src={c.user.avatar || "/file.svg"}
                alt={c.user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-medium ml-2">{c.user.name}</span>
              {renderBadge(c.userId)}
              </Link>
            </div>

            <p className="ml-10 text-gray-800 dark:text-gray-200">{c.text}</p>

            {/* Ответы */}
            <div className="ml-10 mt-2 space-y-2 border-l pl-4 border-gray-300">
              {c.replies.map((r: any) => (
                <div key={r.id} className="flex items-start gap-2">
                    <Link href={`/profile/${r.userId}`} className="flex items-center">
                  <Image
                    src={r.user.avatar || "/file.svg"}
                    alt={r.user.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                    <Link href={`/profile/${r.userId}`}>
                      <span className="font-medium text-sm">{r.user.name}</span>
                      {renderBadge(r.userId)}
                    </Link>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {r.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопка ответить */}
            <button
              className="ml-10 mt-1 text-sm text-orange-500 hover:underline"
              onClick={() => setReplyTo(c.id)}
            >
              Ответить
            </button>
          </div>
        ))}
      </div>

      {/* Форма добавления */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? "Ваш ответ..." : "Ваш комментарий..."}
          className="flex-1 border rounded-lg p-2 dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={handleAddComment}
          disabled={pending}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
        >
          {pending ? <Loader2 className="animate-spin" /> : replyTo ? "Ответить" : "Отправить"}
        </button>
      </div>
    </div>
  );
}
