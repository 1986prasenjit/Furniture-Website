import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating accessToken and refreshToken"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    return next(
      new ApiError(
        409,
        " Sorry, Authentication failed, Email-ID already exists"
      )
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  if (!newUser) {
    return next(new ApiError(500, "Error while creating the User"));
  }
  console.log(`Newly created User is: ${newUser}`);
  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User is Registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  //get the data from req.body
  const { email, password, name } = req.body;

  //validate the data in the database
  const user = await User.findOne({ $or: [{ email }, { name }] });
  if (!user) {
    return next(new ApiError(401, "Invalid User Credentials User not found"));
  }

  //match the password
  const isMatched = await user.isPasswordCorrect(password);
  if (!isMatched) {
    return next(
      new ApiError(
        401,
        "Invalid User Credentials, Incorrect Email-ID or Password"
      )
    );
  }
  //generate the accessToken andrefreshToken
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //Save refresh token in DB
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //cookie Options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

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
          accessToken,
        },
        "User Logged In Successful"
      )
    );
});

const getProfile = asyncHandler(async (req, res, next) => {
  const userID = req.user;

  if (!userID) {
    return next(
      new ApiError(401, "Request Profile Not Found, Invalid User Credencials")
    );
  }

  const user = await User.findById(userID).select("-password -refreshToken");

  if (!user) {
    return next(new ApiError(401, "Request User Not Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Fetched Successfully"));
});

const logOutUser = asyncHandler(async (req, res, next) => {
  const loggedOut = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  console.log("loggedOutInfo", loggedOut);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

export { getProfile, loginUser, logOutUser, registerUser };
