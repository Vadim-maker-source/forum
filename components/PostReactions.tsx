"use client";

import { useState, useEffect, useTransition } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { addReaction, getReactionsForPost } from "@/app/lib/api/reactions";
import { BASE_REACTIONS } from "@/app/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faPlus } from "@fortawesome/free-solid-svg-icons";
import Comments from "./Comments";

type ReactionType = {
  emoji: string;
  count: number;
  reacted: boolean;
};

type PostReactionsProps = {
  postId: number;
  postAuthorId: number; // 👈 нужен для метки "Автор"
  initial?: ReactionType[];
};

export default function PostReactions({
  postId,
  postAuthorId,
  initial,
}: PostReactionsProps) {
  const [reactions, setReactions] = useState<ReactionType[]>(initial || []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, start] = useTransition();
  const [openComments, setOpenComments] = useState(false);

  const loadReactions = async () => {
    const reacts = await getReactionsForPost(postId);

    // Добавляем базовые реакции, которых нет
    const countsMap = new Map(reacts.map((r) => [r.emoji, r]));
    for (const emoji of BASE_REACTIONS) {
      if (!countsMap.has(emoji)) {
        countsMap.set(emoji, { emoji, count: 0, reacted: false });
      }
    }

    setReactions(Array.from(countsMap.values()));
  };

  useEffect(() => {
    start(loadReactions);
  }, [postId]);

  const handleToggleReaction = (emoji: string) => {
    start(async () => {
      await addReaction(postId, emoji);
      await loadReactions();
    });
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setPickerOpen(false);
    handleToggleReaction(emojiData.emoji);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap relative mt-2">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleToggleReaction(r.emoji)}
          className={`px-2 py-1 rounded-xl border flex items-center gap-1 transition cursor-pointer duration-200
            ${
              r.reacted
                ? "bg-orange-200 border-orange-400 hover:bg-orange-300"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
        >
          <span>{r.emoji}</span>
          <span className="text-xs text-gray-600">{r.count}</span>
        </button>
      ))}

      <button
        onClick={() => setPickerOpen((p) => !p)}
        className="px-2 py-1 rounded-xl border bg-gray-200 hover:bg-gray-300 duration-200 cursor-pointer"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {pickerOpen && (
        <div className="absolute z-50 mt-2">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <button className="px-2 py-1 rounded-xl border bg-gray-200 hover:bg-gray-300 duration-200 cursor-pointer ml-1" onClick={() => setOpenComments((c) => !c)}>
        <FontAwesomeIcon icon={faComments} />
      </button>

      {openComments && (
        <Comments postId={postId} postAuthorId={postAuthorId} />
      )}
    </div>
  );
}
