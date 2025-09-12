import { searchPosts, searchUsers } from "@/app/lib/api/search";
import { getRecommendedPosts } from "@/app/lib/api/views";
import PostCard from "@/components/PostCard";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { Themes } from "../lib/constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default async function Home({
  searchParams,
}: {
  searchParams: { query?: string; mode?: "posts" | "users"; theme?: string };
}) {
  const query = searchParams.query || "";
  const mode = searchParams.mode || "posts";
  const selectedTheme = searchParams.theme || "";

  let results: any[] = [];

  if (!query.trim()) {
    results = await getRecommendedPosts(3, selectedTheme);
  } else {
    if (mode === "posts") {
      results = await searchPosts(query);
    } else {
      results = await searchUsers(query);
    }
  }

  if (selectedTheme && mode === "posts") {
    results = results.filter(post => post.postTheme === selectedTheme);
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {!query && <h2 className="text-xl font-bold mb-4">Рекомендованное</h2>}

      <div className="flex items-center gap-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <FontAwesomeIcon icon={faList} />
              <p>Сортировка по теме</p>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/" className="w-full cursor-pointer">
                Все темы
              </Link>
            </DropdownMenuItem>
            {Themes.map((theme) => (
              <DropdownMenuItem key={theme} asChild>
                <Link 
                  href={`/?theme=${encodeURIComponent(theme)}`} 
                  className="w-full cursor-pointer"
                >
                  {theme}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedTheme && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Тема:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              {selectedTheme}
            </span>
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              × Очистить
            </Link>
          </div>
        )}
      </div>

      {mode === "posts" ? (
        <div className="flex flex-col gap-6">
          {results.map((post) => (
            <PostCard key={post.id} post={post} user={post.user} />
          ))}
          {results.length === 0 && (
            <p className="text-gray-500">
              {selectedTheme ? `Нет постов в теме "${selectedTheme}"` : "Ничего не найдено"}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Image
                src={user.avatar || "/file.svg"}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {user.bio}
                </p>
              </div>
            </Link>
          ))}
          {results.length === 0 && (
            <p className="text-gray-500">Ничего не найдено</p>
          )}
        </div>
      )}
    </div>
  );
}