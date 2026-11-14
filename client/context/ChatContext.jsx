
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // Fetch all registered users except logged-in user
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");

            console.log("Sidebar API response:", data);

            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(data.unseenMessages || {});
            } else {
                console.error("Get users failed:", data.message);
                toast.error(data.message || "Unable to load users");
            }
        } catch (error) {
            console.error("Get users error:", error.response?.data || error.message);
            toast.error(
                error.response?.data?.message || "Failed to fetch users"
            );
        }
    };

    // Fetch messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Get messages error:", error);
            toast.error(error.message);
        }
    };

    // Send message
    const sendMessage = async (messageData) => {
        if (!selectedUser) return;

        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Subscribe to new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);

                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]:
                        (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser, axios]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
