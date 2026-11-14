import { generateToken } from '../lib/utils.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }
        
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, 
            email, 
            password: hashedPassword, 
            bio
        });

        const token = generateToken(newUser._id);

        res.json({ 
            success: true, 
            userData: newUser, 
            token, 
            message: "Account created successfully" 
        });

    } catch (error) {
        console.log("Signup error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.json({ success: false, message: "Please provide email and password" });
        }

        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({ success: false, message: "User does not exist" });
        }

        // FIXED: Replaced 'process' with 'password'
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        // FIXED: Changed 'newUser' to 'userData'
        res.json({ 
            success: true, 
            userData, 
            token, 
            message: "Login successful" 
        });
    } catch (error) {
        console.log("Login error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, userData: req.user });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        // FIXED: Upload to Cloudinary if profilePic is provided
        if (profilePic) {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { profilePic: upload.secure_url, bio, fullName }, 
                { new: true }
            );
        } else {
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { bio, fullName }, 
                { new: true }
            );
        }

        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.log("Update profile error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};