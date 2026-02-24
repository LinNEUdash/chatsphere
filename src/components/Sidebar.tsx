// src/components/Sidebar.tsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Conversation } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import clsx from "clsx";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  const getConvId = (conv: Conversation) => conv._id || conv.id;

  return (
    <aside
      className={clsx(
        "flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo + collapse button */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
              ChatSphere
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* New chat button */}
      <div className="px-3">
        <button
          onClick={onNewChat}
          className={clsx(
            "flex w-full items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 p-2.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
            isCollapsed && "justify-center"
          )}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversation list */}
      <div className="mt-4 flex-1 overflow-y-auto px-3 space-y-1">
        {conversations.length === 0 && !isCollapsed && (
          <p className="px-2 text-xs text-gray-400 dark:text-gray-500">
            No conversations yet
          </p>
        )}
        {isCollapsed
          ? conversations.map((conv) => (
              <button
                key={getConvId(conv)}
                onClick={() => onSelectChat(getConvId(conv))}
                className={clsx(
                  "flex w-full justify-center rounded-lg p-2 transition-colors",
                  getConvId(conv) === activeId
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                )}
              >
                <MessageSquare
                  className={clsx(
                    "h-4 w-4",
                    getConvId(conv) === activeId
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                />
              </button>
            ))
          : conversations.map((conv) => (
              <div
                key={getConvId(conv)}
                className={clsx(
                  "group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                  getConvId(conv) === activeId
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                )}
                onClick={() => onSelectChat(getConvId(conv))}
              >
                <MessageSquare
                  className={clsx(
                    "h-4 w-4 shrink-0",
                    getConvId(conv) === activeId
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                />
                <span className="flex-1 truncate text-sm">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(getConvId(conv));
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 transition-opacity hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                </button>
              </div>
            ))}
      </div>

      {/* Bottom: user info + theme + sign out */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={clsx(
            "flex w-full items-center gap-2 rounded-lg p-2 text-sm text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700",
            isCollapsed && "justify-center"
          )}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          {!isCollapsed && (
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          )}
        </button>

        {/* User info + sign out */}
        {session?.user && (
          <div
            className={clsx(
              "flex items-center gap-2 rounded-lg p-2",
              isCollapsed && "justify-center"
            )}
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="h-6 w-6 rounded-full shrink-0"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-blue-600 shrink-0" />
            )}
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate text-xs text-gray-600 dark:text-gray-400">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
