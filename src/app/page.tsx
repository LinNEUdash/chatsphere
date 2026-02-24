// src/app/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Conversation, Message } from "@/types";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import { Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);

  const activeConversation = conversations.find(
    (c) => (c._id || c.id) === activeId
  );

  // Load conversations from MongoDB on login
  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoadingConvs(false);
      return;
    }

    const loadConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          if (data.length > 0) {
            setActiveId(data[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoadingConvs(false);
      }
    };

    loadConversations();
  }, [status]);

  // Create a new conversation
  const handleNewChat = useCallback(async () => {
    if (!session) return;

    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv._id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }, [session]);

  // Switch to a conversation
  const handleSelectChat = useCallback(async (id: string) => {
    setActiveId(id);
  }, []);

  // Delete a conversation
  const handleDeleteChat = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/conversations/${id}`, { method: "DELETE" });

        setConversations((prev) => {
          const filtered = prev.filter((c) => (c._id || c.id) !== id);
          if (id === activeId) {
            if (filtered.length === 0) {
              setActiveId(null);
              return [];
            }
            setActiveId(filtered[0]._id || filtered[0].id);
          }
          return filtered;
        });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    },
    [activeId]
  );

  // Update conversation when messages change
  const handleConversationUpdate = useCallback(
    async (messages: Message[]) => {
      if (!activeId) return;

      // Auto-generate title from first user message
      let title = activeConversation?.title || "New Chat";
      if (title === "New Chat" && messages.length > 0) {
        const firstUserMsg = messages.find((m) => m.role === "user");
        if (firstUserMsg) {
          title =
            firstUserMsg.content.length > 35
              ? firstUserMsg.content.substring(0, 35) + "..."
              : firstUserMsg.content;
        }
      }

      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          (c._id || c.id) === activeId ? { ...c, messages, title } : c
        )
      );

      // Save to MongoDB
      try {
        await fetch(`/api/conversations/${activeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, title }),
        });
      } catch (error) {
        console.error("Failed to save conversation:", error);
      }
    },
    [activeId, activeConversation?.title]
  );

  // Loading state
  if (status === "loading" || isLoadingConvs) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not logged in - show landing page
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6 px-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ChatSphere
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your AI-powered chat assistant with conversation history,
            multi-session support, and real-time streaming responses.
          </p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Logged in - show chat
  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1">
        {activeConversation ? (
          <ChatWindow
            key={activeId}
            initialMessages={activeConversation.messages || []}
            onMessagesChange={handleConversationUpdate}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
              <p className="text-gray-500 dark:text-gray-400">
                Create a new chat to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
