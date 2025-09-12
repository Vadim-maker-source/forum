"use client";

import { useState } from "react";
import Link from "next/link";
import { SidebarContent, SidebarGroup, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faUser, faImage, faSquarePollHorizontal } from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { label: "Главная", icon: <FontAwesomeIcon icon={faHouse} />, href: "/" },
  { label: "Профиль", icon: <FontAwesomeIcon icon={faUser} />, href: "/profile/1" }, // подставь актуальный id
  {
    label: "Создать",
    icon: <FontAwesomeIcon icon={faPlus} />,
    options: ["Пост", "Опрос"],
    links: ["/create-post", "/create-opros"],
    icons: [faImage, faSquarePollHorizontal]
  },
];

export default function SidebarComponent({ className }: { className: string }) {
  const [expanded, setExpanded] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <SidebarProvider className={cn(className)}>
      

      {/* Sidebar */}
      <SidebarGroup
        className={`${
          expanded ? "w-56" : "w-8 md:w-20"
        } hidden md:flex flex-col border-r bg-white dark:bg-gray-900 transition-all`}
      >
        <SidebarTrigger onClick={() => setExpanded(!expanded)} className="self-end p-2 text-gray-500">
          
        </SidebarTrigger>

        <SidebarContent className="flex flex-col gap-1 p-2">
          {navItems.map((item) =>
            item.options ? (
              <div key={item.label} className="relative">
                <button
                  className={`w-full flex items-center ${!expanded && "justify-center"} gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
                  onClick={() => setCreateOpen((p) => !p)}
                >
                  {item.icon}
                  {expanded && <span className="text-lg">{item.label}</span>}
                </button>
                {createOpen && expanded && (
                  <div className="ml-9 my-1 flex flex-col">
                    {item.options.map((opt, idx) => (
                      <Link
                        key={opt}
                        href={item.links[idx]}
                        className="px-3 py-2 gap-1 text-md flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <FontAwesomeIcon icon={item.icons[idx]} />
                        <p>{opt}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center ${!expanded && "justify-center"} gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
              >
                {item.icon}
                {expanded && <span className="text-lg">{item.label}</span>}
              </Link>
            )
          )}
        </SidebarContent>
      </SidebarGroup>

      
    </SidebarProvider>
  );
}
