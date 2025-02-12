import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        mssage: "Get all users",
        data: users
    });
})