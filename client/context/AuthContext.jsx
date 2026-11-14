
import { createContext, useEffect, useState, useCallback } from "react";
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

    // Connect socket function
    const connectSocket = useCallback((userData) => {
        if (!userData?._id) return;

        setSocket((prevSocket) => {
            // Avoid creating duplicate connections for the same user
            if (
                prevSocket &&
                prevSocket.connected &&
                prevSocket.io.opts.query?.userId === userData._id
            ) {
                return prevSocket;
            }

            // Disconnect an existing socket before creating a new one
            if (prevSocket) {
                prevSocket.disconnect();
            }

            const newSocket = io(backendUrl, {
                query: {
                    userId: userData._id,
                },
            });

            newSocket.on("getOnlineUsers", (userIds) => {
                setOnlineUsers(userIds);
            });

            return newSocket;
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

    // Login / Signup function
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

    // Logout function
    const logout = async () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["token"];

        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);

        if (socket) {
            socket.disconnect();
            setSocket(null);
        }

        toast.success("Logged out successfully");
    };

    // Update profile function
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

    // Check authentication when a token exists
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, [token, checkAuth]);

    // Clean up socket when the provider unmounts
    useEffect(() => {
        return () => {
            setSocket((prevSocket) => {
                prevSocket?.disconnect();
                return null;
            });
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
