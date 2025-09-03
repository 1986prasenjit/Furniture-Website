import crypto from "crypto";
import nodemailer from "nodemailer";
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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new ApiError(409, "Sorry, Authentication failed, Email-ID already exists")
    );
  }

  const newUser = await User.create({ name, email, password });
  if (!newUser) {
    return next(new ApiError(500, "Error while creating the User"));
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    newUser.generateTemporyToken();

  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationExpiry = tokenExpiry;
  await newUser.save({ validateBeforeSave: false });

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  const mailtrapOptions = {
    from: process.env.MAILTRAP_SENDEREMAIL,
    to: newUser.email,
    subject: "Verify your Email",
    text: `Please click on the following link: ${process.env.BASE_URL}/api/v1/user/verify-email/${unHashedToken}`,
  };

  await transporter.sendMail(mailtrapOptions);

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User is Registered successfully"));
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    return next(new ApiError(400, "Invalid or Missing Token"));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "Invalid or Expired Token"));
  }

  if (user.isEmailverified) {
    return next(new ApiError(400, "Email is already verified"));
  }

  user.isEmailverified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Email is verified successfully"));
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

export { getProfile, loginUser, logOutUser, registerUser, verifyEmail };
