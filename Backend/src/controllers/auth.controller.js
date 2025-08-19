import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import bcrypt from "bcryptjs";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({
    email
  });

  if (existingUser) {
    return res.status(409).json(
      new ApiError(
        409,
        "Validation failed",
        [
          { field: "email", message: "Sorry, Email-ID already exists" }
        ]
      )
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
  })

  if (!newUser) {
    return res
      .status(500)
      .json(
        new ApiError(500, "Error while creating the User")
      )
  }
  console.log(`Newly created User is: ${newUser}`);
  return res
    .status(201)
    .json(
      new ApiResponse(200, newUser, "User is Registered successfully"));

})

const loginUser = asyncHandler(async (req, res) => {
  //get the data from req.body
  const { email, password } = req.body;

  //validate the data in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(401)
      .json(
        new ApiError(
          401,
          "Invalid User Credentials",
          [
            { field: "email", message: "Invalid User Credentials User not found" },
          ]
        )
      )
  }

  //match the password
  const isMatched = await user.isPasswordCorrect(password);
  if (!isMatched) {
    return res
      .status(401)
      .json(
        new ApiError(
          401,
          "Invalid User Credentials",
          [
            { message: "Incorrect Email-ID or Password" },
          ]
        )
      )
  }
  //generate the accessToken andrefreshToken
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  //Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave:false });

  //cookie Options
  const cookieOptions = {
    httpOnly:true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }

  //Send refresh token in HttpOnly cookie
  res.cookie("refreshToken", refreshToken, cookieOptions);

  //customising user response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isEmailverified: user.isEmailverified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }; 


  //send the success response
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: userResponse, accessToken },
      "Login successful"
    )
  );
})

export { registerUser, loginUser };