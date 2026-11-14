
import { createContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    const socketRef = useRef(null);

    // Connect Socket.IO
    const connectSocket = useCallback((userData) => {
        if (!userData?._id || !backendUrl) return;

        // Prevent duplicate connections for the same user
        if (socketRef.current?.io?.opts?.query?.userId === userData._id) {
            if (!socketRef.current.connected) {
                socketRef.current.connect();
            }
            return;
        }

        // Disconnect previous socket
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

    }, []);

    // Check authentication
    const checkAuth = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/auth/check");

            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    }, [connectSocket]);

    // Login / Signup
    const login = async (state, credentials) => {
        try {
            const endpoint = `/api/auth/${state.toLowerCase()}`;
            const { data } = await axios.post(endpoint, credentials);

            if (data.success) {
                axios.defaults.headers.common["token"] = data.token;

                setAuthUser(data.userData);
                setToken(data.token);
                localStorage.setItem("token", data.token);

                connectSocket(data.userData);

                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    };

    // Logout
    const logout = async () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["token"];

        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);

        socketRef.current?.disconnect();
        socketRef.current = null;
        setSocket(null);

        toast.success("Logged out successfully");
    };

    // Update profile
    const updataProfile = async (body) => {
        try {
            const { data } = await axios.put(
                "/api/auth/update-profile",
                body
            );

            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            } else {
                toast.error(data.message || "Profile update failed");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    };

    // Check authentication when token exists
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, [token, checkAuth]);

    // Cleanup socket on unmount
    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updataProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
