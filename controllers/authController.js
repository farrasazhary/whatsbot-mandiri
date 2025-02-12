import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  };

const createResToken = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const cookieOption = {
        expire: new Date(
            Date.now()+30*24*60*60*1000
        ),
        httpOnly: true,
        security: false
    }

    res.cookie("jwt", token, cookieOption)

    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        user
    })
}

export const registerUser = asyncHandler(async (req, res) => {
  const ifFirstUser = (await User.countDocuments()) === 0 ? "admin" : "user";

  const user = await User.create({
    nama: req.body.nama,
    email: req.body.email,
    password: req.body.password,
    role: ifFirstUser,
  });

  createResToken(user, 201, res);
});

export const loginUser = asyncHandler(async (req, res) => {
  //Validasi ketika inputan kosong
  if (!req.body.email && !req.body.password) {
    res.status(400);
    throw new Error("Email and Password are required");
  }

  //Validasi ketika email & password salah
  const userData = await User.findOne({ email: req.body.email });

  if (userData && (await userData.matchPassword(req.body.password))) {
    createResToken(userData, 200, res);
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

export const currentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if(user) {
    res.status(200).json({
      user
    }) 
  } else {
    res.status(400);
    throw new Error("User not found");
  }
})

export const logoutUser = async(req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expire: new Date(Date.now())
    })

    res.status(200).json({
        message: "Logged out successfully"
    })
}