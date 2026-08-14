import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Chat from "../models/Chat";

interface AccessChatBody {
  userId: string;
}

// Accesses an existing one-to-one chat or creates a new chat
// between the authenticated user and the specified user.
export const accessChat = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Extract the target user's ID from the request body.
    const { userId } = req.body as AccessChatBody;

    // Retrieve the authenticated user's ID from the authentication middleware.
    const myId = req.userId;

    // Validate that a target user ID was provided.
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Ensure that the request has been authenticated successfully.
    if (!myId) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Search for an existing one-to-one chat between the two users.
    // $all ensures both user IDs are present in the participants array.
    // $size ensures that the chat contains exactly two participants.
    let chat = await Chat.findOne({
      participants: {
        $all: [myId, userId],
        $size: 2,
      },
    }).populate("participants", "username email");

    // Return the existing chat if one is already available.
    if (chat) {
      res.status(200).json(chat);
      return;
    }

    // Create a new chat when no existing conversation is found.
    const newChat = await Chat.create({
      participants: [myId, userId],
    });

    // Populate participant information before returning the newly created chat.
    const fullChat = await newChat.populate("participants", "username email");

    // Return the newly created chat.
    res.status(201).json(fullChat);
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.error("Access chat error:", error);

    // Return a generic server error without exposing internal details.
    res.status(500).json({
      message: "Server error accessing chat",
    });
  }
};

// Retrieves all chat conversations that include the authenticated user.
export const getMyChats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve the authenticated user's ID from the authentication middleware.
    const myId = req.userId;

    // Ensure that the request has been authenticated successfully.
    if (!myId) {
      res.status(401).json({
        message: "Not authorized",
      });
      return;
    }

    // Find all chats where the authenticated user is a participant.
    // Populate participant details and sort conversations by most recently updated.
    const chats = await Chat.find({ participants: myId })
      .populate("participants", "username email")
      .sort({ updatedAt: -1 });

    // Return the authenticated user's chat conversations.
    res.status(200).json(chats);
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.error("Get chats error:", error);

    // Return a generic server error without exposing internal details.
    res.status(500).json({
      message: "Server error fetching chats",
    });
  }
};
