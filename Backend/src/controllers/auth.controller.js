import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const generateAccessAndRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating accessToken and refreshToken")
  }
}

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
  const { email, password, name } = req.body;

  //validate the data in the database
  const user = await User.findOne(
    { $or: [{ email }, { name }] }
  );
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
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  //Save refresh token in DB
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  //cookie Options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }

  //send the success response
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken
        },
        "User Logged In Successful"
      )
    );
})

const getProfile = asyncHandler(async (req, res) => {
  const userID = req.user;

  if (!userID) {
    return res
      .status(401)
      .json(
        new ApiError(
          401,
          "Request Profile Not Found",
          [
            { field: userID, message: "Invalid User Credencials" }
          ]
        )
      )
  }

  const user = await User.findById(userID).select("-password -refreshToken");

  if (!user) {
    return res
      .status(401)
      .json(
        new ApiError(401, "Request User Not Found",))
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User Fetched Successfully")
  )
})

const logOutUser = asyncHandler(async (req, res) => {
  const loggedOut = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      }
    }
  )
  console.log("loggedOutInfo",loggedOut);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }

  return res
    .status(200)
    .clearCookie("refreshToken",cookieOptions)
    .clearCookie("accessToken",cookieOptions)
    .json(
      new ApiResponse(200, {}, "User Logged Out Successfully")
    )
})

export { registerUser, loginUser, getProfile, logOutUser };