import { exportCookies, generateToken, storeRefreshToken } from "../../libs/jwt.js";
import { serverLogger } from "../../logs/server/logger.js"
import User from "../../model/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { redis } from "../../libs/redis.js";
dotenv.config();

export const signUpController = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;
        console.log('Registration request received:', req.body);
        serverLogger.info("Signing up: ", fullname);

        if (!fullname || !username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields should be filled" })
        }

        // Check if username exists (MySQL method)
        const findUserName = await User.findByUsername(username);
        if (findUserName) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        // Check if email exists (MySQL method)
        const findEmail = await User.findByEmail(email);
        if (findEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Create user (MySQL method)
        const user = await User.create({
            fullname,
            username,
            email,
            password
        });

        const { accessToken, refreshToken } = generateToken(user.id);
        await storeRefreshToken(user.id, refreshToken);
        exportCookies(res, accessToken, refreshToken)

        // Remove password from response
        delete user.password;

        return res.status(201).json({
            success: true,
            message: `${username} signedUp`,
            user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Signup error:', error);
        serverLogger.error({ name: error.name, message: error.message, stack: error.stack });
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);
        serverLogger.info("Login started");
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Fields shouldn't be empty" });
        }

        // Find user by username (MySQL method)
        console.log('Searching for user in database...');
        const findUserName = await User.findByUsername(username);
        console.log('User found:', findUserName ? 'Yes' : 'No');
        if (!findUserName) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        // Validate password (MySQL method)
        console.log('Validating password...');
        const validPassword = await User.validatePassword(password, findUserName.password);
        console.log('Password valid:', validPassword);
        if (!validPassword) {
            return res.status(404).json({ success: false, message: "Invalid Credentials" });
        }

        console.log('Generating tokens...');
        const { accessToken, refreshToken } = generateToken(findUserName.id);
        console.log('Storing refresh token...');
        await storeRefreshToken(findUserName.id, refreshToken);
        console.log('Setting cookies...');
        exportCookies(res, accessToken, refreshToken);

        // Remove password from response
        delete findUserName.password;

        console.log('Login successful for:', findUserName.username);
        return res.status(200).json({ success: true, message: `${findUserName.username} loggedin successfully`, user: findUserName })
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const logoutController = async (req, res) => {
    try {
        const cookie = req.cookies.refreshToken;
        if (!cookie) {
            return res.status(404).json({ success: false, message: "No token provided" });
        }
        const decodeToken = jwt.verify(cookie, process.env.REFRESH_TOKEN_KEY);
        if (!decodeToken) {
            return res.status(404).json({ success: false, message: "False token" });
        }

        await redis.del(`refresh_token:${decodeToken?.userId}`);

        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");

        return res.status(202).json({ success: true, message: `User loggedOut successfully` })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const refreshTokenController = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(404).json({ success: false, message: "Couldn't find token" });
        }

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
        if (!decodedToken) {
            return res.status(404).json({ success: false, message: "Invalid Token" });
        }

        const storedTokenRedis = await redis.get(`refresh_token:${decodedToken?.userId}`);
        if (!storedTokenRedis) {
            return res.status(404).json({ success: false, message: "Couldn't get token from database" });
        }

        if (storedTokenRedis !== token) {
            return res.status(401).json({ success: false, message: "Invalid Token" });
        }

        const newAccessToken = jwt.sign({ userId: decodedToken.userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });
        res.cookie("accessToken", newAccessToken, {
            maxAge: 15 * 60 * 1000,
            sameSite: 'strict',
            httpOnly: true
        })

        return res.status(200).json({ success: true, message: "Token refreshed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const getProfile = async function (req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(403).json({ success: false, message: "Info not provided from token" });
        }
        return res.status(200).json({ success: true, message: "User found", user });
    } catch (error) {
        serverLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}
