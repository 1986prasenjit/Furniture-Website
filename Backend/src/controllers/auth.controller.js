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
    text: `Please use the following link to verify your email : ${process.env.BASE_URL}/api/v1/user/verify-email/${unHashedToken}. \n\n This link will expire in 20 minutes.`,
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

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, "Email is requird to proceed"));
  }

  const requestedUser = await User.findOne({ email });

  if (!requestedUser) {
    return next(
      new ApiError(404, "Sorry no user found with the requested Email-ID")
    );
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    requestedUser.generateTemporyToken();

  requestedUser.forgotPasswordToken = hashedToken;
  requestedUser.forgotPasswordExpiry = tokenExpiry;
  await requestedUser.save({ validateBeforeSave: false });

  try {
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
      to: requestedUser.email,
      subject: "Reset Password Request",
      text: `Please use the following link to reset your password : ${process.env.BASE_URL}/api/v1/user/reset-password/${unHashedToken}. \n\n This link will expire in 20 minutes. \n\n If you didn't requested to reset your password then please ignore this message`,
    };
    await transporter.sendMail(mailtrapOptions);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          `Email Sent Successfully to ${requestedUser.email} `
        )
      );
  } catch (error) {
    requestedUser.forgotPasswordToken = undefined;
    requestedUser.forgotPasswordExpiry = undefined;
    await requestedUser.save({ validateBeforeSave: false });

    return next(
      new ApiError(500, "Something went wrong while sending the email")
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return next(
      new ApiError(400, "Sorry, the Token is either Invalid or expired")
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ApiError(
        400,
        "Sorry, user not found, the Token is either Invalid or expired"
      )
    );
  }

  if (password !== confirmPassword) {
    return next(
      new ApiError(400, "Password and Confirm Password should be same")
    );
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password has been reset successfully"));
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const { userId } = req.params;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new ApiError(404, "Invalid User credentials, user not found"));
  }

  const isPasswordMatched = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordMatched) {
    return next(
      new ApiError(400, "Sorry, old password you have provided is incorrect")
    );
  }

  if (newPassword !== confirmPassword) {
    return next(new ApiError(400, "Sorry, password doesn't match"));
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Your Password has been changed successfully"));
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  const updatedValues = {
    name,
    email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, updatedValues, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile has been updated successfully"));
});

const updateAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new ApiError(400, "Invalid Refresh Token or Expired Token"));
  }

  const decodedToken = await jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(new ApiError(404, "Invalid User Credentials"));
  }

  const isRefreshTokenValid = await user.isRefreshTokenValid(refreshToken);
  if (!isRefreshTokenValid) {
    return next(new ApiError(401, "Invalid User Credentials"));
  }

  const { newAccessToken } = user.generateNewAccessToken();

  const { newRefreshToken } = user.generateNewRefreshToken();
  user.refreshToken = newRefreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          newAccessToken,
          newRefreshToken,
        },
        "Tokens Refreshed Successfully"
      )
    );
});
export {
  forgotPassword,
  getProfile,
  loginUser,
  logOutUser,
  registerUser,
  resetPassword,
  updateAccessToken,
  updatePassword,
  updateProfile,
  verifyEmail,
};
