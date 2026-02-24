// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

// GET: List all conversations for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const conversations = await Conversation.find({ userId: session.user.id })
    .select("title messages createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json(conversations);
}

// POST: Create a new conversation
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const conversation = await Conversation.create({
    userId: session.user.id,
    title: "New Chat",
    messages: [],
  });

  return NextResponse.json(conversation);
}
