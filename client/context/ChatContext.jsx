
import React, { useEffect, useState, createContext, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // Get all users
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");

            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(data.unseenMessages || {});
            } else {
                toast.error(data.message || "Failed to load users");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Get messages of selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if (data.success) {
                setMessages(data.messages || []);
            } else {
                toast.error(data.message || "Failed to load messages");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Send message to selected user
    const sendMessage = async (messageData) => {
        try {
            if (!selectedUser?._id) {
                toast.error("Please select a user first");
                return;
            }

            const { data } = await axios.post(
                `/api/messages/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    data.message
                ]);
            } else {
                toast.error(data.message || "Failed to send message");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Subscribe to new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (
                selectedUser &&
                newMessage.senderId === selectedUser._id
            ) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { ...newMessage, seen: true }
                ]);

                axios.put(`/api/messages/${newMessage._id}`)
                    .catch((error) => {
                        console.error("Failed to mark message as seen:", error);
                    });
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]:
                        (prev[newMessage.senderId] || 0) + 1
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
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
