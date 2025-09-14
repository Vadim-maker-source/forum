"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/lib/api/actions";
import { signOut } from "next-auth/react";
import { User } from "@/app/lib/types";
import { Home, Menu, PlusSquare, Search, User2 } from "lucide-react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
  faImage,
  faRightFromBracket,
  faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export default function Topbar() {
  const [me, setMe] = useState<User | null>(null);
  const [pending, start] = useTransition();
  const [hover, setHover] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 🔎 состояние поиска
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"posts" | "users">("posts");
  const [focused, setFocused] = useState(false);

  const router = useRouter();

  const navItems = [
    { label: "Главная", icon: <Home size={18} />, href: "/" },
    { label: "Профиль", icon: <User2 size={18} />, href: `/profile/${me?.id}` },
    {
      label: "Создать",
      icon: <PlusSquare size={18} />,
      options: ["Пост", "Опрос"],
      links: ["/create-post", "/create-opros"],
      icons: [faImage, faSquarePollHorizontal],
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const u = await getCurrentUser();
      setMe(u);
    };
    checkAuth();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?query=${encodeURIComponent(search)}&mode=${mode}`);
    setFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b p-5 flex items-center gap-3">
      <Link href="/" className="font-bold tracking-wide text-xl hidden md:block">
        Forum
      </Link>

      <div className="md:hidden flex items-center bg-white dark:bg-gray-900">
        <button onClick={() => setMobileOpen((s) => !s)}>
          <Menu size={25} />
        </button>
      </div>

      <div className="flex-1" />

      {/* 🔎 поиск */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center"
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)} // закрыть через 200мс, чтобы успеть нажать кнопку
      >
        <Search className="absolute left-3 size-5 text-gray-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск..."
          className={cn(
            "border focus:border-orange-500 outline-0 rounded-lg pl-10 pr-3 py-2 md:w-80 sm:max-w-96 sm:w-52 max-w-full dark:bg-gray-800"
          )}
        />

        {/* меню выбора режима */}
        {focused && (
          <div className="absolute top-11 left-0 flex gap-2 bg-white dark:bg-gray-800 border rounded-lg p-2 shadow">
            <button
              type="button"
              onClick={() => setMode("posts")}
              className={cn(
                "px-3 py-1 rounded",
                mode === "posts"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              Посты
            </button>
            <button
              type="button"
              onClick={() => setMode("users")}
              className={cn(
                "px-3 py-1 rounded",
                mode === "users"
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              Пользователи
            </button>
          </div>
        )}
      </form>

      <div className="flex-1" />

      {!me ? (
        <Link
          href="/sign-up"
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <p className="hidden md:block">Регистрация</p>
          <p className="block md:hidden"><FontAwesomeIcon icon={faArrowRightToBracket} /></p>
        </Link>
      ) : (
        <div className="flex items-center gap-4">
          <Link
            href={`/profile/${me.id}`}
            className="hidden text-sm md:flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent hover:border-orange-500 hover:bg-orange-500/10 duration-300 text-gray-600 dark:text-gray-300"
          >
            <Image
              src={me.avatar || "/file.svg"}
              alt={me.name}
              width={24}
              height={24}
            />
            <span className="text-lg text-gray-600">{me.name}</span>
          </Link>
          <button
            onClick={() =>
              start(async () => {
                await signOut();
                window.location.reload();
              })
            }
            disabled={pending}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`px-4 py-2 flex items-center text-lg font-semibold rounded-lg gap-2 bg-orange-500 border border-orange-500 duration-300 cursor-pointer dark:bg-gray-700 text-white hover:bg-transparent hover:text-orange-500`}
          >
            <p className="hidden md:block">Выйти</p>
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className={`size-5 ${hover ? "text-orange-500" : "text-white"}`}
            />
          </button>
        </div>
      )}

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-12 left-0 w-56 bg-white dark:bg-gray-900 shadow z-50 flex flex-col p-2 md:hidden">
          {navItems.map((item) =>
            item.options ? (
              <div key={item.label} className="flex flex-col">
                <span className="px-2 py-1 text-xs text-gray-500">
                  {item.label}
                </span>
                {item.options.map((opt, idx) => (
                  <Link
                    key={opt}
                    href={item.links[idx]}
                    className="px-2 py-1 gap-3 rounded-lg text-md flex items-center hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    <FontAwesomeIcon icon={item.icons[idx]} />
                    <p>{opt}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
