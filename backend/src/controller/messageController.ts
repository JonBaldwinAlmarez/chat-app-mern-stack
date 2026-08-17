import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Message from "../models/Message";
import Chat from "../models/Chat";

interface SendMessageBody {
  chatId: string;
  text: string;
}

// Creates and sends a new message within an existing chat conversation.
export const sendMessage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Extract the chat ID and message content from the request body.
    const { chatId, text } = req.body as SendMessageBody;

    // Retrieve the authenticated user's ID from the authentication middleware.
    const senderId = req.userId;

    // Validate that both the chat ID and message content are provided.
    if (!chatId || !text) {
      res.status(400).json({
        message: "Chat ID and text are required",
      });
      return;
    }

    // Ensure that the request has been authenticated successfully.
    if (!senderId) {
      res.status(401).json({
        message: "Not authorized",
      });
      return;
    }

    // Retrieve the chat associated with the provided chat ID.
    const chat = await Chat.findById(chatId);

    // Return a 404 error if the requested chat does not exist.
    if (!chat) {
      res.status(404).json({
        message: "Chat not found",
      });
      return;
    }

    // Check whether the authenticated user is included in the chat participants.
    // Convert the MongoDB ObjectId to a string before comparing it with senderId.
    const isParticipant = chat.participants.some(
      (participantId) => participantId.toString() === senderId,
    );

    // Prevent users who are not participants from accessing the chat.
    if (!isParticipant) {
      res.status(403).json({
        message: "You are not part of this chat",
      });
      return;
    }

    // Create and store the new message in the database.
    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      text,
    });

    // Retrieve the newly created message and populate the sender's
    // public information before returning it to the client.
    const fullMessage = await Message.findById(message._id).populate(
      "sender",
      "username email",
    );

    // Return the newly created message with a successful creation status.
    res.status(201).json(fullMessage);
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.error("Send message error:", error);

    // Return a generic server error without exposing internal details.
    res.status(500).json({
      message: "Server error sending message",
    });
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve the chat ID from the request parameters.
    const { chatId } = req.params;

    // Validate that a chat ID was provided.
    if (!chatId) {
      res.status(400).json({
        message: "Chat ID is required",
      });
      return;
    }

    // Retrieve all messages belonging to the specified chat.
    // Populate the sender's public information and sort messages
    // chronologically from oldest to newest.
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    // Return the retrieved messages to the client.
    res.status(200).json(messages);
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.error("Get messages error:", error);

    // Return a generic server error without exposing internal details.
    res.status(500).json({
      message: "Server error fetching messages",
    });
  }
};
