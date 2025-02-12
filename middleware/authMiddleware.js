import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookies.jwt
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select("-password")
            next()
        } catch (error) {
            res.status(401)
            throw new Error("Not authorized, no token")
        }
    } else {
        res.status(401)
        throw new Error("Not authorized, no token")
    }
})

export const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        res.status(401)
        throw new Error("Not authorized as an admin")
    }
}