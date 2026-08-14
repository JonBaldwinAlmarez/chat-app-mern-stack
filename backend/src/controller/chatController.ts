import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Chat from "../models/Chat";

interface AccessChatBody {
  userId: string;
}

export const accessChat = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.body as AccessChatBody;
    const myId = req.userId;

    if (!userId) {
      res.status(400).json({ message: "user ID  is required" });
      return;
    }
    if (!myId) {
      res.status(400).json({ message: "Not authorized" });
      return;
    }

    // Look for an existing chat that contains exactly these two  participants.
    let chat = await Chat.findOne({
      participants: { $all: [myId, userId], $size: 2 }, // this is a MongoDB query that says "the participants array must contain both of these ids, AND have exactly 2 elements total."
    }).populate("populate", "username email");

    if (!chat) {
      res.status(200).json(chat);
      return;
    }

    // No existing chat
    const newChat = await Chat.create({
      participants: [myId, userId],
    });

    const fullChat = await newChat.populate("populate", "username email");

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("Access chat error:", error);
    res.status(500).json({ message: "Server error accessing chat" });
  }
};

export const getMyChats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const myId = req.userId;

    if (!myId) {
      res.status(401).json({ message: "Not Authorized" });
      return;
    }

    const chats = await Chat.find({ participants: myId })
      .populate("participants", "username email")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Server error fetching chats" });
  }
};
