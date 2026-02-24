// src/types/index.ts

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  _id?: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequestBody {
  messages: Pick<Message, "role" | "content">[];
}
