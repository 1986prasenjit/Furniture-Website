import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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
                new ApiError(500, "Error while creating the User", error)
            )
    }
    console.log(`Newly created User is: ${newUser}`);
    return res
    .status(201)
    .json(
        new ApiResponse(200, newUser, "User is Registered successfully"));

})

export { registerUser };