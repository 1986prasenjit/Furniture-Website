import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async(req, res)=> {
    const { name, email, password } = req.body;
    const data = req.body;
    console.log(req.body);
    return res
    .status(200)
    .json(new ApiResponse(200, data, "User registered Successfully"))
})

export { registerUser };