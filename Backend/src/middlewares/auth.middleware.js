import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorised Token");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

const checkRole = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return next(new ApiError(401, "Invalid Access Token"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const requestedUser = await User.findById(decodedToken._id);

    if (!requestedUser) {
      return next(new ApiError(401, "Invalid Access Token"));
    }

    if (requestedUser.role !== "Admin") {
      return next(
        new ApiError(
          403,
          "Access denied only Admin has the permission to access this specific route"
        )
      );
    }

    next();
  } catch (error) {
    return next(
      new ApiError(401, error?.message || "Invalid User Credentials")
    );
  }
});

export { checkRole, verifyJWT };
