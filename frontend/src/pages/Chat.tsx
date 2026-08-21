import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// Represents the user information returned by the API.
interface User {
  _id: string;
  username: string;
  email: string;
}

// Represents a one-to-one chat conversation.
interface ChatType {
  _id: string;
  participants: User[];
  createdAt: string;
  updatedAt: string;
}

interface MessageType {
  _id: string;
  chat: string;
  sender: User;
  text: string;
  createdAt: string;
}

const Chat = () => {
  // Retrieve the authenticated user and logout function from the auth context.
  const { user, logout } = useAuth();

  // Stores the chat conversations associated with the authenticated user.
  const [chats, setChats] = useState<ChatType[]>([]);

  // Tracks whether the chat list is currently being retrieved from the API.
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Stores the messages belonging to the currently selected chat.
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Stores the chat conversation currently selected by the user.
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);

  // Tracks whether messages are currently being fetched from the API.
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Stores the text currently being entered for a new message.
  const [newMessageText, setNewMessageText] = useState("");

  // Stores the email address used when starting a new chat.
  const [newChatEmail, setNewChatEmail] = useState("");

  // Stores an error message encountered while attempting to start a new chat.
  const [startChatError, setStartChatError] = useState("");

  // Fetch the user's conversations when the component is mounted.
  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Request the authenticated user's chat conversations from the API.
        const response = await api.get("chats");

        // Store the retrieved conversations in component state.
        setChats(response.data);
      } catch (error) {
        // Log the error for debugging if the API request fails.
        console.error("Failed to fetch chats:", error);
      } finally {
        // Stop displaying the loading state regardless of request outcome.
        setIsLoadingChats(false);
      }
    };

    fetchChats();
  }, []);

  // Fetch messages whenever selectedChat changes
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    // Fetch messages
    const fecthMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedChat._id}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to Fetch Message: ", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fecthMessages();
  }, [selectedChat]);

  // Send a message
  const handleSendMessage = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!newMessageText.trim() || !selectedChat) return;

    try {
      const response = await api.post("/message", {
        chatId: selectedChat._id,
        text: newMessageText,
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessageText("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleStartChat = async (e: FormEvent): Promise<void> => {
    // Prevent the form from reloading the page when submitted.
    e.preventDefault();

    try {
      // Search for the user using the email address provided in the form.
      // encodeURIComponent safely encodes the email before adding it to the URL.
      const foundUserRes = await api.get(
        `/auth/find?email=${encodeURIComponent(newChatEmail)}`,
      );

      // Extract the matched user's ID from the API response.
      const otherUserId = foundUserRes.data._id;

      // Access an existing chat or create a new chat with the selected user.
      const chatRes = await api.post("/chats", {
        userId: otherUserId,
      });

      // Add the chat to the list only if it does not already exist.
      setChats((prev) => {
        const exists = prev.some((chat) => chat._id === chatRes.data._id);

        return exists ? prev : [chatRes.data, ...prev];
      });

      // Automatically select the newly accessed or created chat.
      setSelectedChat(chatRes.data);

      // Clear the email input after successfully starting the chat.
      setNewChatEmail("");
    } catch (error) {
      // Log the error for server-side debugging.
      console.error("Failed to start chat:", error);

      // Display a user-friendly error message when the request fails.
      setStartChatError("User not found or something is wrong");
    }
  };

  // Finds the other participant in a one-to-one conversation.
  // The authenticated user is excluded from the result.
  const getOtherParticipant = (chat: ChatType): User | undefined => {
    return chat.participants.find(
      (participant) => participant._id !== user?.id,
    );
  };

  return (
    <div className="flex">
      <div>
        {/* Display the authenticated user's information and logout action. */}
        <h2>{user?.username}</h2>

        <button type="button" onClick={logout}>
          Log out
        </button>

        <h3>Chats</h3>

        {/* Display a loading indicator while conversations are being fetched. */}
        {isLoadingChats && <p>Loading Chats....</p>}

        {/* Inform the user when no conversations are available. */}
        {!isLoadingChats && chats.length === 0 && <p>No Chats</p>}

        {/* Render the user's conversations once they have been loaded. */}
        <ul>
          {chats.map((chat) => {
            // Determine which participant represents the other user.
            const other = getOtherParticipant(chat);

            return <li key={chat._id}>{other?.username ?? "Unknown User"}</li>;
          })}
        </ul>
      </div>

      {/* Message area displayed until the user selects a conversation. */}
      <div>
        <p>Select a chat to start messaging</p>
      </div>
    </div>
  );
};

export default Chat;
