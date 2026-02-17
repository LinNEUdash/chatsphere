// src/components/ChatWindow.tsx
"use client";

import {
  useState,
  useRef,
  useEffect,
  FormEvent,
  KeyboardEvent,
} from "react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import {
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  Code,
  Lightbulb,
} from "lucide-react";
import clsx from "clsx";

interface ChatWindowProps {
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

export default function ChatWindow({
  initialMessages = [],
  onMessagesChange,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Notify parent of message changes
  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    onMessagesChange?.(newMessages);
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Send message and handle streaming response
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    updateMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    const withAssistant = [...updatedMessages, assistantMessage];
    setMessages(withAssistant);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            fullContent += parsed.content;

            // Update assistant message content in real-time
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: fullContent }
                  : m
              )
            );
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Final update to parent with complete message
      const finalMessages = updatedMessages.concat({
        ...assistantMessage,
        content: fullContent,
      });
      onMessagesChange?.(finalMessages);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessages = updatedMessages.concat({
        ...assistantMessage,
        content: "Sorry, something went wrong. Please try again.",
      });
      updateMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    { icon: <Code className="h-4 w-4" />, text: "Explain React hooks simply" },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      text: "Help me debug my code",
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Suggest project ideas",
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            ChatSphere
          </h1>
        </div>
        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
          Powered by Gemini
        </span>
      </header>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-sm">
              <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Welcome to ChatSphere
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your AI-powered assistant — ask anything to get started
              </p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => setInput(suggestion.text)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 transition-all hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-sm"
                >
                  {suggestion.icon}
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                <div className="flex gap-1">
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-colors">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="max-h-[200px] flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className={clsx(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                input.trim() && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
            ChatSphere may produce inaccurate information. Verify important
            facts.
          </p>
        </div>
      </div>
    </div>
  );
}
