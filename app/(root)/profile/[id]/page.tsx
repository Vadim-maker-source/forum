"use client";

import { useEffect, useState } from "react";
import { getUserPosts } from "@/app/lib/api/posts";
import { getCurrentUser, getUserById } from "@/app/lib/api/actions";
import PostCard from "@/components/PostCard";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User } from "@/app/lib/types";
import { followUser, getFollowers, getFollowing, isSubscribed, unfollowUser } from "@/app/lib/api/subscriptions";
import { Loader2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { addProfileView } from "@/app/lib/api/views";

type SubscribeButtonProps = {
  targetUserId: number;
}

export default function ProfilePage({ targetUserId }: SubscribeButtonProps) {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState(Number);
  const [following, setFollowing] = useState(Number);
  const [hover, setHover] = useState(false)

  useEffect(() => {
    (async () => {
      const u = await getUserById(userId);
      setUser(u);
      const m = await getCurrentUser();
      if(m){
        const sub = await isSubscribed(Number(me?.id), userId);
        setSubscribed(sub);
      }
      if (m && u && m.id !== u.id) {
        await addProfileView(u.id);
      }
      setMe(m);
      const p = await getUserPosts(userId);
      setPosts(p);
      setSubscribed(false);
    })();
  }, [userId]);

  useEffect(() => {
    isSubscribed(Number(me?.id), userId).then(setSubscribed)
  }, [me?.id, userId])

    const getFlws = async () => {
      const follw = await getFollowers(userId)
      setFollowers(follw.length)
    }
    getFlws()

  useEffect(() => {
    const getFlw = async () => {
      const follw = await getFollowing(userId)
      setFollowing(follw.length)
    }
    getFlw()
  }, [userId])

  const toggleSubscribe = async () => {
    if (!me?.id) return;
    setLoading(true)
    if (subscribed) {
      await unfollowUser(me.id, userId);
      setSubscribed(false);
      getFlws()
    } else {
      await followUser(me.id, userId);
      setSubscribed(true);
      getFlws()
    }
    setLoading(false)
  };

  const renderBadge = (userId: number) => {
    if (userId === 1) {
      return (
        <span className="text-red-700 font-semibold text-xl px-1 rounded flex items-center">
          <Tooltip>
            <TooltipTrigger className="cursor-pointer"><Image src="/icons/verificated.png" alt="Подтверждён" width={20} height={20} /></TooltipTrigger>
            <TooltipContent>
              <p className="text-[14px]">Доступно только для официальных контент мейкеров</p>
            </TooltipContent>
          </Tooltip>
          <p className="hidden md:block">&nbsp;- Владелец</p>
        </span>
      );
    }
    return null;
  };

  if (!user) return <div className="p-4">Загрузка…</div>;

  const isCurrent = me?.id === user.id;

  return (
    <div className="w-full p-4">
      <div className="border-b bg-white dark:bg-gray-900 p-4 flex items-center flex-wrap gap-4 mb-6">

      <div className="flex items-center gap-4">
        <img
          src={"https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png"}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center"><h1 className="text-xl font-bold">{user.name}</h1>{renderBadge(user.id)}</span>
          <HoverCard>
  <HoverCardTrigger className="text-ms text-gray-500 cursor-pointer" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>Обо мне <FontAwesomeIcon icon={faAngleUp} className={`${hover ? "rotate-180" : ""} duration-500`} /></HoverCardTrigger>
  <HoverCardContent className="wrap-break-word w-72">
    {user.bio}
  </HoverCardContent>
</HoverCard>
</div>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

        <div className="flex items-center gap-2">
          <Link href={`/followers/${user.id}`}><p className="text-gray-500 dark:text-gray-400">{followers} подписчиков</p></Link>
          <Link href={`/following/${user.id}`}><p className="text-gray-500 dark:text-gray-400">{following} подписок</p></Link>
        </div>
        {isCurrent ? (
          <Link href="/edit-profile"><button className="px-4 py-2 rounded-lg w-auto resize-x max-w-152 font-semibold border border-transparent bg-orange-500 hover:bg-orange-500/10 cursor-pointer duration-300 hover:text-orange-500 hover:border-orange-500 text-white">Изменить профиль</button></Link>
        ) : (
          <button
      onClick={toggleSubscribe}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-semibold ${
        subscribed
          ? "border border-transparent bg-gray-400 hover:bg-gray-500 text-white"
          : "bg-orange-500 text-white"
      }`}
    >
      {subscribed ? loading ? <Loader2 className="animate-spin" /> : "Отписаться" : loading ? <Loader2 className="animate-spin" /> : "Подписаться"}
    </button>
        )}
      </div>

      <h1>{isCurrent ? <span className="text-xl font-semibold">Ваши публикации</span> : <span className="text-xl font-semibold">Публикации пользователя {user.name}</span>}</h1>

      <div className="flex flex-col gap-4 mt-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} user={user} />
        ))}
        {posts.length === 0 && <div className="text-gray-500">Публикаций пока нет</div>}
      </div>
    </div>
  );
}
