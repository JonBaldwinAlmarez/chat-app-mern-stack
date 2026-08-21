import { useState, useEffect } from "react";
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

const Chat = () => {
  // Retrieve the authenticated user and logout function from the auth context.
  const { user, logout } = useAuth();

  // Stores the chat conversations associated with the authenticated user.
  const [chats, setChats] = useState<ChatType[]>([]);

  // Tracks whether the chat list is currently being retrieved from the API.
  const [isLoadingChats, setIsLoadingChats] = useState(true);

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
