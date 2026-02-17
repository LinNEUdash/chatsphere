// src/components/MessageBubble.tsx
"use client";

import { Message } from "@/types";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={clsx(
        "group flex gap-4 px-4 py-6 transition-colors",
        isUser
          ? "bg-transparent dark:bg-transparent"
          : "bg-gray-50/80 dark:bg-gray-800/50"
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600"
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isUser ? "You" : "ChatSphere AI"}
          </p>
          {/* Copy button - visible on hover */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Copy response"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-gray-400" />
              )}
            </button>
          )}
        </div>

        {isUser ? (
          <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {message.content}
          </div>
        ) : (
          <div className="markdown-content text-sm text-gray-800 dark:text-gray-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
