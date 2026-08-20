import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </div>
  );
};

export default Chat;
