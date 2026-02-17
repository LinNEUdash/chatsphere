// src/app/page.tsx
"use client";

import { useState, useCallback } from "react";
import { Conversation } from "@/types";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";

const generateId = () => Math.random().toString(36).substring(2, 15);

function createNewConversation(): Conversation {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([
    createNewConversation(),
  ]);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);

  const activeConversation = conversations.find((c) => c.id === activeId)!;

  // Create a new conversation
  const handleNewChat = useCallback(() => {
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  }, []);

  // Switch to a conversation
  const handleSelectChat = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  // Delete a conversation
  const handleDeleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        // If we deleted the active one, switch to another or create new
        if (id === activeId) {
          if (filtered.length === 0) {
            const newConv = createNewConversation();
            setActiveId(newConv.id);
            return [newConv];
          }
          setActiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeId]
  );

  // Update conversation when messages change
  const handleConversationUpdate = useCallback(
    (messages: Conversation["messages"]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;

          // Auto-generate title from first user message
          let title = c.title;
          if (title === "New Chat" && messages.length > 0) {
            const firstUserMsg = messages.find((m) => m.role === "user");
            if (firstUserMsg) {
              title =
                firstUserMsg.content.length > 35
                  ? firstUserMsg.content.substring(0, 35) + "..."
                  : firstUserMsg.content;
            }
          }

          return { ...c, messages, title, updatedAt: new Date() };
        })
      );
    },
    [activeId]
  );

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
        <ChatWindow
          key={activeId}
          initialMessages={activeConversation.messages}
          onMessagesChange={handleConversationUpdate}
        />
      </div>
    </main>
  );
}
